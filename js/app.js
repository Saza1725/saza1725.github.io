  /* =====================================
BASIS
======================================== */
const menu = document.getElementById("menu");
const menuButton = document.getElementById("menuButton");
const overlay = document.getElementById("overlay");
const overlayContent = document.getElementById("overlayContent");
const closeOverlay = document.getElementById("closeOverlay");

  /* =====================================
MENÜ
======================================== */
menuButton.onclick = () => {
  menu.style.right = menu.style.right === "0px" ? "-240px" : "0px";
};

if (type === "about") {
  loadAbout();
}


  /* =====================================
OVERLAY HEADER
======================================== */
document.querySelectorAll("#menu button").forEach(btn => {
  btn.onclick = () => {
    menu.style.right = "-240px";
    openOverlay(btn.dataset.overlay);
  };
});

closeOverlay.onclick = () => {
  overlay.classList.remove("active");
  document.body.style.overflow = "";
};

function openOverlay(type) {
  document.body.style.overflow = "hidden";
  overlay.classList.add("active");

  if (type === "about") {
    overlayContent.innerHTML = `
      <h2>Über mich</h2>
      <p>Ein persönlicher Weg. Gedanken. Entwicklung.</p>
      <button onclick="loadSub()">Weiter</button>
    `;
  }

  if (type === "info") {
    overlayContent.innerHTML = `
      <h2>Information</h2>
      <p>Warum diese Seite existiert und was sie bedeutet.</p>
    `;
  }

  if (type === "ordnerX") {
  loadOrdnerX();
}

  if (type === "time") {
    overlayContent.innerHTML = `
      <h2>Meine Zeit</h2>
      <p>Themen, Geschichten, Erfahrungen.</p>
    `;
  }

  if (type === "quotes") {
    overlayContent.innerHTML = `
      <h2>Zitate</h2>
      <p>Nach Gefühl, Stimmung, Gedanken.</p>
    `;
  }

  if (type === "archive") {
    overlayContent.innerHTML = `
      <h2>Vergangene Tage</h2>
      <p>Kalenderwochen · Gedanken · Erinnerungen</p>
    `;
  }
}

  /* =====================================
ORDNER X
======================================== */
async function loadOrdnerX() {
  const res = await fetch("data/ordnerX.json");
  const data = await res.json();

  let currentFolder = null;
  let currentIndex = 0;
  let textVisible = false;

  showIntro();

  function showIntro() {
    overlayContent.innerHTML = `
      <h2>${data.title}</h2>
      <p>${data.intro}</p>
      <button id="startFolders">Weiter</button>
    `;

    document.getElementById("startFolders").onclick = showFolders;
  }

  function showFolders() {
    overlayContent.innerHTML = `
      <h2>${data.title}</h2>
      <div class="folder-grid">
        ${data.folders.map((f, i) =>
          `<div class="folder-card" data-i="${i}">${f.name}</div>`
        ).join("")}
      </div>
    `;

    document.querySelectorAll(".folder-card").forEach(card => {
      card.onclick = () => {
        currentFolder = card.dataset.i;
        currentIndex = 0;
        textVisible = false;
        showEntry();
      };
    });
  }

  function showEntry() {
    const entry = data.folders[currentFolder].entries[currentIndex];

    overlayContent.innerHTML = `
      <button id="backToFolders">← Ordner</button>
      <h3>${entry.title}</h3>

      ${textVisible ? `<p>${entry.text}</p>` : ""}

      <div class="nav">
        <button id="prev">←</button>
        <button id="toggle">Text</button>
        <button id="next">→</button>
      </div>
    `;

    document.getElementById("backToFolders").onclick = showFolders;
    document.getElementById("toggle").onclick = () => {
      textVisible = !textVisible;
      showEntry();
    };

    document.getElementById("prev").onclick = () => {
      if (currentIndex > 0) {
        currentIndex--;
        textVisible = false;
        showEntry();
      }
    };

    document.getElementById("next").onclick = () => {
      if (currentIndex < data.folders[currentFolder].entries.length - 1) {
        currentIndex++;
        textVisible = false;
        showEntry();
      }
    };
  }
}



  /* =====================================
HEADER TIME
======================================== */
function updateHeader() {
  const now = new Date();
  const days = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
  document.getElementById("weekday").textContent = days[now.getDay()];
  document.getElementById("date").textContent = now.toLocaleDateString("de-DE");
  document.getElementById("time").textContent = now.toLocaleTimeString("de-DE");
}
updateHeader();
setInterval(updateHeader, 1000);

  /* =====================================
FOKUS
======================================== */
const focusInput = document.getElementById("dailyFocusInput");
const key = "focus-" + new Date().toISOString().split("T")[0];
focusInput.value = localStorage.getItem(key) || "";
focusInput.oninput = () => localStorage.setItem(key, focusInput.value);

  /* =====================================
EBENEN FUNKTION
======================================== */
async function loadAbout() {
  const res = await fetch("data/personalSlides.json");
  const data = await res.json();

  let currentFolder = null;
  let currentSlide = 0;

  showIntro();

   /* =====================================
EBENE 1
======================================== */
  function showIntro() {
    overlayContent.innerHTML = `
      <h2>${data.title}</h2>
      <p>${data.intro}</p>
      <button id="aboutNext">Weiter</button>
    `;

    document.getElementById("aboutNext").onclick = showFolders;
  }

  /* =====================================
EBENE 2
======================================== */
  function showFolders() {
    overlayContent.innerHTML = `
      <button id="backToHome">← Zurück</button>
      <h2>${data.title}</h2>

      <div class="folder-grid">
        ${data.folders.map((f, i) =>
          `<div class="folder-card" data-index="${i}">${f.name}</div>`
        ).join("")}
      </div>
    `;

    document.getElementById("backToHome").onclick = showIntro;

    document.querySelectorAll(".folder-card").forEach(card => {
      card.onclick = () => {
        currentFolder = +card.dataset.index;
        currentSlide = 0;
        showSlide();
      };
    });
  }

  /* =====================================
EBENE 3
======================================== */
  function showSlide() {
    const slide = data.folders[currentFolder].slides[currentSlide];

    overlayContent.innerHTML = `
      <button id="backToFolders">← Ordner</button>

      <h3>${slide.title}</h3>
      <p>${slide.text}</p>

      <div class="nav">
        <button id="prevSlide">←</button>
        <button id="nextSlide">→</button>
      </div>
    `;

    document.getElementById("backToFolders").onclick = showFolders;

    document.getElementById("prevSlide").onclick = () => {
      if (currentSlide > 0) {
        currentSlide--;
        showSlide();
      }
    };

    document.getElementById("nextSlide").onclick = () => {
      if (currentSlide < data.folders[currentFolder].slides.length - 1) {
        currentSlide++;
        showSlide();
      }
    };
  }
}

