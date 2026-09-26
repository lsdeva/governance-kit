import { D } from '../data.js';
import { S, update } from '../store.js';
import { esc, icon, toast } from '../ui.js';
import { queue, agentName } from '../logic.js';
import { av } from '../components.js';
import { loadDemo } from '../demo.js';
import { SERVICES } from '../services.js';
import { svcCard } from './services.js';
import { alertsFor, alertRow } from './tower.js';
import { go } from '../app.js';

// A product-shot built from real UI pieces: the gate track, an outcome tile
// with its Wilson interval against tolerance, and a signed decision.
const MOCK = `
<div class="mock" aria-hidden="true">
  <div class="mock-bar"><i></i><i></i><i></i></div>
  <div class="row g8" style="justify-content:space-between"><div><div class="xs faint">Agent</div><b style="font-size:15px">Sanctions alert triage (L1)</b></div><span class="badge ink">T2 · in the loop</span></div>
  <div class="track">${['G0', 'G1', 'G2', 'G3', 'G4', 'G5', 'G6'].map((g, i) => `<span class="${i < 4 ? 'p' : i === 4 ? 'c' : ''}">${g}</span>`).join('')}</div>
  <div class="mock-grid">
    <div class="mock-tile"><div class="row g6" style="justify-content:space-between"><span class="xs faint">Disagreement · Wilson 95%</span><span class="badge outcome">Outcome</span></div>
      <div class="row g8 mt8" style="align-items:baseline"><b style="font-size:26px;letter-spacing:-.03em">0.3%</b><span class="xs faint">0.1–1.7% · n=320</span></div>
      <div class="ci-bar"><i style="left:3%;width:40%"></i><b style="left:9%"></b><u style="left:50%"></u></div>
      <div class="row g6 mt8" style="justify-content:space-between"><span class="xs faint">tolerance 2.0%</span><span class="badge ok">Within tolerance</span></div></div>
    <div class="mock-tile"><div class="xs faint">G4 · Tier promotion</div>
      <div class="stack g6 mt8 xs">
        <span class="row g6"><span class="badge ok">${icon('check')}</span> 4 rounds in tolerance</span>
        <span class="row g6"><span class="badge ok">${icon('check')}</span> 1,370 cases</span>
        <span class="row g6"><span class="badge warn">!</span> Worst stratum inconclusive</span>
      </div>
      <div class="row g6 mt8">${av('AE')}<span class="xs faint">Awaiting AE decision</span></div></div>
  </div>
</div>`;

