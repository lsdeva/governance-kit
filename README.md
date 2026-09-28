<div align="center">

# GovKit

**A role-based decision environment for governing AI agents across the SDLC you already run.**

The Agentic SDLC Operating Model as a working tool: 17 artefacts as guided forms,
7 signed gates, 12 role playbooks, and the statistics behind the one outcome number.<br>
No accounts, no server, and nothing leaves your browser.

[**Open GovKit →**](https://govkit.soa.team/) &nbsp;·&nbsp;
[How it works](https://govkit.soa.team/#/guide) &nbsp;·&nbsp;
[SDLC map](https://govkit.soa.team/#/model)

[![Deploy site](https://github.com/lsdeva/governance-kit/actions/workflows/deploy.yml/badge.svg)](https://github.com/lsdeva/governance-kit/actions/workflows/deploy.yml)
[![All rights reserved](https://img.shields.io/badge/%C2%A9%202026-all%20rights%20reserved-black.svg)](LICENSE)

</div>

---

## What it is for

The model applies to any AI agent that **decides, acts, and closes a case nobody
revisits**: triage, eligibility, case closure, exception approval, payment
release. It adds 17 artefacts and 7 gates to ceremonies teams already hold
(business case, architecture review, backlog refinement, CI, UAT, change
advisory, ops review), without adding phases.

## How people use it

1. **Act as your role.** The accountable executive, the agent owner, risk and
   compliance, engineering, internal audit and seven other roles each get a
   playbook and a queue.
2. **Register the agent and its autonomy tier (T1–T4).** The tier decides which
   artefacts are mandatory, light or not required. The tier tool helps choose
   it. First go-live is at T2 or below.
3. **Draft, consult, approve.** Each artefact is a form with field-level
   guidance. The R role drafts it, C roles record a view, and the A role
   approves it against the artefact's *done-when* test or returns it with a reason.
4. **Pass the gates.** Gates G0–G6 list the artefacts that must exist and the
   checks named roles confirm. GovKit suggests answers it can compute. A gate
   with anything missing cannot be signed as a pass.
5. **Operate on evidence.** Sampling rounds in 09 get Wilson intervals, the
   worst stratum and a verdict against tolerance. Promotion (G4) and material
   change (G5) are decided from that evidence.

The decision tools (tier, material change, sampling, promotion readiness,
calibration, maturity) write their results into the agent's decision log. An
evidence pack for each agent exports as print/PDF, Markdown or JSON.

**Privacy.** Everything is stored in the browser's `localStorage`. The site
makes no external requests, and its fonts are self-hosted. Sign-offs record a
role and a typed name, not an authenticated identity, so file exported evidence
packs in your own system of record.

## Repository layout

| Path | What it is |
|---|---|
| `web/` | The deployable static site. Open it with any static server. |
| `web/data/*.json` | Source pack: artefacts, roles, SDLC phases, gates, metrics, platform components, references. These are the single source of truth. |
| `web/data/forms.json` | The form for each artefact: sections, fields, types, guidance, and which source field each implements. |
| `web/data/guidance.json` | Role playbooks, gate checklists, principles, glossary and FAQ. |
| `web/assets/js/` | The app: `logic.js` holds the model's rules; `views/` holds one module per page. |
| `tools/check_data.py` | Validates the joins between the JSON files. |
| `tools/smoke_site.py` | Visits every route in Chromium as several roles and fails on any error. |

## Run it locally

```sh
cd web
python -m http.server 8000
# open http://localhost:8000
```

There is no build step. To check changes before pushing:

```sh
python tools/check_data.py
pip install playwright && python -m playwright install chromium
python tools/smoke_site.py
```

## Status of the content

Operating model draft 0.2, references checked 23 Sep 2026. References marked
*per source ref* come from the Agentic Assurance Reference draft 0.1 and haven't
been re-verified, so check them before external use. The sanctions-triage
worked example and the calibration numbers are illustrative. This is guidance,
not legal advice.

## Rights

© 2026 Lali Devamanthri. All rights reserved. This is proprietary work; no
licence is granted to copy, adapt or redistribute it. See [LICENSE](LICENSE).
