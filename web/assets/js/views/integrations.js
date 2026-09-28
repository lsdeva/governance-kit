// The artefact-to-toolchain walkthrough, shown inside the home hero. One
// mapping at a time: the entry made in GovKit types in on the left, a packet
// crosses the wire, and the record lands in a mock of the customer's tool.
// Every figure is the illustrative sanctions-triage example. The tool
// windows imitate the layout of each product class, not any vendor's brand.

import { esc, icon } from '../ui.js';

export const STEP = 5500;

const MAPPINGS = [
  {
    art: '00', title: 'Register the agent', tool: 'CMDB', blurb: 'The inventory entry becomes the configuration item that the pipeline and the identity issuer read. No entry, no workload identity.',
    from: [['Agent ID', 'sanctions-triage-l1'], ['Autonomy tier', 'T2 · human in the loop'], ['Accountable executive', 'Head of Financial Crime'], ['Status', 'live']],
    ui: { kind: 'form', app: 'ServiceNow · CMDB', crumb: 'Configuration › AI agents › AGT-0001', title: 'AI agent · sanctions-triage-l1', flow: ['Proposed', 'Pilot', 'Live', 'Suspended', 'Retired'], cur: 'Live',
      fields: [['Number', 'AGT-0001'], ['Class', 'AI agent'], ['Tier', 'T2', 1], ['Owner', 'M. Tan', 1], ['Accountable', 'J. Okafor', 1], ['Identity', 'spiffe://org/agent/…', 1], ['Model', 'vendor-x 4.2', 1], ['Next review', '2026-12-15', 1]], done: 'Record updated' },
  },
  {
    art: '02', title: 'Write the mandate', tool: 'Repository', blurb: 'The delegation policy is committed as YAML in the agent\'s repository. The policy gate compiles from it, with no hand configuration.',
    from: [['Auto-close scope', 'name_match · score < 0.82'], ['Must escalate', 'confidence < 0.90'], ['Tolerance', '2.0% · sampling 3%, floor 300'], ['Sunset', '2027-09-30']],
    ui: { kind: 'repo', app: 'GitLab · repository', crumb: 'fincrime / sanctions-triage-l1 / policy / delegation-policy.yaml', commit: 'a41f2c · 02: mandate v3 · M. Tan · 2 minutes ago',
      code: ['authority:', '  tier: T2', '  auto_close:', '    alert_types: [name_match]', '    max_match_score: 0.82', '  must_escalate:', '    - confidence < 0.90', '    - list_version_changed', 'assurance:', '  tolerance: {disagreement_max: 2.0%}', '  sampling: {rate: 3%, floor: 300}'],
      stages: [['build', 'ok'], ['policy-gate compile', 'ok'], ['deploy', 'wait']], done: 'Committed · gate compiled' },
  },
  {
    art: '04', title: 'Controls into the backlog', tool: 'Backlog', blurb: 'Each control becomes a story in the same backlog as the features, labelled with the control and the hazard it closes, with an acceptance test the pipeline runs.',
    from: [['Control', 'AGT-014 · decision record per closure'], ['Hazard', 'H-01 · sanctioned party paid'], ['Acceptance test', 'count(records) == count(closures), nightly']],
    ui: { kind: 'issue', app: 'Jira · Software', crumb: 'Projects › Screening › SCR-212', title: 'Every autonomous closure carries a decision record',
      body: ['Given the agent proposes alert.close', 'When the gate allows it', 'Then a decision record exists before the core system is called', 'Test: count(records) == count(closures), nightly'],
      side: [['Status', 'In Progress', 1, 'st-blue'], ['Assignee', 'D. Novak', 1], ['Labels', 'control:AGT-014 · hazard:H-01', 1], ['Sprint', 'Sprint 14', 1], ['Story points', '3', 1]], done: 'Issue SCR-212 created' },
  },
  {
    art: '05', title: 'Select the control profile', tool: 'CI pipeline', blurb: 'Controls are data. The pipeline reads the tier from the inventory, selects the profile and runs every test. A block_deploy failure fails the build. That is gate G2.',
    from: [['Profile', 'tier-2 · 14 controls'], ['AGT-014', 'on_fail: block_deploy'], ['AGT-022', 'on_fail: block_action']],
    ui: { kind: 'pipeline', app: 'GitLab · CI/CD', crumb: 'Pipeline #4412 · main · a41f2c', status: 'passed', took: '6 min 12 s',
      stages: [['build', [['compile', 'ok'], ['unit tests', 'ok']]], ['controls', [['tier-2 profile · 14/14', 'ok'], ['block_deploy checks', 'ok']]], ['gate', [['G2 · Definition of Done', 'ok']]], ['deploy', [['staging', 'wait']]]], done: 'Gate G2 passed' },
  },
  {
    art: '06', title: 'Sign the build', tool: 'Artifact registry', blurb: 'Every release, including prompt-only releases, is signed with its version triple, so any decision record resolves to the exact model, prompt and tool set that made it.',
    from: [['Release', '1.4.0'], ['Model', 'vendor-x 4.2'], ['Prompt hash', '9b12…'], ['Tool manifest hash', 'e71a…']],
    ui: { kind: 'registry', app: 'Artifactory · packages', crumb: 'agents-release › sanctions-triage-l1 › 1.4.0', tabs: ['General', 'Provenance', 'SBOM', 'Properties'], tab: 'Provenance',
      fields: [['Signed by', 'ci@org · Sigstore', 1], ['SLSA level', '3', 1], ['model', 'vendor-x 4.2', 1], ['prompt_hash', '9b12…', 1], ['tool_manifest_hash', 'e71a…', 1], ['Eval report', 'EVAL-2026-05-12', 1]], done: 'Attestation attached' },
  },
  {
    art: '03', title: 'Register the hazards', tool: 'Risk register', blurb: 'Hazards produced by specialists land in the enterprise risk register with the controls that close them, so the GRC team sees agent risk beside every other risk.',
    from: [['H-01', 'Sanctioned party paid'], ['Unsafe control action', 'Agent closes a true match'], ['Interaction hazard', 'Yes · transliteration + stale list'], ['Controls', 'AGT-022 · AGT-030']],
    ui: { kind: 'form', app: 'ServiceNow · IRM', crumb: 'Risk › Register › RSK-2026-0187', title: 'Sanctioned party paid after false closure', flow: ['Draft', 'Assess', 'Respond', 'Monitor', 'Closed'], cur: 'Respond',
      fields: [['Number', 'RSK-2026-0187'], ['Category', 'AI agent · financial crime'], ['Scenario', 'Transliteration + stale list', 1], ['Interaction', 'Yes', 1], ['Consequence', 'Severe', 1], ['Controls', 'AGT-022, AGT-030', 1], ['Residual owner', 'Agent owner', 1], ['Source', 'GovKit 03 · H-01', 1]], done: 'Risk record created' },
  },
  {
    art: 'G3', title: 'Pass the go-live gate', tool: 'Change management', blurb: 'The gate is a change request in your change tool. GovKit attaches the evidence pack and the signed checks; the CAB authorises it there.',
    from: [['Artefacts', '06 · 13 · 11 · 12 · 15 · 16 met'], ['Checks', '7 of 7 confirmed'], ['Approver', 'Accountable executive'], ['Rationale', 'Drill 9 min vs 15 · IA agreed tile register']],
    ui: { kind: 'form', app: 'ServiceNow · Change', crumb: 'Change › Normal › CHG0031245', title: 'Go-live: sanctions-triage-l1 (T2)', flow: ['New', 'Assess', 'Authorise', 'Scheduled', 'Implement', 'Review', 'Closed'], cur: 'Authorise',
      fields: [['Number', 'CHG0031245'], ['Type', 'Normal · CAB'], ['Risk', 'Moderate', 1], ['Approval', 'Approved · J. Okafor (AE)', 1], ['Planned start', '2026-05-22 09:00', 1], ['Attachments', 'evidence-pack.pdf · G3-checks.json', 1], ['Backout', '12 · kill switch, 15 min', 1], ['Source', 'GovKit G3', 1]], done: 'Change authorised' },
  },
  {
    art: '11', title: 'Specify the oversight pack', tool: 'Dashboard', blurb: 'The tile register is the dashboard\'s specification. Every tile carries its kind, so nothing reads as a safety number without saying so, and the Unknown tile is always there.',
    from: [['T-01 · Process', 'Record completeness, worst day'], ['T-05 · Outcome', 'Disagreement, Wilson 95%, worst stratum'], ['T-09 · Unknown', 'Closures in strata with no sample']],
    ui: { kind: 'dashboard', app: 'Grafana · Oversight · sanctions-triage-l1', range: 'Last 30 days',
      stats: [['Process', 'Record completeness', '99.97%', 'T-01'], ['Outcome', 'Disagreement · Wilson 95%', '0.3%', '0.1–1.7% · worst: Arabic 1.6%'], ['Unknown', 'Unsampled strata', 'CJK', '0.4% of closures']],
      series: [1.0, 0.3, 0.5, 0.0, 0.3], done: 'Dashboard generated from the register' },
  },
  {
    art: '09', title: 'Evidence flows back', tool: 'Telemetry & results', reverse: true, blurb: 'Records come the other way too. Decision records, control results and sampling rounds are ingested, so the control tower\'s alerts run on real figures, not typed ones.',
    from: [['Round 2026-09', 'n=320 · agent wrong 1'], ['Worst stratum', 'Arabic script · 1.6%'], ['Verdict', 'Within tolerance'], ['Promotion bar', '4 rounds · 1,370 cases · met']],
    ui: { kind: 'results', app: 'OSCAL assessment-results · via OpenTelemetry', crumb: 'results / sanctions-triage-l1 / 2026-09.json',
      code: ['{', '  "assessment-results": {', '    "subject": "sanctions-triage-l1",', '    "period": "2026-09",', '    "observations": [', '      { "method": "blind re-performance",', '        "n": 320, "agent_wrong": 1,', '        "rate": 0.0031, "ci95": [0.0006, 0.0174],', '        "worst_stratum": "arabic_script" }', '    ],', '    "tolerance": 0.02, "verdict": "within"', '  }', '}'], done: 'Ingested · control tower updated' },
  },
];

