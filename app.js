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

      document.dispatchEvent(new CustomEvent("openSection", { detail: target }));
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

  let slides=[]; let currentSlide=0;

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

  /* ================= NEWS + GLOCKE ================= */
  const NEWS_KEY = "lastSeenNewsDate";
  const newsContainer = document.getElementById("newsContainer");
  const newsBell = document.getElementById("newsBell");
  let hasNewNews = false;

  async function loadNews() {
    try {
      const [archiveRes, slidesRes, meinezeitRes] = await Promise.all([
        fetch("Daten/archive.json"),
        fetch("Daten/personalSlides.json"),
        fetch("Daten/meinezeit.json")
      ]);
      const archive = await archiveRes.json();
      const slides = await slidesRes.json();
      const mz = await meinezeitRes.json();

      const allNews = [];

      archive.days.forEach(d=>allNews.push({title:d.date,text:d.quote,time:new Date(d.date).getTime()}));
      allNews.push({title:slides.intro.title,text:slides.intro.text,time:Date.now()});
      slides.slides.forEach(s=>allNews.push({title:s.title,text:s.text,time:Date.now()}));
      Object.values(mz.folders).forEach(arr=>arr.forEach(e=>allNews.push({title:e.title,text:e.text,time:Date.now()})));

      allNews.sort((a,b)=>b.time-a.time);

      const latestTime = allNews[0]?.time || 0;
      const lastSeen = Number(localStorage.getItem(NEWS_KEY)) || 0;

      if(latestTime > lastSeen){
        hasNewNews = true;
        newsBell?.classList.add("new");
      }

      newsContainer.innerHTML="";
      allNews.slice(0,5).forEach(n=>{
        const div = document.createElement("div");
        div.className="newsItem clickable";
        div.innerHTML=`<div class="newsHeader">${n.title}</div><div class="newsText">${n.text}</div>`;
        newsContainer.appendChild(div);
      });
    } catch(e){
      console.error("Fehler beim Laden der News:",e);
    }
  }

  loadNews();
  setInterval(loadNews, 20000);

  newsBell?.addEventListener("click", ()=>{
    newsBell.classList.remove("new");
    hasNewNews=false;
    localStorage.setItem(NEWS_KEY, Date.now());
    newsContainer.scrollIntoView({behavior:"smooth"});
  });

  /* ================= INTRO ================= */
  const overlay = document.getElementById("introOverlay");
  const card = document.getElementById("introCard");
  const textEl = document.getElementById("introText");
  const button = document.getElementById("introButton");
  const playBtn = document.getElementById("playIntroBtn");

  const DEV_MODE = false;
  if(DEV_MODE){ overlay.style.display="none"; }

  const audio = new Audio("introMusic.mp3");
  audio.volume = 0.4;

  const introText = textEl.textContent;
  textEl.textContent="";
  textEl.style.whiteSpace="pre-line";
  let i=0;

  function typeWriter(){
    if(i<introText.length){
      textEl.textContent+=introText.charAt(i);
      i++;
      setTimeout(typeWriter,50);
    } else {
      button.disabled=false;
      button.classList.add("active");
    }
  }

  function startIntro(){
    overlay.style.display="flex";
    setTimeout(()=>card.classList.add("show"),200);
    audio.play().catch(()=>{});
    typeWriter();
  }

  if(playBtn){ playBtn.addEventListener("click", startIntro); }
  else { startIntro(); }

  button.onclick=()=>{
    overlay.style.opacity=0;
    setTimeout(()=>overlay.style.display="none",800);
    audio.pause();
  };

});
