
const STORAGE_KEY="linahub-data";
const LEGACY_KEYS=["linahub-v4","linahub-v4-1","linahub-v4-2","linahub-v4-3"];

const DEFAULT_DATA={
  version:5,
  theme:"light",
  checkins:{},
  checkinLayout:["energy","mood","pain","spoons","water","selfcare","sleep","supports"],
  checkinFilter:"all",
  journalControlsCollapsed:true,
  homeIcons:{
    journal:"📖",health:"⚖️",plants:"🌿",medication:"💊",
    pokemon:"🔴",pets:"🐠",house:"🏡",settings:"⚙️"
  },
  homeImages:{},
  moduleBanners:{},
  checkinHidden:[],
  pokemonFriends:structuredClone(POKEMON_FRIEND_SEED),
  pokemonSeededVersion:2,
  medications:[
    {id:"med-folic-acid",name:"Folic Acid",dose:"",time:"Morning",notes:""}
  ],
  medicationLog:{},
  weightEntries:[],
  measurements:[],
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
    done:task?.done===true
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
    lastWatered:p.lastWatered||"",history:Array.isArray(p.history)?p.history:[],photo:p.photo||""
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

let data=loadData();
if(!data.v9CollapseDefaultsApplied){
  data.journalControlsCollapsed=true;
  data.houseControlsCollapsed=true;
  data.v9CollapseDefaultsApplied=true;
  localStorage.setItem(STORAGE_KEY,JSON.stringify(data));
}
function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
function today(){return new Date().toISOString().slice(0,10)}
function niceDate(){return new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
function formatDate(value){return new Date(value+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(text){const el=document.querySelector("#toast");el.textContent=text;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1800)}
