
let route="home";
let routeId="";
let navDirection="forward";
let suppressNextPageAnimation=true;
const navigationHistory=[];

function nav(active){
  return `<nav class="bottom five-nav">
    <button type="button" data-route="home" class="${active==="home"?"active":""}">${moduleVisual("home","⌂","bottom-nav-image")}<small>Home</small></button>
    <button type="button" data-route="today" class="${active==="today"?"active":""}">${moduleVisual("today","✅","bottom-nav-image")}<small>Today</small></button>
    <button type="button" data-route="todo" class="${active==="todo"?"active":""}">${moduleVisual("todo","📝","bottom-nav-image")}<small>To-do</small></button>
    <button type="button" data-route="shopping" class="${active==="shopping"?"active":""}">${moduleVisual("shopping","🛒","bottom-nav-image")}<small>Shopping</small></button>
    <button type="button" data-route="settings" class="${active==="settings"?"active":""}">${moduleVisual("settings","⚙️","bottom-nav-image")}<small>Settings</small></button>
  </nav>`;
}

function moduleBanner(active){
  const image=data.moduleBanners?.[active];
  if(!image||active==="home"||active==="settings") return "";
  const names={
    journal:"Journal",today:"Today",todo:"To-do",shopping:"Shopping",health:"Health",hobbies:"Hobbies",books:"Books",gaming:"Gaming",
    plants:"Plants",medication:"Medication",pokemon:"Pokémon GO",pets:"Aquariums",house:"House",period:"Period Tracker",budget:"Budget & Bills",treasures:"Treasure Room"
  };
  return `<section class="module-banner">
    <img src="${image}" alt="">
    <span>${esc(names[active]||active)}</span>
  </section>`;
}

function moduleHistoryKey(active){
  if(active==="health"){
    const tab=data.healthView?.tab||"dashboard";
    return ({sleep:"sleep",garden:"journal",weight:"weight",measurements:"measurements"})[tab]||"health";
  }
  return ({journal:"journal",today:"today",todo:"todo",shopping:"shopping",plants:"plants",plant:"plants",hobbies:"hobbies",books:"books",gaming:"gaming",medication:"medication",pokemon:"pokemon",pets:"aquariums",tank:"aquariums",house:"house",period:"period",budget:"budget",treasures:"treasures"})[active]||active;
}
function moduleRouteForHistoryKey(key){
  return ({weight:"health",sleep:"health",measurements:"health",mood:"health",energy:"health",pain:"health",health:"health",aquariums:"pets"})[key]||key;
}
function moduleSectionTabs(active,selected="today",historyKey=""){
  const supported=new Set(["journal","today","todo","shopping","plants","plant","health","hobbies","books","gaming","medication","pokemon","pets","tank","house","period","budget","treasures"]);
  if(!supported.has(active)) return "";
  const key=historyKey||moduleHistoryKey(active);
  const landing=active==="plant"?"plants":active==="tank"?"pets":active;
  return `<nav class="module-section-tabs" aria-label="Module sections"><button type="button" class="${selected==="today"?"active":""}" data-route="${landing}">Today</button><button type="button" class="${selected==="history"?"active":""}" data-route="history" data-route-id="${key}">History</button><button type="button" class="${selected==="settings"?"active":""}" data-route="settings">Settings</button></nav>`;
}
function shell(content,active,options={}){
  const animationClass="page-settled";
  suppressNextPageAnimation=true;
  const selected=options.section||"today";
  return `<main class="shell ${animationClass}">
    ${moduleBanner(active)}
    ${content}
  </main>${nav(active)}`;
}

function head(title,sub="",fallback="home"){
  return `<div class="page-head">
    <button type="button" class="back" data-back="${fallback}" aria-label="Back">‹</button>
    <div><h2>${title}</h2><p style="margin:2px 0">${sub}</p></div>
  </div>`;
}

function currentLocation(){
  return {route,routeId};
}

function sameLocation(a,b){
  return a.route===b.route && a.routeId===b.routeId;
}


function resetModuleLanding(next){
  if(next==="medication"){
    if(typeof ensureMedicationData==="function") ensureMedicationData();
    data.medicationView=data.medicationView||{};
    data.medicationView.tab="today";
    data.medicationView.date=typeof medLocalDate==="function"?medLocalDate():today();
    medicationDateTouched=false;
  }
  if(next==="journal"){
    data.journalTab="today";
    data.journalSelectedDate=today();
  }
  if(next==="plants"){
    if(typeof plantUi!=="undefined"){plantUi.view="collection";plantUi.encyclopediaOpen=null;plantUi.encyclopediaSearch="";}
    data.plantProfileTab="care";
  }
  if(next==="pokemon" && typeof pokemonUi!=="undefined"){
    pokemonUi.view="friends";pokemonUi.page=1;pokemonUi.editing=null;pokemonUi.openCard=null;
  }
  if(next==="pets"){
    routeId="";
  }
  if(next==="house"){
    data.houseControlsCollapsed=true;
  }
}

function go(next,id="",direction="forward",options={}){
  if(!next) return;
  const destination={route:String(next),routeId:id?String(id):""};
  const current=currentLocation();
  if(destination.route==="health" && direction!=="back") {
    data.healthView=data.healthView||{};
    data.healthView.tab=destination.routeId==="garden"?"garden":"dashboard";
    destination.routeId="";
  }
  if(destination.route==="period" && direction!=="back" && current.route!=="period") {
    const localToday=typeof today==="function"?today():new Date().toLocaleDateString("en-CA");
    data.periodSelectedDate=localToday;
    data.periodCalendarMonth=localToday.slice(0,7);
    data.periodTab="today";
  }
  const topLevelTiles=new Set(["journal","today","todo","plants","health","hobbies","books","gaming","medication","shopping","pokemon","pets","house","period","budget","treasures","settings","history"]);
  if(direction!=="back" && !id && topLevelTiles.has(destination.route) && (current.route==="home" || current.route!==destination.route)){
    resetModuleLanding(destination.route);
  }

  if(destination.route==="plant" && (current.route!=="plant" || current.routeId!==destination.routeId)){
    data.plantProfileTab="care";
  }

  if(direction!=="back" && !options.replace && !sameLocation(current,destination)){
    navigationHistory.push(current);
    if(navigationHistory.length>50) navigationHistory.shift();
  }

  route=destination.route;
  routeId=destination.routeId;
  navDirection=direction;
  render();

  try{
    window.scrollTo({top:0,left:0,behavior:"auto"});
  }catch{
    window.scrollTo(0,0);
  }
}

function goBack(fallback="home"){
  if(route==="health" && data.healthView && data.healthView.tab && data.healthView.tab!=="dashboard"){
    data.healthView.tab="dashboard";
    saveData();
    navDirection="back";
    render();
    try{window.scrollTo({top:0,left:0,behavior:"auto"})}catch{window.scrollTo(0,0)}
    return;
  }
  const previous=navigationHistory.pop();
  if(previous){
    go(previous.route,previous.routeId,"back",{replace:true});
    return;
  }

  if(route==="plant"){
    go("plants","","back",{replace:true});
    return;
  }
  if(route==="tank"){
    go("pets","","back",{replace:true});
    return;
  }

  go(fallback||"home","","back",{replace:true});
}
