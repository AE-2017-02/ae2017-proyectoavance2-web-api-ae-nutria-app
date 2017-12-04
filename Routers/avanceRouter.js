var Avance= require('../Controllers/avance');

module.exports = function(router){
    router.get('/advance/id/:id',Avance.getAvanceId),
	router.get('/advance/:id',Avance.getAvancePatientId),
    router.get('/advance/latest/:id',Avance.getAvancePatientUltimoId),
    router.get('/advance/penultimate/:id',Avance.getAvancePatientPenultimoId),
    router.get('/advance/date/:id',Avance.getAvanceFecha),
	router.post('/advance/add', Avance.saveAvance),	
    router.put('/advance/update', Avance.updateAvance)
}