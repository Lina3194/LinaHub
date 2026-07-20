const MED_WEEKDAYS=LINAHUB_WEEKDAYS;
let medicationDateTouched=false;

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
  data.medicationView.tab=["today","schedule","history"].includes(data.medicationView.tab)?data.medicationView.tab:"today";
  if(!medicationDateTouched) data.medicationView.date=medLocalDate();
  else data.medicationView.date=data.medicationView.date||medLocalDate();
  data.medications=data.medications.map((m,i)=>({
    id:m.id||medUid(`med-${i}`),name:m.name||"Medication",dose:m.dose||"",instructions:m.instructions||m.notes||"",
    scheduleType:m.scheduleType||((m.time||"").toLowerCase()==="as needed"?"prn":"daily"),
    weekdays:Array.isArray(m.weekdays)?m.weekdays:[],time:/^\d{2}:\d{2}$/.test(m.time||"")?m.time:"",
    timeLabel:!/^\d{2}:\d{2}$/.test(m.time||"")&&m.time!=="As needed"?(m.time||""):"",
    startDate:m.startDate||"",endDate:m.endDate||"",photo:m.photo||"",notes:m.notes||"",active:m.active!==false
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
}
function medDateLabel(value){
  if(!value)return "";
  return new Date(`${value}T12:00:00`).toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"});
}
function medDueOn(m,dateValue){
  return medicationDueOnDate(m,dateValue);
}
function medLogsFor(medId,dateValue){
  return data.medicationHistory.filter(x=>x.medId===medId&&x.date===dateValue).sort((a,b)=>(a.time||"").localeCompare(b.time||""));
}
function medPhoto(m,large=false){
  return m.photo?`<img class="med-photo ${large?"large":""}" src="${m.photo}" alt="${esc(m.name)}">`:`<span class="med-photo med-photo-placeholder ${large?"large":""}">💊</span>`;
}
function medicationTodayTab(){
  const selected=data.medicationView.date||medLocalDate();
  const meds=data.medications.filter(m=>medDueOn(m,selected));
  return `<section class="med-date-card card">
    <div><span class="section-kicker">📅 Selected day</span><h2>${medDateLabel(selected)}</h2></div>
    <input class="field med-day-picker" id="medSelectedDate" type="date" value="${esc(selected)}">
  </section>
  <section class="med-dose-list">
    ${meds.length?meds.map(m=>{
      const logs=medLogsFor(m.id,selected),defaultTime=m.time||medNowTime();
      return `<article class="card med-dose-card">
        <div class="med-card-head">${medPhoto(m)}<div><h2>${esc(m.name)}</h2><p>${esc([m.dose,m.time||m.timeLabel,m.scheduleType==="prn"?"As needed":""].filter(Boolean).join(" · "))}</p></div><span class="med-status ${logs.length?"taken":"due"}">${logs.length?`✓ ${logs.length>1?`${logs.length} doses`:`Taken`}`:(m.scheduleType==="prn"?"As needed":"Due")}</span></div>
        ${m.instructions?`<p class="med-instructions">${esc(m.instructions)}</p>`:""}
        ${logs.length?`<div class="med-taken-list">${logs.map(log=>`<div><span>✓ Taken ${log.time?`at ${esc(log.time)}`:""}</span><button class="mini" data-med-log-edit="${esc(log.id)}">Edit</button></div>`).join("")}</div>`:""}
        <div class="med-mark-row">
          <label class="med-dose-field"><span>Date taken</span><input class="field" id="doseDate-${m.id}" type="date" value="${esc(selected)}" aria-label="Dose date"></label>
          <label class="med-dose-field"><span>Time taken</span><input class="field" id="doseTime-${m.id}" type="time" value="${esc(defaultTime)}" aria-label="Dose time"></label>
          <button class="primary med-taken-button" data-med-take="${esc(m.id)}">✓ Mark taken</button>
        </div>
      </article>`;
    }).join(""):`<section class="card empty"><h2>Nothing scheduled</h2><p>No medication is due on this day. As-needed medication will still appear here.</p></section>`}
  </section>`;
}
function medicationScheduleTab(){
  const meds=data.medications;
  return `<section class="card med-add-card">
    <div class="section-title"><div><span class="section-kicker">➕ Medication</span><h2 id="medFormTitle">Add medication</h2></div></div>
    <input id="medEditId" type="hidden">
    <div class="med-photo-editor">
      <label class="med-photo-upload" for="medPhotoInput"><span id="medPhotoPreview">💊</span><b>Add a small photo</b><small>Useful when filling your pill box</small></label>
      <input id="medPhotoInput" type="file" accept="image/*" capture="environment" hidden>
      <input id="medPhotoData" type="hidden">
      <button class="mini hidden" id="removeMedPhoto" type="button">Remove photo</button>
    </div>
    <div class="form-grid">
      <input class="field" id="medName" placeholder="Medication name">
      <div class="two-col"><input class="field" id="medDose" placeholder="Dose, e.g. 25 mg"><input class="field" id="medTime" type="time" aria-label="Usual time"></div>
      <input class="field" id="medInstructions" placeholder="Instructions, e.g. take with food">
      <select class="field" id="medScheduleType"><option value="daily">Every day</option><option value="weekdays">Every week on selected days</option><option value="prn">As needed (PRN)</option></select>
      <div class="med-weekdays hidden" id="medWeekdays">${MED_WEEKDAYS.map(day=>`<label><input type="checkbox" value="${day}"><span>${day}</span></label>`).join("")}</div>
      <div class="two-col"><label class="field-label">Start date<input class="field" id="medStartDate" type="date"></label><label class="field-label">End date (optional)<input class="field" id="medEndDate" type="date"></label></div>
      <textarea class="field" id="medNotes" rows="3" placeholder="Extra notes"></textarea>
      <div class="two-col"><button class="primary" id="saveMedication" type="button">Add medication</button><button class="secondary hidden" id="cancelMedEdit" type="button">Cancel edit</button></div>
    </div>
  </section>
  <section class="card"><div class="section-title"><div><span class="section-kicker">💊 Your list</span><h2>Current and future medication</h2></div></div>
    <div class="med-schedule-list">${meds.length?meds.map(m=>`<div class="med-schedule-row">${medPhoto(m)}<div><strong>${esc(m.name)}</strong><small>${esc([m.dose,m.scheduleType==="daily"?"Daily":m.scheduleType==="prn"?"As needed":m.weekdays.join(", "),m.time,m.startDate?`from ${medDateLabel(m.startDate)}`:"",m.endDate?`until ${medDateLabel(m.endDate)}`:""].filter(Boolean).join(" · "))}</small></div><button class="mini" data-med-edit="${esc(m.id)}">Edit</button><button class="mini danger" data-med-delete="${esc(m.id)}">×</button></div>`).join(""):`<p>No medications added yet.</p>`}</div>
  </section>`;
}
function medicationHistoryTab(){
  const filter=data.medicationView.historyMed||"all";
  const logs=[...data.medicationHistory].filter(x=>filter==="all"||x.medId===filter).sort((a,b)=>`${b.date} ${b.time||""}`.localeCompare(`${a.date} ${a.time||""}`));
  return `<section class="card med-history-controls"><div><span class="section-kicker">📖 Dose history</span><h2>${logs.length} recorded ${logs.length===1?"dose":"doses"}</h2></div><select class="field" id="medHistoryFilter"><option value="all">All medication</option>${data.medications.map(m=>`<option value="${esc(m.id)}" ${filter===m.id?"selected":""}>${esc(m.name)}</option>`).join("")}</select></section>
  <section class="med-history-list">${logs.length?logs.map(log=>{const m=data.medications.find(x=>x.id===log.medId);return `<article class="card med-history-row">${m?medPhoto(m):`<span class="med-photo med-photo-placeholder">💊</span>`}<div><h2>${esc(m?.name||"Removed medication")}</h2><p>${medDateLabel(log.date)}${log.time?` · ${esc(log.time)}`:""}${log.notes?` · ${esc(log.notes)}`:""}</p></div><button class="mini" data-med-log-edit="${esc(log.id)}">Edit</button><button class="mini danger" data-med-log-delete="${esc(log.id)}">×</button></article>`}).join(""):`<section class="card empty"><h2>No doses recorded</h2><p>Marked doses will appear here with their exact date and time.</p></section>`}</section>`;
}
function MedicationPage(){
  ensureMedicationData();
  const tab=data.medicationView.tab;
  const content=tab==="schedule"?medicationScheduleTab():tab==="history"?medicationHistoryTab():medicationTodayTab();
  return shell(`${head("Medication","Medication centre · v15.5")}
    <div class="med-page">${content}</div>
    <nav class="med-bottom-tabs" aria-label="Medication sections">
      <button class="${tab==="today"?"active":""}" data-med-tab="today">✓<small>Day</small></button>
      <button class="${tab==="schedule"?"active":""}" data-med-tab="schedule">＋<small>Medication</small></button>
      <button class="${tab==="history"?"active":""}" data-med-tab="history">◷<small>History</small></button>
    </nav>`,"medication");
}
function medCompressPhoto(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error("Could not read photo"));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error("Could not open photo"));
      img.onload=()=>{
        const max=420,scale=Math.min(1,max/Math.max(img.width,img.height));
        const canvas=document.createElement("canvas");canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));
        canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
        resolve(canvas.toDataURL("image/jpeg",.78));
      };img.src=reader.result;
    };reader.readAsDataURL(file);
  });
}
function medFillForm(m){
  document.querySelector("#medEditId").value=m.id;
  document.querySelector("#medName").value=m.name;
  document.querySelector("#medDose").value=m.dose;
  document.querySelector("#medTime").value=m.time;
  document.querySelector("#medInstructions").value=m.instructions;
  document.querySelector("#medScheduleType").value=m.scheduleType;
  document.querySelector("#medStartDate").value=m.startDate;
  document.querySelector("#medEndDate").value=m.endDate;
  document.querySelector("#medNotes").value=m.notes;
  document.querySelector("#medPhotoData").value=m.photo;
  document.querySelector("#medPhotoPreview").innerHTML=m.photo?`<img src="${m.photo}" alt="">`:"💊";
  document.querySelector("#removeMedPhoto").classList.toggle("hidden",!m.photo);
  document.querySelectorAll("#medWeekdays input").forEach(x=>x.checked=m.weekdays.includes(x.value));
  document.querySelector("#medWeekdays").classList.toggle("hidden",m.scheduleType!=="weekdays");
  document.querySelector("#medFormTitle").textContent="Edit medication";
  document.querySelector("#saveMedication").textContent="Save changes";
  document.querySelector("#cancelMedEdit").classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}
