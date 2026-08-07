function addDays(dateValue,days){const d=new Date(`${dateValue}T12:00:00`);d.setDate(d.getDate()+Number(days||0));return d.toISOString().slice(0,10)}

function plantPhotoKey(plant){return plant.photoKey||`plant:${plant.id}`}
function plantPhotoSrc(plant){return plant.photo||LinaImage.peek(plantPhotoKey(plant))||""}
const PLANT_ENCYCLOPEDIA=[
  {id:"lemon-tree",name:"Lemon Tree",scientific:"Citrus limon",emoji:"🍋",light:"Very bright light; several hours of direct sun is ideal.",water:"Water thoroughly when the top 2–3 cm of compost feels dry. Do not leave it sitting in water.",humidity:"Normal household humidity is usually fine.",temperature:"Prefers warmth; protect from cold draughts and frost.",feeding:"Citrus feed every 1–2 weeks in spring and summer; reduce in winter.",soil:"Free-draining citrus or houseplant compost with added perlite.",tips:["Turn the pot regularly for even growth.","Yellow leaves can mean overwatering, poor drainage or a nutrient shortage.","Repot only one size up when roots are crowded."],wateringDays:7},
  {id:"basil",name:"Basil",scientific:"Ocimum basilicum",emoji:"🌿",light:"Bright light with around 6 hours of sun. Shield from harsh scorching midday sun behind glass.",water:"Keep lightly and evenly moist. Water when the surface begins to feel dry.",humidity:"Average humidity; good airflow helps prevent mildew.",temperature:"Warm conditions, ideally above 15°C.",feeding:"Half-strength liquid feed every 2–4 weeks while actively growing.",soil:"Rich but free-draining multipurpose compost.",tips:["Pinch out flower buds to keep leaves tender and encourage bushy growth.","Harvest just above a pair of leaves.","Avoid leaving the roots waterlogged."],wateringDays:3},
  {id:"greek-oregano",name:"Greek Oregano",scientific:"Origanum vulgare subsp. hirtum",emoji:"🌱",light:"Full sun or the brightest window available.",water:"Allow the compost to dry noticeably between waterings.",humidity:"Prefers drier air and good airflow.",temperature:"Tolerates normal indoor temperatures; hardy outdoors in suitable conditions.",feeding:"Feed sparingly; too much fertiliser can reduce flavour.",soil:"Very free-draining compost, ideally with grit or perlite.",tips:["Trim regularly to prevent legginess.","Do not keep constantly damp.","Strong light produces the best flavour."],wateringDays:7},
  {id:"orchid",name:"Orchid",scientific:"Phalaenopsis hybrid",emoji:"🌸",light:"Bright indirect light; an east or filtered south/west window works well.",water:"Soak the bark thoroughly, then drain completely. Water again when roots look silvery and the pot feels light.",humidity:"Moderate humidity with gentle airflow.",temperature:"Normal warm indoor temperatures; avoid cold draughts.",feeding:"Weak orchid fertiliser every 2–4 waterings during active growth.",soil:"Orchid bark, never ordinary dense compost.",tips:["Healthy wet roots are green; dry roots are silvery.","Keep water out of the crown.","Trim only dead, hollow or mushy roots with clean scissors."],wateringDays:9},
  {id:"nemesia-vanilla",name:"Nemesia 'Vanilla'",scientific:"Nemesia hybrid",emoji:"🌼",light:"Full sun to bright partial shade.",water:"Keep evenly moist but not waterlogged, especially while flowering.",humidity:"Normal outdoor or household humidity with airflow.",temperature:"Prefers cooler conditions and may struggle in strong heat.",feeding:"Balanced liquid feed every 2–3 weeks while blooming.",soil:"Fertile, free-draining multipurpose compost.",tips:["Deadhead faded flowers to encourage more blooms.","Trim lightly if growth becomes straggly.","Protect the pot from drying out completely."],wateringDays:3},
  {id:"spider-plant",name:"Spider Plant",scientific:"Chlorophytum comosum",emoji:"🪴",light:"Bright indirect light, though it tolerates medium light.",water:"Water when the top few centimetres feel dry. Slight drying is safer than constant wetness.",humidity:"Average humidity; brown tips can worsen in very dry air.",temperature:"Normal indoor temperatures; avoid frost.",feeding:"Monthly half-strength feed in spring and summer.",soil:"Standard free-draining houseplant compost.",tips:["Brown tips may come from salts, dry air or irregular watering.","Plantlets can be rooted in water or compost.","It tolerates being slightly root-bound."],wateringDays:7},
  {id:"prayer-plant",name:"Prayer Plant",scientific:"Maranta leuconeura",emoji:"🍃",light:"Bright indirect light; direct sun can fade or scorch leaves.",water:"Keep lightly moist, watering when the surface just begins to dry. Use rainwater or filtered water where possible.",humidity:"Likes higher humidity.",temperature:"Warm and stable; avoid cold draughts.",feeding:"Half-strength feed monthly in spring and summer.",soil:"Moisture-retentive but airy houseplant mix with perlite.",tips:["Crispy edges often point to dry air, hard water or underwatering.","Leaves naturally fold upward at night.","Do not let the pot sit in water."],wateringDays:5},
  {id:"apple-seeds",name:"Apple Seeds",scientific:"Malus domestica",emoji:"🍎",light:"After germination, provide very bright light and gradually introduce direct sun.",water:"Keep seed compost lightly moist, never sodden.",humidity:"A covered container can help during germination, but ventilate to prevent mould.",temperature:"Seeds usually need a cold, moist stratification period before warmth.",feeding:"Do not feed until seedlings have several true leaves; then use a very weak balanced feed.",soil:"Fine seed compost initially, then free-draining potting compost.",tips:["Chill moist seeds in the fridge for roughly 6–10 weeks.","Seed-grown apples will not grow true to the parent fruit.","Remove any mouldy seeds promptly."],wateringDays:4},
  {id:"strawberry",name:"Strawberry",scientific:"Fragaria × ananassa",emoji:"🍓",light:"Full sun is best, though light partial shade is tolerated.",water:"Keep the compost evenly moist, especially while flowering and fruiting, but do not leave the roots waterlogged.",humidity:"Normal outdoor or household humidity with good airflow.",temperature:"Prefers cool to mild conditions; protect container plants from hard frost and extreme heat.",feeding:"Use a high-potassium feed every 1–2 weeks once flowers appear.",soil:"Fertile, moisture-retentive but well-drained compost or soil.",tips:["Water at the base to keep flowers and fruit drier.","Remove excess runners unless you want new plants.","Watch for slugs, snails and grey mould around ripening fruit."],wateringDays:3},
  {id:"pink-kiss",name:"Pink Kiss",scientific:"Dianthus Pink Kisses",emoji:"🌸",light:"Full sun or the brightest available position.",water:"Water when the top 2–3 cm of compost feels dry. Allow excess water to drain fully.",humidity:"Average humidity with good airflow.",temperature:"Prefers cooler bright conditions and can struggle in hot, stuffy rooms.",feeding:"Feed lightly every 2–3 weeks while actively flowering.",soil:"Free-draining multipurpose compost with added grit or perlite.",tips:["Deadhead faded flowers to encourage more blooms.","Avoid keeping the crown constantly wet.","A bright outdoor position is usually better than a warm indoor room."],wateringDays:4},
  {id:"pothos",name:"Pothos",scientific:"Epipremnum aureum",emoji:"🌿",light:"Bright indirect light; tolerates lower light with slower growth.",water:"Allow the top half of the compost to dry before watering thoroughly.",humidity:"Average household humidity is fine.",temperature:"Warm indoor conditions; avoid cold draughts.",feeding:"Monthly in spring and summer at half strength.",soil:"Free-draining houseplant compost.",tips:["Prune above a node for bushier growth.","Yellow leaves often follow overwatering.","Toxic if eaten by pets or people."],wateringDays:8},
  {id:"peace-lily",name:"Peace Lily",scientific:"Spathiphyllum",emoji:"🤍",light:"Medium to bright indirect light.",water:"Water when the top 2–3 cm dries; it may droop dramatically when thirsty.",humidity:"Enjoys moderate to high humidity.",temperature:"Warm indoor temperatures away from draughts.",feeding:"Monthly weak feed in spring and summer.",soil:"Moisture-retentive but draining houseplant compost.",tips:["Wipe leaves to keep them dust-free.","Brown tips can reflect salts or dry air.","Toxic if eaten by pets or people."],wateringDays:6},
  {id:"snake-plant",name:"Snake Plant",scientific:"Dracaena trifasciata",emoji:"🌵",light:"Bright indirect light is best, but it tolerates lower light.",water:"Let the compost dry fully before watering again.",humidity:"Normal or dry household air.",temperature:"Keep above roughly 10°C.",feeding:"Light feed every 6–8 weeks in spring and summer.",soil:"Very free-draining cactus or succulent mix.",tips:["Overwatering is the main danger.","Use a pot with drainage holes.","Toxic if eaten by pets."],wateringDays:18},
  {id:"aloe-vera",name:"Aloe Vera",scientific:"Aloe barbadensis miller",emoji:"🌵",light:"Very bright light with some direct sun, introduced gradually.",water:"Soak thoroughly, then let the compost dry completely.",humidity:"Prefers dry air.",temperature:"Warm conditions; protect from frost.",feeding:"Very weak succulent feed a few times during spring and summer.",soil:"Cactus or succulent compost with excellent drainage.",tips:["Soft translucent leaves often mean too much water.","Rotate for even growth.","Use a heavy pot if the plant becomes top-heavy."],wateringDays:18},
  {id:"miniature-rose",name:"Miniature Rose",scientific:"Rosa hybrid",emoji:"🌹",light:"Full sun or the brightest window available; aim for at least 6 hours of direct light.",water:"Water thoroughly when the top 2 cm feels dry. Never leave the pot standing in water.",humidity:"Average humidity with good airflow.",temperature:"Prefers cooler bright conditions; keep away from radiators.",feeding:"Rose feed every 2 weeks while flowering.",soil:"Rich, free-draining rose or multipurpose compost.",tips:["Remove faded blooms to encourage more flowers.","A decorative vase or cover pot must not trap drainage water.","Check regularly for aphids and spider mites."],wateringDays:4},
  {id:"monstera",name:"Monstera",scientific:"Monstera deliciosa",emoji:"🌿",light:"Bright indirect light; gentle morning sun is fine.",water:"Water when the top 3–5 cm is dry.",humidity:"Average to higher humidity.",temperature:"Warm indoor temperatures away from draughts.",feeding:"Monthly in spring and summer.",soil:"Chunky free-draining aroid mix.",tips:["Give mature plants a moss pole.","Wipe large leaves regularly.","Toxic if eaten."],wateringDays:8},
  {id:"rubber-plant",name:"Rubber Plant",scientific:"Ficus elastica",emoji:"🌳",light:"Bright indirect light.",water:"Water when the upper compost has dried.",humidity:"Average humidity.",temperature:"Warm and stable; avoid sudden moves.",feeding:"Monthly in active growth.",soil:"Free-draining houseplant compost.",tips:["Wipe leaves clean.","Sap can irritate skin.","Toxic if eaten."],wateringDays:9},
  {id:"zz-plant",name:"ZZ Plant",scientific:"Zamioculcas zamiifolia",emoji:"🌿",light:"Medium to bright indirect light; tolerates low light.",water:"Let the compost dry almost completely.",humidity:"Average household humidity.",temperature:"Normal indoor warmth.",feeding:"Light feed every 6–8 weeks.",soil:"Very free-draining mix.",tips:["Overwatering is the main risk.","Growth is naturally slow.","Toxic if eaten."],wateringDays:18},
  {id:"calathea",name:"Calathea",scientific:"Goeppertia species",emoji:"🍃",light:"Bright indirect light.",water:"Keep lightly moist using rain or filtered water.",humidity:"High humidity is helpful.",temperature:"Warm and draught-free.",feeding:"Weak monthly feed in spring and summer.",soil:"Airy moisture-retentive mix.",tips:["Crispy edges often mean dry air or hard water.","Avoid direct sun.","Keep conditions consistent."],wateringDays:5},
  {id:"string-of-hearts",name:"String of Hearts",scientific:"Ceropegia woodii",emoji:"💚",light:"Very bright indirect light with some gentle sun.",water:"Allow most of the compost to dry.",humidity:"Average to dry air.",temperature:"Warm indoor temperatures.",feeding:"Weak monthly feed in growth.",soil:"Succulent-style free-draining compost.",tips:["Tuber-like beads can be pressed into compost to propagate.","Avoid a permanently wet pot.","Trim to encourage branching."],wateringDays:12},
  {id:"jade-plant",name:"Jade Plant",scientific:"Crassula ovata",emoji:"🪴",light:"Very bright light with some direct sun.",water:"Let compost dry fully before watering.",humidity:"Dry air is fine.",temperature:"Warm days and cooler nights are suitable.",feeding:"Light succulent feed in spring and summer.",soil:"Cactus and succulent compost.",tips:["Wrinkled leaves can mean thirst.","Soft leaves often mean excess water.","Use a heavy pot for stability."],wateringDays:16},
  {id:"lavender",name:"Lavender",scientific:"Lavandula angustifolia",emoji:"💜",light:"Full direct sun.",water:"Allow compost to dry between waterings.",humidity:"Prefers dry air and airflow.",temperature:"Cool to warm; hardy outdoors.",feeding:"Feed sparingly.",soil:"Very gritty free-draining compost.",tips:["Indoor lavender often struggles without enough sun.","Trim after flowering.","Never leave waterlogged."],wateringDays:7},
  {id:"rosemary",name:"Rosemary",scientific:"Salvia rosmarinus",emoji:"🌿",light:"Full sun.",water:"Water when the top few centimetres dry; drain well.",humidity:"Dry air and strong airflow.",temperature:"Cool bright conditions suit it.",feeding:"Light feed monthly in growth.",soil:"Gritty free-draining compost.",tips:["Do not let roots sit in water.","Prune lightly and regularly.","Strong light improves flavour."],wateringDays:7},
  {id:"mint",name:"Mint",scientific:"Mentha species",emoji:"🌱",light:"Bright light to partial sun.",water:"Keep evenly moist.",humidity:"Average humidity.",temperature:"Cool to warm conditions.",feeding:"Monthly feed in containers.",soil:"Rich moisture-retentive compost.",tips:["Pinch tips for bushier growth.","Best kept in its own pot.","Cut back tired growth."],wateringDays:3},
  {id:"thyme",name:"Thyme",scientific:"Thymus vulgaris",emoji:"🌿",light:"Full sun.",water:"Let compost dry well between watering.",humidity:"Dry air and airflow.",temperature:"Normal indoor or outdoor temperatures.",feeding:"Feed very lightly.",soil:"Gritty free-draining compost.",tips:["Avoid overwatering.","Trim after flowering.","Harvest regularly."],wateringDays:8},
  {id:"parsley",name:"Parsley",scientific:"Petroselinum crispum",emoji:"🌿",light:"Bright light with several hours of sun.",water:"Keep evenly moist but drained.",humidity:"Average humidity.",temperature:"Prefers cooler conditions.",feeding:"Liquid feed monthly.",soil:"Rich free-draining compost.",tips:["Harvest outer stems first.","It is naturally biennial.","Do not let seedlings dry out."],wateringDays:4},
  {id:"chives",name:"Chives",scientific:"Allium schoenoprasum",emoji:"🌱",light:"Full sun to bright light.",water:"Keep lightly moist.",humidity:"Average humidity.",temperature:"Cool to warm conditions.",feeding:"Monthly light feed.",soil:"Free-draining multipurpose compost.",tips:["Cut leaves near the base.","Remove flowers if leaf production is the priority.","Divide congested clumps."],wateringDays:4},
  {id:"succulent-mix",name:"Mixed Succulents",scientific:"Various succulent species",emoji:"🌵",light:"Very bright light, often with direct sun.",water:"Soak then dry completely.",humidity:"Dry air.",temperature:"Warm conditions; avoid frost.",feeding:"Very weak feed in spring and summer.",soil:"Cactus and succulent compost.",tips:["Different species may have slightly different needs.","Use drainage holes.","Stretching means insufficient light."],wateringDays:16},
  {id:"echeveria",name:"Echeveria",scientific:"Echeveria species",emoji:"🌵",light:"Strong light with direct sun introduced gradually.",water:"Water deeply only when fully dry.",humidity:"Dry air.",temperature:"Warm, with a cooler winter rest.",feeding:"Weak succulent feed occasionally.",soil:"Mineral-rich succulent mix.",tips:["Keep water out of the rosette.","Remove dead lower leaves.","Leggy growth means more light is needed."],wateringDays:18},
  {id:"christmas-cactus",name:"Christmas Cactus",scientific:"Schlumbergera hybrid",emoji:"🌸",light:"Bright indirect light.",water:"Water when the top layer dries; slightly less after flowering.",humidity:"Moderate humidity.",temperature:"Normal indoor warmth with cooler nights for bud formation.",feeding:"Monthly during growth.",soil:"Airy free-draining mix.",tips:["Do not move repeatedly once buds form.","It is a tropical cactus, not a desert cactus.","Repot only when crowded."],wateringDays:8},
  {id:"anthurium",name:"Anthurium",scientific:"Anthurium andraeanum",emoji:"❤️",light:"Bright indirect light.",water:"Water when the top 2–3 cm dries.",humidity:"Likes higher humidity.",temperature:"Warm and stable.",feeding:"Weak monthly feed.",soil:"Chunky aroid mix.",tips:["Keep leaves clean.","Avoid cold draughts.","Toxic if eaten."],wateringDays:7},
  {id:"african-violet",name:"African Violet",scientific:"Streptocarpus ionanthus",emoji:"🌸",light:"Bright indirect light.",water:"Water when the surface begins to dry, preferably from below.",humidity:"Moderate humidity without wet leaves.",temperature:"Warm stable temperatures.",feeding:"Specialist violet feed every 2–4 weeks.",soil:"Light airy African violet mix.",tips:["Avoid cold water on leaves.","Remove spent flowers.","A snug pot encourages blooming."],wateringDays:5},
  {id:"begonia",name:"Begonia",scientific:"Begonia hybrid",emoji:"🌺",light:"Bright indirect light.",water:"Water when the top layer dries; avoid soggy compost.",humidity:"Moderate humidity and airflow.",temperature:"Warm indoor conditions.",feeding:"Weak feed every 2–4 weeks.",soil:"Airy moisture-retentive compost.",tips:["Avoid wetting fuzzy leaves.","Pinch tips for fullness.","Watch for mildew."],wateringDays:6},
  {id:"geranium",name:"Geranium",scientific:"Pelargonium hybrid",emoji:"🌺",light:"Very bright light with direct sun.",water:"Water when the top compost dries.",humidity:"Average to dry air.",temperature:"Warm days; protect from frost.",feeding:"Flowering feed every 2 weeks.",soil:"Free-draining multipurpose compost.",tips:["Deadhead regularly.","Pinch back leggy stems.","Let the pot drain fully."],wateringDays:5},
  {id:"hydrangea",name:"Hydrangea",scientific:"Hydrangea macrophylla",emoji:"🌸",light:"Bright light or morning sun with afternoon shade.",water:"Keep evenly moist; do not allow complete drying.",humidity:"Average humidity.",temperature:"Prefers cooler conditions.",feeding:"Hydrangea feed during active growth.",soil:"Rich moisture-retentive compost.",tips:["Small gift plants often need frequent watering.","Move outdoors gradually when suitable.","Flower colour can be influenced by soil chemistry."],wateringDays:3},
  {id:"azalea",name:"Azalea",scientific:"Rhododendron simsii",emoji:"🌺",light:"Bright indirect light or cool morning sun.",water:"Keep evenly moist with rainwater where possible.",humidity:"Likes humidity.",temperature:"Cool conditions prolong flowering.",feeding:"Acid-loving plant feed after flowering.",soil:"Ericaceous compost.",tips:["Never let the root ball dry completely.","Keep away from radiators.","Toxic if eaten."],wateringDays:3},
  {id:"cyclamen",name:"Cyclamen",scientific:"Cyclamen persicum",emoji:"🌸",light:"Bright indirect light.",water:"Water from below when the compost starts to dry.",humidity:"Average humidity with airflow.",temperature:"Prefers cool rooms.",feeding:"Weak flowering feed every 2–3 weeks.",soil:"Free-draining multipurpose compost.",tips:["Avoid water in the crown.","Remove spent stems with a gentle twist.","It may become dormant after flowering."],wateringDays:4},
  {id:"poinsettia",name:"Poinsettia",scientific:"Euphorbia pulcherrima",emoji:"🌺",light:"Bright indirect light.",water:"Water when the surface dries; drain completely.",humidity:"Average humidity.",temperature:"Warm and away from cold draughts.",feeding:"Feed monthly after the coloured bracts fade.",soil:"Free-draining houseplant compost.",tips:["Cold exposure causes leaf drop.","Sap can irritate skin.","Recolouring requires controlled long nights."],wateringDays:6},
  {id:"boston-fern",name:"Boston Fern",scientific:"Nephrolepis exaltata",emoji:"🌿",light:"Bright indirect light.",water:"Keep consistently lightly moist.",humidity:"High humidity.",temperature:"Cool to normal indoor warmth.",feeding:"Weak monthly feed in growth.",soil:"Moisture-retentive airy compost.",tips:["Crispy fronds usually mean dryness.","Mist or use a humidifier.","Trim dead fronds at the base."],wateringDays:4},
  {id:"maidenhair-fern",name:"Maidenhair Fern",scientific:"Adiantum raddianum",emoji:"🌿",light:"Bright filtered light.",water:"Never let the compost fully dry.",humidity:"High humidity.",temperature:"Warm and stable.",feeding:"Very weak monthly feed.",soil:"Fine moisture-retentive compost.",tips:["It dislikes sudden changes.","Rainwater is helpful.","Cut back dead growth and keep moist for regrowth."],wateringDays:3},
  {id:"english-ivy",name:"English Ivy",scientific:"Hedera helix",emoji:"🍃",light:"Bright indirect light; some gentle sun.",water:"Water when the surface dries.",humidity:"Moderate humidity and airflow.",temperature:"Prefers cooler rooms.",feeding:"Monthly weak feed.",soil:"Free-draining houseplant compost.",tips:["Prune to keep compact.","Watch for spider mites.","Toxic if eaten."],wateringDays:6},
  {id:"philodendron",name:"Heartleaf Philodendron",scientific:"Philodendron hederaceum",emoji:"💚",light:"Bright indirect light; tolerates medium light.",water:"Water when the top few centimetres dry.",humidity:"Average to higher humidity.",temperature:"Warm indoor conditions.",feeding:"Monthly in spring and summer.",soil:"Chunky aroid mix.",tips:["Pinch or prune for bushier growth.","Can climb or trail.","Toxic if eaten."],wateringDays:8},
  {id:"syngonium",name:"Arrowhead Plant",scientific:"Syngonium podophyllum",emoji:"🍃",light:"Bright indirect light.",water:"Water when the top 2–3 cm dries.",humidity:"Moderate humidity.",temperature:"Warm indoor conditions.",feeding:"Monthly weak feed.",soil:"Airy houseplant compost.",tips:["Leaves change shape as the plant matures.","Prune to keep compact.","Toxic if eaten."],wateringDays:7},
  {id:"dracaena",name:"Dragon Tree",scientific:"Dracaena marginata",emoji:"🌴",light:"Bright indirect light; tolerates medium light.",water:"Let roughly half the compost dry.",humidity:"Average humidity.",temperature:"Warm and draught-free.",feeding:"Light monthly feed in growth.",soil:"Free-draining houseplant compost.",tips:["Filtered water can reduce brown tips.","Do not overwater.","Toxic to pets."],wateringDays:10},
  {id:"parlour-palm",name:"Parlour Palm",scientific:"Chamaedorea elegans",emoji:"🌴",light:"Medium to bright indirect light.",water:"Water when the top layer dries.",humidity:"Moderate humidity.",temperature:"Normal indoor warmth.",feeding:"Weak monthly feed in spring and summer.",soil:"Free-draining houseplant compost.",tips:["Avoid harsh direct sun.","It grows slowly.","Non-toxic to cats and dogs."],wateringDays:8},
  {id:"areca-palm",name:"Areca Palm",scientific:"Dypsis lutescens",emoji:"🌴",light:"Bright indirect light.",water:"Keep lightly moist but drained.",humidity:"Likes higher humidity.",temperature:"Warm and away from draughts.",feeding:"Monthly palm feed in growth.",soil:"Airy free-draining compost.",tips:["Brown tips can mean dry air or salts.","Rotate for even growth.","Do not leave standing in water."],wateringDays:6},
  {id:"croton",name:"Croton",scientific:"Codiaeum variegatum",emoji:"🍂",light:"Very bright indirect light with some gentle sun.",water:"Water when the top 2–3 cm dries.",humidity:"Likes humidity.",temperature:"Warm and very stable.",feeding:"Monthly feed in growth.",soil:"Rich free-draining compost.",tips:["Sudden changes can cause leaf drop.","Bright light keeps colours vivid.","Sap is irritating and plant is toxic."],wateringDays:6},
  {id:"fittonia",name:"Nerve Plant",scientific:"Fittonia albivenis",emoji:"🌿",light:"Medium to bright indirect light.",water:"Keep lightly and consistently moist.",humidity:"High humidity.",temperature:"Warm stable temperatures.",feeding:"Weak monthly feed.",soil:"Moisture-retentive airy mix.",tips:["It droops dramatically when thirsty.","Pinch tips for bushiness.","Excellent for terrariums."],wateringDays:4},
  {id:"pilea",name:"Chinese Money Plant",scientific:"Pilea peperomioides",emoji:"🪴",light:"Bright indirect light.",water:"Water when the top few centimetres dry.",humidity:"Average humidity.",temperature:"Normal indoor temperatures.",feeding:"Monthly weak feed.",soil:"Free-draining houseplant compost.",tips:["Rotate regularly.","Separate pups when established.","Drooping can mean thirst or excess water."],wateringDays:7},
  {id:"hoya",name:"Wax Plant",scientific:"Hoya carnosa",emoji:"🌸",light:"Bright indirect light with some gentle sun.",water:"Allow most of the compost to dry.",humidity:"Moderate humidity.",temperature:"Warm indoor conditions.",feeding:"Weak monthly feed in growth.",soil:"Chunky free-draining mix.",tips:["Do not remove old flower spurs.","Likes being slightly pot-bound.","Avoid frequent moves while budding."],wateringDays:11},
  {id:"venus-flytrap",name:"Venus Flytrap",scientific:"Dionaea muscipula",emoji:"🌱",light:"Full direct sun.",water:"Stand the pot in a shallow tray of rain or distilled water during growth.",humidity:"Average humidity with airflow.",temperature:"Needs a cool winter dormancy.",feeding:"Do not fertilise the compost.",soil:"Nutrient-poor carnivorous plant mix.",tips:["Never use tap water in hard-water areas.","Do not trigger traps for fun.","It needs winter dormancy to remain healthy."],wateringDays:2}
];

