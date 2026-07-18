
const STORAGE_KEY="linahub-data";
const LEGACY_KEYS=["linahub-v4","linahub-v4-1","linahub-v4-2","linahub-v4-3"];

const DEFAULT_DATA={
  version:5,
  theme:"light",
  checkins:{},
  checkinLayout:["energy","mood","pain","spoons","water","priorities","selfcare","medication","plan","sleep","justtoday","supports"],
  checkinFilter:"all",
  checkinHidden:[],
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
