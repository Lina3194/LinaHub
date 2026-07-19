
function render(){
  document.body.classList.toggle("dark",data.theme==="dark");
  document.body.dataset.route=route; // Styling metadata only; navigation clicks are restricted to explicit controls.
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
      animateBackNavigation(backButton.dataset.back||"home");
      return;
    }

    const routeButton=event.target.closest("button[data-route],a[data-route],[role='button'][data-route]");
    if(routeButton){
      event.preventDefault();
      event.stopPropagation();
      go(routeButton.dataset.route,routeButton.dataset.routeId||"");
    }
  });
}

function animateBackNavigation(fallback="home"){
  const page=document.querySelector(".shell");
  if(!page){
    goBack(fallback);
    return;
  }

  page.classList.add("button-back-exit");
  const finish=()=>{
    page.removeEventListener("animationend",finish);
    suppressNextPageAnimation=true;
    goBack(fallback);
  };
  page.addEventListener("animationend",finish,{once:true});
  setTimeout(finish,230);
}

function setupSwipeBack(){
  if(window.__linaSwipeReady) return;
  window.__linaSwipeReady=true;

  let tracking=false;
  let startX=0;
  let startY=0;
  let currentX=0;
  let page=null;
  const edgeWidth=34;
  const triggerDistance=86;

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

    startX=currentX=touch.clientX;
    startY=touch.clientY;
    page=document.querySelector(".shell");
    document.body.classList.add("swipe-back-active");
    page?.classList.add("swipe-dragging");
  },{passive:true});

  document.addEventListener("touchmove",event=>{
    if(!tracking||event.touches.length!==1) return;

    const touch=event.touches[0];
    const dx=Math.max(0,touch.clientX-startX);
    const dy=touch.clientY-startY;

    if(Math.abs(dy)>Math.abs(dx) && Math.abs(dy)>26){
      cancelSwipe();
      return;
    }

    currentX=touch.clientX;
    if(dx<4||!page) return;

    event.preventDefault();
    const eased=Math.min(dx,190);
    const progress=Math.min(eased/190,1);
    page.style.transform=`translate3d(${eased}px,0,0)`;
    page.style.opacity=String(1-progress*.16);
    document.documentElement.style.setProperty("--swipe-progress",String(progress));
  },{passive:false});

  const finishSwipe=()=>{
    if(!tracking) return;
    const distance=currentX-startX;
    tracking=false;

    if(distance>=triggerDistance){
      completeSwipeBack();
    }else{
      cancelSwipe();
    }
  };

  document.addEventListener("touchend",finishSwipe,{passive:true});
  document.addEventListener("touchcancel",cancelSwipe,{passive:true});

  function completeSwipeBack(){
    if(!page){
      goBack("home");
      return;
    }

    page.classList.remove("swipe-dragging");
    page.classList.add("swipe-completing");
    document.documentElement.style.setProperty("--swipe-progress","1");

    const finish=()=>{
      page?.removeEventListener("transitionend",finish);
      suppressNextPageAnimation=true;
      cleanupSwipeStyles();
      goBack("home");
    };

    page.addEventListener("transitionend",finish,{once:true});
    setTimeout(finish,240);
  }

  function cancelSwipe(){
    tracking=false;
    if(!page){
      cleanupSwipeStyles();
      return;
    }

    page.classList.remove("swipe-dragging");
    page.classList.add("swipe-cancelling");

    const finish=()=>{
      page?.removeEventListener("transitionend",finish);
      cleanupSwipeStyles();
    };

    page.addEventListener("transitionend",finish,{once:true});
    setTimeout(finish,230);
  }

  function cleanupSwipeStyles(){
    if(page){
      page.classList.remove("swipe-dragging","swipe-completing","swipe-cancelling");
      page.style.transform="";
      page.style.opacity="";
    }
    document.body.classList.remove("swipe-back-active");
    document.documentElement.style.removeProperty("--swipe-progress");
    page=null;
  }
}
function resetSwipePreview(){
  const page=document.querySelector(".shell");
  if(!page) return;
  page.classList.remove("swipe-dragging","swipe-completing","swipe-cancelling");
  page.style.transform="";
  page.style.opacity="";
  document.body.classList.remove("swipe-back-active");
  document.documentElement.style.removeProperty("--swipe-progress");
}

setupNavigation();
setupSwipeBack();

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>{
    navigator.serviceWorker.register("./sw.js?v=100").catch(()=>{});
  });
}

render();
