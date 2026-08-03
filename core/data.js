
const STORAGE_KEY="linahub-data";
// LinaHub 17.4.8 — shared image storage wrappers (same IndexedDB database/store as before).
async function saveLinaImage(key,value){return LinaImage.save(key,value)}
async function loadLinaImage(key){try{return await LinaImage.load(key)}catch{return ""}}
async function deleteLinaImage(key){try{return await LinaImage.remove(key)}catch{return false}}
async function hydrateLinaMedia(){
  data.homeImages=data.homeImages||{};
  data.moduleBanners=data.moduleBanners||{};
  data.plants=Array.isArray(data.plants)?data.plants:[];
  data.aquariums=Array.isArray(data.aquariums)?data.aquariums:[];
  data.medications=Array.isArray(data.medications)?data.medications:[];
  let changed=false;

  const migrateInline=async(key,value)=>{
    if(!/^data:image\//.test(value||"")) return;
    try{await saveLinaImage(key,value)}catch(error){console.error("Could not migrate image",key,error)}
  };
  for(const [key,value] of Object.entries(data.homeImages)) await migrateInline(`tab:${key}`,value);
  for(const [key,value] of Object.entries(data.moduleBanners)) await migrateInline(`banner:${key}`,value);
  for(const plant of data.plants){plant.photoKey=plant.photoKey||`plant:${plant.id}`;await migrateInline(plant.photoKey,plant.photo)}
  for(const tank of data.aquariums){tank.photoKey=tank.photoKey||`aquarium:${tank.id}`;await migrateInline(tank.photoKey,tank.photo)}
  for(const med of data.medications){med.photoKey=med.photoKey||`medication:${med.id}`;await migrateInline(med.photoKey,med.photo)}

  let rows=[];
  try{rows=await LinaImage.entries()}catch(error){console.error("Could not list saved images",error)}
  for(const [storageKey,value] of rows){
    if(!value) continue;
    if(storageKey.startsWith("tab:")){
      const key=storageKey.slice(4);
      if(data.homeImages[key]!==value){data.homeImages[key]=value;changed=true}
    }else if(storageKey.startsWith("banner:")){
      const key=storageKey.slice(7);
      if(data.moduleBanners[key]!==value){data.moduleBanners[key]=value;changed=true}
    }else if(storageKey.startsWith("plant:")){
      const plant=data.plants.find(item=>(item.photoKey||`plant:${item.id}`)===storageKey);
      if(plant&&plant.photo!==value){plant.photo=value;changed=true}
    }else if(storageKey.startsWith("aquarium:")){
      const tank=data.aquariums.find(item=>(item.photoKey||`aquarium:${item.id}`)===storageKey);
      if(tank&&tank.photo!==value){tank.photo=value;changed=true}
    }else if(storageKey.startsWith("medication:")){
      const med=data.medications.find(item=>(item.photoKey||`medication:${item.id}`)===storageKey);
      if(med&&med.photo!==value){med.photo=value;changed=true}
    }
  }
  for(const [tabKey,tankId] of [["girlsTank","girls-tank"],["boysTank","boys-tank"]]){
    const saved=data.homeImages[tabKey]||"";
    const tank=data.aquariums.find(item=>item.id===tankId);
    if(tank&&saved&&tank.photo!==saved){tank.photo=saved;changed=true}
  }
  return changed;
}


const LEGACY_KEYS=["linahub-v4","linahub-v4-1","linahub-v4-2","linahub-v4-3"];

const DEFAULT_DATA={
  version:5,
  theme:"dark",
  colorTheme:"floral",
  notifications:{enabled:false,medication:true,todayTasks:true,dayCheckins:false,medicationTimes:["09:00"],todayTimes:["09:15"],dayCheckinStart:"08:00",dayCheckinEnd:"22:00",dayCheckinEvery:1,lastSent:{}},
  checkins:{},
  morningCheckins:{},
  dailyCheckinCompleted:{},
  dailyCheckinRemindAt:{},
  journalTimeline:[],
  shoppingHistory:[],
  checkinLayout:["sleep","energy","mood","pain","spoons","water","selfcare","supports"],
  checkinFilter:"all",
  journalControlsCollapsed:true,
  journalTab:"today",
  journalSelectedDate:"",
  journalTrendPeriod:"week",
  journalSleepMetric:"sleep",
  journalSleepMonth:"",
  homeIcons:{
    journal:"📖",health:"⚖️",hobbies:"🎮",plants:"🌿",medication:"💊",shopping:"🛒",shoppingFridge:"❄️",shoppingFreezer:"🧊",shoppingPantry:"🥫",shoppingCleaning:"🧽",shoppingToiletries:"🧴",
    pokemon:"🔴",pets:"🐠",house:"🏡",period:"🌸",budget:"💷",treasures:"✨",settings:"⚙️"
  },
  moduleIcons:{
    home:"⌂",today:"✅",todo:"📝",shopping:"🛒",settings:"⚙️",journal:"📖",health:"❤️",hobbies:"🎮",plants:"🌿",medication:"💊",pokemon:"🔴",pets:"🐠",books:"📚",gaming:"🎮",house:"🏡",period:"🌸",budget:"💷",treasures:"✨",
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
    {id:"journal",size:"medium"},{id:"health",size:"medium"},{id:"hobbies",size:"medium"},{id:"shopping",size:"medium"},
    {id:"house",size:"medium"},{id:"budget",size:"medium"},{id:"treasures",size:"wide"}
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
  shoppingItems:[],
  shoppingView:{category:"all"},
  books:[],
  booksView:{tab:"reading"},
  shoppingCategories:["Fruit & Veg","Fridge","Freezer","Cupboard","Toiletries","Other"],
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
      maintenance:{waterChange:"",clean:"",filterChange:"",spongeChange:"",history:{waterChange:[],clean:[],spongeChange:[],filterChange:[]}}
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
      maintenance:{waterChange:"",clean:"",filterChange:"",spongeChange:"",history:{waterChange:[],clean:[],spongeChange:[],filterChange:[]}}
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
    photo:tank?.photo||"",
    photoKey:tank?.photoKey||`aquarium:${tank?.id||fallback.id||`tank-${i}`}`,
    livestock:Array.isArray(tank?.livestock)?tank.livestock:(fallback.livestock||[]),
    temperature:tank?.temperature??"",
    temperatureUpdated:tank?.temperatureUpdated||"",
    feeds:Array.isArray(tank?.feeds)?tank.feeds:[],
    maintenance:{
      waterChange:tank?.maintenance?.waterChange||"",
      clean:tank?.maintenance?.clean||"",
      filterChange:tank?.maintenance?.filterChange||"",
      spongeChange:tank?.maintenance?.spongeChange||"",
      history:{
        waterChange:Array.isArray(tank?.maintenance?.history?.waterChange)?tank.maintenance.history.waterChange:[],
        clean:Array.isArray(tank?.maintenance?.history?.clean)?tank.maintenance.history.clean:[],
        spongeChange:Array.isArray(tank?.maintenance?.history?.spongeChange)?tank.maintenance.history.spongeChange:[],
        filterChange:Array.isArray(tank?.maintenance?.history?.filterChange)?tank.maintenance.history.filterChange:[]
      },
      intervals:{
        waterChange:Math.max(1,Number(tank?.maintenance?.intervals?.waterChange)||7),
        clean:Math.max(1,Number(tank?.maintenance?.intervals?.clean)||14),
        spongeChange:Math.max(1,Number(tank?.maintenance?.intervals?.spongeChange)||21),
        filterChange:Math.max(1,Number(tank?.maintenance?.intervals?.filterChange)||42)
      }
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
    photoKey:p.photoKey||`plant:${p.id||`plant-${i}`}`,guideId:p.guideId||"",wateringDays:Number(p.wateringDays)||0,
    light:p.light||"",lastFed:p.lastFed||"",feedingHistory:Array.isArray(p.feedingHistory)?p.feedingHistory:[],
    repotHistory:Array.isArray(p.repotHistory)?p.repotHistory:[],photoHistory:Array.isArray(p.photoHistory)?p.photoHistory:[],
    reminderEnabled:p.reminderEnabled!==false
  };
}


function validHistoryDate(value){
  return typeof value==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(value);
}
function plantIdentityKeys(plant){
  const keys=[];
  const id=String(plant?.id||"").trim().toLowerCase();
  const name=String(plant?.name||"").trim().toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  if(id)keys.push(`id:${id}`);
  if(name)keys.push(`name:${name}`);
  return keys;
}
function extractPlantWateringDates(plant){
  const values=[];
  const lists=[plant?.history,plant?.wateringHistory,plant?.waterHistory,plant?.careHistory?.watering,plant?.careHistory?.watered];
  for(const list of lists){
    if(Array.isArray(list)){
      for(const item of list){
        const value=typeof item==="string"?item:item?.date;
        if(validHistoryDate(value))values.push(value);
      }
    }
  }
  if(validHistoryDate(plant?.lastWatered))values.push(plant.lastWatered);
  return [...new Set(values)].sort();
}
function recoverPlantHistoryFromBrowser(loaded){
  try{
    const recoveryMap=new Map();
    const addPlant=plant=>{
      const dates=extractPlantWateringDates(plant);
      if(!dates.length)return;
      for(const key of plantIdentityKeys(plant)){
        const existing=recoveryMap.get(key)||[];
        recoveryMap.set(key,[...new Set([...existing,...dates])].sort());
      }
    };
    for(let i=0;i<localStorage.length;i++){
      const key=localStorage.key(i);
      if(!key||(!key.toLowerCase().includes("linahub")&&!key.toLowerCase().includes("plant")))continue;
      try{
        const parsed=JSON.parse(localStorage.getItem(key)||"null");
        const candidates=[];
        if(Array.isArray(parsed?.plants))candidates.push(...parsed.plants);
        if(Array.isArray(parsed?.data?.plants))candidates.push(...parsed.data.plants);
        if(Array.isArray(parsed?.garden?.plants))candidates.push(...parsed.garden.plants);
        candidates.forEach(addPlant);
      }catch{}
    }
    let recovered=0;
    for(const plant of loaded.plants||[]){
      const found=[];
      for(const key of plantIdentityKeys(plant))found.push(...(recoveryMap.get(key)||[]));
      const current=extractPlantWateringDates(plant);
      const merged=[...new Set([...current,...found])].sort();
      recovered+=Math.max(0,merged.length-current.length);
      plant.history=merged;
      plant.lastWatered=merged.at(-1)||plant.lastWatered||"";
    }
    if(recovered>0){
      loaded.plantHistoryRecovered=(Number(loaded.plantHistoryRecovered)||0)+recovered;
      loaded.plantHistoryRecoveredAt=new Date().toISOString();
    }
    return loaded;
  }catch{return loaded}
}

function migrateLegacy(){
  for(const key of LEGACY_KEYS){
    try{
      const raw=localStorage.getItem(key);
      if(!raw) continue;
      const old=JSON.parse(raw);
      const migrated={...DEFAULT_DATA,...old,version:5};
      migrated.plants=(old.plants||DEFAULT_DATA.plants).map(normalizePlant);
      recoverPlantHistoryFromBrowser(migrated);
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
      recoverPlantHistoryFromBrowser(loaded);
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
      loaded.shoppingCategories=(loaded.shoppingCategories||DEFAULT_DATA.shoppingCategories).filter(category=>category!=="Household");
      loaded.shoppingItems=(loaded.shoppingItems||[]).map(item=>item?.category==="Household"?{...item,category:"Other"}:item);
      return loaded;
    }
    return migrateLegacy()||structuredClone(DEFAULT_DATA);
  }catch{
    return structuredClone(DEFAULT_DATA);
  }
}


function undoForcedTileArtwork1772(){
  data.homeImages=data.homeImages||{};
  const forced=new Set([
    "./icons/home-house-clean.png?v=1770",
    "./icons/home-house-clean.png?v=1771",
    "./icons/home-aquarium-clean.png?v=1770",
    "./icons/home-aquarium-clean.png?v=1771"
  ]);
  let changed=false;
  for(const key of ["house","pets"]){
    if(forced.has(data.homeImages[key]||"")){
      data.homeImages[key]="";
      changed=true;
    }
  }
  if(data.tileArtworkCleanup1770||data.tileArtworkCleanup1771){
    delete data.tileArtworkCleanup1770;
    delete data.tileArtworkCleanup1771;
    changed=true;
  }
  return changed;
}

function moduleIcon(key,fallback="✨"){
  return String(data?.moduleIcons?.[key]||data?.homeIcons?.[key]||fallback);
}
function moduleVisual(key,fallback="✨",className="module-tile-image"){
  const src=data?.homeImages?.[key];
  return src?`<img class="${className}" src="${src}" alt="">`:esc(moduleIcon(key,fallback));
}

let data=loadData();
if(undoForcedTileArtwork1772()){ saveData(); }
if(!data.v9CollapseDefaultsApplied){
  data.journalControlsCollapsed=true;
  data.houseControlsCollapsed=true;
  data.v9CollapseDefaultsApplied=true;
  localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}
function saveData(){
  try{
    // Every uploaded picture is stored in IndexedDB, never in the main JSON payload.
    const safeHomeImages=Object.fromEntries(Object.entries(data.homeImages||{}).map(([key,value])=>[key,/^data:image\//.test(value||"")?"":value||""]));
    const safeModuleBanners=Object.fromEntries(Object.entries(data.moduleBanners||{}).map(([key,value])=>[key,/^data:image\//.test(value||"")?"":value||""]));
    const serializable={...data,homeImages:safeHomeImages,moduleBanners:safeModuleBanners,plants:(data.plants||[]).map(plant=>({...plant,photo:/^data:image\//.test(plant.photo||"")?"":plant.photo||""})),aquariums:(data.aquariums||[]).map(tank=>({...tank,photo:/^data:image\//.test(tank.photo||"")?"":tank.photo||""})),medications:(data.medications||[]).map(med=>({...med,photo:/^data:image\//.test(med.photo||"")?"":med.photo||""}))};
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
