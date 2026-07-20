function localEntryTimestamp(){
  const now=new Date();
  const pad=n=>String(n).padStart(2,"0");
  return {date:`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`,time:`${pad(now.getHours())}:${pad(now.getMinutes())}`,createdAt:now.toISOString()};
}
function entryTimeLabel(entry){
  if(entry.time) return entry.time;
  if(entry.createdAt){const d=new Date(entry.createdAt);if(!Number.isNaN(d.getTime())) return d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",hour12:false});}
  return "";
}

function sanctuaryFavouriteDecor(){
  const ids=Array.isArray(data.favoriteTreasures)?data.favoriteTreasures:[];
  return ids.map(id=>{
    if(id==="golden-lemon") return `<button class="display-treasure golden-lemon" data-route="treasures" aria-label="Golden Lemon displayed in your Sanctuary"><span class="lemon-fruit"></span><span class="lemon-leaf"></span></button>`;
    if(id==="first-journal") return `<button class="display-treasure tiny-book" data-route="treasures" aria-label="First Chapter displayed in your Sanctuary"><i></i></button>`;
    if(id==="gentle-heart") return `<button class="display-treasure crystal-heart" data-route="treasures" aria-label="Gentle Heart displayed in your Sanctuary"></button>`;
    return `<button class="display-treasure small-orb" data-route="treasures" aria-label="A treasure displayed in your Sanctuary"></button>`;
  }).join("");
}

function HomePage(){
  const d=new Date();
  const hour=d.getHours();
  const greeting=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  const weekday=d.toLocaleDateString("en-GB",{weekday:"long"});
  const due=[];
  if(weekday==="Thursday") due.push({text:"Put recycling out",route:"house"});
  const tanksNeedingFeed=(data.aquariums||[]).filter(tank=>!tankFeedToday(tank));
  if(tanksNeedingFeed.length) due.push({text:"Fish are waiting for breakfast",route:"pets"});
  if(data.checkins[today()]) due.push({text:"Today’s check-in is safely tucked away",route:"journal"});

  return shell(`
    <section class="sanctuary-hero">
      <div class="sanctuary-copy"><span class="section-kicker">LinaHub</span><h1>${greeting}, Lina</h1><p>Welcome home.</p></div>
      <button class="theme-btn sanctuary-theme" id="themeToggle" aria-label="Change theme">${data.theme==="dark"?"Light":"Night"}</button>
      <div class="moon-window" aria-hidden="true"><span></span><i></i><i></i><i></i></div>
      <div class="hero-shelf" aria-label="Favourite treasures displayed in your Sanctuary">
        <span class="shelf-candle" aria-hidden="true"></span>
        ${sanctuaryFavouriteDecor() || `<span class="empty-shelf-note">Your favourite treasures will sit here</span>`}
      </div>
    </section>

    <section class="sanctuary-shelves" aria-label="LinaHub rooms">
      <button class="shelf-tile" data-route="journal"><span class="small-icon icon-books">📚</span><span class="tile-copy"><b>Bookshelf</b><small>Journal, Today & To-do</small></span></button>
      <button class="shelf-tile" data-route="plants"><span class="small-icon icon-plant">🪴</span><span class="tile-copy"><b>Conservatory</b><small>${(data.plants||[]).length} plants growing</small></span></button>
      <button class="shelf-tile" data-route="medication"><span class="small-icon icon-potion">🧪</span><span class="tile-copy"><b>Apothecary</b><small>Medication & health</small></span></button>
      <button class="shelf-tile" data-route="pets"><span class="small-icon icon-fish">🐠</span><span class="tile-copy"><b>Aquariums</b><small>${(data.aquariums||[]).length} cosy tanks</small></span></button>
      <button class="shelf-tile treasure-tile" data-route="treasures"><span class="small-icon icon-treasure">✦</span><span class="tile-copy"><b>Treasure Room</b><small>Memories waiting inside</small></span></button>
      <button class="shelf-tile" data-route="house"><span class="small-icon icon-house">🏡</span><span class="tile-copy"><b>House</b><small>Rooms & gentle routines</small></span></button>
    </section>

    <section class="little-shelf card">
      <span class="section-kicker">More little corners</span>
      <div class="little-shelf-row">
        <button data-route="period"><span>🌸</span><b>Period</b></button>
        <button data-route="pokemon"><span><img src="./icons/pokemon.svg?v=200" alt=""></span><b>Pokémon</b></button>
        <button data-route="health"><span class="measure-icon">◒</span><b>Measures</b></button>
        <button data-route="settings"><span class="spell-icon">◇</span><b>Spellbook</b></button>
      </div>
    </section>

    ${due.length?`<section class="card sanctuary-note"><span class="section-kicker">A note on the table</span><button class="today-heading" data-route="today"><h2>Today</h2><b>›</b></button><div class="today-list">${due.map(item=>`<button class="reminder" data-route="${item.route}"><span>${item.text}</span><b>›</b></button>`).join("")}</div></section>`:""}
  `,"home");
}
function bindHome(){
  const toggle=document.querySelector("#themeToggle");
  if(toggle) toggle.onclick=()=>{data.theme=data.theme==="dark"?"light":"dark";saveData();render()};
}
