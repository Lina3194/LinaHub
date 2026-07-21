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
  return `<article class="journey-entry" data-day-checkin-id="${esc(entry.id)}" style="--journey-glow:${glow}"><div class="journey-time">${esc(entry.time||"")}</div><button type="button" class="journey-orb" aria-label="Open or remove ${esc(entry.time||"check-in")}"><span></span></button><div class="journey-values"><span title="Energy"><b>${energy[0]}</b><small>${energy[1]}</small></span><span title="Mood"><b>${mood[0]}</b><small>${mood[1]}</small></span><span title="Pain"><b>${pain[0]}</b><small>${pain[1]}</small></span></div></article>`;
}
function dayEntries(dateValue){return (data.dayCheckins||[]).filter(e=>e.date===dateValue).sort((a,b)=>(a.createdAt||"").localeCompare(b.createdAt||""))}
function HealthPage(){
 ensureHealthView();
 data.sleepEntries=Array.isArray(data.sleepEntries)?data.sleepEntries:[];data.dayCheckins=Array.isArray(data.dayCheckins)?data.dayCheckins:[];
 const weights=[...(data.weightEntries||[])].sort((a,b)=>healthSortValue(b).localeCompare(healthSortValue(a)));
 const measures=[...(data.measurements||[])].sort((a,b)=>healthSortValue(b).localeCompare(healthSortValue(a)));
 const sleeps=[...data.sleepEntries].sort((a,b)=>healthSortValue(b).localeCompare(healthSortValue(a)));
 const latest=weights[0],tab=data.healthView.tab,dateValue=today(),morning=(data.checkins||{})[dateValue]||{},todayJourney=dayEntries(dateValue);
 const latestSleep=sleeps[0],medDue=typeof medicationDueSummary==="function"?medicationDueSummary(dateValue):null;
 const dashboard=`<section class="card health-dashboard-hero"><span class="section-kicker">❤️ Your health today</span><h2>${new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})}</h2><div class="health-dashboard-stats"><div><small>Sleep</small><strong>${morning.sleep!=null?HEALTH_FEELINGS.sleep[morning.sleep][0]:"—"}</strong><small>${latestSleep?minutesLabel(latestSleep.totalMinutes):"No time logged"}</small></div><div><small>Energy</small><strong>${morning.energy!=null?HEALTH_FEELINGS.energy[morning.energy][0]:"—"}</strong></div><div><small>Mood</small><strong>${morning.mood!=null?HEALTH_FEELINGS.mood[morning.mood][0]:"—"}</strong></div><div><small>Pain</small><strong>${morning.pain!=null?HEALTH_FEELINGS.pain[morning.pain][0]:"—"}</strong></div></div></section><section class="health-module-grid"><button data-health-open="sleep"><span>${morning.sleep!=null?HEALTH_FEELINGS.sleep[morning.sleep][0]:"😴"}</span><strong>Sleep</strong><small>${latestSleep?minutesLabel(latestSleep.totalMinutes):"Choose how you slept"}</small></button><button data-route="medication"><span>💊</span><strong>Medication</strong><small>Today, history & stock</small></button><button data-route="period"><span>🌸</span><strong>Period</strong><small>Cycle & predictions</small></button><button data-health-open="weight"><span>⚖️</span><strong>Weight</strong><small>${latest?`${esc(healthWeightValue(latest))} kg`:"Add weight"}</small></button><button data-health-open="measurements"><span>📏</span><strong>Measurements</strong><small>${measures.length} entries</small></button></section>`;
 const logTab=`<div class="health-form-grid"><section class="card compact-health-card"><h2>Add weight</h2><div class="compact-health-fields"><input class="field" id="weightDate" type="date" value="${today()}"><input class="field" id="weightValue" type="number" step="0.1" placeholder="Weight kg"></div><button class="primary" id="addWeight">Save weight</button></section><section class="card compact-health-card"><h2>Add measurements</h2><input class="field" id="measureDate" type="date" value="${today()}"><div class="compact-health-fields"><input class="field" id="measureWaist" type="number" step="0.1" placeholder="Waist cm"><input class="field" id="measureTummy" type="number" step="0.1" placeholder="Tummy cm"></div><button class="primary" id="addMeasure">Save measurements</button></section></div>`;
 const sleepTab=`<section class="card sleep-morning-card"><div class="section-title"><div><span class="section-kicker">😴 Morning</span><h2>Sleep & morning check-in</h2></div></div><input class="field" id="sleepDate" type="date" value="${dateValue}"><div class="sleep-time-grid"><label><span>Total sleep</span><div><input class="field" id="sleepHours" type="number" min="0" max="24" placeholder="Hours"><input class="field" id="sleepMinutes" type="number" min="0" max="59" placeholder="Minutes"></div></label><label><span>Deep sleep</span><div><input class="field" id="deepHours" type="number" min="0" max="24" placeholder="Hours"><input class="field" id="deepMinutes" type="number" min="0" max="59" placeholder="Minutes"></div></label></div><h3>Sleep</h3>${healthScale("sleep",morning.sleep)}<h3>Pain</h3>${healthScale("pain",morning.pain)}<h3>Energy</h3>${healthScale("energy",morning.energy)}<h3>Mood</h3>${healthScale("mood",morning.mood)}<p class="health-auto-save-note" id="morningAutoSaveNote">Saved automatically as you tap or change a value.</p></section><section class="card"><div class="section-title"><div><span class="section-kicker">History</span><h2>Sleep history</h2></div></div>${sleeps.length?`<div class="sleep-history">${sleeps.slice(0,30).map(e=>`<article><div><strong>${formatDate(e.date)}</strong><small>${healthEntryTime(e)}</small></div><span>😴 ${minutesLabel(e.totalMinutes)}</span><span>🌙 ${minutesLabel(e.deepMinutes)}</span><button class="mini danger" data-sleep-delete="${esc(e.id)}">×</button></article>`).join("")}</div>`:`<p>No sleep entries yet.</p>`}</section>`;
 const circleScale=(name,items)=>`<div class="health-circle-scale">${items.map((item,index)=>`<button type="button" data-health-feeling="${name}" data-value="${index}" aria-label="${item[1]}"><span>${item[0]}</span><small>${item[1]}</small></button>`).join("")}</div>`;
 const gardenTab=`<section class="card journey-checkin-card"><div class="section-title"><div><span class="section-kicker">✨ Check in</span><h2>How are you right now?</h2></div><strong>${new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</strong></div><p class="journey-direction">Worst on the left · best on the right</p><h3>Energy</h3>${circleScale("dayEnergy",HEALTH_FEELINGS.energy)}<h3>Mood</h3>${circleScale("dayMood",HEALTH_FEELINGS.mood)}<h3>Pain</h3>${circleScale("dayPain",HEALTH_FEELINGS.pain)}<button class="primary" id="saveDayJourney">Save check-in</button></section><section class="card journey-card"><div class="section-title"><div><span class="section-kicker">Today</span><h2>Your journey through the day</h2></div><strong>${todayJourney.length} check-in${todayJourney.length===1?"":"s"}</strong></div><div class="journey-timeline ${todayJourney.length?"":"empty-journey"}">${todayJourney.length?todayJourney.map(journeyEntry).join(""):`<div class="journey-empty"><span>✨</span><strong>No check-ins yet</strong><small>Your day will appear here as a calm timeline.</small></div>`}</div></section>`;
 const weightTab=`<section class="card compact-health-card"><h2>Add weight</h2><div class="compact-health-fields"><input class="field" id="weightDate" type="date" value="${today()}"><input class="field" id="weightValue" type="number" step="0.1" placeholder="Weight kg"></div><button class="primary" id="addWeight">Save weight</button></section><section class="card"><h2>Weight history</h2>${healthRangeButtons("weight",data.healthView.weightRange)}<div data-health-chart-panel="weight">${healthGraph(weights,[{label:"Weight",unit:"kg",get:healthWeightValue}],data.healthView.weightRange)}</div></section>`;
 const measureTab=`<section class="card compact-health-card"><h2>Add measurements</h2><input class="field" id="measureDate" type="date" value="${today()}"><div class="compact-health-fields"><input class="field" id="measureWaist" type="number" step="0.1" placeholder="Waist cm"><input class="field" id="measureTummy" type="number" step="0.1" placeholder="Tummy cm"></div><button class="primary" id="addMeasure">Save measurements</button></section><section class="card"><h2>Measurement history</h2>${healthRangeButtons("measurements",data.healthView.measureRange)}<div data-health-chart-panel="measurements">${healthGraph(measures,[{label:"Waist",unit:"cm",get:e=>e.waist},{label:"Tummy",unit:"cm",get:e=>e.tummy}],data.healthView.measureRange)}</div></section>`;
 const content=tab==='dashboard'?dashboard:tab==='sleep'?sleepTab:tab==='garden'?gardenTab:tab==='weight'?weightTab:tab==='measurements'?measureTab:logTab;
 return shell(`${head("Health","Your wellbeing in one gentle dashboard")}<nav class="health-tabs"><button class="${tab==='dashboard'?'active':''}" data-health-tab="dashboard">Overview</button>${tab!=='dashboard'?`<button class="active">${({sleep:'Sleep',garden:'Journey',weight:'Weight',measurements:'Measurements',log:'Add'})[tab]||'Health'}</button>`:''}</nav>${content}`,"health");
}
function selectedHealthFeeling(name){const el=document.querySelector(`[data-health-feeling="${name}"].active`);return el?Number(el.dataset.value):null}
function bindHealth(){
 ensureHealthView();
 document.querySelectorAll('[data-health-open]').forEach(b=>b.onclick=()=>{data.healthView.tab=b.dataset.healthOpen;saveData();render()});
 document.querySelectorAll('[data-health-tab]').forEach(b=>b.onclick=()=>{data.healthView.tab=b.dataset.healthTab;saveData();render()});
 const saveMorningAutomatically=()=>{
   const date=document.querySelector('#sleepDate')?.value||today();
   data.checkins=data.checkins||{};
   const existing=data.checkins[date]||{};
   const readNumber=id=>{const el=document.querySelector(id);return el&&el.value!==''?Number(el.value):0};
   const sleepValue=selectedHealthFeeling('sleep'),painValue=selectedHealthFeeling('pain'),energyValue=selectedHealthFeeling('energy'),moodValue=selectedHealthFeeling('mood');
   data.checkins[date]={...existing,
     ...(sleepValue!=null?{sleep:sleepValue}:{}),
     ...(painValue!=null?{pain:painValue}:{}),
     ...(energyValue!=null?{energy:energyValue}:{}),
     ...(moodValue!=null?{mood:moodValue}:{})
   };
   const totalMinutes=readNumber('#sleepHours')*60+readNumber('#sleepMinutes');
   const deepMinutes=readNumber('#deepHours')*60+readNumber('#deepMinutes');
   if(totalMinutes>0||deepMinutes>0){
     const existingSleep=(data.sleepEntries||[]).find(entry=>entry.date===date);
     if(existingSleep){existingSleep.totalMinutes=totalMinutes;existingSleep.deepMinutes=deepMinutes;existingSleep.createdAt=new Date().toISOString()}
     else data.sleepEntries.push({id:`sleep-${Date.now()}`,date,totalMinutes,deepMinutes,createdAt:new Date().toISOString()});
   }
   saveData();
   const note=document.querySelector('#morningAutoSaveNote');
   if(note){note.textContent='Saved ✓';clearTimeout(window.__morningSavedTimer);window.__morningSavedTimer=setTimeout(()=>{if(note)note.textContent='Saved automatically as you tap or change a value.'},1000)}
 };
 document.querySelectorAll('[data-health-feeling]').forEach(b=>b.onclick=()=>{
   document.querySelectorAll(`[data-health-feeling="${b.dataset.healthFeeling}"]`).forEach(x=>x.classList.remove('active'));
   b.classList.add('active');
   if(['sleep','pain','energy','mood'].includes(b.dataset.healthFeeling)) saveMorningAutomatically();
 });
 ['#sleepDate','#sleepHours','#sleepMinutes','#deepHours','#deepMinutes'].forEach(selector=>document.querySelector(selector)?.addEventListener('change',saveMorningAutomatically));
 document.querySelector('#addWeight')?.addEventListener('click',()=>{const weight=document.querySelector('#weightValue').value;if(!weight){toast('Enter a weight');return}data.weightEntries.push({...entryTimestamp(document.querySelector('#weightDate').value),weight});saveData();toast('Weight saved ✨');render()});
 document.querySelector('#addMeasure')?.addEventListener('click',()=>{const waist=document.querySelector('#measureWaist').value,tummy=document.querySelector('#measureTummy').value;if(!waist&&!tummy){toast('Add at least one measurement');return}data.measurements.push({...entryTimestamp(document.querySelector('#measureDate').value),waist,tummy});saveData();toast('Measurements saved ✨');render()});
 document.querySelectorAll('[data-sleep-delete]').forEach(b=>b.onclick=()=>{data.sleepEntries=data.sleepEntries.filter(e=>e.id!==b.dataset.sleepDelete);saveData();render()});
 document.querySelector('#saveDayJourney')?.addEventListener('click',()=>{const energy=selectedHealthFeeling('dayEnergy'),mood=selectedHealthFeeling('dayMood'),pain=selectedHealthFeeling('dayPain');if(energy===null||mood===null||pain===null){toast('Choose your energy, mood and pain');return}const stamp=entryTimestamp(today());data.dayCheckins=data.dayCheckins||[];data.dayCheckins.push({id:`journey-${Date.now()}`,...stamp,energy,mood,pain});saveData();toast('Check-in saved ✨');render()});
 document.querySelectorAll('[data-day-checkin-id]').forEach(b=>b.onclick=()=>{if(confirm('Remove this check-in?')){data.dayCheckins=data.dayCheckins.filter(e=>e.id!==b.dataset.dayCheckinId);saveData();render()}});
 document.querySelector('#saveFlowerReminder')?.addEventListener('click',async()=>{const enabled=document.querySelector('#flowerReminderEnabled').checked;if(enabled&&!(await linaRequestNotificationPermission()))return;data.notifications={...(data.notifications||{}),enabled:data.notifications?.enabled||enabled,dayCheckins:enabled,dayCheckinStart:document.querySelector('#flowerReminderStart').value,dayCheckinEnd:document.querySelector('#flowerReminderEnd').value,dayCheckinEvery:Number(document.querySelector('#flowerReminderFrequency').value)||1,lastSent:data.notifications?.lastSent||{}};saveData();linaStartNotificationChecks();toast('Flower reminder saved')});
 document.querySelectorAll('[data-health-range]').forEach(button=>button.onclick=()=>{const kind=button.dataset.healthRange,range=button.dataset.rangeValue;if(kind==='weight')data.healthView.weightRange=range;else data.healthView.measureRange=range;saveData();render()});
}
