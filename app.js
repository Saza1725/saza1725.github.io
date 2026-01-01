document.addEventListener("DOMContentLoaded", async () => {

async function safeFetchJSON(path){ try{ const res=await fetch(path); if(!res.ok) throw new Error("404"); return await res.json(); }catch(e){ console.warn(path,e); return null; }}

// DOM Elemente
const menu=document.getElementById("menu"), menuButton=document.getElementById("menuButton"), main=document.querySelector("main"), overlays=document.querySelectorAll(".overlay");
const weekday=document.getElementById("weekday"), daytime=document.getElementById("daytime"), dateEl=document.getElementById("date"), timeEl=document.getElementById("time"), dailyQuoteBox=document.getElementById("dailyQuoteBox");
const personalQuoteDisplay=document.getElementById("personalQuoteDisplay"), dailyFocusInput=document.getElementById("dailyFocusInput"), shareBtn=document.getElementById("shareQuoteBtn");

// MENU
menuButton.onclick=()=>menu.style.right==="0px"?menu.style.right="-260px":menu.style.right="0";
document.querySelectorAll("#menu a").forEach(a=>{
  a.addEventListener("click",e=>{
    e.preventDefault();
    const target=a.dataset.target;
    overlays.forEach(o=>{ o.style.display="none"; o.classList.add("hidden"); });
    menu.style.right="-260px";
    main.style.opacity="1";
    if(target==="home") return;
    const overlay=document.getElementById(target);
    if(overlay){ overlay.style.display="flex"; overlay.classList.remove("hidden"); main.style.opacity="0.5"; }
  });
});
overlays.forEach(o=>{ o.addEventListener("click",e=>{ if(!o.querySelector(".overlayContent").contains(e.target)){ o.style.display="none"; main.style.opacity="1"; } }); });

// HEADER + TAGESZITAT
function updateHeader(){ const now=new Date(); const days=["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"]; weekday.innerText=days[now.getDay()]; daytime.innerText=now.getHours()<12?"Morgens":now.getHours()<18?"Mittags":"Abends"; dateEl.innerText=now.toLocaleDateString("de-DE"); timeEl.innerText=now.toLocaleTimeString("de-DE"); }
updateHeader(); setInterval(updateHeader,1000);
const tageszeitData=await safeFetchJSON("data/tageszeit.json");
if(tageszeitData?.quotes?.length){ const today=new Date().toISOString().split("T")[0]; const seed=Number(today.replaceAll("-","")); dailyQuoteBox.innerText=tageszeitData.quotes[seed % tageszeitData.quotes.length]; }else{ dailyQuoteBox.innerText="Keine Daten verfügbar"; }

// PERSONAL QUOTES
const dailyTextsData=await safeFetchJSON("data/dailyTexts.json");
if(dailyTextsData){
  const today=new Date().toISOString().split("T")[0]; const seed=Number(today.replaceAll("-",""));
  function show(type){ personalQuoteDisplay.innerText=dailyTextsData[type][seed%dailyTextsData[type].length]; personalQuoteDisplay.style.display="block"; }
  document.getElementById("morningBtn").onclick=()=>show("morning");
  document.getElementById("noonBtn").onclick=()=>show("noon");
  document.getElementById("eveningBtn").onclick=()=>show("evening");
}

// TEILEN
shareBtn.addEventListener("click",()=>{ const quote=dailyQuoteBox.innerText.trim(); navigator.share?navigator.share({title:"Tageszitat",text:quote}).catch(()=>{}):navigator.clipboard.writeText(quote).then(()=>alert("Zitat kopiert!")); });

// TAGESFOKUS
const todayKey="dailyFocus-"+new Date().toISOString().split("T")[0]; dailyFocusInput.value=localStorage.getItem(todayKey)||""; dailyFocusInput.addEventListener("input",()=>localStorage.setItem(todayKey,dailyFocusInput.value));

// FOLDER / ZITATE
const foldersData=await safeFetchJSON("data/folders.json");
if(foldersData){ const grid=document.getElementById("folderGrid"); Object.keys(foldersData.folders).forEach(name=>{ const div=document.createElement("div"); div.className="folderFrame"; div.innerText=name; div.onclick=()=>{ const overlay=document.getElementById("folderOverlay"); const content=overlay.querySelector(".overlayContent"); content.innerHTML=`<h3>${name}</h3>`+foldersData.folders[name].flat().map(q=>`<p>${q}</p>`).join("")+`<button class="closeBtn">Schließen</button>`; overlay.style.display="flex"; main.style.opacity="0.5"; content.querySelector(".closeBtn").onclick=()=>{ overlay.style.display="none"; main.style.opacity="1"; }; }; grid.appendChild(div); }); }

// ARCHIV
const archiveData=await safeFetchJSON("data/archive.json");
if(archiveData){ const monthDetail=document.getElementById("monthDetail"); monthDetail.innerHTML=""; archiveData.days.forEach(entry=>{ const box=document.createElement("div"); box.className="archiveEntry"; box.innerHTML=`<h4>${entry.date}</h4><p>${entry.quote}</p>`; monthDetail.appendChild(box); }); }

// MEINE ZEIT
const meineZeitData=await safeFetchJSON("data/meinezeit.json");
if(meineZeitData){
  const overlay=document.getElementById("meinezeitOverlay"), content=overlay.querySelector(".overlayContent"), grid=document.getElementById("meinezeitGrid");
  function renderOverview(){ grid.style.display="grid"; content.querySelectorAll(".folderContent").forEach(el=>el.remove()); grid.innerHTML=""; Object.keys(meineZeitData.folders).forEach(name=>{ const div=document.createElement("div"); div.className="myTimeFolder"; div.innerText=name; div.onclick=()=>renderFolder(name); grid.appendChild(div); }); overlay.style.display="flex"; main.style.opacity="0.5"; }
  function renderFolder(name){ grid.style.display="none"; const folderContent=document.createElement("div"); folderContent.className="folderContent"; folderContent.innerHTML=`<h3>${name}</h3>`; meineZeitData.folders[name].forEach(e=>{ folderContent.innerHTML+=`<h4>${e.title}</h4><p>${e.text}</p>`; if(e.image) folderContent.innerHTML+=`<img src="${e.image}" class="myTimeImage">`; }); const backBtn=document.createElement("button"); backBtn.innerText="← Zurück"; backBtn.className="closeBtn"; backBtn.onclick=()=>{ folderContent.remove(); renderOverview(); }; folderContent.appendChild(backBtn); content.appendChild(folderContent); }
  document.querySelector('a[data-target="meinezeitOverlay"]').addEventListener("click", e=>{ e.preventDefault(); renderOverview(); });
}

// PERSONAL SLIDES
const personalOverlay=document.getElementById("personalOverlay"), mainSlide=document.getElementById("mainPersonalSlide"), mainPersonalText=document.getElementById("mainPersonalText"), personalSlidesContainer=document.getElementById("personalSlidesContainer"), startSlidesBtn=document.getElementById("startSlidesBtn"), prevSlide=document.getElementById("prevSlide"), nextSlide=document.getElementById("nextSlide"), progress=document.getElementById("personalSlidesProgress");
let personalData=await safeFetchJSON("data/personalSlides.json"), index=-1;
function renderSlides(){ if(!personalData) return; personalSlidesContainer.innerHTML=""; if(index===-1){ mainPersonalText.innerHTML=`<h2>${personalData.intro.title}</h2><p>${personalData.intro.text.replace(/\n/g,"<br>")}</p>`; mainSlide.style.display="block"; setTimeout(()=>mainSlide.classList.add("active"),50); progress.innerText=""; return; } mainSlide.style.display="none"; mainSlide.classList.remove("active"); personalData.slides.forEach((slide,i)=>{ const div=document.createElement("div"); div.className="personalSlide"; if(i===index) div.classList.add("active"); div.innerHTML=`<h3>${slide.title}</h3><p>${slide.text.replace(/\n/g,"<br>")}</p>`; personalSlidesContainer.appendChild(div); }); progress.innerText=`${index+1} / ${personalData.slides.length}`; }
startSlidesBtn.onclick=()=>{ index=0; renderSlides(); }; prevSlide.onclick=()=>{ index=index>0?index-1:personalData.slides.length-1; renderSlides(); }; nextSlide.onclick=()=>{ index=index<personalData.slides.length-1?index+1:-1; renderSlides(); };

// NEWS
async function loadNews(){ const newsList=document.getElementById("newsList"); if(!newsList) return; let allEntries=[]; 
const archive=await safeFetchJSON("data/archive.json"); if(archive) archive.days.forEach(e=>allEntries.push({source:"Archiv", location:"Archiv", date:e.date, text:e.quote}));
const meinezeit=await safeFetchJSON("data/meinezeit.json"); if(meinezeit){ Object.keys(meinezeit.folders).forEach(folder=>{ meinezeit.folders[folder].forEach(e=>{ if(e.date) allEntries.push({source:"Meine Zeit", location:`Meine Zeit → ${folder}`, date:e.date, text:e.title}); }); }); }
allEntries.sort((a,b)=>new Date(b.date)-new Date(a.date));
const latestThree=allEntries.slice(0,3); const hash=JSON.stringify(latestThree); if(hash===localStorage.getItem("newsHash")) return; localStorage.setItem("newsHash",hash);
newsList.innerHTML=""; latestThree.forEach(item=>{ const div=document.createElement("div"); div.className="newsItem"; div.innerHTML=`<div class="newsMeta"><span class="newsLocation">📍 ${item.location}</span> · <span class="newsDate">📅 ${item.date}</span></div><div class="newsText">${item.text}</div>`; newsList.appendChild(div); });
}
loadNews();

});
