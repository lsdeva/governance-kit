import { S, agent as getAgent } from '../store.js';
import { esc, icon } from '../ui.js';
import { SERVICES, svc, evalService, stepHref, stepsOf } from '../services.js';
import { agentName, tierOf } from '../logic.js';
import { av, roleName } from '../components.js';
import { focus } from './agent.js';

const GROUPS = [
  ['Stand up', 'From idea to approval to operate. Each service ends at a gate.'],
  ['Run', 'Keep the agent evidenced, earn autonomy, and handle change without losing the thread.'],
  ['Assure', 'Answer auditors and regulators, and retire cleanly.'],
];

export function svcCard(s, a) {
  const e = a ? evalService(s, a) : null;
  return `<a class="svc" href="#/services/${s.id}" style="--svc:${s.color}">
    <div class="row g12" style="justify-content:space-between"><span class="ic">${icon(s.icon)}</span>${s.gate ? `<span class="badge line">${s.gate}</span>` : `<span class="badge line">${esc(s.effort)}</span>`}</div>
    <h3>${esc(s.name)}</h3>
    <p>${esc(s.tagline)}</p>
    ${e ? (e.applies ? `<div class="row g8"><div class="progress grow"><span style="width:${Math.round(e.pct * 100)}%"></span></div><span class="xs faint">${e.done}/${e.total}</span></div>` : `<span class="xs faint">${esc(s.notYet || '')}</span>`) : ''}
    <div class="meta"><span class="avs">${s.roles.slice(0, 5).map((r) => av(r)).join('')}</span><span>${s.steps.length} steps · ${esc(s.effort)}</span></div>
  </a>`;
}

export function renderIndex() {
  const s = S();
  const a = (focus.agent && getAgent(focus.agent)) || s.agents[0] || null;
  return {
    title: 'Services',
    crumbs: [['Home', '#/'], ['Services']],
    html: `
    <header class="page-head">
      <span class="eyebrow accent">${icon('spark')} Service catalogue</span>
      <h1>What do you need to get done?</h1>
      <p class="lede">Each service is a guided journey through the operating model for one outcome. It shows who is involved, the next move, and what you'll have at the end. Progress is tracked per agent from the forms and gates, so nothing is ticked twice.</p>
      ${s.agents.length ? `<div class="row g8 mt8"><span class="small faint">Showing progress for</span><select class="input sm" id="svc-agent" style="width:auto">${s.agents.map((x) => `<option value="${x.id}" ${a && x.id === a.id ? 'selected' : ''}>${esc(agentName(x))} · ${tierOf(x)}</option>`).join('')}</select></div>` : ''}
    </header>
    ${GROUPS.map(([g, sub]) => `<section class="section" style="margin-top:32px"><div class="section-head"><div class="stack g4"><h2>${g}</h2><p class="muted">${sub}</p></div></div>
      <div class="grid cols-3">${SERVICES.filter((x) => x.group === g).map((x) => svcCard(x, a)).join('')}</div></section>`).join('')}`,
    mount(root) {
      root.querySelector('#svc-agent')?.addEventListener('change', (e) => { focus.agent = e.target.value; window.dispatchEvent(new HashChangeEvent('hashchange')); });
    },
  };
}

