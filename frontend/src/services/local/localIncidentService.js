import {
  KEYS,
  leer,
  escribir,
  generarId,
  crearError,
  obtenerUsuarioActual,
  inicializarDatos,
} from "./localData";

// Campos que un TECHNICIAN puede modificar al "hacer el mantenimiento".
// Todo lo demas (titulo, descripcion, prioridad, equipo, tecnico asignado) lo define el ADMIN.
const CAMPOS_EDITABLES_TECNICO = ["estado", "diagnostico", "solucion", "observaciones"];

// Simula el populate() de Mongoose: reemplaza los ids de equipo y tecnico
// por objetos con la informacion basica, igual que hace el backend.
const poblarIncidencia = (incidencia, equipos, usuarios) => {
  const equipo = equipos.find((e) => e._id === incidencia.equipo);
  const tecnico = usuarios.find((u) => u._id === incidencia.tecnicoAsignado);
  const creador = usuarios.find((u) => u._id === incidencia.creadoPor);
  const asignador = usuarios.find((u) => u._id === incidencia.asignadoPor);

  return {
    ...incidencia,
    equipo: equipo
      ? { _id: equipo._id, nombre: equipo.nombre, numeroInventario: equipo.numeroInventario, tipo: equipo.tipo }
      : null,
    tecnicoAsignado: tecnico ? { _id: tecnico._id, nombre: tecnico.nombre, email: tecnico.email } : null,
    creadoPor: creador ? { _id: creador._id, nombre: creador.nombre, email: creador.email } : null,
    asignadoPor: asignador ? { _id: asignador._id, nombre: asignador.nombre, email: asignador.email } : null,
  };
};

// Verifica que el usuario tenga permiso para ver/editar esta incidencia especifica
const tieneAccesoAIncidencia = (incidencia, usuario) => {
  if (usuario.rol === "ADMIN") return true;
  if (usuario.rol === "TECHNICIAN") return incidencia.tecnicoAsignado === usuario._id;
  if (usuario.rol === "EMPLOYEE") return incidencia.creadoPor === usuario._id;
  return false;
};

