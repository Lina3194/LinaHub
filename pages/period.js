const PERIOD_DEFAULT_OPTIONS=[
  {id:"clots",emoji:"🩸",name:"Clots",type:"toggle",choices:[]},
  {id:"colour",emoji:"🌹",name:"Colour",type:"single",choices:["Bright red","Dark red","Brown","Pink"]},
  {id:"pain-relief",emoji:"💊",name:"Pain relief taken",type:"toggle",choices:[]},
  {id:"heat-pad",emoji:"🔥",name:"Heat pad used",type:"toggle",choices:[]},
  {id:"hot-bath",emoji:"🚿",name:"Hot bath",type:"toggle",choices:[]},
  {id:"stretching",emoji:"🧘",name:"Stretching helped",type:"toggle",choices:[]}
];

function ensurePeriodData(){
  data.periodEntries=data.periodEntries&&typeof data.periodEntries==="object"?data.periodEntries:{};
  data.periodCycles=Array.isArray(data.periodCycles)?data.periodCycles:[];
  data.periodOptions=Array.isArray(data.periodOptions)&&data.periodOptions.length?data.periodOptions:structuredClone(PERIOD_DEFAULT_OPTIONS);
  data.periodOptions=data.periodOptions.map((item,index)=>({
    id:String(item?.id||`period-option-${Date.now()}-${index}`),
    emoji:String(item?.emoji||"✨"),
    name:String(item?.name||"New item"),
    type:["toggle","single","multiple","number","text"].includes(item?.type)?item.type:"toggle",
    choices:Array.isArray(item?.choices)?item.choices.map(String).filter(Boolean):[],
    hidden:item?.hidden===true
  }));
  data.periodSelectedDate=data.periodSelectedDate||today();
  data.periodCalendarMonth=data.periodCalendarMonth||today().slice(0,7);
  data.periodEditOptions=data.periodEditOptions===true;
}

