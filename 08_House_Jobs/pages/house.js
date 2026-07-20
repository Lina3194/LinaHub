
const DEFAULT_HOUSE_ROOMS=[
  {id:"living-room",name:"Living Room",icon:"🛋️"},
  {id:"kitchen",name:"Kitchen",icon:"🍳"},
  {id:"downstairs-wc",name:"Downstairs WC",icon:"🚽"},
  {id:"garden-patio",name:"Garden / Patio",icon:"🌿"},
  {id:"main-bedroom",name:"Main Bedroom",icon:"🛏️"},
  {id:"main-bathroom",name:"Main Bathroom",icon:"🛁"},
  {id:"study-guest-room",name:"Study / Guest Room",icon:"💻"},
  {id:"whole-house",name:"Whole House",icon:"🏠"}
];

const HOUSE_FREQUENCIES=[
  "Daily","Every other day","Every week on selected days","Weekly","Fortnightly","Monthly","Seasonally","As needed"
];

const HOUSE_WEEKDAYS=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

function houseWeekdayPicker(selected=[],prefix="house"){
  const chosen=Array.isArray(selected)?selected:[];
  return `<div class="house-weekdays" id="${prefix}Weekdays">${HOUSE_WEEKDAYS.map(day=>`<label><input type="checkbox" value="${day}" ${chosen.includes(day)?"checked":""}><span>${day}</span></label>`).join("")}</div>`;
}

function houseScheduleLabel(task){
  if(["Specific weekdays","Every week on selected days"].includes(task.frequency)&&task.weekdays?.length) return `Every ${task.weekdays.join(", ")}`;
  return task.frequency;
}

function normalizeHouseTask(task,index=0){
  return {
    id:String(task?.id||`house-${Date.now()}-${index}`),
    task:String(task?.task||task?.title||"Untitled job"),
    room:String(task?.room||"Whole House"),
    frequency:String(task?.frequency||"As needed"),
    weekdays:Array.isArray(task?.weekdays)?task.weekdays.filter(day=>HOUSE_WEEKDAYS.includes(day)):[],
    energy:["Low","Medium","High"].includes(task?.energy)?task.energy:"Medium",
    priority:[1,2,3].includes(Number(task?.priority))?Number(task.priority):1,
    done:task?.done===true
  };
}

function normalizeHouseRoom(room,index=0){
  if(typeof room==="string"){
    return {
      id:room.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||`room-${index}`,
      name:room,
      icon:"🏡"
    };
  }
  return {
    id:String(room?.id||`room-${Date.now()}-${index}`),
    name:String(room?.name||"Room"),
    icon:String(room?.icon||"🏡")
  };
}

function ensureHouseRooms(){
  data.houseTasks=(Array.isArray(data.houseTasks)?data.houseTasks:[]).map(normalizeHouseTask);
  data.houseRooms=(Array.isArray(data.houseRooms)&&data.houseRooms.length?data.houseRooms:DEFAULT_HOUSE_ROOMS)
    .map(normalizeHouseRoom);

  // Split the old combined room once, without losing any existing jobs.
  const combined=data.houseRooms.find(room=>room.name==="Living Room / Kitchen");
  if(combined){
    data.houseRooms=data.houseRooms.filter(room=>room.id!==combined.id);
    if(!data.houseRooms.some(room=>room.name==="Living Room")){
      data.houseRooms.unshift({id:"living-room",name:"Living Room",icon:"🛋️"});
    }
    if(!data.houseRooms.some(room=>room.name==="Kitchen")){
      data.houseRooms.splice(1,0,{id:"kitchen",name:"Kitchen",icon:"🍳"});
    }

    data.houseTasks.forEach(task=>{
      if(task.room!=="Living Room / Kitchen") return;
      const kitchenWords=/oven|hob|fridge|freezer|dish|sink|counter|worktop|kitchen|laundry|washing|bin/i;
      task.room=kitchenWords.test(task.task)?"Kitchen":"Living Room";
    });
  }

  // Keep rooms for any older/custom jobs.
  data.houseTasks.forEach(task=>{
    if(!data.houseRooms.some(room=>room.name===task.room)){
      data.houseRooms.push({
        id:`room-${task.room.toLowerCase().replace(/[^a-z0-9]+/g,"-")||Date.now()}`,
        name:task.room,
        icon:"🏡"
      });
    }
  });

  if(!data.houseRooms.some(room=>room.name==="Whole House")){
    data.houseRooms.push({id:"whole-house",name:"Whole House",icon:"🏠"});
  }

  if(typeof data.houseControlsCollapsed!=="boolean") data.houseControlsCollapsed=true;
  if(!Array.isArray(data.houseOpenRooms)) data.houseOpenRooms=[];
}

