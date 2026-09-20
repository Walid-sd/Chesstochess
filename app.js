const files=['a','b','c','d','e','f','g','h'];
let flipped=false,selected=null,turn='w',moves=[],history=[],gameOver=false;
let rights={wK:true,wQ:true,bK:true,bQ:true},enPassant=null,halfmove=0;

const start=[
 ['♜','♞','♝','♛','♚','♝','♞','♜'],['♟','♟','♟','♟','♟','♟','♟','♟'],
 [null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],
 [null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],
 ['♙','♙','♙','♙','♙','♙','♙','♙'],['♖','♘','♗','♕','♔','♗','♘','♖']];
let board=structuredClone(start);
const white=new Set('♔♕♖♗♘♙'),black=new Set('♚♛♜♝♞♟');

function color(p){return white.has(p)?'w':black.has(p)?'b':null}
function opposite(t){return t==='w'?'b':'w'}
function cloneState(){return {board:structuredClone(board),turn,rights:{...rights},enPassant,moves:[...moves],halfmove}}
function restore(s){board=structuredClone(s.board);turn=s.turn;rights={...s.rights};enPassant=s.enPassant;moves=[...s.moves];halfmove=s.halfmove;gameOver=false}
function findKing(t){for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(board[r][c]===(t==='w'?'♔':'♚'))return [r,c];return null}

function attacksSquare(r,c,by){
 const pawn=by==='w'?'♙':'♟',dir=by==='w'?-1:1;
 for(const dc of[-1,1])if(board[r-dir]?.[c-dc]===pawn)return true;
 const knight=by==='w'?'♘':'♞';
 for(const [dr,dc] of[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]])if(board[r-dr]?.[c-dc]===knight)return true;
 const king=by==='w'?'♔':'♚';
 for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if((dr||dc)&&board[r-dr]?.[c-dc]===king)return true;
 const lines=[[[1,0],['♖','♜','♕','♛']],[[-1,0],['♖','♜','♕','♛']],[[0,1],['♖','♜','♕','♛']],[[0,-1],['♖','♜','♕','♛']],[[1,1],['♗','♝','♕','♛']],[[-1,-1],['♗','♝','♕','♛']],[[1,-1],['♗','♝','♕','♛']],[[-1,1],['♗','♝','♕','♛']]];
 for(const [[dr,dc],pieces] of lines){let rr=r+dr,cc=c+dc;while(rr>=0&&rr<8&&cc>=0&&cc<8){if(board[rr][cc]){if(pieces.includes(board[rr][cc])&&color(board[rr][cc])===by)return true;break}rr+=dr;cc+=dc}}
 return false;
}
function inCheck(t){const k=findKing(t);return k?attacksSquare(k[0],k[1],opposite(t)):true}

