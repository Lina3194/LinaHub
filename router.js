
const STORAGE_KEY="linahub-data";
const LEGACY_KEYS=["linahub-v4","linahub-v4-1","linahub-v4-2","linahub-v4-3"];

const DEFAULT_DATA={
  version:5,
  theme:"dark",
  colorTheme:"amethyst",
  notifications:{enabled:false,medication:true,todayTasks:true,dayCheckins:false,medicationTimes:["09:00"],todayTimes:["09:15"],dayCheckinStart:"08:00",dayCheckinEnd:"22:00",dayCheckinEvery:1,lastSent:{}},
  checkins:{},
  checkinLayout:["sleep","energy","mood","pain","spoons","water","selfcare","supports"],
  checkinFilter:"all",
  journalControlsCollapsed:true,
  journalTab:"today",
  journalSelectedDate:"",
  journalTrendPeriod:"week",
  homeIcons:{
    journal:"📖",health:"⚖️",plants:"🌿",medication:"💊",
    pokemon:"🔴",pets:"🐠",house:"🏡",period:"🌸",budget:"💷",treasures:"✨",settings:"⚙️"
  },
  moduleIcons:{
    home:"⌂",today:"✅",todo:"📝",settings:"⚙️",journal:"📖",health:"❤️",plants:"🌿",medication:"💊",pokemon:"🔴",pets:"🐠",house:"🏡",period:"🌸",budget:"💷",treasures:"✨",
    sleep:"😴",weight:"⚖️",measurements:"📏",healthOverview:"❤️",journey:"✨",
    rooms:"🏠",shopping:"🛒",inventory:"📦",girlsTank:"🩷",boysTank:"💙",aquariumMaintenance:"🫧",
    bills:"🧾",savings:"💰",income:"💷",expenses:"💸"
  },
  homeImages:{},
  homeTileNames:{plants:"Garden"},
  homeTileAccents:{},
  homeHidden:[],
  bills:[],
  budgetEntries:[],
  savingsEntries:[],
  homeLayout:[
    {id:"journal",size:"medium"},{id:"health",size:"medium"},{id:"plants",size:"medium"},{id:"medication",size:"medium"},
    {id:"pokemon",size:"medium"},{id:"pets",size:"medium"},{id:"house",size:"medium"},{id:"period",size:"medium"},{id:"budget",size:"medium"},{id:"settings",size:"medium"},{id:"treasures",size:"wide"}
  ],
  homeEditing:false,
  treasures:{},
  favoriteTreasures:[],
  periodEntries:{},periodCycles:[],periodOptions:[],periodSelectedDate:"",periodCalendarMonth:"",periodEditOptions:false,
  moduleBanners:{},
  checkinHidden:[],
  selfCareOptions:["Rest","Reading","Exercises","Warmth","Good food","Fresh air","Music","Gaming","Hobbies"],
  supportOptions:["Left knee","Right knee","Left ankle","Right ankle","Walking stick","Other"],
  pokemonFriends:structuredClone(POKEMON_FRIEND_SEED),
  pokemonSeededVersion:2,
  medications:[
    {id:"med-folic-acid",name:"Folic Acid",dose:"",time:"Morning",notes:""}
  ],
  medicationLog:{},
  weightEntries:[],
  measurements:[],
  sleepEntries:[],
  dayCheckins:[],
  healthPromptLog:{},
  personalTasks:[],
  houseControlsCollapsed:true,
  houseOpenRooms:[],
  houseRooms:[
    {id:"living-room",name:"Living Room",icon:"🛋️"},
    {id:"kitchen",name:"Kitchen",icon:"🍳"},
    {id:"downstairs-wc",name:"Downstairs WC",icon:"🚽"},
    {id:"garden-patio",name:"Garden / Patio",icon:"🌿"},
    {id:"main-bedroom",name:"Main Bedroom",icon:"🛏️"},
    {id:"main-bathroom",name:"Main Bathroom",icon:"🛁"},
    {id:"study-guest-room",name:"Study / Guest Room",icon:"💻"},
    {id:"whole-house",name:"Whole House",icon:"🏠"}
  ],
  houseTasks:[
    {id:"living-vacuum",room:"Living Room",task:"Vacuum floors",frequency:"Weekly",done:false},
    {id:"living-dust",room:"Living Room",task:"Dust surfaces and bookcase",frequency:"Weekly",done:false},
    {id:"living-oven",room:"Kitchen",task:"Clean oven",frequency:"Monthly",done:false},
    {id:"living-washing",room:"Kitchen",task:"Laundry",frequency:"Daily / every other day",done:false},
    {id:"wc-clean",room:"Downstairs WC",task:"Clean toilet and sink",frequency:"Weekly",done:false},
    {id:"garden-tidy",room:"Garden / Patio",task:"Tidy patio",frequency:"Weekly",done:false},
    {id:"bedroom-bedding",room:"Main Bedroom",task:"Change bedding",frequency:"Weekly",done:false},
    {id:"bathroom-clean",room:"Main Bathroom",task:"Clean bathroom",frequency:"Weekly",done:false},
    {id:"study-dust",room:"Study / Guest Room",task:"Dust bookcase and desk",frequency:"Weekly",done:false},
    {id:"recycling",room:"Whole House",task:"Put recycling out",frequency:"Thursday",done:false}
  ],

  aquariums:[
    {
      id:"girls-tank",name:"Girls Tank",emoji:"💗",
      livestock:[
        {id:"girls-guppies",type:"Fish",name:"Female guppies",count:""},
        {id:"girls-amano",type:"Shrimp",name:"Amano shrimp",count:3},
        {id:"girls-assassin",type:"Snail",name:"Assassin snails",count:2}
      ],
      temperature:"",temperatureUpdated:"",
      feeds:[],
      maintenance:{waterChange:"",clean:"",filterChange:"",spongeChange:""}
    },
    {
      id:"boys-tank",name:"Boys Tank",emoji:"💙",
      livestock:[
        {id:"boys-guppies",type:"Fish",name:"Male guppies",count:""},
        {id:"boys-babies",type:"Fish",name:"Baby guppies",count:""},
        {id:"boys-amano",type:"Shrimp",name:"Amano shrimp",count:2},
        {id:"boys-assassin",type:"Snail",name:"Assassin snail",count:1}
      ],
      temperature:"",temperatureUpdated:"",
      feeds:[],
      maintenance:{waterChange:"",clean:"",filterChange:"",spongeChange:""}
    }
  ],
  plants:[
    {id:"lemon-tree",name:"Lemon Tree",emoji:"🍋",notes:"Grown from a lemon seed.",lastWatered:"",history:[],photo:""},
    {id:"basil",name:"Basil",emoji:"🌿",notes:"",lastWatered:"",history:[],photo:""},
    {id:"greek-oregano",name:"Greek Oregano",emoji:"🌱",notes:"",lastWatered:"",history:[],photo:""},
    {id:"orchid",name:"Orchid",emoji:"🌸",notes:"",lastWatered:"",history:[],photo:""},
    {id:"nemesia-vanilla",name:"Nemesia 'Vanilla'",emoji:"🌼",notes:"",lastWatered:"",history:[],photo:""},
    {id:"spider-plant",name:"Spider Plant",emoji:"🪴",notes:"",lastWatered:"",history:[],photo:""},
    {id:"prayer-plant",name:"Prayer Plant",emoji:"🍃",notes:"",lastWatered:"",history:[],photo:""},
    {id:"apple-seeds",name:"Apple Seeds",emoji:"🍎",notes:"",lastWatered:"",history:[],photo:""}
  ]
};




