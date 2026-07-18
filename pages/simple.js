
function SimplePage(title,emoji,text,active=""){
  return shell(`${head(title,text)}<section class="card empty"><div style="font-size:3rem">${emoji}</div><h2 style="margin-top:12px">${title}</h2><p>This module is ready to build next.</p></section>`,active);
}

function SettingsPage(){
  return shell(`${head("Settings","Appearance and your data")}
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
          ["pokemon","Pokémon GO"],["pets","Aquariums"],["house","House"],["settings","Settings"]
        ].map(([key,label])=>`
          <article class="tab-art-setting">
            <div class="tab-art-preview">${data.homeImages?.[key]?`<img src="${data.homeImages[key]}" alt="">`:`<span>${esc(data.homeIcons?.[key]||"✨")}</span>`}</div>
            <div class="tab-art-copy"><strong>${label}</strong><label>Emoji<input class="field home-icon-input" data-icon-key="${key}" value="${esc(data.homeIcons?.[key]||"")}"></label></div>
            <div class="tab-art-actions">
              <label class="secondary compact-upload">Add image<input type="file" accept="image/*" data-tab-image="${key}" hidden></label>
              ${data.homeImages?.[key]?`<button class="mini danger" data-remove-tab-image="${key}">Remove</button>`:""}
            </div>
          </article>`).join("")}
      </div>
      <button class="primary" id="saveHomeIcons" style="margin-top:12px">Save emojis</button>
      <p class="settings-note">Pictures are resized before being saved so LinaHub stays fast. They are included in your LinaHub backup.</p>
    </section>
    <section class="card">
      <h2>Backup</h2>
      <p>Your entries use the permanent storage key <strong>linahub-data</strong>.</p>
      <button class="primary" id="exportData">Export backup</button>
      <label class="secondary" style="display:block;margin-top:10px">Import backup<input id="importData" type="file" accept="application/json" hidden></label>
    </section>
  `,"settings");
}

function bindSimple(){
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

  document.querySelectorAll("[data-tab-image]").forEach(input=>{
    input.onchange=async e=>{
      const file=e.target.files?.[0];
      if(!file) return;
      if(!file.type.startsWith("image/")){toast("Choose an image file");return}
      try{
        data.homeImages=data.homeImages||{};
        data.homeImages[input.dataset.tabImage]=await resizeTabImage(file);
        saveData();toast("Tab picture added 🌸");render();
      }catch{toast("That picture could not be added")}
    };
  });
  document.querySelectorAll("[data-remove-tab-image]").forEach(button=>{
    button.onclick=()=>{
      if(data.homeImages) delete data.homeImages[button.dataset.removeTabImage];
      saveData();toast("Picture removed");render();
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
