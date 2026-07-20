const TREASURE_DEFINITIONS=[
  {id:"golden-lemon",icon:"🍋",name:"Golden Lemon",category:"Nature",story:"For growing your lemon tree from a tiny seed into something truly special.",rule:()=>true},
  {id:"first-journal",icon:"📖",name:"First Chapter",category:"Journals",story:"For beginning to write your days into LinaHub.",rule:()=>Object.keys(data.checkins||{}).length>0},
  {id:"gentle-heart",icon:"💜",name:"Gentle Heart",category:"Wellness",story:"A reminder that resting and caring for yourself always counts.",rule:()=>true},
  {id:"little-aquarium",icon:"🐠",name:"Little Aquarium",category:"Aquariums",story:"For creating a home for your girls and boys tanks.",rule:()=>Array.isArray(data.aquariums)&&data.aquariums.length>0},
  {id:"green-fingers",icon:"🪴",name:"Green Fingers",category:"Nature",story:"For caring for a growing collection of plants.",rule:()=>Array.isArray(data.plants)&&data.plants.length>=5},
  {id:"home-key",icon:"🗝️",name:"Sanctuary Key",category:"Home",story:"The key to the little magical home you are building here.",rule:()=>true},
  {id:"moon-candle",icon:"🕯️",name:"Moon Candle",category:"Creative",story:"A tiny light for every creative idea still waiting to glow.",rule:()=>true},
  {id:"cycle-bloom",icon:"🌸",name:"Cycle Bloom",category:"Wellness",story:"For bringing your long cycle history into a tracker that belongs to you.",rule:()=>Array.isArray(data.periodCycles)&&data.periodCycles.length>0},
  {id:"future-pearl",icon:"🫧",name:"Hidden Pearl",category:"Aquariums",story:"A secret treasure still waiting to be discovered.",rule:()=>false},
  {id:"future-butterfly",icon:"🦋",name:"Garden Visitor",category:"Nature",story:"A secret treasure still waiting to be discovered.",rule:()=>false}
];

function ensureTreasureData(){
  if(!data.treasures||typeof data.treasures!=="object") data.treasures={};
  if(!Array.isArray(data.favoriteTreasures)) data.favoriteTreasures=[];
  const now=new Date().toISOString();
  TREASURE_DEFINITIONS.forEach((t,index)=>{
    if(t.rule()&&!data.treasures[t.id]){
      data.treasures[t.id]={unlockedAt:now,collected:index<3};
    }
  });
}

function treasureState(id){return data.treasures?.[id]||null}
function collectedTreasures(){return TREASURE_DEFINITIONS.filter(t=>treasureState(t.id)?.collected)}
function waitingTreasures(){return TREASURE_DEFINITIONS.filter(t=>treasureState(t.id)&&!treasureState(t.id).collected)}

function TreasureRoomPage(){
  ensureTreasureData();
  const collected=collectedTreasures();
  const waiting=waitingTreasures();
  const favs=data.favoriteTreasures||[];
  const shelfOrder=["Nature","Wellness","Journals","Aquariums","Home","Creative"];
  return shell(`
    ${head("Treasure Room","Your little room of memories","home")}
    <section class="treasure-intro">
      <div><span class="section-kicker">LinaHub Sanctuary</span><h1>Your Treasure Room</h1><p>Every keepsake here marks something you have cared for, created or carried through.</p></div>
      <div class="treasure-count"><b>${collected.length}</b><small>collected</small></div>
    </section>

    <section class="treasure-room" aria-label="A cosy magical treasure room">
      <div class="room-stars"></div>
      <div class="moon-window"><span class="moon"></span><i></i><i></i><i></i></div>
      <div class="hanging-light"><span></span></div>
      <div class="room-plant">🪴</div>
      <div class="room-chair"><span></span></div>
      <div class="room-rug"></div>
      <div class="room-bookcase">
        ${shelfOrder.map(category=>{
          const items=collected.filter(t=>t.category===category);
          return `<div class="room-shelf" data-category="${category}">
            <small>${category}</small>
            <div class="shelf-items">
              ${items.map(t=>`<button class="shelf-treasure ${favs.includes(t.id)?"favourite":""}" data-treasure="${t.id}" aria-label="${t.name}"><span>${t.icon}</span>${favs.includes(t.id)?"<i>★</i>":""}</button>`).join("")}
              ${Array.from({length:Math.max(0,3-items.length)},()=>`<span class="empty-treasure">✦</span>`).join("")}
            </div>
          </div>`;
        }).join("")}
      </div>
      <div class="room-candle">🕯️</div>
      <div class="room-cat">🐈‍⬛</div>
    </section>

    ${waiting.length?`<section class="waiting-table card">
      <div><span class="section-kicker">Waiting by the door</span><h2>${waiting.length} new treasure${waiting.length===1?"":"s"}</h2><p>There ${waiting.length===1?"is a parcel":"are parcels"} waiting to be opened.</p></div>
      <button class="gift-parcel" id="collectTreasure" aria-label="Open next treasure"><span>🎁</span><b>Collect</b></button>
    </section>`:""}

    <section class="card treasure-book">
      <div class="section-title"><div><span class="section-kicker">Treasure Book</span><h2>Your collection</h2></div><small>${collected.length}/${TREASURE_DEFINITIONS.length} found</small></div>
      <div class="treasure-grid">
        ${TREASURE_DEFINITIONS.map(t=>{
          const state=treasureState(t.id);
          return state?.collected
            ? `<button class="treasure-card" data-treasure="${t.id}"><span>${t.icon}</span><strong>${t.name}</strong><small>${t.category}</small></button>`
            : `<div class="treasure-card locked"><span>?</span><strong>Undiscovered</strong><small>${t.category}</small></div>`;
        }).join("")}
      </div>
    </section>
    <div id="treasureModal"></div>
  `,"treasures");
}

