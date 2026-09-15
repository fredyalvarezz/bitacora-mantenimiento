import Incident from "../models/Incident.js";
import Equipment from "../models/Equipment.js";

// Campos que un TECHNICIAN puede modificar al "hacer el mantenimiento".
// Todo lo demas (titulo, descripcion, prioridad, equipo, tecnico asignado) lo define el ADMIN.
const CAMPOS_EDITABLES_TECNICO = ["estado", "diagnostico", "solucion", "observaciones"];

// @desc    Obtener incidencias.
//          ADMIN ve todas. TECHNICIAN ve solo las que tiene asignadas.
//          EMPLOYEE ve solo los tickets que el mismo creo.
// @route   GET /api/incidents
export const getIncidents = async (req, res, next) => {
  try {
    const { estado, prioridad, asignacion, fechaDesde, fechaHasta } = req.query;
    const filtro = {};

    if (estado) filtro.estado = estado;
    if (prioridad) filtro.prioridad = prioridad;

    if (asignacion === "asignada") {
      filtro.tecnicoAsignado = { $ne: null };
    } else if (asignacion === "sinAsignar") {
      filtro.tecnicoAsignado = null;
    }

    if (fechaDesde || fechaHasta) {
      filtro.fechaCreacion = {};
      if (fechaDesde) filtro.fechaCreacion.$gte = new Date(fechaDesde);
      if (fechaHasta) {
        const hasta = new Date(fechaHasta);
        hasta.setDate(hasta.getDate() + 1);
        filtro.fechaCreacion.$lt = hasta;
      }
    }

    if (req.usuario.rol === "TECHNICIAN") {
      filtro.tecnicoAsignado = req.usuario._id;
    } else if (req.usuario.rol === "EMPLOYEE") {
      filtro.creadoPor = req.usuario._id;
    }

    const incidencias = await Incident.find(filtro)
      .populate("equipo", "nombre numeroInventario tipo")
      .populate("tecnicoAsignado", "nombre email")
      .populate("creadoPor", "nombre email")
      .sort({ createdAt: -1 });

    res.json(incidencias);
  } catch (error) {
    next(error);
  }
};

// @desc    Crear una incidencia nueva (ticket). Solo ADMIN y EMPLOYEE pueden crear.
//          Un EMPLOYEE nunca puede asignar tecnico directamente: eso lo decide el ADMIN despues.
// @route   POST /api/incidents
export const createIncident = async (req, res, next) => {
  try {
    const datos = { ...req.body, creadoPor: req.usuario._id };

    if (req.usuario.rol !== "ADMIN") {
      // Por seguridad, ignoramos cualquier intento de asignar tecnico si quien crea no es ADMIN
      datos.tecnicoAsignado = null;
      datos.asignadoPor = null;
      datos.fechaAsignacion = null;
    } else if (datos.tecnicoAsignado) {
      datos.asignadoPor = req.usuario._id;
      datos.fechaAsignacion = new Date();
    }

    const incidencia = await Incident.create(datos);
    const incidenciaPopulada = await incidencia.populate([
      { path: "equipo", select: "nombre numeroInventario tipo" },
      { path: "tecnicoAsignado", select: "nombre email" },
      { path: "creadoPor", select: "nombre email" },
    ]);
    res.status(201).json(incidenciaPopulada);
  } catch (error) {
    next(error);
  }
};

// Verifica que el usuario tenga permiso para ver/editar esta incidencia especifica
const tieneAccesoAIncidencia = (incidencia, usuario) => {
  if (usuario.rol === "ADMIN") return true;
  if (usuario.rol === "TECHNICIAN") {
    return incidencia.tecnicoAsignado && incidencia.tecnicoAsignado.toString() === usuario._id.toString();
  }
  if (usuario.rol === "EMPLOYEE") {
    return incidencia.creadoPor.toString() === usuario._id.toString();
  }
  return false;
};

