
function localEntryTimestamp(){
  const now=new Date();
  const pad=n=>String(n).padStart(2,"0");
  return {
    date:`${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`,
    time:`${pad(now.getHours())}:${pad(now.getMinutes())}`,
    createdAt:now.toISOString()
  };
}
function entryTimeLabel(entry){
  if(entry.time) return entry.time;
  if(entry.createdAt){
    const d=new Date(entry.createdAt);
    if(!Number.isNaN(d.getTime())){
      return d.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit",hour12:false});
    }
  }
  return "";
}


function HomePage(){
  const d=new Date();
  const hour=d.getHours();
  const greeting=hour<12?"Good morning":hour<18?"Good afternoon":"Good evening";
  const weekday=d.toLocaleDateString("en-GB",{weekday:"long"});
  const due=[];

  if(weekday==="Thursday") due.push({emoji:"♻️",text:"Put recycling out",route:"house"});
  const tanksNeedingFeed=(data.aquariums||[]).filter(tank=>!tankFeedToday(tank));
  if(tanksNeedingFeed.length){
    due.push({
      emoji:"🐠",
      text:tanksNeedingFeed.length===(data.aquariums||[]).length
        ?"Feed both fish tanks"
        :`Feed ${tanksNeedingFeed.map(t=>t.name).join(" & ")}`,
      route:"pets"
    });
  }
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
        [data.homeIcons?.journal||"📖","Daily Check-in","Pain, energy, sleep and your day","journal"],
        [data.homeIcons?.health||"⚖️","Weight & Measures","Track weight and measurements","health"],
        [data.homeIcons?.plants||"🌿","Plants","Care and watering","plants"],
        [data.homeIcons?.medication||"💊","Medication","Doses and routines","medication"],
        [data.homeIcons?.pokemon||"🔴","Pokémon GO","Friend tracker coming later","pokemon"],
        [data.homeIcons?.pets||"🐠","Aquariums","Girls and boys tanks","pets"],
        [data.homeIcons?.house||"🏡","House","Rooms and recurring tasks","house"],
        [data.homeIcons?.settings||"⚙️","Settings","Theme and backup","settings"]
      ].map(x=>`<button type="button" class="module module-${x[3]}" data-route="${x[3]}">${data.homeImages?.[x[3]]?`<span class="module-image"><img src="${data.homeImages[x[3]]}" alt=""></span>`:`<span class="emoji">${x[0]}</span>`}<strong>${x[1]}</strong><small>${x[2]}</small></button>`).join("")}
    </div>

    <section class="card" style="margin-top:14px">
      <button class="today-heading" data-route="today"><span><h2>Today’s</h2><small>Open your full task list</small></span><b>›</b></button>
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
