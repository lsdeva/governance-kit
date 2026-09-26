// Command palette (Ctrl/⌘ K): jump to any agent, form, gate, service, tool,
// role or page, or run an action, from anywhere.

import { D } from './data.js';
import { S, update, agent as getAgent } from './store.js';
import { esc, icon, toast } from './ui.js';
import { agentName, tierOf } from './logic.js';
import { SERVICES } from './services.js';
import { loadDemo } from './demo.js';
import { focus } from './views/agent.js';

const TOOLS = [['tier', 'Choose the autonomy tier', 'layers'], ['change', 'Is this a material change?', 'refresh'], ['sampling', 'Sampling round calculator', 'target'], ['promotion', 'Tier promotion readiness', 'arrowRight'], ['calibration', 'Calibration check', 'gauge'], ['maturity', 'Maturity self-assessment', 'ladder']];
const PAGES = [['', 'Home', 'home'], ['services', 'Services', 'spark'], ['tower', 'Control tower', 'gauge'], ['work', 'My work', 'inbox'], ['tools', 'Decision tools', 'scale'], ['guide', 'How it works', 'compass'], ['roles', 'Roles & playbooks', 'users'], ['model', 'SDLC map', 'map'], ['model/gates', 'Gates G0–G6', 'shield'], ['model/tiers', 'Autonomy tiers', 'layers'], ['model/raci', 'RACI matrix', 'grid'], ['artefacts', 'Artefacts 00–16', 'file'], ['model/metrics', 'Metric register', 'chart'], ['model/platform', 'Evidence platform', 'server'], ['model/roadmap', 'Roadmap & maturity', 'flag'], ['model/references', 'References', 'book'], ['help', 'Glossary & FAQ', 'help'], ['about', 'Privacy & data', 'lock']];

function items() {
  const s = S();
  const a = (focus.agent && getAgent(focus.agent)) || null;
  const out = [];
  const add = (group, label, ic, run, hint = '', keys = '') => out.push({ group, label, ic, run, hint, keys: (label + ' ' + hint + ' ' + keys).toLowerCase() });
  const nav = (h) => () => { location.hash = '#/' + h; };
  add('Actions', 'Register an agent', 'plus', nav('agents/new'), '', 'new create');
  if (a) add('Actions', `Open ${agentName(a)}`, 'bot', nav(`agents/${a.id}`), 'current agent');
  add('Actions', 'Choose the role I am acting as', 'users', () => document.querySelector('[data-action="role-menu"]')?.click(), '', 'switch role act as');
  add('Actions', 'Switch light / dark theme', 'moon', () => document.querySelector('[data-action="theme"]')?.click(), '', 'theme dark light');
  add('Actions', 'Load the worked example', 'spark', () => { const x = loadDemo(); location.hash = `#/agents/${x.id}`; }, '', 'demo sample example');
  for (const x of s.agents) add('Agents', agentName(x), 'bot', nav(`agents/${x.id}`), `${tierOf(x)} · ${x.forms['00']?.values?.agent_id || ''}`);
  for (const sv of SERVICES) add('Services', sv.name, sv.icon, nav(`services/${sv.id}`), sv.gate || sv.effort, sv.tagline);
  for (const id of D.order) {
    const art = D.art[id];
    if (a) add('Forms', `${id} · ${art.name}`, 'edit', nav(`agents/${a.id}/a/${id}`), `form for ${agentName(a)}`, art.purpose);
    add('Artefacts', `${id} · ${art.name}`, 'file', nav(`artefacts/${id}`), 'specification', art.purpose);
  }
  for (const g of D.gates) {
    if (a) add('Gates', `${g.id} · ${g.name}`, 'shield', nav(`agents/${a.id}/g/${g.id}`), `review for ${agentName(a)}`);
    else add('Gates', `${g.id} · ${g.name}`, 'shield', nav(`model/gates#${g.id}`), g.ceremony);
  }
  for (const [id, l, ic] of TOOLS) add('Decision tools', l, ic, nav(`tools/${id}`));
  for (const r of D.roles) {
    add('Roles', `${r.name} playbook`, 'users', nav(`roles/${r.id}`), r.id);
    add('Roles', `Act as ${r.name}`, 'users', () => { update((st) => { st.role = r.id; }); toast(`Now acting as ${r.name}`); }, r.id, 'switch role');
  }
  for (const [h, l, ic] of PAGES) add('Pages', l, ic, nav(h));
  for (const t of D.guide.glossary || []) add('Glossary', t.term, 'help', nav('help'), '', t.definition);
  return out;
}

