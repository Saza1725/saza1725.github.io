
document.addEventListener("DOMContentLoaded", () => {

// =========================
// GLOBALER STORY STATUS
// =========================
let storyIsOpen = false;
let storyTarget = null;


  const $ = id => document.getElementById(id);


let activeMusic = null;
let activeMusicSrc = null;
let activeMusicTime = 0;
let activeSection = null;
let thoughtsSection = 0;
let thoughtsSlide = 0;






function playMusic(src) {
  if (activeMusicSrc === src && activeMusic) {
    activeMusic.play();
    return;
  }

  if (activeMusic) {
    activeMusic.pause();
    activeMusic.currentTime = 0;
  }

  activeMusic = new Audio(src);
  activeMusic.loop = true;
  activeMusic.play();

  activeMusicSrc = src;
}

function pauseMusic() {
  if (!activeMusic) return;
  activeMusic.pause();
  activeMusic.currentTime = 0;
  activeMusic = null;
  activeMusicSrc = null;
}



  /* =========================
     BASIS
  ========================= */
  const menu = $("menu");
  const menuButton = $("menuButton");
  const homeBtn = $("homeBtn");
  const overlay = $("overlay");
  const overlayContent = $("overlayContent");

  const timeEl = $("time");
  const weekdayEl = $("weekday");
  const dateEl = $("date");

  const dailyQuoteBox = $("dailyQuoteBox");
  const dailyTextBox = $("dailyTextBox");

  const focusInput = $("dailyFocusInput");
  const focusCard = document.querySelector(".card");
  const statsBox = $("personalQuoteDisplay");

  const storyMusic = document.getElementById("storyMusic");


let storyPage = 0;

  /* =========================
     INTRO
  ========================= */
  const introOverlay = $("introOverlay");
  const introStart = $("introStart");

  if (introOverlay && introStart) {
    introStart.onclick = () => {
      introOverlay.classList.add("fade-out");
      setTimeout(() => introOverlay.remove(), 1200);
    };
  }
function playStoryMusic() {
  playMusic("assets/audio/story.mp3");
}

function pauseStoryMusic() {
  pauseMusic();
}

  /* =========================
     UHR & DATUM
  ========================= */
  function updateTime() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString("de-DE");
    weekdayEl.textContent = now.toLocaleDateString("de-DE", { weekday: "long" });
    dateEl.textContent = now.toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "long",
      year: "numeric"
    });
  }
  updateTime();
  setInterval(updateTime, 1000);

  /* =========================
     TAGESZITAT
  ========================= */
  async function loadDailyQuote() {
    try {
      const res = await fetch("data/tageszeit.json");
      const data = await res.json();
      dailyQuoteBox.textContent =
        data.quotes[Math.floor(Math.random() * data.quotes.length)];
    } catch {
      dailyQuoteBox.textContent = "Heute zählt dein eigener Gedanke.";
    }
  }
  loadDailyQuote();

  /* =========================
     DAILY IMPULS
  ========================= */
  async function loadDailyText(time) {
    try {
      const res = await fetch("data/dailyTexts.json");
      const data = await res.json();
      dailyTextBox.textContent =
        data[time][Math.floor(Math.random() * data[time].length)];
    } catch {
      dailyTextBox.textContent = "Höre heute auf dich selbst.";
    }
  }

  document.querySelectorAll(".buttons button").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".buttons button").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadDailyText(btn.dataset.time);
    };
  });

  /* =========================
     FOKUS
  ========================= */
  if (focusInput && focusCard) {
    const saved = localStorage.getItem("focus");
    if (saved) {
      focusInput.value = saved;
      focusCard.classList.add("active");
    }

    focusInput.oninput = () => {
      localStorage.setItem("focus", focusInput.value);
      focusCard.classList.toggle("active", focusInput.value.trim() !== "");
    };
  }

  /* =========================
     STATISTIK
  ========================= */
  function updateStats() {
    const count = +(localStorage.getItem("slidesToday") || 0);
    statsBox.textContent = `Heute ${count} Folien gelesen`;
  }
  updateStats();

  /* =========================
     MENÜ
  ========================= */
  menuButton.onclick = () => menu.classList.toggle("open");

document.querySelectorAll("#menu button[data-target]").forEach(btn => {
  btn.onclick = () => {
    const target = btn.dataset.target;

    pauseMusic(); // stoppe immer vorher

    activeSection = target;
    if (target === "about") playMusic("assets/audio/entspannt.mp3");
    if (target === "story") playMusic("assets/audio/story.mp3");
    if (target === "info") playMusic("assets/audio/entferne.m4a");
    if (target === "quotes") playMusic("assets/audio/entspannt.mp3");
    
    menu.classList.remove("open");
    openOverlay(target);
  };
});

