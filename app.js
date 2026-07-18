
const KEY="linahub-v4";
const initial={
  theme:"light",
  checkins:{},
  plants:["Lemon Tree","Basil","Greek Oregano","Orchid","Nemesia 'Vanilla'","Spider Plant","Prayer Plant","Apple Seeds"],
  reminders:[]
};
let data=load();
let route="home";

function load(){try{return {...initial,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{return structuredClone(initial)}}
function save(){localStorage.setItem(KEY,JSON.stringify(data))}
function today(){return new Date().toISOString().slice(0,10)}
function niceDate(){return new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(t){const x=document.querySelector("#toast");x.textContent=t;x.classList.add("show");setTimeout(()=>x.classList.remove("show"),1800)}
function nav(active){return `<nav class="bottom">
<button data-route="home" class="${active==="home"?"active":""}">⌂<small>Home</small></button>
<button data-route="checkin" class="${active==="checkin"?"active":""}">💜<small>Check-in</small></button>
<button data-route="plants" class="${active==="plants"?"active":""}">🌿<small>Plants</small></button>
<button data-route="house" class="${active==="house"?"active":""}">🏡<small>House</small></button>
<button data-route="settings" class="${active==="settings"?"active":""}">⚙️<small>Settings</small></button>
</nav>`}
function shell(content,active){return `<main class="shell">${content}</main>${nav(active)}`}
function head(title,sub){return `<div class="page-head"><button class="back" data-route="home">‹</button><div><h2>${title}</h2><p style="margin:2px 0">${sub||""}</p></div></div>`}

function home(){
 const d=new Date(), hour=d.getHours(), greet=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
 const dow=d.toLocaleDateString("en-GB",{weekday:"long"});
 const c=data.checkins[today()];
 const due=[];
 if(dow==="Thursday") due.push(["♻️","Put recycling out"]);
 due.push(["🐠","Feed both fish tanks"]);
 if(c) due.push(["💜","Today’s check-in saved"]);
 return shell(`
 <section class="hero"><div class="hero-row"><div><div class="eyebrow">LinaHub</div><h1>${greet},<br>Lina ✨</h1><p>A gentle overview of what needs your attention today.</p></div><button class="theme-btn" id="themeToggle">${data.theme==="dark"?"☀️":"🌙"}</button></div></section>
 <div class="grid">
 ${[
  ["📖","Daily Check-in","Pain, energy, sleep and your day","checkin"],
  ["⚖️","Health","History and trends","health"],
  ["🌿","Plants","Care and watering","plants"],
  ["💊","Medication","Doses and routines","medication"],
  ["🔴","Pokémon GO","Friend tracker coming later","pokemon"],
  ["🐠","Aquariums","Girls and boys tanks","pets"],
  ["🏡","House","Rooms and recurring tasks","house"],
  ["⚙️","Settings","Theme and backup","settings"]
 ].map(x=>`<button class="module" data-route="${x[3]}"><span class="emoji">${x[0]}</span><strong>${x[1]}</strong><small>${x[2]}</small></button>`).join("")}
 </div>
 <section class="card" style="margin-top:14px"><h2>Today’s</h2><div class="today-list">${due.map(x=>`<div class="reminder"><b>${x[0]}</b><span>${x[1]}</span></div>`).join("")}</div></section>
 `,"home")
}

const scales={
 energy:[["🥵","Very low"],["😟","Low"],["😐","Okay"],["😊","Good"],["🤩","Amazing"]],
 mood:[["😭","Overwhelmed"],["😟","Anxious"],["😐","Okay"],["🙂","Calm"],["😊","Happy"]],
 pain:[["😌","No pain"],["🙂","Mild"],["😐","Moderate"],["😣","Severe"],["😭","Very severe"]],
 sleep:[["😫","Awful"],["😟","Restless"],["😐","Okay"],["😊","Good"],["🤩","Amazing"]]
};
function scale(name,value){return `<div class="scale">${scales[name].map((x,i)=>`<button data-scale="${name}" data-value="${i}" class="${Number(value)===i?"active":""}"><span class="face">${x[0]}</span><small>${x[1]}</small></button>`).join("")}</div>`}
function checkin(){
 const j=data.checkins[today()]||{energy:2,mood:2,pain:2,sleep:2,spoons:0,water:0,selfCare:[],meds:[],priorities:["","","","",""],plan:Array.from({length:4},()=>({task:"",energy:"Medium",done:false})),supports:["","","",""],justToday:["","",""]};
 const care=["Rest","Reading","Exercises","Warmth","Good food","Fresh air","Music","Gaming","Hobbies"];
 const meds=["Morning ☀️","Afternoon 🌤️","Evening 🌙","Bedtime 🌜"];
 return shell(`${head("Today’s Check-in",niceDate())}<div class="stack">
 <section class="card"><h2>⚡ Today’s energy</h2>${scale("energy",j.energy)}</section>
 <section class="card"><h2>💜 Today’s mood</h2>${scale("mood",j.mood)}</section>
 <section class="card"><h2>☀️ Today’s pain</h2>${scale("pain",j.pain)}</section>
 <section class="card"><h2>🥄 Spoon bank</h2><p>Tap a spoon as you use energy.</p><div class="tokens">${Array.from({length:12},(_,i)=>`<button class="token ${i<j.spoons?"active":""}" data-token="spoons" data-value="${i+1}">🥄</button>`).join("")}</div></section>
 <section class="card"><h2>💧 Water intake</h2><p>Tap a drop each time you drink water.</p><div class="tokens">${Array.from({length:10},(_,i)=>`<button class="token ${i<j.water?"active":""}" data-token="water" data-value="${i+1}">💧</button>`).join("")}</div></section>
 <section class="card"><h2>📌 Today’s priorities</h2>${j.priorities.map((v,i)=>`<label class="row"><span class="row-num">${i+1}.</span><input class="field priority" value="${esc(v)}"></label>`).join("")}</section>
 <section class="card"><h2>🌸 Self-care menu</h2><div class="pills">${care.map(x=>`<button class="pill ${j.selfCare.includes(x)?"active":""}" data-care="${x}">${x}</button>`).join("")}</div></section>
 <section class="card"><h2>💊 Medication / tablets</h2><div class="pills">${meds.map(x=>`<button class="pill ${j.meds.includes(x)?"active":""}" data-med="${x}">${x}</button>`).join("")}</div></section>
 <section class="card"><h2>🗓️ Today’s plan</h2>${j.plan.map((r,i)=>`<div class="plan-row"><input class="field plan-task" value="${esc(r.task)}" placeholder="Task or activity"><select class="field plan-energy"><option ${r.energy==="High"?"selected":""}>High</option><option ${r.energy==="Medium"?"selected":""}>Medium</option><option ${r.energy==="Low"?"selected":""}>Low</option></select><button class="done ${r.done?"active":""}">✓</button></div>`).join("")}</section>
 <section class="card"><h2>😴 Sleep last night</h2>${scale("sleep",j.sleep)}</section>
 <section class="card"><h2>✨ Just today’s</h2>${j.justToday.map(v=>`<input class="field just-today" style="margin-top:9px" value="${esc(v)}">`).join("")}</section>
 <section class="card"><h2>🦴 Braces / supports used</h2>${j.supports.map(v=>`<input class="field support" style="margin-top:9px" value="${esc(v)}" placeholder="e.g. knee brace">`).join("")}</section>
 <button class="primary" id="saveCheckin">Save today’s check-in</button>
 </div>`,"checkin")
}

function simplePage(title,emoji,text,active){
 return shell(`${head(title,text)}<section class="card empty"><div style="font-size:3rem">${emoji}</div><h2 style="margin-top:12px">${title}</h2><p>This clean v4 foundation is ready for the full module next.</p></section>`,active)
}
function plants(){return shell(`${head("Plants","Your plant family")}<div class="stack">${data.plants.map(p=>`<section class="card"><h2>🌿 ${esc(p)}</h2><p>Watering, notes, photos and reminders will live here.</p></section>`).join("")}</div>`,"plants")}
function settings(){
 return shell(`${head("Settings","Appearance and your data")}<section class="card"><h2>Appearance</h2><button class="primary" id="themeToggle2">Switch to ${data.theme==="dark"?"light":"dark"} mode</button></section><section class="card"><h2>Backup</h2><p>Your information is stored locally on this device.</p><button class="primary" id="exportData">Export backup</button></section>`,"settings")
}
function render(){
 document.body.classList.toggle("dark",data.theme==="dark");
 const pages={home,checkin,plants,settings,
 health:()=>simplePage("Health","⚖️","Pain, sleep and energy history",""),
 medication:()=>simplePage("Medication","💊","Medication and dose tracking",""),
 pokemon:()=>simplePage("Pokémon GO","🔴","Friend and Vivillon tracker",""),
 pets:()=>simplePage("Aquariums","🐠","Girls and boys tanks",""),
 house:()=>simplePage("House","🏡","Rooms and recurring routines","house")};
 document.querySelector("#app").innerHTML=(pages[route]||home)();
 bind();
}
function bind(){
 document.querySelectorAll("[data-route]").forEach(b=>b.onclick=()=>{route=b.dataset.route;render();scrollTo(0,0)});
 const theme=()=>{data.theme=data.theme==="dark"?"light":"dark";save();render()};
 document.querySelector("#themeToggle")?.addEventListener("click",theme);
 document.querySelector("#themeToggle2")?.addEventListener("click",theme);
 document.querySelectorAll("[data-scale]").forEach(b=>b.onclick=()=>{document.querySelectorAll(`[data-scale="${b.dataset.scale}"]`).forEach(x=>x.classList.remove("active"));b.classList.add("active")});
 document.querySelectorAll("[data-token]").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.value),name=b.dataset.token;document.querySelectorAll(`[data-token="${name}"]`).forEach(x=>x.classList.toggle("active",Number(x.dataset.value)<=n))});
 document.querySelectorAll("[data-care],[data-med],.done").forEach(b=>b.onclick=()=>b.classList.toggle("active"));
 document.querySelector("#saveCheckin")?.addEventListener("click",saveCheckin);
 document.querySelector("#exportData")?.addEventListener("click",()=>{
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download="LinaHub-backup.json";a.click();URL.revokeObjectURL(a.href)
 });
}
function saveCheckin(){
 const getScale=n=>Number(document.querySelector(`[data-scale="${n}"].active`)?.dataset.value||2);
 const plan=[...document.querySelectorAll(".plan-row")].map(r=>({task:r.querySelector(".plan-task").value,energy:r.querySelector(".plan-energy").value,done:r.querySelector(".done").classList.contains("active")}));
 data.checkins[today()]={
  energy:getScale("energy"),mood:getScale("mood"),pain:getScale("pain"),sleep:getScale("sleep"),
  spoons:document.querySelectorAll('[data-token="spoons"].active').length,
  water:document.querySelectorAll('[data-token="water"].active').length,
  selfCare:[...document.querySelectorAll("[data-care].active")].map(x=>x.dataset.care),
  meds:[...document.querySelectorAll("[data-med].active")].map(x=>x.dataset.med),
  priorities:[...document.querySelectorAll(".priority")].map(x=>x.value),
  plan,
  supports:[...document.querySelectorAll(".support")].map(x=>x.value),
  justToday:[...document.querySelectorAll(".just-today")].map(x=>x.value)
 };
 save();toast("Today’s check-in saved 💜")
}
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js?v=4"));
render();
