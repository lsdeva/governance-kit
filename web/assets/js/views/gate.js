// A gate review for one agent: required artefacts, checks confirmed by named
// roles, and signed pass/fail decisions by every approver. A gate cannot be
// passed with anything missing.

import { D, TIERS } from '../data.js';
import { S, agent as getAgent, update } from '../store.js';
import { esc, icon, toast, dialog, fmtDateTime } from '../ui.js';
import { evalGate, tierOf, agentName } from '../logic.js';
import { aidBox, statusPill, rolePrompt, av, roleName } from '../components.js';
import { linkIds } from './model.js';
import { focus } from './agent.js';

export function render(agentId, gid) {
  const a = getAgent(agentId);
  const gate = D.gate[gid];
  if (!a || !gate) return null;
  focus.agent = a.id;
  const role = S().role;
  const e = evalGate(a, gid);
  const G = e.G;
  const so = e.rec.signoffs || {};
  const isApprover = role && e.approvers.includes(role);
  const status = e.status;
  const openChange = (a.changes || []).filter((c) => c.open).slice(-1)[0];

  const statusBox = status === 'passed'
    ? `<div class="callout ok">${icon('checkCircle')}<div class="grow"><b>Passed.</b> Signed by ${e.approvers.map((r) => `${r}${so[r]?.by ? ` (${esc(so[r].by)})` : ''}`).join(' and ')}. The signatures are part of the agent's evidence pack.</div></div>`
    : status === 'failed'
      ? `<div class="callout bad">${icon('xCircle')}<div class="grow"><b>Failed.</b> ${esc(G.on_fail)}</div></div>`
      : e.ready
        ? `<div class="callout ok">${icon('shield')}<div class="grow"><b>Ready for a decision.</b> Every required artefact exists and every check is confirmed. ${e.approvers.map(roleName).join(' and ')} now sign${e.approvers.length > 1 ? '' : 's'}.</div></div>`
        : `<div class="callout warn">${icon('alert')}<div class="grow"><b>Not ready.</b> ${e.arts.filter((x) => !x.met).length} artefact(s) and ${e.checks.filter((x) => !x.met).length} check(s) outstanding. A gate with missing artefacts is a failed gate, not one passed with conditions.</div></div>`;

  const artList = e.arts.map((x) => `<a class="arow" href="#/agents/${a.id}/a/${x.id}" style="${x.applicable ? '' : 'opacity:.6'}">
      ${aidBox(x.id)}
      <span class="t"><b>${esc(D.art[x.id].name)}</b><small>${x.applicable ? `Needs: ${x.state === 'approved' ? 'approved' : 'submitted for review'}` : esc(x.reason)}</small></span>
      <span class="r">${statusPill(x.status)}${x.applicable ? (x.met ? `<span class="badge ok">${icon('check')} Met</span>` : '<span class="badge bad">Missing</span>') : '<span class="badge line">N/A</span>'}</span>
    </a>`).join('');

  const checkList = e.checks.map((c) => {
    const canTick = role && (role === c.who || e.approvers.includes(role)) && status === 'open';
    const sug = c.auto ? (c.na ? `<span class="badge line">Not applicable</span>` : `<span class="badge ${c.auto.v ? 'ok' : 'warn'}">GovKit suggests: ${c.auto.v ? 'yes' : 'not yet'}</span>`) : '';
    return `<div class="card flat" style="padding:14px 16px">
      <label class="check" style="${canTick ? '' : 'cursor:default'}"><input type="checkbox" data-check="${c.id}" ${c.ticked || c.na ? 'checked' : ''} ${canTick && !c.na ? '' : 'disabled'}>
        <span class="grow"><b>${esc(c.label)}</b> <span class="row g6" style="display:inline-flex;margin-left:4px">${av(c.who)}${sug}</span><br><span class="small muted">${linkIds(c.help)}</span>
        ${c.auto && !c.na ? `<br><span class="xs faint">${icon('info', 'sm-ic')} ${esc(c.auto.why)}</span>` : ''}
        ${e.rec.checkedBy?.[c.id] ? `<br><span class="xs faint">Confirmed by ${esc(e.rec.checkedBy[c.id].role)} ${esc(e.rec.checkedBy[c.id].by || '')} · ${fmtDateTime(e.rec.checkedBy[c.id].at)}</span>` : ''}</span></label>
    </div>`;
  }).join('');

  const signBlock = e.approvers.map((r) => {
    const x = so[r];
    const mine = role === r;
    return `<div class="card flat" style="padding:14px 16px">
      <div class="row g12">${av(r)}<div class="grow"><b>${esc(roleName(r))}</b><div class="xs faint">${gid === 'G5' ? `Approver at ${tierOf(a)}` : 'Approver'}</div></div>
      ${x ? `<span class="badge ${x.decision === 'pass' ? 'ok' : 'bad'}">${x.decision === 'pass' ? 'Passed' : 'Failed'}</span>` : '<span class="badge line">Not signed</span>'}</div>
      ${x ? `<p class="small mt8">${esc(x.rationale)}</p><p class="xs faint mt4">${esc(x.by || '')} · ${fmtDateTime(x.at)}${x.evidence ? ` · evidence: ${esc(x.evidence)}` : ''}</p>` : ''}
      ${mine && !x && status === 'open' ? `<div class="row g8 mt12"><button class="btn ok" id="pass" ${e.ready ? '' : 'aria-disabled="true"'}>${icon('check')} Pass</button><button class="btn bad" id="fail">${icon('x')} Fail</button>${e.ready ? '' : '<span class="xs faint">Pass unlocks when everything above is met.</span>'}</div>` : ''}
    </div>`;
  }).join('');

  return {
    title: `${gid} · ${gate.name} · ${agentName(a)}`,
    crumbs: [['My work', '#/work'], [agentName(a), `#/agents/${a.id}`], [`${gid} · ${gate.name}`]],
    html: `
    <header class="page-head">
      <div class="row g8"><span class="aid-box g">${gid}</span><div class="stack"><span class="eyebrow accent">${esc(agentName(a))} · gate review${(e.rec.cycle || 1) > 1 ? ` · round ${e.rec.cycle}` : ''}</span><span class="row g8 mt4"><span class="badge ${gate.type.startsWith('Automated') ? 'process' : 'line'}">${esc(gate.type)}</span><span class="badge line">${esc(gate.ceremony)}</span></span></div></div>
      <h1>${esc(gate.name)}</h1>
      <p class="lede">${esc(G.purpose)}</p>
    </header>
    ${!role ? `<div style="margin-bottom:16px">${rolePrompt('confirm checks or sign this gate')}</div>` : ''}
    ${gid === 'G5' && openChange ? `<div class="callout info" style="margin-bottom:16px">${icon('refresh')}<div><b>Change under review:</b> ${esc(openChange.summary)}${openChange.due ? ` · revalidation due by ${esc(openChange.due)}` : ''}</div></div>` : ''}
    <div style="margin-bottom:20px">${statusBox}</div>

    <div class="form-layout">
      <div class="stack g24">
        <section><h2>Artefacts that must exist</h2><p class="muted small mt4">From the gate definition: ${linkIds(gate.required_artefacts)}</p><div class="alist mt12">${artList}</div></section>
        <section><h2>Checks</h2><p class="muted small mt4">Each check is confirmed by the role shown. Where GovKit can compute an answer from the forms it suggests one, but a person still confirms it.</p><div class="stack g8 mt12" id="checks">${checkList}</div></section>
        <section><h2>Decision</h2><p class="muted small mt4"><b>Pass when:</b> ${linkIds(gate.pass_condition)}</p><div class="stack g8 mt12">${signBlock}</div>
          ${status !== 'open' ? `<div class="row g8 mt12"><button class="btn sm" id="reopen">${icon('refresh')} Hold this gate again</button><span class="xs faint">For example after a failed decision is remedied, or artefacts were reopened.</span></div>` : ''}
        </section>
      </div>
      <aside class="form-aside">
        <div class="card"><h3>If it fails</h3><p class="small muted mt8">${esc(G.on_fail)}</p></div>
        <div class="card"><h3>Evidence to reference</h3><p class="small muted mt8">${esc(G.evidence)}</p></div>
        <div class="card"><h3>History</h3>${(e.rec.history || []).length ? `<ul class="hist mt8">${e.rec.history.slice().reverse().slice(0, 12).map((h) => `<li><b>${esc(h.action)}</b> · ${esc(h.role || '')} ${esc(h.by || '')}<br><span class="xs">${fmtDateTime(h.at)}</span>${h.note ? `<br>${esc(h.note)}` : ''}</li>`).join('')}</ul>` : '<p class="muted small mt8">Nothing yet.</p>'}</div>
        <a class="btn ghost" href="#/model/gates#${gid}">${icon('book')} How this gate works</a>
      </aside>
    </div>`,
    mount(root) {
      const person = () => S().person || '';
      const ensure = () => (a.gates[gid] ||= { checks: {}, signoffs: {}, checkedBy: {}, history: [], cycle: 1 });
      root.querySelector('#checks').addEventListener('change', (ev) => {
        const cb = ev.target.closest('[data-check]'); if (!cb) return;
        update(() => {
          const g = ensure();
          g.checks[cb.dataset.check] = cb.checked;
          g.checkedBy = g.checkedBy || {};
          if (cb.checked) g.checkedBy[cb.dataset.check] = { role, by: person(), at: Date.now() }; else delete g.checkedBy[cb.dataset.check];
          g.history.push({ at: Date.now(), role, by: person(), action: `${cb.checked ? 'Confirmed' : 'Unconfirmed'}: ${e.checks.find((c) => c.id === cb.dataset.check).label}` });
          a.updated = Date.now();
        });
      });
      const sign = async (decision) => {
        if (decision === 'pass' && !e.ready) { toast('Pass is locked until every artefact and check is met'); return; }
        const d = await dialog({
          title: `${decision === 'pass' ? 'Pass' : 'Fail'} ${gid} · ${gate.name}`,
          body: `${decision === 'fail' ? `<div class="callout warn">${icon('alert')}<div class="small">${esc(G.on_fail)}</div></div>` : ''}
            <label class="field"><span class="lbl">Rationale <span class="req-mark">*</span></span><span class="help">${decision === 'pass' ? 'What you relied on, in a sentence or two. This is the recorded reasoning a supervisor will read.' : 'What is missing or wrong, and what must happen before this gate is held again.'}</span><textarea class="input" name="rationale" required></textarea></label>
            <label class="field"><span class="lbl">Evidence reference</span><span class="help">${esc(G.evidence)}</span><input class="input" name="evidence" placeholder="URL, ticket or document reference"></label>
            ${person() ? '' : '<label class="field"><span class="lbl">Your name for the record</span><input class="input" name="person" required></label>'}`,
          confirm: decision === 'pass' ? 'Sign pass' : 'Sign fail', tone: decision === 'pass' ? 'ok' : 'bad',
        });
        if (!d || !d.rationale?.trim()) return;
        if (d.person) update((s) => { s.person = d.person.trim(); }, { silent: true });
        update(() => {
          const g = ensure();
          g.signoffs[role] = { decision, rationale: d.rationale.trim(), evidence: d.evidence || '', by: person(), at: Date.now() };
          g.history.push({ at: Date.now(), role, by: person(), action: decision === 'pass' ? 'Signed pass' : 'Signed fail', note: d.rationale.trim() });
          a.updated = Date.now();
        });
        const after = evalGate(a, gid);
        if (after.status === 'passed') await onPassed(a, gid);
        toast(decision === 'pass' ? (after.status === 'passed' ? `${gid} passed` : 'Your pass is recorded. Waiting for the other approver.') : `${gid} failed and recorded`);
      };
      root.querySelector('#pass')?.addEventListener('click', () => sign('pass'));
      root.querySelector('#fail')?.addEventListener('click', () => sign('fail'));
      root.querySelector('#reopen')?.addEventListener('click', async () => {
        const d = await dialog({ title: `Hold ${gid} again?`, body: '<p class="muted">The previous decisions stay in the history. Checks and sign-offs are cleared for a new round.</p>', confirm: 'Start a new round' });
        if (d) update(() => { const g = ensure(); g.history.push({ at: Date.now(), role, by: person(), action: `Round ${g.cycle || 1} closed; new round opened` }); g.cycle = (g.cycle || 1) + 1; g.checks = {}; g.checkedBy = {}; g.signoffs = {}; });
      });
    },
  };
}

