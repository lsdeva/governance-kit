// Home hero: an auto-advancing set of six slides that tell the story of the
// operating model, drawn from the same data the rest of the site renders.
//   1  What GovKit is
//   2  Governance inside the SDLC you already run
//   3  Twelve roles, one accountable owner
//   4  Anchored to the governance frameworks
//   5  Evidence that the decisions were right
//   6  How to use GovKit
// Every animation is CSS, triggered when a slide becomes active, and all of
// it is switched off under prefers-reduced-motion.

import { D, isOutcome } from '../data.js';
import { esc, icon } from '../ui.js';
import { wilson } from '../logic.js';
import { av } from '../components.js';

const INTERVAL = 9000;

// ---------------------------------------------------------------- exhibit

// Monthly disagreement rate with its 95% interval against the tolerance in
// 02. Figures are the illustrative worked example. Shared with the page body.
export function exhibit({ dark = false, animated = false } = {}) {
  const rounds = [['May', 300, 3], ['Jun', 350, 1], ['Jul', 400, 2], ['Aug', 300, 0], ['Sep', 320, 1]];
  const W = 620, H = 260, L = 44, R = 16, T = 16, B = 34, max = 0.04;
  const x = (i) => L + (i + 0.5) * ((W - L - R) / rounds.length);
  const y = (v) => T + (1 - v / max) * (H - T - B);
  const tol = 0.02;
  const ink = dark ? '#FFFFFF' : 'var(--ink)', ink2 = dark ? '#CFCFCF' : 'var(--ink-2)', ink3 = dark ? '#8F8F8F' : 'var(--ink-3)';
  const rule = dark ? '#2E2E2E' : 'var(--rule)', accent = dark ? 'var(--hi)' : 'var(--brand)', bg = dark ? '#111' : 'var(--bg)';
  const grid = [0, 0.01, 0.02, 0.03, 0.04].map((v) => `<line x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}" stroke="${rule}"/><text x="${L - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="${ink3}">${(v * 100).toFixed(0)}%</text>`).join('');
  const marks = rounds.map(([m, n, k], i) => {
    const [lo, hi] = wilson(k, n);
    const p = k / n;
    const within = hi <= tol;
    const c = within ? ink : 'var(--outcome)';
    return `<g class="${animated ? 'a-mark' : ''}" style="--i:${i}">
      <line x1="${x(i)}" x2="${x(i)}" y1="${y(Math.min(hi, max))}" y2="${y(lo)}" stroke="${c}" stroke-width="2"/>
      <line x1="${x(i) - 7}" x2="${x(i) + 7}" y1="${y(Math.min(hi, max))}" y2="${y(Math.min(hi, max))}" stroke="${c}" stroke-width="2"/>
      <line x1="${x(i) - 7}" x2="${x(i) + 7}" y1="${y(lo)}" y2="${y(lo)}" stroke="${c}" stroke-width="2"/>
      <circle cx="${x(i)}" cy="${y(p)}" r="5" fill="${within ? ink : bg}" stroke="${c}" stroke-width="2"/>
      <text x="${x(i)}" y="${H - 12}" text-anchor="middle" font-size="12" fill="${ink2}">${m}</text>
      <text x="${x(i) + 10}" y="${y(p) + 4}" font-size="11" fill="${ink2}">${(p * 100).toFixed(1)}%</text></g>`;
  }).join('');
  return `<figure class="exhibit ${dark ? 'exhibit-dark' : ''}" style="margin:0">
    <div class="cap"><b>Exhibit 1</b><span>Disagreement rate by month, with 95% interval</span></div>
    <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Monthly disagreement rates: May 1.0% (interval straddles tolerance), June 0.3%, July 0.5%, August 0.0%, September 0.3%, all within a 2% tolerance.">
      ${grid}
      <line class="${animated ? 'a-tol' : ''}" x1="${L}" x2="${W - R}" y1="${y(tol)}" y2="${y(tol)}" stroke="${accent}" stroke-width="2" stroke-dasharray="6 5"/>
      <text x="${W - R}" y="${y(tol) - 6}" text-anchor="end" font-size="11.5" font-weight="600" fill="${accent}">Tolerance set by the accountable executive · 2.0%</text>
      ${marks}
    </svg>
    <div class="src">Filled marks: the whole interval sits below tolerance, so the round counts toward promotion. Hollow: the interval straddles it, so the round is inconclusive. Source: illustrative sanctions-triage example, n = 300–400 a month, blind re-performance.</div>
  </figure>`;
}

