<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# Decision Rights & Escalation

<span class="pill ready">Ready</span>

<div class="gk-downloads" markdown>
[:material-file-word: Word](../downloads/decision-rights.docx){ .md-button .gk-dl download }
[:material-language-markdown: Markdown](../downloads/decision-rights.md.txt){ .md-button .gk-dl download="decision-rights.md" }
</div>

**Purpose.** States who can decide what, at what threshold, and what happens when people disagree or a decision is needed urgently. It is the document that stops governance stalling.

**When to use it.** With the operating model. Test it after the first real escalation, and again after the first urgent out-of-hours decision.

**How to use it.** Set thresholds in concrete terms — money, number of people affected, data classification — not adjectives like "significant". Then walk a real past decision through it and see whether the answer it gives matches what actually happened.

!!! tip "Closes assessment gaps"
    This template addresses **Q10**, **Q15**, **Q31** in the [readiness assessment](../assess/index.md).

---

## The template

### 1. Decision authority

| Decision | Authority | Consult | Escalate if |
|---|---|---|---|
| Deploy a **minimal-risk** AI system | AI Accountable Owner | Gov Lead | Classification is disputed |
| Deploy a **limited-risk** AI system | Gov Lead | Legal, Security | Customer-facing |
| Deploy a **high-risk** AI system | **Committee** | Legal, Security, Audit | Board threshold met |
| Approve a **prohibited-practice** exception | **Not available** | — | Prohibited means prohibited |
| Use personal data for training | Data Owner + DPO | Gov Lead | Special category data |
| Accept residual risk — low / medium | AI Accountable Owner | Gov Lead | — |
| Accept residual risk — high | **Committee** | Legal, Security | <span class="gk-default" title="Below High, an accountable owner accepting risk is proportionate and fast. At High and above the consequence is organisational, so the acceptance should be too — and it should be minuted with a name against it."><strong>A residual rating of 10 or above on a 5x5 scale (High and Critical)</strong><span class="gk-default-unless">Unless: Align to your enterprise risk framework's own escalation point if you have one, so the same risk does not get two different treatments.</span></span> |
| Accept residual risk — critical | **Board** | Committee | — |
| Approve a new AI vendor | Gov Lead | Security, Legal | Critical tier |
| Policy exception ≤ <span class="gk-default" title="An exception with no expiry is a silent policy change. Ninety days is long enough to fix the underlying problem and short enough that nobody forgets it exists."><strong>90 days</strong><span class="gk-default-unless">Unless: 30 days where the exception touches a high-risk system or personal data. Never grant one without an expiry date.</span></span> | Gov Lead | Owner | Repeat request |
| Policy exception > <span class="gk-default" title="An exception with no expiry is a silent policy change. Ninety days is long enough to fix the underlying problem and short enough that nobody forgets it exists."><strong>90 days</strong><span class="gk-default-unless">Unless: 30 days where the exception touches a high-risk system or personal data. Never grant one without an expiry date.</span></span> | **Committee** | Legal | — |
| **Suspend a live AI system** | AI Owner, Gov Lead, **or** Security | Notify Committee within 24 hours | Always report |

!!! danger "Suspension must be fast and blameless"
    Any of three roles can stop a system, and none of them needs permission
    first. If stopping a system requires a committee meeting, it will not
    happen in time. Notification comes after the stop, never before.

### 2. Escalation thresholds

Escalate to the **Committee** when any is true:

- Risk is rated **high** or above after mitigation.
- Personal data of <span class="gk-default" title="A round number people remember beats a precise one they look up. The special-category carve-out matters more than the count: a handful of health records can be graver than ten thousand email addresses."><strong>10,000 people, or any amount of special category data</strong><span class="gk-default-unless">Unless: Lower it to match your own breach-notification threshold if you already have one — running two different numbers guarantees the wrong one gets used.</span></span>
- The system makes or materially informs decisions about individuals.
- Two functions disagree and cannot resolve it within <span class="gk-default" title="Slow approval produces shadow AI, which is worse than the risk you were managing. Publishing the turnaround is what makes people willing to ask."><strong>Five working days</strong><span class="gk-default-unless">Unless: Ten days where the tool will process personal data and needs a DPIA.</span></span>.
- An exception is requested for the second time.

Escalate to the **Board** when any is true:

- Residual risk is **critical**.
- Regulatory notification is likely or required.
- Potential impact exceeds **[£X]** or affects **[X]** customers.
- Reputational exposure is material.

### 3. Disagreement

1. **Resolve locally** — the two parties, within 5 working days.
2. **Governance Lead facilitates** — within 5 further days.
3. **Committee decides** — at the next meeting, or by written procedure.
4. **Board** — where the committee cannot agree or the threshold is met.

The dissenting position is **recorded in the minutes by name**. People are far
more willing to raise concerns when disagreement is documented rather than
absorbed.

### 4. Urgent decisions

| Situation | Who can act | Ratification |
|---|---|---|
| Live incident, harm occurring | Any of AI Owner / Gov Lead / Security — **act first** | <span class="gk-default" title="Someone has already acted without permission — correctly, because the alternative was waiting during an incident. Ratifying quickly is what keeps that emergency power legitimate rather than habitual."><strong>Within 48 hours</strong><span class="gk-default-unless">Unless: Next working day if the decision suspended a live customer-facing system.</span></span> |
| Regulatory deadline | Gov Lead + Legal | Next meeting |
| Out of hours | **[on-call role]** | Next working day |

### 5. Recording

Every decision at committee level or above records: decision, date, who
decided, rationale, dissent, and review date. This is the evidence trail a
regulator asks for.

### 6. Review

Test annually against real decisions taken. If people routinely go around the
matrix, the matrix is wrong — fix the matrix, not the people.

---

## Adaptation notes

- **Small organisations:** Two levels are enough — an operational decision-maker and an escalation point. Keep the suspension right distributed regardless of size.
- **Regulated sectors:** Align thresholds with existing risk acceptance limits so you do not run two incompatible sets of numbers.
- **Fast-moving product teams:** Set generous authority at the minimal and limited tiers so governance is not the bottleneck, and spend the control effort on high-risk instead.

## Related

- [RACI Matrix](raci.md) — <span class="pill ready">Ready</span>
- [Committee Charter (Terms of Reference)](committee-charter.md) — <span class="pill ready">Ready</span>
- [Roles & Responsibilities](roles-responsibilities.md) — <span class="pill ready">Ready</span>
- [Risk Register](../registers/risk-register.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
