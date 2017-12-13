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
        }).exec(Service.handleMany.bind(null, 'Notificacion', res));
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
        }).exec(Service.handleOne.bind(null, 'Notificacion', res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

//Tres parametros all=todos, 
//titulo,mensaje,asunto pacientes
function saveNotificationAll(req, res) {
    try {
        var datos = req.body.Notificacion;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Notificacion no especificada', Detalle: e.message });
    }
    try {
        var sendNotification = function (data) {
            var headers = {
                "Content-Type": "application/json; charset=utf-8",
                "Authorization": "Basic ZjI0YWMwMmMtNmE1Ni00MzEyLWExZDktODEyNGZlMDk4MzBi"
            };
            var options = {
                host: "onesignal.com",
                port: 443,
                path: "/api/v1/notifications",
                method: "POST",
                headers: headers
            };
            var https = require('https');
            var req = https.request(options, function (res2) {
                res2.on('data', function (data) {
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
                });
            });           
            req.on('error', function (e) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e });
            });
            req.write(JSON.stringify(data));
            req.end();
        };        
        var message;
        if(datos.Todos){
            message = {
            app_id: "e682db34-c650-4ba4-a0b1-f0d7c8d5d8f5",
            contents: { "en": datos.Mensaje },
            headings:{"en": datos.Titulo},
            subtitle:{"en":datos.Asunto},
            included_segments: ["All"]};
        }   
        else{
            message = {
            app_id: "e682db34-c650-4ba4-a0b1-f0d7c8d5d8f5",
            contents: { "en": datos.Mensaje },
            headings:{"en": datos.Titulo},
            subtitle:{"en":datos.Asunto},                         	  	
            filters:[{"field": "tag", "key": "IDPa", "relation": "=", "value": "5a19b2ef0807b0395f7fbcc2"}]};
        }     
        sendNotification(message);
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function getGeneralNotification(req, res) {
    try {
        Notificacion.find({ "oPacientes": { "$size": 0 } }).sort({ "dFecha": -1 }).limit(10).exec(Service.handleMany.bind(null, 'Notificacion', res));
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
};

function getPersonalNotification(req, res) {
    try {
        var idPaciente = req.params.id;
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
    try {
        Notificacion.find({ "oPacientes.nIdPaciente": { "$eq": idPaciente } }).sort({ "dFecha": -1 }).limit(10).exec(Service.handleMany.bind(null, 'Notificacion', res));
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
};


function oneSignal(req, res) {


    try {
        var idPaciente = req.params.id;
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
    try {
        Notificacion.find({ "oPacientes.nIdPaciente": { "$eq": idPaciente } }).sort({ "dFecha": -1 }).limit(10).exec(Service.handleMany.bind(null, 'Notificacion', res));
        try {
            var sendNotification = function (data) {
                var headers = {
                    "Content-Type": "application/json; charset=utf-8",
                    "Authorization": "Basic ZjI0YWMwMmMtNmE1Ni00MzEyLWExZDktODEyNGZlMDk4MzBi"
                };
                var options = {
                    host: "onesignal.com",
                    port: 443,
                    path: "/api/v1/notifications",
                    method: "POST",
                    headers: headers
                };

                var https = require('https');
                var req = https.request(options, function (res2) {
                    res2.on('data', function (data) {
                        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "La notificacion fue registrada", Detalle: data });
                        // console.log(JSON.parse(data));                    
                    });
                });

                console.log(req);
                req.on('error', function (e) {
                    // console.log("ERROR:");
                    // console.log(e);
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e });
                });

                req.write(JSON.stringify(data));
                req.end();
            };

            var message = {
                app_id: "e682db34-c650-4ba4-a0b1-f0d7c8d5d8f5",
                contents: { "en": "Pruebas vue" },
                included_segments: ["All"]
            };
            sendNotification(message);
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: '' });
        }
        catch (e) {
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
        }
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }


}



module.exports = {
    getNotification,
    getNotificationId,
    saveNotificationAll,
    getGeneralNotification,
    getPersonalNotification,
    oneSignal
}