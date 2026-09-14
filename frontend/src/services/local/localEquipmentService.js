import {
  KEYS,
  leer,
  escribir,
  generarId,
  crearError,
  inicializarDatos,
  obtenerUsuarioActual,
} from "./localData";

const REQUERIDOS = ["nombre", "numeroInventario", "tipo", "marca", "modelo", "ubicacion"];

const validar = (datos) => {
  for (const campo of REQUERIDOS) {
    if (!datos[campo] || !String(datos[campo]).trim()) {
      throw crearError(`El campo "${campo}" es obligatorio`);
    }
  }
};

// Devuelve los ids de equipo relacionados a las incidencias asignadas a un tecnico.
// Ya NO se usa para limitar lo que ve (el tecnico ve todo el inventario), sino para
// marcar cuales equipos son "suyos" (campo asignadoAMi en la respuesta).
const obtenerEquipoIdsDeTecnico = (tecnicoId) => {
  const incidencias = leer(KEYS.incidents).filter((i) => i.tecnicoAsignado === tecnicoId);
  return [...new Set(incidencias.map((i) => i.equipo))];
};

const tecnicoTieneAccesoAEquipo = (tecnicoId, equipoId) => {
  return leer(KEYS.incidents).some(
    (i) => i.tecnicoAsignado === tecnicoId && i.equipo === equipoId
  );
};

// El campo usuarioAsignado es texto libre (quien usa el equipo en la oficina).
// Para un EMPLOYEE, consideramos "sus" equipos los que tengan su nombre en ese campo.
const empleadoTieneAccesoAEquipo = (equipo, nombreUsuario) =>
  (equipo.usuarioAsignado || "").trim().toLowerCase() === (nombreUsuario || "").trim().toLowerCase();

