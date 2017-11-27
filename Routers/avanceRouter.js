var Avance= require('../Controllers/avance');

module.exports = function(router){
    router.get('/advance/id/:id',Avance.getAvanceId),
	router.get('/advance/:id',Avance.getAvancePatientId),
	router.post('/advance/add', Avance.saveAvance),	
    router.put('/advance/update', Avance.updateAvance)
}