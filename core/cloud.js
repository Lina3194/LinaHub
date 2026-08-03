/* LinaHub v16.86 Cloud Edition — complete daily and hourly check-in sync */
const LINAHUB_FIREBASE_CONFIG={
  apiKey:"AIzaSyAnMmtT7RGTMpl8CZbpAX3rFWH9HjjZZqI",
  authDomain:"linahub.firebaseapp.com",
  projectId:"linahub",
  storageBucket:"linahub.firebasestorage.app",
  messagingSenderId:"846598519648",
  appId:"1:846598519648:web:0f5001b84591a570613c05"
};

const CLOUD_MODULES={
  journal:["checkins","morningCheckins","dailyCheckinCompleted","dailyCheckinRemindAt","checkinLayout","checkinFilter","journalControlsCollapsed","journalTab","journalSelectedDate","journalTrendPeriod","checkinHidden","checkinEditMode","dayCheckins","journalTimeline"],
  plants:["plants"],
  pokemon:["pokemonFriends","pokemonSeededVersion"],
  aquariums:["aquariums"],
  house:["houseControlsCollapsed","houseOpenRooms","houseRooms","houseTasks"],
  medication:["medications","medicationLog","medicationHistory","medicationHistoryMigrated","medicationView","medicationStockAudit","medicationStockReconciliationVersion"],
  period:["periodEntries","periodCycles","periodOptions","periodSelectedDate","periodCalendarMonth","periodEditOptions","periodTab","periodOpenYears"],
  budget:["bills","budgetEntries","savingsEntries"],
  health:["weightEntries","measurements","healthPromptLog","sleepEntries","healthSleepEntries"],
  todo:["personalTasks"],
  settings:["theme","colorTheme","homeIcons","homeImages","homeLayout","treasures","favoriteTreasures","moduleBanners","removedMedia","v9CollapseDefaultsApplied"],
  misc:["version"]
};

const CLOUD_STATE={
  user:null,status:"signed-out",ready:false,applyingRemote:false,
  timers:new Map(),unsubscribers:[],lastSnapshot:JSON.stringify(data),
  deviceId:localStorage.getItem("linahub-device-id")||((crypto.randomUUID&&crypto.randomUUID())||`device-${Date.now()}`)
};
localStorage.setItem("linahub-device-id",CLOUD_STATE.deviceId);

const CLOUD_IMAGE_PREFIX="image--";
const CLOUD_RAW_UPLOAD=LinaImage.upload.bind(LinaImage);
const CLOUD_RAW_REMOVE=LinaImage.remove.bind(LinaImage);

