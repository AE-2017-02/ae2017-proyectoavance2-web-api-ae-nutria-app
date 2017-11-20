var mongoose=require('mongoose');

var avanceSchema=new mongoose.Schema({    
    nIdPaciente:{type:mongoose.Schema.Types.ObjectId},        
    dFecha:{type:Date, required:true,default:new Date()},
    oCircuferencia:{
        nBrazo:{type:Number, default:0},
        nBContraido:{type:Number,default:0},
        nCintura:{type:Number,default:0},
        nMuslo:{type:Number,default:0},
        nCadera:{type:Number,default:0},
        nPantorrilla:{type:Number,default:0},
        nMuneca:{type:Number,default:0}        
    },
    oPliegues:{
        nTripicial:{type:Number,default:0},        
        nEscapular:{type:Number,default:0},        
        nBicipital:{type:Number,default:0},        
        nSiliaco:{type:Number,default:0},        

        nEspinale:{type:Number,default:0},
        nAbdominal:{type:Number,default:0},
        nMuslo:{type:Number,default:0},
        nPantorilla:{type:Number,default:0}
    }    
});

avanceSchema.virtual('nPliegues1').get(function(){
  var sumatoria=0;
  sumatoria=this.oPliegues.nTripicial+
    this.oPliegues.nEscapular+
    this.oPliegues.nBicipital+
    this.oPliegues.nSiliaco;
  return isNaN(sumatoria)?0:sumatoria;
});

avanceSchema.virtual('nPliegues2').get(function(){
  var sumatoria=0;
  sumatoria=this.oPliegues.nEspinale+
    this.oPliegues.nEspinale+
    this.oPliegues.nMuslo+
    this.oPliegues.nPantorilla;
  return isNaN(sumatoria)?0:sumatoria;
});

avanceSchema.set('toObject',{virtuals:true});
avanceSchema.set('toJSON',{virtuals:true});

module.exports=avanceSchema;