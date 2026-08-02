<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# Committee Charter (Terms of Reference)

<span class="pill ready">Ready</span>

<div class="gk-downloads" markdown>
[:material-file-word: Word](../downloads/committee-charter.docx){ .md-button .gk-dl download }
[:material-language-markdown: Markdown](../downloads/committee-charter.md.txt){ .md-button .gk-dl download="committee-charter.md" }
</div>

**Purpose.** Establishes the forum where governance decisions are actually made: its authority, membership, quorum, cadence, and what it must decide rather than merely discuss.

**When to use it.** When standing up the committee, then reviewed annually. Revisit if meetings routinely fail to reach decisions.

**How to use it.** Be specific about decision rights and quorum. The most common failure is a committee that discusses at length and decides nothing, because nobody established what it is empowered to settle on its own.

!!! tip "Closes assessment gaps"
    This template addresses **Q02**, **Q31**, **Q35** in the [readiness assessment](../assess/index.md).

---

## The template

### 1. Purpose

The **[Data & AI Governance Committee]** is the decision-making forum for
data and AI governance at **[Organisation]**, established under
[Governance Charter](../frameworks/governance-charter.md).

### 2. Authority

The committee is authorised to:

- Approve frameworks, policies, and standards within its scope.
- Approve or refuse deployment of **high-risk** AI systems.
- **Require remediation, or suspend a system**, where risk is unacceptable.
- Approve exceptions to policy, with expiry dates.
- Escalate to **[the Board / Audit & Risk Committee]**.

Matters reserved to the Board: **[risk appetite, charter changes, matters
above [threshold]]**.

### 3. Membership

| Role | Member | Voting? |
|---|---|---|
| Chair | [Exec sponsor] | Yes |
| Governance Lead | [name] | Yes |
| Data Owner representative | [name] | Yes |
| Technology / ML lead | [name] | Yes |
| Legal / DPO | [name] | Yes |
| Security | [name] | Yes |
| HR / People | [name] | Yes |
| Internal Audit | [name] | **No — observer** |

!!! note "Audit observes, never votes"
    If Internal Audit votes on a control, it cannot later provide independent
    assurance over that control. Keep the third line out of the decision.

### 4. Quorum & decisions

- **Quorum:** <span class="gk-default" title="Without a quorum rule, a committee eventually takes a significant decision with two people in the room, and that decision is the one a regulator asks about."><strong>Four voting members, and must include the chair (or a named delegate) and Legal/DPO</strong><span class="gk-default-unless">Unless: In organisations under about 150 staff, three including the chair. Never drop the requirement for a legal or data-protection voice on decisions about personal data.</span></span>.
- **Decisions:** by consensus where possible; otherwise a majority of voting
  members present. The Chair holds a casting vote.
- **Dissent is minuted.** A member who disagrees with a risk acceptance has
  it recorded by name.
- **Out of cycle:** urgent decisions by **[written procedure with 48h
  response]**, ratified at the next meeting.

### 5. Cadence & agenda

Meets <span class="gk-default" title="Monthly keeps decisions moving without the committee becoming the bottleneck. The failure mode is a quarterly committee that becomes the reason nothing ships for eleven weeks."><strong>Monthly</strong><span class="gk-default-unless">Unless: Quarterly is enough below roughly 150 staff with no high-risk systems. Fortnightly during an active remediation programme.</span></span>. Standing agenda:

1. Minutes and actions outstanding
2. New AI systems for classification or approval
3. Risk register — new, changed, and escalated items
4. Incidents since last meeting
5. Policy exceptions requested and expiring
6. Regulatory horizon (EU AI Act milestones)
7. Metrics — see [KPI / KRI Dashboard](../board/kpi-dashboard.md)
8. Decisions required
9. AOB

### 6. Papers

Circulated <span class="gk-default" title="Late papers are how a committee gets ambushed into approving something nobody read. Deferring late papers by default is the enforcement mechanism."><strong>Five working days</strong><span class="gk-default-unless">Unless: Three days for a committee meeting fortnightly or more often.</span></span> in advance. Papers arriving late are
deferred by default — otherwise deadlines get managed by ambushing the
committee.

### 7. Reporting

Reports to **[the Board]** <span class="gk-default" title="Quarterly matches most board cycles, so governance rides an existing meeting rather than competing for a new one. More often than that and you report noise; less often and a problem can run for half a year unseen."><strong>Quarterly</strong><span class="gk-default-unless">Unless: Move to monthly while any high-risk system is unassessed, or after a serious incident, until the position is stable again.</span></span> using [Board Pack Template](../board/board-pack.md). Minutes are
retained for <span class="gk-default" title="Art. 12 expects logs sufficient to trace behaviour over the system's lifetime. A challenge to a decision usually arrives months after it was made, so shorter retention means you cannot answer it."><strong>Six months minimum; twelve months for high-risk systems</strong><span class="gk-default-unless">Unless: Longer where your sector's record-keeping rules or your limitation period require it. Shorter is rarely defensible for a high-risk system.</span></span> as evidence of governance.

### 8. Review

| Version | Date | Approved by | Next review |
|---|---|---|---|
| 0.1 | [date] | [board] | [date] |

---

## Adaptation notes

- **Small organisations:** A standing 45-minute item on an existing leadership meeting, with real minutes, beats a separate committee that quietly stops meeting.
- **Regulated sectors:** Align composition and reporting lines with your existing risk committee structure, and check whether any member must be independent by rule.
- **Global organisations:** Consider regional sub-committees with a group committee for policy and escalation, and state clearly which decisions cannot be taken locally.

## Related

- [Governance Charter](../frameworks/governance-charter.md) — <span class="pill draft">Draft</span>
- [Decision Rights & Escalation](decision-rights.md) — <span class="pill ready">Ready</span>
- [RACI Matrix](raci.md) — <span class="pill ready">Ready</span>
- [Board Pack Template](../board/board-pack.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
