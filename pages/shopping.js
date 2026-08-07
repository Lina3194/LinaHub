const SHOPPING_CATEGORIES=[
  {id:"fridge",name:"Fridge",iconKey:"shoppingFridge",fallback:"❄️",hint:"Fresh food, dairy and chilled items"},
  {id:"freezer",name:"Freezer",iconKey:"shoppingFreezer",fallback:"🧊",hint:"Frozen food and ice"},
  {id:"pantry",name:"Pantry",iconKey:"shoppingPantry",fallback:"🥫",hint:"Cupboard food, drinks and snacks"},
  {id:"cleaning",name:"Cleaning Supplies",iconKey:"shoppingCleaning",fallback:"🧽",hint:"Laundry and household cleaning"},
  {id:"toiletries",name:"Toiletries",iconKey:"shoppingToiletries",fallback:"🧴",hint:"Bathroom and personal care"}
];

let shoppingSessionCategory="";

const DEFAULT_SHOPPING_ITEMS={
  fridge:[
    "Gnocchi","Galaxy bar","Minced beef","Sausages","Edam slices","Cucumber","Houmous","Carrots","Peach iced tea","Pink sauce","Chocolate milk","Cream cheese","Pineapple juice","Block cheese","Ham","Jam","Tesco Apples","Mayonnaise","Tomatoes","Unsalted butter","Yoghurt","Avocado","Butter","Salsa","Chicken","Chocolate digestives","Tomato purée","Jalapeños","Milk","Ketchup"
  ],
  freezer:[
    "Pies","Peas","Burgers","Mash","Curly fries","Mini pizzas","Prawns","Strawberry banana mix","Spinach","Chopped peppers","Sweetcorn","Broccoli","Raspberries","Pineapple"
  ],
  pantry:[
    "Pizza bake rolls","Chocolate-covered raisins","Pistachios","Chilli peanuts","Breadcrumbs","Lemons","Rice","Potatoes","Penne","Pesto","Spaghetti","Rice wine vinegar","Wraps","Curry base","Burger buns","Chopped tomato","Naan bread","Tomato passata","Honey","Baked beans (baby)","Shells","Mirin","Special K","Coco pops shells","Frosties","Bran Flakes","Doritos","Spirali","Onions","Bread","Beans","Eggs","Poppadoms","Baked beans","Tuna","Peanut butter","Soy sauce","Garlic","Noodles","Sesame oil","Arborio rice","Shaoshing wine","Sriracha","Apple cider vinegar","Dark soy sauce","Can of chickpeas","Worcestershire sauce","Olive oil","Oats","Popcorn"
  ]
};

function normaliseShoppingCategory(value=""){
  const text=String(value).toLowerCase();
  if(text.includes("freezer")||text.includes("frozen")) return "freezer";
  if(text.includes("clean")||text.includes("household")||text.includes("laundry")) return "cleaning";
  if(text.includes("toilet")||text.includes("bathroom")||text.includes("personal")) return "toiletries";
  if(text.includes("fridge")||text.includes("chill")||text.includes("dairy")||text.includes("fruit")||text.includes("veg")) return "fridge";
  return "pantry";
}

function shoppingDefaultId(category,name){
  return `regular-${category}-${String(name).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")}`;
}

function ensureShoppingItemIds(){
  const seen=new Set();
  let changed=false;
  data.shoppingItems.forEach((item,index)=>{
    let id=String(item?.id||"").trim();
    if(!id || seen.has(id)){
      const slug=String(item?.name||"item").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"item";
      const base=`shop-${normaliseShoppingCategory(item?.category)}-${slug}`;
      let candidate=`${base}-${index+1}`;
      let n=2;
      while(seen.has(candidate))candidate=`${base}-${index+1}-${n++}`;
      item.id=candidate;
      id=candidate;
      changed=true;
    }
    seen.add(id);
  });
  return changed;
}

