
const SCALE_OPTIONS={
  energy:[["🥵","Very low"],["😟","Low"],["😐","Okay"],["😊","Good"],["🤩","Amazing"]],
  mood:[["😭","Overwhelmed"],["😟","Anxious"],["😐","Okay"],["🙂","Calm"],["😊","Happy"]],
  pain:[["😭","Very severe"],["😣","Severe"],["😐","Moderate"],["🙂","Mild"],["😌","No pain"]],
  sleep:[["😫","Awful"],["😟","Restless"],["😐","Okay"],["😊","Good"],["🤩","Amazing"]]
};

function renderScale(name,value){
  return `<div class="scale">${SCALE_OPTIONS[name].map((x,i)=>`
    <button data-scale="${name}" data-value="${i}" class="${value!==null&&value!==undefined&&Number(value)===i?"active":""}">
      <span class="face">${x[0]}</span><small>${x[1]}</small>
    </button>`).join("")}</div>`;
}

function JournalPage(){
  const entry=data.checkins[today()]||{
    energy:null,mood:null,pain:null,sleep:null,spoons:0,water:0,selfCare:[],meds:[],
    priorities:["","","","",""],plan:Array.from({length:4},()=>({task:"",energy:"Medium",done:false})),
    supports:["","","",""],justToday:["","",""]
  };
  const care=["Rest","Reading","Exercises","Warmth","Good food","Fresh air","Music","Gaming","Hobbies"];
  const todaysTasks=(data.personalTasks||[]).filter(t=>!t.done && (!t.date || t.date<=today()));

  const blocks={
    energy:`<section class="card draggable" data-block="energy" data-group="emoji"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="energy">👁️</button><h2>⚡ Today’s energy</h2>${renderScale("energy",entry.energy)}</section>`,
    mood:`<section class="card draggable" data-block="mood" data-group="emoji"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="mood">👁️</button><h2>💜 Today’s mood</h2>${renderScale("mood",entry.mood)}</section>`,
    pain:`<section class="card draggable" data-block="pain" data-group="emoji"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="pain">👁️</button><h2>☀️ Today’s pain</h2>${renderScale("pain",entry.pain)}</section>`,
    spoons:`<section class="card draggable" data-block="spoons" data-group="wellness"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="spoons">👁️</button><h2>🥄 Spoon bank</h2><p>Tap a spoon as you use energy.</p><div class="tokens">${Array.from({length:12},(_,i)=>`<button class="token ${i<entry.spoons?"active":""}" data-token="spoons" data-value="${i+1}">🥄</button>`).join("")}</div></section>`,
    water:`<section class="card draggable" data-block="water" data-group="wellness"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="water">👁️</button><h2>💧 Water intake</h2><div class="tokens">${Array.from({length:10},(_,i)=>`<button class="token ${i<entry.water?"active":""}" data-token="water" data-value="${i+1}">💧</button>`).join("")}</div></section>`,
    priorities:`<section class="card draggable" data-block="priorities" data-group="planning"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="priorities">👁️</button><h2>📌 Today’s priorities</h2>${entry.priorities.map((v,i)=>`<label class="row"><span class="row-num">${i+1}.</span><input class="field priority" value="${esc(v)}"></label>`).join("")}</section>`,
    selfcare:`<section class="card draggable" data-block="selfcare" data-group="wellness"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="selfcare">👁️</button><h2>🌸 Self-care menu</h2><div class="pills">${care.map(x=>`<button class="pill ${entry.selfCare.includes(x)?"active":""}" data-care="${x}">${x}</button>`).join("")}</div></section>`,
    plan:`<section class="card draggable" data-block="plan" data-group="planning"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="plan">👁️</button><h2>🗓️ Today’s plan</h2>${todaysTasks.length?todaysTasks.map(task=>`<div class="item-row journal-task-row"><div><h3>${esc(task.title)}</h3><p>${esc(task.energy)} energy${task.time?` · Due ${esc(task.time)}`:""}</p></div><button class="check-task" data-journal-task-done="${task.id}">✓</button></div>`).join(""):`<p>No tasks due today. Add them from the Today tab.</p>`}</section>`,
    sleep:`<section class="card draggable" data-block="sleep" data-group="emoji"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="sleep">👁️</button><h2>😴 Sleep last night</h2>${renderScale("sleep",entry.sleep)}</section>`,
    supports:`<section class="card draggable" data-block="supports" data-group="planning"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="supports">👁️</button><h2>🦴 Braces / supports used</h2>${entry.supports.map(v=>`<input class="field support" style="margin-top:9px" value="${esc(v)}" placeholder="e.g. knee brace">`).join("")}</section>`
  };

  const order=(data.checkinLayout||Object.keys(blocks)).filter(k=>blocks[k] && !["medication","justtoday"].includes(k));
  const rendered=order.map(k=>{
    const hidden=(data.checkinHidden||[]).includes(k);
    return blocks[k].replace('class="card draggable"',`class="card draggable ${hidden?"soft-hidden":""}"`);
  }).join("");

  return shell(`${head("Today’s Check-in",niceDate())}
    <section class="card filter-card">
      <div class="layout-toolbar">
        <div><h2>Journal view</h2><p style="margin:4px 0">Choose what you want to see today.</p></div>
        <button class="magic-edit ${data.checkinEditMode?"active":""}" id="toggleEditMode">${data.checkinEditMode?"✓ Done":"🪄 Edit layout"}</button>
      </div>
      <div class="pills">
        <button class="pill ${data.checkinFilter==="all"?"active":""}" data-filter="all">Everything</button>
        <button class="pill ${data.checkinFilter==="emoji"?"active":""}" data-filter="emoji">Emoji check-ins</button>
        <button class="pill ${data.checkinFilter==="planning"?"active":""}" data-filter="planning">To-do & planning</button>
        <button class="pill ${data.checkinFilter==="wellness"?"active":""}" data-filter="wellness">Wellness</button>
      </div>
    </section>
    <div class="stack ${data.checkinEditMode?"editing":""}" id="journalStack">${rendered}</div>
    <button class="primary" id="saveJournal">Save today’s check-in</button>
  `,"journal");
}

