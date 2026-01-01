document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu");
  const menuButton = document.getElementById("menuButton");
  const main = document.querySelector("main");
  const overlays = document.querySelectorAll(".overlay");

  /* ================= MENU BUTTON ================= */
  menuButton.onclick = () => {
    if(menu.style.right === "0px") {
      menu.style.right = "-260px";
      menu.classList.add("hidden");
    } else {
      menu.style.right = "0";
      menu.classList.remove("hidden");
    }
  };

  /* ================= OVERLAY HANDLER ================= */
  function closeAllOverlays() {
    overlays.forEach(o => o.classList.add("hidden"));
    main.style.display = "flex";
  }

  document.querySelectorAll("#menu a").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const target = a.dataset.target;
      closeAllOverlays();
      menu.style.right = "-260px";
      if(target === "home") return;
      const overlay = document.getElementById(target);
      if(overlay){ overlay.classList.remove("hidden"); main.style.display="none"; }
    });
  });

  /* ================= HEADER ================= */
  const weekday = document.getElementById("weekday");
  const daytime = document.getElementById("daytime");
  const dateEl = document.getElementById("date");
  const timeEl = document.getElementById("time");
  const dailyQuoteBox = document.getElementById("dailyQuoteBox");

  function updateHeader() {
    const now = new Date();
    const days = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
    weekday.innerText = days[now.getDay()];
    daytime.innerText = now.getHours() < 12 ? "Morgens" : now.getHours() < 18 ? "Mittags" : "Abends";
    dateEl.innerText = now.toLocaleDateString("de-DE");
    timeEl.innerText = now.toLocaleTimeString("de-DE");
  }
  updateHeader();
  setInterval(updateHeader,1000);

  async function fetchJSON(path){ try { return await fetch(path).then(r=>r.json()); } catch { return null; } }

  /* ================= TAGESZITAT ================= */
  fetchJSON("data/tageszeit.json").then(data=>{
    if(data){
      const today = new Date().toISOString().split("T")[0];
      const seed = Number(today.replaceAll("-",""));
      dailyQuoteBox.innerText = data.quotes[seed % data.quotes.length];
    }
  });

  /* ================= PERSONAL QUOTES ================= */
  const personalQuoteDisplay = document.getElementById("personalQuoteDisplay");
  fetchJSON("data/dailyTexts.json").then(d=>{
    if(!d) return;
    const today = new Date().toISOString().split("T")[0];
    const seed = Number(today.replaceAll("-",""));
    const show = (type)=>{
      personalQuoteDisplay.innerText = d[type][seed % d[type].length];
      personalQuoteDisplay.style.display = "block";
    };
    document.getElementById("morningBtn").onclick = ()=>show("morning");
    document.getElementById("noonBtn").onclick = ()=>show("noon");
    document.getElementById("eveningBtn").onclick = ()=>show("evening");
  });

  /* ================= TEILEN ================= */
  const shareBtn = document.getElementById("shareQuoteBtn");
  shareBtn.onclick = ()=>{
    const text = dailyQuoteBox.innerText || "Zitat!";
    if(navigator.share) navigator.share({title:"Tageszitat", text});
    else navigator.clipboard.writeText(text).then(()=>alert("Zitat kopiert!"));
  };

  /* ================= TAGESFOKUS ================= */
  const dailyFocusInput = document.getElementById("dailyFocusInput");
  const todayKey = "dailyFocus-" + new Date().toISOString().split("T")[0];
  dailyFocusInput.value = localStorage.getItem(todayKey) || "";
  dailyFocusInput.addEventListener("input",()=>{ localStorage.setItem(todayKey,dailyFocusInput.value); });

  /* ================= INFO OVERLAY ================= */
  fetchJSON("data/info.json").then(d=>{
    if(d) document.getElementById("infoContent").innerHTML = d.infoText.replace(/\n/g,"<br>");
  });
  const infoOverlay = document.getElementById("infoOverlay");
  document.querySelector('a[data-target="infoOverlay"]').onclick = e=>{
    e.preventDefault();
    infoOverlay.classList.remove("hidden");
    main.style.display="none";
  };
  infoOverlay.addEventListener("click", e=>{
    if(!infoOverlay.querySelector(".overlayContent").contains(e.target)){
      infoOverlay.classList.add("hidden");
      main.style.display="flex";
    }
  });

  /* ================= FOLDER OVERLAY ================= */
  fetchJSON("data/folders.json").then(d=>{
    if(!d) return;
    const grid = document.getElementById("folderGrid");
    Object.keys(d.folders).forEach(name=>{
      const div = document.createElement("div");
      div.className = "folderFrame";
      div.innerText = name;
      div.onclick = ()=>{
        const overlay = document.getElementById("folderOverlay");
        const content = overlay.querySelector(".overlayContent");
        content.innerHTML = `<h3>${name}</h3>` + d.folders[name].flat().map(q=>`<p>${q}</p>`).join("") + `<button class="closeBtn">Schließen</button>`;
        overlay.classList.remove("hidden");
        main.style.display="none";
        content.querySelector(".closeBtn").onclick = ()=>{
          overlay.classList.add("hidden");
          main.style.display="flex";
        };
      };
      grid.appendChild(div);
    });
  });

  /* ================= ARCHIV ================= */
  fetchJSON("data/archive.json").then(d=>{
    if(!d) return;
    const monthDetail = document.getElementById("monthDetail");
    monthDetail.innerHTML="";
    d.days.forEach(entry=>{
      const box = document.createElement("div");
      box.className="archiveEntry";
      box.innerHTML=`<h4>${entry.date}</h4><p>${entry.quote}</p>`;
      monthDetail.appendChild(box);
    });
  });

  /* ================= MEINE ZEIT ================= */
  fetchJSON("data/meinezeit.json").then(d=>{
    if(!d) return;
    const overlay = document.getElementById("meinezeitOverlay");
    const content = overlay.querySelector(".overlayContent");
    const grid = document.getElementById("meinezeitGrid");

    function renderOverview(){
      grid.style.display="grid";
      content.querySelectorAll(".folderContent").forEach(el=>el.remove());
      grid.innerHTML="";
      Object.keys(d.folders).forEach(name=>{
        const div = document.createElement("div");
        div.className="myTimeFolder";
        div.innerText = name;
        div.onclick=()=>renderFolder(name);
        grid.appendChild(div);
      });
      overlay.classList.remove("hidden");
      main.style.display="none";
    }

    function renderFolder(name){
      grid.style.display="none";
      const folderContent = document.createElement("div");
      folderContent.className="folderContent";
      folderContent.innerHTML=`<h3>${name}</h3>`;
      d.folders[name].forEach(e=>{
        folderContent.innerHTML+=`<h4>${e.title}</h4><p>${e.text}</p>`;
        if(e.image) folderContent.innerHTML+=`<img src="${e.image}" class="myTimeImage">`;
      });
      const backBtn = document.createElement("button");
      backBtn.innerText="← Zurück";
      backBtn.className="closeBtn";
      backBtn.onclick=()=>{
        folderContent.remove();
        renderOverview();
      };
      folderContent.appendChild(backBtn);
      content.appendChild(folderContent);
    }

    document.querySelector('a[data-target="meinezeitOverlay"]').addEventListener("click", e=>{
      e.preventDefault();
      renderOverview();
    });
  });

  /* ================= PERSONAL SLIDES ================= */
  const personalOverlay = document.getElementById("personalOverlay");
  const mainSlide = document.getElementById("mainPersonalSlide");
  const mainPersonalText = document.getElementById("mainPersonalText");
  const personalSlidesContainer = document.getElementById("personalSlidesContainer");
  const startSlidesBtn = document.getElementById("startSlidesBtn");
  const prevSlide = document.getElementById("prevSlide");
  const nextSlide = document.getElementById("nextSlide");
  const progress = document.getElementById("personalSlidesProgress");

  let personalData = null;
  let index = -1;

  fetchJSON("data/personalSlides.json").then(data=>{
    if(!data) return;
    personalData=data;
    renderSlides();
  });

  function renderSlides(){
    if(!personalData) return;
    personalSlidesContainer.innerHTML="";
    if(index===-1){
      mainPersonalText.innerHTML=`<h2>${personalData.intro.title}</h2><p>${personalData.intro.text.replace(/\n/g,"<br>")}</p>`;
      mainSlide.classList.remove("hidden");
      progress.innerText="";
      return;
    }
    mainSlide.classList.add("hidden");
    personalData.slides.forEach((slide,i)=>{
      const div=document.createElement("div");
      div.className="personalSlide";
      if(i===index) div.classList.add("active");
      div.innerHTML=`<h3>${slide.title}</h3><p>${slide.text.replace(/\n/g,"<br>")}</p>`;
      personalSlidesContainer.appendChild(div);
    });
    progress.innerText=`${index+1} / ${personalData.slides.length}`;
  }

  startSlidesBtn.onclick = ()=>{ index=0; renderSlides(); };
  prevSlide.onclick = ()=>{ if(!personalData) return; index=index>0?index-1:personalData.slides.length-1; renderSlides(); };
  nextSlide.onclick = ()=>{ if(!personalData) return; index=index<personalData.slides.length-1?index+1:-1; renderSlides(); };

  /* ================= NEWS ================= */
  async function loadNews(){
    const newsList = document.getElementById("newsList");
    if(!newsList) return;
    let allEntries=[];

    try{
      const archive = await fetchJSON("data/archive.json");
      archive.days.forEach(e=>allEntries.push({source:"Archiv", location:"Archiv", date:e.date, text:e.quote}));
    }catch{}

    try{
      const meinezeit = await fetchJSON("data/meinezeit.json");
      Object.keys(meinezeit.folders).forEach(folder=>{
        meinezeit.folders[folder].forEach(e=>{
          if(e.date) allEntries.push({source:"Meine Zeit", location:`Meine Zeit → ${folder}`, date:e.date, text:e.title});
        });
      });
    }catch{}

    allEntries.sort((a,b)=>new Date(b.date)-new Date(a.date));
    const latestThree = allEntries.slice(0,3);
    const hash = JSON.stringify(latestThree);
    const lastHash = localStorage.getItem("newsHash");
    if(hash===lastHash) return;
    localStorage.setItem("newsHash", hash);

    newsList.innerHTML="";
    latestThree.forEach(item=>{
      const div=document.createElement("div");
      div.className="newsItem";
      div.innerHTML=`<div class="newsMeta"><span class="newsLocation">📍 ${item.location}</span> · <span class="newsDate">📅 ${item.date}</span></div><div class="newsText">${item.text}</div>`;
      newsList.appendChild(div);
    });
  }

  loadNews();

});
