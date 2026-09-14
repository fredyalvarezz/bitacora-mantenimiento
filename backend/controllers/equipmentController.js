import Equipment from "../models/Equipment.js";
import Incident from "../models/Incident.js";

// Devuelve los ids de equipo relacionados a las incidencias asignadas a un tecnico.

const obtenerEquipoIdsDeTecnico = async (tecnicoId) => {
  const incidencias = await Incident.find({ tecnicoAsignado: tecnicoId }).select("equipo");
  const ids = incidencias.map((i) => i.equipo.toString());
  return [...new Set(ids)];
};

// El campo Equipment.usuarioAsignado es texto libre (quien usa el equipo en la oficina).
const construirFiltroEquiposDeEmpleado = (nombreUsuario) => ({
  usuarioAsignado: { $regex: `^${nombreUsuario.trim()}$`, $options: "i" },
});

// @desc    Obtener equipos.
//          ADMIN y TECHNICIAN ven todo el inventario (asi el tecnico tiene nocion
//          general de los equipos que existen, no solo los suyos). Cada equipo
//          incluye "asignadoAMi" para que el tecnico distinga cuales debe atender.
//          EMPLOYEE ve solo los equipos asignados a su nombre (para poder reportarles fallas).
// @route   GET /api/equipment
export const getEquipment = async (req, res, next) => {
  try {
    const { estado, tipo, buscar } = req.query;
    const filtro = {};

    if (estado) filtro.estado = estado;
    if (tipo) filtro.tipo = tipo;
    if (buscar) {
      filtro.$or = [
        { nombre: { $regex: buscar, $options: "i" } },
        { numeroInventario: { $regex: buscar, $options: "i" } },
        { numeroSerie: { $regex: buscar, $options: "i" } },
      ];
    }

    if (req.usuario.rol === "EMPLOYEE") {
      Object.assign(filtro, construirFiltroEquiposDeEmpleado(req.usuario.nombre));
    }

    const equipos = await Equipment.find(filtro).sort({ createdAt: -1 });

    if (req.usuario.rol === "TECHNICIAN") {
      const idsAsignados = await obtenerEquipoIdsDeTecnico(req.usuario._id);
      const equiposConFlag = equipos.map((e) => ({
        ...e.toObject(),
        asignadoAMi: idsAsignados.includes(e._id.toString()),
      }));
      return res.json(equiposConFlag);
    }

    res.json(equipos);
  } catch (error) {
    next(error);
  }
};

// @desc    Crear un equipo nuevo
// @route   POST /api/equipment
export const createEquipment = async (req, res, next) => {
  try {
    const equipo = await Equipment.create(req.body);
    res.status(201).json(equipo);
  } catch (error) {
    next(error);
  }
};

const tecnicoTieneAccesoAEquipo = async (tecnicoId, equipoId) => {
  const existeIncidencia = await Incident.exists({
    tecnicoAsignado: tecnicoId,
    equipo: equipoId,
  });
  return Boolean(existeIncidencia);
};

const empleadoTieneAccesoAEquipo = (equipo, nombreUsuario) =>
  (equipo.usuarioAsignado || "").trim().toLowerCase() === nombreUsuario.trim().toLowerCase();

// @desc    Obtener un equipo por id.
//          ADMIN y TECHNICIAN pueden ver cualquier equipo (el tecnico necesita
//          contexto general del inventario). EMPLOYEE solo el suyo.
// @route   GET /api/equipment/:id
export const getEquipmentById = async (req, res, next) => {
  try {
    const equipo = await Equipment.findById(req.params.id);
    if (!equipo) {
      return res.status(404).json({ mensaje: "Equipo no encontrado" });
    }

    if (req.usuario.rol === "EMPLOYEE" && !empleadoTieneAccesoAEquipo(equipo, req.usuario.nombre)) {
      return res.status(403).json({ mensaje: "No tienes acceso a este equipo" });
    }

    let asignadoAMi;
    if (req.usuario.rol === "TECHNICIAN") {
      asignadoAMi = await tecnicoTieneAccesoAEquipo(req.usuario._id, req.params.id);
    }

    res.json(asignadoAMi !== undefined ? { ...equipo.toObject(), asignadoAMi } : equipo);
  } catch (error) {
    next(error);
  }
};

