
function SimplePage(title,emoji,text,active=""){
  return shell(`${head(title,text)}<section class="card empty"><div style="font-size:3rem">${emoji}</div><h2 style="margin-top:12px">${title}</h2><p>This module is ready to build next.</p></section>`,active);
}

function SettingsPage(){
  return shell(`${head("Settings","Appearance and your data")}
    <section class="card cloud-account-card">
      <div class="cloud-card-head">
        <div><h2>LinaHub Cloud</h2><p>Secure automatic sync between your laptop and phone.</p></div>
        <span class="cloud-status" data-cloud-status data-state="${CLOUD_STATE.status}">${cloudStatusText()}</span>
      </div>
      ${cloudUser()?`
        <div class="cloud-user">${cloudUser().photoURL?`<img src="${esc(cloudUser().photoURL)}" alt="">`:`<span>☁️</span>`}<div><strong>${esc(cloudUser().displayName||"Google account")}</strong><small>${esc(cloudUser().email||"")}</small></div></div>
        <div class="cloud-actions"><button class="primary" id="cloudUploadNow">Upload this device</button><button class="secondary" id="cloudDownloadNow">Download cloud copy</button><button class="mini danger" id="cloudSignOut">Sign out</button></div>
        <p class="settings-note">Changes are saved locally first, then each LinaHub module syncs separately. Offline changes upload when your connection returns.</p>`:`
        <button class="google-signin" id="cloudSignIn"><span>G</span> Sign in with Google</button>
        <p class="settings-note">Your current data stays on this device until you sign in. The first signed-in device safely creates your cloud copy.</p>`}
    </section>

    <section class="card">
      <h2>Appearance</h2>
      <button class="primary" id="themeToggle2">Switch to ${data.theme==="dark"?"light":"dark"} mode</button>
    </section>

    <section class="card">
      <h2>Home tab pictures & icons</h2>
      <p>Add your own picture to any home tab. When a picture is set, it replaces that tab’s emoji. Removing it brings the emoji back.</p>
      <div class="tab-art-grid">
        ${[
          ["journal","Daily Check-in"],["health","Weight & Measures"],["plants","Plants"],["medication","Medication"],
          ["pokemon","Pokémon GO"],["pets","Aquariums"],["house","House"],["period","Period Tracker"],["settings","Settings"]
        ].map(([key,label])=>`
          <article class="tab-art-setting">
            <div class="tab-art-preview">${data.homeImages?.[key]?`<img src="${data.homeImages[key]}" alt="">`:`<span>${esc(data.homeIcons?.[key]||"✨")}</span>`}</div>
            <div class="tab-art-copy"><strong>${label}</strong><label>Emoji<input class="field home-icon-input" data-icon-key="${key}" value="${esc(data.homeIcons?.[key]||"")}"></label></div>
            <div class="tab-art-actions">
              <button type="button" class="secondary compact-upload" data-pick-tab-image="${key}">Add image</button>
              <input type="file" accept="image/*" data-tab-image="${key}" hidden>
              ${data.homeImages?.[key]?`<button class="mini danger" data-remove-tab-image="${key}">Remove</button>`:""}
            </div>
          </article>`).join("")}
      </div>
      <button class="primary" id="saveHomeIcons" style="margin-top:12px">Save emojis</button>
      <p class="settings-note">Pictures are resized before being saved so LinaHub stays fast. They are included in your LinaHub backup.</p>
    </section>
    <section class="card">
      <h2>Module banner pictures</h2>
      <p>Add a wide banner to the top of each section. These are separate from the square Home tab pictures.</p>
      <div class="banner-art-grid">
        ${[
          ["journal","Daily Check-in"],["today","Today"],["todo","To-do"],["health","Weight & Measures"],
          ["plants","Plants"],["medication","Medication"],["pokemon","Pokémon GO"],["pets","Aquariums"],["house","House"],["period","Period Tracker"]
        ].map(([key,label])=>`
          <article class="banner-art-setting">
            <div class="banner-art-preview">${data.moduleBanners?.[key]?`<img src="${data.moduleBanners[key]}" alt="">`:`<span>${esc(data.homeIcons?.[key]||"✨")}</span>`}</div>
            <strong>${label}</strong>
            <div class="tab-art-actions">
              <button type="button" class="secondary compact-upload" data-pick-banner-image="${key}">Add banner</button>
              <input type="file" accept="image/*" data-banner-image="${key}" hidden>
              ${data.moduleBanners?.[key]?`<button class="mini danger" data-remove-banner-image="${key}">Remove</button>`:""}
            </div>
          </article>`).join("")}
      </div>
      <p class="settings-note">Banner images are resized before saving and are included in your backup.</p>
    </section>

    <section class="card">
      <h2>Backup</h2>
      <p>Your entries use the permanent storage key <strong>linahub-data</strong>.</p>
      <button class="primary" id="exportData">Export backup</button>
      <label class="secondary" style="display:block;margin-top:10px">Import backup<input id="importData" type="file" accept="application/json" hidden></label>
    </section>
  <p class="app-version">LinaHub v16.2 · Period Tracker</p>`,"settings");
}

