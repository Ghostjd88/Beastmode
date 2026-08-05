function compactRoutineCards(){
  const compact=matchMedia('(max-width:560px)').matches;
  document.querySelectorAll('#page-workout .routine-card').forEach(card=>{
    const table=card.querySelector('.routine-table'),head=card.querySelector('.routine-card-head');
    if(!table||!head)return;
    let toggle=head.querySelector('.routine-toggle');
    if(!toggle){toggle=document.createElement('button');toggle.className='routine-toggle';toggle.type='button';toggle.addEventListener('click',()=>{const open=table.hidden;table.hidden=!open;toggle.setAttribute('aria-expanded',String(open));toggle.textContent=open?'Hide exercises':'View exercises'});head.insertBefore(toggle,head.querySelector('.start-workout-btn'))}
    table.hidden=compact;
    toggle.hidden=!compact;
    toggle.setAttribute('aria-expanded',String(!table.hidden));
    toggle.textContent=table.hidden?'View exercises':'Hide exercises';
  });
}
{
  const renderWorkout=window.rWork;
  window.rWork=function(...args){const result=renderWorkout.apply(this,args);requestAnimationFrame(compactRoutineCards);return result};
  matchMedia('(max-width:560px)').addEventListener?.('change',()=>{if(document.getElementById('page-workout')?.classList.contains('active'))rWork()});
}
