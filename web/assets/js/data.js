// Loads the operating-model source pack (data/*.json) and builds lookups.
// The JSON files are the single source of truth; every view renders from them.

export const D = {};

const FILES = {
  artefacts: 'artefacts', roles: 'roles', phases: 'sdlc-phases', gates: 'gates',
  metrics: 'metrics', platform: 'platform-components', references: 'references',
  forms: 'forms', guidance: 'guidance',
};

export const ROLE_IDS = ['AE', 'SP', 'AOW', 'PO', 'ENG', 'SEC', 'DO', 'RC', 'PLE', 'IRV', 'OPS', 'IA'];
export const TIERS = ['T1', 'T2', 'T3', 'T4'];

export const TIER_INFO = {
  T1: { name: 'Agent proposes, human operates', body: 'Drafts and recommendations. A person takes every action.', loop: 'Human in control' },
  T2: { name: 'Agent and human collaborate', body: 'The agent acts, but a person approves every significant step before it executes.', loop: 'Human in the loop' },
  T3: { name: 'Agent operates, human approves exceptions', body: 'The agent closes cases alone within its mandate and escalates the rest. A person can intervene.', loop: 'Human on the loop' },
  T4: { name: 'Agent operates, human observes', body: 'No human in the path. Oversight happens after the fact, through records and sampling.', loop: 'Human out of the loop' },
};

export const REQ_LABEL = {
  required: 'Required', light: 'Light', recommended: 'Rec.', not_required: '—', if_vendor: 'If vendor',
};
export const REQ_LONG = {
  required: 'Required: must exist before the relevant gate',
  light: 'Light: reduced template (core fields only)',
  recommended: 'Recommended, not mandatory at this tier',
  not_required: 'Not required at this tier',
  if_vendor: 'Required when any third-party model, platform or tool is used',
};

export const MATURITY = [
  { id: 'L1', name: 'Ad hoc', body: 'In production. Logging is whatever the platform emits. No mandate. No named accountable owner for the agent.' },
  { id: 'L2', name: 'Documented', body: "00 and 02 exist, controls sit in a policy document and are tested by hand. Records aren't chained. Metrics are unlabelled." },
  { id: 'L3', name: 'Enforced', body: '05 selected by tier, pipeline gated, no bypass, 07 and 08 sealed and aggregated. There is still no outcome evidence, and the dashboard is entirely about machinery.' },
  { id: 'L4', name: 'Evidenced', body: '09 runs monthly, tiles are labelled, tolerance is written, the kill switch is drilled. This is the first level where the signature rests on decisions.' },
  { id: 'L5', name: 'Calibrated', body: '10 justifies the threshold, sampling shrinks by rule and resets on change, and tier promotion is evidenced.' },
];

export const DESIGN_RULES = [
  { t: 'No bypass', b: 'If an action can reach a core system without going through the gateway, deployment is refused. Checked at G3 and continuously afterwards.' },
  { t: 'Grounds in fields, not prose', b: 'Matched identifiers, deltas, rule ID and source version are stored as structured fields. A deterministic check runs over every record, and nothing depends on the free-text rationale.' },
  { t: 'Deterministic checker', b: 'The gate and the record checks are ordinary software. A checker that reasons probabilistically is itself an ungoverned model.' },
  { t: 'Version triple on every record', b: "Model version, prompt hash and tool-manifest hash. Without them a decision can't be reconstructed and a change can't be detected." },
  { t: 'Interrupt, not dashboard', b: 'A named person can stop the agent, not merely watch it. EU AI Act Art 14 requires this for high-risk systems, and it is good practice everywhere.' },
];