function normalizeHouseTaskData(task,index){
  return {
    id:String(task?.id||`house-${Date.now()}-${index}`),
    task:String(task?.task||task?.title||"Untitled job"),
    room:String(task?.room||"Whole House"),
    frequency:String(task?.frequency||"As needed"),
    energy:["Low","Medium","High"].includes(task?.energy)?task.energy:"Medium",
    priority:[1,2,3].includes(Number(task?.priority))?Number(task.priority):1,
    weekdays:Array.isArray(task?.weekdays)?task.weekdays:[],
    createdDate:task?.createdDate||today(),
    completionHistory:Array.isArray(task?.completionHistory)?[...new Set(task.completionHistory.filter(Boolean))].sort():[],
    lastCompleted:task?.lastCompleted||((Array.isArray(task?.completionHistory)&&task.completionHistory.length)?task.completionHistory.slice().sort().at(-1):""),
    completionUpdatedAt:task?.completionUpdatedAt||"",
    done:false
  };
}


function normalizeHouseRoomData(room,index){
  if(typeof room==="string"){
    return {
      id:room.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||`room-${index}`,
      name:room,
      icon:"🏡"
    };
  }
  return {
    id:String(room?.id||`room-${Date.now()}-${index}`),
    name:String(room?.name||"Room"),
    icon:String(room?.icon||"🏡")
  };
}

