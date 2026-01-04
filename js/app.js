/* ==================================================
   GLOBAL ELEMENT CACHE
================================================== */
let menu, menuButton, main, overlays;
let weekday, daytime, dateEl, timeEl;
let dailyQuoteBox;

/* ==================================================
   APP INIT
================================================== */
document.addEventListener("DOMContentLoaded", () => {
  cacheElements();

  initIntro();
  initMenu();
  initHeader();
  initDailyQuote();
  initPersonalQuotes();
  initFocus();
  initOverlays();
  initInfo();
  initMeineZeit();
  initZitate();
  initPersonalSlides();
  initArchive();
  initNews();
  initShare();
});

/* ==================================================
   CACHE ELEMENTS
================================================== */
function cacheElements() {
  menu = document.getElementById("menu");
  menuButton = document.getElementById("menuButton");
  main = document.querySelector("main");
  overlays = document.querySelectorAll(".overlay");

  weekday = document.getElementById("weekday");
  daytime = document.getElementById("daytime");
  dateEl = document.getElementById("date");
  timeEl = document.getElementById("time");

  dailyQuoteBox = document.getElementById("dailyQuoteBox");
}

/* ==================================================
   INTRO
================================================== */
function initIntro() {
  const overlay = document.getElementById("introOverlay");
  const card = document.getElementById("introCard");
  const textEl = document.getElementById("introText");
  const button = document.getElementById("introButton");
  const playBtn = document.getElementById("playIntroBtn");
  if (!overlay) return;

  const audio = new Audio("introMusic.mp3");
  audio.volume = 0.4;

  const introText = `
Diese Seite ist ein Ort für Gedanken, Zitate
und Momente der Ruhe.

Einfach mal nachdenken, vieles anders sehen
und bedacht an manche Dinge herangehen.

Ich habe dies zu meinem persönlichen Projekt
gemacht und bin gespannt, was das Jahr
2026 mit sich bringt.`;

  let i = 0;
  function typeWriter() {
    if (i < introText.length) {
      textEl.textContent += introText.charAt(i++);
      setTimeout(typeWriter, 50);
    } else {
      button.disabled = false;
      button.classList.add("active");
    }
  }

  playBtn.onclick = () => {
    playBtn.disabled = true;
    audio.play().catch(() => {});
    card.classList.add("show");
    textEl.textContent = "";
    i = 0;
    typeWriter();
    playBtn.style.display = "none";
  };

  button.onclick = () => {
    overlay.style.opacity = "0";
    setTimeout(() => (overlay.style.display = "none"), 800);
    audio.pause();
  };
}

/* ==================================================
   MENU
================================================== */
function initMenu() {
  if (!menu || !menuButton) return;

  menuButton.onclick = () => {
    menu.style.right = menu.style.right === "0px" ? "-260px" : "0";
  };

  document.querySelectorAll("#menu a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = link.dataset.target;
      menu.style.right = "-260px";

      if (target === "home") {
        showMain();
      } else {
        document.dispatchEvent(
          new CustomEvent("openSection", { detail: target })
        );
      }
    });
  });
}

/* ==================================================
   HEADER / TIME
================================================== */
function initHeader() {
  updateHeader();
  setInterval(updateHeader, 1000);
}

function updateHeader() {
  const now = new Date();
  const days = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];

  weekday.textContent = days[now.getDay()];
  daytime.textContent =
    now.getHours() < 12 ? "Morgens" :
    now.getHours() < 18 ? "Mittags" : "Abends";

  dateEl.textContent = now.toLocaleDateString("de-DE");
  timeEl.textContent = now.toLocaleTimeString("de-DE");
}

/* ==================================================
   DAILY QUOTE
================================================== */
function initDailyQuote() {
  if (!dailyQuoteBox) return;

  fetch("data/tageszeit.json")
    .then(r => r.json())
    .then(data => {
      const today = new Date().toISOString().split("T")[0];
      const seed = Number(today.replaceAll("-", ""));
      dailyQuoteBox.textContent =
        data.quotes[seed % data.quotes.length];
    })
    .catch(() => {
      dailyQuoteBox.textContent = "Tageszitat nicht verfügbar";
    });
}

/* ==================================================
   PERSONAL QUOTES
================================================== */
function initPersonalQuotes() {
  const display = document.getElementById("personalQuoteDisplay");
  if (!display) return;

  fetch("data/dailyTexts.json")
    .then(r => r.json())
    .then(d => {
      const today = new Date().toISOString().split("T")[0];
      const seed = Number(today.replaceAll("-", ""));

      function show(type) {
        display.textContent = d[type][seed % d[type].length];
        display.style.display = "block";
      }

      document.getElementById("morningBtn").onclick = () => show("morning");
      document.getElementById("noonBtn").onclick = () => show("noon");
      document.getElementById("eveningBtn").onclick = () => show("evening");
    });
}

/* ==================================================
   FOCUS
================================================== */
function initFocus() {
  const input = document.getElementById("dailyFocusInput");
  if (!input) return;

  const key = "focus-" + new Date().toISOString().split("T")[0];
  input.value = localStorage.getItem(key) || "";
  input.oninput = () => localStorage.setItem(key, input.value);
}

/* ==================================================
   OVERLAYS
================================================== */
function hideAllOverlays() {
  overlays.forEach(o => (o.style.display = "none"));
}

function showMain() {
  hideAllOverlays();
  main.style.display = "flex";
}

function initOverlays() {
  document.addEventListener("openSection", e => {
    hideAllOverlays();
    const overlay = document.getElementById(e.detail);
    if (overlay) {
      overlay.style.display = "flex";
      main.style.display = "none";
    }
  });
}

/* ==================================================
   INFO
================================================== */
function initInfo() {
  const info = document.getElementById("infoContent");
  if (!info) return;

  fetch("data/info.json")
    .then(r => r.json())
    .then(d => (info.innerHTML = d.infoText));
}

/* ==================================================
   NEWS
================================================== */
function initNews() {
  const list = document.getElementById("newsList");
  if (!list) return;

  fetch("data/archive.json")
    .then(r => r.json())
    .then(d => {
      list.innerHTML = "";
      d.days.slice(0, 3).forEach(item => {
        const div = document.createElement("div");
        div.className = "newsItem";
        div.innerHTML = `
          <div class="newsHeader">
            <span>${item.date}</span>
            <span>${item.location || "–"}</span>
          </div>
          <div class="newsText">${item.quote}</div>
        `;
        list.appendChild(div);
      });
    });
}

/* ==================================================
   SHARE
================================================== */
function initShare() {
  const btn = document.getElementById("shareQuoteBtn");
  if (!btn) return;

  btn.onclick = () => {
    const quote = dailyQuoteBox?.textContent;
    if (!quote) return;

    if (navigator.share) {
      navigator.share({ title: "Tageszitat", text: quote });
    } else {
      navigator.clipboard.writeText(quote);
      alert("Zitat kopiert");
    }
  };
}
