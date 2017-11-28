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

        Plan.findOne({ nIdPaciente: req.params.id }).select('nIdMenu').sort({ dCreacion: -1 }).populate(
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
                "nHora": datos.Hora,
                "bEstado": datos.Estado,
                "dConsumo": datos.Consumo
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

function changeStatusPlanMenu(req, res){
    try{
        var datos = req.body.Plan;
    }catch(e){
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
    }

    try{
        Plan.findOne({"nIdPaciente": datos.IdPaciente}, function(error, plan){
            if(error){
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: error.toString() });
            }
            if(!plan){
                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "No se encontro el plan", Detalle: "" });
            }
            var index = plan.oPlan.findIndex(x => x.nIdMenu == datos.IdMenu);
            plan.oPlan[index].bEstado = !plan.oPlan[index].bEstado;
            plan.save(function(error){
                if(error){
                    return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
                }
            });
        });
    }catch(e){
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });
    }
};

function getPlanMenuDateId(req, res){
    try{
        var datos = req.body.Plan;
    }catch(e){
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: e.message });        
    }

    try{
        Plan.find({"nIdPaciente": datos.IdPaciente, "oPlan.dConsumo": datos.Consumo}, function(error, plan){
            if(error){
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Plan no valido", Detalle: error.toString() });
            }
            if(!plan){
                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "No se encontro el plan", Detalle: "" });
            } 
        })
        .select({"_id": 0, "nIdPaciente": 0, "oPlan.nIdMenu": 1, "oPlan.nHora": 1,
        "oPlan.bEstado": 1, "oPlan.dConsumo": 1})
        .populate({path:"oPlan.nIdMenu", model: "Menu", select: {"cNombre": 1, "nIdTipoMenu": 1, "bEstado": 1,
        "oComida.nIdProducto": 1, "oComida.nCantidad": 1, "_id":0}, populate: [
            {path: "nIdTipoMenu", model: "Clasificacion", select: {"cDescripcion": 1, "_id":0}},
            {path: "nIdProducto", model: "Producto", select: {"cDescripcion": 1, "nIdTipo": 1,
            "nIdUnidad": 1}, populate: [
                {path: "nIdTipo", model: "Categoria", select: {"_id": 0, "cDescripcion": 1}},
                {path: "nIdUnidad", model: "Unidad", select: {"_id": 0, "cDescripcion": 1}}
            ]}
        ]});
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
    changeStatusPlanMenu
}