// ------------------------------------------------------------ tool windows

const f = (k, v, hi, i, cls = '') => `<div class="tw-f ${hi ? 'a-land hi' : ''} ${cls}" style="--i:${i}"><span>${esc(k)}</span><b>${esc(v)}</b></div>`;
const bar = (u, extra = '') => `<div class="tw-bar"><i></i><i></i><i></i><span class="tw-app">${esc(u.app)}</span>${extra}</div>`;
const flow = (u) => u.flow ? `<div class="tw-flow">${u.flow.map((s) => { const on = s === u.cur; return `<span class="${on ? 'on a-land' : ''}" style="--i:0">${esc(s)}</span>`; }).join('')}</div>` : '';
const done = (u, n) => `<div class="tw-done a-land" style="--i:${n}">${icon('checkCircle')} ${esc(u.done)}</div>`;

function toolUI(m) {
  const u = m.ui;
  let body = '';
  if (u.kind === 'form') {
    body = `<div class="tw-crumb">${esc(u.crumb)}</div><div class="tw-title">${esc(u.title)}</div>${flow(u)}<div class="tw-grid">${u.fields.map(([k, v, hi], i) => f(k, v, hi, i)).join('')}</div>${done(u, u.fields.length)}`;
  } else if (u.kind === 'repo') {
    body = `<div class="tw-crumb">${esc(u.crumb)}</div><div class="tw-commit a-land" style="--i:0">${icon('check')} ${esc(u.commit)}</div>
      <pre class="tw-code a-land" style="--i:1">${u.code.map((l, i) => `<span class="ln">${i + 1}</span>${esc(l)}`).join('\n')}</pre>
      <div class="tw-stages a-land" style="--i:2">${u.stages.map(([s, st]) => `<span class="${st}">${st === 'ok' ? icon('check') : icon('clock')} ${esc(s)}</span>`).join('<i></i>')}</div>${done(u, 3)}`;
  } else if (u.kind === 'issue') {
    body = `<div class="tw-crumb">${esc(u.crumb)}</div><div class="tw-issue"><div><div class="tw-title">${esc(u.title)}</div><div class="tw-lbl">Description</div><div class="tw-desc a-land" style="--i:0">${u.body.map((l) => `<p>${esc(l)}</p>`).join('')}</div></div>
      <div class="tw-side">${u.side.map(([k, v, hi, cls], i) => f(k, v, hi, i + 1, cls)).join('')}</div></div>${done(u, u.side.length + 1)}`;
  } else if (u.kind === 'pipeline') {
    body = `<div class="tw-crumb">${esc(u.crumb)}</div><div class="tw-pipe-h"><span class="tw-pill ok">${icon('check')} ${esc(u.status)}</span><span class="faint">${esc(u.took)}</span></div>
      <div class="tw-pipe">${u.stages.map(([s, jobs], i) => `<div class="tw-stage a-land" style="--i:${i}"><b>${esc(s)}</b>${jobs.map(([j, st]) => `<span class="${st}">${st === 'ok' ? icon('check') : icon('clock')} ${esc(j)}</span>`).join('')}</div>`).join('')}</div>${done(u, u.stages.length)}`;
  } else if (u.kind === 'registry') {
    body = `<div class="tw-crumb">${esc(u.crumb)}</div><div class="tw-tabs">${u.tabs.map((t) => `<span class="${t === u.tab ? 'on' : ''}">${esc(t)}</span>`).join('')}</div><div class="tw-grid">${u.fields.map(([k, v, hi], i) => f(k, v, hi, i)).join('')}</div>${done(u, u.fields.length)}`;
  } else if (u.kind === 'dashboard') {
    const W = 220, H = 56, max = 2.5;
    const pts = u.series.map((v, i) => `${(i / (u.series.length - 1)) * W},${H - (v / max) * H}`).join(' ');
    body = `<div class="tw-dash"><div class="tw-dash-h"><b>${esc(u.app)}</b><span>${esc(u.range)}</span></div>
      <div class="tw-panels">${u.stats.map(([k, l, v, s], i) => `<div class="tw-panel a-land hi" style="--i:${i}"><span class="badge ${k.toLowerCase()}">${k}</span><small>${esc(l)}</small><b>${esc(v)}</b><em>${esc(s)}</em></div>`).join('')}
        <div class="tw-panel wide a-land" style="--i:3"><small>Disagreement by month · tolerance 2.0%</small><svg viewBox="0 0 ${W} ${H + 6}" preserveAspectRatio="none"><line x1="0" x2="${W}" y1="${H - (2 / max) * H}" y2="${H - (2 / max) * H}" stroke="#F2A649" stroke-dasharray="4 4"/><polyline points="${pts}" fill="none" stroke="#8CC63F" stroke-width="2"/>${u.series.map((v, i) => `<circle cx="${(i / (u.series.length - 1)) * W}" cy="${H - (v / max) * H}" r="3" fill="#8CC63F"/>`).join('')}</svg></div>
      </div>${done(u, 4)}</div>`;
  } else if (u.kind === 'results') {
    body = `<div class="tw-crumb">${esc(u.crumb)}</div><pre class="tw-code json a-land" style="--i:0">${u.code.map((l) => esc(l)).join('\n')}</pre>${done(u, 1)}`;
  }
  return `<div class="tw ${u.kind === 'dashboard' ? 'dark' : ''}">${bar(u, u.kind === 'issue' ? '<span class="tw-nav">Your work · Projects · Filters · Dashboards</span>' : '')}<div class="tw-body">${body}</div></div>`;
}

