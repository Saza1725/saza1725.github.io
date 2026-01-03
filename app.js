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

  showMain();

  /* ================= MENU ================= */
  menuButton.onclick = () => menu.style.right = menu.style.right === "0px" ? "-260px" : "0";

  document.querySelectorAll("#menu a").forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = link.dataset.target;
      menu.style.right = "-260px";
      if(target === "home") showMain();
      else document.dispatchEvent(new CustomEvent("openSection", { detail: target }));
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
    daytime.textContent = now.getHours() < 12 ? "Morgens" : now.getHours() < 18 ? "Mittags" : "Abends";
    dateEl.textContent = now.toLocaleDateString("de-DE");
    timeEl.textContent = now.toLocaleTimeString("de-DE");
  }
  updateHeader();
  setInterval(updateHeader,1000);

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
        renderFn?.();
        overlay.style.display = "flex";
        main.style.display = "none";
      }
    });
  }

  /* ================= TAGESZITAT ================= */
  const dailyQuoteBox = document.getElementById("dailyQuoteBox");
  fetch("Daten/tageszeit.json")
    .then(r => r.json())
    .then(data => {
      if(dailyQuoteBox && data.quotes?.length){
        const today = new Date().toISOString().split("T")[0];
        const seed = Number(today.replaceAll("-",""));
        dailyQuoteBox.textContent = data.quotes[seed % data.quotes.length];
      }
    })
    .catch(()=>dailyQuoteBox.textContent="Tageszitat nicht verfügbar");

  /* ================= PERSONAL QUOTES ================= */
  const personalQuoteDisplay = document.getElementById("personalQuoteDisplay");
  fetch("Daten/dailyTexts.json")
    .then(r=>r.json())
    .then(d=>{
      const today = new Date().toISOString().split("T")[0];
      const seed = Number(today.replaceAll("-",""));
      function show(type){
        if(d[type]?.length && personalQuoteDisplay){
          personalQuoteDisplay.textContent = d[type][seed % d[type].length];
          personalQuoteDisplay.style.display="block";
        }
      }
      document.getElementById("morningBtn").onclick = ()=>show("morning");
      document.getElementById("noonBtn").onclick = ()=>show("noon");
      document.getElementById("eveningBtn").onclick = ()=>show("evening");
    });

  /* ================= TAGESFOKUS ================= */
  const focusInput = document.getElementById("dailyFocusInput");
  if(focusInput){
    const focusKey = "focus-" + new Date().toISOString().split("T")[0];
    focusInput.value = localStorage.getItem(focusKey) || "";
    focusInput.oninput = ()=>localStorage.setItem(focusKey, focusInput.value);
  }

  /* ================= TEILEN ================= */
  const shareBtn = document.getElementById("shareQuoteBtn");
  if(shareBtn) shareBtn.onclick = () => {
    const quote = dailyQuoteBox?.textContent || "";
    if(!quote) return;
    if(navigator.share) navigator.share({ title: "Tageszitat", text: quote }).catch(()=>{});
    else { navigator.clipboard.writeText(quote); alert("Zitat kopiert"); }
  };

  /* ================= FOLDER / MEINE ZEIT / ARCHIV ================= */
  async function loadJSON(url){ try{ return await fetch(url).then(r=>r.json()); } catch{ return null; } }

  // Zitate
  createOverlayHandler("folderOverlay", async ()=>{
    const d = await loadJSON("Daten/folders.json"); if(!d) return;
    const grid = document.getElementById("folderGrid");
    grid.innerHTML="";
    Object.keys(d.folders).forEach(name=>{
      const div=document.createElement("div");
      div.className="folderFrame"; div.textContent=name;
      div.onclick=()=>renderFolder(name,d.folders,grid);
      grid.appendChild(div);
    });
  });
  function renderFolder(name,folders,grid){
    grid.innerHTML="";
    const fc=document.createElement("div"); fc.className="folderContent";
    fc.innerHTML=`<h3>${name}</h3>`;
    folders[name].forEach(q=>{ const p=document.createElement("p"); p.textContent=q; fc.appendChild(p); });
    const backBtn=document.createElement("button"); backBtn.textContent="← Zurück"; backBtn.className="closeBtn";
    backBtn.onclick=e=>{ e.stopPropagation(); createOverlayHandler("folderOverlay",()=>{}); };
    fc.appendChild(backBtn); grid.appendChild(fc);
  }

  // Meine Zeit
  createOverlayHandler("meinezeitOverlay", async ()=>{
    const d = await loadJSON("Daten/meinezeit.json"); if(!d) return;
    const grid = document.getElementById("meinezeitGrid"); grid.innerHTML="";
    Object.keys(d.folders).forEach(name=>{
      const div=document.createElement("div"); div.className="myTimeFolder"; div.textContent=name;
      div.onclick=()=>renderMyTime(name,d.folders,grid); grid.appendChild(div);
    });
  });
  function renderMyTime(name,folders,grid){
    grid.innerHTML=""; const fc=document.createElement("div"); fc.className="folderContent"; fc.innerHTML=`<h3>${name}</h3>`;
    folders[name].forEach(e=>{
      fc.innerHTML+=`<h4>${e.title}</h4><p>${e.text}</p>`;
      if(e.image) fc.innerHTML+=`<img src="${e.image}" class="myTimeImage">`;
    });
    const backBtn=document.createElement("button"); backBtn.textContent="← Zurück"; backBtn.className="closeBtn";
    backBtn.onclick=e=>{ e.stopPropagation(); createOverlayHandler("meinezeitOverlay",()=>{}); };
    fc.appendChild(backBtn); grid.appendChild(fc);
  }

  // Archiv
  createOverlayHandler("archiveOverlay", async ()=>{
    const d = await loadJSON("Daten/archive.json"); if(!d) return;
    const monthDetail=document.getElementById("monthDetail"); monthDetail.innerHTML="";
    d.days.forEach(entry=>{
      const box=document.createElement("div"); box.className="archiveEntry";
      box.innerHTML=`<h4>${entry.date}</h4><p>${entry.quote}</p>`; monthDetail.appendChild(box);
    });
  });

  // Info
  createOverlayHandler("infoOverlay", async ()=>{
    const d = await loadJSON("Daten/info.json");
    document.getElementById("infoContent").innerHTML=d?.infoText || "<p>Info nicht verfügbar</p>";
  });

  /* ================= PERSONAL SLIDES ================= */
  createOverlayHandler("personalOverlay", async ()=>{
    const d = await loadJSON("Daten/personalSlides.json"); if(!d) return;
    const container=document.getElementById("personalSlidesContainer");
    const progress=document.getElementById("personalSlidesProgress");
    const prevBtn=document.getElementById("prevSlide"); const nextBtn=document.getElementById("nextSlide");
    let slides = d.slides || []; let index=0;

    function renderSlide(i){
      container.innerHTML=`<h3>${slides[i].title}</h3><p>${slides[i].text.replace(/\n/g,"<br>")}</p>`;
      progress.textContent=`${i+1} / ${slides.length}`;
      prevBtn.style.display=i===0?"none":"inline-block";
      nextBtn.style.display=i===slides.length-1?"none":"inline-block";
    }
    prevBtn.onclick=()=>{ if(index>0){index--; renderSlide(index);} };
    nextBtn.onclick=()=>{ if(index<slides.length-1){index++; renderSlide(index);} };
    renderSlide(0);
  });

  /* ================= NEWS & GLOCKE ================= */
  const newsContainer = document.getElementById("newsContainer");
  const newsBell = document.getElementById("newsBell");
  const NEWS_KEY = "lastSeenNewsTimestamp";
  let latestTimestamp = Number(localStorage.getItem(NEWS_KEY)) || 0;

  async function collectNews(){
    const sources=["Daten/archive.json","Daten/personalSlides.json","Daten/meinezeit.json"];
    let allNews=[];
    for(const file of sources){
      const d = await loadJSON(file);
      if(!d) continue;
      if(file.includes("archive")) d.days.forEach(day=>allNews.push({title:day.date,text:day.quote,time:new Date(day.date).getTime()}));
      else if(file.includes("personalSlides")){
        allNews.push({title:d.intro.title,text:d.intro.text,time:Date.now()});
        (d.slides||[]).forEach(s=>allNews.push({title:s.title,text:s.text,time:Date.now()}));
      } else if(file.includes("meinezeit")){
        Object.values(d.folders).forEach(arr=>arr.forEach(e=>allNews.push({title:e.title,text:e.text,time:Date.now()})));
      }
    }
    allNews.sort((a,b)=>b.time-a.time);
    if(allNews[0]?.time > latestTimestamp){
      newsBell?.classList.add("new");
      latestTimestamp = allNews[0].time;
      localStorage.setItem(NEWS_KEY,latestTimestamp);
    }
    if(newsContainer){
      newsContainer.innerHTML="";
      allNews.slice(0,5).forEach(n=>{
        const div=document.createElement("div"); div.className="newsItem clickable";
        div.innerHTML=`<div class="newsHeader">${n.title}</div><div class="newsText">${n.text}</div>`;
        newsContainer.appendChild(div);
      });
    }
  }

  newsBell?.addEventListener("click", ()=>{
    newsBell.classList.remove("new");
    newsContainer.scrollIntoView({behavior:"smooth"});
  });

  collectNews();
  setInterval(collectNews,30000);

  /* ================= INTRO ================= */
  const introOverlay=document.getElementById("introOverlay");
  const introCard=document.getElementById("introCard");
  const introTextEl=document.getElementById("introText");
  const introBtn=document.getElementById("introButton");
  const playBtn=document.getElementById("playIntroBtn");

  const DEV_MODE=false;
  if(DEV_MODE){ introOverlay.style.display="none"; }

  const audio=new Audio("introMusic.mp3"); audio.volume=0.4;
  const textContent=introTextEl.textContent; introTextEl.textContent=""; introTextEl.style.whiteSpace="pre-line";
  let i=0;
  function typeWriter(){ if(i<textContent.length){ introTextEl.textContent+=textContent.charAt(i); i++; setTimeout(typeWriter,50); } else { introBtn.disabled=false; introBtn.classList.add("active"); } }
  function startIntro(){ introOverlay.style.display="flex"; setTimeout(()=>introCard.classList.add("show"),200); audio.play().catch(()=>{}); typeWriter(); }

  if(playBtn) playBtn.addEventListener("click", startIntro); else startIntro();
  introBtn.onclick=()=>{ introOverlay.style.opacity=0; setTimeout(()=>introOverlay.style.display="none",800); audio.pause(); };

});
