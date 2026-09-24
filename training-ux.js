(() => {
'use strict';
const trainer=window.ChesstochessTrainer,library=window.ChessPuzzleLibrary;
if(!trainer||!library)return;
const panel=document.querySelector('.panel');if(!panel)return;
const motifs=[...new Set(library.all.flatMap(p=>p.motifs))].sort();
const difficulties=[...new Set(library.all.map(p=>p.difficulty))];
const box=document.createElement('div');box.className='training-controls';box.innerHTML=`<div class="training-control-head"><span>TRAINING PLAN</span><b id="trainingMatchCount">${library.all.length} puzzles</b></div><label>Difficulty<select id="trainingDifficulty"><option value="">All levels</option>${difficulties.map(x=>`<option>${x}</option>`).join('')}</select></label><label>Motif<select id="trainingMotif"><option value="">All motifs</option>${motifs.map(x=>`<option value="${x}">${x.replace(/-/g,' ')}</option>`).join('')}</select></label><button class="ghost-btn" id="trainingResetFilters">Clear filters</button><div class="training-session-summary"><span>THIS SESSION</span><div><b id="trainingSessionSolved">0</b><small>solved</small></div><div><b id="trainingSessionAttempts">0</b><small>attempts</small></div><div><b id="trainingSessionAccuracy">—</b><small>accuracy</small></div></div>`;
panel.insertBefore(box,panel.querySelector('.position-card'));
const diff=box.querySelector('#trainingDifficulty'),motif=box.querySelector('#trainingMotif'),count=box.querySelector('#trainingMatchCount');
let session={solved:0,attempts:0};
function apply(){const pool=library.filter({difficulty:diff.value||undefined,motif:motif.value||undefined});count.textContent=pool.length+' puzzle'+(pool.length===1?'':'s');if(!pool.length){count.textContent='No matches';return}trainer.setPool(pool)}
diff.addEventListener('change',apply);motif.addEventListener('change',apply);box.querySelector('#trainingResetFilters').addEventListener('click',()=>{diff.value='';motif.value='';apply()});
function renderSession(){box.querySelector('#trainingSessionSolved').textContent=session.solved;box.querySelector('#trainingSessionAttempts').textContent=session.attempts;box.querySelector('#trainingSessionAccuracy').textContent=session.attempts?Math.round(session.solved/session.attempts*100)+'%':'—'}
const feedback=document.getElementById('feedback');if(feedback)new MutationObserver(()=>{if(feedback.hidden)return;const title=document.getElementById('feedbackTitle')?.textContent||'';if(title.startsWith('Solved —')){session.solved++;session.attempts++;renderSession()}else if(/try again|not quite|incorrect/i.test(title)){session.attempts++;renderSession()}}).observe(feedback,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden']});
document.addEventListener('chesstochess:puzzle-loaded',e=>{const p=e.detail.puzzle;count.textContent=e.detail.poolSize+' puzzle'+(e.detail.poolSize===1?'':'s')+' · '+p.motifs.map(x=>x.replace(/-/g,' ')).join(', ')});
renderSession();
})();

// Phase 3 analysis is kept in its own module so the trainer and play runtime remain independently reversible.
(()=>{if(document.querySelector('script[data-analysis-foundation]'))return;const s=document.createElement('script');s.src='analysis-foundation.js';s.dataset.analysisFoundation='true';document.body.appendChild(s)})();