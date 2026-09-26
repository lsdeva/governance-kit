import { D, raciOf, gateApprovers } from '../data.js';
import { S, update } from '../store.js';
import { esc, icon, toast } from '../ui.js';
import { av, pageHead, aidBox, kindBadge, artBadges } from '../components.js';

export function renderIndex() {
  const role = S().role;
  const count = (id) => {
    const c = { R: 0, A: 0, C: 0, I: 0 };
    D.order.forEach((a) => raciOf(a, id).forEach((l) => c[l]++));
    return c;
  };
  return {
    title: 'Roles & playbooks',
    crumbs: [['Home', '#/'], ['Roles']],
    html: `
    ${pageHead({ eyebrow: 'Roles', title: 'Twelve roles, one accountable owner per artefact', lede: 'R creates the artefact. A approves it, and there is exactly one A per artefact. C must be consulted before approval. I receives it. Where platform engineering is R, the artefact is emitted by software, and the team owns the emitter, not the content of each record.' })}
    <div class="grid auto-fill">
      ${D.roles.map((r) => {
        const c = count(r.id);
        return `<a class="card" href="#/roles/${r.id}" ${role === r.id ? 'style="border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-bg)"' : ''}>
          <div class="row g12">${av(r.id, 'lg')}<div class="grow"><h3>${esc(r.name)}</h3><div class="xs faint mono">${r.id}${role === r.id ? ' · you' : ''}</div></div></div>
          <p class="muted small mt12">${esc(D.guide.roles[r.id]?.headline || r.description)}</p>
          <div class="row g8 mt12">${['R', 'A', 'C', 'I'].map((l) => `<span class="row g4 xs"><span class="rc ${l}">${l}</span>${c[l]}</span>`).join('')}</div>
        </a>`;
      }).join('')}
    </div>`,
  };
}

export function renderRole(id) {
  const r = D.role[id];
  if (!r) return null;
  const g = D.guide.roles[id] || {};
  const acting = S().role === id;
  const by = { R: [], A: [], C: [], I: [] };
  D.order.forEach((a) => raciOf(a, id).forEach((l) => by[l].push(a)));
  const gatesSign = D.gates.filter((gt) => gateApprovers(gt.id, 'T2').includes(id) || gateApprovers(gt.id, 'T3').includes(id));
  const checks = Object.entries(D.guide.gates).flatMap(([gid, gg]) => gg.checks.filter((c) => c.who === id).map((c) => ({ gid, ...c })));
  const metrics = D.metrics.filter((m) => m.owner === id);
  const list = (arr) => arr?.length ? `<ul>${arr.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : '<p class="faint small">None.</p>';
  const artList = (ids, verb) => ids.length ? `<div class="alist">${ids.map((a) => { const A = D.art[a]; return `<a class="arow" href="#/artefacts/${a}">${aidBox(a)}<span class="t"><b>${esc(A.name)}</b><small>${esc(A.phase)} · ${esc(verb)}</small></span><span class="r">${artBadges(A)}</span></a>`; }).join('')}</div>` : '<p class="faint small">None.</p>';

  return {
    title: r.name,
    crumbs: [['Home', '#/'], ['Roles', '#/roles'], [r.name]],
    html: `
    <header class="page-head">
      <div class="eyebrow accent">Role playbook · ${r.id}</div>
      <div class="row g16" style="justify-content:space-between;align-items:flex-end">
        <div class="row g16">${av(r.id, 'lg')}<h1>${esc(r.name)}</h1></div>
        <div class="row g8">${acting ? `<span class="badge accent">${icon('check')} You are acting as this role</span><a class="btn primary" href="#/work">My work ${icon('arrowRight')}</a>` : `<button class="btn primary" data-act-as="${r.id}">Act as ${esc(r.id)}</button>`}</div>
      </div>
      <p class="lede">${esc(g.headline || r.description)}</p>
      <p class="muted small">${esc(r.description)}</p>
    </header>

    <div class="grid cols-2">
      <div class="card"><h3>${icon('pen')} What you decide or sign</h3><div class="mt12 muted">${list(g.you_decide)}</div></div>
      <div class="card"><h3>${icon('flag')} Your first steps on a new agent</h3><div class="mt12 muted"><ol>${(g.first_steps || []).map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div></div>
      <div class="card"><h3>${icon('alert')} Watch for</h3><div class="mt12 muted">${list(g.watch_for)}</div></div>
      <div class="card"><h3>${icon('message')} Questions to ask</h3><div class="mt12 muted">${list(g.questions_to_ask)}</div></div>
    </div>

    <section class="section">
      <h2>Your artefacts</h2>
      <p class="muted mt8">Which of the 17 artefacts you create, approve, are consulted on, or are informed about.</p>
      <div class="grid cols-2 mt16">
        <div><h4 class="row g8 mb8"><span class="rc R">R</span> You create</h4><div class="mt8">${artList(by.R, 'Responsible')}</div></div>
        <div><h4 class="row g8"><span class="rc A">A</span> You approve</h4><div class="mt8">${artList(by.A, 'Accountable')}</div></div>
        <div><h4 class="row g8"><span class="rc C">C</span> You are consulted</h4><div class="mt8">${artList(by.C, 'Consulted')}</div></div>
        <div><h4 class="row g8"><span class="rc I">I</span> You are informed</h4><div class="mt8">${artList(by.I, 'Informed')}</div></div>
      </div>
    </section>

    <section class="section grid cols-2">
      <div class="card">
        <h3>${icon('shield')} Gates you sign</h3>
        ${gatesSign.length ? `<div class="stack g8 mt12">${gatesSign.map((gt) => `<a class="arow" href="#/model/gates#${gt.id}"><span class="aid-box g">${gt.id}</span><span class="t"><b>${esc(gt.name)}</b><small>${esc(gt.approver)}</small></span></a>`).join('')}</div>` : '<p class="faint small mt12">You do not sign any gate. Your evidence feeds them.</p>'}
        ${checks.length ? `<h4 class="mt24">Gate checks you confirm</h4><ul class="mt8 muted small">${checks.map((c) => `<li><b>${c.gid}</b> · ${esc(c.label)}</li>`).join('')}</ul>` : ''}
      </div>
      <div class="card">
        <h3>${icon('chart')} Metrics you own</h3>
        ${metrics.length ? `<div class="stack g8 mt12">${metrics.map((m) => `<div class="row g8" style="justify-content:space-between;border-top:1px solid var(--rule);padding-top:8px"><span><b class="small">${esc(m.name)}</b><br><span class="xs faint">${esc(m.cadence)} · threshold ${esc(m.threshold)}</span></span>${kindBadge(m.kind)}</div>`).join('')}</div>` : '<p class="faint small mt12">No metrics are owned by this role.</p>'}
        ${g.roadmap?.length ? `<h4 class="mt24">Your lines in the 12-month roadmap</h4><ul class="mt8 muted small">${g.roadmap.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}
      </div>
    </section>`,
    mount(root) {
      root.querySelector('[data-act-as]')?.addEventListener('click', (e) => {
        update((s) => { s.role = e.currentTarget.dataset.actAs; });
        toast(`Now acting as ${r.name}`);
      });
    },
  };
}
