var mongoose=require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');
var usuarioSchema=new mongoose.Schema({
    Usuario:{type:String, required:true,maxlength:100,unique:true},    
    Estado:{type:Boolean, required:true, default:true},
    Imagen: {type: String,required: true,match: /^http:\/\//i},
    Password:{type:String, required:true},    
    Alta:{type:Date,default:new Date()}    
});

usuarioSchema.plugin(uniqueValidator);
//module.exports=usuarioSchema;
module.exports = mongoose.model('Administrador', usuarioSchema,'administrador')

