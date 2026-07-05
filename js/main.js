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
