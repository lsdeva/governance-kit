/*
 * Makes the EU AI Act readiness checklist tickable and persistent.
 *
 * The checklist page is generated Markdown with `- [ ]` task-list items, which
 * Material renders as disabled checkboxes. This enables them, remembers state
 * in localStorage, and shows a live count — so the page becomes usable rather
 * than illustrative.
 *
 * Same privacy stance as the assessment: nothing leaves the browser, and a
 * visible control clears the stored state. Storage key is separate from the
 * assessment's so clearing one never silently wipes the other.
 */
(function () {
  "use strict";

  var KEY = "gk-checklist-v1";

  function boxes() {
    return Array.prototype.slice.call(
      document.querySelectorAll(".md-content .task-list-item input[type=checkbox]")
    );
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || {};
    } catch (e) { return {}; }
  }

  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
  }

  function init() {
    // Only run on the checklist page, identified by its generated marker.
    // Clear the marker class first: with Material's instant navigation the
    // <body> persists across pages, so it would otherwise leak elsewhere.
    document.body.classList.remove("gk-checklist-live");
    if (!document.getElementById("gk-checklist")) return;

    var list = boxes();
    if (!list.length) return;

    // Tells the stylesheet to reveal the real checkboxes and drop Material's
    // click-blocking indicator span, on this page only.
    document.body.classList.add("gk-checklist-live");

    var state = load();

    var panel = document.getElementById("gk-checklist");
    var count = document.createElement("div");
    count.className = "gk-cl-count";
    var bar = document.createElement("div");
    bar.className = "gk-cl-bar";
    var fill = document.createElement("div");
    fill.className = "gk-cl-fill";
    bar.appendChild(fill);

    var clear = document.createElement("button");
    clear.type = "button";
    clear.className = "gk-btn gk-btn-danger gk-cl-clear";
    clear.textContent = "Clear my ticks";
    clear.addEventListener("click", function () {
      if (!window.confirm("Clear every tick on this checklist?\n\nThis cannot be undone.")) return;
      try { localStorage.removeItem(KEY); } catch (e) {}
      state = {};
      list.forEach(function (b) { b.checked = false; });
      update();
    });

    var note = document.createElement("p");
    note.className = "gk-cl-note";
    note.innerHTML =
      "Your ticks are saved in this browser only — nothing is uploaded. " +
      "For a scored, role-specific version with a report you can present, " +
      "take the <a href=\"../../assess/\">full assessment</a>.";

    panel.appendChild(count);
    panel.appendChild(bar);
    panel.appendChild(note);
    panel.appendChild(clear);

    function update() {
      var done = list.filter(function (b) { return b.checked; }).length;
      var pct = list.length ? Math.round((done / list.length) * 100) : 0;
      fill.style.width = pct + "%";

      var band;
      if (done <= 8) band = "Early — start with inventory and prohibited-practice checks.";
      else if (done <= 17) band = "Developing — close policy and documentation gaps.";
      else band = "Mature — focus on assurance and continuous monitoring.";

      count.innerHTML = "<strong>" + done + " of " + list.length +
        "</strong> ticked · <span class=\"gk-cl-band\">" + band + "</span>";
      fill.className = "gk-cl-fill " +
        (done <= 8 ? "is-bad" : done <= 17 ? "is-mid" : "is-good");
    }

    list.forEach(function (box, i) {
      // Material renders task-list checkboxes disabled; make them usable.
      box.disabled = false;
      box.removeAttribute("disabled");
      box.id = box.id || "gk-cl-" + i;
      if (state[i]) box.checked = true;
      box.addEventListener("change", function () {
        state[i] = box.checked;
        save(state);
        update();
      });
    });

    update();
  }

  // Material's instant navigation swaps content without a page load, so hook
  // both the initial load and subsequent navigations.
  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
