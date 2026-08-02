<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# Data Classification & Handling Policy

<span class="pill ready">Ready</span>

<div class="gk-downloads" markdown>
[:material-file-word: Word](../downloads/data-classification-policy.docx){ .md-button .gk-dl download }
[:material-language-markdown: Markdown](../downloads/data-classification-policy.md.txt){ .md-button .gk-dl download="data-classification-policy.md" }
</div>

**Purpose.** Defines the sensitivity tiers your data falls into and the handling rules for each — including the rules that decide what may be pasted into an AI tool.

**When to use it.** Early. Classification underpins access control, AI input rules, and most security decisions. Review annually.

**How to use it.** Use four tiers at most; every tier beyond that is one people will not remember. The AI handling row in section 2 is the part staff will actually look up — make sure it names specific approved tools, not a category.

!!! tip "Closes assessment gaps"
    This template addresses **Q24**, **Q27**, **Q39** in the [readiness assessment](../assess/index.md).

---

## The template

### 1. Classification tiers

| Tier | Definition | Examples | Impact if disclosed |
|---|---|---|---|
| **Public** | Approved for public release. | Published marketing, annual report | None |
| **Internal** | Routine business data. | Internal comms, non-sensitive analytics | Minor |
| **Confidential** | Sensitive business or personal data. | Customer records, employee data, contracts | Significant |
| **Restricted** | Most sensitive; severe impact. | Special category data, credentials, M&A, security detail | Severe |

### 2. Handling rules

| Control | Public | Internal | Confidential | Restricted |
|---|---|---|---|---|
| Storage | Any approved | Approved systems | Approved + access control | Approved + encryption + logging |
| Access | Open | All staff | Role-based, owner-approved | Named individuals, owner-approved |
| Sharing externally | Free | NDA | Contract + DPA | Owner + Legal approval |
| Email | Permitted | Permitted | Encrypted | Not permitted — secure transfer only |
| **AI tool input** | **Permitted** | **Approved tools only** | **Approved enterprise tools with no-training guarantee** | **Prohibited unless explicitly approved for that system** |
| Retention | Per schedule | Per schedule | Per schedule + review | Per schedule + documented review |
| Disposal | Standard | Standard | Verified | Verified + certificate |

!!! danger "The AI row is the one that gets breached"
    Staff paste customer data into public chatbots because it is convenient
    and the rule was not to hand. Publish this row separately, name the
    approved tools, and put it where people work.

### 3. Applying a classification

1. The Data Owner assigns the classification at creation or acquisition.
2. Where a dataset holds mixed tiers, **the highest tier applies to the whole
   set** unless it is separated.
3. Classification is recorded in the [Data Asset Register](../registers/data-asset-register.md).
4. Derived data — including model outputs and embeddings — inherits the
   classification of its most sensitive input unless a documented assessment
   lowers it.

!!! note "Derived data inherits"
    Embeddings and model outputs derived from Confidential data are
    Confidential. This is routinely missed, and it is how sensitive data ends
    up in an unprotected vector store.

### 4. Special category & regulated data

Special category personal data, criminal offence data, children's data, and
payment card data carry additional requirements — see
[Processing & DPIA Log](../registers/processing-dpia-log.md). Default these to **Restricted** unless assessed
otherwise.

### 5. Labelling

Where the platform supports it, apply the label in the tool. Where it does
not, record classification in the register. **[Specify your labelling
mechanism.]**

### 6. Review

| Version | Date | Owner | Approved by |
|---|---|---|---|
| 0.1 | [date] | [role] | [committee] |

---

## Adaptation notes

- **Small organisations:** Three tiers — Public, Internal, Confidential — is usually enough. Keep the AI input row regardless; it is the highest-value line in the policy.
- **Existing security classification:** Do not create a competing scheme. Map onto what security already uses and add only the AI handling row.
- **Public sector:** Align to your national scheme (e.g. OFFICIAL / SECRET) rather than these labels, and add the FOI disclosure consideration to each tier.

## Related

- [Data Governance Policy](data-governance-policy.md) — <span class="pill ready">Ready</span>
- [Acceptable AI Use Policy](acceptable-ai-use-policy.md) — <span class="pill ready">Ready</span>
- [Data Asset Register](../registers/data-asset-register.md) — <span class="pill ready">Ready</span>
- [Processing & DPIA Log](../registers/processing-dpia-log.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
