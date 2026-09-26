// One artefact's form for one agent. The acting role decides what you can do:
// R drafts and submits, C records a view, A approves or returns, I acknowledges.

import { D, TIER_INFO, raciOf, formFields, ROLE_IDS } from '../data.js';
import { S, agent as getAgent, update, form as ensureForm, uid } from '../store.js';
import { esc, icon, toast, dialog, fmtDateTime, pct } from '../ui.js';
import { requirement, isNeeded, completeness, neededFields, isFilled, tierOf, agentName, STATUS, wilson, verdict, toleranceOf } from '../logic.js';
import { aidBox, reqBadge, statusPill, myRaci, rolePrompt, av, roleName, raciInline } from '../components.js';
import { linkIds } from './model.js';
import { focus } from './agent.js';

const optVal = (o) => (typeof o === 'string' ? o : o.value);
const optLabel = (o) => (typeof o === 'string' ? o : o.label);

function inputFor(f, v, name, locked, extra = '') {
  const dis = locked ? 'disabled' : '';
  const ph = f.placeholder ? `placeholder="${esc(f.placeholder)}"` : '';
  switch (f.type) {
    case 'textarea': return `<textarea class="input" ${name} ${ph} ${dis} ${extra}>${esc(v)}</textarea>`;
    case 'code': return `<textarea class="input code" spellcheck="false" ${name} ${ph} ${dis} ${extra}>${esc(v)}</textarea>`;
    case 'number': case 'percent': {
      const unit = f.type === 'percent' ? '%' : f.unit;
      const inp = `<input class="input" type="number" step="any" inputmode="decimal" ${name} value="${esc(v)}" ${ph} ${dis} ${extra}>`;
      return unit ? `<div class="input-unit">${inp}<span>${esc(unit)}</span></div>` : inp;
    }
    case 'date': return `<input class="input" type="date" ${name} value="${esc(v)}" ${dis} ${extra}>`;
    case 'select': {
      const opts = f.options || [];
      return `<select class="input" ${name} ${dis} ${extra}><option value="">Choose…</option>${opts.map((o) => `<option value="${esc(optVal(o))}" ${String(v) === String(optVal(o)) ? 'selected' : ''}>${esc(optLabel(o))}</option>`).join('')}</select>`;
    }
    case 'yesno': return `<select class="input" ${name} ${dis} ${extra}><option value="">—</option><option value="yes" ${v === 'yes' ? 'selected' : ''}>Yes</option><option value="no" ${v === 'no' ? 'selected' : ''}>No</option></select>`;
    case 'role': return `<select class="input" ${name} ${dis} ${extra}><option value="">Choose a role…</option>${ROLE_IDS.map((r) => `<option value="${r}" ${v === r ? 'selected' : ''}>${r} · ${esc(roleName(r))}</option>`).join('')}</select>`;
    default: return `<input class="input" type="text" ${name} value="${esc(v)}" ${ph} ${dis} ${extra}>`;
  }
}

