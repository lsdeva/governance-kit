// The artefact-to-toolchain walkthrough, shown inside the home hero. One
// mapping at a time: the entry made in GovKit types in on the left, a packet
// crosses the wire, and the record lands in a mock of the customer's tool.
// Every figure is the illustrative sanctions-triage example. The tool
// windows reproduce each product's page layout and chrome so the record is
// seen where a user of that tool would look for it; no vendor logos are used.

import { esc, icon } from '../ui.js';

export const STEP = 5500;

const MAPPINGS = [
  {
    art: '00', title: 'Register the agent', tool: 'CMDB', crumb: 'My work / Sanctions alert triage (L1) / 00 · Agent inventory entry', section: 'Identity and accountability', foot: '18 of 18 required fields',
    blurb: 'The inventory entry becomes the configuration item that the pipeline and the identity issuer read. No entry, no workload identity.',
    from: [['Agent ID', 'sanctions-triage-l1'], ['Autonomy tier', 'T2 · Agent and human collaborate'], ['Accountable executive', 'Head of Financial Crime (J. Okafor)'], ['Status', 'live']],
    ui: { kind: 'snow', record: 'Configuration Item · AI Agent', number: 'AGT-0001', flow: ['Proposed', 'Pilot', 'Live', 'Suspended', 'Retired'], cur: 'Live',
      fields: [['Name', 'sanctions-triage-l1', 0, 1], ['Class', 'AI agent', 0, 1], ['Autonomy tier', 'T2', 1], ['Owned by', 'M. Tan', 1], ['Accountable', 'J. Okafor', 1], ['Workload identity', 'spiffe://org/agent/sanctions-triage-l1', 1], ['Model', 'vendor-x 4.2', 1], ['Next review', '2026-12-15', 1]],
      tabs: ['Details', 'Relationships', 'Controls', 'Audit'], related: ['Related records', 'Controls (14)', 'Changes (3)', 'Attachments (1)'], done: 'CI updated · identity can be issued' },
  },
  {
    art: '02', title: 'Write the mandate', tool: 'GitHub', crumb: 'My work / Sanctions alert triage (L1) / 02 · Delegation policy', section: 'Auto-decide scope and assurance', foot: '19 of 19 required fields',
    blurb: 'The delegation policy is committed as YAML in the agent\'s repository. The policy gate compiles from it in CI, with no hand configuration.',
    from: [['Case types auto-decided', 'name_match'], ['Value and score limits', 'match score < 0.82'], ['Must escalate', 'confidence < 0.90 · list_version_changed'], ['Tolerance · sampling', '2.0% · 3% per month, floor 300']],
    ui: { kind: 'github', org: 'fincrime', repo: 'sanctions-triage-l1', branch: 'main', path: ['policy', 'delegation-policy.yaml'], commit: { author: 'M. Tan', msg: '02: mandate v3 · tolerance and sampling written in (#214)', sha: 'a41f2c', when: '2 minutes ago' }, meta: '11 lines (11 loc) · 412 Bytes',
      code: ['authority:', '  tier: T2', '  auto_close:', '    alert_types: [name_match]', '    max_match_score: 0.82', '  must_escalate:', '    - confidence < 0.90', '    - list_version_changed', 'assurance:', '  tolerance: {disagreement_max: 2.0%}', '  sampling: {rate: 3%, floor: 300}'],
      check: 'policy-gate / compile — Successful in 41s', done: 'Committed · policy gate compiled from this file' },
  },
  {
    art: '04', title: 'Controls into the backlog', tool: 'Jira', crumb: 'My work / Sanctions alert triage (L1) / 04 · Control requirements', section: 'Control stories', foot: '1 story · test automated',
    blurb: 'Each control becomes a story in the same backlog as the features, labelled with the control and the hazard it closes, with an acceptance test the pipeline runs.',
    from: [['Control', 'AGT-014 · decision record per closure'], ['Linked hazard', 'H-01 · sanctioned party paid'], ['Observable behaviour', 'Record exists before the core system is called'], ['Acceptance test', 'count(records) == count(closures), nightly']],
    ui: { kind: 'jira', project: 'Screening', key: 'SCR-212', title: 'Every autonomous closure carries a decision record', status: 'IN PROGRESS',
      body: ['Given the agent proposes alert.close', 'When the gate allows it', 'Then a decision record exists before the core system is called, with grounds.matched_fields, grounds.list_version and grounds.rule_id populated', 'Test: count(records) == count(closures), nightly; any gap fails the build'],
      fields: [['Assignee', 'D. Novak', 'av'], ['Labels', 'control:AGT-014 · hazard:H-01', 'chips'], ['Sprint', 'Sprint 14'], ['Story point estimate', '3'], ['Priority', 'High'], ['Reporter', 'M. Tan', 'av']], done: 'Issue SCR-212 created in the team backlog' },
  },
  {
    art: '05', title: 'Select the control profile', tool: 'GitLab CI', crumb: 'My work / Sanctions alert triage (L1) / 05 · Control specification', section: 'Profile by tier', foot: '14 of 14 controls tested',
    blurb: 'Controls are data. The pipeline reads the tier from the inventory, selects the profile and runs every test. A block_deploy failure fails the build. That is gate G2.',
    from: [['Profile selected', 'tier-2 · 14 controls'], ['AGT-014', 'on_fail: block_deploy'], ['AGT-022', 'on_fail: block_action'], ['Catalogue', 'CSA AICM v1.1 · ISO 42001 Annex A']],
    ui: { kind: 'gitlab', org: 'fincrime', repo: 'sanctions-triage-l1', id: '4412', when: '8 minutes ago', by: 'M. Tan', ref: 'main', sha: 'a41f2c', jobs: 7, tests: 14,
      stages: [['build', [['compile', 'ok'], ['unit-tests', 'ok']]], ['controls', [['profile:tier-2 · 14/14', 'ok'], ['block_deploy-checks', 'ok']]], ['gate', [['G2 · definition-of-done', 'ok']]], ['deploy', [['staging', 'wait'], ['production', 'wait']]]], done: 'Gate G2 passed · pipeline fails closed on any block_deploy' },
  },
  {
    art: '06', title: 'Sign the build', tool: 'Artifactory', crumb: 'My work / Sanctions alert triage (L1) / 06 · Build attestation', section: 'Version triple', foot: '13 of 13 required fields',
    blurb: 'Every release, including prompt-only releases, is signed with its version triple, so any decision record resolves to the exact model, prompt and tool set that made it.',
    from: [['Release', '1.4.0'], ['Model · vendor · version', 'vendor-x 4.2'], ['Prompt hash', '9b12…'], ['Tool manifest hash', 'e71a…']],
    ui: { kind: 'jfrog', repo: 'agents-release', pkg: 'sanctions-triage-l1', version: '1.4.0', type: 'Docker', tabs: ['Overview', 'Versions', 'Provenance', 'SBOM', 'Xray Data', 'Properties'], tab: 'Provenance',
      fields: [['Signed by', 'ci@org · Sigstore (keyless)', 1], ['SLSA level', '3 · in-toto attestation', 1], ['model', 'vendor-x 4.2', 1], ['prompt_hash', '9b12…', 1], ['tool_manifest_hash', 'e71a…', 1], ['eval_report', 'EVAL-2026-05-12', 1], ['Created', '2026-05-18 14:02 · pipeline #4412', 0]], done: 'Attestation attached to 1.4.0' },
  },
  {
    art: '03', title: 'Register the hazards', tool: 'ServiceNow IRM', crumb: 'My work / Sanctions alert triage (L1) / 03 · Hazard analysis', section: 'Hazard register', foot: '3 hazards · 2 interaction',
    blurb: 'Hazards produced by specialists land in the enterprise risk register with the controls that close them, so the GRC team sees agent risk beside every other risk.',
    from: [['Hazard', 'H-01 · Sanctioned party paid'], ['Unsafe control action', 'Agent closes a true match'], ['Interaction hazard', 'Yes · transliteration variant + stale list'], ['Controls assigned', 'AGT-022 · AGT-030']],
    ui: { kind: 'snow', record: 'Risk', number: 'RSK-2026-0187', flow: ['Draft', 'Assess', 'Respond', 'Monitor', 'Closed'], cur: 'Respond',
      fields: [['Name', 'Sanctioned party paid after false closure', 0, 1], ['Category', 'AI agent · Financial crime', 0, 1], ['Scenario', 'Transliteration variant + stale list version', 1], ['Interaction hazard', 'Yes', 1], ['Inherent impact', 'Severe', 1], ['Controls', 'AGT-022, AGT-030', 1], ['Risk owner', 'Agent owner (M. Tan)', 1], ['Source', 'GovKit 03 · H-01', 1]],
      tabs: ['Details', 'Assessment', 'Response', 'Issues'], related: ['Controls (2)', 'Control tests (2)', 'Issues (0)', 'Attachments (1)'], done: 'Risk record created and linked to controls' },
  },
  {
    art: 'G3', title: 'Pass the go-live gate', tool: 'ServiceNow Change', crumb: 'My work / Sanctions alert triage (L1) / G3 · Go-live', section: 'Gate decision', foot: '7 of 7 checks confirmed',
    blurb: 'The gate is a change request in your change tool. GovKit attaches the evidence pack and the signed checks; the CAB authorises it there.',
    from: [['Artefacts', '06 · 13 · 11 · 12 · 15 · 16 all met'], ['Checks', '7 of 7 confirmed by the named roles'], ['Signed by', 'J. Okafor · Accountable executive'], ['Rationale', 'Drill halted in 9 min vs 15 · IA agreed the tile register']],
    ui: { kind: 'snow', record: 'Change Request', number: 'CHG0031245', flow: ['New', 'Assess', 'Authorize', 'Scheduled', 'Implement', 'Review', 'Closed'], cur: 'Authorize',
      fields: [['Short description', 'Go-live: sanctions-triage-l1 (T2)', 0, 1], ['Type', 'Normal · CAB', 0, 1], ['Risk', 'Moderate', 1], ['Approval', 'Approved · J. Okafor (AE)', 1], ['Planned start', '2026-05-22 09:00', 1], ['Backout plan', '12 · kill switch, max 15 min', 1], ['Attachments', 'evidence-pack.pdf · G3-checks.json', 1], ['Correlation', 'GovKit G3 · sanctions-triage-l1', 1]],
      tabs: ['Planning', 'Schedule', 'Conflicts', 'Notes', 'Closure information'], related: ['Approvers (3)', 'Affected CIs (1)', 'Attachments (2)', 'Tasks (4)'], done: 'Change authorised by the CAB' },
  },
  {
    art: '11', title: 'Specify the oversight pack', tool: 'Grafana', crumb: 'My work / Sanctions alert triage (L1) / 11 · Oversight pack & tile register', section: 'Tile register', foot: '3 tiles · Unknown present',
    blurb: 'The tile register is the dashboard\'s specification. Every tile carries its kind, so nothing reads as a safety number without saying so, and the Unknown tile is always there.',
    from: [['T-01 · Process', 'Record completeness, worst day · from 07'], ['T-05 · Outcome', 'Disagreement, Wilson 95%, worst stratum · from 09'], ['T-09 · Unknown', 'Closures in strata with no sample · from 09 vs 07']],
    ui: { kind: 'grafana', title: 'Oversight · sanctions-triage-l1', range: 'Last 30 days',
      stats: [['Process', 'T-01 · Record completeness (worst day)', '99.97%', 'threshold ≥ 99.9% · from 07'], ['Outcome', 'T-05 · Disagreement · Wilson 95%', '0.3%', '0.1–1.7% · worst: Arabic script 1.6%'], ['Unknown', 'T-09 · Unsampled strata', 'CJK', '0.4% of closures · no sample this quarter']],
      series: [1.0, 0.3, 0.5, 0.0, 0.3], done: 'Dashboard generated from the signed register' },
  },
  {
    art: '09', title: 'Evidence flows back', tool: 'Telemetry & results', reverse: true, crumb: 'Control tower / Sanctions alert triage (L1)', section: 'Latest sampling round', foot: 'Ingested from the results store · alerts recomputed',
    blurb: 'Records come the other way too. Decision records, control results and sampling rounds are ingested, so the control tower\'s alerts run on real figures, not typed ones.',
    from: [['Round 2026-09', 'n=320 · agent wrong 1 · 0.3% (0.1–1.7%)'], ['Worst stratum', 'Arabic script · 1.6% (0.3–8.3%)'], ['Verdict', 'Within tolerance (2.0%)'], ['Promotion bar', '4 consecutive rounds · 1,370 cases · met']],
    ui: { kind: 'editor', file: '2026-09.json', crumb: 'results › sanctions-triage-l1 › 2026-09.json', status: 'OpenTelemetry collector · 320 sampling spans exported · OSCAL assessment-results v1.2.3',
      code: ['{', '  "assessment-results": {', '    "subject": "sanctions-triage-l1",', '    "period": "2026-09",', '    "method": "blind re-performance",', '    "observations": [', '      { "n": 320, "agent_wrong": 1,', '        "rate": 0.0031, "ci95": [0.0006, 0.0174],', '        "worst_stratum": "arabic_script",', '        "worst_rate": 0.0156 }', '    ],', '    "tolerance": 0.02, "verdict": "within"', '  }', '}'], done: 'Ingested · control tower alerts recomputed' },
  },
];

