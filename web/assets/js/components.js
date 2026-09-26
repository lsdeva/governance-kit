// Reusable fragments: role avatars, badges, headers, artefact rows.

import { D, REQ_LABEL, REQ_LONG, raciOf, isOutcome } from './data.js';
import { esc, icon } from './ui.js';
import { STATUS } from './logic.js';

// A stable hue per role so avatars are recognisable across pages.
const HUE = { AE: 28, SP: 45, AOW: 160, PO: 200, ENG: 220, SEC: 350, DO: 280, RC: 10, PLE: 240, IRV: 300, OPS: 120, IA: 60 };
export function av(roleId, cls = '') {
  const h = HUE[roleId] ?? 180;
  return `<span class="av ${cls}" style="background:hsl(${h} 42% 38%);color:#fff" aria-hidden="true">${esc(roleId)}</span>`;
}
export const roleName = (id) => D.role[id]?.name || id;
export const roleLink = (id) => `<a class="chip" href="#/roles/${id}" title="${esc(roleName(id))}">${esc(id)}</a>`;

export const reqBadge = (req) => `<span class="req ${req}" title="${esc(REQ_LONG[req] || '')}">${REQ_LABEL[req] || req}</span>`;
export const statusPill = (s) => `<span class="st ${s}">${STATUS[s] || s}</span>`;
export const aid = (id) => `<span class="aid ${isOutcome(id) ? 'o' : ''}">${id}</span>`;
export const aidBox = (id) => `<span class="aid-box ${isOutcome(id) ? 'o' : ''}">${id}</span>`;

export function pageHead({ eyebrow, title, lede, actions }) {
  return `<header class="page-head">
    ${eyebrow ? `<div class="eyebrow accent">${eyebrow}</div>` : ''}
    <div class="row g16" style="justify-content:space-between;align-items:flex-end"><h1 class="grow">${title}</h1>${actions ? `<div class="row g8">${actions}</div>` : ''}</div>
    ${lede ? `<p class="lede">${lede}</p>` : ''}
  </header>`;
}

export function sectionHead(title, sub, right = '') {
  return `<div class="section-head"><div class="stack g4"><h2>${title}</h2>${sub ? `<p class="muted">${sub}</p>` : ''}</div>${right}</div>`;
}

export function raciInline(artId) {
  const r = D.art[artId].raci;
  const part = (l, ids) => ids.length ? `<span class="row g4"><span class="rc ${l}">${l}</span>${ids.map(roleLink).join('')}</span>` : '';
  return `<div class="row g12">${part('R', r.responsible || [])}${part('A', [r.accountable])}${part('C', r.consulted || [])}${part('I', r.informed || [])}</div>`;
}

export function myRaci(artId, role) {
  if (!role) return '';
  return raciOf(artId, role).map((l) => `<span class="rc ${l}" title="${esc(roleName(role))}: ${{ R: 'responsible', A: 'accountable', C: 'consulted', I: 'informed' }[l]}">${l}</span>`).join('');
}

export function rolePrompt(what = 'see your own queue') {
  return `<div class="callout info">${icon('users')}<div class="grow"><b>Choose the role you are acting as</b> to ${what}. <button class="btn sm" data-action="role-menu" style="margin-left:6px">Choose role</button></div></div>`;
}

export function kindBadge(kind) {
  const k = { process: 'Process', outcome: 'Outcome', unknown: 'Unknown' }[kind] || kind;
  return `<span class="badge ${kind}"><span class="dot"></span>${k}</span>`;
}

export function artBadges(a) {
  const b = [];
  if (a.go_live_minimum) b.push('<span class="badge ink" title="Part of the go-live minimum for T3 and T4">Go-live min</span>');
  if (a.outcome_evidence) b.push('<span class="badge outcome" title="Carries outcome evidence">Outcome</span>');
  if (a.platform_emitted) b.push('<span class="badge process" title="Emitted automatically by the platform">Auto-emitted</span>');
  if (a.no_published_source) b.push('<span class="badge warn" title="No published agent-specific method exists">No published source</span>');
  return b.join('');
}

export function refStatus(s) {
  if (!s) return '';
  if (s.startsWith('verified')) return `<span class="badge ok" title="${esc(s)}">${icon('check')}Verified</span>`;
  return '<span class="badge warn" title="Cited as in the source reference, not re-checked">Per source ref</span>';
}
