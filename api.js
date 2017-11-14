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
  api.post('/auth', wagner.invoke(function (Usuario) {
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
          "oGenerales.cEmail": datos.Email,
          "bEstado": true
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
        Usuario.findOne({ "cNombre": datos.Nombre, "_id": { "$ne": datos.IdUsuario } }, function (error, user) {
          if (error) {
            //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }
          if (user) {
            //return res.status(status.CONFLICT).json({ Error: 'El usuario ya existe' });
            return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "El usuario ya existe", Detalle: '' });
          }

          Usuario.findOneAndUpdate({ "_id": datos.IdUsuario }, {
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

  api.get('/patientw', wagner.invoke(function (Usuario) {
    return function (req, res) {
      try {
        Usuario.find().select({ cNombre: 1, cImagen: 1 }).populate({
          path: "nIdPaciente", model: "Paciente", select: {
            'oGenerales.cNombre': 1, 'oGenerales.nEdad': 1, '_id': 1, 'NombreComplete': 1
          }
        }).exec(handleMany.bind(null, 'Pacientes', res));
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));

  // //Regresa Nombre Paciente, Edad Imagen Id

  api.get('/patient/id/:id', wagner.invoke(function (Usuario) {
    return function (req, res) {
      try {
        Usuario.findOne({ nIdPaciente: req.params.id }, function (error, usuario) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }
          if (!usuario) {
            return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Paciente inexistente', Detalle: '' });
          }
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Operación exitosa', Paciente: usuario });
        }).select({ cImagen: 1 }).populate({
          path: "nIdPaciente", model: "Paciente",
        })

      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
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
            bEstado: datos.Estado,
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

  api.put('/patientw/update', wagner.invoke(function (Paciente) {
    return function (req, res) {
      try {
        var datos = req.body.Paciente;
      }
      catch (e) {
        //return res.status(status.BAD_REQUEST).json({ Error: 'Paciente no especificado!' });
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Paciente no especificado', Detalle: e.message });
      }

      try {
        console.log(datos);
        Paciente.findOneAndUpdate({
          "_id": datos.IdPaciente,
        }, {
            $set: {
              "oGenerales": {
                "cNombre": datos.Generales.Nombre,
                "cApellidoP": datos.Generales.ApellidoP,
                "cApellidoM": datos.Generales.ApellidoM,
                "cSexo": datos.Generales.Sexo,
                "cEmail": datos.Generales.Email,
                "cTelefono": datos.Generales.Telefono,
              },
              "oAntecedentes": {
                "nPesoHabitual": datos.Antecedentes.PesoHabitual,
                "bObesidadFamiliar": datos.Antecedentes.ObesidadFamiliar,
                "bColesterol": datos.Antecedentes.Colesterol,
                "bHipertension": datos.Antecedentes.Hipertension,
                "bAlcohol": datos.Antecedentes.Alcohol,
                "bTabaco": datos.Antecedentes.Tabaco,
                "bDiabtes": datos.Antecedentes.Diabetes,
                "bHipotencion": datos.Antecedentes.Hipotencion,
              },
              "oExtra": {
                "cNotas": datos.Extra.Notas,
                "cPatologia": datos.Extra.Patologia,
                "cAlergia": datos.Extra.Alergia,
                "cMedicamentos": datos.Extra.Medicamentos,
                "cMeta": datos.Extra.Meta
              }
            }
          }, function (error, paciente) {
            console.log(error);
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
              //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
            }
            if (!paciente) {
              return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'El paciente no existe', Detalle: '' });
              //return res.status(status.BAD_REQUEST).json({ Error: "La unidad no existe" });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Actualizacóon exitosa', Detalle: '' });
          }
        )
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });        
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
  api.get('/unity', wagner.invoke(function (Unidad) {
    return function (req, res) {
      try {
        Unidad.find().exec(handleMany.bind(null, 'Unidad', res));
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));

  api.get('/unity/id/:id', wagner.invoke(function (Unidad) {
    return function (req, res) {
      try {
        Unidad.findOne({ _id: req.params.id }, function (error, unidad) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }
          if (!unidad) {
            return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Unidad inexistente', Detalle: '' });
          }
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Operación exitosa', Unidad: unidad });
        });
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));

  api.post('/unity/add', wagner.invoke(function (Unidad) {
    return function (req, res) {
      try {
        var datos = req.body.Unidad;
      }
      catch (e) {
        //return res.status(status.BAD_REQUEST).json({ Error: e.message });
        return res.status(status.BAD_REQUEST).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: 'Unidad no especificado', Detalle: e.message });
      }
      try {
        Unidad.create({ cDescripcion: datos.Descripcion, bMedible: datos.Medible, cImagen: datos.Imagen }, function (error, unidad) {
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
        var datos = req.body.Unidad;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Usuario no especificado', Detalle: e.message });
        //return res.status(status.BAD_REQUEST).json({ Error: e.message });
      }

      try {
        Unidad.findOneAndUpdate({ "_id": datos.IdUnidad },
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
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Actualización exitosa', Detalle: '' });
            //return res.status(status.OK).json({ Response: "OK" });
          });
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
        //return res.status(status.BAD_REQUEST).json({ Error: e.message });
      }
    }
  }));


  api.delete('/unity/delete', wagner.invoke(function(Unidad){
    return function (req, res) {
      try {
        var datos = req.body.Unidad;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Usuario no especificado', Detalle: e.message });
        //return res.status(status.BAD_REQUEST).json({ Error: e.message });
      }

      try {
        Unidad.findOneAndUpdate({ "_id": datos.IdUnidad },
          {
            $set:
            { "bEstado": false}
          }, function (error, unidad) {
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
              //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
            }
            if (!unidad) {
              return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'La unidad no existe', Detalle: '' });
              //return res.status(status.BAD_REQUEST).json({ Error: "La unidad no existe" });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'La unidad ha sido borrado exitosamente', Detalle: '' });
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
  api.get('/category', wagner.invoke(function (TipoP) {
    return function (req, res) {
      try {
        TipoP.find().exec(handleMany.bind(null, 'Categoria', res));
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));


  api.get('/category/id/:id', wagner.invoke(function (TipoP) {
    return function (req, res) {
      try {
        TipoP.findOne({ _id: req.params.id }, function (error, categoria) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }
          if (!categoria) {
            return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Categoria inexistente', Detalle: '' });
          }
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Operación exitosa', Categoria: categoria });
        });
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));


  api.post('/category/add', wagner.invoke(function (TipoP) {
    return function (req, res) {
      try {
        var datos = req.body.Categoria;
      }
      catch (e) {
        //return res.status(status.BAD_REQUEST).json({ Error: e.message });
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Categoria no especificada', Detalle: e.message });

      }
      try {
        TipoP.create({ cDescripcion: datos.Descripcion }, function (error, tipo) {
          if (error) {
            //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }

          if (!tipo) {
            //return res.status(status.BAD_REQUEST).json({ Error: "La categoria no fue registrada" });
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "La categoria no fue registrada", Detalle: '' });
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


  api.put('/category/update', wagner.invoke(function (TipoP) {
    return function (req, res) {
      try {
        var datos = req.body.Categoria;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Categoria no especificada', Detalle: e.message });
      }
      try {
        TipoP.findOneAndUpdate({ "_id": datos.IdCategoria },
          {
            $set:
            { "cDescripcion": datos.Descripcion }
          }, function (error, categoria) {
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!categoria) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "La categoria no existe", Detalle: '' });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro actualizado', Detalle: '' });
          });
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));


  //Producto

  api.get('/product', wagner.invoke(function (Producto) {
    return function (req, res) {
      try {
        Producto.find({})
          .populate(
          [
            { path: "nIdTipo", model: "TipoP", select: { '_id': 0, 'cDescripcion': 1 } }
            , { path: "nIdUnidad", model: "Unidad", select: { '_id': 0, 'cDescripcion': 1 } }
          ]
          )
          .exec(handleMany.bind(null, 'Producto', res));
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));


  api.get('/product/id/:id', wagner.invoke(function (Producto) {
    return function (req, res) {
      try {
        Producto.findOne({ _id: req.params.id }, function (error, producto) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }
          if (!producto) {
            return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Producto inexistente', Detalle: '' });
          }
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Operacion Exitosa', Producto: producto });
        }).populate([{
          path: "nIdTipo", model: "TipoP", select: {
            '_id': 0, 'cDescripcion': 1
          }
        }, {
          path: "nIdUnidad", model: "Unidad", select: {
            '_id': 0, 'cDescripcion': 1
          }
        }])//.exec(handleOne.bind(null, 'Producto', res));
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));


  api.post('/product/add', wagner.invoke(function (Producto) {
    return function (req, res) {
      try {
        var datos = req.body.Producto;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Producto no especificado', Detalle: e.message });
      }
      try {
        Producto.create(
          {
            cDescripcion: datos.Descripcion, cImagen: datos.Imagen,
            nCalorias: datos.Calorias, nIdTipo: datos.Categoria, nIdUnidad: datos.Unidad
          }, function (error, producto) {
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }

            if (!producto) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "El producto no fue registrado", Detalle: '' });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: '' });
          });
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));


  api.delete('/product/delete', wagner.invoke(function(Producto){
    return function (req, res) {
      try {
        var datos = req.body.Producto;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Producto no especificado', Detalle: e.message });
      }

      try {
        Producto.findOneAndUpdate({ "_id": datos.IdProducto }, {
          $set: {
            "bEstado": false
          }
        }, function (error, producto) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }
          if (!producto) {
            return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: 'Problema al borar el producto', Detalle: '' });
          }
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Producto borrado exitosamente', Detalle: '' });
        });
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));


  api.put('/product/update', wagner.invoke(function (Producto) {
    return function (req, res) {
      try {
        var datos = req.body.Producto;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Producto no especificado', Detalle: e.message });
      }
      try {
        Producto.findOneAndUpdate({ "_id": datos.IdProducto }, {
          $set: {
            "cDescripcion": datos.Descripcion,
            "cImagen": datos.Imagen,
            "nCalorias": datos.Calorias,
            "nIdTipo": datos.Categoria,
            "nIdUnidad": datos.Unidad
          }
        }, function (error, producto) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }
          if (!producto) {
            return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: 'Problema al actualizar el producto', Detalle: '' });
          }
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro actualizado', Detalle: '' });
        });

      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));

  //TipoMenu
  api.get('/menuType', wagner.invoke(function (TipoM) {
    return function (req, res) {
      try {
        TipoM.find().exec(handleMany.bind(null, 'Clasificacion', res));
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));


  api.get('/menuType/id/:id', wagner.invoke(function (TipoM) {
    return function (req, res) {
      try {
        TipoM.findOne({ _id: req.params.id }, function (error, clasificacion) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }
          if (!clasificacion) {
            return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Clasificación inexistente', Detalle: '' });
          }
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Operación exitosa', Clasificacion: clasificacion });
        });
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));


  api.post('/menuType/add', wagner.invoke(function (TipoM) {
    return function (req, res) {
      try {
        var datos = req.body.Clasificacion;
      }
      catch (e) {
        //return res.status(status.BAD_REQUEST).json({ Error: e.message });
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Clasificacion no especificada', Detalle: e.message });

      }
      try {
        TipoM.create({ cDescripcion: datos.Descripcion }, function (error, tipo) {
          if (error) {
            //return res.status(status.INTERNAL_SERVER_ERROR).json({ Error: error.toString() });
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }

          if (!tipo) {
            //return res.status(status.BAD_REQUEST).json({ Error: "La categoria no fue registrada" });
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "La clasificacion no fue registrada", Detalle: '' });
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


  api.put('/menuType/update', wagner.invoke(function (TipoM) {
    return function (req, res) {
      try {
        var datos = req.body.Clasificacion;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Clasificacion no especificada', Detalle: e.message });
      }
      try {
        TipoM.findOneAndUpdate({ "_id": datos.IdClasificacion },
          {
            $set:
            { "cDescripcion": datos.Descripcion }
          }, function (error, clasificacion) {
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!clasificacion) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "La clasificacion no existe", Detalle: '' });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro actualizado', Detalle: '' });
          });
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));


  //Menu


  api.get('/menu', wagner.invoke(function (Menu) {
    return function (req, res) {
      try {

        Menu.find().populate(
          [
            {
              path: "nIdTipoMenu", model: "TipoM", select: {
                'cDescripcion': 1, '_id': 0
              },
            },
            {
              path: "oComida.nIdProducto", model: "Producto", select: {
                'cDescripcion': 1, '_id': 0
              }
            }
          ]).exec(handleMany.bind(null, 'Menu', res));
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));


  api.get('/menu/id/:id', wagner.invoke(function (Menu) {
    return function (req, res) {
      try {
        Menu.findOne({ _id: req.params.id }, function (error, menu) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }
          if (!menu) {
            return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Menu inexistente', Detalle: '' });
          }
          //return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Operación exitosa', Menu: menu });
        }).populate(
          [
            {
              path: "nIdTipoMenu", model: "TipoM", select: {
                'cDescripcion': 1, '_id': 1
              },
            },
            {
              path: "oComida.nIdProducto", model: "Producto", select: {
                'cDescripcion': 1, '_id': 1, 'nCalorias': 1
              }
            }
          ]).exec(handleOne.bind(null, "Menu", res));

      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));

  api.get('/menu/food/:id', wagner.invoke(function (Menu) {
    return function (req, res) {
      try {
        Menu.findOne({ _id: req.params.id }, function (error, menu) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }
          if (!clasificacion) {
            return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Menu inexistente', Detalle: '' });
          }
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Operación exitosa', Comida: menu.oComida });
        });
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));

  api.post('/menu/add', wagner.invoke(function (Menu) {
    return function (req, res) {
      try {
        var datos = req.body.Menu;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Clasificacion no especificada', Detalle: e.message });

      }
      try {
        Menu.create({
          cNombre: datos.Nombre,
          nIdTipoMenu: datos.IdTipoMenu,
          cDescripcion: datos.Descripcion,
          oComida: datos.Comida
        }, function (error, menu) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }

          if (!menu) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "El menu no fue registrado", Detalle: '' });
          }
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: '' });
        });
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));

  api.delete('/menu/delete', wagner.invoke(function(Menu){
    return function(req, res){
      try{
        var datos = req.body.Menu;
      }catch(e){
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Menú no especificado', Detalle: e.message });
      }

      try{
        Menu.findOneAndUpdate({ "_id": datos.IdMenu }, { $set:{ "bEstado": false }}, function(error, menu){
          if(error){
            return res.status(status.INTERNAL_SERVER_ERROR).json({Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString()});
          }
          if(!menu){
            return res.status(status.CONFLICT).json({Codigo: status.CONFLICT, Mensaje: "Ha ocurrido un problema", Detalle: ""});
          }
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Menú borrado exitosamente', Detalle: '' });
        });
      }catch(e){
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));

  api.put('/menu/update', wagner.invoke(function (Menu) {
    return function (req, res) {
      try {
        var datos = req.body.Menu;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Clasificacion no especificada', Detalle: e.message });
      }
      try {
        Menu.findOneAndUpdate({ "_id": datos.IdMenu },
          {
            $set:
            {
              "cNombre": datos.Nombre,
              "nIdTipoMenu": datos.Clasificacion,
              "cDescripcion": datos.Descripcion
            }
          }, function (error, menu) {
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!menu) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "El menú no existe", Detalle: '' });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro actualizado', Detalle: '' });
          });
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));



  //Asignar producto
  api.put('/menu/food/add', wagner.invoke(function (Menu) {
    return function (req, res) {
      try {
        var datos = req.body.Porcion;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Producto no especificado', Detalle: e.message });
      }
      try {
        Menu.findOne({ _id: datos.IdMenu }, function (error, menu) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
          }
          if (!menu) {
            return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Menu inexistente', Detalle: '' });
          }

          menu.oComida.push({ nIdProducto: datos.Producto.IdProducto, nCantidad: datos.Producto.Cantidad, nCalorias: datos.Producto.Calorias });
          menu.save(function (error) {
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: '' });
          });
        });
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
      }
    }
  }));

  //Eliminar producto
  api.post('/menu/food/delete', wagner.invoke(function (Menu) {
    return function (req, res) {
      try {
        var datos = req.body.Porcion;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Producto no especificado', Detalle: e.message });
      }

      Menu.findOne({ _id: datos.IdMenu }, function (error, menu) {
        var indice = menu.oComida.findIndex(x => x.nIdProducto == datos.IdProducto);
        if (indice != -1) {
          menu.oComida.splice(indice, 1);
          menu.save(function (error) {
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
          });
        }
      });
      return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro actualizado', Detalle: '' });
    }
  }));

  //Administradores
  api.post('/auth2', wagner.invoke(function (Administrador) {
    return function (req, res) {
      try {
        var datos = req.body.Usuario;
      }
      catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Usuario no especificado', Detalle: e.message });
      }

      try {
        // Administrador.find({}).exec(handleMany.bind(null,'d',res));
        // console.log(datos);
        Administrador.findOne(
          { "Usuario": datos.Usuario, "Estado": true, "Password": datos.Password }, function (error, user) {
            console.log(user);
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!user) {
              return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Usuario inexistente', Detalle: '' });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: user });
          });
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Problema al autenticar", Detalle: e.message });
      }
    };
  }));


  api.get('/administrador', wagner.invoke(function (Administrador) {
    return function (req, res) {
      Administrador.find().exec(handleMany.bind(null, 'Usuarios', res))
    }
  }));

  api.put('/patient/update', wagner.invoke(function (Paciente) {
    return function (req, res) {
      try {
        var datos = req.body.Paciente;
      } catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Paciente no especificado', Detalle: e.message });
      }

      try {
        Paciente.findOne({ "_id": datos.IdPaciente }, function (error, patient) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: 'Ha ocurrido un problema', Detalle: error.toString() });
          }
          if (!patient) {
            return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: 'Problema al actualizar el paciente', Detalle: '' });
          }

          Paciente.findOneAndUpdate({ "_id": datos.IdPaciente }, {
            $set: {
              'bEstado': !patient.bEstado
            }
          }, { runValidators: true }, function (error, patient) {
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: 'Ha ocurrido un problema', Detalle: error.toString() });
            }
            if (!patient) {
              return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: 'Problema al actualizar el paciente', Detalle: '' });
            }

            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro actualizado', Detalle: '' });
          });
        });

      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: 'Ha ocurrido un problema', Detalle: e.message });
      }
    }
  }));


  api.post('/foodplan/add', wagner.invoke(function (Plan) {
    return function (req, res) {
      try {
        var datos = req.body.Plan;
      } catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: "Plan no valido", Detalle: e.message });
      }

      try {
        Plan.create({
          nIdPaciente: datos.IdPaciente,
          oPlan: datos.Plan
        }, function (error, plan) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un error", Detalle: error.toString() });
          }
          if (!plan) {
            return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "Problema al crear el plan", Detalle: "" });
          }
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: "Se inserto el plan alimenticio", Detalle: "" });
        });
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
      }
    }
  }));


  api.put('/plan/add', wagner.invoke(function (Plan) {
    return function (req, res) {
      try {
        var datos = req.body.Plan;
      } catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: "Plan no valido", Detalle: e.message });
      }

      try {

        Plan.findOne({ "nIdPaciente": datos.IdPaciente }, function (error, plan) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un error", Detalle: e.message });
          }
          if (!plan) {
            return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "No se pudo agregar el plan", Detalle: "" });
          }

          plan.oPlan.push({
            "nIdMenu": datos.IdMenu,
            "nHora": datos.Hora
          });
          try {
            plan.save();
          } catch (e) {
            return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "No se pudo agregar el plan", Detalle: e.message });
          }
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: "Se agrego el plan", Detalle: "" });
        });


      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
      }
    }
  }));

  api.delete('/foodplan/delete', wagner.invoke(function (Plan) {
    return function (req, res) {
      try {
        var datos = req.body.Plan;
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
      }
      try {
        Plan.deleteOne({ "_id": datos.IdPlan }, function (error, plan) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un error", Detalle: e.message });
          }
          if (!plan) {
            return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "No se pudo borrar el plan alimenticio", Detalle: "" });
          }
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: "Se borro el plan", Detalle: "" });
        });
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
      }
    }
  }));


  api.delete('/plan/delete', wagner.invoke(function (Plan) {
    return function (req, res) {
      try {
        var datos = req.body.Plan;
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
      }
      try {
        Plan.findOneAndUpdate({ "nIdPaciente": datos.IdPaciente }, { $pull: { "oPlan": { "nIdMenu": datos.IdMenu } } }, function (error, plan) {
          if (error) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un error", Detalle: e.message });
          }
          if (!plan) {
            return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "No se pudo borrar el plan", Detalle: "" });
          }
          return res.status(status.OK).json({ Codigo: status.OK, Mensaje: "Se borro el plan", Detalle: "" });
        });
      } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
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


