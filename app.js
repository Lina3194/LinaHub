
function render(){
  document.body.classList.toggle("dark",data.theme==="dark");
  document.body.dataset.route=route;
  document.querySelectorAll(".route-atmosphere").forEach(el=>el.remove());

  const pages={
    home:HomePage,
    journal:JournalPage,
    today:TodayPage,
    todo:TodoPage,
    plants:PlantsPage,
    plant:PlantProfilePage,
    settings:SettingsPage,
    health:HealthPage,
    medication:MedicationPage,
    pokemon:PokemonPage,
    pets:AquariumsPage,
    tank:AquariumTankPage,
    house:HousePage
  };

  document.querySelector("#app").innerHTML=(pages[route]||HomePage)();
  const atmosphere=document.createElement("div");
  atmosphere.className=`route-atmosphere atmosphere-${route}`;
  atmosphere.setAttribute("aria-hidden","true");
  if(route==="plants"||route==="plant"){
    atmosphere.innerHTML=Array.from({length:14},(_,i)=>`<i class="petal" style="--i:${i}"></i>`).join("");
  }else if(route==="pets"||route==="tank"){
    atmosphere.innerHTML=Array.from({length:13},(_,i)=>`<i class="aqua-bubble" style="--i:${i}"></i>`).join("");
  }
  document.body.appendChild(atmosphere);
  bindGlobal();

  if(route==="home") bindHome();
  if(route==="journal") bindJournal();
  if(route==="today") bindToday();
  if(route==="todo") bindTodo();
  if(route==="plants"||route==="plant") bindPlants();
  if(route==="pokemon") bindPokemon();
  if(route==="house") bindHouse();
  if(route==="medication") bindMedication();
  if(route==="health") bindHealth();
  if(route==="settings") bindSimple();
  if(route==="pets"||route==="tank") bindAquariums();
}

function bindGlobal(){
  document.querySelectorAll("[data-route]").forEach(btn=>btn.onclick=()=>go(btn.dataset.route));
}

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js?v=80"));
}

render();
