const SCALE_OPTIONS={
  sleep:[["😫","Awful"],["😟","Restless"],["😐","Okay"],["😊","Good"],["🤩","Amazing"]],
  energy:[["🥵","Very low"],["😟","Low"],["😐","Okay"],["😊","Good"],["🤩","Amazing"]],
  mood:[["😭","Stressed"],["😟","Anxious"],["😐","Okay"],["🙂","Calm"],["😊","Happy"]],
  pain:[["😭","Very severe"],["😣","Severe"],["😐","Moderate"],["🙂","Mild"],["😌","No pain"]]
};
const JOURNAL_ORDER=["energy","mood","pain","spoons","water","selfcare","supports"];
const TRACKER_META={
  sleep:{label:"Sleep",icon:"☾",question:"How was your Sleep?",prompt:"Tap a day to log your Sleep for that date.",empty:"No sleep mood logged yet.",options:[
    {label:"Very poor",blurb:"Restless or very little sleep",fill:"#6d46a8",glow:"rgba(182,130,255,.42)",accent:"#d6bcff",level:"26%"},
    {label:"Poor",blurb:"Light sleep or frequent wake ups",fill:"#8b73d6",glow:"rgba(179,160,255,.36)",accent:"#e6dbff",level:"38%"},
    {label:"Okay",blurb:"Some rest, but could be better",fill:"#8eb4f4",glow:"rgba(143,190,255,.33)",accent:"#eef6ff",level:"48%"},
    {label:"Good",blurb:"Solid sleep, felt rested",fill:"#f3c77a",glow:"rgba(255,211,140,.34)",accent:"#fff2d2",level:"58%"},
    {label:"Great",blurb:"Amazing sleep, refreshed",fill:"#f1b4cb",glow:"rgba(255,186,214,.34)",accent:"#fff2b8",level:"68%"}
  ]},
  pain:{label:"Pain",icon:"✦",question:"How was your Pain?",prompt:"Tap a day to log your Pain for that date.",empty:"No pain level logged yet.",options:[
    {label:"Very severe",blurb:"Flare day or hard to function",fill:"#5d3a92",glow:"rgba(154,112,232,.4)",accent:"#d6beff",level:"72%"},
    {label:"Severe",blurb:"A rough day",fill:"#8663c7",glow:"rgba(175,148,245,.34)",accent:"#eadfff",level:"62%"},
    {label:"Moderate",blurb:"Manageable but noticeable",fill:"#9cb3ef",glow:"rgba(154,190,245,.3)",accent:"#eef5ff",level:"52%"},
    {label:"Mild",blurb:"Mostly okay with some aches",fill:"#efc2d2",glow:"rgba(255,197,221,.3)",accent:"#fff1dc",level:"46%"},
    {label:"No pain",blurb:"A lighter easier day",fill:"#f0cf86",glow:"rgba(255,222,147,.3)",accent:"#fff6c8",level:"42%"}
  ]},
  mood:{label:"Mood",icon:"❀",question:"How was your Mood?",prompt:"Tap a day to log your Mood for that date.",empty:"No mood logged yet.",options:[
    {label:"Stressed",blurb:"Everything felt heavy",fill:"#6c478f",glow:"rgba(177,131,240,.38)",accent:"#dbc7ff",level:"68%"},
    {label:"Anxious",blurb:"Uneasy or unsettled",fill:"#9183cc",glow:"rgba(191,182,251,.3)",accent:"#f0eaff",level:"58%"},
    {label:"Okay",blurb:"Steady enough",fill:"#9db7df",glow:"rgba(175,209,255,.28)",accent:"#eef7ff",level:"50%"},
    {label:"Calm",blurb:"Gentle and settled",fill:"#bad5ad",glow:"rgba(191,236,177,.28)",accent:"#f3ffe9",level:"48%"},
    {label:"Happy",blurb:"Bright and light",fill:"#f1c1b7",glow:"rgba(255,204,183,.28)",accent:"#fff1bd",level:"56%"}
  ]},
  energy:{label:"Energy",icon:"✧",question:"How was your Energy?",prompt:"Tap a day to log your Energy for that date.",empty:"No energy level logged yet.",options:[
    {label:"Very low",blurb:"Running on fumes",fill:"#5f4190",glow:"rgba(156,120,235,.38)",accent:"#d8c3ff",level:"32%"},
    {label:"Low",blurb:"A bit worn out",fill:"#7f6dc0",glow:"rgba(181,164,245,.32)",accent:"#eae3ff",level:"40%"},
    {label:"Okay",blurb:"Enough to get by",fill:"#8fb6ec",glow:"rgba(156,204,255,.28)",accent:"#eef8ff",level:"48%"},
    {label:"Good",blurb:"A productive day",fill:"#efc98c",glow:"rgba(255,213,146,.28)",accent:"#fff4cd",level:"58%"},
    {label:"Amazing",blurb:"Plenty in the tank",fill:"#f2b8c8",glow:"rgba(255,192,218,.28)",accent:"#fff2ba",level:"66%"}
  ]}
};
const TRACKER_DOODLE_POSITIONS=[
  [50,16],[63,16],[76,16],
  [32,23],[50,25],[64,25],[79,24],
  [36,34],[52,35],[67,35],
  [24,43],[42,44],[58,45],[72,44],[83,39],
  [26,54],[42,54],[58,55],[74,54],
  [24,66],[44,66],[60,66],[76,67],
  [28,80],[42,75],[55,80],[67,79],
  [39,90],[52,90],[64,90],[77,89]
];
const TRACKER_DOODLE_ART={
  sleep:{title:'Sleep Tracker',shape:'star',accent:'☾'},
  mood:{title:'Mood Tracker',shape:'heart',accent:'♡'},
  pain:{title:'Pain Tracker',shape:'petal',accent:'✿'},
  energy:{title:'Energy Tracker',shape:'circle',accent:'✧'}
};

