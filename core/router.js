let route="home";
let routeId="";
let navDirection="forward";
const navigationHistory=[];

function currentLocation(){return {route,routeId}}
function sameLocation(a,b){return !!a&&!!b&&a.route===b.route&&a.routeId===b.routeId}

function nav(active){
  return `<nav class="bottom five-nav">
    <button data-route="home" class="${active==="home"?"active":""}">⌂<small>Home</small></button>
    <button data-route="journal" class="${active==="journal"?"active":""}">💜<small>Journal</small></button>
    <button data-route="today" class="${active==="today"?"active":""}">✅<small>Today</small></button>
    <button data-route="todo" class="${active==="todo"?"active":""}">📝<small>To-do</small></button>
    <button data-route="settings" class="${active==="settings"?"active":""}">⚙️<small>Settings</small></button>
  </nav>`;
}
function moduleBanner(active){
  const image=data.moduleBanners?.[active];
  if(!image||active==="home"||active==="settings") return "";
  return `<section class="module-banner" style="background-image:linear-gradient(180deg,rgba(20,12,38,.05),rgba(20,12,38,.45)),url('${image}')"><span>${esc(active==="pets"?"Aquariums":active==="health"?"Weight & Measures":active==="journal"?"Daily Check-in":active.charAt(0).toUpperCase()+active.slice(1))}</span></section>`;
}
function shell(content,active){
  return `<main class="shell page-enter ${navDirection==="back"?"from-left":"from-right"}">${moduleBanner(active)}${content}</main>${nav(active)}`;
}
function head(title,sub="",backRoute="home"){
  return `<div class="page-head"><button class="back" data-back="${backRoute}" aria-label="Back">‹</button><div><h2>${title}</h2><p style="margin:2px 0">${sub}</p></div></div>`;
}
function go(next,id="",direction="forward",options={}){
  const destination={route:next,routeId:id||""};
  const current=currentLocation();
  if(direction!=="back"&&!options.replace&&!sameLocation(current,destination)){
    navigationHistory.push(current);
    if(navigationHistory.length>40) navigationHistory.shift();
  }
  route=destination.route;
  routeId=destination.routeId;
  navDirection=direction;
  render();
  scrollTo({top:0,behavior:"instant"});
}
function goBack(fallback="home"){
  const previous=navigationHistory.pop();
  if(previous) return go(previous.route,previous.routeId,"back",{replace:true});
  if(route==="plant") return go("plants","","back",{replace:true});
  if(route==="tank") return go("pets","","back",{replace:true});
  return go(fallback,"","back",{replace:true});
}
