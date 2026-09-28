import { D } from '../data.js';
import { S, exportState, clearAll, storageOk } from '../store.js';
import { esc, icon, toast, dialog, download } from '../ui.js';
import { pageHead } from '../components.js';
import { linkIds } from './model.js';

export function render() {
  const g = D.guide;
  return {
    title: 'Glossary & FAQ',
    crumbs: [['Home', '#/'], ['Glossary & FAQ']],
    html: `${pageHead({ eyebrow: 'Help', title: 'Glossary & FAQ', lede: 'The vocabulary the operating model uses, and answers to the questions teams ask first.' })}
    <div class="grid cols-2" style="align-items:start">
      <section>
        <h2>Frequently asked</h2>
        <div class="mt16">${(g.faq || []).map((f, i) => `<details class="acc" ${i === 0 ? 'open' : ''}><summary>${esc(f.q)}</summary><div class="acc-body">${linkIds(f.a)}</div></details>`).join('')}</div>
      </section>
      <section>
        <div class="row g8" style="justify-content:space-between"><h2>Glossary</h2><label class="search" style="max-width:220px">${icon('search')}<span class="sr-only">Filter terms</span><input class="input sm" id="gq" type="search" placeholder="Filter terms"></label></div>
        <dl class="stack g8 mt16" id="gl">${(g.glossary || []).map((t) => `<div class="card flat" data-term="${esc((t.term + ' ' + t.definition).toLowerCase())}" style="padding:12px 16px"><dt><b>${esc(t.term)}</b></dt><dd class="small muted" style="margin:4px 0 0">${linkIds(t.definition)}</dd></div>`).join('')}</dl>
      </section>
    </div>`,
    mount(root) {
      root.querySelector('#gq').addEventListener('input', (e) => {
        const q = e.target.value.toLowerCase();
        root.querySelectorAll('#gl [data-term]').forEach((el) => { el.style.display = el.dataset.term.includes(q) ? '' : 'none'; });
      });
    },
  };
}

export function renderAbout() {
  const s = S();
  let bytes = 0;
  try { bytes = (localStorage.getItem('govkit.om.v1') || '').length; } catch (e) { /* storage blocked */ }
  return {
    title: 'Privacy & data',
    crumbs: [['Home', '#/'], ['Privacy & data']],
    html: `${pageHead({ eyebrow: 'About', title: 'Privacy, data and rights', lede: 'GovKit is a static site. There is no server-side code, no account, no analytics and no third-party request. Fonts are served from this site.' })}
    <div class="grid cols-2">
      <div class="card">
        <h3>${icon('lock')} Where your work lives</h3>
        <p class="muted small mt8">Everything you enter (agents, forms, comments, sign-offs, decisions) is saved in this browser's <code>localStorage</code> under one key, on this device only. It is never transmitted. Another browser or device will not see it unless you export and import it.</p>
        <dl class="kv mt12"><dt>Status</dt><dd>${storageOk ? '<span class="badge ok">Saving in this browser</span>' : '<span class="badge bad">Storage blocked: work lasts only while the tab is open</span>'}</dd><dt>Agents</dt><dd>${s.agents.length}</dd><dt>Size</dt><dd>${(bytes / 1024).toFixed(1)} KB</dd></dl>
        <div class="row g8 mt16"><button class="btn sm" id="exp">${icon('download')} Export everything</button><button class="btn sm bad" id="clr">${icon('trash')} Delete everything</button></div>
      </div>
      <div class="card">
        <h3>${icon('alert')} Sign-offs are a record, not an identity</h3>
        <p class="muted small mt8">Because there are no accounts, a sign-off records the role and name the person entered. It isn't authenticated. Treat an exported evidence pack as a working record to file in your own controlled system of record, where signatures carry identity.</p>
      </div>
      <div class="card">
        <h3>${icon('book')} Source and status</h3>
        <p class="muted small mt8">The content is the Agentic SDLC Operating Model, draft 0.2, with references checked on 23 Sep 2026. It builds on the Agentic Assurance Reference draft 0.1. References marked <span class="badge warn">Per source ref</span> have not been re-verified, so check them before external use. The sanctions-triage examples and the calibration numbers are illustrative. This is guidance, not legal advice.</p>
      </div>
      <div class="card">
        <h3>${icon('file')} Rights</h3>
        <p class="muted small mt8">© 2026 Lali Devamanthri. All rights reserved. The operating model, its artefacts, forms, guidance and this software are proprietary. You may use the site for your own evaluation. Copying, redistributing, adapting or building on the content or code requires written permission from the author.</p>
      </div>
    </div>`,
    mount(root) {
      root.querySelector('#exp').addEventListener('click', () => { download(`govkit-workspace-${new Date().toISOString().slice(0, 10)}.json`, exportState(), 'application/json'); toast('Exported'); });
      root.querySelector('#clr').addEventListener('click', async () => {
        const ok = await dialog({ title: 'Delete all workspace data?', body: '<p class="muted">This removes every agent and record from this browser. It cannot be undone.</p>', confirm: 'Delete everything', tone: 'bad' });
        if (ok) { clearAll(); toast('Deleted'); }
      });
    },
  };
}
