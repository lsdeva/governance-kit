<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# AI System Inventory

<div class="gk-dochead" markdown>
<span class="gk-dochead-meta" markdown>
<span class="pill ready">Ready</span>
</span>
<span class="gk-dochead-dl" markdown>
[:material-file-word: Word](../downloads/ai-system-inventory.docx){ .md-button .gk-dl download } [:material-file-excel: Excel](../downloads/ai-system-inventory.xlsx){ .md-button .gk-dl download } [:material-language-markdown: Markdown](../downloads/ai-system-inventory.md.txt){ .md-button .gk-dl download="ai-system-inventory.md" }
</span>
</div>

!!! example "See this filled in"
    A [worked example](../examples/ai-system-inventory.md) shows this
    template completed for a fictional mid-size company.

**Purpose.** The single list of every AI system you build, buy, or have embedded in something you already licence. It is the foundation of AI Act compliance: every other obligation applies per system, so a system you have not listed is one you cannot govern.

**When to use it.** Create it now, before anything else. Add systems at ideation, not at launch. Review the whole inventory quarterly.

**How to use it.** Run a discovery sweep first — ask each team what AI they use, then check your SaaS contracts for AI features you did not know were switched on. Expect the real number to be two to three times what people initially report.

!!! tip "Closes assessment gaps"
    This template addresses **Q03**, **Q05**, **Q06**, **Q07**, **Q08**, **Q22**, **Q38** in the [readiness assessment](../assess/index.md).

---

## Fill it in here

Work directly in the browser — nothing is uploaded, and your rows are saved on this device. Download to Excel whenever you want, or save a file you can reopen later.

<div class="gk-reg-host" data-register="ai-system-inventory" data-src="../../assess/register-data.json"><p class="gk-muted">Loading the editable register…</p></div>

---

## The template

### Inventory fields

| Field | Notes |
|---|---|
| System ID | Stable reference |
| Name & purpose | What it does, in business language |
| Business owner | The **named** AI Accountable Owner |
| Technical owner | Who operates it |
| Build / buy / embedded | Determines which policy applies |
| Vendor & product | For bought or embedded |
| **Our role** | Provider / deployer / importer / distributor |
| **Risk tier** | Prohibited / high-risk / limited / minimal |
| Tier rationale | Why — the decision, not just the label |
| Annex reference | If high-risk, which Annex III point |
| Model / technique | E.g. GPT-class LLM, gradient boosting |
| Data sources | Links to [Data Asset Register](data-asset-register.md) |
| Personal data? | Triggers DPIA |
| Affects individuals? | Triggers oversight and transparency duties |
| Lifecycle stage | Ideation / dev / live / retired |
| Human oversight | How, and by whom |
| Documentation | Link to [Model Card / Model Risk Documentation](../risk/model-card.md) |
| Risk assessment | Link to [AI Risk Assessment](../risk/ai-risk-assessment.md) |
| Last / next review | |

### The inventory

| ID | System | Owner | Source | Role | Tier | Personal data | Stage | Next review |
|---|---|---|---|---|---|---|---|---|
| AI-001 | Demand forecasting | [name] | Build | Provider | Minimal | No | Live | [date] |
| AI-002 | Support summarisation | [name] | Buy (SaaS) | Deployer | Limited | Yes | Live | [date] |
| AI-003 | Credit decision support | [name] | Build | Provider | **High** | Yes | Live | [date] |
| AI-004 | CV screening | [name] | Buy | Deployer | **High** | Yes | Live | [date] |
| AI-005 | Marketing copy assistant | [name] | Embedded | Deployer | Limited | No | Live | [date] |

### Finding what you already have

Most organisations under-count on the first pass. Look in all of these:

| Where to look | What you tend to find |
|---|---|
| Ask each team directly | Tools bought on expenses or team cards |
| SaaS contracts and release notes | AI features switched on by the vendor |
| Expense claims | Individual AI subscriptions |
| Network / SSO logs | Tools nobody declared |
| Code repositories | Model APIs called directly |
| Data warehouse jobs | Scoring pipelines nobody calls "AI" |

!!! warning "Embedded AI is the blind spot"
    Your HR system, CRM, and helpdesk have almost certainly shipped AI
    features in the last two years. Some are high-risk uses under Annex III —
    CV screening especially. Nobody procured them as AI, so nobody assessed
    them.

### Classification decision record

For each system, record the classification decision itself:

| System | Tier | Rationale | Decided by | Date | Challenged? |
|---|---|---|---|---|---|
| AI-004 | High | Annex III(4) — employment; screens candidates | [committee] | [date] | No |

A classification without a rationale cannot be defended later, and cannot be
reviewed sensibly when the system changes.

### Maintenance

| Trigger | Action |
|---|---|
| New system proposed | Register at ideation, before build |
| Purpose changes materially | Re-classify; re-assess |
| Vendor changes the model | Review; re-assess if behaviour changed |
| <span class="gk-default" title="Most organisations' fastest-growing AI exposure is features switched on inside software they already licence. Nobody procured them as AI, so only a deliberate sweep finds them."><strong>Quarterly, including a review of vendor release notes</strong><span class="gk-default-unless">Unless: Monthly if you have a large SaaS estate or an active procurement pipeline.</span></span> | Full review; confirm owners still in post |
| Retirement | Mark retired; retain records per schedule |

---

## Adaptation notes

- **Small organisations:** A spreadsheet is fine. The fields that must not be dropped are owner, role, tier, and rationale — everything else can be added later.
- **Large / federated organisations:** Federate collection to business units with a group-level standard for tiering, or you will get four incompatible interpretations of high-risk.
- **Heavy vendor use:** Add contract reference and renewal date, and link to your vendor assessment under [Third-Party AI Risk Policy](../policies/third-party-ai-risk-policy.md).

## Related

- [AI Governance Framework](../frameworks/ai-governance-framework.md) — <span class="pill ready">Ready</span>
- [AI Risk Assessment](../risk/ai-risk-assessment.md) — <span class="pill ready">Ready</span>
- [Model Card / Model Risk Documentation](../risk/model-card.md) — <span class="pill ready">Ready</span>
- [Third-Party AI Risk Policy](../policies/third-party-ai-risk-policy.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
