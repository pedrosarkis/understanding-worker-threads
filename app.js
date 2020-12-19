const express = require('express');
const app = express();
const routerTest = require('./routes/test');

app.use('/', routerTest);

app.listen(3000);

