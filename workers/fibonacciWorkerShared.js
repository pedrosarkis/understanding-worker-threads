const fb = require('fibonacci');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const runFibonacci = workerData => {
  return new Promise((resolve, reject) => {
    const worker = new Worker(__filename, { workerData });
    worker.on('message', resolve);
    worker.on('error', reject);
    worker.on('exit', code => {
      if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
    });
  });
};

/**
 * If it's not the main thread it's one of the Worker threads
 */
if (!isMainThread) {
  //Shared Array Buffer são instancias de array binarios que compartilham memória 
  const sharedArray = workerData.arr;
  const result = fb.iterate(workerData.iterations);
  /**
   * Adds items to the shared array in a safe way
   */

   //Atomic vai controlar o acesso aos shared arrays, 
   //Ele vai garantir que não vai ter 2 workers ou mais escrevendo na mesma posição do array ao mesmo tempo. 
  Atomics.add(sharedArray, workerData.position, result.ms);

  //Devolve a mensagem pra main thread.
  parentPort.postMessage(sharedArray);
}

module.exports = runFibonacci;