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

const HOME_ICON_DEFAULTS={journal:"♡",today:"✦",todo:"✓",plants:"♧",medication:"⚗",pets:"◉",house:"⌂",treasures:"✦",period:"❀",pokemon:"●",health:"◒",settings:"⚙"};
function ensureHomeIcons(){
  if(!data.homeIcons||typeof data.homeIcons!=="object") data.homeIcons={};
  if(!data.homeImages||typeof data.homeImages!=="object") data.homeImages={};
}
function customHomeBadge(key,label){
  ensureHomeIcons();
  const photo=data.homeImages[key];
  const custom=data.homeIcons[key];
  if(photo) return `<span class="custom-home-badge"><img src="${photo}" alt="${esc(label)}"></span>`;
  if(custom) return `<span class="custom-home-badge custom-symbol" aria-hidden="true">${esc(custom)}</span>`;
  return "";
}
function conceptButton(routeKey,label,type){
  return `<button type="button" class="concept-button concept-${type} concept-${routeKey}" data-route="${routeKey}" aria-label="${esc(label)}">${customHomeBadge(routeKey,label)}<span class="sr-only">${esc(label)}</span></button>`;
}
function HomePage(){
  ensureHomeIcons();
  const hour=new Date().getHours();
  const greeting=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  return shell(`
    <div class="home-concept">
      <header class="concept-hero">
        <div class="concept-brand">LINAHUB</div>
        <div class="concept-copy">
          <span>${greeting},</span>
          <h1>Lina</h1>
          <div class="concept-divider"></div>
          <p>A gentle reminder to<br>take care of your magic.</p>
        </div>
        <div class="concept-window" aria-hidden="true"></div>
      </header>

      <section class="concept-quick" aria-label="Quick pages">
        ${conceptButton("journal","Journal","quick")}
        ${conceptButton("today","Today","quick")}
        ${conceptButton("todo","To-do","quick")}
      </section>

      <section class="concept-main" aria-label="LinaHub sections">
        ${conceptButton("plants","Plants","main")}
        ${conceptButton("medication","Potions & Remedies","main")}
        ${conceptButton("pets","Aquariums","main")}
        ${conceptButton("house","House","main")}
        ${conceptButton("treasures","Treasure Room","wide")}
      </section>
    </div>
  `,"home");
}
function bindHome(){}
