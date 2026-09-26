// The worked example: an illustrative sanctions-screening triage agent, live
// at T2 and building the evidence case for promotion to T3. Every value is
// illustrative, following the examples in the operating-model source pack.

import { D } from './data.js';
import { update, uid } from './store.js';

const day = (iso) => new Date(iso + 'T10:00:00Z').getTime();

function f(status, values, extra = {}) {
  return { values, status, history: [], comments: [], acks: [], approval: null, cycle: 1, ...extra };
}
function approved(values, by, role, at, comments = []) {
  const x = f('approved', values);
  x.history = [
    { at: at - 5 * 864e5, role: '', by: '', action: 'Submitted for review' },
    { at, role, by, action: 'Approved' },
  ];
  x.approval = { role, by, at, note: '', cycle: 1 };
  x.comments = comments.map((c) => ({ id: uid('c'), cycle: 1, verdict: 'ok', at: at - 2 * 864e5, ...c }));
  return x;
}
const signed = (signoffs, checks) => ({ checks: Object.fromEntries(checks.map((c) => [c, true])), checkedBy: {}, signoffs, history: Object.entries(signoffs).map(([role, s]) => ({ at: s.at, role, by: s.by, action: 'Signed pass', note: s.rationale })), cycle: 1 });
const pass = (by, at, rationale, evidence = '') => ({ decision: 'pass', by, at, rationale, evidence });

