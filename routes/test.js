const express = require('express');
const fb = require('fibonacci');
const runFibonacci = require('../workers/fibonacciWorker');
const runFibonacciPool = require('../workers/fibonacciWorkerPool');
const runFibonacciShared = require('../workers/fibonacciWorkerShared');
const runFibonacciWithoutPromise = require('../workers/fibonacci');
const log = require('../log');

const router = express.Router();
//Usando o cálculo fibonacci pra representar um cálculo matemático que demora muito pra ser resolvido. 
//Este primeiro exemplo é uma thread bloquenate, ele faz 10 mil iteracoes, e ao terminar, devolve o valor calculado, bloqueando a thread principal. 
router.get('/fibonacci', (req, res) => {
  const number = fb.iterate(10000);
  res.send(number);
});

//Aqui ele tá chamando o runFibonacci que retorna uma promise e deixando o res.send chumbado no processing
//O runFibonacci abre uma worker, aqui não entendi a diferença do rubFibonacci ser uma worker thread vs apenas um código assincrono que roda paralelamente.
router.get('/fibonacciThreaded', async (req, res) => {
  runFibonacci({ iterations: 10000 }).then(result => log.info(result));
  res.send('processing');
});

//Aqui é só um experimento em fazer a chamada sem ser promise
//Resultado é o mesmo aparentemente, o runFibonacciWithoutPromise funciona como assincrono mesmo não sendo promise
//Parece que ao usar worker threads dentro da função ela vira assincrona
router.get('/fibonacciThreadedWithouPromise', async (req, res) => {
   runFibonacciWithoutPromise({ iterations: 10000 });
  res.send('processing');
});


//Aqui faz a chamada pra uma mesma função que cria worker threads porém mais "inteligente" limitando a cpu
router.get('/fibonacciThreadedPool', async (req, res) => {
  runFibonacciPool({ iterations: 10000 }).then(result => log.info(result));
  res.send('processing');
});


router.get('/fibonacciThreadedShared', async (req, res) => {
  /**
   * Uses shared SharedArrayBuffer to share data with the workers
   */
  //Iniciando um sharedArrayBuffer de 8 bits
  //Se não usar shared array ele vai dar empty positions pras primeiras posicoes do array a cada iteracao de chamada de worker. 
  const sharedUint8Array = new Uint8Array(new SharedArrayBuffer(4));

  //Chamando 4 threads, onde o retorno delas é adicionado no array 
  for (let i = 0; i < 4; i++) {
    //Esse sharedUint8Array não é copiado como objeto ao passar parametro, ele é compartilhado na memória entre todas os workers.
    //
    runFibonacciShared({ iterations: 1000, position: i, arr: sharedUint8Array }).then(result => console.log(result));
  }
  res.send('processing');
});

module.exports = router;