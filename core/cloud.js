/* LinaHub v12 Cloud Edition — Firebase Auth + split Firestore module sync */
const LINAHUB_FIREBASE_CONFIG={
  apiKey:"AIzaSyAnMmtT7RGTMpl8CZbpAX3rFWH9HjjZZqI",
  authDomain:"linahub.firebaseapp.com",
  projectId:"linahub",
  storageBucket:"linahub.firebasestorage.app",
  messagingSenderId:"846598519648",
  appId:"1:846598519648:web:0f5001b84591a570613c05"
};

const CLOUD_MODULES={
  journal:["checkins","checkinLayout","checkinFilter","journalControlsCollapsed","journalTab","journalSelectedDate","journalTrendPeriod","checkinHidden","checkinEditMode","dayCheckins","journalTimeline"],
  plants:["plants"],
  pokemon:["pokemonFriends","pokemonSeededVersion"],
  aquariums:["aquariums"],
  house:["houseControlsCollapsed","houseOpenRooms","houseRooms","houseTasks"],
  medication:["medications","medicationLog","medicationHistory","medicationHistoryMigrated","medicationView"],
  period:["periodEntries","periodCycles","periodOptions","periodSelectedDate","periodCalendarMonth","periodEditOptions","periodTab","periodOpenYears"],
  budget:["bills","budgetEntries","savingsEntries"],
  health:["weightEntries","measurements","healthPromptLog","sleepEntries","healthSleepEntries"],
  todo:["personalTasks"],
  settings:["theme","colorTheme","homeIcons","homeImages","homeLayout","treasures","favoriteTreasures","moduleBanners","v9CollapseDefaultsApplied"],
  misc:["version"]
};

const CLOUD_STATE={
  user:null,status:"signed-out",ready:false,applyingRemote:false,
  timers:new Map(),unsubscribers:[],lastSnapshot:JSON.stringify(data),
  deviceId:localStorage.getItem("linahub-device-id")||((crypto.randomUUID&&crypto.randomUUID())||`device-${Date.now()}`)
};
localStorage.setItem("linahub-device-id",CLOUD_STATE.deviceId);


let cloudRenderTimer=null;
function quietCloudRender(){
  clearTimeout(cloudRenderTimer);
  cloudRenderTimer=setTimeout(()=>{
    suppressNextPageAnimation=true;
    render();
  },80);
}

function cloudStatusText(){
  return ({"signed-out":"Not signed in","connecting":"Connecting…","syncing":"Syncing…","synced":"Synced","offline":"Offline","error":"Sync error"})[CLOUD_STATE.status]||CLOUD_STATE.status;
}
function setCloudStatus(status){
  CLOUD_STATE.status=status;
  document.querySelectorAll("[data-cloud-status]").forEach(el=>{
    el.textContent=cloudStatusText();el.dataset.state=status;
  });
}
function cloudUser(){return CLOUD_STATE.user}
function modulePayload(name){
  const out={};
  (CLOUD_MODULES[name]||[]).forEach(key=>{out[key]=structuredClone(data[key])});
  return out;
}
function moduleChanged(name,before,after){
  return (CLOUD_MODULES[name]||[]).some(key=>JSON.stringify(before?.[key])!==JSON.stringify(after?.[key]));
}
function applyModule(payload){
  if(!payload||typeof payload!=="object") return;
  Object.keys(payload).forEach(key=>{
    if(key==="updatedAt"||key==="deviceId"||key==="schemaVersion") return;
    if(key==="houseTasks"&&Array.isArray(payload.houseTasks)){
      const localById=new Map((data.houseTasks||[]).map(task=>[String(task.id),task]));
      data.houseTasks=payload.houseTasks.map(remoteTask=>{
        const localTask=localById.get(String(remoteTask.id));
        if(!localTask) return remoteTask;
        const localStamp=Date.parse(localTask.completionUpdatedAt||"")||0;
        const remoteStamp=Date.parse(remoteTask.completionUpdatedAt||"")||0;
        // Never let a slower/stale device put a job back into Today after it was
        // just completed on this device. Other task edits still come from cloud.
        if(localStamp>remoteStamp){
          return {...remoteTask,
            completionHistory:Array.isArray(localTask.completionHistory)?localTask.completionHistory:[],
            lastCompleted:localTask.lastCompleted||"",
            completionUpdatedAt:localTask.completionUpdatedAt||""
          };
        }
        return remoteTask;
      });
      return;
    }
    data[key]=payload[key];
  });
}
function localSaveOnly(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data))}

const originalSaveData=saveData;
saveData=function(){
  const before=JSON.parse(CLOUD_STATE.lastSnapshot||"{}");
  originalSaveData();
  CLOUD_STATE.lastSnapshot=JSON.stringify(data);
  if(CLOUD_STATE.applyingRemote||!CLOUD_STATE.user||!CLOUD_STATE.ready) return;
  Object.keys(CLOUD_MODULES).forEach(name=>{if(moduleChanged(name,before,data))queueCloudModule(name)});
};

