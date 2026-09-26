// Control tower: every agent in one view — gate position, outcome evidence,
// and the things that need attention before a supervisor asks.

import { D, ROLE_IDS } from '../data.js';
import { S } from '../store.js';
import { esc, icon, pct } from '../ui.js';
import { gateStatus, evalGate, tierOf, agentName, agentCode, analyseRounds, stageOf, STAGES, queue, autoCheck } from '../logic.js';
import { recommended } from '../services.js';
import { pageHead } from '../components.js';
import { loadDemo } from '../demo.js';
import { go } from '../app.js';

const today = () => new Date().toISOString().slice(0, 10);
const addDays = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const thisMonth = () => new Date().toISOString().slice(0, 7);
const prevMonth = () => { const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().slice(0, 7); };

export function alertsFor(a) {
  const out = [];
  const v = a.forms['00']?.values || {};
  const href = (p = '') => `#/agents/${a.id}${p}`;
  const live = gateStatus(a, 'G3') === 'passed' && gateStatus(a, 'G6') !== 'passed';
  const t = tierOf(a);
  if (live && ['T3', 'T4'].includes(t) && gateStatus(a, 'G4') !== 'passed') out.push({ sev: 'high', title: `Running at ${t} without promotion evidence`, why: 'First go-live is at T2 or below. A higher tier is earned at G4.', href: href('/g/G4') });
  for (const c of (a.changes || []).filter((x) => x.open)) {
    if (c.due && c.due < today()) out.push({ sev: 'high', title: 'Revalidation overdue after a material change', why: `${c.summary} · due ${c.due}`, href: href('/g/G5') });
    else if (c.due && c.due <= addDays(7)) out.push({ sev: 'med', title: 'Revalidation due within 7 days', why: `${c.summary} · due ${c.due}`, href: href('/g/G5') });
    else out.push({ sev: 'low', title: 'Material change open', why: `${c.summary}${c.due ? ` · due ${c.due}` : ''}`, href: href('/g/G5') });
  }
  if (live) {
    const r = analyseRounds(a);
    const last = r.rounds.slice(-1)[0];
    if (last?.vd.key === 'breach') out.push({ sev: 'high', title: 'Latest sampling round breaches tolerance', why: `${pct(last.p)} (${pct(last.lo)}–${pct(last.hi)}) against ${pct(r.tol)}. Escalate the stratum and revise 02.`, href: href('/a/09') });
    else if (last?.worst && last.worst.vd.key === 'breach') out.push({ sev: 'high', title: 'Worst stratum breaches tolerance', why: `${last.worst.name || 'Worst stratum'}: ${pct(last.worst.p)}`, href: href('/a/09') });
    else if (last?.vd.key === 'inconclusive') out.push({ sev: 'low', title: 'Latest round inconclusive', why: 'The interval straddles the tolerance. Report the tile as not evidenced and increase n.', href: href('/a/09') });
    if (t !== 'T1' && (!last || (last.period < prevMonth()))) out.push({ sev: 'med', title: last ? 'No sampling round last month' : 'No outcome evidence yet', why: last ? `Last round ${last.period}. 09 runs monthly.` : 'Decisions are Unknown until the first 09 round.', href: '#/tools/sampling' });
    else if (t !== 'T1' && last && last.period < thisMonth() && new Date().getDate() > 20) out.push({ sev: 'low', title: "This month's round not recorded yet", why: `Last round ${last.period}.`, href: '#/tools/sampling' });
    const drills = (a.forms['12']?.values?.drills || []).filter((d) => d?.date).map((d) => d.date).sort();
    const lastDrill = drills.slice(-1)[0];
    if (['T3', 'T4'].includes(t) && (!lastDrill || lastDrill < addDays(-100))) out.push({ sev: 'med', title: 'Kill-switch drill overdue', why: lastDrill ? `Last drill ${lastDrill}. Quarterly for T3 and T4.` : 'No drill recorded.', href: href('/a/12') });
    else if (autoCheck(a, 'drill_within_limit')?.v === false && lastDrill) out.push({ sev: 'high', title: 'Last drill exceeded the time-to-halt limit', why: `Drill ${lastDrill}.`, href: href('/a/12') });
  }
  if (v.next_review && v.next_review < today()) out.push({ sev: 'med', title: 'Inventory review overdue', why: `Next review was ${v.next_review}.`, href: href('/a/00') });
  if (v.sunset_date && v.sunset_date < today()) out.push({ sev: 'high', title: 'Past its sunset date', why: `Sunset ${v.sunset_date}. Re-approve 02 or retire (G6).`, href: '#/services/retire' });
  else if (v.sunset_date && v.sunset_date <= addDays(60)) out.push({ sev: 'med', title: 'Sunset within 60 days', why: `Sunset ${v.sunset_date}. Re-approve or plan retirement.`, href: href('/a/02') });
  const returned = D.order.filter((id) => a.forms[id]?.status === 'returned');
  if (returned.length) out.push({ sev: 'low', title: `${returned.length} artefact${returned.length > 1 ? 's' : ''} returned for rework`, why: returned.map((id) => `${id} ${D.art[id].name}`).join(', '), href: href(`/a/${returned[0]}`) });
  const order = { high: 0, med: 1, low: 2 };
  return out.sort((x, y) => order[x.sev] - order[y.sev]).map((x) => ({ ...x, agent: a }));
}

