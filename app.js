document.addEventListener("DOMContentLoaded", () => {

  /* ================= BASIS ================= */
  const menu = document.getElementById("menu");
  const menuButton = document.getElementById("menuButton");
  const main = document.querySelector("main");
  const overlays = document.querySelectorAll(".overlay");

  function hideAllOverlays() {
    overlays.forEach(o => o.style.display = "none");
  }

  function showMain() {
    hideAllOverlays();
    main.style.display = "flex";
    menu.style.right = "-260px";
  }

  // STARTZUSTAND
  showMain();

  /* ================= MENU ================= */
  menuButton.onclick = () => {
    menu.style.right = menu.style.right === "0px" ? "-260px" : "0";
  };

  document.querySelectorAll("#menu a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = link.dataset.target;
      menu.style.right = "-260px";

      if (target === "home") {
        showMain();
        return;
      }

      document.dispatchEvent(
        new CustomEvent("openSection", { detail: target })
      );
    });
  });

  /* ================= HEADER / DATUM / UHRZEIT ================= */
  const weekday = document.getElementById("weekday");
  const daytime = document.getElementById("daytime");
  const dateEl = document.getElementById("date");
  const timeEl = document.getElementById("time");

  function updateHeader() {
    const now = new Date();
    const days = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
    weekday.textContent = days[now.getDay()];
    daytime.textContent =
      now.getHours() < 12 ? "Morgens" :
      now.getHours() < 18 ? "Mittags" : "Abends";
    dateEl.textContent = now.toLocaleDateString("de-DE");
    timeEl.textContent = now.toLocaleTimeString("de-DE");
  }
  updateHeader();
  setInterval(updateHeader, 1000);

  /* ================= TAGESZITAT ================= */
  const dailyQuoteBox = document.getElementById("dailyQuoteBox");
  fetch("Daten/tageszeit.json")
    .then(r => r.json())
    .then(data => {
      if(dailyQuoteBox && data.quotes?.length){
        const today = new Date().toISOString().split("T")[0];
        const seed = Number(today.replaceAll("-", ""));
        dailyQuoteBox.textContent = data.quotes[seed % data.quotes.length];
      }
    })
    .catch(() => { dailyQuoteBox.textContent = "Tageszitat nicht verfügbar"; });

  /* ================= PERSONAL QUOTES ================= */
  const personalQuoteDisplay = document.getElementById("personalQuoteDisplay");
  fetch("Daten/dailyTexts.json")
    .then(r => r.json())
    .then(d => {
      const today = new Date().toISOString().split("T")[0];
      const seed = Number(today.replaceAll("-", ""));

      function show(type) {
        if(d[type]?.length && personalQuoteDisplay){
          personalQuoteDisplay.textContent = d[type][seed % d[type].length];
          personalQuoteDisplay.style.display = "block";
        }
      }

      document.getElementById("morningBtn").onclick = () => show("morning");
      document.getElementById("noonBtn").onclick = () => show("noon");
      document.getElementById("eveningBtn").onclick = () => show("evening");
    });

  /* ================= TEILEN ================= */
  const shareBtn = document.getElementById("shareQuoteBtn");
  if(shareBtn){
    shareBtn.onclick = () => {
      const quote = dailyQuoteBox?.textContent || "";
      if (!quote) return;
      if (navigator.share) {
        navigator.share({ title: "Tageszitat", text: quote }).catch(()=>{});
      } else {
        navigator.clipboard.writeText(quote);
        alert("Zitat kopiert");
      }
    };
  }

  /* ================= TAGESFOKUS ================= */
  const focusInput = document.getElementById("dailyFocusInput");
  if(focusInput){
    const focusKey = "focus-" + new Date().toISOString().split("T")[0];
    focusInput.value = localStorage.getItem(focusKey) || "";
    focusInput.oninput = () => localStorage.setItem(focusKey, focusInput.value);
  }

  /* ================= OVERLAY HANDLER ================= */
  function createOverlayHandler(overlayId, renderFn){
    const overlay = document.getElementById(overlayId);
    if(!overlay) return;
    const content = overlay.querySelector(".overlayContent");
    content?.addEventListener("click", e => e.stopPropagation());
    overlay.addEventListener("click", showMain);

    document.addEventListener("openSection", e => {
      if(e.detail === overlayId){
        hideAllOverlays();
        if(renderFn) renderFn();
        overlay.style.display = "flex";
        main.style.display = "none";
      }
    });
  }

  /* ================= ZITATE ================= */
  fetch("Daten/folders.json")
    .then(r => r.json())
    .then(d => {
      const grid = document.getElementById("folderGrid");
      function renderOverview() {
        grid.innerHTML = "";
        Object.keys(d.folders).forEach(name=>{
          const div = document.createElement("div");
          div.className="folderFrame";
          div.textContent=name;
          div.onclick=()=>renderFolder(name);
          grid.appendChild(div);
        });
      }
      function renderFolder(name){
        grid.innerHTML="";
        const fc = document.createElement("div");
        fc.className="folderContent";
        fc.innerHTML=`<h3>${name}</h3>`;
        d.folders[name].forEach(q=>{
          const p=document.createElement("p");
          p.textContent=q;
          fc.appendChild(p);
        });
        const backBtn=document.createElement("button");
        backBtn.textContent="← Zurück";
        backBtn.className="closeBtn";
        backBtn.onclick=e=>{e.stopPropagation(); renderOverview();};
        fc.appendChild(backBtn);
        grid.appendChild(fc);
      }
      createOverlayHandler("folderOverlay", renderOverview);
    });

  /* ================= MEINE ZEIT ================= */
  fetch("Daten/meinezeit.json")
    .then(r => r.json())
    .then(d => {
      const grid = document.getElementById("meinezeitGrid");
      function renderOverview(){
        grid.innerHTML="";
        Object.keys(d.folders).forEach(name=>{
          const div=document.createElement("div");
          div.className="myTimeFolder";
          div.textContent=name;
          div.onclick=()=>renderFolder(name);
          grid.appendChild(div);
        });
      }
      function renderFolder(name){
        grid.innerHTML="";
        const fc=document.createElement("div");
        fc.className="folderContent";
        fc.innerHTML=`<h3>${name}</h3>`;
        d.folders[name].forEach(e=>{
          fc.innerHTML+=`<h4>${e.title}</h4><p>${e.text}</p>`;
          if(e.image) fc.innerHTML+=`<img src="${e.image}" class="myTimeImage">`;
        });
        const backBtn=document.createElement("button");
        backBtn.textContent="← Zurück";
        backBtn.className="closeBtn";
        backBtn.onclick=e=>{e.stopPropagation(); renderOverview();};
        fc.appendChild(backBtn);
        grid.appendChild(fc);
      }
      createOverlayHandler("meinezeitOverlay", renderOverview);
    });

  /* ================= ARCHIV ================= */
  fetch("Daten/archive.json")
    .then(r => r.json())
    .then(d=>{
      const monthDetail=document.getElementById("monthDetail");
      function renderArchive(){
        monthDetail.innerHTML="";
        d.days.forEach(entry=>{
          const box=document.createElement("div");
          box.className="archiveEntry";
          box.innerHTML=`<h4>${entry.date}</h4><p>${entry.quote}</p>`;
          monthDetail.appendChild(box);
        });
      }
      createOverlayHandler("archiveOverlay", renderArchive);
    });

  /* ================= INFO ================= */
  const infoContent=document.getElementById("infoContent");
  fetch("Daten/info.json")
    .then(r=>r.json())
    .then(d=>infoContent.innerHTML=d.infoText)
    .catch(()=>infoContent.innerHTML="<p>Info nicht verfügbar</p>");
  createOverlayHandler("infoOverlay");

  /* ================= ÜBER MICH / PERSONAL SLIDES ================= */
  const personalOverlay=document.getElementById("personalOverlay");
  const slidesContainer=document.getElementById("personalSlidesContainer");
  const slidesProgress=document.getElementById("personalSlidesProgress");
  const prevSlideBtn=document.getElementById("prevSlide");
  const nextSlideBtn=document.getElementById("nextSlide");

  let slides=[];
  let currentSlide=0;

  fetch("Daten/personalSlides.json")
    .then(r=>r.json())
    .then(d=>{
      slidesContainer.innerHTML=`<h3>${d.intro.title}</h3><p>${d.intro.text.replace(/\n/g,'<br>')}</p>`;
      slides=d.slides;

      function renderSlide(index){
        slidesContainer.innerHTML=`<h3>${slides[index].title}</h3><p>${slides[index].text.replace(/\n/g,'<br>')}</p>`;
        slidesProgress.textContent=`${index+1} / ${slides.length}`;
        prevSlideBtn.style.display=index===0?"none":"inline-block";
        nextSlideBtn.style.display=index===slides.length-1?"none":"inline-block";
      }

      prevSlideBtn.onclick=()=>{ if(currentSlide>0){currentSlide--; renderSlide(currentSlide);} };
      nextSlideBtn.onclick=()=>{ if(currentSlide<slides.length-1){currentSlide++; renderSlide(currentSlide);} };

      renderSlide(0);
    });

  createOverlayHandler("personalOverlay");

  /* ================= NEWS ================= */
 /* ================= NEWS COLLECTOR ================= */

