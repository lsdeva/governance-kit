/*
 * The 30/60/90-day plan as a tracked journey.
 *
 * The page prints four plans in full. That is the right reference, and it is
 * a poor way to actually run one: the reader has to remember which path they
 * chose and re-find their place on every visit.
 *
 * So: pick one path and it becomes the only one on screen, with a tick per
 * step, an owner, a target date, a progress figure, and one clearly-named
 * next task. The other paths fold away until asked for.
 *
 * Design notes:
 *  - Adopting a path writes its steps into gk-plan-v1, the same array the
 *    assessment's "add to plan" writes and the workspace dashboard reads.
 *    One list of work, whichever door you came through — not a second,
 *    competing plan the dashboard knows nothing about.
 *  - Steps are matched by template id, so a step already added from the
 *    assessment is adopted rather than duplicated.
 *  - Same privacy stance as the rest of the site: browser only, no accounts,
 *    no network, and leaving a path removes only what it added.
 */
(function () {
  "use strict";

  var PLAN_KEY = "gk-plan-v1";       // shared with assess.js and workspace.js
  var JOURNEY_KEY = "gk-journey-v1"; // which path, and per-step dates

  var DATA = null;
  var mounted = [];

  // ---------------------------------------------------------------- helpers

  function el(tag, attrs, children) {
    var n = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v === null || v === undefined || v === false) return;
      if (k === "class") n.className = v;
      else if (k === "html") n.innerHTML = v;
      else if (k.indexOf("on") === 0) n.addEventListener(k.slice(2), v);
      else n.setAttribute(k, v);
    });
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  function read(key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return v === null || v === undefined ? fallback : v;
    } catch (e) { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
      "-" + String(d.getDate()).padStart(2, "0");
  }

  /* "Days 1–30" -> 30, so a target date can be suggested from the window. */
  function windowEnd(text) {
    var m = String(text).match(/(\d+)\s*$/);
    return m ? Number(m[1]) : 0;
  }

  function addDays(iso, n) {
    var d = new Date(iso + "T00:00:00");
    d.setDate(d.getDate() + n);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
      "-" + String(d.getDate()).padStart(2, "0");
  }

  // ------------------------------------------------------------------- state

  function journey() {
    return read(JOURNEY_KEY, null);
  }

  function plandata() {
    return read(PLAN_KEY, []) || [];
  }

  /* A step's stable identity within a path. Not the template id: three of
     the four paths use a template twice, in different phases, for different
     work — keyed by template those steps merge into one. */
  function stepId(pathId, phase, s, index) {
    return pathId + ":" + phase + ":" + s.template + ":" + index;
  }

  function planItem(sid) {
    return plandata().filter(function (x) { return x.step === sid; })[0] || null;
  }

  /* An item the assessment added, matched on template alone — it has no step
     id because it did not come from a path. Adopting reuses it rather than
     listing the same work twice. */
  function looseItem(templateId) {
    return plandata().filter(function (x) {
      return !x.step && x.template === templateId;
    })[0] || null;
  }

  /*
   * Adopt a path: every step becomes an item in the shared plan.
   *
   * A step whose template is already there — added from the assessment, say —
   * is left alone and tagged as belonging to this path, so the user does not
   * end up with the same work listed twice.
   */
  function adopt(plan) {
    var list = plandata();
    var started = todayISO();

    plan.phases.forEach(function (ph, pi) {
      ph.steps.forEach(function (s, si) {
        var sid = stepId(plan.id, pi, s, si);
        var due = addDays(started, windowEnd(ph.window));

        // Already adopted (re-picking the same path): leave the user's work.
        if (planItem(sid)) return;

        // Added from the assessment, before any path was chosen. Claim it
        // for the first step that uses that template rather than duplicating.
        var loose = looseItem(s.template);
        if (loose) {
          loose.step = sid;
          loose.path = plan.id;
          loose.phase = pi;
          loose.action = s.do;
          loose.url = s.url;
          if (!loose.due) loose.due = due;
          if (!loose.owner) loose.owner = s.owner || "";
          return;
        }

        list.push({
          step: sid,
          template: s.template,
          // Stored so the workspace dashboard can link straight to the
          // template. It has no template index of its own, and the URL is
          // already resolved here.
          url: s.url,
          action: s.do,
          owner: s.owner || "",
          effort: s.effort || "",
          evidence: s.evidence || "",
          priority: pi === 0 ? "High" : "Medium",
          status: "open",
          added: started,
          path: plan.id,
          phase: pi,
          due: due
        });
      });
    });

    save(PLAN_KEY, list);
    save(JOURNEY_KEY, { path: plan.id, started: started });
  }

  /*
   * Leave a path. Only items this path added are removed, and only if they
   * are untouched — anything ticked off or edited is work the user did, and
   * deleting it because they switched paths would be theft.
   */
  function leave(keepDone) {
    var j = journey();
    if (!j) return;
    var kept = plandata().filter(function (x) {
      if (x.path !== j.path) return true;
      return keepDone && x.status === "done";
    });
    kept.forEach(function (x) { if (x.path === j.path) delete x.path; });
    save(PLAN_KEY, kept);
    try { localStorage.removeItem(JOURNEY_KEY); } catch (e) {}
  }

  function setStatus(sid, done) {
    var list = plandata();
    list.forEach(function (x) {
      if (x.step === sid) {
        x.status = done ? "done" : "open";
        if (done) x.completed = todayISO();
        else delete x.completed;
      }
    });
    save(PLAN_KEY, list);
  }

  function setField(sid, field, value) {
    var list = plandata();
    list.forEach(function (x) {
      if (x.step === sid) x[field] = value;
    });
    save(PLAN_KEY, list);
  }

  // ------------------------------------------------------------------- views

  function App(host) {
    this.host = host;
    this.render();
  }

  App.prototype.plan = function () {
    var j = journey();
    if (!j) return null;
    for (var i = 0; i < DATA.plans.length; i++) {
      if (DATA.plans[i].id === j.path) return DATA.plans[i];
    }
    return null;   // path removed from the data since it was chosen
  };

  App.prototype.render = function () {
    this.host.innerHTML = "";
    var plan = this.plan();
    this.host.appendChild(plan ? this.renderJourney(plan) : this.renderPicker());
  };

  /* Nothing chosen yet: the four paths as cards, one click to commit. */
  App.prototype.renderPicker = function () {
    var self = this;
    var wrap = el("div", { class: "gk-journey" });

    wrap.appendChild(el("h2", { class: "gk-journey-h" }, ["Pick your path"]));
    wrap.appendChild(el("p", { class: "gk-journey-lede" }, [
      "Choose the one that matches your situation. It becomes a tracked " +
      "checklist with owners and target dates — about 2 minutes to set up, " +
      "and your progress is saved in this browser. You can switch or leave " +
      "a path at any time."
    ]));

    var grid = el("div", { class: "gk-journey-cards" });
    DATA.plans.forEach(function (p) {
      var steps = p.phases.reduce(function (n, ph) { return n + ph.steps.length; }, 0);
      grid.appendChild(el("div", { class: "gk-card gk-journey-card" }, [
        el("h3", {}, [p.name]),
        el("p", { class: "gk-journey-when" }, [p.when]),
        el("dl", { class: "gk-journey-facts" }, [
          el("dt", {}, ["Effort"]), el("dd", {}, [p.total]),
          el("dt", {}, ["Steps"]), el("dd", {}, [String(steps) + " across 3 phases"]),
          el("dt", {}, ["Assumes"]), el("dd", {}, [p.assumes])
        ]),
        el("button", {
          class: "gk-btn gk-btn-primary", type: "button",
          onclick: function () { adopt(p); self.render(); self.host.scrollIntoView({ block: "start" }); }
        }, ["Start this path"])
      ]));
    });
    wrap.appendChild(grid);
    wrap.appendChild(el("p", { class: "gk-muted gk-journey-foot" }, [
      "Not sure? The full text of every path is below — reading it changes " +
      "nothing until you choose."
    ]));
    return wrap;
  };

  /* A path is chosen: only that one, as tracked work. */
  App.prototype.renderJourney = function (plan) {
    var self = this;
    var j = journey();
    var wrap = el("div", { class: "gk-journey" });

    var all = [];
    plan.phases.forEach(function (ph, pi) {
      ph.steps.forEach(function (s, si) {
        all.push({ step: s, phase: pi, sid: stepId(plan.id, pi, s, si) });
      });
    });
    var done = all.filter(function (x) {
      var it = planItem(x.sid);
      return it && it.status === "done";
    }).length;
    var pct = all.length ? Math.round((done / all.length) * 100) : 0;

    // --- header: what you are doing and how far in
    wrap.appendChild(el("div", { class: "gk-journey-head" }, [
      el("div", {}, [
        el("p", { class: "gk-journey-eyebrow" }, ["Your path"]),
        el("h2", { class: "gk-journey-h" }, [plan.name]),
        el("p", { class: "gk-muted" }, [
          "Started " + j.started + " · " + plan.total
        ])
      ]),
      el("div", { class: "gk-journey-progress" }, [
        el("div", { class: "gk-journey-pct" }, [pct + "%"]),
        el("div", { class: "gk-muted" }, [done + " of " + all.length + " done"])
      ])
    ]));

    wrap.appendChild(el("div", { class: "gk-progress" }, [
      el("div", { class: "gk-progress-bar" }, [
        el("div", { class: "gk-progress-fill", style: "width:" + pct + "%" })
      ]),
      el("span", { class: "gk-progress-label" }, [pct + "% complete"])
    ]));

    // --- the one thing to do next
    var next = null;
    for (var i = 0; i < all.length; i++) {
      var it = planItem(all[i].sid);
      if (!it || it.status !== "done") { next = all[i]; break; }
    }
    if (next) {
      var nitem = planItem(next.sid) || {};
      wrap.appendChild(el("div", { class: "gk-journey-next" }, [
        el("p", { class: "gk-journey-eyebrow" }, ["Next task"]),
        el("h3", {}, [next.step.do]),
        el("p", { class: "gk-muted" }, [
          "Phase " + (next.phase + 1) + " · " + next.step.effort +
          (nitem.owner ? " · " + nitem.owner : "") +
          (nitem.due ? " · target " + nitem.due : "")
        ]),
        el("p", {}, [
          el("a", { class: "gk-btn gk-btn-primary", href: next.step.url },
            ["Open " + next.step.title])
        ])
      ]));
    } else {
      wrap.appendChild(el("div", { class: "gk-journey-next is-done" }, [
        el("h3", {}, ["Every step is ticked off"]),
        el("p", {}, [
          "That is the 90 days done. A plan is not evidence, though — the " +
          "registers and decisions you filled in are. Back them up from the ",
          el("a", { href: "../workspace/" }, ["workspace"]),
          " before you close the browser."
        ])
      ]));
    }

    // --- the phases
    plan.phases.forEach(function (ph, pi) {
      var pdone = ph.steps.filter(function (s, si) {
        var it = planItem(stepId(plan.id, pi, s, si));
        return it && it.status === "done";
      }).length;

      var sec = el("section", { class: "gk-journey-phase" });
      sec.appendChild(el("div", { class: "gk-journey-phase-h" }, [
        el("h3", {}, [ph.window + " — " + ph.goal]),
        el("span", {
          class: "pill " + (pdone === ph.steps.length ? "ready" : "stub")
        }, [pdone + "/" + ph.steps.length + " done"])
      ]));
      sec.appendChild(el("p", { class: "gk-muted" }, ["Effort: " + ph.effort]));

      var list = el("ol", { class: "gk-journey-steps" });
      ph.steps.forEach(function (s, si) {
        list.appendChild(self.renderStep(s, pi, stepId(plan.id, pi, s, si)));
      });
      sec.appendChild(list);

      sec.appendChild(el("details", { class: "gk-journey-done" }, [
        el("summary", {}, ["You are done with this phase when…"]),
        el("ul", {}, ph.done.map(function (d) { return el("li", {}, [d]); }))
      ]));
      wrap.appendChild(sec);
    });

    // --- managing the path itself
    wrap.appendChild(el("div", { class: "gk-journey-actions" }, [
      el("button", {
        class: "gk-btn", type: "button",
        onclick: function () { self.exportPlan(plan); }
      }, ["Export this plan (CSV)"]),
      el("button", {
        class: "gk-btn", type: "button",
        onclick: function () {
          if (window.confirm(
              "Switch to a different path?\n\nSteps you have already ticked " +
              "off are kept. Untouched steps from this path are removed from " +
              "your plan.")) {
            leave(true); self.render();
          }
        }
      }, ["Switch path"])
    ]));
    wrap.appendChild(el("p", { class: "gk-muted gk-journey-foot" }, [
      "Your progress is saved in this browser only — nothing is uploaded. " +
      "Clearing your browser data clears it, so export anything you need to keep."
    ]));
    return wrap;
  };

  App.prototype.renderStep = function (s, phase, sid) {
    var self = this;
    var item = planItem(sid) || {};
    // Two steps can share a template, so element ids come from the step.
    var key = sid.replace(/[^a-z0-9]+/gi, "-");
    var isDone = item.status === "done";

    var li = el("li", { class: "gk-journey-step" + (isDone ? " is-done" : "") });

    var cb = el("input", { type: "checkbox", id: "st-" + key });
    cb.checked = isDone;
    cb.addEventListener("change", function () {
      setStatus(sid, cb.checked);
      self.render();
    });

    var head = el("div", { class: "gk-journey-step-h" }, [
      cb,
      el("label", { for: "st-" + key }, [
        el("strong", {}, [s.do]),
        el("span", { class: "gk-muted" }, [" · " + s.effort])
      ])
    ]);
    li.appendChild(head);

    var body = el("div", { class: "gk-journey-step-b" });
    if (s.note) body.appendChild(el("p", { class: "gk-journey-note" }, [s.note]));

    var fields = el("div", { class: "gk-journey-fields" });

    var oid = "ow-" + key;
    var owner = el("input", { type: "text", id: oid, class: "gk-field-input" });
    owner.value = item.owner || "";
    owner.addEventListener("change", function () {
      setField(sid, "owner", owner.value);
    });
    fields.appendChild(el("div", { class: "gk-field" }, [
      el("label", { for: oid }, ["Owner"]), owner
    ]));

    var did = "du-" + key;
    var due = el("input", { type: "date", id: did, class: "gk-field-input" });
    due.value = item.due || "";
    due.addEventListener("change", function () {
      setField(sid, "due", due.value);
    });
    fields.appendChild(el("div", { class: "gk-field" }, [
      el("label", { for: did }, ["Target date"]), due
    ]));
    body.appendChild(fields);

    if (s.evidence) {
      body.appendChild(el("p", { class: "gk-journey-evidence" }, [
        el("strong", {}, ["Done means: "]), s.evidence
      ]));
    }
    body.appendChild(el("p", {}, [
      el("a", { class: "gk-btn", href: s.url }, ["Open " + s.title])
    ]));
    li.appendChild(body);
    return li;
  };

  App.prototype.exportPlan = function (plan) {
    var rows = [["Phase", "Window", "Step", "Template", "Owner",
                 "Effort", "Target date", "Status", "Completed", "Done means"]];
    plan.phases.forEach(function (ph, pi) {
      ph.steps.forEach(function (s, si) {
        var it = planItem(stepId(plan.id, pi, s, si)) || {};
        rows.push([
          String(pi + 1), ph.window, s.do, s.title, it.owner || "",
          s.effort, it.due || "", it.status === "done" ? "Done" : "Open",
          it.completed || "", s.evidence || ""
        ]);
      });
    });
    var csv = rows.map(function (r) {
      return r.map(function (c) {
        var v = String(c == null ? "" : c);
        return /[",\n]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
      }).join(",");
    }).join("\r\n");

    var blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "govkit-plan-" + plan.id + "-" + todayISO() + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  };

  // ------------------------------------------------------------------- mount

  function mount() {
    mounted = [];
    var host = document.getElementById("gk-journey");
    if (!host) return;

    var src = host.getAttribute("data-src");
    if (!src) return;

    if (DATA) { mounted.push(new App(host)); return; }
    fetch(src)
      .then(function (r) { return r.json(); })
      .then(function (d) {
        DATA = d;
        mounted.push(new App(host));
      })
      .catch(function () {
        // The full text of every plan is already on the page below, so a
        // failure here costs the tracking, not the content.
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
