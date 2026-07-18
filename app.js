
const KEY="linahub-v4-3";
const initial={
  theme:"light",
  checkins:{},
  plants:[
    {id:"lemon-tree",name:"Lemon Tree",emoji:"🍋",notes:"Grown from a lemon seed.",lastWatered:"",history:[],photo:""},
    {id:"basil",name:"Basil",emoji:"🌿",notes:"",lastWatered:"",history:[],photo:""},
    {id:"greek-oregano",name:"Greek Oregano",emoji:"🌱",notes:"",lastWatered:"",history:[],photo:""},
    {id:"orchid",name:"Orchid",emoji:"🌸",notes:"",lastWatered:"",history:[],photo:""},
    {id:"nemesia-vanilla",name:"Nemesia 'Vanilla'",emoji:"🌼",notes:"",lastWatered:"",history:[],photo:""},
    {id:"spider-plant",name:"Spider Plant",emoji:"🪴",notes:"",lastWatered:"",history:[],photo:""},
    {id:"prayer-plant",name:"Prayer Plant",emoji:"🍃",notes:"",lastWatered:"",history:[],photo:""},
    {id:"apple-seeds",name:"Apple Seeds",emoji:"🍎",notes:"",lastWatered:"",history:[],photo:""}
  ],
  reminders:[],
  checkinLayout:["energy","mood","pain","spoons","water","priorities","selfcare","medication","plan","sleep","justtoday","supports"],
  checkinFilter:"all",
  checkinHidden:[],
  checkinEditMode:false
};
let data=load();
let route="home";
let routeId="";

