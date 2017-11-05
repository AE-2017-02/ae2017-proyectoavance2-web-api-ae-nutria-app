var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var funcional = require('underscore');
var assert = require('assert');

module.exports = function (wagner) {
  var api = express.Router();
  api.use(bodyparser.json());

  //Usuarios
  //Autenticar In {Usuario:{Nombre:"",Pin:""}} Out IdUsuario IdPaciente
  api.post('/auth', wagner.invoke(function (Usuario) {
    return function (req, res) {
      try {
        var datos = req.body.Usuario;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ error: 'Usuario no especificado!' });
      }
      Usuario.findOne(
        { "cNombre": datos.Nombre, "cPin": datos.Pin, "cEstado": true }, function (error, user) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
          }
          if (!user) {
            return res.status(status.NOT_FOUND).json({ error: 'Usuario inexistente' });
          }
          return res.json({ "IdUsuario": user._id, "IdPaciente": user.nIdPaciente });
        });
    };
  }));

  //Regresa todos los usuarios Out [Usuario:{}]
  api.get('/usuario', wagner.invoke(function (Usuario) {
    return function (req, res) {
      Usuario.find().populate(
        {
          path: "nIdPaciente", model: "Paciente", select: {
            'oGenerales.cNombre': 1, 'oGenerales.cApellidoP': 1, 'oGenerales.cApellidoM': 1, '_id': 0
          }
        }).
        exec(handleMany.bind(null, 'Usuarios', res))
    }
  }));


  // IN {"Usuario":{"cNombre" : "LaYare2", "cPin" : "1234", "nIdPaciente" :"59febbc5dc3320d82c139d1c" }}
  // OUT {Usuario:Usuario}
  api.post('/usuario/add', wagner.invoke(function (Usuario) {
    return function (req, res) {
      try {
        var datos = req.body.Usuario;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ error: 'Usuario no especificado!' });
      }
      Usuario.findOne({
        "cNombre": datos.cNombre
      }, function (error, user) {

        if (error) {
          return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
        }
        if (user) {
          return res.status(status.CONFLICT).json({ error: 'El usuario ya existe' });
        }
        Usuario.create(datos, function (error, usuario) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
          }
          return res.json({ Usuario: usuario });
        });
      });
    };
  }));

  //Actualización de Usuario
  // IN {"Usuario":{"_id":121212, "Nombre" : "LaYare2", "Pin" : "1234", Estado:false}}
  // OUT {Usuario:Usuario}
  api.post('/usuario/update', wagner.invoke(function (Usuario) {
    return function (req, res) {
      try { var datos = req.body.Usuario; }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ error: 'Usuario no especificado!' });
      }
      Usuario.findOne({ "cNombre": datos.Nombre,"_id":{"$ne":datos._id} }, function (error, user) {
        if (error) {
          return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
        }
        if (user) {
          return res.status(status.CONFLICT).json({ error: 'El usuario ya existe' });
        }
console.log(user);
        Usuario.findOneAndUpdate({ "_id": datos._id }, {
          $set: {
            'cNombre': datos.Nombre,
            'cPin': datos.Pin,
            'bEstado': datos.Estado
          }
        }, { runValidators: true }, function (error, user) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
          }
          return res.json({ Usuario: user });
        })
      });
    }
  }));
  return api;
}


function handleOne(property, res, error, result) {
  if (error) {
    return res.
      status(status.INTERNAL_SERVER_ERROR).
      json({ error: error.toString() });
  }
  if (!result) {
    return res.
      status(status.NOT_FOUND).
      json({ error: 'Not found' });
  }

  var json = {};
  json[property] = result;
  res.json(json);
}

function handleMany(property, res, error, result) {
  if (error) {
    return res.
      status(status.INTERNAL_SERVER_ERROR).
      json({ error: error.toString() });
  }
  var json = {};
  json[property] = result;
  res.json(json);
}


