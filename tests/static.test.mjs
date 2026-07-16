import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=path=>readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html'),css=read('css/styles.css');
const modulePaths=['js/storage.js','js/app.js','js/workouts.js','js/exercises.js','js/nutrition.js','js/progress.js','js/bootstrap.js','js/browser-check.js'];
const modules=Object.fromEntries(modulePaths.map(path=>[path,read(path)]));
const script=modulePaths.map(path=>modules[path]).join('\n');
const exerciseData=JSON.parse(read('data/exercises.min.json'));
const exerciseLicense=read('data/EXERCISES-LICENSE.txt');

test('JavaScript modules parse',()=>modulePaths.forEach(path=>assert.doesNotThrow(()=>new Function(modules[path]),path)));
test('index uses maintainable external modules',()=>{
  assert.doesNotMatch(html,/<style>|<script>(?!\s*<\/script>)/);
  assert.match(html,/\.\/css\/styles\.css/);
  for(const path of modulePaths)assert.match(html,new RegExp(path.replace(/[./]/g,'\\$&')));
  assert.ok(css.length>10000);
});
test('document has one clock and balanced primary structure',()=>{
  assert.equal((html.match(/id="cl-t"/g)||[]).length,1);
  assert.equal((html.match(/id="cl-d"/g)||[]).length,1);
  assert.equal((html.match(/<header\b/g)||[]).length,(html.match(/<\/header>/g)||[]).length);
  assert.equal((html.match(/<nav\b/g)||[]).length,(html.match(/<\/nav>/g)||[]).length);
});
test('accessibility safeguards are present',()=>{
  assert.doesNotMatch(html,/user-scalable=no|maximum-scale=1/);
  assert.match(css,/focus-visible/);
  assert.equal((html.match(/class="nav-btn/g)||[]).length,(html.match(/class="nav-btn[^>]*aria-label=/g)||[]).length);
  assert.match(script,/aria-invalid/);
});
test('browser-only secrets and broken AI calls are absent',()=>{
  assert.doesNotMatch(script,/api\.anthropic\.com|claude-sonnet|swIXJ6/);
  assert.match(modules['js/nutrition.js'],/USDA_KEY='DEMO_KEY'/);
});
test('versioned storage, migrations and capacity protection are present',()=>{
  const storage=modules['js/storage.js'];
  assert.match(storage,/BM_SCHEMA_VERSION=7/);
  assert.match(storage,/BM_LEGACY_KEYS=\['bm_v6','bm_v5'\]/);
  assert.match(storage,/function migrateState/);
  assert.match(storage,/QuotaExceededError/);
  assert.match(storage,/BM_WARNING_RATIO=\.75/);
  assert.match(storage,/BM_AUTO_BACKUP_KEY/);
});
test('state and backups are validated',()=>{
  const api=new Function(modules['js/storage.js']+';return{sanitizeState,createBackupEnvelope,parseBackupEnvelope,stateFingerprint,validateBodyValue};')();
  const defaults={workouts:{fase1:[],fase2:[],fase3:[]},meals:[{name:'Meal',ingredients:[]}],checklist:{},mealChecks:{},mealIngredients:{},progress:Array.from({length:8},(_,index)=>({week:index+1,weight:'',waist:'',energy:'',strength:'',notes:''})),habits:{},habitNames:['Train'],activeMealDay:0,activeProgressWeek:0,theme:'light',userLibrary:{},activePhase:'fase1',userName:'',body:{weight:'',goalWeight:'',heightFt:'',heightIn:'',age:'',sex:'male',activity:'moderate',kcalGoalMode:'auto',kcalGoalPick:'',kcalGoalManual:''}};
  const dirty={...defaults,body:{...defaults.body,age:'4',heightIn:'99'},progress:[{weight:'-2',waist:'900',energy:'9'}],meals:[{name:'',ingredients:['rice','rice']}],theme:'unknown'};
  const clean=api.sanitizeState(dirty,defaults);
  assert.equal(clean.body.age,'');assert.equal(clean.body.heightIn,'');assert.equal(clean.progress.length,8);assert.deepEqual(clean.meals[0].ingredients,['rice']);assert.equal(clean.theme,'light');
  const backup=api.createBackupEnvelope(clean),restored=api.parseBackupEnvelope(JSON.stringify(backup),defaults);
  assert.equal(api.stateFingerprint(restored),api.stateFingerprint(clean));
  backup.checksum='broken';assert.throws(()=>api.parseBackupEnvelope(JSON.stringify(backup),defaults));
  assert.equal(api.validateBodyValue('age','12').valid,false);assert.equal(api.validateBodyValue('age','40').valid,true);
});
test('backup workflow validates, detects duplicates and supports recovery',()=>{
  const storage=modules['js/storage.js'];
  assert.match(storage,/checksum/);assert.match(storage,/Este respaldo ya está cargado/);assert.match(storage,/BM_ROLLBACK_KEY/);assert.match(storage,/restoreLastBackup/);assert.match(storage,/confirm\(`/);
});
test('product and progress entries have numeric safeguards',()=>{
  assert.match(modules['js/nutrition.js'],/Nutrition values must be valid non-negative numbers/);
  assert.match(modules['js/nutrition.js'],/already exists\. Replace it/);
  assert.match(modules['js/progress.js'],/updateProgressValue/);
  assert.match(modules['js/app.js'],/commitBodyField/);
});
test('exercise guide dataset is complete and excludes restricted media',()=>{
  assert.equal(exerciseData.count,1324);assert.equal(exerciseData.exercises.length,1324);assert.match(exerciseLicense,/MIT License/);assert.match(exerciseLicense,/No images, GIFs/);
  for(const exercise of exerciseData.exercises){assert.ok(exercise.id&&exercise.name&&exercise.bodyPart&&exercise.equipment&&exercise.target);assert.ok(exercise.instructions.en&&exercise.instructions.es);assert.ok(exercise.steps.en.length&&exercise.steps.es.length);assert.equal('image' in exercise,false);assert.equal('gif_url' in exercise,false)}
});
test('gym exposes searchable bilingual exercise details',()=>{
  assert.match(modules['js/workouts.js'],/Exercise Guide · 1,324 movements/);assert.match(modules['js/exercises.js'],/function openExerciseGuide/);assert.match(modules['js/exercises.js'],/function exerciseGuideResults/);assert.match(modules['js/exercises.js'],/exerciseGuide\.lang='es'/);assert.match(modules['js/exercises.js'],/Media intentionally excluded/);
});
test('browser self-test covers core application surfaces',()=>{
  const selfTest=modules['js/browser-check.js'];
  for(const label of ['Versioned storage write','Backup validation','Workout rendering','Nutrition rendering','Progress validation','Exercise dataset'])assert.match(selfTest,new RegExp(label));
  assert.match(selfTest,/self-test-report/);
});
