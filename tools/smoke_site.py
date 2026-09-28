"""Drive the built site in a real browser and fail on any script error.

The site is a client-rendered app, so a static check can't see a broken view:
a typo in one module leaves that route blank. This serves web/, loads the
worked example, visits every route (all 17 forms and 7 gates included) as
several roles, and plays one form through draft → submit → approve.

Run: python tools/smoke_site.py   (needs: pip install playwright; playwright install chromium)
"""
import functools
import os
import time
import http.server
import pathlib
import sys
import threading

from playwright.sync_api import sync_playwright

WEB = pathlib.Path(__file__).resolve().parent.parent / "web"
class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


handler = functools.partial(QuietHandler, directory=str(WEB))
server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
threading.Thread(target=server.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{server.server_address[1]}/"

problems = []


def set_role(pg, role):
    pg.evaluate(
        "r => { const s = JSON.parse(localStorage.getItem('govkit.om.v1')); s.role = r; s.person = 'CI';"
        " localStorage.setItem('govkit.om.v1', JSON.stringify(s)); }", role)
    pg.reload()
    wait_booted(pg)


def wait_text(pg, selector, text):
    # Dialog results and saves resolve asynchronously; poll instead of reading once.
    try:
        pg.wait_for_function("([s, t]) => document.querySelector(s)?.innerText.includes(t)", arg=[selector, text], timeout=10000)
        return True
    except Exception:
        return False


def wait_booted(pg):
    # The app fetches its data before the first render; wait for it rather
    # than racing it (CI runners are slower than a laptop).
    pg.wait_for_function("document.querySelector('#top .wordmark') !== null", timeout=30000)


with sync_playwright() as p:
    browser = p.chromium.launch()
    pg = browser.new_page()
    pg.on("pageerror", lambda e: problems.append(f"script error: {e}"))
    pg.on("console", lambda m: problems.append(f"console error: {m.text}") if m.type == "error" else None)
    pg.on("requestfailed", lambda r: problems.append(f"request failed: {r.url}"))
    pg.on("request", lambda r: problems.append(f"external request: {r.url}") if not r.url.startswith(BASE) and not r.url.startswith("data:") and not r.url.startswith("blob:") else None)

    if os.environ.get("SMOKE_SLOW"):
        # Simulate a slow runner: delay every data fetch.
        pg.route("**/data/*.json", lambda route: (time.sleep(0.4), route.continue_()))
    pg.goto(BASE)
    wait_booted(pg)
    pg.wait_for_selector(".hero-c .hs.active")
    pg.click("[data-demo]")
    pg.wait_for_function("location.hash.startsWith('#/agents/')")
    aid = pg.evaluate("location.hash").split("/")[2]

    routes = ["", "guide", "roles", "work", "agents/new", f"agents/{aid}", f"agents/{aid}/report", "tools", "model",
              "artefacts", "help", "about"]
    routes += ["services", "tower"] + [f"services/{x}" for x in ["intake", "design", "build", "golive", "monthly", "promotion", "change", "audit", "retire"]]
    routes += [f"roles/{r}" for r in ["AE", "SP", "AOW", "PO", "ENG", "SEC", "DO", "RC", "PLE", "IRV", "OPS", "IA"]]
    routes += [f"tools/{t}" for t in ["tier", "change", "sampling", "promotion", "calibration", "maturity"]]
    routes += [f"model/{s}" for s in ["gates", "tiers", "raci", "metrics", "platform", "roadmap", "references"]]
    routes += [f"artefacts/{i:02d}" for i in range(17)]
    routes += [f"agents/{aid}/a/{i:02d}" for i in range(17)]
    routes += [f"agents/{aid}/g/G{i}" for i in range(7)]

    for role in ["AOW", "AE", "RC", "IRV"]:
        set_role(pg, role)
        for r in routes:
            pg.goto(BASE + "#/" + r)
            text = pg.inner_text("#app")
            if "Loading the operating model" in text or "doesn't exist" in text or len(text) < 60:
                problems.append(f"route renders nothing: #/{r} as {role}")

    # The hero advances on its own, and the toolchain slide's tabs switch mappings.
    pg.goto(BASE + "#/")
    pg.wait_for_selector(".hero-c .hs.active")
    first = pg.locator(".hero-c .hs.active").get_attribute("aria-label")
    pg.wait_for_timeout(10500)
    if pg.locator(".hero-c .hs.active").get_attribute("aria-label") == first:
        problems.append("hero did not auto-advance within 10s")
    pg.click('[data-go="6"]')
    pg.wait_for_selector(".hero-c .int-slide.active")
    pg.click('[data-int="3"]')
    if "Select the control profile" not in (pg.locator(".hero-c .int-slide.active").get_attribute("aria-label") or ""):
        problems.append("toolchain tab did not switch mapping")

    # Command palette opens, filters and navigates.
    pg.goto(BASE + "#/")
    pg.keyboard.press("Control+k")
    pg.fill(".cmdk-in input", "G3")
    pg.keyboard.press("Enter")
    if "g/G3" not in pg.evaluate("location.hash") and "gates" not in pg.evaluate("location.hash"):
        problems.append("command palette did not navigate to G3")
    # Meeting mode opens and steps through a gate.
    pg.goto(BASE + f"#/agents/{aid}/g/G4")
    pg.click("#meet")
    pg.keyboard.press("ArrowRight")
    if not pg.locator(".present .slide").count():
        problems.append("meeting mode did not open")
    pg.keyboard.press("Escape")

    # A read-only form must say why and offer a one-click way to edit it.
    pg.evaluate("() => { const s = JSON.parse(localStorage.getItem('govkit.om.v1')); s.role = null; localStorage.setItem('govkit.om.v1', JSON.stringify(s)); }")
    pg.reload()
    wait_booted(pg)
    pg.goto(BASE + f"#/agents/{aid}/a/10")
    if not pg.locator(".lockbar [data-act-as]").count():
        problems.append("read-only form shows no way to start editing")
    else:
        pg.locator(".lockbar [data-act-as]").first.click()
        if not wait_text(pg, "#saved", "Saved") or pg.locator("#art-form [disabled]").count():
            problems.append("'Act as' on a read-only form did not enable editing")

    # One form through its lifecycle: the IRV-owned 10 is a draft in the example.
    set_role(pg, "IRV")
    pg.goto(BASE + f"#/agents/{aid}/a/10")
    pg.fill("#in-routing_threshold", "0.95")
    for fid in ["band_definitions", "threshold_justification"]:
        if not pg.input_value(f"#in-{fid}"):
            pg.fill(f"#in-{fid}", "CI")
    if pg.locator("#f-band_verdicts .trow").count() == 0:
        pg.click("[data-add-row=band_verdicts]")
        pg.locator("#f-band_verdicts .trow input.input").first.fill("0.95–1.00")
    pg.click("#submit")
    if not wait_text(pg, "#st-pill", "In review"):
        problems.append("form 10 did not move to In review on submit")
    set_role(pg, "RC")
    pg.goto(BASE + f"#/agents/{aid}/a/10")
    pg.click("#approve")
    for c in pg.locator("dialog input[type=checkbox]").all():
        c.check()
    pg.click("dialog button[value=ok]")
    if not wait_text(pg, "#st-pill", "Approved"):
        problems.append("form 10 was not approved")
    browser.close()

server.shutdown()
if problems:
    print("\n".join(sorted(set(problems))))
    sys.exit(1)
print(f"Smoke test passed: {len(routes)} routes x 4 roles, form lifecycle OK.")