// @desc    Actualizar un equipo
// @route   PUT /api/equipment/:id
export const updateEquipment = async (req, res, next) => {
  try {
    const equipo = await Equipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!equipo) {
      return res.status(404).json({ mensaje: "Equipo no encontrado" });
    }
    res.json(equipo);
  } catch (error) {
    next(error);
  }
};

// @desc    Eliminar un equipo
// @route   DELETE /api/equipment/:id
export const deleteEquipment = async (req, res, next) => {
  try {
    const equipo = await Equipment.findByIdAndDelete(req.params.id);
    if (!equipo) {
      return res.status(404).json({ mensaje: "Equipo no encontrado" });
    }
    await Incident.deleteMany({ equipo: req.params.id });
    res.json({ mensaje: "Equipo eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};

// @desc    Obtener el historial de mantenimiento de un equipo (sus incidencias).
//          ADMIN ve el historial completo. TECHNICIAN puede consultar cualquier
//          equipo, pero en el historial solo ve SUS PROPIAS incidencias sobre ese
//          equipo (puede estar vacio si nunca lo ha atendido). EMPLOYEE solo el suyo.
// @route   GET /api/equipment/:id/history
export const getEquipmentHistory = async (req, res, next) => {
  try {
    const equipo = await Equipment.findById(req.params.id);
    if (!equipo) {
      return res.status(404).json({ mensaje: "Equipo no encontrado" });
    }

    if (req.usuario.rol === "EMPLOYEE" && !empleadoTieneAccesoAEquipo(equipo, req.usuario.nombre)) {
      return res.status(403).json({ mensaje: "No tienes acceso a este equipo" });
    }

    const historial = await Incident.find({ equipo: req.params.id })
      .populate("tecnicoAsignado", "nombre email")
      .sort({ createdAt: -1 });

    const historialFiltrado =
      req.usuario.rol === "TECHNICIAN"
        ? historial.filter(
            (i) => i.tecnicoAsignado && i.tecnicoAsignado._id.toString() === req.usuario._id.toString()
          )
        : historial;

    let equipoRespuesta = equipo;
    if (req.usuario.rol === "TECHNICIAN") {
      const asignadoAMi = await tecnicoTieneAccesoAEquipo(req.usuario._id, req.params.id);
      equipoRespuesta = { ...equipo.toObject(), asignadoAMi };
    }

    res.json({ equipo: equipoRespuesta, historial: historialFiltrado });
  } catch (error) {
    next(error);
  }
};

// @desc    Genera un ticket de "Mantenimiento preventivo" para cada equipo que no
//          haya tenido ninguna incidencia en los ultimos 12 meses. Pensado para que
//          el ADMIN lo presione una vez al ano (o cuando quiera revisar pendientes).
// @route   POST /api/equipment/generar-mantenimientos-preventivos
export const generarMantenimientosPreventivos = async (req, res, next) => {
  try {
    const haceUnAnio = new Date();
    haceUnAnio.setFullYear(haceUnAnio.getFullYear() - 1);

    const equipos = await Equipment.find();
    let creados = 0;

    for (const equipo of equipos) {
      const tieneIncidenciaReciente = await Incident.exists({
        equipo: equipo._id,
        createdAt: { $gte: haceUnAnio },
      });

      if (!tieneIncidenciaReciente) {
        await Incident.create({
          equipo: equipo._id,
          titulo: "Mantenimiento preventivo",
          descripcion: `Mantenimiento preventivo anual programado automaticamente para "${equipo.nombre}" (${equipo.numeroInventario}), ya que no registraba actividad en los ultimos 12 meses.`,
          prioridad: "Baja",
          estado: "Pendiente",
          creadoPor: req.usuario._id,
        });
        creados += 1;
      }
    }

    res.json({
      mensaje: `Se generaron ${creados} incidencia(s) de mantenimiento preventivo.`,
      creados,
    });
  } catch (error) {
    next(error);
  }
};