export function renderService(id) {
  const s = svc(id);
  if (!s) return null;
  const st = S();
  const a = (focus.agent && getAgent(focus.agent)) || st.agents[0] || null;
  const e = a ? evalService(s, a) : null;
  const role = st.role;

  const steps = (e ? e.steps : stepsOf(s).map((x) => ({ ...x, done: false, na: false }))).map((x, i) => {
    const isNext = e && e.next === x;
    const cls = x.na ? '' : x.done ? 'done' : isNext ? 'next' : '';
    const label = x.kind === 'tool' ? 'Open tool' : x.kind === 'gate' ? 'Open gate' : x.kind === 'form' ? 'Open form' : x.kind === 'report' ? 'Open pack' : 'Open agent';
    const mine = role && x.who === role;
    return `<div class="svc-step ${cls}" style="${x.na ? 'opacity:.55' : ''}">
      <span class="n">${x.done ? icon('check') : i + 1}</span>
      <div><b>${esc(x.title)}</b><p>${esc(x.body)}</p>
        <div class="row g8 mt8">${x.who ? `<span class="row g6 xs faint">${av(x.who)} ${esc(roleName(x.who))}</span>` : ''}${mine ? '<span class="badge accent">You</span>' : ''}${x.na ? '<span class="badge line">Not applicable to this agent</span>' : ''}${isNext ? '<span class="badge accent">Next</span>' : ''}</div></div>
      ${x.na ? '<span></span>' : `<a class="btn ${isNext ? 'primary' : ''} sm" href="${stepHref(x, a)}">${label} ${icon('arrowRight')}</a>`}
    </div>`;
  }).join('');

  return {
    title: s.name,
    crumbs: [['Home', '#/'], ['Services', '#/services'], [s.name]],
    html: `
    <header class="page-head">
      <span class="eyebrow accent" style="color:${s.color};background:color-mix(in srgb,${s.color} 12%,transparent)">${icon(s.icon)} ${esc(s.group)} · ${esc(s.effort)}</span>
      <h1>${esc(s.name)}</h1>
      <p class="lede">${esc(s.tagline)}</p>
    </header>
    <div class="form-layout">
      <div class="stack g12">
        ${st.agents.length ? `<div class="card row g12" style="padding:14px 18px"><span class="small faint">Agent</span><select class="input sm grow" id="svc-agent" style="max-width:360px">${st.agents.map((x) => `<option value="${x.id}" ${a && x.id === a.id ? 'selected' : ''}>${esc(agentName(x))} · ${tierOf(x)}</option>`).join('')}</select>${a ? `<a class="btn sm ghost" href="#/agents/${a.id}">Agent overview</a>` : ''}</div>`
          : `<div class="callout info">${icon('info')}<div>Register an agent, or load the worked example, to track this service. The steps below show what's involved. <a href="#/agents/new">Register an agent</a></div></div>`}
        ${e && !e.applies ? `<div class="callout warn">${icon('clock')}<div>${esc(s.notYet || 'Not applicable yet for this agent.')} You can still prepare.</div></div>` : ''}
        ${e && e.complete && e.applies ? `<div class="callout ok">${icon('checkCircle')}<div><b>Complete for ${esc(agentName(a))}.</b> ${s.repeat ? 'This service repeats. It resets when the month turns.' : 'Every step is done.'}</div></div>` : ''}
        ${steps}
      </div>
      <aside class="form-aside">
        ${e ? `<div class="card"><div class="row g16"><div class="ring lg" style="--p:${Math.round(e.pct * 100)};--c:${s.color}"><b>${e.done}/${e.total}</b></div><div><b>${e.complete ? 'Done' : 'In progress'}</b><p class="small muted">${e.next ? `Next: ${esc(e.next.title)}` : 'Nothing outstanding.'}</p></div></div></div>` : ''}
        <div class="card"><h3>${icon('target')} What you'll have</h3><p class="small muted mt8">${esc(s.outcome)}</p></div>
        <div class="card"><h3>${icon('users')} Who's involved</h3><div class="stack g8 mt12">${s.roles.map((r) => `<a class="row g8 small" href="#/roles/${r}" style="color:inherit">${av(r)}<span>${esc(roleName(r))}</span>${role === r ? '<span class="badge accent" style="margin-left:auto">You</span>' : ''}</a>`).join('')}</div></div>
        ${s.gate ? `<a class="btn ghost" href="#/model/gates#${s.gate}">${icon('book')} How ${s.gate} works</a>` : ''}
      </aside>
    </div>`,
    mount(root) {
      root.querySelector('#svc-agent')?.addEventListener('change', (ev) => { focus.agent = ev.target.value; window.dispatchEvent(new HashChangeEvent('hashchange')); });
    },
  };
}

