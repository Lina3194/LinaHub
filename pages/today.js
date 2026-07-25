function daysSinceDate(value){
  if(!value) return Infinity;
  const then=new Date(`${value}T12:00:00`);
  const now=new Date(`${today()}T12:00:00`);
  return Math.floor((now-then)/86400000);
}

function getTodayItems(){
  const items=[];
  const now=new Date();
  const hour=now.getHours();
  const weekday=now.toLocaleDateString("en-GB",{weekday:"long"});

  const todayValue=today();
  const shortDay=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][now.getDay()];
  (data.medications||[]).forEach(m=>{
    const active=m.active!==false && (!m.startDate||todayValue>=m.startDate) && (!m.endDate||todayValue<=m.endDate);
    const due=active && (m.scheduleType==="daily" || (m.scheduleType==="weekdays"&&(m.weekdays||[]).includes(shortDay)));
    const historyTaken=(data.medicationHistory||[]).filter(log=>log.medId===m.id&&log.date===todayValue).length;
    const legacyTaken=!data.medicationHistoryMigrated&&Boolean(data.medicationLog?.[todayValue]?.[m.id]);
    const taken=Math.max(historyTaken,legacyTaken?1:0);
    const required=Math.max(1,Number(m.dosesPerDay)||1);
    if(due&&taken<required){
      const doseNumber=taken+1;
      const period=(m.time&&/^\d{2}:\d{2}$/.test(m.time))?(Number(m.time.slice(0,2))<12?"AM":"PM"):(required===1?"AM":required===2?(doseNumber===1?"AM":"PM"):`Dose ${doseNumber}`);
      items.push({emoji:"💊",title:m.name,detail:[period,String(doseNumber),m.dose].filter(Boolean).join(" · "),route:"medication",kind:"Medication",completeType:"medication",completeId:m.id});
    }
  });

  (data.houseTasks||[]).forEach(t=>{
    if(houseTaskDue(t,todayValue)) items.push({emoji:t.id==="recycling"?"♻️":"🏡",title:t.task,detail:`${t.room} · ${t.frequency}`,route:"house",kind:"House",completeType:"house",completeId:t.id});
  });

  (data.personalTasks||[]).forEach(task=>{
    if(!task.done&&(!task.date||task.date<=today())){
      items.push({emoji:"✅",title:task.title,detail:[task.energy?`${task.energy} energy`:null,task.time?`Due ${task.time}`:null].filter(Boolean).join(" · ")||"Personal task",route:"todo",kind:"To-do",completeType:"todo",completeId:task.id});
    }
  });

  (data.plants||[]).forEach(plant=>{
    const interval=Number(plant.wateringDays)||0;
    if(interval>0 && daysSinceDate(plant.lastWatered)>=interval){
      items.push({emoji:"💧",title:`Water ${plant.name}`,detail:plant.lastWatered?`Last watered ${formatDate(plant.lastWatered)}`:"No watering logged yet",route:"plant",routeId:plant.id,kind:"Garden",completeType:"water",completeId:plant.id});
    }
  });

  const aquariumOrder=["boys-tank","girls-tank"];
  [...(data.aquariums||[])]
    .sort((a,b)=>aquariumOrder.indexOf(a.id)-aquariumOrder.indexOf(b.id))
    .forEach(tank=>{
      if(tankFeedToday(tank)) return;
      const label=tank.id==="boys-tank"?"Feed boys’ tank":tank.id==="girls-tank"?"Feed girls’ tank":`Feed ${tank.name}`;
      items.push({emoji:tank.emoji||"🐠",title:label,detail:"Tap ✓ when fed",route:"tank",routeId:tank.id,kind:"Aquariums",completeType:"aquarium-feed",completeId:tank.id});
    });

  return items;
}

function todayOpenGroups(){
  try{
    const saved=JSON.parse(sessionStorage.getItem("linahub-today-open-groups")||"[]");
    return new Set(Array.isArray(saved)?saved:[]);
  }catch{return new Set();}
}

