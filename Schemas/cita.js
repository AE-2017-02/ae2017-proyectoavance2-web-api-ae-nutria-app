var mongoose=require('mongoose');

var citaSchema=new mongoose.Schema({
    nIdPaciente:{type:mongoose.Schema.Types.ObjectId},    
    
    dFecha:{type:Date, required:true,default:new Date()},
    nHora:{type:Number,required:true},
    cEstado:{type:String, required:true, default:"Pendiente"},    
    cDescripcion:{type:String,maxlength:500}
});


module.exports=citaSchema;