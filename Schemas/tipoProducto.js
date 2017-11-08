var mongoose=require('mongoose');

var tipoProductoSchema=new mongoose.Schema({
    cDescripcion:{type:String,maxlength:100,required:true}
})

module.exports=tipoProductoSchema;


