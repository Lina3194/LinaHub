
let route="home";
let routeId="";

function nav(active){
  return `<nav class="bottom five-nav">
    <button data-route="home" class="${active==="home"?"active":""}">⌂<small>Home</small></button>
    <button data-route="journal" class="${active==="journal"?"active":""}">💜<small>Journal</small></button>
    <button data-route="today" class="${active==="today"?"active":""}">✅<small>Today</small></button>
    <button data-route="todo" class="${active==="todo"?"active":""}">📝<small>To-do</small></button>
    <button data-route="settings" class="${active==="settings"?"active":""}">⚙️<small>Settings</small></button>
  </nav>`;
}
function shell(content,active){return `<main class="shell">${content}</main>${nav(active)}`}
function head(title,sub=""){return `<div class="page-head"><button class="back" data-route="home">‹</button><div><h2>${title}</h2><p style="margin:2px 0">${sub}</p></div></div>`}
function go(next,id=""){route=next;routeId=id;render();scrollTo(0,0)}
