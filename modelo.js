//Dependencias
var mongoose=require('mongoose');
var funcional=require('underscore');

module.exports=function(wagner){
	//Conexion a la base de datos Corre2
	mongoose.connect('mongodb://localhost:27017/nutricionDev',{ useMongoClient: true });
	//Variable de trabajo compuesta por un Nombre,Estructura,Colección en la bd
	var Avance=mongoose.model('Avance',require('./Schemas/avance'),'avance');
	var Cita=mongoose.model('Cita',require('./Schemas/cita'),'cita');
	var Menu=mongoose.model('Menu',require('./Schemas/menu'),'menu');
	var Paciente=mongoose.model('Paciente',require('./Schemas/paciente'),'paciente');
	var Plan=mongoose.model('Plan',require('./Schemas/planAlimenticio'),'plan');	
	var Producto=mongoose.model('Producto',require('./Schemas/producto'),'producto');
	var TipoM=mongoose.model('TipoM',require('./Schemas/tipoMenu'),'tipoMenu');
	var TipoP=mongoose.model('TipoP',require('./Schemas/tipoProducto'),'tipoProducto');
	var Unidad=mongoose.model('Unidad',require('./Schemas/unidadMedida'),'unidad');
	var Usuario=mongoose.model('Usuario',require('./Schemas/usuario'),'usuario');
	var Administrador=mongoose.model('Administrador',require('./Schemas/administrador'),'administrador');
	var Notificacion=mongoose.model('Notificacion',require('./Schemas/notificacion'),'notificacion');
	//Modelos a utilizar
	var modelos={
		//nombre:Variable asociada al esquema-bd		
		Cita:Cita,
		Menu:Menu,
		Avance:Avance,
		Paciente:Paciente,
		Plan:Plan,
		Producto:Producto,
		TipoM:TipoM,
		TipoP:TipoP,
		Unidad:Unidad,
		Usuario:Usuario,
		Administrador:Administrador,
		Notificacion:Notificacion
	};
	//Inyeccion de dependencias, 
	//donde se agrupan todos los modelos
	funcional.each(modelos,function(value,key){
		wagner.factory(key,function(){
			return value;
		});
	});
	return modelos;	
};



// db.paciente.insert({
// 	oGenerales:
// 	{
// 		cNombre: "Kervin",
//         cApellidoP:"Garcia",
//         cApellidoM:"Carlos",
//         cSexo:"Masculino",
//         email:"kervin@gmail.com",
//         cTelefono:"2102828",
//         dFechaNac:new Date("2015","1","5"),
//         nEdad:21
// 	}
// 	oAntecedentes:{
// 		npesoHabitual:60
//         bObesidadFamiliar:false
// 	}
// 	oExtra:{
// 		Nota:"NO COMER"
// 	}
// })


//ObjectId("59febbc5dc3320d82c139d1c")

//{"cNombre" : "LaYare", "cPin" : "1234", "nIdPaciente" : ObjectId("59febbc5dc3320d82c139d1c"), "dAlta" :new Date(), "cEstado" : true }