function ensureHomeLayout(){
  const defaults=[
    "journal","today","todo","plants",
    "pets","house","shopping","medication","measurements",
    "period","pokemon","books","budget","gaming","treasures"
  ];
  if(!Array.isArray(data.homeLayout)) data.homeLayout=[];
  if(!Array.isArray(data.homeHidden)) data.homeHidden=[];
  data.homeTileAccents=data.homeTileAccents||{};
  data.homeTileNames=data.homeTileNames||{};
  // 16.76: clear the accidental Budget highlight once; users can still choose a new accent afterwards.
  if(!data.homeBudgetAccentReset1676){ delete data.homeTileAccents.budget; data.homeBudgetAccentReset1676=true; }
  if(data.homeTileNames.measurements==="Weight & Measurements"||data.homeTileNames.measurements==="Weight & Measurement"||data.homeTileNames.measurements==="Weight &\nMeasurements") data.homeTileNames.measurements="Measures";

  // Older versions used "flowers" for the hourly Journal tile.
  data.homeLayout=data.homeLayout.map(item=>{
    const value=typeof item==="string"?{id:item,size:"medium"}:{...item};
    if(value.id==="flowers") value.id="journal";
    return value;
  });
  data.homeHidden=data.homeHidden.map(id=>id==="flowers"?"journal":id);
  // 16.76: keep Period on Home and remove the redundant Health dashboard tile.
  data.homeLayout=data.homeLayout.filter(item=>!["hobbies","health"].includes(typeof item==="string"?item:item?.id));
  data.homeHidden=data.homeHidden.filter(id=>id!=="hobbies"&&id!=="health"&&id!=="period");

  const seen=new Set();
  data.homeLayout=data.homeLayout.filter(item=>{
    const id=item?.id;
    if(!defaults.includes(id)||seen.has(id)) return false;
    seen.add(id);
    return true;
  }).map(item=>({
    id:item.id,
    size:item.id==="treasures"?"wide":"medium"
  }));

  defaults.forEach(id=>{
    if(!seen.has(id)&&!data.homeHidden.includes(id)){
      data.homeLayout.push({id,size:id==="treasures"?"wide":"medium"});
    }
  });
  data.homeHidden=[...new Set(data.homeHidden.filter(id=>defaults.includes(id)&&!data.homeLayout.some(item=>item.id===id)))];
}

const HOME_TILE_INFO={
  journal:["Journal","Every-hour check-ins","📖"],
  today:["Today","Plan, focus and track","🗓️"],
  todo:["To-do","Tasks and reminders","📝"],
  plants:["Plants","Care, water and track","🌱"],
  pets:["Aquariums","Care, feed and track","🐠"],
  house:["House","Home, jobs and supplies","🏡"],
  shopping:["Shopping","Lists and essentials","🛒"],
  medication:["Medication","Tablets and schedule","💊"],
  measurements:["Measures","Track weight and body measurements","📏"],
  period:["Period","Cycle and symptom tracking","🌸"],
  pokemon:["Pokémon GO","Friends, gifts and Vivillon","🔴"],
  books:["Books","Reading list and progress","📚"],
  budget:["Budget & Bills","Money, bills and planning","💷"],
  gaming:["Gaming","Games and progress","🎮"],
  treasures:["Treasure Room","Collected treasures and keepsakes","✨"]
};

