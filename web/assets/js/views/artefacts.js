import { D, TIERS, ROLE_IDS, raciOf } from '../data.js';
import { S } from '../store.js';
import { esc, icon } from '../ui.js';
import { pageHead, aidBox, artBadges, raciInline, reqBadge, refStatus, myRaci } from '../components.js';
import { linkIds } from './model.js';
import { agentName } from '../logic.js';
import { go } from '../app.js';

const SUBNAV = [['model', 'SDLC map'], ['model/gates', 'Gates'], ['model/tiers', 'Tiers'], ['model/raci', 'RACI'], ['artefacts', 'Artefacts'], ['model/metrics', 'Metrics'], ['model/platform', 'Platform'], ['model/roadmap', 'Roadmap'], ['model/references', 'References']];

export function renderIndex() {
  const role = S().role;
  const f = { q: '', role: role || '', tier: '', kind: '' };
  const rows = () => D.order.filter((id) => {
    const a = D.art[id];
    if (f.q && !(`${id} ${a.name} ${a.purpose} ${a.phase}`.toLowerCase().includes(f.q.toLowerCase()))) return false;
    if (f.role && !raciOf(id, f.role).length) return false;
    if (f.tier && ['not_required'].includes(a.tiers[f.tier])) return false;
    if (f.kind === 'outcome' && !a.outcome_evidence) return false;
    if (f.kind === 'min' && !a.go_live_minimum) return false;
    if (f.kind === 'auto' && !a.platform_emitted) return false;
    return true;
  }).map((id) => {
    const a = D.art[id];
    return `<a class="arow" href="#/artefacts/${id}">${aidBox(id)}<span class="t"><b>${esc(a.name)}</b><small>${esc(a.phase)} · R ${a.raci.responsible.join(', ')} · A ${a.raci.accountable}</small></span><span class="r">${f.role ? myRaci(id, f.role) : ''}${f.tier ? reqBadge(a.tiers[f.tier]) : ''}${artBadges(a)}</span></a>`;
  }).join('') || `<div class="empty">${icon('search')}<h3>No artefacts match</h3><p>Try clearing a filter.</p></div>`;

  return {
    title: 'Artefacts',
    crumbs: [['Home', '#/'], ['Operating model', '#/model'], ['Artefacts']],
    html: `${pageHead({ eyebrow: 'Operating model · 5', title: 'Seventeen artefacts, each with its owner, fields, done test and references', lede: 'Listed in the order they are first produced. Each one becomes a guided form in your workspace. Where a published format or method exists, reuse it rather than writing a house version.' })}
    <nav class="tabs">${SUBNAV.map(([h, l]) => `<a href="#/${h}" ${h === 'artefacts' ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</nav>
    <div class="filters">
      <label class="search">${icon('search')}<span class="sr-only">Search artefacts</span><input class="input" id="f-q" type="search" placeholder="Search artefacts"></label>
      <select class="input" id="f-role" style="width:auto" aria-label="Filter by role"><option value="">Any role</option>${ROLE_IDS.map((r) => `<option value="${r}" ${f.role === r ? 'selected' : ''}>${r} · ${esc(D.role[r].name)}</option>`).join('')}</select>
      <select class="input" id="f-tier" style="width:auto" aria-label="Filter by tier"><option value="">Any tier</option>${TIERS.map((t) => `<option>${t}</option>`).join('')}</select>
      <div class="seg" id="f-kind">${[['', 'All'], ['min', 'Go-live min'], ['outcome', 'Outcome'], ['auto', 'Auto-emitted']].map(([k, l]) => `<button data-k="${k}" aria-pressed="${k === ''}">${l}</button>`).join('')}</div>
    </div>
    <div class="alist" id="alist">${rows()}</div>`,
    mount(root) {
      const list = root.querySelector('#alist');
      const redraw = () => { list.innerHTML = rows(); };
      root.querySelector('#f-q').addEventListener('input', (e) => { f.q = e.target.value; redraw(); });
      root.querySelector('#f-role').addEventListener('change', (e) => { f.role = e.target.value; redraw(); });
      root.querySelector('#f-tier').addEventListener('change', (e) => { f.tier = e.target.value; redraw(); });
      root.querySelector('#f-kind').addEventListener('click', (e) => {
        const b = e.target.closest('[data-k]'); if (!b) return;
        f.kind = b.dataset.k;
        root.querySelectorAll('#f-kind button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        redraw();
      });
    },
  };
}

export function renderSpec(id) {
  const a = D.art[id];
  if (!a) return null;
  const F = D.forms[id];
  const s = S();
  const idx = D.order.indexOf(id);
  const prev = D.order[idx - 1], next = D.order[idx + 1];
  const gatesNeeding = Object.entries(D.guide.gates).filter(([, g]) => g.artefacts.some((x) => x.id === id)).map(([gid, g]) => ({ gid, st: g.artefacts.find((x) => x.id === id).state }));
  const phases = D.artPhases[id] || [];

  return {
    title: `${id} · ${a.name}`,
    crumbs: [['Home', '#/'], ['Artefacts', '#/artefacts'], [`${id} · ${a.name}`]],
    html: `
    <header class="page-head">
      <div class="row g12">${aidBox(id)}<div class="eyebrow accent">Artefact ${id} · ${esc(a.phase)}</div></div>
      <div class="row g16" style="justify-content:space-between;align-items:flex-end"><h1 class="grow">${esc(a.name)}</h1><div class="row g6">${artBadges(a)}</div></div>
      <p class="lede">${linkIds(a.purpose)}</p>
    </header>

    <div class="form-layout">
      <div class="stack g16">
        <div class="grid cols-2">
          <div class="card"><div class="eyebrow">When</div><p class="mt8">${linkIds(a.when)}</p></div>
          <div class="card"><div class="eyebrow">Where it lives</div><p class="mt8">${linkIds(a.where)}</p></div>
        </div>
        <div class="callout ok">${icon('checkCircle')}<div><b>Done when.</b> ${linkIds(a.done_when)}</div></div>
        ${a.warning ? `<div class="callout warn">${icon('alert')}<div><b>Warning.</b> ${linkIds(a.warning)}</div></div>` : ''}
        ${a.note ? `<div class="callout info">${icon('info')}<div><b>Note.</b> ${linkIds(a.note)}</div></div>` : ''}
        <div class="card"><div class="eyebrow">Metric</div><p class="mt8">${linkIds(a.metric)}</p></div>

        <div class="card">
          <h3>What it must contain</h3>
          <div class="row g6 mt12">${a.fields.map((x) => `<span class="chip">${esc(x)}</span>`).join('')}</div>
        </div>

        ${F ? `<div class="card">
          <div class="row g8" style="justify-content:space-between"><h3>What the form asks</h3><span class="xs faint">${F.sections.reduce((n, s2) => n + s2.fields.length, 0)} fields in ${F.sections.length} sections</span></div>
          <p class="muted small mt8">${esc(F.intro)}</p>
          <div class="mt12">${F.sections.map((sec) => `<details class="acc"><summary>${esc(sec.title)} <span class="xs faint" style="font-weight:400">${sec.fields.length} field${sec.fields.length > 1 ? 's' : ''}</span></summary><div class="acc-body"><ul>${sec.fields.map((fl) => `<li><b>${esc(fl.label)}</b>${fl.core ? ' <span class="badge accent">core</span>' : ''}<br><span class="small">${esc(fl.help)}</span></li>`).join('')}</ul></div></details>`).join('')}</div>
          ${F.tips?.length ? `<h4 class="mt16">Tips</h4><ul class="muted small mt8">${F.tips.map((t) => `<li>${linkIds(t)}</li>`).join('')}</ul>` : ''}
        </div>` : ''}

        ${a.example ? `<div class="card"><div class="row g8" style="justify-content:space-between"><h3>Example</h3><span class="badge warn">Illustrative</span></div><pre class="mt12">${esc(a.example)}</pre></div>` : ''}

        <div class="card">
          <h3>References</h3>
          <div class="scroll-x mt12"><table class="tbl" style="min-width:560px"><thead><tr><th>Source</th><th>Clause</th><th>Why</th><th>Status</th></tr></thead><tbody>
            ${a.references.map((r) => `<tr><td class="k">${esc(r.source)}</td><td class="mono xs">${esc(r.clause)}</td><td>${esc(r.why)}</td><td>${refStatus(r.status)}</td></tr>`).join('')}
          </tbody></table></div>
        </div>
      </div>

      <aside class="form-aside">
        <div class="card">
          <h3>Fill it in for an agent</h3>
          ${s.agents.length ? `<label class="field mt12"><span class="sr-only">Agent</span><select class="input" id="pick-agent">${s.agents.map((ag) => `<option value="${ag.id}">${esc(agentName(ag))}</option>`).join('')}</select></label>
            <button class="btn primary mt12" id="open-form" style="width:100%">Open the ${id} form ${icon('arrowRight')}</button>`
            : `<p class="muted small mt8">Register an agent first. Its forms follow its tier.</p><a class="btn primary mt12" href="#/agents/new" style="width:100%">${icon('plus')} Register an agent</a>`}
        </div>
        <div class="card"><h3>RACI</h3><div class="mt12">${raciInline(id)}</div>${s.role && raciOf(id, s.role).length ? `<p class="small muted mt12">You (${s.role}) are ${myRaci(id, s.role)} on this artefact.</p>` : ''}</div>
        <div class="card"><h3>By tier</h3><div class="row g8 mt12">${TIERS.map((t) => `<span class="stack g4" style="align-items:center"><span class="xs faint mono">${t}</span>${reqBadge(a.tiers[t])}</span>`).join('')}</div>
          ${a.go_live_minimum ? '<p class="small muted mt12">Part of the go-live minimum for T3 and T4.</p>' : ''}</div>
        <div class="card"><h3>Where it appears</h3>
          <ul class="small muted mt8">${phases.map((p) => `<li><b>${esc(D.phases.find((x) => x.id === p.phase).name)}</b>${p.note ? ` · ${esc(p.note)}` : ''}</li>`).join('')}</ul>
          ${gatesNeeding.length ? `<h4 class="mt12">Gates that need it</h4><div class="row g6 mt8">${gatesNeeding.map((g) => `<a class="chip" href="#/model/gates#${g.gid}">${g.gid} · ${g.st}</a>`).join('')}</div>` : ''}
        </div>
        <div class="row g8" style="justify-content:space-between">
          ${prev ? `<a class="btn sm ghost" href="#/artefacts/${prev}">${icon('arrowLeft')} ${prev}</a>` : '<span></span>'}
          ${next ? `<a class="btn sm ghost" href="#/artefacts/${next}">${next} ${icon('arrowRight')}</a>` : ''}
        </div>
      </aside>
    </div>`,
    mount(root) {
      root.querySelector('#open-form')?.addEventListener('click', () => go(`agents/${root.querySelector('#pick-agent').value}/a/${id}`));
    },
  };
}
