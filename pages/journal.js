
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

  const blocks={
    energy:`<section class="card draggable" data-block="energy" data-group="emoji"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="energy">👁️</button><h2>⚡ Today’s energy</h2>${renderScale("energy",entry.energy)}</section>`,
    mood:`<section class="card draggable" data-block="mood" data-group="emoji"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="mood">👁️</button><h2>💜 Today’s mood</h2>${renderScale("mood",entry.mood)}</section>`,
    pain:`<section class="card draggable" data-block="pain" data-group="emoji"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="pain">👁️</button><h2>☀️ Today’s pain</h2>${renderScale("pain",entry.pain)}</section>`,
    spoons:`<section class="card draggable" data-block="spoons" data-group="wellness"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="spoons">👁️</button><h2>🥄 Spoon bank</h2><p>Tap a spoon as you use energy.</p><div class="tokens">${Array.from({length:12},(_,i)=>`<button class="token ${i<entry.spoons?"active":""}" data-token="spoons" data-value="${i+1}">🥄</button>`).join("")}</div></section>`,
    water:`<section class="card draggable" data-block="water" data-group="wellness"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="water">👁️</button><h2>💧 Water intake</h2><div class="tokens">${Array.from({length:10},(_,i)=>`<button class="token ${i<entry.water?"active":""}" data-token="water" data-value="${i+1}">💧</button>`).join("")}</div></section>`,
    selfcare:`<section class="card draggable" data-block="selfcare" data-group="wellness"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="selfcare">👁️</button><h2>🌸 Self-care menu</h2><div class="pills">${care.map(x=>`<button class="pill ${entry.selfCare.includes(x)?"active":""}" data-care="${x}">${x}</button>`).join("")}</div></section>`,
    sleep:`<section class="card draggable" data-block="sleep" data-group="emoji"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="sleep">👁️</button><h2>😴 Sleep last night</h2>${renderScale("sleep",entry.sleep)}</section>`,
    supports:`<section class="card draggable" data-block="supports" data-group="planning"><div class="drag-handle">⋮⋮</div><button class="visibility-toggle" data-visibility="supports">👁️</button><h2>🦴 Braces / supports used</h2>${entry.supports.map(v=>`<input class="field support" style="margin-top:9px" value="${esc(v)}" placeholder="e.g. knee brace">`).join("")}</section>`
  };

  const order=(data.checkinLayout||Object.keys(blocks)).filter(k=>blocks[k] && !["medication","justtoday","plan","priorities"].includes(k));
  const rendered=order.map(k=>{
    const hidden=(data.checkinHidden||[]).includes(k);
    return blocks[k].replace('class="card draggable"',`class="card draggable ${hidden?"soft-hidden":""}"`);
  }).join("");

  return shell(`${head("Today’s Check-in",niceDate())}
    <section class="card filter-card">
      <div class="layout-toolbar">
        <button class="collapse-title" id="toggleJournalControls">
          <span><h2>Journal view</h2><p style="margin:4px 0">${data.journalControlsCollapsed?"Tap to show layout controls":"Choose what you want to see today."}</p></span>
          <b>${data.journalControlsCollapsed?"⌄":"⌃"}</b>
        </button>
        ${data.journalControlsCollapsed?"":`<button class="magic-edit ${data.checkinEditMode?"active":""}" id="toggleEditMode">${data.checkinEditMode?"✓ Done":"🪄 Edit layout"}</button>`}
      </div>
      ${data.journalControlsCollapsed?"":`<div class="pills">
        <button class="pill ${data.checkinFilter==="all"?"active":""}" data-filter="all">Everything</button>
        <button class="pill ${data.checkinFilter==="emoji"?"active":""}" data-filter="emoji">Emoji check-ins</button>
        <button class="pill ${data.checkinFilter==="planning"?"active":""}" data-filter="planning">Planning</button>
        <button class="pill ${data.checkinFilter==="wellness"?"active":""}" data-filter="wellness">Wellness</button>
      </div>`}
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

  document.querySelector("#toggleJournalControls")?.addEventListener("click",()=>{
    data.journalControlsCollapsed=!data.journalControlsCollapsed;saveData();render();
  });
  const edit=document.querySelector("#toggleEditMode");
  if(edit) edit.onclick=()=>{
    if(data.checkinEditMode) saveJournalLayoutFromDom();
    data.checkinEditMode=!data.checkinEditMode;
    saveData();
    render();
  };

  document.querySelectorAll("[data-visibility]").forEach(btn=>btn.onclick=e=>{
    e.stopPropagation();
    const id=btn.dataset.visibility;
    data.checkinHidden=data.checkinHidden||[];
    data.checkinHidden=data.checkinHidden.includes(id)?data.checkinHidden.filter(x=>x!==id):[...data.checkinHidden,id];
    saveData();render();
  });

  setupJournalDrag();
  applyJournalFilter();

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

function saveJournalLayoutFromDom(){
  const stack=document.querySelector("#journalStack");
  if(!stack) return;
  const order=[...stack.querySelectorAll(".draggable")]
    .map(card=>card.dataset.block)
    .filter(Boolean);
  if(order.length){
    data.checkinLayout=order;
    saveData();
  }
}

function setupJournalDrag(){
  const stack=document.querySelector("#journalStack");
  if(!stack||!data.checkinEditMode) return;

  let dragged=null;
  let activeHandle=null;
  let pointerId=null;
  let lastOrder=(data.checkinLayout||[]).join("|");

  const persistIfChanged=()=>{
    const order=[...stack.querySelectorAll(".draggable")]
      .map(card=>card.dataset.block)
      .filter(Boolean);
    const signature=order.join("|");
    if(order.length&&signature!==lastOrder){
      data.checkinLayout=order;
      saveData();
      lastOrder=signature;
    }
  };

  const moveCard=clientY=>{
    if(!dragged) return;
    const cards=[...stack.querySelectorAll(".draggable:not(.dragging)")];
    const next=cards.find(card=>{
      const rect=card.getBoundingClientRect();
      return clientY < rect.top + rect.height/2;
    });
    if(next&&next!==dragged.nextElementSibling) stack.insertBefore(dragged,next);
    else if(!next) stack.appendChild(dragged);
    persistIfChanged();
  };

  const finish=()=>{
    if(!dragged) return;
    try{
      if(activeHandle&&pointerId!==null&&activeHandle.hasPointerCapture(pointerId)){
        activeHandle.releasePointerCapture(pointerId);
      }
    }catch{}
    dragged.classList.remove("dragging");
    dragged=null;
    activeHandle=null;
    pointerId=null;
    document.body.classList.remove("reordering");
    persistIfChanged();
  };

  stack.querySelectorAll(".draggable").forEach(card=>{
    const handle=card.querySelector(".drag-handle");
    if(!handle) return;

    handle.addEventListener("pointerdown",event=>{
      if(event.button!==undefined&&event.button!==0) return;
      event.preventDefault();
      event.stopPropagation();
      dragged=card;
      activeHandle=handle;
      pointerId=event.pointerId;
      card.classList.add("dragging");
      document.body.classList.add("reordering");
      try{handle.setPointerCapture(pointerId)}catch{}
    });

    handle.addEventListener("pointermove",event=>{
      if(!dragged||event.pointerId!==pointerId) return;
      event.preventDefault();
      moveCard(event.clientY);
    });

    handle.addEventListener("pointerup",event=>{
      if(event.pointerId===pointerId) finish();
    });
    handle.addEventListener("pointercancel",finish);
    handle.addEventListener("lostpointercapture",()=>{
      if(dragged) finish();
    });

    card.draggable=true;
    card.addEventListener("dragstart",event=>{
      if(!event.target.closest(".drag-handle")){
        event.preventDefault();
        return;
      }
      dragged=card;
      card.classList.add("dragging");
      document.body.classList.add("reordering");
      event.dataTransfer.effectAllowed="move";
      event.dataTransfer.setData("text/plain",card.dataset.block||"");
    });
    card.addEventListener("dragover",event=>{
      event.preventDefault();
      moveCard(event.clientY);
    });
    card.addEventListener("drop",event=>{
      event.preventDefault();
      moveCard(event.clientY);
      finish();
    });
    card.addEventListener("dragend",finish);
  });

  // These catch releases that happen outside the handle/card on mobile.
  window.addEventListener("pointerup",finish,{once:true});
  window.addEventListener("pointercancel",finish,{once:true});
  window.addEventListener("blur",finish,{once:true});
  document.addEventListener("visibilitychange",()=>{
    if(document.hidden) finish();
  },{once:true});
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
    supports:[...document.querySelectorAll(".support")].map(x=>x.value)
  };
  saveData();
  toast("Today’s check-in saved 💜");
}
