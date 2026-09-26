// GovKit app shell: layout, hash router, acting-role switcher and theme.

import { D, loadData } from './data.js';
import { S, update, onChange, storageOk } from './store.js';
import { esc, icon, toast } from './ui.js';
import { queue } from './logic.js';
import { av } from './components.js';

import * as home from './views/home.js';
import * as guide from './views/guide.js';
import * as roles from './views/roles.js';
import * as model from './views/model.js';
import * as artefacts from './views/artefacts.js';
import * as work from './views/work.js';
import * as agent from './views/agent.js';
import * as formView from './views/form.js';
import * as gateView from './views/gate.js';
import * as tools from './views/tools.js';
import * as help from './views/help.js';
import * as services from './views/services.js';
import * as tower from './views/tower.js';
import { installPalette, openPalette } from './cmdk.js';

const ROUTES = [
  [/^$/, home.render],
  [/^guide$/, guide.render],
  [/^services$/, services.renderIndex],
  [/^services\/([\w-]+)$/, services.renderService],
  [/^tower$/, tower.render],
  [/^roles$/, roles.renderIndex],
  [/^roles\/([A-Z]+)$/, roles.renderRole],
  [/^work$/, work.render],
  [/^agents\/new$/, work.renderNew],
  [/^agents\/([\w-]+)$/, agent.render],
  [/^agents\/([\w-]+)\/report$/, agent.renderReport],
  [/^agents\/([\w-]+)\/a\/(\d\d)$/, formView.render],
  [/^agents\/([\w-]+)\/g\/(G\d)$/, gateView.render],
  [/^tools$/, tools.renderIndex],
  [/^tools\/([\w-]+)$/, tools.renderTool],
  [/^model$/, model.renderMap],
  [/^model\/(gates|tiers|raci|metrics|platform|roadmap|references)$/, model.renderSection],
  [/^artefacts$/, artefacts.renderIndex],
  [/^artefacts\/(\d\d)$/, artefacts.renderSpec],
  [/^help$/, help.render],
  [/^about$/, help.renderAbout],
];

const NAV = [
  { label: 'Workspace', items: [
    ['', 'home', 'Home'],
    ['services', 'spark', 'Services'],
    ['tower', 'gauge', 'Control tower'],
    ['work', 'inbox', 'My work', 'queue'],
    ['tools', 'scale', 'Decision tools'],
  ] },
  { label: 'Learn', items: [
    ['guide', 'compass', 'How it works'],
    ['roles', 'users', 'Roles & playbooks'],
    ['help', 'help', 'Glossary & FAQ'],
  ] },
  { label: 'Operating model', items: [
    ['model', 'map', 'SDLC map'],
    ['model/gates', 'shield', 'Gates G0–G6'],
    ['model/tiers', 'layers', 'Autonomy tiers'],
    ['model/raci', 'grid', 'RACI matrix'],
    ['artefacts', 'file', 'Artefacts 00–16'],
    ['model/metrics', 'chart', 'Metric register'],
    ['model/platform', 'server', 'Evidence platform'],
    ['model/roadmap', 'flag', 'Roadmap & maturity'],
    ['model/references', 'book', 'References'],
  ] },
];

let current = { path: null, view: null };

