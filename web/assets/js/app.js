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

// Masthead navigation. Top-level items link directly; the two groups open a
// menu panel with a one-line description per page.
const MENUS = {
  model: { label: 'Operating model', intro: 'The model itself: where each artefact sits in the SDLC, who owns it, which gate needs it.', items: [
    ['model', 'SDLC map', 'Seventeen artefacts on the nine phases you already run'],
    ['model/gates', 'Gates G0–G6', 'What must exist to pass, and who signs'],
    ['model/tiers', 'Autonomy tiers', 'How T1–T4 decides what is mandatory'],
    ['model/raci', 'RACI matrix', 'Who creates, approves, is consulted, is informed'],
    ['artefacts', 'Artefacts 00–16', 'Purpose, fields, done test and references'],
    ['model/metrics', 'Metric register', 'Process, Outcome and Unknown, with the sampling method'],
    ['model/platform', 'Evidence platform', 'What platform engineering builds once'],
    ['model/roadmap', 'Roadmap & maturity', 'Twelve months to evidenced; L1–L5'],
    ['model/references', 'References', 'Every source, clause and verification status'],
  ] },
  learn: { label: 'Learn', intro: 'How to use GovKit, and the playbook for every role.', items: [
    ['guide', 'How it works', 'The five-step workflow in five minutes'],
    ['roles', 'Roles & playbooks', 'What each of the twelve roles decides and does'],
    ['help', 'Glossary & FAQ', 'The vocabulary, and the questions teams ask first'],
    ['about', 'Privacy & data', 'Where your work lives, and the licence'],
  ] },
};
const PRIMARY = [['services', 'Services'], ['tower', 'Control tower'], ['work', 'My work'], ['tools', 'Decision tools']];

let current = { path: null, view: null };