function prepareHouseData(target){
  target.houseTasks=(Array.isArray(target.houseTasks)?target.houseTasks:DEFAULT_DATA.houseTasks).map(normalizeHouseTaskData);
  target.houseRooms=(Array.isArray(target.houseRooms)&&target.houseRooms.length?target.houseRooms:DEFAULT_DATA.houseRooms).map(normalizeHouseRoomData);

  const combined=target.houseRooms.find(room=>room.name==="Living Room / Kitchen");
  if(combined){
    target.houseRooms=target.houseRooms.filter(room=>room.id!==combined.id);
    if(!target.houseRooms.some(room=>room.name==="Living Room")) target.houseRooms.unshift({id:"living-room",name:"Living Room",icon:"🛋️"});
    if(!target.houseRooms.some(room=>room.name==="Kitchen")) target.houseRooms.splice(1,0,{id:"kitchen",name:"Kitchen",icon:"🍳"});
    target.houseTasks.forEach(task=>{
      if(task.room!=="Living Room / Kitchen") return;
      task.room=/oven|hob|fridge|freezer|dish|sink|counter|worktop|kitchen|laundry|washing|bin/i.test(task.task)?"Kitchen":"Living Room";
    });
  }

  // Older builds could accidentally create duplicate task IDs. That made the visible
  // row update one record while Today read another. Repair duplicates once on load.
  const usedTaskIds=new Set();
  target.houseTasks.forEach((task,index)=>{
    let id=String(task.id||`house-${Date.now()}-${index}`);
    if(usedTaskIds.has(id)){
      const base=id;
      let suffix=2;
      while(usedTaskIds.has(`${base}-${suffix}`)) suffix++;
      id=`${base}-${suffix}`;
    }
    task.id=id;
    usedTaskIds.add(id);
  });

  target.houseTasks.forEach(task=>{
    if(!target.houseRooms.some(room=>room.name===task.room)){
      target.houseRooms.push({id:`room-${task.room.toLowerCase().replace(/[^a-z0-9]+/g,"-")||Date.now()}`,name:task.room,icon:"🏡"});
    }
  });

  if(!target.houseRooms.some(room=>room.name==="Whole House")) target.houseRooms.push({id:"whole-house",name:"Whole House",icon:"🏠"});
  if(typeof target.houseControlsCollapsed!=="boolean") target.houseControlsCollapsed=true;
  if(!Array.isArray(target.houseOpenRooms)) target.houseOpenRooms=[];
  if(typeof target.journalControlsCollapsed!=="boolean") target.journalControlsCollapsed=true;
  return target;
}

function normalizePersonalTask(task,index){
  const deadline=task?.deadline||task?.date||"";
  return {
    id:String(task?.id||`todo-${Date.now()}-${index}`),
    title:String(task?.title||task?.task||"Untitled task"),
    energy:["Low","Medium","High"].includes(task?.energy)?task.energy:"Medium",
    deadline,
    date:deadline,
    time:"",
    done:task?.done===true,
    created:task?.created||today(),
    completed:task?.completed||""
  };
}

function normalizePokemonFriend(f,i){
  return {
    id:f.id||`poke-${Date.now()}-${i}`,name:f.name||"Unknown Trainer",nickname:f.nickname||"",
    friendship:f.friendship||"Good Friend",vivillon:f.vivillon||"Unknown",country:f.country||"",
    lastGiftReceived:f.lastGiftReceived||"",lastGiftSent:f.lastGiftSent||"",
    giftsReceived:Number(f.giftsReceived)||0,giftsSent:Number(f.giftsSent)||0,
    giftReceivedDates:Array.isArray(f.giftReceivedDates)?[...new Set(f.giftReceivedDates.filter(Boolean))].sort():[],
    giftSentDates:Array.isArray(f.giftSentDates)?[...new Set(f.giftSentDates.filter(Boolean))].sort():[],
    lastInteraction:f.lastInteraction||f.lastGiftReceived||f.lastGiftSent||"",
    active:f.active!==false,notes:f.notes||""
  };
}


function normalizeAquarium(tank,i){
  const fallback=DEFAULT_DATA.aquariums[i]||{};
  return {
    id:tank?.id||fallback.id||`tank-${i}`,
    name:tank?.name||fallback.name||`Tank ${i+1}`,
    emoji:tank?.emoji||fallback.emoji||"🐠",
    livestock:Array.isArray(tank?.livestock)?tank.livestock:(fallback.livestock||[]),
    temperature:tank?.temperature??"",
    temperatureUpdated:tank?.temperatureUpdated||"",
    feeds:Array.isArray(tank?.feeds)?tank.feeds:[],
    maintenance:{
      waterChange:tank?.maintenance?.waterChange||"",
      clean:tank?.maintenance?.clean||"",
      filterChange:tank?.maintenance?.filterChange||"",
      spongeChange:tank?.maintenance?.spongeChange||""
    }
  };
}

