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
