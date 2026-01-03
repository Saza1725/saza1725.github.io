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
      const today = new Date().toISOString().split("T")[0];
      const seed = Number(today.replaceAll("-", ""));
      dailyQuoteBox.textContent = data.quotes[seed % data.quotes.length];
    });

  /* ================= PERSONAL QUOTES ================= */
  const personalQuoteDisplay = document.getElementById("personalQuoteDisplay");
  fetch("Daten/dailyTexts.json")
    .then(r => r.json())
    .then(d => {
      const today = new Date().toISOString().split("T")[0];
      const seed = Number(today.replaceAll("-", ""));

      function show(type) {
        personalQuoteDisplay.textContent = d[type][seed % d[type].length];
        personalQuoteDisplay.style.display = "block";
      }

      document.getElementById("morningBtn").onclick = () => show("morning");
      document.getElementById("noonBtn").onclick = () => show("noon");
      document.getElementById("eveningBtn").onclick = () => show("evening");
    });

  /* ================= TEILEN ================= */
  document.getElementById("shareQuoteBtn").onclick = () => {
    const quote = dailyQuoteBox.textContent;
    if (navigator.share) {
      navigator.share({ title: "Tageszitat", text: quote }).catch(()=>{});
    } else {
      navigator.clipboard.writeText(quote);
      alert("Zitat kopiert");
    }
  };

  /* ================= TAGESFOKUS ================= */
  const focusInput = document.getElementById("dailyFocusInput");
  const focusKey = "focus-" + new Date().toISOString().split("T")[0];
  focusInput.value = localStorage.getItem(focusKey) || "";
  focusInput.oninput = () => localStorage.setItem(focusKey, focusInput.value);

  /* ================= OVERLAY HANDLER ================= */
  function createOverlayHandler(overlayId, renderFn) {
    const overlay = document.getElementById(overlayId);
    if (!overlay) return;

    const content = overlay.querySelector(".overlayContent");
    content.addEventListener("click", e => e.stopPropagation());
    overlay.addEventListener("click", () => showMain());

    document.addEventListener("openSection", e => {
      if (e.detail === overlayId) {
        hideAllOverlays();
        if (renderFn) renderFn();
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
        Object.keys(d.folders).forEach(name => {
          const div = document.createElement("div");
          div.className = "folderFrame";
          div.textContent = name;
          div.onclick = () => renderFolder(name);
          grid.appendChild(div);
        });
      }

      function renderFolder(name) {
        grid.innerHTML = "";
        const fc = document.createElement("div");
        fc.className = "folderContent";
        fc.innerHTML = `<h3>${name}</h3>`;
        d.folders[name].forEach(q => {
          const p = document.createElement("p");
          p.textContent = q;
          fc.appendChild(p);
        });
        const backBtn = document.createElement("button");
        backBtn.textContent = "← Zurück";
        backBtn.className = "closeBtn";
        backBtn.onclick = e => { e.stopPropagation(); renderOverview(); };
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

      function renderOverview() {
        grid.innerHTML = "";
        Object.keys(d.folders).forEach(name => {
          const div = document.createElement("div");
          div.className = "myTimeFolder";
          div.textContent = name;
          div.onclick = () => renderFolder(name);
          grid.appendChild(div);
        });
      }

      function renderFolder(name) {
        grid.innerHTML = "";
        const fc = document.createElement("div");
        fc.className = "folderContent";
        fc.innerHTML = `<h3>${name}</h3>`;
        d.folders[name].forEach(e => {
          fc.innerHTML += `<h4>${e.title}</h4><p>${e.text}</p>`;
          if(e.image) fc.innerHTML += `<img src="${e.image}" class="myTimeImage">`;
        });
        const backBtn = document.createElement("button");
        backBtn.textContent = "← Zurück";
        backBtn.className = "closeBtn";
        backBtn.onclick = e => { e.stopPropagation(); renderOverview(); };
        fc.appendChild(backBtn);
        grid.appendChild(fc);
      }

      createOverlayHandler("meinezeitOverlay", renderOverview);
    });

  /* ================= ARCHIV ================= */
  fetch("Daten/archive.json")
    .then(r => r.json())
    .then(d => {
      const monthDetail = document.getElementById("monthDetail");
      function renderArchive() {
        monthDetail.innerHTML = "";
        d.days.forEach(entry => {
          const box = document.createElement("div");
          box.className = "archiveEntry";
          box.innerHTML = `<h4>${entry.date}</h4><p>${entry.quote}</p>`;
          monthDetail.appendChild(box);
        });
      }
      createOverlayHandler("archiveOverlay", renderArchive);
    });

  /* ================= INFO ================= */
  const infoContent = document.getElementById("infoContent");
  fetch("Daten/info.json")
    .then(r => r.json())
    .then(d => infoContent.innerHTML = d.infoText)
    .catch(() => infoContent.innerHTML = "<p>Info nicht verfügbar</p>");
  createOverlayHandler("infoOverlay");

  /* ================= ÜBER MICH / PERSONAL SLIDES ================= */
  const personalOverlay = document.getElementById("personalOverlay");
  const slidesContainer = document.getElementById("personalSlidesContainer");
  const slidesProgress = document.getElementById("personalSlidesProgress");
  const prevSlideBtn = document.getElementById("prevSlide");
  const nextSlideBtn = document.getElementById("nextSlide");

  let slides = [];
  let currentSlide = 0;

  fetch("Daten/personalSlides.json")
    .then(r => r.json())
    .then(d => {
      // Intro
      slidesContainer.innerHTML = `<h3>${d.intro.title}</h3><p>${d.intro.text.replace(/\n/g,'<br>')}</p>`;
      slides = d.slides;

      function renderSlide(index) {
        slidesContainer.innerHTML = `<h3>${slides[index].title}</h3><p>${slides[index].text.replace(/\n/g,'<br>')}</p>`;
        slidesProgress.textContent = `${index+1} / ${slides.length}`;
        prevSlideBtn.style.display = index === 0 ? "none" : "inline-block";
        nextSlideBtn.style.display = index === slides.length-1 ? "none" : "inline-block";
      }

      prevSlideBtn.onclick = () => { if(currentSlide>0){currentSlide--; renderSlide(currentSlide);} };
      nextSlideBtn.onclick = () => { if(currentSlide<slides.length-1){currentSlide++; renderSlide(currentSlide);} };

      renderSlide(0);
    });

  createOverlayHandler("personalOverlay");

  async function loadNews() {
  const list = document.getElementById("newsList");
  if (!list) return;

  let items = [];
  try {
    const data = await fetch("Daten/archive.json").then(r => r.json());
    data.days.forEach(d => items.push({
      date: d.date,
      text: d.quote,
      location: d.location || "–"
    }));
  } catch (err) {
    console.error("Fehler beim Laden der News:", err);
    return;
  }

  // Sortieren: neueste zuerst
  items.sort((a,b) => new Date(b.date) - new Date(a.date));

  list.innerHTML = ""; // alte News leeren

  items.slice(0,3).forEach(item => {
    const div = document.createElement("div");
    div.className = "newsItem";
    div.innerHTML = `
      <span class="newsDate">${item.date}</span>
      <span class="newsLocation">${item.location}</span>
      <div class="newsText">${item.text}</div>
    `;
    list.appendChild(div);
  });
}

loadNews();