// ---------------------------------------------------------------- slides

const FRAMEWORKS = [
  ['IMDA MGF for Agentic AI', /IMDA/],
  ['CSA Singapore Agentic Addendum', /CSA SG/],
  ['SG GenAI SSP (GA-1 to GA-8)', /SSP/],
  ['ISO/IEC 42001 Annex A', /42001/],
  ['NIST AI RMF 1.0', /NIST/],
  ['OWASP ASI 2026', /OWASP ASI/],
  ['CSA AICM v1.1', /AICM/],
  ['OSCAL v1.2.3', /OSCAL/],
  ['EU AI Act', /EU AI Act/],
  ['MAS SAFR', /SAFR/],
];

function slide1() {
  const facts = [[9, 'Engagements, from intake to retirement'], [17, 'Artefacts, each with an owner, a form and a done test'], [7, 'Gates, signed with the reasoning recorded'], [12, 'Roles, each with a playbook and a queue'], [0, 'Accounts or uploads. It runs in your browser']];
  return `<div class="hero-ed">
    <div>
      <span class="eyebrow accent a-up">Agentic SDLC operating model</span>
      <h1 class="mt24 a-up" style="--i:1">Assurance for AI agents that <em>make decisions</em>.</h1>
      <p class="lede a-up" style="--i:2">For any agent that decides, acts and closes a case nobody revisits. GovKit fits governance into the SDLC you already run, with nine engagements, seventeen artefacts and seven signed gates. It also produces the one number most programmes never have: evidence that the decisions were right.</p>
      <div class="ctas a-up" style="--i:3">
        <a class="btn primary lg" href="#/services">Explore our services</a>
        <button class="link-arrow" data-demo type="button">See a live engagement ${icon('arrowRight')}</button>
      </div>
    </div>
    <div class="facts a-up" style="--i:2">${facts.map(([n, t], i) => `<div class="a-up" style="--i:${i + 3}"><b data-count="${n}">${n}</b><span>${t}</span></div>`).join('')}</div>
  </div>`;
}

// Long phase names get a soft hyphen so narrow columns break them cleanly.
const softBreak = (name) => (name.length > 9 ? esc(name.slice(0, 7)) + '&shy;' + esc(name.slice(7)) : esc(name));

function slide2() {
  const cols = D.phases.map((p, i) => `<div class="ph a-up" style="--i:${i}">
      <div class="ph-h"><span class="ph-n">${p.id}</span><b>${softBreak(p.name)}</b><small>${esc(p.ceremony)}</small></div>
      <div class="ph-items">${p.artefacts.map((it, j) => `<span class="ph-chip ${isOutcome(it.id) ? 'o' : ''} a-pop" style="--i:${i + 3 + j}" title="${esc(D.art[it.id].name)}${it.note ? ' · ' + esc(it.note) : ''}">${it.id}</span>`).join('')}</div>
      ${p.gate ? `<div class="ph-gate a-in" style="--i:${i + 8}"><b>${p.gate.id}</b>${esc(p.gate.name)}</div>` : '<div class="ph-gate none"></div>'}
    </div>`).join('');
  return `<div class="hero-ed hero-map" lang="en">
    <div>
      <span class="eyebrow accent a-up">01 · Inside the SDLC you already run</span>
      <h2 class="hs-h a-up" style="--i:1">Seventeen artefacts on nine phases. <em>No new phases.</em></h2>
      <p class="lede a-up" style="--i:2">Each governance artefact attaches to a ceremony teams already hold: business case, architecture review, backlog refinement, CI, UAT, change advisory, ops review. A gate closes each stage, and a gate with anything missing is a failed gate, never one passed with conditions.</p>
      <ul class="hs-list a-up" style="--i:3">
        <li><b>Controls are backlog items.</b> Written as stories with automated tests, demoed next to features.</li>
        <li><b>Records are made at the time.</b> Decision and control records are emitted by the platform, never written up afterwards.</li>
        <li><b>Blue carries process evidence, amber carries outcome evidence.</b></li>
      </ul>
    </div>
    <div class="ph-map" aria-label="The nine SDLC phases with the artefacts and gate in each">${cols}</div>
  </div>`;
}

