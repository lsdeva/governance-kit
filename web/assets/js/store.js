// Workspace state. Everything lives in this browser's localStorage; nothing is
// sent anywhere. If storage is unavailable (private mode, blocked site data)
// the app keeps working in memory and says so.

const KEY = 'govkit.om.v1';
const listeners = new Set();
export let storageOk = true;

function blank() {
  return { v: 1, role: null, person: '', onboarded: false, agents: [] };
}

function load() {
  try {
    const s = localStorage.getItem(KEY);
    if (!s) return blank();
    const o = JSON.parse(s);
    if (!o || o.v !== 1 || !Array.isArray(o.agents)) return blank();
    return { ...blank(), ...o };
  } catch (e) {
    storageOk = false;
    return blank();
  }
}

let state = load();

export const S = () => state;
export function onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); storageOk = true; }
  catch (e) { storageOk = false; }
}

export function update(fn, { silent = false } = {}) {
  fn(state);
  persist();
  if (!silent) listeners.forEach((l) => l(state));
}

export const uid = (p = 'id') => p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export function agent(id) { return state.agents.find((a) => a.id === id) || null; }

export function newAgent({ name, agentId, tier, vendor, routing, purpose }) {
  const a = {
    id: uid('ag'), created: Date.now(), updated: Date.now(),
    name: name || 'Untitled agent',
    forms: {}, gates: {}, changes: [], decisions: [], maturity: null,
  };
  a.forms['00'] = blankForm();
  Object.assign(a.forms['00'].values, {
    agent_id: agentId || '', name: name || '', tier: tier || 'T2',
    uses_vendor: vendor ? 'yes' : 'no', confidence_routing: routing ? 'yes' : 'no', status: 'proposed',
  });
  if (purpose) { a.forms['01'] = blankForm(); a.forms['01'].values.decision_delegated = purpose; }
  update((s) => { s.agents.unshift(a); });
  return a;
}

export function blankForm() {
  return { values: {}, status: 'not_started', history: [], comments: [], acks: [], approval: null, flag: null };
}

export function form(a, artId) {
  if (!a.forms[artId]) a.forms[artId] = blankForm();
  return a.forms[artId];
}

export function touch(a) { a.updated = Date.now(); }

export function removeAgent(id) { update((s) => { s.agents = s.agents.filter((a) => a.id !== id); }); }

export function exportState() {
  return JSON.stringify({ exported: new Date().toISOString(), app: 'govkit-operating-model', ...state }, null, 2);
}

export function importState(obj, mode = 'merge') {
  if (!obj || !Array.isArray(obj.agents)) throw new Error('This file is not a GovKit workspace export.');
  update((s) => {
    if (mode === 'replace') { s.agents = obj.agents; return; }
    for (const a of obj.agents) {
      const i = s.agents.findIndex((x) => x.id === a.id);
      if (i >= 0) s.agents[i] = a; else s.agents.push(a);
    }
  });
}

export function clearAll() {
  update((s) => { Object.assign(s, blank(), { onboarded: true }); });
}
