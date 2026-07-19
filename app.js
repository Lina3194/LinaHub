
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

  const pageFactory=pages[route]||HomePage;
  document.querySelector("#app").innerHTML=pageFactory();

  const atmosphere=document.createElement("div");
  atmosphere.className=`route-atmosphere atmosphere-${route}`;
  atmosphere.setAttribute("aria-hidden","true");

  if(route==="plants"||route==="plant"){
    atmosphere.innerHTML=Array.from({length:18},(_,i)=>`<i class="petal" style="--i:${i}"></i>`).join("");
  }else if(route==="pets"||route==="tank"){
    atmosphere.innerHTML=Array.from({length:16},(_,i)=>`<i class="aqua-bubble" style="--i:${i}"></i>`).join("");
  }

  document.body.appendChild(atmosphere);

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

function setupNavigation(){
  if(window.__linaNavigationReady) return;
  window.__linaNavigationReady=true;

  document.addEventListener("click",event=>{
    const backButton=event.target.closest("[data-back]");
    if(backButton){
      event.preventDefault();
      event.stopPropagation();
      goBack(backButton.dataset.back||"home");
      return;
    }

    const routeButton=event.target.closest("[data-route]");
    if(routeButton){
      event.preventDefault();
      event.stopPropagation();
      go(routeButton.dataset.route,routeButton.dataset.routeId||"");
    }
  });
}

function setupSwipeBack(){
  if(window.__linaSwipeReady) return;
  window.__linaSwipeReady=true;

  let tracking=false;
  let startX=0;
  let startY=0;
  let currentX=0;
  const edgeWidth=32;
  const triggerDistance=78;

  const isBlockedTarget=target=>{
    if(!(target instanceof Element)) return true;
    return !!target.closest(
      "input,textarea,select,.drag-handle,.table-wrap,.tokens,.scale,.energy-picker,[contenteditable='true']"
    );
  };

  document.addEventListener("touchstart",event=>{
    if(event.touches.length!==1) return;
    const touch=event.touches[0];

    tracking=
      route!=="home" &&
      touch.clientX<=edgeWidth &&
      !document.body.classList.contains("reordering") &&
      !isBlockedTarget(event.target);

    if(!tracking) return;

    startX=touch.clientX;
    startY=touch.clientY;
    currentX=startX;
  },{passive:true});

  document.addEventListener("touchmove",event=>{
    if(!tracking||event.touches.length!==1) return;

    const touch=event.touches[0];
    const dx=touch.clientX-startX;
    const dy=touch.clientY-startY;

    if(Math.abs(dy)>Math.abs(dx) && Math.abs(dy)>24){
      tracking=false;
      resetSwipePreview();
      return;
    }

    if(dx<=0) return;

    currentX=touch.clientX;

    if(dx>10){
      event.preventDefault();
      const page=document.querySelector(".page-enter");
      if(page){
        page.classList.add("swiping-back");
        page.style.transform=`translate3d(${Math.min(dx,170)}px,0,0)`;
        page.style.opacity=String(Math.max(.76,1-dx/520));
      }
    }
  },{passive:false});

  const finishSwipe=()=>{
    if(!tracking) return;

    const distance=currentX-startX;
    tracking=false;

    if(distance>=triggerDistance){
      const page=document.querySelector(".page-enter");
      if(page){
        page.classList.remove("swiping-back");
        page.style.transition="transform .16s ease,opacity .16s ease";
        page.style.transform="translate3d(105vw,0,0)";
        page.style.opacity=".45";
      }
      setTimeout(()=>goBack("home"),90);
    }else{
      resetSwipePreview();
    }
  };

  document.addEventListener("touchend",finishSwipe,{passive:true});
  document.addEventListener("touchcancel",()=>{
    tracking=false;
    resetSwipePreview();
  },{passive:true});
}

function resetSwipePreview(){
  const page=document.querySelector(".page-enter");
  if(!page) return;
  page.classList.remove("swiping-back");
  page.style.transition="transform .18s ease,opacity .18s ease";
  page.style.transform="";
  page.style.opacity="";
  setTimeout(()=>{
    if(!page.isConnected) return;
    page.style.transition="";
  },190);
}

setupNavigation();
setupSwipeBack();

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>{
    navigator.serviceWorker.register("./sw.js?v=84").catch(()=>{});
  });
}

render();
