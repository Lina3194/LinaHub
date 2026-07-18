
function TodoPage(){
  const openTasks=(data.personalTasks||[]).filter(task=>!task.done);
  const completed=(data.personalTasks||[]).filter(task=>task.done);
  return shell(`${head("To-do List","Tasks carry over until you complete them")}
    <section class="card">
      <h2>➕ Add a task</h2>
      <div class="form-grid">
        <input class="field" id="todoTitle" placeholder="What do you want to do?">
        <label class="field-label">Energy needed
          <select class="field" id="todoEnergy">
            <option value="Low">Low energy</option>
            <option value="Medium" selected>Medium energy</option>
            <option value="High">High energy</option>
          </select>
        </label>
        <label class="field-label">Deadline
          <input class="field" id="todoDeadline" type="datetime-local">
        </label>
        <button class="primary" id="addTodo">Add to list</button>
      </div>
      <p style="margin-bottom:0">Leave the date blank and it will carry over every day until completed.</p>
    </section>
    <section class="card">
      <div class="list-card">
        ${openTasks.length?openTasks.map(task=>`
          <div class="item-row">
            <div><h3>${esc(task.title)}</h3><p>${esc(task.energy)} energy${task.date?` · Deadline ${esc(formatDate(task.date))}`:" · Carries over daily"}${task.time?` at ${esc(task.time)}`:""}</p></div>
            <div class="item-actions"><button class="check-task" data-todo-done="${task.id}">✓</button><button class="mini danger" data-todo-delete="${task.id}">Delete</button></div>
          </div>`).join(""):`<p>No open tasks. ✨</p>`}
      </div>
    </section>
    ${completed.length?`<section class="card"><h2>Completed</h2><div class="list-card">
      ${completed.slice().reverse().map(task=>`<div class="item-row completed-task"><div><h3>${esc(task.title)}</h3><p>${esc(task.energy)} energy</p></div><button class="mini danger" data-todo-delete="${task.id}">Delete</button></div>`).join("")}
    </div></section>`:""}
  `,"todo");
}
function bindTodo(){
  document.querySelector("#addTodo")?.addEventListener("click",()=>{
    const title=document.querySelector("#todoTitle").value.trim();
    if(!title){toast("Add a task first");return}
    data.personalTasks=data.personalTasks||[];
    data.personalTasks.push({id:"todo-"+Date.now(),title,energy:document.querySelector("#todoEnergy").value,deadline:document.querySelector("#todoDeadline").value,
      date:document.querySelector("#todoDeadline").value?document.querySelector("#todoDeadline").value.slice(0,10):"",
      time:document.querySelector("#todoDeadline").value?document.querySelector("#todoDeadline").value.slice(11,16):"",done:false,created:today()});
    saveData();render();toast("Task added ✅");
  });
  document.querySelectorAll("[data-todo-done]").forEach(btn=>btn.onclick=()=>{
    const task=data.personalTasks.find(t=>t.id===btn.dataset.todoDone);
    if(task){task.done=true;task.completed=today();saveData();render();}
  });
  document.querySelectorAll("[data-todo-delete]").forEach(btn=>btn.onclick=()=>{
    data.personalTasks=data.personalTasks.filter(t=>t.id!==btn.dataset.todoDelete);saveData();render();
  });
}
