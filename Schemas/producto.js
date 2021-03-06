var mongoose=require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var productoSchema=new mongoose.Schema({
    cDescripcion:{type:String, required:true,maxlength:100,unique:true},
    cImagen:{type:String,maxlength:250},
    nPorcion:{type:Number,required:true,default:1},
    nIdTipo:{type:mongoose.Schema.Types.ObjectId},
    nIdUnidad:{type:mongoose.Schema.Types.ObjectId},            
    dBaja:{type:Date},
    bEstado: { type: Boolean, default: true}
});

productoSchema.plugin(uniqueValidator);
//module.exports=productoSchema;
module.exports=mongoose.model('Producto',productoSchema,'producto');
	