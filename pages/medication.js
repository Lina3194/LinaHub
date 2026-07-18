
function MedicationPage(){
 const meds=data.medications||[],log=(data.medicationLog||{})[today()]||{};
 return shell(`${head("Medication","Doses and routines")}
 <section class="card"><h2>Add medication</h2><div class="form-grid"><input class="field" id="medName" placeholder="Medication / tablet"><div class="two-col"><input class="field" id="medDose" placeholder="Dose"><select class="field" id="medTime"><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Bedtime</option><option>As needed</option></select></div><textarea class="field" id="medNotes" rows="3" placeholder="Notes"></textarea><button class="primary" id="addMedication">Add medication</button></div></section>
 <section class="card"><h2>Today</h2><div class="list-card">${meds.length?meds.map((m,i)=>`<div class="item-row"><div><h3>${esc(m.name)} ${m.dose?`· ${esc(m.dose)}`:""}</h3><p>${esc(m.time)}${m.notes?` · ${esc(m.notes)}`:""}</p></div><div class="item-actions"><button class="check-task ${log[m.id]?"done":""}" data-med-taken="${i}">✓</button><button class="mini danger" data-med-delete="${i}">Delete</button></div></div>`).join(""):`<p>No medications added yet.</p>`}</div></section>`,"");
}
function bindMedication(){
 document.querySelector("#addMedication")?.addEventListener("click",()=>{const name=document.querySelector("#medName").value.trim();if(!name){toast("Add the medication name");return}data.medications.push({id:"med-"+Date.now(),name,dose:document.querySelector("#medDose").value.trim(),time:document.querySelector("#medTime").value,notes:document.querySelector("#medNotes").value.trim()});saveData();render()});
 document.querySelectorAll("[data-med-taken]").forEach(b=>b.onclick=()=>{const med=data.medications[+b.dataset.medTaken];data.medicationLog[today()]=data.medicationLog[today()]||{};data.medicationLog[today()][med.id]=!data.medicationLog[today()][med.id];saveData();render()});
 document.querySelectorAll("[data-med-delete]").forEach(b=>b.onclick=()=>{data.medications.splice(+b.dataset.medDelete,1);saveData();render()});
}
