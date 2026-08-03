/*
 * Landing-page motion: scroll reveal and the readiness bar fill.
 *
 * No libraries, no external requests. Everything is gated behind
 * prefers-reduced-motion: when it is set, content is shown immediately in its
 * final state rather than animated — motion is decoration, never the only way
 * to see something.
 *
 * Subscribes to Material's document$ so it survives instant navigation.
 */
(function () {
  "use strict";

  function init() {
    var nodes = document.querySelectorAll(".gk-home .gk-rv");
    if (!nodes.length) return;

    function settle(node) {
      node.classList.add("in");
      node.querySelectorAll(".gk-bar > i").forEach(function (bar) {
        bar.style.width = bar.getAttribute("data-w") || "0";
      });
    }

    var reduce = window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // No IntersectionObserver (or motion is unwanted): show everything now and
    // never arm the hidden state.
    if (reduce || typeof IntersectionObserver === "undefined") {
      nodes.forEach(settle);
      return;
    }

    // Only now hide the elements. The stylesheet keeps them visible until this
    // class is set, so a JS failure can never leave the page blank.
    document.documentElement.classList.add("gk-js");

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        settle(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15 });

    nodes.forEach(function (n) { io.observe(n); });
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/*
 * "Continue your work" strip.
 *
 * Reads the same localStorage keys the apps write, and renders only what is
 * actually in progress. A first-time visitor sees nothing at all — the section
 * stays hidden rather than showing empty placeholders.
 *
 * Read-only: this never writes storage. Same privacy stance as everything
 * else; nothing leaves the browser.
 */
(function () {
  "use strict";

  var KEYS = {
    assessment: "gk-assessment-v1",
    decisions: "gk-decisions-v1",
    checklist: "gk-checklist-v1"
  };

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch (e) { return null; }
  }

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (attrs[k] === null || attrs[k] === undefined || attrs[k] === false) return;
      if (k === "class") n.className = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  /* Count register rows that actually contain something. */
  function registerCounts() {
    var out = [];
    for (var i = 0; i < localStorage.length; i++) {
      var k = localStorage.key(i);
      if (!k || k.indexOf("gk-register-") !== 0) continue;
      var data = read(k);
      if (!data || !Array.isArray(data.sheets) || !data.sheets[0]) continue;
      var filled = data.sheets[0].filter(function (row) {
        return row.some(function (c) { return String(c == null ? "" : c).trim() !== ""; });
      }).length;
      if (filled) {
        out.push({
          id: k.replace("gk-register-", ""),
          rows: filled
        });
      }
    }
    return out;
  }

  function card(href, title, detail, cta) {
    return el("a", { class: "gk-card gk-goal", href: href }, [
      el("b", {}, [title]),
      el("p", {}, [detail]),
      el("span", { class: "gk-goal-meta" }, [cta])
    ]);
  }

  function initContinue() {
    var host = document.getElementById("gk-continue");
    if (!host) return;
    host.innerHTML = "";

    var items = [];
    var base = (document.querySelector(".gk-home") || {}).getAttribute
      ? document.querySelector(".gk-home").getAttribute("data-gk-base") || ""
      : "";

    // --- assessment in progress
    var a = read(KEYS.assessment);
    if (a && a.answers) {
      var answered = Object.keys(a.answers).filter(function (q) {
        return a.answers[q] && a.answers[q].value;
      }).length;
      if (answered) {
        items.push(card(base + "assess/", "Readiness assessment",
          answered + " question" + (answered === 1 ? "" : "s") + " answered so far.",
          "Continue where you left off →"));
      }
    }

    // --- last decision recorded
    var d = read(KEYS.decisions);
    if (d && d.length) {
      var last = d[d.length - 1];
      items.push(card(base + "decide/", "Decision log",
        d.length + " decision" + (d.length === 1 ? "" : "s") + " recorded. Last: " +
        (last.subject || "a system") + " — " + (last.verdict || ""),
        "Open the log →"));
    }

    // --- registers with rows
    var regs = registerCounts();
    if (regs.length) {
      var total = regs.reduce(function (n, r) { return n + r.rows; }, 0);
      items.push(card(base + "workspace/", "Your registers",
        total + " row" + (total === 1 ? "" : "s") + " across " + regs.length +
        " register" + (regs.length === 1 ? "" : "s") + ".",
        "Open your workspace →"));
    }

    // --- checklist ticks
    var c = read(KEYS.checklist);
    if (c) {
      var ticked = Object.keys(c).filter(function (k) { return c[k]; }).length;
      if (ticked) {
        items.push(card(base + "eu-ai-act/readiness-checklist/",
          "EU AI Act checklist",
          ticked + " of 25 points ticked.",
          "Carry on →"));
      }
    }

    if (!items.length) { host.hidden = true; return; }

    host.appendChild(el("p", { class: "gk-kicker" }, ["Continue your work"]));
    host.appendChild(el("h2", { class: "gk-h2" }, ["Pick up where you left off"]));
    host.appendChild(el("p", { class: "gk-lede" }, [
      "Saved in this browser only. Take a backup before clearing your browser data."
    ]));
    var grid = el("div", { class: "gk-goals" });
    items.forEach(function (i) { grid.appendChild(i); });
    host.appendChild(grid);
    host.hidden = false;
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(initContinue);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initContinue);
  } else {
    initContinue();
  }
})();
