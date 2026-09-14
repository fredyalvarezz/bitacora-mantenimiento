import User from "../models/User.js";

const ROLES_VALIDOS = ["ADMIN", "TECHNICIAN", "EMPLOYEE"];

// Evita guardar un rol invalido si llega algo inesperado desde el cliente
const normalizarRol = (rol, porDefecto = "TECHNICIAN") =>
  ROLES_VALIDOS.includes(rol) ? rol : porDefecto;

// @desc    Obtener todos los usuarios (solo ADMIN)
// @route   GET /api/users
export const getUsers = async (req, res, next) => {
  try {
    const usuarios = await User.find().sort({ createdAt: -1 });
    res.json(usuarios);
  } catch (error) {
    next(error);
  }
};

// @desc    Crear un usuario nuevo (solo ADMIN)
// @route   POST /api/users
export const createUser = async (req, res, next) => {
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
      rol: normalizarRol(rol),
    });

    res.status(201).json(usuario);
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener un usuario por id
// @route   GET /api/users/:id
export const getUserById = async (req, res, next) => {
  try {
    const usuario = await User.findById(req.params.id);
    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json(usuario);
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar un usuario: nombre, email, rol, contrasena y/o estado activo (solo ADMIN)
// @route   PUT /api/users/:id
export const updateUser = async (req, res, next) => {
  try {
    const { nombre, email, password, rol, activo } = req.body;
    const usuario = await User.findById(req.params.id);

    if (!usuario) {
      return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    // Evitamos que un admin se deshabilite a si mismo por accidente y se quede sin acceso
    if (
      typeof activo === "boolean" &&
      activo === false &&
      usuario._id.toString() === req.usuario._id.toString()
    ) {
      return res.status(400).json({ mensaje: "No puedes deshabilitar tu propia cuenta" });
    }

    if (email && email !== usuario.email) {
      const existeEmail = await User.findOne({ email });
      if (existeEmail) {
        return res.status(400).json({ mensaje: "Ya existe un usuario con ese email" });
      }
      usuario.email = email;
    }

    if (nombre) usuario.nombre = nombre;
    if (rol) usuario.rol = normalizarRol(rol, usuario.rol);
    if (typeof activo === "boolean") usuario.activo = activo;

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