function pseudo(r,c,includeCastle=true){
 const p=board[r][c],t=color(p),kind=p?.toLowerCase();if(!p)return[];
 const out=[];const add=(rr,cc)=>{if(rr<0||rr>7||cc<0||cc>7)return false;if(!board[rr][cc]){out.push([rr,cc]);return true}if(color(board[rr][cc])!==t)out.push([rr,cc]);return false};
 if(kind==='p'){
   const d=t==='w'?-1:1;if(board[r+d]?.[c]==null){out.push([r+d,c]);if((t==='w'?r===6:r===1)&&board[r+2*d]?.[c]==null)out.push([r+2*d,c])}
   for(const dc of[-1,1]){const rr=r+d,cc=c+dc;if(board[rr]?.[cc]&&color(board[rr][cc])!==t)out.push([rr,cc]);if(enPassant&&enPassant[0]===rr&&enPassant[1]===cc)out.push([rr,cc])}
 }
 if(kind==='n')[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]].forEach(([dr,dc])=>add(r+dr,c+dc));
 const rays={b:[[1,1],[1,-1],[-1,1],[-1,-1]],r:[[1,0],[-1,0],[0,1],[0,-1]],q:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]};
 if(rays[kind])for(const [dr,dc] of rays[kind]){let rr=r+dr,cc=c+dc;while(rr>=0&&rr<8&&cc>=0&&cc<8){if(!add(rr,cc))break;rr+=dr;cc+=dc}}
 if(kind==='k'){
   for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)add(r+dr,c+dc);
   if(includeCastle&&!inCheck(t)){
     const row=t==='w'?7:0;
     if((t==='w'?rights.wK:rights.bK)&&board[row][5]===null&&board[row][6]===null&&!attacksSquare(row,5,opposite(t))&&!attacksSquare(row,6,opposite(t)))out.push([row,6]);
     if((t==='w'?rights.wQ:rights.bQ)&&board[row][1]===null&&board[row][2]===null&&board[row][3]===null&&!attacksSquare(row,3,opposite(t))&&!attacksSquare(row,2,opposite(t)))out.push([row,2]);
   }
 }
 return out;
}
function legalMovesFor(r,c){
 const p=board[r][c],t=color(p);if(!p||t!==turn)return[];
 return pseudo(r,c).filter(([tr,tc])=>{if(board[tr][tc]===(t==='w'?'♚':'♔'))return false;const s={board:structuredClone(board),rights:{...rights},ep:enPassant};applyRaw(r,c,tr,tc);const ok=!inCheck(t);board=s.board;rights=s.rights;enPassant=s.ep;return ok});
}
function isLegal(fr,fc,tr,tc){return legalMovesFor(fr,fc).some(([r,c])=>r===tr&&c===tc)}

