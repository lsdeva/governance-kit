// Decision tools. Each one walks a judgement the operating model asks for,
// shows its reasoning, and can write the result into an agent's workspace
// as a logged decision.

import { D, TIERS, TIER_INFO, MATURITY, REQ_LABEL } from '../data.js';
import { S, agent as getAgent, update, newAgent, form as ensureForm, uid } from '../store.js';
import { esc, icon, toast, pct } from '../ui.js';
import { wilson, verdict, analyseRounds, analyseBands, tierOf, agentName, toleranceOf, gateStatus, routingOf, statusOf, evalGate } from '../logic.js';
import { pageHead, reqBadge } from '../components.js';
import { focus } from './agent.js';
import { go } from '../app.js';

const TOOLS = [
  { id: 'tier', icon: 'layers', name: 'Choose the autonomy tier', when: 'At intake, and before any promotion.', body: 'Five questions on who acts and what is at stake. You get the target tier, the tier to start at, a consequence class, and exactly which artefacts become mandatory.' },
  { id: 'change', icon: 'refresh', name: 'Is this a material change?', when: 'Before any model, prompt, tool, rules or data change ships.', body: 'Tick what changed. If it is material, GovKit flags the artefacts to redo, voids calibration, schedules a full sampling round and sets the 30-day revalidation deadline.' },
  { id: 'sampling', icon: 'target', name: 'Sampling round calculator', when: 'Monthly, when a 09 round closes, and when sizing one.', body: 'Disagreement rate with a Wilson 95% interval, the verdict against tolerance, reviewer hours, and the sample size you need for a given precision.' },
  { id: 'promotion', icon: 'arrowRight', name: 'Tier promotion readiness', when: 'Before asking for G4.', body: 'Reads the agent\'s 09 rounds: four consecutive in-tolerance rounds at the full rate, at least 1,000 cases, the worst stratum, and the artefacts G4 needs.' },
  { id: 'calibration', icon: 'gauge', name: 'Calibration check', when: 'After four sampling rounds, where confidence routes closures.', body: 'Per confidence band: observed disagreement, interval and verdict. It tells you which band the auto-close threshold can defensibly point at.' },
  { id: 'maturity', icon: 'ladder', name: 'Maturity self-assessment', when: 'At the start, and each quarter.', body: 'Places an agent on L1–L5 and lists the next concrete steps. The step from L3 to L4 is where programmes stall.' },
];

export function renderIndex() {
  return {
    title: 'Decision tools',
    crumbs: [['Home', '#/'], ['Decision tools']],
    html: `${pageHead({ eyebrow: 'Decide', title: 'Decision tools', lede: 'The operating model asks for judgements that need a method: which tier, whether a change is material, whether the sampling evidence holds. Each tool shows its reasoning, and you can save the result to an agent\'s decision log so the rationale becomes evidence.' })}
    <div class="grid cols-3">${TOOLS.map((t) => `<a class="card" href="#/tools/${t.id}"><div class="row g12"><span class="aid-box">${icon(t.icon)}</span><h3>${esc(t.name)}</h3></div><p class="muted small mt12">${esc(t.body)}</p><p class="xs faint mt12"><b>Use it:</b> ${esc(t.when)}</p></a>`).join('')}</div>`,
  };
}

function agentPicker(label = 'Agent') {
  const s = S();
  const cur = focus.agent && getAgent(focus.agent) ? focus.agent : s.agents[0]?.id || '';
  return `<label class="field" style="max-width:420px"><span class="lbl">${label}</span>
    <select class="input" id="tool-agent"><option value="" ${cur ? '' : 'selected'}>${s.agents.length ? 'None, just exploring' : 'No agents yet'}</option>${s.agents.map((a) => `<option value="${a.id}" ${a.id === cur ? 'selected' : ''}>${esc(agentName(a))} · ${tierOf(a)}</option>`).join('')}</select></label>`;
}
const pickedAgent = (root) => getAgent(root.querySelector('#tool-agent')?.value || '');
const logDecision = (a, title, summary) => { a.decisions = a.decisions || []; a.decisions.push({ at: Date.now(), role: S().role, by: S().person, title, summary }); a.updated = Date.now(); };

export function renderTool(id) {
  const t = TOOLS.find((x) => x.id === id);
  if (!t) return null;
  const view = { tier, change, sampling, promotion, calibration, maturity }[id]();
  return {
    title: t.name,
    crumbs: [['Home', '#/'], ['Decision tools', '#/tools'], [t.name]],
    html: `${pageHead({ eyebrow: 'Decision tool', title: esc(t.name), lede: esc(t.body) })}${view.html}`,
    mount: view.mount,
  };
}

// ---------------------------------------------------------------- tier

