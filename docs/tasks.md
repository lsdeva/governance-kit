<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/tasks.yml
     Regenerate with: python tools/build_content.py -->


# I've been asked to…

Most people land here because someone asked them for something. Find the request below and start where it points.

<div class="gk-task-filter" id="gk-task-filter" role="group" aria-label="Filter by who is asking">
<button class="gk-chip is-on" type="button" data-req="all">Everything</button>
<button class="gk-chip" type="button" data-req="board">Board</button>
<button class="gk-chip" type="button" data-req="regulator">Regulator</button>
<button class="gk-chip" type="button" data-req="customer">Customer</button>
<button class="gk-chip" type="button" data-req="procurement">Procurement</button>
<button class="gk-chip" type="button" data-req="internal-audit">Internal audit</button>
<button class="gk-chip" type="button" data-req="security">Security</button>
<button class="gk-chip" type="button" data-req="business">Business team</button>
</div>

!!! tip "Not sure where you stand?"
    Take the [role-based assessment](assess/index.md) — answer questions relevant to
    your role and get a report showing which of these templates close your
    biggest gaps. Everything stays in your browser.

<div class="gk-task" data-requesters="board" markdown>

### "Tell the board how exposed we are to the EU AI Act"

**Usually asked by:** Board, CEO, or Audit Committee  
**Rough effort:** 1–2 days for a first pass

**Start here, in this order:**

1. [AI System Inventory](registers/ai-system-inventory.md) — The single list of every AI system you build, buy, or have embedded in something you already licence. It is…
2. [EU AI Act — 25-point readiness checklist](eu-ai-act/readiness-checklist.md) — A fast self-assessment of where your organisation stands against the EU AI Act. Work through it, mark what is…
3. [Board Pack Template](board/board-pack.md) — A structured report that gives the board what it needs to discharge its oversight duty: current posture, what…

!!! tip "Before you start"
    Take the assessment first and export the Board view — it produces most of the pack. Do not present a readiness percentage without an inventory behind it; the first question will be "how many systems is that out of?"

</div>

<div class="gk-task" data-requesters="internal-audit security business" markdown>

### "Find out what AI we're actually using"

**Usually asked by:** Governance, Security, or Legal  
**Rough effort:** 2–3 days including a discovery sweep

**Start here, in this order:**

1. [AI System Inventory](registers/ai-system-inventory.md) — The single list of every AI system you build, buy, or have embedded in something you already licence. It is…
2. [Third-Party AI Risk Policy](policies/third-party-ai-risk-policy.md) — How you assess, contract for, and monitor AI you did not build — including AI features that appear inside…

!!! tip "Before you start"
    Ask teams, then check SaaS release notes, expense claims, and SSO logs. Expect to find two to three times what people report.

</div>

<div class="gk-task" data-requesters="board business" markdown>

### "Write us an AI policy"

**Usually asked by:** Exec team or HR  
**Rough effort:** Half a day to draft, 2 weeks to socialise

**Start here, in this order:**

1. [Acceptable AI Use Policy](policies/acceptable-ai-use-policy.md) — The staff-facing rules for using AI at work: what is encouraged, what needs approval, and what is never…
2. [Data Classification & Handling Policy](policies/data-classification-policy.md) — Defines the sensitivity tiers your data falls into and the handling rules for each — including the rules that…

!!! tip "Before you start"
    Publish a usable one-pager this week rather than a complete one next quarter. Staff are already using AI; the policy is catching up, not getting ahead.

</div>

<div class="gk-task" data-requesters="customer regulator" markdown>

### "Prove our AI isn't discriminating"

**Usually asked by:** Legal, DPO, or a customer  
**Rough effort:** 1–2 weeks per system

**Start here, in this order:**

1. [AI Risk Assessment](risk/ai-risk-assessment.md) — A structured assessment of what could go wrong with a specific AI system, how bad it would be, and what you…
2. [Model Card / Model Risk Documentation](risk/model-card.md) — Standard documentation for a model: what it is for, what it was trained on, how well it performs and for…
3. [Data Quality Standard](policies/data-quality-standard.md) — Defines what "good enough" data means in measurable terms — the dimensions, how they are measured, the…

!!! tip "Before you start"
    Test subgroups, not just aggregate accuracy. A 95% accurate system can be systematically wrong about one group, and that group is who complains.

</div>

<div class="gk-task" data-requesters="board" markdown>

### "Set up an AI governance committee"

**Usually asked by:** Exec sponsor  
**Rough effort:** 1 week to charter, first meeting within a month

