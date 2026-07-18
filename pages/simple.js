
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
