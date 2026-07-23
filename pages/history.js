function historySources(){
  const checkins=Object.entries(data.checkins||{}).map(([date,v])=>({date,title:"Daily check-in",detail:[v.mood!=null?`Mood ${v.mood}`:"",v.energy!=null?`Energy ${v.energy}`:"",v.pain!=null?`Pain ${v.pain}`:"",v.water!=null?`${v.water} water`:""].filter(Boolean).join(" · ")}));
  const journalTimeline=(data.journalTimeline||[]).map(e=>({date:e.date||String(e.createdAt||"").slice(0,10),time:e.time,title:e.prompt||"Journal entry",detail:e.text||""}));
  const sources={
    weight:(data.weightEntries||[]).map(e=>({date:e.date,title:`${e.value??e.weight??""} ${e.unit||"kg"}`,detail:e.note||e.notes||""})),
    sleep:(data.sleepEntries||[]).map(e=>({date:e.date,title:`${e.hours??e.duration??""} hours`,detail:e.quality?`Quality: ${e.quality}`:""})),
    measurements:(data.measurements||[]).map(e=>({date:e.date,title:"Measurements",detail:Object.entries(e).filter(([k,v])=>!['id','date'].includes(k)&&v!==''&&v!=null).map(([k,v])=>`${k}: ${v}`).join(" · ")})),
    medication:(data.medicationHistory||[]).map(e=>{const m=(data.medications||[]).find(x=>x.id===e.medId);return {date:e.date,time:e.time,title:m?.name||"Medication",detail:e.notes||"Taken"}}),
    mood:checkins.filter(e=>e.detail.includes('Mood')),
    energy:checkins.filter(e=>e.detail.includes('Energy')),
    pain:checkins.filter(e=>e.detail.includes('Pain')),
    journal:[...journalTimeline,...checkins],
    shopping:(data.shoppingHistory||[]).map(e=>({date:e.date,time:e.time,title:e.title||e.item||"Shopping update",detail:e.detail||e.action||""})),
    plants:(data.plants||[]).flatMap(p=>(p.history||[]).map(date=>({date,title:p.name,detail:"Watered"}))),
    aquariums:(data.aquariums||[]).flatMap(t=>(t.feeds||[]).map(e=>({date:String(e.createdAt||e.date||"").slice(0,10),time:String(e.createdAt||"").slice(11,16),title:t.name,detail:e.food||"Fed"}))),
    pokemon:(data.pokemonFriends||[]).flatMap(f=>[...(f.giftSentDates||[]).map(date=>({date,title:f.name,detail:"Gift sent"})),...(f.giftReceivedDates||[]).map(date=>({date,title:f.name,detail:"Gift received"}))]),
    books:(data.books||[]).flatMap(b=>(b.history||[]).map(e=>({date:e.date||String(e.createdAt||"").slice(0,10),title:b.title||"Book",detail:e.note||e.status||"Updated"}))),
    house:(data.houseTasks||[]).flatMap(t=>(t.completionHistory||[]).map(date=>({date,title:t.task,detail:`Completed · ${t.room}`}))),
    todo:(data.personalTasks||[]).filter(t=>t.completed).map(t=>({date:t.completed,title:t.title,detail:"Completed"}))
  };
  return sources;
}
function historyLabel(key){return ({weight:'Weight',sleep:'Sleep',measurements:'Measurements',medication:'Medication',mood:'Mood',energy:'Energy',pain:'Pain',journal:'Journal',shopping:'Shopping',plants:'Plants',aquariums:'Aquariums',pokemon:'Pokémon GO',books:'Books',house:'House',todo:'To-do'})[key]||'History'}
function HistoryPage(){
 const sources=historySources(),key=(routeId&&sources[routeId])?routeId:'journal';
 const entries=[...(sources[key]||[])].filter(e=>e.date).sort((a,b)=>`${b.date||''}${b.time||''}`.localeCompare(`${a.date||''}${a.time||''}`));
 return shell(`${head(`${historyLabel(key)} History`,`All saved activity and entries`,key==='aquariums'?'pets':key)}
 <section class="card history-controls"><label class="field-label">Tracker<select class="field" id="historyTracker">${Object.keys(sources).map(k=>`<option value="${k}" ${k===key?'selected':''}>${historyLabel(k)}</option>`).join('')}</select></label><strong>${entries.length} entr${entries.length===1?'y':'ies'}</strong></section>
 <section class="history-list">${entries.length?entries.map(e=>`<article class="card history-entry"><div class="history-date"><strong>${esc(formatDate(e.date))}</strong>${e.time?`<small>${esc(e.time)}</small>`:''}</div><div><h3>${esc(e.title||historyLabel(key))}</h3><p>${esc(e.detail||'Saved entry')}</p></div></article>`).join(''):`<section class="card empty-history"><h2>No history yet</h2><p>Saved activity for ${esc(historyLabel(key))} will appear here.</p></section>`}</section>`, 'history');
}
function bindHistory(){document.querySelector('#historyTracker')?.addEventListener('change',e=>go('history',e.target.value,'forward',{replace:true}));}
