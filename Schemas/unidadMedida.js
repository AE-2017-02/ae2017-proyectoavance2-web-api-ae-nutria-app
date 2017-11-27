var mongoose=require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var unidadMedidadSchema=new mongoose.Schema({
    cDescripcion:{type:String,maxlength:100,required:true},
    bMedible:{type:Boolean,required:true,default:true},
    cImagen:{type:String},
    bEstado: { type: Boolean, default: true}
})

unidadMedidadSchema.plugin(uniqueValidator);
//module.exports=unidadMedidadSchema;
module.exports=mongoose.model('Unidad',unidadMedidadSchema,'unidad');
	