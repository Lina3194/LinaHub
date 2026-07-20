function ensureHomeLayout(){
  const defaults=["journal","health","plants","medication","pokemon","pets","house","period","budget","treasures"];
  if(!Array.isArray(data.homeLayout)) data.homeLayout=[];
  const seen=new Set();
  data.homeLayout=data.homeLayout.filter(item=>{
    const id=typeof item==="string"?item:item?.id;
    if(!defaults.includes(id)||seen.has(id)) return false;
    seen.add(id); return true;
  }).map(item=>typeof item==="string"?{id:item,size:item==="treasures"?"wide":"medium"}:{id:item.id,size:["small","medium","wide","large"].includes(item.size)?item.size:"medium"});
  defaults.forEach(id=>{if(!seen.has(id)) data.homeLayout.push({id,size:id==="treasures"?"wide":"medium"})});
}

const HOME_TILE_INFO={
  journal:["Daily Check-in","Pain, energy, sleep and your day","📖"],
  health:["Weight & Measures","Track weight and measurements","⚖️"],
  plants:["Garden","Care and watering","🌿"],
  medication:["Medication","Doses and routines","💊"],
  pokemon:["Pokémon GO","Friendship, Vivillon and gifts",""],
  pets:["Aquariums","Girls and boys tanks","🐠"],
  house:["House","Rooms and recurring tasks","🏡"],
  period:["Period Tracker","Cycles, symptoms and history","🌸"],
  budget:["Budget & Bills","Track bills, income and spending","💷"],
  treasures:["Treasure Room","Your collected memories","✨"]
};

function homeTile(item,editing){
  const [defaultTitle,subtitle,fallback]=HOME_TILE_INFO[item.id];
  const title=data.homeTileNames?.[item.id]||defaultTitle;
  const art=data.homeImages?.[item.id]
    ? `<span class="module-image"><img src="${data.homeImages[item.id]}" alt=""></span>`
    : item.id==="pokemon"
      ? `<span class="emoji app-icon-image"><img src="./icons/pokemon.svg?v=156" alt="Poké Ball"></span>`
      : `<span class="emoji">${data.homeIcons?.[item.id]||fallback}</span>`;
  return `<article class="home-tile-wrap size-${item.size}" draggable="${editing}" data-home-id="${item.id}">
    <button type="button" class="module module-${item.id}" ${editing?'tabindex="-1"':`data-route="${item.id}"`}>${art}<strong>${title}</strong><small>${subtitle}</small></button>
    ${editing?`<div class="tile-edit-controls">
      <button type="button" class="tile-move" data-move="back" aria-label="Move ${title} earlier">‹</button>
      <button type="button" class="tile-drag" aria-label="Drag ${title}">Move</button>
      <button type="button" class="tile-rename" data-rename-tile="${item.id}" aria-label="Rename ${title}">Name</button>
      <button type="button" class="tile-size" data-size-tile="${item.id}">${item.size}</button>
      <button type="button" class="tile-move" data-move="forward" aria-label="Move ${title} later">›</button>
    </div>`:""}
  </article>`;
}

function HomePage(){
  ensureHomeLayout();
  const d=new Date();
  const hour=d.getHours();
  const greeting=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  const editing=!!data.homeEditing;
  return shell(`
    <section class="hero">
      <div class="hero-row">
        <div><div class="eyebrow">LinaHub</div><h1>${greeting},<br>Lina ✨</h1><p>A gentle overview of everything in your little hub.</p></div>
        <div class="home-menu-wrap">
          <button type="button" class="home-menu-toggle" id="homeMenuToggle" aria-label="Open Home menu" aria-expanded="false">⌄</button>
          <div class="home-menu" id="homeMenu" hidden>
            <button type="button" id="homeEditToggle"><span aria-hidden="true">✎</span><span>${editing?"Finish editing":"Edit Home"}</span></button>
            <button type="button" id="homeThemes"><span aria-hidden="true">◈</span><span>Themes</span></button>
            <button type="button" id="homeSettings"><span aria-hidden="true">⚙</span><span>Settings</span></button>
          </div>
        </div>
      </div>
      ${editing?`<p class="home-edit-help">Drag tiles, use the arrows, rename them, and tap the size button to cycle through Small, Medium, Wide and Large.</p>`:""}
    </section>
    <div class="grid home-layout ${editing?"editing":""}">${data.homeLayout.map(item=>homeTile(item,editing)).join("")}</div>
  `,"home");
}

