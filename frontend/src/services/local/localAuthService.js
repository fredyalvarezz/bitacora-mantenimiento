import {
  KEYS,
  leer,
  escribir,
  generarId,
  crearError,
  inicializarDatos,
  obtenerUsuarioActual,
} from "./localData";

// Version local (localStorage) de authService. Misma forma de respuesta que la version
// con API real: { usuario, token }. Asi ninguna pagina necesita saber en que modo esta.
export const localAuthService = {
  login: async (email, password) => {
    inicializarDatos();
    const usuarios = leer(KEYS.users);
    const usuario = usuarios.find((u) => u.email === email);

    if (!usuario || !usuario.activo || usuario.password !== password) {
      throw crearError("Credenciales invalidas", 401);
    }

    const { password: _password, ...usuarioSinPassword } = usuario;
    return {
      usuario: usuarioSinPassword,
      token: `local-token-${usuario._id}`,
    };
  },

  register: async ({ nombre, email, password, rol }) => {
    inicializarDatos();
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
      rol: rol === "ADMIN" ? "ADMIN" : "TECHNICIAN",
      activo: true,
      createdAt: ahora,
      updatedAt: ahora,
    };

    usuarios.push(nuevoUsuario);
    escribir(KEYS.users, usuarios);

    const { password: _password, ...usuarioSinPassword } = nuevoUsuario;
    return {
      usuario: usuarioSinPassword,
      token: `local-token-${nuevoUsuario._id}`,
    };
  },

  obtenerPerfil: async () => {
    const raw = localStorage.getItem("usuario");
    if (!raw) throw crearError("No autorizado", 401);
    return JSON.parse(raw);
  },

  actualizarPerfil: async ({ nombre, email, password }) => {
    inicializarDatos();
    const usuarioActual = obtenerUsuarioActual();
    if (!usuarioActual) throw crearError("No autorizado", 401);
    if (usuarioActual.rol !== "ADMIN") {
      throw crearError("No tienes permisos para realizar esta accion", 403);
    }

    const usuarios = leer(KEYS.users);
    const indice = usuarios.findIndex((u) => u._id === usuarioActual._id);
    if (indice === -1) throw crearError("Usuario no encontrado", 404);

    if (email && email !== usuarios[indice].email) {
      if (usuarios.some((u) => u._id !== usuarioActual._id && u.email === email)) {
        throw crearError("Ya existe un usuario con ese email");
      }
      usuarios[indice].email = email;
    }

    if (nombre) usuarios[indice].nombre = nombre;

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
