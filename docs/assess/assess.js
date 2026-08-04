/*
 * GovKit — role-based readiness assessment.
 *
 * Entirely client-side. No network calls beyond fetching assessment-data.json
 * from this same site, and no analytics. Answers live in memory and, if the
 * user opts in by answering anything, in localStorage under a single key that
 * the "Clear my data" button removes.
 *
 * The question bank, roles, and template links all come from the JSON, which is
 * generated from data/*.yml by tools/build_content.py. Nothing about the
 * content is hard-coded here.
 */
(function () {
  "use strict";

  var STORAGE_KEY = "gk-assessment-v1";
  var SNAPSHOT_KEY = "gk-snapshots-v1";

  // Resolved per mount, not at parse time: with Material's instant
  // navigation the script runs once but the page element is replaced on
  // every internal link.
  var root = null;
  var DATA = null;
  var state = null;

  function freshState() {
    return {
      step: "roles", // roles | questions | report
      roles: [],
      answers: {}, // qid -> {value: 'yes'|'partial'|'no'|'na', note: string}
      audience: "board",
      category: null, // active category filter in the questionnaire
      section: 0,     // index into the section list; one category per screen
      viewAll: false  // expert escape hatch: the whole questionnaire at once
    };
  }

  var ANSWERS = [
    { value: "yes", label: "Yes — fully in place",
      hint: "In place and operating today" },
    { value: "partial", label: "Partly — some elements exist",
      hint: "Started, or only in some areas" },
    { value: "no", label: "No — not in place",
      hint: "Not in place today" },
    { value: "na", label: "Not applicable",
      hint: "Does not apply to us — say why" }
  ];

  var AUDIENCES = [
    {
      id: "board",
      label: "Board",
      blurb: "Risk posture and the decisions being asked of you.",
      lead: "risk"
    },
    {
      id: "regulator",
      label: "Regulator",
      blurb: "Obligation-by-obligation coverage, with evidence gaps named.",
      lead: "obligations"
    },
    {
      id: "exec",
      label: "Exec team",
      blurb: "Where we stand, what it will take, and what is at stake.",
      lead: "summary"
    },
    {
      id: "team",
      label: "Working team",
      blurb: "The concrete next actions and which template to use for each.",
      lead: "actions"
    }
  ];

  // ---------------------------------------------------------------- utilities

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      // null/undefined means "omit this attribute". Without this, passing
      // disabled:null would render disabled="null", which browsers honour as
      // disabled — the opposite of what was intended.
      if (v === null || v === undefined || v === false) return;
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.indexOf("on") === 0) node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    });
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        roles: state.roles, answers: state.answers, audience: state.audience,
        savedAt: new Date().toISOString()
      }));
    } catch (e) { /* private mode, quota — carry on in memory */ }
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) { return null; }
  }

  /*
   * Snapshots — self-comparison over time.
   *
   * This kit holds no peer-benchmark data, because producing it honestly would
   * mean collecting users' answers on a server. Trend against your own baseline
   * is the comparison it CAN make truthfully, and it happens to be the one a
   * board asks for: "are we improving?" more often than "how do we compare?".
   */
  function loadSnapshots() {
    try { return JSON.parse(localStorage.getItem(SNAPSHOT_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveSnapshot(s) {
    var all = loadSnapshots();
    all.push({
      date: todayISO(),
      at: new Date().toISOString(),
      roles: state.roles.slice(),
      overall: s.overall,
      band: s.band ? s.band.label : null,
      answered: s.answered,
      total: s.total,
      categories: s.categories.map(function (c) {
        return { name: c.name, pct: c.pct };
      })
    });
    // Keep a sensible history without letting storage grow unbounded.
    if (all.length > 24) all = all.slice(all.length - 24);
    try { localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(all)); } catch (e) {}
    return all;
  }

  /* Only compare like with like: same roles, or the delta is meaningless. */
  function comparableSnapshots() {
    var mine = state.roles.slice().sort().join(",");
    return loadSnapshots().filter(function (s) {
      return (s.roles || []).slice().sort().join(",") === mine;
    });
  }

  function clearData() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    state.roles = [];
    state.answers = {};
    state.audience = "board";
    state.category = null;
    state.step = "roles";
    render();
  }

  // ------------------------------------------------------------------ scoring

  /*
   * Questions for the selected roles, grouped by category.
   *
   * Sorting by category matters: the questionnaire prints a heading whenever
   * the category changes, so leaving these in bank order would repeat headings
   * ("Documentation" twice, etc.) as the bank interleaves categories. Ties are
   * broken by id so the order is stable between renders.
   */
  function activeQuestions() {
    if (!state.roles.length) return [];
    var qs = DATA.questions.filter(function (q) {
      return q.roles.some(function (r) { return state.roles.indexOf(r) !== -1; });
    });
    return qs.sort(function (a, b) {
      var d = DATA.categories.indexOf(a.category) - DATA.categories.indexOf(b.category);
      return d !== 0 ? d : a.id.localeCompare(b.id);
    });
  }

  function factorFor(value) {
    if (value === "yes") return 1;
    if (value === "partial") return 0.5;
    return 0; // "no"; "na" is excluded before this is called
  }

  /*
   * Score = earned weight / applicable weight, per category and overall.
   * "N/A" is excluded from BOTH numerator and denominator, so marking something
   * not applicable never helps or harms the score. Unanswered questions are
   * likewise excluded, so a partially-complete assessment still reports a
   * meaningful score for what has been answered.
   */
  function score() {
    var qs = activeQuestions();
    var cats = {};
    var totalEarned = 0, totalPossible = 0, answered = 0, na = 0;

    qs.forEach(function (q) {
      var a = state.answers[q.id];
      if (!a || !a.value) return;
      answered++;
      if (a.value === "na") { na++; return; }
      var c = cats[q.category] || (cats[q.category] = { earned: 0, possible: 0, gaps: [] });
      c.earned += q.weight * factorFor(a.value);
      c.possible += q.weight;
      totalEarned += q.weight * factorFor(a.value);
      totalPossible += q.weight;
      if (a.value === "no" || a.value === "partial") {
        c.gaps.push({ q: q, answer: a.value, note: a.note || "" });
      }
    });

    var categories = DATA.categories.filter(function (name) {
      return cats[name];
    }).map(function (name) {
      var c = cats[name];
      return {
        name: name,
        pct: c.possible ? Math.round((c.earned / c.possible) * 100) : null,
        earned: c.earned,
        possible: c.possible,
        gaps: c.gaps
      };
    });

    var overall = totalPossible ? Math.round((totalEarned / totalPossible) * 100) : null;
    var band = null;
    if (overall !== null) {
      for (var i = 0; i < DATA.bands.length; i++) {
        if (overall >= DATA.bands[i].min) { band = DATA.bands[i]; break; }
      }
    }

    /* Gaps ranked by severity: weight first, then a full "no" above a partial. */
    var gaps = [];
    categories.forEach(function (c) {
      c.gaps.forEach(function (g) { gaps.push(g); });
    });
    gaps.sort(function (a, b) {
      if (b.q.weight !== a.q.weight) return b.q.weight - a.q.weight;
      if (a.answer !== b.answer) return a.answer === "no" ? -1 : 1;
      return a.q.id.localeCompare(b.q.id);
    });

    return {
      overall: overall, band: band, categories: categories, gaps: gaps,
      total: qs.length, answered: answered, na: na
    };
  }

  /* Templates that close the most (and most severe) open gaps. */
  function recommendedTemplates(gaps) {
    var tally = {};
    gaps.forEach(function (g) {
      (g.q.templates || []).forEach(function (tid) {
        if (!DATA.templates[tid]) return;
        var t = tally[tid] || (tally[tid] = { id: tid, weight: 0, count: 0, qs: [] });
        t.weight += g.q.weight * (g.answer === "no" ? 1 : 0.5);
        t.count++;
        t.qs.push(g.q.id);
      });
    });
    return Object.keys(tally).map(function (k) { return tally[k]; })
      .sort(function (a, b) { return b.weight - a.weight || b.count - a.count; });
  }

  // ------------------------------------------------------------- role picker

  function viewRoles() {
    var wrap = el("div", { class: "gk-step" });

    wrap.appendChild(el("h1", {}, ["Readiness assessment"]));
    wrap.appendChild(el("p", { class: "gk-lede" }, [
      "Answer the questions that apply to your role, and get a report you can " +
      "present — showing where you stand, the gaps that matter most, and which " +
      "templates close them."
    ]));

    wrap.appendChild(el("div", { class: "gk-privacy" }, [
      el("strong", {}, ["Nothing leaves your browser."]),
      el("span", {}, [
        " Your answers are never uploaded — there is no server to send them to. " +
        "They are saved locally on this device so you can come back to them, and " +
        "you can erase them at any time."
      ])
    ]));

    wrap.appendChild(el("p", { class: "gk-muted" }, [
      "Scores are a weighted measure of which obligations you can evidence. " +
      "The thresholds are editorial judgement, not industry benchmarks, and " +
      "this kit holds no peer-comparison data — ",
      el("a", { href: "../scoring/" }, ["how scoring works"]),
      " explains the method and its limits."
    ]));

    wrap.appendChild(el("h2", {}, ["1. Who is answering?"]));
    wrap.appendChild(el("p", { class: "gk-muted" }, [
      "Pick one or more. You will only be asked questions relevant to those roles."
    ]));

    var grid = el("div", { class: "gk-roles" });
    DATA.roles.forEach(function (r) {
      var on = state.roles.indexOf(r.id) !== -1;
      var card = el("button", {
        class: "gk-role" + (on ? " is-on" : ""),
        type: "button",
        "aria-pressed": on ? "true" : "false",
        onclick: function () {
          var i = state.roles.indexOf(r.id);
          if (i === -1) state.roles.push(r.id); else state.roles.splice(i, 1);
          save(); render();
        }
      }, [
        el("span", { class: "gk-role-check", "aria-hidden": "true" }, [on ? "✓" : ""]),
        el("span", { class: "gk-role-name" }, [r.name]),
        el("span", { class: "gk-role-short" }, [r.short]),
        el("span", { class: "gk-role-count" }, [r.questionCount + " questions"])
      ]);
      grid.appendChild(card);
    });
    wrap.appendChild(grid);

    var n = activeQuestions().length;
    var bar = el("div", { class: "gk-actions" });
    bar.appendChild(el("button", {
      class: "gk-btn gk-btn-primary",
      type: "button",
      disabled: state.roles.length ? null : "disabled",
      onclick: function () { state.step = "questions"; save(); render(); }
    }, [state.roles.length ? "Start — " + n + " questions" : "Select a role to begin"]));

    if (Object.keys(state.answers).length) {
      bar.appendChild(el("button", {
        class: "gk-btn", type: "button",
        onclick: function () { state.step = "report"; render(); }
      }, ["Skip to report"]));
    }
    wrap.appendChild(bar);

    if (Object.keys(state.answers).length) {
      wrap.appendChild(el("p", { class: "gk-muted gk-resume" }, [
        "Resuming a saved assessment — " + Object.keys(state.answers).length +
        " answers on this device."
      ]));
    }

    wrap.appendChild(clearButton());
    return wrap;
  }

  function clearButton() {
    return el("div", { class: "gk-clear" }, [
      el("button", {
        class: "gk-btn gk-btn-danger", type: "button",
        onclick: function () {
          if (window.confirm(
            "Erase your saved answers from this browser?\n\nThis cannot be undone."
          )) clearData();
        }
      }, ["Clear my data"]),
      el("span", { class: "gk-muted" }, [
        " Removes every answer stored on this device."
      ])
    ]);
  }

  // ------------------------------------------------------------ questionnaire

  /* The ordered list of sections actually in play for the chosen roles. */
  function sectionList() {
    var qs = activeQuestions();
    var cats = [];
    qs.forEach(function (q) {
      if (cats.indexOf(q.category) === -1) cats.push(q.category);
    });
    return cats.sort(function (a, b) {
      return DATA.categories.indexOf(a) - DATA.categories.indexOf(b);
    }).map(function (c) {
      var inCat = qs.filter(function (q) { return q.category === c; });
      return {
        name: c,
        questions: inCat,
        done: inCat.filter(function (q) {
          return state.answers[q.id] && state.answers[q.id].value;
        }).length
      };
    });
  }

  function viewQuestions() {
    var qs = activeQuestions();
    var sections = sectionList();
    var wrap = el("div", { class: "gk-step" });

    // Clamp: a role change can shrink the section list under a stale index.
    if (state.section >= sections.length) state.section = 0;
    if (state.section < 0) state.section = 0;

    var done = qs.filter(function (q) {
      return state.answers[q.id] && state.answers[q.id].value;
    }).length;
    var pct = qs.length ? Math.round((done / qs.length) * 100) : 0;
    var sec = sections[state.section];

    var head = el("div", { class: "gk-qhead" });
    head.appendChild(el("p", { class: "gk-muted" }, [
      "Answering as: " + state.roles.map(function (id) {
        var r = DATA.roles.find(function (x) { return x.id === id; });
        return r ? r.name : id;
      }).join(", ") + ". ",
      el("button", {
        class: "gk-link", type: "button",
        onclick: function () { state.step = "roles"; render(); }
      }, ["Change"])
    ]));

    if (state.viewAll) {
      head.appendChild(el("h1", {}, ["All questions"]));
    } else if (sec) {
      head.appendChild(el("p", { class: "gk-sec-kicker" }, [
        "Section " + (state.section + 1) + " of " + sections.length
      ]));
      head.appendChild(el("h1", {}, [sec.name]));
      head.appendChild(el("p", { class: "gk-muted" }, [
        sec.questions.length + " question" +
        (sec.questions.length === 1 ? "" : "s") + " · about " +
        Math.max(1, Math.round(sec.questions.length * 0.75)) + " min · " +
        sec.done + " of " + sec.questions.length + " answered"
      ]));
    }

    head.appendChild(el("div", { class: "gk-progress" }, [
      el("div", { class: "gk-progress-bar" }, [
        el("div", { class: "gk-progress-fill", style: "width:" + pct + "%" })
      ]),
      el("div", { class: "gk-progress-label" }, [
        done + " of " + qs.length + " answered"
      ])
    ]));
    wrap.appendChild(head);

    // Section rail: shows where you are and lets you jump. Doubles as the
    // category filter the previous design used.
    var rail = el("div", { class: "gk-filter gk-sec-rail" });
    sections.forEach(function (s, i) {
      var complete = s.done === s.questions.length;
      rail.appendChild(chip(
        s.name,
        !state.viewAll && i === state.section,
        function () { state.viewAll = false; state.section = i; render();
                      window.scrollTo(0, 0); },
        s.questions.length, complete
      ));
    });
    rail.appendChild(chip("View all questions", state.viewAll, function () {
      state.viewAll = !state.viewAll; render(); window.scrollTo(0, 0);
    }, qs.length));
    wrap.appendChild(rail);

    var shown = state.viewAll ? qs : (sec ? sec.questions : []);
    var currentCat = null;
    shown.forEach(function (q) {
      if (state.viewAll && q.category !== currentCat) {
        currentCat = q.category;
        wrap.appendChild(el("h2", { class: "gk-cat" }, [currentCat]));
      }
      wrap.appendChild(questionCard(q));
    });

    wrap.appendChild(sectionFooter(sections, qs, done));
    wrap.appendChild(clearButton());
    return wrap;
  }

  /* Sticky footer: Back | n of m answered | Save & exit | Continue. */
  function sectionFooter(sections, qs, done) {
    var bar = el("div", { class: "gk-secfoot" });
    var remaining = qs.length - done;
    var last = state.viewAll || state.section >= sections.length - 1;

    function goReport() {
      state.step = "report"; window.scrollTo(0, 0); render();
    }

    if (!state.viewAll && state.section > 0) {
      bar.appendChild(el("button", {
        class: "gk-btn", type: "button",
        onclick: function () {
          state.section--; render(); window.scrollTo(0, 0);
        }
      }, ["← Back"]));
    }

    bar.appendChild(el("span", { class: "gk-secfoot-count" }, [
      done + " of " + qs.length + " answered · saved in this browser"
    ]));

    // "Save & exit" is honest here: everything is already saved, so this is
    // just a way out that says so.
    bar.appendChild(el("a", {
      class: "gk-btn gk-secfoot-exit",
      href: (document.querySelector(".gk-home") ? "" : "../") + "workspace/"
    }, ["Save & exit"]));

    if (!last) {
      var next = sections[state.section + 1];
      bar.appendChild(el("button", {
        class: "gk-btn gk-btn-primary", type: "button",
        onclick: function () {
          state.section++; render(); window.scrollTo(0, 0);
        }
      }, ["Continue to " + (next ? next.name : "next") + " →"]));
    } else if (remaining > 0 && done > 0) {
      bar.appendChild(el("button", {
        class: "gk-btn gk-btn-primary", type: "button",
        onclick: function () {
          // Jump to the first section that still has unanswered questions.
          for (var i = 0; i < sections.length; i++) {
            if (sections[i].done < sections[i].questions.length) {
              state.viewAll = false; state.section = i; break;
            }
          }
          render(); window.scrollTo(0, 0);
        }
      }, ["Finish " + remaining + " remaining question" +
          (remaining === 1 ? "" : "s")]));
      bar.appendChild(el("button", {
        class: "gk-btn", type: "button", onclick: goReport
      }, ["Preview partial report"]));
    } else {
      bar.appendChild(el("button", {
        class: "gk-btn gk-btn-primary", type: "button",
        disabled: done ? null : "disabled",
        onclick: goReport
      }, [done ? "See your report" : "Answer a question to see your report"]));
    }
    return bar;
  }

  function chip(label, on, fn, count, complete) {
    return el("button", {
      class: "gk-chip" + (on ? " is-on" : "") + (complete ? " is-done" : ""),
      type: "button", onclick: fn
    }, [label, el("span", { class: "gk-chip-n" }, [String(count)])]);
  }

  /* A collapsed section. Uses <details>, so it is keyboard-operable and
     searchable by the browser's find-in-page without any extra wiring. */
  function disclosure(summaryText, children, open) {
    var d = el("details", { class: "gk-q-more" }, [
      el("summary", {}, [summaryText])
    ]);
    if (open) d.setAttribute("open", "open");
    children.forEach(function (c) { if (c) d.appendChild(c); });
    return d;
  }

  function questionCard(q) {
    var a = state.answers[q.id] || {};
    var card = el("div", {
      class: "gk-q" + (a.value ? " is-answered" : ""),
      "data-qid": q.id
    });

    // Severity stays visible — it is how a reader judges what matters — but
    // the article reference moves into the disclosure with the rest of the
    // legal detail.
    card.appendChild(el("div", { class: "gk-q-meta" }, [
      el("span", { class: "gk-q-id" }, [q.id]),
      q.weight >= 5 ? el("span", { class: "gk-sev gk-sev-5" }, ["Critical"]) :
        q.weight === 4 ? el("span", { class: "gk-sev gk-sev-4" }, ["High"]) : null
    ]));
    card.appendChild(el("p", { class: "gk-q-text" }, [q.text]));
    card.appendChild(el("p", { class: "gk-q-help" }, [q.help]));

    var opts = el("div", { class: "gk-opts", role: "group", "aria-label": q.text });
    ANSWERS.forEach(function (opt) {
      var on = a.value === opt.value;
      opts.appendChild(el("button", {
        class: "gk-opt gk-opt-" + opt.value + (on ? " is-on" : ""),
        type: "button",
        "aria-pressed": on ? "true" : "false",
        title: opt.hint,
        onclick: function () {
          var cur = state.answers[q.id] || {};
          if (cur.value === opt.value) delete state.answers[q.id];
          else state.answers[q.id] = {
            value: opt.value, note: cur.note || "", naWhy: cur.naWhy || ""
          };
          save(); render();
          announce(q, state.answers[q.id]);
        }
      }, [opt.label]));
    });
    card.appendChild(opts);

    // "Not applicable" without a reason is the least defensible answer in the
    // set, so ask for one at the point of choosing it.
    if (a.value === "na") {
      var why = el("textarea", {
        class: "gk-note gk-na-why", rows: "1",
        "aria-label": "Explain why this does not apply",
        placeholder: "Explain why this does not apply — this goes in the record",
        oninput: function (e) {
          var cur = state.answers[q.id] || { value: "na" };
          cur.naWhy = e.target.value;
          state.answers[q.id] = cur;
          save();
        }
      });
      why.value = a.naWhy || "";
      card.appendChild(why);
    }

    // ---- everything below is collapsed by default --------------------------
    var more = el("div", { class: "gk-q-more-row" });
    card.appendChild(more);

    if (q.obligation && (q.obligation.detail || q.obligation.ref)) {
      more.appendChild(disclosure("Why this matters", [
        el("p", { class: "gk-q-more-body" }, [
          q.obligation.detail || q.obligation.label || ""
        ]),
        q.obligation.ref
          ? el("p", { class: "gk-q-ref" }, [q.obligation.ref]) : null
      ]));
    }

    if (q.evidence) {
      more.appendChild(disclosure("What counts as evidence", [
        el("p", { class: "gk-q-more-body" }, [q.evidence])
      ]));
    }

    var note = el("textarea", {
      class: "gk-note", rows: "2",
      "aria-label": "Notes for " + q.id,
      placeholder: "Evidence, caveat, or who owns this",
      oninput: function (e) {
        var cur = state.answers[q.id] || { value: "" };
        cur.note = e.target.value;
        state.answers[q.id] = cur;
        save();
      }
    });
    note.value = a.note || "";
    more.appendChild(disclosure(
      a.note ? "Notes (added)" : "Add notes", [note], !!a.note));

    if (q.templates && q.templates.length) {
      var links = el("div", { class: "gk-q-tpl" });
      q.templates.slice(0, 3).forEach(function (tid, i) {
        var tpl = DATA.templates[tid];
        if (!tpl) return;
        if (i) links.appendChild(document.createTextNode(" · "));
        links.appendChild(el("a", { href: tpl.url }, [tpl.title]));
      });
      more.appendChild(disclosure("Templates that help", [links]));
    }

    return card;
  }

  /* Announce an answer change for screen readers: the visual state change is
     invisible to them otherwise. */
  function announce(q, ans) {
    var live = document.getElementById("gk-answer-live");
    if (!live) {
      live = el("p", {
        id: "gk-answer-live", class: "gk-sr-only",
        role: "status", "aria-live": "polite"
      });
      (root || document.body).appendChild(live);
    }
    var label = "cleared";
    if (ans && ans.value) {
      ANSWERS.forEach(function (o) {
        if (o.value === ans.value) label = o.label;
      });
    }
    live.textContent = q.id + " answered: " + label;
  }

  // -------------------------------------------------------------------- report

  function viewReport() {
    var s = score();
    var wrap = el("div", { class: "gk-step gk-report" });

    // Controls are hidden in print via CSS.
    var controls = el("div", { class: "gk-report-controls" });
    controls.appendChild(el("span", { class: "gk-muted" }, ["Report for: "]));
    AUDIENCES.forEach(function (aud) {
      controls.appendChild(el("button", {
        class: "gk-chip" + (state.audience === aud.id ? " is-on" : ""),
        type: "button", title: aud.blurb,
        onclick: function () { state.audience = aud.id; save(); render(); }
      }, [aud.label]));
    });
    wrap.appendChild(controls);

    var exports = el("div", { class: "gk-report-controls" });
    exports.appendChild(el("button", {
      class: "gk-btn", type: "button", onclick: function () { window.print(); }
    }, ["Print / Save as PDF"]));
    exports.appendChild(el("button", {
      class: "gk-btn", type: "button",
      onclick: function () { download(markdownReport(s), "md", "text/markdown"); }
    }, ["Download Markdown"]));
    exports.appendChild(el("button", {
      class: "gk-btn", type: "button",
      onclick: function () { download(htmlReport(s), "html", "text/html"); }
    }, ["Download HTML"]));
    exports.appendChild(el("button", {
      class: "gk-btn", type: "button",
      onclick: function () { state.step = "questions"; render(); }
    }, ["Back to questions"]));
    wrap.appendChild(exports);

    if (s.overall === null) {
      wrap.appendChild(el("div", { class: "gk-empty" }, [
        el("h1", {}, ["No answers yet"]),
        el("p", {}, ["Answer at least one question to generate a report."])
      ]));
      wrap.appendChild(clearButton());
      return wrap;
    }

    var aud = AUDIENCES.filter(function (a) { return a.id === state.audience; })[0];

    // ---- header
    var head = el("header", { class: "gk-rhead" });
    head.appendChild(el("h1", {}, ["Data & AI Governance — Readiness Report"]));
    head.appendChild(el("p", { class: "gk-rmeta" }, [
      el("strong", {}, [aud.label + " view"]),
      " · " + todayISO() + " · " +
      state.roles.map(function (id) {
        var r = DATA.roles.find(function (x) { return x.id === id; });
        return r ? r.name : id;
      }).join(", ")
    ]));
    wrap.appendChild(head);

    // ---- headline score
    var band = s.band || { label: "—", blurb: "" };
    var scoreBox = el("section", { class: "gk-score" }, [
      el("div", { class: "gk-score-num", "data-band": band.label }, [
        el("span", { class: "gk-score-value" }, [String(s.overall)]),
        el("span", { class: "gk-score-pct" }, ["%"])
      ]),
      el("div", { class: "gk-score-text" }, [
        el("h2", {}, [band.label]),
        el("p", {}, [band.blurb]),
        el("p", { class: "gk-muted" }, [
          s.answered + " of " + s.total + " questions answered" +
          (s.na ? " · " + s.na + " marked not applicable" : "")
        ])
      ])
    ]);
    // Actions come before the score for every audience.
    var top3 = topActionsBlock(s);
    if (top3) wrap.appendChild(top3);

    wrap.appendChild(scoreBox);

    // Say plainly what the number does and does not cover. Unanswered areas
    // are excluded from the maths entirely, so a partial score is not a
    // readiness score and must not be presented as one.
    var unanswered = s.total - s.answered;
    if (unanswered > 0) {
      wrap.appendChild(el("div", { class: "gk-partial" }, [
        el("strong", {}, [
          "Partial result — " + s.answered + " of " + s.total + " answered. "
        ]),
        el("span", {}, [
          "Unanswered areas are not included in this score. This is not your " +
          "final readiness score."
        ]),
        el("button", {
          class: "gk-btn gk-btn-small", type: "button",
          onclick: function () { state.step = "questions"; window.scrollTo(0, 0); render(); }
        }, ["Finish the remaining " + unanswered])
      ]));
    }

    // Audience framing sentence.
    wrap.appendChild(el("p", { class: "gk-framing" }, [framingFor(state.audience, s)]));

    wrap.appendChild(trendBlock(s));

    // ---- sections in audience-specific order
    var blocks = {
      categories: categoriesBlock(s),
      gaps: gapsBlock(s),
      obligations: obligationsBlock(s),
      actions: actionsBlock(s)
    };

    // Every audience now sees the three priority actions FIRST. A score
    // without a next step is a number to argue about; an action list is work.
    var order;
    if (state.audience === "board") order = ["gaps", "categories"];
    else if (state.audience === "regulator") order = ["obligations", "categories", "gaps"];
    else if (state.audience === "team") order = ["gaps", "categories"];
    else order = ["categories", "gaps"];

    order.forEach(function (k) { if (blocks[k]) wrap.appendChild(blocks[k]); });

    wrap.appendChild(el("footer", { class: "gk-rfoot" }, [
      el("p", {}, [
        el("strong", {}, ["Not legal advice. "]),
        "This report is a planning aid generated from a self-assessment. It is " +
        "not exhaustive, and not a substitute for legal analysis of your " +
        "circumstances. Confirm obligations with qualified counsel and the " +
        "official EU sources."
      ]),
      el("p", {}, [
        el("strong", {}, ["About the score. "]),
        "Scoring thresholds are editorial judgement, not empirical benchmarks, " +
        "and this kit holds no peer-comparison data. The score measures which " +
        "obligations you can evidence, not whether the controls behind them " +
        "work. ",
        el("a", { href: "../scoring/" }, ["How scoring works"]),
        " sets out the method and its limitations."
      ]),
      el("p", { class: "gk-muted" }, [
        "Generated " + todayISO() + " with GovKit. " +
        "Self-assessed; answers were not verified."
      ])
    ]));

    wrap.appendChild(clearButton());
    return wrap;
  }

  function framingFor(audience, s) {
    var critical = s.gaps.filter(function (g) { return g.q.weight >= 5; }).length;
    if (audience === "board") {
      return "Overall readiness is " + s.overall + "%. " +
        (critical ? critical + " gap" + (critical === 1 ? "" : "s") +
          " carry regulatory or board-level exposure and are listed first." :
          "No critical-severity gaps were identified in the answers given.") +
        " The decisions required of the board are the resourcing implied by the " +
        "priority actions.";
    }
    if (audience === "regulator") {
      return "This is a self-assessment of obligation coverage as at " + todayISO() +
        ", covering " + s.answered + " assessed items. Gaps are stated openly, " +
        "with the remediation route identified for each.";
    }
    if (audience === "team") {
      return "Here is what to pick up next, ordered by severity. Each action " +
        "names the template that gives you a starting point.";
    }
    return "Overall readiness is " + s.overall + "% across " + s.categories.length +
      " areas. The strongest and weakest areas are shown below, with the " +
      "investment implied by closing the top gaps.";
  }

  /*
   * Movement against your own previous assessments.
   *
   * Deliberately NOT a peer comparison — see the "How scoring works" page for
   * why this kit holds no benchmark data.
   */
  function trendBlock(s) {
    var sec = el("section", { class: "gk-block gk-trend" });
    var history = comparableSnapshots();

    sec.appendChild(el("h2", {}, ["Movement over time"]));

    if (!history.length) {
      sec.appendChild(el("p", { class: "gk-muted" }, [
        "No earlier assessment saved for these roles. Save a snapshot to start " +
        "tracking movement — it is the comparison this tool can make honestly, " +
        "since it holds no peer benchmark data."
      ]));
    } else {
      var prev = history[history.length - 1];
      var delta = s.overall - prev.overall;
      var word = delta > 0 ? "up" : delta < 0 ? "down" : "unchanged";
      sec.appendChild(el("p", {}, [
        el("strong", {
          class: "gk-delta " + (delta > 0 ? "is-up" : delta < 0 ? "is-down" : "")
        }, [(delta > 0 ? "+" : "") + delta + " points"]),
        " " + word + " from " + prev.overall + "% on " + prev.date + "."
      ]));

      var tbl = el("table", { class: "gk-table" });
      tbl.appendChild(el("thead", {}, [el("tr", {}, [
        el("th", {}, ["Date"]), el("th", {}, ["Score"]),
        el("th", {}, ["Band"]), el("th", {}, ["Answered"])
      ])]));
      var tb = el("tbody");
      history.slice(-6).forEach(function (h) {
        tb.appendChild(el("tr", {}, [
          el("td", {}, [h.date]),
          el("td", {}, [h.overall + "%"]),
          el("td", {}, [h.band || "—"]),
          el("td", {}, [h.answered + " of " + h.total])
        ]));
      });
      tb.appendChild(el("tr", { class: "gk-trend-now" }, [
        el("td", {}, ["Now (" + todayISO() + ")"]),
        el("td", {}, [s.overall + "%"]),
        el("td", {}, [s.band ? s.band.label : "—"]),
        el("td", {}, [s.answered + " of " + s.total])
      ]));
      tbl.appendChild(tb);
      sec.appendChild(tbl);
    }

    var bar = el("div", { class: "gk-report-controls" });
    bar.appendChild(el("button", {
      class: "gk-btn", type: "button",
      onclick: function () {
        saveSnapshot(s);
        render();
      }
    }, ["Save snapshot"]));
    if (history.length) {
      bar.appendChild(el("button", {
        class: "gk-btn gk-btn-danger", type: "button",
        onclick: function () {
          if (!window.confirm("Delete all saved snapshots?\n\nThis cannot be undone.")) return;
          try { localStorage.removeItem(SNAPSHOT_KEY); } catch (e) {}
          render();
        }
      }, ["Clear snapshots"]));
    }
    sec.appendChild(bar);

    sec.appendChild(el("p", { class: "gk-muted" }, [
      "Snapshots are stored in this browser only, and compared against " +
      "assessments taken with the same roles selected. This kit holds no " +
      "peer-comparison data — see how scoring works for why."
    ]));
    return sec;
  }

  function categoriesBlock(s) {
    var sec = el("section", { class: "gk-block" });
    sec.appendChild(el("h2", {}, ["Score by category"]));
    var list = el("div", { class: "gk-cats" });
    s.categories.slice().sort(function (a, b) { return a.pct - b.pct; })
      .forEach(function (c) {
        list.appendChild(el("div", { class: "gk-catrow" }, [
          el("div", { class: "gk-catname" }, [c.name]),
          el("div", { class: "gk-catbar" }, [
            el("div", {
              class: "gk-catfill " + tone(c.pct),
              style: "width:" + c.pct + "%"
            })
          ]),
          el("div", { class: "gk-catpct" }, [c.pct + "%"])
        ]));
      });
    sec.appendChild(list);
    return sec;
  }

  function tone(pct) {
    if (pct >= 80) return "is-good";
    if (pct >= 50) return "is-mid";
    return "is-bad";
  }

  function gapsBlock(s) {
    var sec = el("section", { class: "gk-block" });
    sec.appendChild(el("h2", {}, ["Top gaps by severity"]));
    if (!s.gaps.length) {
      sec.appendChild(el("p", {}, ["No gaps recorded in the answers given."]));
      return sec;
    }
    var top = s.gaps.slice(0, 10);
    var tbl = el("table", { class: "gk-table" });
    tbl.appendChild(el("thead", {}, [el("tr", {}, [
      el("th", {}, ["Gap"]), el("th", {}, ["Severity"]),
      el("th", {}, ["Status"]), el("th", {}, ["Evidence needed"]),
      el("th", {}, ["Fix with"])
    ])]));
    var tb = el("tbody");
    top.forEach(function (g) {
      var tpl = el("td");
      (g.q.templates || []).slice(0, 2).forEach(function (tid, i) {
        var t = DATA.templates[tid];
        if (!t) return;
        if (i) tpl.appendChild(document.createTextNode(" · "));
        tpl.appendChild(el("a", { href: t.url }, [t.title]));
      });
      tb.appendChild(el("tr", {}, [
        el("td", {}, [
          el("div", {}, [g.q.text]),
          g.note ? el("div", { class: "gk-note-shown" }, ["Note: " + g.note]) : null,
          g.q.obligation && g.q.obligation.ref
            ? el("div", { class: "gk-muted" }, [g.q.obligation.ref]) : null
        ]),
        el("td", {}, [sevLabel(g.q.weight)]),
        el("td", {}, [g.answer === "no" ? "Not in place" : "Partial"]),
        el("td", { class: "gk-ev-cell" }, [g.q.evidence || "—"]),
        tpl
      ]));
    });
    tbl.appendChild(tb);
    sec.appendChild(tbl);
    if (s.gaps.length > top.length) {
      sec.appendChild(el("p", { class: "gk-muted" }, [
        "Showing the 10 most severe of " + s.gaps.length + " gaps."
      ]));
    }
    return sec;
  }

  function sevLabel(w) {
    if (w >= 5) return "Critical";
    if (w === 4) return "High";
    if (w === 3) return "Medium";
    return "Low";
  }

  function obligationsBlock(s) {
    var sec = el("section", { class: "gk-block" });
    sec.appendChild(el("h2", {}, ["Obligation coverage"]));
    sec.appendChild(el("p", { class: "gk-muted" }, [
      "Every assessed item, with the obligation it relates to and the position " +
      "declared. Items marked not applicable are excluded from scoring."
    ]));
    var tbl = el("table", { class: "gk-table" });
    tbl.appendChild(el("thead", {}, [el("tr", {}, [
      el("th", {}, ["Ref"]), el("th", {}, ["Obligation"]),
      el("th", {}, ["Assessed item"]), el("th", {}, ["Position"])
    ])]));
    var tb = el("tbody");
    activeQuestions().forEach(function (q) {
      var a = state.answers[q.id];
      if (!a || !a.value) return;
      var pos = a.value === "yes" ? "Met" : a.value === "partial" ? "Partially met"
        : a.value === "na" ? "Not applicable" : "Not met";
      tb.appendChild(el("tr", { class: a.value === "no" ? "is-bad-row" : "" }, [
        el("td", {}, [(q.obligation && q.obligation.ref) || "—"]),
        el("td", {}, [(q.obligation && q.obligation.label) || q.category]),
        el("td", {}, [
          el("div", {}, [q.text]),
          a.note ? el("div", { class: "gk-note-shown" }, ["Note: " + a.note]) : null
        ]),
        el("td", {}, [pos])
      ]));
    });
    tbl.appendChild(tb);
    sec.appendChild(tbl);
    return sec;
  }

  /* The three highest-value pieces of work, stated as work: who normally does
     it, how long it takes, and what finishing it produces. */
  function topActionsBlock(s) {
    if (!s.gaps.length) return null;
    var recs = recommendedTemplates(s.gaps).slice(0, 3);
    if (!recs.length) return null;

    var sec = el("section", { class: "gk-block gk-top3" });
    sec.appendChild(el("h2", {}, ["Your three priority actions"]));
    sec.appendChild(el("p", { class: "gk-muted" }, [
      "Ranked by how much of your risk they close. Everything else is below."
    ]));

    var ol = el("ol", { class: "gk-top3-list" });
    recs.forEach(function (r) {
      var tpl = DATA.templates[r.id];
      if (!tpl) return;
      var crit = r.qs.filter(function (qid) {
        var g = s.gaps.filter(function (x) { return x.q.id === qid; })[0];
        return g && g.q.weight >= 5;
      }).length;

      var li = el("li", { class: "gk-card gk-top3-item" }, [
        el("b", {}, [tpl.title]),
        el("p", { class: "gk-top3-why" }, [
          "Closes " + r.count + " gap" + (r.count === 1 ? "" : "s") +
          (crit ? ", including " + crit + " critical" : "") + "."
        ]),
        el("dl", { class: "gk-top3-meta" }, [
          el("dt", {}, ["Suggested owner"]), el("dd", {}, [tpl.owner || "—"]),
          el("dt", {}, ["Estimated effort"]), el("dd", {}, [tpl.effort || "—"]),
          el("dt", {}, ["Done when"]), el("dd", {}, [tpl.evidence || "—"])
        ]),
        el("div", { class: "gk-top3-cta" }, [
          el("a", { class: "gk-btn gk-btn-primary", href: tpl.url },
            ["Open " + tpl.title]),
          el("button", {
            class: "gk-btn", type: "button",
            onclick: function (e) { addToPlan(tpl, r, crit, e.target); }
          }, [inPlan(tpl.id) ? "In your plan ✓" : "Add to action plan"])
        ])
      ]);
      ol.appendChild(li);
    });
    sec.appendChild(ol);
    return sec;
  }

  /* The action plan lives beside the other workspace state, so the dashboard
     can surface it. Same privacy stance: browser only. */
  var PLAN_KEY = "gk-plan-v1";

  function loadPlan() {
    try { return JSON.parse(localStorage.getItem(PLAN_KEY)) || []; }
    catch (e) { return []; }
  }

  function inPlan(id) {
    return loadPlan().some(function (x) { return x.template === id; });
  }

  function addToPlan(tpl, rec, crit, btn) {
    var plan = loadPlan();
    if (plan.some(function (x) { return x.template === tpl.id; })) return;
    plan.push({
      template: tpl.id,
      action: tpl.title,
      owner: tpl.owner || "",
      effort: tpl.effort || "",
      evidence: tpl.evidence || "",
      priority: crit ? "Critical" : "High",
      closes: rec.count,
      status: "open",
      added: todayISO()
    });
    try { localStorage.setItem(PLAN_KEY, JSON.stringify(plan)); } catch (e) {}
    if (btn) { btn.textContent = "In your plan ✓"; btn.disabled = true; }
  }

  function actionsBlock(s) {
    var sec = el("section", { class: "gk-block" });
    sec.appendChild(el("h2", {}, ["Prioritised actions"]));
    if (!s.gaps.length) {
      sec.appendChild(el("p", {}, ["No actions arising from the answers given."]));
      return sec;
    }
    var recs = recommendedTemplates(s.gaps).slice(0, 6);
    var ol = el("ol", { class: "gk-actions-list" });
    recs.forEach(function (r) {
      var t = DATA.templates[r.id];
      if (!t) return;
      ol.appendChild(el("li", {}, [
        el("div", {}, [
          el("strong", {}, [
            el("a", { href: t.url }, [t.title])
          ]),
          el("span", { class: "gk-muted" }, [
            " — closes " + r.count + " gap" + (r.count === 1 ? "" : "s") +
            " (" + r.qs.slice(0, 6).join(", ") + ")"
          ])
        ]),
        el("div", { class: "gk-muted" }, [t.purpose])
      ]));
    });
    sec.appendChild(ol);
    return sec;
  }

  // -------------------------------------------------------------------- export

  function reportBasename() {
    return "governance-readiness-" + state.audience + "-" + todayISO();
  }

  function download(text, ext, mime) {
    var blob = new Blob([text], { type: mime + ";charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = reportBasename() + "." + ext;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function roleNames() {
    return state.roles.map(function (id) {
      var r = DATA.roles.find(function (x) { return x.id === id; });
      return r ? r.name : id;
    }).join(", ");
  }

  function absoluteUrl(rel) {
    try { return new URL(rel, window.location.href).href; }
    catch (e) { return rel; }
  }

  function markdownReport(s) {
    var aud = AUDIENCES.filter(function (a) { return a.id === state.audience; })[0];
    var L = [];
    L.push("# Data & AI Governance — Readiness Report");
    L.push("");
    L.push("**Audience:** " + aud.label + "  ");
    L.push("**Date:** " + todayISO() + "  ");
    L.push("**Roles assessed:** " + roleNames() + "  ");
    L.push("**Overall readiness:** " + s.overall + "% — " +
      (s.band ? s.band.label : "—"));
    L.push("");
    L.push(framingFor(state.audience, s));
    L.push("");

    var hist = comparableSnapshots();
    if (hist.length) {
      var prev = hist[hist.length - 1];
      var delta = s.overall - prev.overall;
      L.push("## Movement over time");
      L.push("");
      L.push("**" + (delta > 0 ? "+" : "") + delta + " points** since " +
        prev.date + " (" + prev.overall + "%).");
      L.push("");
      L.push("| Date | Score | Band | Answered |");
      L.push("|---|---|---|---|");
      hist.slice(-6).forEach(function (h) {
        L.push("| " + h.date + " | " + h.overall + "% | " + (h.band || "—") +
          " | " + h.answered + " of " + h.total + " |");
      });
      L.push("| **Now (" + todayISO() + ")** | **" + s.overall + "%** | **" +
        (s.band ? s.band.label : "—") + "** | " + s.answered + " of " + s.total + " |");
      L.push("");
    }

    L.push("## Score by category");
    L.push("");
    L.push("| Category | Score |");
    L.push("|---|---|");
    s.categories.slice().sort(function (a, b) { return a.pct - b.pct; })
      .forEach(function (c) { L.push("| " + c.name + " | " + c.pct + "% |"); });
    L.push("");

    L.push("## Top gaps by severity");
    L.push("");
    if (!s.gaps.length) {
      L.push("No gaps recorded in the answers given.");
    } else {
      L.push("| Gap | Severity | Status | Obligation | Evidence needed | Fix with |");
      L.push("|---|---|---|---|---|---|");
      s.gaps.slice(0, 10).forEach(function (g) {
        var tpl = (g.q.templates || []).slice(0, 2).map(function (tid) {
          var t = DATA.templates[tid];
          return t ? "[" + t.title + "](" + absoluteUrl(t.url) + ")" : "";
        }).filter(Boolean).join(" · ");
        L.push("| " + g.q.text.replace(/\|/g, "\\|") + " | " + sevLabel(g.q.weight) +
          " | " + (g.answer === "no" ? "Not in place" : "Partial") + " | " +
          ((g.q.obligation && g.q.obligation.ref) || "—") + " | " +
          (g.q.evidence || "—").replace(/\|/g, "\\|") + " | " + tpl + " |");
      });
    }
    L.push("");

    L.push("## Prioritised actions");
    L.push("");
    recommendedTemplates(s.gaps).slice(0, 6).forEach(function (r, i) {
      var t = DATA.templates[r.id];
      if (!t) return;
      L.push((i + 1) + ". **[" + t.title + "](" + absoluteUrl(t.url) + ")** — closes " +
        r.count + " gap" + (r.count === 1 ? "" : "s") + " (" + r.qs.join(", ") + ")");
    });
    L.push("");

    if (state.audience === "regulator") {
      L.push("## Obligation coverage");
      L.push("");
      L.push("| Ref | Obligation | Assessed item | Position |");
      L.push("|---|---|---|---|");
      activeQuestions().forEach(function (q) {
        var a = state.answers[q.id];
        if (!a || !a.value) return;
        var pos = a.value === "yes" ? "Met" : a.value === "partial" ? "Partially met"
          : a.value === "na" ? "Not applicable" : "Not met";
        L.push("| " + ((q.obligation && q.obligation.ref) || "—") + " | " +
          ((q.obligation && q.obligation.label) || q.category) + " | " +
          q.text.replace(/\|/g, "\\|") + " | " + pos + " |");
      });
      L.push("");
    }

    var noted = activeQuestions().filter(function (q) {
      var a = state.answers[q.id];
      return a && a.note;
    });
    if (noted.length) {
      L.push("## Notes");
      L.push("");
      noted.forEach(function (q) {
        L.push("- **" + q.id + "** " + q.text + " — " + state.answers[q.id].note);
      });
      L.push("");
    }

    L.push("---");
    L.push("");
    L.push("**Not legal advice.** This report is a planning aid generated from a " +
      "self-assessment. It is not exhaustive and not a substitute for legal " +
      "analysis of your circumstances.");
    L.push("");
    L.push("**About the score.** Scoring thresholds are editorial judgement, not " +
      "empirical benchmarks, and this kit holds no peer-comparison data. The " +
      "score measures which obligations you can evidence, not whether the " +
      "controls behind them work. See " +
      absoluteUrl("../scoring/") + " for the method and its limitations.");
    L.push("");
    L.push("Generated " + todayISO() + " with GovKit. " +
      "Self-assessed; answers were not verified.");
    return L.join("\n") + "\n";
  }

  /* Self-contained HTML: styles inlined, no external references at all. */
  function htmlReport(s) {
    var aud = AUDIENCES.filter(function (a) { return a.id === state.audience; })[0];
    var css = [
      "*{box-sizing:border-box}",
      "body{font:16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;",
      "max-width:52rem;margin:0 auto;padding:2.5rem 1.5rem;color:#1a1a1a;background:#fff}",
      "h1{font-size:1.9rem;margin:0 0 .3rem}h2{font-size:1.25rem;margin:2rem 0 .6rem;",
      "padding-bottom:.3rem;border-bottom:2px solid #e5e7eb}",
      ".meta{color:#555;margin:0 0 1.5rem}",
      ".score{display:flex;align-items:center;gap:1.25rem;padding:1.25rem;",
      "border:1px solid #e5e7eb;border-radius:.6rem;margin:1.5rem 0}",
      ".score .n{font-size:3rem;font-weight:700;line-height:1}",
      ".score .b{font-size:1.15rem;font-weight:600;margin:0}",
      "table{width:100%;border-collapse:collapse;margin:1rem 0;font-size:.9rem}",
      "th,td{text-align:left;padding:.5rem .6rem;border-bottom:1px solid #e5e7eb;vertical-align:top}",
      "th{background:#f7f8fa;font-weight:600}",
      ".bar{background:#eceff1;border-radius:.3rem;height:.6rem;overflow:hidden}",
      ".bar>span{display:block;height:100%}",
      ".good{background:#1e7d34}.mid{background:#a25b12}.bad{background:#b3261e}",
      ".muted{color:#666;font-size:.88rem}",
      "footer{margin-top:2.5rem;padding-top:1rem;border-top:1px solid #e5e7eb;font-size:.85rem;color:#555}",
      "a{color:#3949ab}",
      "@media print{body{padding:0;max-width:none}h2{break-after:avoid}tr{break-inside:avoid}}"
    ].join("");

    var H = [];
    H.push("<!doctype html><html lang='en'><head><meta charset='utf-8'>");
    H.push("<meta name='viewport' content='width=device-width,initial-scale=1'>");
    H.push("<title>Readiness Report — " + esc(aud.label) + " — " + todayISO() + "</title>");
    H.push("<style>" + css + "</style></head><body>");
    H.push("<h1>Data &amp; AI Governance — Readiness Report</h1>");
    H.push("<p class='meta'><strong>" + esc(aud.label) + " view</strong> · " +
      todayISO() + " · " + esc(roleNames()) + "</p>");

    H.push("<div class='score'><div class='n'>" + s.overall + "%</div><div>");
    H.push("<p class='b'>" + esc(s.band ? s.band.label : "—") + "</p>");
    H.push("<p class='muted'>" + esc(s.band ? s.band.blurb : "") + "</p>");
    H.push("<p class='muted'>" + s.answered + " of " + s.total + " questions answered" +
      (s.na ? " · " + s.na + " not applicable" : "") + "</p>");
    H.push("</div></div>");

    H.push("<p>" + esc(framingFor(state.audience, s)) + "</p>");

    var histH = comparableSnapshots();
    if (histH.length) {
      var prevH = histH[histH.length - 1];
      var dH = s.overall - prevH.overall;
      H.push("<h2>Movement over time</h2>");
      H.push("<p><strong>" + (dH > 0 ? "+" : "") + dH + " points</strong> since " +
        esc(prevH.date) + " (" + prevH.overall + "%).</p>");
      H.push("<table><tr><th>Date</th><th>Score</th><th>Band</th><th>Answered</th></tr>");
      histH.slice(-6).forEach(function (h) {
        H.push("<tr><td>" + esc(h.date) + "</td><td>" + h.overall + "%</td><td>" +
          esc(h.band || "—") + "</td><td>" + h.answered + " of " + h.total +
          "</td></tr>");
      });
      H.push("<tr><td><strong>Now (" + todayISO() + ")</strong></td><td><strong>" +
        s.overall + "%</strong></td><td><strong>" + esc(s.band ? s.band.label : "—") +
        "</strong></td><td>" + s.answered + " of " + s.total + "</td></tr>");
      H.push("</table>");
    }

    H.push("<h2>Score by category</h2><table><tr><th>Category</th><th>Score</th><th></th></tr>");
    s.categories.slice().sort(function (a, b) { return a.pct - b.pct; })
      .forEach(function (c) {
        var cls = c.pct >= 80 ? "good" : c.pct >= 50 ? "mid" : "bad";
        H.push("<tr><td>" + esc(c.name) + "</td><td>" + c.pct + "%</td>" +
          "<td style='width:40%'><div class='bar'><span class='" + cls +
          "' style='width:" + c.pct + "%'></span></div></td></tr>");
      });
    H.push("</table>");

    H.push("<h2>Top gaps by severity</h2>");
    if (!s.gaps.length) {
      H.push("<p>No gaps recorded in the answers given.</p>");
    } else {
      H.push("<table><tr><th>Gap</th><th>Severity</th><th>Status</th>" +
        "<th>Evidence needed</th><th>Fix with</th></tr>");
      s.gaps.slice(0, 10).forEach(function (g) {
        var tpl = (g.q.templates || []).slice(0, 2).map(function (tid) {
          var t = DATA.templates[tid];
          return t ? "<a href='" + esc(absoluteUrl(t.url)) + "'>" + esc(t.title) + "</a>" : "";
        }).filter(Boolean).join(" · ");
        H.push("<tr><td>" + esc(g.q.text) +
          (g.note ? "<div class='muted'>Note: " + esc(g.note) + "</div>" : "") +
          (g.q.obligation && g.q.obligation.ref
            ? "<div class='muted'>" + esc(g.q.obligation.ref) + "</div>" : "") +
          "</td><td>" + sevLabel(g.q.weight) + "</td><td>" +
          (g.answer === "no" ? "Not in place" : "Partial") + "</td><td class='muted'>" +
          esc(g.q.evidence || "—") + "</td><td>" + tpl + "</td></tr>");
      });
      H.push("</table>");
    }

    H.push("<h2>Prioritised actions</h2><ol>");
    recommendedTemplates(s.gaps).slice(0, 6).forEach(function (r) {
      var t = DATA.templates[r.id];
      if (!t) return;
      H.push("<li><a href='" + esc(absoluteUrl(t.url)) + "'>" + esc(t.title) + "</a> " +
        "<span class='muted'>— closes " + r.count + " gap" + (r.count === 1 ? "" : "s") +
        " (" + esc(r.qs.join(", ")) + ")</span><div class='muted'>" +
        esc(t.purpose) + "</div></li>");
    });
    H.push("</ol>");

    if (state.audience === "regulator") {
      H.push("<h2>Obligation coverage</h2><table>");
      H.push("<tr><th>Ref</th><th>Obligation</th><th>Assessed item</th><th>Position</th></tr>");
      activeQuestions().forEach(function (q) {
        var a = state.answers[q.id];
        if (!a || !a.value) return;
        var pos = a.value === "yes" ? "Met" : a.value === "partial" ? "Partially met"
          : a.value === "na" ? "Not applicable" : "Not met";
        H.push("<tr><td>" + esc((q.obligation && q.obligation.ref) || "—") + "</td><td>" +
          esc((q.obligation && q.obligation.label) || q.category) + "</td><td>" +
          esc(q.text) + (a.note ? "<div class='muted'>Note: " + esc(a.note) + "</div>" : "") +
          "</td><td>" + pos + "</td></tr>");
      });
      H.push("</table>");
    }

    H.push("<footer><p><strong>Not legal advice.</strong> This report is a planning " +
      "aid generated from a self-assessment. It is not exhaustive and not a " +
      "substitute for legal analysis of your circumstances.</p>");
    H.push("<p><strong>About the score.</strong> Scoring thresholds are editorial " +
      "judgement, not empirical benchmarks, and this kit holds no peer-comparison " +
      "data. The score measures which obligations you can evidence, not whether " +
      "the controls behind them work. See <a href='" +
      esc(absoluteUrl("../scoring/")) + "'>how scoring works</a> for the method " +
      "and its limitations.</p>");
    H.push("<p>Generated " + todayISO() + " with GovKit. " +
      "Self-assessed; answers were not verified.</p></footer>");
    H.push("</body></html>");
    return H.join("\n");
  }

  // --------------------------------------------------------------------- boot

  function render() {
    root.innerHTML = "";
    var view = state.step === "questions" ? viewQuestions()
      : state.step === "report" ? viewReport()
      : viewRoles();
    root.appendChild(view);
  }

  function init(data) {
    DATA = data;
    // Published so the register editor can turn a visitor's open assessment
    // gaps into draft risk-register rows without refetching or duplicating the
    // question bank.
    window.GK_QUESTIONS = {};
    data.questions.forEach(function (q) { window.GK_QUESTIONS[q.id] = q; });
    var saved = load();
    if (saved) {
      state.roles = (saved.roles || []).filter(function (id) {
        return DATA.roles.some(function (r) { return r.id === id; });
      });
      // Drop answers to questions that no longer exist, so a renamed or removed
      // question cannot resurrect a stale score.
      var valid = {};
      DATA.questions.forEach(function (q) { valid[q.id] = true; });
      Object.keys(saved.answers || {}).forEach(function (qid) {
        if (valid[qid]) state.answers[qid] = saved.answers[qid];
      });
      if (saved.audience) state.audience = saved.audience;
    }
    render();
  }

  /*
   * Mount into whatever #gk-assess is on the page right now.
   *
   * Called once per navigation. Everything the previous visit left behind —
   * the element reference, the parsed question bank, the working state — is
   * re-derived here, so navigating away and back cannot render stale answers
   * into a fresh element or bind a second copy of anything.
   */
  function mount() {
    var host = document.getElementById("gk-assess");
    root = host;
    if (!host) return;          // not this page

    // Idempotent: instant navigation can fire document$ for the same
    // document, and re-fetching would flash the app away and back.
    if (host.getAttribute("data-gk-mounted") === "1" && DATA) {
      state = state || freshState();
      render();
      return;
    }

    state = freshState();
    DATA = null;
    host.innerHTML = "";

    var src = host.getAttribute("data-src") || "assessment-data.json";
    fetch(src, { credentials: "omit" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        // The user may have navigated on while the fetch was in flight;
        // writing into a detached element would be a silent no-op that looks
        // like a blank page.
        if (root !== host || !host.isConnected) return;
        host.setAttribute("data-gk-mounted", "1");
        init(data);
      })
      .catch(function (err) {
        if (root !== host || !host.isConnected) return;
        host.innerHTML =
          "<h1>Assessment unavailable</h1>" +
          "<p>The question data could not be loaded (" + esc(err.message) + ").</p>" +
          "<p>The <a href='../eu-ai-act/readiness-checklist/'>25-point checklist</a> " +
          "covers the same ground as a static page.</p>";
      });
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(mount);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
