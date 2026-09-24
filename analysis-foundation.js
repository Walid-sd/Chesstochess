(function(){
'use strict';
const KEY='chesstochess.analysis.latest.v1';
let session=null;
const now=()=>new Date().toISOString();
function isPlay(){return document.body.classList.contains('mode-play')}
function readFen(){try{return typeof window.boardFen==='function'?window.boardFen():null}catch(_){return null}}
function square(r,c){return 'abcdefgh'[c]+(8-r)}
function fresh(){return{id:'analysis-'+Date.now(),schemaVersion:1,startedAt:now(),completedAt:null,resultText:null,initialFen:readFen(),positions:[],moves:[],status:'recording'}}
function begin(){if(!isPlay())return;session=fresh();session.positions.push({ply:0,fen:session.initialFen,at:now()});persist();renderEntry()}
function persist(){if(!session)return;try{localStorage.setItem(KEY,JSON.stringify(session))}catch(_){}}
function latest(){if(session)return structuredClone(session);try{return JSON.parse(localStorage.getItem(KEY))}catch(_){return null}}
function recordMove(fr,fc,tr,tc,beforeFen){
 if(!isPlay())return;
 if(!session||session.status!=='recording')begin();
 if(!session)return;
 const afterFen=readFen();
 const promotion=afterFen&&beforeFen&&(/[18]$/.test(square(tr,tc)))?null:null;
 session.moves.push({ply:session.moves.length+1,uci:square(fr,fc)+square(tr,tc)+(promotion||''),from:square(fr,fc),to:square(tr,tc),beforeFen,afterFen,at:now()});
 session.positions.push({ply:session.moves.length,fen:afterFen,at:now()});
 persist();
}
function complete(text){if(!isPlay()||!session)return;session.completedAt=now();session.resultText=text||'';session.status='ready_for_analysis';session.finalFen=readFen();persist();renderEntry()}
function renderEntry(){
 const btn=document.getElementById('postGameAnalyzeBtn');if(!btn)return;
 const data=latest();
 btn.hidden=!(isPlay()&&data&&data.status==='ready_for_analysis'&&data.moves?.length);
 if(!btn.hidden)btn.textContent='Analyze completed game →';
}
function openReview(){
 const data=latest();if(!data||data.status!=='ready_for_analysis')return;
 const box=document.getElementById('analysisFoundationPanel');if(!box)return;
 box.hidden=false;
 document.getElementById('analysisGameResult').textContent=data.resultText||'Completed game';
 document.getElementById('analysisGameMeta').textContent=data.moves.length+' plies captured · '+data.positions.length+' reconstructable positions';
 document.getElementById('analysisGameStatus').textContent='Ready for Stockfish review';
 box.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function install(){
 const originalMove=window.makeMove;
 if(typeof originalMove==='function')window.makeMove=function(fr,fc,tr,tc){const before=readFen();const out=originalMove(fr,fc,tr,tc);recordMove(fr,fc,tr,tc,before);return out};
 const originalResult=window.showResult;
 if(typeof originalResult==='function')window.showResult=function(text){const out=originalResult(text);complete(text);return out};
 const beginFromPlay=()=>setTimeout(begin,0);
 document.getElementById('playModeBtn')?.addEventListener('click',beginFromPlay);
 document.getElementById('playNav')?.addEventListener('click',beginFromPlay);
 document.getElementById('newGameBtn')?.addEventListener('click',()=>{if(isPlay())setTimeout(begin,0)});
 document.querySelectorAll('#difficultyPicker button').forEach(b=>b.addEventListener('click',()=>{if(isPlay())setTimeout(begin,0)}));
 document.getElementById('postGameAnalyzeBtn')?.addEventListener('click',openReview);
 renderEntry();
}
window.ChesstochessAnalysis={latest,begin,complete,openReview};
document.addEventListener('DOMContentLoaded',install);
})();