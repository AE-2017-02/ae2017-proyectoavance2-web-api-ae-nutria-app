'use-strict'

const Category = require('../Schemas/tipoProducto');
const Service = require('../Service/functions');
var status = require('http-status');

function getCategory(req, res) {
    try {
        Category.find().exec(Service.handleMany.bind(null, 'Categoria', res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function getCategoryId(req, res) {
    try {
        Category.findOne({ _id: req.params.id }, function (error, categoria) {
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

function saveCategory(req, res) {
    try {
        var datos = req.body.Categoria;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Categoria no especificada', Detalle: e.message });
    }
    try {
        Category.create({
            cDescripcion: datos.Descripcion,
            nProteina: datos.Proteina,
            nGrasas: datos.Grasas,
            nEnergia: datos.Energia,
            nCarbohidratos: datos.Carbohidratos
        }, function (error, tipo) {
            if (error) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!tipo) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "La categoria no fue registrada", Detalle: '' });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: '' });
        });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}


function updateCategory(req, res) {
    try {
        var datos = req.body.Categoria;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Categoria no especificada', Detalle: e.message });
    }
    try {
        Category.findOneAndUpdate({ "_id": datos.IdCategoria },
            {
                $set:
                { "cDescripcion": datos.Descripcion,
                "nProteinas": datos.Proteinas, 
                "nGrasas": datos.Grasas,
                "nEnergia": datos.Energia,
                "nCarbohidratos": datos.Carbohidratos 
                }                                         
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
function deleteCategory(req, res) {
    try {
        var datos = req.body.Categoria;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Categoria no especificada', Detalle: e.message });
    }
    try {
        Category.findOneAndUpdate({ "_id": datos.IdCategoria },
            {
                $set:
                { "bEstado": false }
            }, function (error, categoria) {
                if (error) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                }
                if (!categoria) {
                    return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'La categoria no existe', Detalle: '' });
                }
                return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'La categoria ha sido borrado exitosamente', Detalle: '' });
            });
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

module.exports = {
    getCategory,
    getCategoryId,
    saveCategory,
    updateCategory,
    deleteCategory
}