function bindHome(){
  const menuToggle=document.querySelector("#homeMenuToggle");
  const menu=document.querySelector("#homeMenu");
  const closeMenu=()=>{if(!menu||!menuToggle)return;menu.hidden=true;menuToggle.setAttribute("aria-expanded","false")};
  menuToggle?.addEventListener("click",event=>{event.stopPropagation();const opening=menu.hidden;menu.hidden=!opening;menuToggle.setAttribute("aria-expanded",String(opening))});
  document.addEventListener("click",event=>{if(!event.target.closest(".home-menu-wrap")) closeMenu()},{once:true});
  document.querySelector("#homeThemes")?.addEventListener("click",()=>{data.settingsSection="appearance";saveData();go("settings")});
  document.querySelector("#homeSettings")?.addEventListener("click",()=>go("settings"));
  document.querySelector("#homeEditToggle")?.addEventListener("click",()=>{data.homeEditing=!data.homeEditing;saveData();render()});
  if(!data.homeEditing) return;
  const saveRender=()=>{saveData();render()};
  document.querySelectorAll("[data-rename-tile]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.dataset.renameTile;
    const current=data.homeTileNames?.[id]||HOME_TILE_INFO[id]?.[0]||"Tile";
    const next=prompt("Rename this Home tile",current);
    if(next===null)return;
    const clean=next.trim().slice(0,40);
    data.homeTileNames=data.homeTileNames||{};
    if(clean)data.homeTileNames[id]=clean; else delete data.homeTileNames[id];
    saveRender();
  }));
  document.querySelectorAll("[data-size-tile]").forEach(btn=>btn.addEventListener("click",()=>{
    const order=["small","medium","wide","large"], item=data.homeLayout.find(x=>x.id===btn.dataset.sizeTile);
    if(item){item.size=order[(order.indexOf(item.size)+1)%order.length];saveRender()}
  }));
  document.querySelectorAll(".home-tile-wrap").forEach(tile=>{
    tile.querySelectorAll("[data-move]").forEach(btn=>btn.addEventListener("click",()=>{
      const i=data.homeLayout.findIndex(x=>x.id===tile.dataset.homeId); const step=btn.dataset.move==="back"?-1:1; const j=i+step;
      if(i<0||j<0||j>=data.homeLayout.length)return;
      [data.homeLayout[i],data.homeLayout[j]]=[data.homeLayout[j],data.homeLayout[i]];saveRender();
    }));
    tile.addEventListener("dragstart",e=>{e.dataTransfer.setData("text/plain",tile.dataset.homeId);tile.classList.add("dragging")});
    tile.addEventListener("dragend",()=>tile.classList.remove("dragging"));
    tile.addEventListener("dragover",e=>{e.preventDefault();tile.classList.add("drag-over")});
    tile.addEventListener("dragleave",()=>tile.classList.remove("drag-over"));
    tile.addEventListener("drop",e=>{e.preventDefault();tile.classList.remove("drag-over");const from=e.dataTransfer.getData("text/plain"),to=tile.dataset.homeId;if(!from||from===to)return;const fi=data.homeLayout.findIndex(x=>x.id===from),ti=data.homeLayout.findIndex(x=>x.id===to);const [moved]=data.homeLayout.splice(fi,1);data.homeLayout.splice(ti,0,moved);saveRender()});
  });
}