function periodDate(value){return new Date(`${value}T12:00:00`)}
function periodIso(date){
  const pad=n=>String(n).padStart(2,"0");
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}`;
}
function periodDaysBetween(a,b){return Math.round((periodDate(b)-periodDate(a))/86400000)}
function periodSortedCycles(){return [...(data.periodCycles||[])].sort((a,b)=>String(b.start).localeCompare(String(a.start)))}
function periodCurrentCycle(){return periodSortedCycles().find(c=>c.start&&!c.end)||null}
function periodAverage(values){return values.length?Math.round(values.reduce((sum,n)=>sum+n,0)/values.length):0}
function periodStats(){
  const cycles=periodSortedCycles().filter(c=>c.start);
  const ascending=[...cycles].sort((a,b)=>a.start.localeCompare(b.start));
  const cycleLengths=[];
  for(let i=1;i<ascending.length;i++){
    const length=periodDaysBetween(ascending[i-1].start,ascending[i].start);
    if(length>10&&length<90) cycleLengths.push(length);
  }
  const periodLengths=cycles.filter(c=>c.end).map(c=>periodDaysBetween(c.start,c.end)+1).filter(n=>n>0&&n<30);
  const averageCycle=periodAverage(cycleLengths)||28;
  const averagePeriod=periodAverage(periodLengths)||5;
  const latest=cycles[0];
  const predicted=latest?.start?periodIso(new Date(periodDate(latest.start).getTime()+averageCycle*86400000)):"";
  const active=periodCurrentCycle();
  const cycleDay=latest?.start&&periodDaysBetween(latest.start,today())>=0?periodDaysBetween(latest.start,today())+1:null;
  return {averageCycle,averagePeriod,predicted,active,cycleDay,cycles};
}
function periodEntry(date=data.periodSelectedDate){return data.periodEntries?.[date]||{}}
function periodFlowLabel(value){return ({spotting:"Spotting",light:"Light",medium:"Medium",heavy:"Heavy"})[value]||"Not logged"}
function periodFlowEmoji(value){return ({spotting:"🩷",light:"🌸",medium:"🌺",heavy:"❤️"})[value]||"🌙"}
function periodJournalSnapshot(date){
  const entry=data.checkins?.[date];
  if(!entry) return `<p class="period-empty-copy">No Daily Check-in saved for this date.</p>`;
  const label=(value,bad,good)=>value==null?"—":`${value}/5`;
  return `<div class="period-journal-grid">
    <button type="button" data-open-journal-date="${date}"><span>💥 Pain</span><strong>${label(entry.pain)}</strong></button>
    <button type="button" data-open-journal-date="${date}"><span>🔋 Energy</span><strong>${label(entry.energy)}</strong></button>
    <button type="button" data-open-journal-date="${date}"><span>😊 Mood</span><strong>${label(entry.mood)}</strong></button>
    <button type="button" data-open-journal-date="${date}"><span>😴 Sleep</span><strong>${label(entry.sleep)}</strong></button>
  </div>`;
}
function periodOptionInput(option,value){
  if(option.type==="toggle") return `<button type="button" class="period-option-toggle ${value===true?"active":""}" data-period-toggle="${option.id}" aria-pressed="${value===true}"><span>${value===true?"✓":""}</span></button>`;
  if(option.type==="single") return `<select class="field period-option-field" data-period-value="${option.id}"><option value="">Not selected</option>${option.choices.map(choice=>`<option ${value===choice?"selected":""}>${esc(choice)}</option>`).join("")}</select>`;
  if(option.type==="multiple"){
    const selected=Array.isArray(value)?value:[];
    return `<div class="period-choice-pills">${option.choices.map(choice=>`<button type="button" class="${selected.includes(choice)?"active":""}" data-period-multi="${option.id}" data-choice="${esc(choice)}">${esc(choice)}</button>`).join("")}</div>`;
  }
  if(option.type==="number") return `<input class="field period-option-field" data-period-value="${option.id}" type="number" value="${esc(value??"")}" placeholder="Add number">`;
  return `<input class="field period-option-field" data-period-value="${option.id}" value="${esc(value??"")}" placeholder="Add a short note">`;
}
function periodCalendar(){
  const [year,month]=data.periodCalendarMonth.split("-").map(Number);
  const first=new Date(year,month-1,1);
  const total=new Date(year,month,0).getDate();
  const leading=(first.getDay()+6)%7;
  const cells=[];
  for(let i=0;i<leading;i++) cells.push(`<span class="period-calendar-blank"></span>`);
  const stats=periodStats();
  for(let day=1;day<=total;day++){
    const date=`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const entry=periodEntry(date);
    const inCycle=(data.periodCycles||[]).some(c=>c.start&&date>=c.start&&date<=(c.end||today()));
    const predicted=date===stats.predicted;
    cells.push(`<button type="button" class="period-calendar-day ${date===data.periodSelectedDate?"selected":""} ${entry.flow?`flow-${entry.flow}`:""} ${inCycle?"in-cycle":""} ${predicted?"predicted":""}" data-period-date="${date}"><span>${day}</span>${entry.flow?`<i>${periodFlowEmoji(entry.flow)}</i>`:predicted?`<i>✨</i>`:""}</button>`);
  }
  const monthLabel=first.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
  return `<section class="card period-calendar-card">
    <div class="period-calendar-head"><button type="button" data-period-month="-1">‹</button><h2>${monthLabel}</h2><button type="button" data-period-month="1">›</button></div>
    <div class="period-weekdays">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d=>`<span>${d}</span>`).join("")}</div>
    <div class="period-calendar-grid">${cells.join("")}</div>
    <div class="period-legend"><span><i class="legend-period"></i> Logged period</span><span><i class="legend-predicted"></i> Predicted start</span></div>
  </section>`;
}
function periodOptionEditor(){
  return `<section class="card period-editor">
    <div class="section-title"><div><span class="section-kicker">✨ Customise</span><h2>Period-specific items</h2></div><button type="button" class="mini" id="closePeriodEditor">Done</button></div>
    <p>Add, rename, reorder, hide or remove anything. Your past logs remain saved even when an item is hidden.</p>
    <div class="period-editor-list">
      ${data.periodOptions.map((option,index)=>`<article class="period-editor-row" data-option-row="${option.id}">
        <div class="period-editor-order"><button type="button" data-option-move="up" data-option-id="${option.id}" ${index===0?"disabled":""}>↑</button><button type="button" data-option-move="down" data-option-id="${option.id}" ${index===data.periodOptions.length-1?"disabled":""}>↓</button></div>
        <input class="field option-emoji" data-option-emoji="${option.id}" value="${esc(option.emoji)}" aria-label="Emoji">
        <input class="field" data-option-name="${option.id}" value="${esc(option.name)}" aria-label="Item name">
        <select class="field" data-option-type="${option.id}">
          ${[["toggle","Yes / No"],["single","One choice"],["multiple","Several choices"],["number","Number"],["text","Short note"]].map(([value,label])=>`<option value="${value}" ${option.type===value?"selected":""}>${label}</option>`).join("")}
        </select>
        <input class="field option-choices" data-option-choices="${option.id}" value="${esc(option.choices.join(", "))}" placeholder="Choices, separated by commas" ${!["single","multiple"].includes(option.type)?"disabled":""}>
        <button type="button" class="mini" data-option-hide="${option.id}">${option.hidden?"Show":"Hide"}</button>
        <button type="button" class="mini danger" data-option-delete="${option.id}">Delete</button>
      </article>`).join("")}
    </div>
    <div class="period-editor-actions"><button type="button" class="secondary" id="addPeriodOption">+ Add item</button><button type="button" class="mini" id="restorePeriodOptions">Restore defaults</button></div>
  </section>`;
}
function PeriodPage(){
  ensurePeriodData();
  const stats=periodStats();
  const selected=data.periodSelectedDate;
  const entry=periodEntry(selected);
  const selectedCycle=(data.periodCycles||[]).find(c=>c.start&&selected>=c.start&&selected<=(c.end||today()));
  return shell(`${head("Period Tracker",`${formatDate(selected)} · your cycle, without duplicate daily logging`)}
    <section class="period-hero card">
      <div><span class="section-kicker">🌸 Cycle overview</span><h1>${stats.active?`Period day ${periodDaysBetween(stats.active.start,today())+1}`:stats.cycleDay?`Cycle day ${stats.cycleDay}`:"Ready when you are"}</h1><p>${stats.predicted?`Next period predicted around ${formatDate(stats.predicted)}.`:"Start your first cycle to begin predictions."}</p></div>
      <div class="period-hero-actions">${stats.active?`<button type="button" class="primary" id="endPeriod">End period today</button>`:`<button type="button" class="primary" id="startPeriod">Start period today</button>`}</div>
    </section>
    <div class="period-stat-grid">
      <article class="stat"><span>Average cycle</span><strong>${stats.cycles.length>1?`${stats.averageCycle} days`:"—"}</strong><small>Based on completed history</small></article>
      <article class="stat"><span>Average period</span><strong>${stats.cycles.some(c=>c.end)?`${stats.averagePeriod} days`:"—"}</strong><small>Based on completed periods</small></article>
      <article class="stat"><span>Cycles logged</span><strong>${stats.cycles.length}</strong><small>Your private history</small></article>
    </div>
    ${periodCalendar()}
    <section class="card period-log-card">
      <div class="section-title"><div><span class="section-kicker">${periodFlowEmoji(entry.flow)} Daily cycle log</span><h2>${formatDate(selected)}</h2></div>${selectedCycle?`<span class="period-day-badge">Period day ${periodDaysBetween(selectedCycle.start,selected)+1}</span>`:""}</div>
      <h3>Flow</h3>
      <div class="period-flow-picker">${[["spotting","🩷","Spotting"],["light","🌸","Light"],["medium","🌺","Medium"],["heavy","❤️","Heavy"]].map(([value,emoji,label])=>`<button type="button" class="${entry.flow===value?"active":""}" data-period-flow="${value}"><span>${emoji}</span><strong>${label}</strong></button>`).join("")}</div>
      <div class="period-section-head"><div><h3>Period-specific things</h3><p>Only the items useful to you.</p></div><button type="button" class="mini" id="editPeriodOptions">Edit items</button></div>
      <div class="period-options-list">${data.periodOptions.filter(o=>!o.hidden).map(option=>`<article class="period-option-row"><div class="period-option-label"><span>${esc(option.emoji)}</span><strong>${esc(option.name)}</strong></div>${periodOptionInput(option,entry.options?.[option.id])}</article>`).join("")||`<p class="period-empty-copy">No items are visible. Use “Edit items” to add or show some.</p>`}</div>
      <label class="period-notes"><span>Period notes</span><textarea class="field" id="periodNotes" rows="4" placeholder="Anything specific to this cycle or date…">${esc(entry.notes||"")}</textarea></label>
      <button type="button" class="primary" id="savePeriodLog">Save this date</button>
    </section>
    <section class="card">
      <div class="section-title"><div><span class="section-kicker">💜 Connected</span><h2>Daily Check-in</h2></div><button type="button" class="mini" data-open-journal-date="${selected}">Open entry</button></div>
      <p>Pain, mood, energy and sleep stay in your Journal, so you never have to enter them twice.</p>
      ${periodJournalSnapshot(selected)}
    </section>
    ${data.periodEditOptions?periodOptionEditor():""}
    <section class="card"><h2>Cycle history</h2><div class="timeline-list">${stats.cycles.length?stats.cycles.map(c=>`<article class="history-card"><div class="history-date"><strong>${formatDate(c.start)}</strong><span>${c.end?`${periodDaysBetween(c.start,c.end)+1} days · ended ${formatDate(c.end)}`:"Ongoing"}</span></div><button type="button" class="mini danger" data-cycle-delete="${c.id}">Delete</button></article>`).join(""):`<p>No cycles logged yet.</p>`}</div></section>
  `,"period");
}