function houseRoomOptions(selected=""){
  return data.houseRooms.map(room=>`
    <option value="${esc(room.name)}" ${room.name===selected?"selected":""}>
      ${esc(room.icon)} ${esc(room.name)}
    </option>`).join("");
}

function frequencyOptions(selected="As needed"){
  const options=[...new Set([...HOUSE_FREQUENCIES,selected].filter(Boolean))];
  return options.map(value=>`<option value="${esc(value)}" ${value===selected?"selected":""}>${esc(value)}</option>`).join("");
}

function energyPicker(selected="Medium",prefix="house"){
  return `<div class="energy-picker">
    ${[["Low","🟢"],["Medium","🟡"],["High","🔴"]].map(([value,icon])=>`
      <button type="button" class="energy-choice ${selected===value?"active":""}" data-house-energy="${value}" data-energy-group="${prefix}">
        <span>${icon}</span><b>${value}</b>
      </button>`).join("")}
  </div><input type="hidden" id="${prefix}Energy" value="${esc(selected)}">`;
}

function priorityPicker(selected=1,prefix="house"){
  return `<div class="priority-picker">
    ${[1,2,3].map(value=>`
      <button type="button" class="priority-choice ${Number(selected)===value?"active":""}" data-house-priority="${value}" data-priority-group="${prefix}">
        ${"⭐".repeat(value)}
      </button>`).join("")}
  </div><input type="hidden" id="${prefix}Priority" value="${Number(selected)||1}">`;
}

function HousePage(){
  ensureHouseRooms();

  const tasks=data.houseTasks;
  const doneCount=tasks.filter(task=>task.done).length;
  const remainingCount=tasks.length-doneCount;

  return shell(`${head("House","Rooms and recurring jobs")}

    <section class="card house-manage-card">
      <button type="button" class="collapse-title" id="toggleHouseControls">
        <span>
          <h2>🏡 Manage rooms</h2>
          <p style="margin:4px 0">${data.houseControlsCollapsed?"Tap to add or delete rooms":"Add rooms or remove ones you no longer need."}</p>
        </span>
        <b>${data.houseControlsCollapsed?"⌄":"⌃"}</b>
      </button>

      ${data.houseControlsCollapsed?"":`
        <div class="house-room-manager">
          <div class="form-grid">
            <div class="two-col">
              <input class="field home-icon-input" id="newRoomIcon" maxlength="4" value="🏡" aria-label="Room icon">
              <input class="field" id="newRoomName" placeholder="Room name">
            </div>
            <button type="button" class="primary" id="addHouseRoom">Add room</button>
          </div>

          <div class="manage-room-list">
            ${data.houseRooms.map(room=>`
              <div class="manage-room-row">
                <span>${esc(room.icon)} ${esc(room.name)}</span>
                <button type="button" class="mini danger" data-delete-room="${esc(room.id)}" ${room.name==="Whole House"?"disabled":""}>Delete</button>
              </div>
            `).join("")}
          </div>
          <p class="helper-text">Deleting a room moves its jobs to Whole House.</p>
        </div>
      `}
    </section>

    <section class="card">
      <div class="stat-grid">
        <div class="stat"><strong>${doneCount}</strong><span>Done</span></div>
        <div class="stat"><strong>${remainingCount}</strong><span>Remaining</span></div>
      </div>
    </section>

    <section class="card">
      <h2>➕ Add a house job</h2>
      <div class="form-grid">
        <input class="field" id="houseTask" placeholder="Job">

        <label class="field-label">Room
          <select class="field" id="houseRoom">${houseRoomOptions("Kitchen")}</select>
        </label>

        <label class="field-label">Frequency
          <select class="field" id="houseFrequency">${frequencyOptions("Every week on selected days")}</select>
        </label>
        <div id="houseWeekdayWrap" class="hidden">
          <span class="field-label">Repeat on</span>
          ${houseWeekdayPicker([],"addHouse")}
        </div>

        <div>
          <span class="field-label">Energy</span>
          ${energyPicker("Medium","addHouse")}
        </div>

        <div>
          <span class="field-label">Priority</span>
          ${priorityPicker(1,"addHouse")}
        </div>

        <button type="button" class="primary" id="addHouseTask">Add job</button>
      </div>
    </section>

    <section class="house-room-grid">
      ${data.houseRooms.map(room=>{
        const roomTasks=tasks.filter(task=>task.room===room.name);
        const isOpen=data.houseOpenRooms.includes(room.id);
        return `
          <article class="house-room-card ${isOpen?"open":""}">
            <button type="button" class="house-room-tile" data-toggle-room="${esc(room.id)}">
              <span class="house-room-icon">${esc(room.icon)}</span>
              <span class="house-room-copy">
                <strong>${esc(room.name)}</strong>
                <small>${roomTasks.length} ${roomTasks.length===1?"job":"jobs"} · ${roomTasks.filter(task=>!task.done).length} remaining</small>
              </span>
              <span class="house-room-arrow">${isOpen?"⌃":"⌄"}</span>
            </button>

            ${isOpen?`<div class="house-room-jobs">
              ${roomTasks.length?roomTasks.map(task=>`
                <article class="item-row house-job ${task.done?"completed-task":""}">
                  <div>
                    <h3>${esc(task.task)}</h3>
                    <p>${task.energy==="Low"?"🟢":task.energy==="High"?"🔴":"🟡"} ${esc(task.energy)} · ${"⭐".repeat(task.priority)} · ${esc(houseScheduleLabel(task))}</p>
                  </div>
                  <div class="item-actions">
                    <button type="button" class="check-task ${task.done?"done":""}" data-house-done="${esc(task.id)}">✓</button>
                    <button type="button" class="mini" data-house-edit="${esc(task.id)}">Edit</button>
                    <button type="button" class="mini danger" data-house-delete="${esc(task.id)}">Delete</button>
                  </div>
                </article>
              `).join(""):`<p class="empty-room">No jobs in this room yet.</p>`}
            </div>`:""}
          </article>
        `;
      }).join("")}
    </section>

    <div id="houseEditModal"></div>
  `,"house");
}