export function render() {
  const s = S();
  const role = s.role ? D.role[s.role] : null;
  const has = s.agents.length > 0;
  const q = role ? queue(s.agents, role.id).filter((x) => x.kind !== 'optional' && x.kind !== 'read') : [];
  const alerts = s.agents.flatMap(alertsFor);
  const featured = ['intake', 'golive', 'monthly', 'promotion', 'change', 'audit'].map((id) => SERVICES.find((x) => x.id === id));
  const firstRole = role?.id || 'AE';

  const desk = has ? `
  <section class="land-sec" style="padding-top:48px">
    <div class="section-head"><div class="stack g4"><div class="kicker">Your desk</div><h2 class="big-h">${role ? `Welcome back, ${esc(role.name.toLowerCase())}` : 'Welcome back'}</h2></div>
      <div class="row g8"><a class="btn" href="#/tower">${icon('gauge')} Control tower</a><a class="btn primary" href="#/work">${icon('inbox')} My work</a></div></div>
    <div class="grid cols-2">
      <div class="card"><div class="row g8" style="justify-content:space-between"><h3>${icon('inbox')} Waiting for you</h3><span class="badge line">${q.length}</span></div>
        ${!role ? `<p class="small muted mt12">Choose your role to see your queue. <button class="btn sm" data-action="role-menu">Choose role</button></p>`
          : q.length ? `<div class="stack g8 mt12">${q.slice(0, 4).map((x) => `<a class="q-item" href="${x.href}"><span class="verb ${x.verb}">${esc(x.label)}</span><span><b>${esc(x.title)}</b><small>${esc(agentName(x.agent))}</small></span>${icon('arrowRight')}</a>`).join('')}</div>`
          : '<p class="small muted mt12">Nothing is waiting for you.</p>'}</div>
      <div class="card"><div class="row g8" style="justify-content:space-between"><h3>${icon('alert')} Needs attention</h3><span class="badge line">${alerts.length}</span></div>
        ${alerts.length ? `<div class="stack g8 mt12">${alerts.slice(0, 4).map((x) => alertRow(x)).join('')}</div>` : '<p class="small muted mt12">No alerts across your agents.</p>'}</div>
    </div>
  </section>` : '';

  return {
    title: 'Assurance for decisioning AI agents',
    crumbs: [['Home']],
    wide: true,
    html: `
    <section class="land-hero">
      <div class="land-inner">
        <div>
          <a class="pill-dark" href="#/guide"><b>New</b> Agentic SDLC operating model, draft 0.2 ${icon('arrowRight', 'sm-ic')}</a>
          <h1>Assurance for AI agents that <em>make decisions</em>.</h1>
          <p class="lede">GovKit runs the whole governance lifecycle inside the SDLC you already have: guided services, role-based forms, signed gates, and outcome evidence with real intervals. It's free, private by design, and runs entirely in your browser.</p>
          <div class="ctas">
            ${has ? `<a class="btn primary lg" href="#/tower">${icon('gauge')} Open the control tower</a>` : `<a class="btn primary lg" href="#/services/intake">${icon('flag')} Start with intake</a>`}
            <button class="btn lg ghost-dark" data-demo>${icon('spark')} Explore a live example</button>
            <a class="btn lg ghost-dark" href="#/services">${icon('grid')} Browse services</a>
          </div>
        </div>
        ${MOCK}
      </div>
    </section>
    <div class="anchors"><span class="lbl">Anchored to</span><span>ISO/IEC 42001</span><span>NIST AI RMF</span><span>IMDA MGF for Agentic AI</span><span>CSA Singapore Agentic Addendum</span><span>OWASP ASI 2026</span><span>CSA AICM v1.1</span><span>OSCAL</span></div>

    <div class="land-body">
      ${desk}

      <section class="land-sec">
        <div class="section-head"><div class="stack g4"><div class="kicker">Services</div><h2 class="big-h">Services, not a binder</h2><p class="muted">Pick the outcome you need. Each service walks the right people through the right forms to a signed gate, and tracks progress per agent.</p></div><a class="btn" href="#/services">All ${SERVICES.length} services ${icon('arrowRight')}</a></div>
        <div class="grid cols-3">${featured.map((x) => svcCard(x, null)).join('')}</div>
      </section>

      <section class="land-sec">
        <div class="kicker">How it works</div><h2 class="big-h">Four rules the whole kit is built on</h2>
        <div class="numbered mt24">${(D.guide.principles || []).map((p, i) => `<div><span class="n">0${i + 1}</span><b>${esc(p.title)}</b><p>${esc(p.body)}</p></div>`).join('')}</div>
      </section>

      <section class="land-sec">
        <div class="kicker">Built for every role</div><h2 class="big-h">Twelve roles, each with a playbook and a queue</h2>
        <p class="muted mt8" style="max-width:720px">Act as your role and GovKit shows what you draft, approve, are consulted on, and sign. Switch roles to play a gate through end to end in a workshop.</p>
        <div class="role-strip mt24">
          <div class="role-tabs" role="tablist" aria-label="Roles">${D.roles.map((r) => `<button role="tab" data-r="${r.id}" aria-selected="${r.id === firstRole}">${av(r.id)} ${esc(r.name)}</button>`).join('')}</div>
          <div class="card pad-lg" id="role-panel"></div>
        </div>
      </section>

      <section class="land-sec">
        <div class="kicker">Evidence, labelled</div><h2 class="big-h">Every number says what kind of number it is</h2>
        <div class="grid cols-3 mt24">
          <div class="card"><span class="badge process">Process</span><h3 class="mt12">The control ran</h3><p class="small muted mt8">Computed by the platform from decision records (07) and control outcome records (08). Necessary, but it says nothing about whether the decisions were right.</p></div>
          <div class="card"><span class="badge outcome">Outcome</span><h3 class="mt12">The decision was right</h3><p class="small muted mt8">Only from blind re-performance of a random sample (09), with a Wilson interval and the worst stratum. Never from an LLM judge.</p></div>
          <div class="card"><span class="badge unknown">Unknown</span><h3 class="mt12">Not tested</h3><p class="small muted mt8">A mandatory tile. Strata with no sample are shown, so the gaps are on the page rather than hidden in an average.</p></div>
        </div>
      </section>

      <div class="band">
        <div><h2>Put your first agent through intake this afternoon.</h2><p>Register it, choose its tier with the tier tool, and GovKit lines up the forms, owners and gate. Your data never leaves your browser.</p></div>
        <div class="row g8"><a class="btn primary lg" href="#/agents/new">${icon('plus')} Register an agent</a><button class="btn lg" data-demo>${icon('spark')} Live example</button></div>
      </div>
    </div>`,
    mount(root) {
      root.querySelectorAll('[data-demo]').forEach((b) => b.addEventListener('click', () => { const a = loadDemo(); go(`agents/${a.id}`); }));
      const panel = root.querySelector('#role-panel');
      const show = (id) => {
        const r = D.role[id], g = D.guide.roles[id] || {};
        root.querySelectorAll('[data-r]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.r === id)));
        panel.innerHTML = `<div class="row g12">${av(id, 'lg')}<div><h3 style="font-size:20px">${esc(r.name)}</h3><div class="xs faint">${esc(r.description)}</div></div></div>
          <p class="mt16" style="font-size:16px">${esc(g.headline || '')}</p>
          <div class="grid cols-2 mt16"><div><h4>You decide</h4><ul class="small muted mt8">${(g.you_decide || []).slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
          <div><h4>Your first steps</h4><ol class="small muted mt8">${(g.first_steps || []).slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div></div>
          <div class="row g8 mt24"><button class="btn primary" data-act="${id}">Act as ${esc(r.name)}</button><a class="btn ghost" href="#/roles/${id}">Full playbook ${icon('arrowRight')}</a></div>`;
        panel.querySelector('[data-act]').addEventListener('click', () => { update((st) => { st.role = id; }); toast(`Now acting as ${r.name}`); });
      };
      root.querySelector('.role-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) show(b.dataset.r); });
      show(firstRole);
    },
  };
}
