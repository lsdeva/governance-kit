/*
 * In-browser register editor.
 *
 * Turns any register defined in data/spreadsheets.yml into an editable grid on
 * the page, so a visitor can start filling in their AI inventory or risk
 * register immediately rather than downloading a file first.
 *
 * Design notes:
 *  - Reads register-data.json, generated from the same YAML that produces the
 *    .xlsx downloads. Columns, dropdowns, help text and formulas are never
 *    duplicated here.
 *  - A real editable grid, not a form: click a cell and type, Tab/arrows to
 *    move, Enter for the next row. Anyone who has used a spreadsheet already
 *    knows how to drive it.
 *  - Formulas defined in the YAML are evaluated live for the small set of
 *    arithmetic we actually use (multiply, subtract, banding), so a Risk
 *    Register scores itself as you type. On export the real Excel formula is
 *    written, so the file keeps calculating.
 *  - Same privacy stance as the rest of the site: everything stays in the
 *    browser, autosaved to localStorage under one key per register, with a
 *    visible clear control.
 */
(function () {
  "use strict";

  var KEY_PREFIX = "gk-register-";
  var DATA_URL_ATTR = "data-src";

  var REG = null;      // all register definitions
  var mounted = [];    // active editors, so instant-navigation can reset

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

  function todayISO() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") +
      "-" + String(d.getDate()).padStart(2, "0");
  }

  function download(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  // -------------------------------------------------------------- formulas

  /*
   * Evaluate the formula spec from spreadsheets.yml against a row.
   *
   * We deliberately do NOT implement a general expression evaluator (and never
   * eval() user-adjacent strings). The formulas in the data are a small, known
   * set — a product, a difference, and a banded lookup — so they are matched by
   * shape. Anything unrecognised simply shows blank rather than guessing.
   */
  function evalFormula(spec, row, cols, seen) {
    var names = {};
    cols.forEach(function (c, i) { names[c.name] = i; });
    seen = seen || {};

    function val(name) {
      var i = names[name];
      if (i === undefined) return null;

      // A calculated column has no stored value — resolve it by evaluating its
      // own formula. The Risk Register's Level depends on Rating, which is
      // itself calculated; without this, Level would always read blank.
      // `seen` guards against a cycle in the data.
      var col = cols[i];
      if (col.formula) {
        if (seen[name]) return null;
        seen[name] = true;
        var computed = evalFormula(col.formula, row, cols, seen);
        var cn = Number(computed);
        return computed === "" || isNaN(cn) ? null : cn;
      }

      var raw = row[i];
      if (raw === "" || raw === null || raw === undefined) return null;
      var n = Number(raw);
      return isNaN(n) ? null : n;
    }

    // {A} * {B}
    var m = spec.match(/ISNUMBER\(\{([^}]+)\}\).*?ISNUMBER\(\{([^}]+)\}\).*?\{([^}]+)\}\*\{([^}]+)\}/);
    if (m) {
      var a = val(m[3]), b = val(m[4]);
      return a === null || b === null ? "" : a * b;
    }

    // {A} - {B}
    m = spec.match(/ISNUMBER\(\{([^}]+)\}\).*?ISNUMBER\(\{([^}]+)\}\).*?\{([^}]+)\}-\{([^}]+)\}/);
    if (m) {
      var x = val(m[3]), y = val(m[4]);
      return x === null || y === null ? "" : x - y;
    }

    // Banded IF chain over a single column, e.g. Rating -> Critical/High/...
    m = spec.match(/^=IF\(\{([^}]+)\}=""/);
    if (m) {
      var v = val(m[1]);
      if (v === null) return "";
      var bands = [];
      var re = /\{[^}]+\}>=(\d+),"([^"]+)"/g, bm;
      while ((bm = re.exec(spec)) !== null) bands.push([Number(bm[1]), bm[2]]);
      var fallback = spec.match(/,"([^"]+)"\)+\s*$/);
      for (var i = 0; i < bands.length; i++) {
        if (v >= bands[i][0]) return bands[i][1];
      }
      return fallback ? fallback[1] : "";
    }

    return "";
  }

  /* The same spec, rendered as a real Excel formula for the exported file. */
  function excelFormula(spec, cols, rowNumber) {
    var letters = {};
    cols.forEach(function (c, i) { letters[c.name] = window.GKXlsx.colLetter(i + 1); });
    return spec.replace(/\{([^{}]+)\}/g, function (whole, name) {
      if (!(name in letters)) return whole;
      return letters[name] + rowNumber;
    });
  }

  // ----------------------------------------------------------------- editor

  function Editor(host, def) {
    this.host = host;
    this.def = def;
    this.key = KEY_PREFIX + def.id;
    this.sheets = [def.main].concat(def.extra_sheets || []);
    this.active = 0;
    this.rows = null;
    this.dirty = false;
    this.load();
    this.render();
  }

  Editor.prototype.blankRow = function (sheet) {
    return sheet.columns.map(function () { return ""; });
  };

  Editor.prototype.load = function () {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(this.key)); } catch (e) {}
    var self = this;

    this.data = this.sheets.map(function (sheet, si) {
      var stored = saved && saved.sheets && saved.sheets[si];
      if (stored && stored.length &&
          stored[0].length === sheet.columns.length) {
        return stored;
      }
      // Fresh start: begin empty, with enough blank rows to feel usable. The
      // YAML's illustrative rows are available behind "Load example rows"
      // rather than forced on the user, who would only have to delete them.
      var rows = [];
      for (var i = 0; i < 5; i++) rows.push(self.blankRow(sheet));
      return rows;
    });
    this.restored = !!(saved && saved.sheets);
  };

  Editor.prototype.save = function () {
    try {
      localStorage.setItem(this.key, JSON.stringify({
        id: this.def.id, sheets: this.data, savedAt: new Date().toISOString()
      }));
    } catch (e) { /* private mode or quota — keep working in memory */ }
    this.updateStatus("Saved to this browser");
  };

  Editor.prototype.updateStatus = function (msg) {
    if (!this.statusEl) return;
    this.statusEl.textContent = msg;
    this.statusEl.classList.add("is-flash");
    var s = this.statusEl;
    clearTimeout(this._t);
    this._t = setTimeout(function () { s.classList.remove("is-flash"); }, 900);
  };

  Editor.prototype.filledRows = function (si) {
    return this.data[si].filter(function (r) {
      return r.some(function (c) { return String(c).trim() !== ""; });
    });
  };

  /*
   * Seed the risk register from the assessment.
   *
   * If the visitor has already answered the questionnaire, their open gaps are
   * exactly the risks they should be recording. Rather than making them retype
   * what the site already knows, offer to bring them across — as a prompt, not
   * automatically, since it is their register.
   */
  Editor.prototype.assessmentGaps = function () {
    if (this.def.id !== "risk-register") return [];
    var saved;
    try { saved = JSON.parse(localStorage.getItem("gk-assessment-v1")); }
    catch (e) { return []; }
    if (!saved || !saved.answers) return [];

    var bank = window.GK_QUESTIONS;
    if (!bank) return [];

    var out = [];
    Object.keys(saved.answers).forEach(function (qid) {
      var a = saved.answers[qid];
      if (!a || (a.value !== "no" && a.value !== "partial")) return;
      var q = bank[qid];
      if (!q) return;
      out.push({ q: q, answer: a.value, note: a.note || "" });
    });
    out.sort(function (x, y) { return y.q.weight - x.q.weight; });
    return out;
  };

  /* Map a gap onto the risk register's columns, by column NAME not position. */
  Editor.prototype.gapToRow = function (gap, columns) {
    var idx = {};
    columns.forEach(function (c, i) { idx[c.name] = i; });
    var row = columns.map(function () { return ""; });

    function set(name, value) {
      if (idx[name] !== undefined) row[idx[name]] = value;
    }

    var sev = gap.q.weight >= 5 ? "4" : gap.q.weight >= 4 ? "3" : "2";
    set("Risk ID", gap.q.id.replace("Q", "R-"));
    set("Risk description",
      "Because " + lowerFirst(gap.q.text).replace(/\.$/, "") +
      (gap.answer === "no" ? " is not in place" : " is only partly in place") +
      ", we may be unable to demonstrate compliance" +
      (gap.q.obligation && gap.q.obligation.ref
        ? " with " + gap.q.obligation.ref : "") +
      ", leading to regulatory and reputational exposure.");
    set("Category", "Compliance");
    set("Likelihood", gap.answer === "no" ? "4" : "3");
    set("Impact", sev);
    set("Treatment", "Treat");
    set("Controls / actions", gap.note ||
      ("Close the gap identified by " + gap.q.id + " in the readiness assessment."));
    return row;
  };

  function lowerFirst(s) {
    return s ? s.charAt(0).toLowerCase() + s.slice(1) : s;
  }

  Editor.prototype.importGaps = function () {
    var gaps = this.assessmentGaps();
    if (!gaps.length) return;
    if (!window.confirm(
      "Add " + gaps.length + " open gap" + (gaps.length === 1 ? "" : "s") +
      " from your readiness assessment as draft risks?\n\n" +
      "They are starting points — edit the wording, scoring and owners.")) return;
    var sheet = this.sheets[0];
    var self = this;
    gaps.forEach(function (g) {
      self.data[0].push(self.gapToRow(g, sheet.columns));
    });
    this.active = 0;
    this.save();
    this.render();
    this.updateStatus(gaps.length + " draft risks added");
  };

  Editor.prototype.render = function () {
    var self = this;
    this.host.innerHTML = "";
    var sheet = this.sheets[this.active];

    var wrap = el("div", { class: "gk-reg" });

    var gaps = this.assessmentGaps();
    if (gaps.length) {
      wrap.appendChild(el("div", { class: "gk-reg-link" }, [
        el("span", {}, [
          "Your readiness assessment has ",
          el("strong", {}, [String(gaps.length)]),
          " open gap" + (gaps.length === 1 ? "" : "s") + ". "
        ]),
        el("button", {
          class: "gk-btn gk-btn-primary", type: "button",
          onclick: function () { self.importGaps(); }
        }, ["Add them as draft risks"])
      ]));
    }

    // --- toolbar
    var bar = el("div", { class: "gk-reg-bar" });

    if (this.sheets.length > 1) {
      var tabs = el("div", { class: "gk-reg-tabs" });
      this.sheets.forEach(function (s, i) {
        tabs.appendChild(el("button", {
          class: "gk-chip" + (i === self.active ? " is-on" : ""),
          type: "button",
          onclick: function () { self.active = i; self.render(); }
        }, [s.name]));
      });
      bar.appendChild(tabs);
    }

    var actions = el("div", { class: "gk-reg-actions" });
    actions.appendChild(el("button", {
      class: "gk-btn gk-btn-primary", type: "button",
      onclick: function () { self.addRow(); }
    }, ["+ Add row"]));
    actions.appendChild(el("button", {
      class: "gk-btn", type: "button",
      onclick: function () { self.exportXlsx(); }
    }, ["Export to Excel"]));
    actions.appendChild(el("button", {
      class: "gk-btn", type: "button",
      onclick: function () { self.exportCsv(); }
    }, ["Export to CSV"]));
    actions.appendChild(el("button", {
      class: "gk-btn", type: "button",
      onclick: function () { self.exportJson(); }
    }, ["Back up this register"]));
    actions.appendChild(el("label", { class: "gk-btn gk-file" }, [
      "Restore this register",
      el("input", {
        type: "file", accept: ".json,application/json",
        onchange: function (e) { self.importJson(e); }
      })
    ]));
    if (sheet.rows && sheet.rows.length) {
      actions.appendChild(el("button", {
        class: "gk-btn", type: "button",
        onclick: function () { self.loadExample(); }
      }, ["Load example rows"]));
    }
    actions.appendChild(el("button", {
      class: "gk-btn gk-btn-danger", type: "button",
      onclick: function () { self.clear(); }
    }, ["Clear"]));
    bar.appendChild(actions);
    wrap.appendChild(bar);

    this.statusEl = el("span", { class: "gk-reg-status" }, [
      this.restored ? "Restored from this browser" : "Nothing saved yet"
    ]);
    wrap.appendChild(el("div", { class: "gk-reg-meta" }, [
      this.statusEl,
      el("span", { class: "gk-muted" }, [
        " · Autosaved in this browser as you type. Nothing is uploaded."
      ])
    ]));

    // Three different things, three different names. Users were conflating a
    // shareable document with a restorable backup.
    wrap.appendChild(el("p", { class: "gk-reg-help" }, [
      el("strong", {}, ["Export"]),
      " gives you an Excel or CSV file to share or work on offline. ",
      el("strong", {}, ["Back up"]),
      " gives you a file that restores this register here, on any device. " +
      "Neither replaces the other, and clearing your browser data clears the " +
      "autosave — so back up anything you want to keep."
    ]));

    // --- grid
    var scroll = el("div", { class: "gk-reg-scroll" });
    var table = el("table", { class: "gk-reg-table" });

    var thead = el("thead");
    var hr = el("tr", {}, [el("th", { class: "gk-reg-num" }, ["#"])]);
    sheet.columns.forEach(function (c) {
      hr.appendChild(el("th", { title: c.help || "" }, [
        el("span", {}, [c.name]),
        c.help ? el("span", { class: "gk-reg-q", title: c.help }, ["?"]) : null,
        c.formula ? el("span", { class: "gk-reg-calc" }, ["auto"]) : null
      ]));
    });
    hr.appendChild(el("th", { class: "gk-reg-del" }, [""]));
    thead.appendChild(hr);
    table.appendChild(thead);

    var tbody = el("tbody");
    this.data[this.active].forEach(function (row, ri) {
      tbody.appendChild(self.renderRow(sheet, row, ri));
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    wrap.appendChild(scroll);

    wrap.appendChild(el("p", { class: "gk-muted gk-reg-hint" }, [
      "Tab or arrow keys move between cells · Enter adds a row from the last " +
      "one · hover a column heading for guidance."
    ]));

    this.host.appendChild(wrap);
  };

  Editor.prototype.renderRow = function (sheet, row, ri) {
    var self = this;
    var tr = el("tr");
    tr.appendChild(el("td", { class: "gk-reg-num" }, [String(ri + 1)]));

    sheet.columns.forEach(function (c, ci) {
      var td = el("td");

      if (c.formula) {
        var v = evalFormula(c.formula, row, sheet.columns);
        td.className = "gk-reg-auto";
        td.textContent = v === "" ? "" : String(v);
        td.title = c.help || "Calculated automatically";
        tr.appendChild(td);
        return;
      }

      var input;
      if (c.choices && c.choices.length) {
        input = el("select", { class: "gk-reg-select" });
        input.appendChild(el("option", { value: "" }, [""]));
        c.choices.forEach(function (opt) {
          var o = el("option", { value: String(opt) }, [String(opt)]);
          if (String(row[ci]) === String(opt)) o.selected = true;
          input.appendChild(o);
        });
      } else {
        input = el("input", { type: "text", class: "gk-reg-input" });
        input.value = row[ci] == null ? "" : row[ci];
      }

      input.setAttribute("data-r", ri);
      input.setAttribute("data-c", ci);
      if (c.help) input.title = c.help;

      input.addEventListener("change", function () {
        row[ci] = input.value;
        self.save();
        // Recalculate this row if any column depends on it.
        if (sheet.columns.some(function (x) { return x.formula; })) {
          var cells = tr.querySelectorAll(".gk-reg-auto");
          var idx = 0;
          sheet.columns.forEach(function (x) {
            if (!x.formula) return;
            var v = evalFormula(x.formula, row, sheet.columns);
            if (cells[idx]) cells[idx].textContent = v === "" ? "" : String(v);
            idx++;
          });
        }
      });
      input.addEventListener("input", function () { row[ci] = input.value; });
      input.addEventListener("keydown", function (e) { self.onKey(e, ri, ci); });

      td.appendChild(input);
      tr.appendChild(td);
    });

    tr.appendChild(el("td", { class: "gk-reg-del" }, [
      el("button", {
        class: "gk-reg-x", type: "button", title: "Delete this row",
        "aria-label": "Delete row " + (ri + 1),
        onclick: function () { self.deleteRow(ri); }
      }, ["×"])
    ]));
    return tr;
  };

  /* Spreadsheet-style keyboard movement. */
  Editor.prototype.onKey = function (e, ri, ci) {
    var self = this;
    var sheet = this.sheets[this.active];
    var move = null;

    if (e.key === "Enter" && !e.shiftKey) {
      if (ri === this.data[this.active].length - 1) {
        this.addRow(true);
      }
      move = [ri + 1, ci];
    } else if (e.key === "ArrowDown") move = [ri + 1, ci];
    else if (e.key === "ArrowUp") move = [ri - 1, ci];
    else if (e.key === "ArrowLeft" && e.ctrlKey) move = [ri, ci - 1];
    else if (e.key === "ArrowRight" && e.ctrlKey) move = [ri, ci + 1];

    if (!move) return;
    e.preventDefault();

    // Skip calculated columns, which have no input to focus.
    var dir = move[1] - ci;
    var col = move[1];
    while (col >= 0 && col < sheet.columns.length && sheet.columns[col].formula) {
      col += dir || 1;
    }
    var target = this.host.querySelector(
      '[data-r="' + move[0] + '"][data-c="' + col + '"]');
    if (target) {
      target.focus();
      if (target.select) target.select();
    }
  };

  Editor.prototype.addRow = function (silent) {
    var sheet = this.sheets[this.active];
    this.data[this.active].push(this.blankRow(sheet));
    this.save();
    this.render();
    if (!silent) {
      var inputs = this.host.querySelectorAll(
        '[data-r="' + (this.data[this.active].length - 1) + '"]');
      if (inputs.length) inputs[0].focus();
    }
  };

  Editor.prototype.deleteRow = function (ri) {
    var row = this.data[this.active][ri];
    var hasContent = row.some(function (c) { return String(c).trim() !== ""; });
    if (hasContent && !window.confirm("Delete this row?")) return;
    this.data[this.active].splice(ri, 1);
    if (!this.data[this.active].length) {
      this.data[this.active].push(this.blankRow(this.sheets[this.active]));
    }
    this.save();
    this.render();
  };

  Editor.prototype.loadExample = function () {
    var sheet = this.sheets[this.active];
    if (!sheet.rows || !sheet.rows.length) return;
    if (!window.confirm(
      "Add " + sheet.rows.length + " example row(s) below your data?\n\n" +
      "They are illustrative — overwrite or delete them.")) return;
    var self = this;
    sheet.rows.forEach(function (r) {
      var row = sheet.columns.map(function (c, i) {
        return c.formula ? "" : (r[i] == null ? "" : String(r[i]));
      });
      self.data[self.active].push(row);
    });
    this.save();
    this.render();
  };

  Editor.prototype.clear = function () {
    if (!window.confirm(
      "Clear this register and erase it from this browser?\n\nThis cannot be undone."
    )) return;
    try { localStorage.removeItem(this.key); } catch (e) {}
    this.restored = false;
    var self = this;
    this.data = this.sheets.map(function (s) {
      var rows = [];
      for (var i = 0; i < 5; i++) rows.push(self.blankRow(s));
      return rows;
    });
    this.render();
    this.updateStatus("Cleared");
  };

  // ----------------------------------------------------------------- export

  Editor.prototype.basename = function () {
    return this.def.id + "-" + todayISO();
  };

  Editor.prototype.exportXlsx = function () {
    var self = this;
    var sheets = this.sheets.map(function (sheet, si) {
      var rows = self.filledRows(si).map(function (row, ri) {
        return sheet.columns.map(function (c, ci) {
          // Write the real Excel formula so the file keeps calculating.
          if (c.formula) return "=" + excelFormula(c.formula, sheet.columns, ri + 2).slice(1);
          return row[ci];
        });
      });
      return { name: sheet.name, columns: sheet.columns, rows: rows };
    });
    download(window.GKXlsx.build(sheets), this.basename() + ".xlsx");
    this.updateStatus("Excel file downloaded");
  };

  Editor.prototype.exportCsv = function () {
    var sheet = this.sheets[this.active];
    var self = this;
    function cell(v) {
      var s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    }
    var lines = [sheet.columns.map(function (c) { return cell(c.name); }).join(",")];
    this.filledRows(this.active).forEach(function (row) {
      lines.push(sheet.columns.map(function (c, ci) {
        return cell(c.formula ? evalFormula(c.formula, row, sheet.columns) : row[ci]);
      }).join(","));
    });
    // BOM so Excel opens UTF-8 correctly on Windows.
    download(new Blob(["﻿" + lines.join("\r\n")],
      { type: "text/csv;charset=utf-8" }),
      this.basename() + "-" + sheet.name.toLowerCase().replace(/\W+/g, "-") + ".csv");
    this.updateStatus("CSV downloaded");
  };

  Editor.prototype.exportJson = function () {
    download(new Blob([JSON.stringify({
      register: this.def.id,
      title: this.def.title,
      savedAt: new Date().toISOString(),
      sheets: this.data
    }, null, 2)], { type: "application/json" }), this.basename() + ".json");
    this.updateStatus("Save file downloaded");
  };

  Editor.prototype.importJson = function (e) {
    var file = e.target.files && e.target.files[0];
    if (!file) return;
    var self = this;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var obj = JSON.parse(reader.result);
        if (obj.register !== self.def.id) {
          if (!window.confirm(
            "That file is for \"" + (obj.title || obj.register) +
            "\", not this register.\n\nOpen it anyway?")) return;
        }
        if (!Array.isArray(obj.sheets)) throw new Error("no sheets");
        self.data = obj.sheets;
        self.save();
        self.restored = true;
        self.render();
        self.updateStatus("File opened");
      } catch (err) {
        window.alert("That file could not be read as a saved register.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  // ------------------------------------------------------------------- boot

  function mount(host) {
    var id = host.getAttribute("data-register");
    var def = REG.registers[id];
    if (!def) {
      host.innerHTML = '<p class="gk-muted">No editable register defined for "' +
        id + '".</p>';
      return;
    }
    mounted.push(new Editor(host, def));
  }

  function init() {
    mounted = [];
    var hosts = document.querySelectorAll("[data-register]");
    if (!hosts.length) return;

    if (REG) {
      Array.prototype.forEach.call(hosts, mount);
      return;
    }

    var src = hosts[0].getAttribute(DATA_URL_ATTR) || "register-data.json";
    // The question bank sits beside the register data. Fetched here (not only
    // on /assess/) so the risk register can offer to import assessment gaps.
    // Its failure is non-fatal — the editor works without it.
    var qsrc = src.replace(/register-data\.json$/, "assessment-data.json");

    fetch(src, { credentials: "omit" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (json) {
        REG = json;
        return fetch(qsrc, { credentials: "omit" })
          .then(function (r) { return r.ok ? r.json() : null; })
          .catch(function () { return null; });
      })
      .then(function (qjson) {
        if (qjson && qjson.questions && !window.GK_QUESTIONS) {
          window.GK_QUESTIONS = {};
          qjson.questions.forEach(function (q) { window.GK_QUESTIONS[q.id] = q; });
        }
        Array.prototype.forEach.call(hosts, mount);
      })
      .catch(function (err) {
        Array.prototype.forEach.call(hosts, function (h) {
          h.innerHTML = '<p class="gk-muted">The editable register could not ' +
            "load (" + err.message + "). The Excel download above still works.</p>";
        });
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
