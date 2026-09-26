// The operating model's rules, applied to one agent's workspace:
// proportionality by tier, form completeness, gate readiness, the sampling
// statistics, and the "what should I do next" guidance for the acting role.

import { D, TIERS, gateApprovers, formFields, raciOf } from './data.js';

export const STATUS = {
  not_started: 'Not started', draft: 'Draft', submitted: 'In review', approved: 'Approved', returned: 'Returned',
};
const RANK = { not_started: 0, draft: 1, returned: 1, submitted: 2, approved: 3 };

// Lifecycle stages group the nine SDLC phases by the gate that closes them.
export const STAGES = [
  { id: 'S1', name: 'Initiate', phases: ['P1'], gate: 'G0', blurb: 'Register the agent and justify it before funding.' },
  { id: 'S2', name: 'Requirements & design', phases: ['P2', 'P3'], gate: 'G1', blurb: 'Write the mandate, analyse hazards, and put controls in the backlog.' },
  { id: 'S3', name: 'Build', phases: ['P4'], gate: 'G2', blurb: 'Build control stories with the features; select the control profile by tier.' },
  { id: 'S4', name: 'Test & release', phases: ['P5', 'P6'], gate: 'G3', blurb: 'Evaluate, attest, drill the kill switch, sign the tile register.' },
  { id: 'S5', name: 'Operate & change', phases: ['P7', 'P8'], gate: 'G4', blurb: 'Records emit, sampling runs monthly, promotion and change are gated.' },
  { id: 'S6', name: 'Retire', phases: ['P9'], gate: 'G6', blurb: 'Decommission: revoke identity, disable tools, retain records.' },
];

const v = (a, art, field) => a.forms[art]?.values?.[field];

export const tierOf = (a) => v(a, '00', 'tier') || 'T2';
export const vendorOf = (a) => v(a, '00', 'uses_vendor') === 'yes';
export const routingOf = (a) => v(a, '00', 'confidence_routing') === 'yes';
export const agentName = (a) => v(a, '00', 'name') || a.name || 'Untitled agent';
export const agentCode = (a) => v(a, '00', 'agent_id') || '';

export function requirement(artId, a, tier = tierOf(a)) {
  const r = D.art[artId].tiers[tier];
  if (r === 'if_vendor') return vendorOf(a) ? 'required' : 'not_required';
  return r;
}
export const isNeeded = (req) => req === 'required' || req === 'light';

export const formOf = (a, artId) => a.forms[artId] || { values: {}, status: 'not_started', history: [], comments: [], acks: [], approval: null };
export const statusOf = (a, artId) => formOf(a, artId).status || 'not_started';

export function isFilled(field, val) {
  if (val === undefined || val === null) return false;
  if (field.type === 'table') return Array.isArray(val) && val.some((row) => row && Object.values(row).some((x) => String(x ?? '').trim() !== ''));
  if (field.type === 'list' || field.type === 'multiselect') return Array.isArray(val) && val.some((x) => String(x ?? '').trim() !== '');
  return String(val).trim() !== '';
}

// Fields that must be filled before submission, given the tier requirement.
export function neededFields(artId, req) {
  return formFields(artId).filter((f) => (req === 'light' ? f.core : f.required));
}

export function completeness(a, artId) {
  const req = requirement(artId, a);
  const vals = formOf(a, artId).values || {};
  const need = neededFields(artId, req === 'not_required' || req === 'recommended' ? 'required' : req);
  const done = need.filter((f) => isFilled(f, vals[f.id]));
  const all = formFields(artId);
  const any = all.filter((f) => isFilled(f, vals[f.id])).length;
  return {
    need: need.length, done: done.length, pct: need.length ? done.length / need.length : 1,
    missing: need.filter((f) => !isFilled(f, vals[f.id])), anyFilled: any, total: all.length,
  };
}

// ---------------------------------------------------------------- statistics

