// Services: the operating model packaged as outcome-oriented journeys.
// Each step's state is computed from the agent's workspace, so a service
// always shows exactly where an agent is and what the next move is.

import { D } from './data.js';
import {
  statusOf, evalGate, gateStatus, vendorOf, routingOf, tierOf, analyseRounds, autoCheck, progress, requirement, isNeeded,
} from './logic.js';

const RANK = { not_started: 0, draft: 1, returned: 1, submitted: 2, approved: 3 };
const atLeast = (a, id, st) => RANK[statusOf(a, id)] >= RANK[st];
const val = (a, id, f) => a.forms[id]?.values?.[f];
const thisMonth = () => new Date().toISOString().slice(0, 7);
const daysSince = (iso) => (iso ? (Date.now() - new Date(iso).getTime()) / 864e5 : Infinity);

// Step helpers keep the definitions below readable.
const form = (id, st, who, body, extra = {}) => ({ kind: 'form', target: id, who, title: () => `${st === 'approved' ? 'Get' : 'Submit'} ${id} · ${D.art[id].name}${st === 'approved' ? ' approved' : ''}`, body, done: (a) => atLeast(a, id, st), ...extra });
const gate = (gid, body) => ({ kind: 'gate', target: gid, who: null, title: () => `Pass ${gid} · ${D.gate[gid].name}`, body, done: (a) => gateStatus(a, gid) === 'passed' });
const checks = (gid, body) => ({ kind: 'gate', target: gid, who: null, title: `Confirm the ${gid} checks`, body, done: (a) => gateStatus(a, gid) === 'passed' || evalGate(a, gid).checks.every((c) => c.met) });
const optional = (step, when) => ({ ...step, na: (a) => !when(a) });
const neededAt = (id) => (a) => isNeeded(requirement(id, a));

