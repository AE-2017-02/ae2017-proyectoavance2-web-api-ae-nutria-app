var bodyparser = require('body-parser');
var express = require('express');
var status = require('http-status');
var funcional = require('underscore');
var assert = require('assert');
var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
module.exports = function (wagner) {
  var api = express.Router();
  api.use(bodyparser.json());

  //Usuarios
  //Autenticar In {Usuario:{Usuario:"",Pin:""}} 
  //Out IdUsuario IdPaciente
  api.get('/auth', wagner.invoke(function (Usuario) {
    return function (req, res) {
      try {
        var datos = req.body.Usuario;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Usuario no especificado', Detalle: e.message });
      }

      try {
        Usuario.findOne(
          { "cNombre": datos.Usuario, "bEstado": true }, function (error, user) {
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!user) {
              return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Usuario inexistente', Detalle: '' });
            }
            if (user.nIdPaciente.cPin != datos.Pin)
              return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Usuario inexistente', Detalle: '' });

            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: user });
          }).select({ cNombre: 1, cImagen: 1 }).populate({
            path: "nIdPaciente", model: "Paciente", select: {
              'oGenerales.cEmail': 1, 'cPin': 1, '_id': 1
            }
          });
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Problema al autenticar", Detalle: e.message });
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

  api.post('/user/add', wagner.invoke(function (Usuario, Paciente) {
    return function (req, res) {
      try {
        var datos = req.body.Usuario;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Usuario no especificado', Detalle: error.toString() });
      }
      try {
        var Paciente = mongoose.model('Paciente', require('./Schemas/paciente'), 'paciente');
        Paciente.findOne({
          "cPin": datos.Pin,
          "oGenerales.cEmail": datos.Email
        }, function (error, paciente) {
          if (error) {
            //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }
          if (!paciente) {
            //return res.status(status.CONFLICT).json({ Error: 'El paciente no existe' });
            return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Paciente inexistente', Detalle: '' });
          }
          Usuario.findOne({ "cNombre": datos.Nombre }, function (error, user) {
            if (error) {
              //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }

            if (user) {
              if (mongoose.Schema.Types.ObjectId(user.nIdPaciente) == mongoose.Schema.Types.ObjectId(paciente._id)) {

                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "El paciente ya tiene un usuario asignado", Detalle: '' });
                //return res.status(status.CONFLICT).json({ Error: 'El paciente ya tiene un usuario asignado' });
              }
              else {
                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "El usuario ya existe", Detalle: '' });
                //return res.status(status.CONFLICT).json({ Error: 'El usuario ya existe' });
              }
            }
            Usuario.create({ "cNombre": datos.Nombre, "cImagen": datos.Imagen, "nIdPaciente": paciente._id },
              function (error, user) {
                if (error) {
                  return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                  // return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
                }
                if (!user) {
                  //return res.status(status.CONFLICT).json({ Error: 'Problema al registrar el usuario' });
                  return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: 'Problema al registrar el usuario', Detalle: '' });
                }
                //return res.status(status.OK).json({ "Response": "OK" });
                return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: '' });

              });

          })
        });
      } catch (e) {
        //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: e.message });
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.message });

      }
    };
  }));

  //Actualización de Usuario
  // IN {"Usuario":{"_id":121212, "Nombre" : "LaYare2", "Pin" : "1234", Estado:false}}
  // OUT {Usuario:Usuario}
  api.put('/user/update', wagner.invoke(function (Usuario) {
    return function (req, res) {
      try { var datos = req.body.Usuario; }
      catch (e) {
        //return res.status(status.BAD_REQUEST).json({ Error: 'Usuario no especificado!' });
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Usuario no especificado', Detalle: e.message });
      }

      try {
        Usuario.findOne({ "cNombre": datos.Nombre, "_id": { "$ne": datos._id } }, function (error, user) {
          if (error) {
            //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }
          if (user) {
            //return res.status(status.CONFLICT).json({ Error: 'El usuario ya existe' });
            return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "El usuario ya existe", Detalle: '' });
          }

          Usuario.findOneAndUpdate({ "_id": datos._id }, {
            $set: {
              'cNombre': datos.Nombre,
              'bEstado': datos.Estado,
              'cImagen': datos.Imagen
            }
          }, { runValidators: true }, function (error, user) {
            if (error) {
              //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }

            if (!user) {
              return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: 'Problema al actualizar el usuario', Detalle: '' });
              //return res.status(status.BAD_REQUEST).json({ Error: 'El usuario no se actualizó' });
            }
            //return res.status(status.OK).json({ "Response": "OK" });  
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro actualizado', Detalle: '' });
          });
        });
      } catch (e) {
        //return res.status(status.BAD_REQUEST).json({ Error: e.message });
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
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
        //return res.status(status.BAD_REQUEST).json({ Error: 'Paciente no especificado!' });
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Paciente no especificado', Detalle: e.message });

      }

      try {
        Paciente.findOne({
          "oGenerales.cEmail": datos.Generales.Email,
        }, function (error, patient) {
          if (error) {
            //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }          
          if (patient) {
            //return res.status(status.CONFLICT).json({ Error: 'El correo ya esta registrado' });
            return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "El correo ya esta registrado", Detalle: '' });
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
              bHipotencion: datos.Antecedentes.Hipotencion,
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
              //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error });

              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
              //return res.status(status.INTERNAL_SERVER_ERROR).json({Codigo:status.INTERNAL_SERVER_ERROR, Mensaje:"Ha ocurrido un problema", Detalle:error.toString() });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: paciente });
            //return res.status(status.OK).json({ Codigo:status.OK, Mensaje:'Registro exitoso', Detalle: '' });
            //return res.status(status.OK).json({ Response: "OK" });//json({ Paciente: paciente });
          });
        });
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
        //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: e.message });
      }

    };
  })
  );


  api.get('/patient/pin/:id', wagner.invoke(function (Paciente) {
    return function (req, res) {
      try {
        Paciente.findOneAndUpdate({ "_id": req.params.id }, { $set: { "cPin": Token() } },
          function (error, paciente) {
            if (error) {
              //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!paciente)
              return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Usuario inexistente', Detalle: '' });
            //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: "Usuario inexistente" });

            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Pin registrado exitosamente', Detalle: { Pin: paciente.cPin } });
            //return res.json({ Pin: paciente.cPin });
          });
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
        //return res.status(status.BAD_REQUEST).json({ Error: e.message });
      }
    }
  }));

  //Consulta Agrega y actualizar la unidad
  api.get('unity', wagner.invoke(function (Unidad) {
    return function (req, res) {
      Unidad.find().exec(handleMany.bind(null, 'Unidad', res));
    }
  }));

  api.post('/unity/add', wagner.invoke(function (Unidad) {
    return function (req, res) {
      try {
        var datos = req.body.unidad;
      }
      catch (e) {
        //return res.status(status.BAD_REQUEST).json({ Error: e.message });
        return res.status(status.BAD_REQUEST).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: 'Unidad no especificado', Detalle: e.message });
      }
      try {
        Unidad.create(datos, function (error, unidad) {
          if (error) {
            //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }

          if (!unidad) {
            //return res.status(status.BAD_REQUEST).json({ Error: "La unidad no fue registrada" });
            return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "La unidad no fue registrada", Detalle: '' });
          }
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: '' });
          //return res.status(status.OK).json({ Response: "OK" });
        });
      }

      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
        //return res.status(status.BAD_REQUEST).json({ Error: e.message });
      }
    }
  }));


  api.put('/unity/update', wagner.invoke(function (Unidad) {
    return function (req, res) {
      try {
        var datos = req.body.unidad;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Usuario no especificado', Detalle: e.message });
        //return res.status(status.BAD_REQUEST).json({ Error: e.message });
      }

      try {
        Unidad.findOneAndUpdate({ "_id": datos.id },
          {
            $set:
            { "cDescripcion": datos.Descripcion, "bMedible": datos.Medible, "cImagen": datos.Imagen }
          }, function (error, unidad) {
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
              //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
            }
            if (!unidad) {
              return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'La unidad no existe', Detalle: '' });
              //return res.status(status.BAD_REQUEST).json({ Error: "La unidad no existe" });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Actualizacóon exitosa', Detalle: '' });
            //return res.status(status.OK).json({ Response: "OK" });
          });
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
        //return res.status(status.BAD_REQUEST).json({ Error: e.message });
      }
    }
  }));

  //Tipo producto
  api.get('category', wagner.invoke(function (TipoP) {
    return function (req, res) {
      TipoP.find().exec(handleMany.bind(null, 'Category', res));
    }
  }));

  api.post('/category/add', wagner.invoke(function (TipoP) {
    return function (req, res) {
      try {
        var datos = req.body.unidad;
      }
      catch (e) {
        //return res.status(status.BAD_REQUEST).json({ Error: e.message });
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Categoria no especificada', Detalle: e.message });

      }
      try {
        TipoP.create(datos, function (error, tipo) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
          }

          if (!tipo) {
            //return res.status(status.BAD_REQUEST).json({ Error: "La categoria no fue registrada" });
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }
          //return res.status(status.OK).json({ Response: "OK" });
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: '' });
        });
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
        //return res.status(status.BAD_REQUEST).json({ Error: e.message });
      }
    }
  }));


  api.put('/category/update', wagner.invoke(function (Unidad) {
    return function (req, res) {
      try {
        var datos = req.body.unidad;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Error: e.message });
      }
      try {
        Unidad.findOneAndUpdate({ "_id": datos.id },
          {
            $set:
            { "cDescripcion": datos.Descripcion, "bMedible": datos.Medible, "cImagen": datos.Imagen }
          }, function (error, unidad) {
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
            }
            if (!unidad) {
              return res.status(status.BAD_REQUEST).json({ Error: "La unidad no existe" });
            }
            return res.status(status.OK).json({ Response: "OK" });
          });
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
        //return res.status(status.BAD_REQUEST).json({ Error: e.message });
      }
    }
  }));
  return api;
}

function Token() {
  return parseInt(Math.random() * 10000);
}


function handleOne(property, res, error, result) {
  if (error) {
    return res.
      status(status.INTERNAL_SERVER_ERROR).
      json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
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
      json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
  }
  var json = {};
  json.Codigo = status.OK;
  json.Mensaje = 'Operación existosa';
  json[property] = result;
  res.json(json);
}


