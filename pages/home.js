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

const HOME_ICON_DEFAULTS={
  journal:"♡",today:"✓",todo:"✎",plants:"♧",medication:"⚗",pets:"◉",house:"⌂",treasures:"✦",
  period:"❀",pokemon:"●",health:"◒",settings:"⚙"
};

function ensureHomeIcons(){
  if(!data.homeIcons||typeof data.homeIcons!=="object") data.homeIcons={};
  if(!data.homeImages||typeof data.homeImages!=="object") data.homeImages={};
}

function homeIcon(key,label,compact=false){
  ensureHomeIcons();
  const photo=data.homeImages[key];
  const custom=data.homeIcons[key];
  const fallback=HOME_ICON_DEFAULTS[key]||"✦";
  return `<span class="home-icon-frame ${compact?"compact":""}">${photo?`<img src="${photo}" alt="${esc(label)}">`:`<span class="home-icon-default home-icon-${key}" aria-hidden="true">${esc(custom||fallback)}</span>`}</span>`;
}

function homeTile(routeKey,label,subtitle="",wide=false){
  return `<button class="home-tile ${wide?"wide":""}" data-route="${routeKey}">
    ${homeIcon(routeKey,label)}
    <span class="home-tile-copy"><b>${label}</b>${subtitle?`<small>${subtitle}</small>`:""}</span>
  </button>`;
}

function quickTile(routeKey,label){
  return `<button class="quick-tile" data-route="${routeKey}">${homeIcon(routeKey,label,true)}<b>${label}</b></button>`;
}

function compactTile(routeKey,label){
  return `<button class="compact-home-tile" data-route="${routeKey}">${homeIcon(routeKey,label,true)}<b>${label}</b></button>`;
}

function treasureDecoration(id,index){
  const known={
    "golden-lemon":"decor-lemon","first-journal":"decor-book","gentle-heart":"decor-heart",
    "little-aquarium":"decor-bubble","green-fingers":"decor-plant","home-key":"decor-key",
    "moon-candle":"decor-candle","cycle-bloom":"decor-bloom"
  };
  return `<button class="sanctuary-keepsake ${known[id]||"decor-gem"} keepsake-${index+1}" data-route="treasures" aria-label="Displayed treasure"></button>`;
}

function sanctuaryFavouriteDecor(){
  const ids=Array.isArray(data.favoriteTreasures)?data.favoriteTreasures.slice(0,3):[];
  return ids.map(treasureDecoration).join("");
}

function HomePage(){
  ensureHomeIcons();
  const hour=new Date().getHours();
  const greeting=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  return shell(`
    <div class="home-scene">
      <section class="home-welcome">
        <div><span class="section-kicker">LinaHub</span><h1>${greeting}, Lina</h1><p>Welcome home.</p></div>
        <button class="theme-btn" id="themeToggle" aria-label="Change theme">${data.theme==="dark"?"Light":"Night"}</button>
      </section>

      <section class="quick-row" aria-label="Journal, Today and To-do">
        ${quickTile("journal","Journal")}
        ${quickTile("today","Today")}
        ${quickTile("todo","To-do")}
      </section>

      <section class="home-tile-grid" aria-label="LinaHub sections">
        ${homeTile("plants","Plants",`${(data.plants||[]).length} growing`)}
        ${homeTile("medication","Potions & Remedies","Medication and health")}
        ${homeTile("pets","Aquariums",`${(data.aquariums||[]).length} tanks`)}
        ${homeTile("house","House","Rooms and routines")}
        ${homeTile("treasures","Treasure Room","Your collected memories",true)}
      </section>

      <section class="compact-home-row card" aria-label="More sections">
        ${compactTile("period","Period")}
        ${compactTile("pokemon","Pokémon")}
        ${compactTile("health","Measures")}
        ${compactTile("settings","Settings")}
      </section>

      <div class="sanctuary-keepsakes" aria-label="Treasures displayed around your Sanctuary">${sanctuaryFavouriteDecor()}</div>
    </div>
  `,"home");
}

function bindHome(){
  document.querySelector("#themeToggle")?.addEventListener("click",()=>{data.theme=data.theme==="dark"?"light":"dark";saveData();render()});
}
