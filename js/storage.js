const BM_SCHEMA_VERSION=9;
const BM_STORAGE_KEY='bm_state';
const BM_AUTO_BACKUP_KEY='bm_auto_backup';
const BM_ROLLBACK_KEY='bm_import_rollback';
const BM_LEGACY_KEYS=['bm_v6','bm_v5'];
const BM_LOCAL_LIMIT=5*1024*1024;
const BM_WARNING_RATIO=.75;
const BM_MAX_IMPORT_BYTES=5*1024*1024;
const BODY_LIMITS={weight:[50,1500],goalWeight:[50,1500],heightFt:[2,8],heightIn:[0,11],age:[13,120],kcalGoalManual:[500,10000],kcalGoalPick:[500,10000]};
let storageWarningShown=false,lastStorageError='';

const clone=value=>JSON.parse(JSON.stringify(value));
const cleanText=(value,max=500)=>String(value??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,'').trim().slice(0,max);
const cleanNumber=(value,min,max,allowEmpty=true)=>{
  if((value===''||value==null)&&allowEmpty)return'';
  const number=Number(value);
  return Number.isFinite(number)&&number>=min&&number<=max?String(number):'';
};
const cleanBooleanMap=value=>Object.fromEntries(Object.entries(value&&typeof value==='object'&&!Array.isArray(value)?value:{}).slice(0,1000).map(([key,item])=>[cleanText(key,100),Boolean(item)]).filter(([key])=>key));
const stateFingerprint=state=>fnv1a(JSON.stringify(state));
const fnv1a=value=>{
  let hash=2166136261;
  for(let index=0;index<value.length;index++){hash^=value.charCodeAt(index);hash=Math.imul(hash,16777619)}
  return(hash>>>0).toString(16).padStart(8,'0');
};
const stateBytes=state=>new TextEncoder().encode(JSON.stringify(state)).length;

