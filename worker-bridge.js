(function(){
'use strict';
const NativeWorker=window.Worker;
if(typeof NativeWorker!=='function')return;
function isRemoteStockfish(url){try{const u=new URL(String(url),location.href);return u.origin!==location.origin&&/cdn\.jsdelivr\.net$/i.test(u.hostname)&&/stockfish/i.test(u.pathname)}catch(_){return false}}
function BridgedWorker(url,options){if(!isRemoteStockfish(url))return new NativeWorker(url,options);const absolute=new URL(String(url),location.href).href;const bootstrap=`try{importScripts(${JSON.stringify(absolute)})}catch(error){self.postMessage('__chesstochess_worker_error__:'+String(error&&error.message||error))}`;const blobUrl=URL.createObjectURL(new Blob([bootstrap],{type:'text/javascript'}));const worker=new NativeWorker(blobUrl,options);const revoke=()=>URL.revokeObjectURL(blobUrl);worker.addEventListener('error',revoke,{once:true});setTimeout(revoke,15000);return worker}
BridgedWorker.prototype=NativeWorker.prototype;
Object.setPrototypeOf(BridgedWorker,NativeWorker);
window.Worker=BridgedWorker;
window.ChesstochessWorkerBridge={native:NativeWorker,isRemoteStockfish};
})();