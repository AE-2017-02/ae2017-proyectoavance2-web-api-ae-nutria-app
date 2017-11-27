'use strict'

const services = require('../Service/functions')
var status = require('http-status');
function isAuth (req, res, next) {
  if (!req.headers.authorization) {
    return res.status(403).send({Codigo: status.NOT_FOUND, Mensaje: 'No tienes autorización', Detalle: '' });
  }

  const token = req.headers.authorization.split(' ')[1]

  services.decodeToken(token)
    .then(response => {
      req.user = response
      next()
    })
    .catch(response => {
      res.status(response.status)
    })
}
module.exports = isAuth