<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# Data Governance Framework

<div class="gk-dochead" markdown>
<span class="gk-dochead-meta" markdown>
<span class="pill ready">Ready</span>
</span>
<span class="gk-dochead-dl" markdown>
[:material-file-word: Word](../downloads/data-governance-framework.docx){ .md-button .gk-dl download } [:material-language-markdown: Markdown](../downloads/data-governance-framework.md.txt){ .md-button .gk-dl download="data-governance-framework.md" }
</span>
</div>

**Purpose.** The reference that defines how your organisation governs data: what data you hold, who owns it, what quality is expected, and how decisions about it are made. It is the foundation the AI governance work sits on — most AI failures trace back to a data problem nobody owned.

**When to use it.** Adopt once, then review annually or when your data estate, regulatory exposure, or operating model changes materially.

**How to use it.** Start from section 3 (domains and ownership) rather than the top — naming owners is the hardest part and everything else depends on it. Get the domain list agreed before you write policy statements, or you will write rules nobody has agreed to enforce.

!!! tip "Closes assessment gaps"
    This template addresses **Q12**, **Q26** in the [readiness assessment](../assess/index.md).

---

## The template

### 1. Purpose & scope

This framework sets out how **[Organisation]** governs data across its
lifecycle — creation, storage, use, sharing, retention, and disposal. It
applies to all data the organisation holds or processes, in all systems,
including data held by third parties on our behalf.

### 2. Principles

- **Ownership** — every significant data domain has one named accountable owner.
- **Fitness for purpose** — quality is defined by what the data is used for,
  not in the abstract.
- **Lawfulness** — we can point to a lawful basis for every processing activity.
- **Minimisation** — we hold what we need, for as long as we need it.
- **Transparency** — definitions, lineage, and quality are discoverable.
- **Security by classification** — handling follows sensitivity (see
  [Data Classification & Handling Policy](../policies/data-classification-policy.md)).
- **Proportionality** — control effort scales with value and risk.

### 3. Data domains & ownership

The estate is divided into domains, each with a named owner accountable for
its definitions, quality, and access decisions.

| Domain | Owner (role) | Steward | Systems of record | Classification |
|---|---|---|---|---|
| Customer | [role] | [name] | [system] | Confidential |
| Employee | [role] | [name] | [system] | Confidential |
| Financial | [role] | [name] | [system] | Restricted |
| Product / operational | [role] | [name] | [system] | Internal |
| [add domains] | | | | |

Domains are recorded in the [Data Asset Register](../registers/data-asset-register.md).

### 4. Roles

| Role | Accountable for |
|---|---|
| **Data Owner** | Business accountability for a domain: definitions, access, quality targets, acceptance of risk. |
| **Data Steward** | Day-to-day custody: definitions maintained, quality monitored, issues triaged. |
| **Data Custodian** | Technical operation: storage, backup, access enforcement, security controls. |
| **Consumers** | Using data within its stated purpose and classification. |
| **Data Governance Committee** | Owns this framework; arbitrates cross-domain disputes. |

Full detail in [Roles & Responsibilities](../operating-model/roles-responsibilities.md) and [RACI Matrix](../operating-model/raci.md).

### 5. Data quality

Quality is measured against defined dimensions with thresholds per domain —
see [Data Quality Standard](../policies/data-quality-standard.md). Owners are accountable for their domain's
scores; breaches raise an issue in the [Issue & Incident Log](../registers/incident-log.md).

### 6. Lifecycle & retention

| Stage | Control |
|---|---|
| Create / acquire | Lawful basis confirmed; classified; registered. |
| Store | Held in an approved system with controls matching classification. |
| Use | Within stated purpose; secondary use re-assessed. |
| Share | Agreement in place; recipient obligations flowed down. |
| Retain | Per the retention schedule — **[reference]**. |
| Dispose | Verifiable deletion; disposal recorded. |

### 7. How this connects to AI

AI systems inherit the governance of the data they consume. Before a system
enters development, its data sources must be registered, classified, and
confirmed lawful for that purpose. See [AI Governance Framework](ai-governance-framework.md) and
[AI Development & Deployment Standard](../policies/ai-development-standard.md).

### 8. Compliance & exceptions

Exceptions are requested from the data owner, recorded with an expiry date,
and reported to the committee. Persistent exceptions indicate the rule is
wrong — fix the rule.

### 9. Review

| Version | Date | Author | Approved by | Next review |
|---|---|---|---|---|
| 0.1 | [date] | [name] | [committee] | [date] |

---

## Adaptation notes

- **Small organisations:** Collapse owner, steward, and custodian into one or two people, but keep the domain list — knowing what you hold matters more than the role split.
- **Regulated financial services:** Map domains to BCBS 239 risk data aggregation principles and align the quality dimensions with existing regulatory reporting controls.
- **Public sector:** Add a transparency and FOI dimension: openness by default, with classification as the exception rather than the reverse.
- **Data-mesh operating models:** Domain ownership maps naturally onto data products. Keep this framework as the federated policy layer and let domains own their own quality SLOs.

## Related

- [Data Governance Policy](../policies/data-governance-policy.md) — <span class="pill ready">Ready</span>
- [Data Quality Standard](../policies/data-quality-standard.md) — <span class="pill ready">Ready</span>
- [Data Asset Register](../registers/data-asset-register.md) — <span class="pill ready">Ready</span>
- [AI Governance Framework](ai-governance-framework.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
