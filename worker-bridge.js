(function(){
'use strict';
const NativeWorker=window.Worker;
if(typeof NativeWorker!=='function')return;
function isRemoteStockfish(url){try{const u=new URL(String(url),location.href);return u.origin!==location.origin&&/cdn\.jsdelivr\.net$/i.test(u.hostname)&&/stockfish/i.test(u.pathname)}catch(_){return false}}
function BridgedWorker(url,options){
 if(!isRemoteStockfish(url))return new NativeWorker(url,options);
 const absolute=new URL(String(url),location.href).href;
 const base=absolute.slice(0,absolute.lastIndexOf('/')+1);
 // Stockfish 16 single-threaded is a JS + WASM pair. Because the JS is
 // imported from a blob worker, Emscripten would otherwise try to resolve
 // its companion WASM relative to blob:, which never succeeds. Give the
 // module an explicit CDN asset resolver before importing the engine.
 const bootstrap=`self.Module=self.Module||{};self.Module.locateFile=function(path){return ${JSON.stringify(base)}+path};try{importScripts(${JSON.stringify(absolute)})}catch(error){setTimeout(function(){throw error},0)}`;
 const blobUrl=URL.createObjectURL(new Blob([bootstrap],{type:'text/javascript'}));
 const worker=new NativeWorker(blobUrl,options);
 const revoke=()=>URL.revokeObjectURL(blobUrl);
 worker.addEventListener('error',revoke,{once:true});
 setTimeout(revoke,30000);
 return worker;
}
BridgedWorker.prototype=NativeWorker.prototype;
Object.setPrototypeOf(BridgedWorker,NativeWorker);
window.Worker=BridgedWorker;
window.ChesstochessWorkerBridge={native:NativeWorker,isRemoteStockfish};
})();