function applyRaw(fr,fc,tr,tc){
 const p=board[fr][fc],kind=p.toLowerCase();
 if(kind==='p'&&enPassant&&tr===enPassant[0]&&tc===enPassant[1]&&!board[tr][tc])board[fr][tc]=null;
 if(kind==='k'&&Math.abs(tc-fc)===2){
   const rookFrom=tc>fc?7:0,rookTo=tc>fc?5:3;board[fr][rookTo]=board[fr][rookFrom];board[fr][rookFrom]=null;
 }
 board[tr][tc]=p;board[fr][fc]=null;
 if(p==='♙'&&tr===0)board[tr][tc]='♕';if(p==='♟'&&tr===7)board[tr][tc]='♛';
 enPassant=null;if(kind==='p'&&Math.abs(tr-fr)===2)enPassant=[(tr+fr)/2,fc];
 if(p==='♔')rights.wK=rights.wQ=false;if(p==='♚')rights.bK=rights.bQ=false;
 if(p==='♖'&&fr===7&&fc===0)rights.wQ=false;if(p==='♖'&&fr===7&&fc===7)rights.wK=false;
 if(p==='♜'&&fr===0&&fc===0)rights.bQ=false;if(p==='♜'&&fr===0&&fc===7)rights.bK=false;
 if(tr===7&&tc===0)rights.wQ=false;if(tr===7&&tc===7)rights.wK=false;
 if(tr===0&&tc===0)rights.bQ=false;if(tr===0&&tc===7)rights.bK=false;
}
function notation(fr,fc,tr,tc,captured,castle){
 if(castle)return tc>fc?'O-O':'O-O-O';
 const p=board[fr][fc],names={'♙':'','♘':'N','♗':'B','♖':'R','♕':'Q','♔':'K','♟':'','♞':'N','♝':'B','♜':'R','♛':'Q','♚':'K'};
 return names[p]+(captured?'x':'')+files[tc]+(8-tr);
}
function makeMove(fr,fc,tr,tc){
 history.push(cloneState());const p=board[fr][fc],castle=p==='♔'||p==='♚';const captured=!!board[tr][tc]||(p?.toLowerCase()==='p'&&enPassant&&tr===enPassant[0]&&tc===enPassant[1]);
 const n=notation(fr,fc,tr,tc,captured,castle&&Math.abs(tc-fc)===2);applyRaw(fr,fc,tr,tc);
 if(captured||p.toLowerCase()==='p')halfmove=0;else halfmove++;
 moves.push(n);turn=opposite(turn);
 updateKnowledgePanel();
 const check=inCheck(turn),available=allLegalMoves(turn).length;
 if(available===0){gameOver=true;showResult(check?(turn==='w'?'Black wins by checkmate':'White wins by checkmate'):'Draw by stalemate')}
 else if(halfmove>=100){gameOver=true;showResult('Draw by 50-move rule')}
 else if(isThreefold()){gameOver=true;showResult('Draw by threefold repetition')}
 document.getElementById('score').textContent=moves.length;
}
function allLegalMoves(t){const old=turn;turn=t;const out=[];for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(color(board[r][c])===t)for(const m of legalMovesFor(r,c))out.push([r,c,...m]);turn=old;return out}
function isThreefold(){return false /* repetition history will be added with position hashing */}
function showResult(text){const turnText=document.getElementById('turnText');turnText.textContent=text;turnText.parentElement.classList.add('result')}
function clearResult(){document.querySelector('.turn').classList.remove('result')}
function clickSquare(r,c){
 if(gameOver)return;
 if(!selected){if(board[r][c]&&color(board[r][c])===turn){selected={r,c};render()}return}
 if(isLegal(selected.r,selected.c,r,c)){makeMove(selected.r,selected.c,r,c);selected=null}
 else if(board[r][c]&&color(board[r][c])===turn)selected={r,c};else selected=null;
 render();
}
function render(){
 const el=document.getElementById('board');el.innerHTML='';const order=flipped?[...Array(8).keys()].reverse():[...Array(8).keys()];
 order.forEach(r=>order.forEach(c=>{const sq=document.createElement('div');sq.className='square '+((r+c)%2?'dark':'light');
   if(selected?.r===r&&selected?.c===c)sq.classList.add('selected');if(selected&&isLegal(selected.r,selected.c,r,c))sq.classList.add(board[r][c]?'capture':'legal');
   const p=board[r][c];if(p){const span=document.createElement('span');span.className='piece '+(color(p)==='w'?'white-piece':'black-piece');span.textContent=p;sq.appendChild(span)}sq.onclick=()=>clickSquare(r,c);el.appendChild(sq)}));renderCoords();updatePanel();
}
function renderCoords(){
 const f=document.getElementById('files'),r=document.getElementById('ranks');f.innerHTML='';r.innerHTML='';
 (flipped?[...files].reverse():files).forEach(x=>{const s=document.createElement('span');s.textContent=x;f.appendChild(s)});
 (flipped?['1','2','3','4','5','6','7','8']:['8','7','6','5','4','3','2','1']).forEach(x=>{const s=document.createElement('span');s.textContent=x;r.appendChild(s)});
}
function updatePanel(){
 document.getElementById('turnText').textContent=gameOver?document.getElementById('turnText').textContent:(turn==='w'?'White to move':'Black to move');
 document.getElementById('turnPiece').textContent=gameOver?'✓':turn==='w'?'♙':'♟';document.getElementById('moveCount').textContent=moves.length;
 const box=document.getElementById('moves');if(!moves.length){box.innerHTML='<div class="empty">Your moves will appear here.</div>';return}
 box.innerHTML='';for(let i=0;i<moves.length;i+=2){const row=document.createElement('div');row.className='move-row';row.innerHTML='<span class="num">'+(i/2+1)+'.</span><span>'+(moves[i]||'')+'</span><span>'+(moves[i+1]||'')+'</span>';box.appendChild(row)}box.scrollTop=box.scrollHeight;
}
function newGame(){board=structuredClone(start);turn='w';moves=[];history=[];selected=null;gameOver=false;rights={wK:true,wQ:true,bK:true,bQ:true};enPassant=null;halfmove=0;clearResult();document.getElementById('score').textContent='0';render()}
document.getElementById('newGameBtn').onclick=newGame;document.getElementById('newGameTop').onclick=newGame;
document.getElementById('flipBtn').onclick=()=>{flipped=!flipped;render()};
document.getElementById('undoBtn').onclick=()=>{if(!history.length)return;restore(history.pop());clearResult();document.getElementById('score').textContent=moves.length;render()};
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='n'){e.preventDefault();newGame()}});
render();

