const CURRENCIES={INR:'₹ INR',USD:'$ USD',EUR:'€ EUR',GBP:'£ GBP',JPY:'¥ JPY',AUD:'A$ AUD',CAD:'C$ CAD',SGD:'S$ SGD',AED:'د.إ AED'};
const CURRENCY_CODES=Object.keys(CURRENCIES);

function getCurrencyCode(){
  try{const code=localStorage.getItem('jkcalchub-currency');return CURRENCY_CODES.includes(code)?code:'INR'}catch(_){return'INR'}
}

function setCurrencyCode(code){
  if(!CURRENCY_CODES.includes(code))return;
  try{localStorage.setItem('jkcalchub-currency',code)}catch(_){}
  document.querySelectorAll('#global-currency').forEach(select=>{if(select.value!==code)select.value=code});
  document.querySelectorAll('#local-currency').forEach(select=>{if(select.value!==code)select.value=code});
  document.dispatchEvent(new CustomEvent('jkcalchub:currency-change',{detail:{code}}));
}

function formatMoney(amount){
  const code=getCurrencyCode();
  try{return new Intl.NumberFormat(code==='INR'?'en-IN':undefined,{style:'currency',currency:code,minimumFractionDigits:code==='JPY'?0:2,maximumFractionDigits:code==='JPY'?0:2}).format(Number(amount)||0)}catch(_){const symbols={INR:'₹',USD:'$',EUR:'€',GBP:'£',JPY:'¥',AUD:'A$',CAD:'C$',SGD:'S$',AED:'د.إ'};return symbols[code]+(Number(amount)||0).toLocaleString()}
}

window.JKCalcCurrency={get:getCurrencyCode,set:setCurrencyCode,format:formatMoney,currencies:CURRENCIES};
window.money=formatMoney;

const monetaryCalculators=new Set(['discount','tip','fuel','emi','sip','lumpsum','fd','rd','gst','ppf-epf','hra','interest','inflation','profit','freelance','earnings']);

document.addEventListener('DOMContentLoaded',()=>{
  const saved=getCurrencyCode();
  document.querySelectorAll('#global-currency').forEach(select=>{select.value=saved;select.addEventListener('change',()=>setCurrencyCode(select.value))});
  const form=document.querySelector('#calc-form');if(!form)return;
  const id=new URLSearchParams(location.search).get('id')||'standard';
  if(monetaryCalculators.has(id)&&!form.querySelector('#local-currency')){const field=document.createElement('div');field.className='field full currency-field';field.innerHTML=`<label for="local-currency">Currency for this calculator</label><select id="local-currency" aria-label="Currency for this calculator">${CURRENCY_CODES.map(code=>`<option value="${code}">${CURRENCIES[code]}</option>`).join('')}</select>`;form.querySelector('#form-fields').append(field)}
  const local=document.querySelector('#local-currency');if(local){local.value=saved;local.addEventListener('change',()=>setCurrencyCode(local.value))}
  document.addEventListener('jkcalchub:currency-change',()=>{document.querySelectorAll('#global-currency').forEach(select=>select.value=getCurrencyCode());if(local)local.value=getCurrencyCode();if(form.dataset.ready==='true')form.requestSubmit()});
  setTimeout(()=>{form.dataset.ready='true';form.requestSubmit()},0);
});
