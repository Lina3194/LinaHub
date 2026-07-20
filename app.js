
function render(){
  resetSwipePreview();
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
    house:HousePage,
    period:PeriodPage,
    treasures:TreasureRoomPage
  };

  const pageFactory=pages[route]||HomePage;
  document.querySelector("#app").innerHTML=pageFactory();

  const atmosphere=document.createElement("div");
  atmosphere.className=`route-atmosphere atmosphere-${route}`;
  atmosphere.setAttribute("aria-hidden","true");

  if(route==="plants"||route==="plant"){
    // Use real numeric values here. CSS cannot reliably calculate modulo or multiplication
    // from --i on Safari/iOS, which was leaving the petals without a usable size/position.
    atmosphere.innerHTML=Array.from({length:26},(_,i)=>{
      const x=(3+(i*17)%94).toFixed(1);
      const size=10+(i%6)*2;
      const duration=(9+(i%7)*1.15).toFixed(2);
      const delay=(-((i*1.37)%15)).toFixed(2);
      const drift=(18+(i%5)*8)*(i%2===0?1:-1);
      const driftBack=(-drift*0.55).toFixed(1);
      const driftEnd=(drift*0.35).toFixed(1);
      const opacity=(0.58+(i%4)*0.09).toFixed(2);
      return `<i class="sakura-petal" style="--x:${x}%;--petal-size:${size}px;--fall-duration:${duration}s;--fall-delay:${delay}s;--drift:${drift}px;--drift-back:${driftBack}px;--drift-end:${driftEnd}px;--petal-opacity:${opacity}" aria-hidden="true"><svg viewBox="0 0 24 30" focusable="false"><path d="M12 29C8.6 24.3 2.2 21.2 1.4 13.9C.8 8.8 3.8 3.7 8.2 2.2C10.5 1.4 11.8 3.2 12 6.1C12.2 3.2 13.5 1.4 15.8 2.2C20.2 3.7 23.2 8.8 22.6 13.9C21.8 21.2 15.4 24.3 12 29Z"/><path class="sakura-vein" d="M12 27C11.7 20.8 11.8 14.8 12 8.2"/></svg></i>`;
    }).join("");
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
  if(route==="period") bindPeriod();
  if(route==="treasures") bindTreasures();
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
  let horizontal=false;
  let startX=0;
  let startY=0;
  let currentX=0;
  let page=null;
  const edgeWidth=52;
  const triggerDistance=78;

  const isBlockedTarget=target=>{
    if(!(target instanceof Element)) return true;
    return !!target.closest(
      "input,textarea,select,option,label,.drag-handle,.table-wrap,.tokens,.scale,.energy-picker,.priority-picker,.profile-tabs,[contenteditable='true']"
    );
  };

  const cleanup=()=>{
    tracking=false;
    horizontal=false;
    if(page){
      page.classList.remove("swipe-dragging","swipe-completing","swipe-cancelling");
      page.style.transform="";
      page.style.opacity="";
    }
    document.body.classList.remove("swipe-back-active");
    document.documentElement.style.removeProperty("--swipe-progress");
    page=null;
  };

  document.addEventListener("touchstart",event=>{
    if(event.touches.length!==1) return;
    const touch=event.touches[0];

    if(
      route==="home" ||
      touch.clientX>edgeWidth ||
      document.body.classList.contains("reordering") ||
      isBlockedTarget(event.target)
    ) return;

    tracking=true;
    horizontal=false;
    startX=currentX=touch.clientX;
    startY=touch.clientY;
    page=document.querySelector(".shell");
  },{passive:true});

  document.addEventListener("touchmove",event=>{
    if(!tracking||event.touches.length!==1) return;

    const touch=event.touches[0];
    const dx=touch.clientX-startX;
    const dy=touch.clientY-startY;

    if(!horizontal){
      if(Math.abs(dx)<8 && Math.abs(dy)<8) return;
      if(Math.abs(dy)>Math.abs(dx) || dx<=0){
        cleanup();
        return;
      }
      horizontal=true;
      document.body.classList.add("swipe-back-active");
      page?.classList.add("swipe-dragging");
    }

    event.preventDefault();
    currentX=touch.clientX;
    const translated=Math.min(Math.max(0,dx),220);
    const progress=Math.min(translated/220,1);

    if(page){
      page.style.transform=`translate3d(${translated}px,0,0)`;
      page.style.opacity=String(1-progress*.12);
    }
    document.documentElement.style.setProperty("--swipe-progress",String(progress));
  },{passive:false});

  const finish=()=>{
    if(!tracking) return;
    const distance=currentX-startX;

    if(horizontal && distance>=triggerDistance && page){
      tracking=false;
      page.classList.remove("swipe-dragging");
      page.classList.add("swipe-completing");

      let completed=false;
      const done=()=>{
        if(completed) return;
        completed=true;
        suppressNextPageAnimation=true;
        cleanup();
        goBack("home");
      };

      page.addEventListener("transitionend",done,{once:true});
      setTimeout(done,260);
      return;
    }

    if(page&&horizontal){
      tracking=false;
      page.classList.remove("swipe-dragging");
      page.classList.add("swipe-cancelling");

      let cancelled=false;
      const done=()=>{
        if(cancelled) return;
        cancelled=true;
        cleanup();
      };

      page.addEventListener("transitionend",done,{once:true});
      setTimeout(done,240);
    }else{
      cleanup();
    }
  };

  document.addEventListener("touchend",finish,{passive:true});
  document.addEventListener("touchcancel",cleanup,{passive:true});
  window.addEventListener("blur",cleanup);
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
  window.addEventListener("load",async()=>{
    try{
      const registration=await navigator.serviceWorker.register("./sw.js?v=155",{updateViaCache:"none"});
      await registration.update();
      let refreshed=false;
      navigator.serviceWorker.addEventListener("controllerchange",()=>{
        if(refreshed) return;
        refreshed=true;
        window.location.reload();
      });
    }catch{}
  });
}

render();
