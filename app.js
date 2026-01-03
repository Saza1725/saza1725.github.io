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

  /* ================= EINHEITLICHE OVERLAY-FUNKTION ================= */
  function setupOverlay(overlayId, renderContentFn) {
    let overlay = document.getElementById(overlayId);
    let content, textContainer;

    // Overlay erstellen, falls nicht vorhanden
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = overlayId;
      overlay.className = "overlay";

      content = document.createElement("div");
      content.className = "overlayContent";
      content.addEventListener("click", e => e.stopPropagation()); // Klicks IM Overlay blockieren

      textContainer = document.createElement("div");
      textContainer.className = "overlayTextContainer";
      content.appendChild(textContainer);

      const closeBtn = document.createElement("button");
      closeBtn.innerText = "← Zurück";
      closeBtn.className = "closeBtn";
      closeBtn.onclick = e => {
        e.stopPropagation();
        showMain();
      };
      content.appendChild(closeBtn);

      overlay.appendChild(content);
      document.body.appendChild(overlay);
    } else {
      content = overlay.querySelector(".overlayContent");
      textContainer = content.querySelector(".overlayTextContainer");
    }

    // Klick außerhalb schließt Overlay
    overlay.addEventListener("click", () => showMain());

    // Overlay öffnen über Menü
    document.addEventListener("openSection", e => {
      if (e.detail === overlayId) {
        hideAllOverlays();
        overlay.style.display = "flex";
        main.style.display = "none";

        if (renderContentFn) renderContentFn(textContainer);
      }
    });

    return { overlay, content, textContainer };
  }

  /* ================= ÜBER MICH ================= */
  setupOverlay("aboutOverlay", container => {
    fetch("Daten/about.json")
      .then(r => r.json())
      .then(d => { container.innerHTML = d.aboutText; })
      .catch(() => { container.innerHTML = "<p>Über mich-Text nicht verfügbar.</p>"; });
  });

  /* ================= ZITATE (FOLDERS) ================= */
  fetch("Daten/folders.json").then(r => r.json()).then(d => {
    const grid = document.getElementById("folderGrid");

    setupOverlay("folderOverlay", container => {
      grid.style.display = "grid";
      grid.innerHTML = "";

      Object.keys(d.folders).forEach(name => {
        const div = document.createElement("div");
        div.className = "folderFrame";
        div.textContent = name;
        div.onclick = () => renderFolder(name, container);
        grid.appendChild(div);
      });
    });

    function renderFolder(name, container) {
      grid.style.display = "none";
      container.innerHTML = "";

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
      backBtn.onclick = e => {
        e.stopPropagation();
        grid.style.display = "grid";
        container.innerHTML = "";
        Object.keys(d.folders).forEach(name => {
          const div = document.createElement("div");
          div.className = "folderFrame";
          div.textContent = name;
          div.onclick = () => renderFolder(name, container);
          grid.appendChild(div);
        });
      };

      fc.appendChild(backBtn);
      container.appendChild(fc);
    }
  });

  /* ================= MEINE ZEIT ================= */
  fetch("Daten/meinezeit.json").then(r => r.json()).then(d => {
    const grid = document.getElementById("meinezeitGrid");

    setupOverlay("meinezeitOverlay", container => {
      grid.style.display = "grid";
      grid.innerHTML = "";

      Object.keys(d.folders).forEach(name => {
        const div = document.createElement("div");
        div.className = "myTimeFolder";
        div.textContent = name;
        div.onclick = () => renderFolder(name, container);
        grid.appendChild(div);
      });
    });

    function renderFolder(name, container) {
      grid.style.display = "none";
      container.innerHTML = "";

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
      backBtn.onclick = e => {
        e.stopPropagation();
        grid.style.display = "grid";
        container.innerHTML = "";
        Object.keys(d.folders).forEach(name => {
          const div = document.createElement("div");
          div.className = "myTimeFolder";
          div.textContent = name;
          div.onclick = () => renderFolder(name, container);
          grid.appendChild(div);
        });
      };

      fc.appendChild(backBtn);
      container.appendChild(fc);
    }
  });

  /* ================= ARCHIVE ================= */
  fetch("Daten/archive.json").then(r => r.json()).then(d => {
    const monthDetail = document.getElementById("monthDetail");

    setupOverlay("archiveOverlay", container => {
      monthDetail.innerHTML = "";
      d.days.forEach(entry => {
        const box = document.createElement("div");
        box.className = "archiveEntry";
        box.innerHTML = `<h4>${entry.date}</h4><p>${entry.quote}</p>`;
        monthDetail.appendChild(box);
      });
    });
  });

  /* ================= INFO ================= */
  const infoContent = document.getElementById("infoContent");
  setupOverlay("infoOverlay", container => {
    fetch("Daten/info.json")
      .then(r => r.json())
      .then(d => container.innerHTML = d.infoText)
      .catch(() => container.innerHTML = "<p>Info nicht verfügbar</p>");
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

});
