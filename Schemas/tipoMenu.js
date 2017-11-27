var mongoose=require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var tipoMenuSchema=new mongoose.Schema({
    cDescripcion:{type:String,maxlength:250,required:true,unique:true}
})

tipoMenuSchema.plugin(uniqueValidator);
//module.exports=tipoMenuSchema;
module.exports=mongoose.model('Clasificacion',tipoMenuSchema,'tipoMenu');
	