// ------------------------------------------------------------ tool windows
// Each window carries the chrome and page type of its product class, so the
// record lands where a user of that tool would expect to see it.

const land = (i, hi = true) => `class="a-land ${hi ? 'hi' : ''}" style="--i:${i}"`;
const done = (u, n) => `<div class="tw-done a-land" style="--i:${n}">${icon('checkCircle')} ${esc(u.done)}</div>`;
const yamlHl = (l) => esc(l).replace(/^(\s*)([\w_-]+)(:)/, '$1<span class="k">$2</span>$3').replace(/(\[.*?\]|\{.*?\}|\d+(\.\d+)?%?)/g, '<span class="v">$1</span>');
const jsonHl = (l) => esc(l).replace(/("[^"]+")(\s*:)/g, '<span class="k">$1</span>$2').replace(/:\s*("[^"]*"|[\d.]+)/g, (m, v) => m.replace(v, `<span class="v">${v}</span>`));
const win = (cls, inner) => `<div class="tw ${cls}">${inner}</div>`;

const github = (u) => win('gh', `
  <div class="gh-top"><i class="mark"></i><span class="crumb">${esc(u.org)} / <b>${esc(u.repo)}</b></span><span class="search">Type <kbd>/</kbd> to search</span><i class="ic"></i><i class="ic"></i><i class="av"></i></div>
  <div class="gh-tabs"><span class="on">Code</span><span>Issues <em>3</em></span><span>Pull requests <em>1</em></span><span>Actions</span><span>Security</span><span>Insights</span><span>Settings</span></div>
  <div class="gh-body">
    <div class="gh-fileh"><span class="branch">⑂ ${esc(u.branch)} ▾</span><span class="path">${u.path.slice(0, -1).map(esc).join(' / ')} / <b>${esc(u.path.at(-1))}</b></span><span class="btns"><b>Raw</b><b>Blame</b><b>⋯</b></span></div>
    <div class="gh-commit" ${land(0, false)}><i class="av"></i><b>${esc(u.commit.author)}</b><span class="msg">${esc(u.commit.msg)}</span><span class="ok">✓</span><span class="sha">${esc(u.commit.sha)}</span><span class="when">${esc(u.commit.when)}</span></div>
    <div class="gh-meta">${esc(u.meta)}</div>
    <pre class="gh-code" ${land(1, false)}>${u.code.map((l, i) => `<span class="ln">${i + 1}</span>${yamlHl(l)}`).join('\n')}</pre>
    <div class="gh-check" ${land(2)}><span class="ok">✓</span><b>${esc(u.check)}</b><span class="lnk">Details</span></div>
  </div>${done(u, 3)}`);