// Routes look like #/model/gates, optionally with an in-page anchor: #/model/gates#G3
const rawHash = () => decodeURIComponent(location.hash.replace(/^#\/?/, ''));
export const path = () => rawHash().split('#')[0].replace(/\/$/, '');
const anchor = () => rawHash().split('#')[1] || '';
export function go(p) { location.hash = '#/' + p; }
export function rerender({ keepScroll = true } = {}) { route({ keepScroll }); }

function renderSide() {
  const p = path();
  const role = S().role;
  const q = role ? queue(S().agents, role).filter((x) => x.kind !== 'read' && x.kind !== 'optional').length : 0;
  const active = (href) => href === '' ? p === '' : (p === href || (p.startsWith(href + '/') && !NAV.some((g) => g.items.some(([h]) => h !== href && h.startsWith(href + '/') && (p === h || p.startsWith(h + '/'))))));
  const agentsActive = p.startsWith('agents/');
  document.getElementById('side').innerHTML = `
    <a class="brand" href="#/"><span class="brand-mark">${icon('shield')}</span><span><b>GovKit</b><small>Assurance for AI agents</small></span></a>
    <a class="cta-new" href="#/agents/new">${icon('plus')} Register an agent</a>
    <nav class="nav" aria-label="Main">
      ${NAV.map((g) => `<div class="nav-group"><div class="nav-label">${g.label}</div>
        ${g.items.map(([href, ic, label, badge]) => `<a href="#/${href}" ${active(href) || (href === 'work' && agentsActive) ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span>${badge === 'queue' && q ? `<span class="count" title="Items waiting for you">${q}</span>` : ''}</a>`).join('')}
      </div>`).join('')}
    </nav>
    <div class="side-foot">${icon('lock', 'sm-ic')} Runs in your browser. Nothing is uploaded. <a href="#/about">Privacy</a><br>Operating model draft 0.2 · refs checked 23 Sep 2026</div>`;
}

function renderTop(crumbs) {
  const s = S();
  const r = s.role ? D.role[s.role] : null;
  const theme = document.documentElement.getAttribute('data-theme');
  const dark = theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  document.getElementById('top').innerHTML = `
    <button class="icon-btn menu" data-action="open-nav" aria-label="Open menu">${icon('menu')}</button>
    <a class="brand-sm" href="#/"><span class="brand-mark">${icon('shield')}</span>GovKit</a>
    <nav class="crumbs" aria-label="Breadcrumb">${(crumbs || []).map(([l, h], i, arr) => i === arr.length - 1 ? `<span>${esc(l)}</span>` : `<a href="${h}">${esc(l)}</a><span class="sep">/</span>`).join('')}</nav>
    <div class="top-right">
      <button class="search-btn" data-action="palette" aria-label="Search and jump (Ctrl K)">${icon('search')}<span>Search or jump to…</span><kbd>Ctrl K</kbd></button>
      <button class="role-btn ${r ? '' : 'none'}" data-action="role-menu" aria-haspopup="true" aria-expanded="false" title="The role you are acting as">
        ${r ? av(r.id) : `<span class="av">?</span>`}<span class="rl">${r ? `Acting as <b>${esc(r.name)}</b>` : 'Choose your role'}</span>
      </button>
      <button class="icon-btn" data-action="theme" aria-label="Switch to ${dark ? 'light' : 'dark'} theme" title="Switch theme">${icon(dark ? 'sun' : 'moon')}</button>
    </div>`;
}

export function openRoleMenu(anchor) {
  closePopover();
  const s = S();
  const pop = document.createElement('div');
  pop.className = 'popover';
  pop.id = 'role-pop';
  pop.setAttribute('role', 'dialog');
  pop.setAttribute('aria-label', 'Choose the role you are acting as');
  pop.innerHTML = `<h4>Who are you acting as?</h4>
    <p class="hint">Your role decides your queue, what you can approve, and what the map highlights. Switch any time, for example to play through a gate.</p>
    <div role="radiogroup">${D.roles.map((r) => `<button class="role-opt" role="radio" aria-checked="${s.role === r.id}" data-role="${r.id}">${av(r.id)}<span><b>${esc(r.name)}</b><small>${esc(r.description)}</small></span></button>`).join('')}</div>
    <div class="name-row"><label for="person">Your name for sign-offs</label><input id="person" class="input sm" value="${esc(s.person)}" placeholder="e.g. A. Rahman" autocomplete="name"></div>`;
  document.body.appendChild(pop);
  anchor?.setAttribute('aria-expanded', 'true');
  pop.querySelector(`[aria-checked="true"]`)?.focus() || pop.querySelector('.role-opt')?.focus();
  pop.addEventListener('click', (e) => {
    const b = e.target.closest('[data-role]');
    if (!b) return;
    update((st) => { st.role = b.dataset.role; });
    closePopover();
    toast(`Now acting as ${D.role[b.dataset.role].name}`);
  });
  pop.querySelector('#person').addEventListener('change', (e) => update((st) => { st.person = e.target.value.trim(); }, { silent: true }));
  pop.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closePopover(); anchor?.focus(); } });
}
function closePopover() {
  document.getElementById('role-pop')?.remove();
  document.querySelector('[data-action="role-menu"]')?.setAttribute('aria-expanded', 'false');
}