// Version local (localStorage) de incidentService, con la misma interfaz que la version con API.
// ADMIN ve/edita todo. TECHNICIAN ve/edita (parcialmente) solo lo asignado a el.
// EMPLOYEE crea tickets y solo ve/da seguimiento a los suyos (sin poder editarlos).
export const localIncidentService = {
  listar: async (filtros = {}) => {
    inicializarDatos();
    const equipos = leer(KEYS.equipment);
    const usuarios = leer(KEYS.users);
    let incidencias = leer(KEYS.incidents);

    if (filtros.estado) incidencias = incidencias.filter((i) => i.estado === filtros.estado);
    if (filtros.prioridad) incidencias = incidencias.filter((i) => i.prioridad === filtros.prioridad);

    if (filtros.asignacion === "asignada") {
      incidencias = incidencias.filter((i) => Boolean(i.tecnicoAsignado));
    } else if (filtros.asignacion === "sinAsignar") {
      incidencias = incidencias.filter((i) => !i.tecnicoAsignado);
    }

    if (filtros.fechaDesde) {
      const desde = new Date(filtros.fechaDesde);
      incidencias = incidencias.filter((i) => new Date(i.fechaCreacion || i.createdAt) >= desde);
    }
    if (filtros.fechaHasta) {
      // Sumamos un dia para incluir completo el dia seleccionado como "hasta"
      const hasta = new Date(filtros.fechaHasta);
      hasta.setDate(hasta.getDate() + 1);
      incidencias = incidencias.filter((i) => new Date(i.fechaCreacion || i.createdAt) < hasta);
    }

    const usuarioActual = obtenerUsuarioActual();
    if (usuarioActual?.rol === "TECHNICIAN") {
      incidencias = incidencias.filter((i) => i.tecnicoAsignado === usuarioActual._id);
    } else if (usuarioActual?.rol === "EMPLOYEE") {
      incidencias = incidencias.filter((i) => i.creadoPor === usuarioActual._id);
    }

    return incidencias
      .map((i) => poblarIncidencia(i, equipos, usuarios))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  obtenerPorId: async (id) => {
    inicializarDatos();
    const equipos = leer(KEYS.equipment);
    const usuarios = leer(KEYS.users);
    const incidencia = leer(KEYS.incidents).find((i) => i._id === id);
    if (!incidencia) throw crearError("Incidencia no encontrada", 404);

    const usuarioActual = obtenerUsuarioActual();
    if (usuarioActual && !tieneAccesoAIncidencia(incidencia, usuarioActual)) {
      throw crearError("No tienes acceso a esta incidencia", 403);
    }

    return poblarIncidencia(incidencia, equipos, usuarios);
  },

  crear: async (datos) => {
    inicializarDatos();
    if (!datos.equipo || !datos.titulo || !datos.descripcion) {
      throw crearError("Equipo, titulo y descripcion son obligatorios");
    }

    const usuarioActual = obtenerUsuarioActual();
    if (usuarioActual?.rol === "TECHNICIAN") {
      throw crearError("No tienes permisos para crear incidencias", 403);
    }

    const ahora = new Date().toISOString();
    const esAdmin = usuarioActual?.rol === "ADMIN";

    const nuevaIncidencia = {
      _id: generarId("inc"),
      prioridad: "Media",
      estado: "Pendiente",
      diagnostico: "",
      solucion: "",
      observaciones: "",
      ...datos,
      // Solo un ADMIN puede asignar tecnico al crear; cualquier otro rol lo ignora
      tecnicoAsignado: esAdmin ? datos.tecnicoAsignado || null : null,
      asignadoPor: esAdmin && datos.tecnicoAsignado ? usuarioActual._id : null,
      fechaAsignacion: esAdmin && datos.tecnicoAsignado ? ahora : null,
      creadoPor: usuarioActual?._id || null,
      fechaCreacion: ahora,
      fechaInicio: null,
      fechaResolucion: null,
      createdAt: ahora,
      updatedAt: ahora,
    };

    const incidencias = leer(KEYS.incidents);
    incidencias.push(nuevaIncidencia);
    escribir(KEYS.incidents, incidencias);

    const equipos = leer(KEYS.equipment);
    const usuarios = leer(KEYS.users);
    return poblarIncidencia(nuevaIncidencia, equipos, usuarios);
  },

  actualizar: async (id, datos) => {
    inicializarDatos();
    const incidencias = leer(KEYS.incidents);
    const indice = incidencias.findIndex((i) => i._id === id);
    if (indice === -1) throw crearError("Incidencia no encontrada", 404);

    const usuarioActual = obtenerUsuarioActual();
    const incidenciaActual = incidencias[indice];
    let datosActualizados;

    if (usuarioActual?.rol === "ADMIN") {
      datosActualizados = { ...datos };
      if (
        datosActualizados.tecnicoAsignado &&
        datosActualizados.tecnicoAsignado !== incidenciaActual.tecnicoAsignado
      ) {
        datosActualizados.asignadoPor = usuarioActual._id;
        datosActualizados.fechaAsignacion = new Date().toISOString();
      }
    } else if (usuarioActual?.rol === "TECHNICIAN") {
      if (incidenciaActual.tecnicoAsignado !== usuarioActual._id) {
        throw crearError("Esta incidencia no esta asignada a ti", 403);
      }
      // Un tecnico SOLO puede tocar estos campos; cualquier otra cosa se ignora
      datosActualizados = {};
      for (const campo of CAMPOS_EDITABLES_TECNICO) {
        if (datos[campo] !== undefined) datosActualizados[campo] = datos[campo];
      }

      // "Cerrado" es la confirmacion final del ADMIN, no algo que el tecnico decida solo
      if (datosActualizados.estado === "Cerrado") {
        throw crearError("Solo un administrador puede cerrar una incidencia", 403);
      }
    } else {
      throw crearError("No tienes permisos para editar incidencias", 403);
    }

    // Misma logica automatica que el backend: registrar fechas al cambiar de estado
    if (datosActualizados.estado === "En progreso" && !incidenciaActual.fechaInicio) {
      datosActualizados.fechaInicio = new Date().toISOString();
    }
    if (datosActualizados.estado === "Resuelto") {
      datosActualizados.fechaResolucion = new Date().toISOString();
    }

    incidencias[indice] = {
      ...incidenciaActual,
      ...datosActualizados,
      updatedAt: new Date().toISOString(),
    };
    escribir(KEYS.incidents, incidencias);

    const equipos = leer(KEYS.equipment);
    const usuarios = leer(KEYS.users);
    return poblarIncidencia(incidencias[indice], equipos, usuarios);
  },

  eliminar: async (id) => {
    inicializarDatos();
    let incidencias = leer(KEYS.incidents);
    if (!incidencias.some((i) => i._id === id)) {
      throw crearError("Incidencia no encontrada", 404);
    }
    incidencias = incidencias.filter((i) => i._id !== id);
    escribir(KEYS.incidents, incidencias);
    return { mensaje: "Incidencia eliminada correctamente" };
  },

  obtenerEstadisticas: async () => {
    inicializarDatos();
    const equipos = leer(KEYS.equipment);
    const usuarios = leer(KEYS.users);
    let incidencias = leer(KEYS.incidents);

    const usuarioActual = obtenerUsuarioActual();
    if (usuarioActual?.rol === "TECHNICIAN") {
      incidencias = incidencias.filter((i) => i.tecnicoAsignado === usuarioActual._id);
    } else if (usuarioActual?.rol === "EMPLOYEE") {
      incidencias = incidencias.filter((i) => i.creadoPor === usuarioActual._id);
    }

    // Los equipos son inventario general de la empresa: se cuentan igual para todos
    // los roles (coherente con que Equipos le muestra a TECHNICIAN todo el inventario,
    // no solo lo suyo). Lo que SI cambia por rol son las incidencias, arriba.
    const equiposBase = equipos;

    const incidenciasRecientes = [...incidencias]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((i) => poblarIncidencia(i, equipos, usuarios));

    const equiposRecientes = [...equiposBase]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    return {
      totalEquipos: equiposBase.length,
      equiposEnMantenimiento: equiposBase.filter((e) => e.estado === "En mantenimiento").length,
      equiposFueraServicio: equiposBase.filter((e) => e.estado === "Fuera de servicio").length,
      incidenciasPendientes: incidencias.filter((i) => i.estado === "Pendiente").length,
      incidenciasEnProgreso: incidencias.filter((i) => i.estado === "En progreso").length,
      incidenciasResueltas: incidencias.filter((i) => i.estado === "Resuelto").length,
      incidenciasAltaPrioridad: incidencias.filter(
        (i) => i.prioridad === "Alta" && i.estado !== "Cerrado"
      ).length,
      incidenciasRecientes,
      equiposRecientes,
    };
  },
};