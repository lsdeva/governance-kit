<!-- GENERATED FILE — DO NOT EDIT.
     Source: data/crosswalk.yml
     Regenerate with: python tools/build_content.py -->


# Standards crosswalk

The same control usually satisfies several frameworks at once. This maps the kit onto the major AI governance regimes, so you can build a control once and justify it against whichever standard you are held to — or wanted to cite when asking for budget.

!!! warning "Indicative, not certified equivalence"
    These mappings help you navigate. They are **not** certified
    equivalences, and clause numbering changes between editions.
    Verify against the standard itself before relying on a mapping in
    an audit or certification context.

## The frameworks

### [ISO/IEC 42001](https://www.iso.org/standard/81230.html)

*ISO/IEC 42001:2023 — AI management systems*

The certifiable AI management system standard. Structured like ISO 27001, so if you already hold that, the shape will be familiar.

**Best for:** Organisations wanting a certifiable, auditable management system.  
**Worth knowing:** Certification is against the management system, not against individual AI systems. Annex A controls are the part that maps most directly onto this kit.

### [NIST AI RMF](https://www.nist.gov/itl/ai-risk-management-framework)

*NIST AI Risk Management Framework 1.0*

Voluntary, outcome-based, and organised around four functions — Govern, Map, Measure, Manage. Widely used in the US and as a common language elsewhere.

**Best for:** US organisations, and anyone wanting a non-certifiable risk framework.  
**Worth knowing:** Not a compliance regime — nobody audits you against it. Its value is the vocabulary and the completeness check.

### [Singapore Model AI Governance Framework](https://www.pdpc.gov.sg/help-and-resources/2020/01/model-ai-governance-framework)

*Model AI Governance Framework (2nd ed.) & Model AI Governance Framework for Generative AI*

Practical, implementation-focused guidance from Singapore's IMDA/PDPC, with a strong emphasis on internal governance and human oversight.

**Best for:** APAC organisations, and anyone wanting worked implementation guidance.  
**Worth knowing:** The generative-AI framework (2024) is the more current of the two for LLM-based systems.

### [EU AI Act](https://eur-lex.europa.eu/eli/reg/2024/1689/oj)

*Regulation (EU) 2024/1689*

Binding law, risk-tiered, with penalties. The only entry here that can fine you.

**Best for:** Anyone placing AI on the EU market or whose output is used in the EU.  
**Worth knowing:** Obligations depend on your role (provider/deployer) and the system's risk tier. See the timeline for what applies when.

## The crosswalk

Read a row across to see how each regime expresses the same obligation, then use the templates in the last column to satisfy all of them at once.

