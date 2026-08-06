/* LinaHub 17.4.8 — active Measures page implementation. */
function lina17DateList(values){return (Array.isArray(values)?values:[]).slice().filter(Boolean).sort().reverse()}
function linaMeasureRangeStart(range){
  const now=new Date(`${today()}T23:59:59`);
  const start=new Date(now);
  if(range==="week")start.setDate(start.getDate()-6);
  else if(range==="month")start.setMonth(start.getMonth()-1);
  else if(range==="3months")start.setMonth(start.getMonth()-3);
  else if(range==="6months")start.setMonth(start.getMonth()-6);
  else if(range==="year")start.setFullYear(start.getFullYear()-1);
  return start;
}
function linaSyncDailyWeightsToHistory(){
  data.weightEntries=Array.isArray(data.weightEntries)?data.weightEntries:[];
  const daily=Object.entries(data.morningCheckins||{});
  let changed=false;
  daily.forEach(([date,entry])=>{
    const raw=entry?.weight;
    const value=Number(String(raw??"").replace(",","."));
    if(!date||!Number.isFinite(value)||value<=0)return;
    const existing=data.weightEntries.find(item=>item.date===date&&item.source==="daily-checkin");
    if(existing){
      if(Number(existing.value??existing.weight)!==value){
        existing.value=value;
        existing.weight=value;
        existing.unit="kg";
        existing.createdAt=entry.updatedAt||existing.createdAt||`${date}T12:00:00`;
        changed=true;
      }
      return;
    }
    data.weightEntries.push({
      id:`weight-recovered-${date}`,
      date,
      value,
      weight:value,
      unit:"kg",
      source:"daily-checkin",
      createdAt:entry.updatedAt||`${date}T12:00:00`
    });
    changed=true;
  });
  if(changed) saveData();
}