// --- Tactical trainer layer ---
const puzzles=[
 {id:'mate-one',theme:'Mate in one',difficulty:'Beginner',icon:'♛',side:'w',rating:800,concept:'Force mate',
  position:[[null,null,null,null,null,null,null,'♚'],[null,null,null,null,null,'♕',null,null],[null,null,null,null,null,null,'♔',null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]],
  line:[{actor:'player',move:[3,5,1,7]}],explain:'Qh7 is mate. Your king protects h7, so the black king has no escape.'},
 {id:'queen-net',theme:'Queen net',difficulty:'Beginner',icon:'♕',side:'w',rating:850,concept:'King restriction',
  position:[[null,null,null,null,null,null,null,'♚'],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,'♔',null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]],
  line:[{actor:'player',move:[2,6,1,6]}],explain:'Qg7 is protected by the king on g6 and controls every escape square around h8.'},
 {id:'protected-queen',theme:'Protected queen',difficulty:'Beginner',icon:'♕',side:'w',rating:900,concept:'Protected piece',
  position:[[null,null,null,null,null,null,null,'♚'],[null,null,null,null,null,null,null,null],[null,null,null,null,'♔',null,null],[null,null,null,null,null,null,'♕',null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]],
  line:[{actor:'player',move:[3,6,1,6]}],explain:'Qg7 is protected by the king on f6 and seals the king on h8.'},
 {id:'knight-sequence',theme:'Knight check sequence',difficulty:'Intermediate',icon:'♞',side:'w',rating:1100,concept:'Forcing sequence',
  position:[[null,null,null,null,null,null,null,'♚'],[null,null,null,null,null,null,null,'♜'],[null,null,null,null,null,null,'♔','♞'],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null],[null,null,null,null,null,null,null,null]],
  line:[
   {actor:'player',move:[2,7,1,5]},
   {actor:'opponent',move:[0,7,0,6]},
   {actor:'player',move:[1,5,2,7]}
  ],
  explain:'Nf7+ forces the king away from h8. After ...Kg8, Nh6+ continues the checking sequence.'}
];

