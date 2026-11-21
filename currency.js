/* Currency formatting preference. Selection formats values; it never converts currencies. */
(() => {
  'use strict';
  const currencies={INR:'₹ INR',USD:'$ USD',EUR:'€ EUR',GBP:'£ GBP',JPY:'¥ JPY',AUD:'A$ AUD',CAD:'C$ CAD',SGD:'S$ SGD',AED:'د.إ AED'};
  const valid=Object.keys(currencies);
  function get(){try{const saved=localStorage.getItem('jkcalchub-currency');return valid.includes(saved)?saved:'INR';}catch(_){return'INR';}}
  function set(code){if(!valid.includes(code))return;try{localStorage.setItem('jkcalchub-currency',code);}catch(_){}document.querySelectorAll('#global-currency,#local-currency').forEach(el=>{el.value=code;});document.dispatchEvent(new CustomEvent('jkcalchub:currency-change',{detail:{code}}));}
  function format(amount){const code=get();const value=Number(amount);if(!Number.isFinite(value))return '—';try{return new Intl.NumberFormat(code==='INR'?'en-IN':undefined,{style:'currency',currency:code,maximumFractionDigits:code==='JPY'?0:2}).format(value);}catch(_){return `${value.toLocaleString()} ${code}`;}}
  window.JKCalcCurrency={get,set,format,currencies};
  document.addEventListener('DOMContentLoaded',()=>document.querySelectorAll('#global-currency,#local-currency').forEach(select=>{select.value=get();select.addEventListener('change',()=>set(select.value));}));
})();