function linaMeasureChart(category){
  const all=(category.entries||[]).map(item=>({date:String(item.date||""),value:Number(item.value)})).filter(item=>item.date&&Number.isFinite(item.value)).sort((a,b)=>a.date.localeCompare(b.date));
  const range=["week","month","3months","6months","year"].includes(window.linaMeasureRange)?window.linaMeasureRange:"week";
  const start=linaMeasureRangeStart(range);
  const clean=all.filter(item=>new Date(`${item.date}T12:00:00`)>=start);
  const rangeLabel={week:"Week",month:"Month","3months":"3 months","6months":"6 months",year:"Year"};
  const controls=`<nav class="measure-range-tabs" role="tablist" aria-label="Chart time range">
    ${[["week","Week"],["month","Month"],["3months","3 months"],["6months","6 months"],["year","Year"]].map(([key,label])=>`<button type="button" class="${range===key?"active":""}" data-measure-range="${key}" role="tab" aria-selected="${range===key}">${label}</button>`).join("")}
  </nav>`;
  let chart;
  if(!clean.length){
    chart=`<section class="card measure-chart-card"><div class="measure-chart-heading"><div><span class="section-kicker">Progress chart</span><h2>${category.label}</h2></div></div>${controls}<div class="empty"><p>No ${category.short.toLowerCase()} entries in this ${rangeLabel[range].toLowerCase()}.</p></div></section>`;
  }else{
    const width=720,height=300,padL=48,padR=24,padT=28,padB=46;
    const values=clean.map(x=>x.value),minRaw=Math.min(...values),maxRaw=Math.max(...values);
    const spread=Math.max(maxRaw-minRaw,category.unit==="kg"?.5:2);
    const min=minRaw-spread*.18,max=maxRaw+spread*.18;
    const x=i=>clean.length===1?(padL+(width-padL-padR)/2):padL+i*((width-padL-padR)/(clean.length-1));
    const y=v=>padT+(max-v)*(height-padT-padB)/(max-min||1);
    const points=clean.map((item,i)=>`${x(i).toFixed(1)},${y(item.value).toFixed(1)}`).join(" ");
    const grid=Array.from({length:4},(_,i)=>{const yy=padT+i*(height-padT-padB)/3;const val=max-i*(max-min)/3;return `<line x1="${padL}" y1="${yy}" x2="${width-padR}" y2="${yy}" class="measure-chart-grid"/><text x="${padL-8}" y="${yy+4}" text-anchor="end" class="measure-chart-axis">${val.toFixed(category.unit==="kg"?1:0)}</text>`}).join("");
    const dots=clean.map((item,i)=>`<circle class="measure-chart-dot" cx="${x(i)}" cy="${y(item.value)}" r="8" tabindex="0" role="button" aria-label="${formatDate(item.date)} ${item.value} ${category.unit}" data-chart-date="${esc(item.date)}" data-chart-value="${esc(item.value)}" data-chart-unit="${category.unit}"></circle>`).join("");
    const first=clean[0],last=clean[clean.length-1],change=last.value-first.value;
    chart=`<section class="card measure-chart-card">
      <div class="measure-chart-heading"><div><span class="section-kicker">Progress chart</span><h2>${category.label}</h2></div><div class="measure-chart-current"><small>Latest</small><strong>${last.value} ${category.unit}</strong></div></div>
      ${controls}
      <div class="measure-chart-wrap"><svg class="measure-progress-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="${category.label} progress over time">${grid}<polyline class="measure-chart-line" points="${points}"/>${dots}</svg></div>
      <div class="measure-chart-tooltip" id="measureChartTooltip"><span>Tap a dot to see the date and value</span></div>
      <div class="measure-chart-footer"><span>${formatDate(first.date)}</span><strong>${change===0?"No change":`${change>0?"+":""}${change.toFixed(category.unit==="kg"?2:1)} ${category.unit}`}</strong><span>${formatDate(last.date)}</span></div>
    </section>`;
  }
  const history=`<section class="card measure-history-card"><div class="measure-history-heading"><div><span class="section-kicker">History</span><h2>All ${category.short.toLowerCase()} entries</h2></div><b>${all.length}</b></div>
    <div class="measure-history-list">${all.length?all.slice().reverse().map(item=>`<article><time>${formatDate(item.date)}</time><span>${category.icon} ${category.short}</span><strong>${item.value} ${category.unit}</strong></article>`).join(""):`<div class="empty"><p>No entries yet.</p></div>`}</div>
  </section>`;
  return chart+history;
}
function HealthPage(){
  linaSyncDailyWeightsToHistory();
  const weights=(data.weightEntries||[]).slice().sort((a,b)=>String(b.createdAt||b.date||"").localeCompare(String(a.createdAt||a.date||"")));
  const measures=(data.measurements||[]).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  const latestWeight=weights[0],latestMeasure=measures[0];
  const selected=["overview","weight","waist","tummy"].includes(window.linaHealthMeasureTab)?window.linaHealthMeasureTab:"overview";
  const categories={
    weight:{label:"Weight",short:"Weight",icon:"⚖️",unit:"kg",entries:weights.map(x=>({date:x.date,value:x.value??x.weight}))},
    waist:{label:"Measurement (W)",short:"Waist",icon:"📏",unit:"cm",entries:measures.filter(x=>x.waist!==""&&x.waist!=null).map(x=>({date:x.date,value:x.waist}))},
    tummy:{label:"Measurement (T)",short:"Tummy",icon:"〰️",unit:"cm",entries:measures.filter(x=>x.tummy!==""&&x.tummy!=null).map(x=>({date:x.date,value:x.tummy}))}
  };
  const overview=`<section class="measure-hero card">
      <div><span class="section-kicker">Latest measurements</span><h2>Your progress, without the clutter</h2><p>Only the three measurements that matter to you.</p></div>
      <div class="measure-summary-grid">
        <article><span>⚖️</span><small>Weight</small><strong>${latestWeight?.value||latestWeight?.weight||"—"}<em>${latestWeight?" kg":""}</em></strong></article>
        <article><span>📏</span><small>Waist</small><strong>${latestMeasure?.waist??"—"}<em>${latestMeasure?.waist!=null&&latestMeasure?.waist!==""?" cm":""}</em></strong></article>
        <article><span>〰️</span><small>Tummy</small><strong>${latestMeasure?.tummy??"—"}<em>${latestMeasure?.tummy!=null&&latestMeasure?.tummy!==""?" cm":""}</em></strong></article>
      </div>
    </section>
    <section class="card measure-entry-card"><div class="section-title-row"><div><span class="section-kicker">New entry</span><h2>Add today’s measures</h2></div></div>
      <label class="compact-measure-date">Date<input class="field" id="measureDate" type="date" value="${today()}"></label>
      <div class="health-measure-fields">
        <label><span>⚖️ Weight</span><div class="measure-input-wrap"><input class="field" id="weightValue" inputmode="decimal" type="number" step="0.1" placeholder="0.0"><b>kg</b></div></label>
        <label><span>📏 Waist</span><div class="measure-input-wrap"><input class="field" id="measureWaist" inputmode="decimal" type="number" step="0.1" placeholder="0.0"><b>cm</b></div></label>
        <label><span>〰️ Tummy</span><div class="measure-input-wrap"><input class="field" id="measureTummy" inputmode="decimal" type="number" step="0.1" placeholder="0.0"><b>cm</b></div></label>
      </div><button class="primary measure-save" id="saveMeasures">Save measurements</button>
    </section>`;
  return shell(`${head("Measures","A simple record of weight, waist and tummy")}
    <nav class="measure-main-tabs" role="tablist" aria-label="Measures sections">
      <button type="button" class="${selected==="overview"?"active":""}" data-measure-tab="overview" role="tab" aria-selected="${selected==="overview"}">Overview</button>
      <button type="button" class="${selected==="weight"?"active":""}" data-measure-tab="weight" role="tab" aria-selected="${selected==="weight"}">Weight</button>
      <button type="button" class="${selected==="waist"?"active":""}" data-measure-tab="waist" role="tab" aria-selected="${selected==="waist"}">Measurement (W)</button>
      <button type="button" class="${selected==="tummy"?"active":""}" data-measure-tab="tummy" role="tab" aria-selected="${selected==="tummy"}">Measurement (T)</button>
    </nav>
    ${selected==="overview"?overview:linaMeasureChart(categories[selected])}`,'health');
}
function bindHealth(){
  document.querySelectorAll("[data-measure-tab]").forEach(button=>button.onclick=()=>{window.linaHealthMeasureTab=button.dataset.measureTab;render();});
  document.querySelectorAll("[data-measure-range]").forEach(button=>button.onclick=()=>{window.linaMeasureRange=button.dataset.measureRange;render();});
  document.querySelectorAll(".measure-chart-dot").forEach(dot=>{
    const show=()=>{const box=document.querySelector("#measureChartTooltip");if(!box)return;box.innerHTML=`<strong>${formatDate(dot.dataset.chartDate)}</strong><span>${dot.dataset.chartValue} ${dot.dataset.chartUnit}</span>`;document.querySelectorAll(".measure-chart-dot.selected").forEach(x=>x.classList.remove("selected"));dot.classList.add("selected")};
    dot.onclick=show;dot.onkeydown=e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();show()}};
  });
  const save=document.querySelector("#saveMeasures"); if(!save)return;
  save.onclick=()=>{const date=document.querySelector("#measureDate").value||today(),weight=document.querySelector("#weightValue").value,waist=document.querySelector("#measureWaist").value,tummy=document.querySelector("#measureTummy").value;if(!weight&&!waist&&!tummy){toast("Add at least one measurement");return}
    if(weight){data.weightEntries=data.weightEntries||[];data.weightEntries.push({id:`weight-${Date.now()}`,date,value:Number(weight)})}
    if(waist||tummy){data.measurements=data.measurements||[];data.measurements.push({id:`measure-${Date.now()}`,date,waist:waist===""?"":Number(waist),tummy:tummy===""?"":Number(tummy)})}
    saveData();toast("Measurements saved ✨");render();};
}

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
  data.healthView.tab=["dashboard","sleep","garden","log","weight","measurements"].includes(data.healthView.tab)?data.healthView.tab:"dashboard";
  data.healthView.weightRange=data.healthView.weightRange||"1m";
  data.healthView.measureRange=data.healthView.measureRange||"1m";
  data.healthView.measuresSection=["today","weight","measurements"].includes(data.healthView.measuresSection)?data.healthView.measuresSection:"today";
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
    return `<path class="health-chart-line series-${index+1}" d="${path}" vector-effect="non-scaling-stroke"></path>${itemPoints.map(p=>`<circle class="health-chart-dot series-${index+1}" cx="${x(p.date).toFixed(2)}" cy="${y(p.value).toFixed(2)}" r="2.7" tabindex="0" role="button" data-chart-point data-point-label="${esc(item.label)}" data-point-value="${esc(p.value)}" data-point-unit="${esc(item.unit)}" data-point-date="${esc(formatDate(p.entry.date))}" data-point-time="${esc(healthEntryTime(p.entry))}"><title>${item.label}: ${p.value} ${item.unit} · ${formatDate(p.entry.date)}${healthEntryTime(p.entry)?` · ${healthEntryTime(p.entry)}`:""}</title></circle>`).join("")}`;
  }).join("");
  const summaries=series.map((item,index)=>{
    const vals=filtered.map(entry=>Number(item.get(entry))).filter(Number.isFinite);
    if(!vals.length)return "";
    const change=vals[vals.length-1]-vals[0],average=vals.reduce((a,b)=>a+b,0)/vals.length;
    const arrow=change<0?"↓":change>0?"↑":"→";
    return `<div class="health-trend-stat series-${index+1}"><span>${item.label}</span><strong>${arrow} ${change>0?"+":""}${change.toFixed(1)} ${item.unit}</strong><small>${average.toFixed(1)} ${item.unit} average</small></div>`;
  }).join("");
  const first=dates[0],last=dates[dates.length-1];
  return `<div class="health-trend-summary">${summaries}</div><div class="health-chart-wrap"><svg class="health-chart" viewBox="0 0 100 100" role="img" aria-label="History line chart">${grid}<line x1="14" y1="84" x2="94" y2="84" class="health-chart-axis"></line>${lines}</svg><div class="health-chart-dates"><span>${first?first.toLocaleDateString("en-GB",{day:"numeric",month:"short"}):""}</span><span>${last?last.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}):""}</span></div><div class="health-chart-legend">${series.map((item,i)=>`<span class="series-${i+1}"><i></i>${item.label}</span>`).join("")}</div><div class="health-chart-point-info" aria-live="polite">Tap a dot to see its date and exact value.</div></div>`;
}
const HEALTH_FEELINGS={
  sleep:[["😫","Awful"],["😟","Restless"],["😐","Okay"],["😊","Good"],["🤩","Amazing"]],
  energy:[["🪫","Empty"],["🌧️","Low"],["🌤️","Okay"],["☀️","Good"],["✨","Full"]],
  mood:[["😢","Very low"],["😟","Low"],["😐","Okay"],["🙂","Good"],["🥰","Great"]],
  pain:[["😫","Severe"],["😣","High"],["😐","Moderate"],["🙂","Mild"],["😊","None"]]
};
const JOURNEY_LEVELS=["#66508f","#7189b8","#d78db5","#e3bd68","#f3d77c"];
function healthScale(name,value){return `<div class="health-feeling-scale">${HEALTH_FEELINGS[name].map((item,index)=>`<button type="button" class="health-feeling ${Number(value)===index?"active":""}" data-health-feeling="${name}" data-value="${index}"><span>${item[0]}</span><small>${item[1]}</small></button>`).join("")}</div>`}
function minutesLabel(value){const n=Number(value)||0;const h=Math.floor(n/60),m=n%60;return `${h?`${h}h `:""}${m}m`}
function sleepMinutes(prefix){return (Number(document.querySelector(`#${prefix}Hours`)?.value)||0)*60+(Number(document.querySelector(`#${prefix}Minutes`)?.value)||0)}
function journeyEntry(entry,index){
  const energy=HEALTH_FEELINGS.energy[entry.energy]||["—","Unknown"];
  const mood=HEALTH_FEELINGS.mood[entry.mood]||["—","Unknown"];
  const pain=HEALTH_FEELINGS.pain[entry.pain]||["—","Unknown"];
  const glow=JOURNEY_LEVELS[Math.max(0,Math.min(4,Number(entry.energy)||0))];
  return `<article class="journey-entry" data-day-checkin-id="${esc(entry.id)}" style="--journey-glow:${glow}"><div class="journey-time">${esc(entry.time||"")}</div><button type="button" class="journey-orb" aria-label="Open or remove ${esc(entry.time||"check-in")}"><span></span></button><div class="journey-values"><span title="Energy"><b>${energy[0]}</b><small>${energy[1]}</small></span><span title="Mood"><b>${mood[0]}</b><small>${mood[1]}</small></span><span title="Pain"><b>${pain[0]}</b><small>${pain[1]}</small></span></div>${entry.note?`<p class="journey-note">${esc(entry.note)}</p>`:""}</article>`;
}
function dayEntries(dateValue){
  return (data.dayCheckins||[])
    .filter(e=>e.date===dateValue)
    .filter(e=>[e.energy,e.mood,e.pain].some(v=>Number.isInteger(Number(v)))||String(e.note||"").trim())
    .sort((a,b)=>(a.createdAt||"").localeCompare(b.createdAt||""));
}
function selectedHealthFeeling(name){const el=document.querySelector(`[data-health-feeling="${name}"].active`);return el?Number(el.dataset.value):null}
function markHealthTodayPrompt(date){
  if(date!==today()) return;
  data.healthPromptLog=data.healthPromptLog&&typeof data.healthPromptLog==="object"?data.healthPromptLog:{};
  data.healthPromptLog[date]=data.healthPromptLog[date]&&typeof data.healthPromptLog[date]==="object"?data.healthPromptLog[date]:{};
  const key=new Date().getHours()>=17?"evening":"morning";
  data.healthPromptLog[date][key]=true;
}
function releaseHealthInputZoom(){
  const active=document.activeElement;
  if(active&&/^(INPUT|SELECT|TEXTAREA)$/.test(active.tagName)) active.blur();
  requestAnimationFrame(()=>window.scrollTo({top:window.scrollY,left:0,behavior:"auto"}));
}


