<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# EU AI Act — 25-point readiness checklist

<div class="gk-dochead" markdown>
<span class="gk-dochead-meta" markdown>
<span class="pill ready">Ready</span> <span class="gk-meta">v1.2</span> <span class="gk-meta">Reviewed 2026-08-03</span>
</span>
<span class="gk-dochead-dl" markdown>
[:material-file-word: Word](../downloads/eu-ai-act-readiness-checklist.docx){ .md-button .gk-dl download } [:material-language-markdown: Markdown](../downloads/eu-ai-act-readiness-checklist.md.txt){ .md-button .gk-dl download="eu-ai-act-readiness-checklist.md" }
</span>
</div>

**Purpose.** A fast self-assessment of where your organisation stands against the EU AI Act. Work through it, mark what is true today, and treat every unticked box as a backlog item.

**When to use it.** As a first baseline, then quarterly, and again whenever you launch or materially change an AI system.

**How to use it.** Answer honestly rather than optimistically — an inflated baseline produces a plan that fixes the wrong things. Each item names the templates that close it. For a scored version tailored to your role, take the interactive assessment.

---

## The template

This checklist is generated from the same question bank as the [interactive assessment](../assess/index.md), so the two can never disagree.

**Tick the boxes as you go** — your progress is saved in this browser and nothing is uploaded.

<div id="gk-checklist" class="gk-cl"></div>

### Inventory

- [ ] **3.** We know which role we play for each system — provider, deployer, importer, or distributor.
    <br><small>Build it yourself and put your name on it, you are likely a provider. Use someone else's tool, you are likely a deployer. The obligations differ sharply, and you can be both for different systems. Fine-tuning or rebranding a third-party model can make you a provider.</small>
    <br><small class="gk-ev">**Evidence:** The role determination recorded per system in the AI inventory, with the reasoning.</small>
    <br><small>**Fix with:** [AI System Inventory](../registers/ai-system-inventory.md) · [AI Governance Framework](../frameworks/ai-governance-framework.md)</small>

- [ ] **4.** We have assessed which parts of the Act apply given our EU market exposure.
    <br><small>The Act reaches you if you place a system on the EU market, or if its output is used in the EU — regardless of where you are established. Being outside the EU is not by itself an exemption.</small>
    <br><small class="gk-ev">**Evidence:** A written scope assessment covering EU market placement and where system output is used.</small>
    <br><small>**Fix with:** [AI Governance Framework](../frameworks/ai-governance-framework.md) · [Governance Charter](../frameworks/governance-charter.md)</small>

- [ ] **5.** Every AI system in use or development is captured in a central inventory.
    <br><small>One list, owned by a named person, covering built, bought, and embedded AI — including AI features switched on inside SaaS you already licence. If you cannot say where the list lives, answer No.</small>
    <br><small class="gk-ev">**Evidence:** The inventory itself, plus evidence of how it is kept current (intake gate, discovery sweep).</small>
    <br><small>**Fix with:** [AI System Inventory](../registers/ai-system-inventory.md) · [Data Asset Register](../registers/data-asset-register.md)</small>

- [ ] **6.** Each system is classified by risk tier — prohibited, high-risk, limited, or minimal.
    <br><small>Classification is a decision with a date and an owner, recorded against the system. "We think most of ours are low risk" is not a classification.</small>
    <br><small class="gk-ev">**Evidence:** Classification recorded against each system with a date, an owner, and the rationale.</small>
    <br><small>**Fix with:** [AI System Inventory](../registers/ai-system-inventory.md) · [AI Risk Assessment](../risk/ai-risk-assessment.md) · [AI Governance Framework](../frameworks/ai-governance-framework.md)</small>

- [ ] **7.** General-purpose AI models we build or integrate are identified, with their obligations mapped.
    <br><small>Covers foundation models you train and, more commonly, commercial LLMs you build on. Integrating GPAI into a product can pull you into provider duties for the resulting system.</small>
    <br><small class="gk-ev">**Evidence:** A list of GPAI models in use, mapped to the obligations each attracts.</small>
    <br><small>**Fix with:** [AI System Inventory](../registers/ai-system-inventory.md) · [Third-Party AI Risk Policy](../policies/third-party-ai-risk-policy.md) · [AI Development & Deployment Standard](../policies/ai-development-standard.md)</small>

