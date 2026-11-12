(function () {
  const stages = [
    {
      to: 22,
      tc: "00:00:16:02",
      title: "Brief",
      copy: "You share the business, who should see the ad, the action you want, and any must-haves. A short written note covers it."
    },
    {
      to: 48,
      tc: "00:00:16:09",
      title: "Concepts",
      copy: "We come back with a few hook-led directions so you can pick the angle before anything is finished."
    },
    {
      to: 78,
      tc: "00:00:16:17",
      title: "Ads in days",
      copy: "Approved concepts become short video ads, image ads, and copy. A usual pace is a few days. That is not a guaranteed deadline."
    },
    {
      to: 101,
      tc: "00:00:16:24",
      title: "Revisions",
      copy: "You mark what to change. We revise until the set is ready to post or put into an ad account."
    }
  ];

  const scrub = document.getElementById("scrub");
  const playhead = document.getElementById("playhead");
  const title = document.getElementById("monitor-title");
  const copy = document.getElementById("monitor-copy");
  const tc = document.getElementById("monitor-tc");
  const timeline = document.querySelector(".timeline");
  const clips = document.querySelectorAll(".clip");
  if (!scrub || !title) return;

  function stageAt(value) {
    return stages.find(function (s) { return value < s.to; }) || stages[stages.length - 1];
  }

  function paint(value) {
    const v = Number(value);
    const stage = stageAt(v);
    if (playhead) playhead.style.left = v + "%";
    if (tc) tc.textContent = stage.tc;
    if (title.textContent !== stage.title) {
      title.textContent = stage.title;
      copy.textContent = stage.copy;
    }
    scrub.setAttribute("aria-valuetext", stage.title);
    clips.forEach(function (clip) {
      const start = Number(clip.dataset.start);
      const end = Number(clip.dataset.end);
      const on = v >= start && v < end;
      clip.classList.toggle("is-active", on);
      clip.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function scrubFromClientX(clientX) {
    const rect = timeline.getBoundingClientRect();
    const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
    const value = Math.round((x / rect.width) * 100);
    scrub.value = String(value);
    paint(value);
  }

  scrub.addEventListener("input", function () { paint(scrub.value); });

  let dragging = false;
  let moved = false;
  let startX = 0;

  if (timeline) {
    timeline.addEventListener("pointerdown", function (e) {
      if (e.button !== undefined && e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      if (!e.target.closest(".clip")) scrubFromClientX(e.clientX);
    });
    timeline.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      if (Math.abs(e.clientX - startX) > 4) {
        moved = true;
        if (timeline.setPointerCapture && e.pointerId !== undefined && !timeline.hasPointerCapture(e.pointerId)) {
          timeline.setPointerCapture(e.pointerId);
        }
        scrubFromClientX(e.clientX);
      }
    });
    timeline.addEventListener("pointerup", function () { dragging = false; });
    timeline.addEventListener("pointercancel", function () { dragging = false; });
  }

  clips.forEach(function (clip) {
    clip.addEventListener("click", function (e) {
      if (moved) {
        e.preventDefault();
        moved = false;
        return;
      }
      scrub.value = clip.dataset.start;
      paint(scrub.value);
    });
  });

  paint(scrub.value);
})();

(function () {
  var root = document.querySelector(".picks");
  if (!root) return;
  var buttons = [].slice.call(root.querySelectorAll(".pick"));
  var items = [].slice.call(root.querySelectorAll(".picks-hooks li"));
  if (!buttons.length) return;

  function select(id) {
    buttons.forEach(function (btn) {
      var on = btn.getAttribute("aria-controls") === id;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
      btn.classList.toggle("is-on", on);
    });
    items.forEach(function (item) {
      item.classList.toggle("is-on", item.id === id);
    });
  }

  buttons.forEach(function (btn, index) {
    btn.addEventListener("click", function () {
      select(btn.getAttribute("aria-controls"));
    });
    btn.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next = buttons[index + 1] || buttons[0];
      else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = buttons[index - 1] || buttons[buttons.length - 1];
      else if (e.key === "Home") next = buttons[0];
      else if (e.key === "End") next = buttons[buttons.length - 1];
      if (!next || next === btn) return;
      e.preventDefault();
      next.focus();
      select(next.getAttribute("aria-controls"));
    });
  });
})();

(function () {
  document.querySelectorAll("video.reel-video").forEach(function (video) {
    video.autoplay = false;
    video.removeAttribute("autoplay");
    video.loop = false;
    video.removeAttribute("loop");
    video.preload = "none";
    video.playsInline = true;
    video.controls = true;
    video.pause();
  });
})();

(function () {
  function focusTarget(id) {
    const target = document.getElementById(id);
    if (!target) return;
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  }

  document.addEventListener("click", function (e) {
    const link = e.target.closest("a[href^='#']");
    if (!link) return;
    const id = link.getAttribute("href").slice(1);
    if (!id || !document.getElementById(id)) return;
    window.setTimeout(function () { focusTarget(id); }, 0);
  });
})();

(function () {
  const buttons = document.querySelectorAll("[data-copy-email]");
  if (!buttons.length) return;

  function announce(button, message) {
    const status = button.parentElement && button.parentElement.querySelector(".copy-status");
    if (status) status.textContent = message;
  }

  function fallbackCopy(email) {
    const field = document.createElement("textarea");
    field.value = email;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.left = "-999px";
    document.body.appendChild(field);
    field.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
    document.body.removeChild(field);
    return ok;
  }

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      const email = button.getAttribute("data-copy-email");
      const done = function (ok) {
        announce(button, ok ? "Copied" : "Copy failed. Use the mail link.");
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () { done(true); }).catch(function () {
          done(fallbackCopy(email));
        });
      } else {
        done(fallbackCopy(email));
      }
    });
  });
})();
