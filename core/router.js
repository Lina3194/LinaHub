
let route="home";
let routeId="";
let previousRoute="home";
let previousRouteId="";
let navDirection="forward";

function nav(active){
  return `<nav class="bottom five-nav">
    <button data-route="home" class="${active==="home"?"active":""}">⌂<small>Home</small></button>
    <button data-route="journal" class="${active==="journal"?"active":""}">💜<small>Journal</small></button>
    <button data-route="today" class="${active==="today"?"active":""}">✅<small>Today</small></button>
    <button data-route="todo" class="${active==="todo"?"active":""}">📝<small>To-do</small></button>
    <button data-route="settings" class="${active==="settings"?"active":""}">⚙️<small>Settings</small></button>
  </nav>`;
}
function shell(content,active){
  return `<main class="shell page-enter ${navDirection==="back"?"from-left":"from-right"}">${content}</main>${nav(active)}`;
}
function head(title,sub="",backRoute="home"){
  return `<div class="page-head"><button class="back" data-route="${backRoute}" aria-label="Back">‹</button><div><h2>${title}</h2><p style="margin:2px 0">${sub}</p></div></div>`;
}
function go(next,id="",direction="forward"){
  previousRoute=route;
  previousRouteId=routeId;
  route=next;
  routeId=id;
  navDirection=direction;
  render();
  scrollTo({top:0,behavior:"instant"});
}
function goBack(fallback="home"){
  if(route==="plant") return go("plants","","back");
  if(previousRoute && previousRoute!==route) return go(previousRoute,previousRouteId,"back");
  return go(fallback,"","back");
}
