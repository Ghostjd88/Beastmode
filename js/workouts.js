const workoutId=prefix=>`${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const workoutDateKey=()=>nowGMT4().toISOString().slice(0,10);
function groupWorkoutRows(rows){
  const sections=[];let current=null;
  rows.forEach((row,index)=>{if(row.day){current={day:row.day,rows:[{...row,idx:index}]};sections.push(current)}else if(current)current.rows.push({...row,idx:index});else{current={day:'Workout',rows:[{...row,idx:index}]};sections.push(current)}});
  return sections;
}
function activeCustomRoutine(){return(S.customRoutines||[]).find(routine=>routine.id===S.activeRoutineId)||null}
function workoutContext(){
  const custom=activeCustomRoutine(),colors={fase1:C().r,fase2:C().a,fase3:C().t};
  if(custom){const rows=custom.exercises.map((exercise,index)=>({day:index===0?custom.name:'',exercises:exercise.name,reps:exercise.reps,notes:exercise.notes,idx:index,id:exercise.id}));return{type:'custom',name:custom.name,color:'#7c5cfc',rows,sections:rows.length?groupWorkoutRows(rows):[]}}
  const phase=S.activePhase||'fase1',names={fase1:i('p1'),fase2:i('p2'),fase3:i('p3')},rows=S.workouts[phase]||[];
  return{type:'phase',name:names[phase],color:colors[phase],rows,sections:groupWorkoutRows(rows)};
}
function selectWorkoutRoutine(value){
  if(value.startsWith('phase:')){S.activeRoutineId='';S.activePhase=value.slice(6)}else S.activeRoutineId=value;
  save();rWork();
}
function openRoutineModal(){
  document.getElementById('routine-modal')?.remove();const modal=document.createElement('div');modal.id='routine-modal';modal.className='modal-overlay';modal.onclick=event=>{if(event.target===modal)modal.remove()};
  modal.innerHTML=`<div class="modal-sheet"><div class="modal-handle"></div><div class="modal-title">Create custom routine</div><div class="modal-sub">Build a reusable workout and add movements directly from the Exercise Guide.</div><input class="scan-field" id="routine-name" aria-label="Routine name" maxlength="120" placeholder="Example: Push Day"><button class="scan-btn" onclick="createRoutine()">Create routine</button><button class="scan-btn secondary" onclick="document.getElementById('routine-modal').remove()">Cancel</button></div>`;document.body.appendChild(modal);document.getElementById('routine-name').focus();
}
function createRoutine(){
  const input=document.getElementById('routine-name'),name=input.value.trim();if(!name){input.setAttribute('aria-invalid','true');toast('Enter a routine name');return}
  const routine={id:workoutId('routine'),name,exercises:[]};S.customRoutines.push(routine);S.activeRoutineId=routine.id;save();document.getElementById('routine-modal')?.remove();rWork();toast('Custom routine created ✓');
}
function renameActiveRoutine(value){const routine=activeCustomRoutine();if(!routine)return;routine.name=value.slice(0,120);save()}
function deleteActiveRoutine(){const routine=activeCustomRoutine();if(!routine||!confirm(`Delete ${routine.name}? Workout history will be kept.`))return;S.customRoutines=S.customRoutines.filter(item=>item.id!==routine.id);S.activeRoutineId='';save();rWork();toast('Routine deleted')}
function updateRoutineRow(index,field,value){
  const routine=activeCustomRoutine();if(routine){const map={exercises:'name',reps:'reps',notes:'notes'};routine.exercises[index][map[field]]=value}else S.workouts[S.activePhase][index][field]=value;
  save();
}
function removeRoutineRow(index){const routine=activeCustomRoutine();if(routine)routine.exercises.splice(index,1);else{const rows=S.workouts[S.activePhase],day=rows[index]?.day||'';rows.splice(index,1);if(day&&rows[index]&&!rows[index].day)rows[index].day=day}save();rWork()}
function addBlankExercise(){const routine=activeCustomRoutine();if(routine)routine.exercises.push({id:'',name:'New exercise',reps:'3x10',notes:''});else S.workouts[S.activePhase].push({day:i('nd'),exercises:'New exercise',reps:'3x10',notes:''});save();rWork()}
function addGuideExerciseToRoutine(id){
  const exercise=exerciseGuide.data?.find(item=>item.id===String(id));if(!exercise)return;
  const routine=activeCustomRoutine();
  if(routine){if(routine.exercises.some(item=>guideNorm(item.name)===guideNorm(exercise.name))){toast('Exercise is already in this routine');return}routine.exercises.push({id:exercise.id,name:exercise.name,reps:'3x10',notes:exercise.target})}
  else{const rows=S.workouts[S.activePhase];if(rows.some(item=>guideNorm(item.exercises)===guideNorm(exercise.name))){toast('Exercise is already in this phase');return}rows.push({day:'',exercises:exercise.name,reps:'3x10',notes:exercise.target})}
  save();closeExerciseGuide();rWork();toast(`Added ${exercise.name} ✓`);
}
function previousExercisePerformance(name){
  for(const log of [...(S.workoutLogs||[])].reverse()){const exercise=log.exercises.find(item=>guideNorm(item.name)===guideNorm(name));if(exercise){const done=exercise.sets.filter(set=>set.done);if(done.length)return{date:log.date,sets:done,max:Math.max(...done.map(set=>Number(set.weight)||0)),reps:done.map(set=>set.reps).join('/')}}}return null;
}
function progressionRecommendation(name,target){
  const previous=previousExercisePerformance(name);if(!previous)return'First logged session — choose a comfortable starting load.';
  const log=[...(S.workoutLogs||[])].reverse().flatMap(item=>item.exercises).find(item=>guideNorm(item.name)===guideNorm(name)),done=log?.sets.filter(set=>set.done)||[],range=String(target).match(/(\d+)\s*x\s*(\d+)(?:-(\d+))?/i),required=Number(range?.[1]||1),top=Number(range?.[3]||range?.[2]||0),allHit=top&&done.length>=required&&done.every(set=>Number(set.reps)>=top),weight=previous.max;
  return allHit&&weight?`Progressive overload: try ${weight+5} lb next time.`:weight?`Repeat ${weight} lb and improve form or reps.`:'Build consistency before increasing load.';
}
function startWorkout(sectionIndex){
  const context=workoutContext(),section=context.sections[sectionIndex];if(!section||!section.rows.length)return;
  if(S.activeWorkout&&!confirm('Replace the workout currently in progress?'))return;
  S.activeWorkout={id:workoutId('session'),date:workoutDateKey(),startedAt:new Date().toISOString(),completedAt:'',routineName:context.name,day:section.day,volume:0,exercises:section.rows.filter(row=>row.exercises.trim()).map(row=>{const count=Math.min(10,Math.max(1,Number.parseInt(String(row.reps).match(/\d+/)?.[0],10)||3)),previous=previousExercisePerformance(row.exercises);return{name:row.exercises,target:row.reps,notes:row.notes,sets:Array.from({length:count},()=>({weight:previous?.max||0,reps:0,done:false}))}})};
  save();rWork();document.getElementById('active-workout')?.scrollIntoView({behavior:'smooth',block:'start'});toast('Workout started');
}
function updateActiveSet(exerciseIndex,setIndex,key,value){const set=S.activeWorkout?.exercises?.[exerciseIndex]?.sets?.[setIndex];if(!set)return;set[key]=key==='done'?Boolean(value):Math.max(0,Number(value)||0);save();if(key==='done')rWork()}
function addActiveSet(exerciseIndex){const exercise=S.activeWorkout?.exercises?.[exerciseIndex];if(!exercise)return;const last=exercise.sets.at(-1)||{};exercise.sets.push({weight:Number(last.weight)||0,reps:0,done:false});save();rWork()}
function cancelActiveWorkout(){if(!S.activeWorkout||!confirm('Discard this workout in progress?'))return;S.activeWorkout=null;save();rWork()}
function finishWorkout(){
  const workout=S.activeWorkout;if(!workout)return;const completedSets=workout.exercises.flatMap(exercise=>exercise.sets).filter(set=>set.done);if(!completedSets.length){toast('Complete at least one set before finishing');return}
  workout.completedAt=new Date().toISOString();workout.volume=workout.exercises.reduce((total,exercise)=>total+exercise.sets.filter(set=>set.done).reduce((sum,set)=>sum+(Number(set.weight)||0)*(Number(set.reps)||0),0),0);
  S.workoutLogs.push(workout);S.workoutLogs=S.workoutLogs.slice(-500);const dayNumber=Number(workout.day.match(/Day\s+(\d+)/i)?.[1]),week=S.activeProgressWeek+1,slot=dayNumber>=1&&dayNumber<=6?`Day ${dayNumber}`:SS.find(day=>!S.checklist[`${day}_w${week}`]);if(slot)S.checklist[`${slot}_w${week}`]=true;S.activeWorkout=null;save();rWork();toast(`Workout saved · ${Math.round(workout.volume).toLocaleString()} lb volume ✓`);
}
function activeWorkoutHTML(){
  const workout=S.activeWorkout;if(!workout)return'';
  return`<section class="card active-session" id="active-workout"><div class="session-head"><div><div class="sec-label" style="margin:0">Workout in progress</div><div class="session-title">${h(workout.day||workout.routineName)}</div></div><button class="danger-link" onclick="cancelActiveWorkout()">Discard</button></div>${workout.exercises.map((exercise,exerciseIndex)=>{const previous=previousExercisePerformance(exercise.name);return`<div class="session-exercise"><div class="session-exercise-head"><div><strong>${h(exercise.name)}</strong><div class="session-meta">Target ${h(exercise.target)}${previous?` · Previous ${previous.max} lb · ${h(previous.reps)} reps`:''}</div></div><button onclick="openExerciseGuide(decodeURIComponent('${enc(exercise.name)}'))">Guide</button></div><div class="progression-tip">${h(progressionRecommendation(exercise.name,exercise.target))}</div><div class="set-grid set-grid-head"><span>Set</span><span>Weight lb</span><span>Reps</span><span>Done</span></div>${exercise.sets.map((set,setIndex)=>`<div class="set-grid"><span>${setIndex+1}</span><input aria-label="${h(exercise.name)} set ${setIndex+1} weight" type="number" min="0" max="5000" inputmode="decimal" value="${set.weight||''}" oninput="updateActiveSet(${exerciseIndex},${setIndex},'weight',this.value)"><input aria-label="${h(exercise.name)} set ${setIndex+1} reps" type="number" min="0" max="1000" inputmode="numeric" value="${set.reps||''}" oninput="updateActiveSet(${exerciseIndex},${setIndex},'reps',this.value)"><input aria-label="Complete ${h(exercise.name)} set ${setIndex+1}" type="checkbox" ${set.done?'checked':''} onchange="updateActiveSet(${exerciseIndex},${setIndex},'done',this.checked)"></div>`).join('')}<button class="mini-action" onclick="addActiveSet(${exerciseIndex})">+ Add set</button></div>`}).join('')}<button class="scan-btn" onclick="finishWorkout()">Finish and save workout</button></section>`;
}
function workoutHistoryHTML(){
  const logs=[...(S.workoutLogs||[])].reverse().slice(0,5);if(!logs.length)return'<div class="empty">Your completed sessions will appear here.</div>';
  return logs.map(log=>`<div class="history-row"><div><strong>${h(log.day||log.routineName)}</strong><div>${h(log.date)} · ${log.exercises.length} exercises</div></div><span>${Math.round(log.volume||0).toLocaleString()} lb</span></div>`).join('');
}
function rWork(){
  const context=workoutContext(),custom=activeCustomRoutine(),selection=custom?.id||`phase:${S.activePhase||'fase1'}`;
  document.getElementById('page-workout').innerHTML=`${activeWorkoutHTML()}<div class="workout-actions"><button class="scan-btn secondary" onclick="openExerciseGuide()">Exercise Guide · 1,324</button><button class="scan-btn secondary" onclick="openRoutineModal()">+ Custom routine</button></div><div class="sec-label">Workout routine</div><div class="routine-toolbar"><select aria-label="Select workout routine" onchange="selectWorkoutRoutine(this.value)"><option value="phase:fase1" ${selection==='phase:fase1'?'selected':''}>Phase 1 · Reactivation</option><option value="phase:fase2" ${selection==='phase:fase2'?'selected':''}>Phase 2 · Main Program</option><option value="phase:fase3" ${selection==='phase:fase3'?'selected':''}>Phase 3 · Progressive Overload</option>${S.customRoutines.map(routine=>`<option value="${h(routine.id)}" ${selection===routine.id?'selected':''}>Custom · ${h(routine.name)}</option>`).join('')}</select>${custom?`<input aria-label="Custom routine name" value="${h(custom.name)}" maxlength="120" oninput="renameActiveRoutine(this.value)"><button class="danger-link" onclick="deleteActiveRoutine()">Delete</button>`:''}</div>${context.sections.length?context.sections.map((section,sectionIndex)=>`<section class="card routine-card" style="border-top-color:${context.color}"><div class="routine-card-head"><div class="session-title" style="color:${context.color}">${h(section.day)}</div><button class="start-workout-btn" onclick="startWorkout(${sectionIndex})">Start workout</button></div><div class="routine-table"><div class="routine-row routine-row-head"><span>Exercise</span><span>Sets × reps</span><span>Notes</span><span></span></div>${section.rows.map(row=>{const previous=previousExercisePerformance(row.exercises);return`<div class="routine-row"><div><input aria-label="Exercise name" value="${h(row.exercises)}" oninput="updateRoutineRow(${row.idx},'exercises',this.value)"><button class="guide-link" onclick="openExerciseGuide(decodeURIComponent('${enc(row.exercises)}'))">View guide${previous?` · last ${previous.max} lb`:''}</button></div><input aria-label="Sets and repetitions" value="${h(row.reps)}" oninput="updateRoutineRow(${row.idx},'reps',this.value)"><input aria-label="Exercise notes" value="${h(row.notes)}" placeholder="notes" oninput="updateRoutineRow(${row.idx},'notes',this.value)"><button class="row-remove" aria-label="Remove ${h(row.exercises)}" onclick="removeRoutineRow(${row.idx})">×</button></div>`}).join('')}</div></section>`).join(''):'<div class="empty card">This routine is empty. Add an exercise from the guide or create a blank row.</div>'}<button class="add-btn" onclick="addBlankExercise()">+ Add blank exercise</button><div class="sec-label" style="margin-top:18px">Recent workout history</div><div class="card">${workoutHistoryHTML()}</div>`;
}
