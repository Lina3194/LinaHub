
const HOUSE_ROOMS=[
  "Living Room / Kitchen",
  "Downstairs WC",
  "Garden / Patio",
  "Main Bedroom",
  "Main Bathroom",
  "Study / Guest Room",
  "Whole House"
];

function normalizeHouseTask(task,index=0){
  return {
    id:String(task?.id||`house-${Date.now()}-${index}`),
    task:String(task?.task||task?.title||"Untitled job"),
    room:String(task?.room||"Whole House"),
    frequency:String(task?.frequency||"As needed"),
    done:task?.done===true
  };
}

function houseRoomOptions(selected=""){
  const rooms=[...new Set([...HOUSE_ROOMS,...(data.houseTasks||[]).map(task=>task.room).filter(Boolean)])];
  return rooms.map(room=>`<option value="${esc(room)}" ${room===selected?"selected":""}>${esc(room)}</option>`).join("");
}

function HousePage(){
  data.houseTasks=Array.isArray(data.houseTasks)
    ? data.houseTasks.map(normalizeHouseTask)
    : [];

  const tasks=data.houseTasks;
  const rooms=[...new Set([...HOUSE_ROOMS,...tasks.map(task=>task.room).filter(Boolean)])]
    .filter(room=>tasks.some(task=>task.room===room));

  return shell(`${head("House","Rooms and recurring jobs")}
    <section class="card">
      <div class="stat-grid">
        <div class="stat"><strong>${tasks.filter(task=>task.done).length}</strong><span>Done</span></div>
        <div class="stat"><strong>${tasks.filter(task=>!task.done).length}</strong><span>Remaining</span></div>
      </div>
    </section>

    <section class="card">
      <h2>Add house job</h2>
      <div class="form-grid">
        <input class="field" id="houseTask" placeholder="Job">
        <div class="two-col">
          <select class="field" id="houseRoom">
            ${houseRoomOptions("Whole House")}
          </select>
          <input class="field" id="houseFrequency" placeholder="Frequency" value="As needed">
        </div>
        <button type="button" class="primary" id="addHouseTask">Add job</button>
      </div>
    </section>

    ${rooms.length?rooms.map(room=>`
      <section class="house-room-section">
        <h3 class="room-heading">${esc(room)}</h3>
        <div class="list-card">
          ${tasks.filter(task=>task.room===room).map(task=>`
            <article class="item-row house-job ${task.done?"completed-task":""}">
              <div>
                <h3>${esc(task.task)}</h3>
                <p>${esc(task.frequency)}</p>
              </div>
              <div class="item-actions">
                <button type="button" class="check-task ${task.done?"done":""}" data-house-done="${esc(task.id)}" aria-label="Mark complete">✓</button>
                <button type="button" class="mini" data-house-edit="${esc(task.id)}">Edit</button>
                <button type="button" class="mini danger" data-house-delete="${esc(task.id)}">Delete</button>
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `).join(""):`<section class="card"><p>No house jobs yet.</p></section>`}

    <div id="houseEditModal"></div>
  `,"house");
}

function bindHouse(){
  const page=document.querySelector(".shell");
  if(!page) return;

  page.addEventListener("click",event=>{
    if(event.target.closest("#addHouseTask")){
      const taskInput=page.querySelector("#houseTask");
      const task=(taskInput?.value||"").trim();
      if(!task){
        toast("Add a job");
        taskInput?.focus();
        return;
      }

      data.houseTasks=Array.isArray(data.houseTasks)?data.houseTasks:[];
      data.houseTasks.push({
        id:`house-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
        task,
        room:page.querySelector("#houseRoom")?.value||"Whole House",
        frequency:(page.querySelector("#houseFrequency")?.value||"").trim()||"As needed",
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

    if(event.target.closest("[data-close-house-editor]")){
      closeHouseEditor();
      return;
    }

    if(event.target.id==="houseEditorBackdrop"){
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
      <section class="house-editor-card" role="dialog" aria-modal="true" aria-labelledby="houseEditorTitle">
        <button type="button" class="house-editor-close" data-close-house-editor aria-label="Close">×</button>
        <span class="section-kicker">🏡 House job</span>
        <h2 id="houseEditorTitle">Edit job</h2>

        <div class="form-grid">
          <label class="field-label">Job
            <input class="field" id="editHouseTask" value="${esc(task.task)}">
          </label>

          <label class="field-label">Move to room
            <select class="field" id="editHouseRoom">
              ${houseRoomOptions(task.room)}
            </select>
          </label>

          <label class="field-label">Frequency
            <input class="field" id="editHouseFrequency" value="${esc(task.frequency)}">
          </label>

          <input type="hidden" id="editHouseId" value="${esc(task.id)}">

          <button type="button" class="primary" id="saveHouseEdit">Save changes</button>
          <button type="button" class="secondary" data-close-house-editor>Cancel</button>
        </div>
      </section>
    </div>
  `;

  setTimeout(()=>document.querySelector("#editHouseTask")?.focus(),0);
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
    document.querySelector("#editHouseTask")?.focus();
    return;
  }

  task.task=name;
  task.room=document.querySelector("#editHouseRoom")?.value||"Whole House";
  task.frequency=(document.querySelector("#editHouseFrequency")?.value||"").trim()||"As needed";

  saveData();
  toast("Job updated and moved 🏡");
  render();
}
