const fb = require('fibonacci');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const runFibonacci = workerData => {
    const worker = new Worker(__filename, { workerData });
    worker.on('message', result => console.log(result));
};

/**
 * If it's not the main thread it's one of the Worker threads
 */
if (!isMainThread) {
  const result = fb.iterate(workerData.iterations);
  parentPort.postMessage(result);
}

module.exports = runFibonacci;