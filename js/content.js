"use strict";

/* =====================================================
BASIS
===================================================== */
async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error("JSON Fehler: " + path);
  return res.json();
}

function render(html) {
  document.getElementById("overlayContent").innerHTML = html;
}

/* =====================================================
GENERIC: ORDNER → EINTRÄGE
===================================================== */
function renderFolderGrid(title, items, onClickName) {
  render(`
    <h2>${title}</h2>
    <div class="folder-grid">
      ${items.map((item, i) => `
        <div class="folder-card" data-i="${i}">
          <h3>${item.title || item.name}</h3>
          ${item.slides ? `<div class="folder-progress">${item.slides.length} Einträge</div>` : ""}
        </div>
      `).join("")}
    </div>
    <button class="back" onclick="closeOverlay()">Zurück</button>
  `);

  document.querySelectorAll(".folder-card").forEach(card => {
    card.onclick = () => window[onClickName](+card.dataset.i);
  });
}

function renderSlides(title, slides, backFn) {
  let index = 0;

  function draw() {
    render(`
      <button class="back" onclick="${backFn}()">← Zurück</button>
      <div class="slide">
        <p>${slides[index].text || slides[index]}</p>
      </div>
      <div class="nav">
        <button ${index === 0 ? "disabled" : ""} id="prev">←</button>
        <span>${index + 1} / ${slides.length}</span>
        <button ${index === slides.length - 1 ? "disabled" : ""} id="next">→</button>
      </div>
    `);

    document.getElementById("prev")?.addEventListener("click", () => {
      if (index > 0) { index--; draw(); }
    });
    document.getElementById("next")?.addEventListener("click", () => {
      if (index < slides.length - 1) { index++; draw(); }
    });
  }

  draw();
}

/* =====================================================
ABOUT
===================================================== */
let aboutData;
async function loadAbout() {
  aboutData = await loadJSON("data/personalSlides.json");
  renderFolderGrid(aboutData.title, aboutData.sections, "openAboutSection");
}
function openAboutSection(i) {
  renderSlides(
    aboutData.sections[i].title,
    aboutData.sections[i].slides,
    "loadAbout"
  );
}

/* =====================================================
ORDNER X
===================================================== */
let ordnerXData;
async function loadOrdnerX() {
  ordnerXData = await loadJSON("data/ordnerX.json");
  renderFolderGrid(ordnerXData.title, ordnerXData.sections, "openOrdnerX");
}
function openOrdnerX(i) {
  renderSlides(
    ordnerXData.sections[i].title,
    ordnerXData.sections[i].slides,
    "loadOrdnerX"
  );
}

/* =====================================================
THOUGHTS
===================================================== */
async function loadThoughts() {
  const data = await fetch("data/thoughtsSlides.json").then(r => r.json());

  renderFolderGrid(data.title, data.sections, "openThought");
}

function openThought(i) {
  fetch("data/thoughtsSlides.json")
    .then(r => r.json())
    .then(data => {
      renderSlides(
        data.sections[i].title,
        data.sections[i].slides,
        "loadThoughts"
      );
    });
}

/* =====================================================
MEINE GESCHICHTE
===================================================== */
async function loadMeineGeschichte() {
  const data = await fetch("data/meinegeschichte.json").then(r => r.json());

  const folders = Object.entries(data.folders).map(([title, slides]) => ({
    title,
    slides
  }));

  renderFolderGrid("Meine Geschichte", folders, "openStoryFolder");
}

function openStoryFolder(i) {
  const data = window.storyData || null;
  const entries = Object.entries(data.folders);

  renderSlides(entries[i][0], entries[i][1], "loadMeineGeschichte");
}

/* =====================================================
ZITATE
===================================================== */
let quotesData;
async function loadQuotes() {
  quotesData = await loadJSON("data/folders.json");
  const folders = Object.entries(quotesData.folders).map(([name, quotes]) => ({
    title: name,
    slides: quotes.map(q => ({ text: `„${q}“` }))
  }));
  renderFolderGrid("Zitate", folders, "openQuotesFolder");
}
function openQuotesFolder(i) {
  const entries = Object.entries(quotesData.folders);
  renderSlides(
    entries[i][0],
    entries[i][1].map(q => ({ text: `„${q}“` })),
    "loadQuotes"
  );
}

/* =====================================================
ARCHIV
===================================================== */
async function loadArchive() {
  const data = await fetch("data/archive.json").then(r => r.json());

  render(`
    <h2>Vergangene Tage</h2>
    <div class="archive-month">
      ${data.days.map(d => `
        <div class="archive-row">
          <div class="archive-date">${d.date}</div>
          <div class="archive-text">${d.quote}</div>
        </div>
      `).join("")}
    </div>
    <button class="back" onclick="closeOverlay()">Zurück</button>
  `);
}

/* =====================================================
INFO
===================================================== */
async function loadInfo() {
  const data = await loadJSON("data/info.json");

  render(`
    <div class="info-card">
      <h2>${data.title}</h2>
      ${data.slides.map(s => `
        <h3>${s.title}</h3>
        <p>${s.content}</p>
      `).join("")}
      <button class="back" onclick="closeOverlay()">Zurück</button>
    </div>
  `);
}

/* =====================================================
EXPORT
===================================================== */
window.loadAbout = loadAbout;
window.loadOrdnerX = loadOrdnerX;
window.loadThoughts = loadThoughts;
window.loadMeineGeschichte = loadMeineGeschichte;
window.loadQuotes = loadQuotes;
window.loadArchive = loadArchive;
window.loadInfo = loadInfo;



<header class="hero">

  <div id="introOverlay">
    <img
      id="introImage"
      src="assets/images/Saza17.webp"
      alt="Intro Bild"
    >

    <div id="introText">
      <h1></h1>
    </div>

    <button id="introStart">START</button>
  </div>



  /* =====================================================
RESET / BASIS
===================================================== */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html, body {
  height: 100%;
}

