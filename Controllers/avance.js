'use-strict'

const Avance = require('../Schemas/avance');
const Service = require('../Service/functions');
var status = require('http-status');

function getAvancePatientId(req, res) {
    try {
        Avance.find({ "nIdPaciente": req.params.id }).sort({ "dCreacion": -1 }).exec(Service.handleMany.bind(null, 'Avance', res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function getAvancePatientPenultimoId(req, res) {    
    try {        
        Avance.find({ "nIdPaciente": req.params.id }).sort({ "dCreacion": -1 }).skip(1).limit(1).exec(Service.handleOne.bind(null, 'Avance', res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function getAvancePatientUltimoId(req, res) {
    try {
        Avance.find({ "nIdPaciente": req.params.id }).sort({ "dCreacion": -1 }).limit(1).exec(Service.handleMany.bind(null, 'Avance', res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}


function getAvanceId(req, res) {
    try {
        Avance.findOne({ _id: req.params.id }, function (error, avance) {
            if (error) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!avance) {
                return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Avance inexistente', Detalle: '' });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Operación exitosa', Avance: avance });
        });
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function getAvanceFecha(req,res){
    try {
        Avance.find({ nIdPaciente: req.params.id }).select(
            {'dCreacion':1}).exec(Service.handleMany.bind(null, 'Fecha',res));;
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}
function saveAvance(req, res) {
    try {
        var datos = req.body.Avance;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Avance no especificado', Detalle: e.message });
    }
    try {
        Avance.create({
            nIdPaciente: datos.IdPaciente,
            nPeso: datos.Peso,
            nTalla: datos.Talla,
            oCircunferencias: {
                nBrazo: datos.Circuferencia.Brazo,
                nBContraido: datos.Circuferencia.BContraido,
                nCintura: datos.Circuferencia.Cintura,
                nMuslo: datos.Circuferencia.Muslo,
                nCadera: datos.Circuferencia.Cadera,
                nPantorrilla: datos.Circuferencia.Pantorilla,
                nMuneca: datos.Circuferencia.Muneca                
            },
            oPliegues: {
                nTricipital: datos.Pliegues.Tricipital,
                nEscapular: datos.Pliegues.Escapular,
                nBicipital: datos.Pliegues.Bicipital,
                nSiliaco: datos.Pliegues.Siliaco,
                nEspinale: datos.Pliegues.Espinale,
                nAbdominal: datos.Pliegues.Abdominal,
                nMuslo: datos.Pliegues.Muslo,
                nPantorrilla: datos.Pliegues.Pantorilla,
            }
        }, function (error, avance) {
            if (error) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }

            if (!avance) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "El avance no fue registrada", Detalle: '' });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: '' });
        });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }

}


function updateAvance(req, res) {
    try {
        var datos = req.body.Avance;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Avance no especificado', Detalle: e.message });
    }
    try {
        Avance.findOneAndUpdate({ "_id": datos.IdAvance },
            {
                $set:
                {
                    "nPeso": datos.Peso,
                    "nTalla": datos.Talla,
                    "oCircunferencias": {
                        "nBrazo": datos.Circuferencia.Brazo,
                        "nBContraido": datos.Circuferencia.BContraido,
                        "nCintura": datos.Circuferencia.Cintura,
                        "nMuslo": datos.Circuferencia.Muslo,
                        "nCadera": datos.Circuferencia.Cadera,
                        "nPantorrilla": datos.Circuferencia.Pantorilla,
                        "nMuneca": datos.Circuferencia.Muneca
                    },
                    "oPliegues": {
                        "nTricipital": datos.Pliegues.Tripicial,
                        "nEscapular": datos.Pliegues.Escapular,
                        "nBicipital": datos.Pliegues.Bicipital,
                        "nSiliaco": datos.Pliegues.Siliaco,

                        "nEspinale": datos.Pliegues.Espinale,
                        "nAbdominal": datos.Pliegues.Abdominal,
                        "nMuslo": datos.Pliegues.Muslo,
                        "nPantorrilla": datos.Pliegues.Pantorilla,
                    }
                }
            }, function (error, avance) {
                if (error) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                }
                if (!avance) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "El avance no existe", Detalle: '' });
                }
                return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro actualizado', Detalle: '' });
            });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

module.exports = {
    getAvancePatientId,
    getAvancePatientUltimoId,
    getAvancePatientPenultimoId,
    getAvanceId,
    getAvanceFecha,
    saveAvance,
    updateAvance
}