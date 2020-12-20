const fb = require('fibonacci');
const { isMainThread, parentPort, workerData } = require('worker_threads');
const Pool = require('worker-threads-pool');

//Ele pega a quantidade de núcleos que tem no sistema operacional que está executando a pool
//No caso do meu pc, 12
const CPUs = require('os').cpus().length;

//Limita a quantidade de cpu da pool a quantidade de cpu que possui no SO
//Isso é útil para não travar a máquina em várias chamadas seguidas do mesmo serviço 
//Em um cenário onde não usa limite de cpu, se o usuário fizer o request 200x 
//Vai criando worker simultaneas e a memória /cpu acaba 
//Com limite de cpu ele espera 1 cpu liberar,pra dai então criar outra pool
//Enquanto isso elas ficam numa espécie de fila
const pool = new Pool({ max: CPUs });

console.log(pool);

const runFibonacci = workerData => {
  return new Promise((resolve, reject) => {
    pool.acquire(__filename, { workerData }, (err, worker) => {
      if (err) reject(err);
      console.log(`started worker ${worker} (pool size: ${pool.size})`);
      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', code => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  });
};

/**
 * If it's not the main thread it's one of the Worker threads
 */
if (!isMainThread) {
  const result = fb.iterate(workerData.iterations);
  /**
   * Send a copy the result object back to the main Thread
   */
  parentPort.postMessage(result);
}

module.exports = runFibonacci;