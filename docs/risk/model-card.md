<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# Model Card / Model Risk Documentation

<span class="pill ready">Ready</span>

**Purpose.** Standard documentation for a model: what it is for, what it was trained on, how well it performs and for whom, and where it should not be used. Feeds both AI Act technical documentation and the instructions deployers rely on.

**When to use it.** Complete before deployment; update on retraining or material change. Required in practice for anything high-risk.

**How to use it.** Write the limitations section honestly and first. A model card that lists no limitations tells a reader either that you did not look, or that you are not telling them — and both undermine every other claim on the page.

!!! tip "Closes assessment gaps"
    This template addresses **Q08**, **Q12**, **Q13**, **Q16**, **Q33** in the [readiness assessment](../assess/index.md).

---

## The template

### Model details

| Field | Value |
|---|---|
| Model name / version | |
| System ID | [links to [AI System Inventory](../registers/ai-system-inventory.md)] |
| Owner | [named] |
| Type / architecture | |
| Base model (if fine-tuned) | |
| Training date | |
| Licence / provenance | |

### Intended use

**Intended to:** [specific tasks and context]

**Intended users:** [who operates it]

**Out of scope — do not use for:**

- [specific uses that would be inappropriate]
- [populations it was not trained for]
- [decisions it must not make alone]

!!! note "Out-of-scope is the section that prevents harm"
    Most AI failures come from a model used well outside what it was built
    for. Be specific enough that someone can recognise their own misuse case.

### Training data

| Field | Value |
|---|---|
| Sources | [links to [Data Asset Register](../registers/data-asset-register.md)] |
| Size and period covered | |
| Personal data? | [and lawful basis] |
| Preprocessing | |
| Train / validation / test split | [method; leakage check] |
| Known gaps or skews | |
| Representativeness assessment | [vs. affected population] |

### Performance

| Metric | Overall | Notes |
|---|---|---|
| [Accuracy / F1 / AUC] | | |
| [Precision] | | |
| [Recall] | | |

**Performance across groups** — the section that matters most:

| Group | Metric | Result | Gap vs. overall |
|---|---|---|---|
| [group A] | | | |
| [group B] | | | |

Evaluation date, dataset, and method: **[record so results are reproducible]**

### Limitations & failure modes

- **Known failure modes:** [where it goes wrong, and how it looks when it
  does]
- **Uncertainty:** [does it signal low confidence? is that signal reliable?]
- **Drift sensitivity:** [what changes in the world degrade it]
- **Adversarial exposure:** [how it can be manipulated]

### Human oversight

| Field | Value |
|---|---|
| Oversight design | [how a human reviews] |
| Override mechanism | [how, and by whom] |
| Expected review effort | [time per decision] |
| Escalation route | |

### Monitoring

| What | How | Threshold | Owner | Action if breached |
|---|---|---|---|---|
| Accuracy | | | | |
| Subgroup performance | | | | |
| Input drift | | | | |
| Override rate | | | | |

### Ethical & legal considerations

Fairness assessment · DPIA reference · Environmental cost, if material ·
Third-party dependencies

### Version history

| Version | Date | Change | Retrained? | Approved by |
|---|---|---|---|---|
| 1.0 | [date] | Initial release | — | [name] |

---

## Adaptation notes

- **Bought models:** Complete what you can from vendor documentation and record explicitly what they would not tell you. The gaps are themselves a risk finding to raise under [Third-Party AI Risk Policy](../policies/third-party-ai-risk-policy.md).
- **LLM / GPAI applications:** Replace the training-data section with prompt, retrieval, and grounding configuration; document system prompts, guardrails, and evaluation of typical failure modes such as hallucination and injection.
- **Regulated financial services:** Extend into a full model risk document: assumptions, conceptual soundness, independent validation findings, and ongoing performance monitoring.
- **Non-technical readers:** Keep a one-paragraph plain-English summary at the top. Boards and DPOs read that; they do not read the metrics table.

## Related

- [AI Development & Deployment Standard](../policies/ai-development-standard.md) — <span class="pill ready">Ready</span>
- [AI Risk Assessment](ai-risk-assessment.md) — <span class="pill ready">Ready</span>
- [AI System Inventory](../registers/ai-system-inventory.md) — <span class="pill ready">Ready</span>
- [Data Quality Standard](../policies/data-quality-standard.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
