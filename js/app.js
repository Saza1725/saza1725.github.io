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
  document.body.style.overflow = "hidden";
  overlay.classList.add("active");
  overlayContent.innerHTML = "";

  switch (type) {
    case "about":
      loadAbout();
      break;
    case "ordnerX":
      loadOrdnerX();
      break;
  }
}

closeOverlay.onclick = () => {
  overlay.classList.remove("active");
  document.body.style.overflow = "";
};

/* =====================================
ORDNER X – 3 EBENEN
===================================== */
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
      <button class="back">← Zurück</button>
      <div class="folder-grid">
        ${data.folders.map((f, i) =>
          `<div class="folder-card" data-i="${i}">${f.name}</div>`
        ).join("")}
      </div>
    `;

    overlayContent.querySelector(".back").onclick = showIntro;

    document.querySelectorAll(".folder-card").forEach(card => {
      card.onclick = () => {
        currentFolder = +card.dataset.i;
        currentIndex = 0;
        textVisible = false;
        showEntry();
      };
    });
  }

  function showEntry() {
    const entry = data.folders[currentFolder].entries[currentIndex];

    overlayContent.innerHTML = `
      <button class="back">← Ordner</button>
      <h3>${entry.title}</h3>
      ${textVisible ? `<p>${entry.text}</p>` : ""}
      <div class="nav">
        <button id="prev">←</button>
        <button id="toggle">Text</button>
        <button id="next">→</button>
      </div>
    `;

    overlayContent.querySelector(".back").onclick = showFolders;

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