// Version local (localStorage) de equipmentService, con la misma interfaz que la version con API.
// ADMIN y TECHNICIAN ven todo el inventario (el tecnico necesita nocion general de los
// equipos, no solo los suyos; cada equipo trae "asignadoAMi" para distinguirlos).
// EMPLOYEE ve solo los equipos asignados a su nombre.
export const localEquipmentService = {
  listar: async (filtros = {}) => {
    inicializarDatos();
    let equipos = leer(KEYS.equipment);
    const usuarioActual = obtenerUsuarioActual();

    if (usuarioActual?.rol === "EMPLOYEE") {
      equipos = equipos.filter((e) => empleadoTieneAccesoAEquipo(e, usuarioActual.nombre));
    }

    if (filtros.estado) equipos = equipos.filter((e) => e.estado === filtros.estado);
    if (filtros.tipo) equipos = equipos.filter((e) => e.tipo === filtros.tipo);
    if (filtros.buscar) {
      const q = filtros.buscar.toLowerCase();
      equipos = equipos.filter(
        (e) =>
          e.nombre.toLowerCase().includes(q) ||
          e.numeroInventario.toLowerCase().includes(q) ||
          (e.numeroSerie || "").toLowerCase().includes(q)
      );
    }

    equipos = [...equipos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (usuarioActual?.rol === "TECHNICIAN") {
      const idsAsignados = obtenerEquipoIdsDeTecnico(usuarioActual._id);
      equipos = equipos.map((e) => ({ ...e, asignadoAMi: idsAsignados.includes(e._id) }));
    }

    return equipos;
  },

  obtenerPorId: async (id) => {
    inicializarDatos();
    const equipos = leer(KEYS.equipment);
    const equipo = equipos.find((e) => e._id === id);
    if (!equipo) throw crearError("Equipo no encontrado", 404);

    const usuarioActual = obtenerUsuarioActual();
    if (usuarioActual?.rol === "EMPLOYEE" && !empleadoTieneAccesoAEquipo(equipo, usuarioActual.nombre)) {
      throw crearError("No tienes acceso a este equipo", 403);
    }

    if (usuarioActual?.rol === "TECHNICIAN") {
      return { ...equipo, asignadoAMi: tecnicoTieneAccesoAEquipo(usuarioActual._id, id) };
    }

    return equipo;
  },

  crear: async (datos) => {
    inicializarDatos();
    validar(datos);
    const equipos = leer(KEYS.equipment);

    if (equipos.some((e) => e.numeroInventario === datos.numeroInventario)) {
      throw crearError('El valor de "numeroInventario" ya existe');
    }

    const ahora = new Date().toISOString();
    const nuevoEquipo = {
      _id: generarId("eq"),
      estado: "Disponible",
      numeroSerie: "",
      departamento: "",
      usuarioAsignado: "",
      descripcion: "",
      ...datos,
      fechaRegistro: ahora,
      createdAt: ahora,
      updatedAt: ahora,
    };

    equipos.push(nuevoEquipo);
    escribir(KEYS.equipment, equipos);
    return nuevoEquipo;
  },

  actualizar: async (id, datos) => {
    inicializarDatos();
    validar({ ...datos });
    const equipos = leer(KEYS.equipment);
    const indice = equipos.findIndex((e) => e._id === id);
    if (indice === -1) throw crearError("Equipo no encontrado", 404);

    const duplicado = equipos.some(
      (e) => e._id !== id && e.numeroInventario === datos.numeroInventario
    );
    if (duplicado) {
      throw crearError('El valor de "numeroInventario" ya existe');
    }

    equipos[indice] = { ...equipos[indice], ...datos, updatedAt: new Date().toISOString() };
    escribir(KEYS.equipment, equipos);
    return equipos[indice];
  },

  eliminar: async (id) => {
    inicializarDatos();
    let equipos = leer(KEYS.equipment);
    if (!equipos.some((e) => e._id === id)) {
      throw crearError("Equipo no encontrado", 404);
    }
    equipos = equipos.filter((e) => e._id !== id);
    escribir(KEYS.equipment, equipos);

    let incidencias = leer(KEYS.incidents);
    incidencias = incidencias.filter((i) => i.equipo !== id);
    escribir(KEYS.incidents, incidencias);

    return { mensaje: "Equipo eliminado correctamente" };
  },

  obtenerHistorial: async (id) => {
    inicializarDatos();
    const equipos = leer(KEYS.equipment);
    const equipo = equipos.find((e) => e._id === id);
    if (!equipo) throw crearError("Equipo no encontrado", 404);

    const usuarioActual = obtenerUsuarioActual();
    if (usuarioActual?.rol === "EMPLOYEE" && !empleadoTieneAccesoAEquipo(equipo, usuarioActual.nombre)) {
      throw crearError("No tienes acceso a este equipo", 403);
    }

    const usuarios = leer(KEYS.users);
    let incidenciasDelEquipo = leer(KEYS.incidents).filter((i) => i.equipo === id);

    // Un TECHNICIAN puede consultar cualquier equipo, pero en el historial solo ve
    // SUS PROPIAS incidencias sobre ese equipo (puede quedar vacio si nunca lo atendio).
    if (usuarioActual?.rol === "TECHNICIAN") {
      incidenciasDelEquipo = incidenciasDelEquipo.filter(
        (i) => i.tecnicoAsignado === usuarioActual._id
      );
    }

    const historial = incidenciasDelEquipo
      .map((i) => ({
        ...i,
        tecnicoAsignado: usuarios.find((u) => u._id === i.tecnicoAsignado)
          ? {
              _id: i.tecnicoAsignado,
              nombre: usuarios.find((u) => u._id === i.tecnicoAsignado).nombre,
              email: usuarios.find((u) => u._id === i.tecnicoAsignado).email,
            }
          : null,
      }))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const equipoRespuesta =
      usuarioActual?.rol === "TECHNICIAN"
        ? { ...equipo, asignadoAMi: tecnicoTieneAccesoAEquipo(usuarioActual._id, id) }
        : equipo;

    return { equipo: equipoRespuesta, historial };
  },

  // Genera un ticket de "Mantenimiento preventivo" para cada equipo que no haya
  // tenido ninguna incidencia en los ultimos 12 meses.
  generarMantenimientosPreventivos: async () => {
    inicializarDatos();
    const usuarioActual = obtenerUsuarioActual();
    if (usuarioActual?.rol !== "ADMIN") {
      throw crearError("Solo un administrador puede generar mantenimientos preventivos", 403);
    }

    const haceUnAnio = new Date();
    haceUnAnio.setFullYear(haceUnAnio.getFullYear() - 1);

    const equipos = leer(KEYS.equipment);
    const incidencias = leer(KEYS.incidents);
    let creados = 0;
    const ahora = new Date().toISOString();

    for (const equipo of equipos) {
      const tieneIncidenciaReciente = incidencias.some(
        (i) => i.equipo === equipo._id && new Date(i.createdAt) >= haceUnAnio
      );

      if (!tieneIncidenciaReciente) {
        incidencias.push({
          _id: generarId("inc"),
          equipo: equipo._id,
          titulo: "Mantenimiento preventivo",
          descripcion: `Mantenimiento preventivo anual programado automaticamente para "${equipo.nombre}" (${equipo.numeroInventario}), ya que no registraba actividad en los ultimos 12 meses.`,
          prioridad: "Baja",
          estado: "Pendiente",
          tecnicoAsignado: null,
          asignadoPor: null,
          fechaAsignacion: null,
          creadoPor: usuarioActual._id,
          fechaCreacion: ahora,
          fechaInicio: null,
          fechaResolucion: null,
          diagnostico: "",
          solucion: "",
          observaciones: "",
          createdAt: ahora,
          updatedAt: ahora,
        });
        creados += 1;
      }
    }

    escribir(KEYS.incidents, incidencias);
    return { mensaje: `Se generaron ${creados} incidencia(s) de mantenimiento preventivo.`, creados };
  },
};
