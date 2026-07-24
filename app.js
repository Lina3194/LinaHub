

document.addEventListener("linahub:house-completion",()=>{
  if(route==="today"){
    suppressNextPageAnimation=true;
    render();
  }
});
function render(){
  resetSwipePreview();
  document.body.classList.toggle("dark",data.theme==="dark");
  document.body.dataset.colorTheme=data.colorTheme||"amethyst";
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
    hobbies:HobbiesPage,
    books:BooksPage,
    gaming:()=>SimplePage("Gaming","🎮","Your games and progress","gaming"),
    medication:MedicationPage,
    shopping:ShoppingPage,
    pokemon:PokemonPage,
    pets:AquariumsPage,
    tank:AquariumTankPage,
    house:HousePage,
    period:PeriodPage,
    budget:BudgetPage,
    treasures:TreasureRoomPage,
    history:HistoryPage
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
  if(route==="shopping") bindShopping();
  if(route==="hobbies") bindHobbies();
  if(route==="books") bindBooks();
  if(route==="health") bindHealth();
  if(route==="settings") bindSimple();
  if(route==="period") bindPeriod();
  if(route==="budget") bindBudget();
  if(route==="treasures") bindTreasures();
  if(route==="history") bindHistory();
  if(route==="pets"||route==="tank") bindAquariums();
  bindBottomNavigation();
  linaMaybeOpenDailyCheckin();
}



function bindBottomNavigation(){
  document.querySelectorAll(".bottom button[data-route]").forEach(button=>{
    button.addEventListener("click",event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      go(button.dataset.route,button.dataset.routeId||"");
    });
    button.addEventListener("touchend",event=>{
      event.preventDefault();
      event.stopImmediatePropagation();
      go(button.dataset.route,button.dataset.routeId||"");
    },{passive:false});
  });
}