function hourlyCheckinMarkup(){
  const scale=(name,label,items)=>`<div class="hourly-popup-group"><h3>${label}</h3><div class="health-circle-scale">${items.map((item,index)=>`<button type="button" data-hourly-feeling="${name}" data-value="${index}" aria-label="${item[1]}"><span>${item[0]}</span><small>${item[1]}</small></button>`).join("")}</div></div>`;
  return `<div class="hourly-checkin-backdrop" data-close-hourly-checkin>
    <section class="hourly-checkin-modal" role="dialog" aria-modal="true" aria-labelledby="hourlyCheckinTitle">
      <div class="hourly-checkin-head"><div><span class="section-kicker">✨ Hourly journal</span><h2 id="hourlyCheckinTitle">How are you right now?</h2><p>${new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</p></div><button type="button" data-close-hourly-checkin aria-label="Close">×</button></div>
      <p class="journey-direction">Worst on the left · best on the right</p>
      ${scale("energy","Energy",HEALTH_FEELINGS.energy)}
      ${scale("mood","Mood",HEALTH_FEELINGS.mood)}
      ${scale("pain","Pain",HEALTH_FEELINGS.pain)}
      <label class="hourly-note-label">Anything you want to remember? <span>Optional</span><textarea class="field" id="hourlyCheckinNote" maxlength="500" placeholder="A thought, symptom, win, worry or quick note…"></textarea></label>
      <button type="button" class="primary" id="saveHourlyCheckin">Save check-in</button>
    </section>
  </div>`;
}
function openHourlyCheckin(){
  document.querySelector(".hourly-checkin-backdrop")?.remove();
  document.body.insertAdjacentHTML("beforeend",hourlyCheckinMarkup());
  const backdrop=document.querySelector(".hourly-checkin-backdrop");
  const close=()=>backdrop?.remove();
  backdrop?.addEventListener("click",event=>{
    if(event.target.matches("[data-close-hourly-checkin]")) close();
    const feeling=event.target.closest("[data-hourly-feeling]");
    if(feeling){
      backdrop.querySelectorAll(`[data-hourly-feeling="${feeling.dataset.hourlyFeeling}"]`).forEach(button=>button.classList.remove("active"));
      feeling.classList.add("active");
    }
  });
  backdrop?.querySelector("#saveHourlyCheckin")?.addEventListener("click",()=>{
    const selected=name=>{const button=backdrop.querySelector(`[data-hourly-feeling="${name}"].active`);return button?Number(button.dataset.value):null};
    const energy=selected("energy"),mood=selected("mood"),pain=selected("pain");
    if(energy===null||mood===null||pain===null){toast("Choose energy, mood and pain first");return;}
    const stamp=entryTimestamp(today());
    const note=(backdrop.querySelector("#hourlyCheckinNote")?.value||"").trim();
    const entry={id:`day-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,...stamp,energy,mood,pain,note,source:"hourly-journal"};
    data.dayCheckins=Array.isArray(data.dayCheckins)?data.dayCheckins:[];
    data.dayCheckins.push(entry);
    data.checkins=data.checkins&&typeof data.checkins==="object"?data.checkins:{};
    data.checkins[stamp.date]={...(data.checkins[stamp.date]||{}),energy,mood,pain,savedAt:stamp.createdAt};
    data.journalTimeline=Array.isArray(data.journalTimeline)?data.journalTimeline:[];
    data.journalTimeline.push({id:`journal-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,date:stamp.date,time:stamp.time,prompt:"Hourly Check-in",text:note,energy,mood,pain,source:"hourly-journal",createdAt:stamp.createdAt});
    saveData();close();toast("Hourly check-in saved ✨");
    if(route==="journal"||(route==="health"&&data.healthView?.tab==="garden")) render();
  });
  setTimeout(()=>backdrop?.querySelector('[data-hourly-feeling="energy"]')?.focus(),20);
}


