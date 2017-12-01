'use-strict'

const Despensa = require('../Schemas/despensa');
const Service = require('../Service/functions');
var status = require('http-status');

function getPantryId(req, res){
	try{
		var paciente = req.params.id;
		var fecha = new Date(req.params.date);
	}catch(e){
		return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
	}
	try{
		Despensa.findOne({"nIdPaciente": paciente, "dConsumo": fecha}, function(error, despensa){
			if(error){
				return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });
			}
			if(!despensa){
				return res.status(status.NOT_FOUND).json({ Codigo: status.NOT_FOUND, Mensaje: 'No se encontro despensa para la fecha', Detalle: '' });
			}

			return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Operacion Exitosa', Despensa: despensa });
		}).populate(
		{path: "oProductos.nIdProducto", model: "Producto", select: {"cDescripcion": 1, "nIdTipo": 1, "nIdUnidad": 1},
		populate: 
		[
		{path: "nIdTipo", model: "Categoria", select: {"cDescripcion": 1}},
		{path: "nIdUnidad", model: "Unidad", select: {"cDescripcion": 1}}
		]
	});
	}catch(e){
		return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
	}
};

function updatePantryId(req, res){
	try{
		var datos = req.body.Despensa;
	}catch(e){
		return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });	
	}

	try{

		Despensa.findOne({"nIdPaciente": datos.IdPaciente, "dConsumo": datos.Consumo}, function(error, despensa){
			if(error){
				return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: error.toString() });	
			}
			if(!despensa){
				Despensa.create({
					"nIdPaciente": datos.IdPaciente,
					"dConsumo": new Date(datos.Consumo),
					"oProductos": datos.Productos
				});		
			}else{
				despensa.oProductos = datos.Productos;
				desepnsa.save(function(er){
					if(er){
						return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: er.toString()});	
					}
				});
			}
			return res.status(status.OK).json({ Codigo: status.OK, Mensaje: 'Operacion Exitosa', Detalle: "" });
		});


		
	}catch(e){
		return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });		
	}
};

module.exports = {
	getPantryId,
	updatePantryId
};