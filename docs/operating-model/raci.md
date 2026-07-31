# RACI Matrix — Data & AI Governance

<span class="pill ready">Ready</span>

**Purpose.** Remove ambiguity about who does what. A RACI assigns, for each
governance activity, who is **R**esponsible (does the work), **A**ccountable
(owns the outcome — exactly one per activity), **C**onsulted (gives input), and
**I**nformed (kept in the loop).

**When to use it.** Ratify alongside your framework and committee terms of
reference; revisit whenever roles or the operating model change.

**How to use it.** Rename the columns to match your actual roles, then walk each
row with the people involved until every activity has exactly one **A**. Argument
during this exercise is the point — it surfaces the gaps.

---

## The template

Legend: **R** Responsible · **A** Accountable · **C** Consulted · **I** Informed

| Activity | Board / ARC | Gov. Committee | AI/Data Owner | Model/Product Team | Risk & Compliance | Legal / DPO | Internal Audit |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Set risk appetite | **A** | R | C | I | C | C | I |
| Approve governance framework | A | **R** | C | I | C | C | I |
| Maintain AI system inventory | I | A | R | R | C | I | I |
| Classify AI system risk tier | I | A | R | C | C | C | I |
| Screen for prohibited practices | I | A | R | C | C | **C** | I |
| Approve high-risk deployment | I | **A** | R | C | C | C | I |
| Conduct AI risk assessment | I | I | A | R | C | C | I |
| Maintain technical documentation | I | I | A | **R** | I | I | I |
| Ensure human oversight in operation | I | I | **A** | R | C | I | I |
| Monitor models in production | I | I | A | R | C | I | I |
| Manage third-party / vendor AI risk | I | A | R | C | C | **C** | I |
| Complete DPIA / privacy assessment | I | I | C | R | C | **A** | I |
| Report to the board | **A** | R | C | I | C | C | I |
| Provide independent assurance | I | I | I | I | C | C | **A** |
| Manage AI incidents | I | A | R | R | C | C | I |
| Deliver AI literacy / training | I | A | R | C | C | C | I |

!!! tip "The one-A rule"
    Each row must have **exactly one A**. Two A's means shared accountability,
    which in practice means no accountability. If you can't agree who the single
    A is, that's a decision-rights problem — resolve it in the
    [Decision Rights & Escalation](decision-rights.md) model.

---

## Adaptation notes

- **Fewer roles?** Merge columns (e.g. Risk & Compliance + Legal) but preserve
  the single-A discipline per row.
- **Product-led org:** you may split "Model/Product Team" into data science,
  engineering, and product — add columns and re-walk the rows.
- **Regulated firms:** keep Internal Audit strictly to assurance (I on delivery
  activities, A only on independent assurance) to preserve three-lines
  independence.
