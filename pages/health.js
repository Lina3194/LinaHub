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
  if(entry.createdAt){const d=new Date(entry.createdAt);if(!Number.isNaN(d.getTime()))return d.toISOString()}
  return `${entry.date||""}T${entry.time||"00:00"}`;
}
function healthWeightValue(entry){return entry?.weight??entry?.value??""}
function healthDateValue(entry){
  const raw=entry?.date||entry?.createdAt;
  if(!raw)return null;
  const d=new Date(String(raw).includes("T")?raw:`${raw}T12:00:00`);
  return Number.isNaN(d.getTime())?null:d;
}
function ensureHealthView(){
  data.healthView=data.healthView||{};
  data.healthView.tab=["log","weight","measurements"].includes(data.healthView.tab)?data.healthView.tab:"log";
  data.healthView.weightRange=data.healthView.weightRange||"1m";
  data.healthView.measureRange=data.healthView.measureRange||"1m";
}
function healthRangeStart(range){
  if(range==="all")return null;
  const d=new Date();
  const months={"1m":1,"3m":3,"6m":6,"1y":12}[range]||1;
  d.setMonth(d.getMonth()-months);
  return d;
}
function healthRangeButtons(kind,current){
  return `<div class="health-range-tabs" aria-label="Graph range">${[["1m","1M"],["3m","3M"],["6m","6M"],["1y","1Y"],["all","All"]].map(([value,label])=>`<button type="button" class="${current===value?"active":""}" data-health-range="${kind}" data-range-value="${value}">${label}</button>`).join("")}</div>`;
}
function healthPointDate(entry){
  if(entry?.createdAt){const d=new Date(entry.createdAt);if(!Number.isNaN(d.getTime()))return d}
  if(!entry?.date)return null;
  const time=entry.time||"12:00";
  const d=new Date(`${entry.date}T${time}:00`);
  return Number.isNaN(d.getTime())?healthDateValue(entry):d;
}
function healthGraph(entries,series,range){
  const start=healthRangeStart(range);
  const filtered=entries.filter(entry=>{const d=healthPointDate(entry);return d&&(!start||d>=start)}).sort((a,b)=>healthSortValue(a).localeCompare(healthSortValue(b)));
  const allPoints=[];
  filtered.forEach(entry=>series.forEach(item=>{const value=Number(item.get(entry));if(Number.isFinite(value))allPoints.push({entry,item,value,date:healthPointDate(entry)})}));
  if(!allPoints.length)return `<div class="health-graph-empty">Not enough entries in this range yet.</div>`;
  const min=Math.min(...allPoints.map(p=>p.value)),max=Math.max(...allPoints.map(p=>p.value));
  const spread=Math.max(max-min,.4),padValue=Math.max(spread*.22,.25),low=min-padValue,high=max+padValue;
  const dates=filtered.map(healthPointDate).filter(Boolean),minTime=Math.min(...dates.map(d=>d.getTime())),maxTime=Math.max(...dates.map(d=>d.getTime()));
  const x=d=>maxTime===minTime?55:14+((d.getTime()-minTime)/(maxTime-minTime))*80;
  const y=v=>84-((v-low)/(high-low))*66;
  const grid=[0,.25,.5,.75,1].map((fraction,index)=>{const gy=84-fraction*66;const value=low+fraction*(high-low);return `<line x1="14" y1="${gy.toFixed(2)}" x2="94" y2="${gy.toFixed(2)}" class="health-chart-grid"></line><text x="11" y="${(gy+1.5).toFixed(2)}" class="health-chart-y-label" text-anchor="end">${value.toFixed(series.length===1?1:0)}</text>`}).join("");
  const lines=series.map((item,index)=>{
    const itemPoints=filtered.map(entry=>({entry,date:healthPointDate(entry),value:Number(item.get(entry))})).filter(p=>p.date&&Number.isFinite(p.value));
    if(!itemPoints.length)return "";
    const path=itemPoints.map((p,i)=>`${i?"L":"M"} ${x(p.date).toFixed(2)} ${y(p.value).toFixed(2)}`).join(" ");
    return `<path class="health-chart-line series-${index+1}" d="${path}" vector-effect="non-scaling-stroke"></path>${itemPoints.map(p=>`<circle class="health-chart-dot series-${index+1}" cx="${x(p.date).toFixed(2)}" cy="${y(p.value).toFixed(2)}" r="2.1"><title>${item.label}: ${p.value} ${item.unit} · ${formatDate(p.entry.date)}${healthEntryTime(p.entry)?` · ${healthEntryTime(p.entry)}`:""}</title></circle>`).join("")}`;
  }).join("");
  const summaries=series.map((item,index)=>{
    const vals=filtered.map(entry=>Number(item.get(entry))).filter(Number.isFinite);
    if(!vals.length)return "";
    const change=vals[vals.length-1]-vals[0],average=vals.reduce((a,b)=>a+b,0)/vals.length;
    const arrow=change<0?"↓":change>0?"↑":"→";
    return `<div class="health-trend-stat series-${index+1}"><span>${item.label}</span><strong>${arrow} ${change>0?"+":""}${change.toFixed(1)} ${item.unit}</strong><small>${average.toFixed(1)} ${item.unit} average</small></div>`;
  }).join("");
  const first=dates[0],last=dates[dates.length-1];
  return `<div class="health-trend-summary">${summaries}</div><div class="health-chart-wrap"><svg class="health-chart" viewBox="0 0 100 100" role="img" aria-label="History line chart">${grid}<line x1="14" y1="84" x2="94" y2="84" class="health-chart-axis"></line>${lines}</svg><div class="health-chart-dates"><span>${first?first.toLocaleDateString("en-GB",{day:"numeric",month:"short"}):""}</span><span>${last?last.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):""}</span></div><div class="health-chart-legend">${series.map((item,i)=>`<span class="series-${i+1}"><i></i>${item.label}</span>`).join("")}</div></div>`;
}
function HealthPage(){
 ensureHealthView();
 const weights=[...(data.weightEntries||[])].sort((a,b)=>healthSortValue(b).localeCompare(healthSortValue(a)));
 const measures=[...(data.measurements||[])].sort((a,b)=>healthSortValue(b).localeCompare(healthSortValue(a)));
 const latest=weights[0],tab=data.healthView.tab;
 const hour=new Date().getHours(),period=hour<14?"Morning":hour>=17?"Evening":"Daytime";
 const logTab=`<section class="card health-overview"><div class="stat-grid"><div class="stat"><span>Latest weight</span><strong>${latest?`${esc(healthWeightValue(latest))} kg`:"—"}</strong>${latest?`<small>${esc(formatDate(latest.date))}${healthEntryTime(latest)?` · ${esc(healthEntryTime(latest))}`:""}</small>`:""}</div><div class="stat"><span>Weight entries</span><strong>${weights.length}</strong><small>Your private history</small></div></div></section>
 <div class="health-form-grid">
 <section class="card health-entry-card compact-health-card"><div class="section-title"><div><span class="section-kicker">⚖️ Track</span><h2>Add weight</h2></div></div><div class="health-input-stack compact-health-fields"><input class="field date-field" id="weightDate" type="date" value="${today()}" aria-label="Weight date"><input class="field" id="weightValue" type="number" step="0.1" placeholder="Weight kg" aria-label="Weight in kilograms"></div><button class="primary compact-health-save" id="addWeight">Save weight</button></section>
 <section class="card health-entry-card compact-health-card"><div class="section-title"><div><span class="section-kicker">📏 Track</span><h2>Add measurements</h2></div></div><input class="field date-field compact-measure-date" id="measureDate" type="date" value="${today()}" aria-label="Measurement date"><div class="health-measure-fields compact-health-fields"><input class="field" id="measureWaist" type="number" step="0.1" placeholder="Waist cm"><input class="field" id="measureTummy" type="number" step="0.1" placeholder="Tummy cm"></div><button class="primary compact-health-save" id="addMeasure">Save measurements</button></section>
 </div>`;
 const weightTab=`<section class="card health-history-head"><div><span class="section-kicker">⚖️ Weight</span><h2>Weight history</h2></div>${latest?`<strong>${esc(healthWeightValue(latest))} kg</strong>`:""}</section><section class="card">${healthRangeButtons("weight",data.healthView.weightRange)}${healthGraph(weights,[{label:"Weight",unit:"kg",get:healthWeightValue}],data.healthView.weightRange)}</section><section class="card"><div class="timeline-list">${weights.length?weights.map((w,i)=>`<article class="history-card"><div class="history-date"><strong>${esc(formatDate(w.date))}</strong><span>${healthEntryTime(w)?`🕒 ${esc(healthEntryTime(w))}`:"Earlier entry"}</span></div><div class="history-value">⚖️ ${esc(healthWeightValue(w))} kg</div><button class="mini danger" data-weight-delete="${i}">Delete</button></article>`).join(""):`<p>No entries yet.</p>`}</div></section>`;
 const measureTab=`<section class="card health-history-head"><div><span class="section-kicker">📏 Measurements</span><h2>Measurement history</h2></div><strong>${measures.length} entries</strong></section><section class="card">${healthRangeButtons("measurements",data.healthView.measureRange)}${healthGraph(measures,[{label:"Waist",unit:"cm",get:e=>e.waist},{label:"Tummy",unit:"cm",get:e=>e.tummy}],data.healthView.measureRange)}</section><section class="card"><div class="timeline-list">${measures.length?measures.map((m,i)=>`<article class="history-card"><div class="history-date"><strong>${esc(formatDate(m.date))}</strong><span>${healthEntryTime(m)?`🕒 ${esc(healthEntryTime(m))}`:"Earlier entry"}</span></div><div class="measure-pills"><span>Waist <b>${m.waist||"—"} cm</b></span><span>Tummy <b>${m.tummy||"—"} cm</b></span></div><button class="mini danger" data-measure-delete="${i}">Delete</button></article>`).join(""):`<p>No measurements yet.</p>`}</div></section>`;
 return shell(`${head("Weight & Measures",`${period} check-in · Track changes gently over time`)}<nav class="health-tabs"><button class="${tab==="log"?"active":""}" data-health-tab="log">Add</button><button class="${tab==="weight"?"active":""}" data-health-tab="weight">Weight history</button><button class="${tab==="measurements"?"active":""}" data-health-tab="measurements">Measurements</button></nav>${tab==="weight"?weightTab:tab==="measurements"?measureTab:logTab}`,"");
}
function bindHealth(){
 ensureHealthView();
 document.querySelectorAll("[data-health-tab]").forEach(button=>button.onclick=()=>{data.healthView.tab=button.dataset.healthTab;saveData();render()});
 document.querySelectorAll("[data-health-range]").forEach(button=>button.onclick=()=>{if(button.dataset.healthRange==="weight")data.healthView.weightRange=button.dataset.rangeValue;else data.healthView.measureRange=button.dataset.rangeValue;saveData();render()});
 document.querySelector("#addWeight")?.addEventListener("click",()=>{
   const weight=document.querySelector("#weightValue").value;
   if(!weight){toast("Enter a weight");return}
   data.weightEntries.push({...entryTimestamp(document.querySelector("#weightDate").value),weight});
   data.healthPromptLog=data.healthPromptLog||{};data.healthPromptLog[today()]=data.healthPromptLog[today()]||{};data.healthPromptLog[today()][new Date().getHours()<14?"morning":"evening"]=true;
   saveData();toast("Weight saved with the current time ✨");render();
 });
 document.querySelector("#addMeasure")?.addEventListener("click",()=>{
   const waist=document.querySelector("#measureWaist").value,tummy=document.querySelector("#measureTummy").value;
   if(!waist&&!tummy){toast("Add at least one measurement");return}
   data.measurements.push({...entryTimestamp(document.querySelector("#measureDate").value),waist,tummy});
   data.healthPromptLog=data.healthPromptLog||{};data.healthPromptLog[today()]=data.healthPromptLog[today()]||{};data.healthPromptLog[today()][new Date().getHours()<14?"morning":"evening"]=true;
   saveData();toast("Measurements saved with the current time ✨");render();
 });
 document.querySelectorAll("[data-weight-delete]").forEach(b=>b.onclick=()=>{const sorted=[...data.weightEntries].sort((a,b)=>healthSortValue(b).localeCompare(healthSortValue(a)));const target=sorted[+b.dataset.weightDelete];data.weightEntries.splice(data.weightEntries.indexOf(target),1);saveData();render()});
 document.querySelectorAll("[data-measure-delete]").forEach(b=>b.onclick=()=>{const sorted=[...data.measurements].sort((a,b)=>healthSortValue(b).localeCompare(healthSortValue(a)));const target=sorted[+b.dataset.measureDelete];data.measurements.splice(data.measurements.indexOf(target),1);saveData();render()});
}
