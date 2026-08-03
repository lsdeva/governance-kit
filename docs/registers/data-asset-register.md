<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# Data Asset Register

<div class="gk-dochead" markdown>
<span class="gk-dochead-meta" markdown>
<span class="pill ready">Ready</span>
</span>
<span class="gk-dochead-dl" markdown>
[:material-file-word: Word](../downloads/data-asset-register.docx){ .md-button .gk-dl download } [:material-file-excel: Excel](../downloads/data-asset-register.xlsx){ .md-button .gk-dl download } [:material-language-markdown: Markdown](../downloads/data-asset-register.md.txt){ .md-button .gk-dl download="data-asset-register.md" }
</span>
</div>

**Purpose.** The catalogue of what data you hold, who owns it, how sensitive it is, and where it lives. Almost every other governance control depends on it.

**When to use it.** Start it early and keep it current. Review entries at least annually, and whenever a system or a data flow changes.

**How to use it.** Register your ten most important assets properly rather than every asset badly. A short accurate register is used; an exhaustive stale one is not. Set a review date on every row so staleness becomes visible.

!!! tip "Closes assessment gaps"
    This template addresses **Q05**, **Q08**, **Q26**, **Q28** in the [readiness assessment](../assess/index.md).

---

## Fill it in here

Work directly in the browser — nothing is uploaded, and your rows are saved on this device. Download to Excel whenever you want, or save a file you can reopen later.

<div class="gk-reg-host" data-register="data-asset-register" data-src="../../assess/register-data.json"><p class="gk-muted">Loading the editable register…</p></div>

---

## The template

### Register fields

| Field | Why it matters |
|---|---|
| Asset ID | Stable reference for linking from other registers |
| Name & description | What it actually is, in business language |
| Domain | Links to the owner |
| Data Owner | Named accountable person |
| Steward | Day-to-day contact |
| Classification | Drives handling rules |
| Personal data? | Triggers DPIA and lawful basis questions |
| Special category? | Triggers additional protection |
| System of record | Where the authoritative copy lives |
| Source | Where it came from; licence if external |
| Lawful basis | Required for personal data |
| Used in AI? | Links to [AI System Inventory](ai-system-inventory.md) |
| Quality thresholds | Links to [Data Quality Standard](../policies/data-quality-standard.md) |
| Retention | How long, and under what rule |
| Last reviewed / next review | Makes staleness visible |

### The register

| ID | Asset | Domain | Owner | Class. | Personal? | System | Used in AI | Retention | Next review |
|---|---|---|---|---|---|---|---|---|---|
| DA-001 | Customer master | Customer | [name] | Confidential | Yes | [CRM] | AI-003 | [7y] | [date] |
| DA-002 | Employee records | Employee | [name] | Confidential | Yes | [HRIS] | AI-007 | [6y post-exit] | [date] |
| DA-003 | Product telemetry | Product | [name] | Internal | No | [warehouse] | AI-001 | [2y] | [date] |
| DA-004 | Support transcripts | Customer | [name] | Confidential | Yes | [helpdesk] | AI-002 | [3y] | [date] |

### Practical guidance

**Start where the risk is.** Personal data, regulated data, and anything
feeding an AI system first. Marketing collateral can wait.

**One row per asset, not per table.** "Customer master" is an asset;
forty database tables that compose it are not forty assets.

**The "used in AI" column earns its keep.** When a model misbehaves, this is
how you find what fed it. When a data subject exercises their rights, it is
how you find where they appear.

!!! tip "The staleness test"
    A register nobody has updated in six months is a liability, not a
    control — it gives false assurance. Better to register fewer assets and
    keep them true.

### Maintenance

| Trigger | Action |
|---|---|
| New system or data flow | Register before production use |
| Classification change | Update; review downstream handling |
| New AI use of the asset | Update the AI column; check lawful basis covers it |
| Annual review | Owner confirms accuracy or corrects |

---

## Adaptation notes

- **Small organisations:** A spreadsheet with the first eight columns is genuinely enough. Do not buy a catalogue tool before you have proven you will maintain a list.
- **Existing catalogue tooling:** Do not duplicate. Add the governance-specific fields — owner, classification, lawful basis, AI usage — to what you already have.
- **Regulated sectors:** Add lineage and critical-data-element flags, and link to your regulatory reporting inventory.

## Related

- [Data Governance Framework](../frameworks/data-governance-framework.md) — <span class="pill ready">Ready</span>
- [Data Classification & Handling Policy](../policies/data-classification-policy.md) — <span class="pill ready">Ready</span>
- [AI System Inventory](ai-system-inventory.md) — <span class="pill ready">Ready</span>
- [Processing & DPIA Log](processing-dpia-log.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