function score(it, q) {
  if (!q) return 1;
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.every((w) => it.keys.includes(w))) return 0;
  const l = it.label.toLowerCase();
  return (l.startsWith(words[0]) ? 3 : 0) + (l.includes(q.toLowerCase()) ? 2 : 0) + 1;
}

export function openPalette() {
  if (document.querySelector('.cmdk')) return;
  const all = items();
  const prevFocus = document.activeElement;
  const wrap = document.createElement('div');
  wrap.className = 'cmdk';
  wrap.innerHTML = `<div class="cmdk-box" role="dialog" aria-modal="true" aria-label="Search and jump">
    <div class="cmdk-in">${icon('search')}<input type="text" placeholder="Search agents, forms, gates, services, tools, roles…" aria-label="Search" aria-controls="cmdk-list" autocomplete="off" spellcheck="false"><kbd>Esc</kbd></div>
    <div class="cmdk-list" id="cmdk-list" role="listbox"></div>
    <div class="cmdk-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> move</span><span><kbd>Enter</kbd> open</span><span><kbd>Ctrl</kbd> <kbd>K</kbd> anywhere</span></div></div>`;
  document.body.appendChild(wrap);
  const input = wrap.querySelector('input');
  const list = wrap.querySelector('.cmdk-list');
  let shown = [], sel = 0;
  const draw = () => {
    const q = input.value.trim();
    shown = all.map((it) => ({ it, s: score(it, q) })).filter((x) => x.s > 0);
    if (q) shown.sort((x, y) => y.s - x.s);
    shown = shown.slice(0, q ? 40 : 18).map((x) => x.it);
    if (!q) {
      // Without a query, show a curated start: actions, agents, services.
      shown = all.filter((x) => ['Actions', 'Agents', 'Services'].includes(x.group)).slice(0, 18);
    }
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    let last = '';
    list.innerHTML = shown.length ? shown.map((it, i) => {
      const h = it.group !== last ? `<div class="cmdk-group">${esc(it.group)}</div>` : '';
      last = it.group;
      return `${h}<div class="cmdk-item" role="option" id="ck-${i}" data-i="${i}" aria-selected="${i === sel}">${icon(it.ic)}<span>${esc(it.label)}</span>${it.hint ? `<small>${esc(it.hint)}</small>` : ''}</div>`;
    }).join('') : '<div class="cmdk-empty">No matches. Try a form number like "02", a gate like "G3", or a role.</div>';
    input.setAttribute('aria-activedescendant', shown.length ? `ck-${sel}` : '');
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  };
  const close = () => { wrap.remove(); prevFocus?.focus?.(); };
  const run = (i) => { const it = shown[i]; if (!it) return; close(); it.run(); };
  input.addEventListener('input', () => { sel = 0; draw(); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { sel = Math.min(sel + 1, shown.length - 1); draw(); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { sel = Math.max(sel - 1, 0); draw(); e.preventDefault(); }
    else if (e.key === 'Enter') { run(sel); e.preventDefault(); }
    else if (e.key === 'Escape') close();
  });
  list.addEventListener('mousemove', (e) => { const el = e.target.closest('[data-i]'); if (el && +el.dataset.i !== sel) { sel = +el.dataset.i; list.querySelectorAll('[aria-selected]').forEach((x) => x.setAttribute('aria-selected', String(+x.dataset.i === sel))); } });
  list.addEventListener('click', (e) => { const el = e.target.closest('[data-i]'); if (el) run(+el.dataset.i); });
  wrap.addEventListener('mousedown', (e) => { if (e.target === wrap) close(); });
  draw();
  input.focus();
}

export function installPalette() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openPalette(); }
  });
}
