
function SimplePage(title,emoji,text,active=""){
  return shell(`${head(title,text)}<section class="card empty"><div style="font-size:3rem">${emoji}</div><h2 style="margin-top:12px">${title}</h2><p>This module is ready to build next.</p></section>`,active);
}

function SettingsPage(){
  let rememberedOpen=[];
  try{rememberedOpen=JSON.parse(sessionStorage.getItem("linahub-settings-open")||"[]")}catch{}
  const settingsOpen=new Set(Array.isArray(rememberedOpen)?rememberedOpen:[]);
  const accordionClass=key=>settingsOpen.has(key)?" is-open":"";
  const accordionExpanded=key=>settingsOpen.has(key)?"true":"false";
  const accordionHidden=key=>settingsOpen.has(key)?"":" hidden";
  return shell(`${head("Settings","Appearance and your data")}
    <section class="card cloud-account-card">
      <div class="cloud-card-head">
        <div><h2>LinaHub Cloud</h2><p>Secure automatic sync between your laptop and phone.</p></div>
        <span class="cloud-status" data-cloud-status data-state="${CLOUD_STATE.status}">${cloudStatusText()}</span>
      </div>
      ${cloudUser()?`
        <div class="cloud-user">${cloudUser().photoURL?`<img src="${esc(cloudUser().photoURL)}" alt="">`:`<span>☁️</span>`}<div><strong>${esc(cloudUser().displayName||"Google account")}</strong><small>${esc(cloudUser().email||"")}</small></div></div>
        <div class="cloud-actions"><button class="primary" id="cloudUploadNow">Send this device to cloud</button><button class="secondary" id="cloudDownloadNow">Get cloud data on this device</button><button class="mini danger" id="cloudSignOut">Sign out</button></div>
        <p class="settings-note">Changes sync automatically between devices signed into the same Google account. To move your phone data now, tap “Send this device to cloud” on the phone, then “Get cloud data on this device” on the laptop.</p>`:`
        <button class="google-signin" id="cloudSignIn"><span>G</span> Sign in with Google</button>
        <p class="settings-note">Your current data stays on this device until you sign in. The first signed-in device safely creates your cloud copy.</p>`}
    </section>

    <section class="card settings-accordion notification-settings-card${accordionClass("notifications")}" data-settings-accordion="notifications">
      <button type="button" class="settings-accordion-toggle" aria-expanded="${accordionExpanded("notifications")}"><span><strong>Notifications</strong><small>Medication, Today and other reminders</small></span><b aria-hidden="true">⌄</b></button>
      <div class="settings-collapse-body"${accordionHidden("notifications")}>
      <div class="cloud-card-head"><div><h2>Notification settings</h2><p>Medication and Today reminders while LinaHub is installed or open.</p></div><span class="notification-permission" id="notificationPermission">${typeof Notification!=="undefined"?Notification.permission:"unsupported"}</span></div>
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
      </div>
    </section>

    <section class="card settings-accordion${accordionClass("appearance")}" id="appearanceSettings" data-settings-accordion="appearance">
      <button type="button" class="settings-accordion-toggle" aria-expanded="${accordionExpanded("appearance")}"><span><strong>Themes & appearance</strong><small>Plain, glitter, floral or seasonal</small></span><b aria-hidden="true">⌄</b></button>
      <div class="settings-collapse-body"${accordionHidden("appearance")}>
      <h2>App theme</h2>
      <p>Choose a calm plain look, sparkly glitter, the signature floral design, or one of the four seasons.</p>
      <div class="theme-choice-grid">
        ${[
          ["plain","◻️ Plain"], ["glitter","✨ Glitter"], ["floral","🌺 Floral"], ["spring","🌸 Spring"], ["summer","☀️ Summer"], ["autumn","🍂 Autumn"], ["winter","❄️ Winter"]
        ].map(([key,label])=>`<button type="button" class="theme-choice ${data.colorTheme===key?"active":""}" data-color-theme="${key}"><span class="theme-swatch swatch-${key}"></span><strong>${label}</strong></button>`).join("")}
      </div>
      <button class="secondary" id="themeToggle2" style="margin-top:12px">Switch to ${data.theme==="dark"?"light":"dark"} mode</button>
      </div>
    </section>

    <section class="card settings-accordion${accordionClass("icons")}" data-settings-accordion="icons">
      <button type="button" class="settings-accordion-toggle" aria-expanded="${accordionExpanded("icons")}"><span><strong>Tile pictures</strong><small>Upload artwork for every tile</small></span><b aria-hidden="true">⌄</b></button>
      <div class="settings-collapse-body"${accordionHidden("icons")}>
      <div class="icon-setting-groups">
        ${[
          ["Bottom navigation",[["home","Home","⌂"],["today","Today","✅"],["todo","To-do","📝"],["shopping","Shopping","🛒"],["settings","Settings","⚙️"]]],
          ["Main tiles",[["journal","Daily Check-in","📖"],["plants","Garden","🌿"],["pokemon","Pokémon GO","🔴"],["pets","Aquariums","🐠"],["house","House","🏡"],["treasures","Treasure Room","✨"],["journey","Today's Journey","✨"]]],
          ["Trackers",[["sleep","Sleep","😴"],["medication","Medication","💊"],["period","Period","🌸"],["weight","Weight","⚖️"],["measurements","Measurements","📏"]]],
          ["Shopping",[["shoppingFridge","Fridge","❄️"],["shoppingFreezer","Freezer","🧊"],["shoppingPantry","Pantry","🥫"],["shoppingCleaning","Cleaning Supplies","🧽"],["shoppingToiletries","Toiletries","🧴"]]],
          ["House & Aquariums",[["rooms","Rooms","🏠"],["inventory","Inventory","📦"],["girlsTank","Girls Tank","🩷"],["boysTank","Boys Tank","💙"],["aquariumMaintenance","Maintenance","🫧"]]],
          ["Budget",[["bills","Bills","🧾"],["savings","Savings","💰"],["income","Income","💷"],["expenses","Expenses","💸"]]]
        ].map(([group,items])=>`<section class="icon-setting-group"><h3>${group}</h3><div class="tab-art-grid">${items.map(([key,label,fallback])=>`<article class="tab-art-setting"><div class="tab-art-preview">${data.homeImages?.[key]?`<img src="${data.homeImages[key]}" alt="">`:`<span>${esc(moduleIcon(key,fallback))}</span>`}</div><div class="tab-art-copy"><strong>${label}</strong></div><div class="tab-art-actions"><button type="button" class="secondary compact-upload" data-pick-tab-image="${key}">${data.homeImages?.[key]?"Change":"Add image"}</button><input type="file" accept="image/*" data-tab-image="${key}" hidden>${data.homeImages?.[key]?`<button type="button" class="mini danger" data-remove-tab-image="${key}">Remove</button>`:""}</div></article>`).join("")}</div></section>`).join("")}
      </div>
      </div>
    </section>
    <section class="card settings-accordion${accordionClass("banners")}" data-settings-accordion="banners">
      <button type="button" class="settings-accordion-toggle" aria-expanded="${accordionExpanded("banners")}"><span><strong>Banners</strong><small>Section header pictures</small></span><b aria-hidden="true">⌄</b></button>
      <div class="settings-collapse-body"${accordionHidden("banners")}>
      <div class="banner-art-grid">
        ${[
          ["journal","Daily Check-in"],["today","Today"],["todo","To-do"],
          ["plants","Garden"],["pets","Aquariums"],["house","House"],["shopping","Shopping"],
          ["medication","Medication"],["health","Measurements"],["period","Period Tracker"],
          ["pokemon","Pokémon GO"],["treasures","Treasure Room"]
        ].map(([key,label])=>`
          <article class="banner-art-setting">
            <div class="banner-art-preview">${(data.moduleBanners?.[key]||window.LinaImage?.peek?.(`banner:${key}`))?`<img src="${data.moduleBanners?.[key]||window.LinaImage.peek(`banner:${key}`)}" alt="">`:`<span>${esc(data.homeIcons?.[key]||data.moduleIcons?.[key]||"✨")}</span>`}</div>
            <strong>${label}</strong>
            <div class="banner-art-actions">
              <button type="button" class="secondary compact-upload" data-pick-banner-image="${key}">${(data.moduleBanners?.[key]||window.LinaImage?.peek?.(`banner:${key}`))?"Change":"Add"}</button>
              <input type="file" accept="image/*" data-banner-image="${key}" hidden>
              ${(data.moduleBanners?.[key]||window.LinaImage?.peek?.(`banner:${key}`))?`<button class="mini danger" data-remove-banner-image="${key}" aria-label="Remove ${label} banner">×</button>`:""}
            </div>
          </article>`).join("")}
      </div>
      </div>
    </section>

    <section class="card">
      <h2>Backup</h2>
      <p>Your entries use the permanent storage key <strong>linahub-data</strong>.</p>
      <button class="primary" id="exportData">Export backup</button>
      <label class="secondary" style="display:block;margin-top:10px">Import backup<input id="importData" type="file" accept="application/json" hidden></label>
    </section>
  <p class="app-version">Version ${esc(window.LINAHUB_BUILD||"17.9.24")}<br><br>1 Aug 2026</p>`,"settings");
}