function slide3() {
  const sample = ['00', '02', '09', '11'];
  const letter = (a, r) => {
    const R = D.art[a].raci;
    if (R.responsible.includes(r)) return 'R';
    if (R.accountable === r) return 'A';
    if (R.consulted.includes(r)) return 'C';
    if (R.informed.includes(r)) return 'I';
    return '';
  };
  const head = D.roles.map((r, i) => `<th class="a-pop" style="--i:${i}"><span title="${esc(r.name)}">${av(r.id)}</span></th>`).join('');
  const rows = sample.map((a, ri) => `<tr><td class="art"><span class="aid ${isOutcome(a) ? 'o' : ''}">${a}</span> ${esc(D.art[a].name)}</td>${D.roles.map((r, i) => { const l = letter(a, r.id); return `<td>${l ? `<span class="rc ${l} a-pop" style="--i:${12 + ri * 12 + i}">${l}</span>` : ''}</td>`; }).join('')}</tr>`).join('');
  return `<div class="hero-ed">
    <div>
      <span class="eyebrow accent a-up">02 · Roles and accountability</span>
      <h2 class="hs-h a-up" style="--i:1">Twelve roles. <em>Exactly one accountable owner</em> per artefact.</h2>
      <p class="lede a-up" style="--i:2">R creates the artefact. A approves it, and there is only ever one A. C must be consulted before approval. I receives it. Where platform engineering is R, software emits the artefact and the team owns the emitter.</p>
      <div class="hs-roles a-up" style="--i:3">${D.roles.map((r, i) => `<span class="a-pop" style="--i:${i + 4}">${av(r.id)}<b>${esc(r.name)}</b></span>`).join('')}</div>
    </div>
    <div class="raci-mini">
      <div class="raci-cap">RACI for four of the seventeen artefacts</div>
      <table><thead><tr><th></th>${head}</tr></thead><tbody>${rows}</tbody></table>
      <div class="raci-key"><span><span class="rc R">R</span> creates</span><span><span class="rc A">A</span> approves</span><span><span class="rc C">C</span> consulted</span><span><span class="rc I">I</span> informed</span></div>
    </div>
  </div>`;
}

function slide4() {
  const fw = FRAMEWORKS.map(([name, re]) => ({ name, ids: D.order.filter((id) => D.art[id].references.some((r) => re.test(r.source))) }));
  const W = 560, rowF = 36, rowA = 18, top = 8;
  const H = Math.max(fw.length * rowF, D.order.length * rowA) + top * 2;
  const fy = (i) => top + rowF / 2 + i * rowF;
  const ay = (i) => top + rowA / 2 + i * rowA;
  const xL = 250, xR = 330;
  let lines = '', k = 0;
  fw.forEach((f, i) => f.ids.forEach((id) => {
    const j = D.order.indexOf(id);
    lines += `<path class="a-draw" style="--i:${k++}" d="M${xL} ${fy(i)} C ${xL + 40} ${fy(i)}, ${xR - 40} ${ay(j)}, ${xR} ${ay(j)}" fill="none" stroke="var(--hi)" stroke-opacity=".55" stroke-width="1.2"/>`;
  }));
  const fl = fw.map((f, i) => `<g class="a-in" style="--i:${i}"><text x="${xL - 10}" y="${fy(i) + 4}" text-anchor="end" font-size="12.5" font-weight="600" fill="#fff">${esc(f.name)}</text><text x="${xL - 10}" y="${fy(i) + 17}" text-anchor="end" font-size="10.5" fill="#8F8F8F">${f.ids.length} artefact${f.ids.length === 1 ? '' : 's'}</text></g>`).join('');
  const al = D.order.map((id, j) => `<text class="a-in" style="--i:${j + 2}" x="${xR + 10}" y="${ay(j) + 4}" font-size="11" fill="${isOutcome(id) ? 'var(--outcome)' : '#CFCFCF'}"><tspan font-family="var(--mono)" fill="${isOutcome(id) ? 'var(--outcome)' : 'var(--hi)'}">${id}</tspan> ${esc(D.art[id].name)}</text>`).join('');
  const total = fw.reduce((n, f) => n + f.ids.length, 0);
  return `<div class="hero-ed">
    <div>
      <span class="eyebrow accent a-up">03 · Anchored to the frameworks</span>
      <h2 class="hs-h a-up" style="--i:1">Every artefact cites <em>the clause it satisfies</em>.</h2>
      <p class="lede a-up" style="--i:2">Not a crosswalk written afterwards. Each of the seventeen artefacts names the framework clauses it exists to meet, ${total} citations in all, with a verification status on every reference. Where a published format or method exists, GovKit reuses it rather than writing a house version.</p>
      <ul class="hs-list a-up" style="--i:3">
        <li><b>Singapore:</b> IMDA's Model AI Governance Framework for Agentic AI, the CSA Securing Agentic AI addendum, the GovTech GenAI SSP and AI Guardian.</li>
        <li><b>International:</b> ISO/IEC 42001, NIST AI RMF, OWASP ASI 2026, CSA AICM, OSCAL, the EU AI Act.</li>
        <li><b>Honest gaps:</b> the two artefacts with no published method, 09 and 10, say so.</li>
      </ul>
    </div>
    <div class="fw-map"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Lines from ten governance frameworks to the artefacts that cite them">${lines}${fl}${al}</svg></div>
  </div>`;
}