// Top-level fields get richer controls than table cells.
function control(f, v, locked, artId, a) {
  const nm = `data-f="${f.id}" id="in-${f.id}"`;
  const dis = locked ? 'disabled' : '';
  if (f.type === 'select' && (f.options || []).length <= 5) {
    return `<div class="opts" role="radiogroup" aria-labelledby="lb-${f.id}">${f.options.map((o) => `<label class="opt"><input type="radio" name="r-${f.id}" data-f="${f.id}" value="${esc(optVal(o))}" ${String(v) === String(optVal(o)) ? 'checked' : ''} ${dis}><span>${esc(optLabel(o))}</span></label>`).join('')}</div>`;
  }
  if (f.type === 'yesno') {
    return `<div class="opts" role="radiogroup" aria-labelledby="lb-${f.id}">${[['yes', 'Yes'], ['no', 'No']].map(([val, l]) => `<label class="opt"><input type="radio" name="r-${f.id}" data-f="${f.id}" value="${val}" ${v === val ? 'checked' : ''} ${dis}><span>${l}</span></label>`).join('')}</div>`;
  }
  if (f.type === 'multiselect') {
    const arr = Array.isArray(v) ? v : [];
    return `<div class="opts">${(f.options || []).map((o) => `<label class="opt"><input type="checkbox" data-f="${f.id}" data-multi value="${esc(optVal(o))}" ${arr.includes(optVal(o)) ? 'checked' : ''} ${dis}><span>${esc(optLabel(o))}</span></label>`).join('')}</div>`;
  }
  if (f.type === 'list') {
    const arr = Array.isArray(v) && v.length ? v : [''];
    return `<div class="list-rows">${arr.map((x, i) => `<div class="list-row"><input class="input" data-f="${f.id}" data-i="${i}" value="${esc(x)}" ${f.placeholder ? `placeholder="${esc(f.placeholder)}"` : ''} ${dis} aria-label="${esc(f.label)} ${i + 1}">${locked ? '' : `<button type="button" class="icon-btn" data-del-item="${f.id}" data-i="${i}" aria-label="Remove item ${i + 1}">${icon('x')}</button>`}</div>`).join('')}
      ${locked ? '' : `<button type="button" class="btn sm ghost" data-add-item="${f.id}" style="align-self:flex-start">${icon('plus')} Add item</button>`}</div>`;
  }
  if (f.type === 'table') {
    const rows = Array.isArray(v) && v.length ? v : [];
    return `<div class="trows">${rows.map((row, i) => `<div class="trow">
        <div class="row g8" style="justify-content:space-between;margin-bottom:8px"><span class="eyebrow">Row ${i + 1}</span>${locked ? '' : `<button type="button" class="icon-btn" data-del-row="${f.id}" data-i="${i}" aria-label="Remove row ${i + 1}">${icon('trash')}</button>`}</div>
        <div class="trow-grid">${f.columns.map((c) => `<label class="tcell"><span>${esc(c.label)}</span>${inputFor(c, row?.[c.id] ?? '', `data-f="${f.id}" data-row="${i}" data-col="${c.id}"`, locked)}</label>`).join('')}</div>
        <div class="computed" data-computed="${f.id}-${i}">${computed(artId, f.id, row, a)}</div>
      </div>`).join('') || `<p class="faint small">No rows yet.</p>`}
      ${locked ? '' : `<div class="row g8"><button type="button" class="btn sm" data-add-row="${f.id}">${icon('plus')} Add row</button>${prefillButton(artId, f.id, a)}</div>`}</div>`;
  }
  if (f.type === 'code') {
    const ex = D.art[artId].example && f.lang && !locked ? `<button type="button" class="btn sm ghost" data-example="${f.id}" style="align-self:flex-start">${icon('copy')} Start from the illustrative example</button>` : '';
    return `${inputFor(f, v ?? '', nm, locked)}${ex}`;
  }
  return inputFor(f, v ?? '', nm, locked, `aria-labelledby="lb-${f.id}"`);
}

function prefillButton(artId, fid, a) {
  if (artId === '13' && fid === 'escalation_tests' && (a.forms['02']?.values?.must_escalate || []).some((x) => String(x).trim())) return `<button type="button" class="btn sm ghost" data-prefill="esc">${icon('copy')} One row per escalation condition in 02</button>`;
  return '';
}

