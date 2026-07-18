
const STORAGE_KEY="linahub-data";
const LEGACY_KEYS=["linahub-v4","linahub-v4-1","linahub-v4-2","linahub-v4-3"];

const DEFAULT_DATA={
  version:5,
  theme:"light",
  checkins:{},
  checkinLayout:["energy","mood","pain","spoons","water","selfcare","sleep","supports"],
  checkinFilter:"all",
  journalControlsCollapsed:false,
  homeIcons:{
    journal:"📖",health:"⚖️",plants:"🌿",medication:"💊",
    pokemon:"🔴",pets:"🐠",house:"🏡",settings:"⚙️"
  },
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
  houseTasks:[
    {id:"living-vacuum",room:"Living Room / Kitchen",task:"Vacuum floors",frequency:"Weekly",done:false},
    {id:"living-dust",room:"Living Room / Kitchen",task:"Dust surfaces and bookcase",frequency:"Weekly",done:false},
    {id:"living-oven",room:"Living Room / Kitchen",task:"Clean oven",frequency:"Monthly",done:false},
    {id:"living-washing",room:"Living Room / Kitchen",task:"Laundry",frequency:"Daily / every other day",done:false},
    {id:"wc-clean",room:"Downstairs WC",task:"Clean toilet and sink",frequency:"Weekly",done:false},
    {id:"garden-tidy",room:"Garden / Patio",task:"Tidy patio",frequency:"Weekly",done:false},
    {id:"bedroom-bedding",room:"Main Bedroom",task:"Change bedding",frequency:"Weekly",done:false},
    {id:"bathroom-clean",room:"Main Bathroom",task:"Clean bathroom",frequency:"Weekly",done:false},
    {id:"study-dust",room:"Study / Guest Room",task:"Dust bookcase and desk",frequency:"Weekly",done:false},
    {id:"recycling",room:"Whole House",task:"Put recycling out",frequency:"Thursday",done:false}
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
function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}
function today(){return new Date().toISOString().slice(0,10)}
function niceDate(){return new Date().toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
function formatDate(value){return new Date(value+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}
function esc(v=""){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function toast(text){const el=document.querySelector("#toast");el.textContent=text;el.classList.add("show");setTimeout(()=>el.classList.remove("show"),1800)}
