import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import equipmentRoutes from "./routes/equipmentRoutes.js";
import incidentRoutes from "./routes/incidentRoutes.js";
import { notFound, errorHandler } from "./middlewares/errorHandler.js";

const app = express();

// Configuracion de CORS: solo permitimos que el frontend definido en .env consuma la API
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: clientUrl,
    credentials: true,
  })
);

// Permite leer JSON en el body de las peticiones
app.use(express.json());

// Ruta de salud, util para verificar que el backend desplegado esta funcionando
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Rutas principales de la API
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/equipment", equipmentRoutes);
app.use("/api/incidents", incidentRoutes);

// Middlewares de error (siempre van al final)
app.use(notFound);
app.use(errorHandler);

export default app;
