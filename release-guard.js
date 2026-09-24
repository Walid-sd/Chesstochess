(function(){
'use strict';
let engineWatch=0;
function repairBoard(){const board=document.getElementById('board');if(!board)return;board.style.pointerEvents='auto';board.removeAttribute('aria-disabled');board.querySelectorAll('.square').forEach(s=>s.style.pointerEvents='auto');if(!document.getElementById('homeScreen')?.hidden)return;if(board.children.length!==64&&typeof window.render==='function')window.render()}
function repairModeSoon(){requestAnimationFrame(()=>requestAnimationFrame(repairBoard))}
['playModeBtn','trainModeBtn','playNav','trainNav'].forEach(id=>document.getElementById(id)?.addEventListener('click',repairModeSoon));
function startEngineWatch(){
 clearTimeout(engineWatch);
 const box=document.getElementById('engineBox'),value=document.getElementById('engineEval'),line=document.getElementById('engineLine');
 if(box)box.hidden=false;
 if(value)value.textContent='Starting engine…';
 if(line)line.textContent='Loading Stockfish and preparing the current board position.';
 engineWatch=setTimeout(()=>{
   if(value?.textContent==='Starting engine…'){
     value.textContent='Engine unavailable';
     if(line)line.textContent='Stockfish did not initialize within 12 seconds. Refresh and try again; the board and training session remain available.';
   }
 },12000);
}
const analyze=document.getElementById('analyzeBtn');if(analyze)analyze.addEventListener('click',startEngineWatch,{capture:true});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)repairBoard()});
window.addEventListener('pageshow',repairBoard);repairBoard();
window.ChesstochessReleaseGuard={repairBoard,startEngineWatch};
})();