function todayOpenRooms(){
  try{
    const saved=JSON.parse(sessionStorage.getItem("linahub-today-open-rooms")||"[]");
    return new Set(Array.isArray(saved)?saved:[]);
  }catch{return new Set();}
}

function todayTaskRow(item){
  return `<article class="item-row today-task" data-today-item><button type="button" class="today-task-main" data-route="${item.route}" ${item.routeId?`data-route-id="${esc(item.routeId)}"`:""}><span class="today-task-icon">${item.emoji}</span><span><h3>${esc(item.title)}</h3><p>${esc(item.detail)}</p></span><span class="plant-arrow">›</span></button>${item.completeType?`<button type="button" class="check-task today-quick-done" data-today-complete="${esc(item.completeType)}" data-today-id="${esc(item.completeId)}">✓</button>`:""}</article>`;
}

function todayHouseRooms(items){
  const rooms={};
  items.forEach(item=>{
    const task=(data.houseTasks||[]).find(t=>String(t.id)===String(item.completeId));
    const room=task?.room||"Whole House";
    (rooms[room] ||= []).push(item);
  });
  const roomOrder=(data.houseRooms||[]).map(room=>room.name);
  const openRooms=todayOpenRooms();
  return Object.entries(rooms).sort(([a],[b])=>{
    const ai=roomOrder.indexOf(a),bi=roomOrder.indexOf(b);
    return (ai<0?999:ai)-(bi<0?999:bi)||a.localeCompare(b);
  }).map(([room,roomItems])=>{
    const icon=(data.houseRooms||[]).find(r=>r.name===room)?.icon||"🏠";
    return `<details class="today-room-group" data-today-room="${esc(room)}" ${openRooms.has(room)?"open":""}><summary><span class="today-room-name"><i>${icon}</i><strong>${esc(room)}</strong></span><span class="today-room-meta"><small>${roomItems.length}</small><b>⌄</b></span></summary><div class="today-task-list">${roomItems.map(todayTaskRow).join("")}</div></details>`;
  }).join("");
}

function TodayPage(){
  const items=getTodayItems(),groups={};
  const openGroups=todayOpenGroups();
  const completedHouse=(data.houseTasks||[]).filter(task=>houseCompletedToday(task));
  items.forEach(item=>{groups[item.kind]=groups[item.kind]||[];groups[item.kind].push(item)});
  return shell(`${head("Today",niceDate())}
    <section class="card"><div class="stat-grid"><div class="stat"><strong>${items.length}</strong><span>Remaining today</span></div><div class="stat"><strong>${(data.personalTasks||[]).filter(t=>!t.done).length}</strong><span>Open to-dos</span></div></div></section>
    ${Object.entries(groups).map(([group,groupItems])=>`<details class="card today-group" data-today-group="${esc(group)}" ${openGroups.has(group)?"open":""}><summary><span><strong>${esc(group)}</strong><small>${groupItems.length} remaining</small></span><b>⌄</b></summary>${group==="House"?`<div class="today-house-rooms">${todayHouseRooms(groupItems)}</div>`:`<div class="today-task-list">${groupItems.map(todayTaskRow).join("")}</div>`}</details>`).join("")}
    ${completedHouse.length?`<details class="card today-completed-card" data-today-group="Completed House" ${openGroups.has("Completed House")?"open":""}><summary>✓ Completed today · ${completedHouse.length}</summary><div class="today-completed-list">${completedHouse.map(task=>`<div class="today-completed-row"><span><strong>${esc(task.task)}</strong><small>${esc(task.room)} · ${esc(task.frequency)}</small></span><button type="button" class="mini" data-today-complete="house" data-today-id="${esc(task.id)}">Undo</button></div>`).join("")}</div></details>`:""}`,'today');
}