export function wilson(x, n, z = 1.96) {
  if (!n) return [0, 1];
  const p = x / n, z2 = z * z, d = 1 + z2 / n;
  const c = (p + z2 / (2 * n)) / d;
  const h = (z * Math.sqrt(p * (1 - p) / n + z2 / (4 * n * n))) / d;
  return [Math.max(0, c - h), Math.min(1, c + h)];
}

// The reference method: within tolerance only when the whole interval is at
// or below it; a breach when even the lower bound is above it.
export function verdict(x, n, tol) {
  if (!n || tol === null || tol === undefined || isNaN(tol)) return { key: 'unknown', label: 'No tolerance', tone: 'info' };
  const [lo, hi] = wilson(x, n);
  if (hi <= tol) return { key: 'within', label: 'Within tolerance', tone: 'ok', lo, hi };
  if (lo > tol) return { key: 'breach', label: 'Breach', tone: 'bad', lo, hi };
  return { key: 'inconclusive', label: 'Inconclusive', tone: 'warn', lo, hi };
}

export const toleranceOf = (a) => {
  const t = parseFloat(v(a, '02', 'tolerance_pct'));
  return isNaN(t) ? null : t / 100;
};

export function analyseRounds(a) {
  const tol = toleranceOf(a);
  const rows = (v(a, '09', 'rounds') || []).filter((r) => r && +r.n > 0);
  const rounds = rows.map((r) => {
    const n = +r.n || 0, x = +r.agent_wrong || 0;
    const [lo, hi] = wilson(x, n);
    const vd = verdict(x, n, tol);
    const wn = +r.worst_stratum_n || 0, wx = +r.worst_stratum_agent_wrong || 0;
    const worst = wn ? { p: wx / wn, ci: wilson(wx, wn), vd: verdict(wx, wn, tol), name: r.worst_stratum } : null;
    return { ...r, n, x, p: n ? x / n : 0, lo, hi, vd, worst, full: (r.rate_type || 'Full') === 'Full' };
  });
  // Streak of consecutive full-rate rounds within tolerance, counted back from the latest.
  let streak = 0, streakN = 0;
  for (let i = rounds.length - 1; i >= 0; i--) {
    const r = rounds[i];
    if (!r.full || r.vd.key !== 'within') break;
    streak++; streakN += r.n;
  }
  return {
    tol, rounds, streak, streakN,
    promotion: { ok: streak >= 4 && streakN >= 1000, streak, streakN },
    reduction: { ok: streak >= 4 },
  };
}

export function analyseBands(a) {
  const tol = toleranceOf(a);
  const rows = (v(a, '10', 'bands') || []).filter((r) => r && r.band);
  return rows.map((r) => {
    const n = +r.sampled || 0, x = +r.disagreements || 0;
    const vd = verdict(x, n, tol);
    const label = !n ? 'Never auto-closed / not sampled' : vd.key === 'within' ? 'Calibrated' : vd.key === 'breach' ? 'Not calibrated · escalate' : 'Inconclusive · keep full rate';
    return { ...r, n, x, p: n ? x / n : null, ci: n ? wilson(x, n) : null, vd, label };
  });
}

// ---------------------------------------------------------------- gates

export function gateRecord(a, gateId) {
  return a.gates[gateId] || { checks: {}, signoffs: {}, evidence: '', history: [], cycle: 1 };
}

export function gateStatus(a, gateId) {
  const g = a.gates[gateId];
  if (!g) return 'open';
  const appr = gateApprovers(gateId, tierOf(a));
  const so = g.signoffs || {};
  if (appr.some((r) => so[r]?.decision === 'fail')) return 'failed';
  if (appr.every((r) => so[r]?.decision === 'pass')) return 'passed';
  return 'open';
}

