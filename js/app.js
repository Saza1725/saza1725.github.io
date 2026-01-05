/* ===== BASIS ===== */
const menu = document.getElementById("menu");
const menuButton = document.getElementById("menuButton");
const overlay = document.getElementById("overlay");
const overlayContent = document.getElementById("overlayContent");
const closeOverlay = document.getElementById("closeOverlay");

/* ===== MENU ===== */
menuButton.onclick = () => {
  menu.style.right = menu.style.right === "0px" ? "-240px" : "0px";
};

/* ===== OVERLAY HANDLER ===== */
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

/* ===== HEADER TIME ===== */
function updateHeader() {
  const now = new Date();
  const days = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
  document.getElementById("weekday").textContent = days[now.getDay()];
  document.getElementById("date").textContent = now.toLocaleDateString("de-DE");
  document.getElementById("time").textContent = now.toLocaleTimeString("de-DE");
}
updateHeader();
setInterval(updateHeader, 1000);

/* ===== FOCUS ===== */
const focusInput = document.getElementById("dailyFocusInput");
const key = "focus-" + new Date().toISOString().split("T")[0];
focusInput.value = localStorage.getItem(key) || "";
focusInput.oninput = () => localStorage.setItem(key, focusInput.value);
