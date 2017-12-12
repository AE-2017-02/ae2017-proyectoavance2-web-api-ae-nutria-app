'use-strict'

const Cita = require('../Schemas/cita');
const Service = require('../Service/functions');
var status = require('http-status');

function getAppointment(req, res) {
    try {
        var datos = req.body.Parametros;
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Parametros no especificados", Detalle: e.message });
    }
    try {
        var Ini = datos.Inicio.split("/");
        var Fin = datos.Fin.split("/");

        var fecIni = new Date(Ini[2], Ini[1] - 1, Ini[0])
        var fecFin = new Date(Fin[2], Fin[1] - 1, Fin[0])
        Cita.find({ "dFecha": { "$gte": fecIni, "$lte": fecFin } }).exec(Service.handleMany.bind(null, 'Citas', res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function getAppointmentDay(req, res) {
    try {
        Cita.find({ "dFecha": { "$gte": new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()) } }).
            populate({
                path: "nIdPaciente", model: "Paciente",
                select: {
                    'oGenerales.cNombre': 1, 'oGenerales.cApellidoP': 1,
                    'oGenerales.cApellidoM': 1, "NombreCompleto": 1
                }
            }).exec(Service.handleMany.bind(null, 'Citas', res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function getAppointmentId(req, res) {
    try {
        Cita.find({ "_id": req.params.id }).exec(Service.handleOne.bind(null, "Cita", res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}


function getAppointmentPatientId(req, res) {
    try {
        Cita.find({ "nIdPaciente": req.params.id }).exec(Service.handleOne.bind(null, "Citas", res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function getAppointmentAll(req, res) {
    try {
        
        // {"cEstado":{"$not":/Finalizada/}}
        Cita.find({}).populate({
            path: "nIdPaciente", model: "Paciente",
            select: {
                'oGenerales.cNombre': 1, 'oGenerales.cApellidoP': 1,
                'oGenerales.cApellidoM': 1, "NombreCompleto": 1
            }
        }).exec(Service.handleOne.bind(null, "Citas", res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}


function saveAppointment(req, res) {
    try {
        var datos = req.body.Cita;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Cita no especificada', Detalle: e.message });
    }
    try {

	Cita.findOne({"nIdPaciente": datos.IdPaciente, "$or":[{"cEstado": "Pendiente"},{"cEstado": "Confirmada"}]}, function(error, cita){
		if(error){            
			return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
		}	
		if(cita){            
			return res.status(status.OK).json({ Codigo: status.NO_CONTENT, Mensaje: "Cuenta con una cita pendiente o aceptada", Detalle:"" });
		}
        
		Cita.create({
            nIdPaciente: datos.IdPaciente,
            nHora: datos.Hora,
            cDescripcion: datos.Descripcion,
            dFecha: datos.Fecha
        }, function (error, cita) {
            if (error) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!cita) {                
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "La cita no fue registrada", Detalle: '' });
            }            
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: '' });
        });
	});
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}



function saveAppointmentWeb(req, res) {
    try {
        var datos = req.body.Cita;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Cita no especificada', Detalle: e.message });
    }
    try {

	Cita.findOne({"nIdPaciente": datos.IdPaciente, "$or":[{"cEstado": "Pendiente"},{"cEstado": "Confirmada"}]}, function(error, cita){
		if(error){            
			return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
		}	
		if(cita){            
			return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.NO_CONTENT, Mensaje: "Cuenta con una cita pendiente o aceptada", Detalle:"" });
		}
        
		Cita.create({
            nIdPaciente: datos.IdPaciente,
            nHora: datos.Hora,
            cDescripcion: datos.Descripcion,
            dFecha: datos.Fecha
        }, function (error, cita) {
            if (error) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!cita) {                
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "La cita no fue registrada", Detalle: '' });
            }            
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: '' });
        });
	});
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function updateAppointmentState(req, res) {
    try {
        var datos = req.body.Cita;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Cita no especificada', Detalle: e.message });
    }
    try {
        Cita.findOneAndUpdate({ "_id": datos.IdCita }, {
            $set: { "cEstado": datos.Estado }
        }, function (error, cita) {
            if (error) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!cita) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "La cita no existe", Detalle: '' });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro actualizado', Detalle: '' });
        });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function updateAppointment(req, res) {
    try {
        var datos = req.body.Cita;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Cita no especificada', Detalle: e.message });
    }
    try {
        var Fecha = datos.Fecha.split("/");
        var nFecha = new Date(Fecha[2], Fecha[1] - 1, Fecha[0])
        Cita.findOneAndUpdate({ "_id": datos.IdCita },
            {
                $set:
                {
                    "dFecha": nFecha,
                    "nHora": datos.Hora,
                    "cEstado": datos.Estado,
                    "cDescripcion": datos.Descripcion
                }
            }, function (error, cita) {
                if (error) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                }
                if (!cita) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "La cita no existe", Detalle: '' });
                }
                return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro actualizado', Detalle: '' });
            });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function deleteAppointment(req, res) {
    try {
        Cita.remove({ _id: req.params.id }, function (err) {
            if (err)
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: err });
            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.OK, Mensaje: "Cita eliminada", Detalle: '' })
        });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}



module.exports = {
    getAppointment,
    getAppointmentDay,
    getAppointmentId,
    getAppointmentPatientId,
    getAppointmentAll,
    saveAppointment,
    saveAppointmentWeb,
    updateAppointmentState,
    updateAppointment,
    deleteAppointment
}