function linaDailyDayKey(now=new Date()){
  const shifted=new Date(now.getTime()-2*60*60*1000);
  const y=shifted.getFullYear(),m=String(shifted.getMonth()+1).padStart(2,"0"),d=String(shifted.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}
function linaDailyDueMedications(dateValue){
  const shortDay=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][new Date(`${dateValue}T12:00:00`).getDay()];
  return (data.medications||[]).filter(m=>{
    if(m.active===false||(m.startDate&&dateValue<m.startDate)||(m.endDate&&dateValue>m.endDate))return false;
    return m.scheduleType==="daily"||(m.scheduleType==="weekdays"&&(m.weekdays||[]).includes(shortDay));
  });
}
function linaMedicationTimingText(m){
  return [m.timeLabel,m.timing,m.time,m.instructions,m.notes].filter(Boolean).join(" ");
}
function linaMorningDueMedications(dateValue){
  const eveningWords=/(evening|night|nightly|pm|bedtime)/i;
  return linaDailyDueMedications(dateValue).filter(m=>{
    const name=String(m.name||"");
    if(/magnesium/i.test(name))return false;
    return !eveningWords.test(linaMedicationTimingText(m));
  });
}
function linaNightlyDueMedications(dateValue){
  const eveningWords=/(evening|night|nightly|pm|bedtime)/i;
  return linaDailyDueMedications(dateValue).filter(m=>{
    const name=String(m.name||"");
    if(/folic\s*acid/i.test(name))return false;
    return /magnesium/i.test(name)||eveningWords.test(linaMedicationTimingText(m));
  });
}
function linaSplitHours(value,totalMinutes){
  const minutes=Number.isFinite(Number(totalMinutes))?Math.max(0,Math.round(Number(totalMinutes))):Math.max(0,Math.round((Number(value)||0)*60));
  return {hours:Math.floor(minutes/60),minutes:minutes%60};
}
function linaDailyCheckinMarkup(dateValue){
  const saved=(data.morningCheckins||{})[dateValue]||{};
  const feelings=(name,title,items,value)=>`<div class="daily-popup-group"><h3>${title}</h3><div class="health-circle-scale">${items.map((item,index)=>`<button type="button" data-daily-feeling="${name}" data-value="${index}" class="${Number(value)===index?'active':''}"><span>${item[0]}</span><small>${item[1]}</small></button>`).join("")}</div></div>`;
  const meds=linaMorningDueMedications(dateValue);
  const selected=new Set(saved.tablets||[]);
  const sleepParts=linaSplitHours(saved.sleep,saved.sleepTotalMinutes);
  const deepParts=linaSplitHours(saved.deepSleep,saved.deepSleepTotalMinutes);
  return `<div class="hourly-checkin-backdrop daily-checkin-backdrop" role="dialog" aria-modal="true" aria-label="Daily check-in">
    <section class="hourly-checkin-modal daily-checkin-modal">
      <div class="hourly-popup-head"><div><span class="section-kicker">☀️ DAILY CHECK-IN</span><h2>How did you wake up?</h2><p>This day runs from 2:00 AM to 1:59 AM.</p></div></div>
      <div class="daily-fields-grid">
        <label class="daily-time-field">Sleep<div class="daily-time-pair"><span><input class="field" id="dailySleepHours" type="number" inputmode="numeric" min="0" max="24" step="1" value="${sleepParts.hours||''}" placeholder="0"><small>h</small></span><span><input class="field" id="dailySleepMinutes" type="number" inputmode="numeric" min="0" max="59" step="1" value="${sleepParts.minutes||''}" placeholder="0"><small>m</small></span></div></label>
        <label class="daily-time-field">Deep sleep<div class="daily-time-pair"><span><input class="field" id="dailyDeepSleepHours" type="number" inputmode="numeric" min="0" max="24" step="1" value="${deepParts.hours||''}" placeholder="0"><small>h</small></span><span><input class="field" id="dailyDeepSleepMinutes" type="number" inputmode="numeric" min="0" max="59" step="1" value="${deepParts.minutes||''}" placeholder="0"><small>m</small></span></div></label>
        <label>Weight <span>kg</span><input class="field" id="dailyWeight" type="number" inputmode="decimal" pattern="[0-9]*[.,]?[0-9]*" step="0.1" value="${esc(saved.weight||'')}" placeholder="Optional"></label>
        <label>Waist <span>cm</span><input class="field" id="dailyWaist" type="number" inputmode="decimal" pattern="[0-9]*[.,]?[0-9]*" step="0.1" value="${esc(saved.waist||'')}" placeholder="Optional"></label>
        <label>Tummy <span>cm</span><input class="field" id="dailyTummy" type="number" inputmode="decimal" pattern="[0-9]*[.,]?[0-9]*" step="0.1" value="${esc(saved.tummy||'')}" placeholder="Optional"></label>
      </div>
      ${feelings("sleep","How was your sleep?",HEALTH_FEELINGS.sleep,saved.sleepQuality)}
      ${feelings("energy","Energy",HEALTH_FEELINGS.energy,saved.energy)}
      ${feelings("mood","Mood",HEALTH_FEELINGS.mood,saved.mood)}
      ${feelings("pain","Pain",HEALTH_FEELINGS.pain,saved.pain)}
      <div class="daily-popup-group"><h3>Tablets</h3>${meds.length?`<div class="daily-tablet-list">${meds.map(m=>`<label><input type="checkbox" data-daily-med="${esc(m.id)}" ${selected.has(String(m.id))?'checked':''}><span><strong>${esc(m.name)}</strong><small>${esc(m.dose||m.time||'Due today')}</small></span></label>`).join("")}</div>`:`<p class="muted">No scheduled tablets are due today.</p>`}</div>
      <div class="daily-popup-actions"><button type="button" class="primary" id="completeDailyCheckin">Complete</button><button type="button" class="secondary" id="laterDailyCheckin">Save &amp; Remind me later</button></div>
    </section>
  </div>`;
}
function linaSaveDailyCheckin(backdrop,dateValue,complete){
  const val=id=>backdrop.querySelector(id)?.value||"";
  const decimal=id=>String(val(id)).trim().replace(",",".");
  const selected=name=>{const b=backdrop.querySelector(`[data-daily-feeling="${name}"].active`);return b?Number(b.dataset.value):null};
  const bounded=(id,max)=>Math.max(0,Math.min(max,Number(val(id))||0));
  const sleepHours=bounded("#dailySleepHours",24),sleepMinutes=bounded("#dailySleepMinutes",59);
  const deepSleepHours=bounded("#dailyDeepSleepHours",24),deepSleepMinutes=bounded("#dailyDeepSleepMinutes",59);
  const sleepTotalMinutes=sleepHours*60+sleepMinutes,deepSleepTotalMinutes=deepSleepHours*60+deepSleepMinutes;
  const entry={date:dateValue,updatedAt:new Date().toISOString(),sleepHours,sleepMinutes,sleepTotalMinutes,sleep:sleepTotalMinutes/60,deepSleepHours,deepSleepMinutes,deepSleepTotalMinutes,deepSleep:deepSleepTotalMinutes/60,sleepQuality:selected("sleep"),weight:decimal("#dailyWeight"),waist:decimal("#dailyWaist"),tummy:decimal("#dailyTummy"),energy:selected("energy"),mood:selected("mood"),pain:selected("pain"),tablets:[...backdrop.querySelectorAll("[data-daily-med]:checked")].map(x=>String(x.dataset.dailyMed))};
  data.morningCheckins=data.morningCheckins||{};
  if(entry.weight){data.weightEntries=Array.isArray(data.weightEntries)?data.weightEntries:[];data.weightEntries=data.weightEntries.filter(x=>!(x.date===dateValue&&x.source==="daily-checkin"));data.weightEntries.push({id:`weight-${Date.now()}`,date:dateValue,weight:Number(entry.weight),value:Number(entry.weight),unit:"kg",source:"daily-checkin",createdAt:entry.updatedAt});}
  if(entry.sleepTotalMinutes||entry.deepSleepTotalMinutes){data.sleepEntries=Array.isArray(data.sleepEntries)?data.sleepEntries:[];data.sleepEntries=data.sleepEntries.filter(x=>!(x.date===dateValue&&x.source==="daily-checkin"));data.sleepEntries.push({id:`sleep-${Date.now()}`,date:dateValue,totalMinutes:entry.sleepTotalMinutes,deepMinutes:entry.deepSleepTotalMinutes,quality:entry.sleepQuality,source:"daily-checkin",createdAt:entry.updatedAt});}
  if(entry.waist||entry.tummy){data.measurements=Array.isArray(data.measurements)?data.measurements:[];data.measurements=data.measurements.filter(x=>!(x.date===dateValue&&x.source==="daily-checkin"));data.measurements.push({id:`measure-${Date.now()}`,date:dateValue,waist:entry.waist,tummy:entry.tummy,source:"daily-checkin",createdAt:entry.updatedAt});}
  data.checkins=data.checkins||{};data.checkins[dateValue]={...(data.checkins[dateValue]||{}),sleep:entry.sleepQuality,energy:entry.energy,mood:entry.mood,pain:entry.pain,savedAt:entry.updatedAt};
  data.medicationHistory=Array.isArray(data.medicationHistory)?data.medicationHistory:[];
  const previousTablets=Array.isArray(data.morningCheckins?.[dateValue]?.tablets)?data.morningCheckins[dateValue].tablets.map(String):[];
  const selectedTablets=entry.tablets.map(String);
  const addedTablets=selectedTablets.filter(medId=>!previousTablets.includes(medId));
  const removedTablets=previousTablets.filter(medId=>!selectedTablets.includes(medId));

  addedTablets.forEach(medId=>{
    if(data.medicationHistory.some(x=>String(x.medId)===medId&&x.date===dateValue&&x.source==="daily-checkin"))return;
    const stockAdjusted=typeof medAdjustStockForDose==="function"?medAdjustStockForDose(medId,-1):false;
    data.medicationHistory.push({id:`dose-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,medId,date:dateValue,time:new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),notes:"Daily check-in",source:"daily-checkin",createdAt:entry.updatedAt,stockAdjusted});
  });

  removedTablets.forEach(medId=>{
    const matching=data.medicationHistory.filter(x=>String(x.medId)===medId&&x.date===dateValue&&x.source==="daily-checkin");
    matching.forEach(log=>{if(log.stockAdjusted&&typeof medAdjustStockForDose==="function")medAdjustStockForDose(medId,1)});
    data.medicationHistory=data.medicationHistory.filter(x=>!(String(x.medId)===medId&&x.date===dateValue&&x.source==="daily-checkin"));
  });
  data.morningCheckins[dateValue]=entry;
  if(complete){data.dailyCheckinCompleted=data.dailyCheckinCompleted||{};data.dailyCheckinCompleted[dateValue]=entry.updatedAt;delete data.dailyCheckinRemindAt?.[dateValue];}
  else{data.dailyCheckinRemindAt=data.dailyCheckinRemindAt||{};data.dailyCheckinRemindAt[dateValue]=Date.now()+60*60*1000;}
  saveData();
}
function openDailyCheckin(force=false){
  const dateValue=linaDailyDayKey();
  if(!force&&data.dailyCheckinCompleted?.[dateValue])return;
  if(document.querySelector(".daily-checkin-backdrop"))return;
  document.body.insertAdjacentHTML("beforeend",linaDailyCheckinMarkup(dateValue));
  const backdrop=document.querySelector(".daily-checkin-backdrop");
  backdrop?.addEventListener("click",event=>{const feeling=event.target.closest("[data-daily-feeling]");if(feeling){backdrop.querySelectorAll(`[data-daily-feeling="${feeling.dataset.dailyFeeling}"]`).forEach(x=>x.classList.remove("active"));feeling.classList.add("active");}});
  backdrop?.querySelector("#completeDailyCheckin")?.addEventListener("click",()=>{linaSaveDailyCheckin(backdrop,dateValue,true);backdrop.remove();toast("Daily check-in complete ☀️");if(route==="today"||route==="home"||route==="journal")render();});
  backdrop?.querySelector("#laterDailyCheckin")?.addEventListener("click",()=>{linaSaveDailyCheckin(backdrop,dateValue,false);backdrop.remove();toast("Saved — I’ll remind you later 💜");window.clearTimeout(window.__linaDailyReminderTimer);window.__linaDailyReminderTimer=window.setTimeout(()=>openDailyCheckin(),60*60*1000);if(route==="today"||route==="home"||route==="journal")render();});
}
function linaMaybeOpenDailyCheckin(){
  const key=linaDailyDayKey();
  if(data.dailyCheckinCompleted?.[key])return;
  const remindAt=Number(data.dailyCheckinRemindAt?.[key]||0);
  if(remindAt>Date.now()){window.clearTimeout(window.__linaDailyReminderTimer);window.__linaDailyReminderTimer=window.setTimeout(()=>openDailyCheckin(),Math.min(remindAt-Date.now(),2147483647));return;}
  window.setTimeout(()=>openDailyCheckin(),350);
}


function linaNightlyDayKey(now=new Date()){
  const shifted=new Date(now.getTime()-2*60*60*1000);
  const y=shifted.getFullYear(),m=String(shifted.getMonth()+1).padStart(2,"0"),d=String(shifted.getDate()).padStart(2,"0");
  return `${y}-${m}-${d}`;
}
function linaNightlyWindowOpen(now=new Date()){
  const hour=now.getHours();
  return hour>=22||hour<2;
}
function linaNightlyCheckinMarkup(dateValue){
  const saved=(data.nightCheckins||{})[dateValue]||{};
  const feelings=(name,title,items,value)=>`<div class="daily-popup-group"><h3>${title}</h3><div class="health-circle-scale">${items.map((item,index)=>`<button type="button" data-nightly-feeling="${name}" data-value="${index}" class="${Number(value)===index?'active':''}"><span>${item[0]}</span><small>${item[1]}</small></button>`).join("")}</div></div>`;
  const meds=linaNightlyDueMedications(dateValue);
  const selected=new Set((saved.tablets||[]).map(String));
  return `<div class="hourly-checkin-backdrop nightly-checkin-backdrop" role="dialog" aria-modal="true" aria-label="Nightly check-in">
    <section class="hourly-checkin-modal daily-checkin-modal nightly-checkin-modal">
      <div class="hourly-popup-head"><div><span class="section-kicker">🌙 NIGHTLY CHECK-IN</span><h2>How are you ending your day?</h2><p>This check-in is available from 10:00 PM to 1:59 AM.</p></div></div>
      ${feelings("energy","Energy",HEALTH_FEELINGS.energy,saved.energy)}
      ${feelings("mood","Mood",HEALTH_FEELINGS.mood,saved.mood)}
      ${feelings("pain","Pain",HEALTH_FEELINGS.pain,saved.pain)}
      <div class="daily-popup-group nightly-aids-group"><h3>What helped tonight?</h3><p class="muted nightly-aids-help">Select everything you used today.</p><div class="nightly-aids-grid">${[
        ["left-knee-brace","🦵","Left knee brace"],["right-knee-brace","🦵","Right knee brace"],["left-ankle-brace","🦶","Left ankle brace"],["right-ankle-brace","🦶","Right ankle brace"],["walking-stick","🦯","Walking stick"],["hot-water-bottle","♨️","Hot-water bottle"],["painkiller","💊","Painkiller"],["bath","🛁","Bath"],["heat-pad","🔥","Heat pad"],["rest","🛏️","Rest"]
      ].map(([id,icon,label])=>`<label class="nightly-aid-option"><input type="checkbox" data-nightly-aid="${id}" ${(saved.aids||[]).includes(id)?'checked':''}><span><b>${icon}</b><strong>${label}</strong></span></label>`).join("")}</div><label class="nightly-aid-other"><span>Other aid or comfort</span><input class="field" id="nightlyAidOther" value="${esc(saved.aidOther||"")}" placeholder="Type anything else you used"></label></div>
      <div class="daily-popup-group"><h3>Evening notes</h3><textarea class="field" id="nightlyNotes" rows="4" placeholder="Anything you want to remember about today…">${esc(saved.notes||"")}</textarea></div>
      <div class="daily-popup-group"><h3>Tablets</h3>${meds.length?`<div class="daily-tablet-list">${meds.map(m=>`<label><input type="checkbox" data-nightly-med="${esc(m.id)}" ${selected.has(String(m.id))?'checked':''}><span><strong>${esc(m.name)}</strong><small>${esc(m.dose||m.time||'Due today')}</small></span></label>`).join("")}</div>`:`<p class="muted">No scheduled tablets are due today.</p>`}</div>
      <div class="daily-popup-actions"><button type="button" class="primary" id="completeNightlyCheckin">Complete</button><button type="button" class="secondary" id="laterNightlyCheckin">Save &amp; Remind me later</button></div>
    </section>
  </div>`;
}
function linaSaveNightlyCheckin(backdrop,dateValue,complete){
  const selected=name=>{const b=backdrop.querySelector(`[data-nightly-feeling="${name}"].active`);return b?Number(b.dataset.value):null};
  const entry={date:dateValue,time:new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),updatedAt:new Date().toISOString(),energy:selected("energy"),mood:selected("mood"),pain:selected("pain"),aids:[...backdrop.querySelectorAll("[data-nightly-aid]:checked")].map(x=>String(x.dataset.nightlyAid)),aidOther:backdrop.querySelector("#nightlyAidOther")?.value.trim()||"",notes:backdrop.querySelector("#nightlyNotes")?.value.trim()||"",tablets:[...backdrop.querySelectorAll("[data-nightly-med]:checked")].map(x=>String(x.dataset.nightlyMed))};
  data.nightCheckins=data.nightCheckins||{};
  const previous=Array.isArray(data.nightCheckins?.[dateValue]?.tablets)?data.nightCheckins[dateValue].tablets.map(String):[];
  data.medicationHistory=Array.isArray(data.medicationHistory)?data.medicationHistory:[];
  entry.tablets.filter(id=>!previous.includes(id)).forEach(medId=>{
    if(data.medicationHistory.some(x=>String(x.medId)===medId&&x.date===dateValue&&x.source==="nightly-checkin"))return;
    const stockAdjusted=typeof medAdjustStockForDose==="function"?medAdjustStockForDose(medId,-1):false;
    data.medicationHistory.push({id:`night-dose-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,medId,date:dateValue,time:entry.time,notes:"Nightly check-in",source:"nightly-checkin",createdAt:entry.updatedAt,stockAdjusted});
  });
  previous.filter(id=>!entry.tablets.includes(id)).forEach(medId=>{
    const matching=data.medicationHistory.filter(x=>String(x.medId)===medId&&x.date===dateValue&&x.source==="nightly-checkin");
    matching.forEach(log=>{if(log.stockAdjusted&&typeof medAdjustStockForDose==="function")medAdjustStockForDose(medId,1)});
    data.medicationHistory=data.medicationHistory.filter(x=>!(String(x.medId)===medId&&x.date===dateValue&&x.source==="nightly-checkin"));
  });
  data.nightCheckins[dateValue]=entry;
  data.dayCheckins=Array.isArray(data.dayCheckins)?data.dayCheckins:[];
  data.dayCheckins=data.dayCheckins.filter(x=>!(x.date===dateValue&&x.source==="nightly-checkin"));
  data.dayCheckins.push({id:`night-${Date.now()}`,date:dateValue,time:entry.time,createdAt:entry.updatedAt,energy:entry.energy,mood:entry.mood,pain:entry.pain,aids:entry.aids,aidOther:entry.aidOther,note:entry.notes,source:"nightly-checkin"});
  data.checkins=data.checkins&&typeof data.checkins==="object"?data.checkins:{};
  data.checkins[dateValue]={...(data.checkins[dateValue]||{}),energy:entry.energy,mood:entry.mood,pain:entry.pain,savedAt:entry.updatedAt};
  if(complete){data.nightlyCheckinCompleted=data.nightlyCheckinCompleted||{};data.nightlyCheckinCompleted[dateValue]=entry.updatedAt;delete data.nightlyCheckinRemindAt?.[dateValue];}
  else{data.nightlyCheckinRemindAt=data.nightlyCheckinRemindAt||{};data.nightlyCheckinRemindAt[dateValue]=Date.now()+30*60*1000;}
  saveData();
}
function openNightlyCheckin(force=false){
  if(!force&&!linaNightlyWindowOpen())return;
  const dateValue=linaNightlyDayKey();
  if(!force&&data.nightlyCheckinCompleted?.[dateValue])return;
  if(document.querySelector(".nightly-checkin-backdrop"))return;
  document.body.insertAdjacentHTML("beforeend",linaNightlyCheckinMarkup(dateValue));
  const backdrop=document.querySelector(".nightly-checkin-backdrop");
  backdrop?.addEventListener("click",event=>{const feeling=event.target.closest("[data-nightly-feeling]");if(feeling){backdrop.querySelectorAll(`[data-nightly-feeling="${feeling.dataset.nightlyFeeling}"]`).forEach(x=>x.classList.remove("active"));feeling.classList.add("active");}});
  backdrop?.querySelector("#completeNightlyCheckin")?.addEventListener("click",()=>{linaSaveNightlyCheckin(backdrop,dateValue,true);backdrop.remove();toast("Nightly check-in complete 🌙");if(route==="today"||route==="home"||route==="journal")render();});
  backdrop?.querySelector("#laterNightlyCheckin")?.addEventListener("click",()=>{linaSaveNightlyCheckin(backdrop,dateValue,false);backdrop.remove();toast("Saved — I’ll remind you again tonight 💜");window.clearTimeout(window.__linaNightlyReminderTimer);window.__linaNightlyReminderTimer=window.setTimeout(()=>openNightlyCheckin(),30*60*1000);if(route==="today"||route==="home"||route==="journal")render();});
}
function linaMaybeOpenNightlyCheckin(){
  if(!linaNightlyWindowOpen())return;
  const key=linaNightlyDayKey();
  if(data.nightlyCheckinCompleted?.[key])return;
  const remindAt=Number(data.nightlyCheckinRemindAt?.[key]||0);
  if(remindAt>Date.now()){window.clearTimeout(window.__linaNightlyReminderTimer);window.__linaNightlyReminderTimer=window.setTimeout(()=>openNightlyCheckin(),Math.min(remindAt-Date.now(),2147483647));return;}
  window.setTimeout(()=>openNightlyCheckin(),700);
}
