var Despensa = require("../Controllers/despensa");

module.exports = function(router){
	router.get('/pantry/:id/:date', Despensa.getPantryId),
	router.put('/pantry/add', Despensa.updatePantryId)
};

