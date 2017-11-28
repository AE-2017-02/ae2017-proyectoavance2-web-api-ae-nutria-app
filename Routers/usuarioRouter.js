var Usuario= require('../Controllers/usuario');

module.exports = function(router){
    router.post('/auth',Usuario.signIn),
	router.post('/user/add',Usuario.signUp),
	router.get('/user', Usuario.getUser),	
    router.put('/user/update', Usuario.updateUser)    
}
