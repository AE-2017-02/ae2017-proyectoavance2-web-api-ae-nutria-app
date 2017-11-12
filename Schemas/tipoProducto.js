var mongoose=require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var tipoProductoSchema=new mongoose.Schema({
    cDescripcion:{type:String,maxlength:100,required:true,unique:true}
})

tipoProductoSchemas.plugin(uniqueValidator);
module.exports=tipoProductoSchema;


