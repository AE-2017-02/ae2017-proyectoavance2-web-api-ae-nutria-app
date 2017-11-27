var Clasificacion= require('../Controllers/clasificacion');

module.exports = function(router){
    router.get('/menuType',Clasificacion.getClassification),
	router.get('/menuType/id/:id',Clasificacion.getClassificationId),
	router.post('/menuType/add', Clasificacion.saveClassification),	
    router.put('/menuType/update', Clasificacion.updateClassification),
    router.delete('/menuType/delete', Clasificacion.deleteClassification)
}