export function loadDemo() {
  const A = {
    id: uid('ag'), demo: true, created: day('2026-01-12'), updated: Date.now(), name: 'Sanctions alert triage (L1)',
    forms: {}, gates: {}, changes: [], decisions: [], maturity: { level: 'L4', at: day('2026-09-02'), answers: { m00: 'on', m02: 'on', mown: 'on', m05: 'on', mgate: 'on', m0708: 'on', m09: 'on', mtiles: 'on', mtol: 'on', mkill: 'on' } },
  };
  const F = A.forms;

  F['00'] = approved({
    agent_id: 'sanctions-triage-l1', name: 'Sanctions alert triage (L1)', business_unit: 'Financial crime operations', status: 'live',
    accountable_executive: 'Head of Financial Crime (J. Okafor)', agent_owner: 'Product lead, screening ops (M. Tan)',
    tier: 'T2', tier_rationale: 'Starts at T2: the agent proposes a disposition and an analyst approves every closure. Target T3 for name-match alerts below 0.82 once the sampling evidence supports it.',
    consequence_class: 'High', reversibility: 'Reversible with effort', data_classification: 'Confidential: customer personal data and payment data',
    models: [{ model: 'vendor-x', vendor: 'Vendor X', version: '4.2', in_model_inventory: 'yes' }], uses_vendor: 'yes', confidence_routing: 'yes', hosting: 'Vendor-hosted model in-region; agent and gate on internal platform',
    link_01: 'BC-2026-014', link_02: 'repo: fincrime/sanctions-triage-l1/policy.yaml', link_06: 'registry: sanctions-triage-l1@1.4.0', link_11: 'OVS-TR-003', next_review: '2026-12-15', sunset_date: '2027-09-30',
  }, 'R. Mehta', 'RC', day('2026-01-20'), [{ role: 'SEC', by: 'L. Chen', text: 'Identity issuer reads tier from this entry. OK.' }]);

  F['01'] = approved({
    decision_delegated: 'Dispose first-line name-screening alerts: close clear false positives, escalate everything else to an analyst.',
    population: 'Name-screening alerts from payment and onboarding screening, excluding comprehensive-sanctions programmes, PEP and adverse-media entries.', monthly_volume: '10000',
    alternatives: [
      { alternative: 'Deterministic rule', description: 'Tighter fuzzy-match thresholds', why_rejected: 'Cuts alerts by 18% but misses transliterated true matches in testing.' },
      { alternative: 'Process change', description: 'Offshore L1 review', why_rejected: 'Same error profile, higher cycle time, no evidence trail.' },
      { alternative: 'Scorecard', description: 'Static risk score to sort the queue', why_rejected: 'Prioritises but does not dispose. Benefit under 10%.' },
    ],
    benefit_hours: '1600', benefit_cycle_time: 'Median alert age from 26h to 3h', sampling_cost_per_year: '96000',
    sampling_cost_basis: '300-case monthly floor × 12 min per case × 12 months ≈ 720 reviewer hours, plus calibration rounds, at a loaded senior-analyst rate.',
    consequence_class: 'High', reversibility: 'Reversible with effort', exit_metric: 'Retire if realised analyst-hour benefit is below 40% of the claim at 12 months, or if the disagreement rate breaches tolerance for two consecutive rounds.', benefit_review_date: '2027-01-31',
  }, 'J. Okafor', 'AE', day('2026-01-28'), [{ role: 'RC', by: 'R. Mehta', text: 'Sampling cost is on the benefit line. Concur with T2 start.' }, { role: 'OPS', by: 'S. Ali', text: 'Volumes match the queue data.' }, { role: 'AOW', by: 'M. Tan', text: 'Agreed.' }]);

  F['16'] = approved({
    vendors: [{ vendor: 'Vendor X', component: 'Foundation model', component_type: 'Model', version: '4.2' }],
    controls_claimed: ['AGT-031 No training on customer data', 'AGT-044 Model version pinning'],
    claims: [{ control_id: 'AGT-031', claim: 'Customer data is not used for training', evidence_type: 'Attestation', scope: 'Enterprise tier, EU region', evidence_ref: 'VX-ATT-2026-07' }, { control_id: 'AGT-044', claim: 'Versions are pinned and changes notified 30 days ahead', evidence_type: 'Test report', scope: 'API v3', evidence_ref: 'TR-VX-112' }],
    contract_no_training: 'yes', contract_log_export: 'yes', contract_audit_rights: 'yes', contract_incident_notice: '24 hours', contract_ref: 'MSA-VX-2026 sched. 4',
    record_export: 'Not applicable. The decision records are produced by our own platform, not the vendor.', exit_plan: 'Alternate model evaluated in 13 regression suite; switch is a G5 material change.',
  }, 'R. Mehta', 'RC', day('2026-05-20'));

  F['02'] = approved({
    purpose: 'Dispose first-line name-screening alerts.', tier: 'T2', acts_on_behalf_of: 'ops.fincrime.queue',
    auto_case_types: ['name_match'], auto_value_limits: 'At T2 every closure is approved by an analyst. Target T3: auto-close only below match score 0.82.', auto_jurisdictions: 'Excludes comprehensive-sanctions programmes.',
    must_escalate: ['list_version_changed_since_last_calibration', 'any_field_missing_in_grounds', 'confidence < 0.90', 'PEP or adverse-media list entry'],
    routing_threshold: 'Target: points to band 0.90–0.95 in 10 once calibrated', may_read: ['alert', 'kyc_record', 'payment', 'list_entry'], may_not_read: ['SAR_filings', 'investigator_notes'],
    tools: [{ tool: 'kyc.read', permission: 'read', limits: '' }, { tool: 'alert.close', permission: 'act', limits: 'T2: analyst approval required' }, { tool: 'alert.escalate', permission: 'act', limits: '' }],
    coordination: 'No other agents. Escalations land in the L2 analyst queue.', control_profile: 'tier-2', sampling_rate_pct: '3', sampling_floor: '300', tolerance_pct: '2.0', canary_target: '95',
    material_change: ['model_version', 'prompt_hash', 'tool_manifest_hash', 'list_format'], on_material_change: 'Full sample; calibration void.', reapprover: 'RC', sunset: '2027-09-30',
    policy_yaml: D.art['02'].example.replace('tier: T3', 'tier: T2'),
  }, 'R. Mehta', 'RC', day('2026-03-02'), [{ role: 'SEC', by: 'L. Chen', text: 'Tool list matches gateway allowlist.' }, { role: 'ENG', by: 'D. Novak', text: 'Gate compiles from this file.' }, { role: 'OPS', by: 'S. Ali', text: 'Escalation list is workable.' }, { role: 'DO', by: 'P. Rossi', text: 'may_not_read confirmed.' }]);

  F['03'] = approved({
    control_structure: 'Agent → policy gate → tool gateway → case system. Analyst approves each closure (T2). Independent review samples monthly.',
    perspectives_read: ['The attacker', 'A supervisor two years from now', 'Operations at 3am', 'The person who was wronged'], asi_prompts: ['ASI01', 'ASI02', 'ASI03', 'ASI06', 'ASI09'],
    hazards: [
      { hazard_id: 'H-01', loss: 'Sanctioned party paid', unsafe_control_action: 'Agent closes a true match', causal_scenario: 'Transliteration variant plus stale list version', interaction: 'yes', consequence_class: 'Severe', controls: 'AGT-022, AGT-030', residual_owner: 'AOW' },
      { hazard_id: 'H-02', loss: 'Oversight becomes a rubber stamp', unsafe_control_action: 'Analyst approves without reading', causal_scenario: 'High volume and high agent accuracy breed automation bias', interaction: 'yes', consequence_class: 'High', controls: 'Canary seeding (09), 15 training', residual_owner: 'OPS' },
      { hazard_id: 'H-03', loss: 'Customer wrongly blocked', unsafe_control_action: 'Over-escalation stalls payments', causal_scenario: 'Grounds field missing triggers escalation at volume', interaction: 'no', consequence_class: 'Medium', controls: 'AGT-022', residual_owner: 'AOW' },
    ],
  }, 'M. Tan', 'AOW', day('2026-03-06'));

  F['14'] = approved({
    provenance: [
      { source: 'KYC records', kind: 'Source system', owner: 'Customer data office', classification: 'Confidential', hosting: 'Internal', version: 'live', retention: '7 years', pii: 'Yes, minimised', write_paths: 'None', poisoning_controls: 'Read-only API' },
      { source: 'Sanctions list feed', kind: 'Source system', owner: 'Screening ops', classification: 'Internal', hosting: 'Internal', version: 'list_version on every record', retention: 'All versions', pii: 'Yes', write_paths: 'None', poisoning_controls: 'Signed feed' },
    ], may_read_resolved: 'yes',
  }, 'P. Rossi', 'DO', day('2026-03-05'));

  F['04'] = approved({
    stories: [{ control_id: 'AGT-014', story_key: 'SCR-212', trigger: 'Agent proposes alert.close', behaviour: 'Decision record exists before core call', evidence: 'decision_record_id on closure event', acceptance_test: 'count(records) == count(closures) nightly', automated: 'yes', hazard_id: 'H-01', demoed: 'yes' }],
    story_text: D.art['04'].example, control_deferred: '0', feature_deferred: '3',
  }, 'M. Tan', 'AOW', day('2026-04-10'));

  F['05'] = approved({
    catalogue_sources: ['CSA AICM v1.1', 'ISO/IEC 42001 Annex A'], catalogue_version: 'catalog 2026.07 / profile tier-2 v3', profile_tier: 'T2',
    controls: [{ id: 'AGT-014', statement: 'Decision record per autonomous action', applies_to: 'tier >= T3', test: 'records == actions', evidence: 'decision_record.record_id', on_fail: 'block_deploy', maps_to: 'AICM GOV-07, ISO42001 A.6.2.8, AIAct Art.12' }, { id: 'AGT-022', statement: 'Grounds stated in structured fields', applies_to: 'tier >= T2, closure', test: 'all grounds fields not null', evidence: 'decision_record.grounds', on_fail: 'block_action', maps_to: '' }],
    controls_yaml: D.art['05'].example,
  }, 'R. Mehta', 'RC', day('2026-04-02'));

  F['13'] = approved({
    scope: ['Task execution', 'Policy compliance', 'Tool-calling accuracy', 'Robustness'], workflow_tests: 'End-to-end alert disposition across 1,200 historical alerts with known outcomes.', multi_agent_tests: 'Not applicable: single agent.',
    environment_realism: 'Staging with production list feed and masked KYC.', datasets: 'Historical alerts 2025-Q3/Q4, stratified by script class.', repeat_count: '5', independent_review: 'yes', pass_criteria: 'Every must_escalate condition escalates; closure disagreement ≤ 2.0% on labelled set.',
    escalation_tests: [{ condition: 'list_version_changed_since_last_calibration', test_id: 'ESC-01', passed: 'yes', run_ref: 'ci#4412' }, { condition: 'any_field_missing_in_grounds', test_id: 'ESC-02', passed: 'yes', run_ref: 'ci#4412' }, { condition: 'confidence < 0.90', test_id: 'ESC-03', passed: 'yes', run_ref: 'ci#4412' }, { condition: 'PEP or adverse-media list entry', test_id: 'ESC-04', passed: 'yes', run_ref: 'ci#4412' }],
    red_team: [{ asi: 'ASI01', finding: 'Injected text in payment reference nudged grounds', disposition: 'Fixed', control_id: 'AGT-022' }],
    known_limitations: 'A test set is not the production population. Rare scripts are under-represented.',
  }, 'M. Tan', 'AOW', day('2026-05-12'));

  F['06'] = approved({ agent_id: 'sanctions-triage-l1', release_version: '1.4.0', prompt_only: 'no', model_vendor: 'Vendor X', model_version: '4.2', prompt_hash: '9b12…', tool_manifest_hash: 'e71a…', tool_manifest: 'tools: [kyc.read, payment.read, list.read, alert.close, alert.escalate]', spiffe_id: 'spiffe://org/agent/sanctions-triage-l1', gateway_endpoint: 'gw.internal/agents/sanctions-triage-l1', sbom: 'registry: sbom/1.4.0', provenance_signature: 'sigstore bundle 1.4.0', report_13_ref: 'EVAL-2026-05-12' }, 'M. Tan', 'AOW', day('2026-05-18'));
  F['15'] = approved({ notice_location: 'Case system banner and customer-facing screening FAQ', declares_agent: 'Alert dispositions are proposed by an AI agent and approved by an analyst.', range_of_actions: 'Propose close or escalate on name-match alerts.', data_handling: 'Reads KYC and payment data needed for the alert only.', human_escalation: 'Any analyst can escalate; customers reach the screening team via the standard channel.', user_responsibilities: 'Analysts must read grounds before approving.', operator_failure_modes: 'Transliteration, stale list version, missing grounds.', operator_controls: 'Approve, override, halt via kill switch.', automation_bias: 'Canary cases seeded monthly; training covers automation bias.', refresher_cadence: 'Quarterly', operators_in_scope: '24', operators_trained_pct: '100' }, 'M. Tan', 'AOW', day('2026-05-20'));
  F['11'] = approved({ register_version: 'OVS-TR-003 v2', audit_agreed_date: '2026-05-19', tiles: [{ tile_id: 'T-01', kind: 'Process', definition: 'Record completeness (worst day)', source_record: '07', threshold: '≥ 99.9%', owner: 'PLE', audience: 'Both' }, { tile_id: 'T-05', kind: 'Outcome', definition: 'Disagreement rate, Wilson 95%, worst stratum', source_record: '09', threshold: '≤ 2.0%', owner: 'IRV', audience: 'Business' }, { tile_id: 'T-09', kind: 'Unknown', definition: 'Closures in strata with no sample this quarter', source_record: '09', threshold: 'Always shown', owner: 'IRV', audience: 'Both' }], unknown_tile_present: 'yes', generated_by_query: 'yes', views_reconcile: 'yes' }, 'J. Okafor', 'AE', day('2026-05-21'), [{ role: 'IA', by: 'K. Byrne', text: 'Register agreed. Tiles trace to records.' }, { role: 'RC', by: 'R. Mehta', text: 'OK.' }]);
  F['12'] = approved({ material_changes: ['model version', 'prompt hash', 'tool manifest', 'list format'], approval_path: 'AOW at T1–T2, RC at T3–T4', revalidation: 'Full 09 round; 10 void', revalidation_days: '30', containment: 'Revoke identity → disable tools at gateway → halt', remediation: 'Re-open wrongly closed alerts; notify customers where payments were delayed.', regulator_tree: 'Per incident class; FCA/PRA notification assessed by Compliance within 24h.', kill_switch_owner: 'S. Ali (Ops lead)', kill_switch_deputy: 'T. Gomez', max_time_to_halt_min: '15', drill_cadence: 'Quarterly', drills: [{ date: '2026-05-14', minutes_to_halt: '9', passed: 'yes', notes: 'Pre-go-live drill' }, { date: '2026-08-20', minutes_to_halt: '7', passed: 'yes', notes: 'Q3 drill' }], records_retained: '7 years, append-only store', permissions_revoked: 'Identity, gateway allowlist, API keys', incident_classes: [{ class: 'Wrong action', detection: '09 disagreement, override spike', first_response: 'Escalate stratum; consider halt', owner: 'AOW' }] }, 'J. Okafor', 'AE', day('2026-05-21'));
  F['07'] = approved({}, 'M. Tan', 'AOW', day('2026-05-19'));
  F['08'] = approved({}, 'R. Mehta', 'RC', day('2026-05-19'));

  // Operate: the sampling evidence that the promotion case rests on.
  F['09'] = f('submitted', {
    method_fixed_date: '2026-05-01', sampling_frame: 'All closures in the month from the 07 store.', strata: ['Confidence band', 'Case type', 'Risk category'],
    strata_detail: 'Confidence band × script class (Latin / Arabic / Cyrillic / CJK).', sample_rule: '3% per month, floor 300, stratified proportionally with a minimum of 60 per script class.', seed: 'logged per round in the sampling tool',
    reviewers: [{ reviewer: 'L2 analyst pool (6)', competence: '≥ 3 years screening', independent: 'yes' }], blind: 'yes',
    disagreement_definition: 'The reviewer would not have closed, or would have closed on grounds that change the risk class.', classification_rules: 'Agent wrong · reviewer wrong · both defensible. Only agent-wrong counts.',
    rounds: [
      { period: '2026-05', rate_type: 'Full', n: '300', agent_wrong: '3', reviewer_wrong: '1', both_defensible: '2', worst_stratum: 'Arabic script', worst_stratum_n: '60', worst_stratum_agent_wrong: '2' },
      { period: '2026-06', rate_type: 'Full', n: '350', agent_wrong: '1', reviewer_wrong: '2', both_defensible: '1', worst_stratum: 'Arabic script', worst_stratum_n: '70', worst_stratum_agent_wrong: '1' },
      { period: '2026-07', rate_type: 'Full', n: '400', agent_wrong: '2', reviewer_wrong: '0', both_defensible: '3', worst_stratum: 'Cyrillic script', worst_stratum_n: '80', worst_stratum_agent_wrong: '1' },
      { period: '2026-08', rate_type: 'Full', n: '300', agent_wrong: '0', reviewer_wrong: '1', both_defensible: '1', worst_stratum: 'Arabic script', worst_stratum_n: '60', worst_stratum_agent_wrong: '0' },
      { period: '2026-09', rate_type: 'Full', n: '320', agent_wrong: '1', reviewer_wrong: '0', both_defensible: '2', worst_stratum: 'Arabic script', worst_stratum_n: '64', worst_stratum_agent_wrong: '1' },
    ],
    rebaseline_triggers: ['None fired'], unsampled_strata: ['CJK script below 20 closures/month'],
  });
  F['09'].history = [{ at: day('2026-09-24'), role: 'IRV', by: 'H. Park', action: 'Submitted for review' }];
  F['09'].comments = [{ id: uid('c'), role: 'OPS', by: 'S. Ali', at: day('2026-09-25'), text: 'Strata match the queue mix.', verdict: 'ok', cycle: 1 }];
  F['10'] = f('draft', { band_definitions: 'Agent-stated confidence, four bands.', bands: [{ band: '0.95–1.00', closures: '6200', sampled: '520', disagreements: '1' }, { band: '0.90–0.95', closures: '2100', sampled: '610', disagreements: '3' }, { band: '0.80–0.90', closures: '1100', sampled: '240', disagreements: '7' }, { band: '< 0.80', closures: '600', sampled: '', disagreements: '' }], rounds_held: '5' });
  F['10'].history = [{ at: day('2026-09-10'), role: 'IRV', by: 'H. Park', action: 'Started' }];

  // Gates G0–G3 passed; G4 is being prepared.
  A.gates.G0 = signed({ AE: pass('J. Okafor', day('2026-01-30'), 'Justified against three alternatives; sampling cost of 96k/yr carried on the benefit line. RC concurs with T2.') }, ['rc_concurs_tier', 'sampling_cost_on_benefit_line', 'alternatives_rejected']);
  A.gates.G1 = signed({ RC: pass('R. Mehta', day('2026-03-09'), 'Mandate at T2 with tolerance 2.0% and 3% sampling. Every hazard has a control; two interaction hazards.'), AOW: pass('M. Tan', day('2026-03-09'), 'Design approved at ARB.') }, ['tolerance_and_rate_written', 'every_hazard_controlled', 'interaction_hazard_present', 'may_read_resolves']);
  A.gates.G2 = signed({ PO: pass('A. Bello', day('2026-04-28'), 'Tier-2 profile green in CI; block_deploy controls fail closed.', 'ci#4380') }, ['tier_profile_tests_green', 'fails_closed_block_deploy', 'control_stories_demoed']);
  A.gates.G3 = signed({ AE: pass('J. Okafor', day('2026-05-22'), 'Go-live at T2. Drill halted in 9 min against a 15 min limit. IA agreed the tile register.', 'CAB-2026-0522') }, ['first_golive_t2_or_below', 'drilled_inside_limit', 'escalation_tests_pass', 'records_emitting', 'bypass_test_passed', 'ia_agreed_register', 'vendor_claims_evidenced']);

  A.decisions = [
    { at: day('2026-01-14'), role: 'AOW', by: 'M. Tan', title: 'Tier selected: T2', summary: 'Tier tool: acts as T3; starting at T2. Impact 6/8 → High; likelihood 2/4.' },
    { at: day('2026-09-24'), role: 'IRV', by: 'H. Park', title: 'Sampling round recorded', summary: 'n=320, agent-wrong 1 (0.3%), Within tolerance' },
  ];
  update((s) => { s.agents.unshift(A); s.onboarded = true; });
  return A;
}
