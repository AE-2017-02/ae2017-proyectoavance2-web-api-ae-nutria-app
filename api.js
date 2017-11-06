var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var funcional = require('underscore');
var assert = require('assert');
var mongoose = require('mongoose');

module.exports = function (wagner) {
  var api = express.Router();
  api.use(bodyparser.json());

  //Usuarios
  //Autenticar In {Usuario:{Usuario:"",Pin:""}} 
  //Out IdUsuario IdPaciente
  api.post('/auth', wagner.invoke(function (Usuario) {
    return function (req, res) {
      try {
        var datos = req.body.Usuario;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ error: 'Usuario no especificado!' });
      }

      try {
        Usuario.findOne(
          { "cNombre": datos.Usuario, "bEstado": true }, function (error, user) {
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
            }
            if (!user) {
              return res.status(status.NOT_FOUND).json({ Error: 'Usuario inexistente' });
            }
            if (user.nIdPaciente.cPin != datos.Pin)
              return res.status(status.NOT_FOUND).json({ Error: 'Usuario inexistente' });

            return res.json({ Usuario: user });
          }).select({ cNombre: 1, cImagen: 1 }).populate({
            path: "nIdPaciente", model: "Paciente", select: {
              'oGenerales.cEmail': 1, 'cPin': 1, '_id': 1
            }
          });
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: e.message });
      }
    };
  }));


  //Regresa todos los usuarios Out [Usuario:{}]
  api.get('/user', wagner.invoke(function (Usuario) {
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
  // api.post('/user/add', wagner.invoke(function (Usuario) {
  //   return function (req, res) {
  //     try {
  //       var datos = req.body.Usuario;
  //     }
  //     catch (e) {
  //       return res.status(status.BAD_REQUEST).json({ Error: 'Usuario no especificado!' });
  //     }

  //     /*Usuario.findOne({
  //       "cNombre": datos.cNombre
  //     }, function (error, user) {

  //       if (error) {
  //         return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
  //       }
  //       if (user) {
  //         return res.status(status.CONFLICT).json({ error: 'El usuario ya existe' });
  //       }
  //       Usuario.create(datos, function (error, usuario) {
  //         if (error) {
  //           return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
  //         }
  //         return res.json({ Usuario: usuario });
  //       });
  //     });*/
  //     Usuario.findOne({
  //       "cNombre": datos.cNombre
  //     }, function (error, user) {

  //       if (error) {
  //         return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
  //       }
  //       if (user) {
  //         return res.status(status.CONFLICT).json({ Error: 'El usuario ya existe' });
  //       }
  //       // Usuario.create(datos, function (error, usuario) {
  //       //   if (error) {
  //       //     return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
  //       //   }
  //       //return res.json({ Usuario: usuario });
  //       //});
  //       return res.json({ Usuario: user });
  //     }).populate(
  //       {
  //         path: "nIdPaciente", model: "Paciente", select: {
  //           'oGenerales.cEmail': 1, '_id': 1
  //         }
  //       });
  //   };
  // }));



  api.post('/user/add', wagner.invoke(function (Usuario, Paciente) {
    return function (req, res) {
      try {
        var datos = req.body.Usuario;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Error: 'Usuario no especificado!' });
      }
      try {
        var Paciente = mongoose.model('Paciente', require('./Schemas/paciente'), 'paciente');
        Paciente.findOne({
          "cPin": datos.Pin,
          "oGenerales.cEmail": datos.Email
        }, function (error, paciente) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
          }
          if (!paciente) {
            return res.status(status.CONFLICT).json({ Error: 'El paciente no existe' });
          }
          Usuario.findOne({ "cNombre": datos.Nombre }, function (error, user) {
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
            }

            if (user) {
              if (mongoose.Schema.Types.ObjectId(user.nIdPaciente) == mongoose.Schema.Types.ObjectId(paciente._id)) {
                return res.status(status.CONFLICT).json({ Error: 'El paciente ya tiene un usuario asignado' });
              }
              else {
                return res.status(status.CONFLICT).json({ Error: 'El usuario ya existe' });
              }
            }
            Usuario.create({ "cNombre": datos.Nombre, "cImagen": datos.Imagen, "nIdPaciente": paciente._id },
              function (error, user) {
                if (error) {
                  return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
                }
                if (!user) {
                  return res.status(status.CONFLICT).json({ Error: 'Problema al registrar el usuario' });
                }
                return res.status(status.OK).json({ "Response": "OK" });
              });

          })
        });
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: e.message });
      }
    };
  }));

  //Actualización de Usuario
  // IN {"Usuario":{"_id":121212, "Nombre" : "LaYare2", "Pin" : "1234", Estado:false}}
  // OUT {Usuario:Usuario}
  api.post('/user/update', wagner.invoke(function (Usuario) {
    return function (req, res) {
      try { var datos = req.body.Usuario; }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Error: 'Usuario no especificado!' });
      }
      Usuario.findOne({ "cNombre": datos.Nombre, "_id": { "$ne": datos._id } }, function (error, user) {
        if (error) {
          return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
        }
        if (user) {
          return res.status(status.CONFLICT).json({ Error: 'El usuario ya existe' });
        }
        Usuario.findOneAndUpdate({ "_id": datos._id }, {
          $set: {
            'cNombre': datos.Nombre,
            'cPin': datos.Pin,
            'bEstado': datos.Estado
          }
        }, { runValidators: true }, function (error, user) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
          }
          return res.json({ Usuario: user });
        })
      });
    }
  }));



  //Regresa todos los pacientes Out [Paciente:{}]
  api.get('/patient', wagner.invoke(function (Paciente) {
    return function (req, res) {
      Paciente.find().exec(handleMany.bind(null, 'Pacientes', res))
    }
  }));


  /*IN 
    {
    "Paciente":  {  			
    "Generales":{
      "Nombre" : "LaYare2", 
      "ApellidoP" : "Garcia2",
      "ApellidoM":"Carlos2",
      "Sexo":"Masculino",
      "Email":"kervin2222@gmail.com",
      "Telefono":"2-10-28-29",
      "FechaNac": "1995-01-02"		
    },
       "Antecedentes": {
                "PesoHabitual": 0,
                "ObesidadFamiliar":false,
                "Colesterol":false,
                "Hipertension":false,
                "Alcohol":false,
                "Tabaco":false,
                "Diabetes":false,
                "Hipertension":false
              },
  "Extra":{
    "Notas":"No le gustan los nopales",
    "Patologia": "",
    "Alergia": "",
    "Medicamentos": "",
    "Meta": ""
      }		
    }
  }
   OUT {Response:OK}*/
  api.post('/patient/add', wagner.invoke(function (Paciente) {
    return function (req, res) {
      try {
        var datos = req.body.Paciente;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Error: 'Paciente no especificado!' });
      }

      try {
        Paciente.findOne({
          "oGenerales.cEmail": datos.Generales.Email
        }, function (error, patient) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
          }
          if (patient) {
            return res.status(status.CONFLICT).json({ Error: 'El correo ya esta registrado' });
          }

          Paciente.create({
            cPin: Token(),
            oGenerales: {
              cNombre: datos.Generales.Nombre,
              cApellidoP: datos.Generales.ApellidoP,
              cApellidoM: datos.Generales.ApellidoM,
              cSexo: datos.Generales.Sexo,
              cEmail: datos.Generales.Email,
              cTelefono: datos.Generales.Telefono,
              dFechaNac: new Date(datos.Generales.FechaNac)
            },
            oAntecedentes: {
              nPesoHabitual: datos.Antecedentes.PesoHabitual,
              bObesidadFamiliar: datos.Antecedentes.ObesidadFamiliar,
              bColesterol: datos.Antecedentes.Colesterol,
              bHipertension: datos.Antecedentes.Hipertension,
              bAlcohol: datos.Antecedentes.Alcohol,
              bTabaco: datos.Antecedentes.Tabaco,
              bDiabtes: datos.Antecedentes.Diabetes,
              bHipertension: datos.Antecedentes.Hipertension,
            },
            oExtra: {
              cNotas: datos.Extra.Notas,
              cPatologia: datos.Extra.Patologia,
              cAlergia: datos.Extra.Alergia,
              cMedicamentos: datos.Extra.Medicamentos,
              cMeta: datos.Extra.Meta,
            }
          }, function (error, paciente) {
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error });
            }
            return res.status(status.OK).json({ Response: "OK" });//json({ Paciente: paciente });
          });
        });
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: e.message });
      }
    };
  })
  );

  //Actualización de Usuario
  // IN {"Usuario":{"_id":121212, "Nombre" : "LaYare2", "Pin" : "1234", Estado:false}}
  // OUT {Usuario:Usuario}
  // api.post('/user/update', wagner.invoke(function (Usuario) {
  //   return function (req, res) {
  //     try { var datos = req.body.Usuario; }
  //     catch (e) {
  //       return res.status(status.BAD_REQUEST).json({ error: 'Usuario no especificado!' });
  //     }
  //     Usuario.findOne({ "cNombre": datos.Nombre, "_id": { "$ne": datos._id } }, function (error, user) {
  //       if (error) {
  //         return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
  //       }
  //       if (user) {
  //         return res.status(status.CONFLICT).json({ error: 'El usuario ya existe' });
  //       }

  //       Usuario.findOneAndUpdate({ "_id": datos._id }, {
  //         $set: {
  //           'cNombre': datos.Nombre,
  //           'cPin': datos.Pin,
  //           'bEstado': datos.Estado
  //         }
  //       }, { runValidators: true }, function (error, user) {
  //         if (error) {
  //           return res.status(status.INTERNAL_SERVER_ERROR).json({ error: error.toString() });
  //         }
  //         return res.json({ Usuario: user });
  //       })
  //     });
  //   }
  // }));
  return api;
}

function Token() {
  return parseInt(Math.random() * 10000);
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