- [ ] **8.** The inventory records purpose, data sources, model or vendor, and lifecycle stage.
    <br><small>A list of system names is not an inventory. The test: could you answer a regulator's "what does it do, on what data, from whom, and is it live?" without going to ask around.</small>
    <br><small class="gk-ev">**Evidence:** Inventory export showing the fields populated for a sample of systems, not just the headers.</small>
    <br><small>**Fix with:** [AI System Inventory](../registers/ai-system-inventory.md) · [Data Asset Register](../registers/data-asset-register.md) · [Model Card / Model Risk Documentation](../risk/model-card.md)</small>

### Risk

- [ ] **9.** We have confirmed that no system performs a prohibited practice.
    <br><small>Social scoring, manipulative or exploitative techniques, untargeted scraping of facial images, emotion inference in workplaces or schools, and most real-time remote biometric identification in public. This needed to be true from February 2025.</small>
    <br><small class="gk-ev">**Evidence:** A completed prohibited-practice screen per system, signed off and dated.</small>
    <br><small>**Fix with:** [Acceptable AI Use Policy](../policies/acceptable-ai-use-policy.md) · [AI Risk Assessment](../risk/ai-risk-assessment.md) · [AI Governance Framework](../frameworks/ai-governance-framework.md)</small>

- [ ] **10.** We screen new use cases against the prohibited list before development starts.
    <br><small>A gate at intake, not a review at launch. The point is to stop work before money is spent, so it must sit early enough that someone can still say no.</small>
    <br><small class="gk-ev">**Evidence:** The intake process document plus screening records for recent new use cases.</small>
    <br><small>**Fix with:** [Acceptable AI Use Policy](../policies/acceptable-ai-use-policy.md) · [AI Development & Deployment Standard](../policies/ai-development-standard.md) · [Decision Rights & Escalation](../operating-model/decision-rights.md)</small>

- [ ] **11.** High-risk systems have a documented risk management process across the lifecycle.
    <br><small>Continuous, not a one-off sign-off: identify, evaluate, mitigate, then keep checking once the system is live and its inputs drift.</small>
    <br><small class="gk-ev">**Evidence:** A risk assessment per high-risk system, with review dates that have actually been met.</small>
    <br><small>**Fix with:** [AI Risk Assessment](../risk/ai-risk-assessment.md) · [Risk Register](../registers/risk-register.md) · [Control Library & Assurance Map](../risk/control-library.md)</small>

- [ ] **16.** Systems meet expected accuracy, robustness, and cybersecurity levels, with evidence.
    <br><small>Declared metrics with test results behind them, including behaviour under adversarial input and on edge cases. "It performed well in testing" without numbers is a No.</small>
    <br><small class="gk-ev">**Evidence:** Test results with declared metrics, subgroup performance, and adversarial testing evidence.</small>
    <br><small>**Fix with:** [AI Development & Deployment Standard](../policies/ai-development-standard.md) · [Model Card / Model Risk Documentation](../risk/model-card.md) · [Control Library & Assurance Map](../risk/control-library.md)</small>

### Documentation

- [ ] **12.** Data governance for training, validation, and test data addresses relevance, representativeness, and bias.
    <br><small>Do you know where training data came from, whether you may lawfully use it, who it does and does not represent, and what you did when you found a skew?</small>
    <br><small class="gk-ev">**Evidence:** Data documentation covering source, licence, representativeness testing, and bias findings.</small>
    <br><small>**Fix with:** [Data Governance Framework](../frameworks/data-governance-framework.md) · [Data Governance Policy](../policies/data-governance-policy.md) · [Data Quality Standard](../policies/data-quality-standard.md)</small>

- [ ] **13.** Technical documentation is maintained and current for each high-risk system.
    <br><small>Annex IV sets out what it must contain. The failure mode is not absence but staleness — documentation written at launch and never touched again.</small>
    <br><small class="gk-ev">**Evidence:** Technical documentation per Annex IV, with a version history showing it is maintained.</small>
    <br><small>**Fix with:** [Model Card / Model Risk Documentation](../risk/model-card.md) · [AI Development & Deployment Standard](../policies/ai-development-standard.md)</small>

