/* LinaHub 17.4.8 — active Aquarium page implementation. */
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

function aquariumTimestampForDate(dateValue){
  const selected=dateValue||today();
  if(selected===today()) return new Date().toISOString();
  return `${selected}T12:00:00`;
}
function tankFeedToday(tank){
  return [...(tank.feeds||[])]
    .filter(feed=>aquariumLocalDate(feed.createdAt)===today())
    .sort((a,b)=>(b.createdAt||"").localeCompare(a.createdAt||""))[0]||null;
}

function tankById(id){return (data.aquariums||[]).find(t=>t.id===id)}

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
function lina17FeedDate(feed){
  if(feed?.date)return String(feed.date).slice(0,10);
  if(feed?.createdAt){const d=new Date(feed.createdAt);if(!Number.isNaN(d.getTime()))return d.toISOString().slice(0,10)}
  return "";
}
function lina17FeedTime(feed){
  if(feed?.time)return String(feed.time).slice(0,5);
  if(feed?.createdAt){const d=new Date(feed.createdAt);if(!Number.isNaN(d.getTime()))return d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}
  return "";
}
function lina17FeedTimestamp(date,time){
  const safeDate=date||today();
  const safeTime=time||new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
  const parsed=new Date(`${safeDate}T${safeTime}:00`);
  return Number.isNaN(parsed.getTime())?new Date().toISOString():parsed.toISOString();
}
function lina17SortedFeeds(tank){
  return (tank.feeds||[]).map((feed,index)=>({feed,index,date:lina17FeedDate(feed),time:lina17FeedTime(feed)})).sort((a,b)=>`${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
}
function lina17LatestFeed(tank){
  const latest=lina17SortedFeeds(tank)[0];
  if(!latest||!latest.date)return "Not logged";
  return latest.date===today()?`Today${latest.time?` · ${latest.time}`:""}`:`${formatDate(latest.date)}${latest.time?` · ${latest.time}`:""}`;
}
function AquariumsPage(){return shell(`${head("Aquariums","Feeding and maintenance at a glance")}
  <div class="aquarium-grid">${(data.aquariums||[]).map(tank=>{const m=lina17Maintenance(tank),tileKey=tank.id==="girls-tank"?"girlsTank":tank.id==="boys-tank"?"boysTank":"",photo=tank.photo||(tileKey?data.homeImages?.[tileKey]:"");return `<section class="card aquarium-dashboard-card status-good"><button class="tank-dashboard-open" data-route="tank" data-route-id="${esc(tank.id)}"><span class="tank-dashboard-image">${photo?`<img src="${photo}" alt="${esc(tank.name)}">`:`<span>${tank.emoji||"🐠"}</span>`}</span><span class="tank-dashboard-main"><strong>${esc(tank.name)}</strong><span class="tank-dashboard-rows"><small><b>🌡️ Temp</b><em>${esc(tank.temperature||"Not set")}${tank.temperature&&!String(tank.temperature).includes("°")?"°C":""}</em></small><small><b>🐟 Last feed</b><em>${esc(lina17LatestFeed(tank))}</em></small><small><b>💧 Water</b><em>${esc(lina17MaintenanceDue(m.waterChange,7))}</em></small><small><b>🧽 Sponge</b><em>${esc(m.spongeChange?lina17RelativeCareDate(m.spongeChange,{pastLabel:"ago"}):"Not logged")}</em></small><small><b>⚙️ Filter</b><em>${esc(m.filterChange?lina17RelativeCareDate(m.filterChange,{pastLabel:"ago"}):"Not logged")}</em></small></span></span><b class="tank-card-arrow">›</b></button></section>`}).join("")}</div>`,"pets")}
function AquariumTankPage(){const tank=(data.aquariums||[]).find(x=>x.id===routeId)||(data.aquariums||[])[0];if(!tank)return AquariumsPage();const m=lina17Maintenance(tank);const feeds=lina17SortedFeeds(tank);const now=new Date(),defaultTime=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;const jobs=[["waterChange","Water Change","💧"],["clean","Tank Clean","🫧"],["spongeChange","Sponge Clean","🧽"],["filterChange","Filter Change","⚙️"]];return shell(`${head(tank.name,"Aquarium care",true)}
  <section class="card aquarium-temperature-card"><div class="aquarium-temperature-copy"><span class="section-kicker">🌡️ Temperature</span><h2>${tank.temperature!==""?`${esc(tank.temperature)}°C`:"Not recorded"}</h2><small>${tank.temperatureUpdated?`Updated ${new Date(tank.temperatureUpdated).toLocaleString("en-GB",{dateStyle:"medium",timeStyle:"short"})}`:"Add the current tank temperature"}</small></div><div class="aquarium-temperature-controls"><label><span>°C</span><input class="field" id="tankTemperature" type="number" inputmode="decimal" step="0.1" min="0" max="50" value="${esc(tank.temperature)}" placeholder="25.0"></label><button class="primary" id="saveTankTemperature">Save</button></div></section>
  <section class="card aquarium-feeds"><details><summary><span><strong>🍽️ Feeding</strong><small>${feeds.length} saved feed entr${feeds.length===1?"y":"ies"}</small></span><b>⌄</b></summary><div class="feed-list">${feeds.length?feeds.map(({feed,index,date,time})=>`<div class="compact-feed-row"><span><strong>${esc(feed.food||feed.name||"Fed")}</strong><small>${date?formatDate(date):"Date not recorded"}${time?` · ${esc(time)}`:""}</small></span><button class="mini danger" data-delete-feed="${index}">×</button></div>`).join(""):"<p class='muted-copy'>No feeding entries yet.</p>"}<div class="feed-add-grid"><label><span>Date</span><input class="field" id="feedDate" type="date" value="${today()}" max="${today()}"></label><label><span>Time</span><input class="field" id="feedTime" type="time" value="${defaultTime}"></label><label class="feed-note-field"><span>Food / note</span><input class="field" id="feedName" placeholder="Food or feeding note"></label><button class="secondary" id="addFeed">Log feed</button></div></div></details></section>
  <section class="card aquarium-maintenance-card"><div class="section-title-row"><div><span class="section-kicker">Maintenance</span><h2>Care log</h2></div></div><div class="maintenance-rows">${jobs.map(([key,label,icon])=>`<article class="maintenance-row"><span class="maintenance-icon">${icon}</span><div><strong>${label}</strong><small>${m[key]?`Last: ${formatDate(m[key])}`:"Not logged yet"}</small></div><input class="field" type="date" data-maintenance-date="${key}" value="${m[key]||today()}"><button class="secondary" data-save-maintenance="${key}">Log</button></article>`).join("")}</div></section>
  <section class="aquarium-history-grid">${jobs.map(([key,label,icon])=>`<details class="card maintenance-history"><summary><span>${icon} ${label} history</span><b>${m.history[key].length}</b></summary><div>${lina17DateList(m.history[key]).length?lina17DateList(m.history[key]).map(date=>`<div class="history-date-row"><span>${formatDate(date)}</span><button class="mini danger" data-delete-maintenance="${key}" data-date="${date}">×</button></div>`).join(""):"<p class='muted-copy'>No history yet.</p>"}</div></details>`).join("")}</section>`,"pets")}
function bindAquariums(){const tank=(data.aquariums||[]).find(x=>x.id===routeId)||(data.aquariums||[])[0];if(!tank)return;const m=lina17Maintenance(tank);document.querySelector("#saveTankTemperature")?.addEventListener("click",()=>{const input=document.querySelector("#tankTemperature");const value=String(input?.value??"").trim();if(value===""){toast("Enter a temperature first");input?.focus();return}const number=Number(value);if(!Number.isFinite(number)||number<0||number>50){toast("Enter a temperature between 0 and 50°C");input?.focus();return}tank.temperature=number.toFixed(1).replace(/\.0$/,"");tank.temperatureUpdated=new Date().toISOString();saveData();toast(`Temperature saved: ${tank.temperature}°C`);render()});document.querySelector("#tankTemperature")?.addEventListener("keydown",event=>{if(event.key==="Enter")document.querySelector("#saveTankTemperature")?.click()});document.querySelector("#addFeed")?.addEventListener("click",()=>{const note=document.querySelector("#feedName")?.value.trim()||"Fed",date=document.querySelector("#feedDate")?.value||today(),time=document.querySelector("#feedTime")?.value||"";if(date>today()){toast("Choose today or an earlier date");return}tank.feeds=tank.feeds||[];tank.feeds.push({id:`feed-${Date.now()}`,food:note,date,time,createdAt:lina17FeedTimestamp(date,time)});saveData();toast("Feed logged 🍽️");render()});document.querySelectorAll("[data-delete-feed]").forEach(b=>b.onclick=()=>{tank.feeds.splice(Number(b.dataset.deleteFeed),1);saveData();render()});document.querySelectorAll("[data-save-maintenance]").forEach(b=>b.onclick=()=>{const key=b.dataset.saveMaintenance,date=document.querySelector(`[data-maintenance-date='${key}']`).value||today();m[key]=date;if(!m.history[key].includes(date))m.history[key].push(date);saveData();toast("Maintenance logged");render()});document.querySelectorAll("[data-delete-maintenance]").forEach(b=>b.onclick=()=>{const a=m.history[b.dataset.deleteMaintenance];m.history[b.dataset.deleteMaintenance]=a.filter(x=>x!==b.dataset.date);saveData();render()})}

