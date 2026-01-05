/* =====================================
BASIS
===================================== */
const menu = document.getElementById("menu");
const menuButton = document.getElementById("menuButton");
const overlay = document.getElementById("overlay");
const overlayContent = document.getElementById("overlayContent");
const closeOverlay = document.getElementById("closeOverlay");

/* =====================================
MENÜ
===================================== */
menuButton.onclick = () => {
  menu.style.right = menu.style.right === "0px" ? "-240px" : "0px";
};

document.querySelectorAll("#menu a").forEach(link => {
  link.onclick = e => {
    e.preventDefault();
    menu.style.right = "-240px";
    openOverlay(link.dataset.target);
  };
});


/* =====================================
OVERLAY BASIS
===================================== */
function openOverlay(type) {
  overlay.style.display = "block";
  document.body.style.overflow = "hidden";
  overlayContent.innerHTML = "";

  if (type === "about") loadAbout();
}

closeOverlay.onclick = () => {
  overlay.style.display = "none";
  document.body.style.overflow = "";
};


/* =====================================
ÜBER MICH – 3 EBENEN
===================================== */
async function loadAbout() {
  const res = await fetch("data/personalSlides.json");
  const data = await res.json();

  let currentFolder = null;
  let currentSlide = 0;

  showIntro();

  /* ========= EBENE 1: INTRO ========= */
  function showIntro() {
    overlayContent.innerHTML = `
      <button class="close">← Home</button>
      <h2>${data.title}</h2>
      <p>${data.intro}</p>
      <button id="aboutNext">Weiter</button>
    `;

    overlayContent.querySelector(".close").onclick = closeOverlay;
    document.getElementById("aboutNext").onclick = showFolders;
  }

  /* ========= EBENE 2: UNTERORDNER ========= */
  function showFolders() {
    overlayContent.innerHTML = `
      <button class="back">← Zurück</button>
      <h2>${data.title}</h2>

      <div class="folder-grid">
        ${data.folders
          .map(
            (f, i) =>
              `<div class="folder-card" data-index="${i}">
                <h3>${f.name}</h3>
              </div>`
          )
          .join("")}
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

  /* ========= EBENE 3: SLIDES ========= */
  function showSlide() {
    const slide = data.folders[currentFolder].slides[currentSlide];

    overlayContent.innerHTML = `
      <button class="back">← Ordner</button>

      <h3>${slide.title}</h3>
      <p>${slide.text}</p>

      <div class="nav">
        <button id="prev">←</button>
        <span>${currentSlide + 1} / ${
          data.folders[currentFolder].slides.length
        }</span>
        <button id="next">→</button>
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
      if (
        currentSlide <
        data.folders[currentFolder].slides.length - 1
      ) {
        currentSlide++;
        showSlide();
      }
    };
  }
}
