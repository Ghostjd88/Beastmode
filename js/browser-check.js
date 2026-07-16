async function runBeastmodeSelfTests(){
  const results=[];
  const check=async(label,run)=>{try{await run();results.push({label,pass:true})}catch(error){results.push({label,pass:false,error:error?.message||String(error)})}};
  const assert=(value,message)=>{if(!value)throw new Error(message)};
  const active=document.querySelector('.page.active')?.id?.replace('page-','')||'dashboard';
  await check('Styles and navigation',async()=>{assert([...document.styleSheets].some(sheet=>sheet.href?.includes('/css/styles.css')),'Stylesheet missing');assert(document.querySelectorAll('.nav-btn').length===6,'Navigation incomplete')});
  await check('Versioned storage write',async()=>{localStorage.setItem('__beastmode_test__','ok');assert(localStorage.getItem('__beastmode_test__')==='ok','Storage unavailable');localStorage.removeItem('__beastmode_test__')});
  await check('Backup validation',async()=>{const backup=createBackupEnvelope(S),restored=parseBackupEnvelope(JSON.stringify(backup),DEF);assert(stateFingerprint(restored)===stateFingerprint(sanitizeState(S,DEF)),'Backup round trip failed')});
  await check('Workout rendering',async()=>{rWork();assert(document.getElementById('page-workout').querySelector('[aria-label="Ejercicios"]'),'Workout editor missing');assert(document.getElementById('page-workout').textContent.includes('Exercise Guide'),'Exercise guide entry missing')});
  await check('Nutrition rendering',async()=>{rMeals();assert(document.getElementById('page-meals').textContent.includes('Producto'),'Product entry missing');assert(document.getElementById('page-meals').querySelector('[aria-label="Nombre de comida"]'),'Meal editor missing')});
  await check('Progress validation',async()=>{const invalid=validateBodyValue('age','4'),valid=validateBodyValue('age','40');assert(!invalid.valid&&valid.valid,'Numeric validation failed')});
  await check('Backup recovery UI',async()=>{rBMI();assert(document.getElementById('storage-status'),'Storage status missing')});
  await check('Exercise dataset',async()=>{const response=await fetch('./data/exercises.min.json');assert(response.ok,'Dataset request failed');const data=await response.json();assert(data.count===1324&&data.exercises.length===1324,'Dataset incomplete')});
  render(active);
  const passed=results.filter(result=>result.pass).length,report=document.createElement('section');
  report.id='self-test-report';report.setAttribute('role','status');report.style.cssText='position:fixed;inset:12px 12px auto;z-index:1000;padding:14px;border-radius:12px;background:var(--card);border:2px solid '+(passed===results.length?'var(--teal)':'var(--red)')+';box-shadow:0 8px 30px rgba(0,0,0,.25);font-size:13px';
  report.innerHTML=`<strong>BEASTMODE self-test: ${passed}/${results.length} passed</strong>${results.filter(result=>!result.pass).map(result=>`<div style="color:var(--red);margin-top:5px">${h(result.label)}: ${h(result.error)}</div>`).join('')}<button onclick="this.parentElement.remove()" aria-label="Close self-test report" style="float:right;color:var(--accent);font-weight:700">Close</button>`;
  document.body.appendChild(report);
}
if(new URLSearchParams(location.search).has('selftest'))runBeastmodeSelfTests();
