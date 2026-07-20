function ensureHomeLayout(){
  const defaults=["journal","health","plants","medication","pokemon","pets","house","period","budget","treasures"];
  if(!Array.isArray(data.homeLayout)) data.homeLayout=[];
  if(!Array.isArray(data.homeHidden)) data.homeHidden=[];
  data.homeTileAccents=data.homeTileAccents||{};
  const seen=new Set();
  data.homeLayout=data.homeLayout.filter(item=>{
    const id=typeof item==="string"?item:item?.id;
    if(!defaults.includes(id)||seen.has(id)) return false;
    seen.add(id); return true;
  }).map(item=>typeof item==="string"?{id:item,size:item==="treasures"?"wide":"medium"}:{id:item.id,size:["small","medium","wide","large"].includes(item.size)?item.size:"medium"});
  defaults.forEach(id=>{
    if(!seen.has(id) && !data.homeHidden.includes(id)) data.homeLayout.push({id,size:id==="treasures"?"wide":"medium"});
  });
  data.homeHidden=[...new Set(data.homeHidden.filter(id=>defaults.includes(id) && !data.homeLayout.some(item=>item.id===id)))];
}

const HOME_TILE_INFO={
  journal:["Daily Check-in","Pain, energy, sleep and your day","📖"],
  health:["Weight & Measures","Track weight and measurements","⚖️"],
  plants:["Garden","Care and watering","🌿"],
  medication:["Medication","Doses and routines","💊"],
  pokemon:["Pokémon GO","Friendship, Vivillon and gifts","🔴"],
  pets:["Aquariums","Girls and boys tanks","🐠"],
  house:["House","Rooms and recurring tasks","🏡"],
  period:["Period Tracker","Cycles, symptoms and history","🌸"],
  budget:["Budget & Bills","","💷"],
  treasures:["Treasure Room","Your collected memories","✨"]
};

function homeTileStatus(id){
  const now=new Date();
  const todayKey=typeof today==="function"?today():now.toISOString().slice(0,10);
  if(id==="plants"){
    const due=(data.plants||[]).filter(p=>{
      const days=Number(p.wateringDays)||0;
      if(!days) return false;
      if(!p.lastWatered) return true;
      const elapsed=Math.floor((new Date(todayKey+"T12:00:00")-new Date(p.lastWatered+"T12:00:00"))/86400000);
      return elapsed>=days;
    }).length;
    return due?`💧 ${due} plant${due===1?"":"s"} need watering`:"✓ All plants are happy today";
  }
  if(id==="house"){
    const tasks=(data.houseTasks||[]).filter(t=>!t.done);
    return tasks.length?`${tasks.length} job${tasks.length===1?"":"s"} still to do`:"✓ House jobs complete";
  }
  if(id==="medication"){
    const meds=data.medications||[];
    const log=data.medicationLog?.[todayKey]||{};
    const taken=Object.values(log).filter(Boolean).length;
    const remaining=Math.max(0,meds.length-taken);
    return remaining?`💊 ${remaining} dose${remaining===1?"":"s"} left today`:"✓ Medication complete";
  }
  if(id==="budget"){
    const month=todayKey.slice(0,7);
    const unpaid=(data.bills||[]).filter(b=>!b.paid && (!b.dueDate || String(b.dueDate).slice(0,7)===month));
    const total=unpaid.reduce((sum,b)=>sum+(Number(b.amount)||0),0);
    return unpaid.length?`£${total.toFixed(2)} due · ${unpaid.length} unpaid`:"✓ No unpaid bills this month";
  }
  if(id==="pokemon"){
    const friends=data.pokemonFriends||[];
    const active=friends.filter(f=>f.active!==false).length;
    return `${active} active friend${active===1?"":"s"}`;
  }
  if(id==="pets"){
    const tanks=data.aquariums||[];
    return `${tanks.length} aquarium${tanks.length===1?"":"s"} to care for`;
  }
  if(id==="journal"){
    const count=Object.keys(data.checkins||{}).length;
    return count?`${count} check-in${count===1?"":"s"} saved`:"Start today's check-in";
  }
  if(id==="health"){
    const latest=(data.weightEntries||[]).slice().sort((a,b)=>String(b.date||"").localeCompare(String(a.date||"")))[0];
    return latest?`Latest weight: ${latest.weight||latest.value||"saved"}`:"Add your first measurement";
  }
  if(id==="period"){
    if(typeof periodStats==="function"){
      const stats=periodStats();
      if(stats.active){
        const day=periodDaysBetween(stats.active.start,today())+1;
        return `Period day ${day}`;
      }
      if(stats.predicted){
        const days=periodDaysBetween(today(),stats.predicted);
        if(days>1) return `${days} days until your period`;
        if(days===1) return `1 day until your period`;
        if(days===0) return `Period predicted today`;
        return `Period is ${Math.abs(days)} day${Math.abs(days)===1?"":"s"} late`;
      }
    }
    return "Start a cycle to see your prediction";
  }
  if(id==="treasures"){
    const unlocked=typeof collectedTreasures==="function"?collectedTreasures().length:Object.values(data.treasures||{}).filter(x=>x?.collected).length;
    return `${unlocked} treasure${unlocked===1?"":"s"} discovered`;
  }
  return "";
}

