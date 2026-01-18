"use strict";
let storyData = null;

/* =====================================================
GLOBALER APP STATE
===================================================== */
const App = {
  overlayOpen: false,
  activeTarget: null
};

/* =====================================================
DOM HELPERS
===================================================== */
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

/* =====================================================
OVERLAY STEUERUNG (EINMAL, SAUBER)
===================================================== */
function openOverlay(target) {
  const overlay = $("overlay");
  const content = $("overlayContent");

  if (!overlay || !content) return;

  App.overlayOpen = true;
  App.activeTarget = target;

  content.innerHTML = "";
  overlay.classList.add("active");
  document.body.classList.add("modal-open");

  routeOverlay(target);
}

function closeOverlay() {
  const overlay = $("overlay");
  if (!overlay) return;

  App.overlayOpen = false;
  App.activeTarget = null;

  overlay.classList.remove("active");
  document.body.classList.remove("modal-open");
  $("overlayContent").innerHTML = "";
}

/* =====================================================
ROUTER (EIN EINZIGER ENTRY POINT)
===================================================== */
function routeOverlay(type) {
  switch (type) {
    case "story":
      loadMeineGeschichte();
      break;
    case "about":
      loadAbout();
      break;
    case "info":
      loadInfo();
      break;
    case "archive":
      loadArchive();
      break;
    case "thoughts":
      loadThoughts();
      break;
    case "ordnerX":
      loadOrdnerX();
      break;
    case "quotes":
      loadQuotes();
      break;
    default:
      renderError(`Unbekannter Typ: ${type}`);
  }
}

/* =====================================================
RENDER HELPERS
===================================================== */
function renderHTML(html) {
  $("overlayContent").innerHTML = html;
}

function renderError(msg) {
  renderHTML(`
    <div class="card-ui">
      <h3>Fehler</h3>
      <p>${msg}</p>
      <button class="back" onclick="closeOverlay()">Zurück</button>
    </div>
  `);
}

/* =====================================================
JSON LOADER (STABIL & EINFACH)
===================================================== */
async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`JSON Fehler: ${path}`);
  return res.json();
}

"use strict";

/* ===============================
HILFSFUNKTIONEN
=============================== */
async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(path + " konnte nicht geladen werden");
  return res.json();
}

function renderHTML(html) {
  const box = document.getElementById("overlayContent");
  box.innerHTML = html;
}

/* ===============================
ÜBER MICH
=============================== */
async function loadAbout() {
  const data = await loadJSON("data/personalSlides.json");

  renderHTML(`
    <h2>${data.title}</h2>
    <div class="folder-grid">
      ${data.sections.map((s, i) => `
        <div class="folder-card" onclick="openAbout(${i})">
          <h3>${s.title}</h3>
          <div class="folder-progress">${s.slides.length} Karten</div>
        </div>
      `).join("")}
    </div>
  `);

  window.__aboutData = data;
}

function openAbout(i) {
  const section = window.__aboutData.sections[i];
  let idx = 0;

  function renderSlide() {
    const slide = section.slides[idx];
    renderHTML(`
      <button class="back" onclick="loadAbout()">← Zurück</button>
      <div class="slide">
        <h3>${slide.title}</h3>
        <p>${slide.text.replace(/\n/g,"<br>")}</p>
      </div>
      <div class="nav">
        <button ${idx===0?"disabled":""} onclick="idx--;renderSlide()">←</button>
        <span>${idx+1} / ${section.slides.length}</span>
        <button ${idx===section.slides.length-1?"disabled":""} onclick="idx++;renderSlide()">→</button>
      </div>
    `);
  }
  renderSlide();
}

/* ===============================
INFO
=============================== */
async function loadInfo() {
  const data = await loadJSON("data/info.json");
  let i = 0;

  function render() {
    const s = data.slides[i];
    renderHTML(`
      <div class="info-card">
        <h2>${data.title}</h2>
        <h3>${s.title}</h3>
        <div class="info-content">${Array.isArray(s.content) ? s.content.join("") : s.content}</div>
        <div class="info-nav">
          <button ${i===0?"disabled":""} onclick="i--;render()">←</button>
          <span>${i+1} / ${data.slides.length}</span>
          <button ${i===data.slides.length-1?"disabled":""} onclick="i++;render()">→</button>
        </div>
      </div>
    `);
  }
  render();
}

/* ===============================
GEDANKEN
=============================== */
async function loadThoughts() {
  const data = await loadJSON("data/thoughtsSlides.json");

  renderHTML(`
    <h2>${data.title}</h2>
    <div class="folder-grid">
      ${data.sections.map((s,i)=>`
        <div class="folder-card" onclick="openThought(${i})">
          <h3>${s.title}</h3>
        </div>
      `).join("")}
    </div>
  `);

  window.__thoughts = data;
}

function openThought(i) {
  const section = window.__thoughts.sections[i];
  let idx = 0;

  function render() {
    const slide = section.slides[idx];
    renderHTML(`
      <button class="back" onclick="loadThoughts()">← Zurück</button>
      <div class="slide story-slide">
        <p class="story-text">${slide.text}</p>
      </div>
      <div class="nav">
        <button ${idx===0?"disabled":""} onclick="idx--;render()">←</button>
        <span>${idx+1} / ${section.slides.length}</span>
        <button ${idx===section.slides.length-1?"disabled":""} onclick="idx++;render()">→</button>
      </div>
    `);
  }
  render();
}