function normalizePlant(p,i){
  if(typeof p==="string"){
    return {id:p.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||`plant-${i}`,name:p,emoji:"🌿",notes:"",lastWatered:"",history:[],photo:""};
  }
  return {
    id:p.id||`plant-${i}`,name:p.name||"Plant",emoji:p.emoji||"🌿",notes:p.notes||"",
    lastWatered:p.lastWatered||"",history:Array.isArray(p.history)?p.history:[],photo:p.photo||"",
    photoKey:p.photoKey||`plant:${p.id||`plant-${i}`}`,guideId:p.guideId||"",wateringDays:Number(p.wateringDays)||0
  };
}

function migrateLegacy(){
  for(const key of LEGACY_KEYS){
    try{
      const raw=localStorage.getItem(key);
      if(!raw) continue;
      const old=JSON.parse(raw);
      const migrated={...DEFAULT_DATA,...old,version:5};
      migrated.plants=(old.plants||DEFAULT_DATA.plants).map(normalizePlant);
      migrated.aquariums=(migrated.aquariums||DEFAULT_DATA.aquariums).map(normalizeAquarium);
      prepareHouseData(migrated);
      migrated.personalTasks=(Array.isArray(migrated.personalTasks)?migrated.personalTasks:[]).map(normalizePersonalTask);
      migrated.medications=Array.isArray(migrated.medications)?migrated.medications:[];
      if(!migrated.medications.some(m=>(m.name||"").trim().toLowerCase()==="folic acid")){
        migrated.medications.unshift({id:"med-folic-acid",name:"Folic Acid",dose:"",time:"Morning",notes:""});
      }
      if(!Array.isArray(migrated.pokemonFriends)||migrated.pokemonFriends.length===0){
        migrated.pokemonFriends=structuredClone(POKEMON_FRIEND_SEED);migrated.pokemonSeededVersion=1;
      }
      migrated.pokemonFriends=migrated.pokemonFriends.map(normalizePokemonFriend);
      localStorage.setItem(STORAGE_KEY,JSON.stringify(migrated));
      return migrated;
    }catch{}
  }
  return null;
}

function loadData(){
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(raw){
      const loaded={...DEFAULT_DATA,...JSON.parse(raw)};
      loaded.plants=(loaded.plants||DEFAULT_DATA.plants).map(normalizePlant);
      loaded.aquariums=(loaded.aquariums||DEFAULT_DATA.aquariums).map(normalizeAquarium);
      prepareHouseData(loaded);
      loaded.personalTasks=(Array.isArray(loaded.personalTasks)?loaded.personalTasks:[]).map(normalizePersonalTask);
      loaded.medications=Array.isArray(loaded.medications)?loaded.medications:[];
      if(!loaded.medications.some(m=>(m.name||"").trim().toLowerCase()==="folic acid")){
        loaded.medications.unshift({id:"med-folic-acid",name:"Folic Acid",dose:"",time:"Morning",notes:""});
      }
      if(!loaded.pokemonSeededVersion && (!Array.isArray(loaded.pokemonFriends)||loaded.pokemonFriends.length===0)){
        loaded.pokemonFriends=structuredClone(POKEMON_FRIEND_SEED);loaded.pokemonSeededVersion=1;
      }
      loaded.pokemonFriends=(loaded.pokemonFriends||[]).map(normalizePokemonFriend);
      return loaded;
    }
    return migrateLegacy()||structuredClone(DEFAULT_DATA);
  }catch{
    return structuredClone(DEFAULT_DATA);
  }
}

function moduleIcon(key,fallback="✨"){
  return String(data?.moduleIcons?.[key]||data?.homeIcons?.[key]||fallback);
}
function moduleVisual(key,fallback="✨",className="module-tile-image"){
  const src=data?.homeImages?.[key];
  return src?`<img class="${className}" src="${src}" alt="">`:esc(moduleIcon(key,fallback));
}

let data=loadData();
if(!data.v9CollapseDefaultsApplied){
  data.journalControlsCollapsed=true;
  data.houseControlsCollapsed=true;
  data.v9CollapseDefaultsApplied=true;
  localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}
function saveData(){
  try{
    // Images are stored separately in IndexedDB. Never let a large photo make all app data fail to save.
    const serializable={...data,plants:(data.plants||[]).map(plant=>({...plant,photo:/^data:image\//.test(plant.photo||"")?"":plant.photo||""}))};
    localStorage.setItem(STORAGE_KEY,JSON.stringify(serializable));
    return true;
  }catch(error){
    console.error("LinaHub could not save",error);
    toast("LinaHub could not save that change. Please free a little browser storage.");
    return false;
  }
}
function today(){
  const now=new Date();
  const pad=value=>String(value).padStart(2,"0");
  return `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
}
function niceDate(){return new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
function formatDate(value){return new Date(value+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(text){const el=document.querySelector("#toast");el.textContent=text;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1800)}