**Start here, in this order:**

1. [Committee Charter (Terms of Reference)](operating-model/committee-charter.md) — Establishes the forum where governance decisions are actually made: its authority, membership, quorum,…
2. [Governance Charter](frameworks/governance-charter.md) — A short, board-approved mandate that establishes the governance programme: why it exists, what authority it…
3. [RACI Matrix](operating-model/raci.md) — Removes ambiguity about who does what. For every significant governance activity it names exactly one…
4. [Decision Rights & Escalation](operating-model/decision-rights.md) — States who can decide what, at what threshold, and what happens when people disagree or a decision is needed…

!!! tip "Before you start"
    Settle quorum and the right to halt a system before the first meeting. A committee that cannot stop anything is advisory.

</div>

<div class="gk-task" data-requesters="regulator internal-audit" markdown>

### "Do a DPIA for an AI system"

**Usually asked by:** DPO or Legal  
**Rough effort:** 1–2 weeks

**Start here, in this order:**

1. [Processing & DPIA Log](registers/processing-dpia-log.md) — The record of personal data processing activities and the impact assessments that cover them — the point…
2. [AI Risk Assessment](risk/ai-risk-assessment.md) — A structured assessment of what could go wrong with a specific AI system, how bad it would be, and what you…
3. [Data Classification & Handling Policy](policies/data-classification-policy.md) — Defines the sensitivity tiers your data falls into and the handling rules for each — including the rules that…

!!! tip "Before you start"
    Run it alongside the AI risk assessment and cross-reference them. Decide your answer on erasure before you build, not after.

</div>

<div class="gk-task" data-requesters="procurement security" markdown>

### "Assess an AI vendor before we sign"

**Usually asked by:** Procurement or Security  
**Rough effort:** 2–3 days

**Start here, in this order:**

1. [Third-Party AI Risk Policy](policies/third-party-ai-risk-policy.md) — How you assess, contract for, and monitor AI you did not build — including AI features that appear inside…
2. [AI System Inventory](registers/ai-system-inventory.md) — The single list of every AI system you build, buy, or have embedded in something you already licence. It is…

!!! tip "Before you start"
    The two questions that matter most are whether your data trains their model, and whether you are told when the model changes.

</div>

<div class="gk-task" data-requesters="internal-audit regulator" markdown>

### "Show an auditor our AI controls work"

**Usually asked by:** Internal Audit or an external assessor  
**Rough effort:** 1–2 weeks to assemble

**Start here, in this order:**

1. [Control Library & Assurance Map](risk/control-library.md) — Maps obligations to the controls that satisfy them, names an owner for each, and records how you would…
2. [Risk Register](registers/risk-register.md) — The live record of data and AI risks: what could go wrong, how likely and how bad, what you are doing about…
3. [Issue & Incident Log](registers/incident-log.md) — The record of what went wrong, what you did, and what changed as a result. It is both a management tool and…

!!! tip "Before you start"
    Take the assessment and export the Regulator view — it lists what evidence each obligation needs. Assemble against that list rather than guessing.

</div>

<div class="gk-task" data-requesters="business security" markdown>

### "Document a model before it goes live"

**Usually asked by:** ML lead or a release gate  
**Rough effort:** 1–2 days per model

**Start here, in this order:**

1. [Model Card / Model Risk Documentation](risk/model-card.md) — Standard documentation for a model: what it is for, what it was trained on, how well it performs and for…
2. [AI Development & Deployment Standard](policies/ai-development-standard.md) — The engineering-facing requirements for building, testing, deploying, and operating AI systems — the…

!!! tip "Before you start"
    Write the limitations section first and honestly. A model card with no limitations tells a reader you did not look.

</div>

<div class="gk-task" data-requesters="business" markdown>

### "Work out where to start with all of this"

**Usually asked by:** You, having just been handed the brief  
**Rough effort:** Half a day

**Start here, in this order:**

1. [Maturity Assessment](frameworks/maturity-assessment.md) — A structured baseline of how capable your governance actually is today, across the dimensions that matter, so…
2. [AI System Inventory](registers/ai-system-inventory.md) — The single list of every AI system you build, buy, or have embedded in something you already licence. It is…
3. [Governance Charter](frameworks/governance-charter.md) — A short, board-approved mandate that establishes the governance programme: why it exists, what authority it…

!!! tip "Before you start"
    Baseline honestly, then get a mandate in writing. An optimistic baseline destroys the credibility of every improvement you later report.

</div>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
