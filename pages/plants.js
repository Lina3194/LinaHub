
function PlantsPage(){
  return shell(`${head("Plants","Your plant family")}
    <div class="stack">
      ${data.plants.map(p=>`
        <button class="plant-card" data-plant="${esc(p.id)}">
          <div class="plant-thumb">${p.photo?`<img src="${p.photo}" alt="${esc(p.name)}">`:`<span>${p.emoji}</span>`}</div>
          <div><h2>${esc(p.name)}</h2><p>${p.lastWatered?`Last watered ${esc(formatDate(p.lastWatered))}`:"Not watered yet"}</p></div>
          <span class="plant-arrow">›</span>
        </button>`).join("")}
    </div>
  `,"plants");
}

function PlantProfilePage(){
  const p=data.plants.find(x=>x.id===routeId);
  if(!p) return PlantsPage();
  const history=[...(p.history||[])].sort().reverse();

  return shell(`${head(p.name,"Plant profile")}
    <section class="card plant-profile-head">
      <div class="plant-photo-large">${p.photo?`<img src="${p.photo}" alt="${esc(p.name)}">`:`<span>${p.emoji}</span>`}</div>
      <div class="plant-profile-actions">
        <label class="secondary upload-label">📷 Add / change photo<input id="plantPhoto" type="file" accept="image/*" hidden></label>
        <button class="primary" id="waterPlant">💧 Watered today</button>
      </div>
    </section>

    <section class="card"><h2>Last watered</h2><p>${p.lastWatered?esc(formatDate(p.lastWatered)):"No watering logged yet."}</p></section>

    <section class="card">
      <h2>Notes</h2>
      <textarea class="field plant-notes" rows="6" placeholder="Care notes, growth updates, anything you notice...">${esc(p.notes)}</textarea>
      <button class="primary" id="savePlantNotes" style="margin-top:10px">Save notes</button>
    </section>

    <section class="card">
      <h2>Watering history</h2>
      <div class="history-list">
        ${history.length?history.map(d=>`<div class="history-row"><span>💧</span><span>${esc(formatDate(d))}</span></div>`).join(""):`<p>No watering history yet.</p>`}
      </div>
    </section>
  `,"plants");
}

function bindPlants(){
  document.querySelectorAll("[data-plant]").forEach(btn=>btn.onclick=()=>go("plant",btn.dataset.plant));

  const water=document.querySelector("#waterPlant");
  if(water) water.onclick=()=>{
    const p=data.plants.find(x=>x.id===routeId);
    if(!p) return;
    const d=today();
    p.lastWatered=d;
    if(!p.history.includes(d)) p.history.push(d);
    saveData();
    toast(`${p.name} watered 💧`);
    render();
  };

  const notes=document.querySelector("#savePlantNotes");
  if(notes) notes.onclick=()=>{
    const p=data.plants.find(x=>x.id===routeId);
    if(!p) return;
    p.notes=document.querySelector(".plant-notes").value;
    saveData();
    toast("Plant notes saved 🌿");
  };

  const photo=document.querySelector("#plantPhoto");
  if(photo) photo.onchange=e=>{
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
  };
}
