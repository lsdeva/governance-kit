<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# Board Pack Template

<span class="pill ready">Ready</span>

<div class="gk-downloads" markdown>
[:material-file-word: Word](../downloads/board-pack.docx){ .md-button .gk-dl download }
[:material-language-markdown: Markdown](../downloads/board-pack.md.txt){ .md-button .gk-dl download="board-pack.md" }
</div>

!!! example "See this filled in"
    A [worked example](../examples/board-pack.md) shows this
    template completed for a fictional mid-size company.

**Purpose.** A structured report that gives the board what it needs to discharge its oversight duty: current posture, what changed, what went wrong, and what decisions are being asked of them.

**When to use it.** Every board or risk committee cycle — typically quarterly. Also for an extraordinary session after a serious incident.

**How to use it.** Write the first page so it stands alone; assume it is the only page some members read. Lead with decisions being sought, not with activity completed. Boards do not need to know how busy you were.

!!! tip "Closes assessment gaps"
    This template addresses **Q02**, **Q29**, **Q36**, **Q37** in the [readiness assessment](../assess/index.md).

---

## The template

---

## Data & AI Governance — Board Report

**Period:** [Q_ 20__] · **Prepared by:** [name] · **Date:** [date] ·
**Classification:** [Confidential]

### 1. Executive summary

**Overall posture:** 🟢 Green / 🟡 Amber / 🔴 Red

[Three or four sentences. Where we stand, the single most important thing
that changed, and the most important thing the board should worry about.]

**Decisions sought this session:**

1. [Decision] — see section 7
2. [Decision]

### 2. Risk posture

| Risk | Rating | Movement | Owner | Commentary |
|---|---|---|---|---|
| [Top risk] | High | ↑ | [name] | [one line] |
| [Risk] | Medium | → | [name] | |
| [Risk] | Medium | ↓ | [name] | |

**Appetite:** [within / outside] appetite. [If outside: what is being done,
and by when.]

### 3. What changed this period

| Area | Change | Implication |
|---|---|---|
| AI estate | [X new systems; Y retired] | |
| Regulation | [milestones reached or approaching] | |
| Policy | [adopted or revised] | |
| Capability | [people, tooling, training] | |

### 4. Incidents

| ID | Severity | Summary | Status | Reportable? | Lesson |
|---|---|---|---|---|---|
| INC-00X | S2 | [one line] | Closed | No | [what changed] |

[If none: "No S1 or S2 incidents this period." Say it explicitly — silence
reads as an omission.]

### 5. EU AI Act readiness

**Readiness: [X]%** ([n] of [m] obligations met) — [↑ from Y% last period]

| Area | Status | Gap | Action | By |
|---|---|---|---|---|
| Inventory & classification | 🟢 | — | — | — |
| Risk management | 🟡 | [gap] | [action] | [date] |
| Documentation | 🔴 | [gap] | [action] | [date] |
| Transparency | 🟡 | [gap] | [action] | [date] |

**Next milestone:** [date] — [obligation]. **[On / off] track.**

### 6. Metrics

| Metric | Now | Last | Target | Trend |
|---|---|---|---|---|
| AI systems registered | | | 100% | |
| High-risk systems assessed | | | 100% | |
| Documentation complete | | | 100% | |
| Staff trained (AI literacy) | | | [90%] | |
| Open high risks | | | <span class="gk-default" title="This is one of the few metrics where the target is genuinely zero. A non-zero number is not a performance issue — it means a decision has quietly expired."><strong>Zero</strong><span class="gk-default-unless">Unless: Nothing. A risk past its own remediation date is either being treated or should be formally re-accepted with a new date and a named acceptor.</span></span> | |

Full detail in [KPI / KRI Dashboard](kpi-dashboard.md).

### 7. Decisions sought

| # | Decision | Recommendation | Rationale | Impact if deferred |
|---|---|---|---|---|
| 1 | [e.g. approve additional resource] | Approve | [why] | [consequence] |

### 8. Appendices

A. Risk register extract · B. AI inventory summary ·
C. Regulatory horizon · D. Incident detail

---

!!! tip "Two tests before you send it"
    **The one-page test:** does page one alone tell a director what to worry
    about and what to decide?
    **The "so what" test:** every number should imply an action. If a metric
    implies nothing, cut it.

---

## Adaptation notes

- **Small organisations:** Sections 1, 2, 4, and 7 are enough. Two pages that get read beat eight that get skimmed.
- **Regulated sectors:** Add a supervisory engagement section — open queries, commitments made, deadlines — and align RAG definitions with your enterprise risk framework.
- **First report to a board:** Spend a paragraph on what AI governance is and why the board is accountable. Do not assume the mandate is understood; establishing it is half the value of the first pack.
- **Using the assessment tool:** Run the assessment with the Board audience selected and export it — it produces section 5 and much of section 2 directly.

## Related

- [KPI / KRI Dashboard](kpi-dashboard.md) — <span class="pill ready">Ready</span>
- [Risk Register](../registers/risk-register.md) — <span class="pill ready">Ready</span>
- [Committee Charter (Terms of Reference)](../operating-model/committee-charter.md) — <span class="pill ready">Ready</span>
- [Maturity Assessment](../frameworks/maturity-assessment.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
