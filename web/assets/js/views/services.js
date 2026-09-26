// Services presented as engagements: what you get, how long, who is
// involved, what we need from you — and, per agent, how far along it is.

import { S, agent as getAgent } from '../store.js';
import { esc, icon } from '../ui.js';
import { SERVICES, svc, evalService, stepHref, stepsOf } from '../services.js';
import { agentName, tierOf } from '../logic.js';
import { av, roleName } from '../components.js';
import { focus } from './agent.js';

const PRACTICES = [
  ['Stand up', 'From idea to an approval to operate. Each engagement ends at a signed gate.'],
  ['Run', 'Keep the agent evidenced, earn autonomy on proof, and absorb change without losing the thread.'],
  ['Assure', 'Answer auditors and regulators from the record, and retire cleanly.'],
];

const num = (s) => String(SERVICES.indexOf(s) + 1).padStart(2, '0');

// Compact offering used on the home page.
export function offerCard(s) {
  return `<a class="offer" href="#/services/${s.id}">
    <span class="num">${num(s)} · ${esc(s.group)}</span>
    <h3>${esc(s.name)}</h3>
    <p>${esc(s.tagline)}</p>
    <ul>${(s.deliverables || []).slice(0, 3).map((d) => `<li>${esc(d)}</li>`).join('')}</ul>
    <span class="more">View the engagement ${icon('arrowRight')}</span>
  </a>`;
}

function svcRow(s, a) {
  const e = a ? evalService(s, a) : null;
  return `<a class="svc-row" href="#/services/${s.id}">
    <span class="num">${num(s)}</span>
    <div><h3>${esc(s.name)}</h3><p>${esc(s.tagline)}</p></div>
    <div class="svc-dl"><b>Deliverables</b><ul>${(s.deliverables || []).slice(0, 4).map((d) => `<li>${esc(d)}</li>`).join('')}</ul></div>
    <div class="svc-meta"><b>Duration</b>${esc(s.effort)}<b class="mt12">Team</b><span class="avs">${s.roles.map((r) => av(r)).join('')}</span>
      ${e ? `<b class="mt12">${esc(agentName(a))}</b>${e.applies ? `${e.done} of ${e.total} steps<div class="progress"><span style="width:${Math.round(e.pct * 100)}%"></span></div>` : `<span class="faint">${esc(s.notYet || '')}</span>`}` : ''}</div>
    <span class="go">${icon('arrowRight')}</span>
  </a>`;
}

const agentSelect = (st, a) => st.agents.length ? `<label class="row g12" style="margin-top:6px"><span class="eyebrow">Tracking progress for</span><select class="input sm" id="svc-agent" style="width:auto;min-width:260px">${st.agents.map((x) => `<option value="${x.id}" ${a && x.id === a.id ? 'selected' : ''}>${esc(agentName(x))} · ${tierOf(x)}</option>`).join('')}</select></label>` : '';