function homeTileStatus(id){
  const now=new Date();
  const todayKey=typeof today==="function"?today():now.toISOString().slice(0,10);
  if(id==="journal"){
    const entries=(data.dayCheckins||[]).filter(entry=>entry.date===todayKey);
    return entries.length?`${entries.length} today`:`Start today`;
  }
  if(id==="today"){
    const tasks=[...(data.todos||[]),...(data.houseTasks||[])].filter(item=>!item.done);
    return `${tasks.length} remaining`;
  }
  if(id==="todo"){
    const tasks=(data.todos||[]).filter(item=>!item.done);
    return `${tasks.length} task${tasks.length===1?"":"s"}`;
  }
  if(id==="plants"){
    const count=(data.plants||[]).length;
    return `${count} plant${count===1?"":"s"}`;
  }
  if(id==="pets"){
    const count=(data.aquariums||[]).length;
    return `${count} tank${count===1?"":"s"}`;
  }
  if(id==="house"){
    const count=(data.houseTasks||[]).filter(item=>!item.done).length;
    return `${count} job${count===1?"":"s"}`;
  }
  if(id==="shopping"){
    const count=(data.shoppingItems||[]).filter(item=>!item.done).length;
    return `${count} item${count===1?"":"s"}`;
  }
  if(id==="medication"){
    const shortDay=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(`${todayKey}T12:00:00`).getDay()];
    let remaining=0;
    (data.medications||[]).forEach(m=>{
      const active=m.active!==false&&(!m.startDate||todayKey>=m.startDate)&&(!m.endDate||todayKey<=m.endDate);
      const due=active&&(m.scheduleType==="daily"||(m.scheduleType==="weekdays"&&(m.weekdays||[]).includes(shortDay)));
      if(!due)return;
      const taken=(data.medicationHistory||[]).filter(x=>x.medId===m.id&&x.date===todayKey).length;
      remaining+=Math.max(0,(Number(m.dosesPerDay)||1)-taken);
    });
    return remaining?`${remaining} today`:`All taken`;
  }
  if(id==="measurements"){
    const latestMeasure=(data.measurements||[]).slice().sort((a,b)=>String(b.createdAt||b.date||"").localeCompare(String(a.createdAt||a.date||"")))[0];
    const latestWeight=(data.weightEntries||[]).slice().sort((a,b)=>String(b.createdAt||b.date||"").localeCompare(String(a.createdAt||a.date||"")))[0];
    const weight=latestWeight?.weight??latestWeight?.value;
    if(weight!==undefined&&weight!==null&&weight!=="") return `${weight} kg`;
    return latestMeasure?.date?`Updated ${new Date(`${latestMeasure.date}T12:00:00`).toLocaleDateString("en-GB",{day:"numeric",month:"short"})}`:"Add first entry";
  }
  if(id==="health"){
    const latest=(data.weightEntries||[]).slice().sort((a,b)=>String(b.createdAt||b.date||"").localeCompare(String(a.createdAt||a.date||"")))[0];
    return latest?`${latest.weight??latest.value??"Saved"} kg`:`Open dashboard`;
  }
  if(id==="period"){
    if(typeof periodStats==="function"){
      const stats=periodStats();
      if(stats.active) return `Day ${periodDaysBetween(stats.active.start,today())+1}`;
      if(stats.predicted){
        const days=periodDaysBetween(today(),stats.predicted);
        return days>=0?`${days} day${days===1?"":"s"} away`:`${Math.abs(days)} day${Math.abs(days)===1?"":"s"} late`;
      }
    }
    return "Track cycle";
  }
  if(id==="pokemon") return `${(data.pokemonFriends||[]).length} friends`;
  if(id==="books") return `${(data.books||[]).length} book${(data.books||[]).length===1?"":"s"}`;
  if(id==="budget"){
    const unpaid=(data.bills||[]).filter(b=>!b.paid);
    return `${unpaid.length} unpaid`;
  }
  if(id==="gaming") return "Open games";
  if(id==="treasures"){
    const unlocked=typeof collectedTreasures==="function"?collectedTreasures().length:Object.values(data.treasures||{}).filter(x=>x?.collected).length;
    return `${unlocked} item${unlocked===1?"":"s"}`;
  }
  return "";
}