function slide5() {
  return `<div class="hero-ed">
    <div>
      <span class="eyebrow accent a-up">04 · Outcome evidence</span>
      <h2 class="hs-h a-up" style="--i:1">Process proves the control ran. <em>Outcome proves the decision was right.</em></h2>
      <p class="lede a-up" style="--i:2">Every month, reviewers independent of the agent owner re-perform a stratified random sample of its closures, blind to the agent's answer. The result is a disagreement rate with a Wilson 95% interval and the worst stratum, judged against a tolerance the accountable executive wrote down.</p>
      <ul class="hs-list a-up" style="--i:3">
        <li><b>Within tolerance:</b> the whole interval sits at or below it. The round counts toward promotion.</li>
        <li><b>Four consecutive full-rate rounds and 1,000 cases</b> earn a higher autonomy tier at gate G4. A configuration change never does.</li>
        <li><b>Every number is labelled</b> Process, Outcome or Unknown, and the Unknown tile is mandatory.</li>
      </ul>
    </div>
    <div class="a-up" style="--i:2">${exhibit({ dark: true, animated: true })}</div>
  </div>`;
}

function slide6() {
  const steps = [
    ['Act as your role', 'Twelve roles. Your role sets your queue and what you can sign.', `<div class="mk-roles">${['AE', 'AOW', 'RC', 'IRV'].map((r, i) => `<span class="${i === 1 ? 'on' : ''}">${av(r)}${esc(D.role[r].name)}</span>`).join('')}</div>`],
    ['Register the agent, choose its tier', 'The autonomy tier decides which artefacts are mandatory. First go-live is at T2 or below.', `<div class="mk-tiers">${['T1', 'T2', 'T3', 'T4'].map((t) => `<span class="${t === 'T2' ? 'on' : ''}"><b>${t}</b>${t === 'T2' ? 'start here' : ''}</span>`).join('')}</div>`],
    ['Draft, consult, approve', 'R drafts each form with field-level guidance. C records a view. A approves against the done-when test, or returns it.', `<div class="mk-status"><span class="st draft">Draft</span><i></i><span class="st submitted">In review</span><i></i><span class="st approved">Approved</span></div>`],
    ['Pass the gate', 'Each gate lists the artefacts and checks it needs. GovKit suggests answers it can compute. Approvers sign with a rationale.', `<div class="mk-gate"><span>${icon('check')} 06 signed build</span><span>${icon('check')} 13 evaluation passed</span><span>${icon('check')} 12 drill inside limit</span><b>G3 · Approval to operate</b></div>`],
    ['Operate on evidence', 'Monthly sampling, a control tower with computed alerts, material-change checks, and an evidence pack for auditors.', `<div class="mk-tile"><small>Disagreement · Wilson 95%</small><b>0.3%</b><span>0.1–1.7% · n=320</span><em>Within tolerance</em></div>`],
  ];
  return `<div class="hero-ed hero-steps">
    <div>
      <span class="eyebrow accent a-up">05 · How to use GovKit</span>
      <h2 class="hs-h a-up" style="--i:1">Five steps, <em>the same loop at every stage</em>.</h2>
      <p class="lede a-up" style="--i:2">From the business case to decommissioning, the loop is the same: the right role drafts, the consulted roles comment, the accountable role signs, and the gate opens only when everything it needs exists. Nothing leaves your browser.</p>
      <div class="ctas a-up" style="--i:3"><a class="btn primary lg" href="#/agents/new">Register an agent</a><a class="link-arrow" href="#/guide">Read how it works ${icon('arrowRight')}</a></div>
    </div>
    <ol class="how">${steps.map(([t, b, mk], i) => `<li class="a-up" style="--i:${i + 2}"><span class="how-n">${i + 1}</span><div><b>${t}</b><p>${b}</p><div class="mk a-in" style="--i:${i + 4}">${mk}</div></div></li>`).join('')}</ol>
  </div>`;
}

