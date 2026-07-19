
function normalizeTodoTask(task,index=0){
  const deadline=task?.deadline||task?.date||"";
  return {
    id:String(task?.id||`todo-${Date.now()}-${index}`),
    title:String(task?.title||task?.task||"Untitled task"),
    energy:["Low","Medium","High"].includes(task?.energy)?task.energy:"Medium",
    deadline,
    date:deadline,
    time:"",
    done:task?.done===true,
    created:task?.created||today(),
    completed:task?.completed||""
  };
}

function todoEnergyIcon(energy){
  return energy==="Low"?"🟢":energy==="High"?"🔴":"🟡";
}

function TodoPage(){
  data.personalTasks=Array.isArray(data.personalTasks)
    ? data.personalTasks.map(normalizeTodoTask)
    : [];

  const openTasks=data.personalTasks.filter(task=>!task.done);
  const completed=data.personalTasks.filter(task=>task.done);

  return shell(`${head("To-do List","Tasks carry over until you complete them")}
    <section class="card">
      <h2>➕ Add a task</h2>
      <div class="form-grid" id="todoForm">
        <input class="field" id="todoTitle" placeholder="What do you want to do?" autocomplete="off">

        <div>
          <span class="field-label">Energy needed</span>
          <div class="energy-picker" id="todoEnergyPicker">
            <button type="button" class="energy-choice" data-energy-choice="Low"><span>🟢</span><b>Low</b></button>
            <button type="button" class="energy-choice active" data-energy-choice="Medium"><span>🟡</span><b>Medium</b></button>
            <button type="button" class="energy-choice" data-energy-choice="High"><span>🔴</span><b>High</b></button>
          </div>
          <input type="hidden" id="todoEnergy" value="Medium">
        </div>

        <label class="field-label">Optional deadline
          <input class="field" id="todoDeadline" type="date">
        </label>

        <button type="button" class="primary" id="addTodo">Add to list</button>
      </div>
      <p style="margin-bottom:0">Leave the date blank and it will carry over every day until completed.</p>
    </section>

    <section class="card">
      <div class="section-title">
        <div><span class="section-kicker">✨ Your list</span><h2>Open tasks</h2></div>
        <span class="todo-count">${openTasks.length}</span>
      </div>
      <div class="list-card" id="openTodoList">
        ${openTasks.length?openTasks.map(task=>`
          <article class="item-row todo-item" data-todo-id="${esc(task.id)}">
            <div>
              <h3>${esc(task.title)}</h3>
              <p>${todoEnergyIcon(task.energy)} ${esc(task.energy)} energy${task.deadline?` · Deadline ${esc(formatDate(task.deadline))}`:" · Carries over daily"}</p>
            </div>
            <div class="item-actions">
              <button type="button" class="check-task" data-todo-done="${esc(task.id)}" aria-label="Complete ${esc(task.title)}">✓</button>
              <button type="button" class="mini danger" data-todo-delete="${esc(task.id)}">Delete</button>
            </div>
          </article>`).join(""):`<p class="empty-todo">No open tasks. ✨</p>`}
      </div>
    </section>

    ${completed.length?`<section class="card">
      <div class="section-title">
        <div><span class="section-kicker">💜 Finished</span><h2>Completed</h2></div>
        <button type="button" class="mini" id="clearCompleted">Clear all</button>
      </div>
      <div class="list-card">
        ${completed.slice().reverse().map(task=>`
          <article class="item-row completed-task">
            <div>
              <h3>${esc(task.title)}</h3>
              <p>${todoEnergyIcon(task.energy)} ${esc(task.energy)} energy${task.completed?` · Completed ${esc(formatDate(task.completed))}`:""}</p>
            </div>
            <div class="item-actions">
              <button type="button" class="mini" data-todo-undo="${esc(task.id)}">Undo</button>
              <button type="button" class="mini danger" data-todo-delete="${esc(task.id)}">Delete</button>
            </div>
          </article>`).join("")}
      </div>
    </section>`:""}
  `,"todo");
}

function bindTodo(){
  const page=document.querySelector('[data-route="todo"].active')?.closest("nav")?.previousElementSibling||document.querySelector(".shell");
  if(!page) return;

  const titleInput=page.querySelector("#todoTitle");
  const energyInput=page.querySelector("#todoEnergy");

  page.addEventListener("click",event=>{
    const energyButton=event.target.closest("[data-energy-choice]");
    if(energyButton){
      page.querySelectorAll("[data-energy-choice]").forEach(button=>button.classList.remove("active"));
      energyButton.classList.add("active");
      if(energyInput) energyInput.value=energyButton.dataset.energyChoice;
      return;
    }

    const addButton=event.target.closest("#addTodo");
    if(addButton){
      addTodoTask();
      return;
    }

    const doneButton=event.target.closest("[data-todo-done]");
    if(doneButton){
      const id=String(doneButton.dataset.todoDone);
      const task=data.personalTasks.find(item=>String(item.id)===id);
      if(task){
        task.done=true;
        task.completed=today();
        saveData();
        toast("Task completed ✨");
        render();
      }
      return;
    }

    const undoButton=event.target.closest("[data-todo-undo]");
    if(undoButton){
      const id=String(undoButton.dataset.todoUndo);
      const task=data.personalTasks.find(item=>String(item.id)===id);
      if(task){
        task.done=false;
        task.completed="";
        saveData();
        toast("Task moved back to your list");
        render();
      }
      return;
    }

    const deleteButton=event.target.closest("[data-todo-delete]");
    if(deleteButton){
      const id=String(deleteButton.dataset.todoDelete);
      data.personalTasks=data.personalTasks.filter(item=>String(item.id)!==id);
      saveData();
      toast("Task deleted");
      render();
      return;
    }

    if(event.target.closest("#clearCompleted")){
      data.personalTasks=data.personalTasks.filter(task=>!task.done);
      saveData();
      toast("Completed tasks cleared");
      render();
    }
  });

  titleInput?.addEventListener("keydown",event=>{
    if(event.key==="Enter"){
      event.preventDefault();
      addTodoTask();
    }
  });

  function addTodoTask(){
    const title=(titleInput?.value||"").trim();
    if(!title){
      toast("Add a task first");
      titleInput?.focus();
      return;
    }

    const deadline=page.querySelector("#todoDeadline")?.value||"";
    data.personalTasks=Array.isArray(data.personalTasks)?data.personalTasks:[];
    data.personalTasks.push({
      id:`todo-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      title,
      energy:energyInput?.value||"Medium",
      deadline,
      date:deadline,
      time:"",
      done:false,
      created:today(),
      completed:""
    });

    saveData();
    toast("Task added ✅");
    render();
  }
}
