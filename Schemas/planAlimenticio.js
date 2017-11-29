var mongoose=require('mongoose');

var planAlimenticioSchema=new mongoose.Schema({
    dCreacion:{type:Date, required:true,default: new Date()},     
    nIdPaciente:{type:mongoose.Schema.Types.ObjectId},    
    oPlan:[
        {
	        nIdMenu:{type:mongoose.Schema.Types.ObjectId},
	        nHora:{type:Number,required: true},
	        bEstado: {type: Boolean, required: true, default: false},
	        dConsumo: {type: Date, default: new Date("2000/01/01")}
        }]    
});
//module.exports=planAlimenticioSchema;   

module.exports=mongoose.model('Plan',planAlimenticioSchema,'plan');	
	