/* ===============================
ORDNER X
=============================== */
async function loadOrdnerX() {
  const data = await loadJSON("data/ordnerX.json");

  renderHTML(`
    <h2>${data.title}</h2>
    <div class="folder-grid">
      ${data.sections.map((s,i)=>`
        <div class="folder-card" onclick="openOrdnerX(${i})">
          <h3>${s.title}</h3>
        </div>
      `).join("")}
    </div>
  `);

  window.__ordnerX = data;
}

function openOrdnerX(i) {
  const section = window.__ordnerX.sections[i];
  let idx = 0;

  function render() {
    const slide = section.slides[idx];
    renderHTML(`
      <button class="back" onclick="loadOrdnerX()">← Zurück</button>
      <div class="slide">
        <h3>${slide.title}</h3>
        <p>${slide.text}</p>
      </div>
      <div class="nav">
        <button ${idx===0?"disabled":""} onclick="idx--;render()">←</button>
        <span>${idx+1} / ${section.slides.length}</span>
        <button ${idx===section.slides.length-1?"disabled":""} onclick="idx++;render()">→</button>
      </div>
    `);
  }
  render();
}

/* ===============================
ARCHIV
=============================== */
async function loadArchive() {
  const data = await loadJSON("data/archive.json");

  renderHTML(`
    <h2>Vergangene Tage</h2>
    <div class="archive-month">
      ${data.days.map(d=>`
        <div class="archive-row">
          <div class="archive-date">${d.date}</div>
          <div class="archive-text">${d.quote}</div>
        </div>
      `).join("")}
    </div>
  `);
}

/* ===============================
ZITATE
=============================== */
async function loadQuotes() {
  const data = await loadJSON("data/folders.json");
  const folders = Object.entries(data.folders);

  renderHTML(`
    <h2>Zitate</h2>
    <div class="folder-grid">
      ${folders.map(([name,arr],i)=>`
        <div class="folder-card" onclick="openQuotes(${i})">
          <h3>${name}</h3>
          <div class="folder-progress">${arr.length} Zitate</div>
        </div>
      `).join("")}
    </div>
  `);

  window.__quotes = folders;
}

function openQuotes(i) {
  const [name, quotes] = window.__quotes[i];
  let idx = 0;

  function render() {
    renderHTML(`
      <button class="back" onclick="loadQuotes()">← Zurück</button>
      <div class="slide">
        <blockquote class="quote-text">„${quotes[idx]}“</blockquote>
      </div>
      <div class="nav">
        <button ${idx===0?"disabled":""} onclick="idx--;render()">←</button>
        <span>${idx+1} / ${quotes.length}</span>
        <button ${idx===quotes.length-1?"disabled":""} onclick="idx++;render()">→</button>
      </div>
    `);
  }
  render();
}

/* ===============================
MEINE GESCHICHTE
=============================== */
async function loadMeineGeschichte() {
  const data = await loadJSON("data/meinegeschichte.json");
  const folders = Object.entries(data.folders);

  renderHTML(`
    <h2>Meine Geschichte</h2>
    <div class="folder-grid">
      ${folders.map(([n,e],i)=>`
        <div class="folder-card" onclick="openStory(${i})">
          <h3>${n}</h3>
          <div class="folder-progress">${e.length} Einträge</div>
        </div>
      `).join("")}
    </div>
  `);

  window.__story = folders;
}

function openStory(i) {
  const [name, entries] = window.__story[i];
  let idx = 0;

  function render() {
    renderHTML(`
      <button class="back" onclick="loadMeineGeschichte()">← Zurück</button>
      <div class="slide">
        <pre class="story-text">${entries[idx]}</pre>
      </div>
      <div class="nav">
        <button ${idx===0?"disabled":""} onclick="idx--;render()">←</button>
        <span>${idx+1} / ${entries.length}</span>
        <button ${idx===entries.length-1?"disabled":""} onclick="idx++;render()">→</button>
      </div>
    `);
  }
  render();
}

/* =====================================================
EVENT BINDINGS
===================================================== */
document.addEventListener("DOMContentLoaded", () => {

  // Focus Cards
  $$(".focus-card").forEach(card => {
    card.addEventListener("click", () => {
      openOverlay(card.dataset.target);
    });
  });

  // Menü Buttons
  $$("#menu button[data-target]").forEach(btn => {
    btn.addEventListener("click", () => {
      $("menu").classList.remove("open");
      openOverlay(btn.dataset.target);
    });
  });

  // Menü Toggle
  $("menuButton")?.addEventListener("click", () => {
    $("menu").classList.toggle("open");
  });

  // Home Button
  $("homeBtn")?.addEventListener("click", () => {
    $("menu").classList.remove("open");
    closeOverlay();
  });

  // Overlay Click = schließen
  $("overlay")?.addEventListener("click", (e) => {
    if (e.target.id === "overlay") closeOverlay();
  });

});

/* =====================================================
GLOBAL (nur was HTML braucht)
===================================================== */
window.openOverlay = openOverlay;
window.closeOverlay = closeOverlay;

/* =====================================================
INTRO START BUTTON
===================================================== */
document.addEventListener("DOMContentLoaded", () => {
  const intro = document.getElementById("introOverlay");
  const startBtn = document.getElementById("introStart");

  if (!intro || !startBtn) return;

  startBtn.addEventListener("click", () => {
    intro.classList.add("fade-out");

    setTimeout(() => {
      intro.style.display = "none";
    }, 1000);
  });
});
