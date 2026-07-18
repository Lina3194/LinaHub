
function PokemonPage(){
 const friends=data.pokemonFriends||[];
 const counts={}; friends.forEach(x=>{if(x.vivillon) counts[x.vivillon]=(counts[x.vivillon]||0)+1});
 return shell(`${head("Pokémon GO","Friends, gifts and Vivillon")}
 <section class="card"><div class="stat-grid"><div class="stat"><strong>${friends.length}</strong><span>Total friends</span></div><div class="stat"><strong>${friends.filter(x=>x.active!==false).length}</strong><span>Active</span></div></div></section>
 <section class="card"><h2>Add friend</h2><div class="form-grid">
 <input class="field" id="pokeName" placeholder="Trainer name"><input class="field" id="pokeNickname" placeholder="Nickname">
 <div class="two-col"><select class="field" id="pokeFriendship"><option>Good Friend</option><option>Great Friend</option><option>Ultra Friend</option><option>Best Friend</option></select><input class="field" id="pokeCountry" placeholder="Country"></div>
 <div class="two-col"><input class="field" id="pokeVivillon" placeholder="Vivillon pattern"><input class="field" id="pokeLast" type="date"></div>
 <button class="primary" id="addPokemonFriend">Add friend</button></div></section>
 <section class="card"><h2>Friends</h2><div class="list-card">${friends.length?friends.map((f,i)=>`<div class="item-row"><div><h3>${esc(f.name)}</h3><p>${esc(f.nickname||"No nickname")} · ${esc(f.friendship||"")} · ${esc(f.country||"Unknown")}${f.vivillon?` · ${esc(f.vivillon)}`:""}</p><p>Last interaction: ${f.lastInteraction?esc(formatDate(f.lastInteraction)):"Not set"}</p></div><div class="item-actions"><button class="mini" data-poke-today="${i}">Today</button><button class="mini danger" data-poke-delete="${i}">Delete</button></div></div>`).join(""):`<p>No friends added yet.</p>`}</div></section>
 <section class="card"><h2>Vivillon counts</h2>${Object.keys(counts).length?Object.entries(counts).sort().map(([k,v])=>`<div class="item-row"><span>${esc(k)}</span><strong>${v}</strong></div>`).join(""):`<p>No patterns yet.</p>`}</section>`,"");
}
function bindPokemon(){
 document.querySelector("#addPokemonFriend")?.addEventListener("click",()=>{const name=document.querySelector("#pokeName").value.trim();if(!name){toast("Add a trainer name");return}data.pokemonFriends.push({name,nickname:document.querySelector("#pokeNickname").value.trim(),friendship:document.querySelector("#pokeFriendship").value,country:document.querySelector("#pokeCountry").value.trim(),vivillon:document.querySelector("#pokeVivillon").value.trim(),lastInteraction:document.querySelector("#pokeLast").value,active:true});saveData();render()});
 document.querySelectorAll("[data-poke-today]").forEach(b=>b.onclick=()=>{data.pokemonFriends[+b.dataset.pokeToday].lastInteraction=today();saveData();render()});
 document.querySelectorAll("[data-poke-delete]").forEach(b=>b.onclick=()=>{data.pokemonFriends.splice(+b.dataset.pokeDelete,1);saveData();render()});
}
