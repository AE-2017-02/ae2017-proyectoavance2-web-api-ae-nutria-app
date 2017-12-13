var Unidad= require('../Controllers/unidad');

module.exports = function(router){
    router.get('/unity',Unidad.getUnity),
	router.get('/unity/id/:id',Unidad.getUnityId),
	router.post('/unity/add', Unidad.saveUnity),	
    router.put('/unity/update', Unidad.updateUnity),
    router.delete('/unity/delete/:id', Unidad.deleteUnity)    
}
