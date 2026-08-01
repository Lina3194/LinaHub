const SCALE_OPTIONS={
  sleep:[["😫","Awful"],["😟","Restless"],["😐","Okay"],["😊","Good"],["🤩","Amazing"]],
  energy:[["🥵","Very low"],["😟","Low"],["😐","Okay"],["😊","Good"],["🤩","Amazing"]],
  mood:[["😭","Stressed"],["😟","Anxious"],["😐","Okay"],["🙂","Calm"],["😊","Happy"]],
  pain:[["😭","Very severe"],["😣","Severe"],["😐","Moderate"],["🙂","Mild"],["😌","No pain"]]
};
const JOURNAL_ORDER=["energy","mood","pain","spoons","water","selfcare","supports"];

function journalDate(){return data.journalSelectedDate||today()}
function dateLabel(value){return new Date(value+"T12:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
function emptyJournalEntry(){return {sleep:null,energy:null,mood:null,pain:null,spoons:0,water:0,selfCare:[],supports:[],savedAt:""}}
function renderScale(name,value){return `<div class="scale">${SCALE_OPTIONS[name].map((x,i)=>`<button type="button" data-scale="${name}" data-value="${i}" class="${value!==null&&value!==undefined&&Number(value)===i?"active":""}"><span class="face">${x[0]}</span><small>${x[1]}</small></button>`).join("")}</div>`}

function journalTabs(active){return `<div class="journal-tabs journal-tabs-three"><button type="button" data-journal-tab="today" class="${active==="today"?"active":""}">Today</button><button type="button" data-journal-tab="trends" class="${active==="trends"?"active":""}">Trends</button><button type="button" data-journal-tab="sleep" class="${active==="sleep"?"active":""}">Sleep</button></div>`}

function JournalPage(){
  data.journalTab=data.journalTab||"today";
  if(data.journalTab==="trends") return JournalTrendsPage();
  if(data.journalTab==="sleep") return JournalSleepPage();
  data.dayCheckins=Array.isArray(data.dayCheckins)?data.dayCheckins:[];
  const dateValue=today();
  const entries=typeof dayEntries==="function"?[...dayEntries(dateValue)].reverse():data.dayCheckins.filter(entry=>entry.date===dateValue).sort((a,b)=>String(b.createdAt||`${b.date}T${b.time||"00:00"}`).localeCompare(String(a.createdAt||`${a.date}T${a.time||"00:00"}`)));
  return shell(`${head("Journal","Small check-ins throughout your day")}${journalTabs("today")}
    <section class="card hourly-journal-hero hourly-journal-compact">
      <div><span class="section-kicker">✨ Hourly journal</span><h2>Check in</h2></div>
      <button type="button" class="mini hourly-add-button" data-open-hourly-checkin>＋ Add check-in</button>
    </section>
    <section class="card journey-card"><div class="section-title"><div><span class="section-kicker">Today</span><h2>Journal timeline</h2></div><strong>${entries.length} check-in${entries.length===1?"":"s"}</strong></div><div class="journey-timeline ${entries.length?"":"empty-journey"}">${entries.length?entries.map(journeyEntry).join(""):`<div class="journey-empty"><span>✨</span><strong>No check-ins yet</strong><small>Your first hourly check-in will appear here.</small></div>`}</div></section>`,"journal");
}

function JournalHistoryPage(){
  const dates=Object.keys(data.checkins||{}).sort().reverse();
  return shell(`${head("Journal","Review or complete an earlier day")}${journalTabs("history")}
    <section class="card history-picker"><span class="section-kicker">📅 Add or edit an entry</span><h2>Choose any date</h2><p>You can fill in a missed check-in after midnight or correct one later.</p><div class="date-control"><input id="journalHistoryDate" type="date" max="${today()}" value="${data.journalSelectedDate||today()}"></div><button type="button" class="primary" id="openHistoryDate">Open journal</button></section>
    <section class="journal-history-list"><div class="section-row"><div><span class="section-kicker">History</span><h2>Recent check-ins</h2></div><span>${dates.length} entries</span></div>${dates.length?dates.map(date=>{const e=data.checkins[date]||{};const count=[e.sleep,e.energy,e.mood,e.pain].filter(v=>v!==null&&v!==undefined).length;return `<button type="button" class="history-entry" data-history-date="${date}"><div><strong>${dateLabel(date)}</strong><small>${count===4?"Complete check-in":count?`${count} of 4 feelings logged`:"Wellness only"}</small></div><div class="history-faces"><span>${e.sleep!=null?SCALE_OPTIONS.sleep[e.sleep][0]:"·"}</span><span>${e.energy!=null?SCALE_OPTIONS.energy[e.energy][0]:"·"}</span><span>${e.mood!=null?SCALE_OPTIONS.mood[e.mood][0]:"·"}</span><span>${e.pain!=null?SCALE_OPTIONS.pain[e.pain][0]:"·"}</span></div><b>›</b></button>`}).join(""):`<section class="empty-state">Your saved check-ins will appear here.</section>`}</section>`,"journal");
}

function periodDays(period){return period==="week"?7:period==="month"?30:period==="six"?183:365}
function trendData(key,days){const out=[];const now=new Date();for(let i=days-1;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);const keyDate=d.toISOString().slice(0,10);const v=data.checkins?.[keyDate]?.[key];if(v!==null&&v!==undefined) out.push({date:keyDate,value:Number(v)})}return out}
function hourlyTrendData(key,dateValue){
  const entries=(data.dayCheckins||[]).filter(entry=>entry.date===dateValue&&entry[key]!==null&&entry[key]!==undefined).sort((a,b)=>String(a.createdAt||`${a.date}T${a.time||"00:00"}`).localeCompare(String(b.createdAt||`${b.date}T${b.time||"00:00"}`)));
  return entries.map(entry=>({time:entry.time||new Date(entry.createdAt||Date.now()).toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"}),value:Number(entry[key])}));
}
function trendChart(key,label,period){
  const points=trendData(key,periodDays(period));const avg=points.length?(points.reduce((a,b)=>a+b.value,0)/points.length):null;const width=300,height=92,pad=10;const coords=points.map((p,i)=>`${points.length===1?width/2:pad+i*(width-pad*2)/(points.length-1)},${height-pad-(p.value/4)*(height-pad*2)}`).join(" ");
  return `<article class="trend-card"><div class="trend-head"><div><span>${key==="sleep"?"😴":key==="energy"?"⚡":key==="mood"?"💜":"☀️"}</span><strong>${label}</strong></div><span>${avg===null?"No data":`${SCALE_OPTIONS[key][Math.round(avg)][0]} ${avg.toFixed(1)} average`}</span></div>${points.length?`<svg class="trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label} trend with ${points.length} entries"><line x1="10" y1="82" x2="290" y2="82"></line><line x1="10" y1="46" x2="290" y2="46"></line><line x1="10" y1="10" x2="290" y2="10"></line><polyline points="${coords}"></polyline>${points.map((p,i)=>{const x=points.length===1?width/2:pad+i*(width-pad*2)/(points.length-1),y=height-pad-(p.value/4)*(height-pad*2);return `<circle cx="${x}" cy="${y}" r="3"></circle>`}).join("")}</svg><small>${points.length} recorded ${points.length===1?"day":"days"}</small>`:`<div class="trend-empty">Save a few check-ins to see this trend.</div>`}</article>`
}
function hourlyTrendChart(key,label,dateValue){
  const points=hourlyTrendData(key,dateValue);const avg=points.length?(points.reduce((sum,p)=>sum+p.value,0)/points.length):null;const width=300,height=108,padX=12,padTop=10,padBottom=26;const usableHeight=height-padTop-padBottom;const coords=points.map((p,i)=>`${points.length===1?width/2:padX+i*(width-padX*2)/(points.length-1)},${padTop+(4-p.value)/4*usableHeight}`).join(" ");
  const timeLabels=points.length?points.filter((_,i)=>i===0||i===points.length-1||(points.length>4&&i===Math.floor((points.length-1)/2))):[];
  return `<article class="trend-card day-trend-card"><div class="trend-head"><div><span>${key==="energy"?"⚡":key==="mood"?"💜":"☀️"}</span><strong>${label}</strong></div><span>${avg===null?"No data":`${SCALE_OPTIONS[key][Math.round(avg)][0]} ${avg.toFixed(1)} average`}</span></div>${points.length?`<svg class="trend-svg day-trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label} throughout ${dateLabel(dateValue)}"><line x1="12" y1="82" x2="288" y2="82"></line><line x1="12" y1="46" x2="288" y2="46"></line><line x1="12" y1="10" x2="288" y2="10"></line><polyline points="${coords}"></polyline>${points.map((p,i)=>{const x=points.length===1?width/2:padX+i*(width-padX*2)/(points.length-1),y=padTop+(4-p.value)/4*usableHeight;return `<circle cx="${x}" cy="${y}" r="3.5"><title>${p.time}: ${SCALE_OPTIONS[key][p.value]?.[1]||p.value}</title></circle>`}).join("")}${timeLabels.map(p=>{const i=points.indexOf(p),x=points.length===1?width/2:padX+i*(width-padX*2)/(points.length-1);return `<text x="${x}" y="104" text-anchor="${i===0?"start":i===points.length-1?"end":"middle"}">${esc(p.time)}</text>`}).join("")}</svg><small>${points.length} check-in${points.length===1?"":"s"} on this day</small>`:`<div class="trend-empty">No hourly check-ins were saved on this day.</div>`}</article>`;
}

function journalSleepMinutesLabel(minutes){
  const total=Number(minutes)||0;
  if(!total)return "Not recorded";
  const hours=Math.floor(total/60),mins=total%60;
  return `${hours}h ${mins}m`;
}
function journalSleepQualityLabel(value){
  if(value===null||value===undefined||value==="")return "Not rated";
  const index=Number(value);
  return SCALE_OPTIONS.sleep[index]?.[1]||"Not rated";
}
function journalWakeValue(key,value){
  if(value===null||value===undefined||value==="")return {emoji:"·",label:"Not recorded"};
  const index=Number(value);
  return {emoji:SCALE_OPTIONS[key]?.[index]?.[0]||"·",label:SCALE_OPTIONS[key]?.[index]?.[1]||"Not recorded"};
}
function journalSleepHistory(){
  const byDate=new Map();
  const ensure=date=>{
    if(!date)return null;
    if(!byDate.has(date))byDate.set(date,{date,sleep:null,morning:null,checkin:null});
    return byDate.get(date);
  };
  (Array.isArray(data.sleepEntries)?data.sleepEntries:[]).forEach(entry=>{
    const row=ensure(entry?.date);if(!row)return;
    const current=row.sleep;
    if(!current||String(entry.createdAt||"")>=String(current.createdAt||""))row.sleep=entry;
  });
  Object.entries(data.morningCheckins||{}).forEach(([date,entry])=>{const row=ensure(date);if(row)row.morning=entry||{};});
  Object.entries(data.checkins||{}).forEach(([date,entry])=>{const row=ensure(date);if(row)row.checkin=entry||{};});
  return [...byDate.values()].filter(row=>{
    const sleep=row.sleep||{},morning=row.morning||{},checkin=row.checkin||{};
    return Number(sleep.totalMinutes||morning.sleepTotalMinutes||0)>0||Number(sleep.deepMinutes||morning.deepSleepTotalMinutes||0)>0||[sleep.quality,morning.sleepQuality,checkin.sleep,morning.energy,checkin.energy,morning.mood,checkin.mood,morning.pain,checkin.pain].some(value=>value!==null&&value!==undefined&&value!=="");
  }).sort((a,b)=>b.date.localeCompare(a.date));
}
function journalSleepMetricValue(row,metric){
  const sleep=row.sleep||{},morning=row.morning||{},checkin=row.checkin||{};
  if(metric==="sleep"){
    const minutes=Number(sleep.totalMinutes??morning.sleepTotalMinutes??0)||0;
    return minutes>0?minutes/60:null;
  }
  if(metric==="deep"){
    const minutes=Number(sleep.deepMinutes??morning.deepSleepTotalMinutes??0)||0;
    return minutes>0?minutes/60:null;
  }
  const value=morning[metric]??checkin[metric];
  return value===null||value===undefined||value===""?null:Number(value);
}
function journalSleepMetricInfo(metric){
  return {
    sleep:{label:"Sleep",unit:"hours",icon:"🌙",max:12},
    deep:{label:"Deep sleep",unit:"hours",icon:"💤",max:4},
    pain:{label:"Pain",unit:"level",icon:"☀️",max:4},
    mood:{label:"Mood",unit:"level",icon:"💜",max:4},
    energy:{label:"Energy",unit:"level",icon:"⚡",max:4}
  }[metric]||{label:"Sleep",unit:"hours",icon:"🌙",max:12};
}
function journalSleepMetricLabel(metric,value){
  if(value===null||value===undefined)return "";
  if(metric==="sleep"||metric==="deep"){
    const minutes=Math.round(Number(value)*60);
    return journalSleepMinutesLabel(minutes);
  }
  const index=Math.max(0,Math.min(4,Math.round(Number(value))));
  return SCALE_OPTIONS[metric]?.[index]?.[1]||String(index+1);
}
function journalSleepCellLabel(metric,value){
  if(value===null||value===undefined)return "";
  if(metric==="sleep"||metric==="deep")return `${Number(value).toFixed(Number(value)%1?1:0)}h`;
  return String(Math.round(Number(value))+1);
}
function journalSleepMonthKey(){
  const fallback=(journalSleepHistory()[0]?.date||today()).slice(0,7);
  const value=/^\d{4}-\d{2}$/.test(data.journalSleepMonth||"")?data.journalSleepMonth:fallback;
  data.journalSleepMonth=value;
  return value;
}
function journalSleepSelect(name,value){
  return `<select class="field" id="sleepEdit${name[0].toUpperCase()+name.slice(1)}"><option value="">Not recorded</option>${SCALE_OPTIONS[name].map((item,index)=>`<option value="${index}" ${Number(value)===index?"selected":""}>${item[0]} ${item[1]}</option>`).join("")}</select>`;
}
function journalSleepEditModal(rows){
  const date=data.journalSleepEditDate||"";
  if(!date)return "";
  const row=rows.find(item=>item.date===date)||{date,sleep:null,morning:null,checkin:null};
  const sleep=row.sleep||{},morning=row.morning||{},checkin=row.checkin||{};
  const total=Number(sleep.totalMinutes??morning.sleepTotalMinutes??0)||0;
  const deep=Number(sleep.deepMinutes??morning.deepSleepTotalMinutes??0)||0;
  const quality=sleep.quality??morning.sleepQuality??checkin.sleep??"";
  const energy=morning.energy??checkin.energy??"";
  const mood=morning.mood??checkin.mood??"";
  const pain=morning.pain??checkin.pain??"";
  return `<div class="sleep-edit-backdrop" id="sleepEditBackdrop">
    <section class="sleep-edit-modal" role="dialog" aria-modal="true" aria-labelledby="sleepEditTitle">
      <div class="sleep-edit-head"><div><span class="section-kicker">🌙 Edit sleep record</span><h2 id="sleepEditTitle">${esc(dateLabel(date))}</h2></div><button type="button" data-close-sleep-edit aria-label="Close">×</button></div>
      <div class="sleep-edit-time-grid">
        <label><span>Total sleep</span><div class="sleep-edit-time"><input class="field" id="sleepEditHours" type="number" min="0" max="24" inputmode="numeric" value="${Math.floor(total/60)}"><b>h</b><input class="field" id="sleepEditMinutes" type="number" min="0" max="59" inputmode="numeric" value="${total%60}"><b>m</b></div></label>
        <label><span>Deep sleep</span><div class="sleep-edit-time"><input class="field" id="sleepEditDeepHours" type="number" min="0" max="12" inputmode="numeric" value="${Math.floor(deep/60)}"><b>h</b><input class="field" id="sleepEditDeepMinutes" type="number" min="0" max="59" inputmode="numeric" value="${deep%60}"><b>m</b></div></label>
      </div>
      <div class="sleep-edit-fields">
        <label><span>Sleep quality</span>${journalSleepSelect("sleep",quality)}</label>
        <label><span>Pain on waking</span>${journalSleepSelect("pain",pain)}</label>
        <label><span>Mood on waking</span>${journalSleepSelect("mood",mood)}</label>
        <label><span>Energy on waking</span>${journalSleepSelect("energy",energy)}</label>
      </div>
      <div class="sleep-edit-actions"><button type="button" class="secondary" data-close-sleep-edit>Cancel</button><button type="button" class="primary" id="saveSleepCalendarEdit">Save changes</button></div>
    </section>
  </div>`;
}

function journalSleepCalendar(rows,metric,monthKey){
  const [year,month]=monthKey.split("-").map(Number);
  const first=new Date(year,month-1,1,12);
  const daysInMonth=new Date(year,month,0,12).getDate();
  const leading=(first.getDay()+6)%7;
  const rowByDate=new Map(rows.map(row=>[row.date,row]));
  const info=journalSleepMetricInfo(metric);
  const cells=[];
  for(let index=0;index<leading;index++)cells.push('<div class="sleep-calendar-day is-empty" aria-hidden="true"></div>');
  for(let day=1;day<=daysInMonth;day++){
    const date=`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    const row=rowByDate.get(date);
    const value=row?journalSleepMetricValue(row,metric):null;
    const intensity=value===null?0:Math.max(.12,Math.min(1,Number(value)/info.max));
    const label=value===null?"No record":`${info.label}: ${journalSleepMetricLabel(metric,value)}`;
    cells.push(`<button type="button" class="sleep-calendar-day ${value===null?"no-data":"has-data"}" data-sleep-date="${date}" style="--sleep-intensity:${intensity}" aria-label="${esc(dateLabel(date))}. ${esc(label)}"><span>${day}</span>${value!==null?`<b>${esc(journalSleepCellLabel(metric,value))}</b>`:"<i>·</i>"}</button>`);
  }
  return `<section class="card journal-sleep-calendar"><div class="sleep-calendar-weekdays">${["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(day=>`<span>${day}</span>`).join("")}</div><div class="sleep-calendar-grid">${cells.join("")}</div><div class="sleep-calendar-legend"><span>Less</span><i style="--sleep-intensity:.2"></i><i style="--sleep-intensity:.45"></i><i style="--sleep-intensity:.7"></i><i style="--sleep-intensity:1"></i><span>More</span></div></section>`;
}
function journalSleepChart(rows,metric,monthKey){
  const info=journalSleepMetricInfo(metric);
  const points=rows.filter(row=>row.date.startsWith(monthKey)).map(row=>({date:row.date,value:journalSleepMetricValue(row,metric)})).filter(point=>point.value!==null).sort((a,b)=>a.date.localeCompare(b.date));
  if(!points.length)return `<section class="card sleep-month-chart"><div class="section-title"><div><span class="section-kicker">${info.icon} ${info.label} chart</span><h2>No records this month</h2></div></div><div class="trend-empty">Log a few days to see the monthly chart.</div></section>`;
  const width=720,height=230,left=42,right=18,top=18,bottom=38;
  const maxValue=Math.max(info.max,...points.map(point=>point.value));
  const x=index=>points.length===1?(left+width-right)/2:left+index*(width-left-right)/(points.length-1);
  const y=value=>top+(maxValue-value)/maxValue*(height-top-bottom);
  const line=points.map((point,index)=>`${x(index)},${y(point.value)}`).join(" ");
  const average=points.reduce((sum,point)=>sum+point.value,0)/points.length;
  const ticks=[0,maxValue/2,maxValue];
  return `<section class="card sleep-month-chart"><div class="section-title"><div><span class="section-kicker">${info.icon} ${info.label} chart</span><h2>${points.length} recorded day${points.length===1?"":"s"}</h2></div><strong>${metric==="sleep"||metric==="deep"?`${average.toFixed(1)}h average`:`${average.toFixed(1)} average`}</strong></div><svg class="sleep-chart-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${esc(info.label)} trend for ${esc(monthKey)}"><g class="sleep-chart-grid">${ticks.map(value=>`<line x1="${left}" y1="${y(value)}" x2="${width-right}" y2="${y(value)}"></line><text x="${left-8}" y="${y(value)+4}" text-anchor="end">${metric==="sleep"||metric==="deep"?`${value.toFixed(value%1?1:0)}h`:Math.round(value+1)}</text>`).join("")}</g><polyline class="sleep-chart-line" points="${line}"></polyline>${points.map((point,index)=>`<circle class="sleep-chart-point" cx="${x(index)}" cy="${y(point.value)}" r="5"><title>${dateLabel(point.date)}: ${journalSleepMetricLabel(metric,point.value)}</title></circle>`).join("")}${points.map((point,index)=>{if(points.length>12&&index%Math.ceil(points.length/8)!==0&&index!==points.length-1)return "";return `<text class="sleep-chart-date" x="${x(index)}" y="${height-12}" text-anchor="middle">${Number(point.date.slice(-2))}</text>`}).join("")}</svg></section>`;
}
function JournalSleepPage(){
  const rows=journalSleepHistory();
  const metric=["sleep","deep","pain","mood","energy"].includes(data.journalSleepMetric)?data.journalSleepMetric:"sleep";
  const monthKey=journalSleepMonthKey();
  const monthDate=new Date(`${monthKey}-01T12:00:00`);
  const monthTitle=monthDate.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
  const latestMonth=(rows[0]?.date||today()).slice(0,7);
  const nextDisabled=monthKey>=latestMonth;
  return shell(`${head("Journal","Sleep and how you felt when you woke up")}${journalTabs("sleep")}
    <section class="card sleep-calendar-controls"><div><span class="section-kicker">🌙 Sleep calendar</span><h2>${monthTitle}</h2></div><label><span>Show</span><select class="field" id="journalSleepMetric"><option value="sleep" ${metric==="sleep"?"selected":""}>Sleep</option><option value="deep" ${metric==="deep"?"selected":""}>Deep sleep</option><option value="pain" ${metric==="pain"?"selected":""}>Pain</option><option value="mood" ${metric==="mood"?"selected":""}>Mood</option><option value="energy" ${metric==="energy"?"selected":""}>Energy</option></select></label><div class="sleep-month-arrows"><button type="button" data-sleep-month-step="-1" aria-label="Previous month">‹</button><button type="button" data-sleep-month-step="1" aria-label="Next month" ${nextDisabled?"disabled":""}>›</button></div></section>
    ${journalSleepCalendar(rows,metric,monthKey)}
    ${journalSleepChart(rows,metric,monthKey)}
    <p class="sleep-calendar-help">Tap a recorded date to edit its sleep and waking details.</p>
    ${journalSleepEditModal(rows)}` ,"journal");
}

function JournalTrendsPage(){
  const period=data.journalTrendPeriod||"week";
  const dayDate=data.journalTrendDate||today();
  const controls=`<div class="trend-periods"><button type="button" data-period="day" class="${period==="day"?"active":""}">Day</button><button type="button" data-period="week" class="${period==="week"?"active":""}">Week</button><button type="button" data-period="month" class="${period==="month"?"active":""}">Month</button><button type="button" data-period="six" class="${period==="six"?"active":""}">6 months</button><button type="button" data-period="year" class="${period==="year"?"active":""}">Year</button></div>`;
  const dayPicker=period==="day"?`<div class="trend-day-picker"><button type="button" data-trend-day-step="-1" aria-label="Previous day">‹</button><label><span>Day</span><input type="date" id="journalTrendDate" max="${today()}" value="${dayDate}"></label><button type="button" data-trend-day-step="1" aria-label="Next day" ${dayDate>=today()?"disabled":""}>›</button></div>`:"";
  const charts=period==="day"?`${hourlyTrendChart("energy","Energy",dayDate)}${hourlyTrendChart("mood","Mood",dayDate)}${hourlyTrendChart("pain","Pain",dayDate)}`:`${trendChart("energy","Energy",period)}${trendChart("mood","Mood",period)}${trendChart("pain","Pain",period)}`;
  return shell(`${head("Journal","Trends")}${journalTabs("trends")}${controls}${dayPicker}<section class="trend-grid">${charts}</section>`,"journal")
}

function bindJournal(){
 document.querySelectorAll("[data-journal-tab]").forEach(btn=>btn.onclick=()=>{data.journalTab=btn.dataset.journalTab;if(data.journalTab==="today")data.journalSelectedDate=today();saveData();render()});
 document.querySelector("#journalSleepMetric")?.addEventListener("change",event=>{data.journalSleepMetric=event.target.value;saveData();render()});
 document.querySelectorAll("[data-sleep-month-step]").forEach(button=>button.onclick=()=>{const [year,month]=(data.journalSleepMonth||journalSleepMonthKey()).split("-").map(Number);const next=new Date(year,month-1+Number(button.dataset.sleepMonthStep),1,12);data.journalSleepMonth=`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,"0")}`;saveData();render()});
 document.querySelectorAll("[data-sleep-date]").forEach(button=>button.onclick=()=>{if(!button.classList.contains("has-data"))return;data.journalSleepEditDate=button.dataset.sleepDate;saveData();render()});
 document.querySelectorAll("[data-close-sleep-edit]").forEach(button=>button.onclick=()=>{data.journalSleepEditDate="";saveData();render()});
 document.querySelector("#sleepEditBackdrop")?.addEventListener("click",event=>{if(event.target.id!=="sleepEditBackdrop")return;data.journalSleepEditDate="";saveData();render()});
 document.querySelector("#saveSleepCalendarEdit")?.addEventListener("click",()=>{
   const date=data.journalSleepEditDate;if(!date)return;
   const number=id=>Math.max(0,Number(document.querySelector(id)?.value)||0);
   const clampMinutes=value=>Math.max(0,Math.min(59,Math.round(value)));
   const totalMinutes=Math.round(number("#sleepEditHours"))*60+clampMinutes(number("#sleepEditMinutes"));
   const deepMinutes=Math.round(number("#sleepEditDeepHours"))*60+clampMinutes(number("#sleepEditDeepMinutes"));
   if(deepMinutes>totalMinutes&&totalMinutes>0){toast("Deep sleep cannot be longer than total sleep");return}
   const optional=id=>{const value=document.querySelector(id)?.value;return value===""?null:Number(value)};
   const quality=optional("#sleepEditSleep"),pain=optional("#sleepEditPain"),mood=optional("#sleepEditMood"),energy=optional("#sleepEditEnergy");
   data.sleepEntries=Array.isArray(data.sleepEntries)?data.sleepEntries:[];
   const existing=data.sleepEntries.filter(entry=>entry?.date===date).sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")))[0];
   data.sleepEntries=data.sleepEntries.filter(entry=>entry?.date!==date);
   if(totalMinutes||deepMinutes||quality!==null){data.sleepEntries.push({...existing,id:existing?.id||`sleep-${Date.now()}`,date,totalMinutes,deepMinutes,quality,source:existing?.source||"daily-checkin",createdAt:new Date().toISOString()})}
   data.morningCheckins=data.morningCheckins||{};
   data.morningCheckins[date]={...(data.morningCheckins[date]||{}),sleepTotalMinutes:totalMinutes,deepSleepTotalMinutes:deepMinutes,sleep:totalMinutes/60,deepSleep:deepMinutes/60,sleepQuality:quality,pain,mood,energy,updatedAt:new Date().toISOString()};
   data.checkins=data.checkins||{};
   data.checkins[date]={...(data.checkins[date]||{}),sleep:quality,pain,mood,energy,savedAt:new Date().toISOString()};
   data.journalSleepEditDate="";saveData();toast("Sleep record updated");render();
 });
 document.querySelector("#returnToday")?.addEventListener("click",()=>{data.journalSelectedDate=today();saveData();render()});
 document.querySelector("#openHistoryDate")?.addEventListener("click",()=>{const v=document.querySelector("#journalHistoryDate")?.value;if(!v)return;data.journalSelectedDate=v;data.journalTab="today";saveData();render()});
 document.querySelectorAll("[data-history-date]").forEach(btn=>btn.onclick=()=>{data.journalSelectedDate=btn.dataset.historyDate;data.journalTab="today";saveData();render()});
 document.querySelectorAll("[data-period]").forEach(btn=>btn.onclick=()=>{data.journalTrendPeriod=btn.dataset.period;if(btn.dataset.period==="day"&&!data.journalTrendDate)data.journalTrendDate=today();saveData();render()});
 document.querySelector("#journalTrendDate")?.addEventListener("change",event=>{data.journalTrendDate=event.target.value||today();saveData();render()});
 document.querySelectorAll("[data-trend-day-step]").forEach(btn=>btn.onclick=()=>{const current=new Date(`${data.journalTrendDate||today()}T12:00:00`);current.setDate(current.getDate()+Number(btn.dataset.trendDayStep));const next=current.toISOString().slice(0,10);data.journalTrendDate=next>today()?today():next;saveData();render()});
 document.querySelectorAll("[data-scale]").forEach(btn=>btn.onclick=()=>{document.querySelectorAll(`[data-scale="${btn.dataset.scale}"]`).forEach(x=>x.classList.remove("active"));btn.classList.add("active")});
 document.querySelectorAll("[data-token]").forEach(btn=>btn.onclick=()=>{const n=Number(btn.dataset.value),name=btn.dataset.token;document.querySelectorAll(`[data-token="${name}"]`).forEach(x=>x.classList.toggle("active",Number(x.dataset.value)<=n))});
 document.querySelectorAll("[data-care]").forEach(btn=>btn.onclick=()=>btn.classList.toggle("active"));
 document.querySelector("#editSelfCare")?.addEventListener("click",()=>{const editor=document.querySelector("#selfCareEditor"),button=document.querySelector("#editSelfCare");editor.hidden=!editor.hidden;button.textContent=editor.hidden?"✏️ Edit":"✓ Done";if(!editor.hidden)document.querySelector("#newCareOption")?.focus()});
 const addCareOption=()=>{const input=document.querySelector("#newCareOption"),status=document.querySelector("#selfCareAddStatus"),value=String(input?.value||"").trim();if(!value){if(status)status.textContent="Type an option first.";input?.focus();return}const options=Array.isArray(data.selfCareOptions)&&data.selfCareOptions.length?[...data.selfCareOptions]:["Rest","Reading","Exercises","Warmth","Good food","Fresh air","Music","Gaming","Hobbies"];if(options.some(x=>x.toLowerCase()===value.toLowerCase())){if(status)status.textContent=`${value} is already in your list.`;toast("That option is already there");input?.select();return}data.selfCareOptions=[...options,value];saveData();const pills=document.querySelector("#selfCarePills"),manage=document.querySelector("#selfCareEditor .manage-option-list");if(pills){const button=document.createElement("button");button.type="button";button.className="pill";button.dataset.care=value;button.textContent=value;button.addEventListener("click",()=>button.classList.toggle("active"));pills.appendChild(button)}if(manage){const chip=document.createElement("div");chip.className="manage-option-chip";chip.dataset.manageCare=value;chip.innerHTML=`<span>${esc(value)}</span><button type="button" class="edit-care-option" aria-label="Rename ${esc(value)}">✏️</button><button type="button" class="remove-care-option" aria-label="Remove ${esc(value)}">×</button>`;manage.appendChild(chip)}if(input)input.value="";if(status)status.textContent=`${value} added.`;toast(`${value} added`);input?.focus()};
 document.querySelector("#addCareOption")?.addEventListener("click",addCareOption);
 document.querySelector("#newCareOption")?.addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();addCareOption()}});
 document.querySelector("#selfCareEditor")?.addEventListener("click",e=>{const chip=e.target.closest("[data-manage-care]");if(!chip)return;const oldValue=chip.dataset.manageCare,options=Array.isArray(data.selfCareOptions)&&data.selfCareOptions.length?[...data.selfCareOptions]:["Rest","Reading","Exercises","Warmth","Good food","Fresh air","Music","Gaming","Hobbies"];
   if(e.target.closest(".remove-care-option")){if(options.length<=1){toast("Keep at least one self-care option");return}data.selfCareOptions=options.filter(x=>x!==oldValue);saveData();render();return}
   if(e.target.closest(".edit-care-option")){const next=prompt("Rename this self-care option:",oldValue);if(next===null)return;const value=next.trim();if(!value||value===oldValue)return;if(options.some(x=>x!==oldValue&&x.toLowerCase()===value.toLowerCase())){toast("That option is already there");return}data.selfCareOptions=options.map(x=>x===oldValue?value:x);Object.values(data.checkins||{}).forEach(item=>{if(Array.isArray(item.selfCare))item.selfCare=item.selfCare.map(x=>x===oldValue?value:x)});saveData();render()}
 });
 const refreshSupportOther=()=>{const select=document.querySelector("#supportSelect"),other=document.querySelector("#supportOther");if(other)other.hidden=select?.value!=="Other"};
 document.querySelector("#supportSelect")?.addEventListener("change",refreshSupportOther);
 const addSelectedSupport=value=>{value=String(value||"").trim();if(!value)return;const list=document.querySelector("#selectedSupports");const existing=[...list.querySelectorAll("[data-support]")].map(x=>x.dataset.support);if(existing.includes(value)){toast("That support is already selected");return}const btn=document.createElement("button");btn.type="button";btn.className="selected-support";btn.dataset.support=value;btn.innerHTML=`<span>${esc(value)}</span><b>×</b>`;list.appendChild(btn)};
 document.querySelector("#addSupport")?.addEventListener("click",()=>{const select=document.querySelector("#supportSelect");if(!select?.value)return;if(select.value==="Other"){refreshSupportOther();document.querySelector("#supportOtherText")?.focus();return}addSelectedSupport(select.value);select.value="";refreshSupportOther()});
 document.querySelector("#addOtherSupport")?.addEventListener("click",()=>{const input=document.querySelector("#supportOtherText");addSelectedSupport(input?.value);if(input)input.value=""});
 document.querySelector("#selectedSupports")?.addEventListener("click",e=>e.target.closest("[data-support]")?.remove());
 document.querySelectorAll("[data-filter]").forEach(btn=>btn.onclick=()=>{data.checkinFilter=btn.dataset.filter;saveData();applyJournalFilter();document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("active",x.dataset.filter===data.checkinFilter))});
 document.querySelector("#toggleJournalControls")?.addEventListener("click",()=>{data.journalControlsCollapsed=!data.journalControlsCollapsed;saveData();render()});
 document.querySelector("#toggleEditMode")?.addEventListener("click",()=>{if(data.checkinEditMode)saveJournalLayoutFromDom();data.checkinEditMode=!data.checkinEditMode;saveData();render()});
 document.querySelectorAll("[data-visibility]").forEach(btn=>btn.onclick=e=>{e.stopPropagation();const id=btn.dataset.visibility;data.checkinHidden=data.checkinHidden||[];data.checkinHidden=data.checkinHidden.includes(id)?data.checkinHidden.filter(x=>x!==id):[...data.checkinHidden,id];saveData();render()});
 setupJournalDrag();applyJournalFilter();document.querySelector("#saveJournal")?.addEventListener("click",saveJournalEntry);
}
function applyJournalFilter(){const filter=data.checkinFilter||"all",editing=!!data.checkinEditMode;document.querySelectorAll(".draggable").forEach(card=>{const hidden=(data.checkinHidden||[]).includes(card.dataset.block),filtered=filter!=="all"&&card.dataset.group!==filter;card.classList.toggle("filtered-out",!editing&&(hidden||filtered));card.classList.toggle("soft-hidden",editing&&hidden)})}
function saveJournalLayoutFromDom(){const stack=document.querySelector("#journalStack");if(!stack)return;const order=[...stack.querySelectorAll(".draggable")].map(c=>c.dataset.block).filter(Boolean);if(order.length){data.checkinLayout=order;saveData()}}
function setupJournalDrag(){const stack=document.querySelector("#journalStack");if(!stack||!data.checkinEditMode)return;let dragged=null;stack.querySelectorAll(".draggable").forEach(card=>{const handle=card.querySelector(".drag-handle");if(!handle)return;handle.onpointerdown=e=>{e.preventDefault();dragged=card;card.classList.add("dragging");handle.setPointerCapture?.(e.pointerId)};handle.onpointermove=e=>{if(!dragged)return;const next=[...stack.querySelectorAll(".draggable:not(.dragging)")].find(c=>e.clientY<c.getBoundingClientRect().top+c.offsetHeight/2);next?stack.insertBefore(dragged,next):stack.appendChild(dragged)};handle.onpointerup=()=>{if(!dragged)return;dragged.classList.remove("dragging");dragged=null;saveJournalLayoutFromDom()}})}
function saveJournalEntry(){const getScale=name=>{const el=document.querySelector(`[data-scale="${name}"].active`);return el?Number(el.dataset.value):null};const date=journalDate();data.checkins[date]={...(data.checkins[date]||{}),energy:getScale("energy"),mood:getScale("mood"),pain:getScale("pain"),spoons:document.querySelectorAll('[data-token="spoons"].active').length,water:document.querySelectorAll('[data-token="water"].active').length,selfCare:[...document.querySelectorAll("[data-care].active")].map(x=>x.dataset.care),supports:[...document.querySelectorAll("#selectedSupports [data-support]")].map(x=>x.dataset.support).filter(Boolean),savedAt:new Date().toISOString()};saveData();toast(date===today()?"Today’s check-in saved 💜":"Past entry saved 💜")}