function homeTile(item,editing){
  const [defaultTitle,subtitle,fallback]=HOME_TILE_INFO[item.id];
  const title=data.homeTileNames?.[item.id]||defaultTitle;
  const art=data.homeImages?.[item.id]
    ? `<span class="module-image"><img src="${data.homeImages[item.id]}" alt=""></span>`
    : item.id==="pokemon" && !(data.homeIcons?.[item.id])
      ? `<span class="emoji app-icon-image"><img src="./icons/pokemon.svg?v=1676" alt="Poké Ball"></span>`
      : `<span class="emoji">${esc(data.homeIcons?.[item.id]||fallback)}</span>`;
  const accent=data.homeTileAccents?.[item.id]||"";
  const style=accent?` style="--tile-accent:${esc(accent)}"`:"";
  const route=item.id==="measurements"?"health":item.id;
  const extra=item.id==="measurements"?' data-route-id="log"':"";
  const content=`${art}<strong>${esc(title)}</strong><small class="tile-subtitle">${subtitle}</small><span class="tile-status">${esc(homeTileStatus(item.id))}</span>`;
  if(editing){
    return `<article class="home-tile-wrap size-${item.size} is-editing" data-home-id="${item.id}"${style}>
      <div class="module module-${item.id}">${content}<button type="button" class="home-tile-edit-button" data-edit-home-tile="${item.id}">✎ Edit</button></div>
    </article>`;
  }
  return `<article class="home-tile-wrap size-${item.size}" data-home-id="${item.id}"${style}>
    <button type="button" class="module module-${item.id}" data-route="${route}"${extra}>${content}<span class="home-tile-chevron">›</span></button>
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
      <label>Tile size<select class="field" id="tileEditorSize"><option value="medium" ${item.size!=="wide"?"selected":""}>Standard tile</option><option value="wide" ${item.size==="wide"?"selected":""}>Wide tile</option></select></label>
      <label class="tile-colour-label">Accent colour<input type="color" id="tileEditorAccent" value="${esc(accent)}"></label>
      <div class="tile-cover-row"><div class="tile-cover-preview">${data.homeImages?.[id]?`<img src="${data.homeImages[id]}" alt="">`:`<span>${esc(icon)}</span>`}</div><div><strong>Custom cover image</strong><p>Shows the whole picture without cropping.</p><button type="button" class="secondary" id="tilePickImage">Choose image</button><input type="file" id="tileImageInput" accept="image/*" hidden>${data.homeImages?.[id]?`<button type="button" class="mini danger" id="tileRemoveImage">Remove image</button>`:""}</div></div>
      <div class="tile-position-controls" aria-label="Move tile"><button type="button" class="secondary" id="tileMoveEarlier">← Move earlier</button><button type="button" class="secondary" id="tileMoveLater">Move later →</button></div>
      <div class="tile-editor-actions"><button type="button" class="danger secondary" id="tileHide">Hide tile</button><button type="button" class="primary" id="tileSave">Save changes</button></div>
    </section>
  </div>`;
}

function homeQuickOverview(){
  const dateKey=typeof today==="function"?today():new Date().toISOString().slice(0,10);
  const checkins=(data.dayCheckins||[]).filter(entry=>entry.date===dateKey);
  const latest=checkins.slice().sort((a,b)=>String(b.createdAt||b.time||"").localeCompare(String(a.createdAt||a.time||"")))[0]||{};
  const daily=data.morningCheckins?.[dateKey]||{};
  const sleepHours=Number(daily.sleep||0);
  const items=[
    ["⚡","Energy",latest.energy?`${latest.energy}/5`:daily.energy?`${daily.energy}/5`:"—"],
    ["🙂","Mood",latest.mood?`${latest.mood}/5`:daily.mood?`${daily.mood}/5`:"—"],
    ["😣","Pain",latest.pain?`${latest.pain}/5`:daily.pain?`${daily.pain}/5`:"—"],
    ["🌙","Sleep",sleepHours?`${sleepHours}h`:"—"]
  ];
  return `<section class="home-overview"><h2>Quick overview</h2><div class="home-overview-grid">${items.map(([icon,label,value])=>`<article><span>${icon}</span><div><strong>${label}</strong><b>${value}</b></div></article>`).join("")}</div></section>`;
}

function homeMedicationReminder(){
  const dateKey=typeof today==="function"?today():new Date().toISOString().slice(0,10);
  const shortDay=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(`${dateKey}T12:00:00`).getDay()];
  const med=(data.medications||[]).find(m=>m.active!==false&&(m.scheduleType==="daily"||(m.scheduleType==="weekdays"&&(m.weekdays||[]).includes(shortDay)))&&!(data.medicationHistory||[]).some(x=>x.medId===m.id&&x.date===dateKey));
  if(!med) return "";
  return `<section class="home-reminders"><h2>Reminders</h2><button type="button" class="home-reminder-card" data-route="medication"><span>✓</span><div><strong>${esc(med.name||"Take medication")}</strong><small>${esc(med.times?.[0]||med.time||"Today")}</small></div><b>Open</b><i>›</i></button></section>`;
}

