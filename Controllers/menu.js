'use-strict'

const Menu = require('../Schemas/menu');
const Service = require('../Service/functions');
var status = require('http-status');
function getMenu(req, res) {
    try {
        Menu.find({ "bEstado": true }).populate(
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
            ]).exec(Service.handleMany.bind(null, 'Menu', res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function getMenuId(req, res) {
    try {
        Menu.findOne({ _id: req.params.id }, function (error, menu) {
        }).populate(
            [
                {
                    path: "nIdTipoMenu", model: "TipoM", select: {
                        'cDescripcion': 1, '_id': 1
                    },
                },
                {
                    path: "oComida.nIdProducto", model: "Producto", select: {
                        'cDescripcion': 1, '_id': 1, 'nCalorias': 1, 'cImagen': 1
                    }
                }
            ]).exec(Service.handleOne.bind(null, "Menu", res));

    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function saveMenu(req, res) {
    try {
        var datos = req.body.Menu;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Menu no especificado', Detalle: e.message });

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

function updateMenu(req, res) {
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

function deleteMenu(req, res) {
    try {
        var datos = req.body.Menu;
    } catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Menú no especificado', Detalle: e.message });
    }

    try {
        Menu.findOneAndUpdate({ "_id": datos.IdMenu }, { $set: { "bEstado": false } }, function (error, menu) {
            if (error) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!menu) {
                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "Ha ocurrido un problema", Detalle: "" });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Menú borrado exitosamente', Detalle: '' });
        });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function saveMenuFood(req, res) {
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

function deleteMenuFood(req, res) {
    try {
        var datos = req.body.Porcion;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Producto no especificado', Detalle: e.message });
    }
    try {
        Menu.findOneAndUpdate(
            { _id: datos.IdMenu }, { $pull: { "oComida": { "nIdProducto": datos.IdProducto } } }
            , function (error, menu) {
                if (error) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                }
                if (!menu) {
                    return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Menu inexistente', Detalle: '' });
                }
                return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro actualizado', Detalle: '' });
            });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}
module.exports = {
    getMenu,
    getMenuId,
    saveMenu,
    updateMenu,
    deleteMenu,
    saveMenuFood,
    deleteMenuFood    
}