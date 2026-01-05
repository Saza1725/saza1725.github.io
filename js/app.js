document.addEventListener("DOMContentLoaded", () => {

  /* =========================
  BASIS
  ========================= */
  const menu = document.getElementById("menu");
  const menuButton = document.getElementById("menuButton");
  const overlay = document.getElementById("overlay");
  const overlayContent = document.getElementById("overlayContent");
  const closeOverlay = document.getElementById("closeOverlay");

  const focusInput = document.getElementById("dailyFocusInput");
  const focusCard = document.querySelector(".card");
  const statsBox = document.getElementById("personalQuoteDisplay");

  /* =========================
  DIGITALE ZEIT-ELEMENTE
  (NUR VARIABLENNAMEN GEÄNDERT)
  ========================= */
  const weekdayEl = document.getElementById("weekday");
  const dateEl = document.getElementById("date");
  const timeEl = document.getElementById("time");
  const daytimeEl = document.getElementById("daytime");

  /* =========================
  DATUM / ZEIT
  ========================= */
  function todayKey() {
    return new Date().toISOString().split("T")[0];
  }

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
}
setInterval(updateTime, 1000);

async function loadDailyQuote() {
  const today = new Date().toISOString().split("T")[0];
  const savedDay = localStorage.getItem("dailyQuoteDay");

  if (savedDay === today) {
    dailyQuoteBox.textContent =
      localStorage.getItem("dailyQuoteText");
    return;
  }

  const res = await fetch("./data/tageszeit.json");
  const quotes = await res.json();

  const quote =
    quotes[Math.floor(Math.random() * quotes.length)];

  dailyQuoteBox.textContent = quote;

  localStorage.setItem("dailyQuoteDay", today);
  localStorage.setItem("dailyQuoteText", quote);
}

loadDailyQuote();


  /* =========================
  TAGESRESET
  ========================= */
  const lastDay = localStorage.getItem("lastDay");
  if (lastDay !== todayKey()) {
    localStorage.removeItem("focus");
    localStorage.removeItem("daytimeManual");
    localStorage.removeItem("slidesToday");
    localStorage.setItem("lastDay", todayKey());
  }

  /* =========================
  MENÜ (JETZT FUNKTIONIERT ES)
  ========================= */
  menuButton.onclick = () => {
    menu.style.right =
      menu.style.right === "0px" ? "-240px" : "0px";
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
    focusCard.classList.toggle(
      "active",
      focusInput.value.trim() !== ""
    );
  };

  /* =========================
  STATISTIK
  ========================= */
  function updateStats() {
    const count =
      +(localStorage.getItem("slidesToday") || 0);
    statsBox.textContent =
      `Heute ${count} Folien gelesen`;
  }

  updateStats();

  /* =========================
  OVERLAY
  ========================= */
  function openOverlay(type) {
  overlay.style.display = "block";
  document.body.style.overflow = "hidden";
  overlayContent.innerHTML = "";

  if (type === "about") {
    loadAbout();
  }

  if (type === "thoughts") {
    loadThoughts();
  }
}

  function closeOverlayFn() {
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  closeOverlay.onclick = closeOverlayFn;

  async function loadAbout() {
  const res = await fetch("./data/personalSlides.json");
  const data = await res.json();

  let currentSection = null;
  let currentSlide = 0;

  showSections();

  function showSections() {
    overlayContent.innerHTML = `
      <h2>${data.title}</h2>
      <div class="folder-grid">
        ${data.sections.map((section, i) => `
          <div class="folder-card" data-index="${i}">
            <h3>${section.title}</h3>
          </div>
        `).join("")}
      </div>
    `;

    overlayContent.querySelectorAll(".folder-card").forEach(card => {
      card.onclick = () => {
        currentSection = +card.dataset.index;
        currentSlide = 0;
        showSlide();
      };
    });
  }

  function showSlide() {
    const slides = data.sections[currentSection].slides;
    const slide = slides[currentSlide];

    overlayContent.innerHTML = `
      <button class="back">← Themen</button>
      <div class="slide">
        <h3>${slide.title}</h3>
        <p>${slide.text.replace(/\n/g, "<br>")}</p>
      </div>
      <div class="nav">
        <button id="prev" ${currentSlide === 0 ? "disabled" : ""}>←</button>
        <span>${currentSlide + 1} / ${slides.length}</span>
        <button id="next" ${currentSlide === slides.length - 1 ? "disabled" : ""}>→</button>
      </div>
    `;

    overlayContent.querySelector(".back").onclick = showSections;

    document.getElementById("prev").onclick = () => {
      if (currentSlide > 0) {
        currentSlide--;
        showSlide();
      }
    };

    document.getElementById("next").onclick = () => {
      if (currentSlide < slides.length - 1) {
        currentSlide++;
        showSlide();
      }
    };
  }
}

  /* =========================
  ORDNER / SLIDES
  ========================= */
 async function loadThoughts() {
  const res = await fetch("./data/thoughtsSlides.json");
  const data = await res.json();

  let currentSection = null;
  let currentSlide = 0;

  showSections();

  /* ========= EBENE 1: UNTERORDNER ========= */
  function showSections() {
    overlayContent.innerHTML = `
      <h2>${data.title}</h2>
      <div class="folder-grid">
        ${data.sections.map((section, i) => {
          const readCount =
            +(localStorage.getItem("thoughts_read_" + i) || 0);
          const total = section.slides.length;

          return `
            <div class="folder-card" data-index="${i}">
              <h3>${section.title}</h3>
              <div class="folder-progress">
                ${readCount} / ${total} gelesen
              </div>
            </div>
          `;
        }).join("")}
      </div>
    `;

    overlayContent.querySelectorAll(".folder-card")
      .forEach(card => {
        card.onclick = () => {
          currentSection = +card.dataset.index;
          currentSlide = 0;
          showSlide();
        };
   });
  }

  /* ========= EBENE 2: CARDS ========= */
  function showSlide() {
    const slides = data.sections[currentSection].slides;
    const slide = slides[currentSlide];

    const key = "thoughts_read_" + currentSection;
    const alreadyRead = +(localStorage.getItem(key) || 0);
    if (currentSlide + 1 > alreadyRead) {
      localStorage.setItem(key, currentSlide + 1);
    }

    const isEmpty = !slide.text || slide.text.trim() === "";

    overlayContent.innerHTML = `
      <button class="back">← Themen</button>

      <div class="slide ${isEmpty ? "empty" : ""}">
        <h3>${slide.title}</h3>
        <p>${slide.text ? slide.text.replace(/\n/g, "<br>") : ""}</p>
      </div>

      <div class="nav">
        <button id="prev" ${currentSlide === 0 ? "disabled" : ""}>←</button>
        <span>${currentSlide + 1} / ${slides.length}</span>
        <button id="next" ${currentSlide === slides.length - 1 ? "disabled" : ""}>→</button>
      </div>
    `;

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
        if (currentSlide < slides.length - 1) {
          currentSlide++;
          showSlide();
        }
      };
    }
  }
}});

