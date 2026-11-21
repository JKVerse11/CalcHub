/* Currency formatting preference. Selection formats values; it never converts currencies. */
(() => {
  'use strict';
  const currencies = {
    INR: '₹ INR — Indian Rupee',
    USD: '$ USD — US Dollar',
    EUR: '€ EUR — Euro',
    GBP: '£ GBP — British Pound',
    JPY: '¥ JPY — Japanese Yen',
    AUD: 'A$ AUD — Australian Dollar',
    CAD: 'C$ CAD — Canadian Dollar',
    SGD: 'S$ SGD — Singapore Dollar',
    AED: 'د.إ AED — UAE Dirham'
  };
  const validCodes = Object.keys(currencies);
  const STORAGE_KEY = 'jkcalchub-currency';

  function get() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return validCodes.includes(saved) ? saved : 'INR';
    } catch (_) {
      return 'INR';
    }
  }

  function syncSelectors(code) {
    document.querySelectorAll('#global-currency, #local-currency, [data-currency-select]').forEach(select => {
      if (select instanceof HTMLSelectElement && [...select.options].some(option => option.value === code)) {
        select.value = code;
      }
    });
  }

  function set(code) {
    if (!validCodes.includes(code)) return;
    try { localStorage.setItem(STORAGE_KEY, code); } catch (_) { /* Storage may be disabled. */ }
    syncSelectors(code);
    document.dispatchEvent(new CustomEvent('jkcalchub:currency-change', { detail: { code } }));
  }

  function format(amount) {
    const code = get();
    const value = Number(amount);
    if (!Number.isFinite(value)) return '—';
    try {
      return new Intl.NumberFormat(code === 'INR' ? 'en-IN' : undefined, {
        style: 'currency', currency: code,
        minimumFractionDigits: code === 'JPY' ? 0 : 2,
        maximumFractionDigits: code === 'JPY' ? 0 : 2
      }).format(value);
    } catch (_) {
      return `${value.toLocaleString()} ${code}`;
    }
  }

  window.JKCalcCurrency = { get, set, format, currencies };
  window.money = format;

  document.addEventListener('DOMContentLoaded', () => {
    const selected = get();
    document.querySelectorAll('#global-currency, #local-currency, [data-currency-select]').forEach(select => {
      syncSelectors(selected);
      select.addEventListener('change', () => set(select.value));
    });
  });
})();