function bindHouse(){
  const page=document.querySelector(".shell");
  if(!page) return;

  page.querySelector("#houseFrequency")?.addEventListener("change",e=>{
    page.querySelector("#houseWeekdayWrap")?.classList.toggle("hidden",!["Specific weekdays","Every week on selected days"].includes(e.target.value));
  });

  page.addEventListener("click",event=>{
    if(event.target.closest("#toggleHouseControls")){
      data.houseControlsCollapsed=!data.houseControlsCollapsed;
      saveData();
      render();
      return;
    }

    if(event.target.closest("#addHouseRoom")){
      const name=(page.querySelector("#newRoomName")?.value||"").trim();
      const icon=(page.querySelector("#newRoomIcon")?.value||"🏡").trim()||"🏡";
      if(!name){
        toast("Add a room name");
        page.querySelector("#newRoomName")?.focus();
        return;
      }
      if(data.houseRooms.some(room=>room.name.toLowerCase()===name.toLowerCase())){
        toast("That room already exists");
        return;
      }
      data.houseRooms.push({
        id:`room-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
        name,
        icon
      });
      saveData();
      toast("Room added 🏡");
      render();
      return;
    }

    const deleteRoomButton=event.target.closest("[data-delete-room]");
    if(deleteRoomButton){
      const room=data.houseRooms.find(item=>item.id===deleteRoomButton.dataset.deleteRoom);
      if(!room||room.name==="Whole House") return;
      data.houseTasks.forEach(task=>{
        if(task.room===room.name) task.room="Whole House";
      });
      data.houseRooms=data.houseRooms.filter(item=>item.id!==room.id);
      data.houseOpenRooms=data.houseOpenRooms.filter(id=>id!==room.id);
      saveData();
      toast(`${room.name} deleted; its jobs moved to Whole House`);
      render();
      return;
    }

    const roomToggle=event.target.closest("[data-toggle-room]");
    if(roomToggle){
      const id=roomToggle.dataset.toggleRoom;
      data.houseOpenRooms=data.houseOpenRooms.includes(id)
        ? data.houseOpenRooms.filter(roomId=>roomId!==id)
        : [...data.houseOpenRooms,id];
      saveData();
      render();
      return;
    }

    const energyButton=event.target.closest("[data-house-energy]");
    if(energyButton){
      const group=energyButton.dataset.energyGroup;
      page.querySelectorAll(`[data-energy-group="${group}"]`).forEach(button=>button.classList.remove("active"));
      energyButton.classList.add("active");
      const hidden=document.querySelector(`#${group}Energy`);
      if(hidden) hidden.value=energyButton.dataset.houseEnergy;
      return;
    }

    const priorityButton=event.target.closest("[data-house-priority]");
    if(priorityButton){
      const group=priorityButton.dataset.priorityGroup;
      page.querySelectorAll(`[data-priority-group="${group}"]`).forEach(button=>button.classList.remove("active"));
      priorityButton.classList.add("active");
      const hidden=document.querySelector(`#${group}Priority`);
      if(hidden) hidden.value=priorityButton.dataset.housePriority;
      return;
    }

    if(event.target.closest("#addHouseTask")){
      const taskInput=page.querySelector("#houseTask");
      const task=(taskInput?.value||"").trim();
      if(!task){
        toast("Add a job");
        taskInput?.focus();
        return;
      }

      const frequency=page.querySelector("#houseFrequency")?.value||"Weekly";
      const weekdays=[...page.querySelectorAll("#addHouseWeekdays input:checked")].map(input=>input.value);
      if(["Specific weekdays","Every week on selected days"].includes(frequency)&&!weekdays.length){toast("Choose at least one weekday");return;}

      data.houseTasks.push({
        id:`house-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
        task,
        room:page.querySelector("#houseRoom")?.value||"Whole House",
        frequency,
        weekdays,
        energy:page.querySelector("#addHouseEnergy")?.value||"Medium",
        priority:Number(page.querySelector("#addHousePriority")?.value)||1,
        done:false
      });
      saveData();
      toast("House job added 🏡");
      render();
      return;
    }

    const doneButton=event.target.closest("[data-house-done]");
    if(doneButton){
      const task=data.houseTasks.find(item=>String(item.id)===String(doneButton.dataset.houseDone));
      if(task){
        task.done=!task.done;
        saveData();
        render();
      }
      return;
    }

    const editButton=event.target.closest("[data-house-edit]");
    if(editButton){
      openHouseEditor(String(editButton.dataset.houseEdit));
      return;
    }

    const deleteButton=event.target.closest("[data-house-delete]");
    if(deleteButton){
      const id=String(deleteButton.dataset.houseDelete);
      data.houseTasks=data.houseTasks.filter(item=>String(item.id)!==id);
      saveData();
      toast("House job deleted");
      render();
      return;
    }

    if(event.target.closest("[data-close-house-editor]")||event.target.id==="houseEditorBackdrop"){
      closeHouseEditor();
      return;
    }

    if(event.target.closest("#saveHouseEdit")){
      saveHouseEditor();
    }
  });
}

function openHouseEditor(id){
  const task=data.houseTasks.find(item=>String(item.id)===String(id));
  const host=document.querySelector("#houseEditModal");
  if(!task||!host) return;

  host.innerHTML=`
    <div class="house-editor-backdrop" id="houseEditorBackdrop">
      <section class="house-editor-card" role="dialog" aria-modal="true">
        <button type="button" class="house-editor-close" data-close-house-editor>×</button>
        <span class="section-kicker">🏡 House job</span>
        <h2>Edit job</h2>

        <div class="form-grid">
          <label class="field-label">Job
            <input class="field" id="editHouseTask" value="${esc(task.task)}">
          </label>

          <label class="field-label">Room
            <select class="field" id="editHouseRoom">${houseRoomOptions(task.room)}</select>
          </label>

          <label class="field-label">Frequency
            <select class="field" id="editHouseFrequency">${frequencyOptions(task.frequency)}</select>
          </label>
          <div id="editHouseWeekdayWrap" class="${["Specific weekdays","Every week on selected days"].includes(task.frequency)?"":"hidden"}">
            <span class="field-label">Repeat on</span>
            ${houseWeekdayPicker(task.weekdays,"editHouse")}
          </div>

          <div><span class="field-label">Energy</span>${energyPicker(task.energy,"editHouse")}</div>
          <div><span class="field-label">Priority</span>${priorityPicker(task.priority,"editHouse")}</div>

          <input type="hidden" id="editHouseId" value="${esc(task.id)}">
          <button type="button" class="primary" id="saveHouseEdit">Save changes</button>
          <button type="button" class="secondary" data-close-house-editor>Cancel</button>
        </div>
      </section>
    </div>
  `;
  document.querySelector("#editHouseFrequency")?.addEventListener("change",e=>{
    document.querySelector("#editHouseWeekdayWrap")?.classList.toggle("hidden",!["Specific weekdays","Every week on selected days"].includes(e.target.value));
  });
}

function closeHouseEditor(){
  const host=document.querySelector("#houseEditModal");
  if(host) host.innerHTML="";
}

function saveHouseEditor(){
  const id=document.querySelector("#editHouseId")?.value||"";
  const task=data.houseTasks.find(item=>String(item.id)===String(id));
  if(!task) return;

  const name=(document.querySelector("#editHouseTask")?.value||"").trim();
  if(!name){
    toast("The job needs a name");
    return;
  }

  task.task=name;
  task.room=document.querySelector("#editHouseRoom")?.value||"Whole House";
  task.frequency=document.querySelector("#editHouseFrequency")?.value||"As needed";
  task.weekdays=[...document.querySelectorAll("#editHouseWeekdays input:checked")].map(input=>input.value);
  if(["Specific weekdays","Every week on selected days"].includes(task.frequency)&&!task.weekdays.length){toast("Choose at least one weekday");return;}
  if(!["Specific weekdays","Every week on selected days"].includes(task.frequency)) task.weekdays=[];
  task.energy=document.querySelector("#editHouseEnergy")?.value||"Medium";
  task.priority=Number(document.querySelector("#editHousePriority")?.value)||1;

  saveData();
  toast("Job updated 🏡");
  render();
}
