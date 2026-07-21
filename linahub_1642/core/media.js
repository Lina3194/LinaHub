/* LinaHub durable media storage.
   Photos live in IndexedDB rather than localStorage, which is too small for images. */
const LINA_MEDIA_DB="linahub-media";
const LINA_MEDIA_STORE="images";
const linaMediaCache=new Map();

function openLinaMediaDb(){
  return new Promise((resolve,reject)=>{
    if(!("indexedDB" in window)){reject(new Error("IndexedDB unavailable"));return;}
    const request=indexedDB.open(LINA_MEDIA_DB,1);
    request.onupgradeneeded=()=>{
      const db=request.result;
      if(!db.objectStoreNames.contains(LINA_MEDIA_STORE)) db.createObjectStore(LINA_MEDIA_STORE);
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||new Error("Could not open media storage"));
  });
}

async function putLinaImage(key,value){
  const db=await openLinaMediaDb();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction(LINA_MEDIA_STORE,"readwrite");
    tx.objectStore(LINA_MEDIA_STORE).put(value,key);
    tx.oncomplete=resolve;
    tx.onerror=()=>reject(tx.error||new Error("Could not save image"));
  });
  linaMediaCache.set(key,value);
  db.close();
}

async function getLinaImage(key){
  if(!key) return "";
  if(linaMediaCache.has(key)) return linaMediaCache.get(key)||"";
  const db=await openLinaMediaDb();
  const value=await new Promise((resolve,reject)=>{
    const tx=db.transaction(LINA_MEDIA_STORE,"readonly");
    const request=tx.objectStore(LINA_MEDIA_STORE).get(key);
    request.onsuccess=()=>resolve(request.result||"");
    request.onerror=()=>reject(request.error||new Error("Could not read image"));
  });
  db.close();
  linaMediaCache.set(key,value||"");
  return value||"";
}

function plantPhotoKey(plant){return plant?.photoKey||`plant:${plant?.id||"unknown"}`;}
function plantPhotoSrc(plant){
  if(plant?.photo && /^data:image\//.test(plant.photo)) return plant.photo;
  return linaMediaCache.get(plantPhotoKey(plant))||"";
}

function imageFileToCompressedDataUrl(file,maxDimension=1400,quality=.84){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(reader.error||new Error("Could not read photo"));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error("Could not open photo"));
      img.onload=()=>{
        const scale=Math.min(1,maxDimension/Math.max(img.naturalWidth||1,img.naturalHeight||1));
        const width=Math.max(1,Math.round(img.naturalWidth*scale));
        const height=Math.max(1,Math.round(img.naturalHeight*scale));
        const canvas=document.createElement("canvas");
        canvas.width=width; canvas.height=height;
        canvas.getContext("2d").drawImage(img,0,0,width,height);
        resolve(canvas.toDataURL("image/jpeg",quality));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function hydrateLinaPlantPhotos(){
  let changed=false;
  for(const plant of data.plants||[]){
    plant.photoKey=plantPhotoKey(plant);
    if(plant.photo && /^data:image\//.test(plant.photo)){
      try{
        await putLinaImage(plant.photoKey,plant.photo);
        plant.photo="";
        changed=true;
      }catch(error){console.warn("Photo migration failed",error);}
    }else{
      try{await getLinaImage(plant.photoKey);}catch(error){console.warn("Photo load failed",error);}
    }
  }
  if(changed) saveData();
  if((route==="plants"||route==="plant") && document.querySelector("#app")) render();
}

window.addEventListener("DOMContentLoaded",()=>{setTimeout(hydrateLinaPlantPhotos,0);});
