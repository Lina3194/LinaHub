
const SHOPPING_CATEGORIES=[
  {id:"fridge",name:"Fridge",icon:"❄️"},
  {id:"freezer",name:"Freezer",icon:"🧊"},
  {id:"pantry",name:"Pantry",icon:"🥫"},
  {id:"cleaning",name:"Cleaning Supplies",icon:"🧽"},
  {id:"toiletries",name:"Toiletries",icon:"🧴"}
];

function normaliseShoppingCategory(value=""){
  const text=String(value).toLowerCase();
  if(text.includes("freezer")) return "freezer";
  if(text.includes("clean")||text.includes("household")) return "cleaning";
  if(text.includes("toilet")) return "toiletries";
  if(text.includes("fridge")||text.includes("fruit")||text.includes("veg")) return "fridge";
  return "pantry";
}

function ensureShoppingData(){
  data.shoppingItems=Array.isArray(data.shoppingItems)?data.shoppingItems:[];
  data.shoppingItems=data.shoppingItems.map(item=>({...item,category:normaliseShoppingCategory(item.category)}));
  data.shoppingView=data.shoppingView||{category:"all"};
}

function shoppingItemRow(item){
  return `<article class="shopping-item ${item.done?"shopping-item-done":""}">
    <button type="button" class="shopping-check ${item.done?"done":""}" data-shopping-toggle="${esc(item.id)}" aria-label="${item.done?"Mark as needed":"Mark as bought"}">${item.done?"✓":""}</button>
    <div class="shopping-item-copy"><strong>${esc(item.name)}</strong><small>${item.quantity?esc(item.quantity):SHOPPING_CATEGORIES.find(c=>c.id===item.category)?.name||"Pantry"}</small></div>
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
      <span>${category.icon}</span><strong>${category.name}</strong><small>${count?`${count} to buy`:"Nothing needed"}</small>
    </button>`;
  }).join("");

  return shell(`${head("Shopping","Quick to add, easy to use in the shop")}
    <section class="card shopping-quick-card">
      <div class="shopping-add-row">
        <input class="field" id="shoppingName" type="text" maxlength="80" placeholder="What do you need?" autocomplete="off">
        <button type="button" class="primary shopping-add-button" id="addShoppingItem">Add</button>
      </div>
      <div class="shopping-options">
        <input class="field" id="shoppingQuantity" type="text" maxlength="30" placeholder="Quantity">
        <select class="field" id="shoppingCategory">${SHOPPING_CATEGORIES.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}</select>
      </div>
    </section>

    <section class="shopping-category-grid">${categoryTiles}</section>

    <section class="shopping-list-section">
      <div class="section-title-row">
        <h2>${active==="all"?"Everything to buy":SHOPPING_CATEGORIES.find(c=>c.id===active)?.name}</h2>
        ${active!=="all"?`<button type="button" class="small-btn" data-shopping-category="all">Show all</button>`:""}
      </div>
      <div class="shopping-list">${filtered.length?filtered.map(shoppingItemRow).join(""):`<div class="card empty shopping-empty"><p>${active==="all"?"Nothing left to buy.":"Nothing needed in this category."}</p></div>`}</div>
    </section>

    ${bought.length?`<details class="card shopping-bought-details"><summary>Bought (${bought.length})</summary><div class="shopping-list">${bought.map(shoppingItemRow).join("")}</div><button type="button" class="small-btn danger shopping-clear" id="clearBoughtShopping">Clear bought</button></details>`:""}
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
