function ensureBudgetData(){
  if(!Array.isArray(data.bills)) data.bills=[];
  if(!Array.isArray(data.budgetEntries)) data.budgetEntries=[];
}

function money(value){
  return new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(value)||0);
}

function budgetMonthKey(){
  return new Date().toISOString().slice(0,7);
}

function BudgetPage(){
  ensureBudgetData();
  const month=budgetMonthKey();
  const monthEntries=data.budgetEntries.filter(x=>(x.date||"").slice(0,7)===month);
  const income=monthEntries.filter(x=>x.type==="income").reduce((n,x)=>n+(Number(x.amount)||0),0);
  const spending=monthEntries.filter(x=>x.type==="expense").reduce((n,x)=>n+(Number(x.amount)||0),0);
  const billsTotal=data.bills.reduce((n,x)=>n+(Number(x.amount)||0),0);
  const billsPaid=data.bills.filter(x=>x.paid).reduce((n,x)=>n+(Number(x.amount)||0),0);
  const balance=income-spending-billsPaid;
  const upcoming=[...data.bills].sort((a,b)=>(Number(a.dueDay)||31)-(Number(b.dueDay)||31));

  return shell(`${head("Budget & Bills","Keep monthly money in one calm place")}
    <section class="budget-summary-grid">
      <div class="metric-card"><span>Income this month</span><strong>${money(income)}</strong></div>
      <div class="metric-card"><span>Spending this month</span><strong>${money(spending)}</strong></div>
      <div class="metric-card"><span>Bills paid</span><strong>${money(billsPaid)}</strong></div>
      <div class="metric-card"><span>Left after paid bills</span><strong>${money(balance)}</strong></div>
    </section>

    <section class="card budget-card">
      <div class="budget-section-head"><div><h2>Monthly bills</h2><p>${data.bills.filter(x=>x.paid).length} of ${data.bills.length} paid · ${money(billsTotal)} total</p></div><button type="button" class="primary" id="addBillToggle">Add bill</button></div>
      <div id="billForm" class="budget-form" hidden>
        <label class="field-label">Bill name<input class="field" id="billName" placeholder="Rent, electricity, Netflix..."></label>
        <div class="two-col">
          <label class="field-label">Amount (£)<input class="field" id="billAmount" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></label>
          <label class="field-label">Due day<input class="field" id="billDueDay" type="number" inputmode="numeric" min="1" max="31" placeholder="1–31"></label>
        </div>
        <label class="field-label">Category<select id="billCategory"><option>Home</option><option>Utilities</option><option>Subscriptions</option><option>Transport</option><option>Health</option><option>Other</option></select></label>
        <button type="button" class="primary" id="saveBill">Save bill</button>
      </div>
      <div class="budget-list">${upcoming.length?upcoming.map(b=>`<article class="budget-row ${b.paid?"is-paid":""}" data-bill-id="${esc(b.id)}">
        <button type="button" class="bill-paid-toggle" aria-label="${b.paid?"Mark unpaid":"Mark paid"}">${b.paid?"✓":""}</button>
        <div><strong>${esc(b.name)}</strong><small>${esc(b.category||"Other")} · due day ${esc(b.dueDay||"—")}</small></div>
        <b>${money(b.amount)}</b><button type="button" class="budget-delete" data-delete-bill="${esc(b.id)}" aria-label="Delete ${esc(b.name)}">×</button>
      </article>`).join(""):`<p class="empty-state">No bills added yet.</p>`}</div>
    </section>

    <section class="card budget-card">
      <div class="budget-section-head"><div><h2>Income & spending</h2><p>Add money coming in or going out.</p></div><button type="button" class="secondary" id="addEntryToggle">Add entry</button></div>
      <div id="entryForm" class="budget-form" hidden>
        <div class="two-col"><label class="field-label">Type<select id="entryType"><option value="expense">Expense</option><option value="income">Income</option></select></label><label class="field-label">Date<input class="field" id="entryDate" type="date" value="${today()}"></label></div>
        <label class="field-label">Description<input class="field" id="entryName" placeholder="Groceries, wages, petrol..."></label>
        <div class="two-col"><label class="field-label">Amount (£)<input class="field" id="entryAmount" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></label><label class="field-label">Category<select id="entryCategory"><option>Groceries</option><option>Home</option><option>Transport</option><option>Health</option><option>Fun</option><option>Work</option><option>Other</option></select></label></div>
        <button type="button" class="primary" id="saveEntry">Save entry</button>
      </div>
      <div class="budget-list">${monthEntries.length?[...monthEntries].sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(e=>`<article class="budget-row entry-row">
        <span class="entry-icon">${e.type==="income"?"＋":"−"}</span><div><strong>${esc(e.name)}</strong><small>${esc(e.category||"Other")} · ${esc(e.date||"")}</small></div><b class="${e.type==="income"?"income":"expense"}">${e.type==="income"?"+":"−"}${money(e.amount)}</b><button type="button" class="budget-delete" data-delete-entry="${esc(e.id)}" aria-label="Delete ${esc(e.name)}">×</button>
      </article>`).join(""):`<p class="empty-state">No entries for this month yet.</p>`}</div>
    </section>
  `,"budget");
}

function bindBudget(){
  ensureBudgetData();
  const toggle=(buttonId,formId)=>document.querySelector(buttonId)?.addEventListener("click",()=>{const form=document.querySelector(formId);if(form)form.hidden=!form.hidden});
  toggle("#addBillToggle","#billForm"); toggle("#addEntryToggle","#entryForm");

  document.querySelector("#saveBill")?.addEventListener("click",()=>{
    const name=document.querySelector("#billName")?.value.trim();
    const amount=Number(document.querySelector("#billAmount")?.value);
    const dueDay=Number(document.querySelector("#billDueDay")?.value);
    if(!name||!Number.isFinite(amount)||amount<0||dueDay<1||dueDay>31){toast("Add a bill name, amount and due day from 1 to 31.");return;}
    data.bills.push({id:`bill-${Date.now()}`,name,amount,dueDay,category:document.querySelector("#billCategory")?.value||"Other",paid:false});
    saveData(); render();
  });

  document.querySelector("#saveEntry")?.addEventListener("click",()=>{
    const name=document.querySelector("#entryName")?.value.trim();
    const amount=Number(document.querySelector("#entryAmount")?.value);
    const date=document.querySelector("#entryDate")?.value||today();
    if(!name||!Number.isFinite(amount)||amount<=0){toast("Add a description and amount.");return;}
    data.budgetEntries.push({id:`money-${Date.now()}`,type:document.querySelector("#entryType")?.value||"expense",name,amount,date,category:document.querySelector("#entryCategory")?.value||"Other"});
    saveData(); render();
  });

  document.querySelectorAll("[data-bill-id] .bill-paid-toggle").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.closest("[data-bill-id]")?.dataset.billId; const bill=data.bills.find(x=>x.id===id); if(!bill)return;
    bill.paid=!bill.paid; saveData(); render();
  }));
  document.querySelectorAll("[data-delete-bill]").forEach(btn=>btn.addEventListener("click",()=>{data.bills=data.bills.filter(x=>x.id!==btn.dataset.deleteBill);saveData();render()}));
  document.querySelectorAll("[data-delete-entry]").forEach(btn=>btn.addEventListener("click",()=>{data.budgetEntries=data.budgetEntries.filter(x=>x.id!==btn.dataset.deleteEntry);saveData();render()}));
}
