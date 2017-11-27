var Menu= require('../Controllers/menu');

module.exports = function(router){
    router.get('/menu',Menu.getMenu),
	router.get('/menu/id/:id',Menu.getMenuId),
	router.post('/menu/add', Menu.saveMenu),	
    router.put('/menu/update', Menu.updateMenu),
    router.put('/menu/food/add', Menu.saveMenuFood),
    router.delete('/menu/delete', Menu.deleteMenu),
    router.delete('/menu/food/delete', Menu.deleteMenuFood)



}
