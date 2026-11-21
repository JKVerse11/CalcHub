/* Gold and silver spot estimate with country currency conversion and state/province selection. */
(() => {
  'use strict';

  const API = {
    countries: 'https://restcountries.com/v3.1/all?fields=name,currencies,cca2,cca3',
    states: 'https://countriesnow.space/api/v0.1/countries/states',
    fx: 'https://api.frankfurter.dev/v1/latest?base=USD',
    gold: 'https://api.gold-api.com/price/XAU',
    silver: 'https://api.gold-api.com/price/XAG'
  };
  const TROY_OUNCE_GRAMS = 31.1034768;
  const INDIA_STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh',
    'Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland',
    'Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
    'Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir',
    'Ladakh','Lakshadweep','Puducherry'
  ];
  const FALLBACK_COUNTRIES = [
    ['India','INR','IN','IND'],['United States','USD','US','USA'],['United Kingdom','GBP','GB','GBR'],['Euro area','EUR','EU',''],
    ['Japan','JPY','JP','JPN'],['Canada','CAD','CA','CAN'],['Australia','AUD','AU','AUS'],['Singapore','SGD','SG','SGP'],
    ['United Arab Emirates','AED','AE','ARE'],['South Africa','ZAR','ZA','ZAF'],['Switzerland','CHF','CH','CHE'],['New Zealand','NZD','NZ','NZL']
  ];
  const $ = id => document.getElementById(id);
  const countrySelect = $('metal-country');
  const stateSelect = $('metal-state');
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
  let statesByCountry = new Map();

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
      if (code && name && /^[A-Z]{3}$/.test(code)) rows.push([name, code, country.cca2 || '', country.cca3 || '']);
    }
    const unique = new Map();
    rows.sort((a, b) => a[0].localeCompare(b[0])).forEach(row => {
      const key = `${row[0]}|${row[1]}`;
      if (!unique.has(key)) unique.set(key, row);
    });
    return [...unique.values()];
  }

  function renderCountries(rows) {
    const options = rows.map(([name, code, countryCode, iso3]) => {
      const option = document.createElement('option');
      option.value = code;
      option.textContent = `${name} — ${code}`;
      option.dataset.country = countryCode;
      option.dataset.iso3 = iso3;
      return option;
    });
    countrySelect.replaceChildren(...options);
    const india = [...countrySelect.options].find(option => option.dataset.country === 'IN' && option.value === 'INR');
    if (india) countrySelect.value = india.value;
    else if (countrySelect.options.length) countrySelect.selectedIndex = 0;
    updateStates();
  }

  function updateStates() {
    const option = countrySelect.selectedOptions[0];
    const iso3 = option?.dataset.iso3;
    let stateNames = statesByCountry.get(iso3) || [];
    if (iso3 === 'IND' && !stateNames.length) stateNames = INDIA_STATES;
    stateNames = [...new Set(stateNames)].filter(Boolean).sort((a, b) => a.localeCompare(b));
    if (!stateNames.length) {
      const empty = document.createElement('option');
      empty.value = '';
      empty.textContent = 'No state / province list available';
      stateSelect.replaceChildren(empty);
      stateSelect.disabled = true;
      renderEstimate();
      return;
    }
    const prompt = document.createElement('option');
    prompt.value = '';
    prompt.textContent = 'Select a state / province';
    const stateOptions = stateNames.map(name => {
      const state = document.createElement('option');
      state.value = name;
      state.textContent = name;
      return state;
    });
    stateSelect.replaceChildren(prompt, ...stateOptions);
    stateSelect.disabled = false;
    if (iso3 === 'IND') stateSelect.value = 'Jammu and Kashmir';
    renderEstimate();
  }

  async function loadStates() {
    try {
      const response = await getJSON(API.states);
      if (response.error || !Array.isArray(response.data)) throw new Error('State list unavailable');
      statesByCountry = new Map(response.data
        .filter(country => country.iso3 && Array.isArray(country.states))
        .map(country => [country.iso3, country.states.map(state => state.name)]));
    } catch (_) {
      statesByCountry = new Map([['IND', INDIA_STATES]]);
    }
    updateStates();
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
    const state = stateSelect.value;
    totalNode.classList.remove('metal-error');
    totalNode.textContent = formatMoney(estimate, currency);
    breakdownNode.textContent = `${formatMoney(unitPrice, currency)} per gram × ${grams.toLocaleString()} g · ${gold ? `${karat}K gold` : (purityFactor === 0.999 ? '999 silver' : '925 silver')}${state ? ` · ${state}` : ''}`;
    const time = [quotes.gold.updatedAt, quotes.silver.updatedAt].filter(Boolean).map(value => new Date(value)).filter(date => !Number.isNaN(date.getTime())).sort((a,b) => b-a)[0];
    updatedNode.textContent = `${time ? `Metal quote timestamp: ${time.toLocaleString()} · ` : ''}Checked ${new Date().toLocaleTimeString()}. Country selection converts the spot quote to local currency; state selection is for reference only, as local premiums and taxes are not included.`;
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
      rates = { ...fx.rates, USD: 1 };
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
      renderCountries(countries.length ? countries : FALLBACK_COUNTRIES);
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
  countrySelect.addEventListener('change', updateStates);
  stateSelect.addEventListener('change', renderEstimate);
  puritySelect.addEventListener('change', renderEstimate);
  weightInput.addEventListener('input', renderEstimate);
  refreshButton.addEventListener('click', refreshRates);

  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });
  loadCountries();
  loadStates();
  refreshRates();
  window.setInterval(refreshRates, 60 * 1000);
})();
