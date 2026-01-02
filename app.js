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

      showMain();
      if (target === "home") return;

      const overlay = document.getElementById(target);
      if (overlay) {
        overlay.style.display = "flex";
        main.style.display = "none";
      }
    });
  });

  /* ================= INFO ================= */
  const infoOverlay = document.getElementById("infoOverlay");
  const infoContent = document.getElementById("infoContent");

  fetch("Daten/info.json")
    .then(r => r.json())
    .then(d => infoContent.innerHTML = d.infoText)
    .catch(() => infoContent.innerHTML = "<p>Info nicht verfügbar</p>");

  infoOverlay.addEventListener("click", e => {
    if (!infoContent.contains(e.target)) showMain();
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
      dailyQuoteBox.textContent =
        data.quotes[seed % data.quotes.length];
    });

  /* ================= PERSONAL QUOTES ================= */
  const personalQuoteDisplay = document.getElementById("personalQuoteDisplay");

  fetch("Daten/dailyTexts.json")
    .then(r => r.json())
    .then(d => {
      const today = new Date().toISOString().split("T")[0];
      const seed = Number(today.replaceAll("-", ""));

      function show(type) {
        personalQuoteDisplay.textContent =
          d[type][seed % d[type].length];
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
  fetch("Daten/folders.json")
    .then(r => r.json())
    .then(d => {
      const overlay = document.getElementById("folderOverlay");
      const grid = document.getElementById("folderGrid");
      const content = overlay.querySelector(".overlayContent");

      function showOverview() {
        grid.innerHTML = "";
        grid.style.display = "grid";
        content.querySelectorAll(".folderContent").forEach(e => e.remove());
        overlay.style.display = "flex";
        main.style.display = "none";

        Object.keys(d.folders).forEach(name => {
          const div = document.createElement("div");
          div.className = "folderFrame";
          div.textContent = name;
          div.onclick = () => showFolder(name);
          grid.appendChild(div);
        });
      }

      function showFolder(name) {
        grid.style.display = "none";
        const fc = document.createElement("div");
        fc.className = "folderContent";
        fc.innerHTML = `<h3>${name}</h3>` +
          d.folders[name].map(q => `<p>${q}</p>`).join("");

        const back = document.createElement("button");
        back.textContent = "← Zurück";
        back.className = "closeBtn";
        back.onclick = showOverview;

        fc.appendChild(back);
        content.appendChild(fc);
      }

      document.querySelector('[data-target="folderOverlay"]')
        .addEventListener("click", e => {
          e.preventDefault();
          showOverview();
        });
    });

  /* ================= NEWS ================= */
  async function loadNews() {
    const list = document.getElementById("newsList");
    if (!list) return;

    let items = [];
    try {
      const a = await fetch("Daten/archive.json").then(r => r.json());
      a.days.forEach(d => items.push({ date:d.date, text:d.quote }));
    } catch {}

    items.sort((a,b)=>new Date(b.date)-new Date(a.date));
    list.innerHTML = "";

    items.slice(0,3).forEach(i => {
      const div = document.createElement("div");
      div.className = "newsItem";
      div.innerHTML = `<strong>${i.date}</strong><br>${i.text}`;
      list.appendChild(div);
    });
  }
  loadNews();

  document
  .querySelector('[data-target="meinezeitOverlay"]')
  ?.addEventListener("click", e => {
    e.preventDefault();
    showMain();
    document.getElementById("meinezeitOverlay").style.display = "flex";
    main.style.display = "none";
  });

document
  .querySelector('[data-target="archiveOverlay"]')
  ?.addEventListener("click", e => {
    e.preventDefault();
    showMain();
    document.getElementById("archiveOverlay").style.display = "flex";
    main.style.display = "none";
  });

document
  .querySelector('[data-target="aboutOverlay"]')
  ?.addEventListener("click", e => {
    e.preventDefault();
    showMain();
    document.getElementById("aboutOverlay").style.display = "flex";
    main.style.display = "none";
  });

});
