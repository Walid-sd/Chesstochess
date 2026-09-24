(function(){
'use strict';
const V={p:1,n:3,b:3,r:5,q:9,k:100};
const color=p=>!p?null:p===p.toUpperCase()?'w':'b',type=p=>p?.toLowerCase();
function parse(fen){if(!fen)return null;const rows=fen.split(' ')[0].split('/'),b={};for(let r=0;r<8;r++){let c=0;for(const ch of rows[r]){if(/\d/.test(ch))c+=+ch;else{b['abcdefgh'[c]+(8-r)]=ch;c++}}}return b}
function xy(s){return['abcdefgh'.indexOf(s[0]),+s[1]-1]}
function sq(x,y){return x>=0&&x<8&&y>=0&&y<8?'abcdefgh'[x]+(y+1):null}
function attacks(b,from){const p=b[from];if(!p)return[];const [x,y]=xy(from),t=type(p),side=color(p),out=[];const add=(dx,dy)=>{const z=sq(x+dx,y+dy);if(z)out.push(z)};if(t==='n')[[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]].forEach(d=>add(...d));else if(t==='k')for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++)if(dx||dy)add(dx,dy);else if(t==='p'){const d=side==='w'?1:-1;add(-1,d);add(1,d)}else{const dirs=t==='b'?[[1,1],[1,-1],[-1,1],[-1,-1]]:t==='r'?[[1,0],[-1,0],[0,1],[0,-1]]:[[1,1],[1,-1],[-1,1],[-1,-1],[1,0],[-1,0],[0,1],[0,-1]];for(const[dX,dY]of dirs){let X=x+dX,Y=y+dY;while(sq(X,Y)){const z=sq(X,Y);out.push(z);if(b[z])break;X+=dX;Y+=dY}}}return out}
function attackers(b,target,side){return Object.keys(b).filter(s=>color(b[s])===side&&attacks(b,s).includes(target))}
function defended(b,target,side){return attackers(b,target,side).length>0}
function rayPin(b,side){const pins=[];for(const[k,p]of Object.entries(b)){if(type(p)!=='k'||color(p)!==side)continue;const[x,y]=xy(k);for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){let X=x+dx,Y=y+dy,block=null;while(sq(X,Y)){const z=sq(X,Y),q=b[z];if(q){if(!block&&color(q)===side&&type(q)!=='k')block=z;else{if(block&&color(q)!==side){const t=type(q),diag=dx&&dy;if((diag&&(t==='b'||t==='q'))||(!diag&&(t==='r'||t==='q')))pins.push({piece:block,king:k,attacker:z})}break}}X+=dx;Y+=dy}}}return pins}
function detect(move){const before=parse(move?.beforeFen),after=parse(move?.afterFen);if(!before||!after)return[];const side=move.color||color(before[move.from]),opp=side==='w'?'b':'w',tags=[];const moved=after[move.to];if(moved){const targets=attacks(after,move.to).filter(s=>after[s]&&color(after[s])===opp);const valuable=targets.filter(s=>(V[type(after[s])]||0)>=3||type(after[s])==='k');if(valuable.length>=2)tags.push('fork');if(targets.some(s=>type(after[s])==='k'))tags.push('check')}
for(const[s,p]of Object.entries(after))if(color(p)===opp&&type(p)!=='k'){const atk=attackers(after,s,side),def=defended(after,s,opp);if(atk.length&&!def&&(V[type(p)]||0)>=3)tags.push('hanging-piece')}
if(rayPin(after,opp).some(x=>x.attacker===move.to))tags.push('pin');
const cap=before[move.to];if(cap&&color(cap)===opp)tags.push('capture');
return[...new Set(tags)]}
window.ChesstochessMotifDetector=Object.freeze({detect,parse,attacks,attackers,rayPin});
})();