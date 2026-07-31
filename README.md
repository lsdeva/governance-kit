# Open Data & AI Governance Kit

A free, open collection of **board-ready data and AI governance templates** — the
same scaffolding most organisations rebuild from scratch every time: frameworks,
policies, operating model, RACI, registers, board packs, and **EU AI Act
readiness** updated for the 2026 Digital Omnibus dates.

Built as a static website with [MkDocs Material](https://squidfunk.github.io/mkdocs-material/)
and hosted free on **GitHub Pages**. No accounts, no paywall, no lead capture.

> **Not legal advice.** These are starting templates. Adapt them to your
> jurisdiction, sector, and risk appetite, and have qualified counsel review
> anything you rely on.

## Quick start (local preview)

```bash
python -m venv .venv && source .venv/bin/activate   # optional but recommended
pip install -r requirements.txt
mkdocs serve                                          # http://127.0.0.1:8000
```

## Publishing

The live site is at **<https://lsdeva.github.io/governance-kit/>**.

`.github/workflows/deploy.yml` builds with `mkdocs build --strict` and deploys to
GitHub Pages on every push to `main`. The only one-time setup is
**Settings → Pages → Source = GitHub Actions**.

Forking? Replace `lsdeva` in `mkdocs.yml` with your own GitHub username so the
site URL and "edit this page" links point at your copy.

## How it's organised

```
docs/
  index.md              # landing page
  getting-started.md    # how to use the kit
  frameworks/           # frameworks, charter, maturity assessment
  policies/             # policies & standards
  operating-model/      # RACI, committee ToR, roles, decision rights
  registers/            # asset register, AI inventory, risk register, logs
  risk/                 # AI risk assessment, model cards, control library
  board/                # board pack, KPI/KRI dashboard
  eu-ai-act/            # readiness checklist + timeline
  contributing.md
  about.md
```

Each template page follows the same structure (Purpose → When to use → How to
use → the template itself → Adaptation notes) so contributions stay consistent.

## Contributing

PRs welcome — see [`docs/contributing.md`](docs/contributing.md). The goal is a
genuinely open commons for data & AI governance.

## Licence

- **Content** (all templates and docs): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — use, adapt, and share freely with attribution.
- **Code** (config, workflows, styles): [MIT](LICENSE).
