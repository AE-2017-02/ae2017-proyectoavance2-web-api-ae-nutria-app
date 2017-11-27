'use-strict'

const Producto = require('../Schemas/producto');
const Service = require('../Service/functions');
var status = require('http-status');
function getProduct(req, res) {
    try {
        Producto.find({})
            .populate(
            [
                { path: "nIdTipo", model: "Categoria", select: { '_id': 0, 'cDescripcion': 1 } }
                , { path: "nIdUnidad", model: "Unidad", select: { '_id': 0, 'cDescripcion': 1 } }
            ]
            )
            .exec(Service.handleMany.bind(null, 'Producto', res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function getProductId(req, res) {
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
            path: "nIdTipo", model: "Categoria", select: {
                '_id': 0, 'cDescripcion': 1
            }
        }, {
            path: "nIdUnidad", model: "Unidad", select: {
                '_id': 0, 'cDescripcion': 1
            }
        }])
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function saveProduct(req, res) {
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


function deleteProduct(req, res) {
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

function updateProduct(req, res) {
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

module.exports={
    getProduct,
    getProductId,
    saveProduct,
    updateProduct,
    deleteProduct
}