let puzzleIndex=Number(localStorage.getItem('ct-puzzle-index')||0);
let correctMoves=Number(localStorage.getItem('ct-correct')||0);
let solved=Number(localStorage.getItem('ct-solved')||0);
let puzzleActive=true,puzzleSolved=false,puzzleAttempts=0,hintsUsed=0,puzzleStep=0,puzzleCorrectSteps=0;
let sessionAttempts=Number(localStorage.getItem('ct-session-attempts')||0);
let sessionHints=Number(localStorage.getItem('ct-session-hints')||0);
let sessionCorrect=Number(localStorage.getItem('ct-session-correct')||0);
function sessionAccuracy(){const total=sessionAttempts+sessionCorrect;return total?Math.round(sessionCorrect/total*100):100}
function updateSessionStats(){
 document.getElementById('sessionAccuracy').textContent=sessionAccuracy()+'%';
 document.getElementById('sessionAttempts').textContent=sessionAttempts;
 document.getElementById('sessionHints').textContent=sessionHints;
 localStorage.setItem('ct-session-attempts',String(sessionAttempts));
 localStorage.setItem('ct-session-hints',String(sessionHints));
 localStorage.setItem('ct-session-correct',String(sessionCorrect));
}
function updateKnowledgePanel(){
 const panel=document.getElementById('knowledgeOpening');
 const idea=document.getElementById('knowledgeIdea');
 const type=document.getElementById('knowledgeType');
 if(!panel||!window.ChessKnowledge)return;
 const matches=window.ChessKnowledge.detectOpeningKnowledge(moves);
 const motifs=window.ChessKnowledge.detectPositionKnowledge(board);
 const tactical=[];
 if(motifs.forks.length)tactical.push('Fork');
 if(motifs.pins.length)tactical.push('Pin');
 if(motifs.skewers.length)tactical.push('Skewer');
 if(motifs.discovered.length)tactical.push('Discovered attack');
 if(matches.length){
   const match=matches[0];
   const entry=window.ChessKnowledge.getChessKnowledge('openings',match.id);
   panel.textContent=match.name+(match.variant?' · '+match.variant:'');
   type.textContent=tactical.length?tactical.join(' · ').toUpperCase():'OPENING';
   idea.textContent=tactical.length?'Detected motif: '+tactical.join(', ')+'.':(entry?.ideas?.slice(0,2).join(' · ')||'Recognized chess pattern.');
 }else if(tactical.length){
   panel.textContent=tactical[0]+' detected';
   type.textContent='TACTIC';
   idea.textContent='The current position contains a recognizable tactical pattern.';
 }else{
   panel.textContent='No named pattern yet';
   type.textContent='—';
   idea.textContent='The knowledge engine is waiting for a recognizable opening or tactical pattern.';
 }
}
function currentPuzzle(){return puzzles[puzzleIndex%puzzles.length]}
function persistProgress(){
 localStorage.setItem('ct-puzzle-index',String(puzzleIndex));
 localStorage.setItem('ct-correct',String(correctMoves));
 localStorage.setItem('ct-solved',String(solved));
}
function actorAtStep(){return currentPuzzle().line[puzzleStep]?.actor}
function puzzleMoveCount(){return currentPuzzle().line.filter(x=>x.actor==='player').length}
function playerStepNumber(){return currentPuzzle().line.slice(0,puzzleStep).filter(x=>x.actor==='player').length}
function formatStepLabel(){return 'Move '+(playerStepNumber()+1)+' of '+puzzleMoveCount()}
function recordTrainerMove(){document.getElementById('moveCount').textContent=playerStepNumber()+' / '+puzzleMoveCount();}
function squareName(r,c){return files[c]+(8-r)}
function pieceName(piece){
 return piece==='♕'||piece==='♛'?'queen':piece==='♖'||piece==='♜'?'rook':piece==='♘'||piece==='♞'?'knight':piece==='♗'||piece==='♝'?'bishop':piece==='♙'||piece==='♟'?'pawn':'piece';
}
function loadPuzzle(){
 const p=currentPuzzle();
 board=structuredClone(p.position);turn=p.side;selected=null;moves=[];history=[];gameOver=false;
 rights={wK:false,wQ:false,bK:false,bQ:false};enPassant=null;halfmove=0;
 puzzleSolved=false;puzzleActive=true;puzzleAttempts=0;hintsUsed=0;puzzleStep=0;puzzleCorrectSteps=0;
 document.querySelector('.eyebrow').textContent='TACTICAL TRAINING · PUZZLE '+String((puzzleIndex%puzzles.length)+1).padStart(2,'0');
 document.getElementById('puzzleTheme').textContent=p.theme;
 document.getElementById('puzzleMeta').textContent=p.difficulty+' · '+p.concept+' · '+p.rating+' rating';
 document.getElementById('puzzleIcon').textContent=p.icon;
 document.getElementById('moveCount').textContent='0 / '+puzzleMoveCount();
 document.getElementById('feedback').hidden=true;
 document.getElementById('sessionStatus').textContent='Puzzle '+((puzzleIndex%puzzles.length)+1)+' of '+puzzles.length;
 document.getElementById('score').textContent=correctMoves;
 updateSessionStats();
 updateKnowledgePanel();
 clearResult();render();
}
function showFeedback(title,text,good){
 const f=document.getElementById('feedback');f.hidden=false;f.className='feedback '+(good?'good':'bad');
 document.getElementById('feedbackTitle').textContent=title;
 document.getElementById('feedbackText').textContent=text;
}
function moveMatches(step,fr,fc,tr,tc){
 const item=currentPuzzle().line[step];
 return item?.move?.every((v,i)=>v===[fr,fc,tr,tc][i]);
}
function applyOpponentStep(){
 const item=currentPuzzle().line[puzzleStep];
 if(!item||item.actor!=='opponent')return;
 const [fr,fc,tr,tc]=item.move;
 if(!isLegal(fr,fc,tr,tc)){
   showFeedback('Puzzle data error','The configured opponent response is not legal from this position.',false);
   puzzleActive=false;
   return;
 }
 makeMove(fr,fc,tr,tc);
 puzzleStep++;
 recordTrainerMove();
 showFeedback('Opponent replied',formatStepLabel()+'. Calculate the continuation before moving.',true);
}
function finishPuzzle(){
 const p=currentPuzzle();
 puzzleSolved=true;puzzleActive=false;correctMoves++;solved++;sessionCorrect++;
 persistProgress();
 showFeedback('Solved — '+p.theme,p.explain+' Next puzzle is waiting when you are ready.',true);
 document.getElementById('turnText').textContent='Puzzle solved';
 recordTrainerMove();
}
function previewMoveFen(fr,fc,tr,tc){
 const snapshot={board:structuredClone(board),turn,rights:{...rights},enPassant,moves:[...moves],halfmove,history:[...history],gameOver,selected};
 const p=board[fr][fc];
 const captured=!!board[tr][tc]||(p?.toLowerCase()==='p'&&enPassant&&tr===enPassant[0]&&tc===enPassant[1]);
 applyRaw(fr,fc,tr,tc);
 if(captured||p.toLowerCase()==='p')halfmove=0;else halfmove++;
 moves.push(notation(fr,fc,tr,tc,captured,p==='♔'||p==='♚'));
 turn=opposite(turn);
 const fen=boardFen();
 board=snapshot.board;turn=snapshot.turn;rights=snapshot.rights;enPassant=snapshot.enPassant;moves=snapshot.moves;halfmove=snapshot.halfmove;history=snapshot.history;gameOver=snapshot.gameOver;selected=snapshot.selected;
 return fen;
}
function qualityLabel(loss){
 if(loss<=15)return ['Best','The move is essentially engine-optimal.'];
 if(loss<=40)return ['Good','A small evaluation loss; the position remains under control.'];
 if(loss<=90)return ['Inaccuracy','The move gives up some of the position’s value.'];
 if(loss<=200)return ['Mistake','The move loses a meaningful amount of evaluation.'];
 return ['Blunder','The move gives up a major amount of evaluation.'];
}
function formatEval(score){
 if(score===null||score===undefined)return '—';
 if(Math.abs(score)>=900)return score>0?'+MATE':'-MATE';
 return (score>=0?'+':'')+(score/100).toFixed(2);
}
function analyzeMoveQuality(fr,fc,tr,tc){
 const mover=turn;
 const rootFen=boardFen();
 const childFen=previewMoveFen(fr,fc,tr,tc);
 showFeedback('Analyzing move','Stockfish is comparing your move with the position’s best continuation.',false);
 analyzeFen(rootFen,root=>{
   if(root.type!=='bestmove')return;
   const rootScore=root.whiteScore;
   const best=root.bestmove;
   analyzeFen(childFen,child=>{
     if(child.type!=='bestmove')return;
     const childScore=child.whiteScore;
     const rootMover=mover==='w'?rootScore:-rootScore;
     const childMover=mover==='w'?childScore:-childScore;
     const loss=Math.max(0,rootMover-childMover);
     const [label,desc]=qualityLabel(loss);
     const bestText=uciToReadable(best)||'—';
     const yourText=squareName(fr,fc)+'-'+squareName(tr,tc);
     engineUi('Move quality',label,'Best: '+bestText+' · Your move: '+yourText+' · Loss: '+loss+' cp',child.depth||root.depth,{best:bestText,your:yourText,loss});
     showFeedback(label,desc+' Best: '+bestText+'. Your move: '+yourText+'. Evaluation loss: '+loss+' cp.',label==='Best'||label==='Good');
   });
 });
}
function puzzleClick(r,c){
 if(!puzzleActive||puzzleSolved)return false;
 if(actorAtStep()==='opponent')return true;
 if(!selected){
   if(board[r][c]&&color(board[r][c])===turn){selected={r,c};render()}
   return true;
 }
 if(!isLegal(selected.r,selected.c,r,c)){selected=null;render();return true}
 const fr=selected.r,fc=selected.c;
 if(moveMatches(puzzleStep,fr,fc,r,c)){
   makeMove(fr,fc,r,c);selected=null;puzzleStep++;puzzleCorrectSteps++;
   const next=currentPuzzle().line[puzzleStep];
   if(!next)finishPuzzle();
   else if(next.actor==='opponent')applyOpponentStep();
   else { recordTrainerMove(); showFeedback('Correct.',''+formatStepLabel()+'. Keep calculating.',true); }
 }else{
   selected=null;puzzleAttempts++;sessionAttempts++;
   updateSessionStats();
   analyzeMoveQuality(fr,fc,r,c);
 }
 render();return true;
}
const normalClickSquare=clickSquare;
clickSquare=function(r,c){if(puzzleActive){puzzleClick(r,c);return}normalClickSquare(r,c)};
function nextPuzzle(){puzzleIndex=(puzzleIndex+1)%puzzles.length;persistProgress();loadPuzzle()}
document.getElementById('newGameBtn').onclick=nextPuzzle;
document.getElementById('newGameTop').onclick=nextPuzzle;
document.getElementById('undoBtn').onclick=loadPuzzle;
document.getElementById('hintBtn').onclick=()=>{
 if(!puzzleActive)return;
 const item=currentPuzzle().line[puzzleStep];
 if(!item||item.actor!=='player')return;
 hintsUsed++;sessionHints++;
 updateSessionStats();
 const [fr,fc]=item.move;
 const piece=board[fr]?.[fc];
 showFeedback('Hint','Look at the '+pieceName(piece)+' on '+squareName(fr,fc)+'. Find its strongest forcing move.',false);
};
document.getElementById('flipBtn').onclick=()=>{flipped=!flipped;render()};
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='n'){e.preventDefault();nextPuzzle()}});
loadPuzzle();

