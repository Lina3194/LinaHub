const TREASURE_DEFINITIONS=[
  {id:"golden-lemon",icon:"🍋",name:"When Life Gives You Lemons",category:"Garden",story:"For growing your lemon tree from a seed.",rule:()=>Array.isArray(data.plants)&&data.plants.some(p=>/lemon/i.test(p.name||""))},
  {id:"first-plant",icon:"🌱",name:"First Roots",category:"Garden",story:"For adding the first plant to your Garden.",rule:()=>Array.isArray(data.plants)&&data.plants.length>=1},
  {id:"five-plants",icon:"🪴",name:"Green Fingers",category:"Garden",story:"For caring for five plants at once.",rule:()=>Array.isArray(data.plants)&&data.plants.length>=5},
  {id:"ten-plants",icon:"🌿",name:"Growing Sanctuary",category:"Garden",story:"For growing a Garden of ten plants.",rule:()=>Array.isArray(data.plants)&&data.plants.length>=10},
  {id:"surprise-bloom",icon:"🌹",name:"A Surprise Bloom",category:"Garden",story:"For adding your first rose to the Garden.",hidden:true,rule:()=>Array.isArray(data.plants)&&data.plants.some(p=>/rose/i.test(p.name||""))},
  {id:"orchid-keeper",icon:"🌸",name:"Orchid Keeper",category:"Garden",story:"For giving an orchid a place in your Garden.",rule:()=>Array.isArray(data.plants)&&data.plants.some(p=>/orchid/i.test(p.name||""))},
  {id:"herb-garden",icon:"🌿",name:"Kitchen Herbalist",category:"Garden",story:"For growing at least three herbs.",rule:()=>{const a=(data.plants||[]).filter(p=>/basil|oregano|mint|thyme|rosemary|sage|parsley|chive|dill|coriander/i.test(p.name||""));return a.length>=3}},
  {id:"plant-photo",icon:"🖼️",name:"Garden Portrait",category:"Garden",story:"For saving a photograph of one of your plants.",rule:()=>Array.isArray(data.plants)&&data.plants.some(p=>p.photo)},

  {id:"first-journal",icon:"📕",name:"First Chapter",category:"Journal",story:"For saving your first journal check-in.",rule:()=>Object.keys(data.checkins||{}).length>=1},
  {id:"journal-seven",icon:"🪶",name:"Seven Pages",category:"Journal",story:"For recording seven days in your journal.",rule:()=>Object.keys(data.checkins||{}).length>=7},
  {id:"journal-thirty",icon:"📚",name:"A Month of Me",category:"Journal",story:"For recording thirty journal entries.",rule:()=>Object.keys(data.checkins||{}).length>=30},
  {id:"journal-hundred",icon:"🗃️",name:"The Archivist",category:"Journal",story:"For creating one hundred journal entries.",rule:()=>Object.keys(data.checkins||{}).length>=100},
  {id:"midnight-visitor",icon:"🌙",name:"Midnight Visitor",category:"Hidden",story:"For visiting LinaHub after midnight.",hidden:true,rule:()=>new Date().getHours()===0},
  {id:"early-bird",icon:"🌅",name:"Before the World Wakes",category:"Hidden",story:"For visiting LinaHub before six in the morning.",hidden:true,rule:()=>new Date().getHours()<6},

  {id:"first-task",icon:"📝",name:"One Thing Done",category:"Home",story:"For completing your first personal task.",rule:()=>Array.isArray(data.personalTasks)&&data.personalTasks.some(t=>t.done)},
  {id:"ten-tasks",icon:"✅",name:"Making Progress",category:"Home",story:"For completing ten personal tasks.",rule:()=>Array.isArray(data.personalTasks)&&data.personalTasks.filter(t=>t.done).length>=10},
  {id:"house-care",icon:"🏡",name:"Home Sweet Home",category:"Home",story:"For completing a House job.",rule:()=>Array.isArray(data.houseTasks)&&data.houseTasks.some(t=>t.done)},
  {id:"sanctuary-key",icon:"🗝️",name:"Sanctuary Key",category:"Home",story:"The key to the home you are building in LinaHub.",rule:()=>true},

  {id:"first-med",icon:"💊",name:"Care Taken",category:"Wellness",story:"For recording your first medication dose.",rule:()=>Array.isArray(data.medicationHistory)&&data.medicationHistory.length>=1},
  {id:"med-ten",icon:"🫖",name:"Steady Care",category:"Wellness",story:"For recording ten medication doses.",rule:()=>Array.isArray(data.medicationHistory)&&data.medicationHistory.length>=10},
  {id:"cycle-bloom",icon:"🌺",name:"Cycle Bloom",category:"Wellness",story:"For bringing your cycle history into LinaHub.",rule:()=>Array.isArray(data.periodCycles)&&data.periodCycles.length>0},
  {id:"gentle-heart",icon:"💜",name:"Gentle Heart",category:"Wellness",story:"A reminder that rest and care always count.",rule:()=>true},

  {id:"little-aquarium",icon:"🐠",name:"Little Aquarium",category:"Aquariums",story:"For creating a home for your aquarium residents.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.length>0},
  {id:"aquarium-care",icon:"🐚",name:"Clear Waters",category:"Aquariums",story:"For recording aquarium care.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.some(a=>a.feeds?.length||Object.values(a.maintenance||{}).some(Boolean))},
  {id:"two-tanks",icon:"🫧",name:"Two Little Worlds",category:"Aquariums",story:"For caring for two aquariums.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.length>=2},


  {id:"twenty-plants",icon:"🌳",name:"Indoor Jungle",category:"Garden",rarity:"Rare",story:"For growing a Garden of twenty plants.",rule:()=>Array.isArray(data.plants)&&data.plants.length>=20},
  {id:"fifty-plants",icon:"🌴",name:"Botanical Sanctuary",category:"Garden",rarity:"Legendary",story:"For caring for fifty plants in LinaHub.",rule:()=>Array.isArray(data.plants)&&data.plants.length>=50},
  {id:"first-watering",icon:"💧",name:"First Drink",category:"Garden",rarity:"Common",story:"For logging your first plant watering.",rule:()=>Array.isArray(data.plants)&&data.plants.some(p=>(p.history||[]).length>=1||p.lastWatered)},
  {id:"water-ten",icon:"💦",name:"Little Raincloud",category:"Garden",rarity:"Uncommon",story:"For logging ten plant waterings.",rule:()=>Array.isArray(data.plants)&&(data.plants.reduce((n,p)=>n+(p.history||[]).length,0)>=10)},
  {id:"water-hundred",icon:"🌧️",name:"Keeper of the Rain",category:"Garden",rarity:"Epic",story:"For logging one hundred plant waterings.",rule:()=>Array.isArray(data.plants)&&(data.plants.reduce((n,p)=>n+(p.history||[]).length,0)>=100)},
  {id:"all-watered-today",icon:"🫗",name:"A Well-Watered Garden",category:"Garden",rarity:"Rare",story:"For watering every plant in your Garden on the same day.",rule:()=>Array.isArray(data.plants)&&data.plants.length>=2&&data.plants.every(p=>(p.history||[]).includes(today())||p.lastWatered===today())},
  {id:"plant-notes-five",icon:"📝",name:"Garden Notes",category:"Garden",rarity:"Uncommon",story:"For writing care notes for five plants.",rule:()=>Array.isArray(data.plants)&&data.plants.filter(p=>(p.notes||'').trim()).length>=5},
  {id:"plant-photos-five",icon:"📸",name:"Garden Gallery",category:"Garden",rarity:"Rare",story:"For saving photographs of five plants.",rule:()=>Array.isArray(data.plants)&&data.plants.filter(p=>p.photo).length>=5},
  {id:"basil-boss",icon:"🌿",name:"Basil Boss",category:"Garden",rarity:"Uncommon",story:"For adding basil to your Garden.",rule:()=>Array.isArray(data.plants)&&data.plants.some(p=>/basil/i.test(p.name||''))},
  {id:"oregano-keeper",icon:"🌱",name:"Greek Garden",category:"Garden",rarity:"Uncommon",story:"For adding Greek oregano to your Garden.",rule:()=>Array.isArray(data.plants)&&data.plants.some(p=>/oregano/i.test(p.name||''))},
  {id:"spider-plant",icon:"🕷️",name:"Spiderling",category:"Garden",rarity:"Uncommon",story:"For adding a spider plant to your Garden.",rule:()=>Array.isArray(data.plants)&&data.plants.some(p=>/spider plant/i.test(p.name||''))},
  {id:"prayer-plant",icon:"🙏",name:"Evening Prayer",category:"Garden",rarity:"Uncommon",story:"For adding a prayer plant to your Garden.",rule:()=>Array.isArray(data.plants)&&data.plants.some(p=>/prayer|maranta/i.test(p.name||''))},

  {id:"journal-three",icon:"✍️",name:"Finding My Words",category:"Journal",rarity:"Common",story:"For recording three journal entries.",rule:()=>Object.keys(data.checkins||{}).length>=3},
  {id:"journal-ten",icon:"📓",name:"Ten Little Chapters",category:"Journal",rarity:"Uncommon",story:"For recording ten journal entries.",rule:()=>Object.keys(data.checkins||{}).length>=10},
  {id:"journal-fifty",icon:"🖋️",name:"Ink and Memory",category:"Journal",rarity:"Rare",story:"For recording fifty journal entries.",rule:()=>Object.keys(data.checkins||{}).length>=50},
  {id:"journal-year",icon:"📜",name:"A Year in Pages",category:"Journal",rarity:"Legendary",story:"For recording 365 journal entries.",rule:()=>Object.keys(data.checkins||{}).length>=365},
  {id:"full-checkin",icon:"💜",name:"The Full Picture",category:"Journal",rarity:"Uncommon",story:"For completing sleep, energy, mood and pain in one check-in.",rule:()=>Object.values(data.checkins||{}).some(e=>['sleep','energy','mood','pain'].every(k=>e&&e[k]!==null&&e[k]!==undefined))},
  {id:"self-care-first",icon:"🧘",name:"A Little Care",category:"Journal",rarity:"Common",story:"For recording a self-care activity.",rule:()=>Object.values(data.checkins||{}).some(e=>Array.isArray(e?.selfCare)&&e.selfCare.length>0)},
  {id:"brain-dump",icon:"☁️",name:"Mind Unburdened",category:"Journal",rarity:"Uncommon",story:"For saving a brain dump or journal note.",rule:()=>Object.values(data.checkins||{}).some(e=>Object.values(e||{}).some(v=>typeof v==='string'&&v.trim().length>=20))},

  {id:"tasks-twentyfive",icon:"📋",name:"Getting Things Done",category:"Home",rarity:"Rare",story:"For completing twenty-five personal tasks.",rule:()=>Array.isArray(data.personalTasks)&&data.personalTasks.filter(t=>t.done).length>=25},
  {id:"tasks-hundred",icon:"🏆",name:"Hundred Things Lighter",category:"Home",rarity:"Legendary",story:"For completing one hundred personal tasks.",rule:()=>Array.isArray(data.personalTasks)&&data.personalTasks.filter(t=>t.done).length>=100},
  {id:"house-five",icon:"🧹",name:"Tidy Little Wins",category:"Home",rarity:"Uncommon",story:"For completing five House jobs.",rule:()=>Array.isArray(data.houseTasks)&&data.houseTasks.filter(t=>t.done).length>=5},
  {id:"house-twentyfive",icon:"✨",name:"Home Glow",category:"Home",rarity:"Rare",story:"For completing twenty-five House jobs.",rule:()=>Array.isArray(data.houseTasks)&&data.houseTasks.filter(t=>t.done).length>=25},
  {id:"house-hundred",icon:"🏠",name:"Sanctuary Keeper",category:"Home",rarity:"Legendary",story:"For completing one hundred House jobs.",rule:()=>Array.isArray(data.houseTasks)&&data.houseTasks.filter(t=>t.done).length>=100},
  {id:"five-rooms",icon:"🚪",name:"Room by Room",category:"Home",rarity:"Uncommon",story:"For creating five rooms in House.",rule:()=>Array.isArray(data.houseRooms)&&data.houseRooms.length>=5},
  {id:"ten-rooms",icon:"🗝️",name:"Keys to the Castle",category:"Home",rarity:"Rare",story:"For creating ten rooms in House.",rule:()=>Array.isArray(data.houseRooms)&&data.houseRooms.length>=10},

  {id:"med-five",icon:"🧴",name:"Five Gentle Steps",category:"Wellness",rarity:"Common",story:"For recording five medication doses.",rule:()=>Array.isArray(data.medicationHistory)&&data.medicationHistory.length>=5},
  {id:"med-thirty",icon:"📅",name:"A Month of Care",category:"Wellness",rarity:"Rare",story:"For recording thirty medication doses.",rule:()=>Array.isArray(data.medicationHistory)&&data.medicationHistory.length>=30},
  {id:"med-hundred",icon:"💯",name:"Steady as She Goes",category:"Wellness",rarity:"Epic",story:"For recording one hundred medication doses.",rule:()=>Array.isArray(data.medicationHistory)&&data.medicationHistory.length>=100},
  {id:"first-medication-added",icon:"💊",name:"My Medicine Cabinet",category:"Wellness",rarity:"Common",story:"For adding your first medication.",rule:()=>Array.isArray(data.medications)&&data.medications.length>=1},
  {id:"three-medications",icon:"🧺",name:"Care Collection",category:"Wellness",rarity:"Uncommon",story:"For keeping three medications organised.",rule:()=>Array.isArray(data.medications)&&data.medications.length>=3},
  {id:"cycle-three",icon:"🌸",name:"Three Moons",category:"Wellness",rarity:"Uncommon",story:"For recording three cycles.",rule:()=>Array.isArray(data.periodCycles)&&data.periodCycles.length>=3},
  {id:"cycle-twelve",icon:"🌕",name:"A Year of Moons",category:"Wellness",rarity:"Epic",story:"For recording twelve cycles.",rule:()=>Array.isArray(data.periodCycles)&&data.periodCycles.length>=12},

  {id:"three-tanks",icon:"🐟",name:"Aquatic Trio",category:"Aquariums",rarity:"Rare",story:"For caring for three aquariums.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.length>=3},
  {id:"five-tanks",icon:"🪸",name:"Underwater Kingdom",category:"Aquariums",rarity:"Legendary",story:"For caring for five aquariums.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.length>=5},
  {id:"aquarium-feed",icon:"🥣",name:"Dinner Time",category:"Aquariums",rarity:"Common",story:"For recording an aquarium feeding.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.some(a=>(a.feeds||[]).length>=1)},
  {id:"aquarium-feed-ten",icon:"🐡",name:"Happy Little Swimmers",category:"Aquariums",rarity:"Uncommon",story:"For recording ten aquarium feedings.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.reduce((n,a)=>n+(a.feeds||[]).length,0)>=10},
  {id:"aquarium-feed-fifty",icon:"🐠",name:"Keeper of the Shoal",category:"Aquariums",rarity:"Epic",story:"For recording fifty aquarium feedings.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.reduce((n,a)=>n+(a.feeds||[]).length,0)>=50},

  {id:"weekend-visitor",icon:"🕯️",name:"Weekend Wanderer",category:"Hidden",rarity:"Uncommon",story:"For visiting the Treasure Room at the weekend.",hidden:true,rule:()=>[0,6].includes(new Date().getDay())},
  {id:"friday-magic",icon:"✨",name:"Friday Magic",category:"Hidden",rarity:"Rare",story:"For visiting LinaHub on a Friday evening.",hidden:true,rule:()=>new Date().getDay()===5&&new Date().getHours()>=18},
  {id:"collector-twentyfive",icon:"🧿",name:"Treasure Hunter",category:"Hidden",rarity:"Epic",story:"For discovering twenty-five treasures.",hidden:true,rule:()=>Object.values(data.treasures||{}).filter(x=>x?.collected).length>=25},
  {id:"collector-fifty",icon:"👑",name:"Master Curator",category:"Hidden",rarity:"Legendary",story:"For discovering fifty treasures.",hidden:true,rule:()=>Object.values(data.treasures||{}).filter(x=>x?.collected).length>=50},
  {id:"visits-five",icon:"🕯️",name:"Familiar Doorway",category:"Hidden",rarity:"Common",story:"For visiting the Treasure Room five times.",hidden:true,rule:()=>Number(data.treasureRoomVisits||0)>=5},
  {id:"visits-fifty",icon:"🔐",name:"Keeper of the Archive",category:"Hidden",rarity:"Epic",story:"For visiting the Treasure Room fifty times.",hidden:true,rule:()=>Number(data.treasureRoomVisits||0)>=50},
  {id:"visits-hundred",icon:"📚",name:"The Librarian",category:"Hidden",rarity:"Legendary",story:"For visiting the Treasure Room one hundred times.",hidden:true,rule:()=>Number(data.treasureRoomVisits||0)>=100},

  {id:"seventyfive-plants",icon:"🌲",name:"Secret Conservatory",category:"Garden",rarity:"Mythical",story:"For caring for seventy-five plants in LinaHub.",rule:()=>Array.isArray(data.plants)&&data.plants.length>=75},
  {id:"water-twentyfive",icon:"🚿",name:"Gentle Showers",category:"Garden",rarity:"Rare",story:"For logging twenty-five plant waterings.",rule:()=>Array.isArray(data.plants)&&data.plants.reduce((n,p)=>n+(p.history||[]).length,0)>=25},
  {id:"water-fifty",icon:"🌦️",name:"Rain Keeper",category:"Garden",rarity:"Epic",story:"For logging fifty plant waterings.",rule:()=>Array.isArray(data.plants)&&data.plants.reduce((n,p)=>n+(p.history||[]).length,0)>=50},
  {id:"plant-notes-ten",icon:"📒",name:"Botanical Notes",category:"Garden",rarity:"Rare",story:"For writing care notes for ten plants.",rule:()=>Array.isArray(data.plants)&&data.plants.filter(p=>(p.notes||'').trim()).length>=10},
  {id:"plant-photos-ten",icon:"🏞️",name:"Living Gallery",category:"Garden",rarity:"Epic",story:"For saving photographs of ten plants.",rule:()=>Array.isArray(data.plants)&&data.plants.filter(p=>p.photo).length>=10},

  {id:"journal-twentyfive",icon:"📝",name:"Twenty-Five Pages",category:"Journal",rarity:"Rare",story:"For recording twenty-five journal entries.",rule:()=>Object.keys(data.checkins||{}).length>=25},
  {id:"journal-seventyfive",icon:"📖",name:"A Book of Me",category:"Journal",rarity:"Epic",story:"For recording seventy-five journal entries.",rule:()=>Object.keys(data.checkins||{}).length>=75},
  {id:"journal-twohundred",icon:"🗄️",name:"Memory Keeper",category:"Journal",rarity:"Epic",story:"For recording two hundred journal entries.",rule:()=>Object.keys(data.checkins||{}).length>=200},
  {id:"journal-fivehundred",icon:"🏛️",name:"The Great Archive",category:"Journal",rarity:"Mythical",story:"For recording five hundred journal entries.",rule:()=>Object.keys(data.checkins||{}).length>=500},
  {id:"self-care-ten",icon:"🕊️",name:"Ten Gentle Moments",category:"Journal",rarity:"Rare",story:"For recording self-care on ten check-ins.",rule:()=>Object.values(data.checkins||{}).filter(e=>Array.isArray(e?.selfCare)&&e.selfCare.length>0).length>=10},

  {id:"tasks-fifty",icon:"🧾",name:"Fifty Things Lighter",category:"Home",rarity:"Epic",story:"For completing fifty personal tasks.",rule:()=>Array.isArray(data.personalTasks)&&data.personalTasks.filter(t=>t.done).length>=50},
  {id:"tasks-twohundred",icon:"🏅",name:"Home Hero",category:"Home",rarity:"Mythical",story:"For completing two hundred personal tasks.",rule:()=>Array.isArray(data.personalTasks)&&data.personalTasks.filter(t=>t.done).length>=200},
  {id:"house-seventyfive",icon:"🧺",name:"A Lovely Rhythm",category:"Home",rarity:"Epic",story:"For completing seventy-five House jobs.",rule:()=>Array.isArray(data.houseTasks)&&data.houseTasks.filter(t=>t.done).length>=75},
  {id:"house-fifty",icon:"🪟",name:"Shining Sanctuary",category:"Home",rarity:"Epic",story:"For completing fifty House jobs.",rule:()=>Array.isArray(data.houseTasks)&&data.houseTasks.filter(t=>t.done).length>=50},
  {id:"house-twohundred",icon:"🏰",name:"Keeper of the Sanctuary",category:"Home",rarity:"Mythical",story:"For completing two hundred House jobs.",rule:()=>Array.isArray(data.houseTasks)&&data.houseTasks.filter(t=>t.done).length>=200},

  {id:"med-twentyfive",icon:"🧴",name:"Caring Routine",category:"Wellness",rarity:"Rare",story:"For recording twenty-five medication doses.",rule:()=>Array.isArray(data.medicationHistory)&&data.medicationHistory.length>=25},
  {id:"med-fifty",icon:"🌿",name:"Steady and Strong",category:"Wellness",rarity:"Epic",story:"For recording fifty medication doses.",rule:()=>Array.isArray(data.medicationHistory)&&data.medicationHistory.length>=50},
  {id:"med-twohundred",icon:"🏺",name:"The Apothecary",category:"Wellness",rarity:"Mythical",story:"For recording two hundred medication doses.",rule:()=>Array.isArray(data.medicationHistory)&&data.medicationHistory.length>=200},
  {id:"cycles-six",icon:"🌼",name:"Six Seasons",category:"Wellness",rarity:"Rare",story:"For keeping six cycle records.",rule:()=>Array.isArray(data.periodCycles)&&data.periodCycles.length>=6},
  {id:"cycles-twelve",icon:"🌕",name:"A Year of Moons",category:"Wellness",rarity:"Legendary",story:"For keeping twelve cycle records.",rule:()=>Array.isArray(data.periodCycles)&&data.periodCycles.length>=12},

  {id:"seven-tanks",icon:"🐟",name:"Seven Little Worlds",category:"Aquariums",rarity:"Epic",story:"For caring for seven aquariums.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.length>=7},
  {id:"ten-tanks",icon:"🪸",name:"Aquatic Sanctuary",category:"Aquariums",rarity:"Mythical",story:"For caring for ten aquariums.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.length>=10},
  {id:"aquarium-feed-twentyfive",icon:"🦐",name:"Dinner Bell",category:"Aquariums",rarity:"Rare",story:"For recording twenty-five aquarium feedings.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.reduce((n,a)=>n+(a.feeds||[]).length,0)>=25},
  {id:"aquarium-feed-hundred",icon:"🐬",name:"Guardian of the Waters",category:"Aquariums",rarity:"Legendary",story:"For recording one hundred aquarium feedings.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.reduce((n,a)=>n+(a.feeds||[]).length,0)>=100},
  {id:"aquarium-care-five",icon:"🧪",name:"Water Alchemist",category:"Aquariums",rarity:"Epic",story:"For recording care in five aquarium entries.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.filter(a=>Object.values(a.maintenance||{}).some(Boolean)).length>=5},

  {id:"collector-seventyfive",icon:"🪄",name:"Grand Collector",category:"Hidden",rarity:"Legendary",story:"For discovering seventy-five treasures.",hidden:true,rule:()=>Object.values(data.treasures||{}).filter(x=>x?.collected).length>=75},
  {id:"collector-hundred",icon:"🌟",name:"Master of the Archive",category:"Hidden",rarity:"Mythical",story:"For discovering one hundred treasures.",hidden:true,rule:()=>Object.values(data.treasures||{}).filter(x=>x?.collected).length>=100},
  {id:"visits-ten",icon:"🚪",name:"The Door Knows You",category:"Hidden",rarity:"Uncommon",story:"For visiting the Treasure Room ten times.",hidden:true,rule:()=>Number(data.treasureRoomVisits||0)>=10},
  {id:"visits-twohundred",icon:"🗝️",name:"Permanent Resident",category:"Hidden",rarity:"Mythical",story:"For visiting the Treasure Room two hundred times.",hidden:true,rule:()=>Number(data.treasureRoomVisits||0)>=200},
  {id:"sunday-sanctuary",icon:"🕯️",name:"Sunday Sanctuary",category:"Hidden",rarity:"Rare",story:"For visiting LinaHub on a Sunday evening.",hidden:true,rule:()=>new Date().getDay()===0&&new Date().getHours()>=18},

  {id:"collector-five",icon:"🔮",name:"Curious Collector",category:"Hidden",story:"For discovering five treasures.",hidden:true,rule:()=>Object.values(data.treasures||{}).filter(x=>x?.collected).length>=5},
  {id:"collector-twelve",icon:"💎",name:"Keeper of Treasures",category:"Hidden",story:"For discovering twelve treasures.",hidden:true,rule:()=>Object.values(data.treasures||{}).filter(x=>x?.collected).length>=12},
  {id:"room-visitor",icon:"🕯️",name:"The Secret Shelf",category:"Hidden",story:"For returning to the Treasure Room again and again.",hidden:true,rule:()=>Number(data.treasureRoomVisits||0)>=20},
  {id:"all-shelves",icon:"👑",name:"The Curator",category:"Hidden",story:"For placing a treasure on every shelf.",hidden:true,rule:()=>["Garden","Journal","Home","Wellness","Aquariums"].every(c=>TREASURE_DEFINITIONS.some(t=>t.category===c&&data.treasures?.[t.id]?.collected))}
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
function treasureRarity(t){return t.rarity||"Common"}
function collectedTreasures(){return TREASURE_DEFINITIONS.filter(t=>treasureState(t.id)?.collected)}
function waitingTreasures(){return TREASURE_DEFINITIONS.filter(t=>treasureState(t.id)&&!treasureState(t.id).collected)}
function visibleBookTreasures(){return TREASURE_DEFINITIONS.filter(t=>!t.hidden||treasureState(t.id)?.collected)}
function treasureTrinket(t){
  const labels={
    "golden-lemon":"A tiny golden lemon from your lemon tree",
    "surprise-bloom":"A little pink rose from your first rose plant",
    "first-plant":"A tiny first seedling",
    "five-plants":"A little potted plant",
    "ten-plants":"A leafy garden sprig",
    "orchid-keeper":"A delicate orchid bloom",
    "herb-garden":"A small bundle of herbs",
    "plant-photo":"A miniature framed garden portrait",
    "first-journal":"A tiny leather journal",
    "journal-seven":"A little writing quill",
    "journal-thirty":"A miniature stack of journals",
    "journal-hundred":"A tiny archive box",
    "midnight-visitor":"A silver moon charm",
    "early-bird":"A sunrise charm",
    "first-task":"A tiny handwritten list",
    "ten-tasks":"A little completed checklist",
    "house-care":"A miniature home",
    "sanctuary-key":"A tiny brass key",
    "first-med":"A little care bottle",
    "med-ten":"A comforting cup of tea",
    "cycle-bloom":"A cycle flower charm",
    "gentle-heart":"A small purple heart",
    "little-aquarium":"A tiny glass fish",
    "aquarium-care":"A little shell",
    "two-tanks":"A cluster of water bubbles",
    "collector-five":"A small crystal ball",
    "collector-twelve":"A cut gem",
    "room-visitor":"A tiny candle",
    "all-shelves":"A miniature curator crown"
  };
  return `<i class="shelf-trinket trinket-${t.id}" data-treasure="${t.id}" title="${labels[t.id]||t.name}" aria-label="${labels[t.id]||t.name}"><span>${t.icon}</span></i>`;
}

function TreasureRoomPage(){
  ensureTreasureData();
  const collected=collectedTreasures(),waiting=waitingTreasures();
  return shell(`
    ${head("Treasure Room","Your enchanted archive","home")}
    <section class="treasure-intro"><div><span class="section-kicker">LinaHub Sanctuary</span><h1>Your Treasure Room</h1><p>Each shelf keeps the moments, habits and little victories you have gathered.</p></div><div class="treasure-count"><b>${collected.length}</b><small>discovered</small></div></section>
    <section class="treasure-library" aria-label="Enchanted treasure bookcase">
      <div class="library-moon"></div>
      <div class="grand-bookcase">
        <div class="bookcase-crown"><span>✦</span><b>THE TREASURE ARCHIVE</b><span>✦</span></div>
        ${TREASURE_SHELVES.map(category=>{const items=collected.filter(t=>t.category===category).slice(0,10);return `<button class="archive-shelf" data-shelf="${category}" aria-label="${category} shelf"><span class="shelf-display">${items.map(t=>treasureTrinket(t)).join("")}${Array.from({length:Math.max(0,10-items.length)},()=>`<i class="shelf-empty"><span>✧</span></i>`).join("")}</span></button>`}).join("")}
      </div>
    </section>
    ${waiting.length?`<section class="waiting-table card"><div><span class="section-kicker">New treasure discovered</span><h2>${waiting.length} waiting to be opened</h2><p>Your archive has found something new.</p></div><button class="gift-parcel" id="collectTreasure"><span>✦</span><b>Discover</b></button></section>`:""}
    <section class="card treasure-book"><div class="section-title"><div><span class="section-kicker">Treasure Book</span><h2>Your discoveries</h2></div><small>${collected.length}/${TREASURE_DEFINITIONS.length}</small></div><div class="treasure-grid">${visibleBookTreasures().map(t=>{const s=treasureState(t.id);return s?.collected?`<button class="treasure-card" data-treasure="${t.id}"><span>${t.icon}</span><strong>${t.name}</strong><small>${t.category} · ${treasureRarity(t)}</small></button>`:`<div class="treasure-card locked"><span>?</span><strong>Undiscovered</strong><small>${t.category}</small></div>`}).join("")}</div></section>
    <div id="treasureModal"></div>
  `,"treasures");
}
function openTreasureModal(id,newlyCollected=false){
  const t=TREASURE_DEFINITIONS.find(x=>x.id===id);if(!t)return;
  const s=treasureState(id);
  closeTreasureModal();
  const portal=document.createElement("div");
  portal.id="treasureModalPortal";
  portal.innerHTML=`<div class="treasure-modal-backdrop"><div class="treasure-modal ${newlyCollected?"reveal":""}" role="dialog" aria-modal="true" aria-label="${t.name}"><button class="modal-close" data-close-treasure aria-label="Close treasure">×</button><div class="modal-sparkles">✦　✧　✦</div><div class="modal-treasure-icon">${t.icon}</div><span class="section-kicker">${newlyCollected?"New treasure discovered":t.category}</span><h2>${t.name}</h2><div class="treasure-rarity">${treasureRarity(t)}</div><p>${t.story}</p><small>Discovered ${new Date(s?.unlockedAt||Date.now()).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</small></div></div>`;
  document.body.appendChild(portal);
  document.body.classList.add("treasure-modal-open");
  bindTreasureModal();
}
function closeTreasureModal(){
  document.querySelector("#treasureModalPortal")?.remove();
  document.body.classList.remove("treasure-modal-open");
}
function bindTreasureModal(){
  const portal=document.querySelector("#treasureModalPortal");
  const b=portal?.querySelector(".treasure-modal-backdrop"),p=portal?.querySelector(".treasure-modal");
  p?.addEventListener("click",e=>e.stopPropagation());
  b?.addEventListener("click",closeTreasureModal);
  portal?.querySelector("[data-close-treasure]")?.addEventListener("click",closeTreasureModal);
}
function bindTreasures(){ensureTreasureData();data.treasureRoomVisits=Number(data.treasureRoomVisits||0)+1;saveData();document.querySelector("#collectTreasure")?.addEventListener("click",()=>{const n=waitingTreasures()[0];if(!n)return;data.treasures[n.id].collected=true;saveData();openTreasureModal(n.id,true)});document.querySelectorAll("[data-treasure]").forEach(c=>c.addEventListener("click",e=>{e.preventDefault();e.stopPropagation();openTreasureModal(c.dataset.treasure)}));document.querySelectorAll("[data-shelf]").forEach(s=>s.addEventListener("click",()=>{const first=collectedTreasures().find(t=>t.category===s.dataset.shelf);if(first)openTreasureModal(first.id);else toast("This shelf is waiting for its first treasure")}))}
