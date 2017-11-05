//api de google maps AIzaSyCIynyBul2aSPTwOh_soB3ANdj78EX8W_c
var mongoose = require('mongoose');

 var userSchema= new mongoose.Schema({
  perfil: {
    username: {type: String,required: true},
    picture: {type: String,required: true,match: /^http:\/\//i},
    email:{type:String, maxlength:100,match:/^[_a-z0-9-]+(.[_a-z0-9-]+)*@[a-z0-9-]+(.[a-z0-9-]+)*(.[a-z]{2,4})$/},			
  	alias:{type:String, maxlength:100 },                   
	  token:{type:Number}       
  },
  data: {
    oauth: { type: String, required: false },
    amigos:[{
    	//idamigo:{type:mongoose.Schema.Types.ObjectId, ref:"Usuario"}    	
      idamigo:{type:mongoose.Schema.Types.ObjectId}      
    }],
    recorridos:[
    {
    	//idRecorrido:{type:mongoose.Schema.Types.ObjectId},
      distancia:{type:Number,required:true},
      tiempo:{type:Number,required:true},
      img:{type:String},
      fecha:{type:Date,required:true}
    }]    

  }
});
userSchema.virtual('velocidad').get(function(){
  var t=0,d=0;
  this.data.recorridos.forEach(function(elemento){
    d+=elemento.distancia;
    t+=elemento.tiempo;
  });      
  return isNaN(t) || t==0?0+"Km/h":d/(t/60)+"Km/h";
});

userSchema.virtual('distanciaAll').get(function(){
  var d=0;
  this.data.recorridos.forEach(function(elemento){d+=elemento.distancia;});    
  return isNaN(d)?0+"Km":d+"Km";
});


userSchema.set('toObject', { virtuals: true });
userSchema.set('toJSON', { virtuals: true });
module.exports=userSchema;
