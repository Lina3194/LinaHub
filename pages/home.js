
function localEntryTimestamp(){
  const now=new Date();
  const pad=n=>String(n).padStart(2,"0");
  return {
    date:`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`,
    time:`${pad(now.getHours())}:${pad(now.getMinutes())}`,
    createdAt:now.toISOString()
  };
}
function entryTimeLabel(entry){
  if(entry.time) return entry.time;
  if(entry.createdAt){
    const d=new Date(entry.createdAt);
    if(!Number.isNaN(d.getTime())){
      return d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",hour12:false});
    }
  }
  return "";
}


function HomePage(){
  const d=new Date();
  const hour=d.getHours();
  const greeting=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  const weekday=d.toLocaleDateString("en-GB",{weekday:"long"});
  const due=[];
  if(weekday==="Thursday") due.push({emoji:"♻️",text:"Put recycling out",route:"house"});
  const tanksNeedingFeed=(data.aquariums||[]).filter(tank=>!tankFeedToday(tank));
  if(tanksNeedingFeed.length) due.push({emoji:"🐠",text:"Fish are waiting for breakfast",route:"pets"});
  if(data.checkins[today()]) due.push({emoji:"💜",text:"Today’s check-in is safely tucked away",route:"journal"});
  const favs=(data.favoriteTreasures||[]).map(id=>typeof TREASURE_DEFINITIONS!=="undefined"?TREASURE_DEFINITIONS.find(t=>t.id===id):null).filter(Boolean);

  return shell(`
    <section class="sanctuary-hero">
      <div class="sanctuary-sky"><span class="sanctuary-moon"></span><i></i><i></i><i></i></div>
      <div class="sanctuary-copy"><div class="eyebrow">LinaHub Sanctuary</div><h1>${greeting}, Lina ✨</h1><p>Welcome home. Everything you care for has a little place here.</p></div>
      <button class="theme-btn sanctuary-theme" id="themeToggle">${data.theme==="dark"?"☀️":"🌙"}</button>
      <div class="sanctuary-sill">${favs.length?favs.map(t=>`<span title="${t.name}">${t.icon}</span>`).join(""):`<span>🕯️</span><span>🌿</span>`}</div>
    </section>

    <section class="sanctuary-map">
      <button class="sanctuary-door books" data-route="journal"><span class="door-scene">📚</span><b>Bookshelf</b><small>Journal, Today & To-do</small></button>
      <button class="sanctuary-door conservatory" data-route="plants"><span class="door-scene">🪴</span><b>Conservatory</b><small>${(data.plants||[]).length} plants growing</small></button>
      <button class="sanctuary-door apothecary" data-route="medication"><span class="door-scene">🧪</span><b>Apothecary</b><small>Medication & health</small></button>
      <button class="sanctuary-door aquarium" data-route="pets"><span class="door-scene">🐠</span><b>Aquariums</b><small>${(data.aquariums||[]).length} cosy tanks</small></button>
      <button class="sanctuary-door treasure featured" data-route="treasures"><span class="door-scene">✨</span><b>Treasure Room</b><small>Memories waiting inside</small></button>
      <button class="sanctuary-door house" data-route="house"><span class="door-scene">🏡</span><b>House</b><small>Rooms & gentle routines</small></button>
    </section>

    <section class="sanctuary-drawer card">
      <span class="section-kicker">More little corners</span>
      <div class="sanctuary-mini-grid">
        <button data-route="period"><span>🌸</span><b>Period</b></button><button data-route="pokemon"><span><img src="./icons/pokemon.svg?v=200" alt=""></span><b>Pokémon</b></button><button data-route="health"><span>⚖️</span><b>Measures</b></button><button data-route="settings"><span>⚙️</span><b>Spellbook</b></button>
      </div>
    </section>

    <section class="card sanctuary-today">
      <button class="today-heading" data-route="today"><span><span class="section-kicker">A note on the table</span><h2>Today</h2></span><b>›</b></button>
      <div class="today-list">${due.length?due.map(item=>`<button class="reminder" data-route="${item.route}"><b>${item.emoji}</b><span>${item.text}</span></button>`).join(""):`<div class="sanctuary-clear">✨ Nothing urgent is calling for you.</div>`}</div>
    </section>
  `,"home");
}
function bindHome(){
  const toggle=document.querySelector("#themeToggle");
  if(toggle) toggle.onclick=()=>{data.theme=data.theme==="dark"?"light":"dark";saveData();render()};
}