function bindSimple(){
  document.querySelector("#cloudSignIn")?.addEventListener("click",linaSignIn);
  document.querySelector("#cloudSignOut")?.addEventListener("click",linaSignOut);
  document.querySelector("#cloudUploadNow")?.addEventListener("click",forceCloudUpload);
  document.querySelector("#cloudDownloadNow")?.addEventListener("click",forceCloudDownload);
  const t=document.querySelector("#themeToggle2");
  if(t) t.onclick=()=>{data.theme=data.theme==="dark"?"light":"dark";saveData();render()};

  document.querySelector("#saveHomeIcons")?.addEventListener("click",()=>{
    data.homeIcons=data.homeIcons||{};
    document.querySelectorAll("[data-icon-key]").forEach(input=>{
      data.homeIcons[input.dataset.iconKey]=input.value.trim()||data.homeIcons[input.dataset.iconKey];
    });
    saveData();toast("Home icons updated ✨");
  });


  function resizeTabImage(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onerror=()=>reject(new Error("Could not read image"));
      reader.onload=()=>{
        const img=new Image();
        img.onerror=()=>reject(new Error("Could not open image"));
        img.onload=()=>{
          const size=420;
          const scale=Math.max(size/img.width,size/img.height);
          const width=img.width*scale,height=img.height*scale;
          const canvas=document.createElement("canvas");
          canvas.width=size;canvas.height=size;
          const ctx=canvas.getContext("2d");
          ctx.drawImage(img,(size-width)/2,(size-height)/2,width,height);
          resolve(canvas.toDataURL("image/jpeg",0.78));
        };
        img.src=reader.result;
      };
      reader.readAsDataURL(file);
    });
  }


  document.querySelectorAll("[data-pick-tab-image]").forEach(button=>{
    button.onclick=()=>{
      const input=document.querySelector(`[data-tab-image="${button.dataset.pickTabImage}"]`);
      if(input){
        input.value="";
        input.click();
      }
    };
  });

  document.querySelectorAll("[data-tab-image]").forEach(input=>{
    input.onchange=async e=>{
      const file=e.target.files?.[0];
      if(!file) return;
      if(!file.type.startsWith("image/")){toast("Choose an image file");return}
      try{
        data.homeImages=data.homeImages||{};
        data.homeImages[input.dataset.tabImage]=await resizeTabImage(file);
        try{
          saveData();
          toast("Tab picture added 🌸");
          render();
        }catch(error){
          delete data.homeImages[input.dataset.tabImage];
          toast("Storage is full — remove an older picture first");
        }
      }catch(error){toast("That picture could not be added")}
    };
  });
  document.querySelectorAll("[data-remove-tab-image]").forEach(button=>{
    button.onclick=()=>{
      if(data.homeImages) delete data.homeImages[button.dataset.removeTabImage];
      saveData();toast("Picture removed");render();
    };
  });


  function resizeBannerImage(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onerror=()=>reject(new Error("Could not read image"));
      reader.onload=()=>{
        const img=new Image();
        img.onerror=()=>reject(new Error("Could not open image"));
        img.onload=()=>{
          const width=1200,height=420;
          const scale=Math.max(width/img.width,height/img.height);
          const drawW=img.width*scale,drawH=img.height*scale;
          const canvas=document.createElement("canvas");
          canvas.width=width;canvas.height=height;
          const ctx=canvas.getContext("2d");
          ctx.drawImage(img,(width-drawW)/2,(height-drawH)/2,drawW,drawH);
          resolve(canvas.toDataURL("image/jpeg",0.78));
        };
        img.src=reader.result;
      };
      reader.readAsDataURL(file);
    });
  }


  document.querySelectorAll("[data-pick-banner-image]").forEach(button=>{
    button.onclick=()=>{
      const input=document.querySelector(`[data-banner-image="${button.dataset.pickBannerImage}"]`);
      if(input){
        input.value="";
        input.click();
      }
    };
  });

  document.querySelectorAll("[data-banner-image]").forEach(input=>{
    input.onchange=async e=>{
      const file=e.target.files?.[0];
      if(!file) return;
      if(!file.type.startsWith("image/")){toast("Choose an image file");return}
      try{
        data.moduleBanners=data.moduleBanners||{};
        data.moduleBanners[input.dataset.bannerImage]=await resizeBannerImage(file);
        try{
          saveData();
          toast("Banner picture added 🌙");
          render();
        }catch(error){
          delete data.moduleBanners[input.dataset.bannerImage];
          toast("Storage is full — remove an older picture first");
        }
      }catch(error){toast("That banner could not be added")}
    };
  });
  document.querySelectorAll("[data-remove-banner-image]").forEach(button=>{
    button.onclick=()=>{
      if(data.moduleBanners) delete data.moduleBanners[button.dataset.removeBannerImage];
      saveData();toast("Banner removed");render();
    };
  });

  const exp=document.querySelector("#exportData");
  if(exp) exp.onclick=()=>{
    const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"});
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download="LinaHub-backup.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const imp=document.querySelector("#importData");
  if(imp) imp.onchange=e=>{
    const file=e.target.files?.[0];
    if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>{
      try{
        const imported=JSON.parse(reader.result);
        data={...DEFAULT_DATA,...imported,version:5};
        data.plants=(data.plants||DEFAULT_DATA.plants).map(normalizePlant);
        saveData();
        toast("Backup imported 💜");
        render();
      }catch{toast("That backup could not be read")}
    };
    reader.readAsText(file);
  };
}
