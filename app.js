document.addEventListener("DOMContentLoaded", () => {

  /* ================= BASIS ================= */
  const menu = document.getElementById("menu");
  const menuButton = document.getElementById("menuButton");
  const main = document.querySelector("main");

  function getAllOverlays() {
    return Array.from(document.querySelectorAll(".overlay"));
  }

  function hideAllOverlays() {
    getAllOverlays().forEach(o => o.style.display = "none");
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
    hideAllOverlays();
    main.style.display = "none"; // Hauptseite NICHT automatisch zeigen
    menu.style.right = menu.style.right === "0px" ? "-260px" : "0";
  };

  document.querySelectorAll("#menu a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = link.dataset.target;
      menu.style.right = "-260px";

      if (target === "home") return showMain();

      document.dispatchEvent(
        new CustomEvent("openSection", { detail: target })
      );
    });
  });

  /* ================= HEADER ================= */
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

  /* ================= ZITATE ORDNER ================= */
  fetch("Daten/folders.json").then(r => r.json()).then(d => {
    const overlay = document.getElementById("folderOverlay");
    const grid = document.getElementById("folderGrid");
    const content = overlay.querySelector(".overlayContent");

    function clearFolderContent() {
      content.querySelectorAll(".folderContent").forEach(el => el.remove());
    }

    function showOverview() {
      clearFolderContent();
      grid.innerHTML = "";
      grid.style.display = "grid";

      Object.keys(d.folders).forEach(name => {
        const div = document.createElement("div");
        div.className = "folderFrame";
        div.textContent = name;
        div.onclick = () => showFolder(name);
        grid.appendChild(div);
      });

      hideAllOverlays();
      overlay.style.display = "flex";
      main.style.display = "none";
    }

    function showFolder(name) {
      grid.style.display = "none";
      clearFolderContent();

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
      backBtn.onclick = showOverview;
      fc.appendChild(backBtn);
      content.appendChild(fc);
    }

    document.addEventListener("openSection", e => {
      if (e.detail === "folderOverlay") showOverview();
    });
  });

  /* ================= MEINE ZEIT ================= */
  fetch("Daten/meinezeit.json").then(r => r.json()).then(d => {
    const overlay = document.getElementById("meinezeitOverlay");
    const content = overlay.querySelector(".overlayContent");
    const grid = document.getElementById("meinezeitGrid");

    function renderOverview() {
      grid.innerHTML = "";
      grid.style.display = "grid";
      content.querySelectorAll(".folderContent").forEach(el => el.remove());

      Object.keys(d.folders).forEach(name => {
        const div = document.createElement("div");
        div.className = "myTimeFolder";
        div.textContent = name;
        div.onclick = () => renderFolder(name);
        grid.appendChild(div);
      });

      hideAllOverlays();
      overlay.style.display = "flex";
      main.style.display = "none";
    }

    function renderFolder(name) {
      grid.style.display = "none";
      const fc = document.createElement("div");
      fc.className = "folderContent";
      fc.innerHTML = `<h3>${name}</h3>`;

      d.folders[name].forEach(e => {
        fc.innerHTML += `<h4>${e.title}</h4><p>${e.text}</p>`;
        if (e.image) fc.innerHTML += `<img src="${e.image}" class="myTimeImage">`;
      });

      const backBtn = document.createElement("button");
      backBtn.textContent = "← Zurück";
      backBtn.className = "closeBtn";
      backBtn.onclick = renderOverview;
      fc.appendChild(backBtn);
      content.appendChild(fc);
    }

    document.addEventListener("openSection", e => {
      if (e.detail === "meinezeitOverlay") renderOverview();
    });
  });

  /* ================= ÜBER MICH ================= */
  let aboutOverlay = document.getElementById("aboutOverlay");
  let aboutContent;

  if (!aboutOverlay) {
    aboutOverlay = document.createElement("div");
    aboutOverlay.id = "aboutOverlay";
    aboutOverlay.className = "overlay";

    aboutContent = document.createElement("div");
    aboutContent.id = "aboutContent";
    aboutContent.className = "overlayContent";

    aboutOverlay.appendChild(aboutContent);
    document.body.appendChild(aboutOverlay);
  }

  fetch("Daten/about.json")
    .then(r => r.json())
    .then(d => { aboutContent.innerHTML = d.aboutText; })
    .catch(() => { aboutContent.innerHTML = "<p>Über mich-Text nicht verfügbar.</p>"; });

  document.addEventListener("openSection", e => {
    if (e.detail === "aboutOverlay") {
      hideAllOverlays();
      aboutOverlay.style.display = "flex";
      main.style.display = "none";
    }
  });

  aboutOverlay.addEventListener("click", e => {
    if (!aboutContent.contains(e.target)) showMain();
  });

  /* ================= VERGANGENE TAGE ================= */
  fetch("Daten/archive.json").then(r => r.json()).then(d => {
    const overlay = document.getElementById("archiveOverlay");
    const monthDetail = document.getElementById("monthDetail");

    function renderArchive() {
      monthDetail.innerHTML = "";
      d.days.forEach(entry => {
        const box = document.createElement("div");
        box.className = "archiveEntry";
        box.innerHTML = `<h4>${entry.date}</h4><p>${entry.quote}</p>`;
        monthDetail.appendChild(box);
      });

      hideAllOverlays();
      overlay.style.display = "flex";
      main.style.display = "none";
    }

    document.addEventListener("openSection", e => {
      if (e.detail === "archiveOverlay") renderArchive();
    });
  });

  /* ================= NEWS ================= */
  async function loadNews() {
    const list = document.getElementById("newsList");
    if (!list) return;

    let items = [];
    try {
      const a = await fetch("Daten/archive.json").then(r => r.json());
      a.days.forEach(d => items.push({ date: d.date, text: d.quote }));
    } catch {}

    items.sort((a,b) => new Date(b.date)-new Date(a.date));
    list.innerHTML = "";

    items.slice(0,3).forEach(i => {
      const div = document.createElement("div");
      div.className = "newsItem";
      div.innerHTML = `<strong>${i.date}</strong><br>${i.text}`;
      list.appendChild(div);
    });
  }
  loadNews();

});
