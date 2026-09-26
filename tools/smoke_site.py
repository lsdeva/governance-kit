"""Drive the built site in a real browser and fail on any script error.

The site is a client-rendered app, so a static check can't see a broken view:
a typo in one module leaves that route blank. This serves web/, loads the
worked example, visits every route (all 17 forms and 7 gates included) as
several roles, and plays one form through draft → submit → approve.

Run: python tools/smoke_site.py   (needs: pip install playwright; playwright install chromium)
"""
import functools
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


with sync_playwright() as p:
    browser = p.chromium.launch()
    pg = browser.new_page()
    pg.on("pageerror", lambda e: problems.append(f"script error: {e}"))
    pg.on("console", lambda m: problems.append(f"console error: {m.text}") if m.type == "error" else None)
    pg.on("requestfailed", lambda r: problems.append(f"request failed: {r.url}"))
    pg.on("request", lambda r: problems.append(f"external request: {r.url}") if not r.url.startswith(BASE) and not r.url.startswith("data:") and not r.url.startswith("blob:") else None)

    pg.goto(BASE)
    pg.wait_for_selector(".hero")
    pg.click("[data-demo]")
    pg.wait_for_function("location.hash.startsWith('#/agents/')")
    aid = pg.evaluate("location.hash").split("/")[2]

    routes = ["", "guide", "roles", "work", "agents/new", f"agents/{aid}", f"agents/{aid}/report", "tools", "model",
              "artefacts", "help", "about"]
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
    if "In review" not in pg.inner_text("#st-pill"):
        problems.append("form 10 did not move to In review on submit")
    set_role(pg, "RC")
    pg.goto(BASE + f"#/agents/{aid}/a/10")
    pg.click("#approve")
    for c in pg.locator("dialog input[type=checkbox]").all():
        c.check()
    pg.click("dialog button[value=ok]")
    if "Approved" not in pg.inner_text("#st-pill"):
        problems.append("form 10 was not approved")
    browser.close()

server.shutdown()
if problems:
    print("\n".join(sorted(set(problems))))
    sys.exit(1)
print(f"Smoke test passed: {len(routes)} routes x 4 roles, form lifecycle OK.")
