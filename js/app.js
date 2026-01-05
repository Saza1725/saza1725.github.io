document.addEventListener("DOMContentLoaded", () => {

  /* ==================================================
     BASIS / DOM
  ================================================== */
  const $ = (id) => document.getElementById(id);

  const menu = $("menu");
  const menuButton = $("menuButton");

  const overlay = $("overlay");
  const overlayContent = $("overlayContent");
  const closeOverlay = $("closeOverlay");

  const timeEl = $("time");
  const weekdayEl = $("weekday");
  const dateEl = $("date");

  const dailyQuoteBox = $("dailyQuoteBox");
  const dailyTextBox = $("dailyTextBox");
  const dailyTextBtn = $("dailyTextBtn");

  const focusInput = $("dailyFocusInput");
  const focusCard = document.querySelector(".card");
  const statsBox = $("personalQuoteDisplay");

  /* ==================================================
     HELFER
  ================================================== */
  const todayKey = () =>
    new Date().toISOString().split("T")[0];

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
     TAGESZITAT (24h)
  ================================================== */
  async function loadDailyQuote() {
    if (!dailyQuoteBox) return;

    const today = todayKey();
    const savedDay = localStorage.getItem("dailyQuoteDay");
    const savedQuote = localStorage.getItem("dailyQuoteText");

    if (savedDay === today && savedQuote) {
      dailyQuoteBox.textContent = savedQuote;
      return;
    }

    try {
      const res = await fetch("./data/tageszeit.json");
      const quotes = await res.json();
      const quote = quotes[Math.floor(Math.random() * quotes.length)];

      dailyQuoteBox.textContent = quote;
      localStorage.setItem("dailyQuoteDay", today);
      localStorage.setItem("dailyQuoteText", quote);
    } catch (e) {
      dailyQuoteBox.textContent = "Heute zählt nur dein eigener Gedanke.";
      console.error("Tageszitat Fehler:", e);
    }
  }

  loadDailyQuote();

  /* ==================================================
     DAILY IMPULS
  ================================================== */
  async function loadDailyText() {
    if (!dailyTextBox) return;

    try {
      const res = await fetch("./data/dailyTexts.json");
      const texts = await res.json();
      dailyTextBox.textContent =
        texts[Math.floor(Math.random() * texts.length)];
    } catch (e) {
      dailyTextBox.textContent = "Kein Impuls verfügbar.";
    }
  }

  safe(dailyTextBtn, btn =>
    btn.addEventListener("click", loadDailyText)
  );

  /* ==================================================
     TAGESZEIT BUTTONS
  ================================================== */
  document.querySelectorAll(".buttons button").forEach(btn => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".buttons button")
        .forEach(b => b.classList.remove("active"));

      btn.classList.add("active");
      localStorage.setItem("daytimeManual", btn.dataset.time);
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
      focusCard.classList.toggle(
        "active",
        focusInput.value.trim() !== ""
      );
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
      if (!menu) return;
      menu.style.right =
        menu.style.right === "0px" ? "-240px" : "0px";
    });
  });

  document.querySelectorAll("#menu button").forEach(btn => {
    btn.addEventListener("click", () => {
      if (menu) menu.style.right = "-240px";
      openOverlay(btn.dataset.target);
    });
  });

  /* ==================================================
     OVERLAY
  ================================================== */
  function openOverlay(type) {
    if (!overlay || !overlayContent) return;

    overlay.style.display = "block";
    document.body.style.overflow = "hidden";
    overlayContent.innerHTML = "";

    if (type === "about") loadAbout();
    if (type === "thoughts") loadThoughts();
  }

  safe(closeOverlay, btn =>
    btn.addEventListener("click", () => {
      overlay.style.display = "none";
      document.body.style.overflow = "";
    })
  );

  /* ==================================================
     ÜBER MICH
  ================================================== */
  async function loadAbout() {
  const res = await fetch("./data/personalSlides.json");
  const data = await res.json();

  let currentSection = null;
  let currentSlide = 0;

  showSections();

  /* ===============================
     1️⃣ ORDNERÜBERSICHT
  =============================== */
  function showSections() {
    currentSection = null;
    currentSlide = 0;

    overlayContent.innerHTML = `
      <h2>${data.title}</h2>
      <div class="folder-grid">
        ${data.sections.map((section, i) => `
          <div class="folder-card" data-index="${i}">
            <h3>${section.title}</h3>
            <div class="folder-progress">
              ${section.slides.length} Karten
            </div>
          </div>
        `).join("")}
      </div>
    `;

    overlayContent.querySelectorAll(".folder-card").forEach(card => {
      card.addEventListener("click", () => {
        currentSection = Number(card.dataset.index);
        currentSlide = 0;
        showSlide();
      });
    });
  }

  /* ===============================
     2️⃣ KARTENANSICHT
  =============================== */
  function showSlide() {
    const section = data.sections[currentSection];
    const slide = section.slides[currentSlide];

    overlayContent.innerHTML = `
      <button class="back">← Über mich</button>

      <div class="slide">
        <h3>${slide.title}</h3>
        <p>${slide.text.replace(/\n/g, "<br>")}</p>
      </div>

      <div class="nav">
        <button id="prev" ${currentSlide === 0 ? "disabled" : ""}>←</button>
        <span>
          ${currentSlide + 1} / ${section.slides.length}
        </span>
        <button id="next" ${currentSlide === section.slides.length - 1 ? "disabled" : ""}>→</button>
      </div>
    `;

    // Statistik
    localStorage.setItem(
      "slidesToday",
      +(localStorage.getItem("slidesToday") || 0) + 1
    );
    updateStats();

    // Events
    overlayContent.querySelector(".back").onclick = showSections;

    const prevBtn = document.getElementById("prev");
    const nextBtn = document.getElementById("next");

    if (prevBtn) {
      prevBtn.onclick = () => {
        if (currentSlide > 0) {
          currentSlide--;
          showSlide();
        }
      };
    }

    if (nextBtn) {
      nextBtn.onclick = () => {
        if (currentSlide < section.slides.length - 1) {
          currentSlide++;
          showSlide();
        }
      };
    }
  }
}

  /* ==================================================
     GEDANKEN
  ================================================== */
  async function loadThoughts() {
    const res = await fetch("./data/thoughtsSlides.json");
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
