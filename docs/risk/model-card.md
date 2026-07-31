# Model Card / Model Risk Documentation

<span class="pill draft">Draft</span>

**Purpose.** Standardised documentation for a model: intended use, data, performance, limitations, fairness, and oversight — your technical-documentation backbone.

**When to use it.** For every model in production; update on retrain.

**How to use it.** Copy the structure below, replace the bracketed placeholders,
and ratify it through your governance committee. Keep it proportionate to your
size and risk.

!!! note "Contributions welcome"
    This page is a **draft** — the structure is set but it needs fleshing out. See [Contributing](../contributing.md) to help complete it.

---

## The template

**Model details** — name, version, owner, date.
**Intended use** — and out-of-scope uses.
**Training data** — sources, dates, known limitations, personal data.
**Performance** — metrics, by relevant subgroup where possible.
**Fairness & bias** — testing done and findings.
**Limitations & risks** — what it should not be trusted for.
**Human oversight** — how a person can intervene.
**Monitoring** — what's tracked in production.

---

## Adaptation notes

- **Small organisations:** keep the fields but reduce the cadence and merge roles.
- **Regulated sectors:** align terminology and controls to your supervisory
  expectations and to the [EU AI Act readiness checklist](../eu-ai-act/readiness-checklist.md).
- **Non-EU:** swap regulatory references for your local regime; the structure holds.
