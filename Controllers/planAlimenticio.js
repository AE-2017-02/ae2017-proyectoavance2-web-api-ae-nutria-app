'use-strict'

const Plan = require('../Schemas/planAlimenticio');
const Service = require('../Service/functions');
var status = require('http-status');
function getPlan(req, res) {
    try {
        Plan.find().exec(Service.handleMany.bind(null, 'Plan', res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function getPlanPatientId(req, res) {
    try {

        Plan.findOne({ nIdPaciente: req.params.id }).select({'oPlan.nIdMenu':1, 'oPlan.bEstado':1, 'oPlan.dConsumo':1}).sort({ dCreacion: -1 }).populate(
            { path: "oPlan.nIdMenu", model: "Menu",

            populate: [{path: "oComida.nIdProducto", 
            model: "Producto",select:{"cDescripcion":1,"_id":0}, 
            populate:{path:"nIdUnidad", model:"Unidad",select:{"cDescripcion":1,"_id":0}}},
            {path: "nIdTipoMenu", model: "Clasificacion", select:{"cDescripcion":1,"_id":0}}]
        }

        ).exec(Service.handleMany.bind(null, 'Menu',res));
    }
    catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function savePlan(req, res) {
    try {
        var datos = req.body.Plan;
    } catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: "Plan no valido", Detalle: e.message });
    }
    try {
        Plan.create({
            nIdPaciente: datos.IdPaciente,
            oPlan: datos.Plan   
        }, function (error, plan) {
            if (error) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un error", Detalle: error.toString() });
            }
            if (!plan) {
                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "Problema al crear el plan", Detalle: "" });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: "Se inserto el plan alimenticio", Detalle: "" });
        });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
    }
}

function deletePlan(req, res) {
    try {
        var datos = req.body.Plan;
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
    }
    try {
        Plan.deleteOne({ "_id": datos.IdPlan }, function (error, plan) {
            if (error) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un error", Detalle: e.message });
            }
            if (!plan) {
                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "No se pudo borrar el plan alimenticio", Detalle: "" });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: "Se borro el plan", Detalle: "" });
        });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

function updatePlanMenu(req, res) {
    try {
        var datos = req.body.Plan;
    } catch (e) {
        return res.status(status.BAD_REQUEST).json({ Codigo: status.BAD_REQUEST, Mensaje: "Plan no valido", Detalle: e.message });
    }
    try {
        Plan.findOne({ "nIdPaciente": datos.IdPaciente }, function (error, plan) {
            if (error) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un error", Detalle: e.message });
            }
            if (!plan) {
                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "No se pudo agregar el plan", Detalle: "" });
            }

            plan.oPlan.push({
                "nIdMenu": datos.IdMenu,
                "nHora": datos.Hora
            });
            try {
                plan.save();
            } catch (e) {
                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "No se pudo agregar el plan", Detalle: e.message });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: "Se agrego el plan", Detalle: "" });
        });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
    }
}

function deletePlanMenu(req, res) {
    try {
        var datos = req.body.Plan;
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
    }
    try {

        Plan.findOne({ "nIdPaciente": datos.IdPaciente }, function(error, plan){
            if (error) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
            }
            if (!plan) {
                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "No se pudo borrar el plan", Detalle: "" });
            }
            var index = plan.oPlan.findIndex(x => x.nIdMenu == datos.IdMenu);
            plan.oplan.splice(index, 1);
            plan.save(function(error){
                if(error){
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });                    
                }
            });
        });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}

// function changeStatusPlanMenu(req, res){
//     try{
//         var datos = req.body.Plan;
//     }catch(e){
//         return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
//     }

//     try{
//         Plan.find({"nIdPaciente": datos.IdPaciente}, function(error, planillo){
//             if(error){
//                 return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: error.toString() });
//             }
//             if(!planillo){
//                 return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "No se encontro el plan", Detalle: "" });
//             }
//             var index = planillo[0].oPlan.findIndex(x => x.nIdMenu == datos.IdMenu);
//             if(index != -1){
//                 planillo[0].oPlan[index].bEstado = !planillo[0].oPlan[index].bEstado;
//                 Plan.update({"_id": planillo[0]._id}, planillo[0], function(er){
//                     if(er){
//                         return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
//                     }
//                 });
//                 return res.status(status.OK).json({ Codigo: status.OK, Mensaje: "Se cambio el estado", Detalle: "" });
//             }else{
//              return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "No se encontro", Detalle: "" });   
//             }
//         }).sort({"dCreacion": 1}).limit(1);
//     }catch(e){
//         return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
//     }
// };

function changeDatePlanMenu(req, res){
    try{
        var datos = req.body.Plan;
    }catch(e){
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
    }

    try{
        Plan.find({"nIdPaciente": datos.IdPaciente}, function(error, plan){
            if(error){
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: error.toString() });
            }
            if(!plan){
                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "No se encontro el plan", Detalle: "" });
            }
            var fecha = datos.Fecha;
            var arregloMenus =  datos.Plan;
            var tamaño = arregloMenus.length;
            for(var i = 0; i < tamaño; i++){
                var idMenu = arregloMenus[i].IdMenu;
                var estado = arregloMenus[i].Estado;

                var index = plan[0].oPlan.findIndex(x => x.nIdMenu == idMenu);
                if(index != -1){
                    if(estado){
                        plan[0].oPlan[index].dConsumo.addToSet(fecha);
                    }else{
                        plan[0].oPlan[index].dConsumo.pull(new Date(fecha));
                    }
                    Plan.update({"_id": plan[0]._id}, plan[0], function(er){
                        if(er){
                            return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
                        }
                    });
                    
                }
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: "Se cambio la fecha", Detalle: "" });
       }).sort({"dCreacion": -1}).limit(1);;
    }catch(e){
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
    }
};

function getPlanMenuDateId(req, res){

    try{
        Plan.find({"nIdPaciente": req.params.id }, function(error, plan){
            if(error){
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: error.toString() });
            }
            if(!plan){
                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "No se encontro el plan", Detalle: "" });
            }

        })
        .sort({"dCreacion": -1})
        .limit(1)
        .select({"oPlan.nIdMenu": 1,"oPlan.bEstado": 1, "oPlan.dConsumo": 1})
        .populate({path:"oPlan.nIdMenu", model: "Menu", select: {"oComida.nIdProducto": 1, "oComida.nCantidad": 1}, populate: [
            {path: "oComida.nIdProducto", model: "Producto", select: {"cDescripcion": 1, "nIdTipo": 1,
            "nIdUnidad": 1}, populate: [
            {path: "nIdTipo", model: "Categoria", select: {"cDescripcion": 1}},
            {path: "nIdUnidad", model: "Unidad", select: {"cDescripcion": 1}}
            ]}
            ]}).exec(Service.handleMany.bind(null, 'Despensa',res));
    }catch(e){
     return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });           
 }
};



module.exports = {
    getPlan,
    getPlanPatientId,    
    savePlan,
    updatePlanMenu,
    deletePlanMenu,
    deletePlan,
    changeDatePlanMenu,
    getPlanMenuDateId
}