// Live arithmetic shown under a table row, so the form does the statistics.
function computed(artId, fid, row, a) {
  if (!row) return '';
  const tol = toleranceOf(a);
  if (artId === '09' && fid === 'rounds') {
    const n = +row.n || 0, x = +row.agent_wrong || 0;
    if (!n) return '';
    const [lo, hi] = wilson(x, n);
    const vd = verdict(x, n, tol);
    let w = '';
    const wn = +row.worst_stratum_n || 0, wx = +row.worst_stratum_agent_wrong || 0;
    if (wn) { const [wl, wh] = wilson(wx, wn); const wv = verdict(wx, wn, tol); w = ` · worst stratum ${pct(wx / wn)} (${pct(wl)}–${pct(wh)}) <span class="badge ${wv.tone}">${wv.label}</span>`; }
    return `Agent-wrong rate <b>${pct(x / n)}</b> (95% ${pct(lo)}–${pct(hi)}) <span class="badge ${vd.tone}">${vd.label}</span>${tol === null ? ' <span class="xs">Set the tolerance in 02 to get a verdict.</span>' : ` vs tolerance ${pct(tol)}`}${w}`;
  }
  if (artId === '10' && fid === 'bands') {
    const n = +row.sampled || 0, x = +row.disagreements || 0;
    if (!n) return row.band ? 'Not sampled: a band with no sample must never be auto-closed.' : '';
    const [lo, hi] = wilson(x, n);
    const vd = verdict(x, n, tol);
    const lbl = vd.key === 'within' ? 'Calibrated' : vd.key === 'breach' ? 'Not calibrated · escalate' : vd.key === 'inconclusive' ? 'Inconclusive · keep full rate' : 'No tolerance in 02';
    return `Observed <b>${pct(x / n)}</b> (95% ${pct(lo)}–${pct(hi)}) <span class="badge ${vd.tone}">${lbl}</span>`;
  }
  if (artId === '12' && fid === 'drills') {
    const lim = parseFloat(a.forms['12']?.values?.max_time_to_halt_min);
    const m = parseFloat(row.minutes_to_halt);
    if (isNaN(m) || isNaN(lim)) return '';
    return m <= lim ? `<span class="badge ok">Inside the ${lim} min limit</span>` : `<span class="badge bad">Over the ${lim} min limit</span>`;
  }
  return '';
}

function fieldBlock(f, v, locked, req, artId, a) {
  const needed = req === 'light' ? f.core : f.required;
  const hint = artId === '02' && f.id === 'tier' && a.forms['00']?.values?.tier ? `<span class="badge line">00 says ${esc(a.forms['00'].values.tier)}</span>` : '';
  return `<div class="field" id="f-${f.id}" data-field="${f.id}">
    <span class="lbl" id="lb-${f.id}"><label for="in-${f.id}">${esc(f.label)}</label>${needed ? '<span class="req-mark" title="Needed to submit">*</span>' : ''}${f.core && req !== 'light' ? '<span class="core-mark" title="Still needed on a light template">core</span>' : ''}${hint}</span>
    ${f.help ? `<span class="help">${linkIds(f.help)}</span>` : ''}
    ${control(f, v, locked, artId, a)}
  </div>`;
}