- [ ] **14.** Systems automatically log events sufficient for traceability.
    <br><small>Machine-generated logs, retained long enough to reconstruct what a system did and why on a given date. Application logs often do not capture the model inputs and outputs that actually matter here.</small>
    <br><small class="gk-ev">**Evidence:** Log configuration and a retention policy, plus a sample log proving inputs and outputs are captured.</small>
    <br><small>**Fix with:** [AI Development & Deployment Standard](../policies/ai-development-standard.md) · [Control Library & Assurance Map](../risk/control-library.md) · [Issue & Incident Log](../registers/incident-log.md)</small>

- [ ] **17.** A conformity assessment route is identified and planned before the applicable deadline.
    <br><small>Know whether your route is self-assessment or a notified body, and how long it takes. Notified-body capacity is finite and the queue will not be shorter closer to the deadline.</small>
    <br><small class="gk-ev">**Evidence:** A conformity assessment plan naming the route, the body if applicable, and the target date.</small>
    <br><small>**Fix with:** [AI Governance Framework](../frameworks/ai-governance-framework.md) · [Control Library & Assurance Map](../risk/control-library.md)</small>

- [ ] **24.** Where personal data is involved, a DPIA or equivalent assessment is completed and linked.
    <br><small>AI Act compliance does not discharge GDPR. High-risk AI touching personal data will almost always need a DPIA, and the two assessments should reference each other rather than sit in separate drawers.</small>
    <br><small class="gk-ev">**Evidence:** The completed DPIA, the DPO's recorded opinion, and its cross-reference to the AI assessment.</small>
    <br><small>**Fix with:** [Processing & DPIA Log](../registers/processing-dpia-log.md) · [Data Classification & Handling Policy](../policies/data-classification-policy.md) · [AI Risk Assessment](../risk/ai-risk-assessment.md)</small>

### Oversight

- [ ] **1.** We have a named executive owner accountable for AI Act compliance.
    <br><small>One person, by name, not a committee and not "the CTO's team". If something went wrong tomorrow, this is who the board would call. If two people would both say "not me", answer No.</small>
    <br><small class="gk-ev">**Evidence:** A board minute, terms of reference, or role description naming the individual and the accountability.</small>
    <br><small>**Fix with:** [Governance Charter](../frameworks/governance-charter.md) · [Roles & Responsibilities](../operating-model/roles-responsibilities.md) · [RACI Matrix](../operating-model/raci.md)</small>

- [ ] **2.** AI governance is a standing agenda item at a committee that minutes its decisions.
    <br><small>A recurring forum with terms of reference, a quorum, and written minutes. Ad-hoc conversations, however senior, do not count — the evidence is the minute, not the meeting.</small>
    <br><small class="gk-ev">**Evidence:** Committee terms of reference plus the last two sets of minutes showing AI decisions taken.</small>
    <br><small>**Fix with:** [Committee Charter (Terms of Reference)](../operating-model/committee-charter.md) · [Board Pack Template](../board/board-pack.md)</small>

- [ ] **15.** Human oversight measures are designed in and genuinely operable by real people.
    <br><small>The honest test: can the named human actually understand the output, and do they have the authority, time, and confidence to override it? A reviewer approving 400 decisions an hour is not oversight.</small>
    <br><small class="gk-ev">**Evidence:** Oversight design documentation, override statistics, and the reviewer's training record.</small>
    <br><small>**Fix with:** [AI Governance Framework](../frameworks/ai-governance-framework.md) · [Decision Rights & Escalation](../operating-model/decision-rights.md) · [AI Risk Assessment](../risk/ai-risk-assessment.md)</small>

- [ ] **18.** Post-market monitoring and a serious-incident reporting process exist.
    <br><small>Someone watches live performance, and there is a defined path — with a clock on it — for reporting serious incidents to the relevant authority.</small>
    <br><small class="gk-ev">**Evidence:** The monitoring configuration and a documented incident reporting procedure with named owners.</small>
    <br><small>**Fix with:** [Issue & Incident Log](../registers/incident-log.md) · [Control Library & Assurance Map](../risk/control-library.md) · [KPI / KRI Dashboard](../board/kpi-dashboard.md)</small>

### Transparency

- [ ] **19.** People are told when they are interacting with an AI system.
    <br><small>Clear at the point of interaction, not buried in terms of service. Applies to chatbots and AI-driven assistants unless it is obvious to a reasonable person.</small>
    <br><small class="gk-ev">**Evidence:** Screenshots or UI evidence of the disclosure at the point of interaction.</small>
    <br><small>**Fix with:** [Acceptable AI Use Policy](../policies/acceptable-ai-use-policy.md) · [AI Governance Framework](../frameworks/ai-governance-framework.md)</small>

