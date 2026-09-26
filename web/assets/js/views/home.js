import { D } from '../data.js';
import { S, update } from '../store.js';
import { esc, icon, toast } from '../ui.js';
import { queue, agentName, wilson } from '../logic.js';
import { av } from '../components.js';
import { loadDemo } from '../demo.js';
import { SERVICES } from '../services.js';
import { offerCard } from './services.js';
import { alertsFor, alertRow } from './tower.js';
import { go } from '../app.js';

// Exhibit 1: monthly disagreement rate with its 95% interval against the
// tolerance written into 02. Figures are the illustrative worked example.
function exhibit() {
  const rounds = [['May', 300, 3], ['Jun', 350, 1], ['Jul', 400, 2], ['Aug', 300, 0], ['Sep', 320, 1]];
  const W = 620, H = 260, L = 44, R = 16, T = 16, B = 34, max = 0.04;
  const x = (i) => L + (i + 0.5) * ((W - L - R) / rounds.length);
  const y = (v) => T + (1 - v / max) * (H - T - B);
  const tol = 0.02;
  const grid = [0, 0.01, 0.02, 0.03, 0.04].map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="var(--rule)" /><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="var(--ink-3)">${(v * 100).toFixed(0)}%</text>`).join('');
  const marks = rounds.map(([m, n, k], i) => {
    const [lo, hi] = wilson(k, n);
    const p = k / n;
    const within = hi <= tol;
    const c = within ? 'var(--ink)' : 'var(--outcome)';
    return `<line x1="${x(i)}" x2="${x(i)}" y1="${y(Math.min(hi, max))}" y2="${y(lo)}" stroke="${c}" stroke-width="2"/>
      <line x1="${x(i) - 7}" x2="${x(i) + 7}" y1="${y(Math.min(hi, max))}" y2="${y(Math.min(hi, max))}" stroke="${c}" stroke-width="2"/>
      <line x1="${x(i) - 7}" x2="${x(i) + 7}" y1="${y(lo)}" y2="${y(lo)}" stroke="${c}" stroke-width="2"/>
      <circle cx="${x(i)}" cy="${y(p)}" r="5" fill="${within ? 'var(--ink)' : 'var(--bg)'}" stroke="${c}" stroke-width="2"/>
      <text x="${x(i)}" y="${H - 12}" text-anchor="middle" font-size="12" fill="var(--ink-2)">${m}</text>
      <text x="${x(i) + 10}" y="${y(p) + 4}" font-size="11" fill="var(--ink-2)">${(p * 100).toFixed(1)}%</text>`;
  }).join('');
  return `<figure class="exhibit" style="margin:0">
    <div class="cap"><b>Exhibit 1</b><span>Disagreement rate by month, with 95% interval</span></div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Monthly disagreement rates: May 1.0% (interval straddles tolerance), June 0.3%, July 0.5%, August 0.0%, September 0.3%, all within a 2% tolerance.">
      ${grid}
      <line x1="${L}" x2="${W - R}" y1="${y(tol)}" y2="${y(tol)}" stroke="var(--brand)" stroke-width="2" stroke-dasharray="6 5"/>
      <text x="${W - R}" y="${y(tol) - 6}" text-anchor="end" font-size="11.5" font-weight="600" fill="var(--brand)">Tolerance set by the accountable executive · 2.0%</text>
      ${marks}
    </svg>
    <div class="src">Filled marks: the whole interval sits below tolerance, so the round counts toward promotion. Hollow: the interval straddles it, so the round is inconclusive. Source: illustrative sanctions-triage example, n = 300–400 a month, blind re-performance.</div>
  </figure>`;
}

export function render() {
  const s = S();
  const role = s.role ? D.role[s.role] : null;
  const has = s.agents.length > 0;
  const q = role ? queue(s.agents, role.id).filter((x) => x.kind !== 'optional' && x.kind !== 'read') : [];
  const alerts = s.agents.flatMap(alertsFor);
  const featured = ['intake', 'golive', 'monthly', 'promotion', 'change', 'audit'].map((id) => SERVICES.find((x) => x.id === id));
  const firstRole = role?.id || 'AE';

  const desk = has ? `
  <section class="wrap sec" style="padding-bottom:0">
    <div class="sec-head"><div><span class="eyebrow accent">Your desk</span><h2>${role ? `Welcome back, ${esc(role.name.toLowerCase())}.` : 'Welcome back.'}</h2></div>
      <div class="row g16" style="justify-content:flex-end"><a class="link-arrow" href="#/tower">Control tower ${icon('arrowRight')}</a><a class="btn primary" href="#/work">Open my work</a></div></div>
    <div class="desk">
      <div><h3>Waiting for you <span class="small faint">${q.length}</span></h3>
        ${!role ? `<p class="muted">Choose your role to see your queue. <button class="btn sm" data-action="role-menu">Choose role</button></p>`
          : q.length ? `<div>${q.slice(0, 4).map((x) => `<a class="q-item" href="${x.href}"><span class="verb ${x.verb}">${esc(x.label)}</span><span><b>${esc(x.title)}</b><small>${esc(agentName(x.agent))}</small></span>${icon('arrowRight')}</a>`).join('')}</div>`
          : '<p class="muted">Nothing is waiting for you.</p>'}</div>
      <div><h3>Needs attention <span class="small faint">${alerts.length}</span></h3>
        ${alerts.length ? `<div>${alerts.slice(0, 4).map((x) => alertRow(x)).join('')}</div>` : '<p class="muted">No alerts across your agents.</p>'}</div>
    </div>
  </section>` : '';

  return {
    title: 'Assurance for decisioning AI agents',
    crumbs: [['Home']],
    wide: true,
    html: `
    <div class="hero-dark">
    <section class="hero-ed">
      <div>
        <span class="eyebrow accent">Agentic SDLC operating model</span>
        <h1 class="mt24">Assurance for AI agents that <em>make decisions</em>.</h1>
        <p class="lede">For any agent that decides, acts and closes a case nobody revisits. GovKit fits governance into the SDLC you already run, with nine engagements, seventeen artefacts and seven signed gates. It also produces the one number most programmes never have: evidence that the decisions were right.</p>
        <div class="ctas">
          <a class="btn primary lg" href="#/services">Explore our services</a>
          <button class="link-arrow" data-demo style="background:none;border:0;font:inherit;font-weight:600;cursor:pointer">See a live engagement ${icon('arrowRight')}</button>
        </div>
      </div>
      <div class="facts">
        <div><b>9</b><span>Engagements, from intake to retirement</span></div>
        <div><b>17</b><span>Artefacts, each with an owner, a form and a done test</span></div>
        <div><b>7</b><span>Gates, signed with the reasoning recorded</span></div>
        <div><b>12</b><span>Roles, each with a playbook and a queue</span></div>
        <div><b>0</b><span>Accounts or uploads. It runs in your browser</span></div>
      </div>
    </section>
    </div>

    ${desk}

    <div class="band-paper" style="margin-top:${has ? '72px' : '0'}">
      <section class="wrap sec">
        <div class="sec-head"><div><span class="eyebrow accent">Services</span><h2>Nine engagements, from the business case to decommissioning</h2></div>
          <p>Choose the outcome you need. Each engagement brings the right roles, forms and evidence to a signed decision, and tracks each agent's progress from its record.</p></div>
        <div class="offer-grid">${featured.map(offerCard).join('')}</div>
        <p class="mt24"><a class="link-arrow" href="#/services">All nine engagements ${icon('arrowRight')}</a></p>
      </section>
    </div>

    <section class="band-brand">
      <div class="wrap">
        <blockquote>A 1% overall rate that is 9% in one stratum is a 9% problem.</blockquote>
        <div class="stack g12"><span class="eyebrow accent">The evidence gap</span>
          <p>Most AI governance proves the machinery ran: the control fired, the log exists, the dashboard is green. None of that says whether a single decision was right. GovKit makes outcome evidence routine. Blind re-performance of a random sample gives an interval and the worst stratum, against a tolerance the accountable executive wrote down.</p>
          <a class="link-arrow" href="#/model/metrics">Read the sampling method ${icon('arrowRight')}</a></div>
      </div>
    </section>

    <section class="wrap sec">
      <div class="sec-head" style="align-items:start"><div><span class="eyebrow accent">Outcome evidence</span><h2>A number you can defend to a board</h2>
        <p class="mt16 muted">Every month, independent reviewers re-perform a stratified random sample without seeing the agent's answer. GovKit turns the result into a rate, a Wilson interval and a verdict against tolerance. Four consecutive full-rate rounds within tolerance, with at least 1,000 cases, open the way to a higher tier. A configuration change never does.</p>
        <p class="mt16"><a class="link-arrow" href="#/tools/sampling">Try the sampling calculator ${icon('arrowRight')}</a></p></div>
        ${exhibit()}
      </div>
    </section>

    <section class="wrap sec" style="padding-top:0">
      <div class="sec-head"><div><span class="eyebrow accent">Our approach</span><h2>Four rules the operating model is built on</h2></div><p>They are why this is an operating model rather than a policy binder.</p></div>
      <div class="approach">${(D.guide.principles || []).map((p, i) => `<div><span class="n">0${i + 1}</span><b>${esc(p.title)}</b><p>${esc(p.body)}</p></div>`).join('')}</div>
    </section>

    <div class="band-paper">
      <section class="wrap sec">
        <div class="sec-head"><div><span class="eyebrow accent">Built for every role</span><h2>Twelve roles, one accountable owner per artefact</h2></div>
          <p>Act as your role and GovKit shows what you draft, approve, are consulted on and sign. In a workshop, switch roles to play a gate through end to end.</p></div>
        <div class="role-strip">
          <div class="role-tabs" role="tablist" aria-label="Roles">${D.roles.map((r) => `<button role="tab" data-r="${r.id}" aria-selected="${r.id === firstRole}">${av(r.id)} ${esc(r.name)}</button>`).join('')}</div>
          <div class="role-panel" id="role-panel"></div>
        </div>
      </section>
    </div>

    <section class="wrap sec">
      <div class="sec-head"><div><span class="eyebrow accent">Evidence, labelled</span><h2>Every number says what kind of number it is</h2></div><p>The oversight pack never mixes them without a label, and the Unknown tile is mandatory.</p></div>
      <div class="kinds">
        <div style="--k:var(--process)"><b>Process</b><h3>The control ran</h3><p>Computed by the platform from decision records (07) and control outcome records (08). Necessary, but silent on whether decisions were right.</p></div>
        <div style="--k:var(--outcome)"><b>Outcome</b><h3>The decision was right</h3><p>Only from blind re-performance of a random sample (09), with an interval and the worst stratum. Never from an LLM judge.</p></div>
        <div style="--k:var(--unknown)"><b>Unknown</b><h3>Not tested</h3><p>Strata with no sample are shown, so the gaps sit on the page rather than inside an average.</p></div>
      </div>
      <div class="cta-band mt48">
        <h2>Put your first agent through intake this afternoon.</h2>
        <div class="row g16"><button class="link-arrow" data-demo style="background:none;border:0;font:inherit;font-weight:600;cursor:pointer">See a live engagement ${icon('arrowRight')}</button><a class="btn primary lg" href="#/services/intake">Start with intake</a></div>
      </div>
    </section>
    <div style="height:72px"></div>`,
    mount(root) {
      root.querySelectorAll('[data-demo]').forEach((b) => b.addEventListener('click', () => { const a = loadDemo(); go(`agents/${a.id}`); }));
      const panel = root.querySelector('#role-panel');
      const show = (id) => {
        const r = D.role[id], g = D.guide.roles[id] || {};
        root.querySelectorAll('[data-r]').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.r === id)));
        panel.innerHTML = `<div class="row g16">${av(id, 'lg')}<div><h3>${esc(r.name)}</h3><div class="small faint">${esc(r.description)}</div></div></div>
          <p class="quote">${esc(g.headline || '')}</p>
          <div class="grid cols-2 mt24"><div class="principle"><b>You decide</b><ul class="small muted">${(g.you_decide || []).slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
          <div class="principle"><b>Your first steps</b><ol class="small muted">${(g.first_steps || []).slice(0, 3).map((x) => `<li>${esc(x)}</li>`).join('')}</ol></div></div>
          <div class="row g16 mt24"><button class="btn primary" data-act="${id}">Act as ${esc(r.name)}</button><a class="link-arrow" href="#/roles/${id}">Read the full playbook ${icon('arrowRight')}</a></div>`;
        panel.querySelector('[data-act]').addEventListener('click', () => { update((st) => { st.role = id; }); toast(`Now acting as ${r.name}`); });
      };
      root.querySelector('.role-tabs').addEventListener('click', (e) => { const b = e.target.closest('[data-r]'); if (b) show(b.dataset.r); });
      show(firstRole);
    },
  };
}
