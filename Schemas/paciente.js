var mongoose=require('mongoose');

var pacienteSchema=new mongoose.Schema({
    cPin:{type:String,maxlength:6},
    bEstado:{type:Boolean, default:false},
    dAlta:{type:Date, defaulta: new Date()},
    oGenerales:{
        cNombre: {type: String,required: true},
        cApellidoP: {type: String,required: true},
        cApellidoM: {type: String},
        cSexo: {type: String,required: true},
        cEmail:{type:String, maxlength:100,required:true,match:/^[_a-zA-Z0-9-]+(.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(.[a-zA-Z0-9-]+)*(.[a-zA-Z]{2,4})$/},
        cTelefono:{type:String,maxlength:20,required:true,match:/^[0-9-]+([0-9-]+)$/},
        dFechaNac:{type:Date,required:true}
    },
    oAntecedentes:{
        nPesoHabitual:{type:Number},
        bObesidadFamiliar:{type:Boolean},
        bColesterol:{type:Boolean},
        bHipertension:{type:Boolean},
        bAlcohol:{type:Boolean},
        bTabaco:{type:Boolean},
        bDiabtes:{type:Boolean},
        bHipotencion:{type:Boolean}        
    },
    oExtra:{
        cNotas:{type:String,maxlength:500},
        cPatologia:{type:String,maxlength:500},
        cAlergia:{type:String,maxlength:500},
        cMedicamentos:{type:String,maxlength:500},
        cMeta:{type:String,maxlength:500},
    }
});

pacienteSchema.virtual("NombreCompleto").get(function(){    
    return (this.oGenerales.cNombre+' '+this.oGenerales.cApellidoP);
//+' '+this.oGenerales.cApellidoM);
});

pacienteSchema.virtual("oGenerales.nEdad").get(function(){
    var nacimiento = new Date(this.oGenerales.dFechaNac);
    var actual = new Date();
    var edad = actual.getFullYear() - nacimiento.getFullYear();
    if(nacimiento.getMonth() >= actual.getMonth() && nacimiento.getDate() > actual.getDate()){
        edad--;
    }
    return edad;
});

pacienteSchema.set('toObject',{virtuals:true});
pacienteSchema.set('toJSON',{virtuals:true});
//module.exports=pacienteSchema;   
module.exports=mongoose.model('Paciente',pacienteSchema,'paciente');

	