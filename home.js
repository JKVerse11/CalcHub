/* Calculator directory and homepage interactions. */
(() => {
  'use strict';

  // Load the AdSense site script on the homepage for site verification.
  const adsense = document.createElement('script');
  adsense.async = true;
  adsense.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5827365085048112';
  adsense.crossOrigin = 'anonymous';
  document.head.append(adsense);
})();

const HOME_CALCULATORS = [
  { id: 'standard', name: 'Basic Standard Calculator', category: 'everyday', icon: '＋', desc: 'Quick calculations for everyday maths.' },
  { id: 'percentage', name: 'Percentage Calculator', category: 'everyday', icon: '%', desc: 'Find percentages, increases and decreases.' },
  { id: 'age', name: 'Age Calculator', category: 'everyday', icon: '◷', desc: 'Calculate age in years, months, and days.' },
  { id: 'date-difference', name: 'Date Difference Calculator', category: 'everyday', icon: '▦', desc: 'Count days between two dates.' },
  { id: 'discount', name: 'Discount Calculator', category: 'everyday', icon: '％', desc: 'See your savings and final sale price.' },
  { id: 'tip', name: 'Tip & Bill Split Calculator', category: 'everyday', icon: '↗', desc: 'Add a tip and split the bill fairly.' },
  { id: 'fuel', name: 'Fuel Cost & Mileage Calculator', category: 'everyday', icon: '⌁', desc: 'Estimate trip fuel use and cost.' },
  { id: 'unit-converter', name: 'Unit Converter', category: 'everyday', icon: '⇄', desc: 'Convert length, weight, temperature and area.' },
  { id: 'emi', name: 'Loan EMI Calculator', category: 'finance', icon: '▤', desc: 'Estimate monthly payments and loan interest.' },
  { id: 'sip', name: 'SIP Calculator', category: 'finance', icon: '↗', desc: 'Explore a monthly investment projection.' },
  { id: 'lumpsum', name: 'Lumpsum Investment Calculator', category: 'finance', icon: '◈', desc: 'Estimate potential growth of a one-time investment.' },
  { id: 'fd', name: 'FD Calculator', category: 'finance', icon: '▣', desc: 'Estimate fixed deposit maturity value.' },
  { id: 'rd', name: 'RD Calculator', category: 'finance', icon: '▤', desc: 'Estimate recurring deposit maturity value.' },
  { id: 'gst', name: 'GST Calculator', category: 'finance', icon: '％', desc: 'Add tax or extract tax from an inclusive price.' },
  { id: 'ppf-epf', name: 'PPF & EPF Calculator', category: 'finance', icon: '◉', desc: 'Project yearly contributions and interest.' },
  { id: 'hra', name: 'HRA Exemption Calculator', category: 'finance', icon: '⌂', desc: 'Estimate an HRA exemption under common Indian rules.' },
  { id: 'interest', name: 'Simple & Compound Interest', category: 'finance', icon: '∑', desc: 'Compare simple and compound interest.' },
  { id: 'inflation', name: 'Inflation Calculator', category: 'finance', icon: '↗', desc: 'Estimate future cost or purchasing power.' },
  { id: 'gold-silver', name: 'Gold & Silver Purchase Calculator', category: 'finance', icon: '◆', desc: 'Estimate 24K, 22K, 18K gold and silver prices in local currency.', href: 'gold-calculator.html' },
  { id: 'cgpa', name: 'CGPA to Percentage Calculator', category: 'student', icon: 'A', desc: 'Convert CGPA using your chosen scale.' },
  { id: 'sgpa', name: 'SGPA to CGPA Calculator', category: 'student', icon: '▦', desc: 'Combine semester grades with optional credits.' },
  { id: 'attendance', name: 'Attendance Percentage Calculator', category: 'student', icon: '✓', desc: 'Check attendance and classes needed to reach a target.' },
  { id: 'exam', name: 'Exam Marks & Grade Calculator', category: 'student', icon: '✎', desc: 'Calculate percentage and a suggested grade.' },
  { id: 'bmi', name: 'BMI Calculator', category: 'health', icon: '♡', desc: 'Calculate body mass index from height and weight.' },
  { id: 'tdee', name: 'Daily Calorie & BMR Calculator', category: 'health', icon: '⚡', desc: 'Estimate BMR and daily energy needs.' },
  { id: 'water', name: 'Water Intake Calculator', category: 'health', icon: '◌', desc: 'Get a general daily hydration estimate.' },
  { id: 'ideal-weight', name: 'Ideal Weight Calculator', category: 'health', icon: '♧', desc: 'View a BMI-based reference weight range.' },
  { id: 'pregnancy', name: 'Pregnancy Due Date Calculator', category: 'health', icon: '♡', desc: 'Estimate a due date from the last menstrual period.' },
  { id: 'profit', name: 'Profit Margin & Markup Calculator', category: 'business', icon: '↗', desc: 'Understand profit, margin and markup.' },
  { id: 'freelance', name: 'Freelance Hourly Rate Calculator', category: 'business', icon: '◷', desc: 'Estimate a rate from income and working time.' },
  { id: 'earnings', name: 'YouTube & Social Media Earnings Calculator', category: 'business', icon: '▶', desc: 'Estimate revenue from views and RPM.' }
];

function renderDirectory() {
  const grid = document.querySelector('#tool-grid');
  if (!grid) return;
  const search = document.querySelector('#search');
  const count = document.querySelector('#result-count');
  const empty = document.querySelector('#empty-state');
  const filters = [...document.querySelectorAll('[data-filter]')];
  let selected = 'all';

  function draw() {
    const query = (search?.value || '').trim().toLocaleLowerCase();
    const items = HOME_CALCULATORS.filter(item => (selected === 'all' || item.category === selected) && (!query || `${item.name} ${item.desc} ${item.category}`.toLocaleLowerCase().includes(query)));
    grid.replaceChildren(...items.map((item, index) => {
      const link = document.createElement('a');
      link.className = 'tool-card';
      link.href = item.href || `calculator.html?id=${encodeURIComponent(item.id)}`;
      link.setAttribute('aria-label', `${item.name}. ${item.desc}`);
      link.innerHTML = '<span class="tool-icon" aria-hidden="true"></span><span class="tool-card-copy"><strong></strong><small></small></span><span class="tool-arrow" aria-hidden="true">↗</span>';
      link.querySelector('.tool-icon').textContent = item.icon;
      link.querySelector('.tool-icon').classList.add(`icon-${item.category}`);
      link.querySelector('strong').textContent = item.name;
      link.querySelector('small').textContent = item.desc;
      link.style.setProperty('--card-order', index);
      return link;
    }));
    if (count) count.textContent = String(items.length);
    if (empty) empty.hidden = items.length > 0;
  }
  search?.addEventListener('input', draw);
  filters.forEach(button => button.addEventListener('click', () => {
    selected = button.dataset.filter || 'all';
    filters.forEach(filter => {
      const active = filter === button;
      filter.classList.toggle('is-active', active);
      filter.setAttribute('aria-pressed', String(active));
    });
    draw();
  }));
  draw();
}

document.addEventListener('DOMContentLoaded', () => {
  renderDirectory();
  document.querySelectorAll('[data-year]').forEach(node => { node.textContent = String(new Date().getFullYear()); });
});