function fromCard(m) {
  return `<div class="int-from">
    <div class="int-from-bar"><span class="aid-box brand">${m.art}</span><b>In GovKit</b><span>${esc(m.title)}</span></div>
    ${m.from.map(([k, v], i) => `<div class="int-f a-typed" style="--i:${i}"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}
    <div class="int-from-foot a-typed" style="--i:${m.from.length}">${icon('check')} ${m.reverse ? 'Read from the record' : 'Saved · submitted for review'}</div>
  </div>`;
}

export function walkthroughHtml() {
  return `<div class="int" aria-roledescription="carousel" aria-label="How each artefact updates your tools">
    <div class="int-side">
      <span class="eyebrow accent a-up">06 · Integration service</span>
      <h2 class="hs-h a-up" style="--i:1;font-size:clamp(24px,2.6vw,34px)">Your tools stay the system of record. <em>GovKit fills them in.</em></h2>
      <div class="int-list a-up" style="--i:2" role="tablist" aria-label="Artefacts">${MAPPINGS.map((m, i) => `<button role="tab" data-int="${i}" aria-selected="${i === 0}"><span class="aid">${m.art}</span><span class="int-li"><b>${esc(m.title)}</b><small>${m.reverse ? '←' : '→'} ${esc(m.tool)}</small></span><i></i></button>`).join('')}</div>
      <p class="int-cta a-up" style="--i:3">Bring your SDLC process and templates. We map them to the seventeen artefacts, report the gaps and wire the connectors in your tenancy. <a href="mailto:deva@soa.team?subject=GovKit%20integration">Talk to us ${icon('arrowRight', 'sm-ic')}</a></p>
    </div>
    <div class="int-stage">${MAPPINGS.map((m, i) => `<div class="int-slide ${i === 0 ? 'active' : ''} ${m.reverse ? 'reverse' : ''}" role="group" aria-label="${esc(m.title)} to ${esc(m.tool)}" ${i === 0 ? '' : 'hidden'}>
        <p class="int-blurb">${esc(m.blurb)}</p>
        <div class="int-flow">${fromCard(m)}<div class="int-wire" aria-hidden="true"><svg viewBox="0 0 80 40" preserveAspectRatio="none"><path d="M0 20 H80" stroke="#444" stroke-width="2" stroke-dasharray="4 6"/></svg><span class="int-packet">${icon(m.reverse ? 'arrowLeft' : 'arrowRight')}</span><small>${m.reverse ? 'ingested' : 'API · file · export'}</small></div>${toolUI(m)}</div>
      </div>`).join('')}
    </div>
  </div>`;
}

// Returns a controller the hero drives: start() from the first mapping,
// stop(); `onDone` fires once the last mapping has had its time.
export function mountWalkthrough(root, { onDone } = {}) {
  const c = root.querySelector('.int');
  if (!c) return null;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tabs = [...c.querySelectorAll('[data-int]')];
  const slides = [...c.querySelectorAll('.int-slide')];
  let i = 0, timer = null, running = false;
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, j) => { s.classList.toggle('active', j === i); s.hidden = j !== i; });
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === i)); t.classList.toggle('running', j === i && running && !reduce); });
  };
  const tick = () => { if (i === slides.length - 1) { stop(); onDone?.(); return; } show(i + 1); };
  const start = () => { stop(); running = true; show(0); timer = setInterval(tick, STEP); };
  const stop = () => { clearInterval(timer); timer = null; running = false; tabs.forEach((t) => t.classList.remove('running')); };
  c.addEventListener('click', (e) => { const t = e.target.closest('[data-int]'); if (!t) return; show(+t.dataset.int); if (running) { clearInterval(timer); timer = setInterval(tick, STEP); tabs[i].classList.add('running'); } });
  show(0);
  return { start, stop, count: slides.length };
}

export { MAPPINGS };
