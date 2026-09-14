import { Router } from "express";
import { register, login, getMe, updateMe } from "../controllers/authController.js";
import { proteger, permitirRoles } from "../middlewares/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", proteger, getMe);
router.put("/me", proteger, permitirRoles("ADMIN"), updateMe);

export default router;
