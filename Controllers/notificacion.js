'use-strict'

const Notificacion = require('../Schemas/notificacion');
const Service = require('../Service/functions');
var status = require('http-status');
function getNotification(req, res) {
    try {
        Notificacion.find().populate({
            path: "oPacientes.nIdPaciente", model: "Paciente", select: {
                'oGenerales.cNombre': 1, 'oGenerales.cApellidoP': 1,
                'oGenerales.cApellidoM': 1, "Nombre2": 1
            }
        }).exec(handleMany.bind(null, 'Notificacion', res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function getNotificationId(req, res) {
    try {
        Notificacion.find({ "_id": req.params.id }).populate({
            path: "oPacientes.nIdPaciente", model: "Paciente", select: {
                'oGenerales.cNombre': 1, 'oGenerales.cApellidoP': 1,
                'oGenerales.cApellidoM': 1, "Nombre2": 1, "_id": 0,
            }
        }).exec(handleOne.bind(null, 'Notificacion', res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function saveNotification(req, res) {
    try {
        var datos = req.body.Notificacion;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Notificacion no especificada', Detalle: e.message });
    }
    try {
        Notificacion.create(
            {
                cTitulo: datos.Titulo,
                cMensaje: datos.Mensaje,
                cAsunto: datos.Asunto,
                oPacientes: datos.Pacientes
            },
            function (error, notificacion) {
                if (error) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                }
                if (!notificacion) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "La notificacion no fue registrada", Detalle: '' });
                }
                return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: '' });
            });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

module.exports = {
    getNotification,
    getNotificationId,
    saveNotification
}