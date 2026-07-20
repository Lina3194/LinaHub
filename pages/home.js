function localEntryTimestamp(){
  const now=new Date();
  const pad=n=>String(n).padStart(2,"0");
  return {date:`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`,time:`${pad(now.getHours())}:${pad(now.getMinutes())}`,createdAt:now.toISOString()};
}
function entryTimeLabel(entry){
  if(entry.time) return entry.time;
  if(entry.createdAt){const d=new Date(entry.createdAt);if(!Number.isNaN(d.getTime())) return d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",hour12:false});}
  return "";
}

const HOME_ICON_DEFAULTS={
  journal:"📖",today:"✓",todo:"✎",plants:"🪴",medication:"⚗",pets:"🐠",house:"⌂",treasures:"✦"
};

function ensureHomeIcons(){
  if(!data.homeIcons||typeof data.homeIcons!=="object") data.homeIcons={};
}

function homeIcon(key,label){
  ensureHomeIcons();
  const photo=data.homeIcons[key];
  return `<span class="home-icon-frame">${photo?`<img src="${photo}" alt="${esc(label)}">`:`<span class="home-icon-default home-icon-${key}" aria-hidden="true">${HOME_ICON_DEFAULTS[key]||"✦"}</span>`}</span>`;
}

function editableShelfItem(routeKey,label,subtitle=""){
  return `<div class="shelf-item-wrap">
    <button class="shelf-item" data-route="${routeKey}">${homeIcon(routeKey,label)}<span class="shelf-label"><b>${label}</b>${subtitle?`<small>${subtitle}</small>`:""}</span></button>
    <label class="icon-edit" title="Change ${esc(label)} picture" aria-label="Change ${esc(label)} picture">✎<input type="file" accept="image/*" data-home-icon="${routeKey}" hidden></label>
  </div>`;
}

function sanctuaryFavouriteDecor(){
  const ids=Array.isArray(data.favoriteTreasures)?data.favoriteTreasures:[];
  return ids.map(id=>{
    if(id==="golden-lemon") return `<button class="display-treasure golden-lemon" data-route="treasures" aria-label="Golden Lemon displayed in your Sanctuary"><span class="lemon-fruit"></span><span class="lemon-leaf"></span></button>`;
    if(id==="first-journal") return `<button class="display-treasure tiny-book" data-route="treasures" aria-label="First Chapter displayed in your Sanctuary"><i></i></button>`;
    if(id==="gentle-heart") return `<button class="display-treasure crystal-heart" data-route="treasures" aria-label="Gentle Heart displayed in your Sanctuary"></button>`;
    return `<button class="display-treasure small-orb" data-route="treasures" aria-label="A treasure displayed in your Sanctuary"></button>`;
  }).join("");
}

function HomePage(){
  ensureHomeIcons();
  const hour=new Date().getHours();
  const greeting=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  return shell(`
    <section class="home-welcome">
      <div><span class="section-kicker">LinaHub</span><h1>${greeting}, Lina</h1><p>Welcome home.</p></div>
      <button class="theme-btn" id="themeToggle" aria-label="Change theme">${data.theme==="dark"?"Light":"Night"}</button>
    </section>

    <section class="single-shelf quick-shelf" aria-label="Journal, Today and To-do">
      <div class="shelf-items-row three-items">
        ${editableShelfItem("journal","Journal")}
        ${editableShelfItem("today","Today")}
        ${editableShelfItem("todo","To-do")}
      </div>
      <div class="wood-shelf" aria-hidden="true"></div>
    </section>

    <section class="sanctuary-treasure-display" aria-label="Favourite treasures displayed in your Sanctuary">
      <span class="display-title">Displayed treasures</span>
      <div class="display-row">${sanctuaryFavouriteDecor()||`<small>Choose a treasure to display here</small>`}</div>
    </section>

    <section class="room-shelf-stack" aria-label="LinaHub sections">
      <div class="single-shelf">
        <div class="shelf-items-row two-items">
          ${editableShelfItem("plants","Plants",`${(data.plants||[]).length} growing`)}
          ${editableShelfItem("medication","Potions & Remedies","Medication and health")}
        </div><div class="wood-shelf" aria-hidden="true"></div>
      </div>
      <div class="single-shelf">
        <div class="shelf-items-row two-items">
          ${editableShelfItem("pets","Aquariums",`${(data.aquariums||[]).length} tanks`)}
          ${editableShelfItem("house","House","Rooms and routines")}
        </div><div class="wood-shelf" aria-hidden="true"></div>
      </div>
      <div class="single-shelf treasure-last-shelf">
        <div class="shelf-items-row one-item">
          ${editableShelfItem("treasures","Treasure Room","Your collected memories")}
        </div><div class="wood-shelf" aria-hidden="true"></div>
      </div>
    </section>

    <section class="little-shelf card">
      <div class="little-shelf-row">
        <button data-route="period"><span>🌸</span><b>Period</b></button>
        <button data-route="pokemon"><span><img src="./icons/pokemon.svg?v=173" alt=""></span><b>Pokémon</b></button>
        <button data-route="health"><span class="measure-icon">◒</span><b>Measures</b></button>
        <button data-route="settings"><span class="settings-icon">⚙</span><b>Settings</b></button>
      </div>
    </section>
  `,"home");
}

function resizeHomeIcon(file){
  return new Promise((resolve,reject)=>{
    const reader=new FileReader();
    reader.onerror=()=>reject(new Error("read"));
    reader.onload=()=>{
      const img=new Image();
      img.onerror=()=>reject(new Error("image"));
      img.onload=()=>{
        const size=240;
        const canvas=document.createElement("canvas"); canvas.width=size; canvas.height=size;
        const ctx=canvas.getContext("2d");
        const scale=Math.max(size/img.width,size/img.height);
        const width=img.width*scale,height=img.height*scale;
        ctx.drawImage(img,(size-width)/2,(size-height)/2,width,height);
        resolve(canvas.toDataURL("image/jpeg",.82));
      };
      img.src=reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function bindHome(){
  document.querySelector("#themeToggle")?.addEventListener("click",()=>{data.theme=data.theme==="dark"?"light":"dark";saveData();render()});
  document.querySelectorAll("[data-home-icon]").forEach(input=>input.addEventListener("change",async event=>{
    const file=event.target.files?.[0]; if(!file)return;
    try{
      ensureHomeIcons();
      data.homeIcons[event.target.dataset.homeIcon]=await resizeHomeIcon(file);
      saveData(); toast("Shelf picture updated ✨"); render();
    }catch{toast("That picture could not be added");}
  }));
}
