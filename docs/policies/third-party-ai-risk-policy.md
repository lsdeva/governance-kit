<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# Third-Party AI Risk Policy

<span class="pill ready">Ready</span>

**Purpose.** How you assess, contract for, and monitor AI you did not build — including AI features that appear inside software you already licence. For most organisations this is the majority of their AI exposure.

**When to use it.** At procurement, at renewal, and whenever a vendor announces new AI functionality in an existing product.

**How to use it.** The hard part is not the assessment; it is finding out that a vendor switched AI on. Build the trigger into contract renewal and vendor release-note reviews, and accept that you will discover some AI features after the fact.

!!! tip "Closes assessment gaps"
    This template addresses **Q07**, **Q22**, **Q23**, **Q40** in the [readiness assessment](../assess/index.md).

---

## The template

### 1. Scope

Applies to any AI capability we consume rather than build: standalone AI
products, AI features inside existing SaaS, APIs and foundation models, and
outsourced services using AI on our behalf.

!!! warning "The invisible majority"
    Most organisations' largest AI exposure is AI switched on inside software
    they already bought. Your CRM, HR system, and support desk have all
    shipped AI features. Assume you have more than you know.

### 2. Vendor risk tiering

| Tier | Criteria | Assessment depth |
|---|---|---|
| **Critical** | High-risk use case, or personal / Restricted data, or customer-facing decisions | Full assessment + contractual controls + annual review |
| **Significant** | Confidential data, or a material business process | Standard assessment + contract terms |
| **Limited** | Internal data, non-critical | Lightweight screen |

### 3. Assessment questions

Ask before purchase, and record the answers.

**The system**

1. What does it do, and what decisions does it inform or make?
2. Are we the provider or the deployer under the AI Act? (Rebranding or
   fine-tuning can make you the provider.)
3. What is its risk classification?

**Data**

4. What data do we send, and at what classification?
5. **Is our data used to train their models?** Can that be disabled
   contractually, not merely by a setting?
6. Where is data processed and stored, and who else can access it?
7. What is retained after termination?

**Model & assurance**

8. What model underlies it, and are we told when it changes?
9. What documentation exists — model cards, evaluations, bias testing?
10. What accuracy and robustness evidence can they provide?
11. Do they hold relevant certifications (ISO/IEC 42001, SOC 2)?

**Compliance**

12. Can they evidence AI Act compliance for their role?
13. Will they support our obligations — documentation, incident notification,
    audit?
14. What is their incident notification commitment, and in what timeframe?

### 4. Contract clauses to require

| Clause | Why |
|---|---|
| AI Act obligation flow-down | You remain accountable for what you deploy. |
| No training on our data (or explicit consent) | Prevents your confidential data improving a shared model. |
| Notification of material model change | A silent model swap can change system behaviour overnight. |
| Documentation rights | You cannot evidence what you cannot obtain. |
| Audit or third-party assurance rights | Trust needs verification. |
| Incident notification within **[24–72h]** | Your own reporting clock may already be running. |
| Data location and sub-processor control | Transfer and access obligations. |
| Exit: data return and deletion | Avoids hostage data at renewal. |

### 5. Ongoing monitoring

| Activity | Frequency |
|---|---|
| Reassess Critical vendors | Annually |
| Review vendor release notes for new AI features | Quarterly |
| Confirm certifications still current | Annually |
| Review incidents involving the vendor | Each occurrence |

### 6. Recording

Every third-party AI system is entered in the [AI System Inventory](../registers/ai-system-inventory.md), marked
as third-party, with vendor, tier, assessment date, and review date.

### 7. Review

| Version | Date | Owner | Approved by |
|---|---|---|---|
| 0.1 | [date] | [role] | [committee] |

---

## Adaptation notes

- **Small organisations:** You will not renegotiate the contracts of large vendors. Focus on questions 4–7 (data handling), choose products with acceptable defaults, and document the residual risk you are accepting.
- **Regulated sectors:** Align with your existing outsourcing and operational resilience regime — AI vendors supporting important business services likely fall inside it already.
- **Public sector:** Fold these questions into your standard procurement framework so the assessment happens inside a process staff already follow.

## Related

- [AI System Inventory](../registers/ai-system-inventory.md) — <span class="pill ready">Ready</span>
- [AI Governance Framework](../frameworks/ai-governance-framework.md) — <span class="pill ready">Ready</span>
- [Control Library & Assurance Map](../risk/control-library.md) — <span class="pill ready">Ready</span>
- [Acceptable AI Use Policy](acceptable-ai-use-policy.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
