
function ensureBooksData(){
  data.books=Array.isArray(data.books)?data.books:[];
  data.booksView=data.booksView||{tab:"reading"};
}
function bookStatusLabel(status){return ({wishlist:"Want to Read",reading:"Currently Reading",finished:"Finished"})[status]||"Want to Read";}
function BooksPage(){
  ensureBooksData();
  const tab=data.booksView.tab||"reading";
  const books=data.books.filter(book=>book.status===tab);
  const card=book=>{
    const pages=Number(book.pages)||0,current=Math.min(Number(book.currentPage)||0,pages||Number(book.currentPage)||0);
    const progress=pages?Math.round((current/pages)*100):(book.status==="finished"?100:0);
    return `<article class="card book-card">
      <div class="book-cover">${book.cover?`<img src="${book.cover}" alt="">`:"📖"}</div>
      <div class="book-copy"><h3>${esc(book.title)}</h3><p>${esc(book.author||"Unknown author")}</p>
        ${book.status==="reading"?`<div class="book-progress"><span style="width:${progress}%"></span></div><small>${pages?`${current} / ${pages} pages · `:""}${progress}%</small>`:""}
        ${book.status==="finished"?`<small>${book.rating?`${"★".repeat(Number(book.rating))} `:""}${book.finishedDate?`Finished ${formatDate(book.finishedDate)}`:"Finished"}</small>`:""}
      </div>
      <div class="book-actions"><button class="mini" data-book-edit="${esc(book.id)}">Edit</button><button class="mini danger" data-book-delete="${esc(book.id)}">×</button></div>
    </article>`;
  };
  return shell(`${head("Books","Your reading list and finished shelves","hobbies")}
    <nav class="book-tabs">
      <button class="${tab==="wishlist"?"active":""}" data-book-tab="wishlist">Want to Read <b>${data.books.filter(b=>b.status==="wishlist").length}</b></button>
      <button class="${tab==="reading"?"active":""}" data-book-tab="reading">Reading <b>${data.books.filter(b=>b.status==="reading").length}</b></button>
      <button class="${tab==="finished"?"active":""}" data-book-tab="finished">Finished <b>${data.books.filter(b=>b.status==="finished").length}</b></button>
    </nav>
    <section class="card book-add-card">
      <h2 id="bookFormTitle">Add a book</h2>
      <input type="hidden" id="bookEditId">
      <div class="form-grid two-col"><input class="field" id="bookTitle" placeholder="Book title"><input class="field" id="bookAuthor" placeholder="Author"></div>
      <div class="form-grid two-col"><select class="field" id="bookStatus"><option value="wishlist">Want to Read</option><option value="reading">Currently Reading</option><option value="finished">Finished</option></select><input class="field" id="bookPages" type="number" min="0" inputmode="numeric" placeholder="Total pages"></div>
      <div class="form-grid two-col"><input class="field" id="bookCurrentPage" type="number" min="0" inputmode="numeric" placeholder="Current page"><select class="field" id="bookRating"><option value="">No rating</option>${[1,2,3,4,5].map(n=>`<option value="${n}">${n} star${n===1?"":"s"}</option>`).join("")}</select></div>
      <div class="form-grid two-col"><input class="field" id="bookStartedDate" type="date"><input class="field" id="bookFinishedDate" type="date"></div>
      <textarea class="field" id="bookNotes" rows="3" placeholder="Notes, thoughts or favourite quote"></textarea>
      <div class="book-form-actions"><button class="primary" id="saveBook">Save book</button><button class="secondary" id="cancelBookEdit" hidden>Cancel</button></div>
    </section>
    <section class="book-list">${books.length?books.map(card).join(""):`<section class="card empty"><p>No books on this shelf yet.</p></section>`}</section>
  `,"books");
}
function bindBooks(){
  ensureBooksData();
  document.querySelectorAll("[data-book-tab]").forEach(button=>button.onclick=()=>{data.booksView.tab=button.dataset.bookTab;saveData();render();});
  const fillForm=book=>{
    document.querySelector("#bookFormTitle").textContent="Edit book";
    document.querySelector("#bookEditId").value=book.id;
    ["Title","Author","Pages","CurrentPage","Rating","StartedDate","FinishedDate","Notes"].forEach(key=>{const el=document.querySelector(`#book${key}`);if(el)el.value=book[key.charAt(0).toLowerCase()+key.slice(1)]||"";});
    document.querySelector("#bookStatus").value=book.status||"wishlist";
    document.querySelector("#cancelBookEdit").hidden=false;
    document.querySelector(".book-add-card")?.scrollIntoView({behavior:"smooth",block:"start"});
  };
  document.querySelectorAll("[data-book-edit]").forEach(button=>button.onclick=()=>{const book=data.books.find(b=>String(b.id)===String(button.dataset.bookEdit));if(book)fillForm(book);});
  document.querySelectorAll("[data-book-delete]").forEach(button=>button.onclick=()=>{data.books=data.books.filter(b=>String(b.id)!==String(button.dataset.bookDelete));saveData();render();});
  document.querySelector("#cancelBookEdit")?.addEventListener("click",()=>render());
  document.querySelector("#saveBook")?.addEventListener("click",()=>{
    const title=(document.querySelector("#bookTitle")?.value||"").trim();
    if(!title){toast("Add the book title first");return;}
    const id=document.querySelector("#bookEditId")?.value||`book-${Date.now()}`;
    const existing=data.books.find(b=>String(b.id)===String(id));
    const book={id,title,author:(document.querySelector("#bookAuthor")?.value||"").trim(),status:document.querySelector("#bookStatus")?.value||"wishlist",pages:Number(document.querySelector("#bookPages")?.value)||0,currentPage:Number(document.querySelector("#bookCurrentPage")?.value)||0,rating:Number(document.querySelector("#bookRating")?.value)||0,startedDate:document.querySelector("#bookStartedDate")?.value||"",finishedDate:document.querySelector("#bookFinishedDate")?.value||"",notes:(document.querySelector("#bookNotes")?.value||"").trim(),cover:existing?.cover||"",createdAt:existing?.createdAt||new Date().toISOString()};
    if(book.status==="finished" && !book.finishedDate) book.finishedDate=today();
    if(existing) Object.assign(existing,book); else data.books.unshift(book);
    data.booksView.tab=book.status;saveData();render();toast("Book saved");
  });
}
