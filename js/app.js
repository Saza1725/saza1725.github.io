document.addEventListener("DOMContentLoaded", () => {

  /* =========================
  BASIS
  ========================= */
  const menu = document.getElementById("menu");
  const menuButton = document.getElementById("menuButton");
  const overlay = document.getElementById("overlay");
  const overlayContent = document.getElementById("overlayContent");
  const closeOverlay = document.getElementById("closeOverlay");

  const dailyQuoteBox = document.getElementById("dailyQuoteBox");
  const dailyTextBox = document.getElementById("dailyTextBox");
  const dailyTextBtn = document.getElementById("dailyTextBtn");

  const focusInput = document.getElementById("dailyFocusInput");
  const focusCard = document.querySelector(".card");
  const statsBox = document.getElementById("personalQuoteDisplay");

  const weekdayEl = document.getElementById("weekday");
  const dateEl = document.getElementById("date");
  const timeEl = document.getElementById("time");
  const daytimeEl = document.getElementById("daytime");

  /* =========================
  HELFER
  ========================= */
  function todayKey() {
    return new Date().toISOString().split("T")[0];
  }

  /* =========================
  UHR / DATUM
  ========================= */
  function updateTime() {
    const now = new Date();

    timeEl.textContent = now.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });

    weekdayEl.textContent =
      now.toLocaleDateString("de-DE", { weekday: "long" });

    dateEl.textContent =
      now.toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });

    const h = now.getHours();
    daytimeEl.textContent = h < 11 ? "Morgen" : h < 17 ? "Mittag" : "Abend";
  }

  updateTime();
  setInterval(updateTime, 1000);

  /* =========================
  TAGESZITAT (24h)
  ========================= */
  async function loadDailyQuote() {
    if (!dailyQuoteBox) return;

    const today = todayKey();
    const savedDay = localStorage.getItem("dailyQuoteDay");
    const savedQuote = localStorage.getItem("dailyQuoteText");

    if (savedDay === today && savedQuote) {
      dailyQuoteBox.textContent = savedQuote;
      return;
    }

    const res = await fetch("./data/tageszeit.json");
    const quotes = await res.json();
    const quote = quotes[Math.floor(Math.random() * quotes.length)];

    dailyQuoteBox.textContent = quote;
    localStorage.setItem("dailyQuoteDay", today);
    localStorage.setItem("dailyQuoteText", quote);
  }

  loadDailyQuote();

  /* =========================
  DAILY IMPULS (BUTTON)
  ========================= */
  async function loadDailyText() {
    if (!dailyTextBox) return;

    const res = await fetch("./data/dailyTexts.json");
    const texts = await res.json();
    const text = texts[Math.floor(Math.random() * texts.length)];

    dailyTextBox.textContent = text;
  }

  dailyTextBtn?.addEventListener("click", loadDailyText);

  /* =========================
  TAGESRESET
  ========================= */
  if (localStorage.getItem("lastDay") !== todayKey()) {
    localStorage.removeItem("focus");
    localStorage.removeItem("slidesToday");
    localStorage.setItem("lastDay", todayKey());
  }

  /* =========================
  MENÜ
  ========================= */
  menuButton.onclick = () => {
    menu.style.right = menu.style.right === "0px" ? "-240px" : "0px";
  };

  document.querySelectorAll("#menu button").forEach(btn => {
    btn.onclick = () => {
      menu.style.right = "-240px";
      openOverlay(btn.dataset.target);
    };
  });

  /* =========================
  FOKUS
  ========================= */
  const savedFocus = localStorage.getItem("focus");
  if (savedFocus) {
    focusInput.value = savedFocus;
    focusCard.classList.add("active");
  }

  focusInput.oninput = () => {
    localStorage.setItem("focus", focusInput.value);
    focusCard.classList.toggle("active", focusInput.value.trim() !== "");
  };

  /* =========================
  STATISTIK
  ========================= */
  function updateStats() {
    const count = +(localStorage.getItem("slidesToday") || 0);
    statsBox.textContent = `Heute ${count} Folien gelesen`;
  }
  updateStats();

  /* =========================
  OVERLAY
  ========================= */
  function openOverlay(type) {
    overlay.style.display = "block";
    document.body.style.overflow = "hidden";
    overlayContent.innerHTML = "";

    if (type === "about") loadAbout();
    if (type === "thoughts") loadThoughts();
  }

  closeOverlay.onclick = () => {
    overlay.style.display = "none";
    document.body.style.overflow = "";
  };

  /* =========================
  ÜBER MICH
  ========================= */
  async function loadAbout() {
    const res = await fetch("./data/personalSlides.json");
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

      localStorage.setItem("slidesToday",
        +(localStorage.getItem("slidesToday") || 0) + 1
      );
      updateStats();

      overlayContent.innerHTML = `
        <button class="back">← Themen</button>
        <div class="slide">
          <h3>${s.title}</h3>
          <p>${s.text.replace(/\n/g, "<br>")}</p>
        </div>
        <div class="nav">
          <button id="prev" ${slide === 0 ? "disabled" : ""}>←</button>
          <span>${slide + 1} / ${slides.length}</span>
          <button id="next" ${slide === slides.length - 1 ? "disabled" : ""}>→</button>
        </div>
      `;

      overlayContent.querySelector(".back").onclick = showSections;
      document.getElementById("prev").onclick = () => slide-- >= 0 && showSlide();
      document.getElementById("next").onclick = () => slide++ < slides.length && showSlide();
    }
  }

  /* =========================
  GEDANKEN
  ========================= */
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
      document.getElementById("prev").onclick = () => slide-- >= 0 && showSlide();
      document.getElementById("next").onclick = () => slide++ < slides.length && showSlide();
    }
  }

});
