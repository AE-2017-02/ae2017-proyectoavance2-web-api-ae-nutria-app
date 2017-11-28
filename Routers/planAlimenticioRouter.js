var Plan= require('../Controllers/planAlimenticio');

module.exports = function(router){
    router.get('/foodplan',Plan.getPlan),
	router.get('/foodplan/patient/:id',Plan.getPlanPatientId),
	router.post('/foodplan/add', Plan.savePlan),	
    router.put('/foodplan/menu/add', Plan.updatePlanMenu),
    router.delete('/foodplan/menu/delete', Plan.deletePlanMenu),
    router.delete('/foodplan/delete', Plan.deletePlan),
    router.put('/foodplan/menu/change', Plan.changeStatusPlanMenu)
}