export function autoCheck(a, key) {
  const rows = (art, f) => (v(a, art, f) || []).filter((r) => r && Object.values(r).some((x) => String(x ?? '').trim()));
  switch (key) {
    case 'sampling_cost_present': {
      const c = parseFloat(v(a, '01', 'sampling_cost_per_year'));
      return c > 0 ? { v: true, why: `01 records a sampling cost of ${c.toLocaleString()} per year.` } : { v: false, why: '01 has no sampling cost per year yet.' };
    }
    case 'tolerance_written': {
      const t = v(a, '02', 'tolerance_pct'), s = v(a, '02', 'sampling_rate_pct');
      return (String(t ?? '').trim() && String(s ?? '').trim()) ? { v: true, why: `02 sets tolerance ${t}% and sampling rate ${s}%.` } : { v: false, why: '02 is missing the tolerance or the sampling rate.' };
    }
    case 'hazards_have_controls': {
      const h = rows('03', 'hazards');
      if (!h.length) return { v: false, why: 'No hazards are registered in 03 yet.' };
      const bad = h.filter((r) => !String(r.controls ?? '').trim());
      return bad.length ? { v: false, why: `${bad.length} of ${h.length} hazards have no control assigned.` } : { v: true, why: `All ${h.length} hazards have a control.` };
    }
    case 'interaction_hazard': {
      const n = rows('03', 'hazards').filter((r) => r.interaction === 'yes').length;
      return n ? { v: true, why: `${n} interaction hazard(s) registered.` } : { v: false, why: 'No hazard in 03 needs two simultaneous conditions.' };
    }
    case 'drill_within_limit': {
      const lim = parseFloat(v(a, '12', 'max_time_to_halt_min'));
      const d = rows('12', 'drills').filter((r) => r.date).sort((x, y) => String(x.date).localeCompare(String(y.date)));
      if (!d.length) return { v: false, why: 'No kill-switch drill recorded in 12.' };
      const last = d[d.length - 1], m = parseFloat(last.minutes_to_halt);
      if (isNaN(lim)) return { v: false, why: '12 has no maximum time to halt.' };
      return m <= lim ? { v: true, why: `Last drill (${last.date}) halted in ${m} min, limit ${lim} min.` } : { v: false, why: `Last drill (${last.date}) took ${isNaN(m) ? '?' : m} min against a ${lim} min limit.` };
    }
    case 'first_golive_tier': {
      const t = tierOf(a);
      if (t === 'T1' || t === 'T2') return { v: true, why: `Tier in 00 is ${t}.` };
      return gateStatus(a, 'G4') === 'passed' ? { v: true, why: `Tier ${t}, and G4 promotion evidence exists.` } : { v: false, why: `Tier in 00 is ${t} with no G4 promotion evidence. First go-live should be at T2 or below.` };
    }
    case 'promotion_rounds': {
      const r = analyseRounds(a);
      if (r.tol === null) return { v: false, why: 'No tolerance in 02, so rounds cannot be judged.' };
      return r.promotion.ok ? { v: true, why: `${r.streak} consecutive full-rate rounds within tolerance, ${r.streakN.toLocaleString()} cases.` }
        : { v: false, why: `${r.streak} consecutive full-rate round(s) within tolerance and ${r.streakN.toLocaleString()} cases. Need 4 and 1,000.` };
    }
    case 'escalation_tests_pass': {
      const t = rows('13', 'escalation_tests');
      const conds = (v(a, '02', 'must_escalate') || []).filter((x) => String(x).trim());
      if (!t.length) return { v: false, why: 'No escalation tests recorded in 13.' };
      const failing = t.filter((r) => r.passed !== 'yes').length;
      if (failing) return { v: false, why: `${failing} of ${t.length} escalation tests are not passing.` };
      if (conds.length && t.length < conds.length) return { v: false, why: `02 lists ${conds.length} escalation conditions but 13 has ${t.length} tests.` };
      return { v: true, why: `All ${t.length} escalation tests pass.` };
    }
    case 'vendor_evidence_complete': {
      if (!vendorOf(a)) return { v: null, why: 'No third-party components, so this check does not apply.' };
      const c = rows('16', 'claims');
      if (!c.length) return { v: false, why: 'No vendor claims recorded in 16.' };
      const bad = c.filter((r) => !r.evidence_type || r.evidence_type === 'None yet').length;
      return bad ? { v: false, why: `${bad} of ${c.length} claims have no evidence.` } : { v: true, why: `All ${c.length} claims have evidence.` };
    }
    default: return null;
  }
}