function bindJournal(){
  document.querySelectorAll("[data-scale]").forEach(btn=>btn.onclick=()=>{
    document.querySelectorAll(`[data-scale="${btn.dataset.scale}"]`).forEach(x=>x.classList.remove("active"));
    btn.classList.add("active");
  });
  document.querySelectorAll("[data-token]").forEach(btn=>btn.onclick=()=>{
    const n=Number(btn.dataset.value),name=btn.dataset.token;
    document.querySelectorAll(`[data-token="${name}"]`).forEach(x=>x.classList.toggle("active",Number(x.dataset.value)<=n));
  });
  document.querySelectorAll("[data-care],[data-med],.done").forEach(btn=>btn.onclick=()=>btn.classList.toggle("active"));

  document.querySelectorAll("[data-filter]").forEach(btn=>btn.onclick=()=>{
    data.checkinFilter=btn.dataset.filter;saveData();applyJournalFilter();
    document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("active",x.dataset.filter===data.checkinFilter));
  });

  const edit=document.querySelector("#toggleEditMode");
  if(edit) edit.onclick=()=>{data.checkinEditMode=!data.checkinEditMode;saveData();render()};

  document.querySelectorAll("[data-visibility]").forEach(btn=>btn.onclick=e=>{
    e.stopPropagation();
    const id=btn.dataset.visibility;
    data.checkinHidden=data.checkinHidden||[];
    data.checkinHidden=data.checkinHidden.includes(id)?data.checkinHidden.filter(x=>x!==id):[...data.checkinHidden,id];
    saveData();render();
  });

  setupJournalDrag();
  applyJournalFilter();

  document.querySelectorAll("[data-journal-task-done]").forEach(btn=>btn.onclick=()=>{
    const task=(data.personalTasks||[]).find(t=>t.id===btn.dataset.journalTaskDone);
    if(task){task.done=true;saveData();render();}
  });

  const saveBtn=document.querySelector("#saveJournal");
  if(saveBtn) saveBtn.onclick=saveJournalEntry;
}

