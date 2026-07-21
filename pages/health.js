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
  data.healthView.tab=["sleep","garden","log","weight","measurements"].includes(data.healthView.tab)?data.healthView.tab:"sleep";
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
  pain:[["😊","None"],["🙂","Mild"],["😐","Moderate"],["😣","High"],["😫","Severe"]]
};
const ENERGY_FLOWERS=["#66508f","#7189b8","#d78db5","#e3bd68","#f3d77c"];
function healthScale(name,value){return `<div class="health-feeling-scale">${HEALTH_FEELINGS[name].map((item,index)=>`<button type="button" class="health-feeling ${Number(value)===index?"active":""}" data-health-feeling="${name}" data-value="${index}"><span>${item[0]}</span><small>${item[1]}</small></button>`).join("")}</div>`}
function minutesLabel(value){const n=Number(value)||0;const h=Math.floor(n/60),m=n%60;return `${h?`${h}h `:""}${m}m`}
function sleepMinutes(prefix){return (Number(document.querySelector(`#${prefix}Hours`)?.value)||0)*60+(Number(document.querySelector(`#${prefix}Minutes`)?.value)||0)}
function flowerSvg(entry,index){const c=ENERGY_FLOWERS[Math.max(0,Math.min(4,Number(entry.energy)||0))],rot=(index%7-3)*8;return `<button class="bouquet-flower" style="--flower:${c};--rot:${rot}deg" data-day-checkin-id="${esc(entry.id)}" title="${esc(entry.time)} · ${HEALTH_FEELINGS.energy[entry.energy]?.[1]||"Energy"} · ${HEALTH_FEELINGS.mood[entry.mood]?.[1]||"Mood"}"><i></i><b></b><span></span></button>`}
function dayEntries(dateValue){return (data.dayCheckins||[]).filter(e=>e.date===dateValue).sort((a,b)=>(a.createdAt||"").localeCompare(b.createdAt||""))}
function HealthPage(){
 ensureHealthView();
 data.sleepEntries=Array.isArray(data.sleepEntries)?data.sleepEntries:[];data.dayCheckins=Array.isArray(data.dayCheckins)?data.dayCheckins:[];
 const weights=[...(data.weightEntries||[])].sort((a,b)=>healthSortValue(b).localeCompare(healthSortValue(a)));
 const measures=[...(data.measurements||[])].sort((a,b)=>healthSortValue(b).localeCompare(healthSortValue(a)));
 const sleeps=[...data.sleepEntries].sort((a,b)=>healthSortValue(b).localeCompare(healthSortValue(a)));
 const latest=weights[0],tab=data.healthView.tab,dateValue=today(),morning=(data.checkins||{})[dateValue]||{},todayFlowers=dayEntries(dateValue);
 const logTab=`<section class="card health-overview"><div class="stat-grid"><div class="stat"><span>Latest weight</span><strong>${latest?`${esc(healthWeightValue(latest))} kg`:"—"}</strong></div><div class="stat"><span>Weight entries</span><strong>${weights.length}</strong></div></div></section><div class="health-form-grid"><section class="card compact-health-card"><h2>Add weight</h2><div class="compact-health-fields"><input class="field" id="weightDate" type="date" value="${today()}"><input class="field" id="weightValue" type="number" step="0.1" placeholder="Weight kg"></div><button class="primary" id="addWeight">Save weight</button></section><section class="card compact-health-card"><h2>Add measurements</h2><input class="field" id="measureDate" type="date" value="${today()}"><div class="compact-health-fields"><input class="field" id="measureWaist" type="number" step="0.1" placeholder="Waist cm"><input class="field" id="measureTummy" type="number" step="0.1" placeholder="Tummy cm"></div><button class="primary" id="addMeasure">Save measurements</button></section></div>`;
 const sleepTab=`<section class="card sleep-morning-card"><div class="section-title"><div><span class="section-kicker">😴 Morning</span><h2>Sleep & morning check-in</h2></div></div><input class="field" id="sleepDate" type="date" value="${dateValue}"><div class="sleep-time-grid"><label><span>Total sleep</span><div><input class="field" id="sleepHours" type="number" min="0" max="24" placeholder="Hours"><input class="field" id="sleepMinutes" type="number" min="0" max="59" placeholder="Minutes"></div></label><label><span>Deep sleep</span><div><input class="field" id="deepHours" type="number" min="0" max="24" placeholder="Hours"><input class="field" id="deepMinutes" type="number" min="0" max="59" placeholder="Minutes"></div></label></div><h3>How did your sleep feel?</h3>${healthScale("sleep",morning.sleep)}<h3>Morning pain</h3>${healthScale("pain",morning.pain)}<h3>Morning energy</h3>${healthScale("energy",morning.energy)}<h3>Morning mood</h3>${healthScale("mood",morning.mood)}<button class="primary" id="saveSleepMorning">Save morning check-in</button></section><section class="card"><div class="section-title"><div><span class="section-kicker">History</span><h2>Recent sleep</h2></div></div>${sleeps.length?`<div class="sleep-history">${sleeps.slice(0,20).map(e=>`<article><div><strong>${formatDate(e.date)}</strong><small>${healthEntryTime(e)}</small></div><span>😴 ${minutesLabel(e.totalMinutes)}</span><span>🌙 ${minutesLabel(e.deepMinutes)}</span><button class="mini danger" data-sleep-delete="${esc(e.id)}">×</button></article>`).join("")}</div>`:`<p>No sleep entries yet.</p>`}</section>`;
 const gardenTab=`<section class="card flower-checkin-card"><div class="section-title"><div><span class="section-kicker">🌸 Through the day</span><h2>Energy & mood flower</h2></div><strong>${new Date().toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"})}</strong></div><h3>Energy</h3><div class="health-feeling-scale">${HEALTH_FEELINGS.energy.map((item,index)=>`<button type="button" class="health-feeling" data-health-feeling="dayEnergy" data-value="${index}"><span>${item[0]}</span><small>${item[1]}</small></button>`).join("")}</div><h3>Mood</h3><div class="health-feeling-scale" id="dayMoodScale">${HEALTH_FEELINGS.mood.map((item,index)=>`<button type="button" class="health-feeling" data-health-feeling="dayMood" data-value="${index}"><span>${item[0]}</span><small>${item[1]}</small></button>`).join("")}</div><h3>Pain <small>(optional)</small></h3>${healthScale("pain",null).replaceAll('data-health-feeling="pain"','data-health-feeling="dayPain"')}<button class="primary" id="saveDayFlower">Add flower</button></section><section class="card bouquet-card"><div class="section-title"><div><span class="section-kicker">Today’s colours</span><h2>Your energy bouquet</h2></div><strong>${todayFlowers.length} flowers</strong></div><div class="bouquet ${todayFlowers.length?"":"empty-bouquet"}">${todayFlowers.length?todayFlowers.map(flowerSvg).join(""):`<p>Your first check-in will grow the first flower.</p>`}<div class="bouquet-wrap"></div></div><div class="flower-key">${ENERGY_FLOWERS.map((c,i)=>`<span><i style="background:${c}"></i>${HEALTH_FEELINGS.energy[i][1]}</span>`).join("")}</div></section><section class="card"><h2>Hourly reminder</h2><label class="settings-toggle"><input type="checkbox" id="flowerReminderEnabled" ${data.notifications?.dayCheckins?"checked":""}><span><strong>Remind me to add a flower</strong><small>Checked while LinaHub is open or running.</small></span></label><div class="flower-reminder-grid"><label>From<input class="field" id="flowerReminderStart" type="time" value="${esc(data.notifications?.dayCheckinStart||"08:00")}"></label><label>Until<input class="field" id="flowerReminderEnd" type="time" value="${esc(data.notifications?.dayCheckinEnd||"22:00")}"></label><label>Every<select class="field" id="flowerReminderFrequency"><option value="1" ${(data.notifications?.dayCheckinEvery||1)==1?"selected":""}>1 hour</option><option value="2" ${(data.notifications?.dayCheckinEvery||1)==2?"selected":""}>2 hours</option><option value="3" ${(data.notifications?.dayCheckinEvery||1)==3?"selected":""}>3 hours</option></select></label></div><button class="secondary" id="saveFlowerReminder">Save reminder</button><p class="settings-note">On iPhone, LinaHub needs to be added to the Home Screen. Fully closed-app delivery still requires a push service.</p></section>`;
 const weightTab=`<section class="card health-history-head"><h2>Weight history</h2></section><section class="card">${healthRangeButtons("weight",data.healthView.weightRange)}<div data-health-chart-panel="weight">${healthGraph(weights,[{label:"Weight",unit:"kg",get:healthWeightValue}],data.healthView.weightRange)}</div></section>`;
 const measureTab=`<section class="card health-history-head"><h2>Measurement history</h2></section><section class="card">${healthRangeButtons("measurements",data.healthView.measureRange)}<div data-health-chart-panel="measurements">${healthGraph(measures,[{label:"Waist",unit:"cm",get:e=>e.waist},{label:"Tummy",unit:"cm",get:e=>e.tummy}],data.healthView.measureRange)}</div></section>`;
 const tabs=[['sleep','Sleep'],['garden','Flowers'],['log','Add'],['weight','Weight'],['measurements','Measures']];
 const content=tab==='sleep'?sleepTab:tab==='garden'?gardenTab:tab==='weight'?weightTab:tab==='measurements'?measureTab:logTab;
 return shell(`${head("Health","Sleep, morning wellbeing and gentle daily patterns")}<nav class="health-tabs">${tabs.map(([id,label])=>`<button class="${tab===id?"active":""}" data-health-tab="${id}">${label}</button>`).join("")}</nav>${content}`,"health");
}
function selectedHealthFeeling(name){const el=document.querySelector(`[data-health-feeling="${name}"].active`);return el?Number(el.dataset.value):null}
function bindHealth(){
 ensureHealthView();
 document.querySelectorAll('[data-health-tab]').forEach(b=>b.onclick=()=>{data.healthView.tab=b.dataset.healthTab;saveData();render()});
 document.querySelectorAll('[data-health-feeling]').forEach(b=>b.onclick=()=>{document.querySelectorAll(`[data-health-feeling="${b.dataset.healthFeeling}"]`).forEach(x=>x.classList.remove('active'));b.classList.add('active')});
 document.querySelector('#addWeight')?.addEventListener('click',()=>{const weight=document.querySelector('#weightValue').value;if(!weight){toast('Enter a weight');return}data.weightEntries.push({...entryTimestamp(document.querySelector('#weightDate').value),weight});saveData();toast('Weight saved ✨');render()});
 document.querySelector('#addMeasure')?.addEventListener('click',()=>{const waist=document.querySelector('#measureWaist').value,tummy=document.querySelector('#measureTummy').value;if(!waist&&!tummy){toast('Add at least one measurement');return}data.measurements.push({...entryTimestamp(document.querySelector('#measureDate').value),waist,tummy});saveData();toast('Measurements saved ✨');render()});
 document.querySelector('#saveSleepMorning')?.addEventListener('click',()=>{const date=document.querySelector('#sleepDate').value||today(),total=sleepMinutes('sleep'),deep=sleepMinutes('deep');if(!total&&!deep){toast('Add your sleep or deep sleep');return}data.sleepEntries=data.sleepEntries||[];data.sleepEntries=data.sleepEntries.filter(e=>e.date!==date);data.sleepEntries.push({id:`sleep-${Date.now()}`,...entryTimestamp(date),totalMinutes:total,deepMinutes:deep});data.checkins=data.checkins||{};const old=data.checkins[date]||{};data.checkins[date]={...old,sleep:selectedHealthFeeling('sleep'),pain:selectedHealthFeeling('pain'),energy:selectedHealthFeeling('energy'),mood:selectedHealthFeeling('mood'),savedAt:new Date().toISOString()};saveData();toast('Sleep and morning check-in saved 💜');render()});
 document.querySelectorAll('[data-sleep-delete]').forEach(b=>b.onclick=()=>{data.sleepEntries=data.sleepEntries.filter(e=>e.id!==b.dataset.sleepDelete);saveData();render()});
 document.querySelector('#saveDayFlower')?.addEventListener('click',()=>{const energy=selectedHealthFeeling('dayEnergy'),mood=selectedHealthFeeling('dayMood'),pain=selectedHealthFeeling('dayPain');if(energy===null||mood===null){toast('Choose your energy and mood');return}const stamp=entryTimestamp(today());data.dayCheckins=data.dayCheckins||[];data.dayCheckins.push({id:`flower-${Date.now()}`,...stamp,energy,mood,pain});saveData();toast('A new flower grew 🌸');render()});
 document.querySelectorAll('[data-day-checkin-id]').forEach(b=>b.onclick=()=>{if(confirm('Remove this flower check-in?')){data.dayCheckins=data.dayCheckins.filter(e=>e.id!==b.dataset.dayCheckinId);saveData();render()}});
 document.querySelector('#saveFlowerReminder')?.addEventListener('click',async()=>{const enabled=document.querySelector('#flowerReminderEnabled').checked;if(enabled&&!(await linaRequestNotificationPermission()))return;data.notifications={...(data.notifications||{}),enabled:data.notifications?.enabled||enabled,dayCheckins:enabled,dayCheckinStart:document.querySelector('#flowerReminderStart').value,dayCheckinEnd:document.querySelector('#flowerReminderEnd').value,dayCheckinEvery:Number(document.querySelector('#flowerReminderFrequency').value)||1,lastSent:data.notifications?.lastSent||{}};saveData();linaStartNotificationChecks();toast('Flower reminder saved')});
 document.querySelectorAll('[data-health-range]').forEach(button=>button.onclick=()=>{const kind=button.dataset.healthRange,range=button.dataset.rangeValue;if(kind==='weight')data.healthView.weightRange=range;else data.healthView.measureRange=range;saveData();render()});
}
