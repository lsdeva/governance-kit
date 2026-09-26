import { D, TIER_INFO, TIERS } from '../data.js';
import { esc, icon } from '../ui.js';
import { pageHead } from '../components.js';

export function render() {
  return {
    title: 'How it works',
    crumbs: [['Home', '#/'], ['How it works']],
    html: `
    ${pageHead({ eyebrow: 'Guide', title: 'How GovKit works', lede: 'GovKit turns the operating model into a working environment. Each artefact is a form with an owner, each gate is a signed decision, and the tools do the arithmetic behind the judgement calls. This page takes about five minutes to read.' })}

    <div class="grid cols-2">
      <div class="card"><div class="eyebrow">Who it is for</div><p class="mt8">Teams building or running an AI agent that <b>decides, acts, and closes a case nobody revisits</b>: triage, eligibility, case closure, exception approval, payment release. It is for the whole delivery team, not only compliance. Twelve roles take part, from the accountable executive to operations.</p></div>
      <div class="card"><div class="eyebrow">What it is not</div><p class="mt8">It is not a new SDLC. It adds <b>no new phases</b>, and every artefact attaches to a ceremony you already hold: business case, architecture review, backlog refinement, CI, UAT, change advisory, ops review. It isn't legal advice, and it doesn't propose your tolerance numbers. Those are yours to write down.</p></div>
    </div>

    <section class="section">
      <h2>The five-step workflow</h2>
      <div class="steps mt16">
        <div class="card stepc">
          <h3>Choose the role you are acting as</h3>
          <p class="muted mt8">Use the role button at the top right. Your role decides your <a href="#/work">queue</a>: what you draft (R), approve (A), are consulted on (C) or informed about (I), and which gates you sign. In a workshop, switch roles to play a gate through end to end. Add your name so sign-offs carry it.</p>
        </div>
        <div class="card stepc">
          <h3>Register the agent and set its autonomy tier</h3>
          <p class="muted mt8"><a href="#/agents/new">Register an agent</a> to open its inventory entry (00). The tier sets proportionality: at T1 some artefacts are <i>light</i> or not required, and at T3 and T4 the full set applies. If you are unsure, the <a href="#/tools/tier">tier tool</a> asks the questions. <b>First go-live should be at T2 or below.</b> A higher tier is earned at gate G4 on sampling evidence.</p>
        </div>
        <div class="card stepc">
          <h3>Work each stage's forms: draft → consult → approve</h3>
          <p class="muted mt8">The agent's page shows the stage you're in and the artefacts that stage needs. The <b>R</b> role drafts each form. Every field has guidance, and a <i>light</i> requirement only needs the core fields. Submitting sends it to review. <b>C</b> roles record their view, and the <b>A</b> role approves it or returns it with a reason. Approving asks the A to confirm the artefact's <i>done-when</i> test, the one sentence that says whether it's actually finished.</p>
        </div>
        <div class="card stepc">
          <h3>Pass the gate</h3>
          <p class="muted mt8">Each gate lists the artefacts that must exist and the checks the named roles must confirm. Where the data allows, GovKit suggests the answer, for example whether the last kill-switch drill was inside the limit. The approvers then sign pass or fail with a rationale. <b>A gate with missing artefacts is a failed gate, not one passed with conditions.</b> GovKit won't let a pass be signed until everything is in place.</p>
        </div>
        <div class="card stepc">
          <h3>Operate on evidence, not on machinery</h3>
          <p class="muted mt8">After go-live, record each monthly sampling round in 09. GovKit computes the Wilson interval, the worst stratum and the verdict against your tolerance. It tells you when four consecutive in-tolerance rounds make promotion (G4) possible. Run a <a href="#/tools/change">material change check</a> for every model, prompt or tool change, and the artefacts that must be redone are flagged automatically.</p>
        </div>
      </div>
    </section>

    <section class="section grid cols-2">
      <div class="card">
        <h3>Form statuses</h3>
        <dl class="kv mt12">
          <dt><span class="st not_started">Not started</span></dt><dd>Nobody has opened it.</dd>
          <dt><span class="st draft">Draft</span></dt><dd>The R role is working on it. Autosaved in your browser.</dd>
          <dt><span class="st submitted">In review</span></dt><dd>Submitted. C roles comment and the A role decides.</dd>
          <dt><span class="st returned">Returned</span></dt><dd>The A sent it back with a reason. The R reworks and resubmits.</dd>
          <dt><span class="st approved">Approved</span></dt><dd>Signed by the A, with the done-when test confirmed. Editing it again reopens it as a draft.</dd>
        </dl>
      </div>
      <div class="card">
        <h3>Three kinds of number</h3>
        <p class="muted small mt8">Every metric and dashboard tile is labelled, and they are never mixed without a label.</p>
        <dl class="kv mt12">
          <dt><span class="badge process">Process</span></dt><dd>The control ran. Computed by the platform from 07 and 08.</dd>
          <dt><span class="badge outcome">Outcome</span></dt><dd>The decision was right. It can only come from blind re-performance in 09 and 10.</dd>
          <dt><span class="badge unknown">Unknown</span></dt><dd>Not tested. This tile is mandatory, so the gaps are always on the page.</dd>
        </dl>
      </div>
    </section>

    <section class="section">
      <h2>Proportionality: the tier decides what is mandatory</h2>
      <p class="muted mt8 prose">Tiers follow the IMDA autonomy spectrum (§2.1.1). The tier is recorded in 00, and the pipeline reads it to select the control profile (05). Moving up a tier is a gate (G4), never a configuration change.</p>
      <div class="grid cols-4 mt16">${TIERS.map((t) => `<div class="card tier-card"><div class="tn">${t} · ${esc(TIER_INFO[t].loop)}</div><h3>${esc(TIER_INFO[t].name)}</h3><p>${esc(TIER_INFO[t].body)}</p></div>`).join('')}</div>
      <p class="mt12"><a href="#/model/tiers">See which artefacts each tier requires ${icon('arrowRight')}</a></p>
    </section>

    <section class="section grid cols-2">
      <div class="card">
        <h3>${icon('lock')} Your data stays with you</h3>
        <p class="muted small mt8">There is no server and no account. Everything you enter is saved in this browser's local storage, on this device only. Use <b>Export</b> in <a href="#/work">My work</a> to keep a copy or hand a workspace to a colleague, who can import it. Clearing your browser data deletes it.</p>
      </div>
      <div class="card">
        <h3>${icon('spark')} Learn by exploring</h3>
        <p class="muted small mt8">Load the worked example from <a href="#/work">My work</a>. It is an illustrative sanctions-screening triage agent part-way through its lifecycle, with forms at every status, a passed gate and sampling rounds, so you can see what good looks like before you start your own.</p>
      </div>
    </section>

    <section class="section">
      <div class="callout outcome">${icon('target')}<div><b>The one thing to remember.</b> Artefacts 09 and 10 have no published source, and they are the only ones that say whether the agent's decisions were right. Everything else shows that the machinery ran. The step from L3 to L4 maturity is where cost appears and programmes stall, because L3 already looks finished. <a href="#/model/metrics">Read the sampling method</a>.</div></div>
    </section>`,
  };
}
