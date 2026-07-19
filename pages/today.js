
function getTodayItems(){
  const items=[];
  const now=new Date();
  const hour=now.getHours();
  const weekday=now.toLocaleDateString("en-GB",{weekday:"long"});
  const healthLog=(data.healthPromptLog||{})[today()]||{};

  // Morning and evening health check prompts.
  if(hour < 14 && !healthLog.morning){
    items.push({
      emoji:"⚖️",
      title:"Morning weight & measurements",
      detail:"Log your morning weight and any measurements you want to track.",
      route:"health",
      kind:"Health",
      action:"health-morning"
    });
  }
  if(hour >= 17 && !healthLog.evening){
    items.push({
      emoji:"📏",
      title:"Evening weight & measurements",
      detail:"Add your evening check-in before the day ends.",
      route:"health",
      kind:"Health",
      action:"health-evening"
    });
  }

  // Medication still to take today, respecting daily/weekday/PRN schedules.
  const todayValue=today();
  const shortDay=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][now.getDay()];
  (data.medications||[]).forEach(m=>{
    const active=m.active!==false && (!m.startDate||todayValue>=m.startDate) && (!m.endDate||todayValue<=m.endDate);
    const due=active && (m.scheduleType==="daily" || (m.scheduleType==="weekdays"&&(m.weekdays||[]).includes(shortDay)));
    const taken=(data.medicationHistory||[]).some(log=>log.medId===m.id&&log.date===todayValue);
    if(due&&!taken){
      items.push({
        emoji:"💊",
        title:`Take ${m.name}`,
        detail:[m.dose,m.time].filter(Boolean).join(" · "),
        route:"medication",
        kind:"Medication"
      });
    }
  });

  // House tasks due today, including explicitly selected weekdays.
  (data.houseTasks||[]).forEach(t=>{
    const frequency=(t.frequency||"").toLowerCase();
    const selectedWeekday=(t.frequency==="Specific weekdays"&&(t.weekdays||[]).includes(shortDay));
    const dueToday=
      frequency==="daily" ||
      frequency==="every other day" ||
      selectedWeekday ||
      frequency.includes(weekday.toLowerCase()) ||
      (weekday==="Thursday" && t.id==="recycling");

    if(dueToday && !t.done){
      items.push({
        emoji:t.id==="recycling"?"♻️":"🏡",
        title:t.task,
        detail:`${t.room} · ${t.frequency}`,
        route:"house",
        kind:"House"
      });
    }
  });

  // Personal tasks due today.
  (data.personalTasks||[]).forEach(task=>{
    if(!task.done && (!task.date || task.date<=today())){
      items.push({
        emoji:"✅",
        title:task.title,
        detail:[task.energy?`${task.energy} energy`:null,task.time?`Due ${task.time}`:null].filter(Boolean).join(" · ") || "Personal task",
        route:"today",
        kind:"To-do",
        taskId:task.id
      });
    }
  });

  const tanksNeedingFeed=(data.aquariums||[]).filter(tank=>!tankFeedToday(tank));
  if(tanksNeedingFeed.length){
    items.push({
      emoji:"🐠",
      title:tanksNeedingFeed.length===(data.aquariums||[]).length?"Feed the fish tanks":`Feed ${tanksNeedingFeed.map(t=>t.name).join(" & ")}`,
      detail:tanksNeedingFeed.map(t=>t.name).join(" · "),
      route:"pets",
      kind:"Aquariums"
    });
  }

  items.push({
    emoji:"💜",
    title:data.checkins[today()]?"Review today’s check-in":"Complete today’s check-in",
    detail:data.checkins[today()]?"Saved for today":"Not completed yet",
    route:"journal",
    kind:"Journal"
  });

  return items;
}

function TodayPage(){
  const items=getTodayItems(),groups={};
  items.forEach(item=>{groups[item.kind]=groups[item.kind]||[];groups[item.kind].push(item)});
  return shell(`${head("Today’s Tasks",niceDate())}
    <section class="card">
      <div class="stat-grid"><div class="stat"><strong>${items.length}</strong><span>Things for today</span></div><div class="stat"><strong>${(data.personalTasks||[]).filter(t=>!t.done).length}</strong><span>Open to-dos</span></div></div>
      <button class="secondary" data-route="todo" style="margin-top:12px">Open full to-do list →</button>
    </section>
    ${Object.entries(groups).map(([group,groupItems])=>`<h3 class="room-heading">${esc(group)}</h3><div class="list-card today-task-list">
      ${groupItems.map(item=>`<button class="item-row today-task" data-route="${item.taskId?"todo":item.route}"><span class="today-task-icon">${item.emoji}</span><span><h3>${esc(item.title)}</h3><p>${esc(item.detail)}</p></span><span class="plant-arrow">›</span></button>`).join("")}
    </div>`).join("")}`,"today");
}
function bindToday(){}