const NEWS_KEY = "seenNewsState";
const REFRESH_INTERVAL = 30000; // 30 Sekunden

async function collectNews() {
  const news = [];
  const stored = JSON.parse(localStorage.getItem(NEWS_KEY)) || {};

  /* -------- ARCHIVE -------- */
  try {
    const archive = await fetch("Daten/archive.json").then(r => r.json());
    const newestDate = archive.days[archive.days.length - 1]?.date;

    if (newestDate && stored.archive !== newestDate) {
      news.push({
        source: "archive",
        title: "Neuer Tagesgedanke",
        text: "Ein neuer Eintrag wurde hinzugefügt",
        date: newestDate
      });
      stored.archive = newestDate;
    }
  } catch (e) {
    console.warn("Archive News Fehler", e);
  }

  /* -------- PERSONAL SLIDES -------- */
  try {
    const personal = await fetch("Daten/personalSlides.json").then(r => r.json());
    const count = personal.slides?.length || 0;

    if (stored.personal !== count) {
      news.push({
        source: "personal",
        title: "Neuer persönlicher Einblick",
        text: "Ein neuer Text wurde veröffentlicht",
        date: new Date().toISOString().split("T")[0]
      });
      stored.personal = count;
    }
  } catch (e) {
    console.warn("Personal News Fehler", e);
  }

  /* -------- MEINE ZEIT -------- */
  try {
    const mz = await fetch("Daten/meinezeit.json").then(r => r.json());
    let total = 0;
    Object.values(mz.folders).forEach(arr => total += arr.length);

    if (stored.meinezeit !== total) {
      news.push({
        source: "meinezeit",
        title: "Neuer Beitrag in Meine Zeit",
        text: "Ein neuer persönlicher Abschnitt wurde ergänzt",
        date: new Date().toISOString().split("T")[0]
      });
      stored.meinezeit = total;
    }
  } catch (e) {
    console.warn("MeineZeit News Fehler", e);
  }

  localStorage.setItem(NEWS_KEY, JSON.stringify(stored));
  renderNews(news);
}