// Routes look like #/model/gates, optionally with an in-page anchor: #/model/gates#G3
const rawHash = () => decodeURIComponent(location.hash.replace(/^#\/?/, ''));
export const path = () => rawHash().split('#')[0].replace(/\/$/, '');
const anchor = () => rawHash().split('#')[1] || '';
export function go(p) { location.hash = '#/' + p; }
export function rerender({ keepScroll = true } = {}) { route({ keepScroll }); }

const WORDMARK = '<a class="wordmark" href="#/" aria-label="GovKit home">Gov<span>Kit</span></a>';

function isActive(href) {
  const p = path();
  if (href === 'work') return p === 'work' || p.startsWith('agents/');
  return p === href || p.startsWith(href + '/');
}

function renderTop(crumbs) {
  const s = S();
  const r = s.role ? D.role[s.role] : null;
  const q = r ? queue(s.agents, r.id).filter((x) => x.kind !== 'read' && x.kind !== 'optional').length : 0;
  const theme = document.documentElement.getAttribute('data-theme');
  const dark = theme ? theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const menuOn = (k) => MENUS[k].items.some(([h]) => isActive(h));
  document.getElementById('top').innerHTML = `
    <div class="mast-in">
      ${WORDMARK}
      <nav class="primary" aria-label="Main">
        ${PRIMARY.map(([h, l]) => `<a href="#/${h}" ${isActive(h) ? 'aria-current="page"' : ''}>${l}${h === 'work' && q ? `<sup title="Items waiting for you">${q}</sup>` : ''}</a>`).join('')}
        ${Object.entries(MENUS).map(([k, m]) => `<button class="dd-btn ${menuOn(k) ? 'on' : ''}" data-action="menu" data-menu="${k}" aria-expanded="false" aria-controls="menu-panel">${m.label} ${icon('chevron')}</button>`).join('')}
      </nav>
      <div class="mast-right">
        <button class="icon-btn" data-action="palette" aria-label="Search and jump (Ctrl K)" title="Search (Ctrl K)">${icon('search')}</button>
        <button class="role-link ${r ? '' : 'none'}" data-action="role-menu" aria-haspopup="true" aria-expanded="false" title="The role you are acting as">${r ? `${av(r.id)}<span>${esc(r.name)}</span>` : '<span>Choose your role</span>'}</button>
        <button class="icon-btn" data-action="theme" aria-label="Switch to ${dark ? 'light' : 'dark'} theme" title="Switch theme">${icon(dark ? 'sun' : 'moon')}</button>
        <a class="btn primary mast-cta" href="#/agents/new">Register an agent</a>
        <button class="icon-btn burger" data-action="open-nav" aria-label="Open menu">${icon('menu')}</button>
      </div>
    </div>
    <div class="menu-panel" id="menu-panel" hidden></div>`;
  const sub = document.getElementById('subbar');
  sub.hidden = !crumbs || crumbs.length < 2;
  sub.innerHTML = `<nav class="crumbs" aria-label="Breadcrumb">${(crumbs || []).map(([l, h], i, arr) => i === arr.length - 1 ? `<span aria-current="page">${esc(l)}</span>` : `<a href="${h}">${esc(l)}</a><span class="sep">/</span>`).join('')}</nav>`;
}

function openMenu(key, btn) {
  const panel = document.getElementById('menu-panel');
  const wasOpen = !panel.hidden && panel.dataset.menu === key;
  closeMenus();
  if (wasOpen) return;
  const m = MENUS[key];
  panel.dataset.menu = key;
  panel.innerHTML = `<div class="menu-in"><div class="menu-intro"><h3>${m.label}</h3><p>${m.intro}</p></div>
    <div class="menu-links">${m.items.map(([h, l, d]) => `<a href="#/${h}" ${isActive(h) ? 'aria-current="page"' : ''}><b>${l}</b><span>${d}</span></a>`).join('')}</div></div>`;
  panel.hidden = false;
  btn.setAttribute('aria-expanded', 'true');
}
function closeMenus() {
  const panel = document.getElementById('menu-panel');
  if (panel) panel.hidden = true;
  document.querySelectorAll('[data-action="menu"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
}

// Full-screen navigation for small screens.
function openMobileNav() {
  const s = S();
  const el = document.createElement('div');
  el.className = 'mobile-nav';
  el.innerHTML = `<div class="mobile-nav-top">${WORDMARK}<button class="icon-btn" data-action="close-nav" aria-label="Close menu">${icon('x')}</button></div>
    <nav aria-label="Main">
      <a href="#/">Home</a>${PRIMARY.map(([h, l]) => `<a href="#/${h}">${l}</a>`).join('')}
      ${Object.values(MENUS).map((m) => `<h4>${m.label}</h4>${m.items.map(([h, l]) => `<a class="sub" href="#/${h}">${l}</a>`).join('')}`).join('')}
    </nav>
    <div class="mobile-nav-foot"><a class="btn primary" href="#/agents/new">Register an agent</a><button class="btn" data-action="role-menu">${s.role ? `Acting as ${esc(D.role[s.role].name)}` : 'Choose your role'}</button></div>`;
  document.body.appendChild(el);
  document.body.classList.add('nav-open');
}
function closeMobileNav() {
  document.querySelector('.mobile-nav')?.remove();
  document.body.classList.remove('nav-open');
}

let footDone = false;
function renderFoot() {
  if (footDone) return;
  footDone = true;
  const col = (t, items) => `<div><h4>${t}</h4>${items.map(([h, l]) => `<a href="#/${h}">${l}</a>`).join('')}</div>`;
  document.getElementById('foot').innerHTML = `<div class="foot-in">
    <div class="foot-brand">${WORDMARK}<p>Assurance for AI agents that decide, act and close cases nobody revisits. An open operating model for the SDLC you already run.</p></div>
    ${col('Services', [['services/intake', 'Intake & funding'], ['services/golive', 'Go-live readiness'], ['services/monthly', 'Monthly oversight'], ['services/change', 'Model or prompt change'], ['services/audit', 'Audit & regulator pack']])}
    ${col('Operating model', [['model', 'SDLC map'], ['model/gates', 'Gates'], ['model/tiers', 'Autonomy tiers'], ['artefacts', 'Artefacts'], ['model/references', 'References']])}
    ${col('Workspace', [['tower', 'Control tower'], ['work', 'My work'], ['tools', 'Decision tools'], ['roles', 'Roles & playbooks'], ['help', 'Glossary & FAQ']])}
  </div>
  <div class="foot-base"><span>Operating model draft 0.2 · references checked 23 Sep 2026 · guidance, not legal advice</span><span>Runs entirely in your browser. Nothing is uploaded. <a href="#/about">Privacy &amp; data</a> · Content CC BY 4.0 · Code MIT</span></div>`;
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
  document.title = out.title ? `${out.title} · GovKit` : 'GovKit · Assurance for decisioning AI agents';
  renderTop(out.crumbs);
  renderFoot();
  closeMobileNav();
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
  if (!e.target.closest('#menu-panel') && (!a || a.dataset.action !== 'menu')) closeMenus();
  if (!a) return;
  const act = a.dataset.action;
  if (act === 'open-nav') openMobileNav();
  else if (act === 'close-nav') closeMobileNav();
  else if (act === 'menu') openMenu(a.dataset.menu, a);
  else if (act === 'palette') openPalette();
  else if (act === 'role-menu') { if (a.closest('.mobile-nav')) closeMobileNav(); if (document.getElementById('role-pop')) closePopover(); else openRoleMenu(a); }
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
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenus(); closeMobileNav(); } });
  window.addEventListener('hashchange', () => route());
  // Role changes and imports re-render the current page; form typing saves silently.
  onChange(() => route({ keepScroll: true }));
  route();
  if (!storageOk) toast('Browser storage is blocked, so your work will not be saved after you close this tab. Export to keep it.');
}

boot();
