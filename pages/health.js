
function entryTimestamp(dateValue){
  const now=new Date();
  const pad=n=>String(n).padStart(2,"0");
  return {
    date:dateValue||`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`,
    time:`${pad(now.getHours())}:${pad(now.getMinutes())}`,
    createdAt:now.toISOString()
  };
}
function healthEntryTime(entry){
  if(entry.time) return entry.time;
  if(entry.createdAt){
    const d=new Date(entry.createdAt);
    if(!Number.isNaN(d.getTime())) return d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
  }
  return "";
}
function healthSortValue(entry){
  return entry.createdAt||`${entry.date||""}T${entry.time||"00:00"}`;
}
function HealthPage(){
 const weights=[...(data.weightEntries||[])].sort((a,b)=>healthSortValue(b).localeCompare(healthSortValue(a)));
 const measures=[...(data.measurements||[])].sort((a,b)=>healthSortValue(b).localeCompare(healthSortValue(a)));
 const latest=weights[0];
 const hour=new Date().getHours();
 const period=hour<14?"Morning":hour>=17?"Evening":"Daytime";
 return shell(`${head("Weight & Measures",`${period} check-in · Track changes gently over time`)}
 <section class="card health-overview"><div class="stat-grid"><div class="stat"><span>Latest weight</span><strong>${latest?`${esc(latest.weight)} kg`:"—"}</strong>${latest?`<small>${esc(formatDate(latest.date))}${healthEntryTime(latest)?` · ${esc(healthEntryTime(latest))}`:""}</small>`:""}</div><div class="stat"><span>Weight entries</span><strong>${weights.length}</strong><small>Your private history</small></div></div></section>
 <section class="card"><div class="section-title"><div><span class="section-kicker">⚖️ Track</span><h2>Add weight</h2></div><span class="live-time">Time added automatically</span></div><div class="two-col"><input class="field" id="weightDate" type="date" value="${today()}"><input class="field" id="weightValue" type="number" step="0.1" placeholder="kg"></div><button class="primary" id="addWeight" style="margin-top:10px">Save weight</button></section>
 <section class="card"><div class="section-title"><div><span class="section-kicker">📏 Track</span><h2>Add measurements</h2></div><span class="live-time">Time added automatically</span></div>
  <input class="field" id="measureDate" type="date" value="${today()}">
  <div class="two-col" style="margin-top:10px">
    <input class="field" id="measureWaist" type="number" step="0.1" placeholder="Waist cm">
    <input class="field" id="measureTummy" type="number" step="0.1" placeholder="Tummy cm">
  </div>
  <button class="primary" id="addMeasure" style="margin-top:10px">Save measurements</button>
</section>
 <section class="card"><h2>Weight history</h2><div class="timeline-list">${weights.length?weights.map((w,i)=>`<article class="history-card"><div class="history-date"><strong>${esc(formatDate(w.date))}</strong><span>${healthEntryTime(w)?`🕒 ${esc(healthEntryTime(w))}`:"Earlier entry"}</span></div><div class="history-value">⚖️ ${esc(w.weight)} kg</div><button class="mini danger" data-weight-delete="${i}">Delete</button></article>`).join(""):`<p>No entries yet.</p>`}</div></section>
 <section class="card"><h2>Measurement history</h2><div class="timeline-list">${measures.length?measures.map((m,i)=>`<article class="history-card"><div class="history-date"><strong>${esc(formatDate(m.date))}</strong><span>${healthEntryTime(m)?`🕒 ${esc(healthEntryTime(m))}`:"Earlier entry"}</span></div><div class="measure-pills"><span>Waist <b>${m.waist||"—"} cm</b></span><span>Tummy <b>${m.tummy||"—"} cm</b></span></div><button class="mini danger" data-measure-delete="${i}">Delete</button></article>`).join(""):`<p>No measurements yet.</p>`}</div></section>`,"");
}
function bindHealth(){
 document.querySelector("#addWeight")?.addEventListener("click",()=>{
   const weight=document.querySelector("#weightValue").value;
   if(!weight){toast("Enter a weight");return}
   data.weightEntries.push({...entryTimestamp(document.querySelector("#weightDate").value),weight});
   data.healthPromptLog=data.healthPromptLog||{};data.healthPromptLog[today()]=data.healthPromptLog[today()]||{};
   data.healthPromptLog[today()][new Date().getHours()<14?"morning":"evening"]=true;
   saveData();toast("Weight saved with the current time ✨");render();
 });
 document.querySelector("#addMeasure")?.addEventListener("click",()=>{
   const waist=document.querySelector("#measureWaist").value;
   const tummy=document.querySelector("#measureTummy").value;
   if(!waist&&!tummy){toast("Add at least one measurement");return}
   data.measurements.push({...entryTimestamp(document.querySelector("#measureDate").value),waist,tummy});
   data.healthPromptLog=data.healthPromptLog||{};data.healthPromptLog[today()]=data.healthPromptLog[today()]||{};
   data.healthPromptLog[today()][new Date().getHours()<14?"morning":"evening"]=true;
   saveData();toast("Measurements saved with the current time ✨");render();
 });
 document.querySelectorAll("[data-weight-delete]").forEach(b=>b.onclick=()=>{const sorted=[...data.weightEntries].sort((a,b)=>healthSortValue(b).localeCompare(healthSortValue(a)));const target=sorted[+b.dataset.weightDelete];data.weightEntries.splice(data.weightEntries.indexOf(target),1);saveData();render()});
 document.querySelectorAll("[data-measure-delete]").forEach(b=>b.onclick=()=>{const sorted=[...data.measurements].sort((a,b)=>healthSortValue(b).localeCompare(healthSortValue(a)));const target=sorted[+b.dataset.measureDelete];data.measurements.splice(data.measurements.indexOf(target),1);saveData();render()});
}
