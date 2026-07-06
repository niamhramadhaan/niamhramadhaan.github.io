/* Progressive enhancement only — the page is complete without any of this. */
(function () {
  "use strict";

  var motionOK = window.matchMedia("(prefers-reduced-motion: no-preference)").matches;

  /* ---- Scroll reveal (motion-permitting browsers only) ---- */
  if (motionOK && "IntersectionObserver" in window) {
    var revealed = document.querySelectorAll("[data-reveal], .section-head");

    // Stagger sibling product cards by 60ms each.
    document.querySelectorAll(".product-list .product").forEach(function (card, i) {
      card.style.setProperty("--reveal-delay", i * 60 + "ms");
    });

    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" }
    );

    revealed.forEach(function (el) {
      revealObserver.observe(el);
    });

    // Safety net: never leave content hidden (paused tabs, odd renderers).
    window.setTimeout(function () {
      revealed.forEach(function (el) {
        el.classList.add("is-visible");
      });
    }, 2500);
  }

  /* ---- Nav: scrolled state ---- */
  var nav = document.querySelector(".site-nav");
  var sentinel = document.querySelector("#top-sentinel");
  if (nav && sentinel && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      nav.classList.toggle("is-scrolled", !entries[0].isIntersecting);
    }).observe(sentinel);
  }

  /* ---- Nav: active-section underline ---- */
  var navLinks = document.querySelectorAll(".site-nav ul a[href^='#']");
  if (navLinks.length && "IntersectionObserver" in window) {
    var linkFor = {};
    navLinks.forEach(function (link) {
      linkFor[link.getAttribute("href").slice(1)] = link;
    });

    var current = null;
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = entry.target.getAttribute("data-nav") || entry.target.id;
          if (!linkFor[id] || current === id) return;
          navLinks.forEach(function (l) {
            l.classList.remove("is-active");
          });
          linkFor[id].classList.add("is-active");
          current = id;
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    document.querySelectorAll("main [id]").forEach(function (section) {
      if (linkFor[section.id] || section.getAttribute("data-nav")) {
        sectionObserver.observe(section);
      }
    });
  }

  /* ---- Ink pad: the hero margin is drawable paper (pointer: fine) ---- */
  var inkPad = document.querySelector(".ink-pad");
  if (inkPad && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    var inkSvg = inkPad.querySelector(".ink-canvas");
    var SVG_NS = "http://www.w3.org/2000/svg";
    var lastPoint = null;

    inkPad.addEventListener("pointerleave", function () {
      lastPoint = null;
    });

    inkPad.addEventListener("pointermove", function (e) {
      var rect = inkSvg.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      if (lastPoint) {
        var dx = x - lastPoint.x;
        var dy = y - lastPoint.y;
        if (dx * dx + dy * dy < 16) return;
        var seg = document.createElementNS(SVG_NS, "path");
        seg.setAttribute(
          "d",
          "M" + lastPoint.x.toFixed(1) + " " + lastPoint.y.toFixed(1) +
          " L" + x.toFixed(1) + " " + y.toFixed(1)
        );
        seg.setAttribute("class", "ink-stroke");
        inkSvg.appendChild(seg);
        inkPad.classList.add("has-ink");
        window.setTimeout(function () {
          seg.classList.add("ink-fade");
        }, 1400);
        window.setTimeout(function () {
          seg.remove();
        }, 3200);
      }
      lastPoint = { x: x, y: y };
    });
  }

  /* ---- ChPio Lottie: load the player only when the card approaches ---- */
  var lottieHost = document.querySelector("[data-lottie]");
  if (lottieHost && "IntersectionObserver" in window) {
    var lottieStarted = false;
    var startLottie = function () {
      if (lottieStarted) return;
      lottieStarted = true;
      var script = document.createElement("script");
      script.src = "assets/js/lottie_light.min.js";
      script.onload = function () {
        var anim = window.lottie.loadAnimation({
          container: lottieHost,
          renderer: "svg",
          loop: true,
          autoplay: motionOK,
          path: lottieHost.getAttribute("data-lottie"),
        });
        if (!motionOK) {
          anim.addEventListener("DOMLoaded", function () {
            anim.goToAndStop(Math.floor(anim.totalFrames / 2), true);
          });
        }
      };
      document.head.appendChild(script);
    };
    new IntersectionObserver(
      function (entries, obs) {
        if (entries[0].isIntersecting) {
          obs.disconnect();
          startLottie();
        }
      },
      { rootMargin: "300px 0px" }
    ).observe(lottieHost);
  }

  /* ---- Journey ↔ phase-column hover sync ---- */
  var journey = document.querySelector(".journey");
  if (journey) {
    var journeyStations = Array.prototype.slice.call(journey.querySelectorAll(".station"));
    var journeyPhases = Array.prototype.slice.call(document.querySelectorAll(".range .range-phase"));
    var rangeList = document.querySelector(".range");
    var JOURNEY_STOPS = [0.13, 0.375, 0.625, 0.875];

    var setLive = function (index, on) {
      journey.classList.toggle("has-live", on);
      if (rangeList) rangeList.classList.toggle("has-live", on);
      journeyStations.forEach(function (s, i) {
        s.classList.toggle("is-live", on && i === index);
      });
      journeyPhases.forEach(function (p, i) {
        p.classList.toggle("is-live", on && i === index);
      });
      journey.style.setProperty("--journey-p", on ? JOURNEY_STOPS[index] : 0);
    };

    var bindLive = function (els) {
      els.forEach(function (el, i) {
        el.addEventListener("mouseenter", function () { setLive(i, true); });
        el.addEventListener("mouseleave", function () { setLive(i, false); });
      });
    };

    bindLive(journeyStations);
    bindLive(journeyPhases);
  }

  /* ---- Cursor spotlight on product cards (pointer: fine only) ---- */
  if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
    document.querySelectorAll(".product").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", ((e.clientX - rect.left) / rect.width) * 100 + "%");
        card.style.setProperty("--my", ((e.clientY - rect.top) / rect.height) * 100 + "%");
      });
    });
  }
})();