const jira = (u) => win('jira', `
  <div class="jira-top"><i class="mark"></i><span>Your work</span><span>Projects ▾</span><span>Filters ▾</span><span>Dashboards ▾</span><span>Teams ▾</span><b class="create">Create</b><span class="search">Search</span><i class="av"></i></div>
  <div class="jira-main">
    <aside class="jira-side"><div class="proj"><i></i><div><b>${esc(u.project)}</b><small>Software project</small></div></div><span>Roadmap</span><span class="on">Board</span><span>Backlog</span><span>Reports</span><span>Issues</span><span>Code</span></aside>
    <div class="jira-issue">
      <div class="crumb">${esc(u.project)} › <span>${esc(u.key)}</span></div>
      <h4>${esc(u.title)}</h4>
      <div class="acts"><span>Attach</span><span>Create subtask</span><span>Link issue</span><span>⋯</span></div>
      <div class="lbl">Description</div>
      <div class="desc" ${land(0, false)}>${u.body.map((l) => `<p>${esc(l)}</p>`).join('')}</div>
      <div class="lbl">Activity</div><div class="act-tabs"><span class="on">Comments</span><span>History</span><span>Work log</span></div>
    </div>
    <div class="jira-details">
      <div class="status" ${land(1)}><b>${esc(u.status)}</b> ▾</div>
      <div class="box"><b class="box-h">Details</b>${u.fields.map(([k, v, kind], i) => `<div class="row" ${land(i + 2)}><span>${esc(k)}</span>${kind === 'av' ? `<em><i class="av"></i>${esc(v)}</em>` : kind === 'chips' ? `<em>${v.split(' · ').map((c) => `<u>${esc(c)}</u>`).join('')}</em>` : `<em>${esc(v)}</em>`}</div>`).join('')}</div>
    </div>
  </div>${done(u, u.fields.length + 2)}`);