export function render(agentId, artId) {
  const a = getAgent(agentId);
  const A = D.art[artId];
  const F = D.forms[artId];
  if (!a || !A || !F) return null;
  focus.agent = a.id;
  const s = S();
  const role = s.role;
  const f = a.forms[artId] || { values: {}, status: 'not_started', history: [], comments: [], acks: [] };
  const st = f.status || 'not_started';
  const req = requirement(artId, a);
  const letters = role ? raciOf(artId, role) : [];
  const isR = letters.includes('R'), isA = letters.includes('A'), isC = letters.includes('C'), isI = letters.includes('I');
  let override = false;
  const editable = () => (isR || override) && (st === 'not_started' || st === 'draft' || st === 'returned');
  const locked = !editable();
  const cycle = f.cycle || 1;
  const comp = completeness(a, artId);
  const consulted = A.raci.consulted || [];
  const heard = new Set((f.comments || []).filter((c) => c.cycle === cycle).map((c) => c.role));

  let banner;
  if (!role) banner = rolePrompt('draft, review or approve this form');
  else if (isR && st === 'approved') banner = `<div class="callout ok">${icon('checkCircle')}<div class="grow"><b>Approved.</b> The content is locked. If it needs to change, for example after a material change, reopen it as a new revision. It will need approval again.</div></div>`;
  else if (isR && st === 'submitted') banner = `<div class="callout info">${icon('clock')}<div class="grow"><b>In review with ${esc(A.raci.accountable)}.</b> Consulted roles can now record their view. You can withdraw it to make changes.</div></div>`;
  else if (isR) banner = `<div class="callout info">${icon('pen')}<div class="grow"><b>You're responsible for this artefact.</b> Fill in the fields${req === 'light' ? ' marked <b>core</b> (light template at ' + tierOf(a) + ')' : ' marked *'} and submit it for review. Your work saves automatically in this browser.</div></div>`;
  else if (isA && st === 'submitted') banner = `<div class="callout outcome">${icon('shield')}<div class="grow"><b>Waiting for your decision.</b> Read the content, check what the consulted roles said, and confirm the done-when test before you approve. If it isn't there yet, return it with a reason.</div></div>`;
  else if (isA) banner = `<div class="callout info">${icon('shield')}<div class="grow"><b>You're accountable for this artefact.</b> You approve it once ${A.raci.responsible.join(' and ')} submit${A.raci.responsible.length > 1 ? '' : 's'} it. Current status: ${STATUS[st]}.</div></div>`;
  else if (isC) banner = `<div class="callout info">${icon('message')}<div class="grow"><b>You must be consulted before approval.</b> ${st === 'submitted' ? (heard.has(role) ? 'You have recorded your view for this revision.' : 'Record your view below.') : `You can comment once it is submitted. Current status: ${STATUS[st]}.`}</div></div>`;
  else if (isI) banner = `<div class="callout info">${icon('info')}<div class="grow"><b>You're informed.</b> ${st === 'approved' ? 'Acknowledge once you have read it.' : `You'll receive it once approved. Current status: ${STATUS[st]}.`}</div></div>`;
  else banner = `<div class="callout">${icon('lock')}<div class="grow"><b>${esc(roleName(role))} has no RACI part in this artefact.</b> It's drafted by ${A.raci.responsible.map(roleName).join(' and ')}. ${st === 'not_started' || st === 'draft' || st === 'returned' ? '<button class="btn sm" id="override">Edit anyway</button> <span class="xs faint">The edit is recorded in the history.</span>' : ''}</div></div>`;

  const actions = () => {
    const b = [];
    if (editable()) {
      b.push(`<button class="btn primary" id="submit" ${comp.pct < 1 ? 'aria-disabled="true"' : ''}>${icon('arrowRight')} Submit for review</button>`);
    }
    if (isR && st === 'submitted') b.push(`<button class="btn" id="withdraw">Withdraw to draft</button>`);
    if (isR && st === 'approved') b.push(`<button class="btn" id="reopen">${icon('refresh')} Reopen as new revision</button>`);
    if (isA && st === 'submitted') b.push(`<button class="btn ok" id="approve">${icon('check')} Approve</button><button class="btn bad" id="return">Return</button>`);
    if (isC && st === 'submitted') b.push(`<button class="btn" id="comment">${icon('message')} ${heard.has(role) ? 'Add another view' : 'Record your view'}</button>`);
    if (isI && st === 'approved' && !(f.acks || []).some((x) => x.role === role && x.cycle === cycle)) b.push(`<button class="btn" id="ack">${icon('check')} Acknowledge</button>`);
    return b.join('');
  };

  const sections = F.sections.map((sec, i) => `<div class="fsec"><h3><span class="n">${String(i + 1).padStart(2, '0')}</span>${esc(sec.title)}</h3>${sec.fields.map((fl) => fieldBlock(fl, f.values?.[fl.id], locked, req, artId, a)).join('')}</div>`).join('');

  const html = `
  <header class="page-head">
    <div class="row g8">${aidBox(artId)}<div class="stack"><span class="eyebrow accent">${esc(agentName(a))} · ${esc(A.phase)}</span><span class="row g8 mt4">${reqBadge(req)} <span id="st-pill">${statusPill(st)}</span>${cycle > 1 ? `<span class="badge line">Revision ${cycle}</span>` : ''}${role && letters.length ? `<span class="row g4">${myRaci(artId, role)}</span>` : ''}</span></div></div>
    <div class="row g16" style="justify-content:space-between;align-items:flex-end"><h1 class="grow">${esc(A.name)}</h1><a class="btn sm ghost" href="#/artefacts/${artId}">${icon('book')} Full specification</a></div>
  </header>
  ${!isNeeded(req) ? `<div class="callout" style="margin-bottom:16px">${icon('info')}<div>${req === 'recommended' ? `<b>Recommended at ${tierOf(a)}</b>, not mandatory. Worth doing if you expect to move up a tier.` : `<b>Not required at ${tierOf(a)}</b>${A.tiers[tierOf(a)] === 'if_vendor' ? ' because no third-party components are recorded in 00' : ''}. You can still record it.`}</div></div>` : ''}
  ${f.flag ? `<div class="callout bad" style="margin-bottom:16px">${icon('refresh')}<div><b>Needs updating:</b> ${esc(f.flag.reason)}</div></div>` : ''}
  <div style="margin-bottom:16px">${banner}</div>

  <div class="form-layout">
    <div>
      <div class="callout" style="margin-bottom:16px">${icon('compass')}<div>${linkIds(F.intro)}</div></div>
      <form class="card" style="padding:0" id="art-form" novalidate autocomplete="off">${sections}</form>
      <div class="savebar no-print">
        <div class="grow stack g4" style="min-width:180px"><span class="small"><b id="c-done">${comp.done}</b> of ${comp.need} ${req === 'light' ? 'core' : 'required'} fields</span><div class="progress" style="max-width:260px"><span id="c-bar" style="width:${Math.round(comp.pct * 100)}%"></span></div></div>
        <span class="xs faint" id="saved">${locked ? (editable() ? '' : 'Read-only for your role') : 'Saved in this browser'}</span>
        ${actions()}
      </div>
    </div>

    <aside class="form-aside">
      <div class="card">
        <h3>Done when</h3>
        <p class="small mt8">${linkIds(A.done_when)}</p>
        <div id="missing" class="mt12">${missingList(comp)}</div>
      </div>
      <div class="card">
        <h3>Who does what</h3>
        <div class="mt12">${raciInline(artId)}</div>
        ${consulted.length ? `<div class="mt16"><div class="eyebrow">Consultation this revision</div><div class="stack g6 mt8">${consulted.map((r) => `<div class="row g8 small">${av(r)}<span class="grow">${esc(roleName(r))}</span>${heard.has(r) ? `<span class="badge ${(f.comments || []).filter((c) => c.role === r && c.cycle === cycle).some((c) => c.verdict === 'concern') ? 'warn' : 'ok'}">${(f.comments || []).filter((c) => c.role === r && c.cycle === cycle).some((c) => c.verdict === 'concern') ? 'Concern' : 'No objection'}</span>` : '<span class="badge line">Awaiting</span>'}</div>`).join('')}</div></div>` : ''}
      </div>
      ${(f.comments || []).length ? `<div class="card"><h3>Views recorded</h3><div class="stack g8 mt12">${f.comments.slice().reverse().map((c) => `<div class="comment"><div class="meta">${av(c.role)} <b>${esc(c.role)}</b> ${esc(c.by || '')} · rev ${c.cycle} · ${fmtDateTime(c.at)}</div><p>${esc(c.text)}</p></div>`).join('')}</div></div>` : ''}
      ${F.tips?.length ? `<div class="card"><h3>${icon('spark')} Tips</h3><ul class="small muted mt8">${F.tips.map((t) => `<li>${linkIds(t)}</li>`).join('')}</ul></div>` : ''}
      <div class="card"><h3>History</h3>${(f.history || []).length ? `<ul class="hist mt8">${f.history.slice().reverse().slice(0, 12).map((h) => `<li><b>${esc(h.action)}</b> · ${esc(h.role || '')} ${esc(h.by || '')}<br><span class="xs">${fmtDateTime(h.at)}</span>${h.note ? `<br>${esc(h.note)}` : ''}</li>`).join('')}</ul>` : '<p class="muted small mt8">Nothing yet.</p>'}</div>
    </aside>
  </div>`;

  return {
    title: `${artId} · ${A.name} · ${agentName(a)}`,
    crumbs: [['My work', '#/work'], [agentName(a), `#/agents/${a.id}`], [`${artId} · ${A.name}`]],
    html,
    mount(root) { mountForm(root, { a, artId, A, F, role, st, req, cycle, consulted, heard, isR, setOverride: () => { override = true; } }); },
  };
}

