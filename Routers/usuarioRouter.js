var Usuario= require('../Controllers/usuario');

module.exports = function(router){
    router.get('/auth',Usuario.signIn),
	router.get('/user/add',Usuario.signUp),
	router.get('/user', Usuario.getUser),	
    router.put('/user/update', Usuario.updateUser)    
}
