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
    .filter(feed=>(feed?.date?String(feed.date).slice(0,10):aquariumLocalDate(feed.createdAt))===today())
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
  if(feed?.createdAt)return aquariumLocalDate(feed.createdAt);
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
  <section class="card aquarium-feeds"><div class="aquarium-feed-quick"><div><span class="section-kicker">🍽️ Feeding</span><h2>Log feeding</h2><small>${lina17LatestFeed(tank)==="Not logged"?"Not fed yet":`Last: ${esc(lina17LatestFeed(tank))}`}</small></div><button type="button" class="aquarium-quick-action" id="quickFeedTank" aria-label="Mark tank as fed now"><span>🍽️</span><strong>Fed now</strong></button></div><details class="aquarium-feed-history"><summary><span>Feeding history</span><b>${feeds.length} ⌄</b></summary><div class="feed-list">${feeds.length?feeds.map(({feed,index,date,time})=>`<div class="compact-feed-row"><span><strong>${esc(feed.food||feed.name||"Fed")}</strong><small>${date?formatDate(date):"Date not recorded"}${time?` · ${esc(time)}`:""}</small></span><button class="mini danger" data-delete-feed="${index}">×</button></div>`).join(""):"<p class='muted-copy'>No feeding entries yet.</p>"}<div class="feed-add-grid"><label><span>Date</span><input class="field" id="feedDate" type="date" value="${today()}" max="${today()}"></label><label><span>Time</span><input class="field" id="feedTime" type="time" value="${defaultTime}"></label><label class="feed-note-field"><span>Food / note</span><input class="field" id="feedName" placeholder="Food or feeding note"></label><button class="secondary" id="addFeed">Log dated feed</button></div></div></details></section>
  <section class="card aquarium-maintenance-card"><div class="section-title-row"><div><span class="section-kicker">Maintenance</span><h2>Tap a task when it is done</h2></div></div><div class="maintenance-rows">${jobs.map(([key,label,icon])=>`<article class="maintenance-row"><button type="button" class="maintenance-quick-button" data-quick-maintenance="${key}" aria-label="Mark ${label} done today"><span class="maintenance-icon">${icon}</span><span><strong>${label}</strong><small>${m[key]?`Last: ${formatDate(m[key])}`:"Not logged yet"}</small></span><b>✓</b></button><div class="maintenance-date-controls"><input class="field" type="date" data-maintenance-date="${key}" value="${m[key]||today()}"><button class="secondary" data-save-maintenance="${key}">Log date</button></div></article>`).join("")}</div></section>
  <section class="aquarium-history-grid">${jobs.map(([key,label,icon])=>`<details class="card maintenance-history"><summary><span>${icon} ${label} history</span><b>${m.history[key].length}</b></summary><div>${lina17DateList(m.history[key]).length?lina17DateList(m.history[key]).map(date=>`<div class="history-date-row"><span>${formatDate(date)}</span><button class="mini danger" data-delete-maintenance="${key}" data-date="${date}">×</button></div>`).join(""):"<p class='muted-copy'>No history yet.</p>"}</div></details>`).join("")}</section>`,"pets")}
function bindAquariums(){const tank=(data.aquariums||[]).find(x=>x.id===routeId)||(data.aquariums||[])[0];if(!tank)return;const m=lina17Maintenance(tank);document.querySelector("#quickFeedTank")?.addEventListener("click",()=>{tank.feeds=tank.feeds||[];const now=new Date(),time=now.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});tank.feeds.push({id:`feed-${Date.now()}`,food:"Fed",date:today(),time,createdAt:now.toISOString()});saveData();toast(`${tank.name} feeding logged 🍽️`);render()});document.querySelectorAll("[data-quick-maintenance]").forEach(button=>button.addEventListener("click",()=>{const key=button.dataset.quickMaintenance,date=today();m[key]=date;if(!m.history[key].includes(date))m.history[key].push(date);saveData();toast("Marked as done ✓");render()}));document.querySelector("#saveTankTemperature")?.addEventListener("click",()=>{const input=document.querySelector("#tankTemperature");const value=String(input?.value??"").trim();if(value===""){toast("Enter a temperature first");input?.focus();return}const number=Number(value);if(!Number.isFinite(number)||number<0||number>50){toast("Enter a temperature between 0 and 50°C");input?.focus();return}tank.temperature=number.toFixed(1).replace(/\.0$/,"");tank.temperatureUpdated=new Date().toISOString();saveData();toast(`Temperature saved: ${tank.temperature}°C`);render()});document.querySelector("#tankTemperature")?.addEventListener("keydown",event=>{if(event.key==="Enter")document.querySelector("#saveTankTemperature")?.click()});document.querySelector("#addFeed")?.addEventListener("click",()=>{const note=document.querySelector("#feedName")?.value.trim()||"Fed",date=document.querySelector("#feedDate")?.value||today(),time=document.querySelector("#feedTime")?.value||"";if(date>today()){toast("Choose today or an earlier date");return}tank.feeds=tank.feeds||[];tank.feeds.push({id:`feed-${Date.now()}`,food:note,date,time,createdAt:lina17FeedTimestamp(date,time)});saveData();toast("Feed logged 🍽️");render()});document.querySelectorAll("[data-delete-feed]").forEach(b=>b.onclick=()=>{tank.feeds.splice(Number(b.dataset.deleteFeed),1);saveData();render()});document.querySelectorAll("[data-save-maintenance]").forEach(b=>b.onclick=()=>{const key=b.dataset.saveMaintenance,date=document.querySelector(`[data-maintenance-date='${key}']`).value||today();m[key]=date;if(!m.history[key].includes(date))m.history[key].push(date);saveData();toast("Maintenance logged");render()});document.querySelectorAll("[data-delete-maintenance]").forEach(b=>b.onclick=()=>{const a=m.history[b.dataset.deleteMaintenance];m.history[b.dataset.deleteMaintenance]=a.filter(x=>x!==b.dataset.date);saveData();render()})}


/* LinaHub 17.8.0 — aquarium calendars, intervals, overdue status and undo */
function aquariumEnsureExtended(tank){
  const m=lina17Maintenance(tank);m.intervals=m.intervals||{};
  Object.assign(m.intervals,{waterChange:Math.max(1,Number(m.intervals.waterChange)||7),clean:Math.max(1,Number(m.intervals.clean)||14),spongeChange:Math.max(1,Number(m.intervals.spongeChange)||21),filterChange:Math.max(1,Number(m.intervals.filterChange)||42)});
  data.aquariumCalendarMonth=data.aquariumCalendarMonth||{};
  return m;
}
function aquariumDueState(last,interval){if(!last)return {text:"Not logged",overdue:false};const due=new Date(`${last}T12:00:00`);due.setDate(due.getDate()+Number(interval||1));const d=due.toISOString().slice(0,10),diff=lina17DaysBetween(today(),d);return diff<0?{text:`Overdue ${Math.abs(diff)}d`,overdue:true}:diff===0?{text:"Due today",overdue:true}:{text:`Due in ${diff}d`,overdue:false}}
function aquariumFeedCalendar(tank){
  const month=data.aquariumCalendarMonth[tank.id]||today().slice(0,7),[y,m]=month.split("-").map(Number),first=new Date(y,m-1,1),total=new Date(y,m,0).getDate(),lead=(first.getDay()+6)%7,counts={};
  (tank.feeds||[]).forEach(f=>{const d=lina17FeedDate(f);if(d.startsWith(month))counts[d]=(counts[d]||0)+1});const cells=[];for(let i=0;i<lead;i++)cells.push('<span class="aquarium-cal-day empty"></span>');
  for(let day=1;day<=total;day++){const d=`${month}-${String(day).padStart(2,"0")}`,n=counts[d]||0;cells.push(`<button class="aquarium-cal-day ${n?"fed":""}" data-aquarium-feed-date="${d}"><span>${day}</span>${n?`<i>${n>1?n:"✓"}</i>`:""}</button>`)}
  return `<div class="aquarium-calendar-head"><button class="mini" data-aquarium-month="-1">‹</button><strong>${first.toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</strong><button class="mini" data-aquarium-month="1">›</button></div><div class="aquarium-cal-weekdays">${["M","T","W","T","F","S","S"].map(x=>`<span>${x}</span>`).join("")}</div><div class="aquarium-cal-grid">${cells.join("")}</div>`;
}
function AquariumTankPage(){
  const tank=(data.aquariums||[]).find(x=>x.id===routeId)||(data.aquariums||[])[0];if(!tank)return AquariumsPage();const m=aquariumEnsureExtended(tank),feeds=lina17SortedFeeds(tank),jobs=[["waterChange","Water Change","💧"],["clean","Tank Clean","🫧"],["spongeChange","Sponge Clean","🧽"],["filterChange","Filter Change","⚙️"]];
  return shell(`${head(tank.name,"Aquarium care",true)}
  <section class="card aquarium-temperature-card"><div><span class="section-kicker">🌡️ Temperature</span><h2>${tank.temperature!==""?`${esc(tank.temperature)}°C`:"Not recorded"}</h2></div><div class="aquarium-temperature-controls"><input class="field" id="tankTemperature" type="number" step="0.1" value="${esc(tank.temperature)}"><button class="primary" id="saveTankTemperature">Save</button></div></section>
  <section class="card aquarium-feeds"><div class="aquarium-feed-quick"><div><span class="section-kicker">Feeding</span><h2>${esc(lina17LatestFeed(tank))}</h2></div><button type="button" class="aquarium-quick-action" id="quickFeedTank"><span>🍽️</span><strong>Fed now</strong></button></div><div class="aquarium-feed-calendar">${aquariumFeedCalendar(tank)}</div><details><summary>Feeding history (${feeds.length})</summary><div class="feed-list">${feeds.map(({feed,index,date,time})=>`<div class="compact-feed-row"><span><strong>${esc(feed.food||"Fed")}</strong><small>${formatDate(date)}${time?` · ${esc(time)}`:""}</small></span><button class="mini" data-edit-feed="${index}">Edit</button><button class="mini danger" data-delete-feed="${index}">Undo</button></div>`).join("")||'<p>No feeding history yet.</p>'}</div></details></section>
  <section class="card aquarium-maintenance-card"><span class="section-kicker">Maintenance</span><h2>Tap a task when it is done</h2><div class="maintenance-rows">${jobs.map(([key,label,icon])=>{const due=aquariumDueState(m[key],m.intervals[key]);return `<article class="maintenance-row ${due.overdue?"is-overdue":""}"><button type="button" class="maintenance-quick-button" data-quick-maintenance="${key}"><span class="maintenance-icon">${icon}</span><span><strong>${label}</strong><small>${m[key]?`Last: ${formatDate(m[key])}`:"Not logged yet"}</small><em>${due.text}</em></span><b>✓</b></button><div class="maintenance-date-controls"><input class="field" type="date" data-maintenance-date="${key}" value="${today()}"><button class="secondary" data-save-maintenance="${key}">Log date</button></div><label class="maintenance-interval"><span>Every</span><input class="field" type="number" min="1" max="365" data-maintenance-interval="${key}" value="${m.intervals[key]}"><span>days</span></label></article>`}).join("")}</div></section>
  <section class="aquarium-history-grid">${jobs.map(([key,label,icon])=>`<details class="card maintenance-history"><summary><span>${icon} ${label} history</span><b>${m.history[key].length}</b></summary><div>${lina17DateList(m.history[key]).map(date=>`<div class="history-date-row"><span>${formatDate(date)}</span><button class="mini" data-edit-maintenance="${key}" data-date="${date}">Edit</button><button class="mini danger" data-delete-maintenance="${key}" data-date="${date}">Undo</button></div>`).join("")||'<p>No history yet.</p>'}</div></details>`).join("")}</section>`,'pets');
}
function bindAquariums(){
  const tank=(data.aquariums||[]).find(x=>x.id===routeId)||(data.aquariums||[])[0];if(!tank)return;const m=aquariumEnsureExtended(tank);
  document.querySelector("#quickFeedTank")?.addEventListener("click",()=>{const now=new Date();tank.feeds=tank.feeds||[];tank.feeds.push({id:`feed-${Date.now()}`,food:"Fed",date:today(),time:now.toTimeString().slice(0,5),createdAt:now.toISOString()});saveData();toast("Feeding logged 🍽️");render()});
  document.querySelectorAll("[data-aquarium-month]").forEach(b=>b.onclick=()=>{data.aquariumCalendarMonth[tank.id]=plantMonthShift(data.aquariumCalendarMonth[tank.id]||today().slice(0,7),b.dataset.aquariumMonth);saveData();render()});
  document.querySelectorAll("[data-aquarium-feed-date]").forEach(b=>b.onclick=()=>{const d=b.dataset.aquariumFeedDate;if(confirm(`Log feeding on ${formatDate(d)}?`)){tank.feeds.push({id:`feed-${Date.now()}`,food:"Fed",date:d,time:"",createdAt:`${d}T12:00:00`});saveData();render()}});
  document.querySelectorAll("[data-quick-maintenance]").forEach(b=>b.onclick=()=>{const key=b.dataset.quickMaintenance,d=today();m[key]=d;if(!m.history[key].includes(d))m.history[key].push(d);m.history[key].sort();saveData();toast("Marked done ✓");render()});
  document.querySelectorAll("[data-save-maintenance]").forEach(b=>b.onclick=()=>{const key=b.dataset.saveMaintenance,d=document.querySelector(`[data-maintenance-date="${key}"]`)?.value||today();m[key]=d;if(!m.history[key].includes(d))m.history[key].push(d);m.history[key].sort();saveData();render()});
  document.querySelectorAll("[data-maintenance-interval]").forEach(input=>input.onchange=()=>{m.intervals[input.dataset.maintenanceInterval]=Math.max(1,Number(input.value)||1);saveData();render()});
  document.querySelectorAll("[data-delete-maintenance]").forEach(b=>b.onclick=()=>{const key=b.dataset.deleteMaintenance,d=b.dataset.date;if(!confirm(`Undo ${formatDate(d)}?`))return;m.history[key]=m.history[key].filter(x=>x!==d);m[key]=m.history[key].slice().sort().at(-1)||"";saveData();render()});
  document.querySelectorAll("[data-edit-maintenance]").forEach(b=>b.onclick=()=>{const key=b.dataset.editMaintenance,old=b.dataset.date,next=prompt("Change date (YYYY-MM-DD)",old);if(!next||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(next))return;m.history[key]=m.history[key].filter(x=>x!==old);if(!m.history[key].includes(next))m.history[key].push(next);m.history[key].sort();m[key]=m.history[key].at(-1)||"";saveData();render()});
  document.querySelectorAll("[data-delete-feed]").forEach(b=>b.onclick=()=>{if(!confirm("Undo this feeding entry?"))return;tank.feeds.splice(Number(b.dataset.deleteFeed),1);saveData();render()});
  document.querySelectorAll("[data-edit-feed]").forEach(b=>b.onclick=()=>{const feed=tank.feeds[Number(b.dataset.editFeed)];if(!feed)return;const d=prompt("Feeding date (YYYY-MM-DD)",lina17FeedDate(feed));if(!d)return;const t=prompt("Time (HH:MM, optional)",lina17FeedTime(feed));feed.date=d;feed.time=t||"";feed.createdAt=lina17FeedTimestamp(d,t||"");saveData();render()});
  document.querySelector("#saveTankTemperature")?.addEventListener("click",()=>{const v=Number(document.querySelector("#tankTemperature")?.value);if(!Number.isFinite(v)){toast("Enter a temperature");return}tank.temperature=String(v);tank.temperatureUpdated=new Date().toISOString();saveData();render()});
}