// @desc    Obtener una incidencia por id
// @route   GET /api/incidents/:id
export const getIncidentById = async (req, res, next) => {
  try {
    const incidenciaCruda = await Incident.findById(req.params.id);
    if (!incidenciaCruda) {
      return res.status(404).json({ mensaje: "Incidencia no encontrada" });
    }
    if (!tieneAccesoAIncidencia(incidenciaCruda, req.usuario)) {
      return res.status(403).json({ mensaje: "No tienes acceso a esta incidencia" });
    }

    const incidencia = await Incident.findById(req.params.id)
      .populate("equipo", "nombre numeroInventario tipo")
      .populate("tecnicoAsignado", "nombre email")
      .populate("creadoPor", "nombre email")
      .populate("asignadoPor", "nombre email");

    res.json(incidencia);
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar una incidencia.
//          ADMIN puede editar todo, incluyendo asignar/reasignar tecnico.
//          TECHNICIAN solo puede cambiar estado, diagnostico, solucion y observaciones,
//          y solo si la incidencia esta asignada a el.
//          EMPLOYEE no puede editar incidencias (solo darle seguimiento en modo lectura).
// @route   PUT /api/incidents/:id
export const updateIncident = async (req, res, next) => {
  try {
    const incidenciaActual = await Incident.findById(req.params.id);
    if (!incidenciaActual) {
      return res.status(404).json({ mensaje: "Incidencia no encontrada" });
    }

    let datosActualizados;

    if (req.usuario.rol === "ADMIN") {
      datosActualizados = { ...req.body };

      // Si el admin asigna (o reasigna) un tecnico, registramos quien y cuando
      if (
        datosActualizados.tecnicoAsignado &&
        datosActualizados.tecnicoAsignado !== String(incidenciaActual.tecnicoAsignado || "")
      ) {
        datosActualizados.asignadoPor = req.usuario._id;
        datosActualizados.fechaAsignacion = new Date();
      }
    } else if (req.usuario.rol === "TECHNICIAN") {
      const esSuya =
        incidenciaActual.tecnicoAsignado &&
        incidenciaActual.tecnicoAsignado.toString() === req.usuario._id.toString();

      if (!esSuya) {
        return res.status(403).json({ mensaje: "Esta incidencia no esta asignada a ti" });
      }

      // Un tecnico SOLO puede tocar estos campos; cualquier otra cosa que envie se ignora
      datosActualizados = {};
      for (const campo of CAMPOS_EDITABLES_TECNICO) {
        if (req.body[campo] !== undefined) datosActualizados[campo] = req.body[campo];
      }

      // "Cerrado" es la confirmacion final del ADMIN, no algo que el tecnico decida solo
      if (datosActualizados.estado === "Cerrado") {
        return res
          .status(403)
          .json({ mensaje: "Solo un administrador puede cerrar una incidencia" });
      }
    } else {
      // EMPLOYEE u otro rol: no tiene permiso de editar incidencias
      return res.status(403).json({ mensaje: "No tienes permisos para editar incidencias" });
    }

    // Registrar fechas automaticamente segun el cambio de estado (igual para ADMIN y TECHNICIAN)
    if (datosActualizados.estado === "En progreso" && !incidenciaActual.fechaInicio) {
      datosActualizados.fechaInicio = new Date();
    }
    if (datosActualizados.estado === "Resuelto") {
      datosActualizados.fechaResolucion = new Date();
    }

    const incidencia = await Incident.findByIdAndUpdate(req.params.id, datosActualizados, {
      new: true,
      runValidators: true,
    })
      .populate("equipo", "nombre numeroInventario tipo")
      .populate("tecnicoAsignado", "nombre email")
      .populate("creadoPor", "nombre email");

    res.json(incidencia);
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar una incidencia
// @route   DELETE /api/incidents/:id
export const deleteIncident = async (req, res, next) => {
  try {
    const incidencia = await Incident.findByIdAndDelete(req.params.id);
    if (!incidencia) {
      return res.status(404).json({ mensaje: "Incidencia no encontrada" });
    }
    res.json({ mensaje: "Incidencia eliminada correctamente" });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener estadisticas para el dashboard, ajustadas segun el rol de quien consulta.
// @route   GET /api/incidents/stats/dashboard
export const getDashboardStats = async (req, res, next) => {
  try {
    const usuario = req.usuario;

    // Determina que incidencias "cuentan" para las estadisticas de este usuario
    let filtroIncidentes = {};
    if (usuario.rol === "TECHNICIAN") filtroIncidentes = { tecnicoAsignado: usuario._id };
    if (usuario.rol === "EMPLOYEE") filtroIncidentes = { creadoPor: usuario._id };

    const incidenciasDelUsuario = await Incident.find(filtroIncidentes);

    // Los equipos son inventario general de la empresa: se cuentan igual para todos
    // los roles (coherente con que Equipos le muestra a TECHNICIAN todo el inventario,
    // no solo lo suyo). Lo que SI cambia por rol son las incidencias, arriba.
    const filtroEquipos = {};

    const contarPorEstado = (estado) =>
      incidenciasDelUsuario.filter((i) => i.estado === estado).length;

    const [totalEquipos, equiposEnMantenimiento, equiposFueraServicio, equiposRecientes] =
      await Promise.all([
        Equipment.countDocuments(filtroEquipos),
        Equipment.countDocuments({ ...filtroEquipos, estado: "En mantenimiento" }),
        Equipment.countDocuments({ ...filtroEquipos, estado: "Fuera de servicio" }),
        Equipment.find(filtroEquipos).sort({ createdAt: -1 }).limit(5),
      ]);

    const incidenciasRecientesIds = [...incidenciasDelUsuario]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map((i) => i._id);

    const incidenciasRecientes = await Incident.find({ _id: { $in: incidenciasRecientesIds } })
      .populate("equipo", "nombre")
      .sort({ createdAt: -1 });

    res.json({
      totalEquipos,
      equiposEnMantenimiento,
      equiposFueraServicio,
      incidenciasPendientes: contarPorEstado("Pendiente"),
      incidenciasEnProgreso: contarPorEstado("En progreso"),
      incidenciasResueltas: contarPorEstado("Resuelto"),
      incidenciasAltaPrioridad: incidenciasDelUsuario.filter(
        (i) => i.prioridad === "Alta" && i.estado !== "Cerrado"
      ).length,
      incidenciasRecientes,
      equiposRecientes,
    });
  } catch (error) {
    next(error);
  }
};