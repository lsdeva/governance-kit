<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/examples.yml
     Regenerate with: python tools/build_content.py -->


# Board Pack — worked example

!!! info "A worked example, not a template"
    This shows Meridian Health Analytics — a fictional company — using the
    [Board Pack Template](../board/board-pack.md). To start your own,
    use the blank template. Details here are illustrative.

Meridian's Q2 2026 board report — the one written after the prohibited HR feature was found. It is deliberately an amber pack with a real ask.

---

---

## Data & AI Governance — Board Report

**Period:** Q2 2026 · **Prepared by:** P. Nakamura, Governance Lead ·
**Date:** 2026-07-08 · **Classification:** Confidential

### 1. Executive summary

**Overall posture:** 🟡 **Amber**

Our AI estate is now fully catalogued for the first time — thirteen systems,
against the five we believed we had in March. One system was found to
perform a practice **prohibited** under the EU AI Act and was disabled within
48 hours. Two systems are high-risk and both now have completed assessments.
The principal residual concern is that our highest-risk system, referral
triage, depends on human oversight that we have evidenced was not working as
designed and have since rebuilt.

**Decisions sought this session:**

1. Approve 0.5 FTE for a governance analyst — see section 7
2. Approve the December 2027 readiness plan and its £180k budget

### 2. Risk posture

| Risk | Rating | Movement | Owner | Commentary |
|---|---|---|---|---|
| Triage bias against interpreter-requiring patients | High (15→9) | ↓ | R. Okafor | Mandatory review in place; retraining required before expansion |
| Unassessed embedded AI in vendor products | High (16→8) | ↓ | P. Nakamura | Sweep complete; quarterly release-note review now standing |
| Human oversight not effective in practice | High (12→6) | ↓ | R. Okafor | Interface redesigned; override rate 0.4%→6.2% |
| Annex III readiness by Dec 2027 | Medium (9) | → | P. Nakamura | On track but dependent on the resource ask below |
| Vendor contracts lack AI clauses | Medium (9) | ↑ | A. Whitfield | 2 of 7 renegotiated; remainder at renewal |

**Appetite:** Within appetite, with the exception of vendor contractual
exposure, which is **outside** appetite until the four critical vendors are
renegotiated. Expected within appetite by Q4.

### 3. What changed this period

| Area | Change | Implication |
|---|---|---|
| AI estate | 13 systems catalogued (was 5 believed); 1 disabled | We now know what we operate |
| Regulation | Digital Omnibus deferred Annex III to Dec 2027 | 16 months more, not a reprieve |
| Policy | Acceptable AI Use Policy adopted; 91% attestation | Shadow AI reduced but not eliminated |
| Capability | Governance Lead appointed (Mar); no analyst support | The constraint behind decision 1 |

### 4. Incidents

| ID | Severity | Summary | Status | Reportable? | Lesson |
|---|---|---|---|---|---|
| INC-004 | **S1** | HR platform enabled workplace emotion inference in a vendor release | Closed | Assessed — not reportable; disabled before any employment decision relied on it | Vendor release notes now reviewed quarterly |
| INC-007 | S2 | Patient referral letter pasted into a public AI tool by a staff member | Closed | Yes — DPA notified | Self-reported within 2 hours; DLP rule added |
| INC-009 | S3 | Triage subgroup performance gap identified in testing | Closed | No | Subgroup metrics now mandatory pre-release |

!!! note "INC-007 was self-reported"
    The individual reported it themselves within two hours. Our policy
    treats self-reported mistakes far more leniently than concealed ones,
    and this is the behaviour we want. It was handled as a training matter,
    not a disciplinary one.

### 5. EU AI Act readiness

**Readiness: 68%** (27 of 40 assessed obligations met) — ↑ from 41% in Q1

| Area | Status | Gap | Action | By |
|---|---|---|---|---|
| Inventory & classification | 🟢 | — | — | — |
| Prohibited practices | 🟢 | — | Quarterly re-screen | Ongoing |
| Risk management | 🟡 | Assessments done; review cycle unproven | First annual review cycle | 2027-04 |
| Documentation | 🔴 | No Annex IV technical file for AI-001 | Draft with vendor support | 2026-11-30 |
| Human oversight | 🟢 | — | Monthly override reporting | Ongoing |
| Transparency | 🟡 | Contest route not staffed | Assign and publish | 2026-09-30 |
| Third-party | 🔴 | 5 of 7 vendor contracts lack AI clauses | Renegotiate at renewal | 2027-03-31 |
| AI literacy | 🟢 | 91% complete | Remaining 9% chased | 2026-08-31 |

**Next milestone:** 2 Dec 2026 — watermarking grace period ends for Art. 50.
**On track.**

### 6. Metrics

| Metric | Now | Last | Target | Trend |
|---|---|---|---|---|
| AI systems registered | 13/13 (100%) | 5/13 (38%) | 100% | ↑ |
| High-risk systems assessed | 2/2 (100%) | 0/2 | 100% | ↑ |
| Documentation complete | 0/2 (0%) | 0/2 | 100% | → |
| Staff trained (AI literacy) | 91% | 12% | 90% | ↑ |
| Open high risks | 2 | 5 | 0 | ↓ |
| Human override rate (AI-001) | 6.2% | 0.4% | 2–20% | ↑ |

### 7. Decisions sought

| # | Decision | Recommendation | Rationale | Impact if deferred |
|---|---|---|---|---|
| 1 | 0.5 FTE governance analyst | **Approve** | One person is running governance for 13 systems across 4 jurisdictions. Documentation is the red item and is a capacity problem, not a knowledge one. | Annex IV documentation slips past Q4; Dec 2027 readiness becomes at risk |
| 2 | £180k Dec 2027 readiness plan | **Approve** | Covers technical documentation, conformity assessment prep, and triage retraining | Conformity assessment capacity is finite; late engagement risks missing the deadline |

### 8. Appendices

A. Risk register extract · B. AI inventory (13 systems) ·
C. INC-004 incident report · D. Triage subgroup analysis

---

## What to take from this

- An amber pack with a specific ask beats a green pack with none. The board can only act on decisions you put in front of them.
- Lead with what changed and what you need, not with how busy you were.
- Report the uncomfortable numbers. The 0.4% override rate is the most credible thing in this pack.

[Use the blank Board Pack Template](../board/board-pack.md){ .md-button .md-button--primary }

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