homeBtn.onclick = () => {
  menu.classList.remove("open");

  // Overlay schließen
  overlay.style.display = "none";
  overlayContent.innerHTML = "";
  document.body.classList.remove("modal-open");

  // Story verlassen → Musik pausieren
pauseMusic();

  activeSection = null;
};


overlay.onclick = e => {
  if (e.target === overlay) closeOverlay();
};
/* =========================
   OVERLAY: GLOBAL CLICK = ZURÜCK
========================= */
overlay.addEventListener("click", (e) => {

  // Diese Elemente dürfen NICHT schließen
  const allowed = [
    ".folder-card",
    ".folder-card h3",
   " .folder-card:hover",
   ".folder-card::before",
    ".slide",
    ".nav",
    ".back",
    "button"
  ];

  // Prüfen: Klick war auf erlaubtem Element?
  for (const selector of allowed) {
    if (e.target.closest(selector)) {
      return; // nichts tun → Overlay bleibt offen
    }
  }

  // Alles andere → zurück zur Hauptseite
  closeOverlay();
});

  /* =========================
     OVERLAY DISPATCHER
  ========================= */
storyMusic.pause();
storyMusic.currentTime = 0;


function openOverlay(type) {
  storyMusic.pause();
  storyMusic.currentTime = 0;

  overlay.style.display = "block";
  overlayContent.innerHTML = "";
  document.body.classList.add("modal-open");
  overlay.style.display = "block";
  overlayContent.innerHTML = "";
  document.body.classList.add("modal-open");

  if (type === "about") loadAbout();
  if (type === "ordnerX") loadOrdnerX();
  if (type === "thoughts") loadThoughts();
  if (type === "info") loadInfo();
  if (type === "archive") loadArchive();
  if (type === "quotes") loadQuotes();
if (type === "story") {
  activeSection = "story";
  playStoryMusic();
  loadMeineGeschichte();
}

}
storyMusic.pause();
storyMusic.currentTime = 0;

function closeOverlay() {
  storyMusic.pause();
  storyMusic.currentTime = 0;

  overlay.style.display = "none";
  overlayContent.innerHTML = "";
  document.body.classList.remove("modal-open");
  pauseMusic();
}

  /* ==================================================
     ÜBER MICH
  ================================================== */
  async function loadAbout() {
    const res = await fetch("data/personalSlides.json");
    const data = await res.json();

    let sectionIndex = null;
    let slideIndex = 0;

    showSections();

    function showSections() {
      overlayContent.innerHTML = `
        <h2>${data.title}</h2>
        <div class="folder-grid">
          ${data.sections.map((s, i) => `
            <div class="folder-card" data-i="${i}">
              <h3>${s.title}</h3>
              <div class="folder-progress">${s.slides.length} Karten</div>
            </div>
          `).join("")}
        </div>
      `;

      overlayContent.querySelectorAll(".folder-card").forEach(card => {
        card.onclick = () => {
          sectionIndex = +card.dataset.i;
          slideIndex = 0;
          showSlide();
        };
      });
    }

    function showSlide() {
      const section = data.sections[sectionIndex];
      const slide = section.slides[slideIndex];

      overlayContent.innerHTML = `
        <button class="back">← Über mich</button>
        <div class="slide">
          <h3>${slide.title}</h3>
          <p>${slide.text.replace(/\n/g, "<br>")}</p>
        </div>
        <div class="nav">
          <button id="prev" ${slideIndex === 0 ? "disabled" : ""}>←</button>
          <span>${slideIndex + 1} / ${section.slides.length}</span>
          <button id="next" ${slideIndex === section.slides.length - 1 ? "disabled" : ""}>→</button>
        </div>
      `;

      localStorage.setItem(
        "slidesToday",
        +(localStorage.getItem("slidesToday") || 0) + 1
      );
      updateStats();

      overlayContent.querySelector(".back").onclick = showSections;
      $("prev").onclick = () => slideIndex-- > 0 && showSlide();
      $("next").onclick = () => slideIndex++ < section.slides.length - 1 && showSlide();
    }
  }
  /* ==================================================
     Ordner X
  ================================================== */
  async function loadOrdnerX() {
    const res = await fetch("data/ordnerX.json");
    const data = await res.json();

    let sectionIndex = null;
    let slideIndex = 0;

    showSections();

    function showSections() {
      overlayContent.innerHTML = `
        <h2>${data.title}</h2>
        <div class="folder-grid">
          ${data.sections.map((s, i) => `
            <div class="folder-card" data-i="${i}">
              <h3>${s.title}</h3>
              <div class="folder-progress">${s.slides.length} Karten</div>
            </div>
          `).join("")}
        </div>
      `;

      overlayContent.querySelectorAll(".folder-card").forEach(card => {
        card.onclick = () => {
          sectionIndex = +card.dataset.i;
          slideIndex = 0;
          showSlide();
        };
      });
    }

    function showSlide() {
      const section = data.sections[sectionIndex];
      const slide = section.slides[slideIndex];

      overlayContent.innerHTML = `
        <button class="back">← OrdnerX</button>
        <div class="slide">
          <h3>${slide.title}</h3>
          <p>${slide.text.replace(/\n/g, "<br>")}</p>
        </div>
        <div class="nav">
          <button id="prev" ${slideIndex === 0 ? "disabled" : ""}>←</button>
          <span>${slideIndex + 1} / ${section.slides.length}</span>
          <button id="next" ${slideIndex === section.slides.length - 1 ? "disabled" : ""}>→</button>
        </div>
      `;

      localStorage.setItem(
        "slidesToday",
        +(localStorage.getItem("slidesToday") || 0) + 1
      );
      updateStats();

      overlayContent.querySelector(".back").onclick = showSections;
      $("prev").onclick = () => slideIndex-- > 0 && showSlide();
      $("next").onclick = () => slideIndex++ < section.slides.length - 1 && showSlide();
    }
  }

