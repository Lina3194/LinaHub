
function render(){
  document.body.classList.toggle("dark",data.theme==="dark");

  const pages={
    home:HomePage,
    journal:JournalPage,
    plants:PlantsPage,
    plant:PlantProfilePage,
    settings:SettingsPage,
    health:()=>SimplePage("Health","⚖️","Pain, sleep and energy history"),
    medication:()=>SimplePage("Medication","💊","Medication and dose tracking"),
    pokemon:()=>SimplePage("Pokémon GO","🔴","Friend and Vivillon tracker"),
    pets:()=>SimplePage("Aquariums","🐠","Girls and boys tanks"),
    house:()=>SimplePage("House","🏡","Rooms and recurring routines","house")
  };

  document.querySelector("#app").innerHTML=(pages[route]||HomePage)();
  bindGlobal();

  if(route==="home") bindHome();
  if(route==="journal") bindJournal();
  if(route==="plants"||route==="plant") bindPlants();
  if(["settings","health","medication","pokemon","pets","house"].includes(route)) bindSimple();
}

function bindGlobal(){
  document.querySelectorAll("[data-route]").forEach(btn=>btn.onclick=()=>go(btn.dataset.route));
}

if("serviceWorker" in navigator){
  window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js?v=52"));
}

render();
