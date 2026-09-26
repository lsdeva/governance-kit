import { D, TIERS, TIER_INFO } from '../data.js';
import { S, newAgent, exportState, importState, clearAll, storageOk } from '../store.js';
import { esc, icon, toast, dialog, download, slug, fmtDate } from '../ui.js';
import { queue, progress, stageOf, STAGES, tierOf, agentName, agentCode, gateStatus } from '../logic.js';
import { pageHead, rolePrompt, av } from '../components.js';
import { loadDemo } from '../demo.js';
import { go } from '../app.js';

export function agentCard(a, role) {
  const p = progress(a);
  const st = stageOf(a);
  const mine = role ? queue([a], role).filter((x) => x.kind !== 'read' && x.kind !== 'optional').length : 0;
  const status = a.forms['00']?.values?.status || 'proposed';
  return `<a class="card" href="#/agents/${a.id}">
    <div class="row g12" style="justify-content:space-between;align-items:flex-start">
      <div class="stack g4 grow"><div class="row g8"><span class="badge ink">${tierOf(a)}</span><span class="badge line">${esc(status)}</span>${a.demo ? '<span class="badge warn">Example</span>' : ''}</div>
      <h3 class="mt8">${esc(agentName(a))}</h3><div class="xs faint mono">${esc(agentCode(a))}</div></div>
      <div class="ring" style="--p:${Math.round(p.pct * 100)}" title="${p.approved} of ${p.total} mandatory artefacts approved"><b>${Math.round(p.pct * 100)}%</b></div>
    </div>
    <div class="mt16"><div class="eyebrow">Stage ${st.done ? '— retired' : `${st.idx + 1} of 6`}</div><div class="row g8 mt4" style="justify-content:space-between"><b class="small">${st.done ? 'Retired' : esc(STAGES[st.idx].name)}</b>${mine ? `<span class="badge outcome">${mine} for you</span>` : ''}</div>
    <div class="row g4 mt8">${STAGES.map((s2, i) => `<span style="flex:1;height:5px;border-radius:4px;background:${gateStatus(a, s2.gate) === 'passed' ? 'var(--ok)' : i === st.idx ? 'var(--accent)' : 'var(--sunk)'}" title="${esc(s2.name)}"></span>`).join('')}</div></div>
    <div class="xs faint mt12">Updated ${fmtDate(a.updated)}</div>
  </a>`;
}