function journalDate(){return data.journalSelectedDate||today()}
function dateLabel(value){return new Date(value+"T12:00:00").toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
function emptyJournalEntry(){return {sleep:null,energy:null,mood:null,pain:null,spoons:0,water:0,selfCare:[],supports:[],savedAt:""}}
function renderScale(name,value){return `<div class="scale">${SCALE_OPTIONS[name].map((x,i)=>`<button type="button" data-scale="${name}" data-value="${i}" class="${value!==null&&value!==undefined&&Number(value)===i?"active":""}"><span class="face">${x[0]}</span><small>${x[1]}</small></button>`).join("")}</div>`}

function journalTabs(active){return `<div class="journal-tabs journal-tabs-three"><button type="button" data-journal-tab="today" class="${active==="today"?"active":""}">Today</button><button type="button" data-journal-tab="trends" class="${active==="trends"?"active":""}">Trends</button><button type="button" data-journal-tab="sleep" class="${active==="sleep"?"active":""}">Tracker</button></div>`}

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
function journalStoredMinutes(sleep,morning,type){
  const minuteKeys=type==="deep"
    ? [sleep.deepMinutes,sleep.deepSleepTotalMinutes,morning.deepSleepTotalMinutes,morning.deepMinutes]
    : [sleep.totalMinutes,sleep.sleepTotalMinutes,morning.sleepTotalMinutes,morning.totalMinutes];
  const explicit=minuteKeys.map(Number).find(value=>Number.isFinite(value)&&value>0);
  if(explicit!==undefined)return Math.round(explicit);
  const hourKeys=type==="deep"
    ? [sleep.deepSleep,sleep.deepHours,morning.deepSleep,morning.deepHours]
    : [sleep.sleep,sleep.hours,morning.sleep,morning.sleepHours];
  const hours=hourKeys.map(Number).find(value=>Number.isFinite(value)&&value>0);
  return hours!==undefined?Math.round(hours*60):0;
}
function journalSleepMetricValue(row,metric){
  const sleep=row.sleep||{},morning=row.morning||{},checkin=row.checkin||{};
  if(metric==="sleep"){
    const quality=sleep.quality??morning.sleepQuality??checkin.sleep;
    return quality===null||quality===undefined||quality===""?null:Number(quality);
  }
  if(metric==="deep"){
    const minutes=journalStoredMinutes(sleep,morning,"deep");
    return minutes>0?minutes:null;
  }
  const value=morning[metric]??checkin[metric];
  return value===null||value===undefined||value===""?null:Number(value);
}
function journalSleepMetricInfo(metric){
  return {
    sleep:{label:"Sleep",unit:"minutes",icon:"🌙",max:720},
    deep:{label:"Deep sleep",unit:"minutes",icon:"💤",max:240},
    pain:{label:"Pain",unit:"level",icon:"☀️",max:4},
    mood:{label:"Mood",unit:"level",icon:"💜",max:4},
    energy:{label:"Energy",unit:"level",icon:"⚡",max:4}
  }[metric]||{label:"Sleep",unit:"minutes",icon:"🌙",max:720};
}
function journalSleepMetricEmoji(metric,value){
  if(!["sleep","pain","mood","energy"].includes(metric)||value===null||value===undefined)return "";
  const index=Math.max(0,Math.min(4,Math.round(Number(value))));
  return TRACKER_META[metric]?.options?.[index]?.label||"";
}
function journalSleepMetricLabel(metric,value){
  if(value===null||value===undefined)return "";
  const index=Math.max(0,Math.min(4,Math.round(Number(value))));
  return TRACKER_META[metric]?.options?.[index]?.label||"";
}
function journalSleepCellLabel(metric,value){
  if(value===null||value===undefined)return "";
  const index=Math.max(0,Math.min(4,Math.round(Number(value))));
  return TRACKER_META[metric]?.options?.[index]?.label||"";
}
function journalSleepMonthKey(){
  const fallback=(journalSleepHistory()[0]?.date||today()).slice(0,7);
  const value=/^\d{4}-\d{2}$/.test(data.journalSleepMonth||"")?data.journalSleepMonth:fallback;
  data.journalSleepMonth=value;
  return value;
}
function trackerMetricMeta(metric){
  return TRACKER_META[metric]||TRACKER_META.sleep;
}
function trackerMetricButtons(active){
  return ["sleep","pain","mood","energy"].map(metric=>{
    const meta=trackerMetricMeta(metric);
    return `<button type="button" class="tracker-metric-pill ${active===metric?"active":""}" data-tracker-metric="${metric}"><span>${meta.icon}</span>${meta.label}</button>`;
  }).join("");
}
function trackerTone(metric,value){
  const meta=trackerMetricMeta(metric);
  if(value===null||value===undefined||value==="")return {fill:"rgba(255,255,255,.06)",glow:"rgba(0,0,0,0)",accent:"rgba(255,255,255,.28)",level:"16%",label:"Not logged",blurb:meta.empty};
  return meta.options[Math.max(0,Math.min(4,Math.round(Number(value))))]||meta.options[0];
}
function trackerButtonStyle(metric,value){
  const tone=trackerTone(metric,value);
  return `--tracker-fill:${tone.fill};--tracker-glow:${tone.glow};--tracker-accent:${tone.accent};--tracker-level:${tone.level};`;
}
function trackerColourSwatch(metric,value,extraClass=""){
  const empty=value===null||value===undefined||value==="";
  return `<span class="tracker-colour-swatch ${empty?"is-empty":""} ${extraClass}" style="${trackerButtonStyle(metric,value)}" aria-hidden="true"></span>`;
}
function trackerTokenShape(shape){
  if(shape==="star") return `<svg viewBox="0 0 100 100" class="tracker-token-svg" focusable="false" aria-hidden="true"><path d="M50 8 61 36 91 36 66 54 75 84 50 66 25 84 34 54 9 36 39 36Z"/></svg>`;
  if(shape==="petal") return `<svg viewBox="0 0 100 100" class="tracker-token-svg" focusable="false" aria-hidden="true"><path d="M50 12C65 12 79 22 84 36C88 47 85 60 77 70C69 80 57 88 45 88C30 88 18 77 14 63C10 50 13 34 24 24C31 17 40 12 50 12Z"/></svg>`;
  if(shape==="circle") return `<svg viewBox="0 0 100 100" class="tracker-token-svg" focusable="false" aria-hidden="true"><circle cx="50" cy="50" r="38"/></svg>`;
  return `<svg viewBox="0 0 100 90" class="tracker-token-svg" focusable="false" aria-hidden="true"><path d="M50 82C22 62 8 48 8 28C8 14 18 4 31 4C40 4 47 8 50 15C53 8 60 4 69 4C82 4 92 14 92 28C92 48 78 62 50 82Z"/></svg>`;
}
function trackerTokenMarkup(metric,day,value,date,index){
  const logged=!(value===null||value===undefined||value==="");
  const tone=trackerTone(metric,value);
  const art=TRACKER_DOODLE_ART[metric]||TRACKER_DOODLE_ART.mood;
  const [x,y]=TRACKER_DOODLE_POSITIONS[index]||[50,50];
  return `<button type="button" class="tracker-doodle-token ${logged?"logged":"empty"} shape-${art.shape}" data-sleep-date="${date}" style="${trackerButtonStyle(metric,value)};--x:${x}%;--y:${y}%" aria-label="${esc(dateLabel(date))}. ${esc(logged?`${trackerMetricMeta(metric).label}: ${tone.label}`:"Not logged")}">
    <span class="tracker-doodle-token-shape" aria-hidden="true">${trackerTokenShape(art.shape)}</span>
    <span class="tracker-doodle-token-number">${day}</span>
  </button>`;
}
function journalSleepEditModal(rows,metric){
  const date=data.journalSleepEditDate||"";
  if(!date)return "";
  const row=rows.find(item=>item.date===date)||{date,sleep:null,morning:null,checkin:null};
  const current=journalSleepMetricValue(row,metric);
  const meta=trackerMetricMeta(metric);
  const selected=current===null||current===undefined?"":String(current);
  const currentTone=trackerTone(metric,current);
  return `<div class="sleep-edit-backdrop" id="sleepEditBackdrop">
    <section class="sleep-edit-modal tracker-edit-modal" role="dialog" aria-modal="true" aria-labelledby="sleepEditTitle">
      <div class="sleep-edit-head">
        <div><span class="section-kicker">${meta.icon} ${meta.label} tracker</span><h2 id="sleepEditTitle">${esc(new Date(date+"T12:00:00").toLocaleDateString("en-GB",{month:"long",day:"numeric",year:"numeric"}))}</h2></div>
        <button type="button" data-close-sleep-edit aria-label="Close">×</button>
      </div>
      <section class="tracker-modal-current" style="${trackerButtonStyle(metric,current)}">
        ${trackerColourSwatch(metric,current,"tracker-current-swatch")}
        <div><span class="tracker-modal-question">${meta.question}</span><strong>${currentTone.label}</strong><small>${currentTone.blurb}</small></div>
      </section>
      <input type="hidden" id="sleepEditMetric" value="${metric}">
      <input type="hidden" id="sleepEditTrackerValue" value="${selected}">
      <div class="tracker-choice-grid">${meta.options.map((option,index)=>`<button type="button" class="tracker-choice ${selected===String(index)?"active":""}" data-tracker-choice="${index}" style="${trackerButtonStyle(metric,index)}">${trackerColourSwatch(metric,index,"tracker-choice-swatch")}<div><strong>${esc(option.label)}</strong><small>${esc(option.blurb)}</small></div></button>`).join("")}</div>
      <div class="sleep-edit-actions tracker-edit-actions"><button type="button" class="secondary" id="clearSleepCalendarEdit">Clear</button><button type="button" class="primary" id="saveSleepCalendarEdit">Save</button></div>
    </section>
  </div>`;
}
function journalSleepCalendar(rows,metric,monthKey){
  const [year,month]=monthKey.split("-").map(Number);
  const daysInMonth=new Date(year,month,0).getDate();
  const meta=trackerMetricMeta(metric);
  const art=TRACKER_DOODLE_ART[metric]||TRACKER_DOODLE_ART.mood;
  const tokens=[];
  for(let day=1;day<=daysInMonth;day++){
    const date=`${monthKey}-${String(day).padStart(2,"0")}`;
    const row=rows.find(item=>item.date===date);
    const value=row?journalSleepMetricValue(row,metric):null;
    tokens.push(trackerTokenMarkup(metric,day,value,date,day-1));
  }
  return `<section class="card journal-tracker-card tracker-sketch-card tracker-metric-${metric}">
    <div class="tracker-sketch-sheet">
      <div class="tracker-sketch-title">${esc(art.title)}</div>
      <div class="tracker-sketch-stage">
        <svg viewBox="0 0 320 470" class="tracker-sketch-jar" aria-hidden="true" focusable="false">
          <g fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M104 63h112"/>
            <path d="M96 75h128"/>
            <path d="M98 88c0 12 4 17 6 20"/>
            <path d="M218 88c0 12-4 17-6 20"/>
            <path d="M108 108c-4 18-8 40-10 76-3 55-3 143 4 190 6 42 18 63 59 69 41-6 53-27 59-69 7-47 7-135 4-190-2-36-6-58-10-76"/>
            <path d="M91 103c8 1 22 2 69 2h0c47 0 61-1 69-2"/>
            <path d="M112 387c27 8 72 8 98 0"/>
            <path d="M74 96c8 1 11 0 15-3"/>
            <path d="M247 93c4 3 7 4 15 3"/>
            <path d="M98 57c-5-8-13-11-23-9 8 5 14 11 20 19"/>
            <path d="M99 56c-5-3-11-3-18 0"/>
          </g>
        </svg>
        <div class="tracker-sketch-token-layer">${tokens.join("")}</div>
      </div>
      <div class="tracker-sketch-legend-inline">${meta.options.map((option,index)=>`<span class="tracker-inline-chip" style="${trackerButtonStyle(metric,index)}"><i></i>${esc(option.label)}</span>`).join("")}</div>
      <p class="tracker-sheet-helper">Tap any day to log or edit ${meta.label.toLowerCase()}.</p>
    </div>
  </section>`;
}
function journalTrackerLegend(metric){
  const meta=trackerMetricMeta(metric);
  const art=TRACKER_DOODLE_ART[metric]||TRACKER_DOODLE_ART.mood;
  return `<section class="card tracker-key-card tracker-sketch-key"><div class="section-title"><div><span class="section-kicker">${art.accent} ${meta.label} key</span><h2>${meta.label} levels</h2></div></div><div class="tracker-sketch-key-list">${meta.options.map((option,index)=>`<div class="tracker-sketch-key-item" style="${trackerButtonStyle(metric,index)}"><span class="tracker-sketch-key-swatch">${trackerTokenShape(art.shape)}</span><span><strong>${esc(option.label)}</strong><small>${esc(option.blurb)}</small></span></div>`).join("")}</div></section>`;
}
function JournalSleepPage(){
  const rows=journalSleepHistory();
  const metric=["sleep","pain","mood","energy"].includes(data.journalSleepMetric)?data.journalSleepMetric:"sleep";
  if(data.journalSleepMetric!==metric){data.journalSleepMetric=metric;saveData();}
  const meta=trackerMetricMeta(metric);
  const monthKey=journalSleepMonthKey();
  const monthDate=new Date(`${monthKey}-01T12:00:00`);
  const monthTitle=monthDate.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
  const latestMonth=(rows[0]?.date||today()).slice(0,7);
  const nextDisabled=monthKey>=latestMonth;
  return shell(`${head("Journal","Monthly wellness tracker")}${journalTabs("sleep")}
    <section class="card sleep-calendar-controls tracker-hero-card"><div><span class="section-kicker">✨ Monthly wellness tracker</span><h2>${monthTitle}</h2><p class="tracker-helper">${meta.prompt}</p></div><label><span>Tracker</span><select class="field" id="journalSleepMetric"><option value="sleep" ${metric==="sleep"?"selected":""}>Sleep</option><option value="pain" ${metric==="pain"?"selected":""}>Pain</option><option value="mood" ${metric==="mood"?"selected":""}>Mood</option><option value="energy" ${metric==="energy"?"selected":""}>Energy</option></select></label><div class="sleep-month-arrows"><button type="button" data-sleep-month-step="-1" aria-label="Previous month">‹</button><button type="button" data-sleep-month-step="1" aria-label="Next month" ${nextDisabled?"disabled":""}>›</button></div><div class="tracker-metric-tabs">${trackerMetricButtons(metric)}</div></section>
    ${journalSleepCalendar(rows,metric,monthKey)}
    <p class="sleep-calendar-help">Tap any day to log or edit ${meta.label.toLowerCase()}.</p>
    ${journalTrackerLegend(metric)}
    ${journalSleepEditModal(rows,metric)}` ,"journal");
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
 // Remove any orphaned modal left outside #app by an earlier render.
 document.querySelectorAll("body > #sleepEditBackdrop").forEach((node,index)=>{if(index>0||!data.journalSleepEditDate)node.remove()});
 const sleepEditBackdrop=document.querySelector("#sleepEditBackdrop");
 // Move the modal outside the animated page wrapper. A transformed ancestor makes
 // position:fixed relative to the app column on desktop instead of the viewport.
 if(sleepEditBackdrop&&sleepEditBackdrop.parentElement!==document.body)document.body.appendChild(sleepEditBackdrop);
 const closeSleepEditor=()=>{
   document.querySelector("body > #sleepEditBackdrop")?.remove();
   data.journalSleepEditDate="";
   saveData();
   render();
 };
 document.querySelectorAll("[data-journal-tab]").forEach(btn=>btn.onclick=()=>{data.journalTab=btn.dataset.journalTab;if(data.journalTab==="today")data.journalSelectedDate=today();if(data.journalTab==="sleep"&&!data.journalSleepMetric)data.journalSleepMetric="sleep";saveData();render()});
 document.querySelector("#journalSleepMetric")?.addEventListener("change",event=>{data.journalSleepMetric=event.target.value;saveData();render()});
 document.querySelectorAll("[data-tracker-metric]").forEach(button=>button.onclick=()=>{data.journalSleepMetric=button.dataset.trackerMetric||"sleep";saveData();render()});
 document.querySelectorAll("[data-sleep-month-step]").forEach(button=>button.onclick=()=>{const [year,month]=(data.journalSleepMonth||journalSleepMonthKey()).split("-").map(Number);const next=new Date(year,month-1+Number(button.dataset.sleepMonthStep),1,12);data.journalSleepMonth=`${next.getFullYear()}-${String(next.getMonth()+1).padStart(2,"0")}`;saveData();render()});
 document.querySelectorAll("[data-sleep-date]").forEach(button=>button.onclick=()=>{data.journalSleepEditDate=button.dataset.sleepDate;saveData();render()});
 document.querySelectorAll("[data-close-sleep-edit]").forEach(button=>button.onclick=closeSleepEditor);
 document.querySelector("#sleepEditBackdrop")?.addEventListener("click",event=>{if(event.target.id!=="sleepEditBackdrop")return;closeSleepEditor()});
 if(sleepEditBackdrop){
   const escapeHandler=event=>{if(event.key!=="Escape")return;document.removeEventListener("keydown",escapeHandler);closeSleepEditor()};
   document.addEventListener("keydown",escapeHandler);
 }
 document.querySelectorAll("[data-tracker-choice]").forEach(button=>button.onclick=()=>{const value=button.dataset.trackerChoice||"";document.querySelector("#sleepEditTrackerValue").value=value;document.querySelectorAll("[data-tracker-choice]").forEach(node=>node.classList.toggle("active",node.dataset.trackerChoice===value))});
 document.querySelector("#clearSleepCalendarEdit")?.addEventListener("click",()=>{document.querySelector("#sleepEditTrackerValue").value="";document.querySelectorAll("[data-tracker-choice]").forEach(node=>node.classList.remove("active"))});
 document.querySelector("#saveSleepCalendarEdit")?.addEventListener("click",()=>{
   const date=data.journalSleepEditDate;if(!date)return;
   const metric=document.querySelector("#sleepEditMetric")?.value||data.journalSleepMetric||"sleep";
   const raw=document.querySelector("#sleepEditTrackerValue")?.value;
   const value=raw===""?null:Number(raw);
   data.checkins=data.checkins||{};
   data.checkins[date]={...(data.checkins[date]||{}),[metric]:value,savedAt:new Date().toISOString()};
   data.morningCheckins=data.morningCheckins||{};
   data.morningCheckins[date]={...(data.morningCheckins[date]||{}),[metric]:value,updatedAt:new Date().toISOString()};
   if(metric==="sleep"){
     data.sleepEntries=Array.isArray(data.sleepEntries)?data.sleepEntries:[];
     const existing=data.sleepEntries.filter(entry=>entry?.date===date).sort((a,b)=>String(b.createdAt||"").localeCompare(String(a.createdAt||"")))[0];
     data.sleepEntries=data.sleepEntries.filter(entry=>entry?.date!==date);
     const totalMinutes=Number(existing?.totalMinutes??0)||0;
     const deepMinutes=Number(existing?.deepMinutes??0)||0;
     if(totalMinutes||deepMinutes||value!==null){
       data.sleepEntries.push({...existing,id:existing?.id||`sleep-${Date.now()}`,date,totalMinutes,deepMinutes,quality:value,source:existing?.source||"daily-checkin",createdAt:new Date().toISOString()});
     }
     data.morningCheckins[date]={...(data.morningCheckins[date]||{}),sleepQuality:value,updatedAt:new Date().toISOString()};
     data.checkins[date]={...(data.checkins[date]||{}),sleep:value,savedAt:new Date().toISOString()};
   }
   document.querySelector("body > #sleepEditBackdrop")?.remove();
   data.journalSleepEditDate="";saveData();toast(`${trackerMetricMeta(metric).label} saved`);render();
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
