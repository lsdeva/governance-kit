/*
 * Framework comparison for the standards crosswalk.
 *
 * The full crosswalk is a 6-column, 15-row table. That is the right shape for
 * a reference and the wrong shape for the question people actually arrive
 * with: "I hold ISO 42001 and I am now in scope of the EU AI Act — what does
 * each of them want on human oversight?"
 *
 * So: pick a theme and two or three frameworks, and read them stacked, one
 * card each, with the templates that satisfy all of them at once. The full
 * table stays on the page below.
 *
 * Design notes:
 *  - Two frameworks are selected on first load, because a comparison of one
 *    is not a comparison. The cap is three: past that the cards stop being
 *    readable on a phone, which is the case this exists for.
 *  - The choice is remembered, so returning to the page does not mean
 *    re-picking. It is a display preference, not user content.
 *  - Same privacy stance as the rest of the site: browser only, no network
 *    beyond the same-site JSON.
 */
(function () {
  "use strict";

  var PREF_KEY = "gk-compare-v1";
  var MAX = 3;

  var DATA = null;

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "class") n.className = v;
      else if (k.indexOf("on") === 0) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  function loadPref() {
    try { return JSON.parse(localStorage.getItem(PREF_KEY)) || null; }
    catch (e) { return null; }
  }

  function savePref(p) {
    try { localStorage.setItem(PREF_KEY, JSON.stringify(p)); } catch (e) {}
  }

  function App(host) {
    var pref = loadPref() || {};
    var ids = DATA.frameworks.map(function (f) { return f.id; });

    this.host = host;
    // Default to the two that most often need reconciling: the certifiable
    // management system and the binding law.
    this.picked = (pref.frameworks || []).filter(function (id) {
      return ids.indexOf(id) !== -1;
    });
    if (this.picked.length < 2) this.picked = ["iso42001", "euaiact"];

    var themes = DATA.rows.map(function (r) { return r.theme; });
    this.theme = themes.indexOf(pref.theme) !== -1 ? pref.theme : themes[0];

    this.render();
  }

  App.prototype.remember = function () {
    savePref({ frameworks: this.picked, theme: this.theme });
  };

  App.prototype.row = function () {
    var self = this;
    for (var i = 0; i < DATA.rows.length; i++) {
      if (DATA.rows[i].theme === self.theme) return DATA.rows[i];
    }
    return DATA.rows[0];
  };

  App.prototype.framework = function (id) {
    for (var i = 0; i < DATA.frameworks.length; i++) {
      if (DATA.frameworks[i].id === id) return DATA.frameworks[i];
    }
    return null;
  };

  App.prototype.render = function () {
    var self = this;
    this.host.innerHTML = "";
    var wrap = el("div", { class: "gk-compare" });

    wrap.appendChild(el("p", { class: "gk-compare-lede" }, [
      "Pick a topic and the frameworks you are held to. You get the same " +
      "obligation in each one's own words, plus the templates that satisfy " +
      "all of them at once."
    ]));

    // --- topic
    var tid = "gk-cmp-theme";
    var sel = el("select", { id: tid, class: "gk-field-input" });
    DATA.rows.forEach(function (r) {
      var o = el("option", { value: r.theme }, [r.theme]);
      if (r.theme === self.theme) o.selected = true;
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () {
      self.theme = sel.value;
      self.remember();
      self.render();
    });
    wrap.appendChild(el("div", { class: "gk-compare-controls" }, [
      el("div", { class: "gk-field gk-compare-theme" }, [
        el("label", { for: tid }, ["Topic"]), sel
      ])
    ]));

    // --- frameworks
    var chips = el("div", { class: "gk-compare-picks" }, [
      el("span", { class: "gk-compare-picks-l" }, ["Frameworks"])
    ]);
    DATA.frameworks.forEach(function (f) {
      var on = self.picked.indexOf(f.id) !== -1;
      // A chip that does nothing when clicked reads as broken, so both limits
      // disable rather than silently refuse: at three you cannot add, and at
      // two you cannot remove — one framework is not a comparison.
      var full = !on && self.picked.length >= MAX;
      var floor = on && self.picked.length <= 2;
      var locked = full || floor;
      chips.appendChild(el("button", {
        class: "gk-chip" + (on ? " is-on" : ""),
        type: "button",
        disabled: locked ? "disabled" : null,
        "aria-pressed": on ? "true" : "false",
        title: full
          ? "Deselect one first — three at a time keeps the cards readable"
          : floor
            ? "Pick a third to swap this one out — a comparison needs two"
            : f.full,
        onclick: function () {
          if (on) {
            self.picked = self.picked.filter(function (x) { return x !== f.id; });
          } else {
            self.picked = self.picked.concat([f.id]);
          }
          self.remember();
          self.render();
        }
      }, [f.name]));
    });
    chips.appendChild(el("span", { class: "gk-muted gk-compare-hint" }, [
      self.picked.length >= MAX
        ? "Three at a time — deselect one to swap."
        : self.picked.length <= 2
          ? "Two at a time minimum — add a third to swap one out."
          : "Two or three at a time."
    ]));
    wrap.appendChild(chips);

    // --- the comparison
    var row = this.row();
    var cards = el("div", { class: "gk-compare-cards" });
    this.picked.forEach(function (id) {
      var f = self.framework(id);
      if (!f) return;
      var text = (row.cells[id] || "").trim();
      cards.appendChild(el("div", { class: "gk-card gk-compare-card" }, [
        el("h3", {}, [
          el("a", { href: f.url, rel: "noopener" }, [f.name])
        ]),
        el("p", { class: "gk-compare-full" }, [f.full]),
        text
          ? el("p", { class: "gk-compare-cell" }, [text])
          // A blank cell is a real answer: this framework does not cover the
          // topic. Saying so beats an empty card.
          : el("p", { class: "gk-compare-cell is-none" }, [
              "Nothing specific on this topic."
            ])
      ]));
    });
    wrap.appendChild(cards);

    // --- what satisfies all of them
    if (row.templates.length) {
      var list = el("div", { class: "gk-compare-tpl" });
      list.appendChild(el("h3", {}, [
        "Build once, satisfy " +
        (self.picked.length === 2 ? "both" : "all " + self.picked.length)
      ]));
      var ul = el("ul", {});
      row.templates.forEach(function (t) {
        ul.appendChild(el("li", {}, [
          el("a", { href: t.url }, [t.title])
        ]));
      });
      list.appendChild(ul);
      wrap.appendChild(list);
    }

    wrap.appendChild(el("p", { class: "gk-muted gk-compare-foot" }, [
      "Indicative mappings, not certified equivalences — verify against the " +
      "standard itself before relying on one in an audit. Every topic and " +
      "framework is in the full table below."
    ]));

    this.host.appendChild(wrap);
  };

  function mount() {
    var host = document.getElementById("gk-compare");
    if (!host) return;
    var src = host.getAttribute("data-src");
    if (!src) return;

    if (DATA) { new App(host); return; }
    fetch(src)
      .then(function (r) { return r.json(); })
      .then(function (d) { DATA = d; new App(host); })
      .catch(function () {
        // The full table is already on the page below, so a failure here
        // costs the convenience, not the content.
        host.innerHTML = "";
      });
  }

  if (window.document$ && window.document$.subscribe) {
    window.document$.subscribe(mount);
  } else if (document.readyState !== "loading") {
    mount();
  } else {
    document.addEventListener("DOMContentLoaded", mount);
  }
})();
