(function(){
'use strict';
const MAP={
 'material-loss':['material','capture','hanging-piece','fork','skewer'],
 'missed-capture':['capture','hanging-piece','material','fork'],
 'blunder':['forcing-move','check','mate','capture','fork','pin'],
 'mistake':['forcing-sequence','check','fork','pin','skewer','discovered-attack'],
 'inaccuracy':['protected-piece','king-restriction','forcing-sequence','pin'],
 'missed-fork':['fork'],
 'missed-pin':['pin'],
 'missed-check':['check','forcing-move'],
 'missed-hanging-piece':['hanging-piece','capture','material']
};
function plan(){
 const focus=window.ChesstochessWeaknesses?.focus?.();
 if(!focus)return{adaptive:false,focus:null,puzzles:[],reason:'More analyzed-game evidence is required before adaptive training activates.'};
 const motifs=MAP[focus.tag]||[];
 const all=window.ChessPuzzleLibrary?.all||[];
 const scored=all.map(p=>({p,score:p.motifs.reduce((n,m)=>n+(motifs.includes(m)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.p.rating-b.p.rating);
 return{adaptive:scored.length>0,focus,motifs,puzzles:scored.map(x=>x.p),reason:scored.length?`Selected from verified ${focus.label.toLowerCase()} evidence.`:'No verified puzzle mapping is available for this focus yet.'};
}
function apply(){const x=plan(),trainer=window.ChesstochessTrainer;if(!trainer)return x;if(x.adaptive&&x.puzzles.length)trainer.setPool(x.puzzles);return x}
function describe(){const x=plan();if(!x.focus)return x.reason;if(!x.adaptive)return x.reason;return`${x.focus.label}: ${x.puzzles.length} matching verified puzzle${x.puzzles.length===1?'':'s'} selected from ${x.focus.games} analyzed games.`}
window.ChesstochessAdaptiveTraining=Object.freeze({plan,apply,describe,mapping:Object.freeze(MAP)});
})();