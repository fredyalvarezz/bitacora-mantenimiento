import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Middleware que verifica que el usuario envio un token JWT valido
// Si el token es correcto, guarda el usuario en req.usuario para usarlo despues
export const proteger = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ mensaje: "No autorizado, falta el token" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await User.findById(decoded.id);
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ mensaje: "Usuario no valido o inactivo" });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token invalido o expirado" });
  }
};

// Middleware que restringe el acceso segun el rol del usuario
// Uso: permitirRoles("ADMIN") o permitirRoles("ADMIN", "TECHNICIAN")
export const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario || !rolesPermitidos.includes(req.usuario.rol)) {
      return res
        .status(403)
        .json({ mensaje: "No tienes permisos para realizar esta accion" });
    }
    next();
  };
};