const snow = (u) => win('snow', `
  <div class="snow-top"><span class="all">☰ All</span><span>Favorites</span><span>History</span><span>Workspaces</span><span class="now">now</span><span class="search">⌕</span><i class="av"></i></div>
  <div class="snow-bar"><span class="back">‹</span><span class="ctx">≡</span><b>${esc(u.record)}</b><span class="num">${esc(u.number)}</span><span class="btns"><b>Update</b><b>Save</b></span></div>
  <div class="snow-flow" ${land(0, false)}>${u.flow.map((s) => `<span class="${s === u.cur ? 'on' : ''}">${esc(s)}</span>`).join('')}</div>
  <div class="snow-form">${u.fields.map(([k, v, hi, ro], i) => `<div class="row"><label>${hi ? '<i>●</i>' : ''}${esc(k)}</label><div class="in ${ro ? 'ro' : ''} ${hi ? 'a-land hi' : ''}" style="--i:${i}">${esc(v)}</div></div>`).join('')}</div>
  <div class="snow-tabs">${u.tabs.map((t, i) => `<span class="${i === 0 ? 'on' : ''}">${esc(t)}</span>`).join('')}</div>
  <div class="snow-rel">${u.related.map((r) => `<span>${esc(r)}</span>`).join('')}</div>
  ${done(u, u.fields.length)}`);