| Theme | ISO/IEC 42001 | NIST AI RMF | Singapore Model AI Governance Framework | EU AI Act | Templates |
|---|---|---|---|---|---|
| **Leadership & accountability** | Cl. 5 Leadership; Cl. 5.3 Roles & responsibilities | GOVERN 1, GOVERN 2 — policies, accountability structures | Internal governance structures & measures | Art. 3, Art. 26 — operator obligations; named accountability | [Governance Charter](frameworks/governance-charter.md) · [Roles & Responsibilities](operating-model/roles-responsibilities.md) · [RACI Matrix](operating-model/raci.md) · [Committee Charter (Terms of Reference)](operating-model/committee-charter.md) |
| **Policy & management system** | Cl. 4-10 — the management system itself; A.2 AI policy | GOVERN 1.1 — legal and regulatory requirements understood | Internal governance — policies and SOPs | Art. 17 — quality management system (providers) | [AI Governance Framework](frameworks/ai-governance-framework.md) · [Data Governance Framework](frameworks/data-governance-framework.md) · [Data Governance Policy](policies/data-governance-policy.md) · [Acceptable AI Use Policy](policies/acceptable-ai-use-policy.md) |
| **Inventory & classification** | A.4 AI system impact assessment; A.6 AI system lifecycle | MAP 1, MAP 2 — context and categorisation | Determining the level of human involvement | Art. 6, Annex III — risk classification; Art. 49 registration | [AI System Inventory](registers/ai-system-inventory.md) · [Data Asset Register](registers/data-asset-register.md) |
| **Risk assessment** | Cl. 6.1 — risk and opportunity; A.5 impact assessment | MAP 5, MEASURE 2 — risk identification and analysis | Risk management and internal controls | Art. 9 — risk management system; Art. 27 FRIA | [AI Risk Assessment](risk/ai-risk-assessment.md) · [Risk Register](registers/risk-register.md) · [Maturity Assessment](frameworks/maturity-assessment.md) |
| **Data governance & quality** | A.7 Data for AI systems | MAP 2.3, MEASURE 2.2 — data quality and representativeness | Good data accountability practices | Art. 10 — data and data governance | [Data Governance Framework](frameworks/data-governance-framework.md) · [Data Quality Standard](policies/data-quality-standard.md) · [Data Classification & Handling Policy](policies/data-classification-policy.md) · [Data Asset Register](registers/data-asset-register.md) |
| **Documentation & traceability** | Cl. 7.5 Documented information; A.6.2 documentation | MAP 4, MEASURE 1 — documentation of methods and results | Traceability, reproducibility, auditability | Art. 11 & Annex IV — technical documentation; Art. 12 logging | [Model Card / Model Risk Documentation](risk/model-card.md) · [AI Development & Deployment Standard](policies/ai-development-standard.md) · [Issue & Incident Log](registers/incident-log.md) |
| **Human oversight** | A.9.2 — human oversight of AI systems | GOVERN 3.2, MANAGE 2.1 — human-AI configuration | Human-in-the-loop / over-the-loop / out-of-the-loop | Art. 14 — human oversight | [AI Governance Framework](frameworks/ai-governance-framework.md) · [Decision Rights & Escalation](operating-model/decision-rights.md) · [AI Risk Assessment](risk/ai-risk-assessment.md) |
| **Performance, robustness & security** | A.6.2.4 verification & validation; A.10 third-party security | MEASURE 2.5-2.7 — validity, reliability, security, resilience | Robustness, reproducibility, and testing | Art. 15 — accuracy, robustness, cybersecurity | [AI Development & Deployment Standard](policies/ai-development-standard.md) · [Model Card / Model Risk Documentation](risk/model-card.md) · [Control Library & Assurance Map](risk/control-library.md) |
| **Fairness & bias** | A.5.2, A.7.4 — impact on individuals and groups | MEASURE 2.11 — harmful bias and homogenisation | Fairness — dataset and model bias | Art. 10(2)(f), Art. 15 — bias examination; Recital 27 | [AI Risk Assessment](risk/ai-risk-assessment.md) · [Model Card / Model Risk Documentation](risk/model-card.md) · [Data Quality Standard](policies/data-quality-standard.md) |
| **Transparency & explainability** | A.8 Information for interested parties | MEASURE 2.8, MEASURE 2.9 — transparency and explainability | Transparency, explainability, and communication | Art. 13 instructions for use; Art. 50 transparency to people | [Acceptable AI Use Policy](policies/acceptable-ai-use-policy.md) · [Model Card / Model Risk Documentation](risk/model-card.md) · [AI Governance Framework](frameworks/ai-governance-framework.md) |
| **Third-party & supply chain** | A.10 — third-party and customer relationships | MAP 4.1, MANAGE 3 — third-party risks | Vendor and deployment considerations | Art. 25 — responsibilities along the value chain; Art. 53 GPAI | [Third-Party AI Risk Policy](policies/third-party-ai-risk-policy.md) · [AI System Inventory](registers/ai-system-inventory.md) |
| **Monitoring & incidents** | Cl. 9 Performance evaluation; Cl. 10.2 Nonconformity | MANAGE 4 — monitoring, feedback, and incident response | Monitoring and review; incident management | Art. 72 post-market monitoring; Art. 73 serious incidents | [Issue & Incident Log](registers/incident-log.md) · [KPI / KRI Dashboard](board/kpi-dashboard.md) · [Control Library & Assurance Map](risk/control-library.md) |
| **Assurance & audit** | Cl. 9.2 Internal audit; Cl. 9.3 Management review | GOVERN 4.1 — organisational risk culture and assurance | Internal audit and independent review | Art. 43 conformity assessment; Art. 74 market surveillance | [Control Library & Assurance Map](risk/control-library.md) · [Maturity Assessment](frameworks/maturity-assessment.md) · [Board Pack Template](board/board-pack.md) |
| **Competence & literacy** | Cl. 7.2 Competence; Cl. 7.3 Awareness | GOVERN 3, GOVERN 4 — workforce diversity and culture | Staff training and capability | Art. 4 — AI literacy | [Acceptable AI Use Policy](policies/acceptable-ai-use-policy.md) · [Roles & Responsibilities](operating-model/roles-responsibilities.md) · [Governance Charter](frameworks/governance-charter.md) |
| **Privacy & data protection** | A.7.3 — privacy in AI data; links to ISO/IEC 27701 | MEASURE 2.10 — privacy risk | PDPA alignment; data minimisation | Art. 27 FRIA; interacts with GDPR Art. 35 | [Processing & DPIA Log](registers/processing-dpia-log.md) · [Data Classification & Handling Policy](policies/data-classification-policy.md) · [Data Governance Policy](policies/data-governance-policy.md) |

## Using this in practice

- **Certifying to ISO/IEC 42001?** The crosswalk shows which templates produce the documented information each clause expects. You will still need a management system around them.
- **Using NIST AI RMF as your vocabulary?** The functions map cleanly onto the kit's structure: Govern to the operating model, Map to the registers, Measure to risk and control, Manage to monitoring and reporting.
- **Operating in several jurisdictions?** Build to the strictest applicable requirement per theme, then map outwards. Maintaining parallel control sets per regime is how governance programmes collapse under their own weight.

!!! warning "Not legal advice"
    These templates are a head start, not a substitute for professional
    judgement. Adapt them to your jurisdiction, sector, and risk appetite, and
    have qualified counsel review anything material before you rely on it.
