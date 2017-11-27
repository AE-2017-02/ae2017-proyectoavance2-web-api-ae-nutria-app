var Appointment= require('../Controllers/cita');

module.exports = function(router){
    router.get('/appointment',Appointment.getAppointment),
	router.get('/appointment/id/:id',Appointment.getAppointmentId),
    router.get('/appointment/day',Appointment.getAppointmentDay),
	router.post('/appointment/add', Appointment.saveAppointment),	
    router.put('/appointment/update', Appointment.updateAppointment),
    router.put('/appointment/state', Appointment.updateAppointmentState),
    router.delete('/appointment/:id', Appointment.deleteAppointment)
}