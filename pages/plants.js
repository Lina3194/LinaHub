
function plantStatus(p){
  if(!p.lastWatered) return {text:"Needs attention",className:"attention",icon:"🔔"};
  const days=Math.floor((new Date(today()+"T12:00:00")-new Date(p.lastWatered+"T12:00:00"))/86400000);
  return days>=5?{text:"Needs attention",className:"attention",icon:"🔔"}:{text:"All good",className:"good",icon:"🌿"};
}

function plantProfileTab(){return data.plantProfileTab||"overview"}

function PlantsPage(){
  const attention=data.plants.filter(p=>plantStatus(p).className==="attention").length;
  const photos=data.plants.filter(p=>p.photo).length;
  return shell(`${head("Plants","Care for your enchanted garden")}
    <section class="premium-hero plant-premium-hero"><div><span class="section-kicker">🌿 Your collection</span><h1>Plants</h1><p>Keep watering, photos and care notes together.</p></div><div class="hero-orb">🌸</div></section>
    <div class="plant-search"><span>⌕</span><input id="plantSearch" placeholder="Search plants…"><span>☷</span></div>
    <section class="plant-metrics"><div><span>🌿</span><strong>${data.plants.length}</strong><small>Plants</small></div><div><span>🔔</span><strong>${attention}</strong><small>Need attention</small></div><div><span>📷</span><strong>${photos}</strong><small>Photos</small></div><div><span>✓</span><strong>${data.plants.length-attention}</strong><small>All good</small></div></section>
    <div class="section-row"><div><span class="section-kicker">Collection</span><h2>Your plants</h2></div></div>
    <section class="premium-list" id="plantList">${data.plants.map(p=>{const s=plantStatus(p);return `<button type="button" class="premium-list-row" data-route="plant" data-route-id="${esc(p.id)}" data-plant-name="${esc(p.name.toLowerCase())}"><div class="list-thumb">${p.photo?`<img src="${p.photo}" alt="${esc(p.name)}">`:`<span>${p.emoji}</span>`}</div><div><strong>${esc(p.name)}</strong><small>${p.lastWatered?`Last watered ${formatDate(p.lastWatered)}`:"No watering logged"}</small><em class="status-chip ${s.className}">${s.icon} ${s.text}</em></div><b>›</b></button>`}).join("")}</section>
  `,"plants");
}

function PlantProfilePage(){
  const p=data.plants.find(x=>x.id===routeId);
  if(!p) return PlantsPage();
  const history=[...(p.history||[])].sort().reverse();
  const status=plantStatus(p);
  const active=plantProfileTab();

  return shell(`${head(p.name,"Plant profile","plants")}
    <section class="plant-cover">${p.photo?`<img src="${p.photo}" alt="${esc(p.name)}">`:`<div>${p.emoji}</div>`}<label class="photo-fab">📷<input id="plantPhoto" type="file" accept="image/*" hidden></label></section>
    <section class="plant-title-panel"><div><span class="section-kicker">🌿 Plant profile</span><h1>${esc(p.name)}</h1><em class="status-chip ${status.className}">${status.icon} ${status.text}</em></div></section>
    <div class="profile-tabs" role="tablist" aria-label="Plant profile sections">
      ${[["overview","Overview"],["care","Care"],["history","History"],["notes","Notes"]].map(([id,label])=>`<button type="button" role="tab" data-plant-tab="${id}" class="${active===id?"active":""}">${label}</button>`).join("")}
    </div>

    <div class="plant-tab-panel ${active==="overview"?"active":""}">
      <section class="care-summary"><div><small>Last watered</small><strong>${p.lastWatered?formatDate(p.lastWatered):"Not yet"}</strong></div><div><small>Waterings logged</small><strong>${history.length}</strong></div></section>
      <section class="card clean-card"><span class="section-kicker">Overview</span><h2>Current care</h2><p>${p.lastWatered?`Last watered on ${formatDate(p.lastWatered)}.`:"No watering has been logged yet."}</p><p>${p.notes?esc(p.notes):"No care notes saved yet."}</p></section>
    </div>

    <div class="plant-tab-panel ${active==="care"?"active":""}">
      <section class="card clean-card"><div class="section-row"><div><span class="section-kicker">Care</span><h2>Log watering</h2></div></div>
        <div class="dated-action"><label class="date-picker-shell"><span>📅</span><input id="plantWaterDate" type="date" value="${today()}" max="${today()}"></label><button type="button" class="primary" id="waterPlant">💧 Log watering</button></div>
        <p class="helper-text">Today is selected automatically. Use the calendar to add a missed watering.</p>
      </section>
    </div>

    <div class="plant-tab-panel ${active==="history"?"active":""}">
      <section class="card clean-card"><span class="section-kicker">History</span><h2>Watering history</h2><div class="history-list">${history.length?history.map(d=>`<div class="history-row"><span>💧</span><span>${esc(formatDate(d))}</span><button type="button" class="icon-danger" data-water-delete="${esc(d)}">×</button></div>`).join(""):`<p>No watering history yet.</p>`}</div></section>
    </div>

    <div class="plant-tab-panel ${active==="notes"?"active":""}">
      <section class="card clean-card"><span class="section-kicker">Notes</span><h2>Care notes</h2><textarea class="field plant-notes" rows="5">${esc(p.notes)}</textarea><button type="button" class="secondary" id="savePlantNotes">Save notes</button></section>
    </div>
  `,"plants");
}

function bindPlants(){
  document.querySelector("#plantSearch")?.addEventListener("input",e=>{const q=e.target.value.toLowerCase();document.querySelectorAll("[data-plant-name]").forEach(row=>row.hidden=!row.dataset.plantName.includes(q))});
  document.querySelectorAll("[data-plant-tab]").forEach(button=>button.addEventListener("click",()=>{data.plantProfileTab=button.dataset.plantTab;saveData();render()}));
  document.querySelector("#waterPlant")?.addEventListener("click",()=>{const p=data.plants.find(x=>x.id===routeId);if(!p)return;const date=document.querySelector("#plantWaterDate")?.value||today();if(date>today()){toast("Choose today or an earlier date");return}p.history=Array.isArray(p.history)?p.history:[];if(!p.history.includes(date))p.history.push(date);p.history.sort();p.lastWatered=p.history[p.history.length-1]||"";saveData();toast(`${p.name} watering logged 💧`);render()});
  document.querySelectorAll("[data-water-delete]").forEach(button=>button.addEventListener("click",()=>{const p=data.plants.find(x=>x.id===routeId);if(!p)return;p.history=(p.history||[]).filter(date=>date!==button.dataset.waterDelete);p.history.sort();p.lastWatered=p.history[p.history.length-1]||"";saveData();toast("Watering entry removed");render()}));
  document.querySelector("#savePlantNotes")?.addEventListener("click",()=>{const p=data.plants.find(x=>x.id===routeId);if(!p)return;p.notes=document.querySelector(".plant-notes").value;saveData();toast("Plant notes saved 🌿")});
  document.querySelector("#plantPhoto")?.addEventListener("change",e=>{const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{const p=data.plants.find(x=>x.id===routeId);if(!p)return;p.photo=reader.result;saveData();toast("Plant photo saved 📷");render()};reader.readAsDataURL(file)});
}
