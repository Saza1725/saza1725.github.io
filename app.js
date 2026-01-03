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

    // Menü schließen
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

  /* ================= OVERLAY-FUNKTION ================= */
  function createOverlayHandler(overlayId, renderFn) {
  const overlay = document.getElementById(overlayId);
  if (!overlay) return;

  const content = overlay.querySelector(".overlayContent");

  // 🔒 Klicks IM Overlay blockieren
  content.addEventListener("click", e => e.stopPropagation());

  // 👇 Klick AUSSERHALB schließt Overlay
  overlay.addEventListener("click", () => showMain());

  document.addEventListener("openSection", e => {
  if (e.detail === "aboutOverlay") {
    hideAllOverlays();
    aboutOverlay.style.display = "flex";
    main.style.display = "none";
  }
});
}


  /* ================= ZITATE ================= */
  fetch("Daten/folders.json")
  .then(r => r.json())
  .then(d => {
    const grid = document.getElementById("folderGrid");
    const overlay = document.getElementById("folderOverlay");
    const content = overlay.querySelector(".overlayContent");

    let currentView = "overview";

    function renderOverview() {
      currentView = "overview";
      grid.innerHTML = "";
      grid.style.display = "grid";
      content.querySelectorAll(".folderContent").forEach(e => e.remove());

      Object.keys(d.folders).forEach(name => {
        const div = document.createElement("div");
        div.className = "folderFrame";
        div.textContent = name;
        div.onclick = () => renderFolder(name);
        grid.appendChild(div);
      });
    }

    function renderFolder(name) {
      currentView = "folder";
      grid.style.display = "none";
      content.querySelectorAll(".folderContent").forEach(e => e.remove());

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
backBtn.onclick = (e) => {
  e.stopPropagation();   // 🔥 DAS ist der Schlüssel
  renderOverview();
};


      fc.appendChild(backBtn);
      content.appendChild(fc);
    }

    createOverlayHandler("folderOverlay", renderOverview);
  });


  /* ================= MEINE ZEIT ================= */
  fetch("Daten/meinezeit.json")
    .then(r => r.json())
    .then(d => {
      const overlay = document.getElementById("meinezeitOverlay");
      const content = overlay.querySelector(".overlayContent");
      const grid = document.getElementById("meinezeitGrid");

      function renderOverview() {
        grid.innerHTML = "";
        grid.style.display = "grid";
        content.querySelectorAll(".folderContent").forEach(e => e.remove());

        Object.keys(d.folders).forEach(name => {
          const div = document.createElement("div");
          div.className = "myTimeFolder";
          div.textContent = name;
          div.onclick = () => renderFolder(name);
          grid.appendChild(div);
        });
      }

      function renderFolder(name) {
        grid.style.display = "none";
        content.querySelectorAll(".folderContent").forEach(e => e.remove());

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

      createOverlayHandler("meinezeitOverlay", renderOverview);
    });

  /* ================= ARCHIVE ================= */
  fetch("Daten/archive.json")
    .then(r => r.json())
    .then(d => {
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

  /* ================= ÜBER MICH OVERLAY ================= */
let aboutOverlay = document.getElementById("aboutOverlay");
let aboutContent;

if (!aboutOverlay) {
  // Overlay erstellen
  aboutOverlay = document.createElement("div");
  aboutOverlay.id = "aboutOverlay";
  aboutOverlay.className = "overlay";

  // Inhalt erstellen
  aboutContent = document.createElement("div");
  aboutContent.id = "aboutContent";
  aboutContent.className = "overlayContent";

  // Schließen-Button
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "← Zurück";
  closeBtn.className = "closeBtn";
  closeBtn.onclick = e => {
    e.stopPropagation(); // 🔥 verhindert sofortiges Schließen
    showMain();
  };

  aboutContent.appendChild(closeBtn);
  aboutOverlay.appendChild(aboutContent);
  document.body.appendChild(aboutOverlay);
} else {
  aboutContent = aboutOverlay.querySelector(".overlayContent");
}

createOverlayHandler("aboutOverlay");

fetch("Daten/about.json")
  .then(r => r.json())
  .then(d => {
    aboutContent.innerHTML = d.aboutText;

    // Schließen-Button erneut hinzufügen, damit er immer da ist
    const closeBtn = document.createElement("button");
    closeBtn.innerText = "← Zurück";
    closeBtn.className = "closeBtn";
    closeBtn.onclick = e => {
      e.stopPropagation();
      showMain();
    };
    aboutContent.appendChild(closeBtn);
  })
  .catch(() => {
    aboutContent.innerHTML = "<p>Über mich-Text nicht verfügbar.</p>";
    const closeBtn = document.createElement("button");
    closeBtn.innerText = "← Zurück";
    closeBtn.className = "closeBtn";
    closeBtn.onclick = e => {
      e.stopPropagation();
      showMain();
    };
    aboutContent.appendChild(closeBtn);
  });


// Menü-Button Integration (sichtbar über Overlay)
menuButton.onclick = () => {
  menu.style.right = menu.style.right === "0px" ? "-260px" : "0";
  // Overlay bleibt sichtbar, Menü ist überlagert
  aboutOverlay.style.zIndex = "2000"; // Overlay unter Menü
  menu.style.zIndex = "6000";          // Menü über Overlay
};

// Funktion zum Öffnen Overlay
function openAboutOverlay() {
  aboutOverlay.style.display = "flex";
  main.style.display = "none";
}


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

});
