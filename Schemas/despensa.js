var mongoose = require('mongoose');

var despensaSchema = new mongoose.Schema({
	nIdPaciente: {type: mongoose.Schema.Types.ObjectId},
	dConsumo: {type: Date},
	oProductos:[
		{
			nIdProducto: { type: mongoose.Schema.Types.ObjectId, required: true},
			nCantidad: {type: Number, required:true},
			bMarcado: {type: Boolean, default: false}
		}
	]
});

module.exports = mongoose.model("Despensa", despensaSchema, "despensa");