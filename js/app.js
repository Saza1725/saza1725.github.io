document.addEventListener("DOMContentLoaded", () => {

  /* ==================================================
     BASIS / DOM
  ================================================== */
  const $ = (id) => document.getElementById(id);

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


  /* ==================================================
     HELFER
  ================================================== */
  const safe = (el, fn) => el && fn(el);

  /* ==================================================
     UHR / DATUM
  ================================================== */
  function updateTime() {
    if (!timeEl) return;

    const now = new Date();

    timeEl.textContent = now.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    safe(weekdayEl, el =>
      el.textContent = now.toLocaleDateString("de-DE", { weekday: "long" })
    );

    safe(dateEl, el =>
      el.textContent = now.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      })
    );
  }

  updateTime();
  setInterval(updateTime, 1000);

  /* ==================================================
     TAGESZITAT
  ================================================== */
  async function loadDailyQuote() {
    if (!dailyQuoteBox) return;

    try {
      const res = await fetch("data/tageszeit.json");
      if (!res.ok) throw new Error("tageszeit.json fehlt");

      const data = await res.json();
      if (!Array.isArray(data.quotes)) throw new Error("quotes ist kein Array");

      dailyQuoteBox.textContent =
        data.quotes[Math.floor(Math.random() * data.quotes.length)];

    } catch (err) {
      console.error(err);
      dailyQuoteBox.textContent =
        "Heute zählt nicht das perfekte Zitat – sondern dein eigener Gedanke.";
    }
  }

  loadDailyQuote();

  /* ==================================================
     DAILY IMPULS (MORGEN / MITTAG / ABEND)
  ================================================== */
  async function loadDailyText(time) {
    if (!dailyTextBox) return;

    try {
      const res = await fetch("data/dailyTexts.json");
      if (!res.ok) throw new Error("dailyTexts.json fehlt");

      const data = await res.json();
      if (!Array.isArray(data[time])) throw new Error("Keine Texte für " + time);

      const list = data[time];
      dailyTextBox.textContent =
        list[Math.floor(Math.random() * list.length)];

    } catch (err) {
      console.error(err);
      dailyTextBox.textContent =
        "Heute darfst du dir selbst einen Impuls geben.";
    }
  }

  document.querySelectorAll(".buttons button").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".buttons button")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
      const time = btn.dataset.time;

      localStorage.setItem("daytimeManual", time);
      loadDailyText(time);
    });
  });

  /* ==================================================
     FOKUS
  ================================================== */
  if (focusInput && focusCard) {
    const savedFocus = localStorage.getItem("focus");

    if (savedFocus) {
      focusInput.value = savedFocus;
      focusCard.classList.add("active");
    }

    focusInput.addEventListener("input", () => {
      localStorage.setItem("focus", focusInput.value);
      focusCard.classList.toggle("active", focusInput.value.trim() !== "");
    });
  }

  /* ==================================================
     STATISTIK
  ================================================== */
  function updateStats() {
    if (!statsBox) return;
    const count = +(localStorage.getItem("slidesToday") || 0);
    statsBox.textContent = `Heute ${count} Folien gelesen`;
  }
  updateStats();

  /* ==================================================
     MENÜ
  ================================================== */
  safe(menuButton, btn => {
    btn.addEventListener("click", () => {
      menu.classList.toggle("open");
    });
  });

  document.querySelectorAll("#menu button[data-target]").forEach(btn => {
    btn.addEventListener("click", () => {

      document.querySelectorAll("#menu button")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
      menu.classList.remove("open");

      openOverlay(btn.dataset.target);
    });
  });

  safe(homeBtn, btn => {
    btn.addEventListener("click", () => {
      menu.classList.remove("open");
      overlay.style.display = "none";
      overlayContent.innerHTML = "";
    });
  });

  /* ==================================================
     OVERLAY
  ================================================== */
  function openOverlay(type) {
    if (!overlay || !overlayContent) return;

    overlay.style.display = "block";
    overlayContent.innerHTML = "";

    if (type === "about") loadAbout();
    if (type === "thoughts") loadThoughts();
    if (type === "info") loadInfo();
    if (type === "archive") loadArchive();
    if (type === "quotes") loadQuotes();




  }

  overlay.addEventListener("click", e => {
    if (e.target === overlay) {
      overlay.style.display = "none";
      overlayContent.innerHTML = "";
    }
  });

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
});