function sanitizeMacro(value){
  const item=value&&typeof value==='object'?value:{};
  return{kcal:Math.min(100000,Math.max(0,Number(item.kcal)||0)),p:Math.min(10000,Math.max(0,Number(item.p)||0)),c:Math.min(10000,Math.max(0,Number(item.c)||0)),f:Math.min(10000,Math.max(0,Number(item.f)||0)),serving:cleanText(item.serving||'1 porción',80),grams:Math.min(10000,Math.max(0,Number(item.grams)||0)),addedAt:Number.isFinite(Number(item.addedAt))?Number(item.addedAt):Date.now()};
}
function sanitizeWorkoutRows(rows,fallback){
  if(!Array.isArray(rows))return clone(fallback);
  return rows.slice(0,500).map(row=>({day:cleanText(row?.day,120),exercises:cleanText(row?.exercises,160),reps:cleanText(row?.reps,80),notes:cleanText(row?.notes,500)}));
}
function sanitizeRoutineExercise(item){return{id:cleanText(item?.id,100),name:cleanText(item?.name||item?.exercises,160),reps:cleanText(item?.reps||'3x10',80),notes:cleanText(item?.notes,500)}}
function sanitizeWorkoutLog(log){
  const exercises=Array.isArray(log?.exercises)?log.exercises.slice(0,100).map(exercise=>({name:cleanText(exercise?.name,160),target:cleanText(exercise?.target,80),notes:cleanText(exercise?.notes,500),sets:Array.isArray(exercise?.sets)?exercise.sets.slice(0,30).map(set=>({weight:Math.min(5000,Math.max(0,Number(set?.weight)||0)),reps:Math.min(1000,Math.max(0,Number(set?.reps)||0)),done:Boolean(set?.done)})):[]})).filter(exercise=>exercise.name):[];
  return{id:cleanText(log?.id,100)||String(Date.now()),date:/^\d{4}-\d{2}-\d{2}$/.test(log?.date)?log.date:new Date().toISOString().slice(0,10),startedAt:cleanText(log?.startedAt,40),completedAt:cleanText(log?.completedAt,40),routineName:cleanText(log?.routineName,120),day:cleanText(log?.day,120),volume:Math.min(100000000,Math.max(0,Number(log?.volume)||0)),durationSeconds:Math.min(86400,Math.max(0,Number(log?.durationSeconds)||0)),prCount:Math.min(100,Math.max(0,Number(log?.prCount)||0)),restTimerEnd:Math.max(0,Number(log?.restTimerEnd)||0),restSeconds:Math.min(600,Math.max(15,Number(log?.restSeconds)||90)),exercises};
}
function sanitizeState(input,defaults){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('El respaldo no contiene datos válidos.');
  const next=clone(defaults),body=input.body&&typeof input.body==='object'?input.body:{};
  next.body={...next.body};
  for(const [key,limits] of Object.entries(BODY_LIMITS))next.body[key]=cleanNumber(body[key],...limits);
  next.body.sex=['male','female'].includes(body.sex)?body.sex:next.body.sex;
  next.body.activity=['sedentary','light','moderate','active','veryActive'].includes(body.activity)?body.activity:next.body.activity;
  next.body.kcalGoalMode=['auto','pick','manual'].includes(body.kcalGoalMode)?body.kcalGoalMode:next.body.kcalGoalMode;
  next.workouts={};
  for(const phase of ['fase1','fase2','fase3'])next.workouts[phase]=sanitizeWorkoutRows(input.workouts?.[phase],defaults.workouts[phase]);
  next.meals=Array.isArray(input.meals)?input.meals.slice(0,50).map((meal,index)=>({name:cleanText(meal?.name,120)||`Comida ${index+1}`,ingredients:Array.isArray(meal?.ingredients)?[...new Set(meal.ingredients.map(item=>cleanText(item,160)).filter(Boolean))].slice(0,100):[]})):clone(defaults.meals);
  if(!next.meals.length)next.meals=clone(defaults.meals);
  next.progress=Array.from({length:8},(_,index)=>{
    const item=Array.isArray(input.progress)?input.progress[index]:null;
    return{week:index+1,weight:cleanNumber(item?.weight,50,1500),waist:cleanNumber(item?.waist,10,200),energy:['1','2','3','4','5'].includes(String(item?.energy))?String(item.energy):'',strength:['1','2','3','4','5'].includes(String(item?.strength))?String(item.strength):'',notes:cleanText(item?.notes,2000)};
  });
  next.userLibrary={};
  for(const [name,value] of Object.entries(input.userLibrary&&typeof input.userLibrary==='object'&&!Array.isArray(input.userLibrary)?input.userLibrary:{}).slice(0,500)){const key=cleanText(name,160);if(key)next.userLibrary[key]=sanitizeMacro(value)}
  next.mealIngredients={};
  for(const [key,value] of Object.entries(input.mealIngredients&&typeof input.mealIngredients==='object'&&!Array.isArray(input.mealIngredients)?input.mealIngredients:{}).slice(0,50))if(Array.isArray(value))next.mealIngredients[cleanText(key,20)]=[...new Set(value.map(item=>cleanText(item,160)).filter(Boolean))].slice(0,100);
  next.checklist=cleanBooleanMap(input.checklist);
  next.mealChecks=cleanBooleanMap(input.mealChecks);
  next.habits=cleanBooleanMap(input.habits);
  next.habitNames=Array.isArray(input.habitNames)?input.habitNames.map(item=>cleanText(item,80)).filter(Boolean).slice(0,20):clone(defaults.habitNames);
  if(!next.habitNames.length)next.habitNames=clone(defaults.habitNames);
  next.activeMealDay=Math.min(6,Math.max(0,Number.parseInt(input.activeMealDay,10)||0));
  next.activeProgressWeek=Math.min(7,Math.max(0,Number.parseInt(input.activeProgressWeek,10)||0));
  next.activePhase=['fase1','fase2','fase3'].includes(input.activePhase)?input.activePhase:'fase1';
  next.theme=input.theme==='dark'?'dark':'light';
  next.userName=cleanText(input.userName,80);
  next.customRoutines=Array.isArray(input.customRoutines)?input.customRoutines.slice(0,50).map((routine,index)=>({id:cleanText(routine?.id,100)||`routine-${index+1}`,name:cleanText(routine?.name,120)||`Routine ${index+1}`,exercises:Array.isArray(routine?.exercises)?routine.exercises.slice(0,100).map(sanitizeRoutineExercise).filter(exercise=>exercise.name):[]})):[];
  next.activeRoutineId=next.customRoutines.some(routine=>routine.id===input.activeRoutineId)?input.activeRoutineId:'';
  next.workoutLogs=Array.isArray(input.workoutLogs)?input.workoutLogs.slice(-500).map(sanitizeWorkoutLog):[];
  next.activeWorkout=input.activeWorkout&&typeof input.activeWorkout==='object'?sanitizeWorkoutLog(input.activeWorkout):null;
  next.foodFavorites=Array.isArray(input.foodFavorites)?[...new Set(input.foodFavorites.map(item=>cleanText(item,160)).filter(Boolean))].slice(0,200):[];
  next.recentFoods=Array.isArray(input.recentFoods)?[...new Set(input.recentFoods.map(item=>cleanText(item,160)).filter(Boolean))].slice(0,30):[];
  next.dailyNutrition={};
  for(const [date,value] of Object.entries(input.dailyNutrition&&typeof input.dailyNutrition==='object'&&!Array.isArray(input.dailyNutrition)?input.dailyNutrition:{}).slice(-365))if(/^\d{4}-\d{2}-\d{2}$/.test(date))next.dailyNutrition[date]={kcal:Math.max(0,Number(value?.kcal)||0),p:Math.max(0,Number(value?.p)||0),c:Math.max(0,Number(value?.c)||0),f:Math.max(0,Number(value?.f)||0),updatedAt:cleanText(value?.updatedAt,40)};
  next.workoutUnit=input.workoutUnit==='kg'?'kg':'lb';
  next.restTimerSeconds=Math.min(600,Math.max(15,Number(input.restTimerSeconds)||90));
  next.lastWorkoutSummaryId=cleanText(input.lastWorkoutSummaryId,100);
  return next;
}
function migrateState(input,fromVersion,defaults){
  const migrated=clone(input),version=Number(fromVersion)||5;
  if(version<6){if(!migrated.body)migrated.body={};if(!migrated.userLibrary)migrated.userLibrary={}}
  if(version<7){if(Array.isArray(migrated.workouts))migrated.workouts=clone(defaults.workouts);if(!migrated.mealIngredients||typeof migrated.mealIngredients!=='object')migrated.mealIngredients={}}
  if(version<8){for(const key of ['customRoutines','workoutLogs','foodFavorites','recentFoods'])if(!Array.isArray(migrated[key]))migrated[key]=[];if(!migrated.dailyNutrition||typeof migrated.dailyNutrition!=='object')migrated.dailyNutrition={};if(!('activeWorkout'in migrated))migrated.activeWorkout=null}
  if(version<9){migrated.workoutUnit='lb';migrated.restTimerSeconds=90;migrated.lastWorkoutSummaryId=''}
  return sanitizeState(migrated,defaults);
}
function unwrapStored(raw){
  const parsed=JSON.parse(raw);
  return parsed&&typeof parsed==='object'&&parsed.state?{version:Number(parsed.version)||6,state:parsed.state,savedAt:parsed.savedAt||parsed.exportedAt||''}:{version:6,state:parsed,savedAt:''};
}
function loadBeastmodeState(defaults){
  const candidates=[BM_STORAGE_KEY,...BM_LEGACY_KEYS];
  for(const key of candidates){
    const raw=localStorage.getItem(key);
    if(!raw)continue;
    try{
      const stored=unwrapStored(raw),state=migrateState(stored.state,key==='bm_v5'?5:stored.version,defaults);
      if(key!==BM_STORAGE_KEY)setTimeout(()=>save(),0);
      return state;
    }catch(error){lastStorageError='Saved data was invalid and the safe defaults were loaded.'}
  }
  return clone(defaults);
}
function createBackupEnvelope(state,exportedAt=new Date().toISOString()){
  const snapshot=clone(state);
  return{app:'BEASTMODE',version:BM_SCHEMA_VERSION,exportedAt,checksum:stateFingerprint(snapshot),state:snapshot};
}
function parseBackupEnvelope(raw,defaults){
  if(typeof raw!=='string'||new TextEncoder().encode(raw).length>BM_MAX_IMPORT_BYTES)throw new Error('El archivo es demasiado grande.');
  const parsed=JSON.parse(raw),state=parsed?.state||parsed;
  if(parsed?.app&&parsed.app!=='BEASTMODE')throw new Error('Este archivo no pertenece a BEASTMODE.');
  if(parsed?.version&&(!Number.isInteger(Number(parsed.version))||Number(parsed.version)<5||Number(parsed.version)>BM_SCHEMA_VERSION))throw new Error('La versión del respaldo no es compatible.');
  if(parsed?.checksum&&parsed.checksum!==stateFingerprint(state))throw new Error('El respaldo está dañado o fue modificado.');
  return migrateState(state,Number(parsed?.version)||6,defaults);
}
function maybeCreateAutoBackup(previousRaw){
  if(!previousRaw)return;
  try{
    const previous=unwrapStored(previousRaw),existing=localStorage.getItem(BM_AUTO_BACKUP_KEY),last=existing?JSON.parse(existing).exportedAt:'';
    if(!last||new Date(last).toDateString()!==new Date().toDateString())localStorage.setItem(BM_AUTO_BACKUP_KEY,JSON.stringify(createBackupEnvelope(previous.state,previous.savedAt||new Date().toISOString())));
  }catch(error){}
}
function storageInfo(){
  const bytes=stateBytes(S),ratio=bytes/BM_LOCAL_LIMIT;
  return{bytes,ratio,percent:Math.min(100,Math.round(ratio*100)),remaining:Math.max(0,BM_LOCAL_LIMIT-bytes),warning:ratio>=BM_WARNING_RATIO,error:lastStorageError};
}
function save(){
  try{
    const safeState=typeof DEF==='undefined'?S:sanitizeState(S,DEF),envelope={version:BM_SCHEMA_VERSION,savedAt:new Date().toISOString(),state:safeState},serialized=JSON.stringify(envelope),bytes=new TextEncoder().encode(serialized).length;
    if(bytes>BM_LOCAL_LIMIT*.92){lastStorageError='Storage is almost full. Export a backup before adding more data.';if(typeof toast==='function')toast(lastStorageError);return false}
    const previous=localStorage.getItem(BM_STORAGE_KEY);
    maybeCreateAutoBackup(previous);
    localStorage.setItem(BM_STORAGE_KEY,serialized);
    lastStorageError='';
    if(bytes/BM_LOCAL_LIMIT>=BM_WARNING_RATIO&&!storageWarningShown){storageWarningShown=true;if(typeof toast==='function')toast('Storage is over 75% full. Export a backup soon.')}
    if(typeof refreshStorageStatus==='function')refreshStorageStatus();
    return true;
  }catch(error){lastStorageError=error?.name==='QuotaExceededError'?'Storage is full. Export a backup and remove unused products.':'Your changes could not be saved.';if(typeof toast==='function')toast(lastStorageError);return false}
}
function downloadBackup(envelope,prefix='beastmode-backup'){
  const blob=new Blob([JSON.stringify(envelope,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a'),stamp=envelope.exportedAt.replace(/[:.]/g,'-');
  link.href=url;link.download=`${prefix}-${stamp}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function exportData(){downloadBackup(createBackupEnvelope(S));toast('Backup exported ✓')}
function refreshAfterStateChange(){
  hydrateUserMacros();
  document.documentElement.setAttribute('data-theme',S.theme||'light');
  const themeButton=document.getElementById('tbtn');if(themeButton)themeButton.textContent=S.theme==='dark'?'☀️':'🌙';
  const active=document.querySelector('.page.active')?.id?.replace('page-','')||'dashboard';render(active);
}
function importData(event){
  const input=event.target,file=input.files?.[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=()=>{
    try{
      const next=parseBackupEnvelope(String(reader.result),DEF);
      if(stateFingerprint(next)===stateFingerprint(S)){toast('Este respaldo ya está cargado');return}
      if(!confirm(`Importar ${file.name}?\n\nEsto reemplazará los datos actuales. Se guardará una copia de recuperación.`))return;
      localStorage.setItem(BM_ROLLBACK_KEY,JSON.stringify(createBackupEnvelope(S)));
      S=next;
      if(!save())throw new Error('No se pudo guardar el respaldo.');
      refreshAfterStateChange();toast('Datos importados y validados ✓');
    }catch(error){toast(error?.message||'Archivo de respaldo inválido')}
    finally{input.value=''}
  };
  reader.onerror=()=>{input.value='';toast('No se pudo leer el archivo')};
  reader.readAsText(file);
}
function latestRecovery(){
  return[BM_ROLLBACK_KEY,BM_AUTO_BACKUP_KEY].map(key=>{try{const value=JSON.parse(localStorage.getItem(key));return value?.state?{key,...value}:null}catch(error){return null}}).filter(Boolean).sort((a,b)=>String(b.exportedAt).localeCompare(String(a.exportedAt)))[0]||null;
}
function restoreLastBackup(){
  const recovery=latestRecovery();
  if(!recovery){toast('No hay copia de recuperación disponible');return}
  if(!confirm(`Restaurar la copia del ${new Date(recovery.exportedAt).toLocaleString()}?`))return;
  try{const next=parseBackupEnvelope(JSON.stringify(recovery),DEF);if(stateFingerprint(next)===stateFingerprint(S)){toast('La copia coincide con los datos actuales');return}S=next;if(!save())throw new Error('No se pudo restaurar');refreshAfterStateChange();toast('Copia restaurada ✓')}catch(error){toast(error?.message||'No se pudo restaurar la copia')}
}
function backupStatusHTML(){
  const info=storageInfo(),recovery=latestRecovery(),size=(info.bytes/1024).toFixed(1);
  return`<div id="storage-status" style="grid-column:1/-1"><div style="display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-bottom:5px"><span>Device storage</span><span>${size} KB · ${info.percent}% of safe limit</span></div><div style="height:6px;border-radius:99px;background:var(--bg3);overflow:hidden"><div style="width:${info.percent}%;height:100%;background:${info.warning?'var(--amber)':'var(--teal)'}"></div></div>${info.error?`<div role="alert" style="font-size:11px;color:var(--red);margin-top:6px">${cleanText(info.error,180)}</div>`:''}${recovery?`<button class="scan-btn secondary" onclick="restoreLastBackup()" style="margin:9px 0 0">Restore safety backup · ${new Date(recovery.exportedAt).toLocaleDateString()}</button>`:''}</div>`;
}
function refreshStorageStatus(){const current=document.getElementById('storage-status');if(!current)return;const holder=document.createElement('div');holder.innerHTML=backupStatusHTML();current.replaceWith(holder.firstElementChild)}
function hydrateUserMacros(){
  if(typeof MACROS==='undefined')return;
  if(typeof BASE_MACRO_KEYS!=='undefined')Object.keys(MACROS).forEach(key=>{if(!BASE_MACRO_KEYS.has(key))delete MACROS[key]});
  Object.entries(S.userLibrary||{}).forEach(([key,value])=>MACROS[key]=value);
}
function validateBodyValue(key,value){
  const limits=BODY_LIMITS[key];if(!limits||value==='')return{valid:true,value};
  const number=Number(value),valid=Number.isFinite(number)&&number>=limits[0]&&number<=limits[1];
  return{valid,value:valid?String(number):'',message:`Enter a value from ${limits[0]} to ${limits[1]}.`};
}
function updateBodyDraft(key,input,rerender=true){
  S.body[key]=input.value;if(rerender)rBMIResults();
  const result=validateBodyValue(key,input.value);
  if(result.valid){input.removeAttribute('aria-invalid');save()}else input.setAttribute('aria-invalid','true');
}
function commitBodyField(key,input){
  const result=validateBodyValue(key,input.value);
  if(!result.valid){input.setAttribute('aria-invalid','true');S.body[key]='';input.value='';save();toast(result.message);input.focus();return false}
  input.removeAttribute('aria-invalid');S.body[key]=result.value;save();rBMIResults();return true;
}
function updateProgressDraft(index,key,input){
  S.progress[index][key]=input.value;
  const limits=key==='weight'?[50,1500]:[10,200],number=input.value===''?null:Number(input.value),valid=number===null||Number.isFinite(number)&&number>=limits[0]&&number<=limits[1];
  if(valid){input.removeAttribute('aria-invalid');save()}else input.setAttribute('aria-invalid','true');
}
function updateProgressValue(index,key,value,input){
  const limits=key==='weight'?[50,1500]:[10,200],number=value===''?null:Number(value);
  if(number!==null&&(!Number.isFinite(number)||number<limits[0]||number>limits[1])){input?.setAttribute('aria-invalid','true');S.progress[index][key]='';if(input)input.value='';save();toast(`Enter a value from ${limits[0]} to ${limits[1]}.`);return false}
  input?.removeAttribute('aria-invalid');S.progress[index][key]=value;save();return true;
}
