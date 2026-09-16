// LinaHub 17.9.109 — Life Tools: Find My Stuff + reusable checklists.
let lifeToolsUi={stuffSearch:"",stuffEditingId:"",checklistEditingId:""};

const LIFE_STUFF_CATEGORY_SUGGESTIONS=["Documents","Tech","Travel","Household","Clothes","Storage","Lotus Lair","Other"];

function lifeId(prefix){return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`}
function lifeNormalizeData(){
  data.stuffLocations=Array.isArray(data.stuffLocations)?data.stuffLocations:[];
  data.stuffLocations=data.stuffLocations.map((item,index)=>({
    id:String(item?.id||`stuff-${Date.now()}-${index}`),
    name:String(item?.name||"Untitled item"),
    location:String(item?.location||""),
    category:String(item?.category||""),
    icon:String(item?.icon||"📦"),
    notes:String(item?.notes||""),
    updatedAt:item?.updatedAt||new Date().toISOString()
  }));
  data.reusableChecklists=Array.isArray(data.reusableChecklists)?data.reusableChecklists:[];
  data.reusableChecklists=data.reusableChecklists.map((list,index)=>({
    id:String(list?.id||`checklist-${Date.now()}-${index}`),
    name:String(list?.name||"Checklist"),
    icon:String(list?.icon||"✅"),
    notes:String(list?.notes||""),
    items:(Array.isArray(list?.items)?list.items:[]).map((item,itemIndex)=>({
      id:String(item?.id||`item-${Date.now()}-${index}-${itemIndex}`),
      text:String(item?.text||item?.name||"Checklist item"),
      done:item?.done===true
    })),
    updatedAt:list?.updatedAt||new Date().toISOString()
  }));
}

function lifeProgress(list){
  const total=list.items?.length||0;
  const done=(list.items||[]).filter(item=>item.done).length;
  return {done,total,percent:total?Math.round(done/total*100):0};
}

function LifeToolsPage(){
  lifeNormalizeData();
  const stuffCount=data.stuffLocations.length;
  const listCount=data.reusableChecklists.length;
  return shell(`${head("Life Tools","Little helpers that remember things for you","home")}
    <section class="life-tools-intro card">
      <span class="life-tools-spark">✨</span>
      <div><h2>Your external memory</h2><p>Save where things live and keep reusable routines without turning them into overdue tasks.</p></div>
    </section>
    <section class="life-tools-grid">
      <button type="button" class="life-tool-card find-stuff-card" data-route="findstuff">
        <span class="life-tool-icon">🔎</span><div><strong>Find My Stuff</strong><small>Search where you put passports, cables, paperwork and anything else.</small><b>${stuffCount} saved item${stuffCount===1?"":"s"}</b></div><i>›</i>
      </button>
      <button type="button" class="life-tool-card checklist-tool-card" data-route="checklists">
        <span class="life-tool-icon">✅</span><div><strong>Reusable Checklists</strong><small>Packing lists, morning routines, bedtime routines and anything you want to reuse.</small><b>${listCount} checklist${listCount===1?"":"s"}</b></div><i>›</i>
      </button>
    </section>
  `,"lifetools");
}

function stuffEditorModal(item=null){
  const categories=[...new Set([...LIFE_STUFF_CATEGORY_SUGGESTIONS,...data.stuffLocations.map(x=>x.category).filter(Boolean)])];
  return `<div class="life-modal-backdrop" data-close-life-modal>
    <section class="life-modal" role="dialog" aria-modal="true" aria-labelledby="stuffEditorTitle">
      <div class="life-modal-head"><div><span class="section-kicker">Find My Stuff</span><h2 id="stuffEditorTitle">${item?"Edit item":"Add something"}</h2></div><button type="button" class="life-modal-x" data-close-life-modal aria-label="Close">×</button></div>
      <div class="life-form-grid">
        <label class="life-icon-field"><span>Icon</span><input class="field" id="stuffIcon" value="${esc(item?.icon||"📦")}" maxlength="8" placeholder="📦"></label>
        <label><span>Item name</span><input class="field" id="stuffName" value="${esc(item?.name||"")}" placeholder="e.g. Passport" maxlength="80"></label>
      </div>
      <label><span>Where is it?</span><input class="field" id="stuffLocation" value="${esc(item?.location||"")}" placeholder="e.g. Bedroom → top drawer → document folder" maxlength="180"></label>
      <label><span>Category <small>(optional)</small></span><input class="field" id="stuffCategory" list="stuffCategorySuggestions" value="${esc(item?.category||"")}" placeholder="Choose or type your own"><datalist id="stuffCategorySuggestions">${categories.map(x=>`<option value="${esc(x)}">`).join("")}</datalist></label>
      <label><span>Notes <small>(optional)</small></span><textarea class="field" id="stuffNotes" rows="3" placeholder="Anything useful to remember…">${esc(item?.notes||"")}</textarea></label>
      <div class="life-modal-actions">${item?`<button type="button" class="secondary danger" id="deleteStuffItem">Delete</button>`:""}<button type="button" class="primary" id="saveStuffItem">${item?"Save changes":"Save item"}</button></div>
    </section>
  </div>`;
}

function FindStuffPage(){
  lifeNormalizeData();
  const q=(lifeToolsUi.stuffSearch||"").trim().toLowerCase();
  const matches=data.stuffLocations.filter(item=>!q||[item.name,item.location,item.category,item.notes].some(value=>String(value||"").toLowerCase().includes(q))).sort((a,b)=>a.name.localeCompare(b.name));
  return shell(`${head("Find My Stuff","Search your own little map of where things live","lifetools")}
    <section class="card stuff-search-card">
      <div class="stuff-search-row"><label class="stuff-search"><span>🔎</span><input class="field" id="stuffSearch" value="${esc(lifeToolsUi.stuffSearch)}" placeholder="Search passport, charger, paperwork…"></label><button type="button" class="primary" id="addStuffItem">＋ Add</button></div>
      <p class="helper-text">Searches the item name, location, category and notes.</p>
    </section>
    <section class="stuff-results">
      ${matches.length?matches.map(item=>`<button type="button" class="stuff-result-card" data-edit-stuff="${esc(item.id)}"><span class="stuff-result-icon">${esc(item.icon||"📦")}</span><div><strong>${esc(item.name)}</strong><b>${esc(item.location||"Location not added yet")}</b>${item.category?`<small>${esc(item.category)}</small>`:""}${item.notes?`<p>${esc(item.notes)}</p>`:""}</div><i>✎</i></button>`).join(""):`<section class="card empty stuff-empty"><span>${q?"🔍":"📦"}</span><h2>${q?"Nothing found":"Nothing saved yet"}</h2><p>${q?"Try another word, location or category.":"Add something once, then let LinaHub remember where it lives."}</p></section>`}
    </section>
    <div id="lifeModalMount"></div>
  `,"findstuff");
}

function checklistEditorModal(list=null){
  const lines=list?(list.items||[]).map(x=>x.text).join("\n"):"";
  return `<div class="life-modal-backdrop" data-close-life-modal>
    <section class="life-modal checklist-editor-modal" role="dialog" aria-modal="true" aria-labelledby="checklistEditorTitle">
      <div class="life-modal-head"><div><span class="section-kicker">Reusable checklist</span><h2 id="checklistEditorTitle">${list?"Edit checklist":"New checklist"}</h2></div><button type="button" class="life-modal-x" data-close-life-modal aria-label="Close">×</button></div>
      <div class="life-form-grid">
        <label class="life-icon-field"><span>Icon</span><input class="field" id="checklistIcon" value="${esc(list?.icon||"✅")}" maxlength="8" placeholder="✅"></label>
        <label><span>Checklist name</span><input class="field" id="checklistName" value="${esc(list?.name||"")}" placeholder="e.g. Trip packing" maxlength="80"></label>
      </div>
      <label><span>Items</span><textarea class="field checklist-lines-input" id="checklistLines" rows="9" placeholder="One item per line…">${esc(lines)}</textarea><small class="helper-text">One line = one checklist item. You can add, rename, reorder or delete individual items later too.</small></label>
      <label><span>Notes <small>(optional)</small></span><textarea class="field" id="checklistNotes" rows="2" placeholder="Anything useful about this checklist…">${esc(list?.notes||"")}</textarea></label>
      <div class="life-modal-actions"><button type="button" class="primary" id="saveChecklist">${list?"Save changes":"Create checklist"}</button></div>
    </section>
  </div>`;
}

function ChecklistsPage(){
  lifeNormalizeData();
  return shell(`${head("Reusable Checklists","Use them, reset them, use them again","lifetools")}
    <section class="card reusable-list-intro"><div><span class="section-kicker">No deadlines. No guilt.</span><h2>Open one only when you need it.</h2><p>Everything is editable, and completing a checklist never turns it into an overdue task.</p></div><button type="button" class="primary" id="addChecklist">＋ New checklist</button></section>
    <section class="reusable-checklist-grid">
      ${data.reusableChecklists.length?data.reusableChecklists.map(list=>{const p=lifeProgress(list);return `<article class="reusable-checklist-card"><button type="button" class="checklist-open-area" data-route="checklist" data-route-id="${esc(list.id)}"><span class="reusable-checklist-icon">${esc(list.icon||"✅")}</span><div><strong>${esc(list.name)}</strong><small>${p.done} of ${p.total} ticked</small><span class="checklist-progress-track"><i style="width:${p.percent}%"></i></span></div><b>›</b></button><div class="checklist-card-actions"><button type="button" class="mini" data-duplicate-checklist="${esc(list.id)}">Duplicate</button><button type="button" class="mini" data-edit-checklist="${esc(list.id)}">Edit</button></div></article>`}).join(""):`<section class="card empty"><span>✅</span><h2>No checklists yet</h2><p>Create one for packing, mornings, bedtime or anything you repeat.</p></section>`}
    </section>
    <div id="lifeModalMount"></div>
  `,"checklists");
}

function ChecklistPage(){
  lifeNormalizeData();
  const list=data.reusableChecklists.find(x=>x.id===routeId);
  if(!list)return shell(`${head("Checklist","This checklist could not be found","checklists")}<section class="card empty"><span>🫥</span><h2>Checklist not found</h2><button type="button" class="primary" data-route="checklists">Back to checklists</button></section>`,"checklist");
  const p=lifeProgress(list);
  return shell(`${head(`${list.icon||"✅"} ${list.name}`,`${p.done} of ${p.total} ticked`,"checklists")}
    <section class="card checklist-live-card">
      <div class="checklist-live-head"><div><span class="section-kicker">Reusable checklist</span><h2>${esc(list.name)}</h2>${list.notes?`<p>${esc(list.notes)}</p>`:""}</div><button type="button" class="mini" id="editCurrentChecklist">✎ Edit</button></div>
      <div class="checklist-big-progress"><span><b>${p.done}</b> / ${p.total}</span><div><i style="width:${p.percent}%"></i></div><small>${p.percent}%</small></div>
      <div class="checklist-live-items">
        ${(list.items||[]).length?list.items.map((item,index)=>`<article class="checklist-live-row ${item.done?"is-done":""}" data-checklist-item-row="${esc(item.id)}"><button type="button" class="checklist-toggle" data-toggle-checklist-item="${esc(item.id)}" aria-pressed="${item.done?"true":"false"}"><span>${item.done?"✓":""}</span><b>${esc(item.text)}</b></button><div class="checklist-item-actions"><button type="button" class="mini" data-move-checklist-item="${esc(item.id)}" data-step="-1" ${index===0?"disabled":""}>↑</button><button type="button" class="mini" data-move-checklist-item="${esc(item.id)}" data-step="1" ${index===list.items.length-1?"disabled":""}>↓</button><button type="button" class="mini" data-rename-checklist-item="${esc(item.id)}">✎</button><button type="button" class="mini danger" data-delete-checklist-item="${esc(item.id)}">×</button></div></article>`).join(""):`<div class="checklist-no-items"><span>📝</span><p>No items yet. Add the first one below.</p></div>`}
      </div>
      <div class="checklist-add-row"><input class="field" id="newChecklistItem" placeholder="Add another item…" maxlength="140"><button type="button" class="primary" id="addChecklistItem">Add</button></div>
    </section>
    <section class="checklist-utility-actions"><button type="button" class="secondary" id="resetChecklist">↺ Reset all ticks</button><button type="button" class="secondary" id="duplicateCurrentChecklist">⧉ Duplicate</button><button type="button" class="secondary danger" id="deleteCurrentChecklist">Delete checklist</button></section>
    <div id="lifeModalMount"></div>
  `,"checklist");
}

function lifeOpenModal(html){
  const mount=document.querySelector("#lifeModalMount");if(!mount)return;
  mount.innerHTML=html;document.body.classList.add("life-modal-open");
  const close=()=>{mount.innerHTML="";document.body.classList.remove("life-modal-open")};
  mount.querySelectorAll("[data-close-life-modal]").forEach(el=>el.addEventListener("click",event=>{if(event.currentTarget===event.target||event.currentTarget.matches("button"))close()}));
  return {mount,close};
}

function checklistItemRenameModal(item){
  return `<div class="life-modal-backdrop" data-close-life-modal><section class="life-modal life-small-modal" role="dialog" aria-modal="true"><div class="life-modal-head"><div><span class="section-kicker">Checklist item</span><h2>Rename item</h2></div><button type="button" class="life-modal-x" data-close-life-modal aria-label="Close">×</button></div><label><span>Item name</span><input class="field" id="renameChecklistItemInput" value="${esc(item?.text||"")}" maxlength="140"></label><div class="life-modal-actions"><button type="button" class="primary" id="saveChecklistItemRename">Save</button></div></section></div>`;
}

function bindLifeTools(){
  lifeNormalizeData();
  if(route==="findstuff"){
    const search=document.querySelector("#stuffSearch");
    search?.addEventListener("input",()=>{lifeToolsUi.stuffSearch=search.value;const pos=search.selectionStart;render();requestAnimationFrame(()=>{const next=document.querySelector("#stuffSearch");next?.focus();try{next?.setSelectionRange(pos,pos)}catch{}})});
    const openStuff=id=>{
      const item=id?data.stuffLocations.find(x=>x.id===id):null;
      const modal=lifeOpenModal(stuffEditorModal(item));if(!modal)return;
      modal.mount.querySelector("#saveStuffItem")?.addEventListener("click",()=>{
        const name=(modal.mount.querySelector("#stuffName")?.value||"").trim();
        const location=(modal.mount.querySelector("#stuffLocation")?.value||"").trim();
        if(!name){toast("Add the item name first");modal.mount.querySelector("#stuffName")?.focus();return}
        if(!location){toast("Add where it lives first");modal.mount.querySelector("#stuffLocation")?.focus();return}
        const saved={id:item?.id||lifeId("stuff"),name,location,category:(modal.mount.querySelector("#stuffCategory")?.value||"").trim(),icon:(modal.mount.querySelector("#stuffIcon")?.value||"📦").trim()||"📦",notes:(modal.mount.querySelector("#stuffNotes")?.value||"").trim(),updatedAt:new Date().toISOString()};
        const index=data.stuffLocations.findIndex(x=>x.id===saved.id);if(index>=0)data.stuffLocations[index]=saved;else data.stuffLocations.push(saved);
        saveData();modal.close();render();toast(item?"Saved changes ✨":"Saved where it lives 🔎");
      });
      modal.mount.querySelector("#deleteStuffItem")?.addEventListener("click",()=>{if(!item||!confirm(`Delete ${item.name}?`))return;data.stuffLocations=data.stuffLocations.filter(x=>x.id!==item.id);saveData();modal.close();render();toast("Item removed")});
      requestAnimationFrame(()=>modal.mount.querySelector(item?"#stuffLocation":"#stuffName")?.focus());
    };
    document.querySelector("#addStuffItem")?.addEventListener("click",()=>openStuff(""));
    document.querySelectorAll("[data-edit-stuff]").forEach(button=>button.addEventListener("click",()=>openStuff(button.dataset.editStuff)));
  }

  if(route==="checklists"){
    const openChecklistEditor=id=>{
      const list=id?data.reusableChecklists.find(x=>x.id===id):null;
      const modal=lifeOpenModal(checklistEditorModal(list));if(!modal)return;
      modal.mount.querySelector("#saveChecklist")?.addEventListener("click",()=>{
        const name=(modal.mount.querySelector("#checklistName")?.value||"").trim();if(!name){toast("Give the checklist a name");modal.mount.querySelector("#checklistName")?.focus();return}
        const lines=(modal.mount.querySelector("#checklistLines")?.value||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
        const previousByText=new Map((list?.items||[]).map(item=>[item.text.toLowerCase(),item]));
        const items=lines.map(text=>{const previous=previousByText.get(text.toLowerCase());return previous?{...previous,text}:{id:lifeId("item"),text,done:false}});
        const saved={id:list?.id||lifeId("checklist"),name,icon:(modal.mount.querySelector("#checklistIcon")?.value||"✅").trim()||"✅",notes:(modal.mount.querySelector("#checklistNotes")?.value||"").trim(),items,updatedAt:new Date().toISOString()};
        const index=data.reusableChecklists.findIndex(x=>x.id===saved.id);if(index>=0)data.reusableChecklists[index]=saved;else data.reusableChecklists.push(saved);
        saveData();modal.close();render();toast(list?"Checklist updated ✨":"Checklist created ✅");
      });
      requestAnimationFrame(()=>modal.mount.querySelector("#checklistName")?.focus());
    };
    document.querySelector("#addChecklist")?.addEventListener("click",()=>openChecklistEditor(""));
    document.querySelectorAll("[data-edit-checklist]").forEach(button=>button.addEventListener("click",()=>openChecklistEditor(button.dataset.editChecklist)));
    document.querySelectorAll("[data-duplicate-checklist]").forEach(button=>button.addEventListener("click",()=>{
      const source=data.reusableChecklists.find(x=>x.id===button.dataset.duplicateChecklist);if(!source)return;
      data.reusableChecklists.push({...source,id:lifeId("checklist"),name:`${source.name} copy`,items:(source.items||[]).map(item=>({...item,id:lifeId("item"),done:false})),updatedAt:new Date().toISOString()});saveData();render();toast("Checklist duplicated ⧉");
    }));
  }

  if(route==="checklist"){
    const list=data.reusableChecklists.find(x=>x.id===routeId);if(!list)return;
    const persist=()=>{list.updatedAt=new Date().toISOString();saveData()};
    document.querySelectorAll("[data-toggle-checklist-item]").forEach(button=>button.addEventListener("click",()=>{const item=list.items.find(x=>x.id===button.dataset.toggleChecklistItem);if(!item)return;item.done=!item.done;persist();render()}));
    const addItem=()=>{const input=document.querySelector("#newChecklistItem");const text=(input?.value||"").trim();if(!text)return;list.items.push({id:lifeId("item"),text,done:false});persist();render();requestAnimationFrame(()=>document.querySelector("#newChecklistItem")?.focus())};
    document.querySelector("#addChecklistItem")?.addEventListener("click",addItem);
    document.querySelector("#newChecklistItem")?.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();addItem()}});
    document.querySelectorAll("[data-delete-checklist-item]").forEach(button=>button.addEventListener("click",()=>{list.items=list.items.filter(x=>x.id!==button.dataset.deleteChecklistItem);persist();render()}));
    document.querySelectorAll("[data-rename-checklist-item]").forEach(button=>button.addEventListener("click",()=>{
      const item=list.items.find(x=>x.id===button.dataset.renameChecklistItem);if(!item)return;
      const modal=lifeOpenModal(checklistItemRenameModal(item));if(!modal)return;
      const saveRename=()=>{const text=(modal.mount.querySelector("#renameChecklistItemInput")?.value||"").trim();if(!text){toast("Add the item name");return}item.text=text;persist();modal.close();render()};
      modal.mount.querySelector("#saveChecklistItemRename")?.addEventListener("click",saveRename);
      modal.mount.querySelector("#renameChecklistItemInput")?.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();saveRename()}});
      requestAnimationFrame(()=>{const input=modal.mount.querySelector("#renameChecklistItemInput");input?.focus();input?.select()});
    }));
    document.querySelectorAll("[data-move-checklist-item]").forEach(button=>button.addEventListener("click",()=>{const index=list.items.findIndex(x=>x.id===button.dataset.moveChecklistItem);const next=index+Number(button.dataset.step||0);if(index<0||next<0||next>=list.items.length)return;[list.items[index],list.items[next]]=[list.items[next],list.items[index]];persist();render()}));
    document.querySelector("#resetChecklist")?.addEventListener("click",()=>{if(!list.items.some(x=>x.done)){toast("Everything is already unticked");return}list.items.forEach(item=>item.done=false);persist();render();toast("Checklist reset ↺")});
    document.querySelector("#duplicateCurrentChecklist")?.addEventListener("click",()=>{const copy={...list,id:lifeId("checklist"),name:`${list.name} copy`,items:list.items.map(item=>({...item,id:lifeId("item"),done:false})),updatedAt:new Date().toISOString()};data.reusableChecklists.push(copy);saveData();go("checklist",copy.id);toast("Checklist duplicated ⧉")});
    document.querySelector("#deleteCurrentChecklist")?.addEventListener("click",()=>{if(!confirm(`Delete ${list.name}?`))return;data.reusableChecklists=data.reusableChecklists.filter(x=>x.id!==list.id);saveData();go("checklists");toast("Checklist deleted")});
    document.querySelector("#editCurrentChecklist")?.addEventListener("click",()=>{
      const modal=lifeOpenModal(checklistEditorModal(list));if(!modal)return;
      modal.mount.querySelector("#saveChecklist")?.addEventListener("click",()=>{
        const name=(modal.mount.querySelector("#checklistName")?.value||"").trim();if(!name){toast("Give the checklist a name");return}
        const lines=(modal.mount.querySelector("#checklistLines")?.value||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
        const previousByText=new Map(list.items.map(item=>[item.text.toLowerCase(),item]));
        list.name=name;list.icon=(modal.mount.querySelector("#checklistIcon")?.value||"✅").trim()||"✅";list.notes=(modal.mount.querySelector("#checklistNotes")?.value||"").trim();list.items=lines.map(text=>{const old=previousByText.get(text.toLowerCase());return old?{...old,text}:{id:lifeId("item"),text,done:false}});persist();modal.close();render();toast("Checklist updated ✨");
      });
    });
  }
}