function medEditLog(log){
  const med=data.medications.find(m=>m.id===log.medId);
  const date=prompt(`Date for ${med?.name||"dose"} (YYYY-MM-DD)`,log.date);
  if(date===null)return;
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date)){toast("Use a date like 2026-07-19");return}
  const time=prompt("Time taken (HH:MM)",log.time||"");if(time===null)return;
  if(time&&!/^\d{2}:\d{2}$/.test(time)){toast("Use a time like 21:30");return}
  const notes=prompt("Optional note",log.notes||"");if(notes===null)return;
  Object.assign(log,{date,time,notes});saveData();render();
}
function bindMedication(){
  ensureMedicationData();
  document.querySelectorAll("[data-med-tab]").forEach(b=>b.onclick=()=>{data.medicationView.tab=b.dataset.medTab;saveData();render()});
  document.querySelector("#medSelectedDate")?.addEventListener("change",e=>{medicationDateTouched=true;data.medicationView.date=e.target.value||medLocalDate();saveData();render()});
  document.querySelectorAll("[data-med-take]").forEach(b=>b.onclick=()=>{
    const medId=b.dataset.medTake,date=document.querySelector(`#doseDate-${CSS.escape(medId)}`)?.value||data.medicationView.date,time=document.querySelector(`#doseTime-${CSS.escape(medId)}`)?.value||"";
    data.medicationHistory.push({id:medUid("dose"),medId,date,time,notes:"",createdAt:new Date().toISOString()});
    data.medicationView.date=date;saveData();render();toast("Dose marked as taken");
  });
  document.querySelector("#medScheduleType")?.addEventListener("change",e=>document.querySelector("#medWeekdays").classList.toggle("hidden",e.target.value!=="weekdays"));
  document.querySelector("#medPhotoInput")?.addEventListener("change",async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{const photo=await medCompressPhoto(file);document.querySelector("#medPhotoData").value=photo;document.querySelector("#medPhotoPreview").innerHTML=`<img src="${photo}" alt="Medication preview">`;document.querySelector("#removeMedPhoto").classList.remove("hidden")}catch{toast("That photo could not be added")}
  });
  document.querySelector("#removeMedPhoto")?.addEventListener("click",()=>{document.querySelector("#medPhotoData").value="";document.querySelector("#medPhotoPreview").textContent="💊";document.querySelector("#removeMedPhoto").classList.add("hidden")});
  document.querySelector("#saveMedication")?.addEventListener("click",()=>{
    const name=document.querySelector("#medName").value.trim(),scheduleType=document.querySelector("#medScheduleType").value,weekdays=[...document.querySelectorAll("#medWeekdays input:checked")].map(x=>x.value);
    if(!name){toast("Add the medication name");return}if(scheduleType==="weekdays"&&!weekdays.length){toast("Select at least one day");return}
    const med={id:document.querySelector("#medEditId").value||medUid(),name,dose:document.querySelector("#medDose").value.trim(),instructions:document.querySelector("#medInstructions").value.trim(),scheduleType,weekdays,time:document.querySelector("#medTime").value,startDate:document.querySelector("#medStartDate").value,endDate:document.querySelector("#medEndDate").value,photo:document.querySelector("#medPhotoData").value,notes:document.querySelector("#medNotes").value.trim(),active:true};
    const existing=data.medications.findIndex(x=>x.id===med.id);if(existing>=0)data.medications[existing]=med;else data.medications.push(med);data.medicationView.tab="today";data.medicationView.date=medLocalDate();medicationDateTouched=false;saveData();render();toast(existing>=0?"Medication updated":"Medication added");
  });
  document.querySelector("#cancelMedEdit")?.addEventListener("click",()=>render());
  document.querySelectorAll("[data-med-edit]").forEach(b=>b.onclick=()=>{const m=data.medications.find(x=>x.id===b.dataset.medEdit);if(m)medFillForm(m)});
  document.querySelectorAll("[data-med-delete]").forEach(b=>b.onclick=()=>{const m=data.medications.find(x=>x.id===b.dataset.medDelete);if(!m||!confirm(`Remove ${m.name}? Its dose history will be kept.`))return;data.medications=data.medications.filter(x=>x.id!==m.id);saveData();render()});
  document.querySelector("#medHistoryFilter")?.addEventListener("change",e=>{data.medicationView.historyMed=e.target.value;saveData();render()});
  document.querySelectorAll("[data-med-log-edit]").forEach(b=>b.onclick=()=>{const log=data.medicationHistory.find(x=>x.id===b.dataset.medLogEdit);if(log)medEditLog(log)});
  document.querySelectorAll("[data-med-log-delete]").forEach(b=>b.onclick=()=>{if(!confirm("Delete this dose record?"))return;data.medicationHistory=data.medicationHistory.filter(x=>x.id!==b.dataset.medLogDelete);saveData();render()});
}
