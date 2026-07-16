const DS=['L','M','X','J','V','S','D'],WK=8,SS=['Day 1','Day 2','Day 3','Day 4','Day 5','Day 6'];
const h=v=>String(v??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const enc=v=>encodeURIComponent(String(v??''));
// Macros: {kcal, p=protein, c=carbs, f=fat}
const CATS={
  'Proteínas 🥩':{color:'#c0392b',items:{
    '8oz pechuga de pollo':{kcal:248,p:46,c:0,f:5},
    '4oz pechuga de pollo':{kcal:124,p:23,c:0,f:3},
    'chicken leg quarter':{kcal:280,p:30,c:0,f:17},
    '8oz carne molida 98/2':{kcal:240,p:45,c:0,f:6},
    '4oz carne molida 98/2':{kcal:120,p:22,c:0,f:3},
    '8oz masa de cerdo':{kcal:320,p:38,c:0,f:18},
    '4oz masa de cerdo':{kcal:160,p:19,c:0,f:9},
    '4 huevos':{kcal:280,p:24,c:2,f:20},
  }},
  'Carbohidratos 🍚':{color:'#b7770d',items:{
    '150g arroz cocido':{kcal:195,p:4,c:43,f:0},
    '100g arroz extra (día fuerte)':{kcal:130,p:3,c:28,f:0},
    '200g sweet potato':{kcal:172,p:3,c:40,f:0},
    '150g plátano maduro':{kcal:133,p:2,c:34,f:0},
  }},
  'Vegetales 🥦':{color:'#007a4d',items:{
    '100g repollo':{kcal:25,p:1,c:5,f:0},
    '150g repollo':{kcal:38,p:2,c:8,f:0},
    '200g repollo':{kcal:50,p:3,c:10,f:0},
    '100g brócoli':{kcal:34,p:3,c:7,f:0},
    '150g brócoli':{kcal:51,p:4,c:10,f:1},
  }},
};
const MACROS=Object.values(CATS).reduce((acc,cat)=>({...acc,...cat.items}),{});
const BASE_MACRO_KEYS=new Set(Object.keys(MACROS));
const AI=Object.keys(MACROS);
const DEF={workouts:{
  fase1:[
    {day:'Day A — Full Body',exercises:'Squat or Leg Press',reps:'3x10',notes:'Reactivation week'},
    {day:'',exercises:'Bench Press',reps:'3x10',notes:''},
    {day:'',exercises:'Lat Pulldown',reps:'3x10',notes:''},
    {day:'',exercises:'Dumbbell Shoulder Press',reps:'3x12',notes:''},
    {day:'',exercises:'Cable Row',reps:'3x12',notes:''},
    {day:'',exercises:'Lateral Raises',reps:'3x15',notes:''},
    {day:'',exercises:'Biceps Curl',reps:'2x12',notes:''},
    {day:'',exercises:'Triceps Pushdown',reps:'2x12',notes:''},
    {day:'',exercises:'Wrist Curls',reps:'2x15',notes:'Forearm focus'},
    {day:'Day B — Full Body',exercises:'Romanian Deadlift',reps:'3x10',notes:'Reactivation week'},
    {day:'',exercises:'Incline DB Press',reps:'3x10',notes:''},
    {day:'',exercises:'Seated Cable Row',reps:'3x10',notes:''},
    {day:'',exercises:'Arnold Press',reps:'3x12',notes:''},
    {day:'',exercises:'Face Pulls',reps:'3x15',notes:''},
    {day:'',exercises:'Hammer Curl',reps:'2x12',notes:''},
    {day:'',exercises:'Rope Pushdown',reps:'2x12',notes:''},
    {day:'',exercises:'Reverse Wrist Curl',reps:'2x15',notes:'Forearm focus'},
    {day:'Rest',exercises:'Walk, stretch or mobility work',reps:'—',notes:'3-4x per week'},
  ],
  fase2:[
    {day:'Day 1 — Chest + Shoulders',exercises:'Bench Press',reps:'4x6-8',notes:'Main compound'},
    {day:'',exercises:'Incline DB Press',reps:'3x8-10',notes:''},
    {day:'',exercises:'Overhead Press',reps:'4x6-8',notes:''},
    {day:'',exercises:'Lateral Raises',reps:'4x12-15',notes:''},
    {day:'',exercises:'Cable Lateral Raise',reps:'3x15',notes:''},
    {day:'',exercises:'Face Pulls',reps:'3x15',notes:'Rear delt'},
    {day:'Day 2 — Back + Forearms',exercises:'Pull-Ups / Lat Pulldown',reps:'4x8-10',notes:''},
    {day:'',exercises:'Barbell Row',reps:'4x8',notes:''},
    {day:'',exercises:'Seated Row',reps:'3x10',notes:''},
    {day:'',exercises:'Reverse Pec Deck',reps:'3x15',notes:''},
    {day:'',exercises:'Hammer Curl',reps:'3x12',notes:''},
    {day:'',exercises:'Wrist Curl',reps:'3x15',notes:'Forearm'},
    {day:'',exercises:'Reverse Wrist Curl',reps:'3x15',notes:'Forearm'},
    {day:'',exercises:"Farmer's Carry",reps:'3x30-60s',notes:'Grip strength'},
    {day:'Day 3 — Legs (Quads)',exercises:'Squat',reps:'4x6-8',notes:''},
    {day:'',exercises:'Leg Press',reps:'3x10',notes:''},
    {day:'',exercises:'Leg Extension',reps:'3x12',notes:''},
    {day:'',exercises:'Romanian Deadlift',reps:'3x10',notes:''},
    {day:'',exercises:'Calf Raises',reps:'4x15',notes:''},
    {day:'Day 4 — Shoulder Specialization',exercises:'Overhead Press',reps:'4x6',notes:'Strength focus'},
    {day:'',exercises:'Lateral Raises',reps:'5x15',notes:'Volume'},
    {day:'',exercises:'Upright Row',reps:'3x10',notes:''},
    {day:'',exercises:'Rear Delt Fly',reps:'4x15',notes:''},
    {day:'',exercises:'Cable Lateral Raise Dropset',reps:'2x Failure',notes:'Burnout'},
    {day:'',exercises:'Shrugs',reps:'4x12',notes:''},
    {day:'Day 5 — Arms + Forearms',exercises:'Barbell Curl',reps:'4x8',notes:''},
    {day:'',exercises:'Skull Crushers',reps:'4x10',notes:''},
    {day:'',exercises:'Incline DB Curl',reps:'3x12',notes:''},
    {day:'',exercises:'Rope Pushdown',reps:'3x12',notes:''},
    {day:'',exercises:'Reverse Curl',reps:'3x12',notes:'Forearm'},
    {day:'',exercises:"Wrist Roller / Farmer's Carry",reps:'3x30-60s',notes:'Grip & forearm'},
    {day:'Day 6 — Legs (Hamstrings/Glutes)',exercises:'Deadlift',reps:'4x5',notes:'Strength focus'},
    {day:'',exercises:'Leg Curl',reps:'4x10',notes:''},
    {day:'',exercises:'Hip Thrust',reps:'3x10',notes:'Glutes'},
    {day:'',exercises:'Lunges',reps:'3x12',notes:''},
    {day:'',exercises:'Calf Raises',reps:'4x15',notes:''},
    {day:'Rest',exercises:'Full recovery',reps:'—',notes:'Prioritize sleep & hydration'},
  ],
  fase3:[
    {day:'Day 1 — Chest + Shoulders',exercises:'Bench Press',reps:'4x5-6',notes:'+5-10 lb vs Phase 2'},
    {day:'',exercises:'Incline DB Press',reps:'4x8-10',notes:'+1 set'},
    {day:'',exercises:'Overhead Press',reps:'4x5-6',notes:'Progressive overload'},
    {day:'',exercises:'Lateral Raises',reps:'4x15-20',notes:'+reps'},
    {day:'',exercises:'Cable Lateral Raise',reps:'3x15',notes:''},
    {day:'',exercises:'Face Pulls',reps:'4x15',notes:'+1 set'},
    {day:'Day 2 — Back + Forearms',exercises:'Pull-Ups / Lat Pulldown',reps:'4x8-10',notes:'Add weight'},
    {day:'',exercises:'Barbell Row',reps:'4x6-8',notes:'+load'},
    {day:'',exercises:'Seated Row',reps:'4x10',notes:'+1 set'},
    {day:'',exercises:'Reverse Pec Deck',reps:'3x15',notes:''},
    {day:'',exercises:'Hammer Curl',reps:'4x12',notes:'+1 set'},
    {day:'',exercises:'Wrist Curl',reps:'3x15',notes:''},
    {day:'',exercises:'Reverse Wrist Curl',reps:'3x15',notes:''},
    {day:'',exercises:"Farmer's Carry",reps:'4x45-60s',notes:'+duration'},
    {day:'Day 3 — Legs (Quads)',exercises:'Squat',reps:'4x5-6',notes:'+5-10 lb'},
    {day:'',exercises:'Leg Press',reps:'4x10',notes:'+1 set'},
    {day:'',exercises:'Leg Extension',reps:'3x12-15',notes:''},
    {day:'',exercises:'Romanian Deadlift',reps:'4x10',notes:'+1 set'},
    {day:'',exercises:'Calf Raises',reps:'4x20',notes:'+reps'},
    {day:'Day 4 — Shoulder Specialization',exercises:'Overhead Press',reps:'5x5',notes:'Strength block'},
    {day:'',exercises:'Lateral Raises',reps:'5x20',notes:'High rep volume'},
    {day:'',exercises:'Upright Row',reps:'4x10',notes:'+1 set'},
    {day:'',exercises:'Rear Delt Fly',reps:'4x15',notes:''},
    {day:'',exercises:'Cable Lateral Raise Dropset',reps:'3x Failure',notes:'+1 set'},
    {day:'',exercises:'Shrugs',reps:'4x15',notes:'+reps'},
    {day:'Day 5 — Arms + Forearms',exercises:'Barbell Curl',reps:'4x6-8',notes:'+load'},
    {day:'',exercises:'Skull Crushers',reps:'4x8-10',notes:'+load'},
    {day:'',exercises:'Incline DB Curl',reps:'4x12',notes:'+1 set'},
    {day:'',exercises:'Rope Pushdown',reps:'4x12',notes:'+1 set'},
    {day:'',exercises:'Reverse Curl',reps:'4x12',notes:'+1 set'},
    {day:'',exercises:"Wrist Roller / Farmer's Carry",reps:'4x60s',notes:'+duration'},
    {day:'Day 6 — Legs (Hamstrings/Glutes)',exercises:'Deadlift',reps:'4x4-5',notes:'+load'},
    {day:'',exercises:'Leg Curl',reps:'4x10-12',notes:''},
    {day:'',exercises:'Hip Thrust',reps:'4x10',notes:'+1 set'},
    {day:'',exercises:'Lunges',reps:'4x12',notes:'+1 set'},
    {day:'',exercises:'Calf Raises',reps:'4x20',notes:'+reps'},
    {day:'Rest',exercises:'Full recovery',reps:'—',notes:'Prioritize sleep & hydration'},
  ]},meals:[{name:'Comida 1 — Post Entreno',ingredients:['4 huevos','150g arroz cocido','100g repollo']},{name:'Comida 2 — Almuerzo',ingredients:['8oz pechuga de pollo','150g arroz cocido','150g repollo']},{name:'Cena',ingredients:['8oz carne molida 98/2','200g repollo']}],checklist:{},mealChecks:{},mealIngredients:{},progress:Array.from({length:8},(_,i)=>({week:i+1,weight:'',waist:'',energy:'',strength:'',notes:''})),habits:{},habitNames:['Entrenamiento','10k pasos / caminar','Comida limpia','Sin alcohol','Dormir 7+ horas'],activeMealDay:0,activeProgressWeek:0,theme:'light',userLibrary:{},activePhase:'fase1',userName:'',customRoutines:[],activeRoutineId:'',workoutLogs:[],activeWorkout:null,foodFavorites:[],recentFoods:[],dailyNutrition:{},
  workoutUnit:'lb',restTimerSeconds:90,lastWorkoutSummaryId:'',
  body:{weight:'',goalWeight:'',heightFt:'',heightIn:'',age:'',sex:'male',activity:'moderate',kcalGoalMode:'auto',kcalGoalPick:null,kcalGoalManual:''}};
let S=loadBeastmodeState(DEF);
hydrateUserMacros();
document.documentElement.setAttribute('data-theme',S.theme||'light');
document.getElementById('tbtn').textContent=S.theme==='dark'?'☀️':'🌙';
function toggleTheme(){S.theme=S.theme==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',S.theme);document.getElementById('tbtn').textContent=S.theme==='dark'?'☀️':'🌙';save();toast(S.theme==='light'?'☀️ Modo claro':'🌙 Modo oscuro');const cur=document.querySelector('.nav-btn.active');if(cur){const id=['dashboard','workout','meals','progress','habits','bmi'][Array.from(document.querySelectorAll('.nav-btn')).indexOf(cur)];render(id)}}
function dk(){return S.theme!=='light'}
function C(){return dk()?{b:'#4d9fff',r:'#ff5252',t:'#00e5a0',a:'#ffb627',c:'#ff6b4a',sc:{Push:'#7c5cfc',Pull:'#4d9fff',Piernas:'#ff5252',Cardio:'#00e5a0',Upper:'#ffb627',Lower:'#ed7ef7'},rb:'rgba(255,255,255,.06)',sdim:'rgba(0,229,160,.3)',sfull:'#00e5a0'}:{b:'#146eb4',r:'#c0392b',t:'#007a4d',a:'#b7770d',c:'#c0392b',sc:{Push:'#7c5cfc',Pull:'#146eb4',Piernas:'#c0392b',Cardio:'#007a4d',Upper:'#b7770d',Lower:'#8e44ad'},rb:'rgba(0,0,0,.06)',sdim:'rgba(20,110,180,.25)',sfull:'#146eb4'}}
function completeWeek(){
  const curWk=S.activeProgressWeek+1;
  if(curWk>=8){toast('All 8 weeks complete! Great work! 🏆');return;}
  const msg='Complete Week '+curWk+'?\n\nThis will:\n• Move you to Week '+(curWk+1)+'\n• Reset daily habits\n• Reset meal check-ins\n• Keep your workout checklist';
  if(!confirm(msg))return;
  S.activeProgressWeek=curWk;
  S.habits={};
  S.mealChecks={};
  save();
  rDash();
  toast('Week '+curWk+' complete! Now on Week '+(curWk+1)+' 💪');
}

const LANG_EN={
  ar:'Activity Rings',sess:'Sessions',hab:'Habits',com:'Meals',
  sg:'Stats Grid',nut:'Nutrition Today',kcl:'Calories',
  wp:'Weekly Progress',wc:'Body Weight',sw:'Sessions per week',
  cl:'Workout Checklist',wk:'Week',
  prot:'Protein',carb:'Carbs',fat:'Fat',
  kr:'kcal remaining',ko:'kcal over goal',ng:'no goal set',
  cns:'Consumed',gl:'Goal',dbmi:'Set goal in BMI tab',
  ltl:'lb to lose',gr:'Goal reached!',
  nwd:'No data — fill in Progress week by week',
  sp:'Select phase',yr:'Weekly routine',
  ex:'Exercise',rp:'Sets×Reps',nt:'Notes',ae:'+ Add exercise',
  p1:'Phase 1',p1s:'Reactivation',p1o:'6-Day Muscle Building',
  p2:'Phase 2',p2s:'Main Program',p2o:'6-Day Split',
  p3:'Phase 3',p3s:'Progressive',p3o:'Overload Phase',
  sd:'Select day',mt:'Meals today',ws:'Weekly summary',am:'+ Add meal',
  su:'Search food (USDA)',gr2:'grams',
  md:'Macros today',nm:'Select ingredients to see macros',mp:'My products',
  sw2:'Select week',wl:'Weight (lb)',wi:'Waist (in)',
  en2:'Energy 1-5',st:'Strength 1-5',np:'How did you feel this week?',
  s8:'8-week summary',tc:'Total change',sw3:'Start weight',cw:'Current weight',
  ew:'Enter your weight week by week',
  dh:'Daily habits',tl:'Total',rl:'Rate',bl:'Best',
  cp:'compliance',th:'top habit',ph2:'Habit progress',
  hd:'Habit done',un:'Unchecked',
  bp:'Body profile',wn:'Current weight (lb)',wg:'Goal weight (lb)',
  ft:'Feet',in2:'Inches',ag:'Age',sx:'Sex',ml:'Male',fm:'Female',
  av:'Activity',sed:'Sedentary',lgt:'Light (1-2/wk)',
  mod2:'Moderate (3-5/wk)',act:'Active (6-7/wk)',vac:'Very active',
  yb:'Your BMI',uw:'Underweight',nrm:'Normal',ov:'Overweight',ob:'Obesity',
  tl2:'to lose',ag2:'above goal',
  kgt:'Daily calorie goal',au:'Auto TDEE',ch:'Choose',mn2:'Manual',
  ct:'Your calculated TDEE',kd:'kcal/day',ms:'(maintenance)',
  fp:'Fill in your profile above',sg2:'Select goal for dashboard',
  wg2:'Enter your daily calorie goal:',ag3:'Active goal on dashboard',
  rt:'TDEE reference',mf:'Mifflin-St Jeor formula. Estimated values.',
  fp2:'Weight, height, age and activity to calculate calories',
  lf:'Lose fast',ls:'Lose slow',ma:'Maintain',gm:'Gain muscle',gms:'Bulk',
  w1:'-1 lb/wk',w05:'-0.5 lb/wk',ml2:'Maintenance',p05:'+0.5 lb/wk',p1l:'+1 lb/wk',
  cn:'Cancel',
  myl:'My Personal Library',atm:'+ Add',cl2:'Close',
  add:'added',svl:'saved to your library',mdc:'Meal done',
  nd:'New day',nm2:'New meal',
  days:['M','T','W','Th','F','Sa','Su'],
  daysF:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
  cd:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
  cm:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
};
function i(k){const v=LANG_EN[k];return v!==undefined?v:k;}
function nowGMT4(){return new Date(Date.now()-4*60*60*1000);}
function todayIdx(){const d=nowGMT4().getUTCDay();return d===0?6:d-1;}
function syncDay(){const d=todayIdx();if(S.activeMealDay!==d){S.activeMealDay=d;save();}}
function tickClock(){
  const n=nowGMT4();
  const hh=String(n.getUTCHours()).padStart(2,'0');
  const mm=String(n.getUTCMinutes()).padStart(2,'0');
  const ss=String(n.getUTCSeconds()).padStart(2,'0');
  const te=document.getElementById('cl-t');
  const de=document.getElementById('cl-d');
  if(te)te.textContent=hh+':'+mm+':'+ss;
  if(de)de.textContent=i('cd')[n.getUTCDay()]+' '+n.getUTCDate()+' '+i('cm')[n.getUTCMonth()];
}


function toast(m){const t=document.getElementById('toast');t.textContent=m;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2000)}
function showPage(id,btn){document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));document.getElementById('page-'+id).classList.add('active');btn.classList.add('active');render(id)}
function render(id){if(id==='dashboard')rDash();else if(id==='workout')rWork();else if(id==='meals')rMeals();else if(id==='progress')rProg();else if(id==='habits')rHabits();else if(id==='bmi')rBMI()}
function ring(pct,color,sz=54){const r=(sz-8)/2,c=sz/2,ci=2*Math.PI*r,d=ci*Math.min(pct,1);return`<svg style="transform:rotate(-90deg)" width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}"><circle cx="${c}" cy="${c}" r="${r}" stroke="${C().rb}" stroke-width="6" fill="none"/><circle cx="${c}" cy="${c}" r="${r}" stroke="${color}" stroke-width="6" fill="none" stroke-dasharray="${d} ${ci}" stroke-linecap="round"/></svg>`}
let bmiTimer=null;
function upB(k,v){S.body[k]=v;save();rBMIResults()}
function upBImm(k,v){
  S.body[k]=v; save(); rBMI();
}
function calcBMIData(){
  const b=S.body||{},c=C();
  const totalIn=(parseFloat(b.heightFt)||0)*12+(parseFloat(b.heightIn)||0);
  const hM=totalIn*0.0254;
  const wKg=(parseFloat(b.weight)||0)*0.453592;
  const bmi=(hM>0&&wKg>0)?wKg/(hM*hM):null;
  const bmiR=bmi?Math.round(bmi*10)/10:null;
  const bmiL=bmi?bmi<18.5?i('uw'):bmi<25?i('nrm'):bmi<30?i('ov'):i('ob'):'—';
  const bmiC=bmi?bmi<18.5?c.b:bmi<25?c.t:bmi<30?c.a:c.r:'var(--text3)';
  const tolose=(parseFloat(b.weight)>0&&parseFloat(b.goalWeight)>0)?(parseFloat(b.weight)-parseFloat(b.goalWeight)).toFixed(1):null;
  let bmr=null;
  const ageN=parseFloat(b.age);
  if(wKg>0&&hM>0&&ageN>0){
    const hCm=hM*100;
    bmr=b.sex==='female'?(10*wKg)+(6.25*hCm)-(5*ageN)-161:(10*wKg)+(6.25*hCm)-(5*ageN)+5;
  }
  const actM={sedentary:1.2,light:1.375,moderate:1.55,active:1.725,veryActive:1.9};
  const tdee=(bmr&&bmr>0)?Math.round(bmr*(actM[b.activity||'moderate']||1.55)):null;
  const gauge=bmi?Math.min(Math.max((bmi-15)/25*100,0),100):0;
  return{bmi,bmiR,bmiL,bmiC,tolose,tdee,gauge,c};
}
function getKcalGoal(){
  const b=S.body||{};
  if(b.kcalGoalMode==='manual'&&b.kcalGoalManual&&parseFloat(b.kcalGoalManual)>0)
    return parseFloat(b.kcalGoalManual);
  if(b.kcalGoalMode==='pick'&&b.kcalGoalPick&&parseFloat(b.kcalGoalPick)>0)
    return parseFloat(b.kcalGoalPick);
  const{tdee}=calcBMIData();
  return tdee||null;
}
function rBMIResults(){
  const el=document.getElementById('bmi-results');
  if(!el)return;
  const{bmi,bmiR,bmiL,bmiC,tolose,tdee,gauge,c}=calcBMIData();
  const b=S.body||{};
  const mode=b.kcalGoalMode||'auto';
  const goals=tdee?[
    {label:i('lf'),sub:i('w1'),kcal:tdee-500,color:c.r,icon:'📉'},
    {label:i('ls'),sub:i('w05'),kcal:tdee-250,color:c.a,icon:'⬇️'},
    {label:i('ma'),sub:i('ml2'),kcal:tdee,color:c.t,icon:'⚖️'},
    {label:i('gm'),sub:i('p05'),kcal:tdee+250,color:c.b,icon:'📈'},
    {label:i('gms'),sub:i('p1l'),kcal:tdee+500,color:'#7c5cfc',icon:'💪'},
  ]:[];
  const activeGoal=getKcalGoal();
  el.innerHTML=`
    ${bmi?`<div class="sec-label">${i('yb')}</div>
    <div class="card" style="border-top:3px solid ${bmiC};margin-bottom:12px">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px">
        <div>
          <div style="font-family:'Barlow Condensed',sans-serif;font-size:60px;font-weight:800;color:${bmiC};line-height:1">${bmiR}</div>
          <div style="font-size:15px;font-weight:700;color:${bmiC};margin-top:4px">${bmiL}</div>
        </div>
        ${tolose?`<div style="text-align:center;background:var(--bg3);border-radius:12px;padding:16px 20px">
          <div style="font-family:'Barlow Condensed',sans-serif;font-size:32px;font-weight:800;color:${parseFloat(tolose)>0?c.r:c.t}">${parseFloat(tolose)>0?tolose:Math.abs(parseFloat(tolose))} lb</div>
          <div style="font-size:11px;color:var(--text3);margin-top:2px">${parseFloat(tolose)>0?i('tl2'):i('ag2')}</div>
        </div>`:''}
      </div>
      <div style="height:12px;border-radius:99px;background:linear-gradient(to right,#4d9fff 0%,#007a4d 30%,#b7770d 60%,#c0392b 100%);position:relative">
        <div style="position:absolute;top:50%;left:${gauge}%;transform:translate(-50%,-50%);width:20px;height:20px;border-radius:50%;background:white;border:3px solid ${bmiC}"></div>
      </div>
      <div style="display:flex;justify-content:space-between;margin-top:6px;font-size:10px">
        <span style="color:var(--text3)">15</span><span style="color:#4d9fff">Bajo</span><span style="color:#007a4d">Normal</span><span style="color:#b7770d">Sobrepeso</span><span style="color:#c0392b">Obeso</span><span style="color:var(--text3)">40</span>
      </div>
    </div>`:''}

    <div class="sec-label">${i('kgt')}</div>
    <div class="card" style="margin-bottom:12px">
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:14px">
        ${[{key:'auto',label:i('au'),icon:'🤖'},{key:'pick',label:i('ch'),icon:'🎯'},{key:'manual',label:i('mn2'),icon:'✏️'}].map(m=>`
          <button onclick="upB('kcalGoalMode','${m.key}')" style="padding:10px 6px;border-radius:10px;border:2px solid ${mode===m.key?c.b:'var(--border)'};background:${mode===m.key?c.b+'18':'var(--bg3)'};cursor:pointer;text-align:center;width:100%">
            <div style="font-size:20px;margin-bottom:3px">${m.icon}</div>
            <div style="font-size:11px;font-weight:700;color:${mode===m.key?c.b:'var(--text3)'}">${m.label}</div>
          </button>`).join('')}
      </div>

      ${mode==='auto'?`<div style="text-align:center;padding:14px;background:var(--bg3);border-radius:10px">
        <div style="font-size:12px;color:var(--text3);margin-bottom:4px">Tu TDEE calculado</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:44px;font-weight:800;color:${c.b}">${tdee?tdee.toLocaleString():'—'}</div>
        <div style="font-size:12px;color:var(--text3)">${tdee?'kcal/día (mantenimiento)':'Llena tu perfil arriba'}</div>
      </div>`:''}

      ${mode==='pick'&&goals.length?`<div style="font-size:12px;color:var(--text3);margin-bottom:10px">Selecciona el objetivo a usar en el dashboard:</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        ${goals.map(g=>{const isPicked=parseFloat(b.kcalGoalPick)===g.kcal;return`<button onclick="upB('kcalGoalPick',${g.kcal})" style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:10px;border:2px solid ${isPicked?g.color:'var(--border)'};background:${isPicked?g.color+'14':'var(--bg3)'};cursor:pointer;width:100%;text-align:left">
          <div><div style="font-size:14px;font-weight:600;color:var(--text)">${g.icon} ${g.label}</div><div style="font-size:11px;color:var(--text3);margin-top:2px">${g.sub}</div></div>
          <div style="display:flex;align-items:center;gap:10px">
            <div style="font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:800;color:${g.color}">${g.kcal.toLocaleString()}</div>
            <div style="width:22px;height:22px;border-radius:50%;background:${isPicked?g.color:'transparent'};border:2px solid ${isPicked?g.color:'var(--border)'};display:flex;align-items:center;justify-content:center">
              ${isPicked?'<svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="2,7 5.5,10.5 12,3"/></svg>':''}
            </div>
          </div>
        </button>`}).join('')}
      </div>`:''}
      ${mode==='pick'&&!goals.length?`<div style="text-align:center;padding:16px;color:var(--text3);font-size:13px">Llena tu perfil para ver las opciones</div>`:''}

      ${mode==='manual'?`<div style="font-size:12px;color:var(--text3);margin-bottom:8px">Escribe tu meta de calorías diarias:</div>
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <input id="kcal-manual-in" type="number" value="${b.kcalGoalManual||''}" placeholder="ej: 2200"
          min="500" max="10000" inputmode="numeric" oninput="updateBodyDraft('kcalGoalManual',this)" onchange="commitBodyField('kcalGoalManual',this)"
          style="flex:1;padding:12px 14px;border-radius:10px;border:1.5px solid ${c.b};background:var(--bg3);font-size:28px;font-weight:800;font-family:'Barlow Condensed',sans-serif;color:${c.b};outline:none;text-align:center">
        <span style="font-size:14px;color:var(--text3);white-space:nowrap">kcal / día</span>
      </div>`:''}

      ${activeGoal?`<div style="margin-top:${mode==='auto'?'12':'14'}px;padding:12px 14px;border-radius:10px;background:${c.t}14;border:1px solid ${c.t}40;display:flex;align-items:center;justify-content:space-between">
        <div style="font-size:13px;color:var(--text2);font-weight:500">✅ Meta activa en dashboard</div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:800;color:${c.t}">${Math.round(activeGoal).toLocaleString()} <span style="font-size:13px;opacity:.7">kcal</span></div>
      </div>`:''}
    </div>

    ${tdee&&mode!=='pick'?`<div class="sec-label">${i('rt')}</div>
    <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px">
      ${goals.map(g=>`<div class="card" style="border-left:4px solid ${g.color};padding:12px 16px;display:flex;align-items:center;justify-content:space-between">
        <div><div style="font-size:13px;font-weight:600;color:var(--text)">${g.icon} ${g.label}</div><div style="font-size:11px;color:var(--text3);margin-top:1px">${g.sub}</div></div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:24px;font-weight:800;color:${g.color}">${g.kcal.toLocaleString()}</div>
      </div>`).join('')}
    </div>
    <div style="padding:10px 14px;border-radius:10px;background:var(--bg3);margin-bottom:12px;font-size:12px;color:var(--text3);line-height:1.6">Fórmula Mifflin-St Jeor. Valores estimados.</div>`:''}`;
}

