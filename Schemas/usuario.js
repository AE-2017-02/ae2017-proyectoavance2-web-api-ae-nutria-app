var mongoose=require('mongoose');

var usuarioSchema=new mongoose.Schema({
    cNombre:{type:String, required:true,maxlength:100},    
    bEstado:{type:Boolean, required:true, default:true},
    cImagen: {type: String,required: true},
    nIdPaciente:{type:mongoose.Schema.Types.ObjectId},//{type:mongoose.Schema.Types.ObjectId,required:true},        
    dAlta:{type:Date,default:new Date()}
});


//module.exports=usuarioSchema;
module.exports=mongoose.model('Usuario',usuarioSchema,'usuario');
//Mayuscula Usuario:{propieda}
//Retorno Mayuscula Usuario


