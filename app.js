document.addEventListener("DOMContentLoaded", () => {

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

  // Start
  showMain();

  // Menü öffnen / schließen
  menuButton.onclick = () => {
    menu.style.right = menu.style.right === "0px" ? "-260px" : "0";
  };

  // Menü Links
  document.querySelectorAll("#menu a").forEach(link => {
    link.onclick = e => {
      e.preventDefault();
      const target = link.dataset.target;
      menu.style.right = "-260px";

      if (target === "home") {
        showMain();
        return;
      }

      hideAllOverlays();
      const overlay = document.getElementById(target);
      if (overlay) {
        overlay.style.display = "flex";
        main.style.display = "none";
      }
    };
  });

});
