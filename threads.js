const {Worker, isMainThread, parentPort, workerData} = require('worker_threads');

if(isMainThread) {
    const worker = new Worker(__filename, {workerData: 1});
    worker.on('message', message => console.log(message));
}else {
    const someMath = workerData + 2;
    parentPort.postMessage(someMath);
}