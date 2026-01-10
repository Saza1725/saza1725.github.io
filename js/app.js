const $ = (id) => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {

  

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
      menu.classList.remove("open");
      openOverlay(btn.dataset.target);
    };
  });

  homeBtn.onclick = () => {
    menu.classList.remove("open");
    overlay.style.display = "none";
    overlayContent.innerHTML = "";
  };

  overlay.onclick = e => {
    if (e.target === overlay) {
      overlay.style.display = "none";
      overlayContent.innerHTML = "";
    }
  };

  /* =========================
     OVERLAY DISPATCHER
  ========================= */
  function openOverlay(type) {
    overlay.style.display = "block";
    overlayContent.innerHTML = "";

    if (type === "about") loadAbout();
    if (type === "thoughts") loadThoughts();
    if (type === "info") loadInfo();
    if (type === "archive") loadArchive();
    if (type === "quotes") loadQuotes();
    if (type === "story") loadMeineGeschichte();
  }

 /* ==================================================
   MENÜ
================================================== */

// Menü öffnen / schließen
menuButton.onclick = () => {
  menu.classList.toggle("open");
};

// Menü-Navigation
document.querySelectorAll("#menu button[data-target]").forEach(btn => {
  btn.onclick = () => {

    // Active State
    document.querySelectorAll("#menu button")
      .forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    // Menü schließen
    menu.classList.remove("open");

    // Overlay öffnen
    openOverlay(btn.dataset.target);
  };
});

// Home / Hauptseite
homeBtn.onclick = () => {
  menu.classList.remove("open");
  overlay.style.display = "none";
  overlayContent.innerHTML = "";
};


  /* ==================================================
     OVERLAY
  ================================================== */
 function openOverlay(type) {
  overlay.style.display = "block";
  overlayContent.innerHTML = "";

  if (type === "about") loadAbout();
  if (type === "thoughts") loadThoughts();
  if (type === "info") loadInfo();
  if (type === "archive") loadArchive();
  if (type === "quotes") loadQuotes();
  if (type === "story") loadMeineGeschichte();
}


  
  
  overlay.onclick = (e) => {
    if (e.target === overlay) {
      overlay.style.display = "none";
      overlayContent.innerHTML = "";
    }
  };
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
     GEDANKEN
  ================================================== */
  async function loadThoughts() {
    const res = await fetch("data/thoughtsSlides.json");
    const data = await res.json();

    let section = null;
    let slide = 0;

    showSections();

    function showSections() {
      overlayContent.innerHTML = `
        <h2>${data.title}</h2>
        <div class="folder-grid">
          ${data.sections.map((s, i) => `
            <div class="folder-card" data-i="${i}">
              <h3>${s.title}</h3>
            </div>
          `).join("")}
        </div>
      `;

      overlayContent.querySelectorAll(".folder-card").forEach(card => {
        card.onclick = () => {
          section = +card.dataset.i;
          slide = 0;
          showSlide();
        };
      });
    }

    function showSlide() {
      const slides = data.sections[section].slides;
      const s = slides[slide];
      const empty = !s.text || !s.text.trim();

      overlayContent.innerHTML = `
        <button class="back">← Themen</button>
        <div class="slide ${empty ? "empty" : ""}">
          <h3>${s.title}</h3>
          <p>${empty ? "" : s.text.replace(/\n/g, "<br>")}</p>
        </div>
        <div class="nav">
          <button id="prev" ${slide === 0 ? "disabled" : ""}>←</button>
          <span>${slide + 1} / ${slides.length}</span>
          <button id="next" ${slide === slides.length - 1 ? "disabled" : ""}>→</button>
        </div>
      `;

      overlayContent.querySelector(".back").onclick = showSections;
      $("prev").onclick = () => slide-- > 0 && showSlide();
      $("next").onclick = () => slide++ < slides.length - 1 && showSlide();
    }
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

    function showEntry() {
      const [, entries] = folders[f];
      overlayContent.innerHTML = `
        <button class="back">← Meine Geschichte</button>
        <p>${entries[i]}</p>
        <div class="nav">
          <button id="prev" ${i === 0 ? "disabled" : ""}>←</button>
          <span>${i + 1} / ${entries.length}</span>
          <button id="next" ${i === entries.length - 1 ? "disabled" : ""}>→</button>
        </div>`;
      $(".back").onclick = showFolders;
      $("prev").onclick = () => { if (i > 0) { i--; showEntry(); } };
      $("next").onclick = () => { if (i < entries.length - 1) { i++; showEntry(); } };
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

      <div class="archive-month">
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
    let f = 0, i = 0;

    showFolders();

    function showFolders() {
      overlayContent.innerHTML = `
        <h2>Zitate</h2>
        <div class="folder-grid">
          ${folders.map(([n, q], x) => `
            <div class="folder-card" data-i="${x}">
              <h3>${n}</h3>
              <div class="folder-progress">${q.length} Zitate</div>
            </div>`).join("")}
        </div>`;
      overlayContent.querySelectorAll(".folder-card").forEach(c =>
        c.onclick = () => { f = +c.dataset.i; i = 0; showQuote(); }
      );
    }

    function showQuote() {
      const [, quotes] = folders[f];
      overlayContent.innerHTML = `
        <button class="back">← Ordner</button>
        <blockquote class="quote-text">„${quotes[i]}“</blockquote>
        <div class="nav">
          <button id="prev" ${i === 0 ? "disabled" : ""}>←</button>
          <span>${i + 1} / ${quotes.length}</span>
          <button id="next" ${i === quotes.length - 1 ? "disabled" : ""}>→</button>
        </div>`;
      $(".back").onclick = showFolders;
      $("prev").onclick = () => { if (i > 0) { i--; showQuote(); } };
      $("next").onclick = () => { if (i < quotes.length - 1) { i++; showQuote(); } };
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
     MUSIKPLAYER
  ========================= */
  const audio = $("bgMusic");
  $("musicPlay").onclick = () => audio.play();
  $("musicPause").onclick = () => audio.pause();
  $("musicStop").onclick = () => { audio.pause(); audio.currentTime = 0; };
});