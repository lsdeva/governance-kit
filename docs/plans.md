<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/plans.yml
     Regenerate with: python tools/build_content.py -->


# 30/60/90-day plans

Knowing which templates you need is not the same as knowing what order to do them in. These are sequenced plans with rough effort, so you can plan resource and tell a sponsor when things will land.

!!! note "Effort is for one person, not full time"
    Estimates are person-days for whoever is running this, assuming it
    is not their only job. They cover a competent first pass — not a
    polished, audited version.

## Pick your path

| Path | When it fits | Total effort |
|---|---|---|
| [Standing up a programme from nothing](#standing-up-a-programme-from-nothing) | Nobody owns AI governance yet, or someone has just been handed the brief. | ~18–24 person-days over 90 days |
| [AI is landing faster than governance](#ai-is-landing-faster-than-governance) | The business is shipping AI and you are trying to get in front of it. | ~14–18 person-days over 90 days |
| [A regulator or board is asking questions](#a-regulator-or-board-is-asking-questions) | Something has prompted scrutiny and you need a defensible answer soon. | ~10–14 person-days over 90 days |
| [Small or flat organisation](#small-or-flat-organisation) | Fewer than ~150 people, no committee, no dedicated governance role, and this is somebody's third priority. | ~6–9 person-days over 90 days |

## Standing up a programme from nothing

**When it fits:** Nobody owns AI governance yet, or someone has just been handed the brief.  
**Assumes:** You can get a decision-maker in a room, and you have a few days a week.  
**Total effort:** ~18–24 person-days over 90 days

### Days 1–30 — Know what you have and get a mandate.

*Effort: 6–8 days*

1. **Baseline honestly with the maturity assessment** — [Maturity Assessment](frameworks/maturity-assessment.md) · *1 day*
   <br>Score what is true, not what is intended. This number is the benchmark every later improvement is measured against.
2. **Run a discovery sweep and build the AI inventory** — [AI System Inventory](registers/ai-system-inventory.md) · *3–4 days*
   <br>Ask teams, then check SaaS release notes, expenses, and SSO logs. Budget for finding two to three times what people report.
3. **Screen everything for prohibited practices** — [AI Risk Assessment](risk/ai-risk-assessment.md) · *1 day*
   <br>Prohibited practices have been in force since February 2025. If you find one, this becomes urgent and everything else waits.
4. **Get a written mandate** — [Governance Charter](frameworks/governance-charter.md) · *1–2 days*
   <br>Two pages. The clauses that matter are the authority to halt a system and a named executive sponsor.

**You are done when:**

- [ ] You can name every AI system in the organisation
- [ ] Someone senior has signed something saying you own this
- [ ] You know whether you have a prohibited-practice problem

### Days 31–60 — Put the rules and the decision-making in place.

*Effort: 6–8 days*

1. **Publish the acceptable AI use policy** — [Acceptable AI Use Policy](policies/acceptable-ai-use-policy.md) · *1 day to draft*
   <br>The highest-value document in the kit for the effort. Staff are already using AI; this is catching up, not getting ahead.
2. **Classify every system by risk tier** — [AI System Inventory](registers/ai-system-inventory.md) · *2 days*
   <br>Record the rationale, not just the label.
3. **Stand up the committee and agree decision rights** — [Committee Charter (Terms of Reference)](operating-model/committee-charter.md) · *2 days*
   <br>Settle quorum and who can halt a live system before the first meeting, not during the first incident.
4. **Agree the RACI** — [RACI Matrix](operating-model/raci.md) · *1–2 days*
   <br>Do it in a room with the actual people. The argument is the point.

**You are done when:**

- [ ] Staff know what they may and may not do
- [ ] Every system has a tier and a named owner
- [ ] A forum exists that can actually decide things

### Days 61–90 — Assess the risky ones and make it visible.

*Effort: 6–8 days*

1. **Assess your high-risk systems properly** — [AI Risk Assessment](risk/ai-risk-assessment.md) · *2–3 days each*
   <br>Test subgroups, not just aggregate accuracy, and check whether human oversight is real by looking at the override rate.
2. **Open the risk register and incident log** — [Risk Register](registers/risk-register.md) · *1 day*
   <br>You need the incident route defined before the first incident, not during it.
3. **Take the first board pack** — [Board Pack Template](board/board-pack.md) · *2 days*
   <br>Take the assessment and export the Board view — it writes most of it. Lead with what you need, not what you did.

**You are done when:**

- [ ] High-risk systems have completed assessments with owners
- [ ] The board has seen a posture and been asked for something
- [ ] You have a repeatable cycle rather than a project

---

## AI is landing faster than governance

**When it fits:** The business is shipping AI and you are trying to get in front of it.  
**Assumes:** Governance exists in some form; the problem is pace, not mandate.  
**Total effort:** ~14–18 person-days over 90 days

### Days 1–30 — Stop the bleeding.

*Effort: 5–6 days*

1. **Publish the acceptable AI use policy immediately** — [Acceptable AI Use Policy](policies/acceptable-ai-use-policy.md) · *1 day*
   <br>Ship a one-page version this week. A perfect policy next quarter is worth less than a usable one now.
2. **Build the inventory, starting with what is already live** — [AI System Inventory](registers/ai-system-inventory.md) · *3 days*
   <br>Live systems first; pipeline second.
3. **Add an intake gate so new systems get screened** — [AI Development & Deployment Standard](policies/ai-development-standard.md) · *1–2 days*
   <br>One gate at intake beats a review at launch, because at launch the money is already spent.

**You are done when:**

- [ ] Nothing new goes live unscreened
- [ ] You know what is already running

### Days 31–60 — Assess what is live and govern what is coming.

*Effort: 5–7 days*

1. **Run the EU AI Act readiness checklist** — [EU AI Act — 25-point readiness checklist](eu-ai-act/readiness-checklist.md) · *Half a day*
2. **Classify and assess high-risk systems** — [AI Risk Assessment](risk/ai-risk-assessment.md) · *2–3 days each*
3. **Bring vendor AI under control** — [Third-Party AI Risk Policy](policies/third-party-ai-risk-policy.md) · *2 days*
   <br>Most of your exposure is AI switched on inside software you already bought. Start with the release notes.

**You are done when:**

- [ ] Every live system has a tier
- [ ] Vendor AI is assessed rather than assumed

### Days 61–90 — Make it sustainable.

*Effort: 4–5 days*

1. **Document your material models** — [Model Card / Model Risk Documentation](risk/model-card.md) · *1–2 days each*
2. **Set up monitoring and the incident route** — [Issue & Incident Log](registers/incident-log.md) · *1 day*
3. **Start reporting a small metric set** — [KPI / KRI Dashboard](board/kpi-dashboard.md) · *1 day*
   <br>Six metrics held stable beats twenty that change every quarter — trend is the point.

**You are done when:**

- [ ] Governance runs at the pace of delivery rather than behind it

---

## A regulator or board is asking questions

**When it fits:** Something has prompted scrutiny and you need a defensible answer soon.  
**Assumes:** You have limited time and need evidence, not documents.  
**Total effort:** ~10–14 person-days over 90 days

### Days 1–30 — Be able to answer the question.

*Effort: 5–6 days*

1. **Take the assessment, Regulator view, and export it** — [EU AI Act — 25-point readiness checklist](eu-ai-act/readiness-checklist.md) · *1 day*
   <br>The export lists what evidence each obligation needs. Assemble against that list rather than guessing what they will ask for.
2. **Produce the inventory, however imperfect** — [AI System Inventory](registers/ai-system-inventory.md) · *2–3 days*
   <br>"We are still completing it, here is what we have and when it will be finished" is a far better answer than silence.
3. **Assemble a board pack from what exists** — [Board Pack Template](board/board-pack.md) · *1–2 days*
   <br>Be honest about the gaps. An amber pack with a plan lands better than a green one that unravels.

**You are done when:**

- [ ] You can state your position with evidence behind it

### Days 31–60 — Close the gaps that were exposed.

*Effort: 3–5 days*

1. **Build the control library and assurance map** — [Control Library & Assurance Map](risk/control-library.md) · *2 days*
   <br>The blank cells are the finding — obligations nobody is assuring.
2. **Formalise the risk register** — [Risk Register](registers/risk-register.md) · *1 day*
3. **Fix the highest-severity gaps from the assessment** — [AI Risk Assessment](risk/ai-risk-assessment.md) · *2–3 days*

**You are done when:**

- [ ] Every obligation has a control, an owner, and evidence

### Days 61–90 — Show movement.

*Effort: 2–3 days*

1. **Re-run the assessment and show the delta** — [Maturity Assessment](frameworks/maturity-assessment.md) · *Half a day*
   <br>Movement is more persuasive than any absolute score. Keep the first export so you can show the before.
2. **Report progress to the board** — [Board Pack Template](board/board-pack.md) · *1 day*
3. **Set the ongoing review cadence** — [Committee Charter (Terms of Reference)](operating-model/committee-charter.md) · *1 day*

**You are done when:**

- [ ] Scrutiny has become a routine reporting cycle

---

## Small or flat organisation

!!! tip "This is not a cut-down version"
    The rest of the kit assumes a committee and named specialist
    roles. This path deliberately does not — it is a different
    sequence for organisations that have neither.

**When it fits:** Fewer than ~150 people, no committee, no dedicated governance role, and this is somebody's third priority.  
**Assumes:** Nothing. This path deliberately does not require a committee to exist.  
**Total effort:** ~6–9 person-days over 90 days

### Days 1–30 — The two things that actually reduce risk.

*Effort: 2–3 days*

1. **List your AI systems in a spreadsheet** — [AI System Inventory](registers/ai-system-inventory.md) · *1 day*
   <br>Owner, source, tier, rationale. Four columns is enough. Do not buy a tool.
2. **Publish a one-page AI use policy** — [Acceptable AI Use Policy](policies/acceptable-ai-use-policy.md) · *Half a day*
   <br>Sections 2, 3 and 4 of the template only — the short version, approved tools, and what is never allowed.
3. **Check nothing is prohibited** — [AI Risk Assessment](risk/ai-risk-assessment.md) · *Half a day*
   <br>The eight-item screen. This is the one check with no proportionality argument available.

**You are done when:**

- [ ] You know what you run and staff know the rules

### Days 31–60 — Accountability without bureaucracy.

*Effort: 2–3 days*

1. **Name one accountable person per system** — [Roles & Responsibilities](operating-model/roles-responsibilities.md) · *Half a day*
   <br>One person can hold several roles. The only split you must keep is that nobody assures their own work.
2. **Write down who can stop a system** — [Decision Rights & Escalation](operating-model/decision-rights.md) · *Half a day*
   <br>Two levels is enough: who decides day to day, and who they escalate to. Keep suspension distributed.
3. **Assess anything that affects people** — [AI Risk Assessment](risk/ai-risk-assessment.md) · *1–2 days*
   <br>Sections 1, 2 and 4 only — is it allowed, who could it hurt, who is watching. That fits on two pages.

**You are done when:**

- [ ] Every system has a named human, and stopping one is possible

### Days 61–90 — Enough evidence to answer a customer or auditor.

*Effort: 2–3 days*

1. **Start an incident log, even if it is empty** — [Issue & Incident Log](registers/incident-log.md) · *Half a day*
   <br>An empty log with a defined route beats no route. You need it before the first incident.
2. **Keep a short risk list** — [Risk Register](registers/risk-register.md) · *Half a day*
   <br>A 3x3 matrix and five risks you actually review.
3. **Do a half-day review every quarter** — [Board Pack Template](board/board-pack.md) · *Half a day per quarter*
   <br>A standing 45-minute item on an existing leadership meeting, with real minutes, beats a committee that quietly stops meeting.

**You are done when:**

- [ ] You can evidence governance proportionate to your size
- [ ] The cycle survives the person who set it up leaving

---

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
