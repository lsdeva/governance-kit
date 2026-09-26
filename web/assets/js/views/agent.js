import { D, TIER_INFO, ROLE_IDS, raciOf, formFields, MATURITY } from '../data.js';
import { S, agent as getAgent, update, removeAgent } from '../store.js';
import { esc, icon, toast, dialog, download, fmtDate, fmtDateTime, pct, slug } from '../ui.js';
import {
  STAGES, stageOf, stageArtefacts, requirement, isNeeded, statusOf, completeness, evalGate, gateStatus,
  nextActions, tierOf, vendorOf, routingOf, agentName, agentCode, progress, analyseRounds, formOf, STATUS,
} from '../logic.js';
import { aidBox, reqBadge, statusPill, myRaci, rolePrompt, av, roleName } from '../components.js';
import { go } from '../app.js';
import { recommended, evalService } from '../services.js';

export const focus = { agent: null };

const notFound = () => ({ title: 'Agent not found', crumbs: [['My work', '#/work'], ['Not found']], html: `<div class="empty">${icon('bot')}<h3>This agent isn't in this browser</h3><p>Workspaces are stored per browser. If it was shared with you, import the export file in <a href="#/work">My work</a>.</p></div>` });

function gateChip(a, gid) {
  const s = gateStatus(a, gid);
  const cls = s === 'passed' ? 'ok' : s === 'failed' ? 'bad' : 'line';
  return `<span class="badge ${cls}">${s === 'passed' ? icon('check') : ''}${gid} ${s === 'passed' ? 'passed' : s === 'failed' ? 'failed' : 'open'}</span>`;
}

function artRow(a, id, note, role) {
  const req = requirement(id, a);
  const s = statusOf(a, id);
  const c = completeness(a, id);
  const f = formOf(a, id);
  const A = D.art[id];
  const muted = !isNeeded(req);
  return `<a class="arow" href="#/agents/${a.id}/a/${id}" style="${muted ? 'opacity:.72' : ''}">
    ${aidBox(id)}
    <span class="t"><b>${esc(A.name)}</b><small>${note ? esc(note) + ' · ' : ''}R ${A.raci.responsible.join(', ')} · A ${A.raci.accountable}${f.flag ? ` · <span style="color:var(--bad)">${esc(f.flag.reason)}</span>` : ''}</small>
      ${isNeeded(req) && s !== 'approved' && s !== 'not_started' ? `<span class="progress mt8" style="max-width:220px;display:block"><span style="width:${Math.round(c.pct * 100)}%"></span></span>` : ''}</span>
    <span class="r">${myRaci(id, role)}${reqBadge(req)}${statusPill(s)}</span>
  </a>`;
}