function route({ keepScroll = false } = {}) {
  const p = path();
  let out = null;
  for (const [re, fn] of ROUTES) {
    const m = p.match(re);
    if (m) { out = fn(...m.slice(1)); break; }
  }
  if (!out) out = { title: 'Not found', crumbs: [['Home', '#/'], ['Not found']], html: `<div class="empty">${icon('compass')}<h3>That page doesn't exist</h3><p>The link may be from the old site. <a href="#/">Go to the home page</a> or <a href="#/guide">see how GovKit works</a>.</p></div>` };
  const app = document.getElementById('app');
  const y = window.scrollY;
  const changed = current.path !== p;
  app.innerHTML = `<div class="${changed ? 'fade-in' : ''}">${out.html}</div>`;
  document.getElementById('content').classList.toggle('wide', !!out.wide);
  current = { path: p, view: out };
  document.title = out.title ? `${out.title} · GovKit` : 'GovKit · Agentic SDLC Operating Model';
  renderSide();
  renderTop(out.crumbs);
  if (out.mount) out.mount(app);
  const target = anchor() && document.getElementById(anchor());
  if (target && !keepScroll) {
    target.scrollIntoView({ block: 'start' });
    document.body.classList.remove('nav-open');
  } else if (changed && !keepScroll) {
    window.scrollTo(0, 0);
    document.body.classList.remove('nav-open');
    // Move focus for screen-reader users without scrolling.
    document.getElementById('content').focus({ preventScroll: true });
  } else window.scrollTo(0, y);
}

function globalClicks(e) {
  const a = e.target.closest('[data-action]');
  if (!e.target.closest('#role-pop') && !e.target.closest('[data-action="role-menu"]')) closePopover();
  if (!a) return;
  const act = a.dataset.action;
  if (act === 'open-nav') document.body.classList.add('nav-open');
  else if (act === 'close-nav') document.body.classList.remove('nav-open');
  else if (act === 'palette') openPalette();
  else if (act === 'role-menu') { if (document.getElementById('role-pop')) closePopover(); else openRoleMenu(a); }
  else if (act === 'theme') {
    const cur = document.documentElement.getAttribute('data-theme');
    const dark = cur ? cur === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
    const next = dark ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('govkit.theme', next); } catch (err) { /* per-viewer convenience only */ }
    renderTop(current.view?.crumbs);
  }
}

async function boot() {
  try {
    await loadData();
  } catch (err) {
    document.getElementById('app').innerHTML = `<div class="callout bad">${icon('alert')}<div><b>The operating model data could not be loaded.</b><br>${esc(err.message)}<br><span class="small">If you opened index.html from disk, serve the folder instead, for example <code>python -m http.server</code> in the <code>web</code> folder.</span></div></div>`;
    return;
  }
  document.addEventListener('click', globalClicks);
  installPalette();
  window.addEventListener('hashchange', () => route());
  // Role changes and imports re-render the current page; form typing saves silently.
  onChange(() => route({ keepScroll: true }));
  route();
  if (!storageOk) toast('Browser storage is blocked, so your work will not be saved after you close this tab. Export to keep it.');
}

boot();
