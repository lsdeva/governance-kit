/*
 * Requester filter for the "I've been asked to…" index.
 *
 * Progressive enhancement: the page lists every task with JavaScript off, and
 * this only hides what does not match. Chips are real <button>s, so they are
 * keyboard-operable and focusable without any extra wiring.
 *
 * No storage, no network — the filter is presentation only.
 */
(function () {
  "use strict";

  function init() {
    var bar = document.getElementById("gk-task-filter");
    if (!bar) return;

    var chips = Array.prototype.slice.call(bar.querySelectorAll("[data-req]"));
    var tasks = Array.prototype.slice.call(
      document.querySelectorAll(".gk-task[data-requesters]")
    );
    if (!chips.length || !tasks.length) return;

    // Announce the result count so a screen-reader user knows the filter did
    // something — a silent DOM change is invisible to them.
    var status = document.getElementById("gk-task-status");
    if (!status) {
      status = document.createElement("p");
      status.id = "gk-task-status";
      status.className = "gk-task-status";
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      bar.parentNode.insertBefore(status, bar.nextSibling);
    }

    function apply(req) {
      var shown = 0;
      tasks.forEach(function (t) {
        var tags = (t.getAttribute("data-requesters") || "").split(/\s+/);
        var match = req === "all" || tags.indexOf(req) !== -1;
        t.hidden = !match;
        if (match) shown++;
      });
      chips.forEach(function (c) {
        var on = c.getAttribute("data-req") === req;
        c.classList.toggle("is-on", on);
        c.setAttribute("aria-pressed", on ? "true" : "false");
      });
      status.textContent = req === "all"
        ? shown + " requests"
        : shown + " request" + (shown === 1 ? "" : "s") + " for this asker";
    }

    chips.forEach(function (c) {
      c.setAttribute("aria-pressed", c.classList.contains("is-on") ? "true" : "false");
      c.addEventListener("click", function () {
        apply(c.getAttribute("data-req"));
      });
    });

    apply("all");
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(init);
  } else if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
