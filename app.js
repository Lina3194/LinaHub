


function renderSeasonalAtmosphere(theme){
  let layer=document.querySelector("#seasonalAtmosphere");
  if(!layer){
    layer=document.createElement("div");
    layer.id="seasonalAtmosphere";
    layer.className="seasonal-atmosphere";
    layer.setAttribute("aria-hidden","true");
    document.body.appendChild(layer);
  }
  if(layer.dataset.theme===theme) return;
  layer.dataset.theme=theme;
  const symbols={plain:[],glitter:["✦","✧","⋆","✨"],floral:["🌸","✿","❀","🌺"],spring:["🌸","🌷","✿","❀"],summer:["✨","☀","✦","•"],autumn:["🍂","🍁","❧","•"],winter:["❄","❅","✧","•"]}[theme]||[];
  const count=theme==="plain"?0:theme==="winter"?34:theme==="summer"?22:theme==="glitter"?36:28;
  layer.innerHTML=Array.from({length:count},(_,i)=>{
    const left=(i*37%101), delay=-((i*1.37)%14), duration=8+(i*0.73%10), size=12+(i*7%18), drift=-35+(i*19%70);
    return `<i style="--left:${left}%;--delay:${delay}s;--duration:${duration}s;--size:${size}px;--drift:${drift}px">${symbols[i%symbols.length]}</i>`;
  }).join("");
}
document.addEventListener("linahub:house-completion",()=>{
  if(route==="today"){
    suppressNextPageAnimation=true;
    
/* LinaHub 17.0 — Measures, aquarium maintenance and theme polish */
function lina17DateList(values){return (Array.isArray(values)?values:[]).slice().filter(Boolean).sort().reverse()}
function HealthPage(){
  const weights=(data.weightEntries||[]).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const measures=(data.measurements||[]).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const latestWeight=weights[0],latestMeasure=measures[0];
  const history=[...weights.map(x=>({date:x.date,type:"Weight",value:`${x.value||x.weight||"—"} kg`,id:x.id})),...measures.flatMap(x=>[
    x.waist!==""&&x.waist!=null?{date:x.date,type:"Waist",value:`${x.waist} cm`,id:x.id}:null,
    x.tummy!==""&&x.tummy!=null?{date:x.date,type:"Tummy",value:`${x.tummy} cm`,id:x.id}:null
  ].filter(Boolean))].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  return shell(`${head("Measures","A simple record of weight, waist and tummy")}
    <section class="measure-hero card">
      <div><span class="section-kicker">Latest measurements</span><h2>Your progress, without the clutter</h2><p>Only the three measurements that matter to you.</p></div>
      <div class="measure-summary-grid">
        <article><span>⚖️</span><small>Weight</small><strong>${latestWeight?.value||latestWeight?.weight||"—"}<em>${latestWeight?" kg":""}</em></strong></article>
        <article><span>📏</span><small>Waist</small><strong>${latestMeasure?.waist??"—"}<em>${latestMeasure?.waist!=null&&latestMeasure?.waist!==""?" cm":""}</em></strong></article>
        <article><span>〰️</span><small>Tummy</small><strong>${latestMeasure?.tummy??"—"}<em>${latestMeasure?.tummy!=null&&latestMeasure?.tummy!==""?" cm":""}</em></strong></article>
      </div>
    </section>
    <section class="card measure-entry-card"><div class="section-title-row"><div><span class="section-kicker">New entry</span><h2>Add today’s measures</h2></div></div>
      <label class="compact-measure-date">Date<input class="field" id="measureDate" type="date" value="${today()}"></label>
      <div class="health-measure-fields">
        <label><span>⚖️ Weight</span><div class="measure-input-wrap"><input class="field" id="weightValue" inputmode="decimal" type="number" step="0.1" placeholder="0.0"><b>kg</b></div></label>
        <label><span>📏 Waist</span><div class="measure-input-wrap"><input class="field" id="measureWaist" inputmode="decimal" type="number" step="0.1" placeholder="0.0"><b>cm</b></div></label>
        <label><span>〰️ Tummy</span><div class="measure-input-wrap"><input class="field" id="measureTummy" inputmode="decimal" type="number" step="0.1" placeholder="0.0"><b>cm</b></div></label>
      </div><button class="primary measure-save" id="saveMeasures">Save measurements</button>
    </section>
    <section class="card measure-history-card"><div class="section-title-row"><div><span class="section-kicker">History</span><h2>Previous entries</h2></div><span class="count-pill">${history.length}</span></div>
      <div class="measure-history-list">${history.length?history.map(item=>`<article><time>${formatDate(item.date)}</time><span>${item.type}</span><strong>${esc(item.value)}</strong></article>`).join(""):`<div class="empty compact"><p>Your saved measurements will appear here.</p></div>`}</div>
    </section>`,"health");
}
function bindHealth(){
  const save=document.querySelector("#saveMeasures"); if(!save)return;
  save.onclick=()=>{const date=document.querySelector("#measureDate").value||today(),weight=document.querySelector("#weightValue").value,waist=document.querySelector("#measureWaist").value,tummy=document.querySelector("#measureTummy").value;if(!weight&&!waist&&!tummy){toast("Add at least one measurement");return}
    if(weight){data.weightEntries=data.weightEntries||[];data.weightEntries.push({id:`weight-${Date.now()}`,date,value:Number(weight)})}
    if(waist||tummy){data.measurements=data.measurements||[];data.measurements.push({id:`measure-${Date.now()}`,date,waist:waist===""?"":Number(waist),tummy:tummy===""?"":Number(tummy)})}
    saveData();toast("Measurements saved ✨");render();};
}
function lina17Maintenance(tank){tank.maintenance=tank.maintenance||{};tank.maintenance.history=tank.maintenance.history||{};["waterChange","clean","spongeChange","filterChange"].forEach(k=>tank.maintenance.history[k]=Array.isArray(tank.maintenance.history[k])?tank.maintenance.history[k]:[]);return tank.maintenance}
function lina17DaysBetween(fromDate,toDate){
  if(!fromDate||!toDate)return null;
  const a=new Date(`${fromDate}T12:00:00`),b=new Date(`${toDate}T12:00:00`);
  if(Number.isNaN(a.getTime())||Number.isNaN(b.getTime()))return null;
  return Math.round((b-a)/86400000);
}
function lina17RelativeCareDate(date,{futureLabel="Due",pastLabel="ago",empty="Not logged"}={}){
  if(!date)return empty;
  const diff=lina17DaysBetween(today(),date);
  if(diff===0)return "Today";
  if(diff===1)return "Due tomorrow";
  if(diff>1)return `${futureLabel} in ${diff} days`;
  if(diff===-1)return "Yesterday";
  return `${Math.abs(diff)} days ${pastLabel}`;
}
function lina17MaintenanceDue(lastDate,cycleDays){
  if(!lastDate)return "Not logged";
  if(!cycleDays)return lina17RelativeCareDate(lastDate,{empty:"Not logged"});
  const due=new Date(`${lastDate}T12:00:00`);due.setDate(due.getDate()+cycleDays);
  return lina17RelativeCareDate(due.toISOString().slice(0,10));
}
function lina17LatestFeed(tank){
  const feeds=(tank.feeds||[]).slice().sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")));
  const latest=feeds[0];
  if(!latest)return "Tonight";
  if(latest.time)return latest.time;
  return latest.date===today()?"Today":formatDate(latest.date);
}
function AquariumsPage(){return shell(`${head("Aquariums","Feeding and maintenance at a glance")}
  <div class="aquarium-grid">${(data.aquariums||[]).map(tank=>{const m=lina17Maintenance(tank);return `<section class="card aquarium-dashboard-card status-good"><button class="tank-dashboard-open" data-route="tank" data-route-id="${esc(tank.id)}"><span class="tank-dashboard-image">${tank.photo?`<img src="${tank.photo}" alt="">`:`<span>${tank.emoji||"🐠"}</span>`}</span><span class="tank-dashboard-main"><strong>${esc(tank.name)}</strong><span class="tank-dashboard-rows"><small><b>🌡️ Temp</b><em>${esc(tank.temperature||"Not set")}${tank.temperature&&!String(tank.temperature).includes("°")?"°C":""}</em></small><small><b>🐟 Feed</b><em>${esc(lina17LatestFeed(tank))}</em></small><small><b>💧 Water</b><em>${esc(lina17MaintenanceDue(m.waterChange,7))}</em></small><small><b>🧽 Sponge</b><em>${esc(m.spongeChange?lina17RelativeCareDate(m.spongeChange,{pastLabel:"ago"}):"Not logged")}</em></small><small><b>⚙️ Filter</b><em>${esc(m.filterChange?lina17RelativeCareDate(m.filterChange,{pastLabel:"ago"}):"Not logged")}</em></small></span></span><b class="tank-card-arrow">›</b></button></section>`}).join("")}</div>`,"pets")}
function AquariumTankPage(){const tank=(data.aquariums||[]).find(x=>x.id===routeId)||(data.aquariums||[])[0];if(!tank)return AquariumsPage();const m=lina17Maintenance(tank);const jobs=[["waterChange","Water Change","💧"],["clean","Tank Clean","🫧"],["spongeChange","Sponge Clean","🧽"],["filterChange","Filter Change","⚙️"]];return shell(`${head(tank.name,"Aquarium care",true)}
  <section class="card aquarium-feeds"><details><summary><span><strong>🍽️ Feeding</strong><small>${(tank.feeds||[]).length} saved feed entries</small></span><b>⌄</b></summary><div class="feed-list">${(tank.feeds||[]).length?(tank.feeds||[]).map((f,i)=>`<div class="compact-feed-row"><span>${esc(f.food||f.name||"Feed")}</span><small>${esc(f.time||f.date||"")}</small><button class="mini danger" data-delete-feed="${i}">×</button></div>`).join(""):"<p class='muted-copy'>No feeding entries yet.</p>"}<div class="inline-add"><input class="field" id="feedName" placeholder="Food or feeding note"><button class="secondary" id="addFeed">Add</button></div></div></details></section>
  <section class="card aquarium-maintenance-card"><div class="section-title-row"><div><span class="section-kicker">Maintenance</span><h2>Care log</h2></div></div><div class="maintenance-rows">${jobs.map(([key,label,icon])=>`<article class="maintenance-row"><span class="maintenance-icon">${icon}</span><div><strong>${label}</strong><small>${m[key]?`Last: ${formatDate(m[key])}`:"Not logged yet"}</small></div><input class="field" type="date" data-maintenance-date="${key}" value="${m[key]||today()}"><button class="secondary" data-save-maintenance="${key}">Log</button></article>`).join("")}</div></section>
  <section class="aquarium-history-grid">${jobs.map(([key,label,icon])=>`<details class="card maintenance-history"><summary><span>${icon} ${label} history</span><b>${m.history[key].length}</b></summary><div>${lina17DateList(m.history[key]).length?lina17DateList(m.history[key]).map(date=>`<div class="history-date-row"><span>${formatDate(date)}</span><button class="mini danger" data-delete-maintenance="${key}" data-date="${date}">×</button></div>`).join(""):"<p class='muted-copy'>No history yet.</p>"}</div></details>`).join("")}</section>`,"pets")}
function bindAquariums(){const tank=(data.aquariums||[]).find(x=>x.id===routeId)||(data.aquariums||[])[0];if(!tank)return;const m=lina17Maintenance(tank);document.querySelector("#addFeed")?.addEventListener("click",()=>{const input=document.querySelector("#feedName");if(!input?.value.trim())return;tank.feeds=tank.feeds||[];tank.feeds.push({food:input.value.trim(),date:today()});saveData();render()});document.querySelectorAll("[data-delete-feed]").forEach(b=>b.onclick=()=>{tank.feeds.splice(Number(b.dataset.deleteFeed),1);saveData();render()});document.querySelectorAll("[data-save-maintenance]").forEach(b=>b.onclick=()=>{const key=b.dataset.saveMaintenance,date=document.querySelector(`[data-maintenance-date='${key}']`).value||today();m[key]=date;if(!m.history[key].includes(date))m.history[key].push(date);saveData();toast("Maintenance logged");render()});document.querySelectorAll("[data-delete-maintenance]").forEach(b=>b.onclick=()=>{const a=m.history[b.dataset.deleteMaintenance];m.history[b.dataset.deleteMaintenance]=a.filter(x=>x!==b.dataset.date);saveData();render()})}

function lina17PlantLight(plant){
  if(plant.light)return plant.light;
  const n=String(plant.name||"").toLowerCase();
  if(n.includes("lemon")||n.includes("basil")||n.includes("oregano")||n.includes("nemesia"))return "Bright light / some sun";
  if(n.includes("orchid")||n.includes("spider")||n.includes("prayer"))return "Bright indirect light";
  return "Check care guide";
}
function lina17PlantWaterStatus(plant){
  if(!plant.lastWatered)return "Watering not logged";
  const cycle=Number(plant.wateringDays)||7;
  const due=new Date(`${plant.lastWatered}T12:00:00`);due.setDate(due.getDate()+cycle);
  const diff=lina17DaysBetween(today(),due.toISOString().slice(0,10));
  if(diff===0)return "Water today";
  if(diff===1)return "Water tomorrow";
  if(diff>1)return `Water in ${diff} days`;
  return `Water overdue by ${Math.abs(diff)} day${Math.abs(diff)===1?"":"s"}`;
}
function lina17PlantStatusClass(plant){
  if(!plant.lastWatered)return "status-neutral";
  const cycle=Number(plant.wateringDays)||7;
  const due=new Date(`${plant.lastWatered}T12:00:00`);due.setDate(due.getDate()+cycle);
  const diff=lina17DaysBetween(today(),due.toISOString().slice(0,10));
  return diff<0?"status-overdue":diff<=1?"status-soon":"status-good";
}
function PlantsPage(){
  return shell(`${head("Plants","Care for your green babies")}
    <div class="plant-dashboard-list">${(data.plants||[]).map(plant=>`<button class="card plant-dashboard-card ${lina17PlantStatusClass(plant)}" data-route="plant" data-route-id="${esc(plant.id)}">
      <span class="plant-dashboard-photo">${plant.photo?`<img src="${plant.photo}" alt="${esc(plant.name)}">`:`<span>${plant.emoji||"🌿"}</span>`}</span>
      <span class="plant-dashboard-copy"><strong>${esc(plant.name)}</strong><small>💧 ${esc(lina17PlantWaterStatus(plant))}</small><small>☀️ ${esc(lina17PlantLight(plant))}</small><small>🌱 ${plant.lastFed?`Last fed ${formatDate(plant.lastFed)}`:"Feeding not logged"}</small><small>📷 ${plant.photo?"Photo added":"Add photo"}</small></span><b>›</b>
    </button>`).join("")}</div>`,"plants");
}

render();
  }
});
function lina17HeaderIllustration(routeName){
  const art={
    plants:{emoji:"🪴",bits:["🌿","🌸","✨"]},
    plant:{emoji:"🪴",bits:["🌿","🌸","✨"]},
    pets:{emoji:"🐠",bits:["🫧","🌿","✨"]},
    tank:{emoji:"🐠",bits:["🫧","🌿","✨"]},
    todo:{emoji:"📋",bits:["🌸","✏️","✨"]},
    journal:{emoji:"☕",bits:["📖","💜","✨"]},
    today:{emoji:"☕",bits:["📖","💜","✨"]},
    budget:{emoji:"👛",bits:["🪙","🌸","✨"]},
    health:{emoji:"📏",bits:["💗","✨","〰️"]},
    house:{emoji:"🏡",bits:["🌸","🪴","✨"]}
  }[routeName];
  if(!art)return;
  const header=document.querySelector(".page-head");
  if(!header||header.querySelector(".lina-header-art"))return;
  const el=document.createElement("div");
  el.className=`lina-header-art lina-header-art-${routeName}`;
  el.setAttribute("aria-hidden","true");
  el.innerHTML=`<span class="header-art-main">${art.emoji}</span>${art.bits.map((x,i)=>`<i style="--i:${i}">${x}</i>`).join("")}`;
  header.appendChild(el);
}

function render(){
  resetSwipePreview();
  document.body.classList.toggle("dark",data.theme==="dark");
  const seasonalThemes=["plain","glitter","floral","spring","summer","autumn","winter"];
  if(!seasonalThemes.includes(data.colorTheme)) data.colorTheme="floral";
  document.body.dataset.colorTheme=data.colorTheme;
  renderSeasonalAtmosphere(data.colorTheme);
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
  lina17HeaderIllustration(route);

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
      const registration=await navigator.serviceWorker.register("./sw.js?v=1700",{updateViaCache:"none"});
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
