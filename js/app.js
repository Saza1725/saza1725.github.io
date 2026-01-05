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
  if (!overlay) return;

  const card = document.getElementById("introCard");
  const textEl = document.getElementById("introText");
  const button = document.getElementById("introButton");
  const playBtn = document.getElementById("playIntroBtn");

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
   OVERLAYS (BASIS)
================================================== */
function initOverlays() {
  showMain();
}

function hideAllOverlays() {
  overlays.forEach(o => (o.style.display = "none"));
}

function showMain() {
  hideAllOverlays();
  if (main) main.style.display = "flex";
}

function createOverlayHandler(overlayId, renderFn) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;

  const content = overlay.querySelector(".overlayContent");
  if (content) content.addEventListener("click", e => e.stopPropagation());

  overlay.addEventListener("click", showMain);

  document.addEventListener("openSection", e => {
    if (e.detail === overlayId) {
      hideAllOverlays();
      if (renderFn) renderFn();
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
   MEINE ZEIT
================================================== */
function initMeineZeit() {
  fetch("data/meinezeit.json")
    .then(r => r.json())
    .then(d => {
      const grid = document.getElementById("meinezeitGrid");
      if (!grid) return;

      function renderOverview() {
        grid.innerHTML = "";
        Object.keys(d.folders).forEach(name => {
          const div = document.createElement("div");
          div.className = "myTimeFolder";
          div.textContent = name;
          div.onclick = () => renderFolder(name);
          grid.appendChild(div);
        });
      }

      function renderFolder(name) {
        grid.innerHTML = "";
        const fc = document.createElement("div");
        fc.className = "folderContent";
        fc.innerHTML = `<h3>${name}</h3>`;

        d.folders[name].forEach(e => {
          fc.innerHTML += `<h4>${e.title}</h4><p>${e.text}</p>`;
          if (e.image) {
            fc.innerHTML += `<img src="${e.image}" class="myTimeImage">`;
          }
        });

        const backBtn = document.createElement("button");
        backBtn.textContent = "← Zurück";
        backBtn.className = "closeBtn";
        backBtn.onclick = e => {
          e.stopPropagation();
          renderOverview();
        };

        fc.appendChild(backBtn);
        grid.appendChild(fc);
      }

      createOverlayHandler("meinezeitOverlay", renderOverview);
    });
}

/* ==================================================
   ZITATE
================================================== */
function initZitate() {
  fetch("data/folders.json")
    .then(r => r.json())
    .then(d => {
      const grid = document.getElementById("folderGrid");
      if (!grid) return;

      function renderOverview() {
        grid.innerHTML = "";
        Object.keys(d.folders).forEach(name => {
          const div = document.createElement("div");
          div.className = "folderFrame";
          div.textContent = name;
          div.onclick = () => renderFolder(name);
          grid.appendChild(div);
        });
      }

      function renderFolder(name) {
        grid.innerHTML = "";
        const fc = document.createElement("div");
        fc.className = "folderContent";
        fc.innerHTML = `<h3>${name}</h3>`;

        d.folders[name].forEach(q => {
          const p = document.createElement("p");
          p.textContent = q;
          fc.appendChild(p);
        });

        const backBtn = document.createElement("button");
        backBtn.textContent = "← Zurück";
        backBtn.className = "closeBtn";
        backBtn.onclick = e => {
          e.stopPropagation();
          renderOverview();
        };

        fc.appendChild(backBtn);
        grid.appendChild(fc);
      }

      createOverlayHandler("folderOverlay", renderOverview);
    });
}

/* ==================================================
   PERSONAL SLIDES
================================================== */
function initPersonalSlides() {
  const container = document.getElementById("personalSlidesContainer");
  if (!container) return;

  const progress = document.getElementById("personalSlidesProgress");
  const prevBtn = document.getElementById("prevSlide");
  const nextBtn = document.getElementById("nextSlide");

  let slides = [];
  let current = 0;

  fetch("data/personalSlides.json")
    .then(r => r.json())
    .then(d => {
      slides = d.slides;

      function render(index) {
        container.innerHTML =
          `<h3>${slides[index].title}</h3><p>${slides[index].text.replace(/\n/g,"<br>")}</p>`;
        progress.textContent = `${index + 1} / ${slides.length}`;
        prevBtn.style.display = index === 0 ? "none" : "inline-block";
        nextBtn.style.display = index === slides.length - 1 ? "none" : "inline-block";
      }

      prevBtn.onclick = () => {
        if (current > 0) render(--current);
      };

      nextBtn.onclick = () => {
        if (current < slides.length - 1) render(++current);
      };

      render(0);
    });

  createOverlayHandler("personalOverlay");
}

/* ==================================================
   ARCHIVE
================================================== */
function initArchive() {
  fetch("data/archive.json")
    .then(r => r.json())
    .then(d => {
      const monthDetail = document.getElementById("monthDetail");
      if (!monthDetail) return;

      function renderArchive() {
        monthDetail.innerHTML = "";
        d.days.forEach(entry => {
          const box = document.createElement("div");
          box.className = "archiveEntry";
          box.innerHTML = `<h4>${entry.date}</h4><p>${entry.quote}</p>`;
          monthDetail.appendChild(box);
        });
      }

      createOverlayHandler("archiveOverlay", renderArchive);
    });
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
