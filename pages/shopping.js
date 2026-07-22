
function ensureShoppingData(){
  data.shoppingItems=Array.isArray(data.shoppingItems)?data.shoppingItems:[];
  data.shoppingCategories=Array.isArray(data.shoppingCategories)&&data.shoppingCategories.length
    ? data.shoppingCategories
    : ["Fruit & Veg","Fridge","Freezer","Cupboard","Household","Toiletries","Other"];
}

function ShoppingPage(){
  ensureShoppingData();
  const items=data.shoppingItems||[];
  const remaining=items.filter(item=>!item.done);
  const bought=items.filter(item=>item.done);
  const categories=data.shoppingCategories||[];

  const itemRow=item=>`<article class="shopping-item ${item.done?"shopping-item-done":""}" data-shopping-item="${esc(item.id)}">
    <button type="button" class="shopping-check ${item.done?"done":""}" data-shopping-toggle="${esc(item.id)}" aria-label="${item.done?"Mark as needed":"Mark as bought"}">${item.done?"✓":""}</button>
    <div class="shopping-item-copy">
      <strong>${esc(item.name)}</strong>
      <small>${item.quantity?`${esc(item.quantity)} · `:""}${esc(item.category||"Other")}</small>
    </div>
    <button type="button" class="shopping-delete" data-shopping-delete="${esc(item.id)}" aria-label="Delete ${esc(item.name)}">×</button>
  </article>`;

  return shell(`${head("Shopping List","Everything you need in one place")}
    <section class="card shopping-add-card">
      <div class="shopping-add-row">
        <input class="field" id="shoppingName" type="text" maxlength="80" placeholder="Add an item…" autocomplete="off">
        <button type="button" class="primary shopping-add-button" id="addShoppingItem">Add</button>
      </div>
      <div class="shopping-options">
        <input class="field" id="shoppingQuantity" type="text" maxlength="30" placeholder="Quantity">
        <select class="field" id="shoppingCategory">
          ${categories.map(category=>`<option value="${esc(category)}">${esc(category)}</option>`).join("")}
        </select>
      </div>
    </section>

    <section class="shopping-summary">
      <span><strong>${remaining.length}</strong> left</span>
      <span><strong>${bought.length}</strong> bought</span>
    </section>

    <section class="shopping-list-section">
      <div class="section-title-row"><h2>Still needed</h2></div>
      <div class="shopping-list">
        ${remaining.length?remaining.map(itemRow).join(""):`<div class="card empty shopping-empty"><p>Your shopping list is empty.</p></div>`}
      </div>
    </section>

    ${bought.length?`<section class="shopping-list-section shopping-bought-section">
      <div class="section-title-row"><h2>Bought</h2><button type="button" class="small-btn" id="clearBoughtShopping">Clear bought</button></div>
      <div class="shopping-list">${bought.map(itemRow).join("")}</div>
    </section>`:""}
  `,"shopping");
}

function bindShopping(){
  ensureShoppingData();
  const page=document.querySelector("#app");
  const nameInput=page?.querySelector("#shoppingName");

  function addItem(){
    const name=(nameInput?.value||"").trim();
    if(!name){
      toast("Add an item first");
      nameInput?.focus();
      return;
    }
    const quantity=(page.querySelector("#shoppingQuantity")?.value||"").trim();
    const category=page.querySelector("#shoppingCategory")?.value||"Other";
    data.shoppingItems.unshift({
      id:`shop-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      name,quantity,category,done:false,createdAt:new Date().toISOString(),completedAt:""
    });
    saveData();
    render();
    requestAnimationFrame(()=>document.querySelector("#shoppingName")?.focus());
  }

  page?.querySelector("#addShoppingItem")?.addEventListener("click",addItem);
  nameInput?.addEventListener("keydown",event=>{
    if(event.key==="Enter"){event.preventDefault();addItem();}
  });

  page?.addEventListener("click",event=>{
    const toggle=event.target.closest("[data-shopping-toggle]");
    if(toggle){
      const item=data.shoppingItems.find(entry=>String(entry.id)===String(toggle.dataset.shoppingToggle));
      if(item){
        item.done=!item.done;
        item.completedAt=item.done?new Date().toISOString():"";
        saveData();render();
      }
      return;
    }

    const remove=event.target.closest("[data-shopping-delete]");
    if(remove){
      data.shoppingItems=data.shoppingItems.filter(entry=>String(entry.id)!==String(remove.dataset.shoppingDelete));
      saveData();render();
      return;
    }

    if(event.target.closest("#clearBoughtShopping")){
      data.shoppingItems=data.shoppingItems.filter(item=>!item.done);
      saveData();render();toast("Bought items cleared");
    }
  });
}
