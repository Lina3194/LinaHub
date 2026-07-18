
function getTodayItems(){
  const items=[];
  const weekday=new Date().toLocaleDateString("en-GB",{weekday:"long"});

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

  // House tasks not completed.
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

  // Aquarium daily item.
  items.push({
    emoji:"🐠",
    title:"Feed both fish tanks",
    detail:"Girls tank and boys tank",
    route:"pets",
    kind:"Aquariums"
  });

  // Check-in.
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
  const groups={};
  items.forEach(item=>{
    groups[item.kind]=groups[item.kind]||[];
    groups[item.kind].push(item);
  });

  return shell(`${head("Today’s Tasks",niceDate())}
    <section class="card">
      <div class="stat-grid">
        <div class="stat"><strong>${items.length}</strong><span>Things for today</span></div>
        <div class="stat"><strong>${Object.keys(groups).length}</strong><span>Categories</span></div>
      </div>
    </section>

    ${Object.entries(groups).map(([group,groupItems])=>`
      <h3 class="room-heading">${esc(group)}</h3>
      <div class="list-card today-task-list">
        ${groupItems.map(item=>`
          <button class="item-row today-task" data-route="${item.route}">
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
