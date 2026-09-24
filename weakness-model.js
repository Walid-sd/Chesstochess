(function(){
'use strict';
const KEY='chesstochess.weaknesses.v1',MAX_REPORTS=20;
const LABELS={'material-loss':'Material awareness','missed-capture':'Missed tactical captures','blunder':'Move safety','mistake':'Move precision','inaccuracy':'Positional precision','missed-fork':'Fork recognition','missed-pin':'Pin recognition','missed-check':'Forcing checks','missed-hanging-piece':'Loose-piece awareness'};
const MOTIFS=['fork','pin','check','hanging-piece'];
function fresh(){return{schemaVersion:1,reports:[],updatedAt:null}}
function read(){try{const x=JSON.parse(localStorage.getItem(KEY));return x?.schemaVersion===1?x:fresh()}catch(_){return fresh()}}
let state=read();
function save(){state.updatedAt=new Date().toISOString();state.reports=state.reports.slice(-MAX_REPORTS);localStorage.setItem(KEY,JSON.stringify(state));render();return state}
function bestMoveProxy(m){if(!m?.bestmove||!m?.beforeFen||m.bestmove.length<4)return null;const afterFen=window.ChesstochessFenMove?.apply(m.beforeFen,m.bestmove);if(!afterFen)return null;return{...m,uci:m.bestmove,from:m.bestmove.slice(0,2),to:m.bestmove.slice(2,4),afterFen}}
function missedMotifs(m,playedTags=[]){if(!m?.bestmove||m.bestmove===m.uci||!(m.lossCp>=60))return[];const proxy=bestMoveProxy(m);if(!proxy)return[];const best=window.ChesstochessMotifDetector?.detect(proxy)||[];return MOTIFS.filter(tag=>best.includes(tag)&&!playedTags.includes(tag))}
function ingest(report){if(!report?.gameId||!Array.isArray(report.moves))return;if(state.reports.some(x=>x.gameId===report.gameId))return;const counts={},success={};for(const m of report.moves.filter(x=>x.ply%2===1)){const e=window.ChesstochessAnalysisExplanations?.explain(m);if(!e)continue;for(const tag of e.tags||[]){if(LABELS[tag])counts[tag]=(counts[tag]||0)+1;if(MOTIFS.includes(tag))success[tag]=(success[tag]||0)+1}for(const tag of missedMotifs(m,e.tags||[])){const key='missed-'+tag;if(LABELS[key])counts[key]=(counts[key]||0)+1}}
state.reports.push({gameId:report.gameId,at:report.createdAt||new Date().toISOString(),counts,success});save()}
function aggregate(){const totals={};for(const r of state.reports)for(const [tag,n] of Object.entries(r.counts||{})){const x=totals[tag]||{tag,label:LABELS[tag],events:0,games:0};x.events+=n;x.games+=n>0?1:0;totals[tag]=x}return Object.values(totals).filter(x=>x.events>0).sort((a,b)=>b.games-a.games||b.events-a.events)}
function strengths(){const totals={};for(const r of state.reports)for(const[tag,n]of Object.entries(r.success||{})){const x=totals[tag]||{tag,events:0,games:0};x.events+=n;x.games+=n>0?1:0;totals[tag]=x}return Object.values(totals).sort((a,b)=>b.games-a.games||b.events-a.events)}
function focus(){const rows=aggregate();const eligible=rows.filter(x=>x.games>=2&&x.events>=3);return eligible[0]||null}
function render(){const card=document.querySelector('.weakness-card');if(!card)return;const f=focus(),reports=state.reports.length,strong=strengths()[0];if(!f){card.innerHTML='<span class="dashboard-label">TRAINING FOCUS</span><strong>More evidence needed</strong><p>'+(reports?'Analyze more completed games. A weakness is only named after it repeats across at least 2 games.':'Complete and analyze games. Chesstochess will use repeated evidence before naming a weakness.')+(strong?` Strongest verified motif so far: ${strong.tag.replace(/-/g,' ')} (${strong.events}).`:'')+'</p>';return}card.innerHTML=`<span class="dashboard-label">TRAINING FOCUS · ${f.games} GAMES</span><strong>${f.label}</strong><p>${f.events} verified events across ${f.games} analyzed games. Prioritize training that reduces this repeated pattern.${strong?` Verified successful motif: ${strong.tag.replace(/-/g,' ')} (${strong.events}).`:''}</p>`}
function reset(){localStorage.removeItem(KEY);state=fresh();render()}
window.ChesstochessWeaknesses={ingest,aggregate,strengths,focus,render,reset,get:()=>JSON.parse(JSON.stringify(state)),missedMotifs,bestMoveProxy};
document.addEventListener('DOMContentLoaded',render);
})();