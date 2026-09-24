(function(){
'use strict';
let gameStartedAt=null,lastRecordedGame=null,lastRecordedPuzzle=null;
const store=()=>window.ChesstochessPlayer;
function isPlay(){return document.body.classList.contains('mode-play')}
function difficulty(){const b=document.querySelector('#difficultyPicker button.selected');return b?.textContent?.trim().toLowerCase()||'medium'}
function moveList(){return [...document.querySelectorAll('#moves .move-row')].flatMap(row=>[...row.querySelectorAll('span')].slice(1).map(x=>x.textContent.trim())).filter(Boolean)}
function finalFen(){try{return typeof window.boardFen==='function'?window.boardFen():null}catch(_){return null}}
function resultFromText(text){const s=(text||'').toLowerCase();if(s.includes('white wins'))return'win';if(s.includes('black wins'))return'loss';if(s.includes('draw'))return'draw';return null}
function termination(text){const s=(text||'').toLowerCase();if(s.includes('checkmate'))return'checkmate';if(s.includes('stalemate'))return'stalemate';if(s.includes('50-move'))return'50_move';if(s.includes('threefold'))return'threefold';return'completed'}
function recordGameIfComplete(){if(!isPlay())return;const turn=document.getElementById('turnText');if(!turn?.parentElement?.classList.contains('result'))return;const result=resultFromText(turn.textContent);if(!result)return;const signature=turn.textContent+'|'+moveList().join(',');if(signature===lastRecordedGame)return;lastRecordedGame=signature;store()?.recordGame({startedAt:gameStartedAt,completedAt:new Date().toISOString(),result,difficulty:difficulty(),moves:moveList(),finalFen:finalFen(),termination:termination(turn.textContent)});gameStartedAt=null}
function parseNumber(text,label){const m=String(text||'').match(new RegExp(label+'[: ]+(\\d+)','i'));return m?Number(m[1]):0}
function recordPuzzleIfSolved(){if(isPlay())return;const title=document.getElementById('feedbackTitle')?.textContent||'';if(!title.startsWith('Solved —'))return;const p=window.ChesstochessActivePuzzle;const theme=p?.theme||document.getElementById('puzzleTheme')?.textContent||'puzzle';const body=document.getElementById('feedbackText')?.textContent||'';const signature=(p?.id||theme)+'|'+body;if(signature===lastRecordedPuzzle)return;lastRecordedPuzzle=signature;const score=(body.match(/Score:\s*(\d+)%/i)||[])[1];store()?.recordTraining({puzzleId:p?.id||theme.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''),motifs:p?.motifs||[theme],solved:true,wrongAttempts:parseNumber(body,'wrong attempt'),hints:parseNumber(body,'hint'),accuracy:score?Number(score):100})}
function syncPreference(){if(!isPlay())return;store()?.setPreference('botDifficulty',difficulty())}
document.addEventListener('DOMContentLoaded',()=>{
 const turn=document.getElementById('turnText'),feedback=document.getElementById('feedback');
 if(turn)new MutationObserver(recordGameIfComplete).observe(turn.parentElement,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['class']});
 if(feedback)new MutationObserver(recordPuzzleIfSolved).observe(feedback,{subtree:true,childList:true,characterData:true,attributes:true});
 document.getElementById('playModeBtn')?.addEventListener('click',()=>{gameStartedAt=new Date().toISOString();lastRecordedGame=null});
 document.getElementById('playNav')?.addEventListener('click',()=>{gameStartedAt=new Date().toISOString();lastRecordedGame=null});
 document.getElementById('newGameBtn')?.addEventListener('click',()=>{if(isPlay()){gameStartedAt=new Date().toISOString();lastRecordedGame=null}else lastRecordedPuzzle=null});
 document.querySelectorAll('#difficultyPicker button').forEach(b=>b.addEventListener('click',()=>setTimeout(syncPreference,0)));
 document.getElementById('flipBtn')?.addEventListener('click',()=>{const p=store()?.get()?.preferences;if(p)store()?.setPreference('boardFlipped',!p.boardFlipped)});
});
})();