export function render() {
  const s = S();
  const role = s.role;
  const q = role ? queue(s.agents, role) : [];
  const active = q.filter((x) => x.kind !== 'read' && x.kind !== 'optional');
  const later = q.filter((x) => x.kind === 'read' || x.kind === 'optional');
  const item = (x) => `<a class="q-item" href="${x.href}"><span class="verb ${x.verb}">${esc(x.label)}</span><span class="grow"><b>${esc(x.title)}</b><small>${esc(agentName(x.agent))} · ${esc(x.why || '')}</small></span>${icon('arrowRight')}</a>`;

  return {
    title: 'My work',
    crumbs: [['Home', '#/'], ['My work']],
    html: `
    ${pageHead({ eyebrow: role ? `Acting as ${esc(D.role[role].name)}` : 'Workspace', title: 'My work', lede: 'Your queue across every agent: forms to draft, reviews to give, approvals and gates to sign. Items appear as each agent reaches the stage that needs them.', actions: `<a class="btn primary" href="#/agents/new">${icon('plus')} Register an agent</a>` })}
    ${!storageOk ? `<div class="callout warn" style="margin-bottom:16px">${icon('alert')}<div><b>Browser storage is blocked.</b> Your work lasts only while this tab is open. Export it before you leave.</div></div>` : ''}
    ${!role ? rolePrompt('see what is waiting for you') : ''}

    ${role && s.agents.length ? `<section>
      <div class="section-head"><div class="stack g4"><h2>Waiting for you <span class="faint" style="font-weight:500">${active.length}</span></h2></div>
      ${active.length ? `<div class="seg" id="qf">${[['', 'All'], ['do', 'Draft'], ['review', 'Consult'], ['approve', 'Approve'], ['gate', 'Gates']].map(([k, l]) => `<button data-k="${k}" aria-pressed="${!k}">${l}</button>`).join('')}</div>` : ''}</div>
      ${active.length ? `<div class="stack g8" id="qlist">${active.map((x) => `<div data-verb="${x.verb}">${item(x)}</div>`).join('')}</div>`
        : `<div class="callout ok">${icon('checkCircle')}<div>Nothing is waiting for <b>${esc(D.role[role].name)}</b> right now. Other roles may still have work, so switch roles to see theirs.</div></div>`}
      ${later.length ? `<details class="acc mt16"><summary>To read or optional <span class="faint xs" style="font-weight:400">${later.length}</span></summary><div class="acc-body stack g8">${later.map(item).join('')}</div></details>` : ''}
    </section>` : ''}

    <section class="section">
      <div class="section-head"><div class="stack g4"><h2>Agents <span class="faint" style="font-weight:500">${s.agents.length}</span></h2><p class="muted">Each agent has its own inventory entry, forms, gates and decision log.</p></div>
        <div class="row g8">
          <button class="btn sm" id="imp">${icon('upload')} Import</button>
          ${s.agents.length ? `<button class="btn sm" id="exp">${icon('download')} Export all</button>` : ''}
        </div></div>
      ${s.agents.length ? `<div class="grid auto-fill">${s.agents.map((a) => agentCard(a, role)).join('')}</div>`
        : `<div class="empty">${icon('bot')}<h3>No agents yet</h3><p>Register the agent you are governing, or load a worked example to see a workspace part-way through its lifecycle.</p>
           <div class="row g8 mt16" style="justify-content:center"><a class="btn primary" href="#/agents/new">${icon('plus')} Register an agent</a><button class="btn" id="demo">${icon('spark')} Load the worked example</button></div></div>`}
      <input type="file" id="imp-file" accept="application/json,.json" hidden>
    </section>

    ${s.agents.length ? `<section class="section"><details class="acc"><summary>${icon('lock')} Your data</summary><div class="acc-body">
      <p>Everything is stored in this browser only. Export regularly to keep a copy or to share a workspace. An import merges agents by ID.</p>
      <div class="row g8 mt12"><button class="btn sm" id="demo2">${icon('spark')} Add the worked example</button><button class="btn sm bad" id="clear">${icon('trash')} Delete all workspace data</button></div>
    </div></details></section>` : ''}`,
    mount(root) {
      root.querySelector('#qf')?.addEventListener('click', (e) => {
        const b = e.target.closest('[data-k]'); if (!b) return;
        root.querySelectorAll('#qf button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
        root.querySelectorAll('#qlist [data-verb]').forEach((el) => { el.style.display = !b.dataset.k || el.dataset.verb === b.dataset.k || (b.dataset.k === 'gate' && el.dataset.verb === 'gate') ? '' : 'none'; });
      });
      const demo = () => { const a = loadDemo(); go(`agents/${a.id}`); };
      root.querySelector('#demo')?.addEventListener('click', demo);
      root.querySelector('#demo2')?.addEventListener('click', demo);
      root.querySelector('#exp')?.addEventListener('click', () => { download(`govkit-workspace-${new Date().toISOString().slice(0, 10)}.json`, exportState(), 'application/json'); toast('Workspace exported'); });
      const file = root.querySelector('#imp-file');
      root.querySelector('#imp').addEventListener('click', () => file.click());
      file.addEventListener('change', async () => {
        const f = file.files[0]; if (!f) return;
        try { importState(JSON.parse(await f.text())); toast('Workspace imported'); }
        catch (err) { toast(`Import failed: ${err.message}`); }
      });
      root.querySelector('#clear')?.addEventListener('click', async () => {
        const ok = await dialog({ title: 'Delete all workspace data?', body: '<p class="muted">This removes every agent, form, sign-off and decision from this browser. It cannot be undone. Export first if you want a copy.</p>', confirm: 'Delete everything', tone: 'bad' });
        if (ok) { clearAll(); toast('Workspace cleared'); }
      });
    },
  };
}

export function renderNew() {
  const role = S().role;
  return {
    title: 'Register an agent',
    crumbs: [['Home', '#/'], ['My work', '#/work'], ['Register an agent']],
    html: `
    ${pageHead({ eyebrow: 'Stage 1 · Initiate', title: 'Register an agent', lede: 'This opens the agent\'s inventory entry (00), the source of truth for its autonomy tier. The tier drives everything downstream: which artefacts are mandatory, which control profile the pipeline selects, and who approves a change.' })}
    <div class="form-layout">
      <form class="card flat" id="new-agent" style="padding:0" novalidate>
        <div class="fsec">
          <h3><span class="n">1</span> The agent</h3>
          <div class="field"><label for="n-name">Name <span class="req-mark">*</span></label><span class="help">What the business calls it. You can change it later in 00.</span><input class="input" id="n-name" name="name" required placeholder="e.g. Sanctions alert triage, level 1"></div>
          <div class="field"><label for="n-id">Agent ID</label><span class="help">A stable identifier the pipeline and identity issuer will use. Generated from the name, so edit it if your organisation has a convention.</span><input class="input" id="n-id" name="agentId" placeholder="sanctions-alert-triage-l1"></div>
          <div class="field"><label for="n-purpose">What decision is being delegated?</label><span class="help">One or two sentences. This starts the justification record (01). Say what the agent decides, not what the technology is.</span><textarea class="input" id="n-purpose" name="purpose" placeholder="Dispose first-line name-screening alerts that are clearly not a match."></textarea></div>
        </div>
        <div class="fsec">
          <h3><span class="n">2</span> Proposed autonomy tier</h3>
          <p class="help muted small" style="margin-bottom:12px">The tier you intend the agent to <i>start</i> at. Not sure? <a href="#/tools/tier">Use the tier tool</a>. It asks five questions and can register the agent for you.</p>
          <div class="grid cols-2" role="radiogroup" aria-label="Autonomy tier">${TIERS.map((t) => `<label class="card flat" style="cursor:pointer;padding:14px"><span class="row g8"><input type="radio" name="tier" value="${t}" ${t === 'T2' ? 'checked' : ''} style="accent-color:var(--accent)"><b>${t}</b><span class="xs faint">${esc(TIER_INFO[t].loop)}</span></span><span class="small muted" style="display:block;margin-top:6px">${esc(TIER_INFO[t].name)}. ${esc(TIER_INFO[t].body)}</span></label>`).join('')}</div>
          <div class="callout warn mt12" id="tier-warn" hidden>${icon('alert')}<div class="small"><b>First go-live should be at T2 or below</b> unless G4 promotion evidence already exists. You can register the target tier, but G3 will ask the accountable executive to confirm this.</div></div>
        </div>
        <div class="fsec">
          <h3><span class="n">3</span> Two facts that change what is required</h3>
          <label class="check"><input type="checkbox" name="vendor"><span><b>A third-party model, platform or tool is used</b><br><span class="small muted">Makes the third-party evidence pack (16) mandatory at every tier.</span></span></label>
          <label class="check mt12"><input type="checkbox" name="routing"><span><b>The agent's own confidence decides what is auto-closed</b><br><span class="small muted">Makes the calibration record (10) part of tier promotion (G4).</span></span></label>
        </div>
        <div class="fsec row g8"><button class="btn primary lg" type="submit">${icon('plus')} Register and open the workspace</button><a class="btn ghost" href="#/work">Cancel</a></div>
      </form>
      <aside class="form-aside">
        <div class="card">
          <h3>What happens next</h3>
          <ol class="muted small mt12">
            <li>The <b>agent owner</b> (AOW) completes the rest of the inventory entry, <a href="#/artefacts/00">00</a>, and submits it. <b>RC</b> approves it.</li>
            <li>The <b>business sponsor</b> (SP) writes the justification, <a href="#/artefacts/01">01</a>, with the permanent cost of outcome sampling on the benefit line.</li>
            <li>The <b>accountable executive</b> (AE) holds <a href="#/model/gates#G0">G0, the intake decision</a>, with RC concurring on the tier.</li>
          </ol>
        </div>
        ${role ? `<div class="card row g12">${av(role)}<p class="small muted grow">You're acting as <b>${esc(D.role[role].name)}</b>. Anyone can register an agent. The inventory entry itself is the agent owner's.</p></div>` : ''}
      </aside>
    </div>`,
    mount(root) {
      const f = root.querySelector('#new-agent');
      const name = f.querySelector('#n-name'), id = f.querySelector('#n-id');
      let touched = false;
      id.addEventListener('input', () => { touched = true; });
      name.addEventListener('input', () => { if (!touched) id.value = slug(name.value); name.classList.remove('invalid'); });
      f.addEventListener('change', () => { root.querySelector('#tier-warn').hidden = !['T3', 'T4'].includes(new FormData(f).get('tier')); });
      f.addEventListener('submit', (e) => {
        e.preventDefault();
        const d = new FormData(f);
        if (!String(d.get('name')).trim()) { name.classList.add('invalid'); name.focus(); toast('Give the agent a name'); return; }
        const a = newAgent({ name: d.get('name').trim(), agentId: String(d.get('agentId') || slug(d.get('name'))).trim(), tier: d.get('tier'), vendor: !!d.get('vendor'), routing: !!d.get('routing'), purpose: String(d.get('purpose') || '').trim() });
        toast('Agent registered. Start with the inventory entry.');
        go(`agents/${a.id}`);
      });
    },
  };
}
