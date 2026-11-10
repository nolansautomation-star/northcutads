/* Northcut Ads — on-site chat desk. No API keys, no external services. */
(function () {
  // Change this when a real Northcut Ads inbox is set up.
  const CONTACT_EMAIL = "hello@northcutads.com";

  const GREETING =
    "Hey — this is the Northcut Ads desk. I can tell you what we make, how a project runs, or help you ask for a free sample ad.";

  const DEFAULT_CHIPS = [
    { id: "make", label: "What we make" },
    { id: "who", label: "Who it’s for" },
    { id: "how", label: "How it works" },
    { id: "samples", label: "See samples" },
    { id: "pricing", label: "Pricing" },
    { id: "sample", label: "Free sample ad" }
  ];

  const ANSWERS = {
    make:
      "We make AI-made short video ads, image ads, and ad copy for TikTok, Instagram Reels, YouTube Shorts, and display. The hook, the picture, and the words are written as one idea.",
    who:
      "We’re starting with gyms and fitness studios, out of Grand Rapids, Michigan. If you’re in another line of work, still ask — we can tell you whether it’s a fit.",
    how:
      "It runs brief, then concepts, then ads in days, then revisions. You tell us who it’s for and what you want people to do. We come back with hook-led directions, make the ads once you pick an angle, and revise until the set is ready to post.",
    turnaround:
      "Turnaround is usually a few days, not weeks. That’s a general sense of how we work — not a guaranteed deadline.",
    pricing:
      "Packages and prices aren’t posted yet — pricing is coming soon. If you want a figure for your project, ask for a quote and we’ll follow up.",
    ai:
      "Yes — the ads are AI-made. We use your real brand assets, we don’t create fake people posed as real customers, and we label the work where platforms require it.",
    samples:
      "The work on this page is spec work: sample ads, not real clients. They’re for a fictional gym, Ironline Fitness, to show how we work. I’ll scroll you to them."
  };

  const root = document.createElement("div");
  root.className = "nc-chat";
  root.innerHTML =
    '<button type="button" class="nc-chat-launch" aria-expanded="false" aria-controls="nc-chat-panel">' +
      '<span class="nc-rec" aria-hidden="true"></span>' +
      '<span>REC • Ask us</span>' +
    "</button>" +
    '<section id="nc-chat-panel" class="nc-chat-panel" role="dialog" aria-modal="true" aria-labelledby="nc-chat-title" hidden>' +
      '<div class="nc-chat-head">' +
        "<div>" +
          '<p class="nc-chat-kicker"><span class="nc-rec" aria-hidden="true"></span> 00:00:00 • Live</p>' +
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

  let opened = false;
  let msgIndex = 0;
  let lead = null; // { step, data }
  let lastUnknown = "";
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

  function defaultFollowup() {
    return DEFAULT_CHIPS;
  }

  function focusTrap(e) {
    if (e.key !== "Tab" || !root.classList.contains("is-open")) return;
    const list = panel.querySelectorAll("button, input");
    if (!list.length) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }

  function openChat() {
    lastFocus = document.activeElement;
    opened = true;
    root.classList.add("is-open");
    panel.hidden = false;
    launch.setAttribute("aria-expanded", "true");
    if (log.childElementCount === 0) {
      addMessage("bot", GREETING);
      setChips(DEFAULT_CHIPS);
    }
    panel.setAttribute("tabindex", "-1");
    panel.focus();
  }

  function closeChat() {
    opened = false;
    root.classList.remove("is-open");
    panel.hidden = true;
    launch.setAttribute("aria-expanded", "false");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    else launch.focus();
  }

  function mailTo(subject, body) {
    const url =
      "mailto:" +
      encodeURIComponent(CONTACT_EMAIL) +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);
    window.location.href = url;
  }

  function startLead() {
    lead = { step: "name", data: {} };
    addMessage(
      "bot",
      "Good — we can put a free sample ad together from a short brief. What’s your name?"
    );
    setChips([{ id: "cancel", label: "Never mind" }]);
    input.focus();
  }

  function finishLead() {
    const d = lead.data;
    const body = [
      "Free sample ad request",
      "",
      "Name: " + d.name,
      "Business: " + d.business,
      "Website / Instagram: " + d.web,
      "What they want to promote: " + d.promo,
      "",
      "Sent from the Northcut Ads site chat."
    ].join("\n");
    mailTo("Free sample ad request from " + d.name, body);
    addMessage(
      "bot",
      "Thanks. I’m opening an email to " +
        CONTACT_EMAIL +
        " with this written out. Master will reply when it arrives. The address on the site is still a placeholder, so if the message doesn’t go through we may not receive it yet."
    );
    lead = null;
    setChips(defaultFollowup());
  }

  function sendQuestion(question, name) {
    const body = [
      "Question from the Northcut Ads site chat",
      "",
      name ? "Name: " + name : "",
      "Question: " + question,
      "",
      "Sent from the Northcut Ads site chat."
    ]
      .filter(function (line, i, arr) {
        return line !== "" || (i > 0 && arr[i - 1] !== "");
      })
      .join("\n");
    mailTo("Question from the Northcut Ads site", body);
    addMessage(
      "bot",
      "I’m opening an email to " +
        CONTACT_EMAIL +
        " with your question. Master will reply when it arrives. The address on the site is still a placeholder, so if the message doesn’t go through we may not receive it yet."
    );
    lastUnknown = "";
    setChips(defaultFollowup());
  }

  function has(hay, pins) {
    return pins.some(function (p) {
      return hay.indexOf(p) !== -1;
    });
  }

  function route(text) {
    const q = text.toLowerCase().replace(/[^a-z0-9+\s]/g, " ").replace(/\s+/g, " ").trim();

    if (has(q, ["free sample", "sample ad", "get a sample", "request a sample", "want a sample"])) {
      return "sample";
    }
    if (has(q, ["portfolio", "see sample", "your work", "examples", "spec ad", "spec work", "show me", "the ads"])) {
      return "samples";
    }
    if (q === "sample" || q === "samples") return "samples";
    if (has(q, ["price", "pricing", "package", "packages", "cost", "how much", "quote", "rate", "fee"])) {
      return "pricing";
    }
    if (has(q, ["how long", "turnaround", "how fast", "how soon", "timeline", "when will", "how many days"])) {
      return "turnaround";
    }
    if (has(q, ["how it works", "how do you work", "how does it work", "process", "steps", "brief", "revisions", "concepts"])) {
      return "how";
    }
    if (/\bai\b/.test(q) || has(q, ["artificial", "generated", "real people", "real customers", "fake people"])) {
      return "ai";
    }
    if (has(q, ["who is it for", "who it's for", "who its for", "who are you for", "gym", "fitness", "studio", "niche", "grand rapids"])) {
      return "who";
    }
    if (has(q, ["what we make", "what you make", "what do you make", "what do you do", "video", "image ad", "ad copy", "tiktok", "reels", "shorts", "display", "services"])) {
      return "make";
    }
    if (has(q, ["contact", "email", "talk to", "reach", "phone", "call"])) {
      return "contact";
    }
    if (/^(hi|hey|hello|howdy|yo|good morning|good afternoon)$/.test(q)) {
      return "hello";
    }
    if (/^(thanks|thank you|thx|cheers|ok|okay|cool|great|perfect)$/.test(q)) {
      return "thanks";
    }
    return "unknown";
  }

  function showSamples() {
    addMessage("bot", ANSWERS.samples);
    const work = document.getElementById("work");
    if (work) {
      work.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }
    setChips([
      { id: "sample", label: "Free sample ad" },
      { id: "make", label: "What we make" },
      { id: "how", label: "How it works" }
    ]);
  }

  function answer(id, userText) {
    if (id === "sample") {
      startLead();
      return;
    }
    if (id === "samples") {
      showSamples();
      return;
    }
    if (id === "hello") {
      addMessage("bot", "Hello. Ask about the work, or pick a line below.");
      setChips(defaultFollowup());
      return;
    }
    if (id === "thanks") {
      addMessage("bot", "Glad to help. Anything else?");
      setChips(defaultFollowup());
      return;
    }
    if (id === "contact") {
      addMessage(
        "bot",
        "You can write to " +
          CONTACT_EMAIL +
          " — that’s the address on the site, and it’s still a placeholder until a real inbox is set up. I can also open an email for you, or take a free sample request."
      );
      setChips([
        { id: "sample", label: "Free sample ad" },
        { id: "email-q", label: "Send a question" },
        { id: "how", label: "How it works" }
      ]);
      return;
    }
    if (id === "email-q") {
      lastUnknown = userText || lastUnknown || "";
      if (lastUnknown) {
        addMessage("bot", "I can open an email to Master with that question. What’s your name, so he knows who it’s from?");
        lead = { step: "qname", data: { question: lastUnknown } };
        setChips([{ id: "cancel", label: "Never mind" }]);
      } else {
        addMessage("bot", "Write your question here, and I’ll open an email to Master with it.");
        lead = { step: "qtext", data: {} };
        setChips([{ id: "cancel", label: "Never mind" }]);
      }
      return;
    }
    if (ANSWERS[id]) {
      addMessage("bot", ANSWERS[id]);
      setChips(defaultFollowup());
      return;
    }
    lastUnknown = userText || "";
    addMessage(
      "bot",
      "I don’t have a specific answer for that. I can open an email so Master can reply, or you can pick one of the topics below."
    );
    setChips([
      { id: "email-q", label: "Send by email" },
      { id: "make", label: "What we make" },
      { id: "sample", label: "Free sample ad" }
    ]);
  }

  function handleChip(item) {
    if (item.id === "cancel") {
      lead = null;
      lastUnknown = "";
      addMessage("you", "Never mind");
      addMessage("bot", "No problem. Ask another question whenever you’re ready.");
      setChips(defaultFollowup());
      input.focus();
      return;
    }
    addMessage("you", item.label);
    if (lead && item.id !== "email-q") lead = null;
    answer(item.id, item.label);
    input.focus();
  }

  function handleLead(text) {
    if (lead.step === "name") {
      lead.data.name = text;
      lead.step = "business";
      addMessage("bot", "Thanks, " + text + ". What’s the business name?");
      setChips([{ id: "cancel", label: "Never mind" }]);
      return;
    }
    if (lead.step === "business") {
      lead.data.business = text;
      lead.step = "web";
      addMessage("bot", "Got it. What’s the website or Instagram?");
      setChips([{ id: "cancel", label: "Never mind" }]);
      return;
    }
    if (lead.step === "web") {
      lead.data.web = text;
      lead.step = "promo";
      addMessage("bot", "And what do you want to promote?");
      setChips([{ id: "cancel", label: "Never mind" }]);
      return;
    }
    if (lead.step === "promo") {
      lead.data.promo = text;
      finishLead();
      return;
    }
    if (lead.step === "qtext") {
      lead.data.question = text;
      lastUnknown = text;
      lead.step = "qname";
      addMessage("bot", "Thanks. What’s your name, so Master knows who it’s from?");
      setChips([{ id: "cancel", label: "Never mind" }]);
      return;
    }
    if (lead.step === "qname") {
      sendQuestion(lead.data.question, text);
      lead = null;
    }
  }

  function onSubmit(text) {
    const trimmed = text.replace(/\s+/g, " ").trim();
    if (!trimmed) return;
    addMessage("you", trimmed);
    input.value = "";
    if (lead) {
      handleLead(trimmed);
      return;
    }
    answer(route(trimmed), trimmed);
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
