/* Refresh the currently displayed monetary estimate whenever the currency format changes. */
(() => {
  'use strict';
  document.addEventListener('jkcalchub:currency-change', () => {
    const form = document.querySelector('#calc-form');
    if (form && !form.hidden) form.requestSubmit();
  });
})();
