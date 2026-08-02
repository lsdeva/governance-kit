<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/benchmarks.yml
     Regenerate with: python tools/build_content.py -->


# How the scoring works

<span class="gk-meta">Method v1.0</span> &nbsp;·&nbsp; <span class="gk-meta">Last reviewed <strong>2026-08-02</strong></span>

!!! warning "These thresholds are editorial judgement, not benchmarks"
    They are **not** derived from a survey, a peer dataset, or any
    published study, and they are not a certification standard.

    This kit deliberately holds **no peer-comparison data**. Real
    benchmarks would need a population of real assessments, which
    would mean collecting your answers on a server — breaking the
    guarantee that nothing leaves your browser. Inventing
    plausible-looking peer percentages would be worse: a governance kit
    that fabricates its own evidence base has no business telling you
    to evidence your controls.

## What the score measures

Scores are a weighted coverage measure: the proportion of applicable obligation weight you have in place, where a partial counts half and "not applicable" is excluded entirely.

```
score = sum(weight x factor) / sum(weight) x 100, over answered questions, where factor is 1.0 for yes, 0.5 for partial, 0 for no. Questions marked not applicable are removed from BOTH the numerator and the denominator, so they neither help nor harm the result.
```

| | |
|---|---|
| **It is** | A structured, repeatable way to see which obligations you can evidence today, weighted so that a missing inventory counts for more than a missing metric. |
| **It is not** | A compliance score, a certification, a legal opinion, or a comparison against other organisations. A high score means you answered yes to questions you selected; it does not mean a regulator would agree. |

## The bands, and why they sit there

| Score | Band | Why this threshold |
|---|---|---|
| **90–100** | Advanced | Above 90% you are answering yes to nearly everything including the assurance and measurement questions, which are the ones organisations reach last. The remaining work is keeping it true rather than making it true. |
| **70+** | Established | 70% is roughly the point where the core obligations — inventory, classification, risk assessment, accountability — are all in place and what remains is documentation and evidence. Set here because coverage of the basics matters more than breadth. |
| **40+** | Developing | Below 40% it is statistically difficult to have the high-weight items covered, since the five-weight questions alone account for a large share of the total. Above it, foundations exist but unevenly. |
| **0+** | Early | Anything below 40% means several critical-severity obligations are missing. The advice at this band deliberately names inventory and prohibited-practice screening, because those two block everything else. |

## What the weights mean

Every question carries a weight of 1–5 reflecting the consequence of its absence. This is why a missing inventory moves the score more than a missing metric.

| Weight | Meaning | Questions |
|---|---|---|
| **5 — Critical** | Regulatory or board-level exposure. Absence is directly enforceable, or makes every other obligation impossible to satisfy. Prohibited practices, inventory, classification, DPIA, employment-related AI. | 10 |
| **4 — High** | A material control gap. Not immediately enforceable on its own, but it is what an auditor or regulator asks for second. | 18 |
| **3 — Medium** | Important and usually time-bound — needed before a deadline, but not the first thing to fix. | 11 |
| **2 — Good practice** | Expected of a mature programme; its absence is a finding, not a breach. | 1 |
| **1 — Hygiene** | Worth doing, low consequence if missing. | 0 |

The weights live in `data/questions.yml`. If you disagree with the emphasis for your sector, fork the repository and change them — that is what an open licence is for.

## Limitations you should know about

The report is meant to be presentable to a board, and a board should know what it is reading.

**It is self-assessed and unverified.** Nobody checks your answers. Two people in the same organisation will often score it differently — which is itself useful information, but it means the number is a conversation starter, not a measurement.

**Coverage is not effectiveness.** Answering yes means a control exists. It does not mean it works. A documented human-oversight process with a 0.4% override rate scores the same as one that genuinely catches errors.

**The weights are a judgement, not a calculation.** They reflect a reading of where regulatory and practical consequence falls. Your sector may weight them differently, and you are free to disagree — the weights are in data/questions.yml and you can fork and change them.

**There is no peer comparison, deliberately.** Producing real benchmark data would mean collecting users' answers centrally. This kit does not do that, so it cannot tell you how you compare to others — only how you compare to yourself over time.

**Your role selection shapes the score.** Different roles see different questions, so a Legal score and an ML score are not comparable to each other. Compare like with like: same roles, different dates.

## Compare against yourself, not against strangers

Save a snapshot each time you assess. The report then shows movement, which is the thing a board actually asks about and the thing you can defend — "we were at 41% in March and 68% now, here is what changed" is a stronger story than any percentile.

**How often:** Quarterly is enough for most organisations; monthly only if you are in active remediation. Re-assess after any material change to your AI estate.

- Keep the same roles selected between snapshots, or the comparison is meaningless.
- Expect the score to DROP the first time someone honest re-scores it. That is the baseline correcting, not a regression.
- Movement in the critical-weight questions matters more than the headline number.

!!! tip "Snapshots are built in"
    The [assessment](assess/index.md) saves a
    dated snapshot each time you ask it to, and the report shows your
    movement between them. Snapshots stay in your browser like
    everything else — export them if you want to keep them.

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
