import { Router } from "express";
import {
  getEquipment,
  createEquipment,
  getEquipmentById,
  updateEquipment,
  deleteEquipment,
  getEquipmentHistory,
  generarMantenimientosPreventivos,
} from "../controllers/equipmentController.js";
import { proteger, permitirRoles } from "../middlewares/auth.js";

const router = Router();

// Todas las rutas de equipos requieren estar autenticado
router.use(proteger);

router.get("/", getEquipment);
router.post("/", permitirRoles("ADMIN"), createEquipment);
router.post(
  "/generar-mantenimientos-preventivos",
  permitirRoles("ADMIN"),
  generarMantenimientosPreventivos
);
router.get("/:id", getEquipmentById);
router.get("/:id/history", getEquipmentHistory);
router.put("/:id", permitirRoles("ADMIN"), updateEquipment);
router.delete("/:id", permitirRoles("ADMIN"), deleteEquipment);

export default router;