function applyJournalFilter(){
  const filter=data.checkinFilter||"all";
  const editing=!!data.checkinEditMode;
  document.querySelectorAll(".draggable").forEach(card=>{
    const hidden=(data.checkinHidden||[]).includes(card.dataset.block);
    const filtered=filter!=="all"&&card.dataset.group!==filter;
    card.classList.toggle("filtered-out",!editing&&(hidden||filtered));
    card.classList.toggle("soft-hidden",editing&&hidden);
  });
}

function setupJournalDrag(){
  const stack=document.querySelector("#journalStack");
  if(!stack||!data.checkinEditMode) return;

  let dragged=null;
  let placeholder=null;
  let pointerId=null;

  const saveOrder=()=>{
    data.checkinLayout=[...stack.querySelectorAll(".draggable")].map(x=>x.dataset.block);
    saveData();
  };

  const moveCard=(clientY)=>{
    if(!dragged) return;
    const cards=[...stack.querySelectorAll(".draggable:not(.dragging)")];
    const next=cards.find(card=>{
      const r=card.getBoundingClientRect();
      return clientY < r.top + r.height/2;
    });
    if(next) stack.insertBefore(dragged,next);
    else stack.appendChild(dragged);
  };

  stack.querySelectorAll(".draggable").forEach(card=>{
    const handle=card.querySelector(".drag-handle");
    if(!handle) return;

    handle.addEventListener("pointerdown",e=>{
      e.preventDefault();
      dragged=card;
      pointerId=e.pointerId;
      handle.setPointerCapture(pointerId);
      card.classList.add("dragging");
      document.body.classList.add("reordering");
    });

    handle.addEventListener("pointermove",e=>{
      if(!dragged||e.pointerId!==pointerId) return;
      e.preventDefault();
      moveCard(e.clientY);
    });

    const finish=e=>{
      if(!dragged||e.pointerId!==pointerId) return;
      try{handle.releasePointerCapture(pointerId)}catch{}
      dragged.classList.remove("dragging");
      dragged=null;
      pointerId=null;
      document.body.classList.remove("reordering");
      saveOrder();
    };

    handle.addEventListener("pointerup",finish);
    handle.addEventListener("pointercancel",finish);

    // Desktop fallback.
    card.draggable=true;
    card.addEventListener("dragstart",e=>{
      if(!e.target.closest(".drag-handle")){e.preventDefault();return}
      dragged=card;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed="move";
    });
    card.addEventListener("dragover",e=>{
      e.preventDefault();
      if(!dragged) return;
      moveCard(e.clientY);
    });
    card.addEventListener("dragend",()=>{
      card.classList.remove("dragging");
      dragged=null;
      saveOrder();
    });
  });
}

function saveJournalEntry(){
  const getScale=name=>{
    const el=document.querySelector(`[data-scale="${name}"].active`);
    return el?Number(el.dataset.value):null;
  };
  data.checkins[today()]={
    energy:getScale("energy"),mood:getScale("mood"),pain:getScale("pain"),sleep:getScale("sleep"),
    spoons:document.querySelectorAll('[data-token="spoons"].active').length,
    water:document.querySelectorAll('[data-token="water"].active').length,
    selfCare:[...document.querySelectorAll("[data-care].active")].map(x=>x.dataset.care),
    priorities:[...document.querySelectorAll(".priority")].map(x=>x.value),
    plan:[...document.querySelectorAll(".plan-row")].map(r=>({
      task:r.querySelector(".plan-task").value,
      energy:r.querySelector(".plan-energy").value,
      done:r.querySelector(".done").classList.contains("active")
    })),
    supports:[...document.querySelectorAll(".support")].map(x=>x.value)
  };
  saveData();
  toast("Today’s check-in saved 💜");
}
