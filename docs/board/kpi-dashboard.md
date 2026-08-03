<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# KPI / KRI Dashboard

<div class="gk-dochead" markdown>
<span class="gk-dochead-meta" markdown>
<span class="pill ready">Ready</span>
</span>
<span class="gk-dochead-dl" markdown>
[:material-file-word: Word](../downloads/kpi-dashboard.docx){ .md-button .gk-dl download } [:material-file-excel: Excel](../downloads/kpi-dashboard.xlsx){ .md-button .gk-dl download } [:material-language-markdown: Markdown](../downloads/kpi-dashboard.md.txt){ .md-button .gk-dl download="kpi-dashboard.md" }
</span>
</div>

**Purpose.** The measures that show whether governance is actually working — coverage, quality, timeliness, and leading indicators of trouble — rather than how much documentation exists.

**When to use it.** Report every cycle. Review the metric set annually and drop anything that has never changed a decision.

**How to use it.** Choose eight to twelve measures maximum and hold them stable, because trend is the point. Distinguish KPIs (is it working?) from KRIs (is something about to go wrong?) — most dashboards have far too few of the latter.

!!! tip "Closes assessment gaps"
    This template addresses **Q18**, **Q28**, **Q36**, **Q37** in the [readiness assessment](../assess/index.md).

---

## Fill it in here

Work directly in the browser — nothing is uploaded, and your rows are saved on this device. Download to Excel whenever you want, or save a file you can reopen later.

<div class="gk-reg-host" data-register="kpi-dashboard" data-src="../../assess/register-data.json"><p class="gk-muted">Loading the editable register…</p></div>

---

## The template

### Coverage KPIs

Are we governing everything we should be?

| Metric | Definition | Target | Source |
|---|---|---|---|
| AI systems registered | Registered ÷ known to exist | 100% | [AI System Inventory](../registers/ai-system-inventory.md) |
| Systems classified | With recorded tier and rationale | 100% | Inventory |
| High-risk assessed | With current [AI Risk Assessment](../risk/ai-risk-assessment.md) | 100% | Assessments |
| Documentation complete | High-risk with current [Model Card / Model Risk Documentation](../risk/model-card.md) | 100% | Model cards |
| Data assets registered | Material assets registered | [90%] | [Data Asset Register](../registers/data-asset-register.md) |
| Vendors assessed | Critical AI vendors with current assessment | 100% | Vendor register |

### Effectiveness KPIs

Is it working, rather than merely present?

| Metric | Definition | Target | Why |
|---|---|---|---|
| Assessment cycle time | Intake to decision, median days | <span class="gk-default" title="This is the metric that decides whether people route around you. Slow governance produces shadow AI, which is a worse risk than the one you were managing."><strong>A median of 10 working days from intake to decision</strong><span class="gk-default-unless">Unless: 20 days for high-risk systems, which genuinely need a fuller assessment — but publish the longer target rather than quietly missing the shorter one.</span></span> | Slow governance gets bypassed |
| Gate pass rate first time | % passing without rework | <span class="gk-default" title="A very high pass rate suggests the gate is not testing anything. A very low one suggests the requirements were never communicated. Around 70% is the band where the gate is doing real work."><strong>70%</strong><span class="gk-default-unless">Unless: Expect lower in the first two quarters while teams learn what is expected. Persistently below 50% means your standards are unclear, not that your teams are careless.</span></span> | Low means unclear standards |
| Data quality score | Weighted across key domains | [> 95%] | [Data Quality Standard](../policies/data-quality-standard.md) |
| AI literacy completion | Relevant staff trained | [> 90%] | Art. 4 obligation |
| Control tests passed | Tested controls operating effectively | [> 95%] | [Control Library & Assurance Map](../risk/control-library.md) |

### Risk indicators (KRIs)

Leading signals that something is going wrong.

| Indicator | Threshold | Why it matters |
|---|---|---|
| Unregistered systems found | Any | Governance is being bypassed |
| Overdue high-risk reviews | > 0 | Assessments going stale |
| Open high/critical risks past target | > 0 | Treatment is not landing |
| Exceptions open beyond expiry | > 0 | Silent policy erosion |
| **Human override rate** | <span class="gk-default" title="Below 2% the reviewer is almost certainly approving by default, which is the most common way Art. 14 human oversight fails in practice. Above 20% the model is not fit for the decision it is being used for."><strong>Between 2% and 20%</strong><span class="gk-default-unless">Unless: Judge it per system rather than globally. What matters is that the rate is monitored and explicable, not that it sits in any particular band.</span></span> | Too low = rubber-stamping; too high = model not fit |
| Model drift alerts | Any unresolved | Performance degrading |
| Incidents detected externally | Any | Monitoring is not working |
| Mean time to detect | Increasing | Detection is degrading |

!!! tip "Override rate is the single best oversight metric"
    It is one of the few numbers that reveals whether human oversight is real.
    A rate near zero almost always means reviewers are approving by default,
    not that the model is perfect.

### Presentation

| Element | Guidance |
|---|---|
| RAG status | Define thresholds once and keep them fixed |
| Trend arrows | Direction matters more than level |
| Sparklines | Show the last 4–6 periods |
| Commentary | One line per amber or red, naming the action and owner |

### Dashboard summary

| Metric | Now | Last | Trend | Target | RAG | Commentary |
|---|---|---|---|---|---|---|
| AI systems registered | | | | 100% | | |
| High-risk assessed | | | | 100% | | |
| Documentation complete | | | | 100% | | |
| AI literacy | | | | 90% | | |
| Open high risks | | | | 0 | | |
| Override rate | | | | 2–20% | | |

### Metrics to avoid

| Avoid | Why | Use instead |
|---|---|---|
| Policies published | Measures activity, not effect | Attestation and exception rates |
| Training hours delivered | Time is not competence | Assessment pass rates |
| Number of meetings | Effort, not outcome | Decisions made and actions closed |
| Total AI systems | Growth is not risk | Systems by tier, unassessed count |

---

## Adaptation notes

- **Small organisations:** Six metrics is plenty: registered, assessed, documented, trained, open high risks, and override rate.
- **Early-stage programmes:** Coverage metrics first — you cannot measure effectiveness of controls you have not yet applied everywhere. Expect coverage to look bad initially; that is the honest baseline.
- **Mature programmes:** Shift emphasis to KRIs and control-testing results. Coverage at 100% for four quarters running has stopped telling you anything.

## Related

- [Board Pack Template](board-pack.md) — <span class="pill ready">Ready</span>
- [Control Library & Assurance Map](../risk/control-library.md) — <span class="pill ready">Ready</span>
- [Maturity Assessment](../frameworks/maturity-assessment.md) — <span class="pill ready">Ready</span>
- [Risk Register](../registers/risk-register.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
