import { Router } from "express";
import { getUsers, createUser, getUserById, updateUser } from "../controllers/userController.js";
import { proteger, permitirRoles } from "../middlewares/auth.js";

const router = Router();

// Todas las rutas de usuarios requieren estar autenticado y ser ADMIN
router.use(proteger, permitirRoles("ADMIN"));

router.get("/", getUsers);
router.post("/", createUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);

export default router;