function homeTile(item,editing){
  const [defaultTitle,subtitle,fallback]=HOME_TILE_INFO[item.id];
  const title=data.homeTileNames?.[item.id]||defaultTitle;
  const art=data.homeImages?.[item.id]
    ? `<span class="module-image"><img src="${data.homeImages[item.id]}" alt=""></span>`
    : item.id==="pokemon" && !(data.homeIcons?.[item.id])
      ? `<span class="emoji app-icon-image"><img src="./icons/pokemon.svg?v=1615" alt="Poké Ball"></span>`
      : `<span class="emoji">${esc(data.homeIcons?.[item.id]||fallback)}</span>`;
  const accent=data.homeTileAccents?.[item.id]||"";
  const style=accent?` style="--tile-accent:${esc(accent)}"`:"";
  return `<article class="home-tile-wrap size-${item.size}" draggable="${editing}" data-home-id="${item.id}"${style}>
    <button type="button" class="module module-${item.id}" ${editing?'tabindex="-1"':`data-route="${item.id}"`}>${art}<strong>${esc(title)}</strong><small class="tile-subtitle">${subtitle}</small><span class="tile-status">${esc(homeTileStatus(item.id))}</span></button>
    ${editing?`<div class="tile-edit-controls">
      <button type="button" class="tile-move" data-move="back" aria-label="Move ${esc(title)} earlier">‹</button>
      <button type="button" class="tile-drag" aria-label="Drag ${esc(title)}">☰</button>
      <button type="button" class="tile-customise" data-customise-tile="${item.id}" aria-label="Customise ${esc(title)}">Edit</button>
      <button type="button" class="tile-move" data-move="forward" aria-label="Move ${esc(title)} later">›</button>
    </div>`:""}
  </article>`;
}

function hiddenHomeTiles(){
  if(!data.homeHidden?.length) return "";
  return `<section class="hidden-home-tiles"><h2>Hidden tiles</h2><div>${data.homeHidden.map(id=>{
    const info=HOME_TILE_INFO[id];
    const name=data.homeTileNames?.[id]||info[0];
    return `<button type="button" data-show-tile="${id}"><span>${esc(data.homeIcons?.[id]||info[2])}</span>${esc(name)}<b>Show</b></button>`;
  }).join("")}</div></section>`;
}

