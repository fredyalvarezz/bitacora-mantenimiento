// Listas de valores permitidos, usadas en formularios y filtros.
// Se mantienen aqui centralizadas para no repetirlas en cada componente.

export const TIPOS_EQUIPO = [
  "Computadora",
  "Laptop",
  "Impresora",
  "Monitor",
  "Router",
  "Switch",
  "Camara",
  "Servidor",
  "Otro",
];

export const ESTADOS_EQUIPO = [
  "Disponible",
  "En uso",
  "En mantenimiento",
  "Fuera de servicio",
];

export const PRIORIDADES_INCIDENCIA = ["Baja", "Media", "Alta"];

export const ESTADOS_INCIDENCIA = ["Pendiente", "En progreso", "Resuelto", "Cerrado"];

// Devuelve una clase CSS distinta segun el estado, para pintar "badges" de color
export const claseEstadoEquipo = (estado) => {
  const mapa = {
    Disponible: "badge badge--success",
    "En uso": "badge badge--info",
    "En mantenimiento": "badge badge--warning",
    "Fuera de servicio": "badge badge--danger",
  };
  return mapa[estado] || "badge";
};

export const claseEstadoIncidencia = (estado) => {
  const mapa = {
    Pendiente: "badge badge--warning",
    "En progreso": "badge badge--info",
    Resuelto: "badge badge--success",
    Cerrado: "badge badge--neutral",
  };
  return mapa[estado] || "badge";
};

export const clasePrioridad = (prioridad) => {
  const mapa = {
    Baja: "badge badge--success",
    Media: "badge badge--warning",
    Alta: "badge badge--danger",
  };
  return mapa[prioridad] || "badge";
};

// Traduce el rol tecnico (guardado en ingles en la base de datos) a español para mostrarlo en la UI
export const traducirRol = (rol) => {
  const mapa = {
    ADMIN: "Administrador",
    TECHNICIAN: "Técnico",
    EMPLOYEE: "Empleado",
  };
  return mapa[rol] || rol;
};

// Badge para el estado de un usuario (habilitado / deshabilitado)
export const claseActivo = (activo) => (activo ? "badge badge--success" : "badge badge--danger");

// El EMPLOYEE no tiene Dashboard: su pantalla principal son sus propios tickets.
export const rutaInicioPorRol = (rol) => (rol === "EMPLOYEE" ? "/incidents" : "/dashboard");

// Agrupa una lista de incidencias por el dia en que fueron creadas.
// Devuelve un arreglo de grupos ya ordenado del mas reciente al mas antiguo:
// [{ fecha: "2026-09-12", etiqueta: "12/09/2026", incidencias: [...] }, ...]
export const agruparIncidenciasPorFecha = (incidencias) => {
  const grupos = {};

  incidencias.forEach((incidencia) => {
    const fechaBase = incidencia.fechaCreacion || incidencia.createdAt;
    const clave = new Date(fechaBase).toISOString().slice(0, 10); // YYYY-MM-DD
    if (!grupos[clave]) {
      grupos[clave] = { fecha: clave, etiqueta: formatearFecha(fechaBase), incidencias: [] };
    }
    grupos[clave].incidencias.push(incidencia);
  });

  return Object.values(grupos).sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
};

// Formatea una fecha ISO a formato dd/mm/aaaa, como se pide en el ejemplo del historial
export const formatearFecha = (fecha) => {
  if (!fecha) return "-";
  const d = new Date(fecha);
  return d.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};