/* =========================
   GEDANKEN – STABILES STORY MODUL
========================= */


async function loadThoughts() {
  const res = await fetch("data/thoughtsSlides.json");
  const data = await res.json();

  const storyPages = [
    { start: 0.0, end: 31.0 },
    { start: 31.0, end: 62.5 }
  ];

  let storyPage = 0;
  let sectionIndex = 0;
  let slideIndex = 0;
  let storyRunning = false;

  showSections();

  function showSections() {
    stopStory();
    overlayContent.innerHTML = `
      <h2>${data.title}</h2>
      <div class="folder-grid">
        ${data.sections.map((s, i) => `
          <div class="folder-card" data-i="${i}">
            <h3>${s.title}</h3>
          </div>`).join("")}
      </div>
    `;

    overlayContent.querySelectorAll(".folder-card").forEach(card => {
      card.onclick = () => {
        sectionIndex = +card.dataset.i;
        slideIndex = 0;
        openStory();
      };
    });
  }


  function openStory() {
    storyIsOpen = true;
    storyRunning = true;
    storyPage = 0;

    overlayContent.innerHTML = `
      <button class="back">← Themen</button>

      <div class="slide story-slide">
        <div id="storyText" class="story-text"></div>
        <div class="story-page" id="storyPage">1 / ${storyPages.length}</div>
      </div>

      <div class="nav">
        <button id="next">→</button>
      </div>
    `;
    storyIsOpen = true;
    storyTarget = document.getElementById("storyText");

    storyMusic.src = "assets/audio/nichtseinreden .mp3";
    storyMusic.currentTime = storyPages[0].start;
    storyMusic.play();

    overlayContent.querySelector(".back").onclick = showSections;
    document.getElementById("next").onclick = nextStoryPage;

    storyMusic.onended = nextStoryPage;
  }

  function nextStoryPage() {
    if (storyPage < storyPages.length - 1) {
      storyPage++;
      storyMusic.currentTime = storyPages[storyPage].start;
      storyMusic.play();
      document.getElementById("storyPage").textContent = `${storyPage + 1} / ${storyPages.length}`;
    } else {
      stopStory();
      showThoughtSlide();
    }
  }

function stopStory() {
  storyIsOpen = false;
  storyTarget = null;
  storyMusic.pause();
  storyMusic.currentTime = 0;
}

  function showThoughtSlide() {
    const slides = data.sections[sectionIndex].slides;
    const s = slides[slideIndex];

    overlayContent.innerHTML = `
      <button class="back">← Themen</button>
      <div class="slide">
        <h3>${s.title}</h3>
        <p>${(s.text || "").replace(/\n/g, "<br>")}</p>
      </div>
      <div class="nav">
        <button id="prev" ${slideIndex === 0 ? "disabled" : ""}>←</button>
        <span>${slideIndex + 1} / ${slides.length}</span>
        <button id="next" ${slideIndex === slides.length - 1 ? "disabled" : ""}>→</button>
      </div>
    `;

    overlayContent.querySelector(".back").onclick = showSections;
    document.getElementById("prev").onclick = () => { if (slideIndex > 0) { slideIndex--; showThoughtSlide(); }};
    document.getElementById("next").onclick = () => { if (slideIndex < slides.length - 1) { slideIndex++; showThoughtSlide(); }};
  }

  /* ---------- Untertitel Sync ---------- */
  storyMusic.addEventListener("timeupdate", () => {
    if (!storyRunning || !storyTarget) return;
    const t = storyMusic.currentTime;

    for (let i = storyScript.length - 1; i >= 0; i--) {
      if (t >= storyScript[i].time) {
        storyTarget.textContent = storyScript[i].text;
        break;
      }
    }
  });
}

