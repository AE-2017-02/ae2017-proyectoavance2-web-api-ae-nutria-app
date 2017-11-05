var mongoose=require('mongoose');

var pacienteSchema=new mongoose.Schema({
    oGenerales:{
        cNombre: {type: String,required: true},
        cApellidoP: {type: String,required: true},
        cApellidoM: {type: String,required: true},
        cSexo: {type: String,required: true},
        email:{type:String, maxlength:100,match:/^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/},
        cTelefono:{type:String,maxlength:20,match:/^[0-9-]+([0-9-]+)$/},
        dFechaNac:{type:Date,required:true,set:function(v){
            this.nEdad= new Date().getFullYear() - v.getFullYear();
        }},
        nEdad:{type:Number}
    },
    oAntecedentes:{
        npesoHabitual:{type:Number},
        bObesidadFamiliar:{type:Boolean},
        bColesterol:{type:Boolean},
        bHipertension:{type:Boolean},
        bAlcohol:{type:Boolean},
        bTabaco:{type:Boolean},
        bDiabtes:{type:Boolean},
        bHipertension:{type:Boolean}        
    },
    oExtra:{
        cNotas:{type:String,maxlength:500},
        cPatologia:{type:String,maxlength:500},
        cAlergia:{type:String,maxlength:500},
        cMedicamentos:{type:String,maxlength:500},
        cMeta:{type:String,maxlength:500},
    }
});

// pacienteSchema.virtual("Nombre2").get(function(){    
//     return (this.oGenerales.cNombre+this.oGenerales.cApellidoP
//     +this.oGenerales.cApellidoM);
// });
// pacienteSchema.set('toObject',{virtuals:true});
// pacienteSchema.set('toJSON',{virtuals:true});
module.exports=pacienteSchema;   