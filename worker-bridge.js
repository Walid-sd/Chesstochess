(function(){
'use strict';
const NativeWorker=window.Worker;
if(typeof NativeWorker!=='function')return;
const LOCAL_ENGINE='/engine/stockfish.js';
function isStockfish(url){try{return /stockfish/i.test(new URL(String(url),location.href).pathname)}catch(_){return false}}
function BridgedWorker(url,options){
 if(!isStockfish(url))return new NativeWorker(url,options);
 // Production analysis must not depend on a third-party worker/CDN at runtime.
 // Netlify's build step vendors the lite single-thread Stockfish JS + WASM pair
 // under /engine, so both assets are same-origin and the worker can resolve its
 // companion WASM naturally beside the JS entry point.
 return new NativeWorker(LOCAL_ENGINE,options);
}
BridgedWorker.prototype=NativeWorker.prototype;
Object.setPrototypeOf(BridgedWorker,NativeWorker);
window.Worker=BridgedWorker;
window.ChesstochessWorkerBridge={native:NativeWorker,isStockfish,localEngine:LOCAL_ENGINE};
})();