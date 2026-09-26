"""Consistency checks for web/data.

The source-pack JSON (artefacts, roles, phases, gates, metrics, platform,
references) is the single source of truth. forms.json and guidance.json are
authored on top of it, and the app joins them by id, so a typo in either
silently breaks a form or a gate. This script fails loudly instead.

Run: python tools/check_data.py
"""
import json
import pathlib
import sys

DATA = pathlib.Path(__file__).resolve().parent.parent / "web" / "data"
errors = []


def load(name):
    with open(DATA / f"{name}.json", encoding="utf-8") as fh:
        return json.load(fh)


def err(msg):
    errors.append(msg)


arts = load("artefacts")
roles = {r["id"] for r in load("roles")}
phases = load("sdlc-phases")
gates = {g["id"]: g for g in load("gates")}
metrics = load("metrics")
forms = load("forms")["artefacts"]
guide = load("guidance")
art_ids = {a["id"] for a in arts}

TIER_VALUES = {"required", "light", "recommended", "not_required", "if_vendor"}
FIELD_TYPES = {"text", "textarea", "number", "percent", "date", "select", "multiselect", "yesno", "role", "code", "table", "list"}
COL_TYPES = {"text", "number", "percent", "date", "select", "yesno"}

# Source pack integrity.
for a in arts:
    r = a["raci"]
    for rid in r["responsible"] + r["consulted"] + r["informed"] + [r["accountable"]]:
        if rid not in roles:
            err(f"artefact {a['id']}: unknown role {rid}")
    for t in ("T1", "T2", "T3", "T4"):
        if a["tiers"].get(t) not in TIER_VALUES:
            err(f"artefact {a['id']}: bad tier value {t}={a['tiers'].get(t)}")
for p in phases:
    for it in p["artefacts"]:
        if it["id"] not in art_ids:
            err(f"phase {p['id']}: unknown artefact {it['id']}")
    if p["gate"] and p["gate"]["id"] not in gates:
        err(f"phase {p['id']}: unknown gate {p['gate']['id']}")
for m in metrics:
    if m["owner"] not in roles:
        err(f"metric {m['name']}: unknown owner {m['owner']}")

# Forms: every artefact has one, every source field is covered, types are known.
for a in arts:
    f = forms.get(a["id"])
    if not f:
        err(f"forms: artefact {a['id']} has no form")
        continue
    covered, ids = set(), set()
    for sec in f["sections"]:
        for fl in sec["fields"]:
            if fl["id"] in ids:
                err(f"forms {a['id']}: duplicate field id {fl['id']}")
            ids.add(fl["id"])
            if fl["type"] not in FIELD_TYPES:
                err(f"forms {a['id']}.{fl['id']}: unknown type {fl['type']}")
            if fl.get("core") and not fl.get("required"):
                err(f"forms {a['id']}.{fl['id']}: core field must be required")
            if fl["type"] in ("select", "multiselect") and not fl.get("options"):
                err(f"forms {a['id']}.{fl['id']}: select without options")
            if fl.get("source_field"):
                covered.add(fl["source_field"])
            for c in fl.get("columns", []):
                if c["type"] not in COL_TYPES:
                    err(f"forms {a['id']}.{fl['id']}.{c['id']}: unknown column type {c['type']}")
                if c.get("source_field"):
                    covered.add(c["source_field"])
            if fl["type"] == "table" and not fl.get("columns"):
                err(f"forms {a['id']}.{fl['id']}: table without columns")
    for sf in a["fields"]:
        if sf not in covered:
            err(f"forms {a['id']}: source field not covered: {sf!r}")

# Field ids the app reads for cross-form logic.
FIXED = {
    "00": ["agent_id", "name", "tier", "status", "uses_vendor", "confidence_routing", "consequence_class", "reversibility"],
    "01": ["sampling_cost_per_year"],
    "02": ["tier", "tolerance_pct", "sampling_rate_pct", "must_escalate"],
    "03": ["hazards"], "09": ["rounds"], "10": ["bands", "date_voided"],
    "12": ["max_time_to_halt_min", "drills"], "13": ["escalation_tests"], "16": ["claims"],
}
for aid, need in FIXED.items():
    have = {fl["id"] for sec in forms[aid]["sections"] for fl in sec["fields"]}
    for n in need:
        if n not in have:
            err(f"forms {aid}: app needs field id {n}")

# Guidance: every role and gate, valid references.
for rid in roles:
    if rid not in guide["roles"]:
        err(f"guidance: no playbook for role {rid}")
AUTO = {"sampling_cost_present", "tolerance_written", "hazards_have_controls", "interaction_hazard", "drill_within_limit",
        "first_golive_tier", "promotion_rounds", "escalation_tests_pass", "vendor_evidence_complete"}
for gid in gates:
    g = guide["gates"].get(gid)
    if not g:
        err(f"guidance: no gate entry for {gid}")
        continue
    for x in g["artefacts"]:
        if x["id"] not in art_ids:
            err(f"guidance {gid}: unknown artefact {x['id']}")
        if x["state"] not in ("submitted", "approved"):
            err(f"guidance {gid}: bad state {x['state']}")
    for c in g["checks"]:
        if c["who"] not in roles:
            err(f"guidance {gid}.{c['id']}: unknown role {c['who']}")
        if c.get("auto") and c["auto"] not in AUTO:
            err(f"guidance {gid}.{c['id']}: unknown auto key {c['auto']}")

if errors:
    print(f"{len(errors)} problem(s) in web/data:")
    for e in errors:
        print("  -", e)
    sys.exit(1)
print(f"web/data OK: {len(arts)} artefacts, {len(roles)} roles, {len(gates)} gates, {sum(len(s['fields']) for f in forms.values() for s in f['sections'])} form fields.")
