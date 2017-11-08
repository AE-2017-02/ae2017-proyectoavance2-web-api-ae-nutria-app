var mongoose=require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var unidadMedidadSchema=new mongoose.Schema({
    cDescripcion:{type:String,maxlength:100,required:true, unique:true},
    bMedible:{type:Boolean,required:true,default:true},
    cImagen:{type:String}
})

unidadMedidadSchema.plugin(uniqueValidator);
module.exports=unidadMedidadSchema;