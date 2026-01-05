document.addEventListener("DOMContentLoaded", () => {

  const menu = document.getElementById("menu");
  const menuButton = document.getElementById("menuButton");
  const overlay = document.getElementById("overlay");
  const overlayContent = document.getElementById("overlayContent");
  const closeOverlay = document.getElementById("closeOverlay");
  const focusInput = document.getElementById("dailyFocusInput");
  const focusCard = document.querySelector(".card");

  /* =========================
  ZEIT / DATUM
  ========================= */
  function updateTime() {
    const now = new Date();

    document.getElementById("weekday").textContent =
      now.toLocaleDateString("de-DE", { weekday: "long" });

    document.getElementById("date").textContent =
      now.toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" });

    document.getElementById("time").textContent =
      now.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });

    const h = now.getHours();
    document.getElementById("daytime").textContent =
      h < 11 ? "Morgen" : h < 17 ? "Mittag" : "Abend";
  }

  updateTime();
  setInterval(updateTime, 60000);

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
  const savedFocus = localStorage.getItem("dailyFocus");
  if (savedFocus) {
    focusInput.value = savedFocus;
    focusCard.classList.add("active");
  }

  focusInput.oninput = () => {
    localStorage.setItem("dailyFocus", focusInput.value);
    focusCard.classList.toggle("active", focusInput.value.trim() !== "");
  };

  /* =========================
  TAGESZEIT
  ========================= */
  document.querySelectorAll(".buttons button").forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll(".buttons button")
        .forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      localStorage.setItem("daytime", btn.dataset.time);
    };
  });

  const savedTime = localStorage.getItem("daytime");
  if (savedTime) {
    const btn = document.querySelector(`.buttons button[data-time="${savedTime}"]`);
    if (btn) btn.classList.add("active");
  }

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
          ${data.folders.map((f, i) => {
            const saved = localStorage.getItem("slide_" + i) || 0;
            return `
              <div class="folder-card" data-index="${i}">
                <strong>${f.name}</strong>
                <div class="folder-progress">${+saved + 1} / ${f.slides.length}</div>
              </div>
            `;
          }).join("")}
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