const TIER_Q = [
  { id: 'act', q: 'Who takes the action on a real case?', help: 'Think about the step that changes something in a core system: closing an alert, releasing a payment, approving an exception.', opts: [
    ['T1', 'A person takes every action. The agent drafts or recommends.'],
    ['T2', 'The agent acts, but a person approves every significant step before it executes.'],
    ['T3', 'The agent closes cases alone within its mandate and escalates the rest. A person can intervene.'],
    ['T4', 'No human in the path. Oversight is after the fact, through records and sampling.'],
  ] },
];
const IMPACT = [
  { id: 'domain', q: 'Domain sensitivity', help: 'Would a wrong decision affect someone\'s money, liberty, access to services, or legal position?', opts: [[0, 'Internal, low stakes'], [1, 'Customer-facing'], [2, 'Regulated or rights-affecting']] },
  { id: 'data', q: 'Highest data classification read', help: 'The most sensitive data in scope, which 14 will record.', opts: [[0, 'Public / internal'], [1, 'Confidential / personal'], [2, 'Restricted / special category']] },
  { id: 'access', q: 'External access and scope of action', help: 'What can the agent touch through its tools?', opts: [[0, 'Read-only'], [1, 'Writes to internal systems'], [2, 'Moves money, closes cases, or acts outside the organisation']] },
  { id: 'rev', q: 'Reversibility', help: 'If it is wrong, can the effect be undone, and would anyone notice?', opts: [[0, 'Fully reversible'], [1, 'Reversible with effort'], [2, 'Irreversible, or nobody revisits it']] },
];
const LIKELY = [
  { id: 'complex', q: 'Task complexity', help: 'Multi-step reasoning, many tools, or other agents in the loop raise the likelihood of error.', opts: [[0, 'Single step, narrow'], [1, 'Multi-step'], [2, 'Open-ended or multi-agent']] },
  { id: 'exposure', q: 'Exposure to untrusted input', help: 'Adversarial content, free text from the public, or poisoned retrieval.', opts: [[0, 'Trusted inputs only'], [1, 'Some external input'], [2, 'Open to the public or adversaries']] },
];

function tier() {
  const radio = (grp, [val, label]) => `<label class="opt"><input type="radio" name="${grp}" value="${val}"><span>${esc(label)}</span></label>`;
  const qblock = (q) => `<div class="field"><span class="lbl">${esc(q.q)}</span><span class="help">${esc(q.help)}</span><div class="opts">${q.opts.map((o) => radio(q.id, o)).join('')}</div></div>`;
  return {
    html: `
    <div class="form-layout">
      <form class="card" style="padding:0" id="tier-form">
        <div class="fsec"><h3><span class="n">01</span> Autonomy: the tier you are designing for</h3>
          <div class="field"><span class="lbl">${esc(TIER_Q[0].q)}</span><span class="help">${esc(TIER_Q[0].help)}</span>
          <div class="stack g8">${TIER_Q[0].opts.map(([v, l]) => `<label class="card flat" style="padding:12px 14px;cursor:pointer"><span class="row g8"><input type="radio" name="act" value="${v}" style="accent-color:var(--accent)"><b>${v}</b><span class="xs faint">${esc(TIER_INFO[v].loop)}</span></span><span class="small muted" style="display:block;margin-top:4px">${esc(l)}</span></label>`).join('')}</div></div>
        </div>
        <div class="fsec"><h3><span class="n">02</span> Impact factors</h3>${IMPACT.map(qblock).join('')}</div>
        <div class="fsec"><h3><span class="n">03</span> Likelihood factors</h3>${LIKELY.map(qblock).join('')}</div>
      </form>
      <aside class="form-aside"><div class="card" id="tier-out"><p class="muted small">Answer the questions to see a recommendation.</p></div>
        <div class="callout info">${icon('info')}<div class="small">The factors are the impact and likelihood factors in IMDA's framework (§2.1.1). The scoring that turns them into a consequence class is GovKit's editorial heuristic, not IMDA's. The accountable executive decides, and RC concurs at G0.</div></div></aside>
    </div>`,
    mount(root) {
      const out = root.querySelector('#tier-out');
      const f = root.querySelector('#tier-form');
      let result = null;
      const calc = () => {
        const d = Object.fromEntries(new FormData(f).entries());
        if (!d.act) { out.innerHTML = '<p class="muted small">Start with question 01. It decides the tier.</p>'; return; }
        const impact = IMPACT.reduce((n, q) => n + (+d[q.id] || 0), 0);
        const likely = LIKELY.reduce((n, q) => n + (+d[q.id] || 0), 0);
        const answered = [...IMPACT, ...LIKELY].filter((q) => d[q.id] !== undefined).length;
        const cons = impact >= 7 ? 'Severe' : impact >= 5 ? 'High' : impact >= 3 ? 'Medium' : 'Low';
        const rev = ['Fully reversible', 'Reversible with effort', 'Irreversible'][+d.rev || 0];
        const target = d.act;
        const start = TIERS.indexOf(target) > 1 ? 'T2' : target;
        const cautions = [];
        if (TIERS.indexOf(target) >= 2 && (+d.rev === 2)) cautions.push('Irreversible decisions at T3 or T4 put all the weight on the sampling loop (09) and the kill switch (12). Consider keeping a human approval step for the irreversible case types in 02 must_escalate.');
        if (TIERS.indexOf(target) >= 2 && likely >= 3) cautions.push('High likelihood factors: the hazard analysis (03) should cover interactions and the OWASP ASI categories, and the red team in 13 should cover exposure to untrusted input.');
        if (target === 'T4') cautions.push('At T4 there is no human in the path. Oversight rests entirely on records (07), sampling (09) and calibration (10).');
        const reqs = (t) => D.order.filter((id) => ['required', 'light'].includes(D.art[id].tiers[t]) || D.art[id].tiers[t] === 'if_vendor');
        const added = reqs(target).filter((id) => !reqs(start).includes(id) || D.art[id].tiers[start] !== D.art[id].tiers[target]);
        result = { target, start, cons, rev, impact, likely };
        out.innerHTML = `
          <div class="eyebrow">Recommendation</div>
          <div class="row g12 mt8"><div><div class="xs faint">Start at</div><div class="big-num">${start}</div></div>${start !== target ? `<div>${icon('arrowRight')}</div><div><div class="xs faint">Target</div><div class="big-num" style="color:var(--ink-3)">${target}</div></div>` : ''}</div>
          <p class="small muted mt8">${esc(TIER_INFO[start].name)}.${start !== target ? ` First go-live is at T2 or below. ${target} is earned at G4 on sampling evidence.` : ''}</p>
          <dl class="kv mt12"><dt>Consequence</dt><dd><b>${cons}</b> <span class="xs faint">(impact ${impact}/8${answered < 6 ? ', incomplete' : ''})</span></dd><dt>Reversibility</dt><dd>${esc(rev)}</dd><dt>Likelihood</dt><dd>${likely}/4</dd></dl>
          ${cautions.map((c) => `<div class="callout warn mt12">${icon('alert')}<div class="small">${esc(c)}</div></div>`).join('')}
          <details class="acc mt12"><summary>Artefacts mandatory at ${start}</summary><div class="acc-body"><div class="row g6">${reqs(start).map((id) => `<a class="chip" href="#/artefacts/${id}" title="${esc(D.art[id].name)}">${id} ${reqBadge(D.art[id].tiers[start])}</a>`).join('')}</div>
            ${added.length && start !== target ? `<p class="small mt12">At ${target} these change: ${added.map((id) => `<a href="#/artefacts/${id}">${id}</a> (${REQ_LABEL[D.art[id].tiers[start]]} → ${REQ_LABEL[D.art[id].tiers[target]]})`).join(', ')}.</p>` : ''}</div></details>
          <div class="stack g8 mt16">${agentPicker('Apply to')}
            <button class="btn primary" id="apply">${icon('check')} Apply</button>
            <p class="xs faint">With an agent selected, this writes the tier, consequence class, reversibility and rationale into 00 and logs the decision. With none selected, it registers a new agent.</p></div>`;
        out.querySelector('#apply').addEventListener('click', () => apply(root));
      };
      const apply = (r) => {
        const a = pickedAgent(r);
        const rationale = `Tier tool: acts as ${result.target}; starting at ${result.start}. Impact ${result.impact}/8 → ${result.cons}; likelihood ${result.likely}/4.`;
        if (!a) {
          const n = newAgent({ name: 'New agent', tier: result.start });
          update(() => { Object.assign(n.forms['00'].values, { consequence_class: result.cons, reversibility: result.rev, tier_rationale: rationale }); n.forms['00'].status = 'draft'; logDecision(n, `Tier selected: ${result.start}`, rationale); });
          toast('Agent registered with the recommended tier. Give it a name in 00.');
          go(`agents/${n.id}/a/00`);
          return;
        }
        const prev = tierOf(a);
        update(() => {
          const f = ensureForm(a, '00');
          Object.assign(f.values, { tier: result.start, consequence_class: result.cons, reversibility: result.rev, tier_rationale: rationale });
          if (f.status === 'not_started') f.status = 'draft';
          f.history.push({ at: Date.now(), role: S().role, by: S().person, action: 'Tier tool applied', note: rationale });
          logDecision(a, `Tier selected: ${result.start}${prev !== result.start ? ` (was ${prev})` : ''}`, rationale);
        });
        toast(`Applied to ${agentName(a)}`);
        go(`agents/${a.id}/a/00`);
      };
      f.addEventListener('change', calc);
    },
  };
}

