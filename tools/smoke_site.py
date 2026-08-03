#!/usr/bin/env python3
"""Smoke-test the BUILT site in site/.

The generator validates its own inputs; this checks the artefact that actually
ships. It exists because a defect reached production that every source-level
check passed: /decide/ rendered its YAML front matter as visible text, because
MkDocs silently declines to parse a block that does not start at byte 0.

Checks:
  1. No page leaks YAML front matter into the rendered body.
  2. Every page carries the same site name — no mixed old/new branding.
  3. Every page carries the same top-level navigation.
  4. No internal link 404s.
  5. No external asset references (the privacy guarantee).

Usage:
    python tools/smoke_site.py            # after mkdocs build
"""

from __future__ import annotations

import re
import sys
from collections import Counter
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "site"

# Keys the generator actually emits in front matter. A page rendering any of
# these as body text means the block was not parsed.
FRONT_MATTER_KEYS = ("title:", "hide:", "template:", "description:")

failures: list[str] = []


def fail(msg: str) -> None:
    failures.append(msg)
    print("FAIL  " + msg)


def ok(msg: str) -> None:
    print("PASS  " + msg)


def body_of(html: str) -> str:
    """The rendered article only — front matter leaks show up here."""
    m = re.search(r'<article[^>]*class="[^"]*md-content__inner.*?</article>',
                  html, re.S)
    return m.group(0) if m else html


def main() -> int:
    if not SITE.exists():
        print("ERROR: site/ not found. Run `mkdocs build --strict` first.")
        return 1

    pages = sorted(SITE.rglob("*.html"))
    if not pages:
        print("ERROR: site/ contains no HTML.")
        return 1

    # ---- 1. front matter must never reach the rendered body ---------------
    leaked = []
    for f in pages:
        html = f.read_text(encoding="utf-8", errors="replace")
        body = body_of(html)
        # Strip tags so we test visible text, not attributes that legitimately
        # contain the word "title:".
        text = re.sub(r"<[^>]+>", " ", body)
        for key in FRONT_MATTER_KEYS:
            # A leak looks like a line starting with the key at the very top of
            # the visible text — e.g. "title: Decide hide: - toc".
            if re.search(r"(?:^|\s)" + re.escape(key) + r"\s*\S", text[:400]):
                leaked.append((f.relative_to(SITE).as_posix(), key))
                break
    if leaked:
        for p, k in leaked[:8]:
            fail(f"front matter leaked into the page body: /{p} ({k})")
    else:
        ok(f"no front matter leaked into any of {len(pages)} pages")

    # ---- 2. one site name across every page -------------------------------
    names = Counter()
    for f in pages:
        html = f.read_text(encoding="utf-8", errors="replace")
        m = re.search(r"<title>(.*?)</title>", html, re.S)
        if not m:
            continue
        title = re.sub(r"\s+", " ", m.group(1)).strip()
        # Titles are "Page - SiteName"; take the trailing site name.
        names[title.rsplit(" - ", 1)[-1]] += 1
    if len(names) > 1:
        fail(f"pages disagree on the site name: {dict(names)}")
    else:
        ok(f"one site name across all pages: {list(names) or ['(none)']}")

    # ---- 3. one navigation across every page ------------------------------
    navs = Counter()
    for f in pages:
        html = f.read_text(encoding="utf-8", errors="replace")
        m = re.search(r'<nav class="md-tabs".*?</nav>', html, re.S)
        if not m:
            continue
        items = tuple(
            re.sub(r"\s+", " ", x).strip()
            for x in re.findall(r'class="md-tabs__link"[^>]*>(.*?)</a>',
                                m.group(0), re.S)
        )
        navs[items] += 1
    if len(navs) > 1:
        fail(f"pages disagree on the navigation: {len(navs)} variants")
        for n, c in navs.items():
            print("        %d pages: %s" % (c, list(n)))
    else:
        ok("one navigation across all pages: "
           + str(list(list(navs)[0]) if navs else []))

    # ---- 4. internal links resolve ----------------------------------------
    pat = re.compile(r'(?:href|src|data-src)="([^"]+)"')
    broken, checked = [], 0
    for f in pages:
        rel = f.relative_to(SITE).as_posix()
        if rel == "404.html":
            continue
        for m in pat.finditer(f.read_text(encoding="utf-8", errors="replace")):
            u = m.group(1)
            if u.startswith(("http://", "https://", "mailto:", "data:", "#",
                             "javascript:")):
                continue
            checked += 1
            target = SITE / unquote(urlparse(urljoin("/" + rel, u)).path).lstrip("/")
            if target.is_dir():
                target = target / "index.html"
            if not target.exists():
                broken.append((rel, u))
    if broken:
        for p, u in broken[:8]:
            fail(f"broken link on /{p} -> {u}")
    else:
        ok(f"all {checked} internal references resolve")

    # ---- 5. no external assets (the privacy guarantee) --------------------
    ext = set()
    for f in pages:
        html = f.read_text(encoding="utf-8", errors="replace")
        # Match the whole tag rather than looking backwards from the URL: a
        # nearby <img> upstream would otherwise misattribute an ordinary <a>.
        # Only FETCHED assets break the privacy guarantee — a link the user
        # clicks, a canonical URL and an og:url never hit the network.
        for m in re.finditer(r"<(script|img|iframe|link)\b[^>]*>", html, re.I):
            tag = m.group(0)
            name = m.group(1).lower()
            if name == "link" and not re.search(
                    r'rel="[^"]*\b(?:stylesheet|icon|preload|prefetch)\b', tag, re.I):
                continue          # metadata, not a request
            for a in re.finditer(r'(?:src|href)="(https?://[^"]+)"', tag):
                ext.add(a.group(1))
    if ext:
        for u in sorted(ext)[:6]:
            fail(f"external asset would be fetched at runtime: {u}")
    else:
        ok("no external assets referenced — privacy guarantee intact")

    print()
    if failures:
        print(f"SMOKE TEST FAILED — {len(failures)} problem(s)")
        return 1
    print(f"SMOKE TEST PASSED — {len(pages)} pages")
    return 0


if __name__ == "__main__":
    sys.exit(main())
