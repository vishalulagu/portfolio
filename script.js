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
     Interactive ID Badge & Lanyard Elastic Physics
     ------------------------------------------------------------------------ */

  (function initIdBadgePhysics() {
    var idBadge = document.getElementById("idBadge");
    var cardFlipper = document.getElementById("cardFlipper");
    var strapLeft = document.getElementById("strapLeft");
    var stitchLeft = document.getElementById("stitchLeft");
    var strapRight = document.getElementById("strapRight");
    var stitchRight = document.getElementById("stitchRight");
    var portraitLanyard = document.querySelector(".portrait-lanyard");

    if (!idBadge || !cardFlipper) return;

    // Physics coordinates & velocities
    var x = 0, y = 0;
    var vx = 0, vy = 0;
    var rotZ = 0, vRotZ = 0;
    var rotX = 0;
    var rotY = 0, vRotY = 0;
    var targetRotY = 0;

    var isDragging = false;
    var startPointerX = 0, startPointerY = 0;
    var lastPointerX = 0, lastPointerY = 0;
    var lastMoveTime = 0;
    var pointerVelX = 0, pointerVelY = 0;
    var totalDragDist = 0;

    var isRunning = false;

    // Lively, free rubber elasticity constants
    var STIFFNESS = 0.058;   // Natural elastic rubber tension
    var DAMPING = 0.83;      // Bouncy, lively oscillation
    var ROT_STIFFNESS = 0.052;
    var ROT_DAMPING = 0.80;
    var FLIP_STIFFNESS = 0.075;
    var FLIP_DAMPING = 0.76;

    var portraitLanyard = document.querySelector(".portrait-lanyard");

    function renderLanyard(cardX, cardY, angleZ) {
      if (!strapLeft || !strapRight || !portraitLanyard) return;

      var lanyardRect = portraitLanyard.getBoundingClientRect();
      var lWidth = lanyardRect.width || 260;
      var lHeight = lanyardRect.height || 120;

      var scaleX = 260 / lWidth;
      var scaleY = 120 / lHeight;

      var svgDx = cardX * scaleX;
      var svgDy = cardY * scaleY;

      // The buckle apex in SVG viewBox space
      var curApexX = 130 + svgDx;
      var curApexY = 102 + svgDy;

      var axStr = curApexX.toFixed(2);
      var ayStr = curApexY.toFixed(2);

      // Left strap polygon & stitch line (stays anchored to navbar at y=0)
      strapLeft.setAttribute(
        "points",
        "15,0 47,0 " + (curApexX + 10).toFixed(2) + "," + ayStr + " " + (curApexX - 14).toFixed(2) + "," + ayStr
      );
      if (stitchLeft) {
        stitchLeft.setAttribute("x2", (curApexX - 2).toFixed(2));
        stitchLeft.setAttribute("y2", ayStr);
      }

      // Right strap polygon & stitch line (stays anchored to navbar at y=0)
      strapRight.setAttribute(
        "points",
        "245,0 213,0 " + (curApexX - 10).toFixed(2) + "," + ayStr + " " + (curApexX + 14).toFixed(2) + "," + ayStr
      );
      if (stitchRight) {
        stitchRight.setAttribute("x2", (curApexX + 2).toFixed(2));
        stitchRight.setAttribute("y2", ayStr);
      }
    }

    // Entrance Drop Animation from top (behind navbar)
    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hasDropped = false;

    function triggerBadgeDrop() {
      if (hasDropped) return;
      hasDropped = true;
      if (prefersReducedMotion) return;
      y = -360;
      rotZ = -8;
      cardFlipper.style.transform = "translate3d(0, -360px, 0) rotateZ(-8deg)";
      renderLanyard(0, -360, -8);

      vy = 5;
      vRotZ = 2;
      startPhysics();
    }

    if (!prefersReducedMotion) {
      y = -360;
      rotZ = -8;
      cardFlipper.style.transform = "translate3d(0, -360px, 0) rotateZ(-8deg)";
      renderLanyard(0, -360, -8);

      // Listen for intro reveal event when curtains split
      window.addEventListener("reveal-hero", triggerBadgeDrop, { once: true });
      // Safety fallback in case intro overlay was removed or skipped
      window.setTimeout(triggerBadgeDrop, 7000);
    }

    function step() {
      if (!isDragging) {
        // Hooke's law spring: F = -k * displacement
        var fx = -STIFFNESS * x;
        var fy = -STIFFNESS * y;
        vx = (vx + fx) * DAMPING;
        vy = (vy + fy) * DAMPING;
        x += vx;
        y += vy;

        // Angular tilt spring
        var fRotZ = -ROT_STIFFNESS * rotZ;
        vRotZ = (vRotZ + fRotZ) * ROT_DAMPING;
        rotZ += vRotZ;

        // RotX spring to 0
        rotX += (0 - rotX) * 0.16;
      }

      // RotY spring (flip front/back: 0 or 180)
      var fRotY = -FLIP_STIFFNESS * (rotY - targetRotY);
      vRotY = (vRotY + fRotY) * FLIP_DAMPING;
      rotY += vRotY;

      // Apply 3D transform to card flipper
      cardFlipper.style.transform =
        "translate3d(" + x.toFixed(2) + "px, " + y.toFixed(2) + "px, 0) " +
        "rotateZ(" + rotZ.toFixed(2) + "deg) " +
        "rotateY(" + rotY.toFixed(2) + "deg) " +
        "rotateX(" + rotX.toFixed(2) + "deg)";

      var isFlipped = (Math.abs(rotY % 360) > 90 && Math.abs(rotY % 360) < 270);
      idBadge.classList.toggle("is-flipped", isFlipped);

      // Update the flexible lanyard ribbon
      renderLanyard(x, y, rotZ);

      // Check if settled to rest
      var atRest =
        !isDragging &&
        Math.abs(x) < 0.08 && Math.abs(vx) < 0.04 &&
        Math.abs(y) < 0.08 && Math.abs(vy) < 0.04 &&
        Math.abs(rotZ) < 0.08 && Math.abs(vRotZ) < 0.04 &&
        Math.abs(rotY - targetRotY) < 0.08 && Math.abs(vRotY) < 0.04;

      if (!atRest) {
        window.requestAnimationFrame(step);
      } else {
        x = 0; y = 0; vx = 0; vy = 0;
        rotZ = 0; vRotZ = 0;
        rotX = 0; rotY = targetRotY; vRotY = 0;
        cardFlipper.style.transform =
          "translate3d(0, 0, 0) rotateZ(0deg) rotateY(" + targetRotY + "deg) rotateX(0deg)";
        renderLanyard(0, 0, 0);
        isRunning = false;
      }
    }

    function startPhysics() {
      if (!isRunning) {
        isRunning = true;
        window.requestAnimationFrame(step);
      }
    }

    // Pointer Drag & Toss Events
    idBadge.addEventListener("pointerdown", function (e) {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      isDragging = true;
      idBadge.classList.add("is-dragging");
      try {
        idBadge.setPointerCapture(e.pointerId);
      } catch (err) {}

      startPointerX = e.clientX;
      startPointerY = e.clientY;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
      lastMoveTime = performance.now();
      pointerVelX = 0;
      pointerVelY = 0;
      totalDragDist = 0;

      vx = 0;
      vy = 0;
      vRotZ = 0;
      startPhysics();
    });

    window.addEventListener("pointermove", function (e) {
      if (!isDragging) return;

      var now = performance.now();
      var dt = Math.max(1, now - lastMoveTime);
      lastMoveTime = now;

      pointerVelX = ((e.clientX - lastPointerX) / dt) * 16.6;
      pointerVelY = ((e.clientY - lastPointerY) / dt) * 16.6;
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;

      var rawDx = e.clientX - startPointerX;
      var rawDy = e.clientY - startPointerY;
      var dist = Math.hypot(rawDx, rawDy);
      totalDragDist = Math.max(totalDragDist, dist);

      // Free, lightweight rubber drag resistance (natural 1:1 feel near resting pos)
      var resistance = 1 / (1 + Math.max(0, dist - 70) * 0.0009);
      x = rawDx * resistance;
      y = rawDy * resistance;

      // Free swinging pendulum tilt & dynamic 3D perspective tilt
      rotZ = (x / 140) * 26;
      rotX = -(y / 180) * 16;

      startPhysics();
    });

    function endDrag(e) {
      if (!isDragging) return;
      isDragging = false;
      idBadge.classList.remove("is-dragging");

      try {
        idBadge.releasePointerCapture(e.pointerId);
      } catch (err) {}

      // If clicked/tapped with minimal movement, flip the card!
      if (totalDragDist < 8) {
        targetRotY = targetRotY === 0 ? 180 : 0;
      } else {
        // High-energy toss & release inertia
        vx = Math.max(-42, Math.min(42, pointerVelX * 0.82));
        vy = Math.max(-42, Math.min(42, pointerVelY * 0.82));
        vRotZ = vx * 0.5;
      }

      startPhysics();
    }

    function toggleFlip() {
      targetRotY = targetRotY === 0 ? 180 : 0;
      startPhysics();
    }

    idBadge.flipCard = toggleFlip;
    idBadge.setAttribute("tabindex", "0");
    idBadge.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleFlip();
      }
    });

    idBadge.addEventListener("pointerup", endDrag);
    idBadge.addEventListener("pointercancel", endDrag);
  })();

  /* ------------------------------------------------------------------------
     Intro Splash Animation (Hello! Professionals -> Center Split Reveal)
     ------------------------------------------------------------------------ */

  (function initIntroAnimation() {
    var introOverlay = document.getElementById("introOverlay");
    var introText = document.getElementById("introText");
    if (!introOverlay || !introText) return;

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      document.body.classList.remove("intro-active");
      introOverlay.style.display = "none";
      window.dispatchEvent(new CustomEvent("reveal-hero"));
      return;
    }

    // Lock scrolling during intro without hiding scrollbar or shifting viewport layout width
    function preventScroll(e) {
      e.preventDefault();
    }
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });

    var phrase = "Hello! Professionals";
    var index = 0;
    var isDone = false;
    var timeouts = [];

    function clearAllTimeouts() {
      for (var i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
      }
      timeouts = [];
    }

    function finishAndSplit() {
      if (isDone) return;
      isDone = true;
      clearAllTimeouts();

      // Step 1: Smoothly fade out handwriting words
      introOverlay.classList.add("is-fading");

      // Step 2: Split background (top slides up, bottom slides down)
      var splitTimer = window.setTimeout(function () {
        introOverlay.classList.add("is-split");

        // Step 3: Curtains have fully cleared screen -> now drop the ID badge!
        var cleanupTimer = window.setTimeout(function () {
          window.removeEventListener("wheel", preventScroll);
          window.removeEventListener("touchmove", preventScroll);
          document.body.classList.remove("intro-active");
          introOverlay.style.display = "none";

          // Full reveal is complete: now trigger the ID card entrance drop
          window.dispatchEvent(new CustomEvent("reveal-hero"));
        }, 940);
        timeouts.push(cleanupTimer);
      }, 380);
      timeouts.push(splitTimer);
    }

    // Click anywhere or press any key to skip
    introOverlay.addEventListener("click", finishAndSplit);
    window.addEventListener("keydown", function onKey() {
      window.removeEventListener("keydown", onKey);
      finishAndSplit();
    });

    // Step 0: Fluid handwriting letter-by-letter typing
    function typeNextChar() {
      if (isDone) return;
      if (index < phrase.length) {
        introText.textContent += phrase.charAt(index);
        index++;

        var char = phrase.charAt(index - 1);
        // Natural handwriting pacing with subtle jitter
        var delay = (char === "!" || char === " ") ? 110 : (50 + Math.random() * 35);
        var t = window.setTimeout(typeNextChar, delay);
        timeouts.push(t);
      } else {
        // Finished writing! Wait 2 seconds as requested ("aprom 2 sec wait aagittu")
        var waitT = window.setTimeout(function () {
          finishAndSplit();
        }, 2000);
        timeouts.push(waitT);
      }
    }

    // Wait until Caveat handwritten font is 100% loaded before writing first character.
    // This completely eliminates FOUT (Flash of Unstyled Text) where standard font shifts to handwriting mid-animation.
    function startTypingWhenFontReady() {
      if (document.fonts && document.fonts.load) {
        Promise.race([
          document.fonts.load('700 32px Caveat'),
          new Promise(function (resolve) { window.setTimeout(resolve, 600); })
        ]).then(function () {
          if (!isDone) {
            var t = window.setTimeout(typeNextChar, 160);
            timeouts.push(t);
          }
        }).catch(function () {
          if (!isDone) {
            var t = window.setTimeout(typeNextChar, 160);
            timeouts.push(t);
          }
        });
      } else {
        var startT = window.setTimeout(typeNextChar, 250);
        timeouts.push(startT);
      }
    }

    startTypingWhenFontReady();
  })();
})();
