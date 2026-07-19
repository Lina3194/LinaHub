
let route="home";
let routeId="";
let navDirection="forward";
let suppressNextPageAnimation=false;
const navigationHistory=[];

function nav(active){
  return `<nav class="bottom five-nav">
    <button type="button" data-route="home" class="${active==="home"?"active":""}">⌂<small>Home</small></button>
    <button type="button" data-route="journal" class="${active==="journal"?"active":""}">💜<small>Journal</small></button>
    <button type="button" data-route="today" class="${active==="today"?"active":""}">✅<small>Today</small></button>
    <button type="button" data-route="todo" class="${active==="todo"?"active":""}">📝<small>To-do</small></button>
    <button type="button" data-route="settings" class="${active==="settings"?"active":""}">⚙️<small>Settings</small></button>
  </nav>`;
}

function moduleBanner(active){
  const image=data.moduleBanners?.[active];
  if(!image||active==="home"||active==="settings") return "";
  const names={
    journal:"Daily Check-in",today:"Today",todo:"To-do",health:"Weight & Measures",
    plants:"Plants",medication:"Medication",pokemon:"Pokémon GO",pets:"Aquariums",house:"House"
  };
  return `<section class="module-banner">
    <img src="${image}" alt="">
    <span>${esc(names[active]||active)}</span>
  </section>`;
}

function shell(content,active){
  const animationClass=suppressNextPageAnimation?"page-settled":`page-enter ${navDirection==="back"?"from-left":"from-right"}`;
  suppressNextPageAnimation=false;
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

function go(next,id="",direction="forward",options={}){
  if(!next) return;
  const destination={route:String(next),routeId:id?String(id):""};
  const current=currentLocation();

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
