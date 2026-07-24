(function(){
  let busy=false;
  function compactPokemon(){
    if(document.body.dataset.route!=="pokemon") return;

    const tabs=document.querySelector(".poke-tabs");
    if(tabs){
      ["vivillon","stats","import"].forEach(view=>{
        const button=tabs.querySelector(`[data-poke-view="${view}"]`);
        if(button) button.hidden=true;
      });
      const hiddenActive=tabs.querySelector('[data-poke-view="vivillon"].active,[data-poke-view="stats"].active,[data-poke-view="import"].active');
      if(hiddenActive){
        const friends=tabs.querySelector('[data-poke-view="friends"]');
        if(friends) setTimeout(()=>friends.click(),0);
        return;
      }
    }

    const friendship=document.querySelector("#pokeFriendshipFilter");
    const vivillon=document.querySelector("#pokeVivillonFilter");
    const interaction=document.querySelector("#pokeInactivityFilter");
    if(!friendship||!vivillon||!interaction||friendship.closest(".poke-filter-drawer")) return;

    const oldRow=friendship.closest(".two-col");
    const drawer=document.createElement("details");
    drawer.className="poke-filter-drawer";
    const summary=document.createElement("summary");
    summary.textContent="Filter friends";
    const fields=document.createElement("div");
    fields.className="poke-filter-drawer-fields";
    fields.append(friendship,vivillon,interaction);
    drawer.append(summary,fields);
    if(oldRow) oldRow.replaceWith(drawer);
    else interaction.before(drawer);
  }

  function apply(){
    if(busy) return;
    busy=true;
    try{ compactPokemon(); }finally{ busy=false; }
  }
  const observer=new MutationObserver(apply);
  const start=()=>{
    const app=document.querySelector("#app");
    if(app) observer.observe(app,{childList:true,subtree:true});
    apply();
  };
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start);
  else start();
})();
