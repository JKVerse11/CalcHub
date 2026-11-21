(function(){
  const currencies={INR:'₹ INR',USD:'$ USD',EUR:'€ EUR',GBP:'£ GBP',JPY:'¥ JPY',AUD:'A$ AUD',CAD:'C$ CAD',SGD:'S$ SGD',AED:'د.إ AED'};
  const symbols={INR:'₹',USD:'$',EUR:'€',GBP:'£',JPY:'¥',AUD:'A$',CAD:'C$',SGD:'S$',AED:'د.إ'};
  const monetaryCalculators=new Set(['discount','tip','fuel','emi','sip','lumpsum','fd','rd','gst','ppf-epf','hra','interest','inflation','profit','freelance','earnings']);
  const getCurrency=()=>{try{const code=localStorage.getItem('jkcalchub-currency');return currencies[code]?code:'INR'}catch(_){return'INR'}};
  const formatMoney=n=>{try{return new Intl.NumberFormat(undefined,{style:'currency',currency:getCurrency(),maximumFractionDigits:getCurrency()==='JPY'?0:2}).format(Number(n)||0)}catch(_){return`${symbols[getCurrency()]}${Number(n||0).toLocaleString()}`}};
  // calculator.js exposes its formatter globally; replace it before its DOM-ready calculation runs.
  window.money=formatMoney;
  const syncFormCurrency=()=>{
    const form=document.querySelector('#calc-form');if(!form)return;
    const code=getCurrency(),symbol=symbols[code],currencyField=form.elements.currency;
    if(currencyField&&currencyField.tagName==='SELECT'&&[...currencyField.options].some(o=>o.value===symbol))currencyField.value=symbol;
    const local=form.querySelector('#local-currency');if(local)local.value=code;
    const button=document.querySelector('.calculate-button');if(button)button.textContent='Calculate result →';
    if(form.dataset.calculatorReady==='true')form.requestSubmit();
  };
  document.addEventListener('DOMContentLoaded',()=>{
    const global=document.querySelector('#global-currency');
    if(global){global.value=getCurrency();global.addEventListener('change',()=>{try{localStorage.setItem('jkcalchub-currency',global.value)}catch(_){};syncFormCurrency()})}
    const form=document.querySelector('#calc-form');
    if(form){const id=new URLSearchParams(location.search).get('id')||'standard';if(monetaryCalculators.has(id)){const field=document.createElement('div');field.className='field currency-field';field.innerHTML=`<label for="local-currency">Currency for amounts and results</label><select id="local-currency" aria-label="Currency for this calculator">${Object.entries(currencies).map(([code,label])=>`<option value="${code}">${label}</option>`).join('')}</select>`;const fields=form.querySelector('#form-fields');fields.append(field);const local=field.querySelector('select');local.value=getCurrency();local.addEventListener('change',()=>{try{localStorage.setItem('jkcalchub-currency',local.value)}catch(_){};if(global)global.value=local.value;syncFormCurrency()});form.dataset.calculatorReady='true';syncFormCurrency()}}
    document.addEventListener('currencychange',syncFormCurrency);
  });
})();
