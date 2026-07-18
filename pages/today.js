
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

  // Medication still to take today.
  const medLog=(data.medicationLog||{})[today()]||{};
  (data.medications||[]).forEach(m=>{
    if(!medLog[m.id]){
      items.push({
        emoji:"💊",
        title:`Take ${m.name}`,
        detail:[m.dose,m.time].filter(Boolean).join(" · "),
        route:"medication",
        kind:"Medication"
      });
    }
  });

  // House tasks due today.
  (data.houseTasks||[]).forEach(t=>{
    const frequency=(t.frequency||"").toLowerCase();
    const dueToday=
      frequency.includes("daily") ||
      frequency.includes("every other day") ||
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

  items.push({
    emoji:"🐠",
    title:"Feed both fish tanks",
    detail:"Girls tank and boys tank",
    route:"pets",
    kind:"Aquariums"
  });

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
  const items=getTodayItems();
  const tasks=(data.personalTasks||[]).filter(t=>!t.done);
  const groups={};
  items.forEach(item=>{
    groups[item.kind]=groups[item.kind]||[];
    groups[item.kind].push(item);
  });

  return shell(`${head("Today’s Tasks",niceDate())}
    <section class="card">
      <div class="stat-grid">
        <div class="stat"><strong>${items.length}</strong><span>Things for today</span></div>
        <div class="stat"><strong>${tasks.length}</strong><span>Open personal tasks</span></div>
      </div>
    </section>

    <section class="card">
      <h2>➕ Add a to-do</h2>
      <div class="form-grid">
        <input class="field" id="taskTitle" placeholder="What do you want to do?">
        <div class="two-col">
          <select class="field" id="taskEnergy">
            <option value="Low">Low energy</option>
            <option value="Medium" selected>Medium energy</option>
            <option value="High">High energy</option>
          </select>
          <input class="field" id="taskDate" type="date">
        </div>
        <input class="field" id="taskTime" type="time">
        <button class="primary" id="addPersonalTask">Add to list</button>
      </div>
      <p style="margin-bottom:0">Leave the date blank to carry the task over every day until you complete it.</p>
    </section>

    <section class="card">
      <h2>📋 My to-do list</h2>
      <div class="list-card">
        ${tasks.length?tasks.map((task,i)=>`
          <div class="item-row">
            <div>
              <h3>${esc(task.title)}</h3>
              <p>${esc(task.energy)} energy${task.date?` · ${esc(formatDate(task.date))}`:" · Carries over daily"}${task.time?` · ${esc(task.time)}`:""}</p>
            </div>
            <div class="item-actions">
              <button class="check-task" data-task-done="${task.id}">✓</button>
              <button class="mini danger" data-task-delete="${task.id}">Delete</button>
            </div>
          </div>
        `).join(""):`<p>No personal tasks yet.</p>`}
      </div>
    </section>

    ${Object.entries(groups).map(([group,groupItems])=>`
      <h3 class="room-heading">${esc(group)}</h3>
      <div class="list-card today-task-list">
        ${groupItems.map(item=>`
          <button class="item-row today-task" ${item.taskId?`data-task-open="${item.taskId}"`:`data-route="${item.route}"`}>
            <span class="today-task-icon">${item.emoji}</span>
            <span>
              <h3>${esc(item.title)}</h3>
              <p>${esc(item.detail)}</p>
            </span>
            <span class="plant-arrow">›</span>
          </button>
        `).join("")}
      </div>
    `).join("")}
  `,"today");
}

function bindToday(){
  document.querySelector("#addPersonalTask")?.addEventListener("click",()=>{
    const title=document.querySelector("#taskTitle").value.trim();
    if(!title){toast("Add a task first");return}
    data.personalTasks=data.personalTasks||[];
    data.personalTasks.push({
      id:"todo-"+Date.now(),
      title,
      energy:document.querySelector("#taskEnergy").value,
      date:document.querySelector("#taskDate").value,
      time:document.querySelector("#taskTime").value,
      done:false,
      created:today()
    });
    saveData();render();toast("Task added ✅");
  });

  document.querySelectorAll("[data-task-done]").forEach(btn=>btn.onclick=()=>{
    const task=data.personalTasks.find(t=>t.id===btn.dataset.taskDone);
    if(task){task.done=true;saveData();render();}
  });

  document.querySelectorAll("[data-task-delete]").forEach(btn=>btn.onclick=()=>{
    data.personalTasks=data.personalTasks.filter(t=>t.id!==btn.dataset.taskDelete);
    saveData();render();
  });

  document.querySelectorAll("[data-task-open]").forEach(btn=>btn.onclick=()=>{
    document.querySelector(`[data-task-done="${btn.dataset.taskOpen}"]`)?.scrollIntoView({behavior:"smooth",block:"center"});
  });
}