/* =========================
     MEINE GESCHICHTE
  ========================= */
  async function loadMeineGeschichte() {
    const res = await fetch("data/meinegeschichte.json");
    const data = await res.json();
    const folders = Object.entries(data.folders);
    let f = 0, i = 0;

    showFolders();

    function showFolders() {
      overlayContent.innerHTML = `
        <h2>Meine Geschichte</h2>
        <div class="folder-grid">
          ${folders.map(([n, e], x) => `
            <div class="folder-card" data-i="${x}">
              <h3>${n}</h3>
              <div class="folder-progress">${e.length} Einträge</div>
            </div>`).join("")}
        </div>`;
      overlayContent.querySelectorAll(".folder-card").forEach(c =>
        c.onclick = () => { f = +c.dataset.i; i = 0; showEntry(); }
      );
    }
function setMusicVolumeForStory() {
  const music = document.getElementById("bgMusic");
  if (!music) return;
  music.volume = 0.20;
}

function setMusicVolumeNormal() {
  const music = document.getElementById("bgMusic");
  if (!music) return;
  music.volume = 0.6;
}

if (activeSection === "story") {
  setMusicVolumeForStory();
} else {
  setMusicVolumeNormal();
}

   function showEntry() {
  const [, entries] = folders[f];

  overlayContent.innerHTML = `
    <button class="back">←Meine Geschichte</button>

<div class="slide">
  <pre class="story-text">${entries[i]}</pre>
</div>

    <div class="nav">
      <button id="prev" ${i === 0 ? "disabled" : ""}>←</button>
      <span>${i + 1} / ${entries.length}</span>
      <button id="next" ${i === entries.length - 1 ? "disabled" : ""}>→</button>
    </div>
  `;
document.querySelector(".back").onclick = () => {
  
  showFolders();
};



  document.getElementById("prev").onclick = () => {
    if (i > 0) { i--; showEntry(); }
  };
  document.getElementById("next").onclick = () => {
    if (i < entries.length - 1) { i++; showEntry(); }
  };
}
}
/* ==================================================
   INFO – FOLIEN
================================================== */
async function loadInfo() {
  const res = await fetch("data/info.json");
  const data = await res.json();

  let index = 0;

  render();

  function render() {
    const slide = data.slides[index];

    overlayContent.innerHTML = `
      <div class="info-card info-scroll">
        <h2 class="info-title">${data.title}</h2>

        <div class="info-slide-title">${slide.title}</div>

        <div class="scroll-indicator">
          <span class="scroll-progress"></span>
        </div>

        <div class="info-content">
          ${slide.content}
        </div>

        <div class="info-nav">
          <button id="prev" ${index === 0 ? "disabled" : ""}>←</button>
          <span>${index + 1} / ${data.slides.length}</span>
          <button id="next" ${index === data.slides.length - 1 ? "disabled" : ""}>→</button>
        </div>
      </div>
    `;

    initInfoScrollIndicator();

    document.getElementById("prev").onclick = () => {
      if (index > 0) {
        index--;
        render();
      }
    };

    document.getElementById("next").onclick = () => {
      if (index < data.slides.length - 1) {
        index++;
        render();
      }
    };
  }
}
/* ==================================================
   ARCHIVE – VERGANGENE TAGE (aus days[])
================================================== */
async function loadArchive() {
  const res = await fetch("data/archive.json");
  const data = await res.json();

  // Nach Monat/Jahr gruppieren
  const groups = {};

  data.days.forEach(d => {
    const [day, month, year] = d.date.split(".");
    const key = `${month}.${year}`;

    if (!groups[key]) {
      groups[key] = {
        label: new Date(year, month - 1)
          .toLocaleDateString("de-DE", { month: "long", year: "numeric" }),
        entries: []
      };
    }

    groups[key].entries.push(d);
  });

  const months = Object.values(groups)
    .sort((a, b) => new Date(b.label) - new Date(a.label));

  let activeMonth = null;

  showMonths();

  /* -------- MONATSORDNER -------- */
  function showMonths() {
    overlayContent.innerHTML = `
      <h2>Vergangene Tage</h2>
      <div class="folder-grid">
        ${months.map((m, i) => `
          <div class="folder-card" data-i="${i}">
            <h3>${m.label}</h3>
            <div class="folder-progress">
              ${m.entries.length} Einträge
            </div>
          </div>
        `).join("")}
      </div>
    `;

    overlayContent.querySelectorAll(".folder-card").forEach(card => {
      card.onclick = () => {
        activeMonth = +card.dataset.i;
        showMonth();
      };
    });
  }

  /* -------- MONATSANSICHT -------- */
  function showMonth() {
    const month = months[activeMonth];

    overlayContent.innerHTML = `
      <button class="back">← Monate</button>

<div class="slide archive-month">
        <h3>${month.label}</h3>

        <div class="archive-table">
          ${month.entries.map(e => `
            <div class="archive-row">
              <div class="archive-date">${e.date}</div>
              <div class="archive-text">${e.quote}</div>
            </div>
          `).join("")}
        </div>
      </div>
    `;

    overlayContent.querySelector(".back").onclick = showMonths;
  }
}

