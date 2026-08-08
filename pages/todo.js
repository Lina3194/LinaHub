
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

function ensureTodoView(){
  data.todoView=data.todoView||{};
  data.todoView.search=String(data.todoView.search||"");
  data.todoView.sort=["difficulty","name","added-new","added-old","deadline-soon","deadline-late"].includes(data.todoView.sort)?data.todoView.sort:"added-new";
  data.todoView.deadline=["all","overdue","today","next7","has","none","exact"].includes(data.todoView.deadline)?data.todoView.deadline:"all";
  data.todoView.deadlineDate=String(data.todoView.deadlineDate||"");
}

function todoDateValue(value){
  if(!value)return Number.POSITIVE_INFINITY;
  const stamp=new Date(`${value}T12:00:00`).getTime();
  return Number.isFinite(stamp)?stamp:Number.POSITIVE_INFINITY;
}

function todoDeadlineMatches(task,filter,dateValue){
  const deadline=task.deadline||"";
  if(filter==="all")return true;
  if(filter==="has")return !!deadline;
  if(filter==="none")return !deadline;
  if(filter==="exact")return !!dateValue&&deadline===dateValue;
  if(!deadline)return false;
  const todayDate=today();
  if(filter==="today")return deadline===todayDate;
  if(filter==="overdue")return deadline<todayDate;
  if(filter==="next7"){
    const start=new Date(`${todayDate}T12:00:00`);
    const end=new Date(start);end.setDate(end.getDate()+7);
    const d=new Date(`${deadline}T12:00:00`);
    return d>=start&&d<=end;
  }
  return true;
}

function sortTodoTasks(tasks,sort){
  const energyRank={High:0,Medium:1,Low:2};
  return tasks.slice().sort((a,b)=>{
    if(sort==="difficulty")return (energyRank[a.energy]??9)-(energyRank[b.energy]??9)||a.title.localeCompare(b.title);
    if(sort==="name")return a.title.localeCompare(b.title,undefined,{sensitivity:"base"});
    if(sort==="added-old")return String(a.created||"").localeCompare(String(b.created||""));
    if(sort==="deadline-soon")return todoDateValue(a.deadline)-todoDateValue(b.deadline)||a.title.localeCompare(b.title);
    if(sort==="deadline-late")return todoDateValue(b.deadline)-todoDateValue(a.deadline)||a.title.localeCompare(b.title);
    return String(b.created||"").localeCompare(String(a.created||""));
  });
}