let plantUi={view:"collection",encyclopediaSearch:"",encyclopediaOpen:null};
function encyclopediaEntry(id,name){return PLANT_ENCYCLOPEDIA.find(x=>x.id===id)||PLANT_ENCYCLOPEDIA.find(x=>x.name.toLowerCase()===String(name||"").toLowerCase())}
function plantStatus(p){
  const guide=encyclopediaEntry(p.guideId||p.id,p.name);
  const threshold=Number(p.wateringDays)||guide?.wateringDays||5;
  if(!p.lastWatered) return {text:"Needs attention",className:"attention",icon:"🔔",days:null,threshold};
  const days=Math.floor((new Date(today()+"T12:00:00")-new Date(p.lastWatered+"T12:00:00"))/86400000);
  return days>=threshold?{text:`${days} days ago`,className:"attention",icon:"🔔",days,threshold}:{text:"All good",className:"good",icon:"🌿",days,threshold};
}
function plantProfileTab(){return ["care","history","photos","notes"].includes(data.plantProfileTab)?data.plantProfileTab:"care"}
function careGuideHtml(guide){
  if(!guide)return `<section class="card clean-card"><h2>No care guide linked yet</h2><p>Open the encyclopedia and choose the closest match for this plant.</p></section>`;
  return `<section class="card clean-card plant-care-guide">
    <div class="plant-guide-title"><div class="encyclopedia-icon">${guide.emoji}</div><div><span class="section-kicker">Built-in care guide</span><h2>${esc(guide.name)}</h2><p><i>${esc(guide.scientific)}</i></p></div></div>
    <div class="care-fact-grid">
      <div><span>☀️</span><small>Light</small><p>${esc(guide.light)}</p></div>
      <div><span>💧</span><small>Water</small><p>${esc(guide.water)}</p></div>
      <div><span>💨</span><small>Humidity</small><p>${esc(guide.humidity)}</p></div>
      <div><span>🌡️</span><small>Temperature</small><p>${esc(guide.temperature)}</p></div>
      <div><span>🌱</span><small>Feeding</small><p>${esc(guide.feeding)}</p></div>
      <div><span>🪴</span><small>Soil</small><p>${esc(guide.soil)}</p></div>
    </div>
    <div class="plant-tips"><h3>Good to know</h3>${guide.tips.map(t=>`<p>✨ ${esc(t)}</p>`).join("")}</div>
  </section>`;
}
function encyclopediaCard(g,owned){return `<article class="encyclopedia-card">
  <button type="button" class="encyclopedia-open" data-guide-open="${g.id}"><span>${g.emoji}</span><div><h2>${esc(g.name)}</h2><p>${esc(g.scientific)}</p><small>${esc(g.light.split(".")[0])}</small></div><b>›</b></button>
  ${owned?`<em class="owned-chip">✓ In my garden</em>`:`<button type="button" class="mini" data-add-guide="${g.id}">＋ Add to my garden</button>`}
</article>`}

