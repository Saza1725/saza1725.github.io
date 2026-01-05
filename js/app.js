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

  const weekdayEl = document.getElementById("weekday");
  const dateEl = document.getElementById("date");
  const timeEl = document.getElementById("time");
  const daytimeEl = document.getElementById("daytime");

  /* =========================
  DATUM / ZEIT (FIX!)
  ========================= */
  function todayKey() {
    return new Date().toISOString().split("T")[0];
  }

  function updateTime() {
    const now = new Date();

    weekdayEl.textContent = now.toLocaleDateString("de-DE", { weekday: "long" });
    dateEl.textContent = now.toLocaleDateString("de-DE", { dateStyle: "long" });
    timeEl.textContent = now.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit"
    });

    const h = now.getHours();
    daytimeEl.textContent = h < 11 ? "Morgen" : h < 17 ? "Mittag" : "Abend";
  }

  updateTime();
  setInterval(updateTime, 60000);

  /* =========================
  TAGESRESET (MITTERNACHT)
  ========================= */
  const lastDay = localStorage.getItem("lastDay");
  if (lastDay !== todayKey()) {
    localStorage.clear();
    localStorage.setItem("lastDay", todayKey());
  }

  /* =========================
  MENÜ (JETZT FUNKTIONIERT ES)
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
  FOKUS (PERSISTENT)
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
  TAGESZEIT BUTTONS
  ========================= */
  document.querySelectorAll(".buttons button").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".buttons button")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      localStorage.setItem("daytimeManual", btn.dataset.time);
    };
  });

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
  }

  function closeOverlayFn() {
    overlay.style.display = "none";
    document.body.style.overflow = "";
  }

  closeOverlay.onclick = closeOverlayFn;

  /* =========================
  ORDNER / SLIDES
  ========================= */
  async function loadAbout() {
    const res = await fetch("./data/personalSlides.json");
    const data = await res.json();

    let currentFolder = null;
    let currentSlide = 0;

    showFolders();

    function showFolders() {
      overlayContent.innerHTML = `
        <h2>${data.title}</h2>
        <div class="folder-grid">
          ${data.folders.map((f, i) => `
            <div class="folder-card" data-index="${i}">
              ${f.name}
            </div>
          `).join("")}
        </div>
      `;

      overlayContent.querySelectorAll(".folder-card").forEach(card => {
        card.onclick = () => {
          currentFolder = +card.dataset.index;
          currentSlide = +(localStorage.getItem("slide_" + currentFolder) || 0);
          showSlide();
        };
      });
    }

    function showSlide() {
      const slides = data.folders[currentFolder].slides;
      const slide = slides[currentSlide];

      localStorage.setItem("slide_" + currentFolder, currentSlide);
      localStorage.setItem(
        "slidesToday",
        +(localStorage.getItem("slidesToday") || 0) + 1
      );
      updateStats();

      overlayContent.innerHTML = `
        <button class="back">← Ordner</button>
        <h3>${slide.title}</h3>
        <p>${slide.text}</p>

        <div class="nav">
          <button id="prev" ${currentSlide === 0 ? "disabled" : ""}>←</button>
          <span>${currentSlide + 1} / ${slides.length}</span>
          <button id="next" ${currentSlide === slides.length - 1 ? "disabled" : ""}>→</button>
        </div>
      `;

      overlayContent.querySelector(".back").onclick = showFolders;

      document.getElementById("prev")?.onclick = () => {
        if (currentSlide > 0) {
          currentSlide--;
          showSlide();
        }
      };

      document.getElementById("next")?.onclick = () => {
        if (currentSlide < slides.length - 1) {
          currentSlide++;
          showSlide();
        }
      };
    }

    /* =========================
    TASTATUR
    ========================= */
    document.onkeydown = e => {
      if (overlay.style.display !== "block") return;

      if (e.key === "Escape") closeOverlayFn();
      if (e.key === "ArrowLeft" && currentSlide > 0) {
        currentSlide--;
        showSlide();
      }
      if (e.key === "ArrowRight") {
        const max = data.folders[currentFolder].slides.length - 1;
        if (currentSlide < max) {
          currentSlide++;
          showSlide();
        }
      }
    };
  }

});
