var mongoose=require('mongoose');

var menuSchema=new mongoose.Schema({
    cNombre:{type:String, required:true,maxlength:250},
    nIdTipoMenu:{type:mongoose.Schema.Types.ObjectId},
    cDescripcion:{type:String,required:true,maxlength:500},
    oComida:[{
        nIdProducto:{type:mongoose.Schema.Types.ObjectId},
        nCantidad:{type:Number,required:true},
        nCalorias:{type:Number}
    }],
    bEstado:{ type: Boolean, default: true}
});

menuSchema.virtual('nSuma').get(function(){
    var sumatoria=0;
    this.oComida.forEach(function(producto){
        sumatoria+=producto.nCalorias;
    });
    return isNaN(sumatoria)?0:sumatoria;
})

menuSchema.set('toObject',{virtuals:true});
menuSchema.set('toJSON',{virtuals:true});
//module.exports=menuSchema;   

module.exports=mongoose.model('Menu',menuSchema,'menu');
	