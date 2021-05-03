export default function(url: URL | string,onMessage: (msg:any)=>void, options?:any){
    let worker: Worker = null
    let terminate: Worker["terminate"] = ()=>undefined
    if (typeof (Worker) != "undefined") { 
        // "../web-worker/init-data.js"
        worker = new Worker(url); 
        worker.onmessage = onMessage
        terminate = worker.terminate
        worker.postMessage(options)
    } 
    else {
       console.warn('不支持WebWorker')
    }
    return terminate
}