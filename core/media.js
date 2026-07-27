/* LinaHub 17.4.5 — one reliable image pipeline for all uploads. */
(function(){
  "use strict";
  const DB_NAME="linahub-media";
  const STORE_NAME="images";
  const DB_VERSION=1;
  const IMAGE_EXTENSIONS=/\.(jpe?g|png|webp|heic|heif)$/i;

  function friendlyError(error){
    const message=String(error?.message||error||"");
    if(/decode|open|format|heic|heif/i.test(message)) return "This image format is not supported on this device. Please choose a JPG, PNG or WEBP image.";
    if(/quota|storage|space/i.test(message)) return "The image could not be saved because browser storage is full. Remove an older image and try again.";
    if(/indexeddb|database|transaction|save|verify/i.test(message)) return "The image could not be saved. Please check that private browsing is off, then try again.";
    return "That image could not be added. Please try a different image.";
  }

  function validateFile(file){
    if(!file) throw new Error("No image selected");
    const type=String(file.type||"").toLowerCase();
    if(type && !type.startsWith("image/")) throw new Error("The selected file is not an image");
    if(!type && !IMAGE_EXTENSIONS.test(file.name||"")) throw new Error("The selected file is not a supported image");
  }

  function openDb(){
    return new Promise((resolve,reject)=>{
      if(!("indexedDB" in window)){reject(new Error("IndexedDB unavailable"));return;}
      const request=indexedDB.open(DB_NAME,DB_VERSION);
      request.onupgradeneeded=()=>{
        const db=request.result;
        if(!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
      };
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error("Could not open image database"));
      request.onblocked=()=>reject(new Error("Image database is blocked"));
    });
  }

  async function put(key,value){
    const db=await openDb();
    try{
      await new Promise((resolve,reject)=>{
        const tx=db.transaction(STORE_NAME,"readwrite");
        const request=tx.objectStore(STORE_NAME).put(value,key);
        request.onerror=()=>reject(request.error||new Error("Could not save image"));
        tx.oncomplete=resolve;
        tx.onerror=()=>reject(tx.error||new Error("Image save transaction failed"));
        tx.onabort=()=>reject(tx.error||new Error("Image save transaction was aborted"));
      });
    }finally{db.close();}
    const verified=await get(key);
    if(!verified || verified!==value) throw new Error("Saved image could not be verified");
    return true;
  }

  async function get(key){
    const db=await openDb();
    try{
      return await new Promise((resolve,reject)=>{
        const tx=db.transaction(STORE_NAME,"readonly");
        const request=tx.objectStore(STORE_NAME).get(key);
        request.onsuccess=()=>resolve(request.result||"");
        request.onerror=()=>reject(request.error||new Error("Could not load image"));
        tx.onerror=()=>reject(tx.error||new Error("Image load transaction failed"));
      });
    }finally{db.close();}
  }

  async function remove(key){
    const db=await openDb();
    try{
      await new Promise((resolve,reject)=>{
        const tx=db.transaction(STORE_NAME,"readwrite");
        const request=tx.objectStore(STORE_NAME).delete(key);
        request.onerror=()=>reject(request.error||new Error("Could not remove image"));
        tx.oncomplete=resolve;
        tx.onerror=()=>reject(tx.error||new Error("Image remove transaction failed"));
        tx.onabort=()=>reject(tx.error||new Error("Image remove transaction was aborted"));
      });
    }finally{db.close();}
    return true;
  }

  function loadWithImage(file){
    return new Promise((resolve,reject)=>{
      const url=URL.createObjectURL(file);
      const img=new Image();
      img.onload=()=>resolve({source:img,width:img.naturalWidth,height:img.naturalHeight,cleanup:()=>URL.revokeObjectURL(url)});
      img.onerror=()=>{URL.revokeObjectURL(url);reject(new Error("Could not decode image format"));};
      img.src=url;
    });
  }

  async function decode(file){
    if("createImageBitmap" in window){
      try{
        const bitmap=await createImageBitmap(file,{imageOrientation:"from-image"});
        return {source:bitmap,width:bitmap.width,height:bitmap.height,cleanup:()=>bitmap.close?.()};
      }catch{}
    }
    return loadWithImage(file);
  }

  function canvasToDataUrl(canvas,type,quality){
    return new Promise((resolve,reject)=>{
      if(canvas.toBlob){
        canvas.toBlob(blob=>{
          if(!blob){reject(new Error("Could not compress image"));return;}
          const reader=new FileReader();
          reader.onerror=()=>reject(new Error("Could not finish image conversion"));
          reader.onload=()=>resolve(reader.result);
          reader.readAsDataURL(blob);
        },type,quality);
      }else{
        try{resolve(canvas.toDataURL(type,quality));}catch(error){reject(error);}
      }
    });
  }

  function supportsWebP(){
    try{return document.createElement("canvas").toDataURL("image/webp").startsWith("data:image/webp");}
    catch{return false;}
  }

  async function process(file,options={}){
    validateFile(file);
    const decoded=await decode(file);
    try{
      if(!decoded.width||!decoded.height) throw new Error("Image has no usable dimensions");
      const targetWidth=Math.max(1,Math.round(options.width||420));
      const targetHeight=Math.max(1,Math.round(options.height||targetWidth));
      const fit=options.fit||"cover";
      const allowUpscale=options.allowUpscale!==false;
      let canvasWidth=targetWidth,canvasHeight=targetHeight,drawWidth,drawHeight,drawX=0,drawY=0;

      if(fit==="contain"){
        const scale=Math.min(allowUpscale?Infinity:1,targetWidth/decoded.width,targetHeight/decoded.height);
        canvasWidth=Math.max(1,Math.round(decoded.width*scale));
        canvasHeight=Math.max(1,Math.round(decoded.height*scale));
        drawWidth=canvasWidth;drawHeight=canvasHeight;
      }else{
        const scale=Math.max(targetWidth/decoded.width,targetHeight/decoded.height);
        const finalScale=allowUpscale?scale:Math.min(1,scale);
        drawWidth=decoded.width*finalScale;drawHeight=decoded.height*finalScale;
        drawX=(targetWidth-drawWidth)/2;drawY=(targetHeight-drawHeight)/2;
      }

      const canvas=document.createElement("canvas");
      canvas.width=canvasWidth;canvas.height=canvasHeight;
      const ctx=canvas.getContext("2d",{alpha:false});
      if(!ctx) throw new Error("Image canvas is unavailable");
      ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality="high";
      ctx.fillStyle="#ffffff";ctx.fillRect(0,0,canvas.width,canvas.height);
      ctx.drawImage(decoded.source,drawX,drawY,drawWidth,drawHeight);
      const outputType=supportsWebP()?"image/webp":"image/jpeg";
      return await canvasToDataUrl(canvas,outputType,Number(options.quality??0.82));
    }finally{decoded.cleanup?.();}
  }

  async function upload({file,key,width,height,fit="cover",quality=0.82,allowUpscale=true}){
    if(!key) throw new Error("Image storage key is missing");
    const value=await process(file,{width,height,fit,quality,allowUpscale});
    await put(key,value);
    return value;
  }

  window.LinaImage={process,upload,save:put,load:get,remove,friendlyError,validateFile};
})();