/* =========================
     ZITATE
========================= */
async function loadQuotes() {
  const res = await fetch("data/folders.json");
  const data = await res.json();

  const folders = Object.entries(data.folders);
  let f = 0;
  let i = 0;

  showFolders();

  function showFolders() {
    overlayContent.innerHTML = `
      <h2>Zitate</h2>
      <div class="folder-grid">
        ${folders.map(([name, quotes], index) => `
          <div class="folder-card" data-i="${index}">
            <h3>${name}</h3>
            <div class="folder-progress">${quotes.length} Zitate</div>
          </div>
        `).join("")}
      </div>
    `;

    overlayContent.querySelectorAll(".folder-card").forEach(card => {
      card.onclick = () => {
        f = Number(card.dataset.i);
        i = 0;
        showQuote();
      };
    });
  }

  function showQuote() {
    const [, quotes] = folders[f];

    overlayContent.innerHTML = `
      <button class="back">← Ordner</button>

      <div class="slide">
  <blockquote class="quote-text">„${quotes[i]}“</blockquote>
</div>


      <div class="nav">
        <button id="prev" ${i === 0 ? "disabled" : ""}>←</button>
        <span>${i + 1} / ${quotes.length}</span>
        <button id="next" ${i === quotes.length - 1 ? "disabled" : ""}>→</button>
      </div>
    `;

    /* 👉 HIER IST DER FIX */
    const back = overlayContent.querySelector(".back");
    const prev = overlayContent.querySelector("#prev");
    const next = overlayContent.querySelector("#next");

    if (back) back.onclick = showFolders;

    if (prev) {
      prev.onclick = () => {
        if (i > 0) {
          i--;
          showQuote();
        }
      };
    }

    if (next) {
      next.onclick = () => {
        if (i < quotes.length - 1) {
          i++;
          showQuote();
        }
      };
    }
  }
}

  
/* =====================================
INFO SCROLL INDICATOR LOGIK
===================================== */
function initInfoScrollIndicator() {
  const content = document.querySelector(".info-content");
  const progress = document.querySelector(".scroll-progress");

  if (!content || !progress) return;

  const updateProgress = () => {
    const scrollTop = content.scrollTop;
    const scrollHeight = content.scrollHeight - content.clientHeight;
    const percent = scrollHeight > 0
      ? (scrollTop / scrollHeight) * 100
      : 0;

    progress.style.width = `${percent}%`;
  };

  content.addEventListener("scroll", updateProgress);
  updateProgress();
}
/* =========================
   GLOBAL STORY STATE
========================= */



const storyPages = [
  { start: 0.0, end: 31.0 },
  { start: 31.0, end: 62.5 }
];

