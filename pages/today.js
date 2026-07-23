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
  const healthLog=(data.healthPromptLog||{})[today()]||{};

  if(hour < 14 && !healthLog.morning){
    items.push({emoji:"⚖️",title:"Morning weight & measurements",detail:"Log your morning weight and any measurements you want to track.",route:"health",kind:"Health",action:"health-morning"});
  }
  if(hour >= 17 && !healthLog.evening){
    items.push({emoji:"📏",title:"Evening weight & measurements",detail:"Add your evening check-in before the day ends.",route:"health",kind:"Health",action:"health-evening"});
  }

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

  items.push({emoji:"💜",title:data.checkins[today()]?"Review today’s check-in":"Complete today’s check-in",detail:data.checkins[today()]?"Saved for today":"Not completed yet",route:"journal",kind:"Journal"});
  return items;
}

function TodayPage(){
  const items=getTodayItems(),groups={};
  const completedHouse=(data.houseTasks||[]).filter(task=>houseCompletedToday(task));
  items.forEach(item=>{groups[item.kind]=groups[item.kind]||[];groups[item.kind].push(item)});
  const morning=(data.morningCheckins||{})[today()];
  return shell(`${head("Today",niceDate())}
    <details class="card morning-checkin" ${morning?'':'open'}><summary><span><strong>☀️ Morning Check-in</strong><small>${morning?'Saved for today':'Weight, sleep, mood, energy, pain and your morning notes'}</small></span><b>${morning?'✓':'›'}</b></summary>
      <div class="morning-grid">
        <label>Weight<input class="field" id="morningWeight" type="number" step="0.1" value="${esc(morning?.weight||'')}" placeholder="kg"></label>
        <label>Sleep<input class="field" id="morningSleep" type="number" step="0.25" value="${esc(morning?.sleep||'')}" placeholder="hours"></label>
        <label>Mood<input class="field" id="morningMood" type="range" min="1" max="5" value="${morning?.mood||3}"></label>
        <label>Energy<input class="field" id="morningEnergy" type="range" min="1" max="5" value="${morning?.energy||3}"></label>
        <label>Pain<input class="field" id="morningPain" type="range" min="1" max="5" value="${morning?.pain||3}"></label>
        <label>Water<input class="field" id="morningWater" type="number" min="0" value="${esc(morning?.water||0)}" placeholder="glasses"></label>
        <label class="morning-wide">Medication notes<input class="field" id="morningMedication" value="${esc(morning?.medication||'')}" placeholder="Taken, due, or anything to remember"></label>
        <label class="morning-wide">What do I need today?<textarea class="field" id="morningPrompt1">${esc(morning?.prompt1||'')}</textarea></label>
        <label class="morning-wide">One gentle priority<textarea class="field" id="morningPrompt2">${esc(morning?.prompt2||'')}</textarea></label>
        <button type="button" class="primary morning-wide" id="saveMorningCheckin">Save morning check-in</button>
      </div>
    </details>
    <section class="card"><div class="stat-grid"><div class="stat"><strong>${items.length}</strong><span>Remaining today</span></div><div class="stat"><strong>${(data.personalTasks||[]).filter(t=>!t.done).length}</strong><span>Open to-dos</span></div></div></section>
    ${Object.entries(groups).map(([group,groupItems])=>`<details class="card today-group"><summary><span><strong>${esc(group)}</strong><small>${groupItems.length} remaining</small></span><b>⌄</b></summary><div class="today-task-list">${groupItems.map(item=>`<article class="item-row today-task" data-today-item><button type="button" class="today-task-main" data-route="${item.route}" ${item.routeId?`data-route-id="${esc(item.routeId)}"`:""}><span class="today-task-icon">${item.emoji}</span><span><h3>${esc(item.title)}</h3><p>${esc(item.detail)}</p></span><span class="plant-arrow">›</span></button>${item.completeType?`<button type="button" class="check-task today-quick-done" data-today-complete="${esc(item.completeType)}" data-today-id="${esc(item.completeId)}">✓</button>`:""}</article>`).join("")}</div></details>`).join("")}
    ${completedHouse.length?`<details class="card today-completed-card"><summary>✓ Completed today · ${completedHouse.length}</summary><div class="today-completed-list">${completedHouse.map(task=>`<div class="today-completed-row"><span><strong>${esc(task.task)}</strong><small>${esc(task.room)} · ${esc(task.frequency)}</small></span><button type="button" class="mini" data-today-complete="house" data-today-id="${esc(task.id)}">Undo</button></div>`).join("")}</div></details>`:""}`,'today');
}

