
function aquariumDateTimeLabel(value){
  if(!value) return "Not logged yet";
  const d=new Date(value);
  if(Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-GB",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"});
}

function aquariumLocalDate(value){
  if(!value) return "";
  const d=new Date(value);
  if(Number.isNaN(d.getTime())) return "";
  const pad=n=>String(n).padStart(2,"0");
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}
function tankFeedToday(tank){
  return [...(tank.feeds||[])]
    .filter(feed=>aquariumLocalDate(feed.createdAt)===today())
    .sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""))[0]||null;
}

function tankById(id){return (data.aquariums||[]).find(t=>t.id===id)}
function AquariumsPage(){
  return shell(`${head("Aquariums","Care logs for your girls and boys tanks")}
    <section class="aquarium-hero card">
      <div><span class="section-kicker">🫧 Tank care</span><h1>Your underwater family</h1><p>Track livestock, feeding, temperature and maintenance without mixing it into Today.</p></div>
      <div class="bubble-cluster" aria-hidden="true"><i></i><i></i><i></i></div>
    </section>
    <div class="tank-grid">
      ${(data.aquariums||[]).map(t=>`
        <button class="tank-card ${t.id}" data-route="tank" data-route-id="${esc(t.id)}">
          <div class="tank-wave"></div>
          <span class="tank-emoji">${t.emoji}</span>
          <div><h2>${esc(t.name)}</h2><p>${t.livestock.reduce((n,x)=>n+(Number(x.count)||0),0)} counted residents · ${t.temperature?`${esc(t.temperature)}°C`:"Temperature not logged"}</p><span class="feed-status ${tankFeedToday(t)?"fed":"due"}">${tankFeedToday(t)?`✓ Fed today · ${new Date(tankFeedToday(t).createdAt).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}`:"Needs feeding today"}</span></div>
          <span class="tank-arrow">›</span>
        </button>`).join("")}
    </div>
  `,"pets");
}
function AquariumTankPage(){
  const tank=tankById(routeId);
  if(!tank) return AquariumsPage();
  const feeds=[...(tank.feeds||[])].sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""));
  const m=tank.maintenance||{};
  return shell(`${head(tank.name,"Aquarium profile","pets")}
    <section class="card tank-profile-hero">
      <div class="tank-profile-icon">${tank.emoji}</div>
      <div><span class="section-kicker">Current water temperature</span><h1>${tank.temperature?`${esc(tank.temperature)}°C`:"Not logged"}</h1><p>${tank.temperatureUpdated?`Updated ${aquariumDateTimeLabel(tank.temperatureUpdated)}`:"Add the current temperature below."}</p></div>
    </section>

    <section class="card">
      <div class="section-title"><div><span class="section-kicker">🐟 Residents</span><h2>Fish & other life</h2></div></div>
      <div class="livestock-list">
        ${tank.livestock.length?tank.livestock.map(item=>`<div class="livestock-row"><span class="life-icon">${item.type==="Fish"?"🐟":item.type==="Shrimp"?"🦐":item.type==="Snail"?"🐌":"🫧"}</span><div><strong>${esc(item.name)}</strong><small>${esc(item.type)}</small></div><b>${item.count===""?"—":esc(item.count)}</b><button class="icon-danger" data-life-delete="${esc(item.id)}" aria-label="Delete">×</button></div>`).join(""):`<p>No residents added yet.</p>`}
      </div>
      <div class="form-grid add-life-form">
        <div class="two-col"><select class="field" id="lifeType"><option>Fish</option><option>Shrimp</option><option>Snail</option><option>Other</option></select><input class="field" id="lifeCount" type="number" min="0" placeholder="Number"></div>
        <input class="field" id="lifeName" placeholder="e.g. Female guppies">
        <button class="primary" id="addLife">Add resident</button>
      </div>
    </section>

    <section class="card">
      <div class="section-title"><div><span class="section-kicker">🌡️ Water</span><h2>Temperature</h2></div></div>
      <div class="two-col"><input class="field" id="tankTemp" type="number" step="0.1" placeholder="Temperature °C" value="${esc(tank.temperature)}"><button class="primary" id="saveTemp">Save temperature</button></div>
    </section>

    <section class="card">
      <div class="section-title"><div><span class="section-kicker">🍽️ Care</span><h2>Feeds</h2></div><span class="live-time">Date & time automatic</span></div>
      ${tankFeedToday(tank)
        ? `<div class="feed-confirmed"><span>✓</span><div><strong>Fed today</strong><small>${aquariumDateTimeLabel(tankFeedToday(tank).createdAt)} · ${esc(tankFeedToday(tank).food||"Fed")}</small></div></div>`
        : `<div class="feed-needed"><span>🍽️</span><div><strong>Not fed yet today</strong><small>Log the feed below when it is done.</small></div></div>`}
      <div class="two-col"><input class="field" id="feedFood" placeholder="Food / feed type"><button class="primary" id="logFeed">${tankFeedToday(tank)?"Log another feed":"Log feed now"}</button></div>
      <div class="feed-history">${feeds.length?feeds.slice(0,12).map(f=>`<div class="feed-row"><span>🍽️</span><div><strong>${esc(f.food||"Fed")}</strong><small>${aquariumDateTimeLabel(f.createdAt)}</small></div><button class="icon-danger" data-feed-delete="${esc(f.id)}">×</button></div>`).join(""):`<p>No feeds logged yet.</p>`}</div>
    </section>

    <section class="card">
      <div class="section-title"><div><span class="section-kicker">🧽 Maintenance</span><h2>Last completed</h2></div></div>
      <div class="maintenance-grid">
        ${[
          ["waterChange","💧","Water change"],
          ["clean","✨","Tank clean"],
          ["filterChange","♻️","Filter change"],
          ["spongeChange","🧽","Sponge change"]
        ].map(([key,icon,label])=>`<div class="maintenance-card"><span>${icon}</span><strong>${label}</strong><small>${aquariumDateTimeLabel(m[key])}</small><button class="secondary" data-maintenance="${key}">Mark done now</button></div>`).join("")}
      </div>
    </section>
  `,"pets");
}
function bindAquariums(){
  const tank=tankById(routeId);
  if(!tank) return;
  document.querySelector("#addLife")?.addEventListener("click",()=>{
    const name=document.querySelector("#lifeName").value.trim();
    if(!name){toast("Add a name");return}
    tank.livestock.push({id:`life-${Date.now()}`,type:document.querySelector("#lifeType").value,name,count:document.querySelector("#lifeCount").value});
    saveData();toast("Resident added 🐟");render();
  });
  document.querySelectorAll("[data-life-delete]").forEach(b=>b.onclick=()=>{
    tank.livestock=tank.livestock.filter(x=>x.id!==b.dataset.lifeDelete);saveData();render();
  });
  document.querySelector("#saveTemp")?.addEventListener("click",()=>{
    const value=document.querySelector("#tankTemp").value;
    if(!value){toast("Enter the water temperature");return}
    tank.temperature=value;tank.temperatureUpdated=new Date().toISOString();saveData();toast("Temperature saved 🌡️");render();
  });
  document.querySelector("#logFeed")?.addEventListener("click",()=>{
    tank.feeds.push({id:`feed-${Date.now()}`,food:document.querySelector("#feedFood").value.trim()||"Fed",createdAt:new Date().toISOString()});
    saveData();toast("Feed logged 🍽️");render();
  });
  document.querySelectorAll("[data-feed-delete]").forEach(b=>b.onclick=()=>{
    tank.feeds=tank.feeds.filter(x=>x.id!==b.dataset.feedDelete);saveData();render();
  });
  document.querySelectorAll("[data-maintenance]").forEach(b=>b.onclick=()=>{
    tank.maintenance=tank.maintenance||{};
    tank.maintenance[b.dataset.maintenance]=new Date().toISOString();
    saveData();toast("Maintenance updated ✨");render();
  });
}