function stagePanel(a, i, role) {
  const st = STAGES[i];
  const arts = stageArtefacts(st);
  const e = evalGate(a, st.gate);
  const gs = e.status;
  const outstanding = e.arts.filter((x) => !x.met).length + e.checks.filter((x) => !x.met).length;
  let extra = '';
  if (i === 4) {
    const r = analyseRounds(a);
    const last = r.rounds[r.rounds.length - 1];
    const changes = a.changes || [];
    extra = `
    <div class="grid cols-2 mt16">
      <div class="card">
        <div class="row g8" style="justify-content:space-between"><h3>${icon('target')} Outcome evidence</h3><a class="btn sm ghost" href="#/agents/${a.id}/a/09">Open 09</a></div>
        ${last ? `<div class="row g16 mt12"><div><div class="eyebrow">Latest round · ${esc(last.period || '')}</div><div class="big-num mt4">${pct(last.p)}</div><div class="xs faint mono">${pct(last.lo)}–${pct(last.hi)} · n=${last.n.toLocaleString()}</div></div><span class="verdict ${last.vd.tone}">${esc(last.vd.label)}</span></div>
          ${last.worst ? `<p class="small muted mt12">Worst stratum <b>${esc(last.worst.name || '')}</b>: ${pct(last.worst.p)} (${pct(last.worst.ci[0])}–${pct(last.worst.ci[1])})</p>` : ''}
          <p class="small mt12">${r.promotion.ok ? `<span class="badge ok">${icon('check')} Round bar for G4 met</span>` : `<span class="badge line">${r.streak} of 4 rounds · ${r.streakN.toLocaleString()} of 1,000 cases</span>`} <span class="faint xs">toward G4</span></p>`
          : `<p class="muted small mt12">No sampling rounds recorded yet. The first three rounds run at the full rate after go-live. ${r.tol === null ? 'Set the tolerance in 02 first.' : `Tolerance in 02: ${pct(r.tol)}.`}</p>`}
      </div>
      <div class="card">
        <div class="row g8" style="justify-content:space-between"><h3>${icon('refresh')} Changes (G5)</h3><a class="btn sm" href="#/tools/change">${icon('plus')} Check a change</a></div>
        ${changes.length ? `<div class="stack g8 mt12">${changes.slice(-4).reverse().map((c) => `<div class="small" style="border-top:1px solid var(--rule);padding-top:8px"><b>${c.material ? 'Material change' : 'Non-material change'}</b> · ${fmtDate(c.at)}${c.open ? ' <span class="badge warn">open</span>' : ''}<br><span class="muted">${esc(c.summary)}</span>${c.due ? `<br><span class="xs faint">Revalidation due by ${esc(c.due)}</span>` : ''}</div>`).join('')}</div>`
          : '<p class="muted small mt12">No changes recorded. Every model version, prompt, tool manifest, rules or list version change, or population shift, goes through the change check.</p>'}
      </div>
    </div>`;
  }
  return `
  <div class="card mt16" style="padding:0">
    <div class="fsec">
      <div class="row g12" style="justify-content:space-between">
        <div><div class="eyebrow">Stage ${i + 1} · ${st.phases.map((p) => D.phases.find((x) => x.id === p).name).join(' + ')}</div><h3 class="mt4">${esc(st.name)}</h3><p class="muted small mt4">${esc(st.blurb)} Ceremonies: <i>${st.phases.map((p) => esc(D.phases.find((x) => x.id === p).ceremony)).join('; ')}</i>.</p></div>
      </div>
      <div class="alist mt16">${arts.map((x) => artRow(a, x.id, x.note, role)).join('')}</div>
    </div>
    <div class="fsec" style="background:var(--surface-2);border-radius:0 0 var(--r-lg) var(--r-lg)">
      <a class="arow" href="#/agents/${a.id}/g/${st.gate}" style="background:var(--surface)">
        <span class="aid-box g">${st.gate}</span>
        <span class="t"><b>${esc(D.gate[st.gate].name)}</b><small>${esc(D.gate[st.gate].ceremony)} · approver ${e.approvers.join(' + ')}${gs === 'open' ? (e.ready ? ' · ready for decision' : ` · ${outstanding} item${outstanding === 1 ? '' : 's'} outstanding`) : ''}</small></span>
        <span class="r">${gateChip(a, st.gate)}</span>
      </a>
      ${i === 4 && (a.changes || []).length ? `<a class="arow mt8" href="#/agents/${a.id}/g/G5" style="background:var(--surface)"><span class="aid-box g">G5</span><span class="t"><b>${esc(D.gate.G5.name)}</b><small>Per change · approver ${evalGate(a, 'G5').approvers.join(' + ')}</small></span><span class="r">${gateChip(a, 'G5')}</span></a>` : ''}
    </div>
  </div>${extra}`;
}

function recBanner(a) {
  const s = recommended(a);
  if (!s) return '';
  const e = evalService(s, a);
  const next = e.next;
  return `<div class="card mt16 row g16" style="border-left:4px solid ${s.color};padding:16px 20px">
    <span class="aid-box" style="background:color-mix(in srgb,${s.color} 14%,transparent);color:${s.color}">${icon(s.icon)}</span>
    <div class="grow"><div class="xs faint">Recommended service · ${e.done} of ${e.total} steps done</div><b style="font-size:16px">${esc(s.name)}</b>${next ? `<div class="small muted">Next: ${esc(next.title)}</div>` : ''}</div>
    <a class="btn primary" href="#/services/${s.id}">Continue ${icon('arrowRight')}</a></div>`;
}