function bindToday(){
  const page=document.querySelector('.shell');
  if(!page)return;
  page.querySelector('#saveMorningCheckin')?.addEventListener('click',()=>{
    const value=id=>page.querySelector(id)?.value||'';
    const entry={date:today(),createdAt:new Date().toISOString(),weight:value('#morningWeight'),sleep:value('#morningSleep'),mood:Number(value('#morningMood')),energy:Number(value('#morningEnergy')),pain:Number(value('#morningPain')),water:Number(value('#morningWater')||0),medication:value('#morningMedication'),prompt1:value('#morningPrompt1'),prompt2:value('#morningPrompt2')};
    data.morningCheckins=data.morningCheckins||{};data.morningCheckins[today()]=entry;
    if(entry.weight){data.weightEntries=data.weightEntries||[];data.weightEntries=data.weightEntries.filter(x=>!(x.date===today()&&x.source==='morning-checkin'));data.weightEntries.push({id:`weight-${Date.now()}`,date:today(),value:Number(entry.weight),unit:'kg',source:'morning-checkin'});}
    if(entry.sleep){data.sleepEntries=data.sleepEntries||[];data.sleepEntries=data.sleepEntries.filter(x=>!(x.date===today()&&x.source==='morning-checkin'));data.sleepEntries.push({id:`sleep-${Date.now()}`,date:today(),hours:Number(entry.sleep),source:'morning-checkin'});}
    data.checkins=data.checkins||{};data.checkins[today()]={...(data.checkins[today()]||{}),mood:entry.mood,energy:entry.energy,pain:entry.pain,water:entry.water,savedAt:entry.createdAt};
    data.journalTimeline=data.journalTimeline||[];data.journalTimeline=data.journalTimeline.filter(x=>!(x.date===today()&&x.source==='morning-checkin'));data.journalTimeline.push({id:`journal-${Date.now()}`,date:today(),time:new Date().toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}),prompt:'Morning Check-in',text:[entry.prompt1,entry.prompt2,entry.medication].filter(Boolean).join(' · '),source:'morning-checkin',createdAt:entry.createdAt});
    saveData();toast('Morning check-in saved ☀️');render();
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
      data.medicationHistory.push({id:`dose-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,medId:med.id,date:doseDate,time:`${pad(now.getHours())}:${pad(now.getMinutes())}`,notes:'',createdAt:now.toISOString()});
      data.medicationLog=data.medicationLog&&typeof data.medicationLog==='object'?data.medicationLog:{};
      data.medicationLog[doseDate]=data.medicationLog[doseDate]&&typeof data.medicationLog[doseDate]==='object'?data.medicationLog[doseDate]:{};
      data.medicationLog[doseDate][med.id]=true;
      message=`${med.name} marked as taken 💊`;
    }else if(type==='aquarium-feed'){
      const tank=(data.aquariums||[]).find(item=>String(item.id)===id);
      if(!tank)return;
      tank.feeds=Array.isArray(tank.feeds)?tank.feeds:[];
      if(!tankFeedToday(tank)) tank.feeds.push({id:`feed-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,food:"Fed from Today",createdAt:new Date().toISOString()});
      message=`${tank.name} fed 🐠`;
    }else return;

    saveData();
    const row=button.closest('[data-today-item]');
    row?.classList.add('today-item-completing');
    button.classList.add('done');
    toast(message);
    setTimeout(()=>render(),180);
  });
}
