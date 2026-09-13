const GLUCOSE_FEELINGS=[
  ["Okay","🙂"],["Shaky","🫨"],["Dizzy","💫"],["Weak","🪫"],["Sleepy","😴"],["Hungry","🍽️"],
  ["Sweaty","💦"],["Headache","🤕"],["Nauseous","🤢"],["Thirsty","🥤"],["Brain fog","🌫️"],["Heart racing","💓"]
];
const GLUCOSE_FOODS=[
  ["Cereal","🥣"],["Fruit","🍓"],["Snacks","🍿"],["Junk food","🍔"],["Hot chocolate","☕"],["Tea","🫖"],
  ["Pasta","🍝"],["Chicken","🍗"],["Red meat","🥩"],["Rice","🍚"],["Potatoes","🥔"],["Bread","🍞"],
  ["Vegetables","🥦"],["Dairy","🥛"],["Dessert / sweets","🍰"],["Other","✨"]
];
let glucoseUi={tab:"log",editingId:""};

function glucoseEnsureData(){
  data.glucoseEntries=Array.isArray(data.glucoseEntries)?data.glucoseEntries:[];
  data.glucoseEntries=data.glucoseEntries.map(entry=>({
    id:String(entry?.id||`glucose-${Date.now()}-${Math.random().toString(36).slice(2,7)}`),
    date:String(entry?.date||today()),
    time:String(entry?.time||""),
    value:entry?.value===""?"":Number(entry?.value),
    unit:entry?.unit||"mmol/L",
    timing:entry?.timing==="after"?"after":"before",
    mealTypes:Array.isArray(entry?.mealTypes)?entry.mealTypes:[],
    otherFood:String(entry?.otherFood||""),
    feelingBefore:Array.isArray(entry?.feelingBefore)?entry.feelingBefore:[],
    feelingAfter:Array.isArray(entry?.feelingAfter)?entry.feelingAfter:[],
    notes:String(entry?.notes||""),
    createdAt:entry?.createdAt||`${entry?.date||today()}T${entry?.time||"12:00"}:00`
  }));
}
function glucoseNowTime(){return new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit",hour12:false})}
function glucosePrettyDate(date){try{return new Date(`${date}T12:00:00`).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}catch{return date}}
function glucoseChipGroup(kind,items,selected=[]){
  return `<div class="glucose-chip-grid" data-glucose-chip-group="${kind}">${items.map(([label,emoji])=>`<button type="button" class="glucose-chip ${selected.includes(label)?"active":""}" data-glucose-chip="${kind}" data-value="${esc(label)}"><span>${emoji}</span><b>${esc(label)}</b></button>`).join("")}</div>`;
}
function glucoseEntrySort(a,b){return `${b.date||""}T${b.time||"00:00"}`.localeCompare(`${a.date||""}T${a.time||"00:00"}`)}
function glucoseLatest(){glucoseEnsureData();return data.glucoseEntries.slice().sort(glucoseEntrySort)[0]||null}
function glucoseHistory(){
  const entries=data.glucoseEntries.slice().sort(glucoseEntrySort);
  if(!entries.length)return `<section class="card empty glucose-empty"><span>🩸</span><h2>No readings yet</h2><p>Your glucose readings will appear here after you save them.</p></section>`;
  return `<section class="card glucose-history-card"><div class="section-title"><div><span class="section-kicker">History</span><h2>${entries.length} reading${entries.length===1?"":"s"}</h2></div></div><div class="glucose-history-list">${entries.map(entry=>{
    const before=(entry.feelingBefore||[]).join(", ");
    const after=(entry.feelingAfter||[]).join(", ");
    const food=[...(entry.mealTypes||[]),entry.otherFood].filter(Boolean).join(", ");
    return `<article class="glucose-history-row">
      <div class="glucose-reading-badge"><strong>${Number.isFinite(Number(entry.value))?esc(entry.value):"—"}</strong><small>${esc(entry.unit||"mmol/L")}</small></div>
      <div class="glucose-history-copy"><strong>${entry.timing==="after"?"After food":"Before food"}</strong><small>${glucosePrettyDate(entry.date)} · ${esc(entry.time||"Time not saved")}</small>${before?`<p><b>Before:</b> ${esc(before)}</p>`:""}${food?`<p><b>Food:</b> ${esc(food)}</p>`:""}${after?`<p><b>After:</b> ${esc(after)}</p>`:""}${entry.notes?`<p><b>Notes:</b> ${esc(entry.notes)}</p>`:""}</div>
      <div class="glucose-history-actions"><button type="button" class="mini" data-glucose-edit="${esc(entry.id)}">Edit</button><button type="button" class="mini danger" data-glucose-delete="${esc(entry.id)}">×</button></div>
    </article>`;
  }).join("")}</div></section>`;
}
function glucoseLogForm(){
  glucoseEnsureData();
  const entry=glucoseUi.editingId?data.glucoseEntries.find(x=>x.id===glucoseUi.editingId):null;
  const timing=entry?.timing||"before";
  const selectedBefore=entry?.feelingBefore||[];
  const selectedAfter=entry?.feelingAfter||[];
  const selectedFoods=entry?.mealTypes||[];
  return `<section class="card glucose-log-card">
    <div class="section-title"><div><span class="section-kicker">🩸 Glucose</span><h2>${entry?"Edit reading":"Log a reading"}</h2></div>${entry?`<button type="button" class="mini" id="cancelGlucoseEdit">Cancel edit</button>`:""}</div>
    <div class="glucose-value-row"><label><span>Glucose reading</span><div class="glucose-value-input"><input class="field" id="glucoseValue" inputmode="decimal" type="number" min="0" step="0.1" placeholder="e.g. 5.4" value="${entry?.value??""}"><span>mmol/L</span></div></label><label><span>Time</span><input class="field" id="glucoseTime" type="time" value="${esc(entry?.time||glucoseNowTime())}"></label><label><span>Date</span><input class="field" id="glucoseDate" type="date" max="${today()}" value="${esc(entry?.date||today())}"></label></div>
    <div class="glucose-timing-picker" role="group" aria-label="Before or after food"><button type="button" class="${timing==="before"?"active":""}" data-glucose-timing="before">Before food</button><button type="button" class="${timing==="after"?"active":""}" data-glucose-timing="after">After food</button></div>
    <input type="hidden" id="glucoseTiming" value="${timing}">
    <section class="glucose-conditional before-panel ${timing==="before"?"":"hidden"}" data-glucose-panel="before">
      <h3>How are you feeling right now?</h3><p class="helper-text">Choose as many as apply.</p>${glucoseChipGroup("feelingBefore",GLUCOSE_FEELINGS,selectedBefore)}
    </section>
    <section class="glucose-conditional after-panel ${timing==="after"?"":"hidden"}" data-glucose-panel="after">
      <h3>How did you feel before eating?</h3><p class="helper-text">Choose as many as apply.</p>${glucoseChipGroup("feelingBefore",GLUCOSE_FEELINGS,selectedBefore)}
      <h3>What did you have?</h3><p class="helper-text">Pick everything that was part of the meal or snack.</p>${glucoseChipGroup("mealTypes",GLUCOSE_FOODS,selectedFoods)}
      <input class="field glucose-other-food ${selectedFoods.includes("Other")?"":"hidden"}" id="glucoseOtherFood" placeholder="Other food or drink…" value="${esc(entry?.otherFood||"")}">
      <h3>How are you feeling now?</h3><p class="helper-text">Choose as many as apply.</p>${glucoseChipGroup("feelingAfter",GLUCOSE_FEELINGS,selectedAfter)}
    </section>
    <label class="glucose-notes"><span>Notes <small>(optional)</small></span><textarea class="field" id="glucoseNotes" rows="3" placeholder="Anything else you want to remember…">${esc(entry?.notes||"")}</textarea></label>
    <button type="button" class="primary glucose-save" id="saveGlucoseReading">${entry?"Save changes":"Save glucose reading"}</button>
  </section>`;
}
function GlucosePage(){
  glucoseEnsureData();
  const latest=glucoseLatest();
  return shell(`${head("Glucose","Finger-prick readings and how you felt","home")}
    <section class="glucose-summary card"><div><span class="section-kicker">Latest reading</span><h2>${latest?`${esc(latest.value)} mmol/L`:"No reading yet"}</h2><p>${latest?`${latest.timing==="after"?"After food":"Before food"} · ${glucosePrettyDate(latest.date)} · ${esc(latest.time||"")}`:"Log your first reading whenever you're ready."}</p></div><span class="glucose-summary-icon">🩸</span></section>
    <div class="glucose-tabs"><button type="button" class="${glucoseUi.tab==="log"?"active":""}" data-glucose-tab="log">Log</button><button type="button" class="${glucoseUi.tab==="history"?"active":""}" data-glucose-tab="history">History</button></div>
    ${glucoseUi.tab==="history"?glucoseHistory():glucoseLogForm()}
  `,"glucose");
}
function glucoseSelectedValues(kind){return [...document.querySelectorAll(`[data-glucose-chip="${kind}"].active`)].map(x=>x.dataset.value)}
function bindGlucose(){
  glucoseEnsureData();
  document.querySelectorAll("[data-glucose-tab]").forEach(button=>button.onclick=()=>{glucoseUi.tab=button.dataset.glucoseTab;glucoseUi.editingId="";render()});
  document.querySelectorAll("[data-glucose-timing]").forEach(button=>button.onclick=()=>{
    const timing=button.dataset.glucoseTiming;
    document.querySelector("#glucoseTiming").value=timing;
    document.querySelectorAll("[data-glucose-timing]").forEach(x=>x.classList.toggle("active",x.dataset.glucoseTiming===timing));
    document.querySelector('[data-glucose-panel="before"]')?.classList.toggle("hidden",timing!=="before");
    document.querySelector('[data-glucose-panel="after"]')?.classList.toggle("hidden",timing!=="after");
  });
  document.querySelectorAll("[data-glucose-chip]").forEach(button=>button.onclick=()=>{
    button.classList.toggle("active");
    if(button.dataset.glucoseChip==="mealTypes"&&button.dataset.value==="Other")document.querySelector("#glucoseOtherFood")?.classList.toggle("hidden",!button.classList.contains("active"));
  });
  document.querySelector("#cancelGlucoseEdit")?.addEventListener("click",()=>{glucoseUi.editingId="";render()});
  document.querySelector("#saveGlucoseReading")?.addEventListener("click",()=>{
    const raw=String(document.querySelector("#glucoseValue")?.value||"").replace(",",".");
    const value=Number(raw);
    if(!Number.isFinite(value)||value<=0){toast("Add your glucose number first");document.querySelector("#glucoseValue")?.focus();return}
    const timing=document.querySelector("#glucoseTiming")?.value==="after"?"after":"before";
    const entry={
      id:glucoseUi.editingId||`glucose-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      date:document.querySelector("#glucoseDate")?.value||today(),time:document.querySelector("#glucoseTime")?.value||glucoseNowTime(),value,unit:"mmol/L",timing,
      feelingBefore:glucoseSelectedValues("feelingBefore"),
      mealTypes:timing==="after"?glucoseSelectedValues("mealTypes"):[],
      otherFood:timing==="after"?(document.querySelector("#glucoseOtherFood")?.value||"").trim():"",
      feelingAfter:timing==="after"?glucoseSelectedValues("feelingAfter"):[],
      notes:(document.querySelector("#glucoseNotes")?.value||"").trim(),createdAt:new Date().toISOString()
    };
    const existing=data.glucoseEntries.findIndex(x=>x.id===entry.id);
    if(existing>=0){entry.createdAt=data.glucoseEntries[existing].createdAt||entry.createdAt;data.glucoseEntries[existing]=entry}else data.glucoseEntries.push(entry);
    glucoseUi.editingId="";saveData();toast("Glucose reading saved 🩸");glucoseUi.tab="history";render();
  });
  document.querySelectorAll("[data-glucose-edit]").forEach(button=>button.onclick=()=>{glucoseUi.editingId=button.dataset.glucoseEdit;glucoseUi.tab="log";render()});
  document.querySelectorAll("[data-glucose-delete]").forEach(button=>button.onclick=()=>{if(!confirm("Delete this glucose reading?"))return;data.glucoseEntries=data.glucoseEntries.filter(x=>x.id!==button.dataset.glucoseDelete);saveData();render();toast("Reading removed")});
}