export const SERVICES = [
  {
    id: 'intake', group: 'Stand up', icon: 'flag', color: '#0EA5E9', gate: 'G0', effort: '1–2 weeks',
    name: 'Intake & funding decision',
    tagline: 'Register the agent, choose its tier, and get a funded, justified yes at G0.',
    outcome: 'An inventory entry that drives the pipeline, a justification with the sampling cost on the benefit line, and a signed intake decision.',
    roles: ['AOW', 'SP', 'RC', 'AE'],
    steps: [
      { kind: 'tool', target: 'tier', who: 'AOW', title: 'Choose the autonomy tier', body: 'Five questions give the starting tier, the target tier and the consequence class, and write them into 00.', done: (a) => !!String(val(a, '00', 'tier_rationale') || '').trim() },
      form('00', 'submitted', 'AOW', 'Complete the inventory entry: owners, tier, data classification, model and vendor, review and sunset dates.'),
      form('01', 'approved', 'SP', 'Write why this needs an agent, which alternatives were rejected on what numbers, and the permanent cost of sampling.'),
      checks('G0', 'RC concurs with the tier. The AE confirms the sampling cost and the rejected alternatives.'),
      gate('G0', 'The accountable executive signs the intake decision.'),
    ],
  },
  {
    id: 'design', group: 'Stand up', icon: 'layers', color: '#6366F1', gate: 'G1', effort: '2–4 weeks',
    name: 'Design approval',
    tagline: 'Write the mandate, analyse hazards before requirements, and pass the architecture review.',
    outcome: 'An approved delegation policy the gate compiles from, a hazard register with interaction hazards, and provenance for everything the agent reads.',
    roles: ['AOW', 'RC', 'SEC', 'DO', 'ENG'],
    steps: [
      form('02', 'approved', 'AOW', 'The mandate: what the agent decides alone, what it escalates, what it may read and touch, the tolerance and the sampling rate.'),
      form('03', 'approved', 'RC', 'Specialists produce the hazard analysis and hand it to the business to challenge. Include at least one interaction hazard.'),
      form('14', 'approved', 'ENG', 'Every source, corpus and memory store the agent reads, with owner and classification.'),
      optional(form('16', 'submitted', 'AOW', 'Open the third-party evidence pack for every vendor-claimed control.'), vendorOf),
      gate('G1', 'RC (for the mandate) and the agent owner sign design approval.'),
    ],
  },
  {
    id: 'build', group: 'Stand up', icon: 'grid', color: '#8B5CF6', gate: 'G2', effort: 'Every sprint',
    name: 'Build to Definition of Done',
    tagline: 'Controls as backlog items with tests, and a tier profile the pipeline selects by itself.',
    outcome: 'Control stories demoed next to features and a pipeline that fails closed on any block_deploy control.',
    roles: ['PO', 'RC', 'PLE', 'ENG'],
    steps: [
      form('04', 'approved', 'PO', 'Each control as a story with trigger, observable behaviour, evidence and an automated acceptance test.'),
      form('05', 'approved', 'RC', 'Controls as data with a deterministic test and on-fail action, one profile per tier. Seed from the catalogues rather than a house version.'),
      gate('G2', 'The product owner signs Definition of Done once the tier-profile tests are green in CI.'),
    ],
  },
  {
    id: 'golive', group: 'Stand up', icon: 'shield', color: '#0F766E', gate: 'G3', effort: '2–3 weeks',
    name: 'Go-live readiness',
    tagline: 'Evaluate, attest, drill the kill switch and sign the tile register, then go live at T2.',
    outcome: 'An approval to operate that rests on a passed evaluation, a signed build, a drilled kill switch and an audit-agreed oversight pack.',
    roles: ['ENG', 'IRV', 'AOW', 'OPS', 'IA', 'AE'],
    steps: [
      form('13', 'approved', 'ENG', 'Workflow-level evaluation with a passing test for every escalation condition in 02, and red-team results by ASI category.'),
      form('06', 'approved', 'ENG', 'Sign the build: model, prompt hash, tool manifest hash, identity and gateway, so any decision resolves to it.'),
      form('15', 'approved', 'PO', 'Tell affected people an agent is involved and how to reach a human. Train operators on approve, override and halt.'),
      form('11', 'approved', 'AOW', 'Specify the tile register, with Process, Outcome and a mandatory Unknown tile. Agree it with internal audit.'),
      { kind: 'form', target: '12', who: 'OPS', title: 'Drill the kill switch inside the limit', body: 'Record a drill in 12 that halts the agent within the stated maximum time.', done: (a) => autoCheck(a, 'drill_within_limit')?.v === true },
      optional(form('16', 'approved', 'AOW', 'Every vendor-claimed control has evidence attached.'), vendorOf),
      gate('G3', 'The accountable executive signs the approval to operate, normally at T2.'),
    ],
  },
  {
    id: 'monthly', group: 'Run', icon: 'chart', color: '#D97706', effort: 'Monthly', repeat: true,
    name: 'Monthly oversight review',
    tagline: 'Blind re-performance, a disagreement rate with its interval, and a pack you can sign.',
    outcome: "This month's outcome evidence: overall rate, worst stratum and verdict against tolerance, with the drill and maturity current.",
    roles: ['IRV', 'RC', 'AOW', 'OPS', 'AE'],
    applies: (a) => gateStatus(a, 'G3') === 'passed',
    notYet: 'Starts after go-live (G3).',
    steps: [
      { kind: 'tool', target: 'sampling', who: 'IRV', title: "Record this month's sampling round", body: 'Re-perform a stratified random sample blind to the agent. Enter n and agent-wrong disagreements.', done: (a) => (val(a, '09', 'rounds') || []).some((r) => r && r.period === thisMonth()) },
      { kind: 'form', target: '09', who: 'IRV', title: 'Add the worst stratum', body: 'An overall rate hides systematic error. A 1% overall that is 9% in one stratum is a 9% problem.', done: (a) => (val(a, '09', 'rounds') || []).some((r) => r && r.period === thisMonth() && +r.worst_stratum_n > 0) },
      { kind: 'form', target: '09', who: 'RC', title: 'Round within tolerance, or escalated', body: 'Within tolerance: the whole interval is at or below the tolerance in 02. Otherwise escalate the stratum and revise 02.', done: (a) => { const r = analyseRounds(a).rounds.slice(-1)[0]; return !!r && r.period === thisMonth() && r.vd.key === 'within'; } },
      { kind: 'form', target: '12', who: 'OPS', title: 'Kill-switch drill is current', body: 'Quarterly for T3 and T4. The last drill must be inside the time limit.', done: (a) => { const d = (val(a, '12', 'drills') || []).filter((x) => x?.date).map((x) => x.date).sort().pop(); return daysSince(d) <= 100 && autoCheck(a, 'drill_within_limit')?.v === true; } },
      { kind: 'tool', target: 'maturity', who: 'AOW', title: 'Maturity reassessed this quarter', body: 'L3 looks finished but says nothing about decisions. L4 needs 09 running monthly.', done: (a) => !!a.maturity && daysSince(new Date(a.maturity.at).toISOString()) <= 92 },
    ],
  },
  {
    id: 'promotion', group: 'Run', icon: 'arrowRight', color: '#7C3AED', gate: 'G4', effort: 'After 4+ rounds',
    name: 'Tier promotion',
    tagline: 'Earn more autonomy on sampling evidence, never by a configuration change.',
    outcome: 'A signed promotion with four consecutive in-tolerance rounds, a calibrated threshold where confidence routes, and a revised mandate.',
    roles: ['IRV', 'AOW', 'RC', 'AE'],
    applies: (a) => tierOf(a) !== 'T4' && gateStatus(a, 'G3') === 'passed',
    notYet: 'Available after go-live, below T4.',
    steps: [
      { kind: 'tool', target: 'promotion', who: 'IRV', title: '4 consecutive full-rate rounds within tolerance, ≥ 1,000 cases', body: 'Read straight from the rounds in 09.', done: (a) => autoCheck(a, 'promotion_rounds')?.v === true },
      form('09', 'approved', 'IRV', 'RC approves the sampling plan and results the promotion rests on.'),
      optional({ kind: 'tool', target: 'calibration', who: 'IRV', title: 'Open the calibration record (10)', body: 'Where confidence decides what is auto-closed, the threshold must point at a calibrated band.', done: (a) => atLeast(a, '10', 'submitted') }, routingOf),
      form('02', 'approved', 'AOW', 'Revise the mandate for the target tier: scope, escalation and sampling at the new tier.'),
      gate('G4', 'The accountable executive signs, with RC concurring. Only then does the tier in 00 change.'),
    ],
  },
  {
    id: 'change', group: 'Run', icon: 'refresh', color: '#DC2626', gate: 'G5', effort: 'Per change · ≤ 30 days',
    name: 'Model, prompt or tool change',
    tagline: 'Decide whether a change is material and revalidate within 30 days.',
    outcome: 'A re-attested build, a hazard delta, a regression run, voided calibration and a full sampling round, signed at G5.',
    roles: ['AOW', 'ENG', 'RC', 'IRV', 'PLE'],
    applies: (a) => gateStatus(a, 'G3') === 'passed',
    notYet: 'Applies once the agent is live.',
    steps: [
      { kind: 'tool', target: 'change', who: 'AOW', title: 'Run the material change check', body: 'Model version, prompt hash, tool manifest, rules or list version, population shift, data sources.', done: (a) => (a.changes || []).length > 0 },
      { kind: 'form', target: '06', who: 'ENG', title: 'Re-attest the build (06)', body: 'A new signed agent definition for the changed build.', done: (a) => statusOf(a, '06') === 'approved' && !a.forms['06']?.flag },
      { kind: 'form', target: '03', who: 'RC', title: 'Hazard analysis delta (03)', body: 'Re-run as a delta against the change.', done: (a) => statusOf(a, '03') === 'approved' && !a.forms['03']?.flag },
      { kind: 'form', target: '13', who: 'ENG', title: 'Regression evaluation (13)', body: 'The evaluation suite runs again as regression.', done: (a) => statusOf(a, '13') === 'approved' && !a.forms['13']?.flag },
      { kind: 'form', target: '09', who: 'IRV', title: 'Full sampling round after the change', body: 'Calibration is void. Bands return to the full rate until four rounds are back in tolerance.', done: (a) => { const c = (a.changes || []).filter((x) => x.material).slice(-1)[0]; if (!c) return false; const m = new Date(c.at).toISOString().slice(0, 7); return (val(a, '09', 'rounds') || []).some((r) => r && r.period >= m && r.rate_type !== 'Reduced'); } },
      gate('G5', 'AOW at T1–T2, RC at T3–T4 signs the change.'),
    ],
  },
  {
    id: 'audit', group: 'Assure', icon: 'printer', color: '#475569', effort: 'On request',
    name: 'Audit & regulator pack',
    tagline: 'Answer "show me" in one pack, with signatures, rationale and the Unknowns stated.',
    outcome: 'An evidence pack: every artefact and its approver, every gate and its reasoning, outcome evidence with intervals, and the decision log.',
    roles: ['AOW', 'IA', 'RC', 'AE'],
    steps: [
      { kind: 'agent', target: '', who: 'AOW', title: 'Every mandatory artefact approved', body: 'Approved by the single accountable role, with the done-when test confirmed.', done: (a) => progress(a).pct >= 1 },
      { kind: 'form', target: '11', who: 'AOW', title: 'Unknown tile present in the tile register', body: 'Never let a tile read as a safety number without saying what it is. What was not tested is shown.', done: (a) => val(a, '11', 'unknown_tile_present') === 'yes' },
      { kind: 'form', target: '09', who: 'IRV', title: 'Outcome evidence on record', body: 'At least one sampling round with an interval. Otherwise the pack must say decisions are Unknown.', done: (a) => analyseRounds(a).rounds.length > 0, na: (a) => gateStatus(a, 'G3') !== 'passed' },
      { kind: 'report', target: '', who: 'AOW', title: 'Generate and file the evidence pack', body: 'Print or save as PDF, or download Markdown, then file it in your system of record.', done: (a) => !!a.lastPackAt && daysSince(new Date(a.lastPackAt).toISOString()) <= 30 },
    ],
  },
  {
    id: 'retire', group: 'Assure', icon: 'trash', color: '#64748B', gate: 'G6', effort: '1 week',
    name: 'Retirement',
    tagline: 'Decommission cleanly: revoke identity, disable tools, keep the records.',
    outcome: 'A retired agent that can no longer act, with records retained and the inventory closed.',
    roles: ['AOW', 'SEC', 'PLE', 'OPS'],
    steps: [
      { kind: 'agent', target: '', who: 'AOW', title: 'Start retirement', body: 'Moves the agent to stage 6 on its page.', done: (a) => !!a.retiring || gateStatus(a, 'G6') === 'passed' },
      form('12', 'approved', 'AOW', 'The decommissioning path: records retained, permissions revoked, inventory closed.'),
      checks('G6', 'Security revokes identity, platform disables tools at the gateway, records are retained.'),
      gate('G6', 'The agent owner signs retirement, and IA and RC are informed.'),
    ],
  },
];

