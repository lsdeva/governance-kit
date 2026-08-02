<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/examples.yml
     Regenerate with: python tools/build_content.py -->


# AI Risk Assessment — worked example

!!! info "A worked example, not a template"
    This shows Meridian Health Analytics — a fictional company — using the
    [AI Risk Assessment](../risk/ai-risk-assessment.md). To start your own,
    use the blank template. Details here are illustrative.

The assessment for AI-001, Meridian's referral triage tool. It is the hardest of their systems: clinically useful, genuinely high-risk, and with an oversight arrangement that looked fine on paper and was not.

---

### System under assessment

| Field | Value |
|---|---|
| System ID / name | AI-001 — Referral triage prioritisation |
| Accountable owner | R. Okafor, Clinical Director |
| Purpose | Scores inbound referrals for clinical urgency and orders the review queue |
| Risk tier | **High-risk** — Annex III(5)(a) |
| Affects individuals? | Yes — determines the order in which patients are assessed |
| Assessment date / assessor | 2026-04-18 / P. Nakamura (Governance Lead) |

### 1. Prohibited practice screen

All eight screened. **No prohibited practice identified.** Screening record
filed 2026-04-18, countersigned by Legal.

### 2. Harms assessment

| Harm type | Could it occur? | Who is affected? | Severity | Likelihood | Rating |
|---|---|---|---|---|---|
| Discrimination / unfair outcome | **Yes** | Patients whose presentations are under-represented in training data | 5 | 3 | **15** |
| Loss of opportunity | **Yes** | Patients de-prioritised in error — delayed treatment | 5 | 2 | **10** |
| Physical or psychological harm | **Yes** | Patients whose deterioration is not caught by the ranking | 5 | 2 | **10** |
| Privacy intrusion | Possibly | Patients — health data processed at scale | 3 | 2 | 6 |
| Loss of autonomy / ability to contest | **Yes** | Patients unaware their referral was ranked | 3 | 4 | **12** |
| Exclusion of a group | **Yes** | Non-English-speaking patients — referral letters are free text | 4 | 3 | **12** |

!!! warning "The finding that mattered"
    Subgroup testing showed the model performed **11 percentage points
    worse** on referral letters written for patients requiring interpreters,
    because those letters are shorter and use different phrasing. Aggregate
    accuracy was 94%; for that group it was 83%. **The aggregate number had
    hidden it for four months.**

### 3. Technical risk

| Area | Assessment | Mitigation |
|---|---|---|
| Data quality | Training data covers 2021–2025, one region only | Flagged: expand to all regions before wider rollout |
| Bias | 11pp gap for interpreter-requiring referrals | Mitigating: re-weighting + mandatory human review for that cohort |
| Accuracy | 94% aggregate against clinician ranking | Declared; monitored monthly |
| Robustness | Degrades on referrals under 40 words | Threshold rule: short referrals bypass scoring |
| Drift | Referral language changed after a 2025 template update | Monthly distribution monitoring added |
| Explainability | Feature contributions available per referral | Surfaced to coordinators from v2.1 |
| Security | Prompt injection not applicable; access controlled | Standard controls |

### 4. Human oversight

| Question | Answer |
|---|---|
| Who reviews the output? | Referral coordinator (band 5), before the queue is worked |
| What information do they see? | Rank, score, top three contributing factors, and a low-confidence flag |
| Can they realistically override? | Yes — drag to reorder, reason required |
| How long do they have per decision? | ~25 seconds per referral; ~180 referrals per shift |
| How would we know if they were rubber-stamping? | Override rate is monitored |
| What training have they had? | Two-hour session; refresher annually |

!!! danger "Oversight was failing in practice"
    The **override rate was 0.4%** — roughly one referral per coordinator
    per shift. Interviews found coordinators believed they needed a clinical
    reason to override and did not feel qualified to second-guess the score.
    Oversight existed in the interface and not in reality.

    **Action taken:** the interface now shows the score *after* the
    coordinator forms an initial view, low-confidence referrals are
    presented unranked, and the override rate is reported to the committee
    monthly. It rose to 6.2% over the following quarter.

### 5. Transparency

- [x] Patients are informed that referrals are prioritised with algorithmic support — added to the referral acknowledgement letter
- [x] Clinicians are told when they are viewing a ranked queue
- [ ] **Route to contest a ranking is documented but not yet staffed** — open action, owner R. Okafor, due 2026-09-30
- [x] Explanation available on request

### 6. Residual risk and decision

| Residual rating | Justification | Accepted by | Authority | Date |
|---|---|---|---|---|
| **Medium (9)** | Bias gap mitigated by mandatory review for the affected cohort; oversight redesigned and evidenced; contest route outstanding | Governance Committee | Per decision rights — high-risk deployment | 2026-05-14 |

**Decision: Proceed with conditions.**

1. Mandatory human review for all interpreter-flagged referrals — **in place**
2. Monthly subgroup performance reporting to committee — **in place**
3. Contest route staffed and published — **due 2026-09-30, open**
4. Retrain on multi-region data before any expansion — **blocking condition**

---

## What to take from this

- Aggregate accuracy hides concentrated harm. Meridian's 94% looked fine until someone tested the subgroups.
- A 0.4% override rate is not a sign the model is excellent. Measure it, and treat a very low number as a red flag.
- "Proceed with conditions" is a legitimate outcome — provided the conditions have owners and dates, and someone chases them.

[Use the blank AI Risk Assessment](../risk/ai-risk-assessment.md){ .md-button .md-button--primary }

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
