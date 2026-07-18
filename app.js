
function render(){
  document.body.classList.toggle("dark",data.theme==="dark");

  const pages={
    home:HomePage,
    journal:JournalPage,
    today:TodayPage,
    plants:PlantsPage,
    plant:PlantProfilePage,
    settings:SettingsPage,
    health:HealthPage,
    medication:MedicationPage,
    pokemon:PokemonPage,
    pets:()=>SimplePage("Aquariums","🐠","Girls and boys tanks"),
    house:HousePage
  };

  document.querySelector("#app").innerHTML=(pages[route]||HomePage)();
  bindGlobal();

  if(route==="home") bindHome();
  if(route==="journal") bindJournal();
  if(route==="plants"||route==="plant") bindPlants();
  if(route==="pokemon") bindPokemon();
  if(route==="house") bindHouse();
  if(route==="medication") bindMedication();
  if(route==="health") bindHealth();
  if(["settings","pets"].includes(route)) bindSimple();
}

function bindGlobal(){
  document.querySelectorAll("[data-route]").forEach(btn=>btn.onclick=()=>go(btn.dataset.route));
}

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js?v=54"));
}

render();
