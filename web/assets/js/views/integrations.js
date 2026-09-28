// "From GovKit into your tools": an animated walk through how each artefact
// entry made in GovKit lands in the customer's existing SDLC tools. One
// mapping is shown at a time; the list on the left auto-advances. Every
// figure is the illustrative sanctions-triage example.

import { esc, icon } from '../ui.js';

const STEP = 6500;

// GovKit-side field, then the tool-side record. `hi` marks the fields the
// packet "delivers", so they light up after it arrives.
const MAPPINGS = [
  {
    id: 'inventory', art: '00', title: 'Register the agent', tool: 'CMDB / agent inventory', toolKind: 'ServiceNow CMDB · or your registry',
    blurb: 'The inventory entry becomes the configuration item the pipeline and the identity issuer read. No entry, no workload identity.',
    from: [['Agent ID', 'sanctions-triage-l1'], ['Autonomy tier', 'T2 · human in the loop'], ['Accountable executive', 'Head of Financial Crime'], ['Status', 'live']],
    to: { head: 'CI · AGT-0001', rows: [['Class', 'AI agent'], ['Tier', 'T2', 1], ['Owner', 'M. Tan', 1], ['Identity', 'spiffe://org/agent/sanctions-triage-l1', 1], ['Operational status', 'Live', 1]], badge: 'Record updated' },
  },
  {
    id: 'mandate', art: '02', title: 'Write the mandate', tool: 'Git repository + pipeline', toolKind: 'GitLab · GitHub · Azure DevOps',
    blurb: 'The delegation policy is committed as YAML in the agent\'s repo. The policy gate compiles from it, with no hand configuration.',
    from: [['Auto-close scope', 'name_match · score < 0.82'], ['Must escalate', 'confidence < 0.90'], ['Tolerance', '2.0% · sampling 3%, floor 300'], ['Sunset', '2027-09-30']],
    to: { head: 'policy/delegation-policy.yaml', code: 'authority:\n  tier: T2\n  auto_close: {alert_types: [name_match], max_match_score: 0.82}\n  must_escalate: [confidence < 0.90, list_version_changed]\nassurance:\n  tolerance: {disagreement_max: 2.0%}', rows: [['Commit', 'a41f2c · "02: mandate v3"', 1], ['Pipeline · policy-gate compile', 'passed', 1]], badge: 'Committed · gate compiled' },
  },
  {
    id: 'stories', art: '04', title: 'Turn controls into backlog items', tool: 'Backlog', toolKind: 'Jira · Azure DevOps Boards · GitHub Issues',
    blurb: 'Each control becomes a story in the same backlog as the features, labelled with the control and the hazard it closes, with an acceptance test the pipeline runs.',
    from: [['Control', 'AGT-014 · decision record per closure'], ['Hazard', 'H-01 · sanctioned party paid'], ['Acceptance test', 'count(records) == count(closures), nightly']],
    to: { head: 'SCR-212 · Every closure carries a decision record', rows: [['Type', 'Story'], ['Labels', 'control:AGT-014 · hazard:H-01', 1], ['Sprint', 'Sprint 14', 1], ['Acceptance', 'records == closures, nightly', 1], ['Status', 'In progress', 1]], badge: 'Issue created' },
  },
  {
    id: 'profile', art: '05', title: 'Select the control profile', tool: 'CI pipeline', toolKind: 'GitLab CI · GitHub Actions · Jenkins',
    blurb: 'Controls are data. The pipeline reads the tier from the inventory, selects the profile and runs every test. A block_deploy failure fails the build. That is gate G2.',
    from: [['Profile', 'tier-2 · 14 controls'], ['AGT-014', 'on_fail: block_deploy'], ['AGT-022', 'on_fail: block_action']],
    to: { head: 'Pipeline #4412 · main', rows: [['build', 'passed'], ['controls · tier-2 profile', '14 / 14 passed', 1], ['block_deploy checks', '0 failures', 1], ['G2 · Definition of Done', 'met', 1]], badge: 'Gate G2 passed' },
  },
  {
    id: 'attest', art: '06', title: 'Sign the build', tool: 'Artifact registry', toolKind: 'Artifactory · Nexus · GHCR · Sigstore',
    blurb: 'Every release, including prompt-only releases, is signed with its version triple, so any decision record resolves to the exact model, prompt and tool set that made it.',
    from: [['Release', '1.4.0'], ['Model', 'vendor-x 4.2'], ['Prompt hash', '9b12…'], ['Tool manifest hash', 'e71a…']],
    to: { head: 'sanctions-triage-l1 : 1.4.0', rows: [['Provenance', 'signed · SLSA L3', 1], ['Model', 'vendor-x 4.2', 1], ['prompt_hash', '9b12…', 1], ['tool_manifest_hash', 'e71a…', 1], ['SBOM', 'attached', 1]], badge: 'Attestation attached' },
  },
  {
    id: 'hazards', art: '03', title: 'Register the hazards', tool: 'Risk register', toolKind: 'ServiceNow IRM · Archer · Confluence',
    blurb: 'Hazards produced by specialists land in the enterprise risk register with the controls that close them, so the GRC team sees agent risk beside every other risk.',
    from: [['H-01', 'Sanctioned party paid'], ['Unsafe control action', 'Agent closes a true match'], ['Interaction hazard', 'Yes · transliteration + stale list'], ['Controls', 'AGT-022 · AGT-030']],
    to: { head: 'Risk RSK-2026-0187', rows: [['Category', 'AI agent · financial crime'], ['Scenario', 'Transliteration variant + stale list', 1], ['Consequence', 'Severe', 1], ['Linked controls', 'AGT-022, AGT-030', 1], ['Residual owner', 'Agent owner', 1]], badge: 'Register row created' },
  },
  {
    id: 'change', art: 'G3', title: 'Pass the go-live gate', tool: 'Change management', toolKind: 'ServiceNow Change · Jira Service Management',
    blurb: 'The gate is a change request in your change tool. GovKit attaches the evidence pack and the signed checks; the CAB authorises it there.',
    from: [['Artefacts', '06 · 13 · 11 · 12 · 15 · 16 met'], ['Checks', '7 of 7 confirmed'], ['Approver', 'Accountable executive'], ['Rationale', 'Drill 9 min vs 15 · IA agreed tile register']],
    to: { head: 'CHG0031245 · Go-live: sanctions-triage-l1', rows: [['Type', 'Normal · CAB'], ['State', 'Assess → Authorised', 1], ['Attachments', 'evidence-pack.pdf · G3-checks.json', 1], ['Approved by', 'J. Okafor (AE)', 1], ['Planned start', '2026-05-22 09:00', 1]], badge: 'Change authorised' },
  },
  {
    id: 'dashboard', art: '11', title: 'Specify the oversight pack', tool: 'Dashboard', toolKind: 'Grafana · Power BI · Tableau',
    blurb: 'The tile register is the dashboard\'s specification. Every tile carries its kind, so nothing reads as a safety number without saying so, and the Unknown tile is always there.',
    from: [['T-01 · Process', 'Record completeness, worst day'], ['T-05 · Outcome', 'Disagreement, Wilson 95%, worst stratum'], ['T-09 · Unknown', 'Closures in strata with no sample']],
    to: { head: 'Oversight · sanctions-triage-l1', tiles: [['Process', 'Record completeness', '99.97%'], ['Outcome', 'Disagreement', '0.3% · 0.1–1.7%'], ['Unknown', 'Unsampled strata', 'CJK · 0.4%']], badge: 'Dashboard generated from register' },
  },
  {
    id: 'evidence', art: '09', title: 'Evidence flows back', tool: 'Telemetry & results store', toolKind: 'OpenTelemetry · OSCAL results · your sampling tool',
    blurb: 'Records come the other way too. Decision records, control results and sampling rounds are ingested, so the control tower\'s alerts run on real figures, not typed ones.',
    reverse: true,
    from: [['Round 2026-09', 'n=320 · agent wrong 1'], ['Worst stratum', 'Arabic script · 1.6%'], ['Verdict', 'Within tolerance']],
    to: { head: 'assessment-results · 2026-09', rows: [['Source', 'sampling tool export'], ['Observations', '320 re-performed, blind', 1], ['Disagreement', '0.31% (0.06–1.74)', 1], ['Tolerance', '2.0% · within', 1], ['Promotion bar', '4 rounds · 1,370 cases · met', 1]], badge: 'Ingested · alerts updated' },
  },
];

