(function(){
'use strict';
function repairBoard(){const board=document.getElementById('board');if(!board)return;board.style.pointerEvents='auto';board.removeAttribute('aria-disabled');board.querySelectorAll('.square').forEach(s=>s.style.pointerEvents='auto');if(!document.getElementById('homeScreen')?.hidden)return;if(board.children.length!==64&&typeof window.render==='function')window.render()}
function repairModeSoon(){requestAnimationFrame(()=>requestAnimationFrame(repairBoard))}
['playModeBtn','trainModeBtn','playNav','trainNav'].forEach(id=>document.getElementById(id)?.addEventListener('click',repairModeSoon));
const analyze=document.getElementById('analyzeBtn');if(analyze){analyze.addEventListener('click',()=>{const box=document.getElementById('engineBox'),value=document.getElementById('engineEval'),line=document.getElementById('engineLine');if(box)box.hidden=false;if(value)value.textContent='Starting engine…';if(line)line.textContent='Loading Stockfish and preparing the current board position.'},{capture:true})}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)repairBoard()});
window.addEventListener('pageshow',repairBoard);repairBoard();
window.ChesstochessReleaseGuard={repairBoard};
})();