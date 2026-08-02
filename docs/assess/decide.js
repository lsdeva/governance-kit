/*
 * Guided decisions, and the decision log they feed.
 *
 * The rest of the site describes the options and leaves the judgement to the
 * reader. This walks one question at a time and ends in a VERDICT — a tier, a
 * rationale, a date — which is then recorded.
 *
 * Why the log matters more than the wizard: the EU AI Act, ISO/IEC 42001 and
 * NIST AI RMF all ask for documented, reasoned decisions. A rationale trail is
 * not an audit convenience, it is the deliverable. So every verdict is stored
 * with its answer path, exportable as Markdown or CSV, and can be pushed
 * straight into the AI System Inventory.
 *
 * Same privacy stance as everything else here: browser only, one storage key,
 * visible clear control.
 */
(function () {
  "use strict";

  var LOG_KEY = "gk-decisions-v1";
  var REGISTER_KEY = "gk-register-ai-system-inventory";
  var DATA = null;
  var REGISTER_DEF = null;   // lazily fetched column definitions
  var host = null;

  var state = {
    flash: null,       // one-shot confirmation after writing to the register
    decisionId: null,
    subject: "",
    path: [],        // [{qid, question, answer, label}]
    current: null,
    outcome: null
  };

  // ---------------------------------------------------------------- helpers

  function el(tag, attrs, kids) {
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
    (kids || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return n;
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
      "-" + String(d.getDate()).padStart(2, "0");
  }

  function download(text, name, mime) {
    var b = new Blob([text], { type: mime + ";charset=utf-8" });
    var u = URL.createObjectURL(b);
    var a = document.createElement("a");
    a.href = u; a.download = name;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(u); }, 1000);
  }

  // ------------------------------------------------------------ decision log

  function loadLog() {
    try { return JSON.parse(localStorage.getItem(LOG_KEY)) || []; }
    catch (e) { return []; }
  }

  function saveLog(entries) {
    try { localStorage.setItem(LOG_KEY, JSON.stringify(entries)); } catch (e) {}
  }

  function recordDecision() {
    var d = decision();
    var entries = loadLog();
    entries.push({
      id: "D-" + String(entries.length + 1).padStart(3, "0"),
      decision: d.title,
      decisionId: d.id,
      subject: state.subject || "(unnamed system)",
      verdict: state.outcome.tier,
      ref: state.outcome.ref || null,
      headline: state.outcome.headline,
      date: todayISO(),
      at: new Date().toISOString(),
      path: state.path.map(function (p) {
        return { question: p.question, answer: p.label };
      })
    });
    saveLog(entries);
    return entries;
  }

  // -------------------------------------------- write-through to the register

  /*
   * Push a recorded risk-tier decision into the AI System Inventory.
   *
   * Shares localStorage with registers.js, so the shape must match exactly:
   * {id, sheets: [[row, ...]], savedAt}, rows as arrays of strings whose length
   * equals the column count. registers.js discards any sheet whose first row is
   * the wrong width, so getting this wrong silently loses the user's data.
   *
   * Columns are addressed BY NAME. Indexes would break the moment anyone
   * reorders data/spreadsheets.yml.
   */
  function registerColumns() {
    return REGISTER_DEF && REGISTER_DEF.main ? REGISTER_DEF.main.columns : null;
  }

  function colIndex(columns, name) {
    for (var i = 0; i < columns.length; i++) {
      if (columns[i].name === name) return i;
    }
    return -1;
  }

  function loadRegister() {
    try { return JSON.parse(localStorage.getItem(REGISTER_KEY)); }
    catch (e) { return null; }
  }

  /* Next free AI-nnn, scanning whatever IDs are already in the sheet. */
  function nextSystemId(rows, idIdx) {
    var max = 0;
    rows.forEach(function (r) {
      var m = /^AI-(\d+)$/.exec(String(r[idIdx] || "").trim());
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return "AI-" + String(max + 1).padStart(3, "0");
  }

  function isBlankRow(row) {
    return row.every(function (c) { return String(c == null ? "" : c).trim() === ""; });
  }

  /* An operator-role verdict for the same subject, if the user has recorded one. */
  function roleFor(subject) {
    var want = String(subject || "").trim().toLowerCase();
    if (!want) return "";
    var match = loadLog().filter(function (e) {
      return e.decisionId === "operator-role" &&
        String(e.subject || "").trim().toLowerCase() === want;
    });
    if (!match.length) return "";
    // Latest wins, and strip the parenthetical qualifier: the register's
    // "Our role" column is a dropdown of Provider/Deployer/Importer/Distributor.
    var verdict = match[match.length - 1].verdict || "";
    return verdict.split("(")[0].trim();
  }

  function addToInventory(entry) {
    var columns = registerColumns();
    if (!columns) return { ok: false, why: "The register definition is not loaded." };

    var saved = loadRegister();
    var sheets;
    if (saved && Array.isArray(saved.sheets) && saved.sheets.length &&
        Array.isArray(saved.sheets[0]) && saved.sheets[0].length &&
        saved.sheets[0][0].length === columns.length) {
      sheets = saved.sheets;
    } else if (saved && saved.sheets) {
      // Existing data of an unexpected shape — refuse rather than overwrite it.
      return {
        ok: false,
        why: "Your saved register has a different shape to the current " +
             "template, so nothing was changed. Open the register and export " +
             "it before trying again."
      };
    } else {
      // Fresh start, matching what registers.js creates.
      var blank = [];
      for (var i = 0; i < 5; i++) {
        blank.push(columns.map(function () { return ""; }));
      }
      sheets = [blank];
      (REGISTER_DEF.extra_sheets || []).forEach(function (s) {
        var rows = [];
        for (var j = 0; j < 5; j++) {
          rows.push(s.columns.map(function () { return ""; }));
        }
        sheets.push(rows);
      });
    }

    var rows = sheets[0];
    var idIdx = colIndex(columns, "System ID");
    var row = columns.map(function () { return ""; });

    function set(name, value) {
      var i = colIndex(columns, name);
      if (i !== -1 && value) row[i] = value;
    }

    var rationale = entry.path.map(function (p) {
      return p.question + " " + p.answer;
    }).join("; ");

    set("System ID", idIdx === -1 ? "" : nextSystemId(rows, idIdx));
    set("System name", entry.subject);
    set("Purpose", entry.subject);
    set("Risk tier", entry.verdict);
    set("Tier rationale", rationale);
    set("Annex ref", entry.ref || "");
    set("Our role", roleFor(entry.subject));
    set("Last reviewed", entry.date);

    // Fill the first fully-blank row, else append. Never overwrite real data.
    var placed = false;
    for (var k = 0; k < rows.length; k++) {
      if (isBlankRow(rows[k])) { rows[k] = row; placed = true; break; }
    }
    if (!placed) rows.push(row);

    try {
      localStorage.setItem(REGISTER_KEY, JSON.stringify({
        id: "ai-system-inventory",
        sheets: sheets,
        savedAt: new Date().toISOString()
      }));
    } catch (e) {
      return { ok: false, why: "This browser would not store the register." };
    }
    return { ok: true, systemId: row[idIdx] || "" };
  }

  function decision() {
    return DATA.decisions.filter(function (d) {
      return d.id === state.decisionId;
    })[0];
  }

  /* The value PROPERTY must be assigned, not the attribute — setAttribute only
   * sets the default value, so a subject carried across a jump between flows
   * would not appear in the box. */
  function subjectInput() {
    var input = el("input", {
      type: "text",
      placeholder: "e.g. Referral triage prioritisation",
      oninput: function (e) { state.subject = e.target.value; }
    });
    input.value = state.subject || "";
    return input;
  }

  function decisionById(id) {
    return DATA.decisions.filter(function (d) { return d.id === id; })[0];
  }

  /*
   * An action can point at another guided decision with {{decision:id}}.
   * Rendered as a button that starts that flow, so "confirm whether you are the
   * provider or the deployer" is a thing the user can DO from here rather than
   * an instruction to go and find something.
   */
  function actionNodes(text) {
    var parts = [];
    var re = /\{\{decision:([a-z0-9\-]+)\}\}/g;
    var last = 0, m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parts.push(text.slice(last, m.index));
      var target = decisionById(m.group ? m.group(1) : m[1]);
      if (target) {
        parts.push(el("button", {
          class: "gk-link gk-dec-jump", type: "button",
          onclick: function () { begin(target.id, true); }
        }, ["Work it out now →"]));
      }
      last = m.index + m[0].length;
    }
    if (last < text.length) parts.push(text.slice(last));
    return parts.length ? parts : [text];
  }

  function questionById(qid) {
    return decision().questions.filter(function (q) { return q.id === qid; })[0];
  }

  function outcomeById(oid) {
    return decision().outcomes.filter(function (o) { return o.id === oid; })[0];
  }

  // --------------------------------------------------------------- flow

  /* keepSubject carries the system name across a jump between flows, so the
   * user is not retyping "CV screening" to answer the next question about the
   * same system. */
  function begin(id, keepSubject) {
    state.decisionId = id;
    state.path = [];
    state.outcome = null;
    if (!keepSubject) state.subject = "";
    state.current = decision().start;
    render();
  }

  function answer(q, resultOrNext, label) {
    state.path.push({
      qid: q.id, question: q.text, label: label
    });
    if (typeof resultOrNext === "string") {
      state.current = resultOrNext;
      state.outcome = null;
    } else if (resultOrNext && resultOrNext.outcome) {
      var o = outcomeById(resultOrNext.outcome);
      state.outcome = Object.assign({}, o, { ref: resultOrNext.ref || null });
      state.current = null;
    }
    render();
  }

  /* Step back one question: drop the last answer and re-ask that question. */
  function back() {
    if (!state.path.length) return;
    var last = state.path.pop();
    state.outcome = null;
    state.current = last.qid;
    render();
  }

  // -------------------------------------------------------------- rendering

  function render() {
    host.innerHTML = "";
    if (!state.decisionId) { host.appendChild(viewIndex()); return; }
    if (state.outcome) { host.appendChild(viewOutcome()); return; }
    host.appendChild(viewQuestion());
  }

  function viewIndex() {
    var wrap = el("div", { class: "gk-dec" });
    wrap.appendChild(el("p", { class: "gk-lede" }, [
      "Answer one question at a time and end with a decision you can defend — " +
      "not a definition table to interpret yourself. Each verdict is recorded " +
      "with its reasoning and the date."
    ]));
    wrap.appendChild(el("div", { class: "gk-privacy" }, [
      el("strong", {}, ["Nothing leaves your browser."]),
      el("span", {}, [
        " Decisions are stored on this device so you can export them as " +
        "evidence. Clear them at any time."
      ])
    ]));

    DATA.decisions.forEach(function (d) {
      wrap.appendChild(el("div", { class: "gk-dec-card" }, [
        el("h3", {}, [d.title]),
        el("p", {}, [d.short]),
        el("p", { class: "gk-muted" }, ["Why it matters: " + d.why]),
        el("button", {
          class: "gk-btn gk-btn-primary", type: "button",
          onclick: function () { begin(d.id); }
        }, ["Start"])
      ]));
    });

    wrap.appendChild(logBlock());
    return wrap;
  }

  function viewQuestion() {
    var d = decision();
    var q = questionById(state.current);
    var wrap = el("div", { class: "gk-dec" });

    // A derogation question only makes sense after a particular earlier answer.
    if (q.only_after && !q.only_after.some(function (qid) {
      return state.path.some(function (p) { return p.qid === qid; });
    })) {
      // Should not happen with the current tree; fail visibly rather than
      // silently showing an out-of-context question.
      wrap.appendChild(el("p", {}, ["This question is out of sequence."]));
      return wrap;
    }

    wrap.appendChild(el("div", { class: "gk-dec-head" }, [
      el("span", { class: "gk-dec-stage" }, [q.stage]),
      el("span", { class: "gk-dec-step" }, [
        "Question " + (state.path.length + 1)
      ])
    ]));

    if (state.path.length === 0) {
      wrap.appendChild(el("p", { class: "gk-muted" }, [d.intro]));
      var nameWrap = el("label", { class: "gk-dec-subject" }, [
        el("span", {}, ["Which system are you classifying?"]),
        subjectInput()
      ]);
      wrap.appendChild(nameWrap);
    } else if (state.subject) {
      wrap.appendChild(el("p", { class: "gk-muted" }, [
        "Classifying: " + state.subject
      ]));
    }

    wrap.appendChild(el("h2", { class: "gk-dec-q" }, [q.text]));
    if (q.help) wrap.appendChild(el("p", { class: "gk-dec-help" }, [q.help]));

    var opts = el("div", { class: "gk-dec-opts" });
    if (q.options) {
      q.options.forEach(function (o) {
        opts.appendChild(el("button", {
          class: "gk-dec-opt", type: "button",
          onclick: function () { answer(q, o.next, o.label); }
        }, [o.label]));
      });
    } else {
      opts.appendChild(el("button", {
        class: "gk-dec-opt is-yes", type: "button",
        onclick: function () { answer(q, q["yes"], "Yes"); }
      }, ["Yes"]));
      opts.appendChild(el("button", {
        class: "gk-dec-opt is-no", type: "button",
        onclick: function () { answer(q, q["no"], "No"); }
      }, ["No"]));
      opts.appendChild(el("button", {
        class: "gk-dec-opt is-unsure", type: "button",
        title: "Treated as Yes — over-classifying is the safer error",
        onclick: function () { answer(q, q["yes"], "Not sure (treated as Yes)"); }
      }, ["Not sure"]));
    }
    wrap.appendChild(opts);

    if (q.options === undefined) {
      wrap.appendChild(el("p", { class: "gk-muted gk-dec-unsure" }, [
        "Not sure? It counts as Yes. Over-classifying costs effort; " +
        "under-classifying costs a great deal more."
      ]));
    }

    if (state.path.length) {
      wrap.appendChild(el("div", { class: "gk-dec-trail" }, [
        el("strong", {}, ["So far: "]),
        el("span", {}, [state.path.map(function (p) {
          return p.label;
        }).join(" → ")]),
        el("button", {
          class: "gk-link", type: "button",
          onclick: function () { back(); }
        }, ["Back"])
      ]));
    }

    wrap.appendChild(el("div", { class: "gk-actions" }, [
      el("button", {
        class: "gk-btn", type: "button",
        onclick: function () { state.decisionId = null; render(); }
      }, ["Start over"])
    ]));
    return wrap;
  }

  function viewOutcome() {
    var o = state.outcome;
    var wrap = el("div", { class: "gk-dec" });

    wrap.appendChild(el("div", {
      class: "gk-verdict is-" + o.severity
    }, [
      el("span", { class: "gk-verdict-tier" }, [o.tier]),
      el("h2", {}, [o.headline]),
      o.ref ? el("p", { class: "gk-verdict-ref" }, [o.ref]) : null,
      el("p", {}, [o.detail])
    ]));

    if (state.subject) {
      wrap.appendChild(el("p", {}, [
        el("strong", {}, ["System: "]), state.subject
      ]));
    }

    wrap.appendChild(el("h3", {}, ["What to do now"]));
    var ol = el("ol", { class: "gk-dec-actions" });
    o.actions.forEach(function (a) { ol.appendChild(el("li", {}, actionNodes(a))); });
    wrap.appendChild(ol);

    if (o.counsel) {
      wrap.appendChild(el("div", { class: "gk-counsel" }, [
        el("strong", {}, ["This one is a question for counsel. "]),
        el("span", {}, [o.counsel])
      ]));
    }

    if (o.templates && o.templates.length) {
      var links = el("p", {}, [el("strong", {}, ["Templates to use: "])]);
      o.templates.forEach(function (tid, i) {
        var t = DATA.templates[tid];
        if (!t) return;
        if (i) links.appendChild(document.createTextNode(" · "));
        links.appendChild(el("a", { href: t.url }, [t.title]));
      });
      wrap.appendChild(links);
    }

    wrap.appendChild(el("h3", {}, ["How you got here"]));
    var trail = el("ol", { class: "gk-dec-trail-full" });
    state.path.forEach(function (p) {
      trail.appendChild(el("li", {}, [
        el("span", { class: "gk-muted" }, [p.question + " "]),
        el("strong", {}, [p.label])
      ]));
    });
    wrap.appendChild(trail);
    wrap.appendChild(el("p", { class: "gk-muted" }, [
      "This is the rationale. Recording it is what makes the classification " +
      "defensible later — and what the Act, ISO/IEC 42001 and NIST AI RMF all " +
      "ask you to produce."
    ]));

    var bar = el("div", { class: "gk-actions" });
    bar.appendChild(el("button", {
      class: "gk-btn gk-btn-primary", type: "button",
      onclick: function () {
        recordDecision();
        state.decisionId = null;
        state.subject = "";
        state.path = [];
        state.outcome = null;
        render();
        var log = document.querySelector(".gk-log");
        if (log) log.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, ["Record this decision"]));
    bar.appendChild(el("button", {
      class: "gk-btn", type: "button", onclick: function () { back(); }
    }, ["Change an answer"]));
    bar.appendChild(el("button", {
      class: "gk-btn", type: "button",
      onclick: function () {
        state.decisionId = null; state.path = []; state.outcome = null; render();
      }
    }, ["Discard"]));
    wrap.appendChild(bar);
    return wrap;
  }

  // ------------------------------------------------------------------- log

  function logBlock() {
    var entries = loadLog();
    var sec = el("section", { class: "gk-log" });
    sec.appendChild(el("h2", {}, ["Your decision log"]));

    if (!entries.length) {
      sec.appendChild(el("p", { class: "gk-muted" }, [
        "No decisions recorded yet. Once you record one, it appears here with " +
        "its reasoning and date — ready to export as evidence or to paste into " +
        "your AI System Inventory."
      ]));
      return sec;
    }

    sec.appendChild(el("p", { class: "gk-muted" }, [
      entries.length + " decision" + (entries.length === 1 ? "" : "s") +
      " recorded on this device."
    ]));

    if (state.flash) {
      var reg = DATA.templates && DATA.templates["ai-system-inventory"];
      sec.appendChild(el("div", { class: "gk-flash" }, [
        el("strong", {}, [state.flash + " "]),
        reg ? el("a", { href: reg.url }, ["Open the AI System Inventory"]) : null,
        el("span", { class: "gk-muted" }, [
          " — the row is there, ready to complete."
        ])
      ]));
      state.flash = null;
    }

    var tbl = el("table", { class: "gk-table" });
    tbl.appendChild(el("thead", {}, [el("tr", {}, [
      el("th", {}, ["Ref"]), el("th", {}, ["Subject"]),
      el("th", {}, ["Decision"]), el("th", {}, ["Verdict"]),
      el("th", {}, ["Basis"]), el("th", {}, ["Date"]),
      el("th", {}, ["Actions"])
    ])]));
    var tb = el("tbody");
    entries.forEach(function (e, i) {
      var actions = el("td", { class: "gk-log-actions" });

      // A classification belongs in the inventory. Offer to put it there
      // rather than making the user retype what the site already knows.
      if (e.decisionId === "risk-tier" && registerColumns()) {
        actions.appendChild(el("button", {
          class: "gk-btn gk-btn-small", type: "button",
          title: "Write this classification into your AI System Inventory",
          onclick: function () {
            var res = addToInventory(e);
            if (!res.ok) { window.alert(res.why); return; }
            var all = loadLog();
            all[i].inventoried = res.systemId || true;
            saveLog(all);
            state.flash = "Added " + (res.systemId || "the system") +
              " to your AI System Inventory.";
            render();
          }
        }, [e.inventoried ? "Add again" : "Add to inventory"]));
      }
      if (e.inventoried) {
        actions.appendChild(el("span", { class: "gk-log-done" }, [
          typeof e.inventoried === "string" ? e.inventoried + " ✓" : "✓"
        ]));
      }
      actions.appendChild(el("button", {
        class: "gk-reg-x", type: "button", title: "Remove this entry",
        onclick: function () {
          if (!window.confirm("Remove " + e.id + " from the log?")) return;
          var all = loadLog(); all.splice(i, 1); saveLog(all); render();
        }
      }, ["×"]));

      tb.appendChild(el("tr", {}, [
        el("td", {}, [e.id]),
        el("td", {}, [e.subject]),
        el("td", {}, [e.decision]),
        el("td", {}, [el("strong", {}, [e.verdict])]),
        el("td", {}, [e.ref || "—"]),
        el("td", {}, [e.date]),
        actions
      ]));
    });
    tbl.appendChild(tb);
    sec.appendChild(tbl);

    var bar = el("div", { class: "gk-actions" });
    bar.appendChild(el("button", {
      class: "gk-btn", type: "button",
      onclick: function () {
        download(logMarkdown(entries),
          "decision-log-" + todayISO() + ".md", "text/markdown");
      }
    }, ["Export as Markdown"]));
    bar.appendChild(el("button", {
      class: "gk-btn", type: "button",
      onclick: function () {
        download(logCsv(entries), "decision-log-" + todayISO() + ".csv", "text/csv");
      }
    }, ["Export as CSV"]));
    bar.appendChild(el("button", {
      class: "gk-btn", type: "button", onclick: function () { window.print(); }
    }, ["Print / Save as PDF"]));
    bar.appendChild(el("button", {
      class: "gk-btn gk-btn-danger", type: "button",
      onclick: function () {
        if (!window.confirm(
          "Erase every recorded decision from this browser?\n\nThis cannot be undone."
        )) return;
        try { localStorage.removeItem(LOG_KEY); } catch (e) {}
        render();
      }
    }, ["Clear my decisions"]));
    sec.appendChild(bar);
    return sec;
  }

  function logMarkdown(entries) {
    var L = ["# AI governance decision log", "",
      "Generated " + todayISO() + " with the Open Data & AI Governance Kit.",
      "Self-assessed; these are recorded judgements, not legal determinations.",
      ""];
    entries.forEach(function (e) {
      L.push("## " + e.id + " — " + e.subject);
      L.push("");
      L.push("| | |");
      L.push("|---|---|");
      L.push("| **Decision** | " + e.decision + " |");
      L.push("| **Verdict** | " + e.verdict + " |");
      L.push("| **Basis** | " + (e.ref || "—") + " |");
      L.push("| **Date** | " + e.date + " |");
      L.push("");
      L.push("**Reasoning**");
      L.push("");
      e.path.forEach(function (p) {
        L.push("- " + p.question + " **" + p.answer + "**");
      });
      L.push("");
    });
    L.push("---");
    L.push("");
    L.push("**Not legal advice.** These are self-assessed classifications " +
      "recorded for governance purposes. Confirm anything material with " +
      "qualified counsel.");
    return L.join("\n") + "\n";
  }

  function logCsv(entries) {
    function c(v) {
      var s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }
    var rows = [["Ref", "Subject", "Decision", "Verdict", "Basis", "Date",
      "Reasoning"].join(",")];
    entries.forEach(function (e) {
      rows.push([e.id, e.subject, e.decision, e.verdict, e.ref || "", e.date,
        e.path.map(function (p) { return p.question + " " + p.answer; }).join(" | ")
      ].map(c).join(","));
    });
    return "﻿" + rows.join("\r\n");
  }

  // ------------------------------------------------------------------ boot

  function init() {
    host = document.getElementById("gk-decide");
    if (!host) return;

    if (DATA) { render(); return; }

    var src = host.getAttribute("data-src") || "decision-data.json";
    // The register definition sits beside the decision data. Needed so a
    // recorded classification can be written into the AI System Inventory
    // using the same columns registers.js uses. Its failure is non-fatal —
    // the flows still work, only the inventory button is withheld.
    var rsrc = src.replace(/decision-data\.json$/, "register-data.json");

    fetch(src, { credentials: "omit" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (json) {
        DATA = json;
        return fetch(rsrc, { credentials: "omit" })
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; });
      })
      .then(function (rjson) {
        if (rjson && rjson.registers) {
          REGISTER_DEF = rjson.registers["ai-system-inventory"] || null;
        }
        render();
      })
      .catch(function (err) {
        host.innerHTML = "<p>The guided decisions could not load (" +
          esc(err.message) + ").</p>";
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