function openTreasureModal(id,newlyCollected=false){
  const t=TREASURE_DEFINITIONS.find(x=>x.id===id); if(!t)return;
  const state=treasureState(id); const fav=(data.favoriteTreasures||[]).includes(id);
  const modal=document.querySelector("#treasureModal"); if(!modal)return;
  modal.innerHTML=`<div class="treasure-modal-backdrop"><div class="treasure-modal ${newlyCollected?"reveal":""}" role="dialog" aria-modal="true">
    <button type="button" class="modal-close" data-close-treasure aria-label="Close">×</button>
    <div class="modal-sparkles">✦ ✧ ✦</div><div class="modal-treasure-icon">${t.icon}</div>
    <span class="section-kicker">${newlyCollected?"A new treasure!":t.category}</span><h2>${t.name}</h2><p>${t.story}</p>
    <small>Collected ${new Date(state?.unlockedAt||Date.now()).toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"})}</small>
    <button type="button" class="primary favourite-treasure" data-favourite="${id}">${fav?"★ Displayed in Sanctuary":"☆ Display in Sanctuary"}</button>
  </div></div>`;
  bindTreasureModal();
}

function closeTreasureModal(){
  const modal=document.querySelector("#treasureModal");
  if(modal) modal.innerHTML="";
}

function bindTreasureModal(){
  const backdrop=document.querySelector(".treasure-modal-backdrop");
  const panel=document.querySelector(".treasure-modal");
  panel?.addEventListener("click",event=>event.stopPropagation());
  backdrop?.addEventListener("click",closeTreasureModal);
  document.querySelector("[data-close-treasure]")?.addEventListener("click",event=>{event.preventDefault();event.stopPropagation();closeTreasureModal()});
  document.querySelector("[data-favourite]")?.addEventListener("click",event=>{
    event.preventDefault(); event.stopPropagation();
    const id=event.currentTarget.dataset.favourite;
    const list=Array.isArray(data.favoriteTreasures)?data.favoriteTreasures:[];
    const isDisplayed=list.includes(id);
    data.favoriteTreasures=isDisplayed?list.filter(x=>x!==id):[...list.filter(x=>x!==id),id].slice(-3);
    saveData();
    event.currentTarget.textContent=isDisplayed?"☆ Display in Sanctuary":"★ Displayed in Sanctuary";
    closeTreasureModal();
    toast(isDisplayed?"Removed from your Sanctuary":"Now displayed around your Sanctuary ✨");
  });
}

function bindTreasures(){
  ensureTreasureData();
  document.querySelector("#collectTreasure")?.addEventListener("click",()=>{
    const next=waitingTreasures()[0]; if(!next)return;
    data.treasures[next.id].collected=true; saveData();
    openTreasureModal(next.id,true);
  });
  document.querySelectorAll("[data-treasure]").forEach(card=>card.addEventListener("click",event=>{
    event.preventDefault(); openTreasureModal(card.dataset.treasure);
  }));
}