function bindSimple(){
  const rememberSettingsPosition=()=>{
    try{sessionStorage.setItem("linahub-settings-scroll",String(window.scrollY||0))}catch{}
  };
  const rememberOpenAccordions=()=>{
    const open=[...document.querySelectorAll("[data-settings-accordion].is-open")].map(section=>section.dataset.settingsAccordion);
    try{sessionStorage.setItem("linahub-settings-open",JSON.stringify(open))}catch{}
  };
  document.querySelectorAll("[data-settings-accordion]").forEach(section=>{
    const toggle=section.querySelector(".settings-accordion-toggle");
    const body=section.querySelector(".settings-collapse-body");
    if(!toggle||!body)return;
    toggle.addEventListener("click",()=>{
      const opening=body.hidden;
      body.hidden=!opening;
      toggle.setAttribute("aria-expanded",String(opening));
      section.classList.toggle("is-open",opening);
      rememberOpenAccordions();
      rememberSettingsPosition();
    });
  });
  requestAnimationFrame(()=>{
    let saved=0;try{saved=Number(sessionStorage.getItem("linahub-settings-scroll")||0)}catch{}
    if(saved>0) window.scrollTo({top:saved,left:0,behavior:"auto"});
  });
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
  document.querySelectorAll("[data-color-theme]").forEach(button=>button.addEventListener("click",event=>{
    // Only a genuine user tap on a different theme should show the confirmation.
    // Restoring the saved theme during startup or re-rendering Settings stays silent.
    if(!event.isTrusted) return;
    const nextTheme=button.dataset.colorTheme;
    if(!nextTheme || nextTheme===data.colorTheme) return;
    data.colorTheme=nextTheme;
    saveData();
    document.body.dataset.colorTheme=data.colorTheme;
    document.querySelectorAll("[data-color-theme]").forEach(b=>b.classList.toggle("active",b===button));
    toast("Theme updated ✨");
  }));
  if(data.settingsSection==="appearance"){
    data.settingsSection="";
    const appearance=document.querySelector("#appearanceSettings");
    const appearanceBody=appearance?.querySelector(".settings-collapse-body");
    const appearanceToggle=appearance?.querySelector(".settings-accordion-toggle");
    if(appearanceBody&&appearanceToggle){appearanceBody.hidden=false;appearanceToggle.setAttribute("aria-expanded","true");appearance.classList.add("is-open");rememberOpenAccordions();}
    setTimeout(()=>appearance?.scrollIntoView({behavior:"smooth",block:"start"}),60);
  }


  function imageErrorMessage(error){
    return window.LinaImage?.friendlyError?.(error)||"That image could not be saved. Please try again.";
  }

  function updateImageSettingCard(input,value,type){
    const isBanner=type==="banner";
    const card=input.closest(isBanner?".banner-art-setting":".tab-art-setting");
    const key=isBanner?input.dataset.bannerImage:input.dataset.tabImage;
    const preview=card?.querySelector(isBanner?".banner-art-preview":".tab-art-preview");
    const pick=card?.querySelector(isBanner?`[data-pick-banner-image="${key}"]`:`[data-pick-tab-image="${key}"]`);
    if(preview) preview.innerHTML=`<img src="${value}" alt="">`;
    if(pick) pick.textContent="Change";
  }

  function bindRemoveImageButton(button,type){
    button.onclick=async()=>{
      const isBanner=type==="banner";
      const key=isBanner?button.dataset.removeBannerImage:button.dataset.removeTabImage;
      try{
        await LinaImage.remove(`${isBanner?"banner":"tab"}:${key}`);
        if(isBanner) delete data.moduleBanners?.[key]; else delete data.homeImages?.[key];
        if(!isBanner&&(key==="girlsTank"||key==="boysTank")){
          const tank=(data.aquariums||[]).find(item=>item.id===(key==="girlsTank"?"girls-tank":"boys-tank"));
          if(tank) tank.photo="";
        }
        saveData();
        const card=button.closest(isBanner?".banner-art-setting":".tab-art-setting");
        const preview=card?.querySelector(isBanner?".banner-art-preview":".tab-art-preview");
        if(preview) preview.innerHTML=`<span>${esc(data.homeIcons?.[key]||data.moduleIcons?.[key]||"✨")}</span>`;
        const pick=card?.querySelector(isBanner?`[data-pick-banner-image="${key}"]`:`[data-pick-tab-image="${key}"]`);
        if(pick) pick.textContent=isBanner?"Add":"Add image";
        button.remove();toast(isBanner?"Banner removed":"Picture removed");
      }catch(error){toast(imageErrorMessage(error));}
    };
  }

  function addRemoveButton(input,type){
    const isBanner=type==="banner";
    const card=input.closest(isBanner?".banner-art-setting":".tab-art-setting");
    const key=isBanner?input.dataset.bannerImage:input.dataset.tabImage;
    const selector=isBanner?`[data-remove-banner-image="${key}"]`:`[data-remove-tab-image="${key}"]`;
    if(!card||card.querySelector(selector)) return;
    const remove=document.createElement("button");
    remove.type="button";remove.className="mini danger";
    if(isBanner){remove.dataset.removeBannerImage=key;remove.textContent="×";remove.setAttribute("aria-label","Remove banner");}
    else{remove.dataset.removeTabImage=key;remove.textContent="Remove";}
    card.querySelector(isBanner?".banner-art-actions":".tab-art-actions")?.appendChild(remove);
    bindRemoveImageButton(remove,type);
  }

  function bindUniversalImagePicker(type){
    const isBanner=type==="banner";
    const pickSelector=isBanner?"[data-pick-banner-image]":"[data-pick-tab-image]";
    const inputSelector=isBanner?"[data-banner-image]":"[data-tab-image]";
    document.querySelectorAll(pickSelector).forEach(button=>{
      button.onclick=()=>{
        rememberSettingsPosition();rememberOpenAccordions();
        const key=isBanner?button.dataset.pickBannerImage:button.dataset.pickTabImage;
        const input=document.querySelector(isBanner?`[data-banner-image="${key}"]`:`[data-tab-image="${key}"]`);
        if(input){input.value="";input.click();}
      };
    });
    document.querySelectorAll(inputSelector).forEach(input=>{
      input.onchange=async event=>{
        const file=event.target.files?.[0];if(!file)return;
        const key=isBanner?input.dataset.bannerImage:input.dataset.tabImage;
        const previous=isBanner?data.moduleBanners?.[key]:data.homeImages?.[key];
        try{
          const storageKey=`${isBanner?"banner":"tab"}:${key}`;
          const value=await LinaImage.upload({file,key:storageKey,width:isBanner?1200:420,height:isBanner?240:420,fit:"cover",quality:isBanner?0.76:0.82});
          const verified=await LinaImage.load(storageKey);
          if(!verified) throw new Error("Saved image could not be restored");
          if(isBanner){data.moduleBanners=data.moduleBanners||{};data.moduleBanners[key]=value;}
          else{
            data.homeImages=data.homeImages||{};data.homeImages[key]=value;
            if(key==="girlsTank"||key==="boysTank"){
              const tank=(data.aquariums||[]).find(item=>item.id===(key==="girlsTank"?"girls-tank":"boys-tank"));
              if(tank) tank.photo=value;
            }
          }
          if(saveData()===false) throw new Error("Could not save app data");
          updateImageSettingCard(input,value,type);addRemoveButton(input,type);
          rememberSettingsPosition();rememberOpenAccordions();
          toast(isBanner?"Banner picture saved 🌙":"Tab picture saved 🌸");
        }catch(error){
          if(isBanner){data.moduleBanners=data.moduleBanners||{};if(previous)data.moduleBanners[key]=previous;else delete data.moduleBanners[key];}
          else{data.homeImages=data.homeImages||{};if(previous)data.homeImages[key]=previous;else delete data.homeImages[key];}
          toast(imageErrorMessage(error));
        }finally{input.value="";}
      };
    });
    document.querySelectorAll(isBanner?"[data-remove-banner-image]":"[data-remove-tab-image]").forEach(button=>bindRemoveImageButton(button,type));
  }

  bindUniversalImagePicker("tab");
  bindUniversalImagePicker("banner");

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
