import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*)<\/script>/)?.[1]||'';
const exerciseData=JSON.parse(readFileSync(new URL('../data/exercises.min.json',import.meta.url),'utf8'));
const exerciseLicense=readFileSync(new URL('../data/EXERCISES-LICENSE.txt',import.meta.url),'utf8');

test('inline JavaScript parses',()=>assert.doesNotThrow(()=>new Function(script)));
test('document has one clock and balanced primary structure',()=>{
  assert.equal((html.match(/id="cl-t"/g)||[]).length,1);
  assert.equal((html.match(/id="cl-d"/g)||[]).length,1);
  assert.equal((html.match(/<header\b/g)||[]).length,(html.match(/<\/header>/g)||[]).length);
  assert.equal((html.match(/<nav\b/g)||[]).length,(html.match(/<\/nav>/g)||[]).length);
});
test('accessibility safeguards are present',()=>{
  assert.doesNotMatch(html,/user-scalable=no|maximum-scale=1/);
  assert.match(html,/focus-visible/);
  assert.equal((html.match(/class="nav-btn/g)||[]).length,(html.match(/class="nav-btn[^>]*aria-label=/g)||[]).length);
});
test('browser-only secrets and broken AI calls are absent',()=>{
  assert.doesNotMatch(html,/api\.anthropic\.com|claude-sonnet|swIXJ6/);
  assert.match(html,/USDA_KEY='DEMO_KEY'/);
});
test('product entry is lightweight and manual',()=>{
  assert.doesNotMatch(html,/Tesseract|tesseract\.js|analyzeNutritionLabel|cam-input|capture="environment"/);
  assert.match(html,/＋ Producto/);
  assert.match(html,/Guardar en mi librería \+ Agregar a comida/);
});
test('USDA nutrients use stable identifiers and persist',()=>{
  for(const id of ['1008','1003','1005','1004'])assert.match(html,new RegExp(id));
  assert.match(html,/S\.userLibrary\[nm\]=entry/);
});
test('known rendering defects are absent',()=>{
  assert.doesNotMatch(html,/">><td/);
  assert.match(html,/const allIngr=.*S\.mealChecks/);
});
test('exercise guide dataset is complete and excludes restricted media',()=>{
  assert.equal(exerciseData.count,1324);
  assert.equal(exerciseData.exercises.length,1324);
  assert.match(exerciseLicense,/MIT License/);
  assert.match(exerciseLicense,/No images, GIFs/);
  for(const exercise of exerciseData.exercises){
    assert.ok(exercise.id&&exercise.name&&exercise.bodyPart&&exercise.equipment&&exercise.target);
    assert.ok(exercise.instructions.en&&exercise.instructions.es);
    assert.ok(exercise.steps.en.length&&exercise.steps.es.length);
    assert.equal('image' in exercise,false);
    assert.equal('gif_url' in exercise,false);
  }
});
test('gym exposes searchable bilingual exercise details',()=>{
  assert.match(html,/Exercise Guide · 1,324 movements/);
  assert.match(script,/function openExerciseGuide/);
  assert.match(script,/function exerciseGuideResults/);
  assert.match(script,/exerciseGuide\.lang='es'/);
  assert.match(script,/Media intentionally excluded/);
});