body {
  font-family: 'Libre Baskerville', serif;
  background: #0b0d11;
  color: #f2f2f2;
  overflow-x: hidden;
}

/* =====================================================
HINTERGRUND
===================================================== */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -2;
  background: url("../assets/images/nubis.jpg") center top / cover no-repeat;
  opacity: 0.35;
}

body::after {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -1;
  background: linear-gradient(
    180deg,
    rgba(0,0,0,0.6),
    rgba(0,0,0,0.85)
  );
}

body.modal-open {
  overflow: hidden;
}

/* =====================================================
STARTSEITE – FOCUS CARDS
===================================================== */
#focusFolders {
  position: fixed;
  top: 320px;
  left: 48px;
  z-index: 20;
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 280px;
}

.focus-card {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(245,211,106,0.35);
  border-radius: 18px;
  padding: 22px 24px;
  cursor: pointer;
  transition: all .3s ease;
  backdrop-filter: blur(8px);
}

.focus-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.1rem;
  color: #f5d36a;
  margin-bottom: 6px;
}

.focus-card p {
  font-size: .85rem;
  opacity: .75;
}

.focus-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 60px rgba(0,0,0,.6);
  border-color: rgba(245,211,106,.8);
}

/* =====================================================
MENU BUTTON
===================================================== */
#menuButton {
  position: fixed;
  top: 18px;
  right: 20px;
  z-index: 1000;
  background: rgba(15,17,21,0.9);
  border: 1px solid rgba(245,211,106,.4);
  color: #f5d36a;
  padding: 10px 14px;
  border-radius: 14px;
  cursor: pointer;
}

/* =====================================================
MENU
===================================================== */
#menu {
  position: fixed;
  right: -260px;
  top: 0;
  width: 260px;
  height: 100vh;
  background: linear-gradient(
    180deg,
    rgba(22,24,30,.98),
    rgba(12,14,18,.96)
  );
  padding: 120px 22px 30px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  transition: right .35s ease;
  z-index: 900;
}

#menu.open {
  right: 0;
}

#menu button {
  all: unset;
  cursor: pointer;
  padding: 16px 18px;
  border-radius: 14px;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(245,211,106,.25);
  color: #f5d36a;
  transition: .25s ease;
}

#menu button:hover {
  background: rgba(245,211,106,.15);
}

/* =====================================================
OVERLAY
===================================================== */
#overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.65);
  backdrop-filter: blur(10px);
  display: none;
  z-index: 2000;
}

#overlay.active {
  display: block;
}

#overlayContent {
  max-width: 1100px;
  margin: 60px auto;
  padding: 40px 28px 60px;
}

/* =====================================================
FOLDER GRID
===================================================== */
.folder-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px,1fr));
  gap: 28px;
  margin-top: 40px;
}

.folder-card {
  position: relative;
  padding: 46px 28px 32px;
  border-radius: 26px;
  background: linear-gradient(
    180deg,
    rgba(255,255,255,.08),
    rgba(255,255,255,.02)
  );
  border: 1px solid rgba(245,211,106,.35);
  cursor: pointer;
  transition: .35s ease;
}

.folder-card h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.35rem;
  color: #f5d36a;
}

.folder-progress {
  margin-top: 10px;
  font-size: .75rem;
  letter-spacing: 1px;
  opacity: .6;
}

.folder-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 40px 100px rgba(0,0,0,.75);
}

/* =====================================================
SLIDES / CARDS
===================================================== */
.slide,
.info-card,
.archive-month {
  background: linear-gradient(
    180deg,
    rgba(22,24,30,.95),
    rgba(14,16,22,.97)
  );
  border-radius: 28px;
  padding: 48px 52px;
  border: 1px solid rgba(245,211,106,.35);
  box-shadow:
    0 40px 120px rgba(0,0,0,.8),
    inset 0 0 0 1px rgba(245,211,106,.08);
}

.slide h3 {
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  margin-bottom: 24px;
  color: #f5d36a;
}

.slide p,
.story-text,
.info-content {
  font-size: 1.05rem;
  line-height: 1.75;
  opacity: .9;
}

/* =====================================================
STORY TEXT
===================================================== */
.story-text {
  white-space: pre-wrap;
  text-align: center;
}

/* =====================================================
ZITATE
===================================================== */
.quote-text {
  font-family: 'Playfair Display', serif;
  font-size: 1.2rem;
  line-height: 1.7;
  color: #f5d36a;
  text-align: center;
}

/* =====================================================
ARCHIV
===================================================== */
.archive-row {
  padding: 22px 24px;
  border-radius: 22px;
  margin-bottom: 14px;
  background: rgba(255,255,255,.05);
  border: 1px solid rgba(245,211,106,.25);
}

.archive-date {
  font-size: .75rem;
  letter-spacing: 1px;
  opacity: .6;
  margin-bottom: 6px;
}

/* =====================================================
NAVIGATION (← →)
===================================================== */
.nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 28px;
}

.nav button,
button.back {
  background: rgba(0,0,0,.4);
  border: 1px solid rgba(245,211,106,.45);
  color: #f5d36a;
  padding: 10px 22px;
  border-radius: 22px;
  cursor: pointer;
}

.nav button:disabled {
  opacity: .3;
  cursor: default;
}

button.back {
  margin-bottom: 24px;
}

/* =====================================================
MOBILE
===================================================== */
@media (max-width: 720px) {
  #focusFolders {
    display: none;
  }

  #overlayContent {
    margin: 20px auto;
    padding: 20px;
  }

  .slide,
  .info-card {
    padding: 32px 24px;
  }
}