function bindPeriod(){
  ensurePeriodData();
  document.querySelectorAll("[data-period-date]").forEach(button=>button.onclick=()=>{data.periodSelectedDate=button.dataset.periodDate;saveData();render()});
  document.querySelectorAll("[data-period-month]").forEach(button=>button.onclick=()=>{
    const [y,m]=data.periodCalendarMonth.split("-").map(Number);const next=new Date(y,m-1+Number(button.dataset.periodMonth),1);data.periodCalendarMonth=`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,"0")}`;saveData();render();
  });
  document.querySelector("#startPeriod")?.addEventListener("click",()=>{
    if(periodCurrentCycle()){toast("A period is already active");return}
    const start=today();data.periodCycles.push({id:`cycle-${Date.now()}`,start,end:""});data.periodSelectedDate=start;data.periodCalendarMonth=start.slice(0,7);saveData();toast("Period started 🌸");render();
  });
  document.querySelector("#endPeriod")?.addEventListener("click",()=>{const cycle=periodCurrentCycle();if(!cycle)return;cycle.end=today();saveData();toast("Period ended and saved 💜");render()});
  document.querySelectorAll("[data-period-flow]").forEach(button=>button.onclick=()=>{
    const date=data.periodSelectedDate;data.periodEntries[date]=data.periodEntries[date]||{};data.periodEntries[date].flow=data.periodEntries[date].flow===button.dataset.periodFlow?"":button.dataset.periodFlow;saveData();render();
  });
  document.querySelectorAll("[data-period-toggle]").forEach(button=>button.onclick=()=>{const date=data.periodSelectedDate;const entry=data.periodEntries[date]=data.periodEntries[date]||{};entry.options=entry.options||{};entry.options[button.dataset.periodToggle]=entry.options[button.dataset.periodToggle]!==true;saveData();render()});
  document.querySelectorAll("[data-period-multi]").forEach(button=>button.onclick=()=>{const date=data.periodSelectedDate;const entry=data.periodEntries[date]=data.periodEntries[date]||{};entry.options=entry.options||{};const id=button.dataset.periodMulti;const current=Array.isArray(entry.options[id])?entry.options[id]:[];entry.options[id]=current.includes(button.dataset.choice)?current.filter(x=>x!==button.dataset.choice):[...current,button.dataset.choice];saveData();render()});
  document.querySelector("#savePeriodLog")?.addEventListener("click",()=>{
    const date=data.periodSelectedDate;const entry=data.periodEntries[date]=data.periodEntries[date]||{};entry.options=entry.options||{};
    document.querySelectorAll("[data-period-value]").forEach(input=>{entry.options[input.dataset.periodValue]=input.value});entry.notes=document.querySelector("#periodNotes")?.value||"";entry.savedAt=new Date().toISOString();saveData();toast("Cycle log saved 🌸");render();
  });
  document.querySelectorAll("[data-open-journal-date]").forEach(button=>button.onclick=()=>{data.journalSelectedDate=button.dataset.openJournalDate;data.journalTab="calendar";saveData();go("journal")});
  document.querySelector("#editPeriodOptions")?.addEventListener("click",()=>{data.periodEditOptions=true;saveData();render();setTimeout(()=>document.querySelector(".period-editor")?.scrollIntoView({behavior:"smooth"}),50)});
  document.querySelector("#closePeriodEditor")?.addEventListener("click",()=>{data.periodEditOptions=false;saveData();render()});
  document.querySelector("#addPeriodOption")?.addEventListener("click",()=>{data.periodOptions.push({id:`period-option-${Date.now()}`,emoji:"✨",name:"New item",type:"toggle",choices:[],hidden:false});saveData();render()});
  document.querySelector("#restorePeriodOptions")?.addEventListener("click",()=>{if(!confirm("Restore the original period-specific items? Your logged values will not be deleted."))return;data.periodOptions=structuredClone(PERIOD_DEFAULT_OPTIONS);saveData();render()});
  document.querySelectorAll("[data-option-name]").forEach(input=>input.onchange=()=>{data.periodOptions.find(o=>o.id===input.dataset.optionName).name=input.value.trim()||"New item";saveData()});
  document.querySelectorAll("[data-option-emoji]").forEach(input=>input.onchange=()=>{data.periodOptions.find(o=>o.id===input.dataset.optionEmoji).emoji=input.value.trim()||"✨";saveData()});
  document.querySelectorAll("[data-option-type]").forEach(select=>select.onchange=()=>{const option=data.periodOptions.find(o=>o.id===select.dataset.optionType);option.type=select.value;if(!["single","multiple"].includes(option.type))option.choices=[];saveData();render()});
  document.querySelectorAll("[data-option-choices]").forEach(input=>input.onchange=()=>{data.periodOptions.find(o=>o.id===input.dataset.optionChoices).choices=input.value.split(",").map(x=>x.trim()).filter(Boolean);saveData()});
  document.querySelectorAll("[data-option-hide]").forEach(button=>button.onclick=()=>{const option=data.periodOptions.find(o=>o.id===button.dataset.optionHide);option.hidden=!option.hidden;saveData();render()});
  document.querySelectorAll("[data-option-delete]").forEach(button=>button.onclick=()=>{const option=data.periodOptions.find(o=>o.id===button.dataset.optionDelete);if(!confirm(`Delete “${option.name}” from the list? Past logs will remain stored.`))return;data.periodOptions=data.periodOptions.filter(o=>o.id!==option.id);saveData();render()});
  document.querySelectorAll("[data-option-move]").forEach(button=>button.onclick=()=>{const index=data.periodOptions.findIndex(o=>o.id===button.dataset.optionId);const target=button.dataset.optionMove==="up"?index-1:index+1;if(index<0||target<0||target>=data.periodOptions.length)return;[data.periodOptions[index],data.periodOptions[target]]=[data.periodOptions[target],data.periodOptions[index]];saveData();render()});
  document.querySelectorAll("[data-cycle-delete]").forEach(button=>button.onclick=()=>{if(!confirm("Delete this cycle from history?"))return;data.periodCycles=data.periodCycles.filter(c=>c.id!==button.dataset.cycleDelete);saveData();render()});
}
