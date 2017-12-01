/*
    require('./avanceRouter')(router),
    require('./categoriaRouter')(router),
    require('./citaRouter')(router),
    require('./clasificacionRouter')(router),
    require('./menuRouter')(router),
    require('./notificacionRouter')(router),
    require('./pacienteRouter')(router),
    require('./planAlimenticioRouter')(router),
    require('./productoRouter')(router),
    require('./usuarioRouter')(router)    */

    
module.exports = function(router){
	require('./administradorRouter')(router),
    require('./avanceRouter')(router),
    require('./categoriaRouter')(router),
    require('./citaRouter')(router),
    require('./clasificacionRouter')(router),
    require('./unidadRouter')(router),
    require('./menuRouter')(router),
    require('./notificacionRouter')(router),
    require('./pacienteRouter')(router),
    require('./planAlimenticioRouter')(router),
    require('./productoRouter')(router),
    require('./usuarioRouter')(router),
    require('./despensaRouter')(router)        
}