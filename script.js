/* ==========================================================================
   VISHAL U — portfolio interactions
   Vanilla JavaScript. No dependencies.
   ========================================================================== */

(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var menuToggle = document.querySelector(".menu-toggle");
  var drawer = document.getElementById("mobile-menu");
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-nav]"));
  var sectionIds = ["about", "skills", "projects", "certifications", "contact"];
  var sections = sectionIds
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  var toast = document.querySelector(".toast");
  var toastTimer = null;

  /* ------------------------------------------------------------------------
     Mobile menu
     ------------------------------------------------------------------------ */

  function menuIsOpen() {
    return !!(drawer && drawer.classList.contains("is-open"));
  }

  function setMenu(open, restoreFocus) {
    if (!menuToggle || !drawer) return;
    menuToggle.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    drawer.classList.toggle("is-open", open);
    if (restoreFocus) menuToggle.focus();
  }

  if (menuToggle && drawer) {
    menuToggle.addEventListener("click", function () {
      setMenu(!menuIsOpen());
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        setMenu(false);
      });
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuIsOpen()) {
        setMenu(false, true);
      }
    });

    document.addEventListener("click", function (event) {
      if (menuIsOpen() && header && !header.contains(event.target)) {
        setMenu(false);
      }
    });

    var wideQuery = window.matchMedia("(min-width: 921px)");
    var handleWide = function (event) {
      if (event.matches) setMenu(false);
    };
    if (typeof wideQuery.addEventListener === "function") {
      wideQuery.addEventListener("change", handleWide);
    } else if (typeof wideQuery.addListener === "function") {
      wideQuery.addListener(handleWide);
    }
  }

  /* ------------------------------------------------------------------------
     Scroll-spy navigation
     ------------------------------------------------------------------------ */

  var spyTicking = false;

  function setActiveSection() {
    if (!sections.length) return;

    var headerHeight = header ? header.offsetHeight : 0;
    var line = window.scrollY + headerHeight + 140;
    var current = "";

    sections.forEach(function (section) {
      if (section.offsetTop <= line) current = section.id;
    });

    var atBottom =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;

    if (atBottom) current = sections[sections.length - 1].id;

    navLinks.forEach(function (link) {
      var isActive = link.getAttribute("href") === "#" + current;
      link.classList.toggle("is-active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function onScroll() {
    if (spyTicking) return;
    spyTicking = true;
    window.requestAnimationFrame(function () {
      setActiveSection();
      spyTicking = false;
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", setActiveSection);
  window.addEventListener("load", setActiveSection);
  setActiveSection();

  /* ------------------------------------------------------------------------
     Toast
     ------------------------------------------------------------------------ */

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2400);
  }

  /* ------------------------------------------------------------------------
     Copy email to clipboard
     ------------------------------------------------------------------------ */

  var emailButtons = Array.prototype.slice.call(
    document.querySelectorAll("[data-copy-email]")
  );
  var originalMarkup = new Map();
  var copyTimers = new Map();

  emailButtons.forEach(function (button) {
    originalMarkup.set(button, button.innerHTML);
  });

  function fallbackCopy(text) {
    var area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "0";
    area.style.left = "-9999px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    area.setSelectionRange(0, text.length);

    var copied = false;
    try {
      copied = document.execCommand("copy");
    } finally {
      document.body.removeChild(area);
    }

    if (!copied) throw new Error("Clipboard copy failed");
  }

  function writeClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text).catch(function () {
        fallbackCopy(text);
      });
    }
    try {
      fallbackCopy(text);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  function markCopied() {
    emailButtons.forEach(function (button) {
      window.clearTimeout(copyTimers.get(button));
      button.classList.add("is-copied");
      button.innerHTML = 'Copied <span aria-hidden="true">✓</span>';
      button.setAttribute("aria-label", "Email address copied to clipboard");

      copyTimers.set(
        button,
        window.setTimeout(function () {
          button.classList.remove("is-copied");
          button.innerHTML = originalMarkup.get(button);
          button.setAttribute(
            "aria-label",
            "Copy email address vishalulagu@gmail.com to clipboard"
          );
        }, 1600)
      );
    });
  }

  emailButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var email = button.getAttribute("data-copy-email") || "vishalulagu@gmail.com";
      writeClipboard(email)
        .then(function () {
          markCopied();
          showToast("EMAIL COPIED TO CLIPBOARD");
        })
        .catch(function () {
          showToast("COPY FAILED — EMAIL: " + email);
        });
    });
  });

  /* ------------------------------------------------------------------------
     Tactile press feedback for every button and skill tile
     ------------------------------------------------------------------------ */

  var flashTimers = new WeakMap();

  function flashPressed(element) {
    element.classList.add("is-clicked");
    window.clearTimeout(flashTimers.get(element));
    flashTimers.set(
      element,
      window.setTimeout(function () {
        element.classList.remove("is-clicked");
      }, 250)
    );
  }

  document.addEventListener(
    "pointerdown",
    function (event) {
      var target = event.target.closest(".btn, .skill-tile");
      if (target) flashPressed(target);
    },
    { passive: true }
  );

  document.addEventListener("click", function (event) {
    if (event.detail !== 0) return;
    var target = event.target.closest(".btn, .skill-tile");
    if (target) flashPressed(target);
  });

  /* ------------------------------------------------------------------------
     Skill category filtering
     ------------------------------------------------------------------------ */

  var filterButtons = Array.prototype.slice.call(
    document.querySelectorAll("[data-filter]")
  );
  var skillTiles = Array.prototype.slice.call(
    document.querySelectorAll(".skill-tile")
  );
  var skillCount = document.querySelector("[data-skill-count]");
  var totalSkills = skillTiles.length;

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      var filter = button.getAttribute("data-filter") || "all";
      var shown = 0;

      filterButtons.forEach(function (other) {
        var selected = other === button;
        other.classList.toggle("is-active", selected);
        other.setAttribute("aria-pressed", String(selected));
      });

      skillTiles.forEach(function (tile) {
        var categories = (tile.getAttribute("data-cats") || "").split(/\s+/);
        var visible = filter === "all" || categories.indexOf(filter) !== -1;
        tile.hidden = !visible;
        if (visible) shown += 1;
      });

      if (skillCount) {
        var pad = function (value) {
          return String(value).padStart(2, "0");
        };
        skillCount.textContent = pad(shown) + " / " + pad(totalSkills);
        skillCount.setAttribute(
          "aria-label",
          "Showing " + shown + " of " + totalSkills + " skills"
        );
      }
    });
  });

  /* ------------------------------------------------------------------------
     Portrait: monochrome by default, colour on hover or tap
     ------------------------------------------------------------------------ */

  var portrait = document.querySelector(".portrait-frame");
  var portraitMedia = document.querySelector(".portrait-media");
  var touchQuery = window.matchMedia("(any-pointer: coarse)");

  function syncPortraitMode() {
    if (!portrait || !portraitMedia) return;

    if (touchQuery.matches) {
      portrait.classList.add("is-touch");
      portraitMedia.setAttribute("tabindex", "0");
      portraitMedia.setAttribute("role", "button");
      portraitMedia.setAttribute("aria-label", "Toggle portrait colour");
      portraitMedia.setAttribute(
        "aria-pressed",
        String(portrait.classList.contains("is-color"))
      );
    } else {
      portrait.classList.remove("is-touch", "is-color");
      portraitMedia.removeAttribute("tabindex");
      portraitMedia.removeAttribute("role");
      portraitMedia.removeAttribute("aria-label");
      portraitMedia.removeAttribute("aria-pressed");
    }
  }

  function togglePortrait() {
    if (!portrait || !portraitMedia || !touchQuery.matches) return;
    var coloured = portrait.classList.toggle("is-color");
    portraitMedia.setAttribute("aria-pressed", String(coloured));
  }

  if (portrait && portraitMedia) {
    portraitMedia.addEventListener("click", togglePortrait);
    portraitMedia.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        togglePortrait();
      }
    });

    syncPortraitMode();
    if (typeof touchQuery.addEventListener === "function") {
      touchQuery.addEventListener("change", syncPortraitMode);
    } else if (typeof touchQuery.addListener === "function") {
      touchQuery.addListener(syncPortraitMode);
    }
  }
})();