const TOOLS = ['GitLab', 'GitHub', 'Azure DevOps', 'Jira', 'ServiceNow', 'Confluence', 'Artifactory', 'Grafana', 'Power BI', 'OpenTelemetry', 'OSCAL', 'Sigstore'];

function fromCard(m) {
  return `<div class="int-card int-from">
    <div class="int-bar"><span class="aid-box brand">${m.art}</span><b>In GovKit</b><span class="int-sub">${esc(m.title)}</span></div>
    <div class="int-fields">${m.from.map(([k, v], i) => `<div class="int-f a-typed" style="--i:${i}"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('')}</div>
    <div class="int-foot a-typed" style="--i:${m.from.length}">${icon('check')} ${m.reverse ? 'Read from the record' : 'Saved · submitted for review'}</div>
  </div>`;
}

function toCard(m) {
  const t = m.to;
  const rows = (t.rows || []).map(([k, v, hi], i) => `<div class="int-f ${hi ? 'a-land hi' : ''}" style="--i:${i}"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join('');
  const code = t.code ? `<pre class="int-code a-land" style="--i:0">${esc(t.code)}</pre>` : '';
  const tiles = t.tiles ? `<div class="int-tiles">${t.tiles.map(([k, l, v], i) => `<div class="int-tile a-land hi" style="--i:${i}"><span class="badge ${k.toLowerCase()}">${k}</span><small>${esc(l)}</small><b>${esc(v)}</b></div>`).join('')}</div>` : '';
  return `<div class="int-card int-to">
    <div class="int-bar tool"><i></i><i></i><i></i><b>${esc(m.tool)}</b><span class="int-sub">${esc(m.toolKind)}</span></div>
    <div class="int-head">${esc(t.head)}</div>
    ${code}${tiles}<div class="int-fields">${rows}</div>
    <div class="int-foot ok a-land" style="--i:${(t.rows || []).length + 1}">${icon('checkCircle')} ${esc(t.badge)}</div>
  </div>`;
}

