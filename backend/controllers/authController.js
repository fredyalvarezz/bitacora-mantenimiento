import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Funcion auxiliar para generar el token JWT de un usuario
const generarToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @desc    Registrar un nuevo usuario (solo lo hace un ADMIN desde /api/users normalmente,
//          pero dejamos /register disponible para crear el primer admin del sistema)
// @route   POST /api/auth/register
export const register = async (req, res, next) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ mensaje: "Nombre, email y password son obligatorios" });
    }

    const existeUsuario = await User.findOne({ email });
    if (existeUsuario) {
      return res.status(400).json({ mensaje: "Ya existe un usuario con ese email" });
    }

    const usuario = await User.create({
      nombre,
      email,
      password,
      rol: ["ADMIN", "TECHNICIAN", "EMPLOYEE"].includes(rol) ? rol : "TECHNICIAN",
    });

    res.status(201).json({
      usuario,
      token: generarToken(usuario._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Iniciar sesion
// @route   POST /api/auth/login
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ mensaje: "Email y password son obligatorios" });
    }

    const usuario = await User.findOne({ email });
    if (!usuario || !usuario.activo) {
      return res.status(401).json({ mensaje: "Credenciales invalidas" });
    }

    const passwordCorrecta = await usuario.compararPassword(password);
    if (!passwordCorrecta) {
      return res.status(401).json({ mensaje: "Credenciales invalidas" });
    }

    res.json({
      usuario,
      token: generarToken(usuario._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener el usuario autenticado actual
// @route   GET /api/auth/me
export const getMe = async (req, res, next) => {
  try {
    // req.usuario ya viene lleno por el middleware "proteger"
    res.json(req.usuario);
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar el perfil propio (nombre, email y/o contrasena)
// @route   PUT /api/auth/me
export const updateMe = async (req, res, next) => {
  try {
    const { nombre, email, password } = req.body;
    const usuario = await User.findById(req.usuario._id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    if (email && email !== usuario.email) {
      const existeEmail = await User.findOne({ email });
      if (existeEmail) {
        return res.status(400).json({ mensaje: "Ya existe un usuario con ese email" });
      }
      usuario.email = email;
    }

    if (nombre) usuario.nombre = nombre;

    // La contrasena es opcional: si no se envia, se conserva la actual
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ mensaje: "La contrasena debe tener al menos 6 caracteres" });
      }
      usuario.password = password; // el hook pre("save") del modelo la encripta
    }

    await usuario.save();
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};
