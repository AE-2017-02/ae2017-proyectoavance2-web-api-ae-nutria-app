var Administrador= require('../Controllers/administrador');

module.exports = function(router){
	router.post('/web/auth', Administrador.signIn),
	router.get('/admnistrator', Administrador.getAdministrador)	
}