function load(){
 try{
  const loaded={...initial,...JSON.parse(localStorage.getItem(KEY)||"{}")};
  if(Array.isArray(loaded.plants)){
   loaded.plants=loaded.plants.map((p,i)=>typeof p==="string"
    ? {id:p.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||("plant-"+i),name:p,emoji:"🌿",notes:"",lastWatered:"",history:[],photo:""}
    : {...p,history:Array.isArray(p.history)?p.history:[],photo:p.photo||"",notes:p.notes||"",lastWatered:p.lastWatered||""});
  }
  return loaded;
 }catch{return structuredClone(initial)}
}
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
 pain:[["😭","Very severe"],["😣","Severe"],["😐","Moderate"],["🙂","Mild"],["😌","No pain"]],
 sleep:[["😫","Awful"],["😟","Restless"],["😐","Okay"],["😊","Good"],["🤩","Amazing"]]
};
function scale(name,value){return `<div class="scale">${scales[name].map((x,i)=>`<button data-scale="${name}" data-value="${i}" class="${value!==null&&value!==undefined&&Number(value)===i?"active":""}"><span class="face">${x[0]}</span><small>${x[1]}</small></button>`).join("")}</div>`}
function checkin(){
 const j=data.checkins[today()]||{energy:null,mood:null,pain:null,sleep:null,spoons:0,water:0,selfCare:[],meds:[],priorities:["","","","",""],plan:Array.from({length:4},()=>({task:"",energy:"Medium",done:false})),supports:["","","",""],justToday:["","",""]};
 const care=["Rest","Reading","Exercises","Warmth","Good food","Fresh air","Music","Gaming","Hobbies"];
 const meds=["Morning ☀️","Afternoon 🌤️","Evening 🌙","Bedtime 🌜"];
 const blocks={
  energy:`<section class="card draggable" data-block="energy" data-group="emoji"><div class="drag-handle">⋮⋮</div><h2>⚡ Today’s energy</h2>${scale("energy",j.energy)}</section>`,
  mood:`<section class="card draggable" data-block="mood" data-group="emoji"><div class="drag-handle">⋮⋮</div><h2>💜 Today’s mood</h2>${scale("mood",j.mood)}</section>`,
  pain:`<section class="card draggable" data-block="pain" data-group="emoji"><div class="drag-handle">⋮⋮</div><h2>☀️ Today’s pain</h2>${scale("pain",j.pain)}</section>`,
  spoons:`<section class="card draggable" data-block="spoons" data-group="wellness"><div class="drag-handle">⋮⋮</div><h2>🥄 Spoon bank</h2><p>Tap a spoon as you use energy.</p><div class="tokens">${Array.from({length:12},(_,i)=>`<button class="token ${i<j.spoons?"active":""}" data-token="spoons" data-value="${i+1}">🥄</button>`).join("")}</div></section>`,
  water:`<section class="card draggable" data-block="water" data-group="wellness"><div class="drag-handle">⋮⋮</div><h2>💧 Water intake</h2><p>Tap a drop each time you drink water.</p><div class="tokens">${Array.from({length:10},(_,i)=>`<button class="token ${i<j.water?"active":""}" data-token="water" data-value="${i+1}">💧</button>`).join("")}</div></section>`,
  priorities:`<section class="card draggable" data-block="priorities" data-group="planning"><div class="drag-handle">⋮⋮</div><h2>📌 Today’s priorities</h2>${j.priorities.map((v,i)=>`<label class="row"><span class="row-num">${i+1}.</span><input class="field priority" value="${esc(v)}"></label>`).join("")}</section>`,
  selfcare:`<section class="card draggable" data-block="selfcare" data-group="wellness"><div class="drag-handle">⋮⋮</div><h2>🌸 Self-care menu</h2><div class="pills">${care.map(x=>`<button class="pill ${j.selfCare.includes(x)?"active":""}" data-care="${x}">${x}</button>`).join("")}</div></section>`,
  medication:`<section class="card draggable" data-block="medication" data-group="wellness"><div class="drag-handle">⋮⋮</div><h2>💊 Medication / tablets</h2><div class="pills">${meds.map(x=>`<button class="pill ${j.meds.includes(x)?"active":""}" data-med="${x}">${x}</button>`).join("")}</div></section>`,
  plan:`<section class="card draggable" data-block="plan" data-group="planning"><div class="drag-handle">⋮⋮</div><h2>🗓️ Today’s plan</h2>${j.plan.map((r,i)=>`<div class="plan-row"><input class="field plan-task" value="${esc(r.task)}" placeholder="Task or activity"><select class="field plan-energy"><option ${r.energy==="High"?"selected":""}>High</option><option ${r.energy==="Medium"?"selected":""}>Medium</option><option ${r.energy==="Low"?"selected":""}>Low</option></select><button class="done ${r.done?"active":""}">✓</button></div>`).join("")}</section>`,
  sleep:`<section class="card draggable" data-block="sleep" data-group="emoji"><div class="drag-handle">⋮⋮</div><h2>😴 Sleep last night</h2>${scale("sleep",j.sleep)}</section>`,
  justtoday:`<section class="card draggable" data-block="justtoday" data-group="planning"><div class="drag-handle">⋮⋮</div><h2>✨ Just today’s</h2>${j.justToday.map(v=>`<input class="field just-today" style="margin-top:9px" value="${esc(v)}">`).join("")}</section>`,
  supports:`<section class="card draggable" data-block="supports" data-group="planning"><div class="drag-handle">⋮⋮</div><h2>🦴 Braces / supports used</h2>${j.supports.map(v=>`<input class="field support" style="margin-top:9px" value="${esc(v)}" placeholder="e.g. knee brace">`).join("")}</section>`
 };
 const order=(data.checkinLayout||Object.keys(blocks)).filter(k=>blocks[k]);
 return shell(`${head("Today’s Check-in",niceDate())}
 <section class="card filter-card">
  <div class="layout-toolbar">
   <div>
    <h2>Journal view</h2>
    <p class="reorder-note">${data.checkinEditMode?"Drag cards, then tap the eye to hide or show them.":"Choose what you want to see today."}</p>
   </div>
   <button class="magic-edit ${data.checkinEditMode?"active":""}" id="toggleEditMode">${data.checkinEditMode?"✓ Done":"🪄 Edit layout"}</button>
  </div>
  <div class="pills filter-pills">
   <button class="pill ${data.checkinFilter==="all"?"active":""}" data-filter="all">Everything</button>
   <button class="pill ${data.checkinFilter==="emoji"?"active":""}" data-filter="emoji">Emoji check-ins</button>
   <button class="pill ${data.checkinFilter==="planning"?"active":""}" data-filter="planning">To-do & planning</button>
   <button class="pill ${data.checkinFilter==="wellness"?"active":""}" data-filter="wellness">Wellness</button>
  </div>
 </section>
 <div class="stack ${data.checkinEditMode?"editing":""}" id="checkinStack">${order.map(k=>{
   const hidden=(data.checkinHidden||[]).includes(k);
   const block=blocks[k].replace('<section class="card draggable"', `<section class="card draggable ${hidden?"user-hidden":""}"`);
   return block.replace('<div class="drag-handle">⋮⋮</div>', `<div class="drag-handle">⋮⋮</div><button class="visibility-toggle ${hidden?"is-hidden":""}" data-visibility="${k}" aria-label="${hidden?"Show":"Hide"} section">${hidden?"🙈":"👁️"}</button>`);
 }).join("")}</div>
 <button class="primary" id="saveCheckin">Save today’s check-in</button>`,"checkin")
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
 const pages={home,checkin,plants,plant:plantProfile,settings,
 health:()=>simplePage("Health","⚖️","Pain, sleep and energy history",""),
 medication:()=>simplePage("Medication","💊","Medication and dose tracking",""),
 pokemon:()=>simplePage("Pokémon GO","🔴","Friend and Vivillon tracker",""),
 pets:()=>simplePage("Aquariums","🐠","Girls and boys tanks",""),
 house:()=>simplePage("House","🏡","Rooms and recurring routines","house")};
 document.querySelector("#app").innerHTML=(pages[route]||home)();
 bind();
}
function bind(){
 document.querySelectorAll("[data-route]").forEach(b=>b.onclick=()=>{route=b.dataset.route;routeId="";render();scrollTo(0,0)});
 document.querySelectorAll("[data-plant]").forEach(b=>b.onclick=()=>{route="plant";routeId=b.dataset.plant;render();scrollTo(0,0)});
 const theme=()=>{data.theme=data.theme==="dark"?"light":"dark";save();render()};
 document.querySelector("#themeToggle")?.addEventListener("click",theme);
 document.querySelector("#themeToggle2")?.addEventListener("click",theme);
 document.querySelectorAll("[data-scale]").forEach(b=>b.onclick=()=>{document.querySelectorAll(`[data-scale="${b.dataset.scale}"]`).forEach(x=>x.classList.remove("active"));b.classList.add("active")});
 document.querySelectorAll("[data-token]").forEach(b=>b.onclick=()=>{const n=Number(b.dataset.value),name=b.dataset.token;document.querySelectorAll(`[data-token="${name}"]`).forEach(x=>x.classList.toggle("active",Number(x.dataset.value)<=n))});
 document.querySelectorAll("[data-care],[data-med],.done").forEach(b=>b.onclick=()=>b.classList.toggle("active"));

 document.querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>{
  data.checkinFilter=b.dataset.filter;save();applyCheckinFilter();
  document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("active",x.dataset.filter===data.checkinFilter));
 });
 document.querySelector("#toggleEditMode")?.addEventListener("click",()=>{
  data.checkinEditMode=!data.checkinEditMode;save();render();
 });
 document.querySelectorAll("[data-visibility]").forEach(b=>b.onclick=e=>{
  e.stopPropagation();
  const id=b.dataset.visibility;
  data.checkinHidden=data.checkinHidden||[];
  if(data.checkinHidden.includes(id)) data.checkinHidden=data.checkinHidden.filter(x=>x!==id);
  else data.checkinHidden.push(id);
  save();render();
 });
 setupDragAndDrop();
 applyCheckinFilter();


 document.querySelector("#waterPlant")?.addEventListener("click",()=>{
  const p=data.plants.find(x=>x.id===routeId);if(!p)return;
  const d=today();p.lastWatered=d;p.history=p.history||[];
  if(!p.history.includes(d))p.history.push(d);
  save();toast(`${p.name} watered 💧`);render();
 });
 document.querySelector("#savePlantNotes")?.addEventListener("click",()=>{
  const p=data.plants.find(x=>x.id===routeId);if(!p)return;
  p.notes=document.querySelector(".plant-notes")?.value||"";
  save();toast("Plant notes saved 🌿");
 });
 document.querySelector("#plantPhoto")?.addEventListener("change",e=>{
  const file=e.target.files?.[0];if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
   const p=data.plants.find(x=>x.id===routeId);if(!p)return;
   p.photo=reader.result;save();toast("Plant photo saved 📷");render();
  };
  reader.readAsDataURL(file);
 });

 document.querySelector("#saveCheckin")?.addEventListener("click",saveCheckin);
 document.querySelector("#exportData")?.addEventListener("click",()=>{
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download="LinaHub-backup.json";a.click();URL.revokeObjectURL(a.href)
 });
}