export function integrationsHtml() {
  return `<section class="band-paper" id="integrations">
    <div class="wrap sec">
      <div class="sec-head"><div><span class="eyebrow accent">Integration service</span><h2>Your tools stay the system of record. GovKit fills them in.</h2></div>
        <p>We integrate the operating model with the SDLC toolchain you already run. Each entry made in GovKit updates the tool where that work lives, and evidence flows back. Nine of the seventeen artefacts, shown one at a time.</p></div>
      <div class="int" aria-roledescription="carousel" aria-label="How each artefact updates your tools">
        <div class="int-list" role="tablist" aria-label="Artefacts">${MAPPINGS.map((m, i) => `<button role="tab" data-int="${i}" aria-selected="${i === 0}"><span class="aid ${m.art.startsWith('G') ? '' : ''}">${m.art}</span><span class="int-li"><b>${esc(m.title)}</b><small>→ ${esc(m.tool)}</small></span><i></i></button>`).join('')}</div>
        <div class="int-stage">${MAPPINGS.map((m, i) => `<div class="int-slide ${i === 0 ? 'active' : ''} ${m.reverse ? 'reverse' : ''}" role="group" aria-label="${esc(m.title)} to ${esc(m.tool)}" ${i === 0 ? '' : 'hidden'}>
            <p class="int-blurb">${esc(m.blurb)}</p>
            <div class="int-flow">${fromCard(m)}<div class="int-wire" aria-hidden="true"><svg viewBox="0 0 120 40" preserveAspectRatio="none"><path d="M0 20 H120" stroke="var(--rule-2)" stroke-width="2" stroke-dasharray="4 6"/></svg><span class="int-packet">${icon(m.reverse ? 'arrowLeft' : 'arrowRight')}</span><small>${m.reverse ? 'ingested by GovKit' : 'via API, file or export'}</small></div>${toCard(m)}</div>
          </div>`).join('')}
        </div>
      </div>
      <div class="int-tools"><span class="eyebrow">Works with</span>${TOOLS.map((t) => `<span>${t}</span>`).join('')}<span class="faint">and any tool with an API or a file import</span></div>
      <div class="cta-band mt48" style="padding-top:28px"><div><h2 style="font-size:clamp(22px,2.6vw,32px)">Bring your SDLC process and templates. We map them, fill the gaps and wire the tools.</h2><p class="muted mt8">An integration engagement starts with your process document and existing templates, returns a gap report against the seventeen artefacts, and ends with the connectors running in your tenancy.</p></div><div class="row g16"><a class="link-arrow" href="#/services">See the engagements ${icon('arrowRight')}</a><a class="btn primary lg" href="mailto:deva@soa.team?subject=GovKit%20integration">Talk to us</a></div></div>
    </div>
  </section>`;
}

export function mountIntegrations(root) {
  const c = root.querySelector('.int');
  if (!c) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tabs = [...c.querySelectorAll('[data-int]')];
  const slides = [...c.querySelectorAll('.int-slide')];
  let i = 0, timer = null, hold = false;
  const show = (n) => {
    i = (n + slides.length) % slides.length;
    slides.forEach((s, j) => { s.classList.toggle('active', j === i); s.hidden = j !== i; });
    tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(j === i)); t.classList.toggle('running', j === i && !hold && !reduce); });
    tabs[i].scrollIntoView({ block: 'nearest', inline: 'nearest' });
  };
  const start = () => { clearInterval(timer); timer = null; if (hold || reduce) return; timer = setInterval(() => show(i + 1), STEP); };
  c.addEventListener('click', (e) => { const t = e.target.closest('[data-int]'); if (t) { show(+t.dataset.int); start(); } });
  c.addEventListener('mouseenter', () => { hold = true; show(i); start(); });
  c.addEventListener('mouseleave', () => { hold = false; show(i); start(); });
  c.addEventListener('focusin', () => { hold = true; show(i); start(); });
  c.addEventListener('focusout', (e) => { if (!c.contains(e.relatedTarget)) { hold = false; show(i); start(); } });
  // Only animate while on screen.
  const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { show(i); start(); } else { clearInterval(timer); timer = null; } }, { threshold: 0.3 });
  io.observe(c);
  show(0);
}

export { MAPPINGS };
