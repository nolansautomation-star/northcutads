(function () {
  const stages = [
    {
      to: 22,
      tc: "00:00:16:02",
      title: "Brief",
      copy: "You tell us who it is for, what you want people to do, and any must-haves. A short call or a written note is enough."
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
      copy: "Approved concepts become short video ads, image ads, and copy — typically in a matter of days, not weeks."
    },
    {
      to: 101,
      tc: "00:00:16:24",
      title: "Revisions",
      copy: "You mark what to change. We revise until the set is ready to post or put into ads manager."
    }
  ];

  const scrub = document.getElementById("scrub");
  const playhead = document.getElementById("playhead");
  const title = document.getElementById("monitor-title");
  const copy = document.getElementById("monitor-copy");
  const tc = document.getElementById("monitor-tc");
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
    clips.forEach(function (clip) {
      const start = Number(clip.dataset.start);
      const end = Number(clip.dataset.end);
      clip.classList.toggle("is-active", v >= start && v < end);
    });
  }

  scrub.addEventListener("input", function () { paint(scrub.value); });
  clips.forEach(function (clip) {
    clip.addEventListener("click", function () {
      scrub.value = clip.dataset.start;
      paint(scrub.value);
    });
  });

  paint(scrub.value);
})();

(function () {
  const videos = document.querySelectorAll("video.reel-video");
  if (!videos.length) return;
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function sync() {
    videos.forEach(function (video) {
      video.muted = true;
      if (motion.matches) {
        video.pause();
        video.removeAttribute("autoplay");
        try { video.currentTime = 0; } catch (e) {}
      } else {
        video.setAttribute("autoplay", "");
        const play = video.play();
        if (play && typeof play.catch === "function") play.catch(function () {});
      }
    });
  }

  if (typeof motion.addEventListener === "function") {
    motion.addEventListener("change", sync);
  } else if (typeof motion.addListener === "function") {
    motion.addListener(sync);
  }
  sync();
})();
