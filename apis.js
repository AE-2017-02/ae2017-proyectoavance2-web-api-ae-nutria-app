'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
var router=express.Router();


app.use(bodyParser.json({limit: '50mb'}));
app.use(function (req, res, next) {
    // res.append('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.append('Access-Control-Allow-Origin', '*');
    res.append('Access-Control-Allow-Credentials', 'true');
    res.append('Access-Control-Allow-Methods', ['GET', 'OPTIONS', 'PUT', 'POST','DELETE']);
    res.append('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, responseType');
    //res.append('Access-Control-Allow-Headers', '*');
    next();
});

app.use('/static', express.static(__dirname + '/imagen'));
app.use('/api/v1',router);
require('./Routers/routes')(router);
module.exports = app;
