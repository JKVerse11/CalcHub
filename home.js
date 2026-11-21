document.addEventListener('DOMContentLoaded',()=>{
  const search=document.querySelector('#calculator-search');
  const cards=[...document.querySelectorAll('.tool-card')];
  const filters=[...document.querySelectorAll('.filter-chip')];
  const count=document.querySelector('#result-count');
  const empty=document.querySelector('#empty-state');
  let category='all';
  const filterCards=()=>{
    const term=search.value.trim().toLowerCase();
    let visible=0;
    cards.forEach(card=>{
      const matchCategory=category==='all'||card.dataset.category===category;
      const matchText=(card.innerText+' '+card.dataset.search).toLowerCase().includes(term);
      const show=matchCategory&&matchText;
      card.hidden=!show;
      if(show) visible++;
    });
    count.textContent=`${visible} calculator${visible===1?'':'s'}`;
    empty.hidden=visible!==0;
  };
  search.addEventListener('input',filterCards);
  filters.forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.filter;
    filters.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
    filterCards();
  }));
  document.addEventListener('keydown',event=>{
    if(event.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){event.preventDefault();search.focus();}
  });
  document.querySelectorAll('[data-year]').forEach(node=>node.textContent=new Date().getFullYear());
});
