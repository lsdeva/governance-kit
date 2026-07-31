<div align="center">

# Open Data &amp; AI Governance Kit

**Board-ready data &amp; AI governance templates — given away free.**

The scaffolding every organisation rebuilds from scratch: frameworks, policies,
operating model, RACI, registers, board packs, and EU AI Act readiness.<br>
25 templates. No accounts, no paywall, no email capture.

[**Browse the kit →**](https://lsdeva.github.io/governance-kit/) &nbsp;·&nbsp;
[Get started](https://lsdeva.github.io/governance-kit/getting-started/) &nbsp;·&nbsp;
[EU AI Act checklist](https://lsdeva.github.io/governance-kit/eu-ai-act/readiness-checklist/) &nbsp;·&nbsp;
[Contributing](docs/contributing.md)

[![Deploy site](https://github.com/lsdeva/governance-kit/actions/workflows/deploy.yml/badge.svg)](https://github.com/lsdeva/governance-kit/actions/workflows/deploy.yml)
[![Content: CC BY 4.0](https://img.shields.io/badge/content-CC%20BY%204.0-blue.svg)](https://creativecommons.org/licenses/by/4.0/)
[![Code: MIT](https://img.shields.io/badge/code-MIT-green.svg)](LICENSE)
[![Built with Material for MkDocs](https://img.shields.io/badge/built%20with-Material%20for%20MkDocs-526cfe.svg)](https://squidfunk.github.io/mkdocs-material/)
[![PRs welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](docs/contributing.md)

</div>

---

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

Four pages are fully worked as reference implementations: the
**AI Governance Framework**, **RACI Matrix**, **AI System Inventory**, and the
**EU AI Act Readiness Checklist**. Copy their shape when filling a stub.

## Where to start

| If you're… | Start here |
| :--- | :--- |
| Standing up a programme from nothing | [Maturity Assessment](docs/frameworks/maturity-assessment.md) → frameworks → committee → registers |
| Watching AI land faster than governance | [EU AI Act Readiness Checklist](docs/eu-ai-act/readiness-checklist.md) → [AI System Inventory](docs/registers/ai-system-inventory.md) |
| Being asked questions by a board or regulator | [Board Pack](docs/board/board-pack.md) → [Risk Register](docs/registers/risk-register.md) → [KPI / KRI Dashboard](docs/board/kpi-dashboard.md) |

Full walkthrough: **[Get started](https://lsdeva.github.io/governance-kit/getting-started/)**.

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

Before opening a PR, confirm the site still builds clean:

```bash
mkdocs build --strict            # fails on any broken internal link
```

## How it's built

Markdown content rendered by [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/),
built and deployed to GitHub Pages by
[GitHub Actions](.github/workflows/deploy.yml) on every push to `main`. It is
static end to end — no backend, no database, no tracking — which is what keeps it
free to host and easy to fork.

```
├── mkdocs.yml                    # site config + navigation
├── requirements.txt              # pinned to mkdocs-material 9.x
├── .github/workflows/deploy.yml  # strict build → GitHub Pages
└── docs/
    ├── index.md                  # landing page
    ├── getting-started.md        # three starting paths
    ├── frameworks/  policies/  operating-model/
    ├── registers/   risk/       board/
    ├── eu-ai-act/                # checklist + timeline
    ├── contributing.md
    └── about.md
```

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

> Based on the [Open Data &amp; AI Governance Kit](https://lsdeva.github.io/governance-kit/), CC BY 4.0.

<div align="center">
<br>
<sub>Built and maintained in the open. If the kit saves you a week, pass it on.</sub>
</div>