/* =========================
   STORY SCRIPT
========================= */
const storyScript = [
  { time: 0.00, text: "Lass dir von niemandem je einreden" },
  { time: 2.14, text: "dass du was nicht kannst" },
  { time: 3.26, text: "weil das wichtigste ist" },
  { time: 4.27, text: "dass ihr auf euch selber immer vertraut" },
  { time: 6.13, text: "egal was andere sagen" },
  { time: 8.03, text: "wenn ihr euch etwas in den Kopf setzt" },
  { time: 10.07, text: "oder an etwas glaubt das zu erreichen" },
  { time: 12.17, text: "dann werdet ihr es erreichen" },
  { time: 13.19, text: "ist egal ob tausende Leute dagegen sprechen" },
  { time: 16.16, text: "oder es vielleicht für unmöglich halten" },
  { time: 17.23, text: "du kannst nicht kontrollieren was andere denken" },
  { time: 19.18, text: "was andere glauben" },
  { time: 20.12, text: "was andere tun wo du reingeboren bist" },
  { time: 22.04, text: "was für ein Start du hast" },
  { time: 23.06, text: "auf welche Ressourcen du Zugriff hast" },
  { time: 24.18, text: "aber was du kontrollieren kannst ist dein Handeln" },
  { time: 26.15, text: "ihr dürft nicht aufhören zu kämpfen" },
  { time: 28.02, text: "macht einfach weiter egal wie doll es weh tut" },
  { time: 29.21, text: "egal wie die Leute lachen" },
  { time: 30.25, text: "egal" },
  { time: 31.08, text: "welche Menschen euch so unfassbare Schmerzen zufügen" },
  { time: 34.01, text: "macht einfach weiter und irgendwann kommt der Moment" },
  { time: 36.16, text: "lasst euch von niemanden einreden" },
  { time: 37.24, text: "dass wir etwas nicht schaffen können niemals" },
  { time: 39.20, text: "egal was auch passiert egal welche Tiefschläge" },
  { time: 42.06, text: "egal welche Verletzung" },
  { time: 43.12, text: "egal welche Niederlage wir können auf alles schaffen" },
  { time: 45.30, text: "lasst euch niemals von" },
  { time: 46.28, text: "wenn irgendwelche Leute euch kolpern" },
  { time: 48.09, text: "niemals" },
  { time: 49.11, text: "glaubt an euch selber und ihr könnt alles erreichen" },
  { time: 51.09, text: "irgendjemand da oben sieht das was ihr macht" },
  { time: 53.26, text: "und gibt euch das zurück was ihr verdient habt" },
  { time: 56.07, text: "ihr schafft das" },
  { time: 56.27, text: "ihr könnt mehr aus eurem Leben machen" },
  { time: 58.04, text: "egal wo ihr herkommt" },
  { time: 59.01, text: "wenn andere was nicht können" },
  { time: 60.08, text: "wollen sie dir immer einreden" },
  { time: 61.16, text: "dass du es auch nicht kannst" },
  { time: 62.26, text: "wenn du was willst dann mach es" }
];

/* =========================
   FOKUS-KARTEN = MENÜ-ORDNER
========================= */
document.querySelectorAll(".focus-card").forEach(card => {
  card.onclick = () => {
    const target = card.dataset.target;

    pauseMusic();
    activeSection = target;

    if (target === "about") playMusic("assets/audio/entspannt.mp3");
    if (target === "story") playMusic("assets/audio/story.mp3");
    if (target === "info") playMusic("assets/audio/entferne.m4a");

    openOverlay(target);
  };
});
});

let lastLine = "";
/* =========================
   STORY TEXT SYNC
========================= */

storyMusic.addEventListener("timeupdate", () => {
  if (typeof storyIsOpen === "undefined" || !storyIsOpen || !storyTarget) return;


  const t = storyMusic.currentTime;
  for (let i = storyScript.length - 1; i >= 0; i--) {
    if (t >= storyScript[i].time) {
      if (storyScript[i].text !== lastLine) {
        lastLine = storyScript[i].text;
        storyTarget.textContent = lastLine;
      }
      break;
    }
  }
});

/* =========================
   QUICK DOCK LOGIK
========================= */
document.querySelectorAll("#quickDock button").forEach(btn => {
  btn.onclick = () => {
    const target = btn.dataset.target;

    pauseMusic();        // exakt wie im Menü
    menu.classList.remove("open");
    openOverlay(target);
  };
});

/* =========================
   FOKUS ORDNER LOGIK
========================= */
document.querySelectorAll(".focus-card").forEach(card => {
  card.onclick = () => {
    const target = card.dataset.target;

    pauseMusic();          // sauberer Übergang
    menu.classList.remove("open");
    openOverlay(target);
  };
});