const SLIDES = [
  ['What GovKit is', slide1], ['Inside the SDLC', slide2], ['Roles', slide3], ['Frameworks', slide4], ['Outcome evidence', slide5], ['How to use it', slide6],
];

export function heroHtml() {
  return `<section class="hero-dark hero-c" aria-roledescription="carousel" aria-label="What GovKit is and how it works">
    <div class="hero-track">${SLIDES.map(([label, fn], i) => `<div class="hs ${i === 0 ? 'active' : ''}" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${SLIDES.length}: ${esc(label)}" ${i === 0 ? '' : 'aria-hidden="true"'}>${fn()}</div>`).join('')}</div>
    <div class="hero-nav wrap">
      <button class="hero-arrow" data-prev aria-label="Previous slide">${icon('arrowLeft')}</button>
      <div class="hero-dots" role="tablist" aria-label="Slides">${SLIDES.map(([label], i) => `<button role="tab" data-go="${i}" aria-selected="${i === 0}" aria-label="${esc(label)}"><i></i><span>${esc(label)}</span></button>`).join('')}</div>
      <button class="hero-arrow" data-next aria-label="Next slide">${icon('arrowRight')}</button>
      <button class="hero-play" data-play aria-label="Pause">${icon('pause')}</button>
    </div>
  </section>`;
}

export function mountHero(root) {
  const c = root.querySelector('.hero-c');
  if (!c) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const track = c.querySelector('.hero-track');
  const slides = [...c.querySelectorAll('.hs')];
  const dots = [...c.querySelectorAll('[data-go]')];
  const playBtn = c.querySelector('[data-play]');
  let i = 0, timer = null, paused = reduce, hovering = false;

  const countUp = (slide) => {
    slide.querySelectorAll('[data-count]').forEach((el) => {
      const target = +el.dataset.count;
      if (reduce || !target) { el.textContent = target; return; }
      const t0 = performance.now();
      const tick = (t) => { const k = Math.min(1, (t - t0) / 900); el.textContent = Math.round(target * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
  };
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, j) => { s.style.transform = `translateX(${(j - i) * 100}%)`; s.classList.toggle('active', j === i); s.setAttribute('aria-hidden', String(j !== i)); });
    fit();
    dots.forEach((d, j) => { d.setAttribute('aria-selected', String(j === i)); d.classList.toggle('running', j === i && !paused && !hovering); });
    countUp(slides[i]);
  };
  // The track is sized to the active slide, so short slides don't sit over
  // the empty space left by the tallest one.
  const fit = () => { track.style.height = `${slides[i].offsetHeight}px`; };
  window.addEventListener('resize', fit);
  if (document.fonts?.ready) document.fonts.ready.then(fit);
  const stop = () => { clearInterval(timer); timer = null; };
  const start = () => { stop(); if (paused || hovering || reduce) return; timer = setInterval(() => show(i + 1), INTERVAL); };
  const restart = () => { start(); dots.forEach((d, j) => d.classList.toggle('running', j === i && !paused && !hovering)); };

  c.addEventListener('click', (e) => {
    const t = e.target.closest('[data-prev],[data-next],[data-go],[data-play]');
    if (!t) return;
    if (t.dataset.go !== undefined) show(+t.dataset.go);
    else if (t.hasAttribute('data-prev')) show(i - 1);
    else if (t.hasAttribute('data-next')) show(i + 1);
    else if (t.hasAttribute('data-play')) {
      paused = !paused;
      playBtn.innerHTML = icon(paused ? 'play' : 'pause');
      playBtn.setAttribute('aria-label', paused ? 'Play' : 'Pause');
    }
    restart();
  });
  c.addEventListener('keydown', (e) => {
    if (e.target.matches('input,textarea,select')) return;
    if (e.key === 'ArrowRight') { show(i + 1); restart(); } else if (e.key === 'ArrowLeft') { show(i - 1); restart(); }
  });
  c.addEventListener('mouseenter', () => { hovering = true; restart(); });
  c.addEventListener('mouseleave', () => { hovering = false; restart(); });
  c.addEventListener('focusin', () => { hovering = true; restart(); });
  c.addEventListener('focusout', (e) => { if (!c.contains(e.relatedTarget)) { hovering = false; restart(); } });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
  // Touch swipe.
  let x0 = null;
  c.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  c.addEventListener('touchend', (e) => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 48) { show(dx < 0 ? i + 1 : i - 1); restart(); } });
  if (reduce) { playBtn.innerHTML = icon('play'); playBtn.setAttribute('aria-label', 'Play'); }
  show(0);
  start();
}
