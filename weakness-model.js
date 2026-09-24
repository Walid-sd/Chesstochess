(function(){
'use strict';
const KEY='chesstochess.weaknesses.v1',MAX_REPORTS=20;
const LABELS={'material-loss':'Material awareness','missed-capture':'Missed tactical captures','blunder':'Move safety','mistake':'Move precision','inaccuracy':'Positional precision'};
function fresh(){return{schemaVersion:1,reports:[],updatedAt:null}}
function read(){try{const x=JSON.parse(localStorage.getItem(KEY));return x?.schemaVersion===1?x:fresh()}catch(_){return fresh()}}
let state=read();
function save(){state.updatedAt=new Date().toISOString();state.reports=state.reports.slice(-MAX_REPORTS);localStorage.setItem(KEY,JSON.stringify(state));render();return state}
function ingest(report){if(!report?.gameId||!Array.isArray(report.moves))return;if(state.reports.some(x=>x.gameId===report.gameId))return;const counts={};for(const m of report.moves.filter(x=>x.ply%2===1)){const e=window.ChesstochessAnalysisExplanations?.explain(m);if(!e)continue;for(const tag of e.tags||[]){if(!LABELS[tag])continue;counts[tag]=(counts[tag]||0)+1}}
state.reports.push({gameId:report.gameId,at:report.createdAt||new Date().toISOString(),counts});save()}
function aggregate(){const totals={};for(const r of state.reports)for(const [tag,n] of Object.entries(r.counts||{})){const x=totals[tag]||{tag,label:LABELS[tag],events:0,games:0};x.events+=n;x.games+=n>0?1:0;totals[tag]=x}return Object.values(totals).filter(x=>x.events>0).sort((a,b)=>b.games-a.games||b.events-a.events)}
function focus(){const rows=aggregate();const eligible=rows.filter(x=>x.games>=2&&x.events>=3);return eligible[0]||null}
function render(){const card=document.querySelector('.weakness-card');if(!card)return;const f=focus(),reports=state.reports.length;if(!f){card.innerHTML='<span class="dashboard-label">TRAINING FOCUS</span><strong>More evidence needed</strong><p>'+(reports?'Analyze more completed games. A weakness is only named after it repeats across at least 2 games.':'Complete and analyze games. Chesstochess will use repeated evidence before naming a weakness.')+'</p>';return}card.innerHTML=`<span class="dashboard-label">TRAINING FOCUS · ${f.games} GAMES</span><strong>${f.label}</strong><p>${f.events} verified events across ${f.games} analyzed games. Prioritize training that reduces this repeated pattern.</p>`}
function reset(){localStorage.removeItem(KEY);state=fresh();render()}
window.ChesstochessWeaknesses={ingest,aggregate,focus,render,reset,get:()=>JSON.parse(JSON.stringify(state))};
document.addEventListener('DOMContentLoaded',render);
})();