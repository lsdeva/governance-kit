# AI Governance Framework

<span class="pill ready">Ready</span>

**Purpose.** A single reference that defines how your organisation governs AI
across its lifecycle — who is accountable, what principles apply, how risk is
tiered and controlled, and how it connects to your data governance and the EU AI
Act. It is the document you hand to a board, a regulator, or a new hire to explain
"how we do AI here."

**When to use it.** Adopt it once, then review at least annually and whenever
regulation, your risk appetite, or your AI footprint changes materially.

**How to use it.** Fill the bracketed placeholders, delete what doesn't apply,
and ratify it through your governance committee. Keep it short enough that people
actually read it; push detail down into the policies and standards it references.

---

## The template

### 1. Purpose & scope

This framework sets out how **[Organisation]** governs the design, procurement,
development, deployment, and retirement of AI systems. It applies to **all** AI
systems — built, bought, or embedded — used in or on behalf of the organisation,
including general-purpose AI and AI features inside third-party products.

### 2. Principles

Our use of AI is governed by these principles:

- **Accountability** — a named human is accountable for every AI system.
- **Lawfulness & fairness** — systems comply with applicable law and do not
  produce unjustified discriminatory outcomes.
- **Transparency** — people are told when they interact with AI, and decisions
  can be explained proportionate to their impact.
- **Human oversight** — meaningful human control exists over consequential
  decisions.
- **Safety, security & robustness** — systems are tested, monitored, and secured
  across their lifecycle.
- **Privacy & data governance** — data used by AI is governed, minimised, and
  lawful (see the [Data Governance Framework](data-governance-framework.md)).
- **Proportionality** — controls scale with risk; low-risk innovation is not
  over-burdened.

### 3. Governance structure

| Body / role | Mandate |
|---|---|
| **Board / Audit & Risk Committee** | Sets risk appetite; receives assurance. |
| **AI / Data Governance Committee** | Owns this framework; approves high-risk use; resolves escalations. See [Committee ToR](../operating-model/committee-charter.md). |
| **AI accountable owner (per system)** | Accountable for a specific system's compliance and outcomes. |
| **Model / product teams** | Build and operate within standards. |
| **Second line (Risk / Compliance / Legal / DPO)** | Independent challenge and advice. |
| **Third line (Internal Audit)** | Independent assurance. |

Detailed responsibilities are in the [RACI](../operating-model/raci.md) and
[Roles & Responsibilities](../operating-model/roles-responsibilities.md).

### 4. Risk tiering

Every AI system is classified before deployment. Tiers align with the EU AI Act
(see the [readiness checklist](../eu-ai-act/readiness-checklist.md)):

| Tier | Definition | Governance response |
|---|---|---|
| **Prohibited** | Practices banned under Art. 5 | Do not build or deploy. |
| **High-risk** | Annex I / III systems | Full controls: risk mgmt, data governance, documentation, human oversight, conformity assessment, post-market monitoring. |
| **Limited** | Transparency-triggering (chatbots, synthetic media) | Disclosure / labelling controls. |
| **Minimal** | Everything else | Baseline standards; light-touch. |

### 5. Lifecycle controls

Governance applies at each stage — **ideation** (screen for prohibited use and
tier the risk), **development** (data governance, testing, documentation),
**pre-deployment** (assessment, sign-off by the accountable owner), **operation**
(monitoring, logging, human oversight), and **retirement** (decommissioning,
record retention). Systems are entered in the
[AI System Inventory](../registers/ai-system-inventory.md) at ideation and kept
current throughout.

### 6. Policies & standards under this framework

This framework sits above:

- [Acceptable AI Use Policy](../policies/acceptable-ai-use-policy.md)
- [AI Development & Deployment Standard](../policies/ai-development-standard.md)
- [Third-Party AI Risk Policy](../policies/third-party-ai-risk-policy.md)
- [AI Risk Assessment](../risk/ai-risk-assessment.md) and
  [Model Card](../risk/model-card.md) templates

### 7. Reporting & assurance

The committee reports to the board at least **[quarterly]** using the
[Board Pack](../board/board-pack.md) and tracks health via the
[KPI / KRI dashboard](../board/kpi-dashboard.md). Internal Audit provides
independent assurance on a risk-based cycle.

### 8. Review

Owner: **[role]**. Review cadence: **[annually / on material change]**.
Version, approver, and date recorded in the document control block below.

| Version | Date | Author | Approved by |
|---|---|---|---|
| 0.1 | [date] | [name] | [committee] |

---

## Adaptation notes

- **Regulated financial services:** map this framework to your model risk
  management standard (e.g. SR 11-7 style expectations) and to operational
  resilience obligations; make the second/third-line split explicit.
- **Small organisations:** collapse the committee and accountable-owner roles,
  but never remove the "named accountable human" principle.
- **Non-EU:** keep the risk-tiering logic; swap the EU AI Act references for your
  local regime (e.g. NIST AI RMF, ISO/IEC 42001) — the structure still holds.
