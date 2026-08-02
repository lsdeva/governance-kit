<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# AI Governance Framework

<span class="pill ready">Ready</span>

<div class="gk-downloads" markdown>
[:material-file-word: Word](../downloads/ai-governance-framework.docx){ .md-button .gk-dl download }
[:material-language-markdown: Markdown](../downloads/ai-governance-framework.md.txt){ .md-button .gk-dl download="ai-governance-framework.md" }
</div>

**Purpose.** A single reference that defines how your organisation governs AI across its lifecycle — who is accountable, what principles apply, how risk is tiered and controlled, and how it connects to data governance and the EU AI Act. It is the document you hand to a board, a regulator, or a new hire to explain "how we do AI here".

**When to use it.** Adopt it once, then review at least annually and whenever regulation, your risk appetite, or your AI footprint changes materially.

**How to use it.** Fill the bracketed placeholders, delete what does not apply, and ratify it through your governance committee. Keep it short enough that people actually read it — push detail down into the policies and standards it references.

!!! tip "Closes assessment gaps"
    This template addresses **Q03**, **Q04**, **Q06**, **Q09**, **Q15**, **Q17**, **Q19** in the [readiness assessment](../assess/index.md).

---

## The template

### 1. Purpose & scope

This framework sets out how **[Organisation]** governs the design,
procurement, development, deployment, and retirement of AI systems. It
applies to **all** AI systems — built, bought, or embedded — used in or on
behalf of the organisation, including general-purpose AI and AI features
inside third-party products.

### 2. Principles

- **Accountability** — a named human is accountable for every AI system.
- **Lawfulness & fairness** — systems comply with applicable law and do not
  produce unjustified discriminatory outcomes.
- **Transparency** — people are told when they interact with AI, and decisions
  can be explained proportionate to their impact.
- **Human oversight** — meaningful human control exists over consequential
  decisions.
- **Safety, security & robustness** — systems are tested, monitored, and
  secured across their lifecycle.
- **Privacy & data governance** — data used by AI is governed, minimised, and
  lawful (see [Data Governance Framework](data-governance-framework.md)).
- **Proportionality** — controls scale with risk; low-risk innovation is not
  over-burdened.

### 3. Governance structure

| Body / role | Mandate |
|---|---|
| **Board / Audit & Risk Committee** | Sets risk appetite; receives assurance. |
| **AI / Data Governance Committee** | Owns this framework; approves high-risk use; resolves escalations. See [Committee Charter (Terms of Reference)](../operating-model/committee-charter.md). |
| **AI accountable owner (per system)** | Accountable for a specific system's compliance and outcomes. |
| **Model / product teams** | Build and operate within standards. |
| **Second line (Risk / Compliance / Legal / DPO)** | Independent challenge and advice. |
| **Third line (Internal Audit)** | Independent assurance. |

Detailed responsibilities are in [RACI Matrix](../operating-model/raci.md) and [Roles & Responsibilities](../operating-model/roles-responsibilities.md).

### 4. Risk tiering

Every AI system is classified before deployment. Tiers align with the EU AI
Act — see [EU AI Act — 25-point readiness checklist](../eu-ai-act/readiness-checklist.md).

| Tier | Definition | Governance response |
|---|---|---|
| **Prohibited** | Practices banned under Art. 5 | Do not build or deploy. Screen at intake. |
| **High-risk** | Annex I / III systems | Full controls: risk management, data governance, technical documentation, human oversight, conformity assessment, post-market monitoring. |
| **Limited** | Transparency-triggering (chatbots, synthetic media) | Disclosure and labelling controls. |
| **Minimal** | Everything else | Baseline standards; light-touch. |

Classification is a recorded decision with a date and an owner, held in the
[AI System Inventory](../registers/ai-system-inventory.md). Re-classify on material change of purpose.

### 5. Lifecycle controls

| Stage | Required before proceeding |
|---|---|
| **Ideation** | Screened against prohibited practices; risk tier assigned; entered in the inventory. |
| **Development** | Data sources lawful and registered; [AI Risk Assessment](../risk/ai-risk-assessment.md) started; evaluation plan agreed. |
| **Pre-deployment** | Assessment complete; [Model Card / Model Risk Documentation](../risk/model-card.md) written; human oversight designed; accountable owner signs off. |
| **Operation** | Monitoring live; logs retained; incidents routed to [Issue & Incident Log](../registers/incident-log.md). |
| **Retirement** | Decommissioned cleanly; records retained per schedule; inventory updated. |

### 6. Policies & standards under this framework

- [Acceptable AI Use Policy](../policies/acceptable-ai-use-policy.md)
- [AI Development & Deployment Standard](../policies/ai-development-standard.md)
- [Third-Party AI Risk Policy](../policies/third-party-ai-risk-policy.md)
- [AI Risk Assessment](../risk/ai-risk-assessment.md) and [Model Card / Model Risk Documentation](../risk/model-card.md)

### 7. Reporting & assurance

The committee reports to the board at least **[quarterly]** using
[Board Pack Template](../board/board-pack.md) and tracks health via [KPI / KRI Dashboard](../board/kpi-dashboard.md). Internal Audit
provides independent assurance on a risk-based cycle.

### 8. Review

Owner: **[role]**. Cadence: **[annually / on material change]**.

| Version | Date | Author | Approved by |
|---|---|---|---|
| 0.1 | [date] | [name] | [committee] |

---

## Adaptation notes

- **Regulated financial services:** Map this framework to your model risk management standard (SR 11-7 style expectations) and to operational resilience obligations. Make the second/third-line split explicit and align tiering with model materiality.
- **Small organisations:** Collapse the committee and accountable-owner roles, but never remove the "named accountable human" principle — it is the one control that cannot be delegated to a process.
- **Non-EU:** Keep the risk-tiering logic and swap the EU AI Act references for your local regime (NIST AI RMF, ISO/IEC 42001). The structure holds; only the obligation names change.
- **Heavy GPAI / vendor use:** If you mostly buy rather than build, thin out section 5 and expand [Third-Party AI Risk Policy](../policies/third-party-ai-risk-policy.md) — your controls are contractual and assurance-based rather than engineering ones.

## Related

- [Data Governance Framework](data-governance-framework.md) — <span class="pill ready">Ready</span>
- [Acceptable AI Use Policy](../policies/acceptable-ai-use-policy.md) — <span class="pill ready">Ready</span>
- [AI Development & Deployment Standard](../policies/ai-development-standard.md) — <span class="pill ready">Ready</span>
- [AI System Inventory](../registers/ai-system-inventory.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
