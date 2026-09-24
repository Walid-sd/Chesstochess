(function(){
  'use strict';

  const EMPTY = null;
  const library = [
    {
      id:'mate-one', theme:'Mate in one', difficulty:'Beginner', icon:'♛', side:'w', rating:800,
      motifs:['mate','forcing-move'], concept:'Force mate', source:'Chesstochess curated', version:1,
      position:[[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,'♚'],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,'♕',EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,'♔',EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY]],
      line:[{actor:'player',move:[1,5,1,7]}],
      explain:'Qh7 is mate. Your king protects h7, so the black king has no escape.'
    },
    {
      id:'queen-net', theme:'Queen net', difficulty:'Beginner', icon:'♕', side:'w', rating:850,
      motifs:['king-restriction','queen'], concept:'King restriction', source:'Chesstochess curated', version:1,
      position:[[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,'♚'],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,'♔',EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,'♕',EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY]],
      line:[{actor:'player',move:[3,6,1,6]}],
      explain:'Qg7 is protected by the king on g6 and controls every escape square around h8.'
    },
    {
      id:'protected-queen', theme:'Protected queen', difficulty:'Beginner', icon:'♕', side:'w', rating:900,
      motifs:['protected-piece','king-restriction'], concept:'Protected piece', source:'Chesstochess curated', version:1,
      position:[[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,'♚'],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,'♔',EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,'♕',EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY]],
      line:[{actor:'player',move:[3,6,1,6]}],
      explain:'Qg7 is protected by the king on f6 and seals the king on h8.'
    },
    {
      id:'knight-sequence', theme:'Knight check sequence', difficulty:'Intermediate', icon:'♞', side:'w', rating:1100,
      motifs:['knight','forcing-sequence','check'], concept:'Forcing sequence', source:'Chesstochess curated', version:1,
      position:[[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,'♚'],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,'♜'],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,'♔','♘'],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY],[EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY,EMPTY]],
      line:[{actor:'player',move:[2,7,1,5]},{actor:'opponent',move:[0,7,0,6]},{actor:'player',move:[1,5,2,7]}],
      explain:'Nf7+ forces the king away from h8. After ...Kg8, Nh6+ continues the checking sequence.'
    }
  ];

  const REQUIRED = ['id','theme','difficulty','icon','side','rating','motifs','concept','position','line','explain'];
  function validatePuzzle(p){
    const errors=[];
    for(const key of REQUIRED) if(p[key]===undefined||p[key]===null) errors.push('missing '+key);
    if(!Array.isArray(p.position)||p.position.length!==8||p.position.some(row=>!Array.isArray(row)||row.length!==8)) errors.push('position must be 8x8');
    if(!['w','b'].includes(p.side)) errors.push('side must be w or b');
    if(!Number.isFinite(p.rating)||p.rating<100) errors.push('rating must be numeric');
    if(!Array.isArray(p.motifs)||!p.motifs.length) errors.push('motifs required');
    if(!Array.isArray(p.line)||!p.line.length) errors.push('solution line required');
    else p.line.forEach((step,i)=>{
      if(!['player','opponent'].includes(step.actor)) errors.push('line '+i+' actor invalid');
      if(!Array.isArray(step.move)||step.move.length!==4||step.move.some(v=>!Number.isInteger(v)||v<0||v>7)) errors.push('line '+i+' move invalid');
    });
    return errors;
  }
  function validateLibrary(){
    const ids=new Set(), problems=[];
    library.forEach(p=>{
      const errors=validatePuzzle(p);
      if(ids.has(p.id)) errors.push('duplicate id');
      ids.add(p.id);
      if(errors.length) problems.push({id:p.id,errors});
    });
    return {valid:problems.length===0,count:library.length,problems};
  }
  function getByIndex(index){return library[((index%library.length)+library.length)%library.length]}
  function getById(id){return library.find(p=>p.id===id)||null}
  function filter(filters={}){
    return library.filter(p=>(!filters.difficulty||p.difficulty===filters.difficulty)&&(!filters.motif||p.motifs.includes(filters.motif))&&(!filters.minRating||p.rating>=filters.minRating)&&(!filters.maxRating||p.rating<=filters.maxRating));
  }
  function stats(){
    return library.reduce((acc,p)=>{acc.total++;acc.byDifficulty[p.difficulty]=(acc.byDifficulty[p.difficulty]||0)+1;p.motifs.forEach(m=>acc.byMotif[m]=(acc.byMotif[m]||0)+1);return acc},{total:0,byDifficulty:{},byMotif:{}});
  }

  const validation=validateLibrary();
  if(!validation.valid) console.error('[Chesstochess] Puzzle library validation failed',validation.problems);
  window.ChessPuzzleLibrary=Object.freeze({all:Object.freeze(library),getByIndex,getById,filter,stats,validatePuzzle,validateLibrary});
})();