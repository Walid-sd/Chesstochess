(() => {
  'use strict';

  const library = window.ChessPuzzleLibrary;
  const catalog = library?.all;
  if (!library || !Array.isArray(catalog) || !catalog.length) {
    console.error('[Chesstochess] Puzzle library unavailable; legacy trainer remains active.');
    return;
  }

  function snapshotRuntime() {
    return {board:structuredClone(board),turn,selected,moves:[...moves],history:[...history],gameOver,rights:{...rights},enPassant:enPassant?[...enPassant]:null,halfmove,positionHistory:[...positionHistory]};
  }
  function restoreRuntime(s){board=structuredClone(s.board);turn=s.turn;selected=s.selected;moves=[...s.moves];history=[...s.history];gameOver=s.gameOver;rights={...s.rights};enPassant=s.enPassant?[...s.enPassant]:null;halfmove=s.halfmove;positionHistory=[...s.positionHistory]}
  function validatePuzzleLegality(puzzle){
    const saved=snapshotRuntime(),errors=[];
    try{
      board=structuredClone(puzzle.position);turn=puzzle.side;selected=null;moves=[];history=[];gameOver=false;rights={wK:false,wQ:false,bK:false,bQ:false};enPassant=null;halfmove=0;positionHistory=[positionKey()];
      for(let i=0;i<puzzle.line.length;i++){
        const step=puzzle.line[i],expectedActor=turn===puzzle.side?'player':'opponent';
        if(step.actor!==expectedActor){errors.push(`step ${i+1}: expected ${expectedActor}, got ${step.actor}`);break}
        const [fr,fc,tr,tc]=step.move;
        if(!isLegal(fr,fc,tr,tc)){errors.push(`step ${i+1}: illegal move ${squareName(fr,fc)}-${squareName(tr,tc)}`);break}
        applyRaw(fr,fc,tr,tc);turn=opposite(turn);
      }
    }catch(err){errors.push(err?.message||String(err))}finally{restoreRuntime(saved)}
    return errors;
  }

  const legality=catalog.map(p=>({id:p.id,errors:validatePuzzleLegality(p)}));
  const invalid=legality.filter(x=>x.errors.length);
  window.ChessPuzzleRuntimeValidation=Object.freeze({valid:invalid.length===0,results:legality});
  if(invalid.length){
    console.error('[Chesstochess] Puzzle legality validation failed',invalid);
    document.getElementById('trainModeBtn')?.addEventListener('click',()=>setTimeout(()=>showFeedback('Puzzle catalog error','Training is temporarily unavailable because a configured solution failed legality validation.',false),0),{once:true});
    return;
  }

  let activeCatalog=[...catalog],activeIndex=0,lastPuzzleId=null;
  function current(){return activeCatalog[activeIndex%activeCatalog.length]||catalog[0]}
  function setPool(pool){activeCatalog=Array.isArray(pool)&&pool.length?[...pool]:[...catalog];activeIndex=0;if(activeCatalog.length>1&&activeCatalog[0].id===lastPuzzleId)activeIndex=1;load()}
  function load(){
    const p=current();lastPuzzleId=p.id;window.ChesstochessActivePuzzle=p;
    board=structuredClone(p.position);turn=p.side;selected=null;moves=[];history=[];gameOver=false;rights={wK:false,wQ:false,bK:false,bQ:false};enPassant=null;halfmove=0;positionHistory=[positionKey()];
    puzzleSolved=false;puzzleActive=true;puzzleAttempts=0;hintsUsed=0;puzzleStep=0;puzzleCorrectSteps=0;
    document.querySelector('.eyebrow').textContent='TACTICAL TRAINING · '+p.concept.toUpperCase();
    document.getElementById('puzzleTheme').textContent=p.theme;
    document.getElementById('puzzleMeta').textContent=p.difficulty+' · '+p.concept+' · '+p.rating+' rating';
    document.getElementById('puzzleIcon').textContent=p.icon;
    document.getElementById('moveCount').textContent='0 / '+puzzleMoveCount();
    document.getElementById('feedback').hidden=true;
    document.getElementById('sessionStatus').textContent='Training · '+activeCatalog.length+' matching puzzle'+(activeCatalog.length===1?'':'s');
    document.getElementById('score').textContent=correctMoves;
    updateSessionStats();updateKnowledgePanel();clearResult();render();
    document.dispatchEvent(new CustomEvent('chesstochess:puzzle-loaded',{detail:{puzzle:p,poolSize:activeCatalog.length}}));
  }
  function next(){
    if(activeCatalog.length>1){let next=(activeIndex+1)%activeCatalog.length;if(activeCatalog[next].id===lastPuzzleId)next=(next+1)%activeCatalog.length;activeIndex=next}
    persistProgress();load();
  }

  window.currentPuzzle=current;
  window.loadPuzzle=load;
  window.nextPuzzle=next;
  window.ChesstochessTrainer=Object.freeze({catalog:Object.freeze(catalog),getPool:()=>[...activeCatalog],getCurrent:current,setPool,next,load});
  console.info(`[Chesstochess] Phase 2D trainer runtime active: ${catalog.length} validated puzzles.`);
})();