// ---------------------------------------------------------------- material change

const TRIGGERS = [
  ['model', 'Model version', 'Any change to the underlying model or its version, including a vendor\'s silent update.'],
  ['prompt', 'Prompt (prompt hash)', 'Any change to the system prompt or templates, including prompt-only releases.'],
  ['tools', 'Tool manifest', 'A tool added, removed, or its permissions or schema changed.'],
  ['rules', 'Rules or list version', 'Business rules, thresholds, or reference lists the agent relies on (for example a sanctions list format).'],
  ['population', 'Population shift', 'A new case type, jurisdiction, channel or customer segment, or a marked change in the mix.'],
  ['data', 'Data source, corpus or memory store', 'Anything 02 may_read resolves to in 14. The provenance record treats this as material.'],
];
const NONMAT = [['ui', 'Operator UI or reporting only'], ['infra', 'Infrastructure with an identical attested build'], ['docs', 'Documentation or training material']];

function change() {
  return {
    html: `
    <div class="form-layout">
      <form class="card" style="padding:0" id="ch-form">
        <div class="fsec">${agentPicker('Which agent is changing?')}</div>
        <div class="fsec"><h3><span class="n">01</span> What is changing?</h3>
          <p class="help muted small" style="margin-bottom:12px">These are the G5 triggers. Any one of them makes the change material. They are detected automatically from version drift on 07. This check is the human half.</p>
          <div class="stack g8">${TRIGGERS.map(([id, l, h]) => `<label class="check card flat" style="padding:12px 14px"><input type="checkbox" name="t" value="${id}"><span><b>${esc(l)}</b><br><span class="small muted">${esc(h)}</span></span></label>`).join('')}</div>
          <h4 class="mt24">Changes that are not material on their own</h4>
          <div class="stack g8 mt8">${NONMAT.map(([id, l]) => `<label class="check"><input type="checkbox" name="n" value="${id}"><span>${esc(l)}</span></label>`).join('')}</div>
        </div>
        <div class="fsec"><div class="field"><label for="ch-sum" class="lbl">Describe the change</label><span class="help">Specific enough that a supervisor can match it to the version triple, for example "model vendor-x 4.1 → 4.2".</span><input class="input" id="ch-sum" name="summary" placeholder="e.g. model vendor-x 4.1 → 4.2"></div></div>
      </form>
      <aside class="form-aside"><div class="card" id="ch-out"><p class="muted small">Tick what is changing.</p></div></aside>
    </div>`,
    mount(root) {
      const f = root.querySelector('#ch-form');
      const out = root.querySelector('#ch-out');
      const calc = () => {
        const d = new FormData(f);
        const t = d.getAll('t'), n = d.getAll('n');
        const a = pickedAgent(root);
        const tier = a ? tierOf(a) : null;
        const due = new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10);
        if (!t.length && !n.length) { out.innerHTML = '<p class="muted small">Tick what is changing.</p>'; return; }
        if (!t.length) {
          out.innerHTML = `<span class="verdict ok">${icon('check')} Not a material change</span><p class="small muted mt12">None of the G5 triggers applies. Release through your normal change process. The 06 attestation still runs on every release, and version drift on 07 will catch it if this is wrong.</p>
            ${a ? `<button class="btn mt16" id="rec">${icon('check')} Record in the decision log</button>` : ''}`;
        } else {
          const appr = tier ? (['T3', 'T4'].includes(tier) ? 'RC' : 'AOW') : 'AOW (T1–T2) · RC (T3–T4)';
          out.innerHTML = `<span class="verdict bad">${icon('alert')} Material change</span>
            <p class="small mt12">Triggers: <b>${t.map((x) => TRIGGERS.find((y) => y[0] === x)[1]).join(', ')}</b>.</p>
            <div class="eyebrow mt16">Required before it goes live (G5)</div>
            <ul class="small mt8">
              <li><a href="#/artefacts/06">06</a> agent definition re-attested for the new build</li>
              <li><a href="#/artefacts/03">03</a> hazard analysis re-run as a delta</li>
              <li><a href="#/artefacts/13">13</a> evaluation re-run as a regression suite</li>
              <li><a href="#/artefacts/10">10</a> calibration <b>voided</b>. Bands return to the full sampling rate</li>
              <li>A full <a href="#/artefacts/09">09</a> sampling round scheduled</li>
            </ul>
            <dl class="kv mt12"><dt>Approver</dt><dd><b>${appr}</b>${tier ? ` at ${tier}` : ''}</dd><dt>Revalidate by</dt><dd><b>${due}</b> <span class="xs faint">(change-to-revalidation ≤ 30 days)</span></dd></dl>
            ${a ? `<button class="btn primary mt16" id="rec" style="width:100%">${icon('flag')} Open G5 and flag the artefacts</button><p class="xs faint mt8">Approved artefacts go back to draft as a new revision, marked with this change.</p>` : '<p class="small muted mt12">Select an agent to open G5 and flag its artefacts.</p>'}`;
        }
        out.querySelector('#rec')?.addEventListener('click', () => record(a, t, n, due));
      };
      const record = (a, t, n, due) => {
        const summary = root.querySelector('#ch-sum').value.trim() || (t.length ? t.map((x) => TRIGGERS.find((y) => y[0] === x)[1]).join(', ') : n.map((x) => NONMAT.find((y) => y[0] === x)[1]).join(', '));
        const material = t.length > 0;
        update(() => {
          a.changes = a.changes || [];
          a.changes.push({ id: uid('ch'), at: Date.now(), triggers: t, material, summary, due: material ? due : '', open: material, by: S().person, role: S().role });
          if (material) {
            const reason = `G5 material change: ${summary}`;
            for (const id of ['06', '03', '13']) {
              const f = ensureForm(a, id);
              if (f.status === 'approved' || f.status === 'submitted') { f.cycle = (f.cycle || 1) + 1; f.status = 'draft'; f.approval = null; }
              f.flag = { reason, at: Date.now() };
              f.history.push({ at: Date.now(), role: S().role, by: S().person, action: 'Flagged by material change', note: summary });
            }
            const f10 = ensureForm(a, '10');
            f10.values.date_voided = new Date().toISOString().slice(0, 10);
            f10.flag = { reason: `Calibration voided by material change: ${summary}`, at: Date.now() };
            f10.history.push({ at: Date.now(), role: S().role, by: S().person, action: 'Calibration voided', note: summary });
            const f09 = ensureForm(a, '09');
            f09.flag = { reason: `Full round required after material change (by ${due}): ${summary}`, at: Date.now() };
            // A fresh G5 round for this change.
            const g = a.gates.G5;
            if (g && Object.keys(g.signoffs || {}).length) { g.history.push({ at: Date.now(), action: 'New change: new round opened' }); g.cycle = (g.cycle || 1) + 1; g.checks = {}; g.checkedBy = {}; g.signoffs = {}; }
          }
          logDecision(a, material ? 'Material change (G5)' : 'Non-material change', summary);
        });
        toast(material ? 'G5 opened and the artefacts are flagged' : 'Recorded as non-material');
        go(material ? `agents/${a.id}/g/G5` : `agents/${a.id}`);
      };
      f.addEventListener('change', calc);
      f.addEventListener('input', calc);
    },
  };
}

