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
/* =====================================
INTRO VIDEO LOGIK
===================================== */
const introOverlay = document.getElementById("introOverlay");
const introVideo = document.getElementById("introVideo");
const introStart = document.getElementById("introStart");

if (introOverlay && introVideo && introStart) {

  introStart.addEventListener("click", () => {
    introVideo.play();
    introStart.style.display = "none";
  });

  introVideo.addEventListener("ended", () => {
    introOverlay.classList.add("fade-out");

    setTimeout(() => {
      introOverlay.remove();
    }, 1200);
  });
}

});
