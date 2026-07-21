
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

    <section class="card notification-settings-card">
      <div class="cloud-card-head"><div><h2>Notifications</h2><p>Medication and Today reminders while LinaHub is installed or open.</p></div><span class="notification-permission" id="notificationPermission">${typeof Notification!=="undefined"?Notification.permission:"unsupported"}</span></div>
      <label class="settings-toggle"><input type="checkbox" id="notificationsEnabled" ${data.notifications?.enabled?"checked":""}><span><strong>Enable notifications</strong><small>Allow LinaHub to send reminders on this device.</small></span></label>
      <div class="notification-options ${data.notifications?.enabled?"":"muted"}" id="notificationOptions">
        <div class="notification-kind-block">
          <label class="settings-toggle"><input type="checkbox" id="medicationNotifications" ${data.notifications?.medication!==false?"checked":""}><span><strong>Medication reminders</strong><small>Add as many reminder times as you need.</small></span></label>
          <div class="notification-time-list" id="medicationNotificationTimes">${(data.notifications?.medicationTimes||[data.notifications?.medicationTime||"09:00"]).map((time,index)=>`<div class="notification-time-row"><input class="field compact-time" type="time" value="${esc(time)}"><button type="button" class="mini danger" data-remove-notification-time="medication" ${index===0?"disabled":""}>×</button></div>`).join("")}</div>
          <button type="button" class="secondary add-notification-time" data-add-notification-time="medication">+ Add another time</button>
        </div>
        <div class="notification-kind-block">
          <label class="settings-toggle"><input type="checkbox" id="todayNotifications" ${data.notifications?.todayTasks!==false?"checked":""}><span><strong>Today reminders</strong><small>Add as many reminder times as you need.</small></span></label>
          <div class="notification-time-list" id="todayNotificationTimes">${(data.notifications?.todayTimes||[data.notifications?.todayTime||"09:15"]).map((time,index)=>`<div class="notification-time-row"><input class="field compact-time" type="time" value="${esc(time)}"><button type="button" class="mini danger" data-remove-notification-time="today" ${index===0?"disabled":""}>×</button></div>`).join("")}</div>
          <button type="button" class="secondary add-notification-time" data-add-notification-time="today">+ Add another time</button>
        </div>
        <div class="notification-kind-block">
          <label class="settings-toggle"><input type="checkbox" id="flowerNotifications" ${data.notifications?.dayCheckins?"checked":""}><span><strong>Journey check-ins</strong><small>Remind yourself to log energy, mood and pain.</small></span></label>
          <div class="flower-reminder-grid"><label>From<input class="field" id="flowerReminderStart" type="time" value="${esc(data.notifications?.dayCheckinStart||"08:00")}"></label><label>Until<input class="field" id="flowerReminderEnd" type="time" value="${esc(data.notifications?.dayCheckinEnd||"22:00")}"></label><label>Every<select class="field" id="flowerReminderFrequency"><option value="1" ${(data.notifications?.dayCheckinEvery||1)==1?"selected":""}>1 hour</option><option value="2" ${(data.notifications?.dayCheckinEvery||1)==2?"selected":""}>2 hours</option><option value="3" ${(data.notifications?.dayCheckinEvery||1)==3?"selected":""}>3 hours</option></select></label></div>
        </div>
        <div class="notification-module-grid">${[["plants","🌿 Plants"],["house","🏠 Chores"],["aquariums","🐠 Aquariums"],["sleep","😴 Sleep"],["period","🌸 Period"],["journal","📖 Journal"]].map(([key,label])=>`<label class="settings-toggle compact"><input type="checkbox" data-module-reminder="${key}" ${data.notifications?.modules?.[key]?"checked":""}><span><strong>${label}</strong><small>Include in reminders</small></span></label>`).join("")}</div>
      </div>
      <div class="cloud-actions"><button class="primary" id="saveNotifications">Save notifications</button><button class="secondary" id="testNotification">Send test</button></div>
      <p class="settings-note">On iPhone, notifications require LinaHub to be added to your Home Screen. Timed reminders are checked whenever LinaHub is running; reliable reminders while it is fully closed would require a push-notification service.</p>
    </section>

    <section class="card" id="appearanceSettings">
      <h2>Appearance</h2>
      <p>Choose a full LinaHub sanctuary. Each one changes the background, cards, buttons, navigation and atmosphere across the whole app.</p>
      <div class="theme-choice-grid">
        ${[
          ["amethyst","Amethyst"],["rose","Rose Garden"],["sage","Sage Botanical"],["ocean","Ocean"],
          ["autumn","Autumn"],["galaxy","Galaxy"],["winter","Winter"],["cherry","Cherry Blossom"],
          ["wildflower","Wildflower"],["celestial","Celestial"],["meadow","Meadow"],["midnight","Midnight Floral"],
          ["clouds","Clouds"],["marble","Rose Marble"]
        ].map(([key,label])=>`<button type="button" class="theme-choice ${data.colorTheme===key?"active":""}" data-color-theme="${key}"><span class="theme-swatch swatch-${key}"></span><strong>${label}</strong></button>`).join("")}
      </div>
      <button class="secondary" id="themeToggle2" style="margin-top:12px">Switch to ${data.theme==="dark"?"light":"dark"} mode</button>
    </section>

    <details class="card settings-collapse">
      <summary><span><strong>Home tab pictures & icons</strong><small>Change Home tile pictures and emoji</small></span><b aria-hidden="true">⌄</b></summary>
      <div class="settings-collapse-body">
      <p>Add your own picture to any home tab. When a picture is set, it replaces that tab’s emoji. Removing it brings the emoji back.</p>
      <div class="tab-art-grid">
        ${[
          ["journal","Daily Check-in"],["health","Health"],["plants","Plants"],["medication","Medication"],
          ["pokemon","Pokémon GO"],["pets","Aquariums"],["house","House"],["period","Period Tracker"],["treasures","Treasure Room"]
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
      </div>
    </details>
    <details class="card settings-collapse">
      <summary><span><strong>Module banner pictures</strong><small>Add or remove the wide pictures shown inside sections</small></span><b aria-hidden="true">⌄</b></summary>
      <div class="settings-collapse-body">
      <p>Add a wide banner to the top of each section. These are separate from the square Home tab pictures.</p>
      <div class="banner-art-grid">
        ${[
          ["journal","Daily Check-in"],["today","Today"],["todo","To-do"],["health","Health"],
          ["plants","Plants"],["medication","Medication"],["pokemon","Pokémon GO"],["pets","Aquariums"],["house","House"],["period","Period Tracker"],["treasures","Treasure Room"]
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
      </div>
    </details>

    <section class="card">
      <h2>Backup</h2>
      <p>Your entries use the permanent storage key <strong>linahub-data</strong>.</p>
      <button class="primary" id="exportData">Export backup</button>
      <label class="secondary" style="display:block;margin-top:10px">Import backup<input id="importData" type="file" accept="application/json" hidden></label>
    </section>
  <p class="app-version">LinaHub v16.44 · Long-press & Compact Settings</p>`,"settings");
}

function bindSimple(){
  document.querySelector("#cloudSignIn")?.addEventListener("click",linaSignIn);
  document.querySelector("#cloudSignOut")?.addEventListener("click",linaSignOut);
  document.querySelector("#cloudUploadNow")?.addEventListener("click",forceCloudUpload);
  document.querySelector("#cloudDownloadNow")?.addEventListener("click",forceCloudDownload);
  const notificationEnabled=document.querySelector("#notificationsEnabled");
  notificationEnabled?.addEventListener("change",async()=>{
    if(notificationEnabled.checked){
      const granted=await linaRequestNotificationPermission();
      if(!granted) notificationEnabled.checked=false;
    }
    document.querySelector("#notificationOptions")?.classList.toggle("muted",!notificationEnabled.checked);
  });
  const addNotificationTime=(kind,value)=>{
    const list=document.querySelector(kind==="medication"?"#medicationNotificationTimes":"#todayNotificationTimes");
    if(!list)return;
    const row=document.createElement("div");row.className="notification-time-row";
    row.innerHTML=`<input class="field compact-time" type="time" value="${value}"><button type="button" class="mini danger" data-remove-notification-time="${kind}">×</button>`;
    list.appendChild(row);
  };
  document.querySelectorAll("[data-add-notification-time]").forEach(button=>button.addEventListener("click",()=>addNotificationTime(button.dataset.addNotificationTime,button.dataset.addNotificationTime==="medication"?"18:00":"18:15")));
  document.querySelector("#notificationOptions")?.addEventListener("click",event=>{
    const button=event.target.closest("[data-remove-notification-time]");if(!button)return;
    const list=button.closest(".notification-time-list");if(list?.children.length>1)button.closest(".notification-time-row")?.remove();
  });
  document.querySelector("#saveNotifications")?.addEventListener("click",async()=>{
    const enabled=!!document.querySelector("#notificationsEnabled")?.checked;
    if(enabled && !(await linaRequestNotificationPermission())) return;
    const readTimes=selector=>[...document.querySelectorAll(`${selector} input[type=time]`)].map(input=>input.value).filter(Boolean);
    const modules={};document.querySelectorAll("[data-module-reminder]").forEach(x=>modules[x.dataset.moduleReminder]=x.checked);
    data.notifications={...(data.notifications||{}),enabled,medication:!!document.querySelector("#medicationNotifications")?.checked,todayTasks:!!document.querySelector("#todayNotifications")?.checked,dayCheckins:!!document.querySelector("#flowerNotifications")?.checked,dayCheckinStart:document.querySelector("#flowerReminderStart")?.value||"08:00",dayCheckinEnd:document.querySelector("#flowerReminderEnd")?.value||"22:00",dayCheckinEvery:Number(document.querySelector("#flowerReminderFrequency")?.value)||1,modules,medicationTimes:readTimes("#medicationNotificationTimes"),todayTimes:readTimes("#todayNotificationTimes"),lastSent:data.notifications?.lastSent||{}};
    saveData();linaStartNotificationChecks();toast(enabled?"Notifications saved":"Notifications switched off");
  });
  document.querySelector("#testNotification")?.addEventListener("click",async()=>{
    if(!(await linaRequestNotificationPermission())) return;
    await linaShowNotification("LinaHub notifications are working ✨",{body:"Your reminders can now appear on this device.",tag:"linahub-test"});
  });
  const t=document.querySelector("#themeToggle2");
  if(t) t.onclick=()=>{
    data.theme=data.theme==="dark"?"light":"dark";
    saveData();
    document.body.classList.toggle("dark",data.theme==="dark");
    t.textContent=`Switch to ${data.theme==="dark"?"light":"dark"} mode`;
    toast(`${data.theme==="dark"?"Dark":"Light"} mode selected`);
  };
  document.querySelectorAll("[data-color-theme]").forEach(button=>button.onclick=()=>{
    data.colorTheme=button.dataset.colorTheme;
    saveData();
    document.body.dataset.colorTheme=data.colorTheme;
    document.querySelectorAll("[data-color-theme]").forEach(b=>b.classList.toggle("active",b===button));
    toast("Theme updated ✨");
  });
  if(data.settingsSection==="appearance"){
    data.settingsSection="";
    setTimeout(()=>document.querySelector("#appearanceSettings")?.scrollIntoView({behavior:"smooth",block:"start"}),60);
  }

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
          const card=input.closest(".tab-art-setting");
          const preview=card?.querySelector(".tab-art-preview");
          if(preview) preview.innerHTML=`<img src="${data.homeImages[input.dataset.tabImage]}" alt="">`;
          if(card&&!card.querySelector(`[data-remove-tab-image="${input.dataset.tabImage}"]`)){
            const remove=document.createElement("button");remove.type="button";remove.className="mini danger";remove.dataset.removeTabImage=input.dataset.tabImage;remove.textContent="Remove";
            card.querySelector(".tab-art-actions")?.appendChild(remove);
            remove.addEventListener("click",()=>{delete data.homeImages[input.dataset.tabImage];saveData();preview.innerHTML=`<span>${esc(data.homeIcons?.[input.dataset.tabImage]||"✨")}</span>`;remove.remove();toast("Picture removed")});
          }
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
      saveData();
      const card=button.closest(".tab-art-setting");
      const preview=card?.querySelector(".tab-art-preview");
      if(preview) preview.innerHTML=`<span>${esc(data.homeIcons?.[button.dataset.removeTabImage]||"✨")}</span>`;
      button.remove();toast("Picture removed");
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
          const card=input.closest(".banner-art-setting");
          const preview=card?.querySelector(".banner-art-preview");
          if(preview) preview.innerHTML=`<img src="${data.moduleBanners[input.dataset.bannerImage]}" alt="">`;
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
      saveData();
      const card=button.closest(".banner-art-setting");
      const preview=card?.querySelector(".banner-art-preview");
      if(preview) preview.innerHTML=`<span>${esc(data.homeIcons?.[button.dataset.removeBannerImage]||"✨")}</span>`;
      button.remove();toast("Banner removed");
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