const LANES = [['not_started', 'Not started'], ['progress', 'In progress'], ['submitted', 'In review'], ['approved', 'Approved']];
function board(a, role) {
  const ids = D.order.filter((id) => { const r = requirement(id, a); return isNeeded(r) || statusOf(a, id) !== 'not_started'; });
  const lane = (id) => { const s = statusOf(a, id); return s === 'draft' || s === 'returned' ? 'progress' : s; };
  return `<div class="board">${LANES.map(([k, l]) => {
    const items = ids.filter((id) => lane(id) === k);
    return `<div class="lane"><h4>${statusPill(k === 'progress' ? 'draft' : k).replace(/>[^<]*</, `>${l}<`)}<span class="badge line">${items.length}</span></h4>
      ${items.map((id) => { const A = D.art[id]; const c = completeness(a, id); const f = formOf(a, id); return `<a class="kcard" href="#/agents/${a.id}/a/${id}"><span class="aid ${A.outcome_evidence ? 'o' : ''}">${id}</span> ${f.status === 'returned' ? '<span class="badge bad">Returned</span>' : ''}${f.flag ? '<span class="badge bad">Flagged</span>' : ''}<b>${esc(A.name)}</b>
        <div class="foot"><span class="avs">${A.raci.responsible.map((r) => av(r)).join('')}</span>${k === 'progress' ? `<span class="xs faint">${c.done}/${c.need}</span>` : ''}${myRaci(id, role) ? `<span class="row g4">${myRaci(id, role)}</span>` : ''}</div></a>`; }).join('') || '<p class="xs faint" style="padding:6px">Nothing here.</p>'}
    </div>`;
  }).join('')}</div>`;
}