function TodoPage(){
  data.personalTasks=Array.isArray(data.personalTasks)
    ? data.personalTasks.map(normalizeTodoTask)
    : [];

  ensureTodoView();
  const allOpenTasks=data.personalTasks.filter(task=>!task.done);
  const completed=data.personalTasks.filter(task=>task.done);
  const query=data.todoView.search.trim().toLowerCase();
  const filteredOpen=allOpenTasks.filter(task=>{
    const searchable=`${task.title} ${task.energy} ${task.deadline?formatDate(task.deadline):"no deadline"}`.toLowerCase();
    return (!query||searchable.includes(query))&&todoDeadlineMatches(task,data.todoView.deadline,data.todoView.deadlineDate);
  });
  const openTasks=sortTodoTasks(filteredOpen,data.todoView.sort);

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

    <section class="card todo-organiser-card">
      <div class="section-title">
        <div><span class="section-kicker">🔎 Organise</span><h2>Find & sort tasks</h2></div>
        <button type="button" class="mini" id="resetTodoFilters">Reset</button>
      </div>
      <div class="todo-search-row">
        <label class="todo-search-box"><span>Search</span><input class="field" id="todoSearch" type="search" value="${esc(data.todoView.search)}" placeholder="Search task names, difficulty or deadline…" autocomplete="off"></label>
        <label><span>Sort by</span><select class="field" id="todoSort">
          <option value="added-new" ${data.todoView.sort==="added-new"?"selected":""}>Date added · newest</option>
          <option value="added-old" ${data.todoView.sort==="added-old"?"selected":""}>Date added · oldest</option>
          <option value="difficulty" ${data.todoView.sort==="difficulty"?"selected":""}>Difficulty · High to Low</option>
          <option value="name" ${data.todoView.sort==="name"?"selected":""}>Name · A to Z</option>
          <option value="deadline-soon" ${data.todoView.sort==="deadline-soon"?"selected":""}>Deadline · soonest</option>
          <option value="deadline-late" ${data.todoView.sort==="deadline-late"?"selected":""}>Deadline · latest</option>
        </select></label>
      </div>
      <div class="todo-filter-row">
        <label><span>Deadlines</span><select class="field" id="todoDeadlineFilter">
          <option value="all" ${data.todoView.deadline==="all"?"selected":""}>All tasks</option>
          <option value="overdue" ${data.todoView.deadline==="overdue"?"selected":""}>Overdue</option>
          <option value="today" ${data.todoView.deadline==="today"?"selected":""}>Due today</option>
          <option value="next7" ${data.todoView.deadline==="next7"?"selected":""}>Due in next 7 days</option>
          <option value="has" ${data.todoView.deadline==="has"?"selected":""}>Has a deadline</option>
          <option value="none" ${data.todoView.deadline==="none"?"selected":""}>No deadline</option>
          <option value="exact" ${data.todoView.deadline==="exact"?"selected":""}>Specific date</option>
        </select></label>
        <label class="todo-exact-deadline ${data.todoView.deadline==="exact"?"":"hidden"}" id="todoExactDeadlineWrap"><span>Deadline date</span><input class="field" id="todoDeadlineSearch" type="date" value="${esc(data.todoView.deadlineDate)}"></label>
      </div>
      <p class="todo-results-copy">Showing <strong>${openTasks.length}</strong> of ${allOpenTasks.length} open tasks.</p>
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
              <p>${todoEnergyIcon(task.energy)} ${esc(task.energy)} energy${task.deadline?` · Deadline ${esc(formatDate(task.deadline))}`:" · No deadline"}${task.created?` · Added ${esc(formatDate(task.created))}`:""}</p>
            </div>
            <div class="item-actions">
              <button type="button" class="check-task" data-todo-done="${esc(task.id)}" aria-label="Complete ${esc(task.title)}">✓</button>
              <button type="button" class="mini danger" data-todo-delete="${esc(task.id)}">Delete</button>
            </div>
          </article>`).join(""):`<p class="empty-todo">${allOpenTasks.length?"No tasks match those filters.":"No open tasks. ✨"}</p>`}
      </div>
    </section>

    ${completed.length?`<details class="card completed-tasks-panel">
      <summary class="completed-tasks-summary">
        <span><span class="section-kicker">💜 Finished</span><strong>Completed tasks</strong><small>${completed.length} hidden</small></span>
        <b class="completed-chevron">⌄</b>
      </summary>
      <div class="completed-tasks-content">
        <div class="completed-actions"><button type="button" class="mini" id="clearCompleted">Clear all</button></div>
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
      </div>
    </details>`:""}
  `,"todo");
}

function bindTodo(){
  const page=document.querySelector('[data-route="todo"].active')?.closest("nav")?.previousElementSibling||document.querySelector(".shell");
  if(!page) return;

  const titleInput=page.querySelector("#todoTitle");
  const energyInput=page.querySelector("#todoEnergy");
  const searchInput=page.querySelector("#todoSearch");
  const rerenderTodoControls=(focusId="")=>{
    saveData();render();
    if(focusId)requestAnimationFrame(()=>{const el=document.querySelector(`#${focusId}`);if(el){el.focus();if("selectionStart" in el){const len=el.value.length;el.setSelectionRange(len,len)}}});
  };
  searchInput?.addEventListener("input",()=>{data.todoView.search=searchInput.value;rerenderTodoControls("todoSearch")});
  page.querySelector("#todoSort")?.addEventListener("change",event=>{data.todoView.sort=event.target.value;rerenderTodoControls()});
  page.querySelector("#todoDeadlineFilter")?.addEventListener("change",event=>{data.todoView.deadline=event.target.value;rerenderTodoControls(event.target.value==="exact"?"todoDeadlineSearch":"")});
  page.querySelector("#todoDeadlineSearch")?.addEventListener("change",event=>{data.todoView.deadlineDate=event.target.value;data.todoView.deadline="exact";rerenderTodoControls()});
  page.querySelector("#resetTodoFilters")?.addEventListener("click",()=>{data.todoView={search:"",sort:"added-new",deadline:"all",deadlineDate:""};rerenderTodoControls()});

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
