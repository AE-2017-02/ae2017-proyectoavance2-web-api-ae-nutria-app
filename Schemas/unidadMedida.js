var mongoose=require('mongoose');

var unidadMedidadSchema=new mongoose.Schema({
    cDescripcion:{type:String,maxlength:100,required:true},
    bMedible:{type:Boolean,required:true,default:true},
    cImagen:{type:String}
})

module.exports=unidadMedidadSchema;