export const ROADMAP = [
  { months: 'Months 1–3', title: 'Decide and specify', lines: [
    ['SP', '01 justification with sampling cost on the benefit line'],
    ['AOW', '00 inventory entry, 02 mandate drafted at T2'],
    ['RC', '03 hazard analysis run, business challenges it'],
    ['RC', '05 catalogue seeded from AICM v1.1 and ISO 42001 Annex A, tier profiles cut'],
    ['PO', '04 control stories in the backlog'],
    ['AE', 'tolerance and sampling rate written into 02'],
  ] },
  { months: 'Months 3–6', title: 'Build and gate', lines: [
    ['PLE', 'tool gateway up, bypass test passed, gate compiled from 02'],
    ['PLE', '07 and 08 emitting, chain verification in CI'],
    ['ENG', '06 attestation on every release; 13 evaluation passed'],
    ['AOW', '11 tile register agreed with IA; 12 kill switch drilled'],
    ['PO', '15 notice and operator guide published'],
    ['AE', 'G3 go-live at T2'],
  ] },
  { months: 'Months 6–9', title: 'Evidence', lines: [
    ['IRV', 'first three 09 rounds at the full rate, stratified'],
    ['IRV', 'disagreement classification calibrated across reviewers'],
    ['PLE', 'dashboard live with labelled tiles and the Unknown tile filled'],
    ['AOW', 'promotion case to T3 prepared against the evidence bar in 02'],
  ] },
  { months: 'Months 9–12', title: 'Promote and calibrate', lines: [
    ['AE', 'G4 promotion to T3 signed on the sampling evidence'],
    ['IRV', '10 calibration opened after round four, threshold justified'],
    ['IRV', 'reduction rule applied; reset tested with a deliberate prompt change (G5)'],
    ['OPS', '12 drilled again; decommissioning tested on a retired variant (G6)'],
  ] },
];

export async function loadData() {
  const entries = await Promise.all(Object.entries(FILES).map(async ([k, f]) => {
    const r = await fetch(`data/${f}.json`, { cache: 'no-cache' });
    if (!r.ok) throw new Error(`Could not load data/${f}.json (${r.status})`);
    return [k, await r.json()];
  }));
  const raw = Object.fromEntries(entries);
  D.raw = raw;
  D.artefacts = raw.artefacts;
  D.art = Object.fromEntries(raw.artefacts.map((a) => [a.id, a]));
  D.order = raw.artefacts.map((a) => a.id);
  D.roles = raw.roles;
  D.role = Object.fromEntries(raw.roles.map((r) => [r.id, r]));
  D.phases = raw.phases;
  D.gates = raw.gates;
  D.gate = Object.fromEntries(raw.gates.map((g) => [g.id, g]));
  D.metrics = raw.metrics;
  D.platform = raw.platform;
  D.references = raw.references;
  D.forms = raw.forms.artefacts;
  D.guide = raw.guidance;
  // Which phases each artefact appears in, in SDLC order.
  D.artPhases = {};
  for (const p of D.phases) for (const it of p.artefacts) (D.artPhases[it.id] ||= []).push({ phase: p.id, note: it.note });
  // Which gate closes each phase.
  D.gatePhase = {};
  for (const p of D.phases) if (p.gate) D.gatePhase[p.gate.id] = p.id;
  return D;
}

export const isOutcome = (id) => !!D.art[id]?.outcome_evidence;

// RACI letters a role holds on an artefact.
export function raciOf(artId, roleId) {
  const r = D.art[artId].raci;
  const out = [];
  if ((r.responsible || []).includes(roleId)) out.push('R');
  if (r.accountable === roleId) out.push('A');
  if ((r.consulted || []).includes(roleId)) out.push('C');
  if ((r.informed || []).includes(roleId)) out.push('I');
  return out;
}

export function gateApprovers(gateId, tier) {
  if (gateId === 'G5') return (tier === 'T3' || tier === 'T4') ? ['RC'] : ['AOW'];
  const s = D.gate[gateId].approver;
  return [...new Set((s.match(/\b(AE|SP|AOW|PO|ENG|SEC|DO|RC|PLE|IRV|OPS|IA)\b/g) || []))];
}

export function formFields(artId) {
  const f = D.forms[artId];
  if (!f) return [];
  return f.sections.flatMap((s) => s.fields);
}
