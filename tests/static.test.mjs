import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');
const script=html.match(/<script>([\s\S]*)<\/script>/)?.[1]||'';

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
test('local OCR is available with nutrition parsing',()=>{
  assert.match(html,/tesseract\.js@6\.0\.1/);
  assert.match(html,/function parseNutritionLabel/);
  assert.match(html,/eng\+spa/);
  assert.match(html,/protein\|prote/);
  assert.match(html,/total carbohydrate/);
  assert.match(html,/total fat/);
});
test('nutrition parser extracts English and Spanish labels',()=>{
  const ocrSource=script.match(/function ocrNumber[\s\S]*?(?=async function analyzeNutritionLabel)/)?.[0];
  assert.ok(ocrSource);
  const parse=new Function(`${ocrSource};return parseNutritionLabel`)();
  assert.deepEqual(parse('TEST OATS\nNutrition Facts\nServing size 40g\nCalories 150\nTotal Fat 3g\nTotal Carbohydrate 27g\nProtein 5g'),{name:'TEST OATS',serving:'40g',kcal:'150',protein:'5',carbs:'27',fat:'3'});
  assert.deepEqual(parse('AVENA\nDatos Nutricionales\nTamaño de porción 30 g\nCalorías 120\nGrasa Total 2 g\nCarbohidratos Totales 20 g\nProteína 4 g'),{name:'AVENA',serving:'30 g',kcal:'120',protein:'4',carbs:'20',fat:'2'});
});
test('USDA nutrients use stable identifiers and persist',()=>{
  for(const id of ['1008','1003','1005','1004'])assert.match(html,new RegExp(id));
  assert.match(html,/S\.userLibrary\[nm\]=entry/);
});
test('known rendering defects are absent',()=>{
  assert.doesNotMatch(html,/">><td/);
  assert.match(html,/const allIngr=.*S\.mealChecks/);
});
