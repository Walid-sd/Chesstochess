(() => {
  'use strict';

  const library = window.ChessPuzzleLibrary;
  if (!library || !Array.isArray(library.puzzles) || !library.puzzles.length) {
    console.error('[Chesstochess] Puzzle library unavailable; legacy trainer remains active.');
    return;
  }

  const catalog = library.puzzles;
  const legacyLoadPuzzle = window.loadPuzzle;
  const legacyNextPuzzle = window.nextPuzzle;

  function snapshotRuntime() {
    return {
      board: structuredClone(board), turn, selected, moves: [...moves], history: [...history], gameOver,
      rights: {...rights}, enPassant: enPassant ? [...enPassant] : null, halfmove,
      positionHistory: [...positionHistory]
    };
  }

  function restoreRuntime(s) {
    board = structuredClone(s.board); turn = s.turn; selected = s.selected; moves = [...s.moves];
    history = [...s.history]; gameOver = s.gameOver; rights = {...s.rights};
    enPassant = s.enPassant ? [...s.enPassant] : null; halfmove = s.halfmove;
    positionHistory = [...s.positionHistory];
  }

  function validatePuzzleLegality(puzzle) {
    const saved = snapshotRuntime();
    const errors = [];
    try {
      board = structuredClone(puzzle.position);
      turn = puzzle.side;
      selected = null; moves = []; history = []; gameOver = false;
      rights = {wK:false,wQ:false,bK:false,bQ:false};
      enPassant = null; halfmove = 0; positionHistory = [positionKey()];

      for (let i = 0; i < puzzle.line.length; i++) {
        const step = puzzle.line[i];
        const expectedActor = turn === puzzle.side ? 'player' : 'opponent';
        if (step.actor !== expectedActor) {
          errors.push(`step ${i + 1}: expected ${expectedActor}, got ${step.actor}`);
          break;
        }
        const [fr,fc,tr,tc] = step.move;
        if (!isLegal(fr,fc,tr,tc)) {
          errors.push(`step ${i + 1}: illegal move ${squareName(fr,fc)}-${squareName(tr,tc)}`);
          break;
        }
        applyRaw(fr,fc,tr,tc);
        turn = opposite(turn);
      }
    } catch (err) {
      errors.push(err?.message || String(err));
    } finally {
      restoreRuntime(saved);
    }
    return errors;
  }

  const legality = catalog.map(p => ({id:p.id, errors:validatePuzzleLegality(p)}));
  const invalid = legality.filter(x => x.errors.length);
  window.ChessPuzzleRuntimeValidation = Object.freeze({valid: invalid.length === 0, results: legality});

  if (invalid.length) {
    console.error('[Chesstochess] Puzzle legality validation failed', invalid);
    const trainBtn = document.getElementById('trainModeBtn');
    if (trainBtn) {
      trainBtn.addEventListener('click', () => {
        setTimeout(() => showFeedback('Puzzle catalog error','Training is temporarily unavailable because a configured solution failed legality validation.',false), 0);
      }, {once:true});
    }
    return;
  }

  // Replace the legacy catalog accessor. Existing trainer functions call this binding dynamically.
  window.currentPuzzle = function currentPuzzleV2(){ return catalog[puzzleIndex % catalog.length]; };

  // The legacy loader contains direct references to the old array length, so Phase 2B owns loading too.
  window.loadPuzzle = function loadPuzzleV2(){
    const p = window.currentPuzzle();
    board=structuredClone(p.position);turn=p.side;selected=null;moves=[];history=[];gameOver=false;
    rights={wK:false,wQ:false,bK:false,bQ:false};enPassant=null;halfmove=0;positionHistory=[positionKey()];
    puzzleSolved=false;puzzleActive=true;puzzleAttempts=0;hintsUsed=0;puzzleStep=0;puzzleCorrectSteps=0;
    document.querySelector('.eyebrow').textContent='TACTICAL TRAINING · PUZZLE '+String((puzzleIndex%catalog.length)+1).padStart(2,'0');
    document.getElementById('puzzleTheme').textContent=p.theme;
    document.getElementById('puzzleMeta').textContent=p.difficulty+' · '+p.concept+' · '+p.rating+' rating';
    document.getElementById('puzzleIcon').textContent=p.icon;
    document.getElementById('moveCount').textContent='0 / '+puzzleMoveCount();
    document.getElementById('feedback').hidden=true;
    document.getElementById('sessionStatus').textContent='Puzzle '+((puzzleIndex%catalog.length)+1)+' of '+catalog.length;
    document.getElementById('score').textContent=correctMoves;
    updateSessionStats(); updateKnowledgePanel(); clearResult(); render();
  };

  window.nextPuzzle = function nextPuzzleV2(){
    puzzleIndex=(puzzleIndex+1)%catalog.length;
    persistProgress();
    window.loadPuzzle();
  };

  console.info(`[Chesstochess] Phase 2B active: ${catalog.length} validated puzzles loaded from ChessPuzzleLibrary.`);
})();