const gitlab = (u) => win('gl', `
  <div class="gl-top"><i class="mark"></i><span class="search">Search or go to…</span><i class="plus">+</i><i class="av"></i></div>
  <div class="gl-main">
    <aside class="gl-side"><b class="proj"><i>S</i>${esc(u.repo)}</b><span>Pinned</span><span>Manage</span><span>Plan</span><span>Code</span><span class="on">Build</span><span class="sub on">Pipelines</span><span class="sub">Jobs</span><span class="sub">Pipeline editor</span><span>Secure</span><span>Deploy</span><span>Operate</span><span>Monitor</span></aside>
    <div class="gl-body">
      <div class="crumb">${esc(u.org)} / ${esc(u.repo)} / Pipelines / <b>#${esc(u.id)}</b></div>
      <div class="h"><span class="badge-ok">${icon('check')} Passed</span> Pipeline <b>#${esc(u.id)}</b> triggered ${esc(u.when)} by <b>${esc(u.by)}</b><span class="ref">${esc(u.ref)}</span><span class="sha">${esc(u.sha)}</span></div>
      <div class="tabs"><span class="on">Pipeline</span><span>Jobs <em>${u.jobs}</em></span><span>Tests <em>${u.tests}</em></span><span>Security</span></div>
      <div class="stages">${u.stages.map(([s, jobs], i) => `<div class="stage a-land" style="--i:${i}"><b>${esc(s)}</b>${jobs.map(([j, st]) => `<span class="${st}"><i>${st === 'ok' ? icon('check') : icon('clock')}</i>${esc(j)}</span>`).join('')}</div>`).join('')}</div>
    </div>
  </div>${done(u, u.stages.length)}`);