function bindToday(){
  const page=document.querySelector('.shell');
  if(!page)return;
  page.querySelectorAll('[data-today-group]').forEach(section=>{
    section.addEventListener('toggle',()=>{
      const open=new Set([...page.querySelectorAll('[data-today-group][open]')].map(el=>el.dataset.todayGroup));
      sessionStorage.setItem('linahub-today-open-groups',JSON.stringify([...open]));
    });
  });
  page.querySelectorAll('[data-today-room]').forEach(room=>{
    room.addEventListener('toggle',()=>{
      const open=new Set([...page.querySelectorAll('[data-today-room][open]')].map(el=>el.dataset.todayRoom));
      sessionStorage.setItem('linahub-today-open-rooms',JSON.stringify([...open]));
    });
  });
  page.addEventListener('click',event=>{
    const button=event.target.closest('[data-today-complete]');
    if(!button)return;
    event.preventDefault();
    event.stopPropagation();
    const type=button.dataset.todayComplete;
    const id=String(button.dataset.todayId||'');
    let message='Marked as done ✨';

    if(type==='house'){
      const task=(data.houseTasks||[]).find(item=>String(item.id)===id);
      if(!task)return;
      const completed=!houseCompletedToday(task);
      setHouseTaskCompleted(task,completed);
      message=completed?'House job completed 🏡':'House completion removed';
    }else if(type==='todo'){
      const task=(data.personalTasks||[]).find(item=>String(item.id)===id);
      if(!task)return;
      task.done=true;
      task.completed=today();
      message='Task completed ✨';
    }else if(type==='water'){
      const plant=(data.plants||[]).find(item=>String(item.id)===id);
      if(!plant)return;
      plant.history=Array.isArray(plant.history)?plant.history:[];
      if(!plant.history.includes(today())) plant.history.push(today());
      plant.history.sort();
      plant.lastWatered=today();
      message=`${plant.name} watered 💧`;
    }else if(type==='medication'){
      const med=(data.medications||[]).find(item=>String(item.id)===id);
      if(!med)return;
      const now=new Date(),pad=n=>String(n).padStart(2,'0');
      data.medicationHistory=Array.isArray(data.medicationHistory)?data.medicationHistory:[];
      const doseDate=today();
      const stockAdjusted=typeof medAdjustStockForDose==='function'?medAdjustStockForDose(med.id,-1):false;
      data.medicationHistory.push({id:`dose-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,medId:med.id,date:doseDate,time:`${pad(now.getHours())}:${pad(now.getMinutes())}`,notes:'',createdAt:now.toISOString(),stockAdjusted});
      data.medicationLog=data.medicationLog&&typeof data.medicationLog==='object'?data.medicationLog:{};
      data.medicationLog[doseDate]=data.medicationLog[doseDate]&&typeof data.medicationLog[doseDate]==='object'?data.medicationLog[doseDate]:{};
      data.medicationLog[doseDate][med.id]=true;
      message=stockAdjusted?`${med.name} taken · ${Math.max(0,Math.floor(Number(med.stock)||0))} tablets left 💊`:`${med.name} marked as taken · stock is already 0 💊`;
    }else if(type==='aquarium-feed'){
      const tank=(data.aquariums||[]).find(item=>String(item.id)===id);
      if(!tank)return;
      tank.feeds=Array.isArray(tank.feeds)?tank.feeds:[];
      if(!tankFeedToday(tank)) tank.feeds.push({id:`feed-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,food:"Fed from Today",createdAt:new Date().toISOString()});
      message=`${tank.name} fed 🐠`;
    }else return;

    const open=new Set([...page.querySelectorAll('[data-today-group][open]')].map(el=>el.dataset.todayGroup));
    sessionStorage.setItem('linahub-today-open-groups',JSON.stringify([...open]));
    const openRooms=new Set([...page.querySelectorAll('[data-today-room][open]')].map(el=>el.dataset.todayRoom));
    sessionStorage.setItem('linahub-today-open-rooms',JSON.stringify([...openRooms]));
    saveData();
    const row=button.closest('[data-today-item]');
    row?.classList.add('today-item-completing');
    button.classList.add('done');
    toast(message);
    setTimeout(()=>render(),180);
  });
}


