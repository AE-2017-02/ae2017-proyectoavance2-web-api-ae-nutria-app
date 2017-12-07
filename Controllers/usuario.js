'use-strict'

const Usuario = require('../Schemas/usuario');
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
        Usuario.findOne(
            { "cNombre": datos.Usuario, "bEstado": true }, function (error, user) {
                if (error) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                }
                if (!user) {
                    return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Usuario inexistente', Detalle: '' });
                }
                if (user.nIdPaciente.cPin != datos.Pin)
                    return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Usuario inexistente', Detalle: '' });
                user.token = Service.createToken(user);
                return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: user });
            }).select({ cNombre: 1, cImagen: 1 }).populate({
                path: "nIdPaciente", model: "Paciente", select: {
                    'oGenerales.cEmail': 1, 'cPin': 1, '_id': 1, "oGenerales.cSexo": 1, "oGenerales.dFechaNac": 1
                }
            });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Problema al autenticar", Detalle: e.message });
    }
}
function getUser(req, res) {
    Usuario.find().populate(
        {
            path: "nIdPaciente", model: "Paciente", select: {
                'oGenerales.cNombre': 1, 'oGenerales.cApellidoP': 1, 'oGenerales.cApellidoM': 1, 'oGenerales.dFechaNac':1,'_id': 0
            }
        }).
        exec(Service.handleMany.bind(null, 'Usuarios', res));
}

function signUp(req, res) {
    try {
        var datos = req.body.Usuario;
    }
    catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Usuario no especificado', Detalle: error.toString() });
    }
    try {
        var Paciente = require('../Schemas/paciente');
        Paciente.findOne({
            "cPin": datos.Pin,
            "oGenerales.cEmail": datos.Email,
            "bEstado": true
        }, function (error, paciente) {
            if (error) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!paciente) {
                return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'Paciente inexistente', Detalle: '' });
            }
            Usuario.findOne({ "cNombre": datos.Nombre }, function (error, user) {
                if (error) {
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                }
                if (user) {
                    if (mongoose.Schema.Types.ObjectId(user.nIdPaciente) == mongoose.Schema.Types.ObjectId(paciente._id)) {

                        return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "El paciente ya tiene un usuario asignado", Detalle: '' });
                    }
                    else {
                        return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "El usuario ya existe", Detalle: '' });
                    }
                }
                Usuario.create({ "cNombre": datos.Nombre, "cImagen": datos.Imagen, "nIdPaciente": paciente._id }, function (error, user) {
                	if (error) {
                        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                    }
                    if (!user) {
                        return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: 'Problema al registrar el usuario', Detalle: '' });
                    }
					Usuario.findOne({"_id": user._id}, function(errorsillo, usuarillo){
						if(errorsillo){
                        	return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
						}
						if(!usuarillo){
                        	return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "El usuario ya existe", Detalle: '' });
						}
                    	return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro exitoso', Detalle: usuarillo });
					}).populate({
                	path: "nIdPaciente", model: "Paciente", select: {
                    	'oGenerales.cEmail': 1, 'cPin': 1, '_id': 1, "oGenerales.cSexo": 1, "oGenerales.dFechaNac": 1
                	}
					});
               	});
            })
        });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }

}

function updateUser(req, res) {
    try { var datos = req.body.Usuario; }
    catch (e) {        
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Usuario no especificado', Detalle: e.message });
    }

    try {
        Usuario.findOne({ "cNombre": datos.Nombre, "_id": { "$ne": datos.IdUsuario } }, function (error, user) {
            if (error) {                
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (user) {             
                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "El usuario ya existe", Detalle: '' });
            }
            Usuario.findOneAndUpdate({ "_id": datos.IdUsuario }, {
                $set: {
                    'cNombre': datos.Nombre,
                    'bEstado': datos.Estado,
                    'cImagen': datos.Imagen
                }
            }, { runValidators: true }, function (error, user) {
                if (error) {                    
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
                }
                if (!user) {
                    return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: 'Problema al actualizar el usuario', Detalle: '' });                 
                }                
                return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Registro actualizado', Detalle: '' });
            });
        });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function updateUserApplication(req, res){
	try { 
		var datos = req.body.Usuario; 
	}catch (e) {        
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: 'Usuario no especificado', Detalle: e.message });
    }

    try {
        Usuario.findOne({ "nIdPaciente": datos.IdPaciente}, function (error, user1) {
            if (error) {                
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
            }
            if (!user1) {             
                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "El usuario no existe", Detalle: '' });
            }
			user1.cNombre = datos.Usuario;
			user1.save(function(error2){
				if(error2){
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error2.toString() });
				}else{
					var Paciente = require('../Schemas/paciente');
					Paciente.findOneAndUpdate({"_id": user1.nIdPaciente},{"$set":{"oGenerales.cEmail": datos.Email}}, function(error3, paciente){
						if(error3){
                    		return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error3.toString() });
						}
						if(!paciente){
                			return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "El paciente no existe", Detalle: '' });
						}
                		return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Actualización realizada exitosamente', Detalle: '' });
					});
				}
				
			});
		});
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }

}

module.exports = {
    getUser,
    updateUser,
    signIn,
    signUp,
	updateUserApplication 
}
