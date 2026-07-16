function calcMacros(ingredients){let kcal=0,p=0,cr=0,f=0;ingredients.forEach(ig=>{const m=MACROS[ig];if(m){kcal+=m.kcal;p+=m.p;cr+=m.c;f+=m.f}});return{kcal,p,cr,f}}
function nutritionDateKey(){return nowGMT4().toISOString().slice(0,10)}
function currentNutritionTotals(day=S.activeMealDay){const ingredients=S.meals.flatMap((meal,index)=>S.mealChecks[`m${index}_d${day}`]?(S.mealIngredients[index]||meal.ingredients):[]),totals=calcMacros(ingredients);return{kcal:totals.kcal,p:totals.p,c:totals.cr,f:totals.f}}
function recordNutritionSnapshot(day=S.activeMealDay){if(day!==todayIdx())return;S.dailyNutrition[nutritionDateKey()]={...currentNutritionTotals(day),updatedAt:new Date().toISOString()}}
function markFoodRecent(name){S.recentFoods=[name,...S.recentFoods.filter(item=>item!==name)].slice(0,20)}
function toggleFoodFavorite(name,event){event?.stopPropagation();S.foodFavorites=S.foodFavorites.includes(name)?S.foodFavorites.filter(item=>item!==name):[name,...S.foodFavorites];save();rMeals();toast(S.foodFavorites.includes(name)?'Added to favorites ★':'Removed from favorites')}
function setMealCheck(key,value,day=S.activeMealDay){S.mealChecks[key]=value;recordNutritionSnapshot(day);save();rMeals();toast(value?i('mdc'):i('un'))}
function quickFoodsHTML(mi,selected){
  const favorites=S.foodFavorites.filter(name=>MACROS[name]),recent=S.recentFoods.filter(name=>MACROS[name]&&!S.foodFavorites.includes(name)).slice(0,8),items=[...favorites.slice(0,8),...recent];if(!items.length)return'';
  return`<div class="quick-foods"><div class="quick-food-label">Favorites & recent</div><div class="quick-food-list">${items.map(name=>`<button class="quick-food ${selected.includes(name)?'active':''}" onclick="tgI(${mi},decodeURIComponent('${enc(name)}'),event)">${S.foodFavorites.includes(name)?'★':'↻'} ${h(name)}</button>`).join('')}</div></div>`;
}
function donutSVG(p,cr,f,sz=140){const total=p*4+cr*4+f*9||1;const segs=[{v:p*4,color:'#4d9fff',label:i('prot')},{v:cr*4,color:'#ffb627',label:'Carbs'},{v:f*9,color:'#ff5252',label:i('fat')}];const r=44,cx=sz/2,cy=sz/2,circ=2*Math.PI*r;let offset=0;const arcs=segs.map(s=>{const dash=(s.v/total)*circ,gap=circ-dash,d=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${s.color}" stroke-width="18" stroke-dasharray="${dash.toFixed(2)} ${gap.toFixed(2)}" stroke-dashoffset="${(-offset).toFixed(2)}" transform="rotate(-90 ${cx} ${cy})" stroke-linecap="butt"/>`;offset+=dash;return d}).join('');return`<svg width="${sz}" height="${sz}" viewBox="0 0 ${sz} ${sz}">${arcs}<circle cx="${cx}" cy="${cy}" r="30" fill="var(--card)"/></svg>`}
function macroCard(ingredients){const {kcal,p,cr,f}=calcMacros(ingredients);const total=p*4+cr*4+f*9||1;const pp=Math.round(p*4/total*100),cp=Math.round(cr*4/total*100),fp=Math.round(f*9/total*100);const c=C();
if(kcal===0)return`<div class="card ca-teal" style="margin-bottom:12px"><div style="font-family:'Barlow Condensed',sans-serif;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:12px">${i('md')}</div><div style="text-align:center;color:var(--text3);font-size:14px;padding:16px 0">${i('nm')}</div></div>`;
return`<div class="card ca-teal" style="margin-bottom:12px">
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
        <span style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;color:${c.b}">${p}g <span style="font-size:12px;opacity:.6">${pp}%</span></span>
      </div>
      <div style="height:5px;border-radius:99px;background:var(--bg3)"><div style="width:${pp}%;height:5px;border-radius:99px;background:${c.b}"></div></div>
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:500;color:${c.a}">${i('carb')}</span>
        <span style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;color:${c.a}">${cr}g <span style="font-size:12px;opacity:.6">${cp}%</span></span>
      </div>
      <div style="height:5px;border-radius:99px;background:var(--bg3)"><div style="width:${cp}%;height:5px;border-radius:99px;background:${c.a}"></div></div>
    </div>
    <div>
      <div style="display:flex;justify-content:space-between;margin-bottom:4px">
        <span style="font-size:13px;font-weight:500;color:${c.r}">${i('fat')}</span>
        <span style="font-family:'Barlow Condensed',sans-serif;font-size:16px;font-weight:700;color:${c.r}">${f}g <span style="font-size:12px;opacity:.6">${fp}%</span></span>
      </div>
      <div style="height:5px;border-radius:99px;background:var(--bg3)"><div style="width:${fp}%;height:5px;border-radius:99px;background:${c.r}"></div></div>
    </div>
  </div>
</div>
<div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid var(--border)">
  <div style="text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;color:var(--text)">${kcal}</div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">Kcal</div></div>
  <div style="text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;color:${c.b}">${p}g</div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">${i('prot')}</div></div>
  <div style="text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;color:${c.a}">${cr}g</div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">${i('carb')}</div></div>
  <div style="text-align:center"><div style="font-family:'Barlow Condensed',sans-serif;font-size:22px;font-weight:800;color:${c.r}">${f}g</div><div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em">${i('fat')}</div></div>
</div>
</div>`}
function toggleCat(id){const b=document.getElementById('cb-'+id),a=document.getElementById('ca-'+id);if(!b||!a)return;b.classList.toggle('open');a.classList.toggle('open')}
const USDA_KEY='DEMO_KEY';
let searchTimer=null,searchSelected=null;
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
  document.getElementById('sqi-'+mi).focus();
}
function addCustomFood(mi){
  if(!searchSelected||searchSelected.mi!==mi)return;
  const quantity=document.getElementById('sqi-'+mi),g=Number(quantity.value);
  if(!Number.isFinite(g)||g<1||g>2000){quantity.setAttribute('aria-invalid','true');toast('Enter a serving from 1g to 2000g');quantity.focus();return}
  quantity.removeAttribute('aria-invalid');
  const r=g/100;
  const nm=Math.round(g)+'g '+searchSelected.name;
  const entry={kcal:Math.round(searchSelected.kcal100*r),p:Math.round(searchSelected.p100*r),c:Math.round(searchSelected.c100*r),f:Math.round(searchSelected.f100*r),serving:Math.round(g)+'g',addedAt:Date.now()};
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
        <div class="lib-macros">🔥${Number(m.kcal)||0}kcal · P:${Number(m.p)||0}g · C:${Number(m.c)||0}g · G:${Number(m.f)||0}g · ${h(m.serving)}</div>
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
      const macro=`${m.p}P · ${m.c}C · ${m.f}G`;
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
          const macro=`${m.p||0}P · ${m.c||0}C · ${m.f||0}G`;
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
    <div class="search-box"><input class="search-input" id="sbin-${mi}" type="text" placeholder="ej: chicken breast, broccoli, rice…" oninput="clearTimeout(searchTimer);searchTimer=setTimeout(()=>doSearch(${mi},this.value),500)"><span class="search-icon" id="si-${mi}">🔍</span><div class="search-spinner" id="sp-${mi}"></div></div>
    <div class="search-results" id="sr-${mi}"></div>
    <div class="qty-row" id="sq-${mi}" style="display:none">
      <div style="flex:1">
        <div style="font-size:12px;font-weight:500;color:var(--text2);margin-bottom:6px" id="sqn-${mi}"></div>
        <div style="display:flex;align-items:center;gap:8px">
          <input class="qty-input" id="sqi-${mi}" type="number" value="100" min="1" max="2000" onkeydown="if(event.key==='Enter')addCustomFood(${mi})">
          <span style="font-size:13px;color:var(--text2)">gramos</span>
          <button class="qty-add-btn" onclick="addCustomFood(${mi})">+ Agregar</button>
        </div>
      </div>
    </div>
  </div>
  ${catHTML}${customHTML}`;
}
function rMeals(){
  syncDay();
  const c=C(),d=S.activeMealDay;
  recordNutritionSnapshot(d);
  const allIngr=S.meals.flatMap((_,mi)=>S.mealChecks[`m${mi}_d${d}`]?(S.mealIngredients[mi]||S.meals[mi].ingredients):[]);
  document.getElementById('page-meals').innerHTML=
    `${pageIntroHTML('FUEL // 02','Nutrition','Fuel the work. Track what matters. Keep it repeatable.')}<div class="sec-label">${i('sd')}</div>
    <div class="day-tabs">${DS.map((day,di)=>`<button class="dtab ${d===di?'active':''}" onclick="S.activeMealDay=${di};save();rMeals()">${day}</button>`).join('')}</div>
    ${macroCard(allIngr)}
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
