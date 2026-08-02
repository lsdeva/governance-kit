<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# AI Development & Deployment Standard

<span class="pill ready">Ready</span>

<div class="gk-downloads" markdown>
[:material-file-word: Word](../downloads/ai-development-standard.docx){ .md-button .gk-dl download }
[:material-language-markdown: Markdown](../downloads/ai-development-standard.md.txt){ .md-button .gk-dl download="ai-development-standard.md" }
</div>

**Purpose.** The engineering-facing requirements for building, testing, deploying, and operating AI systems — the technical controls that make the framework's principles real inside a delivery pipeline.

**When to use it.** Applies to every system you build or materially fine-tune. Apply the gates proportionately: full rigour for high-risk, light touch for minimal.

**How to use it.** Implement the gates as pipeline checks rather than documents wherever you can. A requirement that a human must remember to check will be skipped under deadline pressure; one that fails a build will not.

!!! tip "Closes assessment gaps"
    This template addresses **Q07**, **Q10**, **Q13**, **Q14**, **Q16**, **Q20**, **Q33**, **Q40** in the [readiness assessment](../assess/index.md).

---

## The template

### 1. Scope

Applies to AI systems built, fine-tuned, or materially configured by
**[Organisation]**. Third-party systems used as-is fall under
[Third-Party AI Risk Policy](third-party-ai-risk-policy.md).

### 2. Lifecycle gates

| Gate | Requirement | Evidence | Blocking? |
|---|---|---|---|
| **G1 Intake** | Prohibited-practice screen; risk tier assigned; registered. | [AI System Inventory](../registers/ai-system-inventory.md) entry | Yes — all tiers |
| **G2 Data** | Sources registered, lawful, classified; quality assessed. | [Data Asset Register](../registers/data-asset-register.md); quality report | Yes — all tiers |
| **G3 Design** | Risk assessment started; oversight approach defined. | [AI Risk Assessment](../risk/ai-risk-assessment.md) | High-risk |
| **G4 Build** | Evaluation plan; bias testing; version control of data and model. | Test results | High-risk |
| **G5 Pre-deploy** | Documentation complete; oversight operable; owner sign-off. | [Model Card / Model Risk Documentation](../risk/model-card.md); sign-off | Yes — all tiers |
| **G6 Operate** | Monitoring live; logging retained; incident route defined. | Monitoring config | High-risk |
| **G7 Change** | Material change re-triggers G3–G5. | Change record | High-risk |
| **G8 Retire** | Decommissioned; records retained; inventory updated. | Retirement record | Yes — all tiers |

### 3. Data requirements

- Training, validation, and test data **must** be documented as to source,
  licence, and lawful basis.
- Splits **must** be documented and leakage-checked.
- Representativeness **must** be assessed against the affected population.
- Data versions **must** be recorded so results can be reproduced.

### 4. Evaluation

| Requirement | Minimal | High-risk |
|---|---|---|
| Accuracy metrics declared | Recommended | **Required** |
| Performance across subgroups | Recommended | **Required** |
| Robustness / adversarial testing | Optional | **Required** |
| Reproducible evaluation | Recommended | **Required** |
| Independent review of results | Optional | **Required** |

Declare metrics **before** running the evaluation. Choosing the metric after
seeing the results is how systems get approved on the one number that
happened to look acceptable.

### 5. Logging

High-risk systems **must** automatically log, at minimum: timestamp, system
and model version, input reference, output, confidence where available, and
any human override. Retain per <span class="gk-default" title="Art. 12 expects logs sufficient to trace behaviour over the system's lifetime. A challenge to a decision usually arrives months after it was made, so shorter retention means you cannot answer it."><strong>Six months minimum; twelve months for high-risk systems</strong><span class="gk-default-unless">Unless: Longer where your sector's record-keeping rules or your limitation period require it. Shorter is rarely defensible for a high-risk system.</span></span> — long enough to
reconstruct a decision if it is challenged.

!!! note "Application logs are usually not enough"
    Standard telemetry records that a request happened. Art. 12 traceability
    needs what the model was asked and what it answered. These are rarely the
    same log.

### 6. Human oversight implementation

- The interface **must** show the reviewer what they need in order to judge
  the output, including uncertainty.
- Override **must** be possible without engineering involvement.
- Overrides **must** be logged and reviewed for pattern — a system that is
  overridden constantly is not working.
- Reviewer workload **must** allow genuine consideration. Record the assumed
  review time per decision.

### 7. Security

Address AI-specific threats alongside conventional application security:
prompt injection, training-data poisoning, model extraction, membership
inference, and unintended disclosure through outputs. See
[Control Library & Assurance Map](../risk/control-library.md).

### 8. Deployment & rollback

Staged rollout for high-risk systems, with a **tested** rollback path and a
defined kill switch. Record who can invoke it — see [Decision Rights & Escalation](../operating-model/decision-rights.md).

### 9. Review

| Version | Date | Owner | Approved by |
|---|---|---|---|
| 0.1 | [date] | [role] | [committee] |

---

## Adaptation notes

- **Small teams:** Gates G1, G2, G5, and G8 are the minimum viable set: know what you have, know your data is lawful, check before launch, clean up after.
- **MLOps-mature organisations:** Map each gate to an existing pipeline stage and enforce it in CI. The goal is that evidence is produced as a by-product rather than assembled before an audit.
- **Regulated financial services:** Add independent model validation before G5 and align documentation with your model risk management standard.
- **Mostly buying, not building:** This standard will be largely out of scope. Invest instead in [Third-Party AI Risk Policy](third-party-ai-risk-policy.md) and contractual evidence rights.

## Related

- [AI Governance Framework](../frameworks/ai-governance-framework.md) — <span class="pill ready">Ready</span>
- [Model Card / Model Risk Documentation](../risk/model-card.md) — <span class="pill ready">Ready</span>
- [AI Risk Assessment](../risk/ai-risk-assessment.md) — <span class="pill ready">Ready</span>
- [Control Library & Assurance Map](../risk/control-library.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
