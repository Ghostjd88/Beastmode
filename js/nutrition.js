function calcMacros(ingredients){let kcal=0,p=0,cr=0,f=0;ingredients.forEach(ig=>{const m=MACROS[ig];if(m){kcal+=Number(m.kcal)||0;p+=Number(m.p)||0;cr+=Number(m.c)||0;f+=Number(m.f)||0}});return{kcal,p,cr,f}}
const wholeMacro=value=>Math.round(Number(value)||0);
const STARTER_PLAN_PREFIX='Starter · ';
const STARTER_PLAN_FOODS={
  oats:{label:'Oats',kcal:389,p:16.9,c:66.3,f:6.9},eggs:{label:'Whole eggs',kcal:143,p:12.6,c:.7,f:9.5},eggWhites:{label:'Egg whites',kcal:52,p:10.9,c:.7,f:.2},banana:{label:'Banana',kcal:89,p:1.1,c:22.8,f:.3},yogurt:{label:'Greek yogurt',kcal:59,p:10.3,c:3.6,f:.4},
  chicken:{label:'Chicken breast',kcal:165,p:31,c:0,f:3.6},rice:{label:'Cooked rice',kcal:130,p:2.7,c:28,f:.3},broccoli:{label:'Broccoli',kcal:35,p:2.4,c:7.2,f:.4},oil:{label:'Olive oil',kcal:884,p:0,c:0,f:100},
  beef:{label:'Lean ground beef',kcal:200,p:26,c:0,f:10},sweetPotato:{label:'Sweet potato',kcal:86,p:1.6,c:20.1,f:.1},cabbage:{label:'Cabbage',kcal:25,p:1.3,c:5.8,f:.1},almonds:{label:'Almonds',kcal:579,p:21.2,c:21.6,f:49.9}
};
const STARTER_PLAN_PROFILES={
  balanced:{label:'Balanced',description:'Balanced protein, carbs and fats',templates:[{name:'Breakfast',ratio:.25,flex:'oats',items:[['oats',60],['eggs',100],['banana',100],['yogurt',50]]},{name:'Lunch',ratio:.35,flex:'rice',items:[['chicken',180],['rice',250],['broccoli',150],['oil',3]]},{name:'Dinner',ratio:.30,flex:'sweetPotato',items:[['beef',170],['sweetPotato',220],['cabbage',150],['oil',4]]},{name:'Snack',ratio:.10,flex:'yogurt',items:[['yogurt',200],['banana',50],['almonds',7]]}]},
  highCarb:{label:'High carb / low fat',description:'More rice, oats, fruit and potatoes',templates:[{name:'Breakfast',ratio:.25,flex:'oats',items:[['oats',80],['eggWhites',180],['banana',150],['yogurt',100]]},{name:'Lunch',ratio:.35,flex:'rice',items:[['chicken',150],['rice',300],['broccoli',150],['oil',2]]},{name:'Dinner',ratio:.30,flex:'sweetPotato',items:[['chicken',150],['sweetPotato',300],['cabbage',150],['rice',100]]},{name:'Snack',ratio:.10,flex:'yogurt',items:[['yogurt',250],['banana',100],['oats',20]]}]},
  highProtein:{label:'High protein / low carb',description:'More lean protein with fewer starches',templates:[{name:'Breakfast',ratio:.25,flex:'yogurt',items:[['eggs',150],['yogurt',250],['almonds',20],['banana',50]]},{name:'Lunch',ratio:.35,flex:'chicken',items:[['chicken',250],['broccoli',200],['oil',15],['rice',70]]},{name:'Dinner',ratio:.30,flex:'beef',items:[['beef',250],['cabbage',200],['broccoli',150],['oil',5]]},{name:'Snack',ratio:.10,flex:'yogurt',items:[['yogurt',300],['almonds',25],['banana',30]]}]},
  highFat:{label:'High fat / low carb',description:'More eggs, almonds, olive oil and beef',templates:[{name:'Breakfast',ratio:.25,flex:'eggs',items:[['eggs',200],['almonds',35],['yogurt',150]]},{name:'Lunch',ratio:.35,flex:'beef',items:[['beef',250],['broccoli',200],['oil',15]]},{name:'Dinner',ratio:.30,flex:'chicken',items:[['chicken',200],['cabbage',150],['almonds',25],['oil',15]]},{name:'Snack',ratio:.10,flex:'yogurt',items:[['yogurt',200],['almonds',30],['oil',5]]}]}
};
let starterPlanPreview=null;
function starterFoodPortion(id,grams){const food=STARTER_PLAN_FOODS[id],ratio=grams/100;return{id,label:food.label,grams,kcal:Math.round(food.kcal*ratio),p:Math.round(food.p*ratio*10)/10,c:Math.round(food.c*ratio*10)/10,f:Math.round(food.f*ratio*10)/10}}
function scaleStarterMeal(template,targetKcal){const base=template.items.reduce((sum,[id,grams])=>sum+STARTER_PLAN_FOODS[id].kcal*grams/100,0),scaled=template.items.map(([id,grams])=>[id,Math.max(1,Math.round(grams*targetKcal/base))]);let items=scaled.map(([id,grams])=>starterFoodPortion(id,grams)),difference=targetKcal-items.reduce((sum,item)=>sum+item.kcal,0),flexIndex=scaled.findIndex(([id])=>id===template.flex);if(flexIndex>=0&&difference){const [id,grams]=scaled[flexIndex],adjusted=Math.max(1,grams+Math.round(difference/(STARTER_PLAN_FOODS[id].kcal/100)));scaled[flexIndex]=[id,adjusted];items=scaled.map(([foodId,foodGrams])=>starterFoodPortion(foodId,foodGrams))}return{name:template.name,targetKcal,items}}
function buildStarterMealPlan(goal,style='balanced'){const calories=Math.round(Number(goal)),profile=STARTER_PLAN_PROFILES[style];if(!Number.isFinite(calories)||calories<500||calories>10000)throw new Error('Choose a daily calorie goal between 500 and 10,000');if(!profile)throw new Error('Choose a valid meal plan style');let assigned=0;const meals=profile.templates.map((template,index)=>{const target=index===profile.templates.length-1?calories-assigned:Math.round(calories*template.ratio);assigned+=target;return scaleStarterMeal(template,target)});return{goal:calories,style,profile:{label:profile.label,description:profile.description},meals}}
function starterPlanTotals(plan){return plan.meals.flatMap(meal=>meal.items).reduce((totals,item)=>({kcal:totals.kcal+item.kcal,p:Math.round((totals.p+item.p)*10)/10,c:Math.round((totals.c+item.c)*10)/10,f:Math.round((totals.f+item.f)*10)/10}),{kcal:0,p:0,c:0,f:0})}
function starterPlanShares(plan){const totals=starterPlanTotals(plan),energy=totals.p*4+totals.c*4+totals.f*9||1;return{p:Math.round(totals.p*4/energy*100),c:Math.round(totals.c*4/energy*100),f:Math.round(totals.f*9/energy*100)}}
function starterPlanItemKey(meal,item){return`${STARTER_PLAN_PREFIX}${meal} · ${item.label} · ${item.grams}g`}
function starterPlanCardHTML(){const goal=getKcalGoal(),generated=Object.entries(S.userLibrary||{}).filter(([name])=>name.startsWith(STARTER_PLAN_PREFIX)),generatedKcal=generated.reduce((sum,[,item])=>sum+(Number(item.kcal)||0),0);return`<div class="meal-plan-card"><div class="meal-plan-head"><div><div class="meal-plan-kicker">LOCAL MEAL BUILDER</div><div class="meal-plan-title">Starter meal plan</div><div class="meal-plan-copy">A simple four-meal baseline you can edit after generating.</div></div>${goal?`<div class="meal-plan-goal"><strong>${Math.round(goal).toLocaleString()}</strong><span>kcal goal</span></div>`:''}</div>${generated.length?`<div class="meal-plan-current">Current generated plan · ${generatedKcal.toLocaleString()} kcal</div>`:''}<button class="scan-btn meal-plan-button" onclick="${goal?'openStarterMealPlan()':`document.querySelector('.nav-btn[aria-label=&quot;BMI&quot;]').click()`}">${goal?'Preview starter plan':'Set a calorie goal first'}</button></div>`}
function starterPlanStylesHTML(){return`<div class="starter-plan-styles" role="group" aria-label="Meal plan macro style">${Object.entries(STARTER_PLAN_PROFILES).map(([key,profile])=>{const active=starterPlanPreview.style===key;return`<button type="button" class="starter-plan-style ${active?'active':''}" data-plan-style="${key}" aria-pressed="${active}" onclick="setStarterPlanStyle('${key}')"><strong>${h(profile.label)}</strong><span>${h(profile.description)}</span></button>`}).join('')}</div>`}
function renderStarterPlanModal(){const totals=starterPlanTotals(starterPlanPreview),shares=starterPlanShares(starterPlanPreview);let modal=document.getElementById('starter-plan-modal');if(!modal){modal=document.createElement('div');modal.id='starter-plan-modal';modal.className='modal-overlay';modal.onclick=event=>{if(event.target===modal)modal.remove()};document.body.appendChild(modal)}modal.innerHTML=`<div class="modal-sheet starter-plan-sheet"><div class="modal-handle"></div><div class="modal-title" id="starter-plan-title">Starter meal plan · ${starterPlanPreview.goal.toLocaleString()} kcal</div><div class="modal-sub">Choose a macro style, review the portions, then adjust any meal or product after applying.</div>${starterPlanStylesHTML()}<div class="starter-plan-summary"><div><strong>${totals.kcal.toLocaleString()} kcal</strong><small>${h(starterPlanPreview.profile.label)}</small></div><span>${wholeMacro(totals.p)}g protein · ${wholeMacro(totals.c)}g carbs · ${wholeMacro(totals.f)}g fat<br>P ${shares.p}% · C ${shares.c}% · F ${shares.f}%</span></div><div class="starter-plan-grid">${starterPlanPreview.meals.map(meal=>`<div class="starter-plan-meal"><div class="starter-plan-meal-head"><strong>${h(meal.name)}</strong><span>~${meal.targetKcal} kcal</span></div>${meal.items.map(item=>`<div class="starter-plan-food"><span>${h(item.label)} · ${item.grams}g</span><span>${item.kcal} kcal</span></div>`).join('')}</div>`).join('')}</div><div class="starter-plan-warning">Applying this plan replaces the current meal layout and resets weekly meal checkmarks. Nutrition history and personal products stay saved.</div><div class="starter-plan-actions"><button class="scan-btn" onclick="applyStarterMealPlan()">Use this plan</button><button class="scan-btn secondary" onclick="document.getElementById('starter-plan-modal').remove()">Cancel</button></div></div>`}
function openStarterMealPlan(style='balanced'){const goal=getKcalGoal();if(!goal){toast('Set a daily calorie goal first');document.querySelector('.nav-btn[aria-label="BMI"]')?.click();return}try{starterPlanPreview=buildStarterMealPlan(goal,style)}catch(error){toast(error.message);return}document.getElementById('starter-plan-modal')?.remove();renderStarterPlanModal()}
function setStarterPlanStyle(style){try{starterPlanPreview=buildStarterMealPlan(starterPlanPreview?.goal||getKcalGoal(),style);renderStarterPlanModal();requestAnimationFrame(()=>document.querySelector(`.starter-plan-style[data-plan-style="${style}"]`)?.focus())}catch(error){toast(error.message)}}
function clearStarterPlanFoods(){if(!S.userLibrary)S.userLibrary={};Object.keys(S.userLibrary).filter(name=>name.startsWith(STARTER_PLAN_PREFIX)).forEach(name=>{delete S.userLibrary[name];delete MACROS[name]});S.foodFavorites=S.foodFavorites.filter(name=>!name.startsWith(STARTER_PLAN_PREFIX));S.recentFoods=S.recentFoods.filter(name=>!name.startsWith(STARTER_PLAN_PREFIX))}
function applyStarterMealPlan(){if(!starterPlanPreview)return;const previous=clone(S);clearStarterPlanFoods();const meals=[],mealIngredients={};starterPlanPreview.meals.forEach((meal,index)=>{const ingredients=meal.items.map(item=>{const key=starterPlanItemKey(meal.name,item),entry={kcal:item.kcal,p:item.p,c:item.c,f:item.f,serving:`${item.grams}g`,addedAt:Date.now()};S.userLibrary[key]=entry;MACROS[key]=entry;return key});meals.push({name:meal.name,ingredients});mealIngredients[index]=[...ingredients]});S.meals=meals;S.mealIngredients=mealIngredients;S.mealChecks={};recordNutritionSnapshot();if(!save()){S=previous;hydrateUserMacros();toast('The starter plan could not be saved');return}document.getElementById('starter-plan-modal')?.remove();const mealsButton=document.querySelector('.nav-btn[aria-label="Meals"]');if(mealsButton)showPage('meals',mealsButton);else rMeals();toast(`Starter plan created for ${starterPlanPreview.goal.toLocaleString()} kcal ✓`)}
function nutritionDateKey(){return nowGMT4().toISOString().slice(0,10)}
function selectedNutritionIngredients(){return S.meals.flatMap((meal,index)=>S.mealIngredients[index]||meal.ingredients||[])}
function currentNutritionTotals(day=S.activeMealDay){const totals=calcMacros(selectedNutritionIngredients());return{kcal:totals.kcal,p:totals.p,c:totals.cr,f:totals.f}}
function recordNutritionSnapshot(day=S.activeMealDay){if(day!==todayIdx())return;S.dailyNutrition[nutritionDateKey()]={...currentNutritionTotals(day),updatedAt:new Date().toISOString()}}
function markFoodRecent(name){S.recentFoods=[name,...S.recentFoods.filter(item=>item!==name)].slice(0,20)}
function toggleFoodFavorite(name,event){event?.stopPropagation();S.foodFavorites=S.foodFavorites.includes(name)?S.foodFavorites.filter(item=>item!==name):[name,...S.foodFavorites];save();rMeals();toast(S.foodFavorites.includes(name)?'Added to favorites ★':'Removed from favorites')}
function setMealCheck(key,value,day=S.activeMealDay){S.mealChecks[key]=value;recordNutritionSnapshot(day);save();rMeals();toast(value?i('mdc'):i('un'))}
function quickFoodsHTML(mi,selected){
  const favorites=S.foodFavorites.filter(name=>MACROS[name]),recent=S.recentFoods.filter(name=>MACROS[name]&&!S.foodFavorites.includes(name)).slice(0,8),items=[...favorites.slice(0,8),...recent];if(!items.length)return'';
  return`<div class="quick-foods"><div class="quick-food-label">Favorites & recent</div><div class="quick-food-list">${items.map(name=>`<button class="quick-food ${selected.includes(name)?'active':''}" onclick="tgI(${mi},decodeURIComponent('${enc(name)}'),event)">${S.foodFavorites.includes(name)?'★':'↻'} ${h(name)}</button>`).join('')}</div></div>`;
}
function donutSVG(p,cr,f,sz=140){const total=p*4+cr*4+f*9||1;const segs=[{v:p*4,color:'#4d9fff',label:i('prot')},{v:cr*4,color:'#ffb627',label:'Carbs'},{v:f*9,color:'#ff5252',label:i('fat')}];const r=44,cx=sz/2,cy=sz/2,circ=2*Math.PI*r;let offset=0;const arcs=segs.map(s=>{const dash=(s.v/total)*circ,gap=circ-dash,d=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="18" stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})" stroke-linecap="butt"/>`;offset+=dash;return d}).join('');return`<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}">${arcs}<circle cx="${cx}" cy="${cy}" r="30" fill="var(--card)"/></svg>`}
function macroCard(ingredients){const totals=calcMacros(ingredients),{p,cr,f}=totals,kcal=wholeMacro(totals.kcal),displayP=wholeMacro(p),displayC=wholeMacro(cr),displayF=wholeMacro(f),total=p*4+cr*4+f*9||1,pp=Math.round(p*4/total*100),cp=Math.round(cr*4/total*100),fp=Math.round(f*9/total*100),c=C();
return`<div class="card ca-teal" data-macro-card="today" data-kcal="${kcal}" data-protein="${displayP}" data-carbs="${displayC}" data-fat="${displayF}" style="margin-bottom:12px">
<div style="font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:14px">${i('md')}</div>
<div style="display:flex;align-items:center;gap:20px">
  <div style="position:relative;flex-shrink:0">${donutSVG(p,cr,f)}
    <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center">
      <div style="font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;color:var(--text);line-height:1">${kcal}</div>
      <div style="font-size:10px;color:var(--text3);font-weight:500;letter-spacing:.04em">KCAL</div>
    </div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;gap:12px">
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:500;color:${c.b}">${i('prot')}</span>
        <span style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;color:${c.b}">${displayP}g <span style="font-size:12px;opacity:.6">${pp}%</span></span>
      </div>
      <div style="height:5px;border-radius:99px;background:var(--bg3)"><div style="width:${pp}%;height:5px;border-radius:99px;background:${c.b}"></div></div>
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:500;color:${c.a}">${i('carb')}</span>
        <span style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;color:${c.a}">${displayC}g <span style="font-size:12px;opacity:.6">${cp}%</span></span>
      </div>
      <div style="height:5px;border-radius:99px;background:var(--bg3)"><div style="width:${cp}%;height:5px;border-radius:99px;background:${c.a}"></div></div>
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:500;color:${c.r}">${i('fat')}</span>
        <span style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;color:${c.r}">${displayF}g <span style="font-size:12px;opacity:.6">${fp}%</span></span>
      </div>
      <div style="height:5px;border-radius:99px;background:var(--bg3)"><div style="width:${fp}%;height:5px;border-radius:99px;background:${c.r}"></div></div>
    </div>
  </div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">
  <div style="text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;color:var(--text)">${kcal}</div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">Kcal</div></div>
  <div style="text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;color:${c.b}">${displayP}g</div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">${i('prot')}</div></div>
  <div style="text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;color:${c.a}">${displayC}g</div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">${i('carb')}</div></div>
  <div style="text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;color:${c.r}">${displayF}g</div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">${i('fat')}</div></div>
</div>
</div>`}
function toggleCat(id){const b=document.getElementById('cb-'+id),a=document.getElementById('ca-'+id);if(!b||!a)return;b.classList.toggle('open');a.classList.toggle('open')}
const USDA_KEY='DEMO_KEY';
let searchTimer=null,searchSelected=null;
const FOOD_QUANTITY_UNITS={g:{label:'g',grams:1},oz:{label:'oz',grams:28.3495},piece:{label:'piece'},serving:{label:'serving'},slice:{label:'slice'},cup:{label:'cup'},tbsp:{label:'tbsp'},tsp:{label:'tsp'},ml:{label:'ml'}};
const foodQuantityLabel=(quantity,unit)=>`${Number(quantity).toLocaleString(undefined,{maximumFractionDigits:2})} ${FOOD_QUANTITY_UNITS[unit].label}${quantity!==1&&['piece','serving','slice','cup'].includes(unit)?'s':''}`;
function foodPortionDetails(quantity,unit,gramsPerUnit){const amount=Number(quantity),option=FOOD_QUANTITY_UNITS[unit];if(!option||!Number.isFinite(amount)||amount<=0||amount>2000)throw new Error('Enter a quantity from 0.01 to 2,000');const conversion=option.grams||Number(gramsPerUnit);if(!Number.isFinite(conversion)||conversion<=0||conversion>2000)throw new Error(`Enter the gram weight for one ${option.label}`);const grams=amount*conversion;if(grams>10000)throw new Error('The total portion cannot exceed 10,000 g');return{grams,label:foodQuantityLabel(amount,unit)}}
function changeFoodUnit(mi){const unit=document.getElementById('squ-'+mi),quantity=document.getElementById('sqi-'+mi),conversion=document.getElementById('sqc-'+mi),conversionWrap=document.getElementById('sqcw-'+mi),fixed=FOOD_QUANTITY_UNITS[unit.value].grams;conversionWrap.hidden=Boolean(fixed);conversion.disabled=Boolean(fixed);quantity.value=fixed===1?'100':'1';quantity.focus()}
async function doSearch(mi,query){
  if(!query.trim()){document.getElementById('sr-'+mi).style.display='none';return}
  const sp=document.getElementById('sp-'+mi),si=document.getElementById('si-'+mi),re=document.getElementById('sr-'+mi);
  sp.style.display='block';si.style.display='none';
  try{
    const res=await fetch('https://api.nal.usda.gov/fdc/v1/foods/search?query='+encodeURIComponent(query)+'&pageSize=6&api_key='+USDA_KEY+'&dataType=Foundation,SR%20Legacy');
    if(!res.ok)throw new Error('USDA '+res.status);
    const data=await res.json();
    sp.style.display='none';si.style.display='block';
    if(!data.foods||!data.foods.length){re.innerHTML='<div style="padding:12px 14px;font-size:13px;color:var(--text3)">Sin resultados — prueba en inglés</div>';re.style.display='block';return}
    re.innerHTML=data.foods.slice(0,6).map(f=>{
      const nuts=f.foodNutrients||[];
      const get=(ids,names)=>{const x=nuts.find(x=>ids.includes(x.nutrientId)&&(!x.unitName||/kcal|g/i.test(x.unitName)))||nuts.find(x=>names.includes((x.nutrientName||'').toLowerCase())&&(!x.unitName||/kcal|g/i.test(x.unitName)));return x?Math.round(Number(x.value)||0):0};
      const kcal=get([1008,2047,2048],['energy','energy (atwater general factors)','energy (atwater specific factors)']),p=get([1003],['protein']),c=get([1005],['carbohydrate, by difference']),fat=get([1004],['total lipid (fat)']);
      const nm=f.description.substring(0,46);
      return`<div class="search-result-item" role="button" tabindex="0" onclick="selectFood(${mi},decodeURIComponent('${enc(nm)}'),${kcal},${p},${c},${fat})"><div class="sri-name">${h(nm)}${f.description.length>46?'…':''}</div><div class="sri-macros"><span style="color:var(--accent)">🔥${kcal}kcal</span> <span style="color:#146eb4">P:${p}g</span> <span style="color:#b7770d">C:${c}g</span> <span style="color:#c0392b">G:${fat}g</span> <span style="font-size:10px;opacity:.5">/ 100g</span></div></div>`;
    }).join('');
    re.style.display='block';
  }catch(e){
    document.getElementById('sp-'+mi).style.display='none';document.getElementById('si-'+mi).style.display='block';
    document.getElementById('sr-'+mi).innerHTML='<div style="padding:12px 14px;font-size:13px;color:var(--text3)">Error de conexión</div>';
    document.getElementById('sr-'+mi).style.display='block';
  }
}
function selectFood(mi,name,kcal,p,c,f){
  searchSelected={mi,name,kcal100:kcal,p100:p,c100:c,f100:f};
  document.getElementById('sr-'+mi).style.display='none';
  document.getElementById('sq-'+mi).style.display='flex';
  document.getElementById('sqn-'+mi).textContent=name.substring(0,32)+'…';
  document.getElementById('sqi-'+mi).value='100';
  document.getElementById('squ-'+mi).value='g';
  document.getElementById('sqcw-'+mi).hidden=true;
  document.getElementById('sqc-'+mi).disabled=true;
  document.getElementById('sqc-'+mi).value='';
  document.getElementById('sqi-'+mi).focus();
}
function addCustomFood(mi){
  if(!searchSelected||searchSelected.mi!==mi)return;
  const quantity=document.getElementById('sqi-'+mi),unit=document.getElementById('squ-'+mi),conversion=document.getElementById('sqc-'+mi);let portion;
  try{portion=foodPortionDetails(quantity.value,unit.value,conversion.value)}catch(error){const target=FOOD_QUANTITY_UNITS[unit.value]?.grams?quantity:conversion;target.setAttribute('aria-invalid','true');toast(error.message);target.focus();return}
  quantity.removeAttribute('aria-invalid');conversion.removeAttribute('aria-invalid');
  const r=portion.grams/100;
  const nm=portion.label+' '+searchSelected.name;
  const entry={kcal:Math.round(searchSelected.kcal100*r),p:Math.round(searchSelected.p100*r),c:Math.round(searchSelected.c100*r),f:Math.round(searchSelected.f100*r),serving:portion.label,grams:Math.round(portion.grams*10)/10,addedAt:Date.now()};
  MACROS[nm]=entry;
  if(!S.userLibrary)S.userLibrary={};
  S.userLibrary[nm]=entry;
  if(!S.mealIngredients[mi])S.mealIngredients[mi]=[...S.meals[mi].ingredients];
  if(!S.mealIngredients[mi].includes(nm))S.mealIngredients[mi].push(nm);
  S.meals[mi].ingredients=S.mealIngredients[mi];
  markFoodRecent(nm);recordNutritionSnapshot();
  searchSelected=null;
  document.getElementById('sq-'+mi).style.display='none';
  document.getElementById('sbin-'+mi).value='';
  save();rMeals();toast('✓ '+nm+ ' '+i('add'));
}

let scanState={open:false,mealIdx:null,editingKey:'',
  form:{name:'',serving:'',kcal:'',protein:'',carbs:'',fat:''}};

function openScanModal(mi,editingKey=''){
  const current=S.userLibrary?.[editingKey];
  scanState={open:true,mealIdx:mi,editingKey,
    form:current?{name:editingKey,serving:current.serving||'1 porción',kcal:current.kcal||'',protein:current.p||'',carbs:current.c||'',fat:current.f||''}:{name:'',serving:'100g',kcal:'',protein:'',carbs:'',fat:''}};
  renderScanModal();
}
function closeScanModal(){
  scanState.open=false;
  const el=document.getElementById('scan-modal');
  if(el)el.remove();
}
function renderScanModal(){
  document.getElementById('scan-modal')?.remove();
  const div=document.createElement('div');
  div.id='scan-modal';
  div.className='modal-overlay';
  div.onclick=e=>{if(e.target===div)closeScanModal()};
  const f=scanState.form;
  const hasName=f.name&&f.name.trim().length>0;
  div.innerHTML=`<div class="modal-sheet">
    <div class="modal-handle"></div>
    <div class="modal-title">${scanState.editingKey?'Edit product':'Agregar producto'}</div>
    <div class="modal-sub">Save nutrition values and a reusable serving size in your personal library.</div>
    <div style="border-top:1px solid var(--border);padding-top:14px;margin-top:8px">
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-bottom:10px">Datos del producto</div>
      <input class="scan-field" id="sf-name" aria-label="Nombre del producto" placeholder="Nombre del producto (ej: Avena Quaker)" value="${h(f.name)}">
      <input class="scan-field" id="sf-serving" aria-label="Tamaño de porción" placeholder="Porción (ej: 40g, 1 taza)" value="${h(f.serving)}">
      <div class="macro-row">
        <div class="macro-input-wrap"><div class="macro-lbl" style="color:var(--text)">🔥 Calorías</div><input class="macro-inp" id="sf-kcal" aria-label="Calorías del producto" type="number" min="0" max="100000" inputmode="decimal" placeholder="0" value="${f.kcal||''}"></div>
        <div class="macro-input-wrap"><div class="macro-lbl" style="color:#146eb4">Proteína (g)</div><input class="macro-inp" id="sf-protein" aria-label="Proteína del producto" type="number" min="0" max="10000" inputmode="decimal" placeholder="0" value="${f.protein||''}"></div>
        <div class="macro-input-wrap"><div class="macro-lbl" style="color:#b7770d">Carbs (g)</div><input class="macro-inp" id="sf-carbs" aria-label="Carbohidratos del producto" type="number" min="0" max="10000" inputmode="decimal" placeholder="0" value="${f.carbs||''}"></div>
        <div class="macro-input-wrap"><div class="macro-lbl" style="color:#c0392b">Grasa (g)</div><input class="macro-inp" id="sf-fat" aria-label="Grasa del producto" type="number" min="0" max="10000" inputmode="decimal" placeholder="0" value="${f.fat||''}"></div>
      </div>
      <button class="scan-btn" id="save-scan-btn" onclick="collectAndSave()" style="margin-top:8px;${!hasName?'opacity:.45;':''}">
        💾 Guardar en mi librería + Agregar a comida
      </button>
      <button class="scan-btn secondary" onclick="closeScanModal()">${i('cn')}</button>
    </div>
  </div>`;
  document.body.appendChild(div);
  // attach live listeners after DOM insert
  const n=document.getElementById('sf-name');
  const sv=document.getElementById('sf-serving');
  const kc=document.getElementById('sf-kcal');
  const pr=document.getElementById('sf-protein');
  const cr=document.getElementById('sf-carbs');
  const ft=document.getElementById('sf-fat');
  const btn=document.getElementById('save-scan-btn');
  if(n){
    const upBtn=()=>{if(btn)btn.style.opacity=n.value.trim()?'1':'0.45';};
    n.oninput=()=>{scanState.form.name=n.value;upBtn()};
    sv&&(sv.oninput=()=>scanState.form.serving=sv.value);
    kc&&(kc.oninput=()=>scanState.form.kcal=kc.value);
    pr&&(pr.oninput=()=>scanState.form.protein=pr.value);
    cr&&(cr.oninput=()=>scanState.form.carbs=cr.value);
    ft&&(ft.oninput=()=>scanState.form.fat=ft.value);
  }
}
function collectAndSave(){
  // sync form values from DOM before saving
  const fields={name:'sf-name',serving:'sf-serving',kcal:'sf-kcal',protein:'sf-protein',carbs:'sf-carbs',fat:'sf-fat'};
  Object.entries(fields).forEach(([k,id])=>{const el=document.getElementById(id);if(el)scanState.form[k]=el.value;});
  saveScannedProduct();
}
function saveScannedProduct(){
  const f=scanState.form;
  if(!f.name.trim()){toast('Please enter a product name');return;}
  const key=f.name.trim();
  const values=[['kcal',f.kcal,100000],['protein',f.protein,10000],['carbs',f.carbs,10000],['fat',f.fat,10000]];
  for(const [field,value,max] of values){const number=Number(value||0);if(!Number.isFinite(number)||number<0||number>max){document.getElementById('sf-'+field)?.setAttribute('aria-invalid','true');toast('Nutrition values must be valid non-negative numbers');return}}
  if(S.userLibrary?.[key]&&key!==scanState.editingKey&&!confirm(`${key} already exists. Replace it?`))return;
  const entry={
    kcal:parseFloat(f.kcal)||0,
    p:parseFloat(f.protein)||0,
    c:parseFloat(f.carbs)||0,
    f:parseFloat(f.fat)||0,
    serving:f.serving||'1 porción',
    addedAt:Date.now()
  };
  if(!S.userLibrary)S.userLibrary={};
  const oldKey=scanState.editingKey;
  if(oldKey&&oldKey!==key){delete S.userLibrary[oldKey];delete MACROS[oldKey];S.foodFavorites=S.foodFavorites.map(name=>name===oldKey?key:name);S.recentFoods=S.recentFoods.map(name=>name===oldKey?key:name);Object.values(S.mealIngredients).forEach(items=>{const index=items.indexOf(oldKey);if(index>=0)items[index]=key});S.meals.forEach(meal=>{meal.ingredients=meal.ingredients.map(name=>name===oldKey?key:name)})}
  S.userLibrary[key]=entry;
  MACROS[key]=entry;
  const mi=scanState.mealIdx;
  if(mi!=null){
    if(!S.mealIngredients[mi])S.mealIngredients[mi]=[...S.meals[mi].ingredients];
    if(!S.mealIngredients[mi].includes(key))S.mealIngredients[mi].push(key);
    S.meals[mi].ingredients=S.mealIngredients[mi];
  }
  markFoodRecent(key);recordNutritionSnapshot();
  save();
  closeScanModal();
  rMeals();
  toast('✓ '+key+' '+i('svl'));
}
function editLibraryProduct(key){document.getElementById('lib-modal')?.remove();openScanModal(scanState.mealIdx,key)}
function deleteFromLibrary(key){
  if(!S.userLibrary)return;
  delete S.userLibrary[key];delete MACROS[key];S.foodFavorites=S.foodFavorites.filter(name=>name!==key);S.recentFoods=S.recentFoods.filter(name=>name!==key);Object.values(S.mealIngredients).forEach(items=>{const index=items.indexOf(key);if(index>=0)items.splice(index,1)});S.meals.forEach(meal=>meal.ingredients=meal.ingredients.filter(name=>name!==key));recordNutritionSnapshot();
  save();
  renderLibraryModal();
}
function openLibraryModal(){
  document.getElementById('lib-modal')?.remove();
  const div=document.createElement('div');
  div.id='lib-modal';
  div.className='modal-overlay';
  div.onclick=e=>{if(e.target===div)div.remove()};
  const lib=S.userLibrary||{};
  const items=Object.entries(lib);
  div.innerHTML=`<div class="modal-sheet">
    <div class="modal-handle"></div>
    <div class="modal-title">Mi Librería Personal</div>
    <div class="modal-sub">${items.length} producto${items.length!==1?'s':''} guardado${items.length!==1?'s':''}</div>
    ${items.length===0?`<div class="empty">Aún no tienes productos guardados.<br>Usa el botón ＋ Producto en cualquier comida para agregar.</div>`
    :items.map(([name,m])=>`<div class="lib-item">
      <div style="flex:1;min-width:0">
        <div class="lib-name" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h(name)}</div>
        <div class="lib-macros">🔥${wholeMacro(m.kcal)}kcal · P:${wholeMacro(m.p)}g · C:${wholeMacro(m.c)}g · G:${wholeMacro(m.f)}g · ${h(m.serving)}</div>
      </div>
      <div style="display:flex;gap:6px;margin-left:10px">
        <button aria-label="Favorite ${h(name)}" onclick="toggleFoodFavorite(decodeURIComponent('${enc(name)}'),event);renderLibraryModal()" style="padding:7px;color:var(--amber);font-size:17px">${S.foodFavorites.includes(name)?'★':'☆'}</button>
        <button aria-label="Edit ${h(name)}" onclick="editLibraryProduct(decodeURIComponent('${enc(name)}'))" style="padding:7px;color:var(--accent);font-size:13px">Edit</button>
        <button class="lib-add-btn" onclick="addLibItemToMeal(decodeURIComponent('${enc(name)}'),${scanState.mealIdx!=null?scanState.mealIdx:0});document.getElementById('lib-modal').remove()">+ Agregar</button>
        <button aria-label="Eliminar ${h(name)}" onclick="deleteFromLibrary(decodeURIComponent('${enc(name)}'));renderLibraryModal()" style="padding:7px 10px;border-radius:8px;background:var(--red-dim);color:var(--red);border:none;cursor:pointer;font-size:13px">✕</button>
      </div>
    </div>`).join('')}
    <button class="scan-btn secondary" onclick="this.closest('.modal-overlay').remove()" style="margin-top:12px">${i('cl2')}</button>
  </div>`;
  document.body.appendChild(div);
}
function renderLibraryModal(){
  document.getElementById('lib-modal')?.remove();
  openLibraryModal();
}
function addLibItemToMeal(name,mi){
  const mealIdx=(mi!=null)?mi:(scanState.mealIdx!=null?scanState.mealIdx:0);
  if(!S.userLibrary)S.userLibrary={};
  if(S.userLibrary[name])MACROS[name]=S.userLibrary[name];
  if(!S.mealIngredients[mealIdx])S.mealIngredients[mealIdx]=[...S.meals[mealIdx].ingredients];
  if(!S.mealIngredients[mealIdx].includes(name))S.mealIngredients[mealIdx].push(name);
  S.meals[mealIdx].ingredients=S.mealIngredients[mealIdx];
  markFoodRecent(name);recordNutritionSnapshot();
  document.getElementById('lib-modal')?.remove();
  save();rMeals();toast('✓ '+name+ ' '+i('add'));
}
function ingrPickerHTML(mi,si){
  const checkIcon=`<svg viewBox="0 0 14 14"><polyline points="2,7 5.5,10.5 12,3"/></svg>`;
  const catHTML=Object.entries(CATS).map(([catName,cat],ci)=>{
    const selCount=Object.keys(cat.items).filter(ig=>si.includes(ig)).length;
    const rows=Object.keys(cat.items).map(ig=>{
      const sel=si.includes(ig),m=cat.items[ig];
      const macro=`${wholeMacro(m.p)}P · ${wholeMacro(m.c)}C · ${wholeMacro(m.f)}G`;
      return`<div class="ingr-row ${sel?'sel':''}" role="button" tabindex="0" onclick="tgI(${mi},decodeURIComponent('${enc(ig)}'),event)">
        <div style="flex:1;min-width:0">
          <div class="ingr-label">${h(ig)}</div>
          <div style="font-size:11px;color:${sel?'var(--teal)':'var(--text3)'};margin-top:2px">${m.kcal} kcal · ${macro}</div>
        </div>
        <button class="food-star" aria-label="Favorite ${h(ig)}" onclick="toggleFoodFavorite(decodeURIComponent('${enc(ig)}'),event)">${S.foodFavorites.includes(ig)?'★':'☆'}</button>
        <div class="ingr-check">${checkIcon}</div>
      </div>`;
    }).join('');
    const isOpen=selCount>0;
    return`<div class="cat-block">
      <div class="cat-header" onclick="toggleCat('${mi}-${ci}')" style="background:${cat.color}14;border-radius:8px">
        <span class="cat-title" style="color:${cat.color}">${catName}</span>
        <div style="display:flex;align-items:center;gap:6px">
          ${selCount>0?`<span class="cat-count" style="background:${cat.color}20;color:${cat.color}">${selCount} ✓</span>`:''}
          <span class="cat-arrow ${isOpen?'open':''}" id="ca-${mi}-${ci}">▼</span>
        </div>
      </div>
      <div class="cat-body ${isOpen?'open':''}" id="cb-${mi}-${ci}">${rows}</div>
    </div>`;
  }).join('');

  // custom / scanned / USDA items
  const customIngrs=si.filter(ig=>!AI.includes(ig));
  const customHTML=customIngrs.length?`
    <div class="cat-block">
      <div class="cat-header" style="background:rgba(124,92,252,.1);border-radius:8px">
        <span class="cat-title" style="color:#7c5cfc">Mis productos 📦</span>
        <span class="cat-count" style="background:rgba(124,92,252,.15);color:#7c5cfc">${customIngrs.length} ✓</span>
      </div>
      <div class="cat-body open">
        ${customIngrs.map(ig=>{
          const m=MACROS[ig]||{kcal:0,p:0,c:0,f:0};
          const macro=`${wholeMacro(m.p)}P · ${wholeMacro(m.c)}C · ${wholeMacro(m.f)}G`;
          return`<div class="ingr-row sel" role="button" tabindex="0" onclick="tgI(${mi},decodeURIComponent('${enc(ig)}'),event)">
            <div style="flex:1;min-width:0">
              <div class="ingr-label">${h(ig)}</div>
              <div style="font-size:11px;color:#7c5cfc;margin-top:2px">${Number(m.kcal)||0} kcal · ${macro}${m.serving?' · '+h(m.serving):''}</div>
            </div>
            <button class="food-star" aria-label="Favorite ${h(ig)}" onclick="toggleFoodFavorite(decodeURIComponent('${enc(ig)}'),event)">${S.foodFavorites.includes(ig)?'★':'☆'}</button>
            <div class="ingr-check" style="border-color:#7c5cfc;background:#7c5cfc">${checkIcon}</div>
          </div>`;
        }).join('')}
      </div>
    </div>`:'';

  return`<div style="margin-top:10px">
    ${quickFoodsHTML(mi,si)}
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
      <div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text3)">${i('su')}</div>
      <div style="display:flex;gap:6px">
        <button onclick="event.stopPropagation();scanState.mealIdx=${mi};openScanModal(${mi})" style="padding:5px 10px;border-radius:8px;background:rgba(124,92,252,.12);border:1px solid rgba(124,92,252,.3);color:#7c5cfc;font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer">＋ Producto</button>
        <button onclick="event.stopPropagation();scanState.mealIdx=${mi};openLibraryModal()" style="padding:5px 10px;border-radius:8px;background:var(--bg3);border:1px solid var(--border);color:var(--text2);font-size:12px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer">📚 Librería</button>
      </div>
    </div>
    <div class="search-box"><input class="search-input" id="sbin-${mi}" data-testid="food-search-${mi}" type="text" placeholder="ej: chicken breast, broccoli, rice…" oninput="clearTimeout(searchTimer);searchTimer=setTimeout(()=>doSearch(${mi},this.value),500)"><span class="search-icon" id="si-${mi}">🔍</span><div class="search-spinner" id="sp-${mi}"></div></div>
    <div class="search-results" id="sr-${mi}"></div>
    <div class="qty-row" id="sq-${mi}" style="display:none">
      <div class="qty-content">
        <div style="font-size:12px;font-weight:500;color:var(--text2);margin-bottom:6px" id="sqn-${mi}"></div>
        <div class="qty-controls">
          <label class="qty-field"><span>Quantity</span><input class="qty-input" id="sqi-${mi}" data-testid="food-quantity-${mi}" aria-label="Food quantity" type="number" value="100" min="0.01" max="2000" step="any" inputmode="decimal" onkeydown="if(event.key==='Enter')addCustomFood(${mi})"></label>
          <label class="qty-field"><span>Unit</span><select class="qty-select" id="squ-${mi}" data-testid="food-unit-${mi}" aria-label="Food quantity unit" onchange="changeFoodUnit(${mi})">${Object.entries(FOOD_QUANTITY_UNITS).map(([value,option])=>`<option value="${value}">${option.label}</option>`).join('')}</select></label>
          <label class="qty-field qty-conversion" id="sqcw-${mi}" hidden><span>Grams per unit</span><input class="qty-input" id="sqc-${mi}" data-testid="food-conversion-${mi}" aria-label="Gram weight per unit" type="number" min="0.01" max="2000" step="any" inputmode="decimal" placeholder="e.g. 50" disabled onkeydown="if(event.key==='Enter')addCustomFood(${mi})"></label>
          <button class="qty-add-btn" data-testid="food-add-${mi}" onclick="addCustomFood(${mi})">+ Agregar</button>
        </div>
        <div class="qty-help">Weight units convert automatically. For pieces, servings, and volume, enter the label or measured gram weight for one unit.</div>
      </div>
    </div>
  </div>
  ${catHTML}${customHTML}`;
}
function rMeals(){
  syncDay();
  const c=C(),d=S.activeMealDay;
  recordNutritionSnapshot(d);
  const allIngr=selectedNutritionIngredients();
  document.getElementById('page-meals').innerHTML=
    `${pageIntroHTML('FUEL // 02','Nutrition','Fuel the work. Track what matters. Keep it repeatable.')}<div class="sec-label">${i('sd')}</div>
    <div class="day-tabs">${DS.map((day,di)=>`<button class="dtab ${d===di?'active':''}" onclick="S.activeMealDay=${di};save();rMeals()">${day}</button>`).join('')}</div>
    ${macroCard(allIngr)}
    ${starterPlanCardHTML()}
    <div class="sec-label">${i('mt')}</div>
    <div class="card ca-teal">
      ${S.meals.map((m,mi)=>{
        const k=`m${mi}_d${d}`,dn=!!S.mealChecks[k],si=S.mealIngredients[`${mi}`]||m.ingredients;
        return`<div class="meal-item ${dn?'meal-done':''}"><input type="checkbox" class="meal-check" aria-label="Marcar ${h(m.name)}" ${dn?'checked':''} onchange="setMealCheck('${k}',this.checked,${d})"><div class="meal-info" style="width:100%"><input class="meal-name-in" aria-label="Nombre de comida" value="${h(m.name)}" oninput="S.meals[${mi}].name=this.value;save()">${ingrPickerHTML(mi,si)}</div></div>`;
      }).join('')}
      <button class="add-btn" onclick="S.meals.push({name:i('nm2'),ingredients:[]});save();rMeals()">+ Añadir comida</button>
    </div>
    <div class="sec-label">${i('ws')}</div>
    <div class="card" style="overflow-x:auto">
      <table class="mwt" style="min-width:340px">
        <thead><tr><th>Comida</th>${DS.map(x=>`<th>${x}</th>`).join('')}<th>✓</th></tr></thead>
        <tbody>${S.meals.map((m,mi)=>{const tot=DS.reduce((s,_,di)=>s+(S.mealChecks[`m${mi}_d${di}`]?1:0),0);return`<tr><td style="max-width:88px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${h(m.name.split('—')[0].trim())}</td>${DS.map((_,di)=>`<td><input type="checkbox" aria-label="${h(m.name)} ${DS[di]}" ${S.mealChecks[`m${mi}_d${di}`]?'checked':''} onchange="setMealCheck('m${mi}_d${di}',this.checked,${di})"></td>`).join('')}<td><span class="mwtot" style="color:${tot===7?c.t:tot>=4?c.a:'var(--text3)'}">${tot}/7</span></td></tr>`}).join('')}</tbody>
        <tfoot><tr class="totals-row"><td>Total</td>${DS.map((_,di)=>{const x=S.meals.reduce((s,_,mi)=>s+(S.mealChecks[`m${mi}_d${di}`]?1:0),0);return`<td style="color:${x===S.meals.length?c.t:'var(--text2)'}">${x}</td>`}).join('')}<td style="color:${c.t}"><b>${Object.values(S.mealChecks).filter(Boolean).length}</b></td></tr></tfoot>
      </table>
    </div>`;
}
function tgI(mi,ig,e){if(e)e.stopPropagation();if(!S.mealIngredients[mi])S.mealIngredients[mi]=[...S.meals[mi].ingredients];const a=S.mealIngredients[mi],index=a.indexOf(ig);if(index>=0)a.splice(index,1);else{a.push(ig);markFoodRecent(ig)}S.meals[mi].ingredients=a;recordNutritionSnapshot();save();rMeals()}