/* ================= RENDER ================= */
function renderNews(items) {
  const list = document.getElementById("newsList");
  if (!list) return;

  if (!items.length) {
    list.innerHTML = "<p class='noNews'>Keine neuen Neuigkeiten</p>";
    return;
  }

  list.innerHTML = "";

  items.forEach(n => {
    const div = document.createElement("div");
    div.className = "newsItem clickable";
    div.dataset.source = n.source;
    div.dataset.target = n.date || "";

    div.innerHTML = `
      <div class="newsHeader">
        <strong>${n.title}</strong>
        <span>${n.date}</span>
      </div>
      <div class="newsText">${n.text}</div>
    `;

    div.addEventListener("click", () => openNewsTarget(n));
    list.appendChild(div);
  });

  activateNewsBell();
}


  /* ================= GLOCKE ================= */

function activateNewsBell() {
  const bell = document.getElementById("newsBell");
  if (!bell) return;
  bell.classList.add("active");
}

// === Live News & Glocke ===
const newsContainer = document.getElementById("newsContainer");
const newsBell = document.getElementById("newsBell");

let latestNewsTimestamp = 0; // speichert letzten bekannten Eintrag

async function loadNews() {
  const files = ["Daten/archive.json", "Daten/personalSlides.json", "Daten/meinezeit.json"];
  let allNews = [];

  for (const file of files) {
    const res = await fetch(file);
    const data = await res.json();

    if (file.includes("archive")) {
      data.days.forEach(d => allNews.push({title: d.date, text: d.quote, time: new Date(d.date).getTime()}));
    } else if (file.includes("personalSlides")) {
      allNews.push({title: data.intro.title, text: data.intro.text, time: Date.now()});
      data.slides.forEach(s => allNews.push({title: s.title, text: s.text, time: Date.now()}));
    } else if (file.includes("meinezeit")) {
      Object.keys(data.folders).forEach(name => {
        data.folders[name].forEach(e => allNews.push({title: e.title, text: e.text, time: Date.now()}));
      });
    }
  }

  allNews.sort((a,b) => b.time - a.time);

  if(allNews.length > 0 && allNews[0].time > latestNewsTimestamp) {
    latestNewsTimestamp = allNews[0].time;
    if(newsBell) newsBell.classList.add("new"); // Glocke blinkt
  }

  if(newsContainer){
    newsContainer.innerHTML = "";
    allNews.slice(0,5).forEach(n => {
      const div = document.createElement("div");
      div.className = "newsItem clickable";
      div.innerHTML = `<div class="newsHeader">${n.title}</div><div class="newsText">${n.text}</div>`;
      newsContainer.appendChild(div);
    });
  }
}

