var mongoose=require('mongoose');

var notificacionSchema=new mongoose.Schema({
    cTitulo:{type:String, required:true,maxlength:250},
    cAsunto:{type:String, maxlength:250},
    cMensaje:{type:String,maxlength:500},    
    oPacientes:[{nIdPaciente:{type:mongoose.Schema.Types.ObjectId}}],                
    dFecha:{type:Date,required:true, default:new Date()}    
});

//module.exports=notificacionSchema;   
module.exports=mongoose.model('Notificacion',notificacionSchema,'notificacion');
