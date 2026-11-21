document.addEventListener('DOMContentLoaded',()=>{
  const form=document.querySelector('#calculator-form');
  if(!form)return;
  const kind=form.dataset.kind;
  const output=document.querySelector('#results');
  const fields=[...form.querySelectorAll('input,select')];
  const money=value=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(value);
  const number=value=>new Intl.NumberFormat('en-IN',{maximumFractionDigits:2}).format(value);
  const read=id=>Number(form.elements[id]?.value);
  const display=(items,note='Estimates are for general information only and may not reflect every lender, tax rule, or individual circumstance.')=>{
    output.innerHTML=items.map((item,index)=>`<div class="result-item${index===0?' primary':''}"><span>${item[0]}</span><strong>${item[1]}</strong></div>`).join('')+`<p class="result-note">${note}</p>`;
  };
  const blank=(message='Enter valid values above to see your result.')=>display([['Your result','—']],message);
  const calculate=()=>{
    if(kind==='loan'){
      const principal=read('amount'),annual=read('rate'),years=read('term');
      if(!(principal>0)||annual<0||!(years>0))return blank('Enter a loan amount and term greater than zero, and an interest rate of zero or more.');
      const months=Math.round(years*12),r=annual/1200;
      const emi=r===0?principal/months:principal*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1);
      display([['Monthly EMI',money(emi)],['Total interest',money(emi*months-principal)],['Total payment',money(emi*months)],['Loan amount',money(principal)]]);
    }else if(kind==='sip'){
      const monthly=read('monthly'),annual=read('rate'),years=read('term');
      if(!(monthly>0)||annual<0||!(years>0))return blank('Enter a monthly investment and period greater than zero, and an expected return of zero or more.');
      const n=Math.round(years*12),r=annual/1200;
      const future=r===0?monthly*n:monthly*((Math.pow(1+r,n)-1)/r)*(1+r);
      const invested=monthly*n;
      display([['Estimated value',money(future)],['Amount invested',money(invested)],['Estimated returns',money(future-invested)]]);
    }else if(kind==='gst'){
      const amount=read('amount'),rate=read('rate'),mode=form.elements.mode.value;
      if(!(amount>=0)||!(rate>=0))return blank('Enter an amount and GST rate of zero or more.');
      const tax=mode==='add'?amount*rate/100:amount-(amount/(1+rate/100));
      const base=mode==='add'?amount:amount-tax;
      const total=mode==='add'?amount+tax:amount;
      display([['GST amount',money(tax)],['Base amount',money(base)],['Total including GST',money(total)]],mode==='add'?'GST is added to the entered base amount. Check the applicable rate for your goods or services.':'GST is extracted from the entered GST-inclusive total. Check the applicable rate for your goods or services.');
    }else if(kind==='percentage'){
      const percent=read('percent'),amount=read('amount');
      if(!Number.isFinite(percent)||!Number.isFinite(amount))return blank();
      const result=percent*amount/100;
      display([[`${number(percent)}% of ${number(amount)}`,number(result)],['Percentage',`${number(percent)}%`],['Number',number(amount)]],'This tool answers “What is X% of Y?” Enter any percentage and number.');
    }else if(kind==='age'){
      const raw=form.elements.birthdate.value;
      if(!raw)return blank('Choose your date of birth to calculate your age.');
      const birth=new Date(`${raw}T00:00:00`),today=new Date();today.setHours(0,0,0,0);
      if(Number.isNaN(birth.getTime())||birth>today)return blank('Choose a valid date of birth that is not in the future.');
      let years=today.getFullYear()-birth.getFullYear(),months=today.getMonth()-birth.getMonth(),days=today.getDate()-birth.getDate();
      if(days<0){months--;days+=new Date(today.getFullYear(),today.getMonth(),0).getDate();}
      if(months<0){years--;months+=12;}
      const totalDays=Math.floor((today-birth)/86400000);
      display([['Your age',`${years} years, ${months} months`],['Additional days',`${days} days`],['Total days lived',number(totalDays)]],'Age is calculated using your local calendar date. Leap years and month lengths are accounted for.');
    }else if(kind==='bmi'){
      const weight=read('weight'),height=read('height');
      if(!(weight>0)||!(height>0))return blank('Enter a weight and height greater than zero.');
      const bmi=weight/Math.pow(height/100,2);
      const category=bmi<18.5?'Below the standard range':bmi<25?'Within the standard range':bmi<30?'Above the standard range':'High BMI range';
      display([['Your BMI',number(bmi)],['Screening category',category],['Height / weight',`${number(height)} cm / ${number(weight)} kg`]],'BMI is a general screening measure for adults, not a diagnosis. It may not suit every person; consult a qualified health professional for personal advice.');
    }
  };
  fields.forEach(field=>field.addEventListener('input',calculate));
  form.addEventListener('reset',()=>setTimeout(calculate,0));
  document.querySelectorAll('[data-year]').forEach(node=>node.textContent=new Date().getFullYear());
  calculate();
});
