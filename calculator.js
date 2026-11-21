document.addEventListener('DOMContentLoaded',()=>{
  const form=document.querySelector('#calculator-form');
  if(!form)return;
  const kind=form.dataset.kind;
  const output=document.querySelector('#results');
  const fields=[...form.querySelectorAll('input,select')];
  const money=value=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:2}).format(value);
  const number=value=>new Intl.NumberFormat('en-IN',{maximumFractionDigits:4}).format(value);
  const read=id=>Number(form.elements[id]?.value);
  const display=(items,note='These figures are estimates for general information only.')=>{
    output.innerHTML=items.map((item,index)=>`<div class="result-item${index===0?' primary':''}"><span>${item[0]}</span><strong>${item[1]}</strong></div>`).join('')+`<p class="result-note">${note}</p>`;
  };
  const blank=(message='Enter valid values above to see your result.')=>display([['Your result','—']],message);
  const calculate=()=>{
    if(kind==='loan'){
      const principal=read('amount'),annual=read('rate'),years=read('term');
      if(!(principal>0)||!Number.isFinite(annual)||annual<0||!(years>0))return blank('Enter a loan amount and term greater than zero, and an interest rate of zero or more.');
      const months=Math.round(years*12),r=annual/1200;
      const emi=r===0?principal/months:principal*r*Math.pow(1+r,months)/(Math.pow(1+r,months)-1);
      display([['Monthly EMI',money(emi)],['Total interest',money(emi*months-principal)],['Total payment',money(emi*months)],['Loan amount',money(principal)]]);
    }else if(kind==='sip'){
      const monthly=read('monthly'),annual=read('rate'),years=read('term');
      if(!(monthly>0)||!Number.isFinite(annual)||annual<0||!(years>0))return blank('Enter a monthly investment and period greater than zero, and an expected return of zero or more.');
      const n=Math.round(years*12),r=annual/1200;
      const future=r===0?monthly*n:monthly*((Math.pow(1+r,n)-1)/r)*(1+r),invested=monthly*n;
      display([['Estimated value',money(future)],['Amount invested',money(invested)],['Estimated returns',money(future-invested)]],'This is an estimate, not a guaranteed return.');
    }else if(kind==='gst'){
      const amount=read('amount'),rate=read('rate'),mode=form.elements.mode.value;
      if(!(amount>=0)||!Number.isFinite(rate)||rate<0)return blank('Enter an amount and GST rate of zero or more.');
      const tax=mode==='add'?amount*rate/100:amount-(amount/(1+rate/100)),base=mode==='add'?amount:amount-tax,total=mode==='add'?amount+tax:amount;
      display([['GST amount',money(tax)],['Base amount',money(base)],['Total including GST',money(total)]],'Check the applicable tax rate for your transaction.');
    }else if(kind==='percentage'){
      const percent=read('percent'),amount=read('amount');if(!Number.isFinite(percent)||!Number.isFinite(amount))return blank();
      display([[`${number(percent)}% of ${number(amount)}`,number(percent*amount/100)],['Percentage',`${number(percent)}%`],['Number',number(amount)]],'This answers: “What is X% of Y?”');
    }else if(kind==='age'){
      const raw=form.elements.birthdate.value;if(!raw)return blank('Choose your date of birth to calculate your age.');
      const birth=new Date(`${raw}T00:00:00`),today=new Date();today.setHours(0,0,0,0);
      if(Number.isNaN(birth.getTime())||birth>today)return blank('Choose a valid date of birth that is not in the future.');
      let years=today.getFullYear()-birth.getFullYear(),months=today.getMonth()-birth.getMonth(),days=today.getDate()-birth.getDate();
      if(days<0){months--;days+=new Date(today.getFullYear(),today.getMonth(),0).getDate();}if(months<0){years--;months+=12;}
      display([['Your age',`${years} years, ${months} months`],['Additional days',`${days} days`],['Total days lived',number(Math.floor((today-birth)/86400000))]],'Age uses your local calendar date.');
    }else if(kind==='bmi'){
      const weight=read('weight'),height=read('height');if(!(weight>0)||!(height>0))return blank('Enter a weight and height greater than zero.');
      const bmi=weight/Math.pow(height/100,2),category=bmi<18.5?'Below the standard range':bmi<25?'Within the standard range':bmi<30?'Above the standard range':'High BMI range';
      display([['Your BMI',number(bmi)],['Screening category',category],['Height / weight',`${number(height)} cm / ${number(weight)} kg`]],'BMI is a general screening measure for adults, not a diagnosis.');
    }else if(kind==='discount'){
      const price=read('price'),rate=read('discount');if(!(price>=0)||!(rate>=0)||rate>100)return blank('Enter a price of zero or more and a discount from 0% to 100%.');
      display([['Price after discount',money(price*(1-rate/100))],['You save',money(price*rate/100)],['Original price',money(price)]]);
    }else if(kind==='tip'){
      const bill=read('bill'),rate=read('tip'),people=Math.floor(read('people'));if(!(bill>=0)||!(rate>=0)||people<1)return blank('Enter a bill amount, a tip rate of zero or more, and at least one person.');
      const tip=bill*rate/100,total=bill+tip;display([['Total per person',money(total/people)],['Tip amount',money(tip)],['Total bill',money(total)],['Bill per person before tip',money(bill/people)]]);
    }else if(kind==='fuel'){
      const distance=read('distance'),efficiency=read('efficiency'),price=read('fuel-price');if(!(distance>=0)||!(efficiency>0)||!(price>=0))return blank('Enter a distance and fuel price of zero or more, and fuel efficiency greater than zero.');
      const fuel=distance/efficiency;display([['Estimated fuel cost',money(fuel*price)],['Fuel needed',`${number(fuel)} L`],['Distance',`${number(distance)} km`]],'Uses the vehicle efficiency in km per litre.');
    }else if(kind==='dates'){
      const a=form.elements.start.value,b=form.elements.end.value;if(!a||!b)return blank('Choose both dates to count the days between them.');
      const first=new Date(`${a}T00:00:00Z`),last=new Date(`${b}T00:00:00Z`);if(Number.isNaN(+first)||Number.isNaN(+last))return blank('Choose two valid dates.');
      const days=Math.abs(Math.round((last-first)/86400000));display([['Days between dates',number(days)],['Weeks',number(days/7)],['Inclusive day count',number(days+1)]],'The day count excludes the start date; inclusive count includes both dates.');
    }else if(kind==='units'){
      const value=read('value'),from=form.elements.from.value,to=form.elements.to.value,type=form.elements.unit.value;if(!Number.isFinite(value))return blank('Enter a number to convert.');
      const factors={length:{m:1,km:1000,cm:.01,mi:1609.344,ft:.3048,in:.0254},weight:{kg:1,g:.001,lb:.45359237,oz:.028349523125}};
      let result;
      if(type==='temperature'){
        const c=from==='C'?value:(value-32)*5/9;result=to==='C'?c:c*9/5+32;
      }else result=value*factors[type][from]/factors[type][to];
      display([['Converted value',`${number(result)} ${to}`],['Starting value',`${number(value)} ${from}`]],'Conversions are rounded for display.');
    }
  };
  fields.forEach(field=>field.addEventListener('input',calculate));
  form.addEventListener('reset',()=>setTimeout(calculate,0));
  document.querySelectorAll('[data-year]').forEach(node=>node.textContent=new Date().getFullYear());
  if(kind==='basic'||kind==='scientific'){
    const expression=form.querySelector('#expression'),keys=form.querySelectorAll('[data-key]'),clear=form.querySelector('[data-action="clear"]'),equals=form.querySelector('[data-action="equals"]');
    const safeEvaluate=source=>{
      let s=source.replace(/π/g,'pi').replace(/×/g,'*').replace(/÷/g,'/').replace(/−/g,'-').replace(/\s/g,'');
      const tokens=s.match(/(?:\d+\.?\d*|\.\d+|pi|e|sin|cos|tan|sqrt|log|ln|abs|[()+\-*/^!%])/gi)||[];
      if(tokens.join('')!==s||!s)throw Error('Check the expression.');let i=0;
      const peek=()=>tokens[i],take=()=>tokens[i++];
      const primary=()=>{const t=take();if(t==='('){const v=add();if(take()!==')')throw Error('Missing closing bracket.');return v;}
        if(t==='-' )return -primary();if(t==='+')return primary();if(t==='pi')return Math.PI;if(t==='e')return Math.E;
        if(['sin','cos','tan','sqrt','log','ln','abs'].includes(t)){if(take()!=='(')throw Error('Use brackets after a function.');const v=add();if(take()!==')')throw Error('Missing closing bracket.');const f={sin:Math.sin,cos:Math.cos,tan:Math.tan,sqrt:Math.sqrt,log:Math.log10,ln:Math.log,abs:Math.abs}[t];return f(t==='sin'||t==='cos'||t==='tan'?v*Math.PI/180:v);}
        const n=Number(t);if(!Number.isFinite(n))throw Error('Check the expression.');return n;};
      const postfix=()=>{let v=primary();while(peek()==='!'||peek()==='%'){const op=take();if(op==='!'){if(v<0||v>170||!Number.isInteger(v))throw Error('Factorial needs a whole number from 0 to 170.');let n=1;for(let j=2;j<=v;j++)n*=j;v=n;}else v/=100;}return v;};
      const power=()=>{let v=postfix();if(peek()==='^'){take();v=Math.pow(v,power());}return v;};const mul=()=>{let v=power();while(peek()==='*'||peek()==='/'){const op=take(),r=power();v=op==='*'?v*r:v/r;}return v;};const add=()=>{let v=mul();while(peek()==='+'||peek()==='-'){const op=take(),r=mul();v=op==='+'?v+r:v-r;}return v;};
      const result=add();if(i!==tokens.length||!Number.isFinite(result))throw Error('That calculation is not a valid finite number.');return result;
    };
    const compute=()=>{try{const result=safeEvaluate(expression.value);output.innerHTML=`<div class="result-item primary"><span>Answer</span><strong>${number(result)}</strong></div><p class="result-note">${kind==='scientific'?'Trigonometry uses degrees.':'Enter an expression or use the buttons.'}</p>`;}catch(error){output.innerHTML=`<div class="result-item primary"><span>Answer</span><strong>—</strong></div><p class="result-note">${error.message}</p>`;}};
    keys.forEach(key=>key.addEventListener('click',()=>{expression.value+=key.dataset.key;compute();}));clear.addEventListener('click',()=>{expression.value='';compute();expression.focus();});equals.addEventListener('click',()=>{try{expression.value=String(safeEvaluate(expression.value));compute();}catch(e){compute();}});expression.addEventListener('input',compute);expression.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();equals.click();}});compute();
  }else calculate();
});
