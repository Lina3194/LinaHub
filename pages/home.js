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
    <section class="sanctuary-heading">
      <div><span class="section-kicker">LinaHub</span><h1>${greeting}, Lina</h1><p>Welcome home.</p></div>
      <button class="theme-btn sanctuary-theme" id="themeToggle" aria-label="Change theme">${data.theme==="dark"?"Light":"Night"}</button>
    </section>

    <section class="sanctuary-room" aria-label="Your magical sanctuary">
      <div class="room-wall-glow"></div>
      <div class="sanctuary-window"><span class="window-moon"></span><span class="window-stars"></span><span class="window-vine"></span></div>
      <div class="ceiling-lamp"><i></i></div>

      <button class="scene-hotspot bookshelf-object" data-route="journal" aria-label="Open Bookshelf">
        <span class="wood-bookcase"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></span>
        <span class="object-label">Bookshelf<small>Journal · Today · To-do</small></span>
      </button>

      <button class="scene-hotspot conservatory-object" data-route="plants" aria-label="Open Conservatory">
        <span class="plant-stand"><i class="pot-one"></i><i class="pot-two"></i><i class="pot-three"></i></span>
        <span class="object-label">Conservatory<small>${(data.plants||[]).length} plants growing</small></span>
      </button>

      <button class="scene-hotspot aquarium-object" data-route="pets" aria-label="Open Aquariums">
        <span class="glass-aquarium"><i class="water"></i><i class="weed"></i><i class="fish-one"></i><i class="fish-two"></i></span>
        <span class="object-label">Aquariums<small>${(data.aquariums||[]).length} cosy tanks</small></span>
      </button>

      <button class="scene-hotspot apothecary-object" data-route="medication" aria-label="Open Apothecary">
        <span class="apothecary-desk"><i class="bottle tall"></i><i class="bottle round"></i><i class="mortar"></i></span>
        <span class="object-label">Apothecary<small>Medication · Health</small></span>
      </button>

      <button class="scene-hotspot treasure-door-object" data-route="treasures" aria-label="Enter Treasure Room">
        <span class="treasure-door"><i class="door-star"></i><i class="door-handle"></i></span>
        <span class="object-label">Treasure Room<small>Enter your collection</small></span>
      </button>

      <button class="scene-hotspot writing-desk-object" data-route="today" aria-label="Open Today">
        <span class="writing-desk"><i class="paper"></i><i class="ink"></i></span>
        <span class="object-label">Writing Desk<small>Today</small></span>
      </button>

      <button class="scene-hotspot house-stairs-object" data-route="house" aria-label="Open House">
        <span class="little-stairs"><i></i><i></i><i></i></span>
        <span class="object-label">House<small>Rooms · Routines</small></span>
      </button>

      <button class="scene-hotspot spellbook-object" data-route="settings" aria-label="Open Spellbook settings">
        <span class="spellbook"><i></i></span><span class="object-label">Spellbook<small>Settings</small></span>
      </button>

      <div class="sanctuary-favourites" aria-label="Favourite treasures displayed here">${sanctuaryFavouriteDecor()}</div>
      <div class="room-rug-art"></div><div class="room-floor-lines"></div>
    </section>

    <nav class="sanctuary-secondary" aria-label="More rooms">
      <button data-route="period"><span class="nav-mark bloom-mark"></span><b>Period</b></button>
      <button data-route="pokemon"><span class="nav-mark pokeball-mark"></span><b>Pokémon</b></button>
      <button data-route="health"><span class="nav-mark measures-mark"></span><b>Measures</b></button>
    </nav>

    ${due.length?`<section class="card sanctuary-note"><span class="section-kicker">A note on the desk</span>${due.map(item=>`<button class="reminder" data-route="${item.route}"><span>${item.text}</span><b>›</b></button>`).join("")}</section>`:""}
  `,"home");
}
function bindHome(){
  const toggle=document.querySelector("#themeToggle");
  if(toggle) toggle.onclick=()=>{data.theme=data.theme==="dark"?"light":"dark";saveData();render()};
}
