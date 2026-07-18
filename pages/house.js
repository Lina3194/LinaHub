
function HousePage(){
 const tasks=data.houseTasks||[],rooms=[...new Set(tasks.map(x=>x.room))];
 return shell(`${head("House","Rooms and recurring tasks")}
 <section class="card"><div class="stat-grid"><div class="stat"><strong>${tasks.filter(x=>x.done).length}</strong><span>Done</span></div><div class="stat"><strong>${tasks.filter(x=>!x.done).length}</strong><span>Remaining</span></div></div></section>
 <section class="card"><h2>Add house task</h2><div class="form-grid"><input class="field" id="houseTask" placeholder="Task"><div class="two-col"><input class="field" id="houseRoom" placeholder="Room"><input class="field" id="houseFrequency" placeholder="Frequency"></div><button class="primary" id="addHouseTask">Add task</button></div></section>
 ${rooms.map(room=>`<h3 class="room-heading">${esc(room)}</h3><div class="list-card">${tasks.map((t,i)=>({t,i})).filter(x=>x.t.room===room).map(({t,i})=>`<div class="item-row"><div><h3>${esc(t.task)}</h3><p>${esc(t.frequency)}</p></div><div class="item-actions"><button class="check-task ${t.done?"done":""}" data-house-done="${i}">✓</button><button class="mini danger" data-house-delete="${i}">Delete</button></div></div>`).join("")}</div>`).join("")}`,"house");
}
function bindHouse(){
 document.querySelector("#addHouseTask")?.addEventListener("click",()=>{const task=document.querySelector("#houseTask").value.trim();if(!task){toast("Add a task");return}data.houseTasks.push({id:"task-"+Date.now(),task,room:document.querySelector("#houseRoom").value.trim()||"Whole House",frequency:document.querySelector("#houseFrequency").value.trim()||"As needed",done:false});saveData();render()});
 document.querySelectorAll("[data-house-done]").forEach(b=>b.onclick=()=>{const t=data.houseTasks[+b.dataset.houseDone];t.done=!t.done;saveData();render()});
 document.querySelectorAll("[data-house-delete]").forEach(b=>b.onclick=()=>{data.houseTasks.splice(+b.dataset.houseDelete,1);saveData();render()});
}
