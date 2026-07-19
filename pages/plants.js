
function plantStatus(p){
  if(!p.lastWatered) return {text:"Needs attention",className:"attention",icon:"🔔"};
  const days=Math.floor((new Date(today()+"T12:00:00")-new Date(p.lastWatered+"T12:00:00"))/86400000);
  return days>=5
    ? {text:"Needs attention",className:"attention",icon:"🔔"}
    : {text:"All good",className:"good",icon:"🌿"};
}
function plantProfileTab(){return data.plantProfileTab||"overview"}

function PlantsPage(){
  const attention=data.plants.filter(p=>plantStatus(p).className==="attention").length;
  return shell(`${head("Plants","Your enchanted plant family")}
    <section class="plant-garden-hero card">
      <div>
        <span class="section-kicker">🌸 Enchanted garden</span>
        <h1>My plants</h1>
        <p>A little home for watering, photos and care notes.</p>
      </div>
      <div class="blossom-branch" aria-hidden="true"><span>🌸</span><span>🌸</span><span>🌸</span></div>
    </section>

    <div class="plant-search"><span>⌕</span><input id="plantSearch" placeholder="Search plants…"><span>${attention?`🔔 ${attention}`:"✓"}</span></div>

    <div class="plant-tile-grid" id="plantList">
      ${data.plants.map(p=>{
        const s=plantStatus(p);
        return `<button type="button" class="plant-tile" data-route="plant" data-route-id="${esc(p.id)}" data-plant-name="${esc(p.name.toLowerCase())}">
          <div class="plant-tile-art">${p.photo?`<img src="${p.photo}" alt="${esc(p.name)}">`:`<span>${p.emoji}</span>`}</div>
          <div class="plant-tile-copy">
            <h2>${esc(p.name)}</h2>
            <p>${p.lastWatered?`Watered ${esc(formatDate(p.lastWatered))}`:"Not watered yet"}</p>
            <em class="status-chip ${s.className}">${s.icon} ${s.text}</em>
          </div>
        </button>`;
      }).join("")}
    </div>
  `,"plants");
}

function PlantProfilePage(){
  const p=data.plants.find(x=>x.id===routeId);
  if(!p) return PlantsPage();
  const history=[...(p.history||[])].sort().reverse();
  const status=plantStatus(p);
  const active=plantProfileTab();

  return shell(`${head(p.name,"Plant profile","plants")}
    <section class="card plant-profile-head">
      <div class="plant-photo-large">${p.photo?`<img src="${p.photo}" alt="${esc(p.name)}">`:`<span>${p.emoji}</span>`}</div>
      <div class="plant-profile-actions">
        <label class="secondary upload-label">📷 Add / change photo<input id="plantPhoto" type="file" accept="image/*" hidden></label>
        <em class="status-chip ${status.className}">${status.icon} ${status.text}</em>
      </div>
    </section>

    <div class="profile-tabs" role="tablist" aria-label="Plant profile sections">
      ${[["overview","Overview"],["care","Care"],["history","History"],["notes","Notes"]]
        .map(([id,label])=>`<button type="button" role="tab" aria-selected="${active===id}" data-plant-tab="${id}" class="${active===id?"active":""}">${label}</button>`).join("")}
    </div>

    <div class="plant-tab-panel ${active==="overview"?"active":""}">
      <section class="care-summary">
        <div><small>Last watered</small><strong>${p.lastWatered?formatDate(p.lastWatered):"Not yet"}</strong></div>
        <div><small>Waterings logged</small><strong>${history.length}</strong></div>
      </section>
      <section class="card clean-card">
        <span class="section-kicker">Overview</span>
        <h2>Current care</h2>
        <p>${p.lastWatered?`Last watered on ${formatDate(p.lastWatered)}.`:"No watering has been logged yet."}</p>
        <p>${p.notes?esc(p.notes):"No care notes saved yet."}</p>
      </section>
    </div>

    <div class="plant-tab-panel ${active==="care"?"active":""}">
      <section class="card clean-card">
        <span class="section-kicker">Care</span>
        <h2>Log watering</h2>
        <div class="dated-action">
          <label class="date-picker-shell" aria-label="Watering date">
            <span>📅</span><input id="plantWaterDate" type="date" value="${today()}" max="${today()}">
          </label>
          <button type="button" class="primary" id="waterPlant">💧 Log watering</button>
        </div>
        <p class="helper-text">Today is selected automatically. Open the calendar to record an earlier watering.</p>
      </section>
    </div>

    <div class="plant-tab-panel ${active==="history"?"active":""}">
      <section class="card clean-card">
        <span class="section-kicker">History</span>
        <h2>Watering history</h2>
        <div class="history-list">
          ${history.length?history.map(d=>`<div class="history-row"><span>💧</span><span>${esc(formatDate(d))}</span><button type="button" class="icon-danger" data-water-delete="${esc(d)}" aria-label="Delete ${esc(formatDate(d))}">×</button></div>`).join(""):`<p>No watering history yet.</p>`}
        </div>
      </section>
    </div>

    <div class="plant-tab-panel ${active==="notes"?"active":""}">
      <section class="card clean-card">
        <span class="section-kicker">Notes</span>
        <h2>Care notes</h2>
        <textarea class="field plant-notes" rows="6" placeholder="Care notes, growth updates, anything you notice...">${esc(p.notes)}</textarea>
        <button type="button" class="primary" id="savePlantNotes">Save notes</button>
      </section>
    </div>
  `,"plants");
}

function bindPlants(){
  document.querySelector("#plantSearch")?.addEventListener("input",e=>{
    const q=e.target.value.toLowerCase();
    document.querySelectorAll("[data-plant-name]").forEach(tile=>{
      tile.hidden=!tile.dataset.plantName.includes(q);
    });
  });

  document.querySelectorAll("[data-plant-tab]").forEach(button=>{
    button.addEventListener("click",()=>{
      data.plantProfileTab=button.dataset.plantTab;
      saveData();
      render();
    });
  });

  document.querySelector("#waterPlant")?.addEventListener("click",()=>{
    const p=data.plants.find(x=>x.id===routeId);
    if(!p) return;
    const date=document.querySelector("#plantWaterDate")?.value||today();
    if(date>today()){toast("Choose today or an earlier date");return}
    p.history=Array.isArray(p.history)?p.history:[];
    if(!p.history.includes(date)) p.history.push(date);
    p.history.sort();
    p.lastWatered=p.history[p.history.length-1]||"";
    saveData();
    toast(`${p.name} watering logged 💧`);
    render();
  });

  document.querySelectorAll("[data-water-delete]").forEach(button=>{
    button.addEventListener("click",()=>{
      const p=data.plants.find(x=>x.id===routeId);
      if(!p) return;
      p.history=(p.history||[]).filter(date=>date!==button.dataset.waterDelete);
      p.history.sort();
      p.lastWatered=p.history[p.history.length-1]||"";
      saveData();
      toast("Watering entry removed");
      render();
    });
  });

  document.querySelector("#savePlantNotes")?.addEventListener("click",()=>{
    const p=data.plants.find(x=>x.id===routeId);
    if(!p) return;
    p.notes=document.querySelector(".plant-notes").value;
    saveData();
    toast("Plant notes saved 🌿");
  });

  document.querySelector("#plantPhoto")?.addEventListener("change",e=>{
    const file=e.target.files?.[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{
      const p=data.plants.find(x=>x.id===routeId);
      if(!p) return;
      p.photo=reader.result;
      saveData();
      toast("Plant photo saved 📷");
      render();
    };
    reader.readAsDataURL(file);
  });
}
