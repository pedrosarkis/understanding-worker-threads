const fb = require('fibonacci');
const { isMainThread, parentPort, workerData } = require('worker_threads');

//Instanciando uma nova pool
const Pool = require('worker-threads-pool');



//Pegando a quantidade de CPU do Sistema operacional
const CPUs = require('os').cpus().length;


//Limita a quantidade de cpu da pool a quantidade de cpu que possui no SO
//Isso é útil para não travar a máquina em várias chamadas seguidas do mesmo serviço 
//Em um cenário onde não usa limite de cpu, se o usuário fizer o request 200x 
//Vai criando worker simultaneas e a memória /cpu acaba 
//Com limite de cpu ele espera 1 cpu liberar,pra dai então criar outra pool
//Enquanto isso elas ficam numa espécie de fila
const pool = new Pool({ max: CPUs });


const runFibonacci = workerData => {
  return new Promise((resolve, reject) => {
    //Pool.acquire fica em volta do worker, ele que inicia o worker internamente, e a assinatura da function é a mesma.
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

//A única grande vantagem da pool é limitar a quantidade de threads limitadas a cpu, é basicamente necessário sempre fazer um pool, para performance e segurança.

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