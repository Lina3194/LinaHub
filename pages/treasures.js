const TREASURE_DEFINITIONS=[
  {id:"golden-lemon",icon:"🍋",name:"When Life Gives You Lemons",category:"Garden",story:"For growing your lemon tree from a seed.",rule:()=>Array.isArray(data.plants)&&data.plants.some(p=>/lemon/i.test(p.name||""))},
  {id:"first-plant",icon:"🌱",name:"First Roots",category:"Garden",story:"For adding the first plant to your Garden.",rule:()=>Array.isArray(data.plants)&&data.plants.length>=1},
  {id:"five-plants",icon:"🪴",name:"Green Fingers",category:"Garden",story:"For caring for five plants at once.",rule:()=>Array.isArray(data.plants)&&data.plants.length>=5},
  {id:"ten-plants",icon:"🌿",name:"Growing Sanctuary",category:"Garden",story:"For growing a Garden of ten plants.",rule:()=>Array.isArray(data.plants)&&data.plants.length>=10},
  {id:"surprise-bloom",icon:"🌹",name:"A Surprise Bloom",category:"Garden",story:"For adding your first rose to the Garden.",hidden:true,rule:()=>Array.isArray(data.plants)&&data.plants.some(p=>/rose/i.test(p.name||""))},
  {id:"orchid-keeper",icon:"❀",name:"Orchid Keeper",category:"Garden",story:"For giving an orchid a place in your Garden.",rule:()=>Array.isArray(data.plants)&&data.plants.some(p=>/orchid/i.test(p.name||""))},
  {id:"herb-garden",icon:"☘",name:"Kitchen Herbalist",category:"Garden",story:"For growing at least three herbs.",rule:()=>{const a=(data.plants||[]).filter(p=>/basil|oregano|mint|thyme|rosemary|sage|parsley|chive|dill|coriander/i.test(p.name||""));return a.length>=3}},
  {id:"plant-photo",icon:"▣",name:"Garden Portrait",category:"Garden",story:"For saving a photograph of one of your plants.",rule:()=>Array.isArray(data.plants)&&data.plants.some(p=>p.photo)},

  {id:"first-journal",icon:"▤",name:"First Chapter",category:"Journal",story:"For saving your first journal check-in.",rule:()=>Object.keys(data.checkins||{}).length>=1},
  {id:"journal-seven",icon:"✎",name:"Seven Pages",category:"Journal",story:"For recording seven days in your journal.",rule:()=>Object.keys(data.checkins||{}).length>=7},
  {id:"journal-thirty",icon:"▥",name:"A Month of Me",category:"Journal",story:"For recording thirty journal entries.",rule:()=>Object.keys(data.checkins||{}).length>=30},
  {id:"journal-hundred",icon:"◆",name:"The Archivist",category:"Journal",story:"For creating one hundred journal entries.",rule:()=>Object.keys(data.checkins||{}).length>=100},
  {id:"midnight-visitor",icon:"☾",name:"Midnight Visitor",category:"Hidden",story:"For visiting LinaHub after midnight.",hidden:true,rule:()=>new Date().getHours()===0},
  {id:"early-bird",icon:"☼",name:"Before the World Wakes",category:"Hidden",story:"For visiting LinaHub before six in the morning.",hidden:true,rule:()=>new Date().getHours()<6},

  {id:"first-task",icon:"✓",name:"One Thing Done",category:"Home",story:"For completing your first personal task.",rule:()=>Array.isArray(data.personalTasks)&&data.personalTasks.some(t=>t.done)},
  {id:"ten-tasks",icon:"✓",name:"Making Progress",category:"Home",story:"For completing ten personal tasks.",rule:()=>Array.isArray(data.personalTasks)&&data.personalTasks.filter(t=>t.done).length>=10},
  {id:"house-care",icon:"⌂",name:"Home Sweet Home",category:"Home",story:"For completing a House job.",rule:()=>Array.isArray(data.houseTasks)&&data.houseTasks.some(t=>t.done)},
  {id:"sanctuary-key",icon:"⚿",name:"Sanctuary Key",category:"Home",story:"The key to the home you are building in LinaHub.",rule:()=>true},

  {id:"first-med",icon:"✦",name:"Care Taken",category:"Wellness",story:"For recording your first medication dose.",rule:()=>Array.isArray(data.medicationHistory)&&data.medicationHistory.length>=1},
  {id:"med-ten",icon:"◇",name:"Steady Care",category:"Wellness",story:"For recording ten medication doses.",rule:()=>Array.isArray(data.medicationHistory)&&data.medicationHistory.length>=10},
  {id:"cycle-bloom",icon:"❁",name:"Cycle Bloom",category:"Wellness",story:"For bringing your cycle history into LinaHub.",rule:()=>Array.isArray(data.periodCycles)&&data.periodCycles.length>0},
  {id:"gentle-heart",icon:"♡",name:"Gentle Heart",category:"Wellness",story:"A reminder that rest and care always count.",rule:()=>true},

  {id:"little-aquarium",icon:"≈",name:"Little Aquarium",category:"Aquariums",story:"For creating a home for your aquarium residents.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.length>0},
  {id:"aquarium-care",icon:"◌",name:"Clear Waters",category:"Aquariums",story:"For recording aquarium care.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.some(a=>a.feeds?.length||Object.values(a.maintenance||{}).some(Boolean))},
  {id:"two-tanks",icon:"◉",name:"Two Little Worlds",category:"Aquariums",story:"For caring for two aquariums.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.length>=2},

  {id:"collector-five",icon:"✧",name:"Curious Collector",category:"Hidden",story:"For discovering five treasures.",hidden:true,rule:()=>Object.values(data.treasures||{}).filter(x=>x?.collected).length>=5},
  {id:"collector-twelve",icon:"✦",name:"Keeper of Treasures",category:"Hidden",story:"For discovering twelve treasures.",hidden:true,rule:()=>Object.values(data.treasures||{}).filter(x=>x?.collected).length>=12},
  {id:"room-visitor",icon:"⌘",name:"The Secret Shelf",category:"Hidden",story:"For returning to the Treasure Room again and again.",hidden:true,rule:()=>Number(data.treasureRoomVisits||0)>=20},
  {id:"all-shelves",icon:"✺",name:"The Curator",category:"Hidden",story:"For placing a treasure on every shelf.",hidden:true,rule:()=>["Garden","Journal","Home","Wellness","Aquariums"].every(c=>TREASURE_DEFINITIONS.some(t=>t.category===c&&data.treasures?.[t.id]?.collected))}
];

const TREASURE_SHELVES=["Garden","Journal","Home","Wellness","Aquariums","Hidden"];
function ensureTreasureData(){
  if(!data.treasures||typeof data.treasures!=="object")data.treasures={};
  if(!Array.isArray(data.favoriteTreasures))data.favoriteTreasures=[];
  data.treasureRoomVisits=Number(data.treasureRoomVisits||0);
  const now=new Date().toISOString();
  TREASURE_DEFINITIONS.forEach((t,index)=>{if(t.rule()&&!data.treasures[t.id])data.treasures[t.id]={unlockedAt:now,collected:index<3}});
}
function treasureState(id){return data.treasures?.[id]||null}
function collectedTreasures(){return TREASURE_DEFINITIONS.filter(t=>treasureState(t.id)?.collected)}
function waitingTreasures(){return TREASURE_DEFINITIONS.filter(t=>treasureState(t.id)&&!treasureState(t.id).collected)}
function visibleBookTreasures(){return TREASURE_DEFINITIONS.filter(t=>!t.hidden||treasureState(t.id)?.collected)}

function TreasureRoomPage(){
  ensureTreasureData();
  const collected=collectedTreasures(),waiting=waitingTreasures();
  return shell(`
    ${head("Treasure Room","Your enchanted archive","home")}
    <section class="treasure-intro"><div><span class="section-kicker">LinaHub Sanctuary</span><h1>Your Treasure Room</h1><p>Each shelf keeps the moments, habits and little victories you have gathered.</p></div><div class="treasure-count"><b>${collected.length}</b><small>discovered</small></div></section>
    <section class="treasure-library" aria-label="Enchanted treasure bookcase">
      <div class="library-moon"></div><div class="ivy ivy-left"></div><div class="ivy ivy-right"></div>
      <div class="grand-bookcase">
        <div class="bookcase-crown"><span>✦</span><b>THE TREASURE ARCHIVE</b><span>✦</span></div>
        ${TREASURE_SHELVES.map(category=>{const items=collected.filter(t=>t.category===category).slice(0,5);return `<button class="archive-shelf" data-shelf="${category}"><span class="shelf-label">${category}</span><span class="shelf-display">${items.map(t=>`<i class="shelf-object" data-treasure="${t.id}" title="${t.name}">${t.icon}</i>`).join("")}${Array.from({length:Math.max(0,5-items.length)},()=>`<i class="shelf-empty">·</i>`).join("")}</span><span class="shelf-total">${collected.filter(t=>t.category===category).length}</span></button>`}).join("")}
        <div class="bookcase-base"><span class="candle">◔</span><span class="base-mark">L H</span><span class="candle">◔</span></div>
      </div>
    </section>
    ${waiting.length?`<section class="waiting-table card"><div><span class="section-kicker">New treasure discovered</span><h2>${waiting.length} waiting to be opened</h2><p>Your archive has found something new.</p></div><button class="gift-parcel" id="collectTreasure"><span>✦</span><b>Discover</b></button></section>`:""}
    <section class="card treasure-book"><div class="section-title"><div><span class="section-kicker">Treasure Book</span><h2>Your discoveries</h2></div><small>${collected.length}/${TREASURE_DEFINITIONS.length}</small></div><div class="treasure-grid">${visibleBookTreasures().map(t=>{const s=treasureState(t.id);return s?.collected?`<button class="treasure-card" data-treasure="${t.id}"><span>${t.icon}</span><strong>${t.name}</strong><small>${t.category}</small></button>`:`<div class="treasure-card locked"><span>?</span><strong>Undiscovered</strong><small>${t.category}</small></div>`}).join("")}</div></section>
    <div id="treasureModal"></div>
  `,"treasures");
}
function openTreasureModal(id,newlyCollected=false){const t=TREASURE_DEFINITIONS.find(x=>x.id===id);if(!t)return;const s=treasureState(id),m=document.querySelector("#treasureModal");if(!m)return;m.innerHTML=`<div class="treasure-modal-backdrop"><div class="treasure-modal ${newlyCollected?"reveal":""}" role="dialog" aria-modal="true"><button class="modal-close" data-close-treasure>×</button><div class="modal-sparkles">✦　✧　✦</div><div class="modal-treasure-icon">${t.icon}</div><span class="section-kicker">${newlyCollected?"New treasure discovered":t.category}</span><h2>${t.name}</h2><p>${t.story}</p><small>Discovered ${new Date(s?.unlockedAt||Date.now()).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</small></div></div>`;bindTreasureModal()}
function closeTreasureModal(){const m=document.querySelector("#treasureModal");if(m)m.innerHTML=""}
function bindTreasureModal(){const b=document.querySelector(".treasure-modal-backdrop"),p=document.querySelector(".treasure-modal");p?.addEventListener("click",e=>e.stopPropagation());b?.addEventListener("click",closeTreasureModal);document.querySelector("[data-close-treasure]")?.addEventListener("click",closeTreasureModal)}
function bindTreasures(){ensureTreasureData();data.treasureRoomVisits=Number(data.treasureRoomVisits||0)+1;saveData();document.querySelector("#collectTreasure")?.addEventListener("click",()=>{const n=waitingTreasures()[0];if(!n)return;data.treasures[n.id].collected=true;saveData();openTreasureModal(n.id,true)});document.querySelectorAll("[data-treasure]").forEach(c=>c.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();openTreasureModal(c.dataset.treasure)}));document.querySelectorAll("[data-shelf]").forEach(s=>s.addEventListener("click",()=>{const first=collectedTreasures().find(t=>t.category===s.dataset.shelf);if(first)openTreasureModal(first.id);else toast("This shelf is waiting for its first treasure")}))}
