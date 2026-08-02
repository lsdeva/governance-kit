<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# Data Governance Policy

<span class="pill ready">Ready</span>

<div class="gk-downloads" markdown>
[:material-file-word: Word](../downloads/data-governance-policy.docx){ .md-button .gk-dl download }
[:material-language-markdown: Markdown](../downloads/data-governance-policy.md.txt){ .md-button .gk-dl download="data-governance-policy.md" }
</div>

**Purpose.** The mandatory rules for handling data. Where the framework explains how governance works, this policy states what people must and must not do, in language you can hold someone to.

**When to use it.** Adopt alongside the data governance framework. Review annually, and reissue with attestation whenever the obligations change materially.

**How to use it.** Write every statement so a breach is observable — "must be registered before first use" can be checked, "should be managed appropriately" cannot. Number the statements so audit findings and exceptions can cite them precisely.

!!! tip "Closes assessment gaps"
    This template addresses **Q12** in the [readiness assessment](../assess/index.md).

---

## The template

### 1. Purpose

This policy sets the mandatory requirements for the management of data at
**[Organisation]**. It gives effect to [Data Governance Framework](../frameworks/data-governance-framework.md).

### 2. Scope

Applies to all staff, contractors, and third parties processing data on
behalf of the organisation, in all systems and locations.

### 3. Policy statements

**Ownership**

1. Every data domain **must** have a named Data Owner recorded in the
   [Data Asset Register](../registers/data-asset-register.md).
2. Data assets of material significance **must** be registered before first
   production use.

**Classification & handling**

3. All data **must** be classified per [Data Classification & Handling Policy](data-classification-policy.md).
4. Data **must** be handled in line with the controls for its classification,
   including when used as input to any AI tool.
5. Restricted or Confidential data **must not** be entered into any AI
   service that has not been approved for that classification.

**Lawfulness**

6. A lawful basis **must** be identified and recorded before personal data is
   processed, and recorded in the [Processing & DPIA Log](../registers/processing-dpia-log.md).
7. Secondary use of personal data **must** be assessed for compatibility
   before it proceeds.

**Quality**

8. Data Owners **must** define quality thresholds for their domain per
   [Data Quality Standard](data-quality-standard.md).
9. Quality breaches **must** be logged and remediated within the agreed
   timeframe.

**Access**

10. Access **must** be granted on least privilege and reviewed at least
    **[annually]**.
11. Access to Restricted data **must** be approved by the Data Owner.

**Retention & disposal**

12. Data **must not** be retained beyond the period in the retention
    schedule.
13. Disposal **must** be verifiable and recorded.

### 4. Roles & responsibilities

See [Roles & Responsibilities](../operating-model/roles-responsibilities.md). In summary: Owners are accountable, Stewards
operate, Custodians enforce technically, and every user complies.

### 5. Exceptions

Requested from the Data Owner, approved by **[the committee]**, recorded with
a **mandatory expiry date**, and reported at each committee meeting. An
exception without an expiry is a silent policy change.

### 6. Compliance

Breaches are handled under **[the disciplinary / supplier management
process]**. Material breaches are reported to **[the committee]** and logged
in the [Issue & Incident Log](../registers/incident-log.md).

### 7. Review

| Version | Date | Owner | Approved by | Next review |
|---|---|---|---|---|
| 0.1 | [date] | [role] | [committee] | [date] |

---

## Adaptation notes

- **Small organisations:** Statements 1–7 and 12 are the irreducible core. Add the rest as you grow rather than publishing rules you cannot enforce.
- **Regulated sectors:** Cross-reference each statement to the supervisory requirement it satisfies, so audit can trace obligation to control in one hop.
- **Heavy SaaS estates:** Statement 5 is the one that gets breached most. Pair it with an approved tool list people can actually find, or it becomes shelf-ware.

## Related

- [Data Governance Framework](../frameworks/data-governance-framework.md) — <span class="pill ready">Ready</span>
- [Data Classification & Handling Policy](data-classification-policy.md) — <span class="pill ready">Ready</span>
- [Data Quality Standard](data-quality-standard.md) — <span class="pill ready">Ready</span>
- [Processing & DPIA Log](../registers/processing-dpia-log.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
