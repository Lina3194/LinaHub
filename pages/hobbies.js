
function HobbiesPage(){
  const plantCount=(data.plants||[]).length;
  const friendCount=(data.pokemonFriends||[]).filter(friend=>friend.active!==false).length;
  const tankCount=(data.aquariums||[]).length;
  const finished=(data.books||[]).filter(book=>book.status==="finished").length;
  return shell(`${head("Hobbies","Everything you enjoy, together")}
    <section class="card hobbies-hero"><span class="section-kicker">Your cosy corner</span><h2>What are you in the mood for?</h2><p>Open a hobby and carry on exactly where you left off.</p></section>
    <section class="health-module-grid hobbies-module-grid">
      <button data-route="plants"><span>${moduleVisual("plants","🌿")}</span><strong>Plants</strong><small>${plantCount} plant${plantCount===1?"":"s"}</small></button>
      <button data-route="pets"><span>${moduleVisual("pets","🐠")}</span><strong>Aquariums</strong><small>${tankCount} tank${tankCount===1?"":"s"}</small></button>
      <button data-route="pokemon"><span>${moduleVisual("pokemon","🔴")}</span><strong>Pokémon GO</strong><small>${friendCount} active friends</small></button>
      <button data-route="books"><span>${moduleVisual("books","📚")}</span><strong>Books</strong><small>${finished} finished</small></button>
      <button data-route="gaming"><span>${moduleVisual("gaming","🎮")}</span><strong>Gaming</strong><small>Games and progress</small></button>
    </section>
  `,"hobbies");
}
function bindHobbies(){}