function applyCheckinFilter(){
 const filter=data.checkinFilter||"all";
 const editing=!!data.checkinEditMode;
 document.querySelectorAll(".draggable").forEach(card=>{
  const hiddenByUser=(data.checkinHidden||[]).includes(card.dataset.block);
  const hiddenByFilter=filter!=="all"&&card.dataset.group!==filter;
  card.classList.toggle("filtered-out",!editing&&(hiddenByUser||hiddenByFilter));
  card.classList.toggle("soft-hidden",editing&&hiddenByUser);
 });
}
function setupDragAndDrop(){
 const stack=document.querySelector("#checkinStack");if(!stack||!data.checkinEditMode)return;
 let dragged=null;
 stack.querySelectorAll(".draggable").forEach(card=>{
  card.setAttribute("draggable","true");
  card.addEventListener("dragstart",e=>{
   if(!e.target.closest(".drag-handle")){e.preventDefault();return}
   dragged=card;card.classList.add("dragging");
  });
  card.addEventListener("dragend",()=>{
   card.classList.remove("dragging");dragged=null;
   data.checkinLayout=[...stack.querySelectorAll(".draggable")].map(x=>x.dataset.block);save();
  });
  card.addEventListener("dragover",e=>{
   e.preventDefault();if(!dragged||dragged===card)return;
   const rect=card.getBoundingClientRect();
   stack.insertBefore(dragged,e.clientY<rect.top+rect.height/2?card:card.nextSibling);
  });
 });
}

function saveCheckin(){
 const getScale=n=>{const el=document.querySelector(`[data-scale="${n}"].active`);return el?Number(el.dataset.value):null};
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
if("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js?v=43"));
render();
