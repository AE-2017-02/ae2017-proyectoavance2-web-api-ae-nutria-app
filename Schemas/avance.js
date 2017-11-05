var mongoose=require('mongoose');

var avanceSchema=new mongoose.Schema({    
    nIdPaciente:{type:mongoose.Schema.Types.ObjectId},    
    oCircuferencia:{
        nBrazo:{type:Number},
        nBContraido:{type:Number},
        nCintura:{type:Number},
        nMuslo:{type:Number},
        nCadera:{type:Number},
        nPantorrilla:{type:Number},
        nMuneca:{type:Number}        
    },
    oPliegues:{
        nTripicial:{type:Number},        
        nEscapular:{type:Number},        
        nBicipital:{type:Number},        
        nSiliaco:{type:Number},        

        nEspinale:{type:Number},
        nAbdominal:{type:Number},
        nMuslo:{type:Number},
        nPantorilla:{type:Number}
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