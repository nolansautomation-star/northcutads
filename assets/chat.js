/* Northcut Ads — on-page desk. Mail handoff only. No form, no third-party lead service. */
(function () {
  const EMAIL = "nolansautomation@gmail.com";
  const MAILTO = "mailto:" + EMAIL;

  const FAQ = {
    make:
      "AI-made short video ads, image ads, and ad copy for TikTok, Instagram Reels, YouTube Shorts, and display. The hook, the picture, and the words are written as one idea, for the business in the brief.",
    who:
      "Businesses that need short ads, across industries. Ecommerce, restaurants, home services, beauty, and fitness are examples of the kind of work, not a client list. Northcut is based in Grand Rapids, Michigan. A gym is one kind of brief among those others.",
    ai:
      "Yes. The work is built around real brand assets you provide. We don’t create fake people posed as real customers or staff, and we label the work where a platform requires it.",
    samples:
      "No. They are silent 15-second spec previews for Ironline Fitness, a fictional gym, made to show the process. They are not client work and they are not results. Any offer written inside a sample is fictional script, not a real promotion and not a Northcut offer. For a different business, the hook, the picture, and the line are adapted.",
    turnaround:
      "Usually a few days, not weeks. That is a general sense of how the work moves, not a guaranteed deadline.",
    pricing:
      "Prices are not set. No packages are posted. Email nolansautomation@gmail.com and ask for a quote. Nothing on this page is a rate.",
    contact:
      "Email nolansautomation@gmail.com. The address is a mail link, and there is a copy button beside it. Use either one for a project note or a quote. This page does not send the message for you, and it has no form."
  };

  const GREETING =
    "Hey — this is the Northcut desk on this page. I can say what we make, who it’s for, and what the spec reel is. For a project or a quote, email nolansautomation@gmail.com.";

  const DEFAULT_CHIPS = [
    { id: "make", label: "What we make" },
    { id: "who", label: "Who it’s for" },
    { id: "how", label: "How it works" },
    { id: "samples", label: "Spec reel" },
    { id: "pricing", label: "Pricing" },
    { id: "contact", label: "Email us" }
  ];

  const root = document.createElement("div");
  root.className = "nc-chat";
  root.innerHTML =
    '<button type="button" class="nc-chat-launch" aria-expanded="false" aria-controls="nc-chat-panel" aria-label="Ask the desk">' +
      '<span class="nc-rec" aria-hidden="true"></span>' +
      "<span>Desk</span>" +
    "</button>" +
    '<section id="nc-chat-panel" class="nc-chat-panel" role="dialog" aria-modal="true" aria-labelledby="nc-chat-title" hidden>' +
      '<div class="nc-chat-head">' +
        "<div>" +
          '<p class="nc-chat-kicker"><span class="nc-rec" aria-hidden="true"></span> 00:00:00 • On this page</p>' +
          '<h2 class="nc-chat-title" id="nc-chat-title">Ask Northcut</h2>' +
        "</div>" +
        '<button type="button" class="nc-chat-close">Close</button>' +
      "</div>" +
      '<div class="nc-chat-log" role="log" aria-live="polite" aria-relevant="additions"></div>' +
      '<div class="nc-chips" hidden></div>' +
      '<form class="nc-chat-form">' +
        '<label class="sr-only" for="nc-chat-input">Message</label>' +
        '<input class="nc-chat-input" id="nc-chat-input" type="text" autocomplete="off" enterkeyhint="send" placeholder="Write a line…">' +
        '<button type="submit" class="nc-chat-send">Send</button>' +
      "</form>" +
    "</section>";

  document.body.appendChild(root);

  const launch = root.querySelector(".nc-chat-launch");
  const panel = root.querySelector("#nc-chat-panel");
  const closeBtn = root.querySelector(".nc-chat-close");
  const log = root.querySelector(".nc-chat-log");
  const chipsEl = root.querySelector(".nc-chips");
  const form = root.querySelector(".nc-chat-form");
  const input = root.querySelector("#nc-chat-input");
  const actions = document.querySelector(".mast-actions");
  if (actions) actions.appendChild(launch);

  let msgIndex = 0;
  let lastFocus = null;

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function nextTc() {
    msgIndex += 1;
    return "00:00:" + pad(msgIndex);
  }

  function scrollLog() {
    log.scrollTop = log.scrollHeight;
  }

  function addMessage(role, text) {
    const wrap = document.createElement("div");
    wrap.className = "nc-msg nc-msg-" + role;
    const meta = document.createElement("p");
    meta.className = "nc-msg-meta";
    meta.textContent = nextTc() + "  " + (role === "bot" ? "Northcut" : "You");
    const body = document.createElement("p");
    body.className = "nc-msg-body";
    body.textContent = text;
    wrap.appendChild(meta);
    wrap.appendChild(body);
    log.appendChild(wrap);
    scrollLog();
  }

  function setChips(items) {
    chipsEl.innerHTML = "";
    if (!items || !items.length) {
      chipsEl.hidden = true;
      return;
    }
    items.forEach(function (item) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "nc-chip";
      btn.textContent = item.label;
      btn.addEventListener("click", function () {
        handleChip(item);
      });
      chipsEl.appendChild(btn);
    });
    chipsEl.hidden = false;
  }

  function focusable() {
    return panel.querySelectorAll("button, input, a[href]");
  }

  function focusTrap(e) {
    if (e.key !== "Tab" || !root.classList.contains("is-open")) return;
    const list = focusable();
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === panel)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openChat() {
    lastFocus = document.activeElement;
    root.classList.add("is-open");
    panel.hidden = false;
    launch.hidden = true;
    launch.setAttribute("aria-expanded", "true");
    document.body.classList.add("nc-chat-lock");
    if (log.childElementCount === 0) {
      addMessage("bot", GREETING);
      setChips(DEFAULT_CHIPS);
    }
    closeBtn.focus();
  }

  function closeChat() {
    root.classList.remove("is-open");
    panel.hidden = true;
    launch.hidden = false;
    launch.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nc-chat-lock");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    else launch.focus();
  }

  function showSection(id) {
    const el = document.getElementById(id);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function has(hay, pins) {
    return pins.some(function (p) {
      return hay.indexOf(p) !== -1;
    });
  }

  function route(text) {
    const q = text.toLowerCase().replace(/[^a-z0-9+\s]/g, " ").replace(/\s+/g, " ").trim();

    if (has(q, ["quote"])) return "quote";
    if (has(q, ["price", "pricing", "package", "packages", "cost", "how much", "rate", "fee", "discount"])) {
      return "pricing";
    }
    if (has(q, ["how long", "turnaround", "how fast", "how soon", "timeline", "when will", "how many days", "guarantee", "guaranteed"])) {
      return "turnaround";
    }
    if (has(q, ["contact", "email", "e mail", "inbox", "talk to", "reach you", "phone", "call us", "hire", "get in touch", "gmail", "nolansautomation", "free sample", "request a sample", "want a sample", "need a sample", "start a project", "checklist", "what do you need", "send a message", "write to you"])) {
      return "contact";
    }
    if (has(q, ["portfolio", "see sample", "sample ad", "spec reel", "spec ad", "spec work", "show me", "watch", "the ads", "ironline", "fictional", "real client", "testimonial", "results"])) {
      return "samples";
    }
    if (q === "sample" || q === "samples" || q === "reel") return "samples";
    if (has(q, ["how it works", "how do you work", "how does it work", "process", "steps", "revisions", "concepts"])) {
      return "how";
    }
    if (/\bai\b/.test(q) || has(q, ["artificial", "generated", "real people", "real customers", "fake people"])) {
      return "ai";
    }
    if (has(q, ["who is it for", "who it's for", "who its for", "who are you for", "gym", "fitness", "studio", "niche", "grand rapids", "restaurant", "ecommerce", "ecom", "beauty", "salon", "home service", "industry", "industries", "other business"])) {
      return "who";
    }
    if (has(q, ["what we make", "what you make", "what do you make", "what do you do", "video", "image ad", "ad copy", "tiktok", "reels", "shorts", "display", "services"])) {
      return "make";
    }
    if (has(q, ["are you a bot", "are you real", "human", "person"])) {
      return "bot";
    }
    if (/^(hi|hey|hello|howdy|yo|good morning|good afternoon)$/.test(q)) {
      return "hello";
    }
    if (/^(thanks|thank you|thx|cheers|ok|okay|cool|great|perfect)$/.test(q)) {
      return "thanks";
    }
    return "unknown";
  }

  function answer(id) {
    if (id === "how") {
      addMessage(
        "bot",
        "A project runs brief, then concepts, then ads, then revisions. You share the business, who should see the ad, the action you want, and any must-haves. We come back with hook-led directions, make the short video, the image, and the copy once you pick an angle, and revise until the set is ready to post. A usual pace is a few days. That is not a guaranteed deadline. Email nolansautomation@gmail.com when you want to start."
      );
      setChips(DEFAULT_CHIPS);
      showSection("how");
      return;
    }
    if (id === "samples") {
      addMessage("bot", "The reel is silent spec work for Ironline Fitness, a fictional gym: three 15-second previews made to show the process. They are not client work and they are not results. Any offer written inside a sample is fictional script, not a real promotion and not a Northcut offer. For a different business, the hook, the picture, and the line are adapted. I’ll scroll you to the reel. Press play there. Nothing downloads until you do.");
      setChips([
        { id: "who", label: "Who it’s for" },
        { id: "make", label: "What we make" },
        { id: "contact", label: "Email us" }
      ]);
      showSection("work");
      return;
    }
    if (id === "contact" || id === "quote" || id === "pricing") {
      const subject = id === "contact" ? "" : "Northcut Ads quote";
      addMessage("bot", id === "quote" ? FAQ.pricing : FAQ[id]);
      addMailLink(subject);
      setChips([
        { id: "pricing", label: "Pricing" },
        { id: "samples", label: "Spec reel" },
        { id: "make", label: "What we make" }
      ]);
      showSection("contact");
      return;
    }
    if (id === "hello") {
      addMessage("bot", "Hello. Ask about the work, or pick a line below.");
      setChips(DEFAULT_CHIPS);
      return;
    }
    if (id === "thanks") {
      addMessage("bot", "Glad to help. Anything else on this page?");
      setChips(DEFAULT_CHIPS);
      return;
    }
    if (id === "bot") {
      addMessage("bot", "This is a short script on the page. It is not a person, and it does not send messages.");
      setChips(DEFAULT_CHIPS);
      return;
    }
    if (FAQ[id]) {
      addMessage("bot", FAQ[id]);
      setChips(DEFAULT_CHIPS);
      return;
    }
    addMessage(
      "bot",
      "I don’t have that on this page. I can point you to the spec reel, the notes, or " + EMAIL + ". This desk does not send a message for you."
    );
    setChips([
      { id: "samples", label: "Spec reel" },
      { id: "make", label: "What we make" },
      { id: "contact", label: "Email us" }
    ]);
  }

  function addMailLink(subject) {
    const wrap = document.createElement("div");
    wrap.className = "nc-msg nc-msg-bot";
    const body = document.createElement("p");
    body.className = "nc-msg-body";
    const link = document.createElement("a");
    link.className = "nc-mail";
    link.href = subject ? MAILTO + "?subject=" + encodeURIComponent(subject) : MAILTO;
    link.textContent = "Email " + EMAIL;
    body.appendChild(link);
    wrap.appendChild(body);
    log.appendChild(wrap);
    scrollLog();
  }

  function handleChip(item) {
    addMessage("you", item.label);
    answer(item.id);
    input.focus();
  }

  function onSubmit(text) {
    const trimmed = text.replace(/\s+/g, " ").trim();
    if (!trimmed) return;
    addMessage("you", trimmed);
    input.value = "";
    answer(route(trimmed));
  }

  launch.addEventListener("click", openChat);
  closeBtn.addEventListener("click", closeChat);
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    onSubmit(input.value);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && root.classList.contains("is-open")) {
      e.preventDefault();
      closeChat();
    }
    focusTrap(e);
  });
})();
