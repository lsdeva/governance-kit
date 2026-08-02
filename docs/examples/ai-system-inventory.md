<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/examples.yml
     Regenerate with: python tools/build_content.py -->


# AI System Inventory — worked example

!!! info "A worked example, not a template"
    This shows Meridian Health Analytics — a fictional company — using the
    [AI System Inventory](../registers/ai-system-inventory.md). To start your own,
    use the blank template. Details here are illustrative.

Meridian's inventory after its first discovery sweep. Note that six of the thirteen systems were found inside software the company had already bought — nobody had procured them as AI, so nobody had assessed them.

---

### The inventory

| ID | System | Owner | Source | Role | Tier | Personal data | Stage | Next review |
|---|---|---|---|---|---|---|---|---|
| AI-001 | Referral triage prioritisation | R. Okafor (Clinical Dir.) | Build | **Provider** | **High-risk** | Yes | Live | 2026-10-01 |
| AI-002 | Bed-demand forecasting | S. Lindqvist (Ops) | Build | Provider | Minimal | No | Live | 2027-01-15 |
| AI-003 | Clinical coding assistant | R. Okafor | Build | Provider | Limited | Yes | Development | 2026-09-01 |
| AI-004 | CV screening (recruitment) | J. Mensah (People) | Buy | Deployer | **High-risk** | Yes | Live | 2026-09-15 |
| AI-005 | Support ticket summarisation | T. Bianchi (Support) | Buy | Deployer | Limited | Yes | Live | 2026-11-01 |
| AI-006 | Sales forecasting | M. Duarte (Revenue) | Buy | Deployer | Minimal | No | Live | 2027-02-01 |
| AI-007 | Contract review assistant | A. Whitfield (Legal) | Buy | Deployer | Limited | Yes | Pilot | 2026-09-30 |
| AI-008 | CRM "next best action" | M. Duarte | **Embedded** | Deployer | Minimal | Yes | Live | 2027-01-10 |
| AI-009 | HR sentiment analysis | J. Mensah | **Embedded** | Deployer | **Prohibited — disabled** | Yes | Retired | — |
| AI-010 | Helpdesk auto-reply | T. Bianchi | **Embedded** | Deployer | Limited | Yes | Live | 2026-12-01 |
| AI-011 | Meeting transcription & summary | IT | **Embedded** | Deployer | Limited | Yes | Live | 2026-12-01 |
| AI-012 | Code completion assistant | K. Ivanov (Eng) | **Embedded** | Deployer | Minimal | No | Live | 2027-03-01 |
| AI-013 | Marketing copy generation | M. Duarte | **Embedded** | Deployer | Limited | No | Live | 2027-01-20 |

!!! danger "AI-009 was switched off"
    Meridian's HR platform shipped a "team sentiment" feature that inferred
    employee mood from message tone. That is **emotion inference in the
    workplace — prohibited under Art. 5**, not merely high-risk. It was
    disabled within 48 hours of discovery and logged as INC-004. Nobody had
    procured it; it arrived in a vendor release.

### Classification decision record

| System | Tier | Rationale | Decided by | Date | Challenged? |
|---|---|---|---|---|---|
| AI-001 | High-risk | Annex III(5)(a) — access to essential public services; prioritises patient referrals | Committee | 2026-03-12 | Yes — Clinical argued decision-support only. Committee held that it materially determines order of access. |
| AI-004 | High-risk | Annex III(4)(a) — employment; screens candidates | Committee | 2026-03-12 | No |
| AI-009 | Prohibited | Art. 5(1)(f) — emotion inference in the workplace | Committee (emergency) | 2026-04-02 | No |
| AI-005 | Limited | Art. 50 transparency; summarises but does not decide | Gov Lead | 2026-03-19 | No |

!!! tip "The challenge on AI-001 is the important row"
    Clinical services argued the tool was "only decision support" because a
    coordinator reviews every output. The committee disagreed: the
    coordinator accepted the ranking in 96% of cases, so in practice the
    system determined the order. **Recording the challenge, and who
    overruled whom, is what makes the classification defensible later.**

### What the discovery sweep found

| Where they looked | Systems found | Notes |
|---|---|---|
| Asked each team | 5 | What people thought of as "our AI" |
| SaaS contracts & release notes | **6** | Nobody had procured these as AI |
| Expense claims | 1 | An individual ChatGPT Plus subscription |
| SSO logs | 1 | A tool in use by two people, never approved |
| Code repositories | 0 | Already captured |

Initial estimate from department heads: **five systems.** Actual: **thirteen.**

---

## What to take from this

- Ask departments *and* read your SaaS release notes. The gap between what teams report and what is actually running is where the risk lives.
- Record the classification *rationale* and any challenge to it. A tier label with no reasoning cannot be defended or sensibly reviewed.
- Expect to find at least one thing you must switch off.

[Use the blank AI System Inventory](../registers/ai-system-inventory.md){ .md-button .md-button--primary }

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