export const svc = (id) => SERVICES.find((s) => s.id === id);

// Titles that name artefacts or gates are resolved lazily: this module is
// evaluated before the operating-model data has loaded.
export const stepsOf = (s) => s.steps.map((st) => ({ ...st, title: typeof st.title === 'function' ? st.title() : st.title }));

export function evalService(s, a) {
  const steps = stepsOf(s).map((st) => {
    const na = st.na ? st.na(a) : false;
    return { ...st, na, done: !na && st.done(a) };
  });
  const live = steps.filter((x) => !x.na);
  const done = live.filter((x) => x.done).length;
  const next = live.find((x) => !x.done) || null;
  const applies = s.applies ? s.applies(a) : true;
  return { steps, done, total: live.length, pct: live.length ? done / live.length : 1, next, complete: !next, applies };
}

export function stepHref(st, a) {
  if (!a) return st.kind === 'tool' ? `#/tools/${st.target}` : st.kind === 'gate' ? `#/model/gates#${st.target}` : st.kind === 'form' ? `#/artefacts/${st.target}` : '#/work';
  if (st.kind === 'form') return `#/agents/${a.id}/a/${st.target}`;
  if (st.kind === 'gate') return `#/agents/${a.id}/g/${st.target}`;
  if (st.kind === 'tool') return `#/tools/${st.target}`;
  if (st.kind === 'report') return `#/agents/${a.id}/report`;
  return `#/agents/${a.id}`;
}

// The service an agent most needs right now.
export function recommended(a) {
  for (const s of SERVICES) {
    if (s.repeat || s.id === 'audit' || s.id === 'retire' || s.id === 'change' || s.id === 'promotion') continue;
    if (!evalService(s, a).complete) return s;
  }
  if ((a.changes || []).some((c) => c.open)) return svc('change');
  if (!evalService(svc('monthly'), a).complete) return svc('monthly');
  return svc('promotion');
}
