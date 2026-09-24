(function(){
'use strict';
const FILES='abcdefgh';
function parse(fen){if(!fen)return null;const parts=fen.split(' '),rows=parts[0].split('/'),board={};for(let r=0;r<8;r++){let c=0;for(const ch of rows[r]){if(/\d/.test(ch))c+=+ch;else{board[FILES[c]+(8-r)]=ch;c++}}}return{board,turn:parts[1]||'w',castling:parts[2]||'-',ep:parts[3]||'-',halfmove:+parts[4]||0,fullmove:+parts[5]||1}}
function color(p){return!p?null:p===p.toUpperCase()?'w':'b'}
function apply(fen,uci){const s=parse(fen);if(!s||!uci||uci.length<4)return null;const from=uci.slice(0,2),to=uci.slice(2,4),promotion=uci[4]?.toLowerCase(),p=s.board[from];if(!p||color(p)!==s.turn)return null;const side=s.turn,t=p.toLowerCase(),fromFile=FILES.indexOf(from[0]),toFile=FILES.indexOf(to[0]),fromRank=+from[1],toRank=+to[1],capture=!!s.board[to];
// en passant capture
if(t==='p'&&to===s.ep&&!s.board[to]&&fromFile!==toFile){delete s.board[to[0]+from[1]]}
// castling rook movement
if(t==='k'&&Math.abs(toFile-fromFile)===2){const rank=side==='w'?'1':'8',kingSide=toFile>fromFile,rf=(kingSide?'h':'a')+rank,rt=(kingSide?'f':'d')+rank;if(s.board[rf]){s.board[rt]=s.board[rf];delete s.board[rf]}}
delete s.board[from];let placed=p;if(t==='p'&&(toRank===8||toRank===1))placed=side==='w'?(promotion||'q').toUpperCase():(promotion||'q');s.board[to]=placed;
let cast=s.castling==='-'?'':s.castling;if(t==='k')cast=side==='w'?cast.replace(/[KQ]/g,''):cast.replace(/[kq]/g,'');if(from==='a1'||to==='a1')cast=cast.replace('Q','');if(from==='h1'||to==='h1')cast=cast.replace('K','');if(from==='a8'||to==='a8')cast=cast.replace('q','');if(from==='h8'||to==='h8')cast=cast.replace('k','');
let ep='-';if(t==='p'&&Math.abs(toRank-fromRank)===2)ep=from[0]+((fromRank+toRank)/2);const half=(t==='p'||capture)?0:s.halfmove+1,full=s.fullmove+(side==='b'?1:0),turn=side==='w'?'b':'w';return stringify({board:s.board,turn,castling:cast||'-',ep,halfmove:half,fullmove:full})}
function stringify(s){const rows=[];for(let rank=8;rank>=1;rank--){let row='',empty=0;for(const f of FILES){const p=s.board[f+rank];if(p){if(empty){row+=empty;empty=0}row+=p}else empty++}if(empty)row+=empty;rows.push(row)}return`${rows.join('/')} ${s.turn} ${s.castling} ${s.ep} ${s.halfmove} ${s.fullmove}`}
window.ChesstochessFenMove=Object.freeze({parse,apply,stringify});
})();