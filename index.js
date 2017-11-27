'use strict'
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const config = require('./config');
const app = require('./apis');
mongoose.connect(config.db,{ useMongoClient: true },(err, res) => {
  if (err) {
    return console.log(`Error al conectar a la base de datos: ${err}`)
  }
  app.listen(config.port, () => {
    console.log('API REST corriendo en 3000');
  })
})


// var express=require('express');
// var wagner=require('wagner-core');
// var session=require('express-session');

// require('./modelo')(wagner);


// var app=express();
//  app.use(session({secret:'esto es un secreto'}));
//  app.use(function(req, res, next) {
//   res.append('Access-Control-Allow-Origin', req.headers.origin || '*');
//   res.append('Access-Control-Allow-Credentials', 'true');
//   res.append('Access-Control-Allow-Methods', ['GET', 'OPTIONS', 'PUT', 'POST']);
//   res.append('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept');
//   next();
// });


// //wagner.invoke(require('./auth'), { app: app });
// app.use('/api/v1',require('./api')(wagner));
// app.listen(3000);
// console.log('Listening on port 3000');
