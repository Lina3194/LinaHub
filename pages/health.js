
function HealthPage(){
 const weights=[...(data.weightEntries||[])].sort((a,b)=>b.date.localeCompare(a.date)),measures=[...(data.measurements||[])].sort((a,b)=>b.date.localeCompare(a.date)),latest=weights[0];
 const hour=new Date().getHours();
 const period=hour<14?"Morning":hour>=17?"Evening":"Daytime";
 return shell(`${head("Weight & Measures",`${period} check-in · Track changes gently over time`)}
 <section class="card"><div class="stat-grid"><div class="stat"><strong>${latest?esc(latest.weight):"—"}</strong><span>Latest weight (kg)</span></div><div class="stat"><strong>${weights.length}</strong><span>Weight entries</span></div></div></section>
 <section class="card"><h2>Add weight</h2><div class="two-col"><input class="field" id="weightDate" type="date" value="${today()}"><input class="field" id="weightValue" type="number" step="0.1" placeholder="kg"></div><button class="primary" id="addWeight" style="margin-top:10px">Save weight</button></section>
 <section class="card"><h2>Add measurement</h2><div class="two-col"><input class="field" id="measureDate" type="date" value="${today()}"><input class="field" id="measureWaist" type="number" step="0.1" placeholder="Waist cm"></div><button class="primary" id="addMeasure" style="margin-top:10px">Save measurement</button></section>
 <section class="card"><h2>Weight history</h2><div class="table-wrap"><table class="simple-table"><tbody>${weights.length?weights.map((w,i)=>`<tr><td>${esc(formatDate(w.date))}</td><td>${esc(w.weight)} kg</td><td><button class="mini danger" data-weight-delete="${i}">Delete</button></td></tr>`).join(""):`<tr><td>No entries yet.</td></tr>`}</tbody></table></div></section>
 <section class="card"><h2>Measurement history</h2><div class="list-card">${measures.length?measures.map((m,i)=>`<div class="item-row"><div><h3>${esc(formatDate(m.date))}</h3><p>Waist ${m.waist||"—"} cm</p></div><button class="mini danger" data-measure-delete="${i}">Delete</button></div>`).join(""):`<p>No measurements yet.</p>`}</div></section>`,"");
}
function bindHealth(){
 document.querySelector("#addWeight")?.addEventListener("click",()=>{const weight=document.querySelector("#weightValue").value;if(!weight){toast("Enter a weight");return}data.weightEntries.push({date:document.querySelector("#weightDate").value||today(),weight});
 data.healthPromptLog=data.healthPromptLog||{};data.healthPromptLog[today()]=data.healthPromptLog[today()]||{};
 data.healthPromptLog[today()][new Date().getHours()<14?"morning":"evening"]=true;
 saveData();render()});
 document.querySelector("#addMeasure")?.addEventListener("click",()=>{data.measurements.push({date:document.querySelector("#measureDate").value||today(),waist:document.querySelector("#measureWaist").value});
 data.healthPromptLog=data.healthPromptLog||{};data.healthPromptLog[today()]=data.healthPromptLog[today()]||{};
 data.healthPromptLog[today()][new Date().getHours()<14?"morning":"evening"]=true;
 saveData();render()});
 document.querySelectorAll("[data-weight-delete]").forEach(b=>b.onclick=()=>{const sorted=[...data.weightEntries].sort((a,b)=>b.date.localeCompare(a.date));const target=sorted[+b.dataset.weightDelete];data.weightEntries.splice(data.weightEntries.indexOf(target),1);saveData();render()});
 document.querySelectorAll("[data-measure-delete]").forEach(b=>b.onclick=()=>{const sorted=[...data.measurements].sort((a,b)=>b.date.localeCompare(a.date));const target=sorted[+b.dataset.measureDelete];data.measurements.splice(data.measurements.indexOf(target),1);saveData();render()});
}