export function render(id) {
  const a = getAgent(id);
  if (!a) return notFound();
  focus.agent = a.id;
  const s = S();
  const role = s.role;
  const st = stageOf(a);
  let tab = st.done ? 5 : st.idx;
  const acts = role ? nextActions(a, role).filter((x) => x.kind !== 'optional') : [];
  const others = ROLE_IDS.filter((r) => r !== role).map((r) => [r, nextActions(a, r).filter((x) => x.kind !== 'read' && x.kind !== 'optional').length]).filter(([, n]) => n);
  const p = progress(a);
  const v00 = a.forms['00']?.values || {};
  const t = tierOf(a);

  return {
    title: agentName(a),
    crumbs: [['My work', '#/work'], [agentName(a)]],
    html: `
    <header class="page-head">
      <div class="row g8"><span class="badge ink">${t} · ${esc(TIER_INFO[t].loop)}</span><span class="badge line">${esc(v00.status || 'proposed')}</span>${vendorOf(a) ? '<span class="badge process">Third-party components</span>' : ''}${routingOf(a) ? '<span class="badge outcome">Confidence routing</span>' : ''}${a.demo ? '<span class="badge warn">Illustrative example</span>' : ''}</div>
      <div class="row g16" style="justify-content:space-between;align-items:flex-end">
        <div class="grow"><h1>${esc(agentName(a))}</h1><div class="mono small faint mt4">${esc(agentCode(a))}</div></div>
        <div class="row g8 no-print">
          <a class="btn" href="#/agents/${a.id}/report">${icon('printer')} Evidence pack</a>
          <button class="btn ghost" id="more" aria-label="More actions">${icon('download')} Export</button>
          <button class="btn ghost" id="del" aria-label="Delete agent" title="Delete agent">${icon('trash')}</button>
        </div>
      </div>
    </header>

    <div class="card">
      <div class="journey">${STAGES.map((s2, i) => {
        const done = gateStatus(a, s2.gate) === 'passed' || (i === 4 && st.idx === 5) || st.done;
        const cur = !st.done && i === st.idx;
        return `<div class="jstep ${done ? 'done' : ''} ${cur ? 'cur' : ''}"><div class="dotline"><span class="d">${done ? '✓' : i + 1}</span><span class="ln"></span></div><div><b>${esc(s2.name)}</b><small>${s2.gate} · ${esc(D.gate[s2.gate].name)}</small></div></div>`;
      }).join('')}</div>
    </div>

    ${recBanner(a)}
    <div class="form-layout mt24">
      <div>
        <div class="card">
          <div class="row g8" style="justify-content:space-between"><h3>${icon('inbox')} ${role ? `Your next steps as ${esc(role)}` : 'Next steps'}</h3>${role ? `<span class="xs faint">${acts.length} item${acts.length === 1 ? '' : 's'}</span>` : ''}</div>
          ${!role ? `<div class="mt12">${rolePrompt('see what this agent needs from you')}</div>`
            : acts.length ? `<div class="stack g8 mt12">${acts.slice(0, 6).map((x) => `<a class="q-item" href="${x.href}"><span class="verb ${x.verb}">${esc(x.label)}</span><span class="grow"><b>${esc(x.title)}</b><small>${esc(x.why || '')}</small></span>${icon('arrowRight')}</a>`).join('')}${acts.length > 6 ? `<a class="small" href="#/work">See all ${acts.length}</a>` : ''}</div>`
            : `<p class="muted small mt12">Nothing for ${esc(roleName(role))} at this stage.${others.length ? ' Work is waiting with the roles below.' : ''}</p>`}
          ${others.length ? `<div class="mt16" style="border-top:1px solid var(--rule);padding-top:12px"><div class="eyebrow">Waiting with other roles</div><div class="row g8 mt8">${others.map(([r, n]) => `<button class="chip" data-switch="${r}" title="Act as ${esc(roleName(r))}">${r} <b>${n}</b></button>`).join('')}</div><p class="xs faint mt8">Select a role to act as it, for example to play a gate through in a workshop.</p></div>` : ''}
        </div>

        <div class="row g12 mt24" style="justify-content:space-between"><h2>Artefacts &amp; gates</h2><div class="seg" id="view-seg"><button data-v="stages" aria-pressed="true">${icon('layers')} By stage</button><button data-v="board" aria-pressed="false">${icon('grid')} Board</button></div></div>
        <div id="v-stages"><nav class="tabs mt12" role="tablist" aria-label="Lifecycle stages">${STAGES.map((s2, i) => `<button role="tab" data-tab="${i}" aria-selected="${i === tab}">${i + 1}. ${esc(s2.name)}</button>`).join('')}</nav>
        <div id="stage-panel">${stagePanel(a, tab, role)}</div></div>
        <div id="v-board" hidden class="mt16">${board(a, role)}</div>
        ${st.idx >= 4 && !a.retiring && !st.done ? `<div class="row g8 mt16"><button class="btn sm ghost" id="retire">${icon('flag')} Start retirement (stage 6)</button></div>` : ''}
      </div>

      <aside class="form-aside">
        <div class="card">
          <div class="row g12"><div class="ring lg" style="--p:${Math.round(p.pct * 100)}"><b>${Math.round(p.pct * 100)}%</b></div><div><b>${p.approved} of ${p.total}</b><p class="small muted">mandatory artefacts approved at ${t}. ${p.started - p.approved} more in progress.</p></div></div>
        </div>
        <div class="card">
          <div class="row g8" style="justify-content:space-between"><h3>Inventory facts</h3><a class="btn sm ghost" href="#/agents/${a.id}/a/00">Edit 00</a></div>
          <dl class="kv mt12">
            <dt>Tier</dt><dd>${t} · ${esc(TIER_INFO[t].name)}</dd>
            <dt>Consequence</dt><dd>${esc(v00.consequence_class || '—')}</dd>
            <dt>Reversibility</dt><dd>${esc(v00.reversibility || '—')}</dd>
            <dt>Acc. exec.</dt><dd>${esc(v00.accountable_executive || '—')}</dd>
            <dt>Owner</dt><dd>${esc(v00.agent_owner || '—')}</dd>
            <dt>Next review</dt><dd>${esc(v00.next_review || '—')}</dd>
            <dt>Sunset</dt><dd>${esc(v00.sunset_date || '—')}</dd>
          </dl>
        </div>
        <div class="card">
          <div class="row g8" style="justify-content:space-between"><h3>Maturity</h3><a class="btn sm ghost" href="#/tools/maturity">${a.maturity ? 'Reassess' : 'Assess'}</a></div>
          ${a.maturity ? `<p class="mt8"><b class="big-num" style="font-size:28px">${a.maturity.level}</b> <span class="muted">${esc(MATURITY.find((m) => m.id === a.maturity.level)?.name || '')}</span></p><p class="xs faint">Assessed ${fmtDate(a.maturity.at)}</p>` : '<p class="muted small mt8">Not assessed yet. It takes about two minutes.</p>'}
        </div>
        <div class="card">
          <h3>Decision log</h3>
          ${(a.decisions || []).length ? `<ul class="hist mt8">${a.decisions.slice(-6).reverse().map((d) => `<li><b>${esc(d.title)}</b><br>${esc(d.summary)}<br><span class="xs">${fmtDateTime(d.at)} · ${esc(d.role || '')} ${esc(d.by || '')}</span></li>`).join('')}</ul>` : '<p class="muted small mt8">Results from the decision tools appear here when you save them to this agent.</p>'}
          <a class="btn sm mt12" href="#/tools">${icon('scale')} Decision tools</a>
        </div>
      </aside>
    </div>`,
    mount(root) {
      root.querySelector('#view-seg').addEventListener('click', (e) => {
        const b = e.target.closest('[data-v]'); if (!b) return;
        root.querySelectorAll('#view-seg button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        root.querySelector('#v-stages').hidden = b.dataset.v !== 'stages';
        root.querySelector('#v-board').hidden = b.dataset.v !== 'board';
      });
      root.querySelector('.tabs').addEventListener('click', (e) => {
        const b = e.target.closest('[data-tab]'); if (!b) return;
        tab = +b.dataset.tab;
        root.querySelectorAll('[data-tab]').forEach((x) => x.setAttribute('aria-selected', String(x === b)));
        root.querySelector('#stage-panel').innerHTML = stagePanel(a, tab, role);
      });
      root.querySelectorAll('[data-switch]').forEach((b) => b.addEventListener('click', () => { update((st2) => { st2.role = b.dataset.switch; }); toast(`Now acting as ${roleName(b.dataset.switch)}`); }));
      root.querySelector('#more').addEventListener('click', () => { download(`${slug(agentName(a))}.govkit.json`, JSON.stringify({ app: 'govkit-operating-model', v: 1, agents: [a] }, null, 2), 'application/json'); toast('Agent exported'); });
      root.querySelector('#del').addEventListener('click', async () => {
        const ok = await dialog({ title: `Delete ${agentName(a)}?`, body: '<p class="muted">Every form, sign-off and decision for this agent will be removed from this browser. Export first if you want a copy.</p>', confirm: 'Delete agent', tone: 'bad' });
        if (ok) { removeAgent(a.id); toast('Agent deleted'); go('work'); }
      });
      root.querySelector('#retire')?.addEventListener('click', async () => {
        const ok = await dialog({ title: 'Start retirement?', body: '<p class="muted">This moves the agent to stage 6. The decommissioning path in 12 and gate G6 become the focus: revoke identity, disable tools at the gateway, retain records, close 00.</p>', confirm: 'Start retirement' });
        if (ok) update(() => { a.retiring = true; a.updated = Date.now(); });
      });
    },
  };
}

// ---------------------------------------------------------------- evidence pack

function valueText(field, v) {
  if (v === undefined || v === null || v === '') return '';
  if (field.type === 'table') return (v || []).filter((r) => Object.values(r || {}).some((x) => String(x ?? '').trim()));
  if (Array.isArray(v)) return v.filter((x) => String(x).trim()).join('; ');
  if (field.type === 'yesno') return v === 'yes' ? 'Yes' : v === 'no' ? 'No' : v;
  if (field.type === 'percent') return `${v}%`;
  if (field.type === 'role') return `${v} · ${roleName(v)}`;
  return String(v);
}

export function reportMarkdown(a) {
  const L = [];
  const t = tierOf(a);
  L.push(`# Evidence pack: ${agentName(a)}`, '', `Agent ID: ${agentCode(a) || '—'} · Tier: ${t} (${TIER_INFO[t].name}) · Generated ${new Date().toISOString().slice(0, 10)} by GovKit (Agentic SDLC Operating Model, draft 0.2).`, '');
  L.push('## Gates', '', '| Gate | Status | Sign-offs |', '|---|---|---|');
  for (const g of D.gates) {
    const rec = a.gates[g.id];
    const so = rec ? Object.entries(rec.signoffs || {}).map(([r, x]) => `${r} ${x.decision} (${x.by || 'unnamed'}, ${fmtDate(x.at)})`).join('; ') : '';
    L.push(`| ${g.id} ${g.name} | ${gateStatus(a, g.id)} | ${so || '—'} |`);
  }
  L.push('', '## Artefacts', '', '| ID | Artefact | Requirement | Status | Approved by |', '|---|---|---|---|---|');
  for (const id of D.order) {
    const f = formOf(a, id);
    L.push(`| ${id} | ${D.art[id].name} | ${requirement(id, a)} | ${STATUS[f.status || 'not_started']} | ${f.approval ? `${f.approval.by || f.approval.role} (${fmtDate(f.approval.at)})` : '—'} |`);
  }
  for (const id of D.order) {
    const f = formOf(a, id);
    if (!f.values || !Object.keys(f.values).length) continue;
    L.push('', `## ${id} · ${D.art[id].name}`, '', `Status: ${STATUS[f.status || 'not_started']}`, '');
    for (const fl of formFields(id)) {
      const val = valueText(fl, f.values[fl.id]);
      if (val === '' || (Array.isArray(val) && !val.length)) continue;
      if (Array.isArray(val)) {
        L.push(`**${fl.label}**`, '', `| ${fl.columns.map((c) => c.label).join(' | ')} |`, `|${fl.columns.map(() => '---').join('|')}|`);
        val.forEach((r) => L.push(`| ${fl.columns.map((c) => String(r[c.id] ?? '').replace(/\|/g, '/').replace(/\n/g, ' ')).join(' | ')} |`));
        L.push('');
      } else if (fl.type === 'code') L.push(`**${fl.label}**`, '', '```' + (fl.lang || ''), val, '```', '');
      else L.push(`**${fl.label}:** ${val.replace(/\n/g, '  \n')}`, '');
    }
    (f.comments || []).forEach((c) => L.push(`> ${c.role} (${c.by || 'unnamed'}, ${fmtDate(c.at)}) · ${c.verdict === 'concern' ? 'concern' : 'no objection'}: ${c.text}`, ''));
  }
  if ((a.decisions || []).length) {
    L.push('## Decision log', '');
    a.decisions.forEach((d) => L.push(`- ${fmtDateTime(d.at)} · ${d.title} · ${d.summary} (${d.role || ''} ${d.by || ''})`));
  }
  return L.join('\n');
}

export function renderReport(id) {
  const a = getAgent(id);
  if (!a) return notFound();
  const t = tierOf(a);
  const r = analyseRounds(a);
  const body = D.order.map((aid) => {
    const f = formOf(a, aid);
    const req = requirement(aid, a);
    const fields = formFields(aid).map((fl) => {
      const val = valueText(fl, f.values?.[fl.id]);
      if (val === '' || (Array.isArray(val) && !val.length)) return '';
      if (Array.isArray(val)) return `<dt>${esc(fl.label)}</dt><dd><div class="scroll-x"><table class="tbl"><thead><tr>${fl.columns.map((c) => `<th>${esc(c.label)}</th>`).join('')}</tr></thead><tbody>${val.map((row) => `<tr>${fl.columns.map((c) => `<td>${esc(row[c.id] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody></table></div></dd>`;
      if (fl.type === 'code') return `<dt>${esc(fl.label)}</dt><dd><pre>${esc(val)}</pre></dd>`;
      return `<dt>${esc(fl.label)}</dt><dd style="white-space:pre-wrap">${esc(val)}</dd>`;
    }).join('');
    if (!fields && !isNeeded(req)) return '';
    return `<section class="card mt16" style="break-inside:auto">
      <div class="row g12" style="justify-content:space-between">${aidBox(aid)}<h3 class="grow">${esc(D.art[aid].name)}</h3>${reqBadge(req)}${statusPill(f.status || 'not_started')}</div>
      ${f.approval ? `<p class="small muted mt8">Approved by ${esc(f.approval.by || '')} (${esc(f.approval.role)}) on ${fmtDate(f.approval.at)}. Done-when test confirmed.</p>` : ''}
      ${fields ? `<dl class="kv mt12">${fields}</dl>` : '<p class="faint small mt8">No content yet.</p>'}
      ${(f.comments || []).length ? `<div class="stack g6 mt12">${f.comments.map((c) => `<div class="comment"><div class="meta">${av(c.role)} <b>${esc(c.role)}</b> ${esc(c.by || '')} · ${fmtDate(c.at)} · ${c.verdict === 'concern' ? '<span class="badge warn">Concern</span>' : '<span class="badge ok">No objection</span>'}</div><p>${esc(c.text)}</p></div>`).join('')}</div>` : ''}
    </section>`;
  }).join('');

  return {
    title: `Evidence pack · ${agentName(a)}`,
    crumbs: [['My work', '#/work'], [agentName(a), `#/agents/${a.id}`], ['Evidence pack']],
    html: `
    <div class="row g8 no-print" style="margin-bottom:16px"><a class="btn ghost" href="#/agents/${a.id}">${icon('arrowLeft')} Back</a><span class="grow"></span><button class="btn" id="md">${icon('download')} Markdown</button><button class="btn primary" id="print">${icon('printer')} Print or save as PDF</button></div>
    <header class="page-head">
      <div class="eyebrow accent">Evidence pack · generated ${fmtDate(Date.now())}</div>
      <h1>${esc(agentName(a))}</h1>
      <p class="lede">${esc(agentCode(a))} · ${t}, ${esc(TIER_INFO[t].name)}. Everything below was recorded in GovKit. Each approval carries the approver's role, name and date. Illustrative values in the worked example are not real data.</p>
    </header>
    <div class="grid cols-2">
      <div class="card"><h3>Gates</h3><div class="stack g8 mt12">${D.gates.map((g) => { const rec = a.gates[g.id]; return `<div class="row g8" style="justify-content:space-between;border-top:1px solid var(--rule);padding-top:8px"><span><b>${g.id}</b> ${esc(g.name)}${rec ? `<br><span class="xs faint">${Object.entries(rec.signoffs || {}).map(([ro, x]) => `${ro} ${x.decision} · ${esc(x.by || '')} · ${fmtDate(x.at)}`).join('; ')}</span>` : ''}</span>${gateChip(a, g.id)}</div>`; }).join('')}</div></div>
      <div class="card"><h3>Outcome evidence</h3>${r.rounds.length ? `<div class="scroll-x mt12"><table class="tbl"><thead><tr><th>Period</th><th class="num">n</th><th class="num">Rate (95%)</th><th>Verdict</th></tr></thead><tbody>${r.rounds.map((x) => `<tr><td>${esc(x.period)}</td><td class="num">${x.n}</td><td class="num">${pct(x.p)} (${pct(x.lo)}–${pct(x.hi)})</td><td><span class="badge ${x.vd.tone}">${esc(x.vd.label)}</span></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted small mt8"><span class="badge unknown">Unknown</span> No sampling rounds yet, so nothing is known about whether the decisions were right.</p>'}</div>
    </div>
    ${body}
    ${(a.decisions || []).length ? `<section class="card mt16"><h3>Decision log</h3><ul class="hist mt8">${a.decisions.map((d) => `<li><b>${esc(d.title)}</b> · ${esc(d.summary)} <span class="xs">(${fmtDateTime(d.at)} · ${esc(d.role || '')} ${esc(d.by || '')})</span></li>`).join('')}</ul></section>` : ''}`,
    mount(root) {
      const stamp = () => update(() => { a.lastPackAt = Date.now(); }, { silent: true });
      root.querySelector('#print').addEventListener('click', () => { stamp(); window.print(); });
      root.querySelector('#md').addEventListener('click', () => { stamp(); download(`${slug(agentName(a))}-evidence-pack.md`, reportMarkdown(a), 'text/markdown'); toast('Markdown downloaded'); });
    },
  };
}
