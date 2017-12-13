var Paciente= require('../Controllers/paciente');
const auth = require('../middlewares/auth')
module.exports = function(router){
    router.get('/patient',Paciente.getPatient),
    router.get('/applicant',Paciente.getApplication),
    router.get('/patient/web',Paciente.getPatientWeb),    
    router.get('/patient/webUser',Paciente.getPatientWebUsuario),    
    router.get('/patient/webActive',Paciente.getPatientWebActive),
	router.get('/patient/id/:id',Paciente.getPatientId),
    router.get('/patient/pin/:id',Paciente.getPatientPin),
	router.post('/patient/add', Paciente.savePatient),	
    router.put('/patient/state/:id', Paciente.updatePatientState),
    router.put('/patient/web/update', Paciente.updatePatientWeb)
    
}
