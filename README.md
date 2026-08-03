<div align="center">

# GovKit

**Board-ready data &amp; AI governance — given away free.**

Take a role-based readiness assessment, get a report you can present to a board
or a regulator, and use the 25 templates that close your gaps.<br>
No accounts, no paywall, no email capture — and nothing ever leaves your browser.

[**Take the assessment →**](https://govkit.soa.team/assess/) &nbsp;·&nbsp;
[Browse the kit](https://govkit.soa.team/) &nbsp;·&nbsp;
[EU AI Act checklist](https://govkit.soa.team/eu-ai-act/readiness-checklist/) &nbsp;·&nbsp;
[Contributing](docs/contributing.md)

[![Deploy site](https://github.com/lsdeva/governance-kit/actions/workflows/deploy.yml/badge.svg)](https://github.com/lsdeva/governance-kit/actions/workflows/deploy.yml)
[![Content: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-blue.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Code: MIT](https://img.shields.io/badge/code-MIT-green.svg)](LICENSE)
[![Built with Material for MkDocs](https://img.shields.io/badge/built%20with-Material%20for%20MkDocs-526cfe.svg)](https://squidfunk.github.io/mkdocs-material/)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/contributing.md)

</div>

---

## The assessment

Most template libraries leave you to work out what you need. This one asks.

1. **Pick your role** — Legal/DPO, Governance Lead, ML/Data Science, Product
   Owner, Head of People, Security, Internal Audit, or Exec Sponsor/Board.
2. **Answer what applies to you** — only the questions relevant to those roles,
   each with plain-English guidance on what "yes" actually requires.
3. **Get a report you can present** — overall readiness, a score per category,
   and your top gaps ranked by severity, each deep-linked to the template that
   closes it.
4. **Reframe it for your audience** — Board, regulator, exec team, or working
   team. Export as print/PDF, Markdown, or a self-contained HTML file.

**Privacy by design.** There is no backend. Answers are held in your browser and
saved to `localStorage` only on your device, with a "Clear my data" button on
every screen. The site makes no external requests at all — no fonts, no
analytics, no API calls.

**Recommendations, not blank choices.** Where the kit used to leave a
`[bracketed placeholder]` — a decision handed to whoever was reading — it now
states a recommended default *and* the condition for deviating from it
("quarterly, unless you run high-risk systems in production"). Accepting every
default produces a coherent, defensible programme.

**[Decide](https://govkit.soa.team/decide/), don't just read.**
The hard judgements are guided one question at a time and end in a verdict —
with its reasoning and date recorded, exportable as evidence. The EU AI Act,
ISO/IEC 42001 and NIST AI RMF all ask for documented, reasoned decisions, so
the rationale trail is the deliverable rather than paperwork.

**No fake benchmarks.** The scoring thresholds are stated openly as editorial
judgement, not industry data, and the kit holds **no peer-comparison figures** —
producing them honestly would mean collecting your answers on a server, which
this project will not do. Instead the report tracks *your own* movement between
dated snapshots, which is what a board asks about anyway.
[How scoring works](https://govkit.soa.team/scoring/) sets out
the method, the weights, and the limitations in full.

## Why this exists

Standing up data &amp; AI governance means producing the same twenty-odd artefacts
every time — a framework, a policy set, a committee charter, a RACI, a handful of
registers, and something the board can actually read. Most teams either rebuild
them from a blank page or buy a gated "launchpad" pack for a few hundred pounds.

This kit is the open alternative. Same scaffolding, openly licensed, free to fork
and adapt inside your own organisation without asking anyone. Where a paid pack
sells convenience, an open commons wins on trust, reach, and durability.

- **Genuinely free** — no sign-up, no lead capture, no upsell.
- **Openly licensed** — [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
  content you can drop straight into your internal wiki.
- **Board-ready** — written for the audience that signs off, not for a compliance shelf.
- **Current** — EU AI Act pages track the 2026 Digital Omnibus dates.
- **Consistent** — every template follows one shape, so the kit reads as a system.

> [!IMPORTANT]
> **Not legal advice.** These templates are a head start, not a substitute for
> professional judgement. Adapt them to your jurisdiction, sector, and risk
> appetite, and have qualified counsel review anything material before you rely
> on it.

## What's inside

| Section | Templates | Covers |
| :--- | :--- | :--- |
| **[Frameworks](docs/frameworks/)** | 4 | Data &amp; AI governance frameworks, charter, maturity assessment |
| **[Policies &amp; Standards](docs/policies/)** | 6 | Governance, data quality, classification, acceptable AI use, AI development, third-party AI risk |
| **[Operating Model](docs/operating-model/)** | 4 | RACI, committee terms of reference, roles, decision rights &amp; escalation |
| **[Registers](docs/registers/)** | 5 | Data assets, AI system inventory, risk, incidents, processing / DPIA |
| **[Risk &amp; Control](docs/risk/)** | 3 | AI risk assessment, model cards, control library &amp; assurance map |
| **[Board &amp; Reporting](docs/board/)** | 2 | Board pack, KPI / KRI dashboard |
| **[EU AI Act](docs/eu-ai-act/)** | 1 + timeline | 25-point readiness checklist, obligation timeline |
| **[Assessment](https://govkit.soa.team/assess/)** | 40 questions | 8 roles, 7 categories, audience-tailored report |
| **[Worked examples](https://govkit.soa.team/examples/)** | 4 | The same templates filled in for a fictional mid-size company |
| **[30/60/90-day plans](https://govkit.soa.team/plans/)** | 4 paths | Sequenced, with effort estimates and a small-org variant |
| **[Standards crosswalk](https://govkit.soa.team/crosswalk/)** | 15 themes | ISO/IEC 42001 · NIST AI RMF · Singapore · EU AI Act |

**Every template downloads as Word, and the registers and scoring tools as
Excel** — with frozen headers, dropdown validation, working formulas, and
per-column guidance. Raw Markdown too, for pasting into a wiki.

Each page follows the same structure — **Purpose → When to use it → How to use it
→ The template → Adaptation notes** — so the kit stays predictable and
contributions land in the right place.

### Maturity at a glance

Pages carry a status so you know what you're getting:

| Status | Meaning |
| :--- | :--- |
| 🟢 **Ready** | Fully drafted and usable as-is |
| 🟡 **Draft** | Sound structure, needs a review pass |
| ⚪ **Stub** | Outline with the right shape — [contributions welcome](docs/contributing.md) |

All 25 templates plus the EU AI Act timeline are written out in full; the
Governance Charter is marked Draft pending a review pass. Real-world experience
still makes them sharper — [corrections and sector variants are welcome](docs/contributing.md).

## Where to start

| If you're… | Start here |
| :--- | :--- |
| Standing up a programme from nothing | [Maturity Assessment](docs/frameworks/maturity-assessment.md) → frameworks → committee → registers |
| Watching AI land faster than governance | [EU AI Act Readiness Checklist](docs/eu-ai-act/readiness-checklist.md) → [AI System Inventory](docs/registers/ai-system-inventory.md) |
| Being asked questions by a board or regulator | [Board Pack](docs/board/board-pack.md) → [Risk Register](docs/registers/risk-register.md) → [KPI / KRI Dashboard](docs/board/kpi-dashboard.md) |

Full walkthrough: **[Get started](https://govkit.soa.team/getting-started/)**.

## Run it locally

Requires Python 3.9+.

```bash
git clone https://github.com/lsdeva/governance-kit.git
cd governance-kit

python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate

pip install -r requirements.txt
mkdocs serve                     # → http://127.0.0.1:8000
```

After editing anything in `data/`, regenerate before previewing:

```bash
python tools/build_content.py    # rewrite generated pages + assessment data
```

Before opening a PR, confirm both still pass:

```bash
python tools/build_content.py --check   # generated pages match the data files
mkdocs build --strict                   # fails on any broken internal link
```

## How it's built

Markdown rendered by [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/),
built and deployed to GitHub Pages by
[GitHub Actions](.github/workflows/deploy.yml) on every push to `main`. Static
end to end — no backend, no database, no tracking.

**All content is defined once, in `data/`.** The template pages, the section
index pages, the EU AI Act checklist, the site navigation, and the assessment's
question bank are all generated from those files by `tools/build_content.py`.
Nothing is duplicated, so the published checklist and the assessment tool cannot
drift apart — they read the same source.

```
├── data/                         # ← THE SOURCE OF TRUTH
│   ├── templates.yml             #   25 templates, including page content
│   ├── questions.yml             #   40 assessment questions
│   ├── roles.yml                 #   8 roles
│   ├── sections.yml              #   section metadata → nav + index pages
│   └── snippets.yml              #   shared blocks (disclaimer, legends)
├── tools/build_content.py        # generator + integrity checks
├── mkdocs.yml                    # site config; nav block is generated
├── overrides/partials/           # theme override that removes an external call
└── docs/
    ├── index.md, getting-started.md, contributing.md, about.md   # hand-written
    ├── assess/                   # the assessment app (js + css + generated json)
    └── frameworks/ policies/ operating-model/ registers/ risk/ board/ eu-ai-act/
                                  # ← ALL GENERATED. Do not edit.
```

### Editing content

Every page under those six section folders carries a
`<!-- GENERATED FILE — DO NOT EDIT -->` header. Change the data file instead,
then regenerate:

```bash
python tools/build_content.py     # rewrite pages + assessment data
mkdocs build --strict             # confirm it still builds clean
```

| To change… | Edit this |
| :--- | :--- |
| A template's content, wording, or status | `data/templates.yml` |
| An assessment question, its help text, or weight | `data/questions.yml` |
| Which roles see a question | `applies_to` in `data/questions.yml` |
| A role's name or description | `data/roles.yml` |
| A section name, blurb, or the nav order | `data/sections.yml` |
| The "not legal advice" notice (all 26 pages at once) | `data/snippets.yml` |
| A worked example | `data/examples.yml` |
| A 30/60/90-day plan | `data/plans.yml` |
| A standards mapping | `data/crosswalk.yml` |
| An "I've been asked to…" entry | `data/tasks.yml` |
| An Excel register's columns, dropdowns, or formulas | `data/spreadsheets.yml` |
| A scoring band, weight meaning, or stated limitation | `data/benchmarks.yml` |
| A recommended default, or when to deviate from it | `data/defaults.yml` |
| A guided decision's questions or verdicts | `data/decisions.yml` |

<details>
<summary><strong>Adding a template, question, or role</strong></summary>

<br>

**A template** — add an entry to `data/templates.yml`:

```yaml
- id: my-template            # stable slug; referenced by questions.yml
  title: My Template
  section: policies          # must exist in data/sections.yml
  path: policies/my-template.md
  status: draft              # ready | draft | stub
  purpose: >-
    What it is for.
  when_to_use: >-
    Trigger and cadence.
  how_to_use: >-
    Steps specific to this template.
  body: |
    ### 1. First section

    Link other templates with {{their-id}} — the generator resolves it to a
    correct relative link, so pages can move without breaking anything.
  adaptation:
    - context: Small organisations
      note: >-
        What changes for them.
  related: [data-governance-policy]
```

The page, its navigation entry, and its row on the section index all appear
automatically.

**A question** — add to `data/questions.yml` with `applies_to`, a `weight` of
1–5, and the `templates` that close it. It immediately appears for those roles,
and on the pages of every template it references.

**A role** — add to `data/roles.yml`, then add its id to the `applies_to` of the
questions it should see. Roles need at least five questions; the generator
enforces this so no role gets a report too thin to be useful.

**Never renumber existing question ids** — saved assessments in people's
browsers are keyed by them.

</details>

The generator validates ids, sections, statuses, weights, categories, every
cross-reference, and per-role question coverage — failing loudly rather than
producing a broken site. CI re-runs it and rejects the build if the committed
pages do not match the data files, so a hand-edit of a generated page is caught
rather than silently lost.

<details>
<summary><strong>Forking this for your own organisation</strong></summary>

<br>

1. Fork the repo and replace `lsdeva` in `mkdocs.yml` (`site_url`, `repo_url`,
   `repo_name`, and the social link) with your own GitHub username.
2. In **Settings → Pages**, set **Source = GitHub Actions**.
3. Push to `main`. Your copy publishes to
   `https://YOUR-USERNAME.github.io/governance-kit/`.

The repo needs to be **public** for GitHub Pages and Actions minutes to be free.
Attribution is appreciated but never required for internal use.

</details>

## Contributing

Contributions are what turn a template pack into a commons — filling a stub,
sharpening a draft, adding a sector variant, or flagging where EU AI Act guidance
has moved. Start with **[docs/contributing.md](docs/contributing.md)** for the
house style, then open a PR.

The one rule: keep the shared page structure. It is what holds the kit together
as more people add to it.

## Licence

Dual-licensed, the standard pattern for open content-plus-code projects:

- **Content** — all templates and docs under `docs/` —
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Use, adapt, and
  share freely, including commercially, with attribution.
- **Code** — config, workflow, and styles — [MIT](LICENSE).

Suggested attribution:

> Based on [GovKit](https://govkit.soa.team/), CC BY 4.0.

<div align="center">
<br>
<sub>Built and maintained in the open. If the kit saves you a week, pass it on.</sub>
</div>
