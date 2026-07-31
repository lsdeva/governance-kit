# Project plan — Open Data & AI Governance Kit

A free, GitHub-hosted static website that gives away board-ready data & AI
governance templates end to end — the open-resource answer to paid "governance
launchpad" offerings. This plan explains the approach; a working scaffold ships
alongside it so you can push to GitHub and publish today.

---

## 1. Goal and positioning

**Goal:** a genuinely open commons for data & AI governance. No accounts, no
paywall, no email capture — the deliberate opposite of a gated £99 product. The
value you get back is reputation, contributions from other practitioners, and a
living portfolio of your governance thinking.

**Positioning vs. the paid offering that inspired this:** same scaffolding
(frameworks, policies, RACI, committee, registers, board pack, EU AI Act
readiness), but open-licensed and community-extendable. Where a paid pack sells
convenience, an open kit wins on trust, reach, and durability.

**Non-negotiables baked into the design:**

- Free to host (GitHub Pages) and free to consume.
- Open licence so people can adapt it internally without asking.
- A clear "not legal advice" stance on every relevant page.
- Structured so contributions stay consistent.

---

## 2. Technology recommendation

**Recommendation: MkDocs + Material for MkDocs, deployed to GitHub Pages via
GitHub Actions.** This is what the scaffold uses.

**Why this over the alternatives:**

| Option | Verdict | Reasoning |
|---|---|---|
| **MkDocs Material** ✅ | **Chosen** | Content is the product here, and it's all prose/tables. Material gives you search, dark mode, clean nav, and "edit this page" links out of the box. Everything is Markdown, so a governance practitioner (not just a developer) can maintain it. Zero front-end code to own. |
| Astro / modern static | Good, not ideal | More design control and great for a marketing landing — but you'd be hand-building the doc/library patterns Material already gives you free. Overkill for a template library. |
| Plain HTML/CSS | Rejected | Fastest to start, but every new template means hand-writing nav, search, and layout. Doesn't scale to 25+ pages or to contributors. |
| Docusaurus | Viable | Excellent, but React/Node-based — heavier toolchain and more to maintain than a Markdown-first team needs. |

**Cost:** £0. Public GitHub repos get GitHub Pages and Actions minutes free.
Only optional cost is a custom domain (~£10/yr) if you ever want one.

---

## 3. Information architecture

Six top-level sections, mirroring the lifecycle of standing up governance, plus
a dedicated EU AI Act section as the timely hook:

```
Home  ·  Get started
├── Frameworks           the backbone documents
├── Policies & Standards the rules
├── Operating Model      who does what, who decides
├── Registers            the living records
├── Risk & Control       assessing and evidencing
├── Board & Reporting    making it visible to leadership
└── EU AI Act            readiness checklist + timeline
Contributing  ·  About
```

Every template page uses one shared structure — **Purpose → When to use it →
How to use it → The template → Adaptation notes** — so the kit reads as one
system and contributors know exactly where content goes.

---

## 4. Content inventory — 25 templates

| # | Template | Section | Scaffold status |
|---|---|---|---|
| 1 | Data Governance Framework | Frameworks | Draft |
| 2 | AI Governance Framework | Frameworks | **Ready (worked example)** |
| 3 | Governance Charter | Frameworks | Stub |
| 4 | Maturity Assessment | Frameworks | Draft |
| 5 | Data Governance Policy | Policies | Draft |
| 6 | Data Quality Standard | Policies | Stub |
| 7 | Data Classification & Handling Policy | Policies | Draft |
| 8 | Acceptable AI Use Policy | Policies | Draft |
| 9 | AI Development & Deployment Standard | Policies | Stub |
| 10 | Third-Party AI Risk Policy | Policies | Draft |
| 11 | RACI Matrix | Operating Model | **Ready (worked example)** |
| 12 | Committee Charter (Terms of Reference) | Operating Model | Draft |
| 13 | Roles & Responsibilities | Operating Model | Draft |
| 14 | Decision Rights & Escalation | Operating Model | Stub |
| 15 | Data Asset Register | Registers | Draft |
| 16 | AI System Inventory | Registers | Ready |
| 17 | Risk Register | Registers | Draft |
| 18 | Issue & Incident Log | Registers | Stub |
| 19 | Processing & DPIA Log | Registers | Stub |
| 20 | AI Risk Assessment | Risk & Control | Draft |
| 21 | Model Card / Model Risk Documentation | Risk & Control | Draft |
| 22 | Control Library & Assurance Map | Risk & Control | Stub |
| 23 | Board Pack Template | Board & Reporting | Draft |
| 24 | KPI / KRI Dashboard | Board & Reporting | Stub |
| 25 | EU AI Act Readiness Checklist (25-point) | EU AI Act | **Ready** |