/* =====================================
INTRO BILD LOGIK
===================================== */
const introOverlay = document.getElementById("introOverlay");
const introStart = document.getElementById("introStart");

if (introOverlay && introStart) {
  introStart.onclick = () => {
    introOverlay.classList.add("fade-out");

    setTimeout(() => {
      introOverlay.style.display = "none";
      introOverlay.remove();
    }, 1200);
  };
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

  /* ==================================================
     ZITATE
  ================================================== */
  async function loadQuotes() {
    const res = await fetch("data/zitate.json");
    const data = await res.json();

    let categoryIndex = null;
    let cardIndex = 0;

    showCategories();

    function showCategories() {
      overlayContent.innerHTML = `
        <h2>${data.title}</h2>
        <div class="folder-grid">
          ${data.categories.map((c, i) => `
            <div class="folder-card" data-i="${i}">
              <h3>${c.name}</h3>
              <div class="folder-progress">
                ${c.quotes.length} Zitate
              </div>
            </div>
          `).join("")}
        </div>
      `;

      overlayContent.querySelectorAll(".folder-card").forEach(card => {
        card.onclick = () => {
          categoryIndex = +card.dataset.i;
          cardIndex = 0;
          showCards();
        };
      });
    }

    function showCards() {
      const category = data.categories[categoryIndex];
      const pairs = [];

      for (let i = 0; i < category.quotes.length; i += 2) {
        pairs.push(category.quotes.slice(i, i + 2));
      }

      const pair = pairs[cardIndex];

      overlayContent.innerHTML = `
        <button class="back">← Kategorien</button>

        <div class="card-ui">
          ${pair.map(q => `
            <blockquote class="quote-text">„${q}“</blockquote>
          `).join("")}

          <div class="nav">
            <button id="prev" ${cardIndex === 0 ? "disabled" : ""}>←</button>
            <span>${cardIndex + 1} / ${pairs.length}</span>
            <button id="next" ${cardIndex === pairs.length - 1 ? "disabled" : ""}>→</button>
          </div>
        </div>
      `;

      document.querySelector(".back").onclick = showCategories;
      document.getElementById("prev").onclick = () => {
        if (cardIndex > 0) {
          cardIndex--;
          showCards();
        }
      };
      document.getElementById("next").onclick = () => {
        if (cardIndex < pairs.length - 1) {
          cardIndex++;
          showCards();
        }
      };
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
/* =====================================
MUSIC PLAYER LOGIK
===================================== */
document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bgMusic");
  const playBtn = document.getElementById("musicPlay");
  const pauseBtn = document.getElementById("musicPause");
  const stopBtn = document.getElementById("musicStop");

  if (!audio || !playBtn || !pauseBtn || !stopBtn) return;

 playBtn.addEventListener("click", async () => {
  try {
    await audio.play();
    console.log("AUDIO SPIELT");
  } catch (e) {
    console.error("AUDIO FEHLER:", e);
  }
});


  pauseBtn.addEventListener("click", () => {
    audio.pause();
  });

  stopBtn.addEventListener("click", () => {
    audio.pause();
    audio.currentTime = 0;
  });

  /* Nach Ende → wieder von vorn spielbar */
  audio.addEventListener("ended", () => {
    audio.currentTime = 0;
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bgMusic");
  const playBtn = document.getElementById("musicPlay");
  const pauseBtn = document.getElementById("musicPause");
  const stopBtn = document.getElementById("musicStop");

  if (!audio) {
    console.error("❌ Audio nicht gefunden");
    return;
  }

  playBtn.onclick = (on) => {
    audio.volume = 1;
    

    audio.play()
      .then(() => console.log("🎵 Musik läuft"))
      .catch(e => console.error("Audio Fehler:", e));
  };

  pauseBtn.onclick = () => audio.pause();

  stopBtn.onclick = () => {
    audio.pause();
    audio.currentTime = 0;
  };

  audio.onended = () => {
    audio.currentTime = 0;
  };
});

