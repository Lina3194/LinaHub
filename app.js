
function render(){
  document.body.classList.toggle("dark",data.theme==="dark");
  document.body.dataset.route=route;
  document.querySelectorAll(".route-atmosphere").forEach(el=>el.remove());

  const pages={
    home:HomePage,
    journal:JournalPage,
    today:TodayPage,
    todo:TodoPage,
    plants:PlantsPage,
    plant:PlantProfilePage,
    settings:SettingsPage,
    health:HealthPage,
    medication:MedicationPage,
    pokemon:PokemonPage,
    pets:AquariumsPage,
    tank:AquariumTankPage,
    house:HousePage
  };

  document.querySelector("#app").innerHTML=(pages[route]||HomePage)();
  const atmosphere=document.createElement("div");
  atmosphere.className=`route-atmosphere atmosphere-${route}`;
  atmosphere.setAttribute("aria-hidden","true");
  if(route==="plants"||route==="plant"){
    atmosphere.innerHTML=Array.from({length:14},(_,i)=>`<i class="petal" style="--i:${i}"></i>`).join("");
  }else if(route==="pets"||route==="tank"){
    atmosphere.innerHTML=Array.from({length:13},(_,i)=>`<i class="aqua-bubble" style="--i:${i}"></i>`).join("");
  }
  document.body.appendChild(atmosphere);
  bindGlobal();

  if(route==="home") bindHome();
  if(route==="journal") bindJournal();
  if(route==="today") bindToday();
  if(route==="todo") bindTodo();
  if(route==="plants"||route==="plant") bindPlants();
  if(route==="pokemon") bindPokemon();
  if(route==="house") bindHouse();
  if(route==="medication") bindMedication();
  if(route==="health") bindHealth();
  if(route==="settings") bindSimple();
  if(route==="pets"||route==="tank") bindAquariums();
}

function bindGlobal(){
  document.querySelectorAll("[data-route]").forEach(btn=>btn.onclick=()=>go(btn.dataset.route));
  document.querySelectorAll("[data-back]").forEach(btn=>btn.onclick=()=>goBack(btn.dataset.back||"home"));
  setupSwipeBack();
}

function setupSwipeBack(){
  if(window.__linaSwipeCleanup) window.__linaSwipeCleanup();

  let startX=0,startY=0,currentX=0,tracking=false,blocked=false;
  const edge=34;
  const threshold=72;

  const interactiveTarget=target=>!!target.closest(
    "input,textarea,select,button,.drag-handle,.table-wrap,.poke-tabs,.tokens,.scale,.energy-picker"
  );

  const onStart=e=>{
    const touch=e.touches?.[0];
    if(!touch||touch.clientX>edge||route==="home"||document.body.classList.contains("reordering")) return;
    startX=currentX=touch.clientX;
    startY=touch.clientY;
    blocked=interactiveTarget(e.target);
    tracking=!blocked;
  };
  const onMove=e=>{
    if(!tracking) return;
    const touch=e.touches?.[0];
    if(!touch) return;
    const dx=touch.clientX-startX;
    const dy=Math.abs(touch.clientY-startY);
    if(dy>34&&dy>Math.abs(dx)){tracking=false;return}
    if(dx<=0) return;
    currentX=touch.clientX;
    if(dx>12){
      e.preventDefault();
      const page=document.querySelector(".page-enter");
      if(page){
        page.style.transition="none";
        page.style.transform=`translateX(${Math.min(dx,150)}px)`;
        page.style.opacity=String(Math.max(.72,1-dx/520));
      }
    }
  };
  const onEnd=()=>{
    if(!tracking) return;
    const dx=currentX-startX;
    const page=document.querySelector(".page-enter");
    tracking=false;
    if(dx>=threshold){
      if(page){
        page.style.transition="transform .18s ease,opacity .18s ease";
        page.style.transform="translateX(105vw)";
        page.style.opacity=".5";
      }
      setTimeout(()=>goBack("home"),80);
    }else if(page){
      page.style.transition="transform .2s ease,opacity .2s ease";
      page.style.transform="";
      page.style.opacity="";
    }
  };

  document.addEventListener("touchstart",onStart,{passive:true});
  document.addEventListener("touchmove",onMove,{passive:false});
  document.addEventListener("touchend",onEnd,{passive:true});
  document.addEventListener("touchcancel",onEnd,{passive:true});
  window.__linaSwipeCleanup=()=>{
    document.removeEventListener("touchstart",onStart);
    document.removeEventListener("touchmove",onMove);
    document.removeEventListener("touchend",onEnd);
    document.removeEventListener("touchcancel",onEnd);
  };
}

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js?v=83"));
}

render();
