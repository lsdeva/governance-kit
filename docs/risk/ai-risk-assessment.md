<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# AI Risk Assessment

<span class="pill ready">Ready</span>

<div class="gk-downloads" markdown>
[:material-file-word: Word](../downloads/ai-risk-assessment.docx){ .md-button .gk-dl download }
[:material-file-excel: Excel](../downloads/ai-risk-assessment.xlsx){ .md-button .gk-dl download }
[:material-language-markdown: Markdown](../downloads/ai-risk-assessment.md.txt){ .md-button .gk-dl download="ai-risk-assessment.md" }
</div>

!!! example "See this filled in"
    A [worked example](../examples/ai-risk-assessment.md) shows this
    template completed for a fictional mid-size company.

**Purpose.** A structured assessment of what could go wrong with a specific AI system, how bad it would be, and what you are doing about it. For high-risk systems it is the core evidence that Art. 9 risk management is operating.

**When to use it.** Before development for high-risk systems, before deployment for all systems, and again on material change. Review live high-risk systems at least annually.

**How to use it.** Do it with the people who build and use the system, not about them. Assess risk to the people affected first and to the organisation second — that ordering is what the regulation expects, and it also surfaces the risks that later become reputational ones.

!!! tip "Closes assessment gaps"
    This template addresses **Q06**, **Q09**, **Q11**, **Q15**, **Q24**, **Q29**, **Q38** in the [readiness assessment](../assess/index.md).

---

## Fill it in here

Work directly in the browser — nothing is uploaded, and your rows are saved on this device. Download to Excel whenever you want, or save a file you can reopen later.

<div class="gk-reg-host" data-register="ai-risk-assessment" data-src="../../assess/register-data.json"><p class="gk-muted">Loading the editable register…</p></div>

---

## The template

### System under assessment

| Field | Value |
|---|---|
| System ID / name | [AI-00X] |
| Accountable owner | [name] |
| Purpose | [what it does and what decisions it drives] |
| Risk tier | [prohibited / high / limited / minimal] |
| Affects individuals? | [yes / no — how] |
| Assessment date / assessor | [date] / [name] |

### 1. Prohibited practice screen

Answer first. Any "yes" stops the assessment.

- [ ] Deploys subliminal, manipulative, or exploitative techniques
- [ ] Exploits vulnerability by age, disability, or social/economic situation
- [ ] Performs social scoring leading to unjustified detrimental treatment
- [ ] Predicts criminal offending based solely on profiling or personality
- [ ] Builds facial recognition databases by untargeted scraping
- [ ] Infers emotion in the workplace or in education
- [ ] Performs biometric categorisation to infer protected characteristics
- [ ] Performs real-time remote biometric identification in public spaces

**Any box ticked → do not proceed. Escalate immediately.**

### 2. Harms assessment

Assess harm **to people** first.

| Harm type | Could it occur? | Who is affected? | Severity | Likelihood | Rating |
|---|---|---|---|---|---|
| Discrimination / unfair outcome | | | | | |
| Loss of opportunity (job, credit, service) | | | | | |
| Financial loss | | | | | |
| Physical or psychological harm | | | | | |
| Privacy intrusion | | | | | |
| Loss of autonomy or ability to contest | | | | | |
| Misinformation | | | | | |
| Exclusion of a group | | | | | |

Then to the organisation: regulatory, financial, reputational, operational.

!!! tip "Ask who is worst affected, not who is average"
    Aggregate accuracy hides concentrated harm. A system that is 95% accurate
    overall can be systematically wrong about one group — and that group is
    who will be harmed, and who will complain.

### 3. Technical risk

| Area | Question | Assessment | Mitigation |
|---|---|---|---|
| Data quality | Is training data relevant, representative, current? | | |
| Bias | Have you tested performance across subgroups? | | |
| Accuracy | Does it meet the declared threshold? Where does it fail? | | |
| Robustness | How does it behave on edge cases and adversarial input? | | |
| Drift | How would you detect degradation? | | |
| Explainability | Can you explain a decision to the person affected? | | |
| Security | Injection, poisoning, extraction, leakage through output? | | |
| Dependencies | What happens if the vendor or model changes? | | |

### 4. Human oversight

| Question | Answer |
|---|---|
| Who reviews the output? | [named role] |
| What information do they see? | |
| Can they realistically override? How? | |
| How long do they have per decision? | |
| How would we know if they were rubber-stamping? | |
| What training have they had? | |

!!! warning "The rubber-stamp test"
    If a reviewer handles hundreds of decisions an hour, or overrides almost
    never, oversight is nominal. Measure override rates — a rate near zero is
    a warning sign, not a success metric.

### 5. Transparency

- [ ] People are told they are interacting with, or subject to, AI
- [ ] AI-generated content is marked where required
- [ ] Affected people can obtain an explanation
- [ ] **There is a route to contest a decision**, and someone staffs it

### 6. Residual risk and decision

| Residual rating | Justification | Accepted by | Authority | Date |
|---|---|---|---|---|
| [low/med/high/critical] | | [name] | Per [Decision Rights & Escalation](../operating-model/decision-rights.md) | [date] |

**Decision:** Proceed · Proceed with conditions · Do not proceed

Conditions: **[list, with owners and dates]**

### 7. Review

| Trigger | Action |
|---|---|
| Material change of purpose or data | Full reassessment |
| Incident involving this system | Targeted reassessment |
| Annually (high-risk) | Full review |
| Vendor model change | Targeted reassessment |

---

## Adaptation notes

- **Small organisations:** Sections 1, 2, and 4 are the irreducible core: is it allowed, who could it hurt, and who is watching. That fits on two pages.
- **Regulated financial services:** Align with model risk management: add model validation findings, and treat this as a complement to, not a replacement for, independent validation.
- **Where a DPIA is also required:** Run them together and cross-reference. Section 2 harms feed the DPIA's risks-to-individuals directly — see [Processing & DPIA Log](../registers/processing-dpia-log.md).
- **Research and experimentation:** Apply a shortened version at experiment stage, and the full assessment before anything touches real users or real decisions.

## Related

- [AI System Inventory](../registers/ai-system-inventory.md) — <span class="pill ready">Ready</span>
- [Model Card / Model Risk Documentation](model-card.md) — <span class="pill ready">Ready</span>
- [Risk Register](../registers/risk-register.md) — <span class="pill ready">Ready</span>
- [Processing & DPIA Log](../registers/processing-dpia-log.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