function ensureShoppingData(){
  data.shoppingItems=Array.isArray(data.shoppingItems)?data.shoppingItems:[];
  data.shoppingItems=data.shoppingItems.map(item=>{
    const isRegular=item.isRegular===true;
    const needed=typeof item.needed==="boolean"?item.needed:!item.done;
    return {...item,category:normaliseShoppingCategory(item.category),isRegular,needed,done:!needed};
  });
  data.shoppingView=data.shoppingView||{};
  data.shoppingView.mode=data.shoppingView.mode==="regular"?"regular":"needed";
  data.shoppingView.editId=data.shoppingView.editId||"";
  const repairedIds=ensureShoppingItemIds();

  if(!data.shoppingDefaultsInitialised){
    Object.entries(DEFAULT_SHOPPING_ITEMS).forEach(([category,names])=>{
      names.forEach(name=>{
        const id=shoppingDefaultId(category,name);
        const exists=data.shoppingItems.some(item=>String(item.id)===id || (item.isRegular&&item.category===category&&String(item.name).toLowerCase()===name.toLowerCase()));
        if(!exists) data.shoppingItems.push({id,name,quantity:"",category,isRegular:true,needed:false,done:true,createdAt:new Date().toISOString(),completedAt:""});
      });
    });
    data.shoppingDefaultsInitialised=true;
    saveData();
  }else if(repairedIds){
    saveData();
  }
}

function shoppingCategory(id){return SHOPPING_CATEGORIES.find(c=>c.id===id)||SHOPPING_CATEGORIES[2]}

function shoppingItemRow(item,{master=false}={}){
  const category=shoppingCategory(item.category);
  const editing=String(data.shoppingView.editId)===String(item.id);
  if(editing){
    return `<article class="shopping-item shopping-item-editing">
      <div class="shopping-edit-fields">
        <input class="field" id="shoppingEditName" value="${esc(item.name)}" maxlength="80" aria-label="Item name">
        <input class="field" id="shoppingEditQuantity" value="${esc(item.quantity||"")}" maxlength="30" placeholder="Usual quantity (optional)" aria-label="Usual quantity">
        <select class="field" id="shoppingEditCategory">${SHOPPING_CATEGORIES.map(c=>`<option value="${c.id}" ${item.category===c.id?"selected":""}>${c.name}</option>`).join("")}</select>
      </div>
      <div class="shopping-edit-actions">
        <button type="button" class="small-btn primary" data-shopping-save-edit="${esc(item.id)}">Save</button>
        <button type="button" class="small-btn" data-shopping-cancel-edit>Cancel</button>
        <button type="button" class="small-btn danger" data-shopping-delete="${esc(item.id)}">Delete</button>
      </div>
    </article>`;
  }
  const label=item.isRegular?(item.needed?"Needed":"In stock"):(item.needed?"One-off":"Bought");
  return `<article class="shopping-item ${item.needed?"":"shopping-item-done"} ${item.isRegular?"shopping-regular-item":"shopping-oneoff-item"}">
    <button type="button" class="shopping-check ${item.needed?"needed":"done"}" data-shopping-toggle="${esc(item.id)}" aria-label="${item.needed?"Mark as bought":"Mark as needed"}">${item.needed?"":"✓"}</button>
    <div class="shopping-item-copy"><strong>${esc(item.name)}</strong><small>${item.quantity?`${esc(item.quantity)} · `:""}${esc(category.name)} · ${label}</small></div>
    ${item.isRegular||master?`<button type="button" class="shopping-edit" data-shopping-edit="${esc(item.id)}" aria-label="Edit ${esc(item.name)}">✎</button>`:`<button type="button" class="shopping-delete" data-shopping-delete="${esc(item.id)}" aria-label="Delete ${esc(item.name)}">×</button>`}
  </article>`;
}

