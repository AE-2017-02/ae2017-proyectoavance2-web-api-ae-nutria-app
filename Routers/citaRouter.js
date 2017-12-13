var Appointment= require('../Controllers/cita');

module.exports = function(router){
    router.get('/appointment',Appointment.getAppointment),
	router.get('/appointment/id/:id',Appointment.getAppointmentId),
    router.get('/appointment/patient/:id',Appointment.getAppointmentPatientId),
    router.get('/appointment/day',Appointment.getAppointmentDay),
    router.get('/appointment/all',Appointment.getAppointmentAll),
	router.post('/appointment/add', Appointment.saveAppointment),	
    router.post('/appointment/addWeb', Appointment.saveAppointmentWeb),	    
    router.put('/appointment/update', Appointment.updateAppointment),
    router.put('/appointment/state', Appointment.updateAppointmentState),
    router.delete('/appointment/:id', Appointment.deleteAppointment)
}