document.addEventListener("DOMContentLoaded", () => {

  const menu = document.getElementById("menu");
  const menuButton = document.getElementById("menuButton");
  const overlay = document.getElementById("overlay");
  const overlayContent = document.getElementById("overlayContent");
  const closeOverlay = document.getElementById("closeOverlay");
  const focusInput = document.getElementById("dailyFocusInput");
  const focusCard = document.querySelector(".card");

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
  FOKUS (PERSISTENT)
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
  TAGESZEIT (PERSISTENT)
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
    else overlayContent.innerHTML = `<p>${type}</p>`;
  }

  closeOverlay.onclick = () => {
    overlay.style.display = "none";
    document.body.style.overflow = "";
  };

  /* =========================
  ORDNER / SLIDES + NAV
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
            <div class="folder-card" data-index="${i}" style="--accent:${f.color || "#f5d36a"}">
              <div>${f.icon || "📁"}</div>
              <strong>${f.name}</strong>
            </div>
          `).join("")}
        </div>
      `;

      overlayContent.querySelectorAll(".folder-card").forEach(card => {
        card.onclick = () => {
          currentFolder = +card.dataset.index;
          currentSlide = 0;
          showSlide();
        };
      });
    }

    function showSlide() {
      const slides = data.folders[currentFolder].slides;
      const slide = slides[currentSlide];

      overlayContent.innerHTML = `
        <button class="back">← Ordner</button>
        <div class="slide">
          <h3>${slide.title}</h3>
          <p>${slide.text}</p>
        </div>

        <div class="nav">
          <button ${currentSlide === 0 ? "disabled" : ""} id="prev">←</button>
          <span>${currentSlide + 1} / ${slides.length}</span>
          <button ${currentSlide === slides.length - 1 ? "disabled" : ""} id="next">→</button>
        </div>
      `;

      overlayContent.querySelector(".back").onclick = showFolders;

      document.getElementById("prev")?.addEventListener("click", () => {
        if (currentSlide > 0) {
          currentSlide--;
          showSlide();
        }
      });

      document.getElementById("next")?.addEventListener("click", () => {
        if (currentSlide < slides.length - 1) {
          currentSlide++;
          showSlide();
        }
      });
    }
  }

});