function setupNavigation(){
  if(window.__linaNavigationReady) return;
  window.__linaNavigationReady=true;

  document.addEventListener("click",event=>{
    const hourlyButton=event.target.closest("[data-open-hourly-checkin]");
    if(hourlyButton){event.preventDefault();event.stopPropagation();openHourlyCheckin();return;}

    const dailyButton=event.target.closest("[data-open-daily-checkin]");
    if(dailyButton){event.preventDefault();event.stopPropagation();openDailyCheckin(true);return;}

    const healthTabButton=event.target.closest("[data-health-tab]");
    if(healthTabButton){
      event.preventDefault();event.stopPropagation();
      go("health",healthTabButton.dataset.healthTab||"dashboard");return;
    }

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
  suppressNextPageAnimation=true;
  goBack(fallback);
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


let linaNotificationTimer=null;
function linaNotificationConfig(){
  data.notifications=data.notifications||{};
  const cfg=data.notifications;
  cfg.enabled=!!cfg.enabled;
  cfg.medication=cfg.medication!==false;
  cfg.todayTasks=cfg.todayTasks!==false;
  cfg.dayCheckins=!!cfg.dayCheckins;
  cfg.dayCheckinStart=cfg.dayCheckinStart||"08:00";
  cfg.dayCheckinEnd=cfg.dayCheckinEnd||"22:00";
  cfg.dayCheckinEvery=Math.max(1,Number(cfg.dayCheckinEvery)||1);
  cfg.medicationTimes=Array.isArray(cfg.medicationTimes)&&cfg.medicationTimes.length?cfg.medicationTimes:[cfg.medicationTime||"09:00"];
  cfg.todayTimes=Array.isArray(cfg.todayTimes)&&cfg.todayTimes.length?cfg.todayTimes:[cfg.todayTime||"09:15"];
  cfg.medicationTimes=[...new Set(cfg.medicationTimes.filter(Boolean))].sort();
  cfg.todayTimes=[...new Set(cfg.todayTimes.filter(Boolean))].sort();
  cfg.lastSent=cfg.lastSent||{};
  delete cfg.medicationTime; delete cfg.todayTime;
  return cfg;
}

async function linaRequestNotificationPermission(){
  if(!("Notification" in window)){toast("Notifications are not supported on this device");return false}
  if(Notification.permission==="granted") return true;
  if(Notification.permission==="denied"){toast("Notifications are blocked in your browser settings");return false}
  try{
    const permission=await Notification.requestPermission();
    document.querySelector("#notificationPermission")?.replaceChildren(document.createTextNode(permission));
    if(permission!=="granted") toast("Notification permission was not allowed");
    return permission==="granted";
  }catch{toast("Notifications could not be enabled");return false}
}
async function linaShowNotification(title,options={}){
  if(!("Notification" in window)||Notification.permission!=="granted") return false;
  const payload={icon:"./icons/icon-192.png",badge:"./icons/icon-192.png",...options};
  try{
    const registration=await navigator.serviceWorker?.ready;
    if(registration?.showNotification){await registration.showNotification(title,payload);return true}
    new Notification(title,payload);return true;
  }catch{return false}
}
function linaPendingMedicationCount(dateValue){
  try{
    ensureMedicationData();
    return data.medications.filter(m=>medDueOn(m,dateValue)).reduce((sum,m)=>{
      if(m.scheduleType==="prn") return sum;
      return sum+Math.max(0,(Number(m.dosesPerDay)||1)-medLogsFor(m.id,dateValue).length);
    },0);
  }catch{return 0}
}
function linaPendingTodayTaskCount(dateValue){
  return (data.personalTasks||[]).filter(task=>!task.done&&(task.deadline||task.date)===dateValue).length;
}
async function linaCheckNotifications(){
  const cfg=linaNotificationConfig();
  if(!cfg.enabled||Notification.permission!=="granted") return;
  const now=new Date(),dateValue=medLocalDate(now),clock=now.toTimeString().slice(0,5);
  for(const reminderTime of cfg.medicationTimes){
    const sentKey=`medication:${dateValue}:${reminderTime}`;
    if(cfg.medication!==false&&clock>=reminderTime&&!cfg.lastSent[sentKey]){
      const count=linaPendingMedicationCount(dateValue);
      if(count>0) await linaShowNotification("Medication reminder",{body:`${count} ${count===1?"dose is":"doses are"} still due today.`,tag:`linahub-med-${dateValue}-${reminderTime}`,data:{route:"medication"}});
      cfg.lastSent[sentKey]=true; saveData();
    }
  }
  for(const reminderTime of cfg.todayTimes){
    const sentKey=`today:${dateValue}:${reminderTime}`;
    if(cfg.todayTasks!==false&&clock>=reminderTime&&!cfg.lastSent[sentKey]){
      const count=linaPendingTodayTaskCount(dateValue);
      if(count>0) await linaShowNotification("Today in LinaHub",{body:`You have ${count} unfinished ${count===1?"task":"tasks"} due today.`,tag:`linahub-today-${dateValue}-${reminderTime}`,data:{route:"today"}});
      cfg.lastSent[sentKey]=true; saveData();
    }
  }
  if(cfg.dayCheckins){
    const toMinutes=value=>{const [h,m]=String(value||"00:00").split(":").map(Number);return h*60+m};
    const nowMinutes=now.getHours()*60+now.getMinutes(),startMinutes=toMinutes(cfg.dayCheckinStart),endMinutes=toMinutes(cfg.dayCheckinEnd),step=cfg.dayCheckinEvery*60;
    if(nowMinutes>=startMinutes&&nowMinutes<=endMinutes){
      const slot=startMinutes+Math.floor((nowMinutes-startMinutes)/step)*step;
      const slotHour=String(Math.floor(slot/60)).padStart(2,"0"),slotMinute=String(slot%60).padStart(2,"0"),slotTime=`${slotHour}:${slotMinute}`;
      const sentKey=`flower:${dateValue}:${slotTime}`;
      const alreadyLogged=(data.dayCheckins||[]).some(entry=>entry.date===dateValue&&String(entry.time||"")>=slotTime&&toMinutes(entry.time)<slot+step);
      if(nowMinutes-slot<=15&&!alreadyLogged&&!cfg.lastSent[sentKey]){
        await linaShowNotification("How are your energy and mood? 🌸",{body:"Add a quick check-in and grow today’s bouquet.",tag:`linahub-flower-${dateValue}-${slotTime}`,data:{route:"journal"}});
        cfg.lastSent[sentKey]=true;saveData();
      }
    }
  }
}

function linaStartNotificationChecks(){
  clearInterval(linaNotificationTimer);
  linaCheckNotifications();
  linaNotificationTimer=setInterval(linaCheckNotifications,60000);
}
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible"){linaCheckNotifications();linaMaybeOpenDailyCheckin();}});
window.addEventListener("focus",()=>{linaCheckNotifications();linaMaybeOpenDailyCheckin();});

setupNavigation();
setupSwipeBack();
linaStartNotificationChecks();


if("serviceWorker" in navigator){navigator.serviceWorker.addEventListener("message",event=>{if(event.data?.type==="LINAHUB_ROUTE")go(event.data.route||"home")});}

if("serviceWorker" in navigator){
  window.addEventListener("load",async()=>{
    try{
      const registration=await navigator.serviceWorker.register("./sw.js?v=1676",{updateViaCache:"none"});
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
