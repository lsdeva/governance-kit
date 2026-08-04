#!/usr/bin/env python3
"""Every in-page app mounts whether you arrive directly or by an internal link.

Material's `navigation.instant` swaps page content by XHR without re-running
page scripts. An app that initialises only at script parse time renders
nothing when a visitor arrives through a link — header and footer appear, the
app does not — until a full reload. That defect reached production on
/assess/ and no existing check saw it.

Two things make this bug class easy to ship and hard to catch, and both are
handled here:

  1. Instant navigation is INERT on 127.0.0.1. Material decides whether a
     link is same-origin by comparing against <link rel="canonical">, which
     MkDocs writes from `site_url`. Served from localhost every link looks
     cross-origin, so Material declines to intercept and every navigation is
     an ordinary page load — the exact condition under which the bug cannot
     reproduce. This serves the canonical origin from the built directory so
     instant navigation is genuinely active.

  2. Every mount ships a <noscript> fallback child, so `children.length` is 1
     whether or not the app rendered. Each mount therefore declares a
     selector that only its own output matches.

Run against a built site:

    python tools/smoke_instant_nav.py [--site site]

Exits non-zero on the first page that fails, so CI stops on a regression.
"""
from __future__ import annotations

import argparse
import mimetypes
import re
import sys
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent

# id/class of each mount, and a selector matched only by the app's real
# output. Discovered from the built HTML so a new app cannot be forgotten;
# this table supplies the "did it render" half, which only the app knows.
RENDERED = {
    "gk-assess": ".gk-roles, .gk-block, .gk-q, .gk-report",
    "gk-decide": ".gk-dec",
    # A first-time visitor gets an orientation paragraph, not tiles.
    "gk-dashboard": ".gk-stat, .gk-next, .gk-lede",
    "gk-journey": ".gk-journey",
    "gk-compare": ".gk-compare",
    "gk-checklist": ".gk-cl-count",
    # tasks.js enhances an existing filter bar rather than filling an empty
    # mount; the proof it ran is the chips it wires up.
    "gk-task-filter": "[data-req]",
    "gk-reg-host": ".gk-reg",
}


def canonical_origin(site: Path) -> str:
    """The origin Material will treat as same-site, from any built page."""
    for page in site.rglob("index.html"):
        m = re.search(r'<link rel="canonical" href="([^"]+)"', page.read_text(
            encoding="utf-8", errors="ignore"))
        if m:
            u = urlparse(m.group(1))
            return f"{u.scheme}://{u.netloc}"
    raise SystemExit(
        "ERROR: no <link rel=canonical> in the built site. Instant navigation "
        "cannot be exercised without knowing the origin Material considers "
        "same-site; check that site_url is set in mkdocs.yml.")


