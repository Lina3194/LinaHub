const SHOPPING_CATEGORIES=[
  {id:"fridge",name:"Fridge",iconKey:"shoppingFridge",fallback:"❄️",hint:"Fresh food, dairy and chilled items"},
  {id:"freezer",name:"Freezer",iconKey:"shoppingFreezer",fallback:"🧊",hint:"Frozen food and ice"},
  {id:"pantry",name:"Pantry",iconKey:"shoppingPantry",fallback:"🥫",hint:"Cupboard food, drinks and snacks"},
  {id:"cleaning",name:"Cleaning Supplies",iconKey:"shoppingCleaning",fallback:"🧽",hint:"Laundry and household cleaning"},
  {id:"toiletries",name:"Toiletries",iconKey:"shoppingToiletries",fallback:"🧴",hint:"Bathroom and personal care"}
];

function normaliseShoppingCategory(value=""){
  const text=String(value).toLowerCase();
  if(text.includes("freezer")||text.includes("frozen")) return "freezer";
  if(text.includes("clean")||text.includes("household")||text.includes("laundry")) return "cleaning";
  if(text.includes("toilet")||text.includes("bathroom")||text.includes("personal")) return "toiletries";
  if(text.includes("fridge")||text.includes("chill")||text.includes("dairy")||text.includes("fruit")||text.includes("veg")) return "fridge";
  return "pantry";
}

function ensureShoppingData(){
  data.shoppingItems=Array.isArray(data.shoppingItems)?data.shoppingItems:[];
  data.shoppingItems=data.shoppingItems.map(item=>({...item,category:normaliseShoppingCategory(item.category)}));
  data.shoppingView=data.shoppingView||{};
  data.shoppingView.category=SHOPPING_CATEGORIES.some(c=>c.id===data.shoppingView.category)?data.shoppingView.category:"all";
}

function shoppingCategory(id){return SHOPPING_CATEGORIES.find(c=>c.id===id)||SHOPPING_CATEGORIES[2]}

function shoppingItemRow(item){
  const category=shoppingCategory(item.category);
  return `<article class="shopping-item ${item.done?"shopping-item-done":""}">
    <button type="button" class="shopping-check ${item.done?"done":""}" data-shopping-toggle="${esc(item.id)}" aria-label="${item.done?"Put back on list":"Mark as bought"}">${item.done?"✓":""}</button>
    <div class="shopping-item-copy"><strong>${esc(item.name)}</strong><small>${item.quantity?`${esc(item.quantity)} · `:""}${esc(category.name)}</small></div>
    <button type="button" class="shopping-delete" data-shopping-delete="${esc(item.id)}" aria-label="Delete ${esc(item.name)}">×</button>
  </article>`;
}

function ShoppingPage(){
  ensureShoppingData();
  const active=data.shoppingView.category||"all";
  const items=data.shoppingItems||[];
  const needed=items.filter(item=>!item.done);
  const filtered=active==="all"?needed:needed.filter(item=>item.category===active);
  const bought=items.filter(item=>item.done);
  const categoryTiles=SHOPPING_CATEGORIES.map(category=>{
    const count=needed.filter(item=>item.category===category.id).length;
    return `<button type="button" class="shopping-category-tile ${active===category.id?"active":""}" data-shopping-category="${category.id}">
      <span class="shopping-category-art">${moduleVisual(category.iconKey,category.fallback,"module-tile-image")}</span>
      <span class="shopping-category-copy"><strong>${category.name}</strong><small>${count?`${count} item${count===1?"":"s"} to buy`:category.hint}</small></span>
      <b>${count}</b>
    </button>`;
  }).join("");

  return shell(`${head("Shopping","Add it at home, tick it off in the shop")}
    <section class="card shopping-overview-card">
      <div><span class="section-kicker">Shopping list</span><h2>${needed.length?`${needed.length} item${needed.length===1?"":"s"} still needed`:"Your list is clear"}</h2><p>${needed.length?"Choose a category or view the full list below.":"Add something whenever you notice you are running low."}</p></div>
      <span class="shopping-overview-count">${needed.length}</span>
    </section>

    <section class="shopping-category-grid">${categoryTiles}</section>

    <section class="card shopping-quick-card">
      <div class="shopping-add-row">
        <input class="field" id="shoppingName" type="text" maxlength="80" placeholder="Add an item…" autocomplete="off">
        <button type="button" class="primary shopping-add-button" id="addShoppingItem">Add</button>
      </div>
      <div class="shopping-options">
        <input class="field" id="shoppingQuantity" type="text" maxlength="30" placeholder="Quantity (optional)">
        <select class="field" id="shoppingCategory">${SHOPPING_CATEGORIES.map(c=>`<option value="${c.id}" ${active===c.id?"selected":""}>${c.name}</option>`).join("")}</select>
      </div>
    </section>

    <section class="shopping-list-section">
      <div class="section-title-row">
        <h2>${active==="all"?"Everything to buy":shoppingCategory(active).name}</h2>
        ${active!=="all"?`<button type="button" class="small-btn" data-shopping-category="all">View all</button>`:""}
      </div>
      <div class="shopping-list">${filtered.length?filtered.map(shoppingItemRow).join(""):`<div class="card empty shopping-empty"><span>✓</span><p>${active==="all"?"Nothing left to buy.":`Nothing needed for ${shoppingCategory(active).name.toLowerCase()}.`}</p></div>`}</div>
    </section>

    ${bought.length?`<details class="card shopping-bought-details"><summary>Bought today (${bought.length})</summary><div class="shopping-list">${bought.map(shoppingItemRow).join("")}</div><button type="button" class="small-btn danger shopping-clear" id="clearBoughtShopping">Clear bought</button></details>`:""}
  `,"shopping");
}

function bindShopping(){
  ensureShoppingData();
  const page=document.querySelector("#app");
  const nameInput=page?.querySelector("#shoppingName");
  const addItem=()=>{
    const name=(nameInput?.value||"").trim();
    if(!name){toast("Add an item first");nameInput?.focus();return;}
    const quantity=(page.querySelector("#shoppingQuantity")?.value||"").trim();
    const category=page.querySelector("#shoppingCategory")?.value||"pantry";
    data.shoppingItems.unshift({id:`shop-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name,quantity,category,done:false,createdAt:new Date().toISOString(),completedAt:""});
    saveData();render();requestAnimationFrame(()=>document.querySelector("#shoppingName")?.focus());
  };
  page?.querySelector("#addShoppingItem")?.addEventListener("click",addItem);
  nameInput?.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();addItem();}});
  page?.addEventListener("click",event=>{
    const category=event.target.closest("[data-shopping-category]");
    if(category){data.shoppingView.category=category.dataset.shoppingCategory;saveData();render();return;}
    const toggle=event.target.closest("[data-shopping-toggle]");
    if(toggle){const item=data.shoppingItems.find(x=>String(x.id)===String(toggle.dataset.shoppingToggle));if(item){item.done=!item.done;item.completedAt=item.done?new Date().toISOString():"";saveData();render();}return;}
    const remove=event.target.closest("[data-shopping-delete]");
    if(remove){data.shoppingItems=data.shoppingItems.filter(x=>String(x.id)!==String(remove.dataset.shoppingDelete));saveData();render();return;}
    if(event.target.closest("#clearBoughtShopping")){data.shoppingItems=data.shoppingItems.filter(item=>!item.done);saveData();render();toast("Bought items cleared");}
  });
}