function shoppingRegularGroups(items){
  return SHOPPING_CATEGORIES.map(category=>{
    const rows=items.filter(item=>item.category===category.id);
    if(!rows.length)return "";
    return `<section class="shopping-regular-group">
      <div class="shopping-regular-group-head">
        <div>${moduleVisual(category.iconKey,category.fallback,"module-tile-image")}<span><strong>${esc(category.name)}</strong><small>${rows.length} regular item${rows.length===1?"":"s"}</small></span></div>
      </div>
      <div class="shopping-list">${rows.map(item=>shoppingItemRow(item,{master:true})).join("")}</div>
    </section>`;
  }).join("");
}

function ShoppingPage(){
  ensureShoppingData();
  const active=SHOPPING_CATEGORIES.some(c=>c.id===shoppingSessionCategory)?shoppingSessionCategory:"";
  const listCategory=active||"all";
  const mode=data.shoppingView.mode||"needed";
  const items=data.shoppingItems||[];
  const needed=items.filter(item=>item.needed);
  const regular=items.filter(item=>item.isRegular);
  const visible=mode==="regular"
    ?(listCategory==="all"?regular:regular.filter(item=>item.category===listCategory))
    :(listCategory==="all"?needed:needed.filter(item=>item.category===listCategory));
  const categoryTiles=SHOPPING_CATEGORIES.map(category=>{
    const count=needed.filter(item=>item.category===category.id).length;
    const regularCount=regular.filter(item=>item.category===category.id).length;
    return `<button type="button" class="shopping-category-tile ${active===category.id?"active":""}" data-shopping-category="${category.id}">
      <span class="shopping-category-art">${moduleVisual(category.iconKey,category.fallback,"module-tile-image")}</span>
      <span class="shopping-category-copy"><strong>${category.name}</strong><small>${regularCount?`${regularCount} regular item${regularCount===1?"":"s"}`:category.hint}</small></span>
    </button>`;
  }).join("");

  return shell(`${head("Shopping","Add it at home, tick it off in the shop")}
    <section class="card shopping-overview-card">
      <div><span class="section-kicker">Shopping list</span><h2>${needed.length?`${needed.length} item${needed.length===1?"":"s"} still needed`:"Your list is clear"}</h2><p>${needed.length?"Your regular and one-off items appear together here.":"Mark a regular item as needed or add a one-off item."}</p></div>
      <span class="shopping-overview-count">${needed.length}</span>
    </section>

    <div class="shopping-mode-tabs" role="tablist">
      <button type="button" class="${mode==="needed"?"active":""}" data-shopping-mode="needed">Needed now</button>
      <button type="button" class="${mode==="regular"?"active":""}" data-shopping-mode="regular">All regular items</button>
    </div>

    <section class="shopping-category-grid">${categoryTiles}</section>

    <section class="card shopping-quick-card">
      <div class="shopping-add-row">
        <input class="field" id="shoppingName" type="text" maxlength="80" placeholder="Add an item…" autocomplete="off">
        <button type="button" class="primary shopping-add-button" id="addShoppingItem">Add</button>
      </div>
      <div class="shopping-options">
        <input class="field" id="shoppingQuantity" type="text" maxlength="30" placeholder="Quantity (optional)">
        <select class="field" id="shoppingCategory">${SHOPPING_CATEGORIES.map(c=>`<option value="${c.id}" ${((active||"pantry")===c.id)?"selected":""}>${c.name}</option>`).join("")}</select>
      </div>
      <label class="shopping-regular-choice"><input type="checkbox" id="shoppingSaveRegular"> <span>Save as a regular item</span><small>New items are one-off unless you tick this.</small></label>
    </section>

    <section class="shopping-list-section">
      <div class="section-title-row">
        <h2>${mode==="regular"?(listCategory==="all"?"Regular items by category":`${shoppingCategory(listCategory).name} regular items`):(listCategory==="all"?"Everything to buy":shoppingCategory(listCategory).name)}</h2>
        ${listCategory!=="all"?`<button type="button" class="small-btn" data-shopping-category="all">View all</button>`:""}
      </div>
      ${mode==="regular"&&listCategory==="all"
        ? `<div class="shopping-regular-groups">${shoppingRegularGroups(regular) || '<div class="card empty shopping-empty"><span>✓</span><p>No regular items yet.</p></div>'}</div>`
        : `<div class="shopping-list">${visible.length?visible.map(item=>shoppingItemRow(item,{master:mode==="regular"})).join(""):`<div class="card empty shopping-empty"><span>✓</span><p>${mode==="regular"?"No regular items in this category yet.":listCategory==="all"?"Nothing left to buy.":`Nothing needed for ${shoppingCategory(listCategory).name.toLowerCase()}.`}</p></div>`}</div>`}
    </section>
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
    const isRegular=!!page.querySelector("#shoppingSaveRegular")?.checked;
    data.shoppingItems.unshift({id:`shop-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,name,quantity,category,isRegular,needed:true,done:false,createdAt:new Date().toISOString(),completedAt:""});
    data.shoppingView.mode="needed";
    saveData();render();requestAnimationFrame(()=>document.querySelector("#shoppingName")?.focus());
  };
  page?.querySelector("#addShoppingItem")?.addEventListener("click",addItem);
  nameInput?.addEventListener("keydown",event=>{if(event.key==="Enter"){event.preventDefault();addItem();}});
  page?.addEventListener("click",event=>{
    const modeButton=event.target.closest("[data-shopping-mode]");
    if(modeButton){data.shoppingView.mode=modeButton.dataset.shoppingMode;data.shoppingView.editId="";saveData();render();return;}
    const category=event.target.closest("[data-shopping-category]");
    if(category){
      shoppingSessionCategory=category.dataset.shoppingCategory==="all"?"":category.dataset.shoppingCategory;
      if(category.classList.contains("shopping-category-tile") && category.dataset.shoppingCategory!=="all"){
        data.shoppingView.mode="regular";
      }
      data.shoppingView.editId="";
      saveData();
      render();
      if(category.classList.contains("shopping-category-tile")){
        requestAnimationFrame(()=>document.querySelector(".shopping-list-section")?.scrollIntoView({behavior:"smooth",block:"start"}));
      }
      return;
    }
    const toggle=event.target.closest("[data-shopping-toggle]");
    if(toggle){
      event.preventDefault();
      ensureShoppingItemIds();
      const id=String(toggle.dataset.shoppingToggle||"");
      const item=data.shoppingItems.find(x=>String(x.id)===id);
      if(!item){toast("I couldn't find that shopping item. Please try again.");return;}
      if(item.isRegular){
        item.needed=!item.needed;
        item.done=!item.needed;
        item.completedAt=item.needed?"":new Date().toISOString();
      }else if(item.needed){
        data.shoppingItems=data.shoppingItems.filter(x=>String(x.id)!==id);
      }
      saveData();
      render();
      return;
    }
    const edit=event.target.closest("[data-shopping-edit]");
    if(edit){data.shoppingView.editId=edit.dataset.shoppingEdit;saveData();render();return;}
    if(event.target.closest("[data-shopping-cancel-edit]")){data.shoppingView.editId="";saveData();render();return;}
    const saveEdit=event.target.closest("[data-shopping-save-edit]");
    if(saveEdit){
      const item=data.shoppingItems.find(x=>String(x.id)===String(saveEdit.dataset.shoppingSaveEdit));
      const newName=(page.querySelector("#shoppingEditName")?.value||"").trim();
      if(!newName){toast("Item name cannot be empty");return;}
      if(item){item.name=newName;item.quantity=(page.querySelector("#shoppingEditQuantity")?.value||"").trim();item.category=page.querySelector("#shoppingEditCategory")?.value||item.category;}
      data.shoppingView.editId="";saveData();render();return;
    }
    const remove=event.target.closest("[data-shopping-delete]");
    if(remove){data.shoppingItems=data.shoppingItems.filter(x=>String(x.id)!==String(remove.dataset.shoppingDelete));data.shoppingView.editId="";saveData();render();return;}
  });
}
