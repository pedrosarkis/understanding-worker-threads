const {Worker, isMainThread, parentPort, workerData} = require('worker_threads');
//worker threads é uma funcionalidade nativa do node.js 
//Altamente recomenada para tarefas que requerem um altissimo uso de CPU (calculo matematico, parsing, etc..)
//Não há ganho nenhum usar worker Threads em operacoes I/O, pois a libuv já é completamente otimizada para isso. 

if(isMainThread) {
    //Quando adicionamos  um worker, ele recebe um arquivo como parâmetro
    //Neste exemplo estamos passando este próprio arquivo, e um dado por parâmetro, que deverá ser sempre com a chave workerData
    //Quando esse worker rodar, ele vai chamar este próprio arquivo, que naõ será a main Thread, pois é um worker,  portanto cairá no else.
    const worker = new Worker(__filename, {workerData: 1});
    worker.on('message', message => console.log(message));
}else {
    //Executará a conta com o parâmetro passado
    //Devolvera a resolução para a main thread que chamou ela, através do comando parentPort.postMessage
    const someMath = workerData + 2;
    parentPort.postMessage(someMath);
}