function HomePage(){
  ensureHomeLayout();
  const d=new Date();
  const hour=d.getHours();
  const greeting=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  const editing=!!data.homeEditing;
  const dayKey=typeof linaDailyDayKey==="function"?linaDailyDayKey():today();
  const complete=!!data.dailyCheckinCompleted?.[dayKey];
  return shell(`
    <section class="hero home-dashboard-hero">
      <div class="hero-row">
        <div><h1>${greeting}, Lina 💜</h1><p>Take it one step at a time ✨</p></div>
        <div class="home-menu-wrap">
          <button type="button" class="home-menu-toggle" id="homeMenuToggle" aria-label="Open Home menu" aria-expanded="false">⌄</button>
          <div class="home-menu" id="homeMenu" hidden>
            <button type="button" id="homeEditToggle"><span aria-hidden="true">✎</span><span>${editing?"Finish editing":"Edit Home"}</span></button>
            <button type="button" id="homeThemes"><span aria-hidden="true">◈</span><span>Themes</span></button>
          </div>
        </div>
      </div>
      ${editing?`<p class="home-edit-help">Use the Edit button on any tile to rename it, change its icon, colour or size. Move it earlier or later from inside the editor.</p>`:""}
    </section>
    <button type="button" class="home-daily-checkin ${complete?"complete":""}" data-open-daily-checkin>
      <span class="home-checkin-icon">☀️</span><span><strong>Daily check-in</strong><small>${complete?"Completed for today":"Track sleep, mood, energy and more"}</small></span><b>${complete?"Completed":"Complete now"}</b>
    </button>
    <section class="home-journey"><h2>Your journey</h2><div class="grid home-layout ${editing?"editing":""}">${data.homeLayout.map(item=>homeTile(item,editing)).join("")}</div></section>
    ${editing?hiddenHomeTiles():""}
    ${homeQuickOverview()}
    ${homeMedicationReminder()}
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
  const moveTile=step=>{
    const i=data.homeLayout.findIndex(x=>x.id===id);const j=i+step;
    if(i<0||j<0||j>=data.homeLayout.length){toast(step<0?"This tile is already first":"This tile is already last");return;}
    [data.homeLayout[i],data.homeLayout[j]]=[data.homeLayout[j],data.homeLayout[i]];
    saveData();bindTileEditor(id);toast(step<0?"Tile moved earlier":"Tile moved later");
  };
  mount.querySelector("#tileMoveEarlier")?.addEventListener("click",()=>moveTile(-1));
  mount.querySelector("#tileMoveLater")?.addEventListener("click",()=>moveTile(1));
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

function bindHomeTileDragging(){
  const grid=document.querySelector(".home-layout.editing");
  if(!grid) return;
  let source=null,ghost=null,holdTimer=null,pointerId=null;
  let startX=0,startY=0,offsetX=0,offsetY=0,active=false,lastTarget=null;

  const clearHold=()=>{if(holdTimer){clearTimeout(holdTimer);holdTimer=null}};
  const clearTarget=()=>{lastTarget?.classList.remove("drag-target");lastTarget=null};
  const cleanup=({save=false}={})=>{
    clearHold();clearTarget();
    document.body.classList.remove("home-tile-dragging");
    source?.classList.remove("drag-ready","drag-source");
    ghost?.remove();ghost=null;
    if(save&&source){
      const ids=[...grid.querySelectorAll(".home-tile-wrap[data-home-id]")].map(el=>el.dataset.homeId);
      const byId=new Map(data.homeLayout.map(item=>[item.id,item]));
      data.homeLayout=ids.map(id=>byId.get(id)).filter(Boolean);
      saveData();
      toast("Home tiles reordered ✨");
    }
    source=null;pointerId=null;active=false;
  };
  const moveGhost=(x,y)=>{
    if(!ghost)return;
    ghost.style.setProperty("--drag-x",`${x-offsetX}px`);
    ghost.style.setProperty("--drag-y",`${y-offsetY}px`);
  };
  const beginDrag=(event)=>{
    if(!source)return;
    active=true;
    source.classList.remove("drag-ready");
    source.classList.add("drag-source");
    document.body.classList.add("home-tile-dragging");
    const rect=source.getBoundingClientRect();
    offsetX=event.clientX-rect.left;offsetY=event.clientY-rect.top;
    ghost=source.cloneNode(true);
    ghost.classList.add("home-tile-drag-ghost");
    ghost.classList.remove("drag-source","drag-ready","drag-target");
    ghost.style.width=`${rect.width}px`;ghost.style.height=`${rect.height}px`;
    document.body.appendChild(ghost);
    moveGhost(event.clientX,event.clientY);
    try{source.setPointerCapture(pointerId)}catch{}
    if(navigator.vibrate) navigator.vibrate(18);
  };

  grid.querySelectorAll(".home-tile-wrap[data-home-id]").forEach(tile=>{
    tile.addEventListener("pointerdown",event=>{
      if(event.pointerType==="mouse"&&event.button!==0)return;
      if(event.target.closest("button,input,select,label,a"))return;
      cleanup();
      source=tile;pointerId=event.pointerId;startX=event.clientX;startY=event.clientY;
      tile.classList.add("drag-ready");
      holdTimer=setTimeout(()=>beginDrag(event),180);
    });
  });

  grid.addEventListener("pointermove",event=>{
    if(!source||event.pointerId!==pointerId)return;
    const distance=Math.hypot(event.clientX-startX,event.clientY-startY);
    if(!active){
      if(distance>10){clearHold();source.classList.remove("drag-ready");source=null;pointerId=null}
      return;
    }
    event.preventDefault();
    moveGhost(event.clientX,event.clientY);
    ghost.style.visibility="hidden";
    const target=document.elementFromPoint(event.clientX,event.clientY)?.closest(".home-tile-wrap[data-home-id]");
    ghost.style.visibility="";
    if(!target||target===source||!grid.contains(target)){clearTarget();return}
    if(lastTarget!==target){clearTarget();lastTarget=target;target.classList.add("drag-target")}
    const rect=target.getBoundingClientRect();
    const before=event.clientY<rect.top+rect.height/2 || (Math.abs(event.clientY-(rect.top+rect.height/2))<rect.height*.28&&event.clientX<rect.left+rect.width/2);
    if(before) grid.insertBefore(source,target); else grid.insertBefore(source,target.nextSibling);
  },{passive:false});
  const finish=event=>{if(!source||event.pointerId!==pointerId)return;cleanup({save:active})};
  grid.addEventListener("pointerup",finish);
  grid.addEventListener("pointercancel",()=>cleanup());
  window.addEventListener("blur",()=>cleanup());
}

function bindHome(){
  const menuToggle=document.querySelector("#homeMenuToggle");
  const menu=document.querySelector("#homeMenu");
  const closeMenu=()=>{if(!menu||!menuToggle)return;menu.hidden=true;menuToggle.setAttribute("aria-expanded","false")};
  menuToggle?.addEventListener("click",event=>{event.stopPropagation();const opening=menu.hidden;menu.hidden=!opening;menuToggle.setAttribute("aria-expanded",String(opening))});
  document.addEventListener("click",event=>{if(!event.target.closest(".home-menu-wrap")) closeMenu()},{once:true});
  document.querySelector("#homeThemes")?.addEventListener("click",()=>{data.settingsSection="appearance";saveData();go("settings")});
  document.querySelector("#homeEditToggle")?.addEventListener("click",()=>{data.homeEditing=!data.homeEditing;saveData();render()});
  if(!data.homeEditing) return;
  bindHomeTileDragging();
  const saveRender=()=>{saveData();render()};
  document.querySelectorAll("[data-edit-home-tile]").forEach(tileButton=>tileButton.addEventListener("click",event=>{
    event.preventDefault();event.stopPropagation();bindTileEditor(tileButton.dataset.editHomeTile);
  }));
  document.querySelectorAll("[data-show-tile]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.dataset.showTile;data.homeHidden=data.homeHidden.filter(x=>x!==id);data.homeLayout.push({id,size:id==="treasures"?"wide":"medium"});saveRender();
  }));
}