export function evalGate(a, gateId) {
  const G = D.guide.gates[gateId];
  const rec = gateRecord(a, gateId);
  // Promotion evidence is judged against the tier being promoted to.
  const t = tierOf(a);
  const reqTier = gateId === 'G4' ? (TIERS[TIERS.indexOf(t) + 1] || t) : t;
  const arts = G.artefacts.map((r) => {
    let applicable = true, reason = '';
    if (r.when === 'vendor' && !vendorOf(a)) { applicable = false; reason = 'No third-party components'; }
    if (r.when === 'confidence_routing' && !routingOf(a)) { applicable = false; reason = 'No confidence routing'; }
    const req = requirement(r.id, a, reqTier);
    if (applicable && !isNeeded(req)) { applicable = false; reason = `Not mandatory at ${reqTier}`; }
    const st = statusOf(a, r.id);
    const met = !applicable || RANK[st] >= RANK[r.state];
    return { ...r, applicable, reason, status: st, met };
  });
  const checks = G.checks.map((c) => {
    const auto = c.auto ? autoCheck(a, c.auto) : null;
    const na = auto && auto.v === null;
    const ticked = !!rec.checks?.[c.id];
    return { ...c, auto, na, ticked, met: na || ticked };
  });
  const approvers = gateApprovers(gateId, tierOf(a));
  const ready = arts.every((x) => x.met) && checks.every((x) => x.met);
  return { gate: D.gate[gateId], G, rec, arts, checks, approvers, ready, status: gateStatus(a, gateId) };
}

// ---------------------------------------------------------------- stage

export function stageOf(a) {
  if (gateStatus(a, 'G6') === 'passed') return { idx: 6, done: true };
  if (a.retiring) return { idx: 5 };
  for (let i = 0; i < 4; i++) if (gateStatus(a, STAGES[i].gate) !== 'passed') return { idx: i };
  return { idx: 4 };
}

export function stageArtefacts(stage) {
  const seen = new Map();
  for (const pid of stage.phases) {
    const p = D.phases.find((x) => x.id === pid);
    for (const it of p.artefacts) if (!seen.has(it.id)) seen.set(it.id, it.note);
  }
  return [...seen.entries()].map(([id, note]) => ({ id, note }));
}

export function progress(a) {
  const ids = D.order.filter((id) => isNeeded(requirement(id, a)));
  const approved = ids.filter((id) => statusOf(a, id) === 'approved').length;
  const started = ids.filter((id) => statusOf(a, id) !== 'not_started').length;
  return { total: ids.length, approved, started, pct: ids.length ? approved / ids.length : 0 };
}

// ---------------------------------------------------------------- guidance

const PRI = { returned: 0, approve: 1, flag: 1, do: 2, gate: 3, check: 3, review: 4, read: 6, optional: 7 };

