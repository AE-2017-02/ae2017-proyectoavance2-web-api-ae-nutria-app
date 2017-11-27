'use-strict'

const Plan = require('../Schemas/planAlimenticio');
const Service = require('../Service/functions');
var status = require('http-status');
function getPlan(req, res) {
    try {
        Unidad.find().exec(Service.handleMany.bind(null, 'Unidad', res));
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
				    {path: "nIdTipoMenu", model: "TipoM", select:{"cDescripcion":1,"_id":0}}]
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
        Plan.findOneAndUpdate({ "nIdPaciente": datos.IdPaciente }, { $pull: { "oPlan": { "nIdMenu": datos.IdMenu } } }, function (error, plan) {
            if (error) {
                return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
            }
            if (!plan) {
                return res.status(status.CONFLICT).json({ Codigo: status.CONFLICT, Mensaje: "No se pudo borrar el plan", Detalle: "" });
            }
            return res.status(status.OK).json({ Codigo: status.OK, Mensaje: "Se borro el plan", Detalle: "" });
        });
    } catch (e) {
        return res.status(status.INTERNAL_SERVER_ERROR).json({ Codigo: status.INTERNAL_SERVER_ERROR, Mensaje: "Ha ocurrido un problema", Detalle: e.message });
    }
}



module.exports = {
    getPlan,
    getPlanPatientId,    
    savePlan,
    updatePlanMenu,
    deletePlanMenu,
    deletePlan
}