document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu");
  const menuButton = document.getElementById("menuButton");
  const main = document.querySelector("main");
  const overlays = document.querySelectorAll(".overlay");

  menuButton.onclick = () => {
    menu.style.right = menu.style.right === "0px" ? "-260px" : "0";
  };

  function closeAllOverlays() {
    overlays.forEach(o => o.style.display = "none");
    main.style.display = "flex";
    menu.style.right = "-260px";
  }

  document.querySelectorAll("#menu a").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const target = a.dataset.target;
      closeAllOverlays();
      if (target === "home") return;
      const overlay = document.getElementById(target);
      overlay.style.display = "flex";
      main.style.display = "none";
    });
  });

  // ================= INFO OVERLAY =================
const infoOverlay = document.getElementById("infoOverlay");
const infoContent = document.getElementById("infoContent");

// Info laden
fetch("./Daten/info.json")
  .then(r => {
    if (!r.ok) throw new Error("info.json nicht gefunden");
    return r.json();
  })
  .then(d => {
    infoContent.innerHTML = d.infoText;
  })
  .catch(err => {
    infoContent.innerHTML = "<p>Info konnte nicht geladen werden.</p>";
    console.error(err);
  });

// Schließen bei Klick außerhalb
infoOverlay.addEventListener("click", e => {
  if (!infoContent.contains(e.target)) {
    infoOverlay.style.display = "none";
    main.style.display = "flex";
  }
});


  // Tageszeit
  const weekday = document.getElementById("weekday");
  const daytime = document.getElementById("daytime");
  const dateEl = document.getElementById("date");
  const timeEl = document.getElementById("time");
  const dailyQuoteBox = document.getElementById("dailyQuoteBox");

  function updateHeader() {
    const now = new Date();
    const days = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
    weekday.innerText = days[now.getDay()];
    daytime.innerText = now.getHours()<12?"Morgens":now.getHours()<18?"Mittags":"Abends";
    dateEl.innerText = now.toLocaleDateString("de-DE");
    timeEl.innerText = now.toLocaleTimeString("de-DE");
  }
  updateHeader();
  setInterval(updateHeader,1000);

  fetch("Daten/tageszeit.json").then(r=>r.json()).then(data=>{
    const today = new Date().toISOString().split("T")[0];
    const seed = Number(today.replaceAll("-",""));
    dailyQuoteBox.innerText = data.quotes[seed % data.quotes.length];
  });

  // Personal Quotes
  const personalQuoteDisplay = document.getElementById("personalQuoteDisplay");
  fetch("Daten/dailyTexts.json").then(r=>r.json()).then(d=>{
    const today = new Date().toISOString().split("T")[0];
    const seed = Number(today.replaceAll("-",""));
    function show(type){personalQuoteDisplay.innerText=d[type][seed%d[type].length];personalQuoteDisplay.style.display="block";}
    document.getElementById("morningBtn").onclick=()=>show("morning");
    document.getElementById("noonBtn").onclick=()=>show("noon");
    document.getElementById("eveningBtn").onclick=()=>show("evening");
  });

  // Share Button
  const shareBtn=document.getElementById("shareQuoteBtn");
  shareBtn.addEventListener("click",()=>{
    const quote=dailyQuoteBox.innerText.trim();
    if(navigator.share){navigator.share({title:'Tageszitat',text:quote}).catch(()=>{});} 
    else{navigator.clipboard.writeText(quote).then(()=>alert("Zitat kopiert!"));}
  });

  // Tagesfokus
  const dailyFocusInput=document.getElementById("dailyFocusInput");
  const todayKey="dailyFocus-"+new Date().toISOString().split("T")[0];
  dailyFocusInput.value=localStorage.getItem(todayKey)||"";
  dailyFocusInput.addEventListener("input",()=>{localStorage.setItem(todayKey,dailyFocusInput.value);});

  // FOLDER OVERLAY
  fetch("Daten/folders.json").then(r=>r.json()).then(d=>{
    const grid=document.getElementById("folderGrid");
    Object.keys(d.folders).forEach(name=>{
      const div=document.createElement("div");
      div.className="folderFrame";
      div.innerText=name;
      div.onclick = () => {
  const overlay = document.getElementById("folderOverlay");
  const content = overlay.querySelector(".overlayContent");
  main.style.display = "none";
  overlay.style.display = "flex";
  content.innerHTML = `
    <h3>${name}</h3>
    ${d.folders[name].map(q => `<p>${q}</p>`).join("")}
    <button id="folderBackBtn">← Zurück</button>
  `;
  
  // Button klickbar machen
  content.querySelector("#folderBackBtn").onclick = () => {
    overlay.style.display = "none";
    main.style.display = "flex";
    };
  };

  // Meine Zeit Overlay
  fetch("Daten/meinezeit.json").then(r=>r.json()).then(d=>{
    const overlay=document.getElementById("meinezeitOverlay");
    const content=overlay.querySelector(".overlayContent");
    const grid=document.getElementById("meinezeitGrid");
    function renderOverview(){
      grid.style.display="grid";
      content.querySelectorAll(".folderContent").forEach(el=>el.remove());
      grid.innerHTML="";
      Object.keys(d.folders).forEach(name=>{
        const div=document.createElement("div");
        div.className="myTimeFolder";
        div.innerText=name;
        div.onclick=()=>renderFolder(name);
        grid.appendChild(div);
      });
      overlay.style.display="flex";
      main.style.display="none";
    }
    function renderFolder(name){
      grid.style.display="none";
      const folderContent=document.createElement("div");
      folderContent.className="folderContent";
      folderContent.innerHTML=`<h3>${name}</h3>`;
      d.folders[name].forEach(e=>{
        folderContent.innerHTML+=`<h4>${e.title}</h4><p>${e.text}</p>`;
        if(e.image) folderContent.innerHTML+=`<img src="${e.image}" class="myTimeImage">`;
      });
      const backBtn=document.createElement("button");
      backBtn.innerText="← Zurück";
      backBtn.className="closeBtn";
      backBtn.onclick=()=>{folderContent.remove();renderOverview();};
      folderContent.appendChild(backBtn);
      content.appendChild(folderContent);
    }
    document.querySelector('a[data-target="meinezeitOverlay"]').addEventListener("click",e=>{e.preventDefault();renderOverview();});
  });

  // Archive Overlay
  fetch("Daten/archive.json").then(r=>r.json()).then(d=>{
    const monthDetail=document.getElementById("monthDetail");
    monthDetail.innerHTML="";
    d.days.forEach(entry=>{
      const box=document.createElement("div");
      box.className="archiveEntry";
      box.innerHTML=`<h4>${entry.date}</h4><p>${entry.quote}</p>`;
      monthDetail.appendChild(box);
    });
  });

  // Personal Slides
  const personalOverlay=document.getElementById("personalOverlay");
  const mainSlide=document.getElementById("mainPersonalSlide");
  const mainPersonalText=document.getElementById("mainPersonalText");
  const personalSlidesContainer=document.getElementById("personalSlidesContainer");
  const startSlidesBtn=document.getElementById("startSlidesBtn");
  const prevSlide=document.getElementById("prevSlide");
  const nextSlide=document.getElementById("nextSlide");
  const progress=document.getElementById("personalSlidesProgress");
  let personalData=null,index=-1;
  fetch("Daten/personalSlides.json").then(r=>r.json()).then(data=>{personalData=data;renderSlides();});
  function renderSlides(){
    if(!personalData) return;
    personalSlidesContainer.innerHTML="";
    if(index===-1){
      mainPersonalText.innerHTML=`<h2>${personalData.intro.title}</h2><p>${personalData.intro.text.replace(/\n/g,"<br>")}</p>`;
      mainSlide.style.display="block";
      setTimeout(()=>mainSlide.classList.add("active"),50);
      progress.innerText="";
      return;
    }
    mainSlide.style.display="none";
    mainSlide.classList.remove("active");
    personalData.slides.forEach((slide,i)=>{
      const div=document.createElement("div");
      div.className="personalSlide";
      if(i===index) div.classList.add("active");
      div.innerHTML=`<h3>${slide.title}</h3><p>${slide.text.replace(/\n/g,"<br>")}</p>`;
      personalSlidesContainer.appendChild(div);
    });
    progress.innerText=`${index+1} / ${personalData.slides.length}`;
  }
  startSlidesBtn.onclick=()=>{index=0;renderSlides();};
  prevSlide.onclick=()=>{index=index>0?index-1:personalData.slides.length-1;renderSlides();};
  nextSlide.onclick=()=>{index=index<personalData.slides.length-1?index+1:-1;renderSlides();};

  // News
  async function loadNews(){
    const newsList=document.getElementById("newsList");
    if(!newsList) return;
    let allEntries=[];
    try{const archive=await fetch("Daten/archive.json").then(r=>r.json());archive.days.forEach(e=>{allEntries.push({source:"Archiv",location:"Archiv",date:e.date,text:e.quote});});}catch{}
    try{const meinezeit=await fetch("Daten/meinezeit.json").then(r=>r.json());Object.keys(meinezeit.folders).forEach(folder=>{meinezeit.folders[folder].forEach(e=>{if(e.date){allEntries.push({source:"Meine Zeit",location:`Meine Zeit → ${folder}`,date:e.date,text:e.title});}});});}catch{}
    allEntries.sort((a,b)=>new Date(b.date)-new Date(a.date));
    const latestThree=allEntries.slice(0,3);
    const hash=JSON.stringify(latestThree);
    const lastHash=localStorage.getItem("newsHash");
    if(hash===lastHash) return;
    localStorage.setItem("newsHash",hash);
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