// initial laden
loadNews();
// live alle 20 Sekunden aktualisieren
setInterval(loadNews, 20000);

if(newsBell){
  newsBell.addEventListener("click", () => {
    newsBell.classList.remove("new");
    if(newsContainer) newsContainer.scrollIntoView({behavior:"smooth"});
  });
}

  /* ================= GLOCKE AUTOMATISIERUNG ================= */
document.addEventListener("DOMContentLoaded", () => {
  const bell = document.getElementById("newsBell");
  const newsContainer = document.getElementById("newsContainer");

  if (!bell || !newsContainer) return;

  let hasNewNews = false;

  // Funktion zum Prüfen auf neue News
  async function checkForNews() {
    try {
      // Alle Datenquellen abfragen
      const [archiveRes, slidesRes, meinezeitRes] = await Promise.all([
        fetch("Daten/archive.json"),
        fetch("Daten/personalSlides.json"),
        fetch("Daten/meinezeit.json")
      ]);

      const archiveData = await archiveRes.json();
      const slidesData = await slidesRes.json();
      const meinezeitData = await meinezeitRes.json();

      // Prüfen, ob es neue News gibt (hier nur als Beispiel: letztes Datum in archive.json)
      const latestArchiveDate = archiveData.days?.slice(-1)[0]?.date || null;
      const lastSeen = localStorage.getItem("lastSeenNewsDate");

      if (latestArchiveDate && latestArchiveDate !== lastSeen) {
        hasNewNews = true;
        bell.classList.add("new"); // Glocke pulsiert
      }

    } catch (err) {
      console.error("Fehler beim Laden der News:", err);
    }
  }

  // News prüfen beim Laden
  checkForNews();

  // Glocke anklicken → News öffnen
  bell.addEventListener("click", () => {
    newsContainer.style.display = "block";  // News anzeigen
    bell.classList.remove("new");            // Pulsen stoppen
    if (hasNewNews) {
      // zuletzt gesehenes Datum speichern
      localStorage.setItem("lastSeenNewsDate", new Date().toISOString());
      hasNewNews = false;
    }
  });

  // Optional: alle 60 Sekunden automatisch prüfen
  setInterval(checkForNews, 60000);
});


  /* ================= OPEN FUNCTIONS (für News & Glocke) ================= */

function openMeineZeit() {
  document.dispatchEvent(
    new CustomEvent("openSection", { detail: "meinezeitOverlay" })
  );
}

function openArchive() {
  document.dispatchEvent(
    new CustomEvent("openSection", { detail: "archiveOverlay" })
  );
}

function openPersonal() {
  document.dispatchEvent(
    new CustomEvent("openSection", { detail: "personalOverlay" })
  );
}

 

/* ================= AUTO UPDATE ================= */

collectNews();
setInterval(collectNews, REFRESH_INTERVAL);


document.addEventListener("DOMContentLoaded", () => {
  const overlay = document.getElementById("introOverlay");
  const card = document.getElementById("introCard");
  const textEl = document.getElementById("introText");
  const button = document.getElementById("introButton");
  const playBtn = document.getElementById("playIntroBtn"); // optionaler Play-Button

  // DEV_MODE nur für Entwicklung
  const DEV_MODE = false; 
  if (DEV_MODE) {
    overlay.style.display = "none";
    return;
  }

  const audio = new Audio("introMusic.mp3");
  audio.volume = 0.4;

  const introText = textEl.textContent; // Text aus HTML
  textEl.textContent = "";
  textEl.style.whiteSpace = "pre-line";
  let i = 0;

  function typeWriter() {
    if (i < introText.length) {
      textEl.textContent += introText.charAt(i);
      i++;
      setTimeout(typeWriter, 50); // Geschwindigkeit anpassen
    } else {
      button.disabled = false;
      button.classList.add("active");
    }
  }

  function startIntro() {
    overlay.style.display = "flex";
    setTimeout(() => card.classList.add("show"), 200); // Einfliegen
    audio.play().catch(()=>{}); // Musik starten
    typeWriter();
  }

  // Play-Button nur sichtbar, wenn man aktiv starten will
  if (playBtn) {
    playBtn.addEventListener("click", startIntro);
  } else {
    // Ohne Play-Button automatisch starten (funktioniert nur, wenn Browser Autoplay erlaubt)
    startIntro();
  }

  button.onclick = () => {
    overlay.style.opacity = 0;
    setTimeout(() => overlay.style.display = "none", 800);
    audio.pause();
  };
});