// ---------------------------------------------------------------- sampling

function sampling() {
  return {
    html: `
    <div class="grid cols-2">
      <div class="card">
        <h3>A round's result</h3>
        <div class="field mt16"><label for="c-n" class="lbl">Re-performed (n) <output id="o-n"></output></label><input class="range" id="c-n" type="range" min="20" max="3000" step="10" value="300"></div>
        <div class="field"><label for="c-x" class="lbl">Agent-wrong disagreements <output id="o-x"></output></label><input class="range" id="c-x" type="range" min="0" max="150" step="1" value="3"></div>
        <div class="field"><label for="c-t" class="lbl">Tolerance in 02 <output id="o-t"></output></label><input class="range" id="c-t" type="range" min="0.5" max="10" step="0.5" value="2"></div>
        <div class="grid cols-2 mt16">
          <div class="field"><label for="c-v" class="lbl">Closures in period</label><input class="input" id="c-v" type="number" min="1" step="100" value="10000"></div>
          <div class="field" style="margin-top:0"><label for="c-m" class="lbl">Reviewer minutes / case</label><input class="input" id="c-m" type="number" min="0" step="1" value="12"></div>
        </div>
      </div>
      <div class="card">
        <div class="eyebrow">Disagreement · Wilson 95%</div>
        <div class="row g12 mt8" style="align-items:baseline"><span class="big-num" id="r-rate"></span><span class="mono small faint" id="r-ci"></span></div>
        <div class="mt12" id="r-v"></div>
        <div class="grid cols-3 mt16">
          <div><div class="xs faint">Sample share</div><b id="r-share"></b></div>
          <div><div class="xs faint">Reviewer hours</div><b id="r-hours"></b></div>
          <div><div class="xs faint">Zero-found bound</div><b id="r-r3"></b></div>
        </div>
        <div class="mt16" style="border-top:1px solid var(--rule);padding-top:14px">${agentPicker('Save as a round in 09')}
          <div class="row g8 mt8"><input class="input" id="c-period" placeholder="Period, e.g. ${new Date().toISOString().slice(0, 7)}" style="max-width:220px"><button class="btn" id="save-round">${icon('plus')} Add round</button></div></div>
      </div>
    </div>
    <div class="card mt16">
      <h3>How many cases do I need?</h3>
      <p class="muted small mt8">To estimate a rate to a given precision at 95% confidence, n = 1.96² × p(1 − p) ÷ d².</p>
      <div class="row g16 mt12">
        <label class="field" style="margin:0"><span class="lbl">Expected rate</span><div class="input-unit"><input class="input" id="s-p" type="number" step="0.5" min="0.1" max="50" value="2"><span>%</span></div></label>
        <label class="field" style="margin:0"><span class="lbl">Precision ±</span><div class="input-unit"><input class="input" id="s-d" type="number" step="0.1" min="0.1" max="10" value="1"><span>pts</span></div></label>
        <div><div class="xs faint">Cases needed</div><div class="big-num" id="s-n"></div></div>
      </div>
    </div>
    <div class="callout outcome mt16">${icon('info')}<div class="small"><b>Reading the verdict.</b> <i>Within tolerance</i>: the whole interval is at or below the tolerance, so the round supports a green tile. <i>Inconclusive</i>: the interval straddles it, so report the tile as not evidenced and increase n. <i>Breach</i>: even the lower bound is above it, so escalate the stratum and revise 02. Always report the worst stratum alongside the overall rate.</div></div>`,
    mount(root) {
      const $ = (s) => root.querySelector(s);
      const a0 = pickedAgent(root);
      if (a0 && toleranceOf(a0) !== null) $('#c-t').value = String(toleranceOf(a0) * 100);
      const calc = () => {
        const n = +$('#c-n').value; $('#c-x').max = String(Math.min(150, n));
        const x = Math.min(+$('#c-x').value, n), t = +$('#c-t').value / 100;
        $('#o-n').textContent = n.toLocaleString(); $('#o-x').textContent = x; $('#o-t').textContent = pct(t);
        const [lo, hi] = wilson(x, n);
        $('#r-rate').textContent = pct(x / n); $('#r-ci').textContent = `${pct(lo)}–${pct(hi)}`;
        const vd = verdict(x, n, t);
        const msg = { within: `The whole interval is below ${pct(t)}. This round supports the tile being green.`, breach: 'Even the lower bound is above tolerance. Escalate the stratum and revise 02.', inconclusive: `The interval straddles ${pct(t)}. Report the tile as not evidenced and increase n.` }[vd.key];
        $('#r-v').innerHTML = `<span class="verdict ${vd.tone}">${esc(vd.label)}</span><p class="small muted mt8">${esc(msg)}</p>`;
        const vol = Math.max(1, +$('#c-v').value || 1), mins = Math.max(0, +$('#c-m').value || 0);
        $('#r-share').textContent = pct(n / vol); $('#r-hours').textContent = Math.round(n * mins / 60).toLocaleString(); $('#r-r3').textContent = pct(3 / n);
        const p = (+$('#s-p').value || 0) / 100, d = (+$('#s-d').value || 0) / 100;
        $('#s-n').textContent = d > 0 && p > 0 ? Math.ceil(1.96 * 1.96 * p * (1 - p) / (d * d)).toLocaleString() : '—';
      };
      root.addEventListener('input', calc);
      $('#tool-agent').addEventListener('change', () => { const a = pickedAgent(root); if (a && toleranceOf(a) !== null) { $('#c-t').value = String(toleranceOf(a) * 100); calc(); } });
      $('#save-round').addEventListener('click', () => {
        const a = pickedAgent(root);
        if (!a) { toast('Choose an agent to save the round to'); return; }
        const n = +$('#c-n').value, x = Math.min(+$('#c-x').value, n);
        update(() => {
          const f = ensureForm(a, '09');
          f.values.rounds = [...(f.values.rounds || []), { period: $('#c-period').value || new Date().toISOString().slice(0, 7), rate_type: 'Full', n: String(n), agent_wrong: String(x) }];
          if (f.status === 'not_started') f.status = 'draft';
          else if (f.status === 'approved') { f.status = 'draft'; f.cycle = (f.cycle || 1) + 1; f.approval = null; }
          f.history.push({ at: Date.now(), role: S().role, by: S().person, action: 'Round added from the calculator', note: `n=${n}, agent wrong=${x}` });
          logDecision(a, 'Sampling round recorded', `n=${n}, agent-wrong ${x} (${pct(x / n)}), ${verdict(x, n, toleranceOf(a) ?? +$('#c-t').value / 100).label}`);
        });
        toast('Round added to 09. Add the worst stratum there.');
        go(`agents/${a.id}/a/09`);
      });
      calc();
    },
  };
}

