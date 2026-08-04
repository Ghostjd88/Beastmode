const exerciseGuide={data:null,query:'',body:'',equipment:'',selected:null,lang:'en',loading:false,error:'',action:null};
const guideNorm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
async function loadExerciseGuide(){
  if(exerciseGuide.data||exerciseGuide.loading)return;
  exerciseGuide.loading=true;exerciseGuide.error='';renderExerciseGuide();
  try{
    const response=await fetch('./data/exercises.min.json?v=14');
    if(!response.ok)throw new Error('Unable to load exercise data');
    const payload=await response.json();
    if(!Array.isArray(payload.exercises)||payload.exercises.length!==1324)throw new Error('Invalid exercise data');
    exerciseGuide.data=payload.exercises;
  }catch(error){exerciseGuide.error='Exercise guide could not be loaded. Check your connection and try again.';}
  exerciseGuide.loading=false;renderExerciseGuide();
}
function openExerciseGuide(seed='',action=null){
  exerciseGuide.query=String(seed||'').split(/[,/+&]/)[0].trim();
  exerciseGuide.body='';exerciseGuide.equipment='';exerciseGuide.selected=null;exerciseGuide.lang='en';exerciseGuide.action=action;
  document.getElementById('exercise-guide-modal')?.remove();
  const overlay=document.createElement('div');
  overlay.id='exercise-guide-modal';overlay.className='modal-overlay';
  overlay.onclick=event=>{if(event.target===overlay)overlay.remove()};
  document.body.appendChild(overlay);renderExerciseGuide();loadExerciseGuide();
}
function closeExerciseGuide(){document.getElementById('exercise-guide-modal')?.remove()}
function updateExerciseGuide(field,value){exerciseGuide[field]=value;exerciseGuide.selected=null;renderExerciseGuide();if(field==='query'){const input=document.querySelector('#exercise-guide-modal .guide-input');if(input){input.focus();input.setSelectionRange(input.value.length,input.value.length)}}}
function selectExerciseGuide(id){exerciseGuide.selected=exerciseGuide.data?.find(exercise=>exercise.id===String(id))||null;renderExerciseGuide()}
function exerciseGuideResults(){
  if(!exerciseGuide.data)return[];
  const query=guideNorm(exerciseGuide.query),terms=query.split(/\s+/).filter(Boolean);
  return exerciseGuide.data.filter(exercise=>{
    if(exerciseGuide.body&&exercise.bodyPart!==exerciseGuide.body)return false;
    if(exerciseGuide.equipment&&exercise.equipment!==exerciseGuide.equipment)return false;
    if(!terms.length)return true;
    const haystack=guideNorm([exercise.name,exercise.bodyPart,exercise.target,exercise.equipment,exercise.muscleGroup,...exercise.secondaryMuscles].join(' '));
    return terms.every(term=>haystack.includes(term));
  }).slice(0,40);
}
function renderExerciseGuide(){
  const overlay=document.getElementById('exercise-guide-modal');if(!overlay)return;
  if(exerciseGuide.loading&&!exerciseGuide.data){overlay.innerHTML=`<div class="modal-sheet"><div class="modal-handle"></div><div class="empty">Loading exercise guide…</div></div>`;return;}
  if(exerciseGuide.error){overlay.innerHTML=`<div class="modal-sheet"><div class="modal-handle"></div><div class="modal-title">Exercise Guide</div><div class="empty">${h(exerciseGuide.error)}</div><button class="scan-btn secondary" onclick="closeExerciseGuide()">Close</button></div>`;return;}
  if(exerciseGuide.selected){
    const exercise=exerciseGuide.selected,lang=exerciseGuide.lang,steps=exercise.steps[lang]?.length?exercise.steps[lang]:[exercise.instructions[lang]];
    overlay.innerHTML=`<div class="modal-sheet"><div class="modal-handle"></div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px"><button onclick="exerciseGuide.selected=null;renderExerciseGuide()" style="color:var(--accent);font-weight:700">← Results</button><button onclick="closeExerciseGuide()" aria-label="Close exercise guide" style="font-size:20px">×</button></div>
      <div class="modal-title">${h(exercise.name)}</div>
      <div style="margin:8px 0 14px"><span class="guide-chip">${h(exercise.bodyPart)}</span><span class="guide-chip">${h(exercise.target)}</span><span class="guide-chip">${h(exercise.equipment)}</span></div>
      <div class="card" style="padding:12px;margin-bottom:12px"><div style="font-size:11px;color:var(--text3);text-transform:uppercase;font-weight:700;margin-bottom:5px">Muscles involved</div><div style="font-size:13px;color:var(--text2)">Primary: ${h(exercise.target)} · Supporting: ${h([exercise.muscleGroup,...exercise.secondaryMuscles].filter(Boolean).join(', '))}</div></div>
      <div style="display:flex;gap:6px;margin-bottom:10px"><button class="wpill ${lang==='en'?'active':''}" onclick="exerciseGuide.lang='en';renderExerciseGuide()">English</button><button class="wpill ${lang==='es'?'active':''}" onclick="exerciseGuide.lang='es';renderExerciseGuide()">Español</button></div>
      <div>${steps.map((step,index)=>`<div class="guide-step"><span class="guide-step-num">${index+1}</span><span>${h(step)}</span></div>`).join('')}</div>
      ${exerciseGuide.action?.type==='replace'?`<button class="scan-btn" onclick="replaceActiveExercise(${Number(exerciseGuide.action.exerciseIndex)},'${exercise.id}')">Replace workout exercise</button>`:`<button class="scan-btn" onclick="addGuideExerciseToRoutine('${exercise.id}')">+ Add to ${h(activeCustomRoutine()?.name||'current workout')}</button>`}
      <div style="font-size:10px;color:var(--text3);margin-top:16px;text-align:center">Exercise text: hasaneyldrm/exercises-dataset · MIT License · Media intentionally excluded</div>
    </div>`;return;
  }
  const data=exerciseGuide.data||[],results=exerciseGuideResults(),bodies=[...new Set(data.map(x=>x.bodyPart))].sort(),equipment=[...new Set(data.map(x=>x.equipment))].sort();
  overlay.innerHTML=`<div class="modal-sheet"><div class="modal-handle"></div>
    <div style="display:flex;align-items:center;justify-content:space-between"><div><div class="modal-title">Exercise Guide</div><div class="modal-sub">Search 1,324 movements and open step-by-step instructions</div></div><button onclick="closeExerciseGuide()" aria-label="Close exercise guide" style="font-size:22px">×</button></div>
    <div class="guide-toolbar"><input class="guide-input" aria-label="Search exercises" placeholder="Search exercise, muscle, or equipment" value="${h(exerciseGuide.query)}" oninput="updateExerciseGuide('query',this.value)">
      <select class="guide-select" aria-label="Filter by body part" onchange="updateExerciseGuide('body',this.value)"><option value="">All body parts</option>${bodies.map(value=>`<option value="${h(value)}" ${exerciseGuide.body===value?'selected':''}>${h(value)}</option>`).join('')}</select>
      <select class="guide-select" aria-label="Filter by equipment" onchange="updateExerciseGuide('equipment',this.value)"><option value="">All equipment</option>${equipment.map(value=>`<option value="${h(value)}" ${exerciseGuide.equipment===value?'selected':''}>${h(value)}</option>`).join('')}</select></div>
    <div style="font-size:12px;color:var(--text3);margin-bottom:8px">${results.length}${results.length===40?' first':''} result${results.length===1?'':'s'}</div>
    <div class="guide-list">${results.length?results.map(exercise=>`<button class="guide-item" onclick="selectExerciseGuide('${exercise.id}')"><div class="guide-item-name">${h(exercise.name)}</div><div class="guide-item-meta">${h(exercise.bodyPart)} · ${h(exercise.target)} · ${h(exercise.equipment)}</div></button>`).join(''):'<div class="empty">No matching exercises</div>'}</div>
    <div style="font-size:10px;color:var(--text3);margin-top:14px;text-align:center">Text dataset used under MIT License. Images and GIFs are not included.</div>
  </div>`;
}
