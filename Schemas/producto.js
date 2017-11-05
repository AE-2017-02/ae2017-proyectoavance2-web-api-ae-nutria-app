var mongoose=require('mongoose');

var productoSchema=new mongoose.Schema({
    cDescripcion:{type:String, required:true,maxlength:100},
    cImagen:{type:String,maxlength:250},
    nCalorias:{type:Number},
    nIdTipo:{type:mongoose.Schema.Types.ObjectId},
    nIdUnidad:{type:mongoose.Schema.Types.ObjectId},            
    dBaja:{type:Date}
});


module.exports=productoSchema;