function cloudImageDocId(storageKey){return `${CLOUD_IMAGE_PREFIX}${encodeURIComponent(storageKey)}`}
function cloudImageKeyFromDocId(docId){
  if(!String(docId||"").startsWith(CLOUD_IMAGE_PREFIX)) return "";
  try{return decodeURIComponent(String(docId).slice(CLOUD_IMAGE_PREFIX.length))}catch{return ""}
}
function isInlineImage(value){return /^data:image\//.test(String(value||""))}

function cloudImagesForModule(name){
  const images=new Map();
  const add=(key,value)=>{if(key&&isInlineImage(value))images.set(String(key),value)};
  if(name==="settings"){
    Object.entries(data.homeImages||{}).forEach(([key,value])=>add(`tab:${key}`,value));
    Object.entries(data.moduleBanners||{}).forEach(([key,value])=>add(`banner:${key}`,value));
  }
  if(name==="plants") (data.plants||[]).forEach(item=>add(item.photoKey||`plant:${item.id}`,item.photo));
  if(name==="aquariums") (data.aquariums||[]).forEach(item=>add(item.photoKey||`aquarium:${item.id}`,item.photo));
  if(name==="medication") (data.medications||[]).forEach(item=>add(item.photoKey||`medication:${item.id}`,item.photo));
  return images;
}

function cloudSafeModulePayload(name){
  const payload=modulePayload(name);
  // Images are synced as separate Firestore documents. Keeping them out of the
  // normal module documents prevents the 1 MiB Firestore document limit from
  // making a phone silently miss one banner or photo.
  if(name==="settings"){
    delete payload.homeImages;
    delete payload.moduleBanners;
  }
  if(name==="plants"&&Array.isArray(payload.plants)) payload.plants=payload.plants.map(item=>({...item,photo:""}));
  if(name==="aquariums"&&Array.isArray(payload.aquariums)) payload.aquariums=payload.aquariums.map(item=>({...item,photo:""}));
  if(name==="medication"&&Array.isArray(payload.medications)) payload.medications=payload.medications.map(item=>({...item,photo:""}));
  return payload;
}

function putCloudImageIntoData(storageKey,value){
  if(data.removedMedia?.[storageKey]) return;
  if(storageKey.startsWith("tab:")){
    data.homeImages=data.homeImages||{};
    data.homeImages[storageKey.slice(4)]=value;
    return;
  }
  if(storageKey.startsWith("banner:")){
    data.moduleBanners=data.moduleBanners||{};
    data.moduleBanners[storageKey.slice(7)]=value;
    return;
  }
  const collections=[
    ["plant:",data.plants||[]],
    ["aquarium:",data.aquariums||[]],
    ["medication:",data.medications||[]]
  ];
  for(const [prefix,items] of collections){
    if(!storageKey.startsWith(prefix)) continue;
    const item=items.find(entry=>(entry.photoKey||`${prefix}${entry.id}`)===storageKey);
    if(item){item.photoKey=storageKey;item.photo=value}
    return;
  }
}

function removeCloudImageFromData(storageKey){
  if(storageKey.startsWith("tab:")){delete data.homeImages?.[storageKey.slice(4)];return}
  if(storageKey.startsWith("banner:")){delete data.moduleBanners?.[storageKey.slice(7)];return}
  const collections=[
    ["plant:",data.plants||[]],
    ["aquarium:",data.aquariums||[]],
    ["medication:",data.medications||[]]
  ];
  for(const [prefix,items] of collections){
    if(!storageKey.startsWith(prefix)) continue;
    const item=items.find(entry=>(entry.photoKey||`${prefix}${entry.id}`)===storageKey);
    if(item)item.photo="";
    return;
  }
}

async function persistCloudImage(storageKey,value){
  if(!storageKey||!isInlineImage(value)) return false;
  await LinaImage.save(storageKey,value);
  putCloudImageIntoData(storageKey,value);
  return true;
}

async function removeCloudImageLocally(storageKey){
  if(!storageKey)return;
  await CLOUD_RAW_REMOVE(storageKey).catch(()=>{});
  removeCloudImageFromData(storageKey);
}

async function pushCloudImage(storageKey,value){
  if(!CLOUD_STATE.user||!navigator.onLine||!isInlineImage(value))return;
  const ref=firebase.firestore().doc(`users/${CLOUD_STATE.user.uid}/modules/${cloudImageDocId(storageKey)}`);
  await ref.set({storageKey,value,schemaVersion:1750,deviceId:CLOUD_STATE.deviceId,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:false});
}

async function deleteCloudImage(storageKey){
  if(!CLOUD_STATE.user||!navigator.onLine||!storageKey)return;
  await firebase.firestore().doc(`users/${CLOUD_STATE.user.uid}/modules/${cloudImageDocId(storageKey)}`).delete();
}

async function pushCloudImagesForModule(name){
  for(const [storageKey,value] of cloudImagesForModule(name)) await pushCloudImage(storageKey,value);
}

async function pushAllCloudImages(){
  for(const name of ["settings","plants","aquariums","medication"]) await pushCloudImagesForModule(name);
}

// Upload and removal remain one universal image pipeline, but a signed-in
// device also mirrors the changed image immediately for the other devices.
LinaImage.upload=async options=>{
  const value=await CLOUD_RAW_UPLOAD(options);
  if(CLOUD_STATE.user&&CLOUD_STATE.ready&&navigator.onLine){
    pushCloudImage(options?.key,value).catch(error=>console.error("Cloud image upload",error));
  }
  return value;
};
LinaImage.remove=async storageKey=>{
  const result=await CLOUD_RAW_REMOVE(storageKey);
  if(CLOUD_STATE.user&&CLOUD_STATE.ready&&navigator.onLine){
    deleteCloudImage(storageKey).catch(error=>console.error("Cloud image removal",error));
  }
  return result;
};


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
function localSaveOnly(){return originalSaveData()}

const originalSaveData=saveData;
saveData=function(){
  const before=JSON.parse(CLOUD_STATE.lastSnapshot||"{}");
  const saved=originalSaveData();
  CLOUD_STATE.lastSnapshot=JSON.stringify(data);
  if(CLOUD_STATE.applyingRemote||!CLOUD_STATE.user||!CLOUD_STATE.ready) return saved;
  Object.keys(CLOUD_MODULES).forEach(name=>{if(moduleChanged(name,before,data))queueCloudModule(name)});
  return saved;
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
    await pushCloudImagesForModule(name);
    const ref=firebase.firestore().doc(`users/${CLOUD_STATE.user.uid}/modules/${name}`);
    await ref.set({...cloudSafeModulePayload(name),schemaVersion:1750,deviceId:CLOUD_STATE.deviceId,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:false});
    setCloudStatus("synced");
  }catch(error){console.error("LinaHub cloud upload",error);setCloudStatus("error")}
}
async function uploadAllModules(){
  setCloudStatus("syncing");
  for(const name of Object.keys(CLOUD_MODULES)) await pushCloudModule(name);
  const meta=firebase.firestore().doc(`users/${CLOUD_STATE.user.uid}/meta/profile`);
  await meta.set({schemaVersion:1750,migratedAt:firebase.firestore.FieldValue.serverTimestamp(),deviceId:CLOUD_STATE.deviceId},{merge:true});
  localStorage.setItem(`linahub-cloud-migrated-${CLOUD_STATE.user.uid}`,"1");
  setCloudStatus("synced");
}
async function downloadAllModules(){
  setCloudStatus("syncing");
  let snap;
  try{
    snap=await firebase.firestore().collection(`users/${CLOUD_STATE.user.uid}/modules`).get({source:"server"});
  }catch(error){
    console.error("LinaHub server download failed",error);
    throw new Error("Could not reach Firebase. Check the internet connection and try again.");
  }
  const found=new Set(),imageDocs=[];
  CLOUD_STATE.applyingRemote=true;
  snap.forEach(doc=>{
    if(String(doc.id).startsWith(CLOUD_IMAGE_PREFIX)){imageDocs.push(doc);return}
    found.add(doc.id);applyModule(doc.data());
  });
  // Restore this device's already-saved images after image-free module payloads,
  // then apply any newer per-image cloud documents.
  try{await hydrateLinaMedia()}catch(error){console.error("Could not restore local images",error)}
  for(const doc of imageDocs){
    const remote=doc.data()||{};
    const storageKey=remote.storageKey||cloudImageKeyFromDocId(doc.id);
    try{await persistCloudImage(storageKey,remote.value)}catch(error){console.error("Could not persist cloud image",storageKey,error)}
  }
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
    const unsub=firebase.firestore().doc(`users/${CLOUD_STATE.user.uid}/modules/${name}`).onSnapshot({includeMetadataChanges:true},async snap=>{
      if(!snap.exists||snap.metadata.hasPendingWrites) return;
      const remote=snap.data();
      if(remote.deviceId===CLOUD_STATE.deviceId) return setCloudStatus("synced");
      CLOUD_STATE.applyingRemote=true;
      try{
        applyModule(remote);
        // Cloud images are data URLs in memory. Mirror them to IndexedDB on this
        // device so banners and photos survive refreshes and PWA restarts.
        await hydrateLinaMedia();
        localSaveOnly();
        CLOUD_STATE.lastSnapshot=JSON.stringify(data);
      }catch(error){
        console.error("Could not apply cloud update",error);
        setCloudStatus("error");
        return;
      }finally{CLOUD_STATE.applyingRemote=false}
      setCloudStatus(snap.metadata.fromCache&&!navigator.onLine?"offline":"synced");
      quietCloudRender();
    },error=>{console.error("LinaHub listener",error);setCloudStatus("error")});
    CLOUD_STATE.unsubscribers.push(unsub);
  });
  const imageUnsub=firebase.firestore().collection(`users/${CLOUD_STATE.user.uid}/modules`).onSnapshot({includeMetadataChanges:true},async snapshot=>{
    let changed=false;
    for(const change of snapshot.docChanges()){
      if(!String(change.doc.id).startsWith(CLOUD_IMAGE_PREFIX)) continue;
      if(change.doc.metadata.hasPendingWrites) continue;
      const remote=change.doc.data()||{};
      if(remote.deviceId===CLOUD_STATE.deviceId&&change.type!=="removed") continue;
      const storageKey=remote.storageKey||cloudImageKeyFromDocId(change.doc.id);
      try{
        if(change.type==="removed") await removeCloudImageLocally(storageKey);
        else await persistCloudImage(storageKey,remote.value);
        changed=true;
      }catch(error){console.error("Could not apply cloud image",storageKey,error)}
    }
    if(changed){localSaveOnly();CLOUD_STATE.lastSnapshot=JSON.stringify(data);quietCloudRender()}
  },error=>{console.error("LinaHub image listener",error)});
  CLOUD_STATE.unsubscribers.push(imageUnsub);
}
async function firstCloudSetup(){
  let meta;
  try{meta=await firebase.firestore().doc(`users/${CLOUD_STATE.user.uid}/meta/profile`).get({source:"server"})}
  catch(error){console.error("LinaHub cloud profile check",error);throw error}
  const migrated=localStorage.getItem(`linahub-cloud-migrated-${CLOUD_STATE.user.uid}`)==="1";
  if(!meta.exists){
    await uploadAllModules();
  }else if(!migrated){
    const useLocal=confirm("LinaHub already has cloud data.\n\nPress OK to upload THIS device's data and replace the cloud copy.\nPress Cancel to download the existing cloud data to this device.");
    if(useLocal) await uploadAllModules(); else await downloadAllModules();
  }else{
    await downloadAllModules();
  }
  try{await hydrateLinaMedia();document.dispatchEvent(new Event("linahub:cloud-images-ready"));await pushAllCloudImages()}catch(error){console.error("LinaHub image sync setup",error)}
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
async function forceCloudUpload(){
  if(!CLOUD_STATE.user)return toast("Sign in first");
  if(!navigator.onLine)return toast("This device is offline");
  CLOUD_STATE.timers.forEach(timer=>clearTimeout(timer));CLOUD_STATE.timers.clear();
  try{
    await uploadAllModules();
    await firebase.firestore().waitForPendingWrites();
    const count=Object.keys(CLOUD_MODULES).length;
    toast(`Uploaded ${count} sections to cloud ☁️`);
  }catch(error){console.error("Manual cloud upload",error);setCloudStatus("error");toast("Upload failed — Firebase was not reached")}
}
async function forceCloudDownload(){
  if(!CLOUD_STATE.user)return toast("Sign in first");
  if(!navigator.onLine)return toast("This device is offline");
  if(!confirm("Replace this device's LinaHub data with the cloud copy?"))return;
  try{await downloadAllModules();toast("Fresh Firebase data downloaded ☁️")}
  catch(error){console.error("Manual cloud download",error);setCloudStatus("error");toast("Download failed — Firebase was not reached")}
}

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
