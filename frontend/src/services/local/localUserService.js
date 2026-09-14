import {
  KEYS,
  leer,
  escribir,
  generarId,
  crearError,
  inicializarDatos,
  obtenerUsuarioActual,
} from "./localData";

// Version local (localStorage) de userService, con la misma interfaz que la version con API.
export const localUserService = {
  listar: async () => {
    inicializarDatos();
    const usuarios = leer(KEYS.users);
    // Nunca devolvemos la contrasena, igual que el toJSON() del modelo User en el backend
    return usuarios
      .map(({ password, ...resto }) => resto)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  crear: async ({ nombre, email, password, rol }) => {
    inicializarDatos();
    if (!nombre || !email || !password) {
      throw crearError("Nombre, email y password son obligatorios");
    }
    if (password.length < 6) {
      throw crearError("La contrasena debe tener al menos 6 caracteres");
    }

    const usuarios = leer(KEYS.users);
    if (usuarios.some((u) => u.email === email)) {
      throw crearError("Ya existe un usuario con ese email");
    }

    const ahora = new Date().toISOString();
    const nuevoUsuario = {
      _id: generarId("user"),
      nombre,
      email,
      password,
      rol: ["ADMIN","TECHNICIAN","EMPLOYEE"].includes(rol) ? rol : "TECHNICIAN",
      activo: true,
      createdAt: ahora,
      updatedAt: ahora,
    };

    usuarios.push(nuevoUsuario);
    escribir(KEYS.users, usuarios);

    const { password: _password, ...usuarioSinPassword } = nuevoUsuario;
    return usuarioSinPassword;
  },

  actualizar: async (id, { nombre, email, password, rol, activo }) => {
    inicializarDatos();
    const usuarios = leer(KEYS.users);
    const indice = usuarios.findIndex((u) => u._id === id);
    if (indice === -1) throw crearError("Usuario no encontrado", 404);

    const usuarioActual = obtenerUsuarioActual();
    if (typeof activo === "boolean" && activo === false && usuarioActual?._id === id) {
      throw crearError("No puedes deshabilitar tu propia cuenta");
    }

    if (email && email !== usuarios[indice].email) {
      if (usuarios.some((u) => u._id !== id && u.email === email)) {
        throw crearError("Ya existe un usuario con ese email");
      }
      usuarios[indice].email = email;
    }

    if (nombre) usuarios[indice].nombre = nombre;
    if (rol) usuarios[indice].rol = ["ADMIN","TECHNICIAN","EMPLOYEE"].includes(rol) ? rol : "TECHNICIAN";
    if (typeof activo === "boolean") usuarios[indice].activo = activo;

    if (password) {
      if (password.length < 6) {
        throw crearError("La contrasena debe tener al menos 6 caracteres");
      }
      usuarios[indice].password = password;
    }

    usuarios[indice].updatedAt = new Date().toISOString();
    escribir(KEYS.users, usuarios);

    const { password: _password, ...usuarioSinPassword } = usuarios[indice];
    return usuarioSinPassword;
  },
};