export function nextActions(a, role) {
  const out = [];
  const st = stageOf(a);
  const upto = st.done ? 6 : st.idx + 1;
  const ids = new Set();
  for (let i = 0; i < upto && i < STAGES.length; i++) stageArtefacts(STAGES[i]).forEach((x) => ids.add(x.id));
  const base = `#/agents/${a.id}`;
  for (const id of D.order) {
    if (!ids.has(id)) continue;
    const req = requirement(id, a);
    if (req === 'not_required') continue;
    const f = formOf(a, id), s = f.status || 'not_started';
    const raci = role ? raciOf(id, role) : [];
    const art = D.art[id];
    const href = `${base}/a/${id}`;
    if (f.flag && raci.includes('R')) out.push({ kind: 'flag', verb: 'do', label: 'Update', id, title: `Update ${id} · ${art.name}`, why: f.flag.reason, href });
    if (!isNeeded(req)) {
      if (raci.includes('R') && s === 'not_started') out.push({ kind: 'optional', verb: 'read', label: 'Optional', id, title: `${id} · ${art.name}`, why: `Recommended at ${tierOf(a)}, not mandatory.`, href });
      continue;
    }
    if (raci.includes('R') && s === 'returned') out.push({ kind: 'returned', verb: 'do', label: 'Rework', id, title: `Rework ${id} · ${art.name}`, why: f.history?.slice(-1)[0]?.note || 'Returned by the approver.', href });
    else if (raci.includes('R') && (s === 'not_started' || s === 'draft')) {
      const c = completeness(a, id);
      out.push({ kind: 'do', verb: 'do', label: s === 'draft' ? 'Finish' : 'Start', id, title: `${s === 'draft' ? 'Finish' : 'Draft'} ${id} · ${art.name}`, why: s === 'draft' ? `${c.done} of ${c.need} required fields done.` : art.when, href });
    }
    if (s === 'submitted') {
      if (raci.includes('A')) out.push({ kind: 'approve', verb: 'approve', label: 'Approve', id, title: `Approve ${id} · ${art.name}`, why: 'Submitted and waiting for your decision.', href });
      if (raci.includes('C') && !(f.comments || []).some((c) => c.role === role && c.cycle === (f.cycle || 1))) out.push({ kind: 'review', verb: 'review', label: 'Consult', id, title: `Give your view on ${id} · ${art.name}`, why: 'You must be consulted before it is approved.', href });
    }
    if (s === 'approved' && raci.includes('I') && !(f.acks || []).some((x) => x.role === role && x.cycle === (f.cycle || 1))) out.push({ kind: 'read', verb: 'read', label: 'Read', id, title: `Read ${id} · ${art.name}`, why: 'Approved. You are informed.', href });
  }
  // Gates up to the current stage.
  const gates = [];
  for (let i = 0; i < upto && i < STAGES.length; i++) gates.push(STAGES[i].gate);
  if (st.idx >= 4 && (a.changes || []).some((c) => c.open)) gates.push('G5');
  for (const gid of gates) {
    const gs = gateStatus(a, gid);
    if (gs === 'passed') continue;
    if (gid === 'G4' && tierOf(a) === 'T4') continue;
    const e = evalGate(a, gid);
    const gname = D.gate[gid].name;
    if (role) {
      const mine = e.checks.filter((c) => c.who === role && !c.met);
      if (mine.length) out.push({ kind: 'check', verb: 'gate', label: 'Confirm', id: gid, title: `Confirm ${mine.length} check${mine.length > 1 ? 's' : ''} for ${gid} · ${gname}`, why: mine[0].label, href: `${base}/g/${gid}` });
      if (e.approvers.includes(role) && !e.rec.signoffs?.[role]) {
        out.push({ kind: 'gate', verb: 'gate', label: e.ready ? 'Decide' : 'Gate', id: gid, title: `${e.ready ? 'Hold' : 'Prepare'} ${gid} · ${gname}`, why: e.ready ? 'Everything is in place. Record your pass or fail.' : `${e.arts.filter((x) => !x.met).length} artefact(s) and ${e.checks.filter((x) => !x.met).length} check(s) outstanding.`, href: `${base}/g/${gid}` });
      }
    }
  }
  return out.sort((x, y) => (PRI[x.kind] ?? 9) - (PRI[y.kind] ?? 9));
}

export function queue(agents, role) {
  return agents.flatMap((a) => nextActions(a, role).map((x) => ({ ...x, agent: a })));
}
