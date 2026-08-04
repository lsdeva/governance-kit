/*
 * Workspace dashboard.
 *
 * Reads only what the user has actually saved and renders the operational
 * state of their programme: headline counts, what to continue, and ONE
 * recommended next action. A first-time visitor gets a short orientation
 * instead of empty tiles.
 *
 * Read-only over localStorage; the tools own their own writes. No network
 * beyond the same-site question bank, which is needed to size the assessment.
 */
(function () {
  "use strict";

  var KEYS = {
    assessment: "gk-assessment-v1",
    decisions: "gk-decisions-v1",
    checklist: "gk-checklist-v1",
    plan: "gk-plan-v1"
  };

  var QUESTIONS = null;   // filled from the same JSON the assessment uses

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch (e) { return null; }
  }

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "class") n.className = v;
      else if (k.indexOf("on") === 0) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    (kids || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  /* Every register that has at least one non-empty row. */
  function registers() {
    var out = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (!k || k.indexOf("gk-register-") !== 0) continue;
      var d = read(k);
      if (!d || !Array.isArray(d.sheets) || !d.sheets[0]) continue;
      var rows = d.sheets[0].filter(function (r) {
        return r.some(function (c) { return String(c == null ? "" : c).trim() !== ""; });
      });
      out.push({
        id: k.replace("gk-register-", ""),
        rows: rows,
        count: rows.length,
        savedAt: d.savedAt || null
      });
    }
    return out;
  }

  /* AI systems recorded, and how many still lack a risk tier. */
  function inventoryState() {
    var inv = registers().filter(function (r) {
      return r.id === "ai-system-inventory";
    })[0];
    if (!inv) return { total: 0, unclassified: 0, firstUnclassified: null };

    // Column order comes from the data; find the tier column by header text
    // rather than assuming an index.
    var TIER = 8, NAME = 1;     // matches spreadsheets.yml today
    var unclassified = inv.rows.filter(function (r) {
      return String(r[TIER] || "").trim() === "";
    });
    return {
      total: inv.count,
      unclassified: unclassified.length,
      firstUnclassified: unclassified.length
        ? String(unclassified[0][NAME] || "a system").trim() : null
    };
  }

  function assessmentState() {
    var a = read(KEYS.assessment);
    if (!a || !a.answers) return { answered: 0, total: 0, roles: [] };
    var answered = Object.keys(a.answers).filter(function (q) {
      return a.answers[q] && a.answers[q].value;
    }).length;
    var total = 0;
    if (QUESTIONS && a.roles && a.roles.length) {
      total = QUESTIONS.filter(function (q) {
        return q.roles.some(function (r) { return (a.roles || []).indexOf(r) !== -1; });
      }).length;
    }
    return { answered: answered, total: total, roles: a.roles || [] };
  }

  function openCritical() {
    var plan = read(KEYS.plan) || [];
    return plan.filter(function (x) {
      return x.status !== "done" && x.priority === "Critical";
    }).length;
  }

  /* Where the open plan items came from, so the tile does not misattribute
     work adopted from a 30/60/90 path to the assessment report. */
  function planSource(plan) {
    var open = plan.filter(function (x) { return x.status !== "done"; });
    if (!open.length) return "nothing open";
    var fromPath = open.filter(function (x) { return x.path; }).length;
    if (fromPath === open.length) return "from your chosen path";
    if (fromPath) return "from your path and report";
    return "from your report";
  }

  function tile(value, label, note, tone) {
    return el("div", { class: "gk-stat" }, [
      el("div", { class: "gk-stat-v" }, [String(value)]),
      el("div", { class: "gk-stat-l" }, [label]),
      note ? el("div", {
        class: "gk-stat-n" + (tone ? " is-" + tone : "")
      }, [note]) : null
    ]);
  }

  /*
   * ONE next action, chosen by what would unblock the most.
   * Order matters: an unclassified system is a live compliance gap; an
   * unfinished assessment is what everything else is derived from; and a
   * body of work with no backup is one browser-clear from being lost.
   */
  function nextAction(base, inv, asmt, regs) {
    var plan = read(KEYS.plan) || [];

    if (inv.unclassified > 0) {
      return {
        title: "Classify " + inv.firstUnclassified,
        why: inv.unclassified + " AI system" + (inv.unclassified === 1 ? "" : "s") +
             " in your inventory " + (inv.unclassified === 1 ? "has" : "have") +
             " no risk tier. Until a system is classified you do not know " +
             "which obligations apply to it.",
        cta: "Run guided classification", href: base + "decide/"
      };
    }
    if (asmt.total && asmt.answered < asmt.total) {
      return {
        title: "Finish your readiness assessment",
        why: asmt.answered + " of " + asmt.total + " answered. Unanswered areas " +
             "are excluded from the score, so the gaps you are acting on are " +
             "incomplete.",
        cta: "Continue the assessment", href: base + "assess/"
      };
    }
    if (!asmt.answered) {
      return {
        title: "Take the readiness assessment",
        why: "10–15 minutes. It produces the prioritised gap list everything " +
             "else in the workspace works from.",
        cta: "Start the assessment", href: base + "assess/"
      };
    }
    if (!inv.total) {
      return {
        title: "Build your AI system inventory",
        why: "Every other obligation applies per system, so a system you have " +
             "not listed is one you cannot govern.",
        cta: "Open the inventory",
        href: base + "registers/ai-system-inventory/"
      };
    }
    if (plan.filter(function (x) { return x.status !== "done"; }).length) {
      var first = plan.filter(function (x) { return x.status !== "done"; })[0];
      return {
        title: first.action,
        why: (first.path ? "From your chosen path." : "From your action plan.") +
             " Suggested owner: " + (first.owner || "—") +
             " · " + (first.effort || "—") +
             (first.due ? " · target " + first.due : ""),
        cta: "Open the template",
        // Items adopted from a path carry their template's URL. Older items
        // from the assessment do not, so those still land on the plan itself.
        href: first.url || (base + "workspace/")
      };
    }
    if (regs.length) {
      return {
        title: "Back up your work",
        why: "You have data in " + regs.length + " register" +
             (regs.length === 1 ? "" : "s") + " and no backup. Clearing this " +
             "browser would lose it.",
        cta: "Back up a register",
        href: base + "registers/ai-system-inventory/"
      };
    }
    return null;
  }

  function render(host) {
    var base = host.getAttribute("data-base") || "../";
    var regs = registers();
    var inv = inventoryState();
    var asmt = assessmentState();
    var decisions = (read(KEYS.decisions) || []).length;
    var plan = read(KEYS.plan) || [];
    var hasWork = regs.length || asmt.answered || decisions || plan.length;

    host.innerHTML = "";

    if (!hasWork) {
      host.appendChild(el("p", { class: "gk-lede" }, [
        "This is where your governance programme lives once you start. " +
        "Nothing here yet — take the assessment or classify a system, and this " +
        "page will show your counts, what to continue, and what to do next."
      ]));
      return;
    }

    // ---- headline tiles
    var grid = el("div", { class: "gk-stat-grid gk-dash-tiles" });
    grid.appendChild(tile(inv.total, "AI systems recorded",
      inv.unclassified ? inv.unclassified + " without a risk tier" : "all classified",
      inv.unclassified ? "warn" : "good"));
    grid.appendChild(tile(
      asmt.total ? asmt.answered + "/" + asmt.total : asmt.answered,
      "Assessment answered",
      asmt.total && asmt.answered < asmt.total ? "incomplete — score is partial"
        : (asmt.answered ? "complete" : "not started"),
      asmt.total && asmt.answered >= asmt.total && asmt.answered ? "good" : null));
    grid.appendChild(tile(decisions, "Decisions recorded",
      decisions ? "with reasoning and dates" : "none yet"));
    grid.appendChild(tile(
      plan.filter(function (x) { return x.status !== "done"; }).length,
      "Open plan actions",
      // Plan items arrive from two places now — the assessment report and an
      // adopted 30/60/90 path — so the note says which, rather than always
      // claiming the report.
      openCritical() ? openCritical() + " critical" : planSource(plan),
      openCritical() ? "warn" : null));
    host.appendChild(grid);

    // ---- one recommended next action
    var na = nextAction(base, inv, asmt, regs);
    if (na) {
      host.appendChild(el("div", { class: "gk-card gk-next" }, [
        el("p", { class: "gk-kicker" }, ["Recommended next action"]),
        el("b", {}, [na.title]),
        el("p", {}, [na.why]),
        el("a", { class: "gk-btn gk-btn-primary", href: na.href }, [na.cta])
      ]));
    }

    // ---- continue where you left off
    var cont = [];
    if (asmt.answered && asmt.total && asmt.answered < asmt.total) {
      cont.push(["Readiness assessment",
        asmt.answered + " of " + asmt.total + " answered", base + "assess/"]);
    }
    regs.forEach(function (r) {
      cont.push([r.id.replace(/-/g, " ").replace(/\b\w/g, function (c) {
        return c.toUpperCase();
      }), r.count + " row" + (r.count === 1 ? "" : "s"),
        base + "registers/" + r.id + "/"]);
    });
    if (decisions) {
      cont.push(["Decision log", decisions + " recorded", base + "decide/"]);
    }
    if (cont.length) {
      host.appendChild(el("h2", {}, ["Continue where you left off"]));
      var list = el("div", { class: "gk-dash-cont" });
      cont.slice(0, 6).forEach(function (c) {
        list.appendChild(el("a", { class: "gk-card gk-goal", href: c[2] }, [
          el("b", {}, [c[0]]),
          el("span", { class: "gk-goal-meta" }, [c[1]])
        ]));
      });
      host.appendChild(list);
    }
  }

  function init() {
    var host = document.getElementById("gk-dashboard");
    if (!host) return;

    // Base path for links: /workspace/ is one level deep.
    host.setAttribute("data-base", "../");

    var src = host.getAttribute("data-src");
    if (!src || QUESTIONS) { render(host); return; }

    fetch(src, { credentials: "omit" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (j && j.questions) QUESTIONS = j.questions;
        // The visitor may have navigated on mid-fetch; the element is then
        // detached and rendering into it is wasted work that can also clobber
        // a newer mount.
        if (!host.isConnected) return;
        render(host);
      })
      .catch(function () {
        if (!host.isConnected) return;
        render(host);
      });
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
