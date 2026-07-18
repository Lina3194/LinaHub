
function HomePage(){
  const d=new Date();
  const hour=d.getHours();
  const greeting=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  const weekday=d.toLocaleDateString("en-GB",{weekday:"long"});
  const due=[];

  if(weekday==="Thursday") due.push({emoji:"♻️",text:"Put recycling out",route:"house"});
  due.push({emoji:"🐠",text:"Feed both fish tanks",route:"pets"});
  if(data.checkins[today()]) due.push({emoji:"💜",text:"Today’s check-in saved",route:"journal"});

  return shell(`
    <section class="hero">
      <div class="hero-row">
        <div>
          <div class="eyebrow">LinaHub</div>
          <h1>${greeting},<br>Lina ✨</h1>
          <p>A gentle overview of what needs your attention today.</p>
        </div>
        <button class="theme-btn" id="themeToggle">${data.theme==="dark"?"☀️":"🌙"}</button>
      </div>
    </section>

    <div class="grid">
      ${[
        ["📖","Daily Check-in","Pain, energy, sleep and your day","journal"],
        ["⚖️","Weight & Measures","Track weight and measurements","health"],
        ["🌿","Plants","Care and watering","plants"],
        ["💊","Medication","Doses and routines","medication"],
        ["🔴","Pokémon GO","Friend tracker coming later","pokemon"],
        ["🐠","Aquariums","Girls and boys tanks","pets"],
        ["🏡","House","Rooms and recurring tasks","house"],
        ["⚙️","Settings","Theme and backup","settings"]
      ].map(x=>`<button class="module" data-route="${x[3]}"><span class="emoji">${x[0]}</span><strong>${x[1]}</strong><small>${x[2]}</small></button>`).join("")}
    </div>

    <section class="card" style="margin-top:14px">
      <h2>Today’s</h2>
      <div class="today-list">
        ${due.map(item=>`<button class="reminder" data-route="${item.route}"><b>${item.emoji}</b><span>${item.text}</span></button>`).join("")}
      </div>
    </section>
  `,"home");
}

function bindHome(){
  const toggle=document.querySelector("#themeToggle");
  if(toggle) toggle.onclick=()=>{data.theme=data.theme==="dark"?"light":"dark";saveData();render()};
}
