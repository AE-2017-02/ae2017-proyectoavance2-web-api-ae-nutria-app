
'use strict'
const jwt = require('jwt-simple')
const moment = require('moment')
const config = require('../config')
var status = require('http-status');

function pin() {
  return parseInt(Math.random() * 10000);
}

function handleOne(property, res, error, result) {
  if (error) {
    return res.
      status(status.INTERNAL_SERVER_ERROR).
      json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.message });
  }
  if (!result) {
    return res.
      status(status.NOT_FOUND).
      json({ Codigo: status.NOT_FOUND, Mensaje: "Elemento no encontrado", Detalle: '' });
  }

  var json = {};
  json.Codigo = status.OK;
  json.Mensaje = 'Operación existosa';
  json[property] = result;
  res.json(json);
}

function handleMany(property, res, error, result) {
  if (error) {
    return res.
      status(status.INTERNAL_SERVER_ERROR).
      json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.message });
  }
  var json = {};
  json.Codigo = status.OK;
  json.Mensaje = 'Operación existosa';
  json[property] = result;
  res.json(json);
}


function createToken(user) {
  const payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(2, 'days').unix()
  }
  return jwt.encode(payload, config.SECRET_TOKEN)
}

function decodeToken(token) {
  const decoded = new Promise((resolve, reject) => {
    try {
      const payload = jwt.decode(token, config.SECRET_TOKEN)

      if (payload.exp <= moment().unix()) {
        reject({
          status: 401,
          message: 'El token ha expirado'
        })
      }
      resolve(payload.sub)
    } catch (err) {
      reject({
        status: 500,
        message: 'Invalid Token'
      })
    }
  })

  return decoded
}

module.exports = {
  pin,
  handleMany,
  handleOne,
  createToken,
  decodeToken
}