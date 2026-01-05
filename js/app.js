document.addEventListener("DOMContentLoaded", () => {

  /* =====================================
  BASIS
  ===================================== */
  const menu = document.getElementById("menu");
  const menuButton = document.getElementById("menuButton");
  const overlay = document.getElementById("overlay");
  const overlayContent = document.getElementById("overlayContent");
  const closeOverlay = document.getElementById("closeOverlay");

  if (!overlay || !overlayContent) return;

  /* =====================================
  MENÜ
  ===================================== */
  if (menu && menuButton) {
    menuButton.onclick = () => {
      menu.style.right = menu.style.right === "0px" ? "-240px" : "0px";
    };

    document.querySelectorAll("#menu button").forEach(btn => {
      btn.onclick = () => {
        menu.style.right = "-240px";
        openOverlay(btn.dataset.target);
      };
    });
  }

  /* =====================================
  OVERLAY BASIS
  ===================================== */
  function openOverlay(type) {
    overlay.style.display = "block";
    document.body.style.overflow = "hidden";
    overlayContent.innerHTML = "";

    if (type === "about") {
      loadAbout();
    } else {
      overlayContent.innerHTML = `<p>Bereich „${type}“ folgt.</p>`;
    }
  }

  function closeOverlayFn() {
    overlay.style.display = "none";
    document.body.style.overflow = "";
    if (menu) menu.style.right = "-240px";
  }

  if (closeOverlay) {
    closeOverlay.onclick = closeOverlayFn;
  }

  /* =====================================
  ÜBER MICH – ORDNER / FOLIEN / CARDS
  ===================================== */
  async function loadAbout() {
    try {
      const res = await fetch("./data/personalSlides.json");
      if (!res.ok) throw new Error("JSON nicht gefunden");
      const data = await res.json();

      let currentFolder = null;
      let currentSlide = 0;

      showIntro();

      /* ========= EBENE 1 ========= */
      function showIntro() {
        overlayContent.innerHTML = `
          <button class="close">← Home</button>
          <h2>${data.title}</h2>
          <p>${data.intro}</p>
          <button id="aboutNext">Weiter</button>
        `;

        overlayContent.querySelector(".close").onclick = closeOverlayFn;
        document.getElementById("aboutNext").onclick = showFolders;
      }

      /* ========= EBENE 2 ========= */
      function showFolders() {
        overlayContent.innerHTML = `
          <button class="back">← Zurück</button>
          <h2>${data.title}</h2>

          <div class="folder-grid">
            ${data.folders.map((f, i) => `
              <div class="folder-card" data-index="${i}">
                <h3>${f.name}</h3>
              </div>
            `).join("")}
          </div>
        `;

        overlayContent.querySelector(".back").onclick = showIntro;

        overlayContent.querySelectorAll(".folder-card").forEach(card => {
          card.onclick = () => {
            currentFolder = +card.dataset.index;
            currentSlide = 0;
            showSlide();
          };
        });
      }

      /* ========= EBENE 3 ========= */
      function showSlide() {
        const slides = data.folders[currentFolder].slides;
        const slide = slides[currentSlide];

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

    } catch (err) {
      overlayContent.innerHTML = "<p>Fehler beim Laden der Inhalte.</p>";
      console.error(err);
    }
  }

});
