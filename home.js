const calculators = [
  {id:'standard',name:'Basic standard calculator',category:'everyday',icon:'＋',tone:'purple',desc:'Quick calculations for everyday maths.'},
  {id:'percentage',name:'Percentage calculator',category:'everyday',icon:'%',tone:'blue',desc:'Find a percentage or compare values.'},
  {id:'age',name:'Age calculator',category:'everyday',icon:'⌁',tone:'yellow',desc:'Your age in years, months and days.'},
  {id:'date-difference',name:'Date difference calculator',category:'everyday',icon:'▦',tone:'mint',desc:'Count the time between two dates.'},
  {id:'discount',name:'Discount calculator',category:'everyday',icon:'％',tone:'rose',desc:'See your savings and final price.'},
  {id:'tip',name:'Tip & bill split calculator',category:'everyday',icon:'₹',tone:'yellow',desc:'Split a bill fairly, including tip.'},
  {id:'fuel',name:'Fuel cost & mileage calculator',category:'everyday',icon:'⛽',tone:'peach',desc:'Estimate trip fuel use and cost.'},
  {id:'unit',name:'Unit converter',category:'everyday',icon:'↔',tone:'blue',desc:'Convert length, weight, temp & area.'},
  {id:'emi',name:'Loan EMI calculator',category:'finance',icon:'₹',tone:'purple',desc:'Estimate monthly loan payments.'},
  {id:'sip',name:'SIP calculator',category:'finance',icon:'↗',tone:'mint',desc:'Estimate returns from monthly investing.'},
  {id:'lumpsum',name:'Lumpsum investment calculator',category:'finance',icon:'◈',tone:'blue',desc:'Project a one-time investment.'},
  {id:'fd',name:'FD (fixed deposit) calculator',category:'finance',icon:'▣',tone:'yellow',desc:'Estimate fixed deposit maturity.'},
  {id:'rd',name:'RD (recurring deposit) calculator',category:'finance',icon:'▤',tone:'peach',desc:'Project recurring deposit returns.'},
  {id:'gst',name:'GST calculator',category:'finance',icon:'%',tone:'rose',desc:'Add or remove GST from an amount.'},
  {id:'ppf-epf',name:'PPF & EPF calculator',category:'finance',icon:'◌',tone:'mint',desc:'Project yearly savings growth.'},
  {id:'hra',name:'HRA exemption calculator',category:'finance',icon:'⌂',tone:'purple',desc:'Estimate HRA tax exemption.'},
  {id:'interest',name:'Simple & compound interest',category:'finance',icon:'∑',tone:'blue',desc:'Compare interest growth over time.'},
  {id:'inflation',name:'Inflation calculator',category:'finance',icon:'↗',tone:'peach',desc:'Understand future purchasing power.'},
  {id:'cgpa',name:'CGPA to percentage calculator',category:'student',icon:'A',tone:'blue',desc:'Convert CGPA using your grading scale.'},
  {id:'sgpa',name:'SGPA to CGPA calculator',category:'student',icon:'▤',tone:'purple',desc:'Combine semester scores into CGPA.'},
  {id:'attendance',name:'Attendance percentage calculator',category:'student',icon:'✓',tone:'mint',desc:'Check your attendance and classes left.'},
  {id:'exam',name:'Exam marks & grade calculator',category:'student',icon:'✎',tone:'yellow',desc:'Calculate score percentage and grade.'},
  {id:'bmi',name:'BMI calculator',category:'health',icon:'♥',tone:'rose',desc:'A quick BMI estimate from height & weight.'},
  {id:'tdee',name:'Daily calorie (TDEE) & BMR calculator',category:'health',icon:'⚡',tone:'peach',desc:'Estimate daily energy needs.'},
  {id:'water',name:'Water intake calculator',category:'health',icon:'◉',tone:'blue',desc:'Estimate a daily hydration target.'},
  {id:'ideal-weight',name:'Ideal weight calculator',category:'health',icon:'↕',tone:'mint',desc:'View a healthy weight range estimate.'},
  {id:'pregnancy',name:'Pregnancy due date calculator',category:'health',icon:'♡',tone:'rose',desc:'Estimate due date from your last period.'},
  {id:'profit',name:'Profit margin & markup calculator',category:'business',icon:'↗',tone:'mint',desc:'Understand profit, margin and markup.'},
  {id:'freelance',name:'Freelance hourly rate calculator',category:'business',icon:'◷',tone:'purple',desc:'Find a rate that meets your income goal.'},
  {id:'earnings',name:'YouTube / social media earnings calculator',category:'business',icon:'▶',tone:'rose',desc:'Estimate ad revenue from views and RPM.'}
];
const categoryNames={everyday:'SIMPLE & EVERYDAY',finance:'FINANCE & TAX',student:'STUDENT & ACADEMIC',health:'HEALTH & FITNESS',business:'BUSINESS & CREATOR'};
document.addEventListener('DOMContentLoaded',()=>{
 const grid=document.querySelector('#tool-grid'), search=document.querySelector('#search'), count=document.querySelector('#result-count'), empty=document.querySelector('#empty-state'); if(!grid)return;
 let filter='all';
 const render=()=>{const q=(search.value||'').trim().toLowerCase();const found=calculators.filter(c=>(filter==='all'||c.category===filter)&&(!q||(c.name+' '+c.desc+' '+categoryNames[c.category]).toLowerCase().includes(q)));grid.innerHTML=found.map(c=>`<a class="tool-card" href="calculator.html?id=${encodeURIComponent(c.id)}"><span class="tool-icon icon-${c.tone}">${c.icon}</span><span class="tool-arrow" aria-hidden="true">↗</span><strong>${c.name}</strong><small>${c.desc}</small></a>`).join('');count.textContent=`Showing ${found.length===calculators.length?'all ':''}${found.length} calculator${found.length===1?'':'s'}`;empty.hidden=found.length!==0;grid.hidden=found.length===0;};
 document.querySelectorAll('.filter-chip').forEach(button=>button.addEventListener('click',()=>{filter=button.dataset.filter;document.querySelectorAll('.filter-chip').forEach(b=>{const active=b===button;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});render();}));search.addEventListener('input',render);document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();search.focus();}});document.querySelectorAll('[data-year]').forEach(n=>n.textContent=new Date().getFullYear());render();
});
