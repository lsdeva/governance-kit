<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/examples.yml
     Regenerate with: python tools/build_content.py -->


# RACI Matrix — worked example

!!! info "A worked example, not a template"
    This shows Meridian Health Analytics — a fictional company — using the
    [RACI Matrix](../operating-model/raci.md). To start your own,
    use the blank template. Details here are illustrative.

Meridian's RACI after the argument that produced it. Two rows were disputed for a fortnight, which is the useful part — those are exactly the rows that would have failed during an incident.

---

### The matrix

Roles are real people at Meridian. **A** = accountable, one per row.

| Activity | Board | Committee | Gov Lead (Nakamura) | Data Owner | AI Owner | Eng (Ivanov) | Legal (Whitfield) | Security | Audit |
|---|---|---|---|---|---|---|---|---|---|
| **Strategy** | | | | | | | | | |
| Approve governance charter | **A** | R | R | C | C | I | C | C | I |
| Set risk appetite | **A** | R | C | C | C | I | C | C | I |
| Approve policies | I | **A** | R | C | C | C | C | C | I |
| **Inventory** | | | | | | | | | |
| Maintain AI inventory | I | I | **A** | C | R | R | I | C | I |
| Classify risk tier | I | C | **A** | C | R | C | C | C | I |
| Quarterly SaaS release-note sweep | I | I | **A** | I | I | R | I | R | I |
| **Risk** | | | | | | | | | |
| Screen prohibited practices | I | C | **A** | I | R | R | C | I | I |
| Complete AI risk assessment | I | C | C | C | **A** | R | C | C | I |
| Accept residual risk (high-risk) | I | **A** | R | C | C | I | C | C | I |
| **Build & operate** | | | | | | | | | |
| Approve data for training | I | I | C | **A** | C | R | C | C | I |
| Approve high-risk deployment | I | **A** | R | C | R | C | C | C | I |
| Design human oversight | I | C | C | I | **A** | R | C | I | I |
| Monitor override rates | I | I | C | I | **A** | R | I | I | I |
| **Suspend a live system** | I | I | **A** | I | R | R | I | R | I |
| **Third party** | | | | | | | | | |
| Assess vendor AI risk | I | I | C | C | C | C | C | **A** | I |
| Negotiate AI contract terms | I | I | C | I | C | I | **A** | R | I |
| **Assurance** | | | | | | | | | |
| Report to board | **A** | R | R | I | I | I | C | C | C |
| Independent assurance | I | C | I | I | I | I | I | I | **A** |

### The two rows that were argued about

!!! warning "\"Complete AI risk assessment\" — Governance vs. the AI Owner"
    Governance initially held the **A**, on the basis that it owned the
    process. The clinical AI owner objected: they were being made
    responsible for a system's safety while someone else was accountable for
    assessing it.

    **Resolved in favour of the AI Owner holding A**, with Governance as C.
    The person accountable for the system's outcomes should be accountable
    for understanding its risks. Governance owns the *method*, not the
    *conclusion*.

!!! warning "\"Suspend a live system\" — everyone wanted someone else to hold it"
    Nobody wanted to be accountable for stopping a clinical system. The
    committee initially held the **A**, which would have meant a system
    causing harm stayed live until a quorum could be convened.

    **Resolved: Gov Lead holds A, with Security and the AI Owner both able
    to act (R).** Any of the three can stop a system without permission;
    notification follows within 24 hours. The accountability for *having a
    working suspension capability* sits with one person.

### Validation

- [x] Every row has exactly one **A**
- [x] No one person is **A** on more than 6 rows — Nakamura holds 5
- [x] Every **A** has budget and authority to deliver
- [x] Audit is **A** only on independent assurance, never on an activity it assures
- [x] Every named role has a real person in post today

---

## What to take from this

- The argument is the deliverable. Rows nobody disputes are rows nobody has thought about.
- Accountability for assessing a risk belongs with whoever is accountable for the outcome, not with the team that owns the process.
- Distribute the right to stop a system. If suspension needs a meeting, it will not happen in time.

[Use the blank RACI Matrix](../operating-model/raci.md){ .md-button .md-button--primary }

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
