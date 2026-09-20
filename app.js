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
 const p=board[fr][fc],t=color(p),kind=p.toLowerCase();
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
 const n=notation(fr,fc,tr,tc,captured,castle&&Math.abs(tc-fc)===2);const before=structuredClone(board);applyRaw(fr,fc,tr,tc);
 if(captured||p.toLowerCase()==='p')halfmove=0;else halfmove++;
 moves.push(n);turn=opposite(turn);
 const check=inCheck(turn),available=allLegalMoves(turn).length;
 if(available===0){gameOver=true;showResult(check?(turn==='w'?'Black wins by checkmate':'White wins by checkmate'):'Draw by stalemate')}
 else if(halfmove>=100){gameOver=true;showResult('Draw by 50-move rule')}
 else if(isThreefold()){gameOver=true;showResult('Draw by threefold repetition')}
 document.getElementById('score').textContent=moves.length;
 return before;
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
   const p=board[r][c];if(p){const span=document.createElement('span');span.className='piece '+(color(p)==='w'?'white-piece':'black-piece');span.textContent=p;sq.appendChild(span)}
   sq.onclick=()=>clickSquare(r,c);el.appendChild(sq)}));renderCoords();updatePanel();
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
const puzzles=[{
  theme:'Mate in one',meta:'Find the forcing move',side:'w',
  position:[
    [null,null,null,null,null,null,null,'♚'],
    [null,null,null,null,null,'♕','♟',null],
    [null,null,null,null,null,null,'♔',null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null]
  ],
  solution:[[3,5,1,5]]
}];
let puzzleIndex=0,puzzleActive=true,puzzleSolved=false,correctMoves=0;
function loadPuzzle(){
  const p=puzzles[puzzleIndex%puzzles.length];board=structuredClone(p.position);turn=p.side;selected=null;moves=[];history=[];gameOver=false;
  rights={wK:false,wQ:false,bK:false,bQ:false};enPassant=null;halfmove=0;puzzleSolved=false;puzzleActive=true;
  document.getElementById('puzzleTheme').textContent=p.theme;document.getElementById('puzzleMeta').textContent=p.meta;
  document.getElementById('moveCount').textContent='0 / '+p.solution.length;
  document.getElementById('feedback').hidden=true;document.getElementById('sessionStatus').textContent='Puzzle mode';
  document.getElementById('score').textContent=correctMoves;clearResult();render();
}
function showFeedback(title,text,good){
  const f=document.getElementById('feedback');f.hidden=false;f.className='feedback '+(good?'good':'bad');
  document.getElementById('feedbackTitle').textContent=title;document.getElementById('feedbackText').textContent=text;
}
function puzzleMoveMatches(fr,fc,tr,tc){
  const target=puzzles[puzzleIndex%puzzles.length].solution[0];return target&&fr===target[0]&&fc===target[1]&&tr===target[2]&&tc===target[3];
}
function puzzleClick(r,c){
  if(!puzzleActive||puzzleSolved)return false;
  if(!selected){if(board[r][c]&&color(board[r][c])===turn){selected={r,c};render()}return true}
  if(!isLegal(selected.r,selected.c,r,c)){selected=null;render();return true}
  const fr=selected.r,fc=selected.c;
  if(puzzleMoveMatches(fr,fc,r,c)){
    makeMove(fr,fc,r,c);selected=null;puzzleSolved=true;puzzleActive=false;correctMoves++;document.getElementById('score').textContent=correctMoves;
    showFeedback('Correct — brilliant.','You found the forcing move. Try the next puzzle when ready.',true);
    document.getElementById('turnText').textContent='Puzzle solved';
  }else{
    selected=null;showFeedback('Not the move.','Look again for a forcing move before committing.',false);
  }
  render();return true;
}
const originalClickSquare=clickSquare;
clickSquare=function(r,c){if(puzzleActive){puzzleClick(r,c);return}originalClickSquare(r,c)};
const originalNewGame=newGame;
newGame=function(){puzzleIndex++;loadPuzzle()};
document.getElementById('newGameBtn').onclick=newGame;
document.getElementById('newGameTop').onclick=newGame;
document.getElementById('undoBtn').onclick=()=>loadPuzzle();
loadPuzzle();