function plantTileDetails(p){
  const guide=encyclopediaEntry(p.guideId||p.id,p.name);
  const days=Number(p.wateringDays)||guide?.wateringDays||7;
  let waterText="Water today";
  if(p.lastWatered){
    const due=addDays(p.lastWatered,days);
    const diff=Math.round((new Date(`${due}T12:00:00`)-new Date(`${today()}T12:00:00`))/86400000);
    waterText=diff<0?`Water overdue by ${Math.abs(diff)} day${Math.abs(diff)===1?"":"s"}`:diff===0?"Water today":`Water in ${diff} day${diff===1?"":"s"}`;
  }
  const light=(p.light||guide?.light||"Light not set").split(/[.;]/)[0];
  const fed=p.lastFed||p.lastFedDate||"";
  return {waterText,light,fedText:fed?`Last fed ${formatDate(fed)}`:"Feeding not logged"};
}
function PlantTile(p){
  const s=plantStatus(p),details=plantTileDetails(p);
  return `<article class="plant-tile" data-plant-name="${esc(p.name.toLowerCase())}" data-plant-id="${esc(p.id)}">
    <button type="button" class="plant-tile-open" data-route="plant" data-route-id="${esc(p.id)}" aria-label="Open ${esc(p.name)}">
      <div class="plant-tile-art">${plantPhotoSrc(p)?`<img src="${plantPhotoSrc(p)}" alt="${esc(p.name)}">`:`<span>${p.emoji}</span>`}</div>
      <div class="plant-tile-copy"><h2>${esc(p.name)}</h2><div class="plant-card-details"><p>💧 ${esc(details.waterText)}</p><p>☀️ ${esc(details.light)}</p><p>🌱 ${esc(details.fedText)}</p></div><em class="status-chip ${s.className}">${s.icon} ${s.text}</em></div>
    </button>
    <button type="button" class="plant-quick-water ${p.lastWatered===today()?"watered-today":""}" data-quick-water="${esc(p.id)}" aria-label="${p.lastWatered===today()?"Watered today":"Mark as watered today"}" title="${p.lastWatered===today()?"Watered today":"Mark as watered today"}">${p.lastWatered===today()?"✓":"💧"}</button>
  </article>`;
}
function quickWaterPlant(id){
  const p=data.plants.find(x=>x.id===id);if(!p)return;
  const button=document.querySelector(`[data-quick-water="${CSS.escape(id)}"]`);
  if(button){
    button.classList.add("watered-today");
    button.textContent="✓";
    button.setAttribute("aria-label","Watered today");
    button.setAttribute("title","Watered today");
    button.disabled=true;
  }
  p.history=Array.isArray(p.history)?p.history:[];
  const date=today();
  if(!p.history.includes(date))p.history.push(date);
  p.history.sort();p.lastWatered=date;saveData();
  const current=document.querySelector(`[data-plant-id="${CSS.escape(id)}"]`);
  if(current){current.outerHTML=PlantTile(p);bindPlantTileControls()}
  toast(`${p.name} watered and marked done ✓`);
}
function bindPlantTileControls(){
  document.querySelectorAll("[data-quick-water]").forEach(button=>button.onclick=e=>{e.preventDefault();e.stopPropagation();quickWaterPlant(button.dataset.quickWater)});
}
function plantWateringCalendars(history){
  const dates=[...new Set((history||[]).filter(Boolean))].sort();
  if(!dates.length)return `<p>No watering history yet.</p>`;
  const months=[...new Set(dates.map(date=>date.slice(0,7)))].sort().reverse();
  return `<div class="plant-water-calendars">${months.map(month=>{
    const [year,monthNumber]=month.split("-").map(Number);
    const first=new Date(year,monthNumber-1,1);
    const daysInMonth=new Date(year,monthNumber,0).getDate();
    const mondayOffset=(first.getDay()+6)%7;
    const watered=new Set(dates.filter(date=>date.startsWith(month)).map(date=>Number(date.slice(8,10))));
    const cells=[];
    for(let i=0;i<mondayOffset;i++)cells.push(`<span class="plant-cal-day empty" aria-hidden="true"></span>`);
    for(let day=1;day<=daysInMonth;day++)cells.push(`<span class="plant-cal-day ${watered.has(day)?"watered":""}" ${watered.has(day)?`title="Watered ${esc(formatDate(`${month}-${String(day).padStart(2,"0")}`))}"`:""}>${day}</span>`);
    return `<section class="plant-water-month"><h3>${first.toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</h3><div class="plant-cal-weekdays">${["M","T","W","T","F","S","S"].map(day=>`<span>${day}</span>`).join("")}</div><div class="plant-cal-grid">${cells.join("")}</div></section>`;
  }).join("")}</div>`;
}

function PlantsPage(){
  const attention=data.plants.filter(p=>plantStatus(p).className==="attention").length;
  return shell(`${head("Garden","Your enchanted plant family")}
    <div class="plant-search"><span>⌕</span><input id="plantSearch" placeholder="Search plants…"><span>${attention?`🔔 ${attention}`:"✓"}</span></div>
    <div class="plant-tile-grid" id="plantList">${data.plants.map(PlantTile).join("")}</div>
  `,"plants");
}

function PlantProfilePage(){
  const p=data.plants.find(x=>x.id===routeId);if(!p)return PlantsPage();
  const history=[...(p.history||[])].sort().reverse(),status=plantStatus(p),active=plantProfileTab(),guide=encyclopediaEntry(p.guideId||p.id,p.name);
  return shell(`${head(p.name,"Plant profile","plants")}
    <section class="card plant-profile-head"><div class="plant-photo-large">${plantPhotoSrc(p)?`<img src="${plantPhotoSrc(p)}" alt="${esc(p.name)}">`:`<span>${p.emoji}</span>`}</div><div class="plant-profile-actions"><label class="secondary upload-label">📷 Add / change photo<input id="plantPhoto" type="file" accept="image/*" hidden></label><em class="status-chip ${status.className}">${status.icon} ${status.text}</em></div></section>
    <div class="profile-tabs" role="tablist" aria-label="Plant profile sections">${[["care","Care"],["history","History"],["notes","Notes"]].map(([id,label])=>`<button type="button" role="tab" aria-selected="${active===id}" data-plant-tab="${id}" class="${active===id?"active":""}">${label}</button>`).join("")}</div>
    <div class="plant-tab-panel ${active==="care"?"active":""}"><section class="care-summary"><div><small>Last watered</small><strong>${p.lastWatered?formatDate(p.lastWatered):"Not yet"}</strong></div><div><small>Water every</small><strong>${Number(p.wateringDays)||guide?.wateringDays||7} days</strong></div><div><small>Next watering</small><strong>${p.lastWatered?formatDate(addDays(p.lastWatered,Number(p.wateringDays)||guide?.wateringDays||7)):"Water today"}</strong></div></section><section class="card clean-card"><span class="section-kicker">Care</span><h2>Log watering</h2><div class="dated-action"><label class="date-picker-shell" aria-label="Watering date"><span>📅</span><input id="plantWaterDate" type="date" value="${today()}" max="${today()}"></label><button type="button" class="primary" id="waterPlant">💧 Log watering</button></div><p class="helper-text">Today is selected automatically. Open the calendar to record an earlier watering.</p></section>${careGuideHtml(guide)}</div>
    <div class="plant-tab-panel ${active==="history"?"active":""}"><section class="card clean-card plant-calendar-card"><span class="section-kicker">💧 History</span><h2>Watering calendar</h2><p class="helper-text">Blue dates show when ${esc(p.name)} was watered.</p>${plantWateringCalendars(history)}</section></div>
    <div class="plant-tab-panel ${active==="notes"?"active":""}"><section class="card clean-card"><span class="section-kicker">Notes</span><h2>Care notes</h2><textarea class="field plant-notes" rows="6" placeholder="Care notes, growth updates, anything you notice...">${esc(p.notes)}</textarea><button type="button" class="primary" id="savePlantNotes">Save notes</button></section></div>
  `,"plants");
}
function addEncyclopediaPlant(id){const g=PLANT_ENCYCLOPEDIA.find(x=>x.id===id);if(!g)return;if(data.plants.some(p=>(p.guideId||p.id)===id)){toast("That plant is already in your collection");return}data.plants.push({id:`${id}-${Date.now()}`,guideId:id,name:g.name,emoji:g.emoji,notes:"",lastWatered:"",history:[],photo:"",wateringDays:g.wateringDays});saveData();plantUi.encyclopediaOpen=null;plantUi.view="collection";render();toast(`${g.name} added to your garden 🌿`)}
function bindPlants(){
  bindPlantTileControls();
  document.querySelector("#plantSearch")?.addEventListener("input",e=>{const q=e.target.value.toLowerCase();document.querySelectorAll("[data-plant-name]").forEach(tile=>tile.hidden=!tile.dataset.plantName.includes(q))});
  document.querySelector("#encyclopediaSearch")?.addEventListener("input",e=>{
    plantUi.encyclopediaSearch=e.target.value;
    const q=e.target.value.trim().toLowerCase();
    let visible=0;
    document.querySelectorAll(".encyclopedia-card").forEach(card=>{
      const match=!q||card.textContent.toLowerCase().includes(q);
      card.hidden=!match; if(match) visible++;
    });
    const count=e.target.closest(".plant-search")?.querySelector("span:last-child");
    if(count) count.textContent=`📖 ${visible}`;
    document.querySelector(".encyclopedia-empty")?.remove();
    if(!visible){const empty=document.createElement("section");empty.className="card encyclopedia-empty";empty.innerHTML="<p>No matching plants found. You can still add it as a custom plant.</p>";document.querySelector("#encyclopediaGrid")?.append(empty)}
  });
  document.querySelector("#addCustomPlant")?.addEventListener("click",()=>{
    const name=prompt("Plant name"); if(!name?.trim())return;
    const emoji=prompt("Choose an icon for it", "🌿")||"🌿";
    const id=`custom-${Date.now()}`;
    data.plants.push({id,name:name.trim().slice(0,60),emoji:emoji.trim().slice(0,4)||"🌿",notes:"",lastWatered:"",history:[],photo:"",guideId:"",wateringDays:7});
    saveData(); plantUi.view="collection"; render(); toast(`${name.trim()} added to your garden 🌿`);
  });
  document.querySelectorAll("[data-guide-open]").forEach(b=>b.onclick=()=>{plantUi.encyclopediaOpen=b.dataset.guideOpen;render()});
  document.querySelectorAll("[data-close-guide]").forEach(b=>b.onclick=e=>{if(e.target===b||b.classList.contains("poke-detail-close")){plantUi.encyclopediaOpen=null;render()}});
  document.querySelectorAll("[data-add-guide]").forEach(b=>b.onclick=()=>addEncyclopediaPlant(b.dataset.addGuide));
  document.querySelectorAll("[data-plant-tab]").forEach(button=>button.addEventListener("click",()=>{data.plantProfileTab=button.dataset.plantTab;saveData();render()}));
  document.querySelector("#waterPlant")?.addEventListener("click",()=>{const p=data.plants.find(x=>x.id===routeId);if(!p)return;const date=document.querySelector("#plantWaterDate")?.value||today();if(date>today()){toast("Choose today or an earlier date");return}p.history=Array.isArray(p.history)?p.history:[];if(!p.history.includes(date))p.history.push(date);p.history.sort();p.lastWatered=p.history[p.history.length-1]||"";saveData();toast(`${p.name} watering logged 💧`);render()});
  document.querySelectorAll("[data-water-delete]").forEach(button=>button.addEventListener("click",()=>{const p=data.plants.find(x=>x.id===routeId);if(!p)return;p.history=(p.history||[]).filter(date=>date!==button.dataset.waterDelete);p.history.sort();p.lastWatered=p.history[p.history.length-1]||"";saveData();toast("Watering entry removed");render()}));
  document.querySelector("#savePlantNotes")?.addEventListener("click",()=>{const p=data.plants.find(x=>x.id===routeId);if(!p)return;p.notes=document.querySelector(".plant-notes").value;saveData();toast("Plant notes saved 🌿")});
  document.querySelector("#plantPhoto")?.addEventListener("change",async e=>{
    const file=e.target.files?.[0]; if(!file)return;
    const p=data.plants.find(x=>x.id===routeId); if(!p)return;
    try{
      toast("Saving plant photo…");
      p.photoKey=plantPhotoKey(p);
      p.photo=await LinaImage.upload({file,key:p.photoKey,width:1000,height:1000,fit:"contain",quality:0.82,allowUpscale:false});
      saveData();
      toast("Plant photo saved safely 📷");
      render();
    }catch(error){
      console.error(error);
      toast(LinaImage.friendlyError(error));
    }
  });
}

/* LinaHub 17.8.0 — Garden timeline, editable calendar and reminders */
function plantEnsureExtendedData(p){
  p.history=Array.isArray(p.history)?p.history:[];
  p.feedingHistory=Array.isArray(p.feedingHistory)?p.feedingHistory:[];
  p.repotHistory=Array.isArray(p.repotHistory)?p.repotHistory:[];
  p.pruneHistory=Array.isArray(p.pruneHistory)?p.pruneHistory:[];
  p.photoHistory=Array.isArray(p.photoHistory)?p.photoHistory:[];
  if(p.lastWatered && !p.history.includes(p.lastWatered)) p.history.push(p.lastWatered);
  if(p.lastFed && !p.feedingHistory.includes(p.lastFed)) p.feedingHistory.push(p.lastFed);
  p.history.sort();
  p.feedingHistory.sort();
  p.repotHistory.sort();
  p.pruneHistory.sort();
  p.lastWatered=p.history.at(-1)||p.lastWatered||"";
  p.lastFed=p.feedingHistory.at(-1)||p.lastFed||"";
  if(typeof p.reminderEnabled!=="boolean")p.reminderEnabled=true;
  data.plantCalendarMonthById=data.plantCalendarMonthById||{};
  if(!data.plantCalendarMonthById[p.id]){
    const latest=[p.history.at(-1),p.feedingHistory.at(-1),p.repotHistory.at(-1),p.pruneHistory.at(-1),today()].filter(Boolean).sort().at(-1)||today();
    data.plantCalendarMonthById[p.id]=latest.slice(0,7);
  }
}
function plantMonthShift(value,offset){const [y,m]=String(value||today().slice(0,7)).split("-").map(Number);const d=new Date(y,m-1+Number(offset||0),1);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`}
function plantTimelineCalendar(p){
  plantEnsureExtendedData(p);
  const month=data.plantCalendarMonthById[p.id]||today().slice(0,7);
  const [year,monthNumber]=month.split("-").map(Number),first=new Date(year,monthNumber-1,1),days=new Date(year,monthNumber,0).getDate(),leading=(first.getDay()+6)%7;
  const watered=new Set(p.history.filter(x=>x.startsWith(month))),fed=new Set(p.feedingHistory.filter(x=>x.startsWith(month))),repotted=new Set(p.repotHistory.filter(x=>x.startsWith(month))),pruned=new Set(p.pruneHistory.filter(x=>x.startsWith(month)));
  const todayDate=today();
  const todayInMonth=todayDate.startsWith(month);
  const cells=[];for(let i=0;i<leading;i++)cells.push('<span class="plant-cal-day empty"></span>');
  for(let day=1;day<=days;day++){
    const date=`${month}-${String(day).padStart(2,"0")}`;
    const classes=[watered.has(date)?"watered":"",fed.has(date)?"fed":"",repotted.has(date)?"repotted":"",pruned.has(date)?"pruned":"",date===todayDate?"today":""].filter(Boolean).join(" ");
    const careColours=[];
    if(watered.has(date))careColours.push("#35aee2");
    if(fed.has(date))careColours.push("#e6bf55");
    if(repotted.has(date))careColours.push("#b57ad9");
    if(pruned.has(date))careColours.push("#78d98e");
    const multiStyle=careColours.length>1?` style="--plant-care-bg:conic-gradient(${careColours.map((colour,index)=>`${colour} ${index*100/careColours.length}% ${(index+1)*100/careColours.length}%`).join(",")})"`:"";
    const marks=`${watered.has(date)?'<i class="water-mark"></i>':""}${fed.has(date)?'<i class="feed-mark"></i>':""}${repotted.has(date)?'<i class="repot-mark"></i>':""}${pruned.has(date)?'<i class="prune-mark"></i>':""}${date===todayDate?'<i class="today-mark"></i>':""}`;
    cells.push(`<button type="button" class="plant-cal-day ${classes} ${careColours.length>1?"multi-care":""}"${multiStyle} data-plant-calendar-date="${date}" aria-label="${formatDate(date)}${date===todayDate?', today':''}"><span>${day}</span>${marks}</button>`);
  }
  return `<div class="plant-calendar-head"><button type="button" class="mini" data-plant-month="-1">‹</button><div class="plant-calendar-title"><strong>${first.toLocaleDateString("en-GB",{month:"long",year:"numeric"})}</strong><small>${todayInMonth?`Today: ${formatDate(todayDate)}`:`Today: ${formatDate(todayDate)}`}</small></div><button type="button" class="mini" data-plant-month="1">›</button></div><div class="plant-cal-weekdays">${["M","T","W","T","F","S","S"].map(x=>`<span>${x}</span>`).join("")}</div><div class="plant-cal-grid">${cells.join("")}</div><div class="plant-calendar-legend"><span><i class="today-legend"></i>Today</span><span><i class="water"></i>Watered</span><span><i class="feed"></i>Fed</span><span><i class="repot"></i>Repotted</span><span><i class="prune"></i>Pruned</span></div>`;
}

function closePlantCareCalendarModal(){
  document.querySelector('.plant-care-modal-backdrop')?.remove();
  document.body.classList.remove('plant-care-modal-open');
}
function openPlantCareCalendarModal({date,hasW,hasF,hasR,hasP,onAction}){
  closePlantCareCalendarModal();
  const prettyDate=formatDate(date);
  const active=[hasW?'<span class="plant-care-status watered">💧 Watered</span>':'',hasF?'<span class="plant-care-status fed">🌱 Fed</span>':'',hasR?'<span class="plant-care-status repotted">🪴 Repotted</span>':'',hasP?'<span class="plant-care-status pruned">✂️ Pruned</span>':''].filter(Boolean).join('');
  const overlay=document.createElement('div');
  overlay.className='plant-care-modal-backdrop';
  overlay.innerHTML=`<section class="plant-care-modal" role="dialog" aria-modal="true" aria-labelledby="plantCareModalTitle">
    <button type="button" class="mini plant-care-modal-close" aria-label="Close">×</button>
    <span class="section-kicker">Plant care calendar</span>
    <h2 id="plantCareModalTitle">${prettyDate}</h2>
    <p class="helper-text">Choose what you want to log or remove for this date.</p>
    <div class="plant-care-modal-current">
      <small>Current records</small>
      <div class="plant-care-status-row">${active || '<span class="plant-care-status none">No care logged yet</span>'}</div>
    </div>
    <div class="plant-care-modal-grid">
      <button type="button" class="plant-care-choice watered" data-care-action="water"><span>💧</span><strong>${hasW?'Watered again':'Mark watered'}</strong><small>${hasW?'Keep this day in the watering log':'Add this date to the watering log'}</small></button>
      <button type="button" class="plant-care-choice fed" data-care-action="feed"><span>🌱</span><strong>${hasF?'Fed again':'Mark fed'}</strong><small>${hasF?'Keep this day in the feeding log':'Add this date to the feeding log'}</small></button>
      <button type="button" class="plant-care-choice repotted" data-care-action="repot"><span>🪴</span><strong>${hasR?'Repotted again':'Mark repotted'}</strong><small>${hasR?'Keep this day in the repot log':'Add this date to the repot log'}</small></button>
      <button type="button" class="plant-care-choice pruned" data-care-action="prune"><span>✂️</span><strong>${hasP?'Pruned again':'Mark pruned'}</strong><small>${hasP?'Keep this day in the pruning log':'Add this date to the pruning log'}</small></button>
      <button type="button" class="plant-care-choice danger" data-care-action="remove" ${(!hasW&&!hasF&&!hasR&&!hasP)?'disabled':''}><span>✕</span><strong>Remove records</strong><small>${(hasW||hasF||hasR||hasP)?'Clear all care records for this date':'Nothing to remove yet'}</small></button>
    </div>
    <div class="plant-care-modal-actions"><button type="button" class="secondary" data-close-plant-care-modal>Cancel</button></div>
  </section>`;
  const close=()=>{
    window.removeEventListener('keydown',onKey);
    closePlantCareCalendarModal();
  };
  const onKey=(e)=>{ if(e.key==='Escape') close(); };
  overlay.addEventListener('click',e=>{
    if(e.target===overlay || e.target.closest('[data-close-plant-care-modal]') || e.target.closest('.plant-care-modal-close')) close();
    const btn=e.target.closest('[data-care-action]');
    if(!btn || btn.disabled) return;
    const action=btn.dataset.careAction;
    close();
    onAction?.(action);
  });
  document.body.appendChild(overlay);
  document.body.classList.add('plant-care-modal-open');
  window.addEventListener('keydown',onKey);
  overlay.querySelector('[data-care-action="water"]')?.focus();
}

function plantReminderText(p,guide){
  plantEnsureExtendedData(p);const every=Number(p.wateringDays)||guide?.wateringDays||7;
  if(!p.reminderEnabled)return "Reminder off";
  if(!p.lastWatered)return "Watering reminder: today";
  const due=addDays(p.lastWatered,every),diff=Math.round((new Date(`${due}T12:00:00`)-new Date(`${today()}T12:00:00`))/86400000);
  return diff<0?`Overdue by ${Math.abs(diff)} day${Math.abs(diff)===1?"":"s"}`:diff===0?"Due today":`Due in ${diff} day${diff===1?"":"s"}`;
}
function plantPhotoTimelineHtml(p){
  plantEnsureExtendedData(p);const rows=[...p.photoHistory].sort((a,b)=>String(b.date).localeCompare(String(a.date)));
  if(!rows.length)return '<p class="muted-copy">No photo timeline yet. New profile photos will be added here automatically.</p>';
  return `<div class="plant-photo-timeline">${rows.map(item=>{const src=LinaImage.peek(item.key)||"";return `<article>${src?`<img src="${src}" alt="${esc(p.name)} on ${esc(formatDate(item.date))}">`:'<span>📷</span>'}<div><strong>${formatDate(item.date)}</strong><small>${esc(item.note||"Plant photo")}</small></div><button type="button" class="mini danger" data-plant-photo-delete="${esc(item.key)}">×</button></article>`}).join("")}</div>`;
}
function PlantProfilePage(){
  const p=data.plants.find(x=>x.id===routeId);if(!p)return PlantsPage();plantEnsureExtendedData(p);
  const status=plantStatus(p),active=plantProfileTab(),guide=encyclopediaEntry(p.guideId||p.id,p.name),every=Number(p.wateringDays)||guide?.wateringDays||7;
  return shell(`${head(p.name,"Plant profile","plants")}
    <section class="card plant-profile-head"><div class="plant-photo-large">${plantPhotoSrc(p)?`<img src="${plantPhotoSrc(p)}" alt="${esc(p.name)}">`:`<span>${p.emoji}</span>`}</div><div class="plant-profile-actions"><label class="secondary upload-label">📷 Add / change photo<input id="plantPhoto" type="file" accept="image/*" hidden></label><em class="status-chip ${status.className}">${status.icon} ${status.text}</em></div></section>
    <div class="profile-tabs">${[["care","Care"],["history","Calendar"],["photos","Photos"],["notes","Notes"]].map(([id,label])=>`<button type="button" data-plant-tab="${id}" class="${active===id?"active":""}">${label}</button>`).join("")}</div>
    <div class="plant-tab-panel ${active==="care"?"active":""}"><section class="care-summary"><div><small>Last watered</small><strong>${p.lastWatered?formatDate(p.lastWatered):"Not yet"}</strong></div><div><small>Water every</small><strong>${every} days</strong></div><div><small>Reminder</small><strong class="${plantReminderText(p,guide).startsWith("Overdue")?"plant-overdue":""}">${esc(plantReminderText(p,guide))}</strong></div></section>
      <section class="card clean-card plant-care-actions"><span class="section-kicker">Care log</span><h2>Add a care entry</h2><div class="plant-care-entry"><label><span>Date</span><input class="field" id="plantCareDate" type="date" value="${today()}" max="${today()}"></label><label><span>Care type</span><select class="field" id="plantCareType"><option value="water">💧 Water</option><option value="feed">🌱 Feed</option><option value="repot">🪴 Repot</option><option value="prune">✂️ Prune</option></select></label><button class="primary" id="logPlantCare">Add to care log</button></div><label class="plant-reminder-toggle"><input type="checkbox" id="plantReminderEnabled" ${p.reminderEnabled?"checked":""}><span>Use this plant's last watering date for reminders</span></label></section>${careGuideHtml(guide)}</div>
    <div class="plant-tab-panel ${active==="history"?"active":""}"><section class="card clean-card plant-calendar-card"><span class="section-kicker">History</span><h2>Plant care calendar</h2><p class="helper-text">Tap a coloured date to edit or remove its care records.</p>${plantTimelineCalendar(p)}</section></div>
    <div class="plant-tab-panel ${active==="photos"?"active":""}"><section class="card clean-card"><span class="section-kicker">Photo timeline</span><h2>${esc(p.name)} over time</h2>${plantPhotoTimelineHtml(p)}</section></div>
    <div class="plant-tab-panel ${active==="notes"?"active":""}"><section class="card clean-card"><span class="section-kicker">Notes</span><h2>Care notes</h2><textarea class="field plant-notes" rows="6">${esc(p.notes)}</textarea><button type="button" class="primary" id="savePlantNotes">Save notes</button></section></div>
    <section class="card clean-card plant-delete-card"><span class="section-kicker">Garden collection</span><h2>Remove this plant</h2><p class="helper-text">Use this when a plant has died or you no longer want it in your garden. Its care history and saved photos will also be removed.</p><button type="button" class="mini danger plant-delete-button" id="deletePlant">Remove ${esc(p.name)} from garden</button></section>`,'plants');
}
function bindPlants(){
  bindPlantTileControls();
  document.querySelector("#plantSearch")?.addEventListener("input",e=>{const q=e.target.value.toLowerCase();document.querySelectorAll("[data-plant-name]").forEach(tile=>tile.hidden=!tile.dataset.plantName.includes(q))});
  document.querySelectorAll("[data-plant-tab]").forEach(b=>b.onclick=()=>{data.plantProfileTab=b.dataset.plantTab;saveData();render()});
  const p=data.plants.find(x=>x.id===routeId);if(!p)return;plantEnsureExtendedData(p);
  document.querySelectorAll("[data-plant-month]").forEach(b=>b.onclick=()=>{data.plantCalendarMonthById[p.id]=plantMonthShift(data.plantCalendarMonthById[p.id]||today().slice(0,7),b.dataset.plantMonth);saveData();render()});
  document.querySelectorAll("[data-plant-calendar-date]").forEach(b=>b.onclick=()=>{
    const date=b.dataset.plantCalendarDate,hasW=p.history.includes(date),hasF=p.feedingHistory.includes(date),hasR=p.repotHistory.includes(date),hasP=p.pruneHistory.includes(date);
    openPlantCareCalendarModal({date,hasW,hasF,hasR,hasP,onAction:(value)=>{
      if(value==="remove"){
        p.history=p.history.filter(x=>x!==date);
        p.feedingHistory=p.feedingHistory.filter(x=>x!==date);
        p.repotHistory=p.repotHistory.filter(x=>x!==date);
        p.pruneHistory=p.pruneHistory.filter(x=>x!==date);
        toast("Care records removed");
      }else if(value==="water"){
        p.history=p.history.filter(x=>x!==date);
        p.history.push(date);
        toast("Watering logged 💧");
      }else if(value==="feed"){
        p.feedingHistory=p.feedingHistory.filter(x=>x!==date);
        p.feedingHistory.push(date);
        toast("Feeding logged 🌱");
      }else if(value==="repot"){
        p.repotHistory=p.repotHistory.filter(x=>x!==date);
        p.repotHistory.push(date);
        toast("Repotting logged 🪴");
      }else if(value==="prune"){
        p.pruneHistory=p.pruneHistory.filter(x=>x!==date);
        p.pruneHistory.push(date);
        toast("Pruning logged ✂️");
      }
      [p.history,p.feedingHistory,p.repotHistory,p.pruneHistory].forEach(a=>a.sort());
      p.lastWatered=p.history.at(-1)||"";
      p.lastFed=p.feedingHistory.at(-1)||"";
      saveData();
      render();
    }});
  });
  const careDate=()=>document.querySelector("#plantCareDate")?.value||today();
  document.querySelector("#logPlantCare")?.addEventListener("click",()=>{
    const d=careDate(),type=document.querySelector("#plantCareType")?.value||"water";
    if(d>today()){toast("Choose today or an earlier date");return}
    if(type==="feed"){
      if(!p.feedingHistory.includes(d))p.feedingHistory.push(d);
      p.feedingHistory.sort();p.lastFed=p.feedingHistory.at(-1)||"";
      saveData();toast("Feeding logged 🌱");render();return;
    }
    if(type==="repot"){
      if(!p.repotHistory.includes(d))p.repotHistory.push(d);
      p.repotHistory.sort();saveData();toast("Repotting logged 🪴");render();return;
    }
    if(type==="prune"){
      if(!p.pruneHistory.includes(d))p.pruneHistory.push(d);
      p.pruneHistory.sort();saveData();toast("Pruning logged ✂️");render();return;
    }
    if(!p.history.includes(d))p.history.push(d);
    p.history.sort();p.lastWatered=p.history.at(-1)||"";
    saveData();toast("Watering logged 💧");render();
  });
  document.querySelector("#plantReminderEnabled")?.addEventListener("change",e=>{p.reminderEnabled=e.target.checked;saveData();render()});
  document.querySelector("#savePlantNotes")?.addEventListener("click",()=>{p.notes=document.querySelector(".plant-notes").value;saveData();toast("Plant notes saved 🌿")});
  document.querySelector("#plantPhoto")?.addEventListener("change",async e=>{const file=e.target.files?.[0];if(!file)return;try{const stamp=Date.now(),key=`plant-timeline:${p.id}:${stamp}`,value=await LinaImage.upload({file,key,width:1000,height:1000,fit:"contain",quality:.82,allowUpscale:false});p.photoKey=plantPhotoKey(p);await LinaImage.save(p.photoKey,value);p.photo=value;p.photoHistory.push({key,date:today(),createdAt:new Date().toISOString(),note:"Plant photo"});saveData();toast("Photo added to timeline 📷");render()}catch(error){toast(LinaImage.friendlyError(error))}});
  document.querySelectorAll("[data-plant-photo-delete]").forEach(b=>b.onclick=async()=>{if(!confirm("Remove this photo from the timeline?"))return;await LinaImage.remove(b.dataset.plantPhotoDelete).catch(()=>{});p.photoHistory=p.photoHistory.filter(x=>x.key!==b.dataset.plantPhotoDelete);saveData();render()});
  document.querySelector("#deletePlant")?.addEventListener("click",async()=>{
    if(!confirm(`Remove ${p.name} from your garden? This will permanently delete its care history, notes and saved photos.`))return;
    const imageKeys=new Set([p.photoKey,plantPhotoKey(p),...(p.photoHistory||[]).map(item=>item?.key)].filter(Boolean));
    for(const key of imageKeys){try{await LinaImage.remove(key)}catch{}}
    data.plants=data.plants.filter(item=>item.id!==p.id);
    if(data.plantCalendarMonthById)delete data.plantCalendarMonthById[p.id];
    saveData();
    toast(`${p.name} removed from your garden`);
    go("plants","","back",{replace:true});
  });
}