- [ ] **20.** AI-generated or manipulated content is marked or watermarked.
    <br><small>Synthetic audio, image, video, and text intended to inform the public must be machine-readably marked. This includes marketing material your teams generate.</small>
    <br><small class="gk-ev">**Evidence:** Marking or watermarking configuration, plus samples of generated content showing it applied.</small>
    <br><small>**Fix with:** [Acceptable AI Use Policy](../policies/acceptable-ai-use-policy.md) · [AI Development & Deployment Standard](../policies/ai-development-standard.md)</small>

- [ ] **21.** Emotion recognition or biometric categorisation, if used, is disclosed to affected people.
    <br><small>If you use neither, answer Not applicable. Note that emotion inference in workplaces and education is prohibited outright, not merely restricted.</small>
    <br><small class="gk-ev">**Evidence:** Disclosure notices, or a documented confirmation that neither technique is used.</small>
    <br><small>**Fix with:** [Acceptable AI Use Policy](../policies/acceptable-ai-use-policy.md) · [Processing & DPIA Log](../registers/processing-dpia-log.md)</small>

### Third-party

- [ ] **22.** For GPAI we use, we hold provider documentation and understand training-data transparency expectations.
    <br><small>Do you actually have the model documentation from your vendor, or do you just assume it exists? "It is on their website" only counts if someone has read it and filed it.</small>
    <br><small class="gk-ev">**Evidence:** The provider documentation you actually hold on file, not a link to a vendor website.</small>
    <br><small>**Fix with:** [Third-Party AI Risk Policy](../policies/third-party-ai-risk-policy.md) · [AI System Inventory](../registers/ai-system-inventory.md)</small>

- [ ] **23.** Vendor contracts flow down AI Act obligations and evidence rights.
    <br><small>Right to obtain documentation, to be told about material model changes, and to audit or receive assurance. Standard SaaS terms almost never include these unless you asked.</small>
    <br><small class="gk-ev">**Evidence:** Executed contracts or amendments containing the AI clauses, for your critical vendors.</small>
    <br><small>**Fix with:** [Third-Party AI Risk Policy](../policies/third-party-ai-risk-policy.md) · [Control Library & Assurance Map](../risk/control-library.md)</small>

### Literacy

- [ ] **25.** Staff who build, buy, or operate AI have AI literacy appropriate to their role.
    <br><small>A live obligation since February 2025, and one of the few that applies to everyone regardless of risk tier. The 2026 Omnibus softened it: you must take measures to SUPPORT the development of AI literacy, not guarantee any individual reaches a particular level. Proportionate to role — a procurement lead needs different literacy from an ML engineer.</small>
    <br><small class="gk-ev">**Evidence:** Training completion records by role, plus the syllabus showing it is role-appropriate.</small>
    <br><small>**Fix with:** [Acceptable AI Use Policy](../policies/acceptable-ai-use-policy.md) · [Roles & Responsibilities](../operating-model/roles-responsibilities.md) · [Governance Charter](../frameworks/governance-charter.md)</small>

---

### Turn gaps into action

Every unticked item maps to something in this kit. For a scored, role-specific version of this checklist — with a report you can present to a board or a regulator — take the [interactive assessment](../assess/index.md). Your answers stay in your browser.

---

## Adaptation notes

- **Non-EU organisations:** The Act can still reach you where output is used in the EU. Work through the checklist anyway, then confirm scope with counsel — territorial reach is the question most often got wrong.
- **Deployers rather than providers:** Items 11–18 are mostly provider obligations, but you inherit exposure through what you deploy. Focus on 1–10 and 22–25, and press vendors on the rest via [Third-Party AI Risk Policy](../policies/third-party-ai-risk-policy.md).
- **Using this with the assessment tool:** The interactive assessment covers these 25 points plus role-specific questions, and scores them by severity. This page is the reference; the tool is the working version.

## Related

- [EU AI Act timeline (2026 Digital Omnibus)](timeline.md) — <span class="pill ready">Ready</span>
- [AI System Inventory](../registers/ai-system-inventory.md) — <span class="pill ready">Ready</span>
- [AI Risk Assessment](../risk/ai-risk-assessment.md) — <span class="pill ready">Ready</span>
- [Board Pack Template](../board/board-pack.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
