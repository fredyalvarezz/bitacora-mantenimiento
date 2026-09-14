import { Router } from "express";
import {
  getIncidents,
  createIncident,
  getIncidentById,
  updateIncident,
  deleteIncident,
  getDashboardStats,
} from "../controllers/incidentController.js";
import { proteger, permitirRoles } from "../middlewares/auth.js";

const router = Router();

// Todas las rutas de incidencias requieren estar autenticado
router.use(proteger);

router.get("/stats/dashboard", getDashboardStats);
router.get("/", getIncidents);
// Solo ADMIN (crea directamente) y EMPLOYEE (levanta el ticket) pueden crear incidencias.
// Un TECHNICIAN nunca crea incidencias, solo las atiende.
router.post("/", permitirRoles("ADMIN", "EMPLOYEE"), createIncident);
router.get("/:id", getIncidentById);
// ADMIN edita todo; TECHNICIAN solo estado/diagnostico/solucion/observaciones (validado en el controller)
router.put("/:id", permitirRoles("ADMIN", "TECHNICIAN"), updateIncident);
router.delete("/:id", permitirRoles("ADMIN"), deleteIncident);

export default router;
