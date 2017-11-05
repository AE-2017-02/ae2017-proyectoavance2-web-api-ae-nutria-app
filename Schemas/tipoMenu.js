var mongoose=require('mongoose');

var tipoMenuSchema=new mongoose.Schema({
    cDescripcion:{type:String,maxlength:250,required:true}
})

module.exports=tipoMenuSchema;