import { D } from '../data.js';
import { S } from '../store.js';
import { esc, icon } from '../ui.js';
import { queue, STAGES } from '../logic.js';
import { av } from '../components.js';
import { loadDemo } from '../demo.js';
import { go } from '../app.js';

export function render() {
  const s = S();
  const role = s.role ? D.role[s.role] : null;
  const q = role ? queue(s.agents, role.id).filter((x) => x.kind !== 'optional' && x.kind !== 'read') : [];
  const principles = D.guide.principles || [];

  const welcome = role ? `
    <section class="card pad-lg mt24">
      <div class="row g16" style="justify-content:space-between">
        <div class="row g12">${av(role.id, 'lg')}<div><div class="eyebrow">Acting as</div><h3>${esc(role.name)}</h3></div></div>
        <a class="btn primary" href="#/work">Open my work ${icon('arrowRight')}</a>
      </div>
      ${q.length ? `<div class="stack g8 mt16">${q.slice(0, 3).map((x) => `<a class="q-item" href="${x.href}"><span class="verb ${x.verb}">${esc(x.label)}</span><span><b>${esc(x.title)}</b><small>${esc(x.agent.name)} · ${esc(x.why || '')}</small></span>${icon('arrowRight')}</a>`).join('')}
        ${q.length > 3 ? `<a class="small" href="#/work">and ${q.length - 3} more</a>` : ''}</div>`
        : `<p class="muted mt12">${s.agents.length ? 'Nothing is waiting for you right now.' : 'You have no agents registered yet.'} ${s.agents.length ? '' : '<a href="#/agents/new">Register your first agent</a> or <button class="btn sm ghost" data-demo>load the worked example</button>.'}</p>`}
    </section>` : '';

  return {
    title: 'Home',
    crumbs: [['Home']],
    html: `
    <section class="hero">
      <div class="eyebrow accent">Agentic SDLC operating model · Draft 0.2</div>
      <h1 class="mt12">Govern the AI agents that decide, inside the SDLC you already run</h1>
      <p class="lede">For any agent that decides, acts, and closes a case nobody revisits. GovKit adds <b>17 artefacts</b> and <b>7 gates</b> to ceremonies you already hold. Choose your role, register an agent, and every form, review, sign-off and gate is laid out for you. The reasoning is recorded as evidence as you go.</p>
      <div class="ctas">
        ${role ? `<a class="btn primary lg" href="#/work">Go to my work ${icon('arrowRight')}</a>` : `<button class="btn primary lg" data-action="role-menu">${icon('users')} Start with your role</button>`}
        <a class="btn lg" href="#/guide">${icon('compass')} How it works</a>
        <button class="btn lg ghost" data-demo>${icon('spark')} Explore a worked example</button>
      </div>
      <div class="stats">
        <div class="stat"><b>17</b><span>Artefacts, each a guided form with owner, fields and done test</span></div>
        <div class="stat"><b>7</b><span>Gates from intake to retirement, signed as evidence</span></div>
        <div class="stat"><b>12</b><span>Roles, each with a playbook and a queue</span></div>
        <div class="stat"><b>0</b><span>Accounts or uploads. Everything stays in your browser</span></div>
      </div>
    </section>

    ${welcome}

    <section class="section">
      <div class="section-head"><div class="stack g4"><h2>Three steps to a decision you can defend</h2><p class="muted">The same loop runs at every stage, from the business case to decommissioning.</p></div></div>
      <div class="grid cols-3 steps">
        <div class="card stepc"><h3>Act as your role</h3><p class="muted small mt8">Accountable executive, agent owner, risk, engineering, audit and seven others. Your role sets your queue and what you can sign.</p></div>
        <div class="card stepc"><h3>Register the agent and its tier</h3><p class="muted small mt8">The autonomy tier (T1–T4) decides which artefacts are mandatory. The <a href="#/tools/tier">tier tool</a> helps you choose one.</p></div>
        <div class="card stepc"><h3>Draft, consult, approve, gate</h3><p class="muted small mt8">R drafts each form and C roles comment. A approves it, and a gate passes only when everything it needs exists.</p></div>
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div class="stack g4"><h2>The lifecycle at a glance</h2><p class="muted">Six stages over the nine SDLC phases. Each ends at a gate.</p></div><a class="btn sm" href="#/model">Open the full SDLC map ${icon('arrowRight')}</a></div>
      <div class="grid cols-3">
        ${STAGES.map((st, i) => `<a class="card" href="#/model/gates#${st.gate}"><div class="row g8"><span class="aid-box g">${st.gate}</span><div><div class="eyebrow">Stage ${i + 1}</div><h3>${esc(st.name)}</h3></div></div><p class="muted small mt8">${esc(st.blurb)}</p><p class="xs faint mt8">Closes with ${st.gate} · ${esc(D.gate[st.gate].name)}</p></a>`).join('')}
      </div>
    </section>

    <section class="section">
      <div class="section-head"><div class="stack g4"><h2>Four principles</h2><p class="muted">What makes this different from a policy binder.</p></div></div>
      <div class="grid cols-4">${principles.map((p) => `<div class="card principle"><b>${esc(p.title)}</b><p>${esc(p.body)}</p></div>`).join('')}</div>
    </section>

    <section class="section">
      <div class="section-head"><div class="stack g4"><h2>Find your part in it</h2><p class="muted">Every role has a playbook: what you decide, your first steps, what to watch for, and the questions to ask.</p></div><a class="btn sm" href="#/roles">All roles ${icon('arrowRight')}</a></div>
      <div class="grid auto-fill">${D.roles.map((r) => `<a class="card role-card" href="#/roles/${r.id}">${av(r.id)}<div><h3>${esc(r.name)}</h3><p>${esc(r.description)}</p></div></a>`).join('')}</div>
    </section>

    <section class="section">
      <div class="callout info">${icon('info')}<div><b>Scope.</b> Decisioning agents: triage, eligibility, case closure, exception approval, payment release. Anchored to ISO/IEC 42001 Annex A, NIST AI RMF, IMDA MGF for Agentic AI, the CSA Singapore Agentic Addendum, OWASP ASI 2026, CSA AICM v1.1 and OSCAL. <a href="#/model/references">See the references and their verification status</a>. This is guidance, not legal advice.</div></div>
    </section>`,
    mount(root) {
      root.querySelectorAll('[data-demo]').forEach((b) => b.addEventListener('click', () => { const a = loadDemo(); go(`agents/${a.id}`); }));
    },
  };
}
