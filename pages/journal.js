const SCALE_OPTIONS={
  sleep:[["😫","Awful"],["😟","Restless"],["😐","Okay"],["😊","Good"],["🤩","Amazing"]],
  energy:[["🥵","Very low"],["😟","Low"],["😐","Okay"],["😊","Good"],["🤩","Amazing"]],
  mood:[["😭","Stressed"],["😟","Anxious"],["😐","Okay"],["🙂","Calm"],["😊","Happy"]],
  pain:[["😭","Very severe"],["😣","Severe"],["😐","Moderate"],["🙂","Mild"],["😌","No pain"]]
};
const JOURNAL_ORDER=["energy","mood","pain","spoons","water","selfcare","supports"];
const TRACKER_META={
  sleep:{label:"Sleep",icon:"☾",question:"How was your Sleep?",prompt:"Tap a day to log your Sleep for that date.",empty:"No sleep logged yet.",options:[
    {label:"Very poor",blurb:"Restless or very little sleep",fill:"#7b4dff",glow:"rgba(123,77,255,.42)",accent:"#e1d1ff",level:"26%"},
    {label:"Poor",blurb:"Light sleep or frequent wake ups",fill:"#b084ff",glow:"rgba(176,132,255,.38)",accent:"#f0e8ff",level:"38%"},
    {label:"Okay",blurb:"Some rest, but could be better",fill:"#7ecbff",glow:"rgba(126,203,255,.34)",accent:"#eef8ff",level:"48%"},
    {label:"Good",blurb:"Solid sleep, felt rested",fill:"#ffd166",glow:"rgba(255,209,102,.34)",accent:"#fff5d8",level:"58%"},
    {label:"Great",blurb:"Amazing sleep, refreshed",fill:"#ff8fc7",glow:"rgba(255,143,199,.34)",accent:"#ffe6f2",level:"68%"}
  ]},
  deep:{label:"Deep sleep",icon:"💤",question:"Deep sleep is calculated from your sleep log.",prompt:"Tap a day to view your Deep sleep for that date.",empty:"No deep sleep recorded yet.",options:[
    {label:"Very low",blurb:"Under 30 minutes",fill:"#7b4dff",glow:"rgba(123,77,255,.42)",accent:"#e1d1ff",level:"26%"},
    {label:"Low",blurb:"30 to 59 minutes",fill:"#9b7dff",glow:"rgba(155,125,255,.38)",accent:"#ece3ff",level:"38%"},
    {label:"Okay",blurb:"1 to 1.5 hours",fill:"#7ecbff",glow:"rgba(126,203,255,.34)",accent:"#eef8ff",level:"48%"},
    {label:"Good",blurb:"1.5 to 2 hours",fill:"#9ce27d",glow:"rgba(156,226,125,.34)",accent:"#eff9e8",level:"58%"},
    {label:"Excellent",blurb:"Over 2 hours",fill:"#ffd166",glow:"rgba(255,209,102,.34)",accent:"#fff5d8",level:"68%"}
  ]},
  pain:{label:"Pain",icon:"✦",question:"How was your Pain?",prompt:"Tap a day to log your Pain for that date.",empty:"No pain level logged yet.",options:[
    {label:"Very severe",blurb:"Flare day or hard to function",fill:"#7b4dff",glow:"rgba(123,77,255,.42)",accent:"#e1d1ff",level:"72%"},
    {label:"Severe",blurb:"A rough day",fill:"#b084ff",glow:"rgba(176,132,255,.38)",accent:"#f0e8ff",level:"62%"},
    {label:"Moderate",blurb:"Manageable but noticeable",fill:"#7ecbff",glow:"rgba(126,203,255,.34)",accent:"#eef8ff",level:"52%"},
    {label:"Mild",blurb:"Mostly okay with some aches",fill:"#ffd166",glow:"rgba(255,209,102,.34)",accent:"#fff5d8",level:"46%"},
    {label:"No pain",blurb:"A lighter easier day",fill:"#ff8fc7",glow:"rgba(255,143,199,.34)",accent:"#ffe6f2",level:"42%"}
  ]},
  mood:{label:"Mood",icon:"❀",question:"How was your Mood?",prompt:"Tap a day to log your Mood for that date.",empty:"No mood logged yet.",options:[
    {label:"Stressed",blurb:"Everything felt heavy",fill:"#7b4dff",glow:"rgba(123,77,255,.42)",accent:"#e1d1ff",level:"68%"},
    {label:"Anxious",blurb:"Uneasy or unsettled",fill:"#b084ff",glow:"rgba(176,132,255,.38)",accent:"#f0e8ff",level:"58%"},
    {label:"Okay",blurb:"Steady enough",fill:"#7ecbff",glow:"rgba(126,203,255,.34)",accent:"#eef8ff",level:"50%"},
    {label:"Calm",blurb:"Gentle and settled",fill:"#9ce27d",glow:"rgba(156,226,125,.34)",accent:"#eff9e8",level:"48%"},
    {label:"Happy",blurb:"Bright and light",fill:"#ff8fc7",glow:"rgba(255,143,199,.34)",accent:"#ffe6f2",level:"56%"}
  ]},
  energy:{label:"Energy",icon:"✧",question:"How was your Energy?",prompt:"Tap a day to log your Energy for that date.",empty:"No energy level logged yet.",options:[
    {label:"Very low",blurb:"Running on fumes",fill:"#7b4dff",glow:"rgba(123,77,255,.42)",accent:"#e1d1ff",level:"32%"},
    {label:"Low",blurb:"A bit worn out",fill:"#b084ff",glow:"rgba(176,132,255,.38)",accent:"#f0e8ff",level:"40%"},
    {label:"Okay",blurb:"Enough to get by",fill:"#7ecbff",glow:"rgba(126,203,255,.34)",accent:"#eef8ff",level:"48%"},
    {label:"Good",blurb:"A productive day",fill:"#ffd166",glow:"rgba(255,209,102,.34)",accent:"#fff5d8",level:"58%"},
    {label:"Amazing",blurb:"Plenty in the tank",fill:"#ff8fc7",glow:"rgba(255,143,199,.34)",accent:"#ffe6f2",level:"66%"}
  ]}
};
const TRACKER_ART={
  sleep:{title:"Sleep Tracker",accent:"☾"},
  deep:{title:"Deep Sleep Tracker",accent:"💤"},
  mood:{title:"Mood Tracker",accent:"♡"},
  pain:{title:"Pain Tracker",accent:"✦"},
  energy:{title:"Energy Tracker",accent:"✧"}
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
  if(value===null||value===undefined)return "";
  if(metric==="deep")return journalSleepMinutesLabel(value);
  if(!["sleep","pain","mood","energy"].includes(metric))return "";
  const index=Math.max(0,Math.min(4,Math.round(Number(value))));
  return TRACKER_META[metric]?.options?.[index]?.label||"";
}
function journalSleepMetricLabel(metric,value){
  if(value===null||value===undefined)return "";
  if(metric==="deep")return journalSleepMinutesLabel(value);
  const index=Math.max(0,Math.min(4,Math.round(Number(value))));
  return TRACKER_META[metric]?.options?.[index]?.label||"";
}
function journalSleepCellLabel(metric,value){
  if(value===null||value===undefined)return "";
  if(metric==="deep")return journalSleepMinutesLabel(value);
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
  return ["sleep","deep","pain","mood","energy"].map(metric=>{
    const meta=trackerMetricMeta(metric);
    return `<button type="button" class="tracker-metric-pill ${active===metric?"active":""}" data-tracker-metric="${metric}">${meta.label}</button>`;
  }).join("");
}
function trackerTone(metric,value){
  const meta=trackerMetricMeta(metric);
  if(value===null||value===undefined||value==="")return {fill:"rgba(255,255,255,.06)",glow:"rgba(0,0,0,0)",accent:"rgba(255,255,255,.28)",level:"16%",label:"Not logged",blurb:meta.empty};
  if(metric==="deep"){
    const minutes=Math.max(0,Number(value)||0);
    const index=minutes>=120?4:minutes>=90?3:minutes>=60?2:minutes>=30?1:0;
    return meta.options[index]||meta.options[0];
  }
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
function trackerHeartSvg(){
  return `<svg viewBox="0 0 100 90" class="tracker-art-heart-svg" focusable="false" aria-hidden="true"><path d="M50 82C22 62 8 48 8 28C8 14 18 4 31 4C40 4 47 8 50 15C53 8 60 4 69 4C82 4 92 14 92 28C92 48 78 62 50 82Z"/></svg>`;
}
function trackerDayNote(row,metric,value){
  const sleep=row?.sleep||{},morning=row?.morning||{};
  if(metric==="sleep"){ const total=journalStoredMinutes(sleep,morning,"sleep"); return total>0?journalSleepMinutesLabel(total):"—"; }
  if(metric==="deep"){ const total=journalStoredMinutes(sleep,morning,"deep"); return total>0?journalSleepMinutesLabel(total):"—"; }
  if(value===null||value===undefined||value==="") return "—";
  return trackerTone(metric,value).label;
}
function trackerArtBackdrop(metric){
  if(metric==="sleep"||metric==="deep") return `<svg viewBox="0 0 560 330" class="tracker-backdrop-svg" aria-hidden="true"><defs><radialGradient id="sleepMoon" cx="38%" cy="32%"><stop offset="0" stop-color="#fff7d2" stop-opacity=".95"/><stop offset="1" stop-color="#a783ff" stop-opacity=".22"/></radialGradient><linearGradient id="sleepCloud" x1="0" x2="1"><stop stop-color="#9181d3" stop-opacity=".24"/><stop offset="1" stop-color="#e4b8ee" stop-opacity=".09"/></linearGradient></defs><circle cx="425" cy="82" r="62" fill="url(#sleepMoon)"/><circle cx="448" cy="62" r="62" fill="#221633"/><g fill="url(#sleepCloud)"><ellipse cx="116" cy="247" rx="88" ry="31"/><ellipse cx="184" cy="230" rx="79" ry="38"/><ellipse cx="263" cy="250" rx="96" ry="33"/></g><g fill="#f5d787"><circle cx="82" cy="66" r="2.7"/><circle cx="146" cy="101" r="2"/><circle cx="208" cy="55" r="2.4"/><circle cx="323" cy="78" r="1.8"/><circle cx="482" cy="171" r="2.2"/></g></svg>`;
  if(metric==="mood") return `<svg viewBox="0 0 560 330" class="tracker-backdrop-svg" aria-hidden="true"><defs><radialGradient id="moodBloom"><stop stop-color="#ff8fbe" stop-opacity=".58"/><stop offset="1" stop-color="#d052dd" stop-opacity="0"/></radialGradient></defs><g fill="none" stroke="#cb9de3" stroke-width="2.2" stroke-opacity=".18"><path d="M84 312c35-70 54-139 48-224"/><path d="M475 312c-43-74-59-141-49-229"/><path d="M130 200c-24-24-42-33-70-37"/><path d="M430 205c28-25 47-34 76-38"/></g><g fill="url(#moodBloom)"><circle cx="109" cy="76" r="66"/><circle cx="454" cy="84" r="72"/><circle cx="66" cy="246" r="55"/><circle cx="500" cy="246" r="58"/></g><g fill="#f4b4d0" fill-opacity=".22"><ellipse cx="112" cy="72" rx="17" ry="42" transform="rotate(18 112 72)"/><ellipse cx="91" cy="92" rx="17" ry="42" transform="rotate(-44 91 92)"/><ellipse cx="454" cy="81" rx="18" ry="45" transform="rotate(31 454 81)"/><ellipse cx="477" cy="101" rx="17" ry="42" transform="rotate(-27 477 101)"/></g></svg>`;
  if(metric==="pain") return `<svg viewBox="0 0 560 330" class="tracker-backdrop-svg" aria-hidden="true"><defs><linearGradient id="painLeaf" x1="0" x2="1"><stop stop-color="#7f6bc7" stop-opacity=".42"/><stop offset="1" stop-color="#efb5d3" stop-opacity=".12"/></linearGradient></defs><g fill="none" stroke="url(#painLeaf)" stroke-width="3" stroke-linecap="round"><path d="M41 300c80-52 124-126 135-246"/><path d="M519 300c-80-52-124-126-135-246"/></g><g fill="url(#painLeaf)"><ellipse cx="132" cy="116" rx="18" ry="43" transform="rotate(38 132 116)"/><ellipse cx="103" cy="168" rx="18" ry="42" transform="rotate(52 103 168)"/><ellipse cx="88" cy="226" rx="17" ry="39" transform="rotate(66 88 226)"/><ellipse cx="428" cy="116" rx="18" ry="43" transform="rotate(-38 428 116)"/><ellipse cx="457" cy="168" rx="18" ry="42" transform="rotate(-52 457 168)"/><ellipse cx="472" cy="226" rx="17" ry="39" transform="rotate(-66 472 226)"/></g><ellipse cx="280" cy="172" rx="164" ry="118" fill="#9d65ff" fill-opacity=".035"/></svg>`;
  return `<svg viewBox="0 0 560 330" class="tracker-backdrop-svg" aria-hidden="true"><defs><radialGradient id="energySun"><stop stop-color="#ffd985" stop-opacity=".52"/><stop offset=".44" stop-color="#d052dd" stop-opacity=".13"/><stop offset="1" stop-color="#9d65ff" stop-opacity="0"/></radialGradient></defs><circle cx="280" cy="167" r="146" fill="url(#energySun)"/><g stroke="#f0c56f" stroke-opacity=".17" stroke-width="2"><path d="M280 9v48M280 276v45M122 166H61M499 166h-61M169 55l33 35M391 55l-33 35M169 278l33-35M391 278l-33-35"/></g><g fill="#f3cc79"><circle cx="74" cy="77" r="2.4"/><circle cx="470" cy="70" r="2"/><circle cx="507" cy="245" r="2.5"/><circle cx="88" cy="267" r="1.8"/></g></svg>`;
}
function trackerTokenMarkup(metric,day,value,date,row){
  const logged=!(value===null||value===undefined||value==="");
  const tone=trackerTone(metric,value);
  const note=trackerDayNote(row,metric,value);
  return `<button type="button" class="tracker-art-day ${logged?"logged":"empty"}" data-sleep-date="${date}" style="${trackerButtonStyle(metric,value)}" aria-label="${esc(dateLabel(date))}. ${esc(logged?`${trackerMetricMeta(metric).label}: ${tone.label}`:"Not logged")}">
    <span class="tracker-art-heart" aria-hidden="true">${trackerHeartSvg()}</span>
    <span class="tracker-art-day-number">${day}</span>
    <span class="tracker-art-day-note">${esc(note)}</span>
  </button>`;
}
function trackerDateSelectors(monthKey,rows){
  const [selectedYear,selectedMonth]=monthKey.split("-").map(Number);
  const months=["January","February","March","April","May","June","July","August","September","October","November","December"];
  const currentYear=new Date().getFullYear();
  const historyYears=rows.map(row=>Number(row.date.slice(0,4))).filter(Boolean);
  const minYear=Math.min(currentYear-5,...historyYears);
  const maxYear=Math.max(currentYear+5,...historyYears);
  const yearOptions=[];
  for(let year=minYear;year<=maxYear;year++) yearOptions.push(`<option value="${year}" ${year===selectedYear?"selected":""}>${year}</option>`);
  return `<div class="tracker-date-selectors">
    <label><span>Month</span><select class="field" id="journalSleepMonthSelect">${months.map((label,index)=>`<option value="${String(index+1).padStart(2,"0")}" ${index+1===selectedMonth?"selected":""}>${label}</option>`).join("")}</select></label>
    <label><span>Year</span><select class="field" id="journalSleepYearSelect">${yearOptions.join("")}</select></label>
    <button type="button" class="secondary tracker-today-button" data-tracker-today>Today</button>
  </div>`;
}

function journalSleepEditModal(rows,metric){
  const date=data.journalSleepEditDate||"";
  if(!date)return "";
  const row=rows.find(item=>item.date===date)||{date,sleep:null,morning:null,checkin:null};
  const current=journalSleepMetricValue(row,metric);
  const meta=trackerMetricMeta(metric);
  const currentTone=trackerTone(metric,current);
  if(metric==="deep"){
    const deepMinutes=journalStoredMinutes(row.sleep||{},row.morning||{},"deep");
    return `<div class="sleep-edit-backdrop" id="sleepEditBackdrop">
      <section class="sleep-edit-modal tracker-edit-modal" role="dialog" aria-modal="true" aria-labelledby="sleepEditTitle">
        <div class="sleep-edit-head">
          <div><span class="section-kicker">${meta.label} tracker</span><h2 id="sleepEditTitle">${esc(new Date(date+"T12:00:00").toLocaleDateString("en-GB",{month:"long",day:"numeric",year:"numeric"}))}</h2></div>
          <button type="button" data-close-sleep-edit aria-label="Close">×</button>
        </div>
        <section class="tracker-modal-current" style="${trackerButtonStyle(metric,current)}">
          ${trackerColourSwatch(metric,current,"tracker-current-swatch")}
          <div><span class="tracker-modal-question">Deep sleep total</span><strong>${esc(deepMinutes?journalSleepMinutesLabel(deepMinutes):"Not recorded")}</strong><small>${esc(currentTone.blurb)}</small></div>
        </section>
        <p class="tracker-deep-help">Deep sleep is pulled from the saved sleep log for that date, so it is view-only here.</p>
        <div class="sleep-edit-actions tracker-edit-actions"><button type="button" class="primary" data-close-sleep-edit>Close</button></div>
      </section>
    </div>`;
  }
  const selected=current===null||current===undefined?"":String(current);
  return `<div class="sleep-edit-backdrop" id="sleepEditBackdrop">
    <section class="sleep-edit-modal tracker-edit-modal" role="dialog" aria-modal="true" aria-labelledby="sleepEditTitle">
      <div class="sleep-edit-head">
        <div><span class="section-kicker">${meta.label} tracker</span><h2 id="sleepEditTitle">${esc(new Date(date+"T12:00:00").toLocaleDateString("en-GB",{month:"long",day:"numeric",year:"numeric"}))}</h2></div>
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
  const tokens=[];
  for(let day=1;day<=daysInMonth;day++){
    const date=`${monthKey}-${String(day).padStart(2,"0")}`;
    const row=rows.find(item=>item.date===date);
    const value=row?journalSleepMetricValue(row,metric):null;
    tokens.push(trackerTokenMarkup(metric,day,value,date,row));
  }
  return `<section class="card journal-tracker-card tracker-enchanted-card tracker-metric-${metric}">
    <div class="tracker-enchanted-panel">
      ${trackerArtBackdrop(metric)}
      <div class="tracker-art-heading">
        <span class="section-kicker">Monthly ${meta.label}</span>
        <h2>${meta.label} tracker</h2>
        <p>${meta.prompt}</p>
      </div>
      <div class="tracker-art-grid">${tokens.join("")}</div>
      <div class="tracker-art-flourish" aria-hidden="true"><i></i><span>✦</span><b></b></div>
    </div>
  </section>`;
}
function journalTrackerLegend(metric){
  const meta=trackerMetricMeta(metric);
  return `<section class="card tracker-key-card tracker-enchanted-key"><div class="section-title"><div><span class="section-kicker">${meta.label} key</span><h2>${meta.label} levels</h2></div></div><div class="tracker-enchanted-key-list">${meta.options.map((option,index)=>`<div class="tracker-enchanted-key-item" style="${trackerButtonStyle(metric,index)}"><span class="tracker-key-heart" aria-hidden="true">${trackerHeartSvg()}</span><span><strong>${esc(option.label)}</strong><small>${esc(option.blurb)}</small></span></div>`).join("")}</div></section>`;
}
function JournalSleepPage(){
  const rows=journalSleepHistory();
  const metric=["sleep","deep","pain","mood","energy"].includes(data.journalSleepMetric)?data.journalSleepMetric:"sleep";
  if(data.journalSleepMetric!==metric){data.journalSleepMetric=metric;saveData();}
  const meta=trackerMetricMeta(metric);
  const monthKey=journalSleepMonthKey();
  const monthDate=new Date(`${monthKey}-01T12:00:00`);
  const monthTitle=monthDate.toLocaleDateString("en-GB",{month:"long",year:"numeric"});
  return shell(`<div class="tracker-page-compact">${head("Journal","Monthly wellness tracker")}${journalTabs("sleep")}
    <section class="card sleep-calendar-controls tracker-hero-card"><div><span class="section-kicker">Monthly wellness tracker</span><h2>${monthTitle}</h2><p class="tracker-helper">Today: ${esc(new Date(today()+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}))}</p></div><label><span>Tracker</span><select class="field" id="journalSleepMetric"><option value="sleep" ${metric==="sleep"?"selected":""}>Sleep</option><option value="deep" ${metric==="deep"?"selected":""}>Deep sleep</option><option value="pain" ${metric==="pain"?"selected":""}>Pain</option><option value="mood" ${metric==="mood"?"selected":""}>Mood</option><option value="energy" ${metric==="energy"?"selected":""}>Energy</option></select></label><div class="sleep-month-arrows"><button type="button" data-sleep-month-step="-1" aria-label="Previous month">‹</button><button type="button" data-sleep-month-step="1" aria-label="Next month">›</button></div>${trackerDateSelectors(monthKey,rows)}<div class="tracker-metric-tabs">${trackerMetricButtons(metric)}</div></section>
    ${journalSleepCalendar(rows,metric,monthKey)}
    ${journalTrackerLegend(metric)}
    ${journalSleepEditModal(rows,metric)}</div>` ,"journal");
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
 document.querySelector("#journalSleepMonthSelect")?.addEventListener("change",event=>{const [year]=journalSleepMonthKey().split("-");data.journalSleepMonth=`${year}-${event.target.value}`;saveData();render()});
 document.querySelector("#journalSleepYearSelect")?.addEventListener("change",event=>{const [,month]=journalSleepMonthKey().split("-");data.journalSleepMonth=`${event.target.value}-${month}`;saveData();render()});
 document.querySelector("[data-tracker-today]")?.addEventListener("click",()=>{data.journalSleepMonth=today().slice(0,7);saveData();render()});
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