Plus a **EU AI Act timeline** page (Ready) reflecting the 2026 Digital Omnibus.

**Status legend:** *Ready* = fully drafted; *Draft* = usable structure, needs
your review; *Stub* = outline with the right shape, ready to flesh out. Three
flagship pages are fully worked so contributors have a model to copy.

---

## 5. What's in the scaffold (shipped with this plan)

```
governance-kit/
├── mkdocs.yml                 # site config + full navigation
├── requirements.txt           # mkdocs-material
├── README.md                  # local preview + publish instructions
├── LICENSE                    # CC BY 4.0 (content) + MIT (code)
├── PLAN.md                    # this document
├── .github/workflows/deploy.yml   # build + deploy to Pages on push to main
└── docs/
    ├── index.md               # landing page with card grid
    ├── getting-started.md     # three starting paths + status legend
    ├── stylesheets/extra.css  # hero, cards, status pills
    ├── frameworks/            # 4 pages + overview
    ├── policies/              # 6 pages + overview
    ├── operating-model/       # 4 pages + overview
    ├── registers/             # 5 pages + overview
    ├── risk/                  # 3 pages + overview
    ├── board/                 # 2 pages + overview
    ├── eu-ai-act/             # checklist + timeline + overview
    ├── contributing.md
    └── about.md
```

Verified with `mkdocs build --strict` — it compiles clean with no broken
internal links.

---

## 6. Publishing to GitHub Pages (free)

1. Create a **public** repo (e.g. `governance-kit`) and push this folder to `main`.
2. Find-and-replace `YOUR-USERNAME` in `mkdocs.yml` (and the README/LICENSE links)
   with your GitHub username.
3. In **Settings → Pages**, set **Source = GitHub Actions**.
4. Push. The included workflow builds and deploys automatically. Your site goes
   live at `https://YOUR-USERNAME.github.io/governance-kit/`.
5. (Optional) add a custom domain in Settings → Pages.

Local preview any time: `pip install -r requirements.txt && mkdocs serve`.

---

## 7. Licensing

Dual licence, which is the standard pattern for open content-plus-code projects:

- **Content (all templates and docs): CC BY 4.0** — anyone can use, adapt, and
  share, including commercially, with attribution. This is what makes it a true
  open resource people can drop into their own org.
- **Code (config, workflow, CSS): MIT** — permissive and frictionless.

Both are in the `LICENSE` file, with a suggested attribution line.

---

## 8. Suggested roadmap

**Phase 1 — Publish (this week).** Push the scaffold, replace `YOUR-USERNAME`,
turn on Pages. You immediately have a live site with three fully-worked
templates, the EU AI Act checklist, and the timeline.

**Phase 2 — Fill the flagships (weeks 2–4).** Promote the highest-value Drafts to
Ready: Data Governance Framework, Acceptable AI Use Policy, AI Risk Assessment,
Board Pack. These are what most visitors will come for.

**Phase 3 — Complete the set (weeks 4–8).** Work through remaining Drafts and
Stubs. Add worked examples where a blank template isn't enough.

**Phase 4 — Grow the commons (ongoing).** Invite contributions, add sector
variants (financial services, health, public sector), keep the EU AI Act pages
current as guidance evolves, and consider downloadable `.docx`/`.xlsx` versions
of the registers for people who want to fill them in offline.

**Optional later:** a lightweight interactive version of the readiness checklist
(client-side JS that scores as you tick — still fully static, no backend).

---

## 9. Maintenance notes

- **Keep the EU AI Act pages fresh.** They're the timely hook and the most
  likely to age. Each carries a "verify before you rely on this" note and source
  links; revisit when official guidance moves.
- **Guard the shared page structure.** It's what keeps the kit coherent as
  contributors pile in — the `contributing.md` house style enforces it.
- **Everything stays static.** Resist adding a backend; the appeal is that it's
  free, forkable, and outlives any single maintainer.
