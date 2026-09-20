const files=['a','b','c','d','e','f','g','h'];let flipped=false,selected=null,turn='w',moves=[],history=[];

const start=[
 ['♜','♞','♝','♛','♚','♝','♞','♜'],
 ['♟','♟','♟','♟','♟','♟','♟','♟'],
 [null,null,null,null,null,null,null,null],
 [null,null,null,null,null,null,null,null],
 [null,null,null,null,null,null,null,null],
 [null,null,null,null,null,null,null,null],
 ['♙','♙','♙','♙','♙','♙','♙','♙'],
 ['♖','♘','♗','♕','♔','♗','♘','♖']
];
let board=structuredClone(start);
const white=new Set('♔♕♖♗♘♙'),black=new Set('♚♛♜♝♞♟');

function color(p){return white.has(p)?'w':black.has(p)?'b':null}
function render(){
 const el=document.getElementById('board');el.innerHTML='';
 const order=flipped?[...Array(8).keys()].reverse():[...Array(8).keys()];
 order.forEach(r=>order.forEach(c=>{
   const sq=document.createElement('div');sq.className='square '+((r+c)%2?'dark':'light');
   if(selected&&selected.r===r&&selected.c===c)sq.classList.add('selected');
   if(selected&&isLegal(selected.r,selected.c,r,c))sq.classList.add(board[r][c]?'capture':'legal');
   const p=board[r][c];if(p){const span=document.createElement('span');span.className='piece '+(color(p)==='w'?'white-piece':'black-piece');span.textContent=p;sq.appendChild(span)}
   sq.onclick=()=>clickSquare(r,c);el.appendChild(sq);
 }));
 renderCoords();updatePanel();
}
function renderCoords(){
 const f=document.getElementById('files'),r=document.getElementById('ranks');f.innerHTML='';r.innerHTML='';
 (flipped?[...files].reverse():files).forEach(x=>{const s=document.createElement('span');s.textContent=x;f.appendChild(s)});
 const nums=flipped?['1','2','3','4','5','6','7','8']:['8','7','6','5','4','3','2','1'];
 nums.forEach(x=>{const s=document.createElement('span');s.textContent=x;r.appendChild(s)});
}
function pseudoMoves(r,c){
 const p=board[r][c],t=color(p),kind=p?.toLowerCase();if(!p)return[];
 const out=[];const add=(rr,cc)=>{if(rr<0||rr>7||cc<0||cc>7)return false;if(!board[rr][cc]){out.push([rr,cc]);return true}if(color(board[rr][cc])!==t)out.push([rr,cc]);return false};
 if(kind==='p'){const d=t==='w'?-1:1;if(board[r+d]?.[c]==null){out.push([r+d,c]);if((t==='w'?r===6:r===1)&&board[r+2*d]?.[c]==null)out.push([r+2*d,c])}for(const dc of[-1,1])if(board[r+d]?.[c+dc]&&color(board[r+d][c+dc])!==t)out.push([r+d,c+dc])}
 if(kind==='n')[[1,2],[2,1],[-1,2],[-2,1],[1,-2],[2,-1],[-1,-2],[-2,-1]].forEach(([dr,dc])=>add(r+dr,c+dc));
 const rays={b:[[1,1],[1,-1],[-1,1],[-1,-1]],r:[[1,0],[-1,0],[0,1],[0,-1]],q:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]]};
 if(rays[kind])for(const [dr,dc] of rays[kind]){let rr=r+dr,cc=c+dc;while(rr>=0&&rr<8&&cc>=0&&cc<8){if(!add(rr,cc))break;rr+=dr;cc+=dc}}
 if(kind==='k')for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++)if(dr||dc)add(r+dr,c+dc);
 return out;
}
function isLegal(fr,fc,tr,tc){const p=board[fr][fc];return p&&color(p)===turn&&pseudoMoves(fr,fc).some(([r,c])=>r===tr&&c===tc)}
function notation(fr,fc,tr,tc,captured){const p=board[fr][fc],piece=p.toUpperCase();const names={'♙':'','♘':'N','♗':'B','♖':'R','♕':'Q','♔':'K','♟':'','♞':'N','♝':'B','♜':'R','♛':'Q','♚':'K'};return names[piece]+(captured?'x':'')+files[tc]+(8-tr)}
function clickSquare(r,c){
 if(!selected){if(board[r][c]&&color(board[r][c])===turn){selected={r,c};render()}return}
 if(isLegal(selected.r,selected.c,r,c)){makeMove(selected.r,selected.c,r,c);selected=null;turn=turn==='w'?'b':'w'}else if(board[r][c]&&color(board[r][c])===turn)selected={r,c};else selected=null;render();
}
function makeMove(fr,fc,tr,tc){
 history.push(structuredClone(board));const captured=!!board[tr][tc];const n=notation(fr,fc,tr,tc,captured);board[tr][tc]=board[fr][fc];board[fr][fc]=null;
 const p=board[tr][tc];if((p==='♙'&&tr===0)||(p==='♟'&&tr===7))board[tr][tc]=p==='♙'?'♕':'♛';
 moves.push(n);document.getElementById('score').textContent=moves.length;
}
function updatePanel(){
 document.getElementById('turnText').textContent=turn==='w'?'White to move':'Black to move';document.getElementById('turnPiece').textContent=turn==='w'?'♙':'♟';document.getElementById('moveCount').textContent=moves.length;
 const box=document.getElementById('moves');if(!moves.length){box.innerHTML='<div class="empty">Your moves will appear here.</div>';return}
 box.innerHTML='';for(let i=0;i<moves.length;i+=2){const row=document.createElement('div');row.className='move-row';row.innerHTML='<span class="num">'+(i/2+1)+'.</span><span>'+(moves[i]||'')+'</span><span>'+(moves[i+1]||'')+'</span>';box.appendChild(row)}box.scrollTop=box.scrollHeight;
}
function newGame(){board=structuredClone(start);turn='w';moves=[];history=[];selected=null;document.getElementById('score').textContent='0';render()}
document.getElementById('newGameBtn').onclick=newGame;document.getElementById('newGameTop').onclick=newGame;
document.getElementById('flipBtn').onclick=()=>{flipped=!flipped;render()};
document.getElementById('undoBtn').onclick=()=>{if(!history.length)return;board=history.pop();moves.pop();turn=turn==='w'?'b':'w';selected=null;document.getElementById('score').textContent=moves.length;render()};
document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='n'){e.preventDefault();newGame()}});
render();