import { D, TIERS, TIER_INFO, REQ_LONG, raciOf, isOutcome, MATURITY, DESIGN_RULES, ROADMAP, ROLE_IDS } from '../data.js';
import { S } from '../store.js';
import { esc, icon } from '../ui.js';
import { av, pageHead, reqBadge, kindBadge, refStatus, roleLink, aid } from '../components.js';

// Turn artefact ids inside prose ("02 approved · 03 signed") into links.
export const linkIds = (s) => esc(s).replace(/\b(0\d|1[0-6])\b/g, (m) => D.art[m] ? `<a class="aid ${isOutcome(m) ? 'o' : ''}" href="#/artefacts/${m}">${m}</a>` : m);

const SUBNAV = [['model', 'SDLC map'], ['model/gates', 'Gates'], ['model/tiers', 'Tiers'], ['model/raci', 'RACI'], ['artefacts', 'Artefacts'], ['model/metrics', 'Metrics'], ['model/platform', 'Platform'], ['model/roadmap', 'Roadmap'], ['model/references', 'References']];
const subnav = (cur) => `<nav class="tabs" aria-label="Operating model sections">${SUBNAV.map(([h, l]) => `<a href="#/${h}" ${h === cur ? 'aria-current="page"' : ''}>${l}</a>`).join('')}</nav>`;

