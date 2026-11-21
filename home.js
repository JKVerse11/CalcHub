document.addEventListener('DOMContentLoaded',()=>{
  const cards=[...document.querySelectorAll('.tool-card')];
  const filters=[...document.querySelectorAll('.filter-chip')];
  const count=document.querySelector('#result-count');
  let category='all';
  const filterCards=()=>{
    let visible=0;
    cards.forEach(card=>{const show=category==='all'||card.dataset.category===category;card.hidden=!show;if(show)visible++;});
    if(count)count.textContent=`${visible} calculator${visible===1?'':'s'}`;
  };
  filters.forEach(button=>button.addEventListener('click',()=>{
    category=button.dataset.filter;
    filters.forEach(item=>{const active=item===button;item.classList.toggle('active',active);item.setAttribute('aria-pressed',String(active));});
    filterCards();
  }));
  document.querySelectorAll('[data-year]').forEach(node=>node.textContent=new Date().getFullYear());
});
