var Categoria= require('../Controllers/categoria');

module.exports = function(router){
    router.get('/category',Categoria.getCategory),
	router.get('/category/id/:id',Categoria.getCategoryId),
	router.post('/category/add', Categoria.saveCategory),	
    router.put('/category/update', Categoria.updateCategory),
    router.delete('/category/delete/:id', Categoria.deleteCategory)
}