def find_mounts(site: Path) -> list[tuple[str, str, str]]:
    """Every page hosting a known mount: (url path, mount selector, rendered).

    Reads the built HTML rather than a hand-kept list, so an app added later
    is covered the day its mount point ships.
    """
    found: dict[str, tuple[str, str, str]] = {}
    for page in sorted(site.rglob("index.html")):
        html = page.read_text(encoding="utf-8", errors="ignore")
        rel = page.relative_to(site).parent.as_posix()
        url = "/" if rel == "." else f"/{rel}/"
        for key, rendered in RENDERED.items():
            if key in ("gk-reg-host",):
                hit = f'class="{key}"' in html or f"'{key}'" in html
                sel = f".{key}"
            else:
                hit = f'id="{key}"' in html
                sel = f"#{key}"
            if not hit:
                continue
            # One page per app is enough: the mounting code is shared, and 26
            # register pages would only repeat the same assertion.
            if key not in found:
                found[key] = (url, sel, f"{sel} {rendered.replace(',', f', {sel}')}")
    missing = sorted(set(RENDERED) - set(found))
    if missing:
        raise SystemExit(
            "ERROR: no built page hosts these mounts: " + ", ".join(missing) +
            ". Either the app was removed (drop it from RENDERED) or its "
            "mount point changed (update RENDERED) — this check is only "
            "meaningful while the table matches reality.")
    return [found[k] for k in RENDERED if k in found]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--site", default=str(ROOT / "site"))
    args = ap.parse_args()

    site = Path(args.site).resolve()
    if not (site / "index.html").exists():
        raise SystemExit(f"ERROR: no built site at {site}. Run mkdocs build.")

    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        raise SystemExit(
            "ERROR: playwright is not installed. This check drives a real "
            "browser because the defect it guards against only exists in one:\n"
            "  pip install playwright && python -m playwright install chromium")

    origin = canonical_origin(site)
    mounts = find_mounts(site)
    fails: list[str] = []

    def check(name: str, ok: bool, detail: str = "") -> None:
        print(("PASS  " if ok else "FAIL  ") + name +
              (f"   [{detail}]" if detail and not ok else ""))
        if not ok:
            fails.append(name)

    def serve(route) -> None:
        """Fulfil a canonical-origin request from the built directory."""
        path = urlparse(route.request.url).path.lstrip("/")
        if path.endswith("/") or not path:
            path += "index.html"
        target = (site / path).resolve()
        if not str(target).startswith(str(site)):
            route.fulfill(status=403, body="forbidden")
            return
        if target.is_dir():
            target = target / "index.html"
        if not target.is_file():
            route.fulfill(status=404, body="not found")
            return
        route.fulfill(
            status=200, body=target.read_bytes(),
            headers={"content-type":
                     mimetypes.guess_type(str(target))[0] or "text/plain"})

    ARM = """() => {
      window.__gkEmits = 0;
      if (window.document$ && window.document$.subscribe) {
        window.document$.subscribe(function () { window.__gkEmits++; });
      }
    }"""

    def click_to(pg, path: str) -> None:
        """Click a real link to `path` so Material intercepts it.

        Where a page offers no visible route, a same-origin anchor is injected
        and clicked: Material treats it identically, and a missing link is a
        navigation gap rather than a mounting one.
        """
        for sel in (f'a[href$="{path}"]:visible', f'a[href*="{path}"]:visible'):
            loc = pg.locator(sel)
            if loc.count():
                loc.first.click()
                return
        pg.evaluate("""p => {
          var a = document.createElement('a');
          a.href = p; a.id = '__gk_probe'; a.textContent = 'probe';
          (document.querySelector('.md-content') || document.body).appendChild(a);
        }""", path)
        pg.locator("#__gk_probe").click()

    print(f"Instant-navigation check — {len(mounts)} apps, origin {origin}\n")

    with sync_playwright() as pw:
        browser = pw.chromium.launch()
        ctx = browser.new_context(viewport={"width": 1400, "height": 1000})
        ctx.route(origin + "/**", serve)
        pg = ctx.new_page()

        errs: list[str] = []
        pg.on("console", lambda m: errs.append(m.text[:160])
              if m.type == "error" else None)
        pg.on("pageerror", lambda e: errs.append("pageerror: " + str(e)[:160]))

        # The whole suite is meaningless if Material is not intercepting.
        pg.goto(origin + "/", wait_until="networkidle")
        pg.wait_for_timeout(600)
        pg.evaluate(ARM)
        click_to(pg, mounts[0][0])
        pg.wait_for_timeout(1500)
        check("instant navigation is active",
              pg.evaluate("() => typeof window.__gkEmits === 'number'"),
              "Material fell back to full page loads; this check would pass "
              "vacuously")
        if fails:
            browser.close()
            return 1

        for path, mount, rendered in mounts:
            # --- direct load ------------------------------------------------
            before = len(errs)
            pg.goto(origin + path, wait_until="networkidle")
            pg.wait_for_timeout(1600)
            check(f"{path} renders on direct load",
                  pg.locator(rendered).count() > 0, rendered)
            check(f"{path} direct load has no console errors",
                  len(errs) == before, errs[before:][:2])

            # --- arriving through an internal link --------------------------
            before = len(errs)
            pg.goto(origin + "/", wait_until="networkidle")
            pg.wait_for_timeout(500)
            pg.evaluate(ARM)
            click_to(pg, path)
            pg.wait_for_timeout(1800)
            check(f"{path} arrived without a full reload",
                  pg.evaluate("() => typeof window.__gkEmits === 'number'"))
            check(f"{path} renders when arrived at by link",
                  pg.locator(rendered).count() > 0,
                  "mount left empty — the app initialises at parse time and "
                  "never re-mounts; subscribe to window.document$")
            check(f"{path} link arrival has no console errors",
                  len(errs) == before, errs[before:][:2])

            # --- leaving and returning --------------------------------------
            # Repeat navigation must not double-bind or strand stale state.
            before = len(errs)
            pg.go_back()
            pg.wait_for_timeout(900)
            pg.go_forward()
            pg.wait_for_timeout(1600)
            check(f"{path} still renders after back/forward",
                  pg.locator(rendered).count() > 0)
            check(f"{path} back/forward has no console errors",
                  len(errs) == before, errs[before:][:2])

        browser.close()

    print()
    if fails:
        print(f"INSTANT-NAV CHECK FAILED — {len(fails)} problem(s)")
        for f in fails:
            print(f"  {f}")
        return 1
    print(f"INSTANT-NAV CHECK PASSED — {len(mounts)} apps, both entry paths")
    return 0


if __name__ == "__main__":
    sys.exit(main())