// ---------------------------------------------------------------- promotion

function promotion() {
  const draw = (a) => {
    if (!a) return `<div class="empty">${icon('bot')}<h3>Choose an agent</h3><p>Promotion readiness is read from the agent's 09 sampling rounds and its forms.</p></div>`;
    const r = analyseRounds(a);
    const t = tierOf(a);
    const next = TIERS[TIERS.indexOf(t) + 1];
    if (!next) return `<div class="callout info">${icon('info')}<div>${esc(agentName(a))} is already at T4. There is no higher tier.</div></div>`;
    const g = evalGate(a, 'G4');
    const worstOk = r.rounds.length && r.rounds.slice(-Math.max(1, r.streak)).every((x) => !x.worst || x.worst.vd.key === 'within');
    const items = [
      [r.tol !== null, 'Tolerance is written in 02', r.tol !== null ? `${pct(r.tol)}` : 'Missing'],
      [r.streak >= 4, 'At least 4 consecutive full-rate rounds within tolerance', `${r.streak} so far`],
      [r.streakN >= 1000, 'At least 1,000 cases across those rounds', `${r.streakN.toLocaleString()} cases`],
      [worstOk, 'Worst stratum within tolerance in those rounds', worstOk ? 'Yes' : 'Check the worst stratum in 09'],
      [statusOf(a, '09') === 'approved', '09 approved by RC', statusOf(a, '09')],
      [!routingOf(a) || ['submitted', 'approved'].includes(statusOf(a, '10')), '10 calibration opened (if confidence routing)', routingOf(a) ? statusOf(a, '10') : 'Not applicable'],
      [statusOf(a, '02') === 'approved', '02 revised for the new tier and approved', statusOf(a, '02')],
    ];
    const ok = items.every((x) => x[0]);
    return `
      <div class="grid cols-2">
        <div class="card">
          <div class="row g12"><div class="big-num">${t}</div>${icon('arrowRight')}<div class="big-num" style="color:${ok ? 'var(--ok)' : 'var(--ink-3)'}">${next}</div></div>
          <span class="verdict ${ok ? 'ok' : 'warn'} mt12">${ok ? `${icon('check')} Ready to ask for G4` : 'Not ready yet'}</span>
          <ul class="stack g8 mt16" style="list-style:none;padding:0">${items.map(([k, l, v]) => `<li class="row g8">${k ? `<span class="badge ok">${icon('check')}</span>` : '<span class="badge bad">✕</span>'}<span class="grow small">${esc(l)}</span><span class="xs faint">${esc(v)}</span></li>`).join('')}</ul>
          <a class="btn primary mt16" href="#/agents/${a.id}/g/G4">${icon('shield')} Open G4 for ${esc(agentName(a))}</a>
          ${gateStatus(a, 'G4') === 'passed' ? '<p class="xs faint mt8">G4 has already passed once for this agent.</p>' : ''}
        </div>
        <div class="card">
          <h3>Rounds</h3>
          ${r.rounds.length ? `<div class="scroll-x mt12"><table class="tbl"><thead><tr><th>Period</th><th>Rate</th><th class="num">n</th><th class="num">Agent wrong</th><th>Verdict</th></tr></thead><tbody>${r.rounds.map((x) => `<tr><td>${esc(x.period)}</td><td class="xs">${esc(x.rate_type || 'Full')}</td><td class="num">${x.n}</td><td class="num">${pct(x.p)}<br><span class="xs faint">${pct(x.lo)}–${pct(x.hi)}</span></td><td><span class="badge ${x.vd.tone}">${esc(x.vd.label)}</span></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted small mt12">No rounds recorded in 09.</p>'}
          <p class="xs faint mt12">The 1,000-case bar is read as cases across the consecutive in-tolerance rounds, the post-change and promotion row in the rule-of-three table. The G4 checks: ${g.checks.map((c) => esc(c.label)).join('; ')}.</p>
          ${r.reduction.ok ? '<div class="callout ok mt12"><div class="small"><b>Reduction rule met.</b> Bands may move to a reduced rate with a floor of 300 per band per quarter. Any material change resets them.</div></div>' : ''}
        </div>
      </div>`;
  };
  return {
    html: `${agentPicker()}<div id="p-out" class="mt16"></div>`,
    mount(root) {
      const out = root.querySelector('#p-out');
      const redraw = () => { out.innerHTML = draw(pickedAgent(root)); };
      root.querySelector('#tool-agent').addEventListener('change', redraw);
      redraw();
    },
  };
}

// ---------------------------------------------------------------- calibration

function calibration() {
  const defaults = [{ band: '0.95–1.00', closures: '28400', sampled: '900', disagreements: '4' }, { band: '0.90–0.95', closures: '9100', sampled: '600', disagreements: '14' }, { band: '0.80–0.90', closures: '3300', sampled: '400', disagreements: '31' }, { band: '< 0.80', closures: '1200', sampled: '', disagreements: '' }];
  let rows = defaults.map((x) => ({ ...x }));
  let tolPct = 2;
  const table = () => `
    <div class="scroll-x"><table class="tbl" style="min-width:640px"><thead><tr><th>Band</th><th class="num">Closures</th><th class="num">Sampled</th><th class="num">Disagree</th><th>Observed (95%)</th><th>Verdict</th><th></th></tr></thead><tbody>
    ${rows.map((r, i) => {
      const n = +r.sampled || 0, x = +r.disagreements || 0;
      const vd = verdict(x, n, tolPct / 100);
      const [lo, hi] = wilson(x, n);
      const lbl = !n ? 'Never auto-closed' : vd.key === 'within' ? 'Calibrated · auto-close' : vd.key === 'breach' ? 'Not calibrated · escalate' : 'Inconclusive · keep full rate';
      return `<tr><td><input class="input sm" data-i="${i}" data-k="band" value="${esc(r.band)}" style="min-width:100px"></td>${['closures', 'sampled', 'disagreements'].map((k) => `<td><input class="input sm" type="number" min="0" data-i="${i}" data-k="${k}" value="${esc(r[k])}" style="width:100px;text-align:right"></td>`).join('')}
        <td class="mono xs">${n ? `${pct(x / n)} (${pct(lo)}–${pct(hi)})` : '—'}</td><td><span class="badge ${!n ? 'line' : vd.tone}">${lbl}</span></td><td><button class="icon-btn" data-del="${i}" aria-label="Remove band">${icon('x')}</button></td></tr>`;
    }).join('')}</tbody></table></div>`;
  return {
    html: `
    <div class="card">
      <div class="row g16" style="justify-content:space-between;align-items:flex-end">${agentPicker('Load bands from an agent\'s 10')}
        <label class="field" style="margin:0"><span class="lbl">Tolerance in 02</span><div class="input-unit"><input class="input" id="cal-t" type="number" min="0.1" step="0.1" value="2" style="width:100px"><span>%</span></div></label></div>
      <div id="cal-tbl" class="mt16"></div>
      <div class="row g8 mt12"><button class="btn sm" id="add">${icon('plus')} Add band</button><button class="btn sm ghost" id="load">${icon('download')} Load from agent</button><button class="btn sm primary" id="save">${icon('check')} Save to agent's 10</button></div>
    </div>
    <div class="card mt16" id="cal-out"></div>
    <div class="callout info mt16">${icon('info')}<div class="small">Uses the same rule as the sampling calculator. A band is <i>calibrated</i> when its whole 95% interval is at or below the tolerance, and <i>not calibrated</i> when even the lower bound is above it. The illustrative numbers are from the operating model. A band with no sample is never auto-closed.</div></div>`,
    mount(root) {
      const $ = (s) => root.querySelector(s);
      const draw = () => {
        $('#cal-tbl').innerHTML = table();
        const firstBad = rows.findIndex((r) => { const n = +r.sampled || 0; return !n || verdict(+r.disagreements || 0, n, tolPct / 100).key !== 'within'; });
        const okBands = firstBad === -1 ? rows : rows.slice(0, firstBad);
        $('#cal-out').innerHTML = okBands.length
          ? `<h3>Routing threshold</h3><p class="mt8">The auto-close threshold can point at <b>${esc(okBands[okBands.length - 1].band.split(/[–-]/)[0].trim())}</b>: every band from <b>${esc(okBands[0].band)}</b> down to <b>${esc(okBands[okBands.length - 1].band)}</b> is calibrated. Everything below escalates. Record it in 02 as a pointer to this row, not as an engineer's judgement.</p>`
          : '<h3>Routing threshold</h3><p class="mt8">No band is calibrated at this tolerance, starting from the highest-confidence band. Nothing should auto-close on confidence yet.</p>';
      };
      const load = () => {
        const a = pickedAgent(root);
        if (!a) return;
        const b = analyseBands(a);
        if (b.length) rows = b.map((r) => ({ band: r.band, closures: r.closures || '', sampled: r.sampled || '', disagreements: r.disagreements || '' }));
        if (toleranceOf(a) !== null) { tolPct = toleranceOf(a) * 100; $('#cal-t').value = String(tolPct); }
        draw();
      };
      root.addEventListener('input', (e) => {
        if (e.target.id === 'cal-t') { tolPct = +e.target.value || 0; draw(); return; }
        const i = e.target.dataset.i; if (i === undefined) return;
        rows[+i][e.target.dataset.k] = e.target.value;
      });
      root.addEventListener('change', (e) => { if (e.target.dataset.i !== undefined) draw(); if (e.target.id === 'tool-agent') load(); });
      root.addEventListener('click', (e) => {
        const d = e.target.closest('[data-del]'); if (d) { rows.splice(+d.dataset.del, 1); draw(); }
      });
      $('#add').addEventListener('click', () => { rows.push({ band: '', closures: '', sampled: '', disagreements: '' }); draw(); });
      $('#load').addEventListener('click', () => { if (!pickedAgent(root)) toast('Choose an agent first'); else { load(); toast('Loaded'); } });
      $('#save').addEventListener('click', () => {
        const a = pickedAgent(root);
        if (!a) { toast('Choose an agent to save to'); return; }
        update(() => {
          const f = ensureForm(a, '10');
          f.values.bands = rows.filter((r) => r.band);
          if (f.status === 'not_started') f.status = 'draft';
          else if (f.status === 'approved') { f.status = 'draft'; f.cycle = (f.cycle || 1) + 1; f.approval = null; }
          f.history.push({ at: Date.now(), role: S().role, by: S().person, action: 'Bands saved from the calibration check' });
          logDecision(a, 'Calibration bands reviewed', `${rows.length} bands at tolerance ${tolPct}%`);
        });
        toast('Saved to 10');
        go(`agents/${a.id}/a/10`);
      });
      if (pickedAgent(root) && analyseBands(pickedAgent(root)).length) load(); else draw();
    },
  };
}

// ---------------------------------------------------------------- maturity

const MQ = {
  L2: [['m00', 'An agent inventory entry (00) exists'], ['m02', 'A delegation policy / mandate (02) exists'], ['mown', 'A named accountable owner exists for the agent']],
  L3: [['m05', 'The control profile (05) is selected by tier in the pipeline'], ['mgate', 'The pipeline is gated and there is no bypass of the tool gateway'], ['m0708', 'Decision (07) and control (08) records are sealed and aggregated']],
  L4: [['m09', 'Outcome sampling (09) runs monthly'], ['mtiles', 'Dashboard tiles are labelled, including an Unknown tile'], ['mtol', 'The tolerance is written into 02'], ['mkill', 'The kill switch has been drilled (12)']],
  L5: [['m10', 'Calibration (10) justifies the routing threshold'], ['mred', 'Sampling shrinks by rule and resets on change'], ['mpromo', 'Tier promotion is evidenced (G4 on 09 rounds)']],
};

function suggest(a) {
  if (!a) return {};
  const has = (id) => statusOf(a, id) !== 'not_started';
  const appr = (id) => statusOf(a, id) === 'approved';
  const r = analyseRounds(a);
  const tiles = (a.forms['11']?.values && JSON.stringify(a.forms['11'].values).toLowerCase().includes('unknown'));
  return {
    m00: has('00'), m02: has('02'), mown: !!a.forms['00']?.values?.agent_owner,
    m05: appr('05'), mgate: !!a.gates?.G3?.checks?.bypass_test_passed, m0708: appr('07') && appr('08'),
    m09: r.rounds.length >= 1, mtiles: !!tiles, mtol: r.tol !== null, mkill: evalGate(a, 'G3').checks.find((c) => c.id === 'drilled_inside_limit')?.auto?.v === true,
    m10: appr('10'), mred: r.reduction.ok, mpromo: gateStatus(a, 'G4') === 'passed',
  };
}

function maturity() {
  const all = Object.entries(MQ);
  return {
    html: `
    <div class="form-layout">
      <form class="card" style="padding:0" id="m-form">
        <div class="fsec">${agentPicker()}<button type="button" class="btn sm ghost mt8" id="m-sug">${icon('spark')} Pre-fill from the agent's workspace</button></div>
        ${all.map(([lv, qs]) => `<div class="fsec"><h3><span class="n">${lv}</span>${esc(MATURITY.find((m) => m.id === lv).name)}</h3>${qs.map(([id, l]) => `<label class="check" style="margin-top:10px"><input type="checkbox" name="${id}"><span>${esc(l)}</span></label>`).join('')}</div>`).join('')}
      </form>
      <aside class="form-aside"><div class="card" id="m-out"></div></aside>
    </div>
    <div class="ladder mt24" id="m-ladder">${MATURITY.map((m) => `<div class="rung" data-lv="${m.id}"><span class="lv">${m.id}</span><div><b>${esc(m.name)}</b><p>${esc(m.body)}</p></div></div>`).join('')}</div>`,
    mount(root) {
      const f = root.querySelector('#m-form');
      const out = root.querySelector('#m-out');
      let level = 'L1';
      const calc = () => {
        const d = new FormData(f);
        level = 'L1';
        for (const [lv, qs] of all) { if (qs.every(([id]) => d.get(id))) level = lv; else break; }
        const nextLv = all.find(([lv]) => lv > level);
        const todo = nextLv ? nextLv[1].filter(([id]) => !d.get(id)) : [];
        root.querySelectorAll('[data-lv]').forEach((el) => el.classList.toggle('cur', el.dataset.lv === level));
        out.innerHTML = `<div class="eyebrow">Current level</div><div class="big-num mt8">${level}</div><p class="muted">${esc(MATURITY.find((m) => m.id === level).name)}</p>
          ${nextLv ? `<h4 class="mt16">To reach ${nextLv[0]}</h4><ul class="small mt8">${todo.map(([, l]) => `<li>${esc(l)}</li>`).join('')}</ul>` : '<p class="small mt12">Top of the ladder. Keep the loop running: it shrinks, but it never closes.</p>'}
          ${level === 'L3' ? `<div class="callout warn mt12">${icon('alert')}<div class="small">L3 looks finished, but nothing yet says the decisions were right. The oversight pack at L3 should say so.</div></div>` : ''}
          ${pickedAgent(root) ? `<button class="btn primary mt16" id="m-save" type="button" style="width:100%">${icon('check')} Save to ${esc(agentName(pickedAgent(root)))}</button>` : ''}`;
        out.querySelector('#m-save')?.addEventListener('click', () => {
          const a = pickedAgent(root);
          update(() => { a.maturity = { level, at: Date.now(), answers: Object.fromEntries(d.entries()) }; logDecision(a, `Maturity assessed: ${level}`, todo.length && nextLv ? `Next: ${todo.map((x) => x[1]).join('; ')}` : 'Top level'); });
          toast(`Saved ${level}`);
        });
      };
      const prefill = () => {
        const a = pickedAgent(root);
        if (!a) { toast('Choose an agent first'); return; }
        const s = a.maturity?.answers || suggest(a);
        f.querySelectorAll('input[type=checkbox]').forEach((c) => { c.checked = !!s[c.name]; });
        calc();
      };
      root.querySelector('#m-sug').addEventListener('click', prefill);
      f.addEventListener('change', (e) => { if (e.target.id === 'tool-agent') { const a = pickedAgent(root); if (a?.maturity) prefill(); } calc(); });
      if (pickedAgent(root)?.maturity) prefill(); else calc();
    },
  };
}