export function renderIndex() {
  const st = S();
  const a = (focus.agent && getAgent(focus.agent)) || st.agents[0] || null;
  return {
    title: 'Services',
    crumbs: [['Home', '#/'], ['Services']],
    html: `
    <header class="page-head">
      <span class="eyebrow accent">Services</span>
      <h1>Nine engagements, one operating model</h1>
      <p class="lede">Each service takes one outcome from start to a signed decision. It lists what you'll have at the end, how long it usually takes, who needs to be involved and what it needs from you. Choose an agent and each service tracks where it is from its forms and gates.</p>
      ${agentSelect(st, a)}
    </header>
    ${PRACTICES.map(([p, sub], i) => `<section class="${i ? 'section' : ''}">
      <div class="sec-head" style="margin-bottom:0;padding-bottom:18px"><div><span class="eyebrow accent">Practice 0${i + 1}</span><h2>${p}</h2></div><p>${sub}</p></div>
      <div class="svc-list">${SERVICES.filter((x) => x.group === p).map((x) => svcRow(x, a)).join('')}</div></section>`).join('')}`,
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
    return `<div class="svc-step ${cls}" style="${x.na ? 'opacity:.5' : ''}">
      <span class="n">${x.done ? icon('check') : String(i + 1).padStart(2, '0')}</span>
      <div><b>${esc(x.title)}</b><p>${esc(x.body)}</p>
        <div class="row g12 mt8 xs faint">${x.who ? `<span class="row g6">${av(x.who)} ${esc(roleName(x.who))}${role && x.who === role ? ' · <b style="color:var(--brand)">you</b>' : ''}</span>` : ''}${x.na ? '<span>Not applicable to this agent</span>' : ''}${isNext ? '<span class="badge accent">Next</span>' : ''}${x.done ? '<span style="color:var(--ok);font-weight:600">Done</span>' : ''}</div></div>
      ${x.na ? '<span></span>' : `<a class="btn ${isNext ? 'primary' : ''} sm" href="${stepHref(x, a)}">${label}</a>`}
    </div>`;
  }).join('');

  return {
    title: s.name,
    crumbs: [['Home', '#/'], ['Services', '#/services'], [s.name]],
    html: `
    <header class="page-head">
      <span class="eyebrow accent">Service ${num(s)} · ${esc(s.group)}</span>
      <h1>${esc(s.name)}</h1>
      <p class="lede">${esc(s.tagline)}</p>
      ${agentSelect(st, a)}
    </header>
    <div class="form-layout">
      <div>
        ${!st.agents.length ? `<div class="callout info" style="margin-bottom:24px">${icon('info')}<div>Register an agent, or load the worked example from the home page, to track this engagement. The approach below shows what's involved. <a href="#/agents/new">Register an agent</a></div></div>` : ''}
        ${e && !e.applies ? `<div class="callout warn" style="margin-bottom:24px">${icon('clock')}<div>${esc(s.notYet || 'Not applicable yet for this agent.')} You can still prepare.</div></div>` : ''}
        ${e && e.complete && e.applies ? `<div class="callout ok" style="margin-bottom:24px">${icon('checkCircle')}<div><b>Complete for ${esc(agentName(a))}.</b> ${s.repeat ? 'This engagement repeats and resets when the month turns.' : 'Every step is done.'}</div></div>` : ''}
        <div class="grid cols-2" style="margin-bottom:40px">
          <div class="principle"><b>What you'll have</b><ul class="small muted" style="list-style:none;padding:0">${(s.deliverables || []).map((d) => `<li style="padding:6px 0;border-top:1px solid var(--rule);margin:0"><span style="color:var(--brand)">— </span>${esc(d)}</li>`).join('')}</ul></div>
          <div class="principle"><b>What we need from you</b><p>${esc(s.needs || '')}</p><p class="mt12 small faint">${esc(s.outcome)}</p></div>
        </div>
        <div class="section-head" style="margin-bottom:0"><h2>Approach</h2><span class="small faint">${s.steps.length} steps · owners shown against each</span></div>
        <div>${steps}</div>
      </div>
      <aside class="form-aside">
        <div class="glance">
          <h3>At a glance</h3>
          <dl class="kv">
            <dt>Duration</dt><dd>${esc(s.effort)}</dd>
            ${s.gate ? `<dt>Ends at</dt><dd><a href="#/model/gates#${s.gate}">${s.gate}</a></dd>` : ''}
            <dt>Team</dt><dd>${s.roles.map((r) => `<a href="#/roles/${r}" title="${esc(roleName(r))}" style="text-decoration:none">${av(r)}</a>`).join(' ')}</dd>
            ${e ? `<dt>Progress</dt><dd><b>${e.done} of ${e.total}</b> for ${esc(agentName(a))}<div class="progress mt8"><span style="width:${Math.round(e.pct * 100)}%"></span></div></dd>` : ''}
          </dl>
          ${e && e.next ? `<a class="btn primary mt16" style="width:100%" href="${stepHref(e.next, a)}">Continue: next step ${icon('arrowRight')}</a>` : ''}
        </div>
        <div class="card"><h3>Who's involved</h3><div class="stack mt12">${s.roles.map((r) => `<a class="row g12 small" href="#/roles/${r}" style="color:inherit;text-decoration:none;padding:7px 0;border-top:1px solid var(--rule)">${av(r)}<span class="grow">${esc(roleName(r))}</span>${role === r ? '<span class="badge accent">You</span>' : ''}</a>`).join('')}</div></div>
      </aside>
    </div>`,
    mount(root) {
      root.querySelector('#svc-agent')?.addEventListener('change', (ev) => { focus.agent = ev.target.value; window.dispatchEvent(new HashChangeEvent('hashchange')); });
    },
  };
}

export const svcCard = offerCard;
