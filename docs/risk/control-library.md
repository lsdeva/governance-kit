<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# Control Library & Assurance Map

<span class="pill ready">Ready</span>

<div class="gk-downloads" markdown>
[:material-file-word: Word](../downloads/control-library.docx){ .md-button .gk-dl download }
[:material-file-excel: Excel](../downloads/control-library.xlsx){ .md-button .gk-dl download }
[:material-language-markdown: Markdown](../downloads/control-library.md.txt){ .md-button .gk-dl download="control-library.md" }
</div>

**Purpose.** Maps obligations to the controls that satisfy them, names an owner for each, and records how you would evidence the control is operating. It turns "we have a policy" into "here is what we do and how you can check".

**When to use it.** Build once the frameworks exist, then use it to plan assurance and to answer regulator and auditor questions efficiently.

**How to use it.** Start from obligations and work outwards to controls, not from your existing controls inwards. Working the other way finds only the obligations you happen to already cover, which is precisely the wrong direction for gap analysis.

!!! tip "Closes assessment gaps"
    This template addresses **Q11**, **Q14**, **Q16**, **Q17**, **Q18**, **Q23**, **Q30**, **Q34** in the [readiness assessment](../assess/index.md).

---

## The template

### Structure

| Element | Meaning |
|---|---|
| **Obligation** | The requirement — regulatory, contractual, or internal |
| **Control** | What you do to satisfy it |
| **Type** | Preventive / detective / corrective |
| **Frequency** | Continuous, per-event, or periodic |
| **Owner** | Named, first line |
| **Evidence** | What you would show to prove it operated |
| **Assurance** | Who checks, and how often |

### Control library

| ID | Obligation | Control | Type | Freq. | Owner | Evidence | Assurance |
|---|---|---|---|---|---|---|---|
| C-01 | Art. 5 — prohibited practices | Intake screen at G1 blocks prohibited use cases | Preventive | Per system | Gov Lead | Screening record in inventory | 2L quarterly sample |
| C-02 | Art. 6 — classification | Every system classified with recorded rationale before build | Preventive | Per system | Gov Lead | [AI System Inventory](../registers/ai-system-inventory.md) | 2L quarterly |
| C-03 | Art. 9 — risk management | Risk assessment completed and reviewed for high-risk systems | Preventive | Per system + annual | AI Owner | [AI Risk Assessment](ai-risk-assessment.md) | 3L annual |
| C-04 | Art. 10 — data governance | Training data assessed for relevance, representativeness, bias | Preventive | Per model | ML Lead | Data quality report | 2L per release |
| C-05 | Art. 11 — documentation | Model card completed before deployment | Preventive | Per model | ML Lead | [Model Card / Model Risk Documentation](model-card.md) | 3L annual |
| C-06 | Art. 12 — logging | Automatic logging enabled and retained | Detective | Continuous | Tech Owner | Log configuration; retention proof | 2L quarterly |
| C-07 | Art. 14 — human oversight | Reviewer workflow with override; override rates monitored | Preventive | Continuous | Product Owner | Override metrics | 2L quarterly |
| C-08 | Art. 15 — accuracy & security | Evaluation and adversarial testing before release | Preventive | Per release | ML Lead | Test results | 3L annual |
| C-09 | Art. 50 — transparency | AI disclosure present in user-facing surfaces | Preventive | Per release | Product Owner | UI evidence | 2L sample |
| C-10 | Art. 72/73 — monitoring & incidents | Monitoring live; incident route defined and tested | Detective | Continuous | Gov Lead | [Issue & Incident Log](../registers/incident-log.md) | 3L annual |
| C-11 | Art. 4 — AI literacy | Role-appropriate training delivered and tracked | Preventive | Annual | HR | Completion records | 2L annual |
| C-12 | Art. 26 — vendor obligations | Vendor assessment and contract clauses in place | Preventive | Per vendor | Procurement | Assessment; contract | 2L annual |
| C-13 | GDPR Art. 35 — DPIA | DPIA completed before high-risk processing | Preventive | Per activity | DPO | [Processing & DPIA Log](../registers/processing-dpia-log.md) | 3L annual |

### Assurance map

Shows who checks what, and exposes obligations nobody is assuring.

| Obligation area | 1L — does it | 2L — challenges | 3L — assures | Gaps |
|---|---|---|---|---|
| Prohibited practices | Product / ML | Governance | Audit | |
| Classification | Gov Lead | Legal | Audit | |
| Risk management | AI Owners | Risk | Audit | |
| Data governance | Data Owners | Governance | Audit | |
| Documentation | ML teams | Governance | Audit | |
| Human oversight | Product | Governance | Audit | |
| Transparency | Product | Legal | Audit | |
| Third party | Procurement | Security / Legal | Audit | |
| Literacy | HR | Governance | Audit | |

!!! tip "Look for the blank cells"
    The value of this map is where a column is empty. An obligation with a
    first line but no assurance is a control you are trusting without ever
    checking.

### Control testing

| Test type | What it answers |
|---|---|
| **Design** | Would this control work if it operated as described? |
| **Operating effectiveness** | Did it actually operate, over the period? |

Test high-risk controls at least annually; sample others on a risk basis.
Record failures in the [Issue & Incident Log](../registers/incident-log.md) and the [Risk Register](../registers/risk-register.md).

---

## Adaptation notes

- **Small organisations:** Controls C-01, C-02, C-05, and C-07 give you the most coverage for the least effort. Self-assessment substitutes for a third line, but say so openly rather than implying independence you do not have.
- **Existing GRC tooling:** Load these as a control set in the tool you already have rather than maintaining a separate spreadsheet.
- **ISO/IEC 42001 or NIST AI RMF:** Add a column mapping each control to the corresponding clause or function, so a single control satisfies several frameworks and you test it once.

## Related

- [AI Risk Assessment](ai-risk-assessment.md) — <span class="pill ready">Ready</span>
- [Risk Register](../registers/risk-register.md) — <span class="pill ready">Ready</span>
- [Issue & Incident Log](../registers/incident-log.md) — <span class="pill ready">Ready</span>
- [Maturity Assessment](../frameworks/maturity-assessment.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
