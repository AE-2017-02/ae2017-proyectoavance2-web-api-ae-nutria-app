'use-strict'

const Paciente = require('../Schemas/paciente');
const Usuario =  require('../Schemas/usuario');
const Service = require('../Service/functions');
var status = require('http-status');

function getPatient(req, res) {
    Paciente.find().exec(Service.handleMany.bind(null, 'Pacientes', res));
}

function getApplication(req, res) {
    Paciente.find({ "bEstado": false }).exec(Service.handleMany.bind(null, 'Solicitante', res))
}

function getPatientPin(req, res) {
    try {
        var nuevoPin = Service.pin();
        Paciente.findOneAndUpdate({ "_id": req.params.id }, { $set: { "cPin": nuevoPin } },
            function (error, paciente) {
                if (error) {                    
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                }
                if (!paciente)
                    return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Usuario inexistente', Detalle: '' });                
                return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Pin registrado exitosamente', Detalle: { Pin: nuevoPin } });                
            });
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });     
    }
}

function getPatientWeb(req, res) {
    try {        
        Usuario.find().select({ cNombre: 1, cImagen: 1 }).populate({
            path: "nIdPaciente", model: "Paciente", select: {
                'oGenerales.cNombre': 1, 'oGenerales.nEdad': 1, '_id': 1, 'NombreComplete': 1, 'bEstado': 1
            }
        }).exec(Service.handleMany.bind(null, 'Pacientes', res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}


function getPatientId(req, res) {
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

function savePatient(req, res) {
    try {
        var datos = req.body.Paciente;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Paciente no especificado', Detalle: e.message });
    }
    try {
        Paciente.findOne({
            "oGenerales.cEmail": datos.Generales.Email,
        }, function (error, patient) {
            if (error) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (patient) {
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
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                }
                return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: paciente });
            });
        });
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }

}

function updatePatientWeb(req, res) {
    try {
        var datos = req.body.Paciente;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Paciente no especificado', Detalle: e.message });
    }
    try {
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
                        "cTelefono": datos.Generales.Telefono
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
                if (error) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                }
                if (!paciente) {
                    return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'El paciente no existe', Detalle: '' });
                }
                return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Actualizacóon exitosa', Detalle: '' });
            }
        )
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function updatePatientState(req,res){
    try {
        Paciente.findOneAndUpdate({ "_id": req.params.id }, { $set: { "bEstado": true } },
          function (error, paciente) {
            if (error) {
              return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!paciente)
              return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Paciente inexistente', Detalle: '' });            

            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Paciente registrado exitosamente', Detalle: { Paciente: paciente } });            
          });
      }
      catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });        
      }
}

module.exports = {    
    getApplication,
    getPatient,
    getPatientId,
    getPatientPin,
    getPatientWeb,
    updatePatientState,
    updatePatientWeb,
    savePatient        
}