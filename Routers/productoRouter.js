var Producto= require('../Controllers/producto');
const auth = require('../middlewares/auth')
module.exports = function(router){
    router.get('/product',Producto.getProduct),
	router.get('/product/id/:id',Producto.getProductId),
	router.post('/product/add', Producto.saveProduct),	
    router.put('/product/update', Producto.updateProduct),
    router.delete('/product/delete/:id', Producto.deleteProduct)
}