// --- Browser engine analysis ---
let engineWorker=null,engineReady=false,engineBusy=false,engineCallback=null,enginePending=null;
const ENGINE_URL='https://cdn.jsdelivr.net/npm/stockfish@19.0.0/src/stockfish-19-lite-single.js';

function boardFen(){
 const rows=board.map(row=>{let out='',empty=0;for(const p of row){if(!p){empty++;continue}if(empty){out+=empty;empty=0}const map={'♔':'K','♕':'Q','♖':'R','♗':'B','♘':'N','♙':'P','♚':'k','♛':'q','♜':'r','♝':'b','♞':'n','♟':'p'};out+=map[p]}if(empty)out+=empty;return out}).join('/');
 const castle=(rights.wK?'K':'')+(rights.wQ?'Q':'')+(rights.bK?'k':'')+(rights.bQ?'q':'')||'-';
 const ep=enPassant?squareName(enPassant[0],enPassant[1]):'-';
 return rows+' '+turn+' '+castle+' '+ep+' '+halfmove+' '+(Math.floor(moves.length/2)+1);
}
function uciToReadable(uci){
 if(!uci)return '';
 const from=uci.slice(0,2),to=uci.slice(2,4),promo=uci[4]&&/[qrbn]/.test(uci[4])?('='+uci[4].toUpperCase()):'';
 const rest=[];
 for(let i=5;i+3<uci.length;i+=4)rest.push(uci.slice(i,i+2)+'-'+uci.slice(i+2,i+4));
 return from+'-'+to+promo+(rest.length?' '+rest.join(' '):'');
}
function engineUi(title,value,line,depth,metrics){
 const box=document.getElementById('engineBox');box.hidden=false;
 document.getElementById('engineEval').textContent=value;
 document.getElementById('engineLine').textContent=line||title;
 document.getElementById('engineDepth').textContent=depth?('D'+depth):'—';
 if(metrics){
   document.getElementById('engineBest').textContent=metrics.best||'—';
   document.getElementById('engineYour').textContent=metrics.your||'—';
   document.getElementById('engineLoss').textContent=metrics.loss!==undefined?metrics.loss+' cp':'—';
 }
}
function parseEngineScore(msg,sideToMove){
 const cp=(msg.match(/ score cp (-?\d+)/)||[])[1];
 const mate=(msg.match(/ score mate (-?\d+)/)||[])[1];
 if(mate)return {whiteScore:(sideToMove==='w'?1:-1)*Number(mate)*100000,mate:Number(mate)};
 if(cp!==undefined)return {whiteScore:(sideToMove==='w'?1:-1)*Number(cp)};
 return {whiteScore:null,mate:null};
}
function ensureEngine(callback){
 if(engineWorker){if(engineReady&&callback)callback();else if(callback)enginePending=callback;return}
 try{
   engineWorker=new Worker(ENGINE_URL);
   if(callback)enginePending=callback;
   engineWorker.onmessage=e=>{
     const msg=String(e.data);
     if(msg==='uciok'){
       engineReady=true;engineBusy=false;
       engineUi('Ready','Ready','Stockfish is ready for local analysis.');
       const pending=enginePending;enginePending=null;if(pending)pending();
       return;
     }
     if(msg.startsWith('info')&&msg.includes('score')){
       const depth=(msg.match(/ depth (\d+)/)||[])[1];
       const cp=(msg.match(/ score cp (-?\d+)/)||[])[1];
       const mate=(msg.match(/ score mate (-?\d+)/)||[])[1];
       const pv=(msg.match(/ pv (.+)$/)||[])[1];
       const value=mate?('Mate '+mate):cp!==undefined?((Number(cp)/100).toFixed(2)+' eval'):'Thinking…';
       engineUi('Analysis',value,pv?'PV: '+uciToReadable(pv):'Searching…',depth);
       if(engineCallback){
         const parsed=parseEngineScore(msg,engineCallback.sideToMove||turn);
         engineCallback.lastWhiteScore=parsed.whiteScore;
         if(engineCallback.callback)engineCallback.callback({type:'info',cp:cp!==undefined?Number(cp):null,mate:mate?Number(mate):null,pv:pv?uciToReadable(pv):'',depth:depth?Number(depth):null,whiteScore:parsed.whiteScore});
       }
     }
     if(msg.startsWith('bestmove')){
       engineBusy=false;
       const best=(msg.match(/^bestmove\s+(\S+)/)||[])[1]||'';
       engineUi('Complete','Analysis complete','Best move: '+uciToReadable(best),document.getElementById('engineDepth').textContent.replace('D',''));
       if(engineCallback){
         const cb=engineCallback;
         const parsed={type:'bestmove',bestmove:best,whiteScore:cb.lastWhiteScore??null,depth:Number(document.getElementById('engineDepth').textContent.replace('D',''))||null};
         cb(parsed);
       }
       engineCallback=null;
     }
   };
   engineWorker.onerror=()=>{engineBusy=false;engineUi('Unavailable','Engine unavailable','The browser could not load the Stockfish worker.',null);engineCallback=null;enginePending=null};
   engineWorker.postMessage('uci');
 }catch(err){engineUi('Unavailable','Engine unavailable','Web Workers are not available in this browser.',null)}
}
function analyzeFen(fen,callback){
 const side=(fen.split(' ')[1]||'w');
 ensureEngine(()=>{
   if(!engineWorker||!engineReady||engineBusy)return;
   engineBusy=true;
   const request={sideToMove:side,lastWhiteScore:null,callback};
   engineCallback=request;
   engineUi('Thinking','Thinking…','Stockfish is evaluating the requested position.',null);
   engineWorker.postMessage('stop');
   engineWorker.postMessage('ucinewgame');
   engineWorker.postMessage('position fen '+fen);
   engineWorker.postMessage('go depth 14');
 });
}
function analyzePosition(callback){
 analyzeFen(boardFen(),callback);
}
document.getElementById('analyzeBtn').onclick=()=>analyzePosition();
