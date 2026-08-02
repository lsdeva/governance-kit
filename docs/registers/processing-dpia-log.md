<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# Processing & DPIA Log

<span class="pill ready">Ready</span>

<div class="gk-downloads" markdown>
[:material-file-word: Word](../downloads/processing-dpia-log.docx){ .md-button .gk-dl download }
[:material-file-excel: Excel](../downloads/processing-dpia-log.xlsx){ .md-button .gk-dl download }
[:material-language-markdown: Markdown](../downloads/processing-dpia-log.md.txt){ .md-button .gk-dl download="processing-dpia-log.md" }
</div>

**Purpose.** The record of personal data processing activities and the impact assessments that cover them — the point where AI governance meets data protection law.

**When to use it.** Maintain continuously. Complete a DPIA before high-risk processing begins, not after the system is built.

**How to use it.** If you already keep an Art. 30 record of processing, extend it rather than starting a second list. Add the AI-specific columns and cross-reference the [AI System Inventory](ai-system-inventory.md) so the two can never disagree about what exists.

!!! tip "Closes assessment gaps"
    This template addresses **Q21**, **Q24**, **Q38** in the [readiness assessment](../assess/index.md).

---

## Fill it in here

Work directly in the browser — nothing is uploaded, and your rows are saved on this device. Download to Excel whenever you want, or save a file you can reopen later.

<div class="gk-reg-host" data-register="processing-dpia-log" data-src="../../assess/register-data.json"><p class="gk-muted">Loading the editable register…</p></div>

---

## The template

### Processing activities

| ID | Activity | Purpose | Lawful basis | Categories of data | Data subjects | Special category? | Recipients | Transfers | Retention | AI system | DPIA |
|---|---|---|---|---|---|---|---|---|---|---|---|
| P-001 | Customer support triage | Route and summarise tickets | Legitimate interests | Contact, ticket content | Customers | No | [vendor] | [country] | 3y | AI-002 | DPIA-002 |
| P-002 | Candidate screening | Shortlist applicants | Legitimate interests | CV, application | Candidates | Possible | [vendor] | EU | 12m | AI-004 | DPIA-001 |

### When a DPIA is required

A DPIA is required where processing is likely to result in high risk — and
for AI, that is common. Triggers include:

- [ ] Systematic and extensive **automated evaluation** of people, including
      profiling, with legal or similarly significant effects
- [ ] Large-scale processing of **special category** data
- [ ] Systematic **monitoring** of a publicly accessible area
- [ ] **Innovative technology** applied to personal data — most novel AI
      qualifies
- [ ] Processing that **prevents access** to a service or contract
- [ ] Data concerning **vulnerable people**, including employees and children

!!! tip "AI Act and GDPR assessments overlap — link them"
    A high-risk AI system will usually need both a DPIA and an AI risk
    assessment, and certain deployers additionally owe a fundamental rights
    impact assessment. Run them together and cross-reference; duplicating the
    analysis in two documents guarantees they will diverge.

### DPIA log

| ID | System | Processing | Started | Completed | Outcome | Residual risk | DPO opinion | Consulted authority? | Review |
|---|---|---|---|---|---|---|---|---|---|
| DPIA-001 | AI-004 | Candidate screening | [date] | [date] | Proceed with controls | Medium | Given [date] | No | [date] |

### DPIA contents

1. **Description** — nature, scope, context, purpose; how the AI works in
   terms a non-specialist can follow.
2. **Necessity and proportionality** — lawful basis, and why a less intrusive
   option would not achieve the purpose.
3. **Risks to individuals** — discrimination, loss of autonomy, inaccuracy,
   exclusion, distress, not merely security risk.
4. **Measures** — controls, human oversight, transparency, and the routes for
   people to contest a decision.
5. **Residual risk** and sign-off. If risk stays high after mitigation, prior
   consultation with the supervisory authority may be required.

### Individual rights with AI

Confirm you can actually deliver these before the system goes live:

| Right | The AI-specific question |
|---|---|
| Access | Can you show what data about them the system used? |
| Rectification | Can a correction propagate to model behaviour? |
| Erasure | Can you remove them from training data or retrain? |
| Object | Can you exclude them from processing? |
| Automated decisions | Can you offer human review, explanation, and challenge? |

!!! warning "Erasure is the hard one"
    "The data is in the model weights" is not an answer a regulator accepts.
    Decide your approach — retraining cadence, exclusion lists, or not
    training on personal data at all — **before** you build.

---

## Adaptation notes

- **Small organisations:** One spreadsheet covering both processing and DPIAs is fine. The lawful basis and retention columns are the ones auditors ask for first.
- **Where a statutory DPO exists:** The DPO's opinion must be recorded, and where you proceed against it, the reasons must be documented.
- **Non-EU / other regimes:** Replace DPIA with your local equivalent (e.g. a privacy impact assessment). The triggers and structure translate with little change.

## Related

- [Data Classification & Handling Policy](../policies/data-classification-policy.md) — <span class="pill ready">Ready</span>
- [AI Risk Assessment](../risk/ai-risk-assessment.md) — <span class="pill ready">Ready</span>
- [AI System Inventory](ai-system-inventory.md) — <span class="pill ready">Ready</span>
- [Data Asset Register](data-asset-register.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