function rBMI(){
  const c=C(),b=S.body;
  document.getElementById('page-bmi').innerHTML=`
    <div class="sec-label">${i('bp')}</div>
    <div class="card ca-blue" style="margin-bottom:12px">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:12px">
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">${i('cw')} (lb)</div>
          <input type="number" aria-label="Peso actual en libras" value="${b.weight||''}" placeholder="185" min="50" max="1500" inputmode="decimal" oninput="updateBodyDraft('weight',this)" onchange="commitBodyField('weight',this)" style="width:100%;padding:10px 11px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg3);font-size:22px;font-weight:700;font-family:'Barlow Condensed',sans-serif;color:${c.b};outline:none">
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">Peso meta (lb)</div>
          <input type="number" aria-label="Peso objetivo en libras" value="${b.goalWeight||''}" placeholder="165" min="50" max="1500" inputmode="decimal" oninput="updateBodyDraft('goalWeight',this)" onchange="commitBodyField('goalWeight',this)" style="width:100%;padding:10px 11px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg3);font-size:22px;font-weight:700;font-family:'Barlow Condensed',sans-serif;color:${c.t};outline:none">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;margin-bottom:12px">
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">Pies</div>
          <input type="number" aria-label="Altura en pies" value="${b.heightFt||''}" placeholder="5" min="2" max="8" inputmode="numeric" oninput="updateBodyDraft('heightFt',this)" onchange="commitBodyField('heightFt',this)" style="width:100%;padding:10px 11px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg3);font-size:22px;font-weight:700;font-family:'Barlow Condensed',sans-serif;color:var(--text);outline:none">
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">Pulgadas</div>
          <input type="number" aria-label="Altura en pulgadas" value="${b.heightIn||''}" placeholder="10" min="0" max="11" inputmode="numeric" oninput="updateBodyDraft('heightIn',this)" onchange="commitBodyField('heightIn',this)" style="width:100%;padding:10px 11px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg3);font-size:22px;font-weight:700;font-family:'Barlow Condensed',sans-serif;color:var(--text);outline:none">
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">Edad</div>
          <input type="number" aria-label="Edad" value="${b.age||''}" placeholder="30" min="13" max="120" inputmode="numeric" oninput="updateBodyDraft('age',this)" onchange="commitBodyField('age',this)" style="width:100%;padding:10px 11px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg3);font-size:22px;font-weight:700;font-family:'Barlow Condensed',sans-serif;color:var(--text);outline:none">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">Sexo</div>
          <div style="display:flex;gap:6px">
            <button onclick="upBImm('sex','male')" style="flex:1;padding:10px 0;border-radius:8px;border:1.5px solid ${b.sex!=='female'?c.b:'var(--border)'};background:${b.sex!=='female'?c.b+'18':'var(--bg3)'};color:${b.sex!=='female'?c.b:'var(--text3)'};font-size:14px;font-weight:600;font-family:'DM Sans',sans-serif">Hombre</button>
            <button onclick="upBImm('sex','female')" style="flex:1;padding:10px 0;border-radius:8px;border:1.5px solid ${b.sex==='female'?'#d4537e':'var(--border)'};background:${b.sex==='female'?'#d4537e18':'var(--bg3)'};color:${b.sex==='female'?'#d4537e':'var(--text3)'};font-size:14px;font-weight:600;font-family:'DM Sans',sans-serif">Mujer</button>
          </div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px">Actividad</div>
          <select onchange="upBImm('activity',this.value)" style="width:100%;padding:10px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg3);font-size:13px;color:var(--text);font-family:'DM Sans',sans-serif;outline:none">
            <option value="sedentary" ${b.activity==='sedentary'?'selected':''}>Sedentario</option>
            <option value="light" ${b.activity==='light'?'selected':''}>Ligero (1-2/sem)</option>
            <option value="moderate" ${(!b.activity||b.activity==='moderate')?'selected':''}>Moderado (3-5/sem)</option>
            <option value="active" ${b.activity==='active'?'selected':''}>Activo (6-7/sem)</option>
            <option value="veryActive" ${b.activity==='veryActive'?'selected':''}>Muy activo</option>
          </select>
        </div>
      </div>
    </div>
    <div id="bmi-results"></div>
    <div class="sec-label">Respaldo</div>
    <div class="card" style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
      <button class="scan-btn secondary" onclick="exportData()" style="margin:0">Exportar datos</button>
      <button class="scan-btn secondary" onclick="document.getElementById('backup-input').click()" style="margin:0">Importar datos</button>
      <input id="backup-input" type="file" accept="application/json,.json" hidden onchange="importData(event)">
      ${backupStatusHTML()}
    </div>
    <div class="sec-label">Privacy & offline</div>
    <div class="card settings-card">${securitySettingsHTML()}${pwaSettingsHTML()}</div>`;
  rBMIResults();
}