export function renderMap() {
  let hl = S().role || '';
  const html = () => `
    ${pageHead({ eyebrow: 'Operating model · 1', title: 'Artefacts laid onto the SDLC you already run', lede: 'Columns are standard SDLC phases, with the existing ceremony each artefact attaches to shown in italics. Each item shows its artefact ID and the roles responsible (R) and accountable (A). The boxed item at the foot of a column is the gate that closes it.' })}
    ${subnav('model')}
    <div class="row g8" style="margin-bottom:14px">
      <span class="eyebrow">Show me what I own</span>
      <div class="row g6" id="hl-chips">${['', ...ROLE_IDS].map((r) => `<button class="chip" data-hl="${r}" aria-pressed="${hl === r}">${r || 'All'}</button>`).join('')}</div>
    </div>
    <div id="hl-hint" class="small muted" style="margin-bottom:12px"></div>
    <div class="scroll-x" tabindex="0" role="region" aria-label="SDLC map, scrolls sideways"><div class="pmap" id="pmap">
      ${D.phases.map((p) => `<div class="pcol">
        <div class="phd"><span class="n">${p.id}</span><span class="t">${esc(p.name)}</span><span class="c">${esc(p.ceremony)}</span></div>
        <div class="pitems">${p.artefacts.map((it) => { const a = D.art[it.id]; return `<a class="pit ${isOutcome(it.id) ? 'o' : ''}" href="#/artefacts/${it.id}" data-id="${it.id}"><span class="id">${it.id}</span>${esc(a.name)}<span class="who">R ${a.raci.responsible.join(', ')} · A ${a.raci.accountable}</span>${it.note ? `<span class="nt">${esc(it.note)}</span>` : ''}</a>`; }).join('')}</div>
        ${p.gate ? `<a class="pgate" href="#/model/gates#${p.gate.id}"><b>${p.gate.id} · ${esc(p.gate.name)}</b>${esc(D.gate[p.gate.id].approver)}</a>` : ''}
      </div>`).join('')}
    </div></div>
    <p class="xs faint mt8">Blue items carry process evidence; amber items (09, 10) carry outcome evidence. Scroll sideways on small screens.</p>
    <section class="section grid cols-2">
      <div class="card"><h3>Overlay, don't add phases</h3><p class="muted small mt8">Each artefact attaches to a ceremony teams already hold, so governance happens where the work already is.</p></div>
      <div class="card"><h3>Ready to use it?</h3><p class="muted small mt8">Register an agent and the map becomes a checklist of forms with owners and statuses.</p><a class="btn sm primary mt12" href="#/agents/new">${icon('plus')} Register an agent</a></div>
    </section>`;
  return {
    title: 'SDLC map', crumbs: [['Home', '#/'], ['Operating model'], ['SDLC map']], html: html(),
    mount(root) {
      const apply = () => {
        root.querySelectorAll('[data-hl]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.hl === hl)));
        root.querySelectorAll('.pit').forEach((el) => {
          const l = hl ? raciOf(el.dataset.id, hl) : [];
          el.classList.toggle('dim', !!hl && !l.length);
          el.querySelector('.myrole')?.remove();
          if (l.length) el.insertAdjacentHTML('beforeend', `<span class="myrole">${l.map((x) => `<span class="rc ${x}">${x}</span>`).join(' ')}</span>`);
        });
        const hint = root.querySelector('#hl-hint');
        if (!hl) { hint.textContent = ''; return; }
        const c = { R: 0, A: 0, C: 0, I: 0 };
        D.order.forEach((a) => raciOf(a, hl).forEach((l) => c[l]++));
        hint.innerHTML = `<b>${esc(D.role[hl].name)}</b>: responsible for ${c.R}, accountable for ${c.A}, consulted on ${c.C}, informed about ${c.I}. <a href="#/roles/${hl}">Open the playbook</a>.`;
      };
      root.querySelector('#hl-chips').addEventListener('click', (e) => { const b = e.target.closest('[data-hl]'); if (b) { hl = b.dataset.hl; apply(); } });
      apply();
    },
  };
}

function gates() {
  return D.gates.map((g) => {
    const G = D.guide.gates[g.id] || {};
    return `<article class="card pad-lg" id="${g.id}" style="scroll-margin-top:80px">
      <div class="row g12" style="justify-content:space-between">
        <div class="row g12"><span class="aid-box g">${g.id}</span><div><h3>${esc(g.name)}</h3><div class="small faint">${esc(g.ceremony)}</div></div></div>
        <div class="row g8"><span class="badge ${g.type.startsWith('Automated') ? 'process' : 'line'}">${esc(g.type)}</span></div>
      </div>
      ${G.purpose ? `<p class="mt12">${esc(G.purpose)}</p>` : ''}
      <dl class="kv mt16">
        <dt>Needs</dt><dd>${linkIds(g.required_artefacts)}</dd>
        <dt>Approver</dt><dd>${linkIds(g.approver)}</dd>
        <dt>Pass when</dt><dd>${linkIds(g.pass_condition)}</dd>
      </dl>
      ${G.checks?.length ? `<details class="acc mt16"><summary>${G.checks.length} checks the approvers confirm</summary><div class="acc-body"><ul>${G.checks.map((c) => `<li><b>${esc(c.label)}</b> <span class="faint xs">· ${c.who}</span><br><span class="small">${esc(c.help)}</span></li>`).join('')}</ul></div></details>` : ''}
      ${G.on_fail ? `<div class="callout warn mt12">${icon('alert')}<div class="small"><b>If it fails.</b> ${esc(G.on_fail)}</div></div>` : ''}
    </article>`;
  }).join('');
}

function tiers() {
  return `
  <div class="grid cols-4">${TIERS.map((t) => `<div class="card tier-card"><div class="tn">${t} · ${esc(TIER_INFO[t].loop)}</div><h3>${esc(TIER_INFO[t].name)}</h3><p>${esc(TIER_INFO[t].body)}</p></div>`).join('')}</div>
  <div class="row g8 mt24" style="margin-bottom:10px"><span class="eyebrow">Highlight tier</span><div class="seg" id="tier-seg">${['All', ...TIERS].map((t, i) => `<button data-t="${i ? t : ''}" aria-pressed="${i === 0}">${t}</button>`).join('')}</div></div>
  <div class="tbl-card scroll-x"><table class="tbl matrix" id="tier-tbl" style="min-width:720px"><thead><tr><th>ID</th><th>Artefact</th>${TIERS.map((t) => `<th data-col="${t}">${t}</th>`).join('')}</tr></thead><tbody>
    ${D.order.map((id) => { const a = D.art[id]; return `<tr><td>${aid(id)}</td><td class="k"><a href="#/artefacts/${id}" style="color:inherit">${esc(a.name)}</a>${a.go_live_minimum ? ' <span class="badge ink" title="Go-live minimum for T3 and T4">min</span>' : ''}</td>${TIERS.map((t) => `<td data-col="${t}">${reqBadge(a.tiers[t])}</td>`).join('')}</tr>`; }).join('')}
  </tbody></table></div>
  <div class="row g16 mt12 small muted">${Object.entries(REQ_LONG).map(([k, l]) => `<span class="row g6">${reqBadge(k)} ${esc(l.split(':')[0])}</span>`).join('')}</div>
  <div class="callout info mt16">${icon('info')}<div>The go-live minimum for T3 and T4, from the source reference, is ${['02', '05', '07', '09', '11'].map((x) => `<a href="#/artefacts/${x}">${x}</a>`).join(', ')}. Moving up a tier is a gate (<a href="#/model/gates#G4">G4</a>), never a configuration change. Not sure which tier applies? <a href="#/tools/tier">Use the tier tool</a>.</div></div>`;
}

function raci() {
  return `
  <p class="small muted" style="margin-bottom:10px">Select a role column to highlight it. Rows the role has no part in fade.</p>
  <div class="tbl-card scroll-x"><table class="tbl matrix" id="raci-tbl" style="min-width:980px"><thead><tr><th>ID</th><th>Artefact</th>${ROLE_IDS.map((r) => `<th class="vert" data-col="${r}"><button class="chip" data-col-btn="${r}" style="writing-mode:inherit;border:0;background:none;padding:0;font:inherit;color:inherit;cursor:pointer" title="${esc(D.role[r].name)}">${esc(D.role[r].name)}</button></th>`).join('')}</tr></thead><tbody>
  ${D.order.map((id) => `<tr data-row="${id}"><td>${aid(id)}</td><td class="k"><a href="#/artefacts/${id}" style="color:inherit">${esc(D.art[id].name)}</a></td>${ROLE_IDS.map((r) => `<td data-col="${r}">${raciOf(id, r).map((l) => `<span class="rc ${l}">${l}</span>`).join('')}</td>`).join('')}</tr>`).join('')}
  </tbody></table></div>
  <div class="row g16 mt12 small muted"><span class="row g6"><span class="rc R">R</span>creates</span><span class="row g6"><span class="rc A">A</span>approves (exactly one)</span><span class="row g6"><span class="rc C">C</span>consulted before approval</span><span class="row g6"><span class="rc I">I</span>informed</span></div>
  <section class="section"><h2>The roles</h2><div class="grid auto-fill mt16">${D.roles.map((r) => `<a class="card role-card" href="#/roles/${r.id}">${av(r.id)}<div><h3>${esc(r.name)}</h3><p>${esc(r.description)}</p></div></a>`).join('')}</div></section>`;
}

function metrics() {
  const rows = [[100, '3.0%', 'Screening only'], [200, '1.5%', ''], [300, '1.0%', 'Monthly floor, T3'], [500, '0.6%', ''], [1000, '0.3%', 'Post-change / tier promotion']];
  const sizing = [['2%', '±1 pt', 753], ['2%', '±0.5 pt', '3,012'], ['3%', '±1 pt', '1,118'], ['5%', '±1 pt', '1,825'], ['5%', '±2 pt', 457], ['10%', '±2 pt', 865]];
  return `
  <div class="row g8" style="margin-bottom:12px"><span class="eyebrow">Kind</span><div class="seg" id="kind-seg">${['All', 'process', 'outcome', 'unknown'].map((k, i) => `<button data-k="${i ? k : ''}" aria-pressed="${i === 0}">${i ? k[0].toUpperCase() + k.slice(1) : k}</button>`).join('')}</div></div>
  <div class="tbl-card scroll-x"><table class="tbl" id="met-tbl" style="min-width:900px"><thead><tr><th>Metric</th><th>Kind</th><th>Formula</th><th>Source</th><th>Owner</th><th>Cadence</th><th>Threshold</th></tr></thead><tbody>
  ${D.metrics.map((m) => `<tr data-kind="${m.kind}"><td class="k">${esc(m.name)}</td><td>${kindBadge(m.kind)}</td><td>${linkIds(m.formula)}</td><td>${linkIds(m.source)}</td><td>${roleLink(m.owner)}</td><td>${esc(m.cadence)}</td><td>${linkIds(m.threshold)}</td></tr>`).join('')}
  </tbody></table></div>

  <section class="section">
    <h2>The outcome sampling method (09 and 10)</h2>
    <div class="grid cols-2 mt16">
      <div class="card prose small"><p><b>Principle.</b> If reality won't report back on what the agent closed, generate the report deliberately. Draw a random sample of the agent's closures. Have people independent of the agent re-perform them without seeing the agent's answer, then measure how often they disagree. This mirrors AML below-the-line testing, pointed at the agent's closures.</p>
      <p><b>Frame and strata.</b> The frame is every closure in the period, taken from 07, so the frame is itself evidenced. Stratify by stated confidence band, case type, and the category where systematic error is most likely. Independent review makes the selection and logs the seed.</p>
      <p><b>Disagreement is defined before the round.</b> Classify every disagreement as agent wrong, reviewer wrong, or both defensible. Only agent-wrong counts against the agent.</p></div>
      <div class="card prose small"><p><b>Reporting.</b> Always give a Wilson 95% interval and the worst stratum alongside the overall rate. A 1% overall rate that is 9% in one stratum is a 9% problem. The accountable executive sets the tolerance and writes it into 02. The framework insists a number is written down, but never proposes one.</p>
      <p><b>Why not an LLM judge.</b> A judge shares the agent's training, so it shares the agent's blind spots. Judges may triage which records a human sees first. They never produce the outcome number.</p>
      <p><b>Cost.</b> At 10,000 closures a month, a 300-case floor is 3% of the work the agent removed, done permanently by experienced reviewers. It goes in 01 as a line against the benefit.</p></div>
    </div>
    <div class="grid cols-2 mt16">
      <div class="tbl-card"><table class="tbl"><thead><tr><th>Rule of three · zero found in n</th><th class="num">95% upper bound</th><th>Use</th></tr></thead><tbody>${rows.map(([n, b, u]) => `<tr><td class="mono">${n.toLocaleString()}</td><td class="num">${b}</td><td>${u}</td></tr>`).join('')}</tbody></table></div>
      <div class="tbl-card"><table class="tbl"><thead><tr><th>Expected rate</th><th>Precision</th><th class="num">n needed (95%)</th></tr></thead><tbody>${sizing.map(([e, p, n]) => `<tr><td class="mono">${e}</td><td class="mono">${p}</td><td class="num">${n}</td></tr>`).join('')}</tbody></table></div>
    </div>
    <div class="callout outcome mt16">${icon('scale')}<div><b>Reduction rule.</b> A band may move to a reduced sampling rate only after four consecutive rounds in tolerance at the full rate. The floor is 300 per band per quarter. Any material change voids calibration and returns the band to the full rate. The loop shrinks, but it never closes. <a href="#/tools/sampling">Open the sampling calculator</a> · <a href="#/tools/calibration">Calibration check</a></div></div>
  </section>`;
}

function platform() {
  const flow = `
  <div class="flow">
    <div class="flow-row">
      <div class="flow-node"><b>Agent</b>proposes an action</div><div class="flow-arrow">→</div>
      <div class="flow-node hot"><b>Policy gate</b>compiled from ${linkIds('02')}, rules in ${linkIds('05')}. Allow, block or escalate.</div><div class="flow-arrow">→</div>
      <div class="flow-node hot"><b>Tool gateway</b>the only path, identity per agent</div><div class="flow-arrow">→</div>
      <div class="flow-node"><b>Core system</b></div>
    </div>
    <div class="flow-row"><div class="flow-node p" style="flex-basis:100%"><b>${linkIds('07')} Decision record</b>sealed before execution · hash-chained · signed · version triple · grounds in fields</div></div>
    <div class="flow-row">
      <div class="flow-node p"><b>${linkIds('08')} Control outcome record</b>OSCAL assessment-results per control run</div>
      <div class="flow-node o"><b>${linkIds('09')} Sampling loop (people)</b>blind re-performance of a random sample of closures</div>
    </div>
    <div class="flow-row"><div class="flow-node hot" style="flex-basis:100%"><b>${linkIds('11')} Oversight pack</b>tiles labelled <span class="badge process">Process</span> <span class="badge outcome">Outcome</span> <span class="badge unknown">Unknown</span> · signed by the accountable executive</div></div>
  </div>`;
  return `
  <h2>Runtime path and evidence path for one case</h2>
  <div class="card mt16">${flow}</div>
  <section class="section"><h2>Non-negotiable design rules</h2><p class="muted mt8">Artefacts 07 and 08 only count as evidence if every rule holds.</p>
  <div class="grid cols-3 mt16">${DESIGN_RULES.map((r) => `<div class="card"><h3>${esc(r.t)}</h3><p class="muted small mt8">${esc(r.b)}</p></div>`).join('')}</div></section>
  <section class="section"><h2>Components platform engineering builds once</h2>
  <div class="tbl-card scroll-x mt16"><table class="tbl" style="min-width:880px"><thead><tr><th>Component</th><th>Function</th><th>Inherit from</th><th>Maturity</th><th>Feeds</th></tr></thead><tbody>
  ${D.platform.map((c) => `<tr><td class="k">${esc(c.component)}</td><td>${esc(c.function)}</td><td>${esc(c.inherit_from)}</td><td>${c.maturity === 'Build' ? '<span class="badge warn">Build</span>' : esc(c.maturity)}</td><td>${linkIds(c.feeds_artefacts)}</td></tr>`).join('')}
  </tbody></table></div></section>`;
}

function roadmap() {
  return `
  <p class="muted prose">This assumes an existing risk function and an operations team doing the work today. The agent goes live at T2, so humans approve every action and every decision is effectively sampled at 100% until the evidence supports promotion.</p>
  <div class="timeline mt16">${ROADMAP.map((q) => `<div class="card"><div class="eyebrow accent">${q.months}</div><h3 class="mt8" style="margin-bottom:10px">${esc(q.title)}</h3>${q.lines.map(([w, t]) => `<div class="tl-line"><a class="who" href="#/roles/${w}">${w}</a><span>${linkIds(t)}</span></div>`).join('')}</div>`).join('')}</div>
  <section class="section"><div class="section-head"><div class="stack g4"><h2>Maturity: where is an agent today?</h2><p class="muted">The step from L3 to L4 is where the cost appears and where programmes stall, because L3 already looks finished. The oversight pack at L3 should say that it is.</p></div><a class="btn sm primary" href="#/tools/maturity">${icon('ladder')} Assess an agent</a></div>
  <div class="ladder">${MATURITY.map((m) => `<div class="rung"><span class="lv">${m.id}</span><div><b>${esc(m.name)}</b><p>${linkIds(m.body)}</p></div></div>`).join('')}</div></section>`;
}

function references() {
  return `
  <p class="muted prose"><span class="badge ok">Verified</span> means checked at the primary or a reputable secondary source on 23 Sep 2026. <span class="badge warn">Per source ref</span> means cited as in the Agentic Assurance Reference draft 0.1 and not re-checked. Confirm those before external use.</p>
  <div class="tbl-card scroll-x mt16"><table class="tbl" style="min-width:900px"><thead><tr><th>Reference</th><th>Version</th><th>Used for</th><th>Clauses</th><th>Status</th></tr></thead><tbody>
  ${D.references.map((r) => `<tr><td class="k">${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener noreferrer">${esc(r.reference)} ${icon('external', 'sm-ic')}</a>` : esc(r.reference)}</td><td>${esc(r.version)}</td><td>${esc(r.used_for)}</td><td class="mono xs">${esc(r.clauses)}</td><td>${refStatus(r.status)}</td></tr>`).join('')}
  </tbody></table></div>
  <div class="callout info mt16">${icon('info')}<div class="small">Changes from the source reference found while checking: the current OSCAL release is v1.2.3, not v1.2.2. The CSA Singapore agentic addendum was finalised on 17 Jun 2026. IMDA's framework was updated in May 2026 with multi-agent and automation-bias guidance. The IETF audit-trail draft is individual and not IETF-endorsed, and -04 (15 Sep 2026) adds optional ML-DSA-65 signatures and RFC 6962 Merkle anchoring.</div></div>`;
}

const SECTIONS = {
  gates: { n: 2, t: 'Seven gates, each with the artefacts that must exist to pass', l: 'Automated gates run in the pipeline and fail closed. Human gates are signed, and the signature is itself recorded evidence. A gate with missing artefacts is a failed gate, not one passed with conditions.', f: gates, name: 'Gates' },
  tiers: { n: 3, t: 'The autonomy tier decides which artefacts are mandatory', l: "Tiers follow the autonomy spectrum in IMDA's Model AI Governance Framework for Agentic AI (§2.1.1), equivalent to in control, in the loop, on the loop and out of the loop. The tier is recorded in 00 and the CI pipeline reads it to select the control profile (05).", f: tiers, name: 'Tiers' },
  raci: { n: 4, t: 'Who creates, approves, is consulted on, and is informed about each artefact', l: 'R creates the artefact. A approves it, and there is exactly one A per artefact. C must be consulted before approval. I receives it. Where platform engineering is R, the artefact is emitted by software.', f: raci, name: 'RACI' },
  metrics: { n: 6, t: 'Metric register, and the method behind the one outcome number', l: 'Every metric has a kind, a formula, a source artefact, an owner and a cadence. The platform computes process metrics from 07 and 08 by query. The outcome metrics can only come from 09 and 10. The oversight pack (11) is these rows, signed.', f: metrics, name: 'Metrics' },
  platform: { n: 7, t: 'What platform engineering builds once, so artefacts 06–08 emit themselves', l: 'These are shared across every agent, generic and deterministic.', f: platform, name: 'Platform' },
  roadmap: { n: 8, t: 'Twelve months, one agent, from nothing to evidenced (L4)', l: '', f: roadmap, name: 'Roadmap' },
  references: { n: 9, t: 'What each reference is used for, with its verification status', l: '', f: references, name: 'References' },
};

export function renderSection(key) {
  const s = SECTIONS[key];
  return {
    title: s.name,
    crumbs: [['Home', '#/'], ['Operating model', '#/model'], [s.name]],
    html: `${pageHead({ eyebrow: `Operating model · ${s.n}`, title: s.t, lede: s.l ? linkIds(s.l) : '' })}${subnav('model/' + key)}<div class="stack g16">${s.f()}</div>`,
    mount(root) {
      if (key === 'tiers') {
        root.querySelector('#tier-seg').addEventListener('click', (e) => {
          const b = e.target.closest('[data-t]'); if (!b) return;
          root.querySelectorAll('#tier-seg button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          root.querySelectorAll('#tier-tbl [data-col]').forEach((c) => c.classList.toggle('colhl', !!b.dataset.t && c.dataset.col === b.dataset.t));
        });
      }
      if (key === 'raci') {
        let cur = S().role || '';
        const apply = () => {
          root.querySelectorAll('#raci-tbl [data-col]').forEach((c) => c.classList.toggle('colhl', c.dataset.col === cur));
          root.querySelectorAll('#raci-tbl tr[data-row]').forEach((tr) => tr.classList.toggle('dimrow', !!cur && !raciOf(tr.dataset.row, cur).length));
        };
        root.querySelector('#raci-tbl').addEventListener('click', (e) => { const b = e.target.closest('[data-col-btn]'); if (b) { cur = cur === b.dataset.colBtn ? '' : b.dataset.colBtn; apply(); } });
        apply();
      }
      if (key === 'metrics') {
        root.querySelector('#kind-seg').addEventListener('click', (e) => {
          const b = e.target.closest('[data-k]'); if (!b) return;
          root.querySelectorAll('#kind-seg button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
          root.querySelectorAll('#met-tbl tbody tr').forEach((tr) => { tr.style.display = !b.dataset.k || tr.dataset.kind === b.dataset.k ? '' : 'none'; });
        });
      }
    },
  };
}
