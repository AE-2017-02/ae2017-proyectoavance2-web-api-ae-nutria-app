var Notificacion= require('../Controllers/notificacion');

module.exports = function(router){
    router.get('/notification',Notificacion.getNotification),
	router.get('/notification/id/:id',Notificacion.getNotificationId),
	router.post('/notification/add', Notificacion.saveNotification),
	router.get('/notification/general', Notificacion.getGeneralNotification),
	router.get('/notification/personal/:id', Notificacion.getPersonalNotification),
	router.post('/notification/onesignal', Notificacion.oneSignal)
}