function queueCloudModule(name){
  clearTimeout(CLOUD_STATE.timers.get(name));
  setCloudStatus(navigator.onLine?"syncing":"offline");
  const delay=name==="house"?80:900;
  CLOUD_STATE.timers.set(name,setTimeout(()=>pushCloudModule(name),delay));
}
async function pushCloudModule(name){
  if(!CLOUD_STATE.user||!navigator.onLine) return setCloudStatus("offline");
  try{
    const ref=firebase.firestore().doc(`users/${CLOUD_STATE.user.uid}/modules/${name}`);
    await ref.set({...modulePayload(name),schemaVersion:12,deviceId:CLOUD_STATE.deviceId,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:false});
    setCloudStatus("synced");
  }catch(error){console.error("LinaHub cloud upload",error);setCloudStatus("error")}
}
async function uploadAllModules(){
  setCloudStatus("syncing");
  for(const name of Object.keys(CLOUD_MODULES)) await pushCloudModule(name);
  const meta=firebase.firestore().doc(`users/${CLOUD_STATE.user.uid}/meta/profile`);
  await meta.set({schemaVersion:12,migratedAt:firebase.firestore.FieldValue.serverTimestamp(),deviceId:CLOUD_STATE.deviceId},{merge:true});
  localStorage.setItem(`linahub-cloud-migrated-${CLOUD_STATE.user.uid}`,"1");
  setCloudStatus("synced");
}
async function downloadAllModules(){
  setCloudStatus("syncing");
  const snap=await firebase.firestore().collection(`users/${CLOUD_STATE.user.uid}/modules`).get();
  const found=new Set();
  CLOUD_STATE.applyingRemote=true;
  snap.forEach(doc=>{found.add(doc.id);applyModule(doc.data())});
  localSaveOnly();
  CLOUD_STATE.lastSnapshot=JSON.stringify(data);
  CLOUD_STATE.applyingRemote=false;
  // Older LinaHub builds did not create cloud documents for every module.
  // Preserve this device's existing local data by creating only missing documents.
  for(const name of Object.keys(CLOUD_MODULES)){
    if(!found.has(name)) await pushCloudModule(name);
  }
  localStorage.setItem(`linahub-cloud-migrated-${CLOUD_STATE.user.uid}`,"1");
  setCloudStatus("synced");
  quietCloudRender();
}
function stopCloudListeners(){CLOUD_STATE.unsubscribers.forEach(fn=>fn());CLOUD_STATE.unsubscribers=[]}
function startCloudListeners(){
  stopCloudListeners();
  Object.keys(CLOUD_MODULES).forEach(name=>{
    const unsub=firebase.firestore().doc(`users/${CLOUD_STATE.user.uid}/modules/${name}`).onSnapshot({includeMetadataChanges:true},snap=>{
      if(!snap.exists||snap.metadata.hasPendingWrites) return;
      const remote=snap.data();
      if(remote.deviceId===CLOUD_STATE.deviceId) return setCloudStatus("synced");
      CLOUD_STATE.applyingRemote=true;
      applyModule(remote);localSaveOnly();CLOUD_STATE.lastSnapshot=JSON.stringify(data);
      CLOUD_STATE.applyingRemote=false;
      setCloudStatus(snap.metadata.fromCache&&!navigator.onLine?"offline":"synced");
      quietCloudRender();
    },error=>{console.error("LinaHub listener",error);setCloudStatus("error")});
    CLOUD_STATE.unsubscribers.push(unsub);
  });
}
async function firstCloudSetup(){
  const meta=await firebase.firestore().doc(`users/${CLOUD_STATE.user.uid}/meta/profile`).get();
  const migrated=localStorage.getItem(`linahub-cloud-migrated-${CLOUD_STATE.user.uid}`)==="1";
  if(!meta.exists){
    await uploadAllModules();
  }else if(!migrated){
    const useLocal=confirm("LinaHub already has cloud data.\n\nPress OK to upload THIS device's data and replace the cloud copy.\nPress Cancel to download the existing cloud data to this device.");
    if(useLocal) await uploadAllModules(); else await downloadAllModules();
  }else{
    await downloadAllModules();
  }
  CLOUD_STATE.ready=true;
  startCloudListeners();
}
async function linaSignIn(){
  try{
    setCloudStatus("connecting");
    const provider=new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({prompt:"select_account"});
    await firebase.auth().signInWithPopup(provider);
  }catch(error){
    if(error.code==="auth/popup-blocked"||error.code==="auth/cancelled-popup-request"){
      await firebase.auth().signInWithRedirect(new firebase.auth.GoogleAuthProvider());
    }else{console.error(error);setCloudStatus("error");toast("Google sign-in did not complete")}
  }
}
async function linaSignOut(){await firebase.auth().signOut()}
async function forceCloudUpload(){if(!CLOUD_STATE.user)return toast("Sign in first");CLOUD_STATE.timers.forEach(timer=>clearTimeout(timer));CLOUD_STATE.timers.clear();await uploadAllModules();toast("This device is now saved to LinaHub Cloud ☁️")}
async function forceCloudDownload(){if(!CLOUD_STATE.user)return toast("Sign in first");if(!confirm("Replace this device's LinaHub data with the cloud copy?"))return;await downloadAllModules();toast("Cloud data downloaded ☁️")}

function initLinaCloud(){
  try{
    firebase.initializeApp(LINAHUB_FIREBASE_CONFIG);
    firebase.firestore().enablePersistence({synchronizeTabs:true}).catch(()=>{});
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL);
    firebase.auth().onAuthStateChanged(async user=>{
      CLOUD_STATE.user=user||null;CLOUD_STATE.ready=false;
      if(!user){stopCloudListeners();setCloudStatus("signed-out");quietCloudRender();return}
      setCloudStatus(navigator.onLine?"connecting":"offline");
      try{await firstCloudSetup()}catch(error){console.error(error);setCloudStatus(navigator.onLine?"error":"offline")}
      quietCloudRender();
    });
  }catch(error){console.error("Firebase startup",error);setCloudStatus("error")}
}
window.addEventListener("online",async()=>{if(!CLOUD_STATE.user)return;setCloudStatus("syncing");try{await downloadAllModules();startCloudListeners()}catch(error){console.error("LinaHub reconnect sync",error);setCloudStatus("error")}});
window.addEventListener("offline",()=>setCloudStatus("offline"));
initLinaCloud();