// Side effects the model attaches to a passed gate.
async function onPassed(a, gid) {
  const v00 = a.forms['00']?.values || {};
  if (gid === 'G3' && v00.status !== 'live') update(() => { a.forms['00'].values.status = 'live'; });
  if (gid === 'G6') update(() => { a.forms['00'].values.status = 'retired'; });
  if (gid === 'G5') update(() => { (a.changes || []).forEach((c) => { c.open = false; }); });
  if (gid === 'G4') {
    const t = tierOf(a);
    const next = TIERS[TIERS.indexOf(t) + 1];
    if (!next) return;
    const d = await dialog({ title: `Record the promotion to ${next} in 00?`, body: `<p class="muted">The inventory tier changes only after signature, and G4 is now signed. Updating 00 moves the agent from ${t} to ${next}, and the artefacts required at ${next} apply from now on.</p>`, confirm: `Promote to ${next}`, cancel: 'Not now' });
    if (d) update(() => {
      a.forms['00'].values.tier = next;
      a.forms['00'].history.push({ at: Date.now(), role: S().role, by: S().person, action: `Tier promoted ${t} → ${next} after G4` });
      a.decisions.push({ at: Date.now(), role: S().role, by: S().person, title: `Tier promotion ${t} → ${next}`, summary: 'Recorded in 00 after the G4 signature.' });
      // G4 is a recurring gate: open a fresh round for the next promotion.
      a.gates.G4.history.push({ at: Date.now(), action: `Promotion to ${next} recorded; gate reset for any further promotion` });
      a.gates.G4.passedRounds = [...(a.gates.G4.passedRounds || []), { at: Date.now(), from: t, to: next, signoffs: a.gates.G4.signoffs }];
    });
  }
}

