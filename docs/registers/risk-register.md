<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# Risk Register

<span class="pill ready">Ready</span>

<div class="gk-downloads" markdown>
[:material-file-word: Word](../downloads/risk-register.docx){ .md-button .gk-dl download }
[:material-file-excel: Excel](../downloads/risk-register.xlsx){ .md-button .gk-dl download }
[:material-language-markdown: Markdown](../downloads/risk-register.md.txt){ .md-button .gk-dl download="risk-register.md" }
</div>

**Purpose.** The live record of data and AI risks: what could go wrong, how likely and how bad, what you are doing about it, and who owns it.

**When to use it.** Continuously. Review at every committee meeting; refresh scoring at least quarterly.

**How to use it.** Write risks as cause, event, and consequence — "because X, Y may happen, leading to Z". A register full of one-word risks like "data quality" cannot be managed, because nobody can tell what treating it would involve.

!!! tip "Closes assessment gaps"
    This template addresses **Q11**, **Q29**, **Q34** in the [readiness assessment](../assess/index.md).

---

## The template

### Scoring

**Likelihood**

| Score | Level | Guide |
|---|---|---|
| 1 | Rare | Not expected in 5 years |
| 2 | Unlikely | Possible in 3–5 years |
| 3 | Possible | Likely within 2 years |
| 4 | Likely | Expected this year |
| 5 | Almost certain | Expected within months |

**Impact**

| Score | Level | Guide |
|---|---|---|
| 1 | Negligible | Absorbed in normal operation |
| 2 | Minor | Limited, contained |
| 3 | Moderate | Material; management attention |
| 4 | Major | Regulatory interest; significant harm |
| 5 | Severe | Enforcement, serious harm, or existential |

**Rating** = likelihood × impact. 1–4 Low · 5–9 Medium · 10–14 High ·
15–25 Critical.

### The register

| ID | Risk (cause → event → consequence) | Category | L | I | Rating | Owner | Treatment | Target | Residual | Review |
|---|---|---|---|---|---|---|---|---|---|---|
| R-001 | Because AI systems are procured without governance review, unassessed high-risk systems may go live, leading to regulatory breach and enforcement | Compliance | 4 | 4 | **16** | [name] | Mandatory intake gate; quarterly SaaS sweep | 8 | | [date] |
| R-002 | Because training data under-represents some groups, the model may produce discriminatory outcomes, leading to harm and legal claims | Fairness | 3 | 5 | **15** | [name] | Representativeness testing at G4; subgroup metrics | 6 | | [date] |
| R-003 | Because staff use unapproved AI tools, confidential data may be disclosed to third parties, leading to breach notification | Security | 4 | 4 | **16** | [name] | Approved tool list; DLP; training | 8 | | [date] |
| R-004 | Because vendors change models without notice, system behaviour may change silently, leading to undetected performance degradation | Operational | 3 | 3 | **9** | [name] | Contractual notification; output monitoring | 4 | | [date] |

### Treatment options

| Option | When appropriate | Record |
|---|---|---|
| **Treat** | Reduce likelihood or impact | The controls and their owner |
| **Tolerate** | Within appetite | **Who accepted it, and when** |
| **Transfer** | Insurance or contract | Note that accountability rarely transfers |
| **Terminate** | Risk exceeds value | The decision and rationale |

!!! note "Tolerating is a decision with a name on it"
    Accepted risk must record who accepted it and at what level of authority
    — see [Decision Rights & Escalation](../operating-model/decision-rights.md). Risk that is tolerated by nobody in particular
    is risk that has simply been ignored.

### Common AI risks to consider

Use as a prompt, not a checklist to copy:

- Unassessed or unknown systems in production
- Discriminatory outcomes for protected groups
- Model drift degrading performance unnoticed
- Over-reliance: humans rubber-stamping AI output
- Confidential data leaked into external tools
- Prompt injection or training-data poisoning
- Vendor model change altering behaviour
- Inability to explain a decision when challenged
- Missing logs when evidence is needed
- Key-person dependency on one ML engineer

### Review

| Level | Cadence |
|---|---|
| Critical | Monthly, at committee |
| High | Quarterly |
| Medium | Half-yearly |
| Low | Annually |

---

## Adaptation notes

- **Small organisations:** A 3×3 matrix and a single register covering all risk types is easier to sustain than a separate AI register nobody looks at.
- **Existing enterprise risk management:** Do not create a parallel register. Add AI risks to the enterprise one with an AI tag, so they reach the board through the route that already works.
- **Regulated sectors:** Align scales with your enterprise risk framework, and map risks to the regulatory obligations they threaten.

## Related

- [AI Risk Assessment](../risk/ai-risk-assessment.md) — <span class="pill ready">Ready</span>
- [Control Library & Assurance Map](../risk/control-library.md) — <span class="pill ready">Ready</span>
- [Issue & Incident Log](incident-log.md) — <span class="pill ready">Ready</span>
- [Decision Rights & Escalation](../operating-model/decision-rights.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