function missingList(comp) {
  if (!comp.missing.length) return `<span class="badge ok">${icon('check')} Everything needed is filled in</span>`;
  return `<div class="eyebrow">Still needed</div><ul class="small mt8">${comp.missing.slice(0, 8).map((m) => `<li><a href="#" data-jump="${m.id}">${esc(m.label)}</a></li>`).join('')}${comp.missing.length > 8 ? `<li class="faint">and ${comp.missing.length - 8} more</li>` : ''}</ul>`;
}

function mountForm(root, ctx) {
  const { a, artId, A, role, cycle, consulted, heard } = ctx;
  const formEl = root.querySelector('#art-form');
  const fields = Object.fromEntries(formFields(artId).map((x) => [x.id, x]));
  const person = () => S().person || '';
  const log = (f, action, note) => f.history.push({ at: Date.now(), role, by: person(), action, note: note || '' });

  const refreshMeta = () => {
    const c = completeness(a, artId);
    root.querySelector('#c-done').textContent = c.done;
    root.querySelector('#c-bar').style.width = `${Math.round(c.pct * 100)}%`;
    root.querySelector('#missing').innerHTML = missingList(c);
    const sub = root.querySelector('#submit');
    if (sub) sub.setAttribute('aria-disabled', String(c.pct < 1));
  };

  // Any edit moves the form to Draft and saves silently (no full re-render while typing).
  const setValue = (fid, mutate, { rerender = false } = {}) => {
    update(() => {
      const f = ensureForm(a, artId);
      mutate(f.values);
      if (f.status === 'not_started') { f.status = 'draft'; log(f, 'Started'); root.querySelector('#st-pill').innerHTML = statusPill('draft'); }
      if (!ctx.isR && !f.history.some((h) => h.action === 'Edited outside RACI' && h.role === role && h.at > Date.now() - 3600e3)) log(f, 'Edited outside RACI', `${role} is not R on this artefact`);
      a.updated = Date.now();
    }, { silent: !rerender });
    const saved = root.querySelector('#saved');
    if (saved) { saved.textContent = 'Saved'; clearTimeout(saved._t); saved._t = setTimeout(() => { saved.textContent = 'Saved in this browser'; }, 1200); }
    if (!rerender) refreshMeta();
  };

  const readInput = (el) => {
    const fid = el.dataset.f;
    const fl = fields[fid];
    if (!fl) return;
    if (el.dataset.row !== undefined) {
      const i = +el.dataset.row, col = el.dataset.col;
      setValue(fid, (vals) => { vals[fid] = Array.isArray(vals[fid]) ? vals[fid] : []; vals[fid][i] = { ...(vals[fid][i] || {}), [col]: el.value }; });
      const out = root.querySelector(`[data-computed="${fid}-${i}"]`);
      if (out) out.innerHTML = computed(artId, fid, a.forms[artId].values[fid][i], a);
      return;
    }
    if (el.dataset.i !== undefined) {
      const i = +el.dataset.i;
      setValue(fid, (vals) => { vals[fid] = Array.isArray(vals[fid]) ? vals[fid] : []; vals[fid][i] = el.value; });
      return;
    }
    if (el.dataset.multi !== undefined) {
      const vals2 = [...formEl.querySelectorAll(`[data-f="${fid}"][data-multi]:checked`)].map((x) => x.value);
      setValue(fid, (vals) => { vals[fid] = vals2; });
      return;
    }
    if (el.type === 'radio' && !el.checked) return;
    // Facts in 00 change which artefacts are required, so redraw the page.
    const structural = artId === '00' && ['tier', 'uses_vendor', 'confidence_routing'].includes(fid);
    setValue(fid, (vals) => { vals[fid] = el.value; }, { rerender: structural });
    if (structural) toast('Requirements updated for the new facts in 00');
  };
  formEl.addEventListener('input', (e) => { if (e.target.dataset.f && e.target.type !== 'radio' && e.target.type !== 'checkbox' && e.target.tagName !== 'SELECT') readInput(e.target); });
  formEl.addEventListener('change', (e) => { if (e.target.dataset.f && (e.target.type === 'radio' || e.target.type === 'checkbox' || e.target.tagName === 'SELECT')) readInput(e.target); });

  // Structural edits (rows, list items) re-render just that field.
  const redrawField = (fid) => {
    const fl = fields[fid];
    const box = root.querySelector(`#f-${fid}`);
    box.outerHTML = fieldBlock(fl, a.forms[artId].values[fid], false, ctx.req, artId, a);
  };
  formEl.addEventListener('click', (e) => {
    const t = e.target.closest('button');
    if (!t) return;
    if (t.dataset.addRow) { const fid = t.dataset.addRow; setValue(fid, (v) => { v[fid] = [...(Array.isArray(v[fid]) ? v[fid] : []), {}]; }); redrawField(fid); root.querySelector(`#f-${fid} .trow:last-of-type .input`)?.focus(); }
    else if (t.dataset.delRow) { const fid = t.dataset.delRow, i = +t.dataset.i; setValue(fid, (v) => { v[fid] = (v[fid] || []).filter((_, j) => j !== i); }); redrawField(fid); }
    else if (t.dataset.addItem) { const fid = t.dataset.addItem; setValue(fid, (v) => { v[fid] = [...(Array.isArray(v[fid]) && v[fid].length ? v[fid] : ['']), '']; }); redrawField(fid); root.querySelector(`#f-${fid} .list-row:last-of-type .input`)?.focus(); }
    else if (t.dataset.delItem) { const fid = t.dataset.delItem, i = +t.dataset.i; setValue(fid, (v) => { v[fid] = (v[fid] || []).filter((_, j) => j !== i); }); redrawField(fid); }
    else if (t.dataset.example) { const fid = t.dataset.example; setValue(fid, (v) => { v[fid] = A.example; }); redrawField(fid); toast('Example inserted. Replace it with your own content.'); }
    else if (t.dataset.prefill === 'esc') {
      const conds = (a.forms['02'].values.must_escalate || []).filter((x) => String(x).trim());
      setValue('escalation_tests', (v) => {
        const have = new Set((v.escalation_tests || []).map((r) => r.condition));
        v.escalation_tests = [...(v.escalation_tests || []), ...conds.filter((c) => !have.has(c)).map((c) => ({ condition: c }))];
      });
      redrawField('escalation_tests');
    }
  });

  root.querySelector('#missing').addEventListener('click', (e) => {
    const j = e.target.closest('[data-jump]'); if (!j) return;
    e.preventDefault();
    const box = root.querySelector(`#f-${j.dataset.jump}`);
    box?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    box?.querySelector('input,select,textarea,button')?.focus({ preventScroll: true });
  });

  root.querySelector('#override')?.addEventListener('click', () => { ctx.setOverride(); root.querySelectorAll('#art-form [disabled]').forEach((x) => { x.disabled = false; }); toast('Editing enabled. Edits are recorded as outside RACI.'); });

  const askName = () => (S().person ? '' : `<label class="field"><span class="lbl">Your name for the record</span><input class="input" name="person" required placeholder="e.g. A. Rahman"></label>`);
  const saveName = (d) => { if (d?.person) update((st) => { st.person = d.person.trim(); }, { silent: true }); };

  root.querySelector('#submit')?.addEventListener('click', () => {
    const c = completeness(a, artId);
    if (c.pct < 1) {
      toast(`${c.missing.length} needed field${c.missing.length > 1 ? 's are' : ' is'} still empty`);
      const first = root.querySelector(`#f-${c.missing[0].id}`);
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      c.missing.forEach((m) => root.querySelector(`#f-${m.id}`)?.querySelectorAll('.input').forEach((x) => x.classList.add('invalid')));
      return;
    }
    update(() => { const f = ensureForm(a, artId); f.status = 'submitted'; f.cycle = f.cycle || 1; f.flag = null; log(f, 'Submitted for review'); a.updated = Date.now(); });
    toast(`Submitted. ${A.raci.accountable} approves${consulted.length ? `, after consulting ${consulted.join(', ')}` : ''}.`);
  });
  root.querySelector('#withdraw')?.addEventListener('click', () => update(() => { const f = ensureForm(a, artId); f.status = 'draft'; log(f, 'Withdrawn to draft'); }));
  root.querySelector('#reopen')?.addEventListener('click', async () => {
    const d = await dialog({ title: 'Reopen as a new revision?', body: `<p class="muted">The approval stays in the history. The artefact goes back to draft as revision ${cycle + 1} and needs consultation and approval again. Any gate that relied on it may need to be re-held.</p><label class="field"><span class="lbl">Reason</span><input class="input" name="reason" placeholder="e.g. G5 material change: model 4.1 → 4.2"></label>`, confirm: 'Reopen' });
    if (d) update(() => { const f = ensureForm(a, artId); f.status = 'draft'; f.cycle = cycle + 1; f.approval = null; log(f, `Reopened as revision ${cycle + 1}`, d.reason); });
  });
  root.querySelector('#approve')?.addEventListener('click', async () => {
    const missingC = consulted.filter((r) => !heard.has(r));
    const d = await dialog({
      title: `Approve ${artId} · ${A.name}`,
      body: `<div class="callout ok">${icon('checkCircle')}<div class="small"><b>Done when:</b> ${esc(A.done_when)}</div></div>
        <label class="check"><input type="checkbox" name="done" required><span>I have checked the done-when test and it holds.</span></label>
        ${missingC.length ? `<div class="callout warn">${icon('alert')}<div class="small">${missingC.join(', ')} ${missingC.length > 1 ? 'have' : 'has'} not recorded a view on this revision. C roles must be consulted before approval.</div></div><label class="check"><input type="checkbox" name="consulted" required><span>They were consulted outside GovKit, and I have recorded how in the note.</span></label>` : ''}
        <label class="field"><span class="lbl">Note (optional)</span><textarea class="input" name="note" style="min-height:70px"></textarea></label>${askName()}`,
      confirm: 'Approve', tone: 'ok',
    });
    if (!d) return;
    if (!d.done || (missingC.length && !d.consulted)) { toast('Approval needs the done-when confirmation' + (missingC.length ? ' and the consultation confirmation' : '')); return; }
    saveName(d);
    update(() => { const f = ensureForm(a, artId); f.status = 'approved'; f.approval = { role, by: person(), at: Date.now(), note: d.note || '', cycle }; log(f, 'Approved', d.note); a.updated = Date.now(); });
    toast('Approved and recorded');
  });
  root.querySelector('#return')?.addEventListener('click', async () => {
    const d = await dialog({ title: 'Return for rework', body: `<label class="field"><span class="lbl">What needs to change? <span class="req-mark">*</span></span><span class="help">Be specific. ${esc(A.raci.responsible.join(' and '))} will see this.</span><textarea class="input" name="reason" required></textarea></label>${askName()}`, confirm: 'Return', tone: 'bad' });
    if (!d || !d.reason?.trim()) return;
    saveName(d);
    update(() => { const f = ensureForm(a, artId); f.status = 'returned'; log(f, 'Returned', d.reason); });
    toast('Returned with your reason');
  });
  root.querySelector('#comment')?.addEventListener('click', async () => {
    const d = await dialog({
      title: `Your view as ${roleName(role)}`,
      body: `<div class="opts" role="radiogroup"><label class="opt"><input type="radio" name="verdict" value="ok" checked><span>No objection</span></label><label class="opt"><input type="radio" name="verdict" value="concern"><span>Concern</span></label></div>
        <label class="field"><span class="lbl">Comment <span class="req-mark">*</span></span><span class="help">What you checked, and anything the accountable role should weigh before approving.</span><textarea class="input" name="text" required></textarea></label>${askName()}`,
      confirm: 'Record view',
    });
    if (!d || !d.text?.trim()) return;
    saveName(d);
    update(() => { const f = ensureForm(a, artId); f.comments.push({ id: uid('c'), role, by: person(), at: Date.now(), text: d.text.trim(), verdict: d.verdict, cycle }); log(f, d.verdict === 'concern' ? 'Concern raised' : 'No objection', d.text.trim().slice(0, 140)); });
    toast('Your view is recorded');
  });
  root.querySelector('#ack')?.addEventListener('click', () => update(() => { const f = ensureForm(a, artId); f.acks.push({ role, by: person(), at: Date.now(), cycle }); log(f, 'Acknowledged'); }));
}