function rDash(){
  const c=C(),b=S.body||{};
  const isDark=dk();
  // sync meal day to today (GMT-4)
  syncDay();
  const todayD=S.activeMealDay;
  // macros only from ingredients of meals that are checked today OR all selected ingredients for today
  let totalKcal=0,totalP=0,totalCarbs=0,totalFat=0;
  S.meals.forEach((_,mi)=>{
    const k=`m${mi}_d${todayD}`;
    if(S.mealChecks[k]){
      const ingrs=S.mealIngredients[mi]||S.meals[mi].ingredients;
      ingrs.forEach(ig=>{const m=MACROS[ig];if(m){totalKcal+=m.kcal||0;totalP+=m.p||0;totalCarbs+=m.c||0;totalFat+=m.f||0;}});
    }
  });
  // sessions & habits
  const ts=Object.values(S.checklist).filter(Boolean).length,ms=SS.length*WK;
  const hc=Object.values(S.habits).filter(Boolean).length,mh=S.habitNames.length*7;
  const mc=Object.values(S.mealChecks).filter(Boolean).length,mm=S.meals.length*7;
  const ws=S.progress.map(p=>parseFloat(p.weight)).filter(v=>!isNaN(v));
  const wch=ws.length>=2?(ws[ws.length-1]-ws[0]).toFixed(1):null;
  const sc=Array.from({length:WK},(_,w)=>SS.reduce((s,x)=>s+(S.checklist[`${x}_w${w+1}`]?1:0),0));
  const sessPct=Math.round(ts/ms*100)||0;
  const habPct=Math.round(hc/mh*100)||0;
  const mealPct=mm?Math.round(mc/mm*100):0;
  // goal from BMI tab setting
  const kcalGoal=getKcalGoal();
  const kcalPct=kcalGoal?Math.min(Math.round(totalKcal/kcalGoal*100),100):0;
  const kcalDiff=kcalGoal?Math.round(kcalGoal-totalKcal):null;
  const kcalOver=kcalDiff!==null&&kcalDiff<0;
  const kcalDiffColor=kcalDiff===null?'var(--text3)':kcalOver?c.r:Math.abs(kcalDiff)<150?c.t:c.a;
  const kcalLabel=kcalDiff===null?i('ng'):kcalOver?`+${Math.abs(kcalDiff)} ${i('ko')}`:`${kcalDiff} ${i('kr')}`;

  function arcSVG(pct,color,r=38,sw=9,sz=120){
    const c2=sz/2,circ=2*Math.PI*r;
    const dash=circ*Math.min(pct/100,1);
    return `<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}">
      <circle cx="${c2}" cy="${c2}" r="${r}" fill="none" stroke="rgba(128,128,128,.12)" stroke-width="${sw}"/>
      <circle cx="${c2}" cy="${c2}" r="${r}" fill="none" stroke="${color}" stroke-width="${sw}"
        stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}" stroke-linecap="round"
        transform="rotate(-90 ${c2} ${c2})"/>
    </svg>`;
  }

  // weight sparkline SVG
  let sparkSVG='<div style="font-size:13px;color:var(--text3);text-align:center;padding:20px 0">Sin datos — llena Progreso semana a semana</div>';
  if(ws.length>=2){
    const mn=Math.min(...ws),mx=Math.max(...ws),rng=mx-mn||1;
    const W=300,H=72,pad=24;
    const pts=ws.map((w,wi2)=>{
      const x=pad+(wi2/(ws.length-1))*(W-2*pad);
      const y=H-pad-((w-mn)/rng)*(H-2*pad);
      return[x,y];
    });
    const pathD='M'+pts.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' L');
    const areaD=pathD+` L${pts[pts.length-1][0].toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H} Z`;
    const last=pts[pts.length-1];
    sparkSVG=`<svg width="100%" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="overflow:visible">
      <defs><linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${c.t}" stop-opacity=".25"/>
        <stop offset="100%" stop-color="${c.t}" stop-opacity="0"/>
      </linearGradient></defs>
      <path d="${areaD}" fill="url(#sg)"/>
      <path d="${pathD}" fill="none" stroke="${c.t}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${pts.map((p,pi2)=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${pi2===pts.length-1?5:3}" fill="${pi2===pts.length-1?c.t:'rgba(128,128,128,.4)'}"/>`).join('')}
      <text x="${last[0].toFixed(1)}" y="${(last[1]-10).toFixed(1)}" text-anchor="middle" font-size="11" fill="${c.t}" font-family="'Barlow Condensed',sans-serif" font-weight="700">${ws[ws.length-1]} lb</text>
      <text x="${pts[0][0]}" y="${H}" text-anchor="middle" font-size="10" fill="rgba(128,128,128,.6)" font-family="'DM Sans',sans-serif">${ws[0]} lb</text>
      <text x="${last[0].toFixed(1)}" y="${H}" text-anchor="middle" font-size="10" fill="rgba(128,128,128,.6)" font-family="'DM Sans',sans-serif">S${ws.length}</text>
    </svg>`;
  }

  const toGo=b.weight&&b.goalWeight?(parseFloat(b.weight)-parseFloat(b.goalWeight)).toFixed(1):null;

  document.getElementById('page-dashboard').innerHTML=`
  <div style="padding:4px 0 16px">
    <div style="font-size:13px;color:var(--text3);font-weight:500;margin-bottom:2px">${i('daysF')[todayD]}${S.userName?' · '+h(S.userName):''} 💪</div>
    <div style="font-family:'Barlow Condensed',sans-serif;font-size:30px;font-weight:800;letter-spacing:.02em;line-height:1">
      ${b.weight?`<span style="color:var(--text)">${b.weight} lb</span> <span style="font-size:18px;color:var(--text3)">→</span> <span style="color:${c.t}">${b.goalWeight||'?'} lb</span>`:
      '<span style="color:var(--text)">BEAST MODE</span>'}
    </div>
    ${toGo?`<div style="font-size:12px;color:${parseFloat(toGo)>0?c.r:c.t};font-weight:600;margin-top:3px">${parseFloat(toGo)>0?toGo+' '+i('ltl'):'¡Meta alcanzada!'}</div>`:''}
  </div>

  <!-- ACTIVITY RINGS -->
  <!-- WEEK COMPLETION CARD -->
  <div style="background:${isDark?'#13131a':'#fff'};border:2px solid ${S.activeProgressWeek>=7?c.t:c.b+'44'};border-radius:14px;padding:14px 16px;margin-bottom:14px;${isDark?'':'box-shadow:0 1px 5px rgba(0,0,0,.07)'}">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">
      <div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:800;color:var(--text)">Week ${S.activeProgressWeek+1} <span style="font-size:13px;font-weight:500;color:var(--text3)">of 8</span></div>
        <div style="font-size:11px;color:var(--text3);margin-top:1px">${S.activeProgressWeek>=7?'All weeks complete! 🏆':'Complete to unlock Week '+(S.activeProgressWeek+2)}</div>
      </div>
      ${S.activeProgressWeek<8?`<button onclick="completeWeek()" style="padding:9px 16px;border-radius:10px;background:${c.b};color:#fff;font-size:14px;font-weight:700;font-family:'Barlow Condensed',sans-serif;border:none;cursor:pointer;letter-spacing:.02em">Done ✓</button>`:'<div style="font-size:24px">🏆</div>'}
    </div>
    <div style="display:flex;gap:5px">${Array.from({length:8},(_,w)=>`<div style="flex:1;height:6px;border-radius:99px;background:${w<S.activeProgressWeek?c.t:w===S.activeProgressWeek?c.b:'var(--border)'}"></div>`).join('')}</div>
  </div>

  <div style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin-bottom:10px">${i('ar')}</div>
  <div style="background:${isDark?'#13131a':'#fff'};border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px;${isDark?'':'box-shadow:0 1px 6px rgba(0,0,0,.07)'}">
    <div style="display:flex;align-items:center;gap:16px">
      <div style="position:relative;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0">
        ${arcSVG(sessPct,'#7c5cfc',50,10,120)}
        ${arcSVG(habPct,c.t,36,9,120).replace('width="120" height="120"','width="120" height="120" style="position:absolute;top:0;left:0"')}
        ${arcSVG(mealPct,c.r,22,8,120).replace('width="120" height="120"','width="120" height="120" style="position:absolute;top:0;left:0"')}
      </div>
      <div style="display:flex;flex-direction:column;gap:12px;flex:1;min-width:0">
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <div style="display:flex;align-items:center;gap:6px">
              <div style="width:9px;height:9px;border-radius:50%;background:#7c5cfc;flex-shrink:0"></div>
              <div style="font-size:13px;font-weight:600;color:var(--text)">${i('sess')}</div>
            </div>
            <div style="display:flex;align-items:baseline;gap:4px">
              <div style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:800;color:#7c5cfc">${ts}/${ms}</div>
              <div style="font-size:11px;color:#7c5cfc;opacity:.7">${sessPct}%</div>
            </div>
          </div>
          <div style="height:5px;border-radius:99px;background:rgba(124,92,252,.15)"><div style="width:${sessPct}%;height:5px;border-radius:99px;background:#7c5cfc;transition:width .4s"></div></div>
        </div>
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <div style="display:flex;align-items:center;gap:6px">
              <div style="width:9px;height:9px;border-radius:50%;background:${c.t};flex-shrink:0"></div>
              <div style="font-size:13px;font-weight:600;color:var(--text)">${i('hab')}</div>
            </div>
            <div style="display:flex;align-items:baseline;gap:4px">
              <div style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:800;color:${c.t}">${hc}/${mh}</div>
              <div style="font-size:11px;color:${c.t};opacity:.7">${habPct}%</div>
            </div>
          </div>
          <div style="height:5px;border-radius:99px;background:${c.t}22"><div style="width:${habPct}%;height:5px;border-radius:99px;background:${c.t};transition:width .4s"></div></div>
        </div>
        <div>
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px">
            <div style="display:flex;align-items:center;gap:6px">
              <div style="width:9px;height:9px;border-radius:50%;background:${c.r};flex-shrink:0"></div>
              <div style="font-size:13px;font-weight:600;color:var(--text)">${i('com')}</div>
            </div>
            <div style="display:flex;align-items:baseline;gap:4px">
              <div style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:800;color:${c.r}">${mc}/${mm}</div>
              <div style="font-size:11px;color:${c.r};opacity:.7">${mealPct}%</div>
            </div>
          </div>
          <div style="height:5px;border-radius:99px;background:${c.r}22"><div style="width:${mealPct}%;height:5px;border-radius:99px;background:${c.r};transition:width .4s"></div></div>
        </div>
      </div>
    </div>
  </div>

  <!-- STATS GRID -->
  <div style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin-bottom:10px">${i('sg')}</div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px">
    <!-- Macros card -->
    <div style="background:${isDark?'#13131a':'#fff'};border:1px solid var(--border);border-radius:14px;padding:14px;${isDark?'':'box-shadow:0 1px 5px rgba(0,0,0,.07)'}">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:10px">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${c.t}" stroke-width="2.2" stroke-linecap="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2"/><path d="M7 2v20"/><path d="M21 15V2"/><path d="M18 15c0 2.2-3 7-3 7s-3-4.8-3-7a3 3 0 016 0z"/></svg>
        <div style="font-size:13px;font-weight:700;color:var(--text)">${i('nut')}</div>
      </div>
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:26px;font-weight:800;color:${c.t};line-height:1;margin-bottom:8px">${totalKcal}<span style="font-size:14px;opacity:.6"> kcal</span></div>
      <div style="display:flex;flex-direction:column;gap:5px">
        <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:var(--text2)">${i('prot')}</span><span style="font-weight:700;color:${c.b}">${totalP}g</span></div>
        <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:var(--text2)">${i('carb')}</span><span style="font-weight:700;color:${c.a}">${totalCarbs}g</span></div>
        <div style="display:flex;justify-content:space-between;font-size:12px"><span style="color:var(--text2)">${i('fat')}</span><span style="font-weight:700;color:${c.r}">${totalFat}g</span></div>
      </div>
      <div style="margin-top:10px">
        <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);margin-bottom:3px">
          <span>${kcalLabel}</span>
          <span>${kcalPct}%</span>
        </div>
        <div style="height:6px;border-radius:99px;background:rgba(128,128,128,.12)">
          <div style="width:${Math.min(kcalPct,100)}%;height:6px;border-radius:99px;background:${kcalOver?c.r:kcalPct>70?c.a:c.t};transition:width .4s"></div>
        </div>
        ${kcalGoal?`<div style="display:flex;justify-content:space-between;font-size:10px;margin-top:4px;color:var(--text3)"><span>Consumido: ${totalKcal}</span><span>Meta: ${kcalGoal}</span></div>`:
        `<div style="font-size:10px;margin-top:4px;color:var(--text3)">Define tu meta en la tab BMI ↗</div>`}
      </div>
    </div>
    <!-- Right column: Calories + Habits -->
    <div style="display:flex;flex-direction:column;gap:10px">
      <div style="background:${isDark?'#13131a':'#fff'};border:1px solid var(--border);border-radius:14px;padding:14px;flex:1;${isDark?'':'box-shadow:0 1px 5px rgba(0,0,0,.07)'}">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${c.r}" stroke="none"><path d="M12 2C8 2 4 6.4 4 11c0 4 2.8 7.4 6.6 8.5l1.4.4 1.4-.4C17.2 18.4 20 15 20 11c0-4.6-4-9-8-9z"/></svg>
          <div style="font-size:12px;font-weight:700;color:var(--text)">${i('kcl')}</div>
        </div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:800;color:${kcalOver?c.r:c.t}">${totalKcal}<span style="font-size:11px;opacity:.5"> / ${kcalGoal||'—'}</span></div>
        <div style="font-size:10px;color:${kcalOver?c.r:c.t};margin-top:3px;font-weight:600">${kcalDiff!==null?(kcalOver?'+'+kcalDiff+' sobre meta':Math.abs(kcalDiff)+' restantes'):'Define meta en BMI'}</div>
      </div>
      <div style="background:${isDark?'#13131a':'#fff'};border:1px solid var(--border);border-radius:14px;padding:14px;flex:1;${isDark?'':'box-shadow:0 1px 5px rgba(0,0,0,.07)'}">
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="${c.a}" stroke-width="2.2" stroke-linecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>
          <div style="font-size:12px;font-weight:700;color:var(--text)">${i('hab')}</div>
        </div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:20px;font-weight:800;color:${c.a}">${hc}<span style="font-size:11px;opacity:.5"> / ${mh}</span></div>
        <div style="font-size:10px;color:var(--text3);margin-top:2px">${habPct}% esta semana</div>
      </div>
    </div>
  </div>

  <!-- WEEKLY PROGRESS -->
  <div style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin-bottom:10px">${i('wp')}</div>
  <div style="background:${isDark?'#13131a':'#fff'};border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px;${isDark?'':'box-shadow:0 1px 5px rgba(0,0,0,.07)'}">
    <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px">
      <div>
        <div style="font-size:14px;font-weight:600;color:var(--text)">${i('wc')}</div>
        <div style="font-size:11px;color:var(--text3)">últimas ${ws.length} semanas</div>
      </div>
      ${ws.length>=2?`<div style="font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;color:${wch&&parseFloat(wch)<0?c.t:c.a}">${wch&&parseFloat(wch)<0?'':'+'}${wch||'—'} lb</div>`:''}
    </div>
    <div style="padding:4px 0">${sparkSVG}</div>
  </div>

  <!-- SESSION PROGRESS BARS PER WEEK -->
  <div style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin-bottom:10px">${i('sw')}</div>
  <div style="background:${isDark?'#13131a':'#fff'};border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px;${isDark?'':'box-shadow:0 1px 5px rgba(0,0,0,.07)'}">
    ${sc.map((x,si)=>{
      const pct=Math.round(x/SS.length*100);
      const col=x===SS.length?'#7c5cfc':x>=3?c.b:c.b+'66';
      return`<div style="display:flex;align-items:center;gap:10px;margin-bottom:${si<sc.length-1?'10':'0'}px">
        <div style="font-size:12px;font-weight:600;color:var(--text2);width:52px;flex-shrink:0">Week ${si+1}</div>
        <div style="flex:1;height:7px;border-radius:99px;background:rgba(128,128,128,.1)">
          <div style="width:${pct}%;height:7px;border-radius:99px;background:${col};transition:width .4s"></div>
        </div>
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:14px;font-weight:700;color:${x===SS.length?'#7c5cfc':'var(--text3)'};width:28px;text-align:right">${x}/${SS.length}</div>
      </div>`;
    }).join('')}
  </div>

  <!-- CHECKLIST -->
  <div style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3);margin-bottom:10px">${i('cl')}</div>
  <div style="background:${isDark?'#13131a':'#fff'};border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:14px;overflow-x:auto;${isDark?'':'box-shadow:0 1px 5px rgba(0,0,0,.07)'}">
    <table class="check-table" style="min-width:400px">
      <thead><tr><th>Sesión</th>${Array.from({length:WK},(_,w)=>`<th>S${w+1}</th>`).join('')}<th style="color:#7c5cfc">✓</th></tr></thead>
      <tbody>${SS.map(s=>{const dn=Array.from({length:WK},(_,w)=>S.checklist[`${s}_w${w+1}`]?1:0).reduce((a,b)=>a+b,0);return`<tr><td>${s}</td>${Array.from({length:WK},(_,w)=>{const k=`${s}_w${w+1}`;return`<td><input type="checkbox" ${S.checklist[k]?'checked':''} onchange="S.checklist['${k}']=this.checked;save();rDash()"></td>`}).join('')}<td><span class="ctotal" style="color:${dn===8?c.t:dn>=4?c.a:'var(--text3)'}">${dn}</span></td></tr>`}).join('')}</tbody>
      <tfoot><tr class="totals-row"><td>Total</td>${Array.from({length:WK},(_,w)=>{const x=SS.reduce((s,n)=>s+(S.checklist[`${n}_w${w+1}`]?1:0),0);return`<td style="color:${x===SS.length?c.t:'var(--text2)'}"><b>${x}</b></td>`}).join('')}<td style="color:#7c5cfc"><b>${ts}</b></td></tr></tfoot>
    </table>
  </div>`;
  if(typeof renderInsights==='function')renderInsights();
}