const jfrog = (u) => win('jf', `
  <div class="jf-top"><i class="mark"></i><b>Artifactory</b><span class="nav"><span class="on">Packages</span><span>Artifacts</span><span>Builds</span><span>Releases</span></span><i class="av"></i></div>
  <div class="jf-main">
    <aside class="jf-side"><span>Artifacts</span><span class="on">Packages</span><span>Builds</span><span>Release Bundles</span><span>Xray</span><span>Pipelines</span></aside>
    <div class="jf-body">
      <div class="crumb">Packages › ${esc(u.repo)} › ${esc(u.pkg)}</div>
      <h4>${esc(u.pkg)} <span class="ver">${esc(u.version)}</span> <span class="type">${esc(u.type)}</span></h4>
      <div class="tabs">${u.tabs.map((t) => `<span class="${t === u.tab ? 'on' : ''}">${esc(t)}</span>`).join('')}</div>
      <div class="props">${u.fields.map(([k, v, hi], i) => `<div class="row ${hi ? 'a-land hi' : ''}" style="--i:${i}"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>
    </div>
  </div>${done(u, u.fields.length)}`);

const grafana = (u) => {
  const W = 300, H = 60, max = 2.5;
  const pts = u.series.map((v, i) => `${(i / (u.series.length - 1)) * W},${H - (v / max) * H}`).join(' ');
  return win('gf', `
  <div class="gf-top"><i class="mark"></i><span class="crumb">Home › Dashboards › <b>${esc(u.title)}</b></span><span class="right"><span>☆</span><span>Share</span><span class="time">⏱ ${esc(u.range)} ▾</span><span>↻</span></span></div>
  <div class="gf-body">
    <div class="gf-row">${u.stats.map(([k, l, v, s], i) => `<div class="gf-panel a-land hi" style="--i:${i}"><div class="ph"><span>${esc(l)}</span><i>⋮</i></div><span class="badge ${k.toLowerCase()}">${k}</span><b class="${k.toLowerCase()}">${esc(v)}</b><em>${esc(s)}</em></div>`).join('')}</div>
    <div class="gf-panel wide a-land" style="--i:3"><div class="ph"><span>Disagreement by month · Outcome · tolerance 2.0%</span><i>⋮</i></div>
      <svg viewBox="-24 -4 ${W + 30} ${H + 22}" preserveAspectRatio="none">${[0, 1, 2].map((g) => `<line x1="0" x2="${W}" y1="${H - (g / max) * H}" y2="${H - (g / max) * H}" stroke="#2C3235"/><text x="-6" y="${H - (g / max) * H + 3}" font-size="8" fill="#9FA7B3" text-anchor="end">${g}%</text>`).join('')}<line x1="0" x2="${W}" y1="${H - (2 / max) * H}" y2="${H - (2 / max) * H}" stroke="#F2A649" stroke-dasharray="4 4"/><polyline points="${pts}" fill="none" stroke="#73BF69" stroke-width="2"/>${u.series.map((v, i) => `<circle cx="${(i / (u.series.length - 1)) * W}" cy="${H - (v / max) * H}" r="2.5" fill="#73BF69"/><text x="${(i / (u.series.length - 1)) * W}" y="${H + 14}" font-size="8" fill="#9FA7B3" text-anchor="middle">${['May', 'Jun', 'Jul', 'Aug', 'Sep'][i]}</text>`).join('')}</svg></div>
  </div>${done(u, 4)}`);
};

const editor = (u) => win('ed', `
  <div class="ed-top"><span class="tab on">${esc(u.file)} <i>×</i></span><span class="tab">collector.yaml</span></div>
  <div class="ed-crumb">${esc(u.crumb)}</div>
  <pre class="ed-code a-land" style="--i:0">${u.code.map((l, i) => `<span class="ln">${i + 1}</span>${jsonHl(l)}`).join('\n')}</pre>
  <div class="ed-status"><span>${esc(u.status)}</span><span>JSON · UTF-8</span></div>
  ${done(u, 1)}`);

const RENDER = { github, jira, snow, gitlab, jfrog, grafana, editor };
const toolUI = (m) => RENDER[m.ui.kind](m.ui);

// The GovKit side looks like the form the user actually filled in.
function fromCard(m) {
  return `<div class="gk">
    <div class="gk-top"><span class="wm">Gov<b>Kit</b></span><span class="crumb">${esc(m.crumb)}</span></div>
    <div class="gk-body">
      <div class="gk-sec"><span class="n">${m.art}</span>${esc(m.section)}</div>
      ${m.from.map(([k, v], i) => `<div class="gk-f a-typed" style="--i:${i}"><label>${esc(k)}</label><div class="in">${esc(v)}</div></div>`).join('')}
    </div>
    <div class="gk-foot a-typed" style="--i:${m.from.length}">${m.reverse ? `<span class="prog">${icon('check')} ${esc(m.foot)}</span>` : `<span class="prog"><b>${esc(m.foot)}</b></span><span class="btn-sub">Submit for review</span>`}</div>
  </div>`;
}

export function walkthroughHtml() {
  return `<div class="int" aria-roledescription="carousel" aria-label="How each artefact updates your tools">
    <div class="int-side">
      <span class="eyebrow accent a-up">01 · Integration service</span>
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
