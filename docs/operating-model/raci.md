<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/templates.yml
     Regenerate with: python tools/build_content.py -->


# RACI Matrix

<div class="gk-dochead" markdown>
<span class="gk-dochead-meta" markdown>
<span class="pill ready">Ready</span>
</span>
<span class="gk-dochead-dl" markdown>
[:material-file-word: Word](../downloads/raci.docx){ .md-button .gk-dl download } [:material-language-markdown: Markdown](../downloads/raci.md.txt){ .md-button .gk-dl download="raci.md" }
</span>
</div>

!!! example "See this filled in"
    A [worked example](../examples/raci.md) shows this
    template completed for a fictional mid-size company.

**Purpose.** Removes ambiguity about who does what. For every significant governance activity it names exactly one accountable party, so decisions have an owner and gaps become visible before they become incidents.

**When to use it.** Agree it when you stand up the operating model, and revisit whenever roles change or an escalation reveals that nobody owned something.

**How to use it.** Fill it in a room with the actual people, not in a document sent round for comment — the value is in the argument about who is accountable. Enforce one A per row. If two functions both claim accountability, you have found a problem worth resolving now rather than during an incident.

!!! tip "Closes assessment gaps"
    This template addresses **Q01**, **Q31**, **Q32** in the [readiness assessment](../assess/index.md).

---

## The template

### Legend

| Letter | Meaning |
|---|---|
| **R** | Responsible — does the work |
| **A** | Accountable — answerable for the outcome (**exactly one per row**) |
| **C** | Consulted — input sought before the decision |
| **I** | Informed — told after the decision |

### Matrix

Columns are illustrative roles. Replace with your own.

| Activity | Board | Committee | Gov Lead | Data Owner | AI Owner | ML Team | Legal/DPO | Security | Audit |
|---|---|---|---|---|---|---|---|---|---|
| **Strategy & mandate** | | | | | | | | | |
| Approve governance charter | **A** | R | R | C | C | I | C | C | I |
| Set risk appetite | **A** | R | C | C | C | I | C | C | I |
| Approve frameworks & policies | I | **A** | R | C | C | C | C | C | I |
| **Inventory & classification** | | | | | | | | | |
| Maintain AI inventory | I | I | **A** | C | R | R | I | C | I |
| Classify AI system risk tier | I | C | **A** | C | R | C | C | C | I |
| Maintain data asset register | I | I | **A** | R | I | C | C | C | I |
| **Risk** | | | | | | | | | |
| Screen for prohibited practices | I | C | **A** | I | R | R | C | I | I |
| Complete AI risk assessment | I | C | C | C | **A** | R | C | C | I |
| Accept residual risk (high-risk) | I | **A** | R | C | C | I | C | C | I |
| Maintain risk register | I | C | **A** | R | R | C | C | C | I |
| **Build & deploy** | | | | | | | | | |
| Approve data for training | I | I | C | **A** | C | R | C | C | I |
| Produce model documentation | I | I | C | I | **A** | R | C | I | I |
| Approve deployment (high-risk) | I | **A** | R | C | R | C | C | C | I |
| Design human oversight | I | C | C | I | **A** | R | C | I | I |
| **Third party** | | | | | | | | | |
| Assess vendor AI risk | I | I | C | C | C | C | C | **A** | I |
| Negotiate AI contract terms | I | I | C | C | C | I | **A** | R | I |
| **Operate** | | | | | | | | | |
| Monitor performance & drift | I | I | C | I | **A** | R | I | C | I |
| Manage AI incidents | I | C | R | C | R | R | C | **A** | I |
| Report serious incident to authority | I | C | R | I | C | I | **A** | C | I |
| **Assurance** | | | | | | | | | |
| Report to board | **A** | R | R | I | I | I | C | C | C |
| Independent assurance | I | C | I | I | I | I | I | I | **A** |

### Validation

Before you sign it off, check:

- [ ] Every row has **exactly one A**. Two means nobody.
- [ ] Nobody is A on so many rows that it is not credible.
- [ ] Every A has the authority and budget to actually deliver.
- [ ] Rows with many Cs are reviewed — over-consultation is how decisions
      stall.
- [ ] Each named role has a real person behind it today.

!!! tip "The test that matters"
    Pick a row and ask the person marked A to describe what they would do if
    it went wrong tomorrow. If they cannot, the matrix is aspirational.

---

## Adaptation notes

- **Small organisations:** Collapse to four columns — Exec, Governance Lead, Delivery, Independent review. One person may hold several, which is fine as long as the accountability split is conscious and written down.
- **Three lines of defence:** Keep first line (own and manage), second line (challenge and advise), and third line (assure) strictly separated in the A column. The same function should never both perform and assure an activity.
- **Federated / multi-entity:** Add a column per entity, or produce one matrix per entity with a shared group-level row set, so local accountability is explicit.

## Related

- [Roles & Responsibilities](roles-responsibilities.md) — <span class="pill ready">Ready</span>
- [Decision Rights & Escalation](decision-rights.md) — <span class="pill ready">Ready</span>
- [Committee Charter (Terms of Reference)](committee-charter.md) — <span class="pill ready">Ready</span>

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
