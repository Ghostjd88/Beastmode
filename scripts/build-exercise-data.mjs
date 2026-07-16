import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {dirname,resolve} from 'node:path';

const [source='../../exercises-source/data/exercises.json',target='data/exercises.min.json']=process.argv.slice(2);
const records=JSON.parse(readFileSync(resolve(source),'utf8'));
const exercises=records.map(({id,name,body_part,equipment,instructions,instruction_steps,muscle_group,secondary_muscles,target})=>({
  id,name,bodyPart:body_part,equipment,target,muscleGroup:muscle_group,secondaryMuscles:secondary_muscles,
  instructions:{en:instructions.en,es:instructions.es},
  steps:{en:instruction_steps.en,es:instruction_steps.es}
}));
const output={source:'hasaneyldrm/exercises-dataset',sourceCommit:'7455efae41b330c265e7cd4b78dfa848e7ce5ebd',license:'MIT; media excluded',count:exercises.length,exercises};
const path=resolve(target);
mkdirSync(dirname(path),{recursive:true});
writeFileSync(path,JSON.stringify(output));
