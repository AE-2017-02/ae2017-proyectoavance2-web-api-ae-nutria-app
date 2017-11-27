'use-strict'

const Administrador = require('../Schemas/administrador');
const Service = require('../Service/functions');
var status = require('http-status');

function signIn(req, res) {
    try {
        var datos = req.body.Usuario;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Usuario no especificado', Detalle: e.message });
    }

    try {
        Administrador.findOne(
            { "Usuario": datos.Usuario, "Estado": true, "Password": datos.Password }, function (error, user) {
                if (error) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                }
                if (!user) {
                    return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Usuario inexistente', Detalle: '' });
                }
                
                return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: 
                {"Usuario":user,"Token":Service.createToken(user) }});
            });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Problema al autenticar", Detalle: e.message });
    }
}

function getAdministrador(req, res) {
    
    Administrador.find().exec(Service.handleMany.bind(null, 'Usuarios', res))    
}


module.exports = {
    getAdministrador,
    signIn
}