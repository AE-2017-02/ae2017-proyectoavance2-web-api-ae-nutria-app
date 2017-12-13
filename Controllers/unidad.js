'use-strict'

const Unidad = require('../Schemas/unidadMedida');
const Service = require('../Service/functions');
var status = require('http-status');
function getUnity(req, res) {
    try {
        Unidad.find().exec(Service.handleMany.bind(null, 'Unidad', res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function getUnityId(req, res) {
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

function saveUnity(req, res) {
    try {
        var datos = req.body.Unidad;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: 'Unidad no especificado', Detalle: e.message });
    }
    try {
        Unidad.create({ cDescripcion: datos.Descripcion, bMedible: datos.Medible, cImagen: datos.Imagen }, function (error, unidad) {
            if (error) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!unidad) {
                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "La unidad no fue registrada", Detalle: '' });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: '' });
        });
    }

    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function updateUnity(req, res) {
    try {
        var datos = req.body.Unidad;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Usuario no especificado', Detalle: e.message });
    }

    try {
        Unidad.findOneAndUpdate({ "_id": datos.IdUnidad },
            {
                $set:
                { "cDescripcion": datos.Descripcion, "bMedible": datos.Medible, "cImagen": datos.Imagen }
            }, function (error, unidad) {
                if (error) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                }
                if (!unidad) {
                    return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'La unidad no existe', Detalle: '' });
                }
                return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Actualización exitosa', Detalle: '' });
            });
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function deleteUnity(req, res) {

    try {
        Unidad.findOneAndUpdate({ "_id": req.params.id },
            {
                $set:
                { "bEstado": false }
            }, function (error, categoria) {
                if (error) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                }
                if (!categoria) {
                    return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'La unidad no existe', Detalle: '' });
                }
                return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'La unidad ha sido borrado exitosamente', Detalle: '' });
            });
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
    // try {
    //     var datos = req.body.Unidad;
    // }
    // catch (e) {
    //     return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Unidad no especificada', Detalle: e.message });        
    // }

    // try {
    //     Unidad.findOneAndUpdate({ "_id": datos.IdUnidad },
    //         {
    //             $set:{ "bEstado": false }
    //         }, function (error, unidad) {
    //             if (error) {
    //                 return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });                    
    //             }
    //             if (!unidad) {
    //                 return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'La unidad no existe', Detalle: '' });                    
    //             }
    //             return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'La unidad ha sido borrado exitosamente', Detalle: '' });                
    //         });
    // }
    // catch (e) {
    //     return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });        
    // }
}



module.exports = {
    getUnity,
    getUnityId,
    saveUnity,
    updateUnity,
    deleteUnity
}