export const alertRow = (x, withAgent = true) => `<a class="alert" href="${x.href}"><span class="sev ${x.sev}">${icon(x.sev === 'high' ? 'alert' : x.sev === 'med' ? 'clock' : 'info')}</span><span class="grow"><b>${esc(x.title)}</b><small>${withAgent ? `${esc(agentName(x.agent))} · ` : ''}${esc(x.why)}</small></span>${icon('arrowRight')}</a>`;

export function render() {
  const s = S();
  const agents = s.agents;
  if (!agents.length) {
    return {
      title: 'Control tower', crumbs: [['Home', '#/'], ['Control tower']],
      html: `${pageHead({ eyebrow: `${icon('gauge')} Control tower`, title: 'Every agent, one view', lede: 'Gate position, outcome evidence and what needs attention across your whole portfolio, so you see it before a supervisor asks.' })}
      <div class="empty">${icon('gauge')}<h3>No agents to watch yet</h3><p>Register an agent, or load the worked example to see a populated control tower.</p><div class="row g8 mt16" style="justify-content:center"><a class="btn primary" href="#/agents/new">${icon('plus')} Register an agent</a><button class="btn" id="demo">${icon('spark')} Load the worked example</button></div></div>`,
      mount(root) { root.querySelector('#demo').addEventListener('click', () => { loadDemo(); go('tower'); window.dispatchEvent(new HashChangeEvent('hashchange')); }); },
    };
  }
  const all = agents.flatMap(alertsFor);
  const live = agents.filter((a) => gateStatus(a, 'G3') === 'passed' && gateStatus(a, 'G6') !== 'passed');
  const evidenced = live.filter((a) => { const l = analyseRounds(a).rounds.slice(-1)[0]; return l && l.period >= prevMonth(); });
  const openItems = ROLE_IDS.reduce((n, r) => n + queue(agents, r).filter((x) => x.kind !== 'read' && x.kind !== 'optional').length, 0);
  const tiers = ['T1', 'T2', 'T3', 'T4'].map((t) => [t, agents.filter((a) => tierOf(a) === t).length]).filter(([, n]) => n);
  const gates = D.gates.map((g) => g.id);

  const cell = (a, gid) => {
    const st = gateStatus(a, gid);
    const e = st === 'open' ? evalGate(a, gid) : null;
    const stg = stageOf(a);
    const cur = !stg.done && STAGES[stg.idx]?.gate === gid;
    const cls = st === 'passed' ? 'passed' : st === 'failed' ? 'failed' : e?.ready ? 'ready' : cur ? 'cur' : '';
    const title = `${gid} ${D.gate[gid].name}: ${st === 'passed' ? 'passed' : st === 'failed' ? 'failed' : e?.ready ? 'ready for decision' : cur ? 'current stage' : 'open'}`;
    return `<a class="cell ${cls}" href="#/agents/${a.id}/g/${gid}" title="${esc(title)}">${st === 'passed' ? icon('check') : st === 'failed' ? icon('x') : gid.slice(1)}</a>`;
  };

  return {
    title: 'Control tower',
    crumbs: [['Home', '#/'], ['Control tower']],
    html: `
    ${pageHead({ eyebrow: `${icon('gauge')} Control tower`, title: 'Every agent, one view', lede: 'Gate position, outcome evidence and what needs attention across your whole portfolio. Process numbers show the machinery ran. Only outcome evidence says the decisions were right.' })}
    <div class="kpis">
      <div class="kpi"><div class="l">${icon('bot')} Agents</div><div class="v">${agents.length}</div><div class="s">${tiers.map(([t, n]) => `${n} at ${t}`).join(' · ')}</div></div>
      <div class="kpi"><div class="l">${icon('shield')} Live (G3 passed)</div><div class="v">${live.length}</div><div class="s">${agents.length - live.length} in delivery or retired</div></div>
      <div class="kpi"><div class="l"><span class="badge outcome" style="padding:0 7px">Outcome</span> Evidence current</div><div class="v">${live.length ? `${evidenced.length}/${live.length}` : '—'}</div><div class="s">live agents with a sampling round since ${prevMonth()}</div></div>
      <div class="kpi"><div class="l">${icon('inbox')} Open work items</div><div class="v">${openItems}</div><div class="s">${all.filter((x) => x.sev === 'high').length} high-severity alerts</div></div>
    </div>

    <section class="section" style="margin-top:28px">
      <div class="section-head"><div class="stack g4"><h2>Gate position</h2><p class="muted">Green: passed. Outlined teal: ready for decision. Outlined grey: current stage. Select a cell to open that gate.</p></div></div>
      <div class="tbl-card scroll-x"><table class="gm"><thead><tr><th>Agent</th><th>Tier</th>${gates.map((g) => `<th title="${esc(D.gate[g].name)}">${g}</th>`).join('')}<th>Latest round</th><th>Next service</th></tr></thead><tbody>
      ${agents.map((a) => {
        const l = analyseRounds(a).rounds.slice(-1)[0];
        const r = recommended(a);
        return `<tr><td><a href="#/agents/${a.id}" style="color:inherit"><b>${esc(agentName(a))}</b></a><div class="xs faint">${esc(agentCode(a))}</div></td><td><span class="badge ink">${tierOf(a)}</span></td>${gates.map((g) => `<td>${cell(a, g)}</td>`).join('')}
          <td>${l ? `<span class="badge ${l.vd.tone}" title="${esc(l.period)}">${pct(l.p)} · ${esc(l.vd.label)}</span>` : '<span class="badge unknown">Unknown</span>'}</td>
          <td>${r ? `<a class="chip" href="#/services/${r.id}" style="border-color:${r.color}55">${esc(r.name)}</a>` : ''}</td></tr>`;
      }).join('')}
      </tbody></table></div>
    </section>

    <section class="section">
      <div class="section-head"><div class="stack g4"><h2>Needs attention <span class="faint" style="font-weight:500">${all.length}</span></h2><p class="muted">Computed from each agent's forms, gates, sampling rounds, drills, changes and dates.</p></div>
        ${all.length ? `<div class="seg" id="sev">${[['', 'All'], ['high', 'High'], ['med', 'Medium'], ['low', 'Low']].map(([k, l]) => `<button data-k="${k}" aria-pressed="${!k}">${l}</button>`).join('')}</div>` : ''}</div>
      ${all.length ? `<div class="stack g8" id="alerts">${all.map((x) => `<div data-sev="${x.sev}">${alertRow(x)}</div>`).join('')}</div>` : `<div class="callout ok">${icon('checkCircle')}<div>Nothing needs attention right now.</div></div>`}
    </section>`,
    mount(root) {
      root.querySelector('#sev')?.addEventListener('click', (e) => {
        const b = e.target.closest('[data-k]'); if (!b) return;
        root.querySelectorAll('#sev button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        root.querySelectorAll('#alerts [data-sev]').forEach((el) => { el.style.display = !b.dataset.k || el.dataset.sev === b.dataset.k ? '' : 'none'; });
      });
    },
  };
}
