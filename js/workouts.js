function rWork(){
  const c=C();
  if(!S.activePhase)S.activePhase='fase1';
  const phases=[
    {key:'fase1',label:i('p1'),sub:i('p1s'),color:c.r,obj:i('p1o')},
    {key:'fase2',label:i('p2'),sub:i('p2s'),color:c.a,obj:i('p2o')},
    {key:'fase3',label:i('p3'),sub:i('p3s'),color:c.t,obj:i('p3o')},
  ];
  const cur=phases.find(p=>p.key===S.activePhase)||phases[0];
  const workouts=S.workouts[S.activePhase]||[];

  // Group rows by day section
  const sections=[];
  let curSection=null;
  workouts.forEach((w,i)=>{
    if(w.day){
      curSection={day:w.day,rows:[{...w,idx:i}]};
      sections.push(curSection);
    } else if(curSection){
      curSection.rows.push({...w,idx:i});
    }
  });

  document.getElementById('page-workout').innerHTML=`
    <button class="scan-btn secondary" onclick="openExerciseGuide()" style="margin-bottom:14px">Exercise Guide · 1,324 movements</button>
    <div class="sec-label">${i('sp')}</div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:16px">
      ${phases.map(p=>`
        <button onclick="S.activePhase='${p.key}';save();rWork()" style="padding:10px 6px;border-radius:12px;border:2px solid ${S.activePhase===p.key?p.color:'var(--border)'};background:${S.activePhase===p.key?p.color+'18':'var(--bg3)'};cursor:pointer;text-align:center;transition:all .15s">
          <div style="font-family:'Barlow Condensed',sans-serif;font-size:17px;font-weight:800;color:${S.activePhase===p.key?p.color:'var(--text2)'}">${p.label}</div>
          <div style="font-size:11px;font-weight:600;color:${S.activePhase===p.key?p.color:'var(--text3)'};margin-top:1px">${p.sub}</div>
        </button>`).join('')}
    </div>

    <div style="padding:10px 14px;border-radius:10px;background:${cur.color}14;border:1px solid ${cur.color}40;margin-bottom:14px;display:flex;align-items:center;gap:10px">
      <div style="width:8px;height:8px;border-radius:50%;background:${cur.color};flex-shrink:0"></div>
      <div style="font-size:13px;font-weight:600;color:${cur.color}">${cur.obj}</div>
    </div>

    ${sections.map(sec=>`
      <div class="card" style="margin-bottom:10px;border-top:3px solid ${cur.color}">
        <div style="font-family:'Barlow Condensed',sans-serif;font-size:18px;font-weight:800;color:${cur.color};margin-bottom:10px">${sec.day}</div>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th style="text-align:left;font-size:11px;color:var(--text3);font-weight:600;padding:0 0 8px;letter-spacing:.05em">${i('ex')}</th>
              <th style="text-align:center;font-size:11px;color:var(--text3);font-weight:600;padding:0 0 8px;width:72px;letter-spacing:.05em">${i('rp')}</th>
              <th style="text-align:left;font-size:11px;color:var(--text3);font-weight:600;padding:0 0 8px;width:90px;letter-spacing:.05em">${i('nt')}</th>
            </tr>
          </thead>
          <tbody>
            ${sec.rows.map(r=>`<tr style="border-top:1px solid var(--border)">
              <td style="padding:8px 4px 8px 0">
                <input aria-label="Ejercicios" style="font-size:14px;font-weight:500;color:var(--text);width:100%;background:transparent;border:none;outline:none;font-family:'DM Sans',sans-serif" value="${h(r.exercises)}" oninput="S.workouts['${S.activePhase}'][${r.idx}].exercises=this.value;save()">
                <button onclick="openExerciseGuide(decodeURIComponent('${enc(r.exercises)}'))" style="font-size:11px;color:var(--accent);font-weight:700;margin-top:5px">View exercise guide</button>
              </td>
              <td style="padding:8px 4px;text-align:center">
                <input aria-label="Series y repeticiones" style="font-size:13px;font-weight:700;color:${cur.color};width:100%;background:transparent;border:none;outline:none;text-align:center;font-family:'Barlow Condensed',sans-serif" value="${h(r.reps)}" oninput="S.workouts['${S.activePhase}'][${r.idx}].reps=this.value;save()">
              </td>
              <td style="padding:8px 0 8px 4px">
                <input aria-label="Notas del ejercicio" style="font-size:12px;color:var(--text3);width:100%;background:transparent;border:none;outline:none;font-family:'DM Sans',sans-serif" value="${h(r.notes)}" placeholder="notes..." oninput="S.workouts['${S.activePhase}'][${r.idx}].notes=this.value;save()">
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>`).join('')}
    <button class="add-btn" onclick="S.workouts['${S.activePhase}'].push({day:i('nd'),exercises:'',reps:'3x10',notes:''});save();rWork()">${i('ae')}</button>
  `;
}
