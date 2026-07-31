# EU AI Act — 25-point readiness checklist

<span class="pill ready">Ready</span>

**Purpose.** A fast self-assessment of where your organisation stands against the
EU AI Act. Work through it, tick what's true today, and treat every unticked box
as a backlog item. Pair it with the [timeline](timeline.md) to prioritise.

**When to use it.** As a first baseline, then quarterly, and again whenever you
launch or materially change an AI system.

**How to score.** Count your ticks. **0–8:** early — start with inventory and
prohibited-practice checks. **9–17:** developing — close policy and documentation
gaps. **18–25:** mature — focus on assurance and continuous monitoring.

!!! note "How to use these checkboxes"
    On the published site the boxes are illustrative. To *track* your status,
    copy this page into your own register or fork the repo and tick items in
    Markdown (`- [x]`).

## 1. Scope & governance

- [ ] 1. We have a named executive owner accountable for AI Act compliance.
- [ ] 2. AI governance is on the agenda of a standing committee with minuted decisions.
- [ ] 3. We understand which roles we play per system — **provider**, **deployer**, importer, or distributor.
- [ ] 4. We have assessed which parts of the Act apply given our EU market exposure.

## 2. Inventory & classification

- [ ] 5. Every AI system in use or development is captured in a central [inventory](../registers/ai-system-inventory.md).
- [ ] 6. Each system is classified by risk tier: prohibited, high-risk (Annex I / III), limited (transparency), or minimal.
- [ ] 7. General-purpose AI (GPAI) models we build or integrate are identified and their obligations mapped.
- [ ] 8. The inventory records purpose, data sources, model/vendor, and lifecycle stage.

## 3. Prohibited practices (in force since Feb 2025)

- [ ] 9. We have confirmed no system performs a prohibited practice (e.g. social scoring, manipulative techniques, untargeted facial scraping).
- [ ] 10. We screen new use cases against the prohibited list *before* development starts.

## 4. High-risk obligations (Annex III → Dec 2027; Annex I → Aug 2028)

- [ ] 11. High-risk systems have a documented **risk management** process across the lifecycle.
- [ ] 12. **Data governance** for training/validation/test data addresses relevance, representativeness, and bias.
- [ ] 13. **Technical documentation** is maintained and kept current for each high-risk system.
- [ ] 14. Systems **automatically log** events sufficient for traceability.
- [ ] 15. **Human oversight** measures are designed in and actually operable by real people.
- [ ] 16. Systems meet expected **accuracy, robustness, and cybersecurity** levels, with evidence.
- [ ] 17. A **conformity assessment** route is identified and planned before the applicable deadline.
- [ ] 18. **Post-market monitoring** and a serious-incident reporting process exist.

## 5. Transparency (Art. 50 → Aug 2026, grace to Dec 2026)

- [ ] 19. Users are told when they are interacting with an AI system (e.g. chatbots).
- [ ] 20. AI-generated or manipulated content (deepfakes, synthetic media) is marked / watermarked.
- [ ] 21. Emotion-recognition or biometric-categorisation use, if any, is disclosed to affected people.

## 6. GPAI, third parties & data protection

- [ ] 22. For GPAI we use, we hold provider documentation and understand copyright/training-data transparency expectations.
- [ ] 23. **Vendor contracts** flow down AI Act obligations and evidence rights (see [third-party AI risk policy](../policies/third-party-ai-risk-policy.md)).
- [ ] 24. Where personal data is involved, a **DPIA / GDPR** assessment is completed and linked (see [processing & DPIA log](../registers/processing-dpia-log.md)).

## 7. Skills & culture

- [ ] 25. Staff who build, buy, or operate AI have **AI literacy** appropriate to their role.

---

## Turn gaps into action

Every unticked item maps to something in this kit:

| Gap area | Start here |
|---|---|
| No inventory / classification | [AI System Inventory](../registers/ai-system-inventory.md) |
| No risk process | [AI Risk Assessment](../risk/ai-risk-assessment.md) |
| Thin documentation | [Model Card / Model Risk Doc](../risk/model-card.md) |
| Unclear accountability | [RACI](../operating-model/raci.md) · [Roles](../operating-model/roles-responsibilities.md) |
| Vendor exposure | [Third-Party AI Risk Policy](../policies/third-party-ai-risk-policy.md) |
| Nothing for the board | [Board Pack](../board/board-pack.md) |

!!! warning "Not legal advice"
    This checklist is a planning aid based on a reading of the AI Act as amended
    by the 2026 Digital Omnibus. It is not exhaustive and not a substitute for
    legal analysis of your specific circumstances. Confirm obligations with
    qualified counsel and the official EU sources — see the [timeline](timeline.md).
