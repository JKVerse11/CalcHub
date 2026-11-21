/* Gold and silver spot estimate with country-based currency conversion. */
(() => {
  'use strict';

  const API = {
    countries: 'https://restcountries.com/v3.1/all?fields=name,currencies,cca2',
    fx: 'https://api.frankfurter.dev/v1/latest?base=USD',
    gold: 'https://api.gold-api.com/price/XAU',
    silver: 'https://api.gold-api.com/price/XAG'
  };
  const TROY_OUNCE_GRAMS = 31.1034768;
  const FALLBACK_COUNTRIES = [
    ['India','INR','IN'],['United States','USD','US'],['United Kingdom','GBP','GB'],['Euro area','EUR','EU'],
    ['Japan','JPY','JP'],['Canada','CAD','CA'],['Australia','AUD','AU'],['Singapore','SGD','SG'],
    ['United Arab Emirates','AED','AE'],['South Africa','ZAR','ZA'],['Switzerland','CHF','CH'],['New Zealand','NZD','NZ']
  ];
  const $ = id => document.getElementById(id);
  const countrySelect = $('metal-country');
  const typeSelect = $('metal-type');
  const puritySelect = $('metal-purity');
  const weightInput = $('metal-weight');
  const totalNode = $('metal-total');
  const breakdownNode = $('metal-breakdown');
  const updatedNode = $('metal-updated');
  const refreshButton = $('metal-refresh');
  let rates = null;
  let quotes = null;
  let loading = false;

  async function getJSON(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Rate service returned ${response.status}`);
    return response.json();
  }

  function countryRows(data) {
    const rows = [];
    for (const country of data || []) {
      const currencies = country.currencies || {};
      const code = Object.keys(currencies)[0];
      const name = country.name?.common;
      if (code && name && /^[A-Z]{3}$/.test(code)) rows.push([name, code, country.cca2 || '']);
    }
    const unique = new Map();
    rows.sort((a, b) => a[0].localeCompare(b[0])).forEach(row => {
      const key = `${row[0]}|${row[1]}`;
      if (!unique.has(key)) unique.set(key, row);
    });
    return [...unique.values()];
  }

  function renderCountries(rows) {
    const preferred = rows.find(row => row[2] === 'IN') || FALLBACK_COUNTRIES[0];
    const options = rows.map(([name, code, countryCode]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = `${name} — ${code}`;
      option.dataset.country = countryCode;
      return option;
    });
    countrySelect.replaceChildren(...options);
    const india = [...countrySelect.options].find(option => option.dataset.country === 'IN' && option.value === 'INR');
    if (india) countrySelect.value = india.value;
    else if (countrySelect.options.length) countrySelect.value = preferred[1];
  }

  function formatMoney(value, currency) {
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
    } catch (_) {
      return `${value.toFixed(2)} ${currency}`;
    }
  }

  function showError(message) {
    totalNode.textContent = message;
    totalNode.classList.add('metal-error');
  }

  function renderEstimate() {
    if (!quotes || !rates) return;
    const grams = Number(weightInput.value);
    if (!Number.isFinite(grams) || grams <= 0) {
      showError('Enter a weight greater than zero.');
      breakdownNode.textContent = '';
      return;
    }
    const currency = countrySelect.value;
    const conversion = currency === 'USD' ? 1 : rates[currency];
    if (!Number.isFinite(conversion)) {
      showError(`Currency conversion for ${currency} is unavailable from the rate provider.`);
      breakdownNode.textContent = 'Choose a country using a currency supported by the FX feed.';
      return;
    }
    const gold = typeSelect.value === 'gold';
    const karat = Number(puritySelect.value);
    const purityFactor = gold ? karat / 24 : Number(puritySelect.value);
    const unitSpotUSD = quotes[typeSelect.value].price / TROY_OUNCE_GRAMS;
    const unitPrice = unitSpotUSD * conversion * purityFactor;
    const estimate = unitPrice * grams;
    totalNode.classList.remove('metal-error');
    totalNode.textContent = formatMoney(estimate, currency);
    breakdownNode.textContent = `${formatMoney(unitPrice, currency)} per gram × ${grams.toLocaleString()} g · ${gold ? `${karat}K gold` : (purityFactor === 0.999 ? '999 silver' : '925 silver')}`;
    const time = [quotes.gold.updatedAt, quotes.silver.updatedAt].filter(Boolean).map(value => new Date(value)).filter(date => !Number.isNaN(date.getTime())).sort((a,b) => b-a)[0];
    updatedNode.textContent = time ? `Metal quote timestamp: ${time.toLocaleString()} · Checked ${new Date().toLocaleTimeString()}` : `Rates checked ${new Date().toLocaleTimeString()}`;
  }

  async function refreshRates() {
    if (loading) return;
    loading = true;
    refreshButton.disabled = true;
    refreshButton.textContent = 'Refreshing…';
    try {
      const [gold, silver, fx] = await Promise.all([getJSON(API.gold), getJSON(API.silver), getJSON(API.fx)]);
      if (!Number.isFinite(Number(gold.price)) || !Number.isFinite(Number(silver.price)) || !fx.rates) throw new Error('The rate service returned incomplete data.');
      quotes = { gold: { ...gold, price: Number(gold.price) }, silver: { ...silver, price: Number(silver.price) } };
      rates = fx.rates;
      rates.USD = 1;
      renderEstimate();
    } catch (error) {
      if (!quotes) showError('Live rates are temporarily unavailable. Please try again.');
      else {
        updatedNode.textContent = `Could not refresh rates; showing the previous quote. ${error.message}`;
        renderEstimate();
      }
    } finally {
      loading = false;
      refreshButton.disabled = false;
      refreshButton.textContent = 'Refresh rates';
    }
  }

  async function loadCountries() {
    try {
      const countries = countryRows(await getJSON(API.countries));
      if (countries.length) renderCountries(countries);
      else renderCountries(FALLBACK_COUNTRIES);
    } catch (_) {
      renderCountries(FALLBACK_COUNTRIES);
    }
  }

  typeSelect.addEventListener('change', () => {
    const gold = typeSelect.value === 'gold';
    puritySelect.replaceChildren(...(gold
      ? [['24','24K gold'],['22','22K gold'],['18','18K gold']]
      : [['0.999','999 silver'],['0.925','925 sterling silver']]
    ).map(([value,label]) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      return option;
    }));
    renderEstimate();
  });
  countrySelect.addEventListener('change', renderEstimate);
  puritySelect.addEventListener('change', renderEstimate);
  weightInput.addEventListener('input', renderEstimate);
  refreshButton.addEventListener('click', refreshRates);

  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });
  loadCountries();
  refreshRates();
  window.setInterval(refreshRates, 60 * 1000);
})();
