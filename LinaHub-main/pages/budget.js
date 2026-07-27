var budgetViewMonth = budgetViewMonth || new Date().toISOString().slice(0,7);
var budgetSectionOpen = budgetSectionOpen || {entries:false,bills:false,savings:false};
var budgetOpenBill = budgetOpenBill || null;
var budgetEditBill = budgetEditBill || null;

function ensureBudgetData(){
  if(!Array.isArray(data.bills)) data.bills=[];
  if(!Array.isArray(data.budgetEntries)) data.budgetEntries=[];
  if(!Array.isArray(data.savingsEntries)) data.savingsEntries=[];
  const current=budgetMonthKey();
  data.bills.forEach(b=>{
    if(!b.paidMonths||typeof b.paidMonths!=="object") b.paidMonths={};
    if(b.paid===true && b.paidMonths[current]===undefined) b.paidMonths[current]=true;
    if(!b.dueDate && b.dueDay){
      const maxDay=new Date(Number(current.slice(0,4)),Number(current.slice(5,7)),0).getDate();
      b.dueDate=`${current}-${String(Math.min(Number(b.dueDay)||1,maxDay)).padStart(2,"0")}`;
    }
  });
}

function money(value){
  return new Intl.NumberFormat("en-GB",{style:"currency",currency:"GBP"}).format(Number(value)||0);
}
function budgetMonthKey(){return new Date().toISOString().slice(0,7);}
function monthLabel(month){
  const [year,number]=month.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB",{month:"long",year:"numeric"}).format(new Date(year,number-1,1));
}
function shiftBudgetMonth(month,amount){
  const [year,number]=month.split("-").map(Number);
  const d=new Date(year,number-1+amount,1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
}
function billPaidForMonth(bill,month){return Boolean(bill.paidMonths&&bill.paidMonths[month]);}
function savingsBalanceThrough(month){
  return data.savingsEntries.filter(x=>(x.date||"").slice(0,7)<=month)
    .reduce((n,x)=>n+(x.type==="withdraw"?-(Number(x.amount)||0):(Number(x.amount)||0)),0);
}
function billDateForMonth(bill,month){
  const raw=bill.dueDate||"";
  const day=Number(raw.slice(8,10))||Number(bill.dueDay)||1;
  const [year,monthNumber]=month.split("-").map(Number);
  const maxDay=new Date(year,monthNumber,0).getDate();
  return `${month}-${String(Math.min(day,maxDay)).padStart(2,"0")}`;
}
function prettyDate(value){
  if(!value)return "No date";
  const [y,m,d]=value.split("-").map(Number);
  return new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",year:"numeric"}).format(new Date(y,m-1,d));
}
function sectionChevron(open){return open?"⌃":"⌄";}

function BudgetPage(){
  ensureBudgetData();
  const month=budgetViewMonth||budgetMonthKey();
  const monthEntries=data.budgetEntries.filter(x=>(x.date||"").slice(0,7)===month);
  const monthSavings=data.savingsEntries.filter(x=>(x.date||"").slice(0,7)===month);
  const income=monthEntries.filter(x=>x.type==="income").reduce((n,x)=>n+(Number(x.amount)||0),0);
  const spending=monthEntries.filter(x=>x.type==="expense").reduce((n,x)=>n+(Number(x.amount)||0),0);
  const billsTotal=data.bills.reduce((n,x)=>n+(Number(x.amount)||0),0);
  const paidBills=data.bills.filter(x=>billPaidForMonth(x,month));
  const billsPaid=paidBills.reduce((n,x)=>n+(Number(x.amount)||0),0);
  const balance=income-spending-billsPaid;
  const savingsBalance=savingsBalanceThrough(month);
  const savingsAdded=monthSavings.reduce((n,x)=>n+(x.type==="withdraw"?-(Number(x.amount)||0):(Number(x.amount)||0)),0);
  const upcoming=[...data.bills].sort((a,b)=>billDateForMonth(a,month).localeCompare(billDateForMonth(b,month)));

  return shell(`${head("Budget & Bills","Keep monthly money in one calm place")}
    <section class="card budget-month-nav">
      <button type="button" class="secondary" id="previousBudgetMonth" aria-label="Previous month">‹</button>
      <label class="field-label budget-month-picker">Viewing month<input class="field" id="budgetMonth" type="month" value="${esc(month)}"></label>
      <button type="button" class="secondary" id="nextBudgetMonth" aria-label="Next month">›</button>
      ${month!==budgetMonthKey()?`<button type="button" class="secondary" id="currentBudgetMonth">Current month</button>`:""}
    </section>

    <section class="budget-summary-grid">
      <div class="metric-card"><span>Income · ${esc(monthLabel(month))}</span><strong>${money(income)}</strong></div>
      <div class="metric-card"><span>Expenses · ${esc(monthLabel(month))}</span><strong>${money(spending+billsPaid)}</strong></div>
      <div class="metric-card"><span>Bills paid</span><strong>${money(billsPaid)}</strong></div>
      <div class="metric-card"><span>Left after paid bills</span><strong>${money(balance)}</strong></div>
      <div class="metric-card savings-metric"><span>Savings carried forward</span><strong>${money(savingsBalance)}</strong><small>${savingsAdded>=0?"Added":"Taken out"} this month: ${money(Math.abs(savingsAdded))}</small></div>
    </section>

    <section class="card budget-card collapsible-budget-card">
      <button type="button" class="budget-collapse-head" data-toggle-budget-section="entries" aria-expanded="${budgetSectionOpen.entries}">
        <span><strong>Income & expenses</strong><small>History for ${esc(monthLabel(month))}</small></span>
        <span class="budget-head-total">${money(income-spending)} <i>${sectionChevron(budgetSectionOpen.entries)}</i></span>
      </button>
      <div class="budget-collapsible-body" ${budgetSectionOpen.entries?"":"hidden"}>
        <div class="budget-actions"><button type="button" class="secondary" id="addEntryToggle">Add entry</button></div>
        <div id="entryForm" class="budget-form" hidden>
          <div class="two-col"><label class="field-label">Type<select id="entryType"><option value="expense">Expense</option><option value="income">Income</option></select></label><label class="field-label">Date<input class="field" id="entryDate" type="date" value="${month===budgetMonthKey()?today():`${month}-01`}"></label></div>
          <label class="field-label">Description<input class="field" id="entryName" placeholder="Groceries, wages, petrol..."></label>
          <div class="two-col"><label class="field-label">Amount (£)<input class="field" id="entryAmount" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></label><label class="field-label">Category<select id="entryCategory"><option>Groceries</option><option>Home</option><option>Transport</option><option>Health</option><option>Fun</option><option>Work</option><option>Other</option></select></label></div>
          <button type="button" class="primary" id="saveEntry">Save entry</button>
        </div>
        <div class="budget-list">${monthEntries.length?[...monthEntries].sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(e=>`<article class="budget-row entry-row">
          <span class="entry-icon">${e.type==="income"?"＋":"−"}</span><div><strong>${esc(e.name)}</strong><small>${esc(e.category||"Other")} · ${esc(prettyDate(e.date||""))}</small></div><b class="${e.type==="income"?"income":"expense"}">${e.type==="income"?"+":"−"}${money(e.amount)}</b><button type="button" class="budget-delete" data-delete-entry="${esc(e.id)}" aria-label="Delete ${esc(e.name)}">×</button>
        </article>`).join(""):`<p class="empty-state">No entries for ${esc(monthLabel(month))} yet.</p>`}</div>
      </div>
    </section>

    <section class="card budget-card collapsible-budget-card">
      <button type="button" class="budget-collapse-head" data-toggle-budget-section="bills" aria-expanded="${budgetSectionOpen.bills}">
        <span><strong>Monthly bills</strong><small>${paidBills.length} of ${data.bills.length} paid</small></span>
        <span class="budget-head-total">${money(billsTotal)} <i>${sectionChevron(budgetSectionOpen.bills)}</i></span>
      </button>
      <div class="budget-collapsible-body" ${budgetSectionOpen.bills?"":"hidden"}>
        <div class="budget-actions"><button type="button" class="primary" id="addBillToggle">Add bill</button></div>
        <div id="billForm" class="budget-form" hidden>
          <label class="field-label">Bill name<input class="field" id="billName" placeholder="Rent, electricity, Netflix..."></label>
          <div class="two-col">
            <label class="field-label">Amount (£)<input class="field" id="billAmount" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></label>
            <label class="field-label">Due date<input class="field" id="billDueDate" type="date" value="${month===budgetMonthKey()?today():`${month}-01`}"></label>
          </div>
          <label class="field-label">Category<select id="billCategory"><option>Home</option><option>Utilities</option><option>Subscriptions</option><option>Transport</option><option>Health</option><option>Other</option></select></label>
          <button type="button" class="primary" id="saveBill">Save bill</button>
        </div>
        <div class="budget-list bill-list">${upcoming.length?upcoming.map(b=>{
          const paid=billPaidForMonth(b,month), open=budgetOpenBill===b.id, editing=budgetEditBill===b.id, dueDate=billDateForMonth(b,month);
          return `<article class="budget-bill-item ${paid?"is-paid":""}" data-bill-id="${esc(b.id)}">
            <button type="button" class="bill-summary-row" data-toggle-bill="${esc(b.id)}" aria-expanded="${open}">
              <span class="bill-summary-name">${esc(b.name)}</span><b>${money(b.amount)}</b><span class="bill-row-chevron">${sectionChevron(open)}</span>
            </button>
            <div class="bill-expanded" ${open?"":"hidden"}>
              ${editing?`<div class="budget-form bill-edit-form">
                <label class="field-label">Bill name<input class="field editBillName" value="${esc(b.name)}"></label>
                <div class="two-col"><label class="field-label">Amount (£)<input class="field editBillAmount" type="number" min="0" step="0.01" value="${esc(b.amount)}"></label><label class="field-label">Due date<input class="field editBillDueDate" type="date" value="${esc(dueDate)}"></label></div>
                <label class="field-label">Category<select class="editBillCategory">${["Home","Utilities","Subscriptions","Transport","Health","Other"].map(c=>`<option ${c===(b.category||"Other")?"selected":""}>${c}</option>`).join("")}</select></label>
                <div class="bill-edit-actions"><button type="button" class="primary" data-save-bill-edit="${esc(b.id)}">Save changes</button><button type="button" class="secondary" data-cancel-bill-edit="${esc(b.id)}">Cancel</button></div>
              </div>`:`<div class="bill-detail-line"><span>${esc(b.category||"Other")}</span><span>Due ${esc(prettyDate(dueDate))}</span></div>
              <div class="bill-detail-actions"><button type="button" class="bill-paid-action ${paid?"is-paid-button":""}" data-toggle-paid="${esc(b.id)}">${paid?"✓ Paid":"Mark paid"}</button><button type="button" class="secondary" data-edit-bill="${esc(b.id)}">Edit</button><button type="button" class="budget-delete-text" data-delete-bill="${esc(b.id)}">Delete</button></div>`}
            </div>
          </article>`;
        }).join(""):`<p class="empty-state">No bills added yet.</p>`}</div>
      </div>
    </section>

    <section class="card budget-card collapsible-budget-card">
      <button type="button" class="budget-collapse-head" data-toggle-budget-section="savings" aria-expanded="${budgetSectionOpen.savings}">
        <span><strong>Savings</strong><small>Automatically carried into following months</small></span>
        <span class="budget-head-total">${money(savingsBalance)} <i>${sectionChevron(budgetSectionOpen.savings)}</i></span>
      </button>
      <div class="budget-collapsible-body" ${budgetSectionOpen.savings?"":"hidden"}>
        <div class="budget-actions"><button type="button" class="primary" id="addSavingToggle">Update savings</button></div>
        <div id="savingForm" class="budget-form" hidden>
          <div class="two-col"><label class="field-label">Action<select id="savingType"><option value="add">Add to savings</option><option value="withdraw">Take from savings</option></select></label><label class="field-label">Date<input class="field" id="savingDate" type="date" value="${month===budgetMonthKey()?today():`${month}-01`}"></label></div>
          <div class="two-col"><label class="field-label">Amount (£)<input class="field" id="savingAmount" type="number" inputmode="decimal" min="0" step="0.01" placeholder="0.00"></label><label class="field-label">Note<input class="field" id="savingNote" placeholder="Emergency fund, holiday..."></label></div>
          <button type="button" class="primary" id="saveSaving">Save savings update</button>
        </div>
        <div class="budget-list">${monthSavings.length?[...monthSavings].sort((a,b)=>(b.date||"").localeCompare(a.date||"")).map(e=>`<article class="budget-row entry-row">
          <span class="entry-icon">${e.type==="withdraw"?"−":"＋"}</span><div><strong>${esc(e.note||"Savings update")}</strong><small>${esc(prettyDate(e.date||""))}</small></div><b class="${e.type==="withdraw"?"expense":"income"}">${e.type==="withdraw"?"−":"+"}${money(e.amount)}</b><button type="button" class="budget-delete" data-delete-saving="${esc(e.id)}" aria-label="Delete savings update">×</button>
        </article>`).join(""):`<p class="empty-state">No savings changes in ${esc(monthLabel(month))}.</p>`}</div>
      </div>
    </section>
  `,"budget");
}

function bindBudget(){
  ensureBudgetData();
  const month=budgetViewMonth||budgetMonthKey();
  const toggle=(buttonId,formId)=>document.querySelector(buttonId)?.addEventListener("click",()=>{const form=document.querySelector(formId);if(form)form.hidden=!form.hidden});
  toggle("#addBillToggle","#billForm"); toggle("#addEntryToggle","#entryForm"); toggle("#addSavingToggle","#savingForm");

  document.querySelectorAll("[data-toggle-budget-section]").forEach(btn=>btn.addEventListener("click",()=>{
    const key=btn.dataset.toggleBudgetSection; budgetSectionOpen[key]=!budgetSectionOpen[key]; render();
  }));
  document.querySelectorAll("[data-toggle-bill]").forEach(btn=>btn.addEventListener("click",()=>{
    const id=btn.dataset.toggleBill; budgetOpenBill=budgetOpenBill===id?null:id; if(budgetOpenBill!==id)budgetEditBill=null; render();
  }));

  document.querySelector("#budgetMonth")?.addEventListener("change",e=>{if(e.target.value){budgetViewMonth=e.target.value;render();}});
  document.querySelector("#previousBudgetMonth")?.addEventListener("click",()=>{budgetViewMonth=shiftBudgetMonth(month,-1);render();});
  document.querySelector("#nextBudgetMonth")?.addEventListener("click",()=>{budgetViewMonth=shiftBudgetMonth(month,1);render();});
  document.querySelector("#currentBudgetMonth")?.addEventListener("click",()=>{budgetViewMonth=budgetMonthKey();render();});

  document.querySelector("#saveBill")?.addEventListener("click",()=>{
    const name=document.querySelector("#billName")?.value.trim();
    const amount=Number(document.querySelector("#billAmount")?.value);
    const dueDate=document.querySelector("#billDueDate")?.value;
    if(!name||!Number.isFinite(amount)||amount<0||!dueDate){toast("Add a bill name, amount and due date.");return;}
    data.bills.push({id:`bill-${Date.now()}`,name,amount,dueDate,dueDay:Number(dueDate.slice(8,10)),category:document.querySelector("#billCategory")?.value||"Other",paid:false,paidMonths:{}});
    saveData(); render();
  });
  document.querySelectorAll("[data-edit-bill]").forEach(btn=>btn.addEventListener("click",()=>{budgetOpenBill=btn.dataset.editBill;budgetEditBill=btn.dataset.editBill;render();}));
  document.querySelectorAll("[data-cancel-bill-edit]").forEach(btn=>btn.addEventListener("click",()=>{budgetEditBill=null;render();}));
  document.querySelectorAll("[data-save-bill-edit]").forEach(btn=>btn.addEventListener("click",()=>{
    const item=btn.closest("[data-bill-id]"); const bill=data.bills.find(x=>x.id===btn.dataset.saveBillEdit); if(!item||!bill)return;
    const name=item.querySelector(".editBillName")?.value.trim(); const amount=Number(item.querySelector(".editBillAmount")?.value); const dueDate=item.querySelector(".editBillDueDate")?.value;
    if(!name||!Number.isFinite(amount)||amount<0||!dueDate){toast("Add a bill name, amount and due date.");return;}
    bill.name=name; bill.amount=amount; bill.dueDate=dueDate; bill.dueDay=Number(dueDate.slice(8,10)); bill.category=item.querySelector(".editBillCategory")?.value||"Other";
    budgetEditBill=null; saveData(); render();
  }));

  document.querySelector("#saveEntry")?.addEventListener("click",()=>{
    const name=document.querySelector("#entryName")?.value.trim(); const amount=Number(document.querySelector("#entryAmount")?.value); const date=document.querySelector("#entryDate")?.value||today();
    if(!name||!Number.isFinite(amount)||amount<=0){toast("Add a description and amount.");return;}
    data.budgetEntries.push({id:`money-${Date.now()}`,type:document.querySelector("#entryType")?.value||"expense",name,amount,date,category:document.querySelector("#entryCategory")?.value||"Other"});
    budgetViewMonth=date.slice(0,7); saveData(); render();
  });
  document.querySelector("#saveSaving")?.addEventListener("click",()=>{
    const amount=Number(document.querySelector("#savingAmount")?.value); const date=document.querySelector("#savingDate")?.value||today(); const type=document.querySelector("#savingType")?.value||"add"; const note=document.querySelector("#savingNote")?.value.trim()||"Savings update";
    if(!Number.isFinite(amount)||amount<=0){toast("Add a savings amount.");return;}
    if(type==="withdraw"&&amount>savingsBalanceThrough(date.slice(0,7))){toast("That is more than the savings balance available for this month.");return;}
    data.savingsEntries.push({id:`saving-${Date.now()}`,type,amount,date,note}); budgetViewMonth=date.slice(0,7); saveData(); render();
  });

  document.querySelectorAll("[data-toggle-paid]").forEach(btn=>btn.addEventListener("click",()=>{
    const bill=data.bills.find(x=>x.id===btn.dataset.togglePaid); if(!bill)return;
    if(!bill.paidMonths||typeof bill.paidMonths!=="object") bill.paidMonths={}; bill.paidMonths[month]=!bill.paidMonths[month]; bill.paid=billPaidForMonth(bill,budgetMonthKey()); saveData(); render();
  }));
  document.querySelectorAll("[data-delete-bill]").forEach(btn=>btn.addEventListener("click",()=>{data.bills=data.bills.filter(x=>x.id!==btn.dataset.deleteBill);if(budgetOpenBill===btn.dataset.deleteBill)budgetOpenBill=null;saveData();render()}));
  document.querySelectorAll("[data-delete-entry]").forEach(btn=>btn.addEventListener("click",()=>{data.budgetEntries=data.budgetEntries.filter(x=>x.id!==btn.dataset.deleteEntry);saveData();render()}));
  document.querySelectorAll("[data-delete-saving]").forEach(btn=>btn.addEventListener("click",()=>{data.savingsEntries=data.savingsEntries.filter(x=>x.id!==btn.dataset.deleteSaving);saveData();render()}));
}
