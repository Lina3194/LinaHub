const MED_WEEKDAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
let medicationDateTouched=false;
let medicationStockEditingId="";
let medicationHistoryOpenId="";
let medicationAddFormOpen=false;
let medicationEditingId="";

function medLocalDate(date=new Date()){
  const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,"0"),d=String(date.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}
function medNowTime(){return new Date().toTimeString().slice(0,5)}
function medUid(prefix="med"){return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`}
function ensureMedicationData(){
  data.medications=Array.isArray(data.medications)?data.medications:[];
  data.medicationHistory=Array.isArray(data.medicationHistory)?data.medicationHistory:[];
  data.medicationView=data.medicationView||{tab:"today",date:medLocalDate(),historyMed:"all"};
  data.medicationView.tab=data.medicationView.tab==="schedule"?"meds":data.medicationView.tab;
  data.medicationView.tab=["today","meds","history","stock"].includes(data.medicationView.tab)?data.medicationView.tab:"today";
  if(!medicationDateTouched) data.medicationView.date=medLocalDate();
  else data.medicationView.date=data.medicationView.date||medLocalDate();
  data.medications=data.medications.map((m,i)=>({
    id:m.id||medUid(`med-${i}`),name:m.name||"Medication",dose:m.dose||"",instructions:m.instructions||m.notes||"",
    scheduleType:m.scheduleType||((m.time||"").toLowerCase()==="as needed"?"prn":"daily"),
    weekdays:Array.isArray(m.weekdays)?m.weekdays:[],time:/^\d{2}:\d{2}$/.test(m.time||"")?m.time:"",
    timeLabel:!/^\d{2}:\d{2}$/.test(m.time||"")&&m.time!=="As needed"?(m.time||""):"",
    startDate:m.startDate||"",endDate:m.endDate||"",photo:m.photo||"",photoKey:m.photoKey||`medication:${m.id||`med-${i}`}`,notes:m.notes||"",active:m.active!==false,
    timing:m.timing||m.timeLabel||"",takeWith:m.takeWith||"",avoid:m.avoid||"",goodCombos:m.goodCombos||"",badCombos:m.badCombos||"",
    dosesPerDay:Math.max(1,Number(m.dosesPerDay)||1),
    stock:Math.max(0,Math.floor(Number(m.stock)||0))
  }));
  // Convert the original one-check-per-day format into proper history once.
  if(!data.medicationHistoryMigrated && data.medicationLog && typeof data.medicationLog==="object"){
    Object.entries(data.medicationLog).forEach(([date,entries])=>{
      Object.entries(entries||{}).forEach(([medId,taken])=>{
        if(taken&&!data.medicationHistory.some(x=>x.medId===medId&&x.date===date)){
          data.medicationHistory.push({id:medUid("dose"),medId,date,time:"",notes:"",createdAt:new Date().toISOString()});
        }
      });
    });
    data.medicationHistoryMigrated=true;
  }
  // Ensure one active evening Magnesium entry exists and is usable by the PM check-in.
  let magnesium=data.medications.find(m=>/magnesium/i.test(String(m.name||"")));
  if(!magnesium){
    magnesium={id:medUid("magnesium"),name:"Magnesium",dose:"",instructions:"Take with an evening meal or water if that suits the product label.",scheduleType:"daily",weekdays:[],time:"21:00",timeLabel:"Evening",timing:"Evening",startDate:"",endDate:"",photo:"",photoKey:"",notes:"",active:true,dosesPerDay:1,stock:0,takeWith:"An evening meal and a glass of water may help reduce stomach upset.",avoid:"Do not exceed the label dose. Ask a pharmacist before use if you have kidney problems.",goodCombos:"Usually fine with food. Keep your own pharmacist-approved combinations here.",badCombos:"Separate from levothyroxine, some antibiotics and bisphosphonates; ask a pharmacist how many hours for your exact medicine."};
    data.medications.push(magnesium);
  }else{
    magnesium.active=true;
    magnesium.scheduleType=magnesium.scheduleType||"daily";
    magnesium.weekdays=Array.isArray(magnesium.weekdays)?magnesium.weekdays:[];
    magnesium.time=magnesium.time||"21:00";
    magnesium.timing=medNormaliseTiming(magnesium.timing||magnesium.timeLabel)||"Evening";
    magnesium.timeLabel=magnesium.timing;
    magnesium.dosesPerDay=Math.max(1,Number(magnesium.dosesPerDay)||1);
  }
  if(typeof saveData==="function")saveData();
  const folic=data.medications.find(m=>/folic\s*acid/i.test(String(m.name||"")));
  if(folic){
    folic.timing=folic.timing||"Morning";
    folic.takeWith=folic.takeWith||"With or without food, with water.";
    folic.avoid=folic.avoid||"Do not double a missed dose. Check other supplements so you do not accidentally take extra folic acid.";
    folic.goodCombos=folic.goodCombos||"Can be taken with normal meals.";
    folic.badCombos=folic.badCombos||"Keep antacids at least 2 hours apart. Ask a pharmacist about methotrexate, epilepsy medicines or sulfasalazine.";
  }

  // v17.5.4: repair only the old Daily Check-in doses that were logged
  // without changing stock. Other historical dose records are deliberately left
  // alone because those routes already reduced stock in earlier versions.
  if(Number(data.medicationStockReconciliationVersion||0)<1){
    let changed=false;
    data.medicationHistory.forEach(log=>{
      if(log?.source!=="daily-checkin"||log.stockAdjusted===true||log.stockReconciled===true)return;
      const med=data.medications.find(item=>String(item.id)===String(log.medId));
      if(!med){log.stockReconciled=true;changed=true;return}
      const current=Math.max(0,Math.floor(Number(med.stock)||0));
      if(current>0){med.stock=current-1;log.stockAdjusted=true}
      else log.stockAdjusted=false;
      log.stockReconciled=true;
      log.stockReconciledAt=new Date().toISOString();
      changed=true;
    });
    data.medicationStockReconciliationVersion=1;
    changed=true;
    if(changed&&typeof saveData==="function") saveData();
  }
}
function medDateLabel(value){
  if(!value)return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
}
function medDueOn(m,dateValue){
  if(!m.active)return false;
  if(m.startDate&&dateValue<m.startDate)return false;
  if(m.endDate&&dateValue>m.endDate)return false;
  if(m.scheduleType==="prn")return true;
  if(m.scheduleType==="weekdays"){
    const day=MED_WEEKDAYS[new Date(`${dateValue}T12:00:00`).getDay()];
    return m.weekdays.includes(day);
  }
  return true;
}

function medAdjustStockForDose(medId,change){
  const med=(data.medications||[]).find(item=>String(item.id)===String(medId));
  if(!med)return false;
  const current=Math.max(0,Math.floor(Number(med.stock)||0));
  if(change<0){
    if(current<1)return false;
    med.stock=current-1;
    return true;
  }
  if(change>0){
    med.stock=current+1;
    return true;
  }
  return false;
}
function medLogsFor(medId,dateValue){
  return data.medicationHistory.filter(x=>x.medId===medId&&x.date===dateValue).sort((a,b)=>(a.time||"").localeCompare(b.time||""));
}
function medPhoto(m,large=false){
  return m.photo?`<img class="med-photo ${large?"large":""}" src="${m.photo}" alt="${esc(m.name)}">`:`<span class="med-photo med-photo-placeholder ${large?"large":""}">💊</span>`;
}
function medDosePeriod(m,index){
  if(m.time&&/^\d{2}:\d{2}$/.test(m.time))return Number(m.time.slice(0,2))<12?"AM":"PM";
  if(m.dosesPerDay===1)return "AM";
  if(m.dosesPerDay===2)return index===0?"AM":"PM";
  return `Dose ${index+1}`;
}
function medicationTopTabs(active){
  return `<section class="med-top-tabs med-top-tabs-three" aria-label="Medication sections">
    <button class="${active==="today"?"active":""}" data-med-tab="today">Today</button>
    <button class="${active==="meds"?"active":""}" data-med-tab="meds">Meds</button>
    <button class="${active==="history"?"active":""}" data-med-tab="history">History</button>
  </section>`;
}
function medInfoLine(label,value){return value?`<div class="med-info-line"><strong>${label}</strong><span>${esc(value)}</span></div>`:"";}
function medNormaliseTiming(value){
  const timing=String(value||"").trim().toLowerCase();
  if(!timing)return "";
  if(timing.includes("morning")||timing==="am")return "Morning";
  if(timing.includes("afternoon")||timing.includes("midday")||timing.includes("noon"))return "Afternoon";
  if(timing.includes("evening")||timing==="pm")return "Evening";
  if(timing.includes("night")||timing.includes("bed"))return "Night";
  return "";
}
function medicationFormModal(){
  const editing=(data.medications||[]).find(m=>String(m.id)===String(medicationEditingId))||null;
  const title=editing?"Edit medication":"Add medication";
  const timing=medNormaliseTiming(editing?.timing||editing?.timeLabel||editing?.time);
  const scheduleType=editing?.scheduleType||"daily";
  const weekdays=Array.isArray(editing?.weekdays)?editing.weekdays:[];
  const photo=editing?.photo||"";
  return `<div class="med-form-modal-backdrop" id="medicationFormBackdrop" data-close-med-form>
    <section class="card med-add-card med-form-modal" id="medicationAddForm" role="dialog" aria-modal="true" aria-labelledby="medFormTitle">
      <div class="section-title med-form-modal-head"><div><span class="section-kicker">➕ Medication</span><h2 id="medFormTitle">${title}</h2></div><button type="button" class="mini" id="closeMedicationForm" aria-label="Close">×</button></div>
      <input id="medEditId" type="hidden" value="${esc(editing?.id||"")}">
      <div class="med-photo-editor"><label class="med-photo-upload" for="medPhotoInput"><span id="medPhotoPreview">${photo?`<img src="${photo}" alt="">`:"💊"}</span><b>Add a small photo</b><small>Useful when filling your pill box</small></label><input id="medPhotoInput" type="file" accept="image/*" capture="environment" hidden><input id="medPhotoData" type="hidden" value="${esc(photo)}"><button class="mini ${photo?"":"hidden"}" id="removeMedPhoto" type="button">Remove photo</button></div>
      <div class="form-grid">
        <input class="field" id="medName" placeholder="Medication name" value="${esc(editing?.name||"")}">
        <div class="two-col"><input class="field" id="medDose" placeholder="Dose, e.g. 25 mg" value="${esc(editing?.dose||"")}"><input class="field" id="medTime" type="time" aria-label="Usual time" value="${esc(editing?.time||"")}"></div>
        <select class="field" id="medTiming" aria-label="Time of day"><option value="">Select time of day</option>${["Morning","Afternoon","Evening","Night"].map(v=>`<option value="${v}" ${timing===v?"selected":""}>${v}</option>`).join("")}</select>
        <label class="field-label">Times taken per day<input class="field" id="medDosesPerDay" type="number" min="1" max="12" step="1" value="${Math.max(1,Number(editing?.dosesPerDay)||1)}"></label>
        <input class="field" id="medInstructions" placeholder="Short instructions" value="${esc(editing?.instructions||"")}">
        <textarea class="field" id="medTakeWith" rows="2" placeholder="What to take it with">${esc(editing?.takeWith||"")}</textarea>
        <textarea class="field" id="medAvoid" rows="2" placeholder="What to avoid">${esc(editing?.avoid||"")}</textarea>
        <textarea class="field" id="medGoodCombos" rows="2" placeholder="Good combinations">${esc(editing?.goodCombos||"")}</textarea>
        <textarea class="field" id="medBadCombos" rows="2" placeholder="Combinations to keep apart or check with a pharmacist">${esc(editing?.badCombos||"")}</textarea>
        <select class="field" id="medScheduleType"><option value="daily" ${scheduleType==="daily"?"selected":""}>Every day</option><option value="weekdays" ${scheduleType==="weekdays"?"selected":""}>Every week on selected days</option><option value="prn" ${scheduleType==="prn"?"selected":""}>As needed (PRN)</option></select>
        <div class="med-weekdays ${scheduleType==="weekdays"?"":"hidden"}" id="medWeekdays">${MED_WEEKDAYS.map(day=>`<label><input type="checkbox" value="${day}" ${weekdays.includes(day)?"checked":""}><span>${day}</span></label>`).join("")}</div>
        <div class="two-col"><label class="field-label">Start date<input class="field" id="medStartDate" type="date" value="${esc(editing?.startDate||"")}"></label><label class="field-label">End date (optional)<input class="field" id="medEndDate" type="date" value="${esc(editing?.endDate||"")}"></label></div>
        <textarea class="field" id="medNotes" rows="3" placeholder="Extra notes">${esc(editing?.notes||"")}</textarea>
        <div class="two-col"><button class="primary" id="saveMedication" type="button">${editing?"Save changes":"Add medication"}</button><button class="secondary" id="cancelMedEdit" type="button">Cancel</button></div>
      </div>
    </section>
  </div>`;
}

function medicationTodayTab(){
  const selected=medLocalDate();
  data.medicationView.date=selected;
  const scheduled=data.medications.filter(m=>medDueOn(m,selected));
  const dueRows=[];
  scheduled.forEach(m=>{
    const logs=medLogsFor(m.id,selected);
    const required=m.scheduleType==="prn"?Math.max(1,logs.length+1):m.dosesPerDay;
    for(let index=logs.length;index<required;index++)dueRows.push({m,index});
  });
  return `${medicationTopTabs("today")}
  <section class="card med-today-due">
    <div class="med-today-title"><div><span class="section-kicker">💊 Today</span><h2>${dueRows.length?`${dueRows.length} ${dueRows.length===1?"tablet":"tablets"} left to take`:"All done for today"}</h2></div></div>
    ${dueRows.length?`<div class="med-quick-list-only">${dueRows.map(({m,index})=>`<article class="med-quick-row">
      ${medPhoto(m)}
      <div class="med-quick-copy"><strong>${esc(m.name)}</strong><span>${esc([medDosePeriod(m,index),String(index+1),m.dose].filter(Boolean).join(" · "))}</span></div>
      <button type="button" class="med-quick-tick" data-med-take="${esc(m.id)}" data-dose-index="${index}" aria-label="Mark ${esc(m.name)} taken">✓</button>
    </article>`).join("")}</div>`:`<div class="empty med-today-empty"><h2>All medication completed</h2><p>There is nothing else to take today.</p></div>`}
  </section>`;
}
function medicationScheduleTab(){
  const meds=data.medications;
  return `${medicationTopTabs("meds")}
  <section class="card med-list-card">
    <div class="section-title med-list-title"><div><span class="section-kicker">💊 MEDS</span><h2>What I take</h2><p>Timing and medicine notes are personal reminders, not a substitute for the packet label or pharmacist.</p></div><button type="button" class="primary med-add-button" id="openMedicationForm">+ Add</button></div>
    <div class="med-information-list">${meds.length?meds.map(m=>`<article class="med-information-card">${medPhoto(m,true)}<div class="med-information-main"><div class="med-information-head"><div><h3>${esc(m.name)}</h3><p>${esc([m.dose,m.timing||m.timeLabel||m.time,m.scheduleType==="daily"?"Every day":m.scheduleType==="prn"?"As needed":m.weekdays.join(", ")].filter(Boolean).join(" · "))}</p></div><div><button class="mini" data-med-edit="${esc(m.id)}">Edit</button><button class="mini danger" data-med-delete="${esc(m.id)}">×</button></div></div>${medInfoLine("Take it with",m.takeWith||m.instructions)}${medInfoLine("Avoid",m.avoid)}${medInfoLine("Good combinations",m.goodCombos)}${medInfoLine("Keep apart / check first",m.badCombos)}${m.notes?medInfoLine("Notes",m.notes):""}</div></article>`).join(""):`<p>No medications added yet.</p>`}</div>
  </section>
  ${medicationAddFormOpen?medicationFormModal():""}`;
}
function medHistoryMonthStart(){
  const value=data.medicationView.historyMonth||medLocalDate().slice(0,7);
  return /^\d{4}-\d{2}$/.test(value)?value:medLocalDate().slice(0,7);
}
function medShiftMonth(value,delta){
  const [y,m]=value.split("-").map(Number),d=new Date(y,m-1+delta,1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function medCalendarFor(med,monthValue){
  const [year,month]=monthValue.split("-").map(Number);
  const first=new Date(year,month-1,1),days=new Date(year,month,0).getDate();
  const mondayOffset=(first.getDay()+6)%7;
  const logs=data.medicationHistory.filter(x=>String(x.medId)===String(med.id)&&x.date.startsWith(`${monthValue}-`));
  const counts={};logs.forEach(x=>counts[x.date]=(counts[x.date]||0)+1);
  const cells=[];
  for(let i=0;i<mondayOffset;i++)cells.push(`<span class="med-cal-day blank"></span>`);
  for(let day=1;day<=days;day++){
    const date=`${monthValue}-${String(day).padStart(2,"0")}`,count=counts[date]||0;
    cells.push(`<span class="med-cal-day ${count?"taken":""}" title="${count?`${count} dose${count===1?"":"s"} recorded`:"No dose recorded"}"><b>${day}</b>${count?`<small>${count>1?count:"✓"}</small>`:""}</span>`);
  }
  const monthLabel=first.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
  const recent=[...data.medicationHistory].filter(x=>String(x.medId)===String(med.id)).sort((a,b)=>`${b.date} ${b.time||""}`.localeCompare(`${a.date} ${a.time||""}`)).slice(0,12);
  return `<div class="med-history-calendar">
    <div class="med-calendar-head"><button class="mini" data-med-history-month="-1" data-med-history-med="${esc(med.id)}" aria-label="Previous month">‹</button><strong>${monthLabel}</strong><button class="mini" data-med-history-month="1" data-med-history-med="${esc(med.id)}" aria-label="Next month">›</button></div>
    <div class="med-calendar-week"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
    <div class="med-calendar-grid">${cells.join("")}</div>
    ${recent.length?`<div class="med-history-recent">${recent.map(log=>`<div><span>${medDateLabel(log.date)}${log.time?` · ${esc(log.time)}`:""}</span><span><button class="mini" data-med-log-edit="${esc(log.id)}">Edit</button><button class="mini danger" data-med-log-delete="${esc(log.id)}">×</button></span></div>`).join("")}</div>`:`<p class="muted-copy">No doses recorded for this tablet yet.</p>`}
  </div>`;
}
function medicationHistoryTab(){
  const monthValue=medHistoryMonthStart();
  return `${medicationTopTabs("history")}
  <section class="med-history-by-tablet">
    ${data.medications.length?data.medications.map(m=>{
      const total=data.medicationHistory.filter(x=>String(x.medId)===String(m.id)).length;
      const isOpen=String(medicationHistoryOpenId)===String(m.id);
      return `<article class="card med-tablet-history ${isOpen?"is-open":""}">
        <button type="button" class="med-history-summary" data-med-history-toggle="${esc(m.id)}" aria-expanded="${isOpen?"true":"false"}">${medPhoto(m)}<span><strong>${esc(m.name)}</strong><small>${total} recorded ${total===1?"dose":"doses"}</small></span><span class="med-history-chevron">›</span></button>
        <div class="med-history-panel" ${isOpen?"":"hidden"}>${medCalendarFor(m,monthValue)}</div>
      </article>`;
    }).join(""):`<section class="card empty"><h2>No medication added</h2><p>Add a medication first and its calendar will appear here.</p></section>`}
  </section>`;
}

function medicationStockTab(){
  return `<section class="card"><div class="section-title"><div><span class="section-kicker">📦 Stock</span><h2>Tablet stock</h2></div></div>${data.medications.length?`<div class="med-stock-list">${data.medications.map(m=>{
    const editing=String(medicationStockEditingId)===String(m.id);
    return `<article class="${editing?"editing":""}"><div><strong>${esc(m.name)}</strong><small>${esc(m.dose||"")}</small></div>${editing?`<label class="med-stock-input-wrap"><span class="sr-only">Tablet count for ${esc(m.name)}</span><input class="field med-stock-input" data-med-stock-input="${esc(m.id)}" type="number" inputmode="numeric" pattern="[0-9]*" min="0" step="1" value="${Math.max(0,Math.floor(Number(m.stock)||0))}" enterkeyhint="done" autocomplete="off"></label><button class="mini primary" data-med-stock-save="${esc(m.id)}">Save</button><button class="mini" data-med-stock-cancel="${esc(m.id)}">Cancel</button>`:`<span class="med-stock-count">${Math.max(0,Math.floor(Number(m.stock)||0))} left</span><button class="mini" data-med-stock="${esc(m.id)}">Update</button>`}</article>`;
  }).join("")}</div>`:`<p>Add medication first.</p>`}</section>`;
}
function MedicationPage(){
  ensureMedicationData();
  const tab=data.medicationView.tab;
  const content=tab==="meds"?medicationScheduleTab():tab==="history"?medicationHistoryTab():tab==="stock"?medicationStockTab():medicationTodayTab();
  return shell(`${head("Medication","Medication centre · v17.3.6")}
    <div class="med-page">${content}</div>
    <nav class="med-bottom-tabs med-bottom-tabs-two" aria-label="Medication sections">
      <button class="${tab==="meds"?"active":""}" data-med-tab="meds">＋<small>Meds</small></button>
      <button class="${tab==="stock"?"active":""}" data-med-tab="stock">▣<small>Stock</small></button>
    </nav>`,"medication");
}
async function medCompressPhoto(file){
  return LinaImage.process(file,{width:420,height:420,fit:"contain",quality:.78,allowUpscale:false});
}
function medPopulateForm(m){
  const form=document.querySelector("#medicationAddForm");
  if(!form||!m)return false;
  document.querySelector("#medEditId").value=m.id;
  document.querySelector("#medName").value=m.name||"";
  document.querySelector("#medDose").value=m.dose||"";
  document.querySelector("#medTime").value=m.time||"";
  document.querySelector("#medInstructions").value=m.instructions||"";
  document.querySelector("#medTiming").value=medNormaliseTiming(m.timing||m.timeLabel||m.time);
  document.querySelector("#medTakeWith").value=m.takeWith||"";
  document.querySelector("#medAvoid").value=m.avoid||"";
  document.querySelector("#medGoodCombos").value=m.goodCombos||"";
  document.querySelector("#medBadCombos").value=m.badCombos||"";
  document.querySelector("#medDosesPerDay").value=m.dosesPerDay||1;
  document.querySelector("#medScheduleType").value=m.scheduleType||"daily";
  document.querySelector("#medStartDate").value=m.startDate||"";
  document.querySelector("#medEndDate").value=m.endDate||"";
  document.querySelector("#medNotes").value=m.notes||"";
  document.querySelector("#medPhotoData").value=m.photo||"";
  document.querySelector("#medPhotoPreview").innerHTML=m.photo?`<img src="${m.photo}" alt="">`:"💊";
  document.querySelector("#removeMedPhoto").classList.toggle("hidden",!m.photo);
  document.querySelectorAll("#medWeekdays input").forEach(x=>x.checked=(m.weekdays||[]).includes(x.value));
  document.querySelector("#medWeekdays").classList.toggle("hidden",m.scheduleType!=="weekdays");
  document.querySelector("#medFormTitle").textContent="Edit medication";
  document.querySelector("#saveMedication").textContent="Save changes";
  return true;
}
function medFillForm(m){
  if(!m)return;
  medicationEditingId=String(m.id);
  data.medicationView.editingId=medicationEditingId;
  medicationAddFormOpen=true;
  render();
}

function syncMedicationCompletionMap(medId,date){
  data.medicationLog=data.medicationLog&&typeof data.medicationLog==="object"?data.medicationLog:{};
  data.medicationLog[date]=data.medicationLog[date]&&typeof data.medicationLog[date]==="object"?data.medicationLog[date]:{};
  const hasDose=(data.medicationHistory||[]).some(log=>String(log.medId)===String(medId)&&log.date===date);
  if(hasDose) data.medicationLog[date][medId]=true;
  else delete data.medicationLog[date][medId];
  if(!Object.keys(data.medicationLog[date]).length) delete data.medicationLog[date];
}

function medEditLog(log){
  const med=data.medications.find(m=>m.id===log.medId);
  const date=prompt(`Date for ${med?.name||"dose"} (YYYY-MM-DD)`,log.date);
  if(date===null)return;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){toast("Use a date like 2026-07-19");return}
  const time=prompt("Time taken (HH:MM)",log.time||"");if(time===null)return;
  if(time&&!/^\d{2}:\d{2}$/.test(time)){toast("Use a time like 21:30");return}
  const notes=prompt("Optional note",log.notes||"");if(notes===null)return;
  const oldDate=log.date,medId=log.medId;
  Object.assign(log,{date,time,notes});
  syncMedicationCompletionMap(medId,oldDate);
  syncMedicationCompletionMap(medId,date);
  saveData();render();
}
function bindMedication(){
  ensureMedicationData();
  document.body.classList.toggle("med-form-open",!!medicationAddFormOpen);
  const saveStockCount=id=>{
    const input=document.querySelector(`[data-med-stock-input="${CSS.escape(String(id))}"]`);
    const value=input?.value?.trim()??"";
    if(value===""){toast("Enter the tablet count");input?.focus();return}
    const n=Number(value);
    if(!Number.isFinite(n)||n<0||!Number.isInteger(n)){toast("Enter a whole number");input?.focus();return}
    const index=data.medications.findIndex(x=>String(x.id)===String(id));
    if(index<0)return;
    data.medications[index]={...data.medications[index],stock:n};
    if(!saveData())return;
    // Verify the exact value reached local storage before closing the editor.
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");
      const savedMed=(saved.medications||[]).find(x=>String(x.id)===String(id));
      if(Number(savedMed?.stock)!==n){toast("Stock could not be saved");input?.focus();return}
    }catch{toast("Stock could not be checked");input?.focus();return}
    medicationStockEditingId="";
    toast(`${n} tablets saved`);
    render();
  };
  document.querySelectorAll("[data-med-stock]").forEach(b=>b.onclick=()=>{
    medicationStockEditingId=b.dataset.medStock;
    render();
    requestAnimationFrame(()=>{const input=document.querySelector(`[data-med-stock-input="${CSS.escape(String(medicationStockEditingId))}"]`);input?.focus();input?.select()});
  });
  document.querySelectorAll("[data-med-stock-save]").forEach(b=>b.onclick=()=>saveStockCount(b.dataset.medStockSave));
  document.querySelectorAll("[data-med-stock-cancel]").forEach(b=>b.onclick=()=>{medicationStockEditingId="";render()});
  document.querySelectorAll("[data-med-stock-input]").forEach(input=>input.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();saveStockCount(input.dataset.medStockInput)}}));
  document.querySelectorAll("[data-med-tab]").forEach(b=>b.onclick=()=>{
    const nextTab=b.dataset.medTab;
    if(nextTab==="history"&&data.medicationView.tab!=="history") medicationHistoryOpenId="";
    data.medicationView.tab=nextTab;
    if(nextTab==="today"){data.medicationView.date=medLocalDate();medicationDateTouched=false}
    saveData();render();
  });
  document.querySelectorAll("[data-med-history-toggle]").forEach(b=>b.onclick=()=>{
    const id=b.dataset.medHistoryToggle;
    medicationHistoryOpenId=String(medicationHistoryOpenId)===String(id)?"":id;
    render();
  });
  document.querySelector("#medSelectedDate")?.addEventListener("change",e=>{medicationDateTouched=true;data.medicationView.date=e.target.value||medLocalDate();saveData();render()});
  document.querySelectorAll("[data-med-take]").forEach(b=>b.onclick=()=>{
    const medId=b.dataset.medTake,date=data.medicationView.date||medLocalDate(),time=medNowTime();
    const stockAdjusted=medAdjustStockForDose(medId,-1);
    data.medicationHistory.push({id:medUid("dose"),medId,date,time,notes:"",createdAt:new Date().toISOString(),stockAdjusted});
    // Keep the original daily completion map in sync so Today and Medication
    // always agree, including for data created by older LinaHub versions.
    data.medicationLog=data.medicationLog&&typeof data.medicationLog==="object"?data.medicationLog:{};
    data.medicationLog[date]=data.medicationLog[date]&&typeof data.medicationLog[date]==="object"?data.medicationLog[date]:{};
    data.medicationLog[date][medId]=true;
    data.medicationView.date=date;saveData();b.classList.add("done");
    const med=data.medications.find(item=>String(item.id)===String(medId));
    toast(stockAdjusted?`Dose taken · ${Math.max(0,Math.floor(Number(med?.stock)||0))} tablets left`:"Dose marked as taken · stock is already 0");
    setTimeout(()=>render(),160);
  });
  document.querySelector("#medScheduleType")?.addEventListener("change",e=>document.querySelector("#medWeekdays").classList.toggle("hidden",e.target.value!=="weekdays"));
  document.querySelector("#medPhotoInput")?.addEventListener("change",async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{const photo=await medCompressPhoto(file);document.querySelector("#medPhotoData").value=photo;document.querySelector("#medPhotoPreview").innerHTML=`<img src="${photo}" alt="Medication preview">`;document.querySelector("#removeMedPhoto").classList.remove("hidden")}catch(error){toast(LinaImage.friendlyError(error))}
  });
  document.querySelector("#removeMedPhoto")?.addEventListener("click",()=>{document.querySelector("#medPhotoData").value="";document.querySelector("#medPhotoPreview").textContent="💊";document.querySelector("#removeMedPhoto").classList.add("hidden")});
  document.querySelector("#saveMedication")?.addEventListener("click",async()=>{
    const name=document.querySelector("#medName").value.trim(),scheduleType=document.querySelector("#medScheduleType").value,weekdays=[...document.querySelectorAll("#medWeekdays input:checked")].map(x=>x.value);
    if(!name){toast("Add the medication name");return}if(scheduleType==="weekdays"&&!weekdays.length){toast("Select at least one day");return}
    const dosesPerDay=Math.max(1,Math.min(12,Number(document.querySelector("#medDosesPerDay").value)||1));
    const selectedTiming=medNormaliseTiming(document.querySelector("#medTiming").value);
    const med={id:document.querySelector("#medEditId").value||medUid(),name,dose:document.querySelector("#medDose").value.trim(),instructions:document.querySelector("#medInstructions").value.trim(),timing:selectedTiming,timeLabel:selectedTiming,takeWith:document.querySelector("#medTakeWith").value.trim(),avoid:document.querySelector("#medAvoid").value.trim(),goodCombos:document.querySelector("#medGoodCombos").value.trim(),badCombos:document.querySelector("#medBadCombos").value.trim(),scheduleType,weekdays,time:document.querySelector("#medTime").value,startDate:document.querySelector("#medStartDate").value,endDate:document.querySelector("#medEndDate").value,photo:document.querySelector("#medPhotoData").value,notes:document.querySelector("#medNotes").value.trim(),active:true,dosesPerDay};
    med.photoKey=`medication:${med.id}`;
    try{
      if(/^data:image\//.test(med.photo||"")) await LinaImage.save(med.photoKey,med.photo);
      else if(!med.photo) await LinaImage.remove(med.photoKey).catch(()=>{});
    }catch(error){toast(LinaImage.friendlyError(error));return}
    const existing=data.medications.findIndex(x=>x.id===med.id);
    med.stock=existing>=0?Math.max(0,Math.floor(Number(data.medications[existing].stock)||0)):0;
    if(existing>=0)data.medications[existing]=med;else data.medications.push(med);data.medicationView.tab="meds";medicationAddFormOpen=false;medicationEditingId="";data.medicationView.editingId="";document.body.classList.remove("med-form-open");data.medicationView.date=medLocalDate();medicationDateTouched=false;saveData();render();toast(existing>=0?"Medication updated":"Medication added");
  });
  const closeMedForm=()=>{medicationAddFormOpen=false;medicationEditingId="";data.medicationView.editingId="";document.body.classList.remove("med-form-open");render()};
  document.querySelector("#openMedicationForm")?.addEventListener("click",()=>{medicationEditingId="";data.medicationView.editingId="";medicationAddFormOpen=true;render();requestAnimationFrame(()=>document.querySelector("#medName")?.focus())});
  document.querySelector("#closeMedicationForm")?.addEventListener("click",closeMedForm);
  document.querySelector("#cancelMedEdit")?.addEventListener("click",closeMedForm);
  document.querySelector("#medicationFormBackdrop")?.addEventListener("click",event=>{if(event.target?.matches?.("[data-close-med-form]"))closeMedForm()});
  document.querySelectorAll("[data-med-edit]").forEach(b=>b.onclick=()=>{const m=data.medications.find(x=>x.id===b.dataset.medEdit);if(m)medFillForm(m)});
  document.querySelectorAll("[data-med-edit-today]").forEach(b=>b.onclick=()=>{const id=b.dataset.medEditToday;data.medicationView.tab="meds";saveData();render();requestAnimationFrame(()=>{const m=data.medications.find(x=>x.id===id);if(m)medFillForm(m)})});
  document.querySelectorAll("[data-med-delete]").forEach(b=>b.onclick=()=>{const m=data.medications.find(x=>x.id===b.dataset.medDelete);if(!m||!confirm(`Remove ${m.name}? Its dose history will be kept.`))return;data.medications=data.medications.filter(x=>x.id!==m.id);saveData();render()});
  document.querySelector("#medHistoryFilter")?.addEventListener("change",e=>{data.medicationView.historyMed=e.target.value;saveData();render()});
  document.querySelectorAll("[data-med-log-edit]").forEach(b=>b.onclick=()=>{const log=data.medicationHistory.find(x=>x.id===b.dataset.medLogEdit);if(log)medEditLog(log)});
  document.querySelectorAll("[data-med-history-month]").forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();medicationHistoryOpenId=b.dataset.medHistoryMed;data.medicationView.historyMonth=medShiftMonth(medHistoryMonthStart(),Number(b.dataset.medHistoryMonth)||0);saveData();render()});
  document.querySelectorAll("[data-med-open-history]").forEach(b=>b.onclick=()=>{data.medicationView.tab="history";data.medicationView.historyMed=b.dataset.medOpenHistory;saveData();render()});
  document.querySelectorAll("[data-med-log-delete]").forEach(b=>b.onclick=()=>{if(!confirm("Delete this dose record?"))return;const log=data.medicationHistory.find(x=>x.id===b.dataset.medLogDelete);data.medicationHistory=data.medicationHistory.filter(x=>x.id!==b.dataset.medLogDelete);if(log){if(log.stockAdjusted)medAdjustStockForDose(log.medId,1);syncMedicationCompletionMap(log.medId,log.date)}saveData();render()});
}



/* LinaHub 17.8.0 — medication stock audit, refills and low-stock warnings */
const medAdjustStockForDoseBase1780=medAdjustStockForDose;
medAdjustStockForDose=function(medId,change,reason="dose"){
  const med=(data.medications||[]).find(x=>String(x.id)===String(medId));if(!med)return false;
  const before=Math.max(0,Math.floor(Number(med.stock)||0)),ok=medAdjustStockForDoseBase1780(medId,change),after=Math.max(0,Math.floor(Number(med.stock)||0));
  if(ok&&before!==after){data.medicationStockAudit=Array.isArray(data.medicationStockAudit)?data.medicationStockAudit:[];data.medicationStockAudit.push({id:medUid("stock"),medId:String(medId),before,after,change:after-before,reason,date:medLocalDate(),createdAt:new Date().toISOString()})}
  return ok;
};
const medicationStockTabBase1780=medicationStockTab;
medicationStockTab=function(){
  data.medicationStockAudit=Array.isArray(data.medicationStockAudit)?data.medicationStockAudit:[];
  return `<section class="card"><div class="section-title"><div><span class="section-kicker">📦 Stock</span><h2>Tablet stock</h2></div></div>${data.medications.length?`<div class="med-stock-list">${data.medications.map(m=>{const count=Math.max(0,Math.floor(Number(m.stock)||0)),low=count<=Math.max(3,Number(m.lowStockThreshold)||7),audit=data.medicationStockAudit.filter(x=>String(x.medId)===String(m.id)).slice(-6).reverse();return `<article class="med-stock-expanded ${low?"low-stock":""}"><div class="med-stock-main"><div><strong>${esc(m.name)}</strong><small>${esc(m.dose||"")}${low?" · Low stock":""}</small></div><span class="med-stock-count">${count} left</span></div><div class="med-stock-actions"><button class="mini primary" data-med-refill="${esc(m.id)}">+ Refill</button><button class="mini" data-med-correct="${esc(m.id)}">Correct count</button><label>Warn at <input type="number" min="0" max="999" value="${Math.max(0,Number(m.lowStockThreshold)||7)}" data-med-low-threshold="${esc(m.id)}"></label></div><details><summary>Stock history (${audit.length})</summary><div class="med-stock-audit">${audit.map(a=>`<div><span>${medDateLabel(a.date)} · ${esc(a.reason)}</span><b>${a.before} → ${a.after}</b></div>`).join("")||"<p>No stock changes recorded yet.</p>"}</div></details></article>`}).join("")}</div>`:"<p>Add medication first.</p>"}</section>`;
};
const bindMedicationBase1780=bindMedication;
bindMedication=function(){
  bindMedicationBase1780();
  data.medicationStockAudit=Array.isArray(data.medicationStockAudit)?data.medicationStockAudit:[];
  document.querySelectorAll("[data-med-refill]").forEach(b=>b.onclick=()=>{const med=data.medications.find(x=>String(x.id)===String(b.dataset.medRefill));if(!med)return;const amount=Number(prompt(`How many ${med.name} tablets were added?`,`28`));if(!Number.isInteger(amount)||amount<=0)return;const before=med.stock||0;med.stock=before+amount;data.medicationStockAudit.push({id:medUid("stock"),medId:med.id,before,after:med.stock,change:amount,reason:"Refill",date:medLocalDate(),createdAt:new Date().toISOString()});saveData();toast(`${amount} tablets added`);render()});
  document.querySelectorAll("[data-med-correct]").forEach(b=>b.onclick=()=>{const med=data.medications.find(x=>String(x.id)===String(b.dataset.medCorrect));if(!med)return;const next=Number(prompt(`Actual ${med.name} stock`,String(med.stock||0)));if(!Number.isInteger(next)||next<0)return;const note=prompt("Reason for correction","Manual count")||"Manual correction",before=med.stock||0;med.stock=next;data.medicationStockAudit.push({id:medUid("stock"),medId:med.id,before,after:next,change:next-before,reason:note,date:medLocalDate(),createdAt:new Date().toISOString()});saveData();toast("Stock corrected with audit record");render()});
  document.querySelectorAll("[data-med-low-threshold]").forEach(input=>input.onchange=()=>{const med=data.medications.find(x=>String(x.id)===String(input.dataset.medLowThreshold));if(!med)return;med.lowStockThreshold=Math.max(0,Math.floor(Number(input.value)||0));saveData();render()});
};