function tileEditor(id){
  const item=data.homeLayout.find(x=>x.id===id);
  if(!item) return "";
  const [defaultTitle,,fallback]=HOME_TILE_INFO[id];
  const title=data.homeTileNames?.[id]||defaultTitle;
  const icon=data.homeIcons?.[id]||fallback;
  const accent=data.homeTileAccents?.[id]||"#9d61ff";
  return `<div class="tile-editor-backdrop" data-close-tile-editor>
    <section class="tile-editor" role="dialog" aria-modal="true" aria-labelledby="tileEditorTitle" data-tile-editor="${id}">
      <div class="tile-editor-head"><div><span class="eyebrow">Edit Home tile</span><h2 id="tileEditorTitle">${esc(title)}</h2></div><button type="button" data-close-tile-editor aria-label="Close">×</button></div>
      <label>Tile name<input class="field" id="tileEditorName" value="${esc(title)}" maxlength="40"></label>
      <label>Icon or emoji<input class="field" id="tileEditorIcon" value="${esc(icon)}" maxlength="12"></label>
      <label>Tile size<select class="field" id="tileEditorSize"><option value="small" ${item.size==="small"?"selected":""}>1×1 compact</option><option value="medium" ${item.size==="medium"?"selected":""}>1×1 standard</option><option value="wide" ${item.size==="wide"?"selected":""}>2×1 wide</option><option value="large" ${item.size==="large"?"selected":""}>2×2 large</option></select></label>
      <label class="tile-colour-label">Accent colour<input type="color" id="tileEditorAccent" value="${esc(accent)}"></label>
      <div class="tile-cover-row"><div class="tile-cover-preview">${data.homeImages?.[id]?`<img src="${data.homeImages[id]}" alt="">`:`<span>${esc(icon)}</span>`}</div><div><strong>Custom cover image</strong><p>Shows the whole picture without cropping.</p><button type="button" class="secondary" id="tilePickImage">Choose image</button><input type="file" id="tileImageInput" accept="image/*" hidden>${data.homeImages?.[id]?`<button type="button" class="mini danger" id="tileRemoveImage">Remove image</button>`:""}</div></div>
      <div class="tile-editor-actions"><button type="button" class="danger secondary" id="tileHide">Hide tile</button><button type="button" class="primary" id="tileSave">Save changes</button></div>
    </section>
  </div>`;
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
      ${editing?`<p class="home-edit-help">Drag tiles using ☰, use the arrows, or tap Edit to rename, resize, hide, recolour or add a cover image.</p>`:""}
    </section>
    <div class="grid home-layout ${editing?"editing":""}">${data.homeLayout.map(item=>homeTile(item,editing)).join("")}</div>
    ${editing?hiddenHomeTiles():""}
    <div id="tileEditorMount"></div>
  `,"home");
}

function resizeHomeCover(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error("read"));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error("image"));
      img.onload=()=>{
        const size=600;
        const canvas=document.createElement("canvas");
        canvas.width=size;canvas.height=size;
        const ctx=canvas.getContext("2d");
        ctx.fillStyle="rgba(0,0,0,0)";ctx.fillRect(0,0,size,size);
        const scale=Math.min((size-32)/img.width,(size-32)/img.height);
        const w=img.width*scale,h=img.height*scale;
        ctx.drawImage(img,(size-w)/2,(size-h)/2,w,h);
        resolve(canvas.toDataURL("image/webp",.82));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function bindTileEditor(id){
  const mount=document.querySelector("#tileEditorMount");
  if(!mount) return;
  mount.innerHTML=tileEditor(id);
  const backdrop=mount.querySelector(".tile-editor-backdrop");
  const close=()=>{mount.innerHTML=""};
  backdrop?.addEventListener("click",e=>{if(e.target.matches("[data-close-tile-editor]"))close()});
  mount.querySelector("#tilePickImage")?.addEventListener("click",()=>mount.querySelector("#tileImageInput")?.click());
  mount.querySelector("#tileImageInput")?.addEventListener("change",async e=>{
    const file=e.target.files?.[0]; if(!file) return;
    try{data.homeImages=data.homeImages||{};data.homeImages[id]=await resizeHomeCover(file);saveData();bindTileEditor(id);toast("Cover image added ✨")}catch{toast("That image could not be added")}
  });
  mount.querySelector("#tileRemoveImage")?.addEventListener("click",()=>{delete data.homeImages[id];saveData();bindTileEditor(id);toast("Cover image removed")});
  mount.querySelector("#tileHide")?.addEventListener("click",()=>{
    data.homeLayout=data.homeLayout.filter(x=>x.id!==id);data.homeHidden=data.homeHidden||[];if(!data.homeHidden.includes(id))data.homeHidden.push(id);saveData();render();
  });
  mount.querySelector("#tileSave")?.addEventListener("click",()=>{
    const name=mount.querySelector("#tileEditorName").value.trim().slice(0,40);
    const icon=mount.querySelector("#tileEditorIcon").value.trim().slice(0,12);
    const size=mount.querySelector("#tileEditorSize").value;
    const accent=mount.querySelector("#tileEditorAccent").value;
    data.homeTileNames=data.homeTileNames||{};data.homeIcons=data.homeIcons||{};data.homeTileAccents=data.homeTileAccents||{};
    if(name)data.homeTileNames[id]=name;else delete data.homeTileNames[id];
    if(icon)data.homeIcons[id]=icon;else delete data.homeIcons[id];
    data.homeTileAccents[id]=accent;
    const item=data.homeLayout.find(x=>x.id===id);if(item)item.size=size;
    saveData();render();toast("Home tile updated ✨");
  });
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
  document.querySelectorAll("[data-customise-tile]").forEach(btn=>btn.addEventListener("click",()=>bindTileEditor(btn.dataset.customiseTile)));
  document.querySelectorAll("[data-show-tile]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.dataset.showTile;data.homeHidden=data.homeHidden.filter(x=>x!==id);data.homeLayout.push({id,size:id==="treasures"?"wide":"medium"});saveRender();
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

  let draggedId="";
  document.querySelectorAll(".tile-drag").forEach(handle=>{
    handle.addEventListener("pointerdown",e=>{
      e.preventDefault();draggedId=handle.closest(".home-tile-wrap")?.dataset.homeId||"";
      handle.setPointerCapture?.(e.pointerId);document.body.classList.add("reordering");
    });
    handle.addEventListener("pointermove",e=>{
      if(!draggedId)return;
      const target=document.elementFromPoint(e.clientX,e.clientY)?.closest(".home-tile-wrap");
      if(!target||target.dataset.homeId===draggedId)return;
      const fi=data.homeLayout.findIndex(x=>x.id===draggedId),ti=data.homeLayout.findIndex(x=>x.id===target.dataset.homeId);
      if(fi<0||ti<0)return;
      const [moved]=data.homeLayout.splice(fi,1);data.homeLayout.splice(ti,0,moved);
      const grid=document.querySelector(".home-layout");const dragged=grid.querySelector(`[data-home-id="${draggedId}"]`);
      if(fi<ti)target.after(dragged);else target.before(dragged);
    });
    const finish=()=>{if(!draggedId)return;draggedId="";document.body.classList.remove("reordering");saveData()};
    handle.addEventListener("pointerup",finish);handle.addEventListener("pointercancel",finish);
  });
}
