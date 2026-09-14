// Motor de datos local: simula una base de datos usando localStorage.
// Se usa cuando VITE_DATA_MODE es distinto de "api" (ver services/api.js y README).
//
// IMPORTANTE: esto es solo para que el proyecto funcione como demo en GitHub Pages
// sin necesitar el backend desplegado. Los datos viven en el navegador de cada
// persona (no se comparten entre usuarios reales) y las contrasenas NO estan
// encriptadas, porque todo el codigo corre en el cliente y cualquiera podria
// leerlo de todas formas. Cuando conectes el backend real, esto deja de aplicar.

export const KEYS = {
  users: "bitacora_local_users",
  equipment: "bitacora_local_equipment",
  incidents: "bitacora_local_incidents",
  seedVersion: "bitacora_local_seed_v3",
};

// Genera un id simple y unico, similar en forma a un _id de Mongo pero sin serlo
export const generarId = (prefijo = "id") =>
  `${prefijo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const leer = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const escribir = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Crea un error con la misma forma que un error de axios (err.response.data.mensaje),
// para que los componentes del frontend (que ya esperan ese formato) no necesiten cambiar.
export const crearError = (mensaje, status = 400) => {
  const error = new Error(mensaje);
  error.response = { status, data: { mensaje } };
  return error;
};

// Carga la sesion actual guardada por AuthContext (mismo localStorage que usa toda la app)
export const obtenerUsuarioActual = () => {
  try {
    const raw = localStorage.getItem("usuario");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Datos de demostracion, equivalentes a backend/utils/seedData.js
const construirSeed = () => {
  const ahora = new Date().toISOString();

  const admin = {
    _id: "user-admin",
    nombre: "Ana Administradora",
    email: "admin@demo.com",
    password: "admin123",
    rol: "ADMIN",
    activo: true,
    createdAt: ahora,
    updatedAt: ahora,
  };
  const tecnico1 = {
    _id: "user-tec1",
    nombre: "Juan Perez",
    email: "juan@demo.com",
    password: "tecnico123",
    rol: "TECHNICIAN",
    activo: true,
    createdAt: ahora,
    updatedAt: ahora,
  };
  const tecnico2 = {
    _id: "user-tec2",
    nombre: "Maria Lopez",
    email: "maria@demo.com",
    password: "tecnico123",
    rol: "TECHNICIAN",
    activo: true,
    createdAt: ahora,
    updatedAt: ahora,
  };
  const empleado = {
    _id: "user-emp1",
    nombre: "Carlos Ramirez",
    email: "carlos@demo.com",
    password: "empleado123",
    rol: "EMPLOYEE",
    activo: true,
    createdAt: ahora,
    updatedAt: ahora,
  };

  const laptop = {
    _id: "eq-1",
    nombre: "Laptop Dell Latitude 5420",
    numeroInventario: "INV-001",
    tipo: "Laptop",
    marca: "Dell",
    modelo: "Latitude 5420",
    numeroSerie: "DL5420-001",
    ubicacion: "Oficina Contabilidad",
    departamento: "Contabilidad",
    usuarioAsignado: "Carlos Ramirez",
    estado: "En uso",
    fechaRegistro: ahora,
    descripcion: "Laptop asignada al departamento de contabilidad",
    createdAt: ahora,
    updatedAt: ahora,
  };
  const impresora = {
    _id: "eq-2",
    nombre: "Impresora HP LaserJet Pro",
    numeroInventario: "INV-002",
    tipo: "Impresora",
    marca: "HP",
    modelo: "LaserJet Pro M404",
    numeroSerie: "HP404-002",
    ubicacion: "Recepcion",
    departamento: "Administracion",
    usuarioAsignado: "",
    estado: "En mantenimiento",
    fechaRegistro: ahora,
    descripcion: "Impresora compartida del area de recepcion",
    createdAt: ahora,
    updatedAt: ahora,
  };
  const router1 = {
    _id: "eq-3",
    nombre: "Router TP-Link Archer",
    numeroInventario: "INV-003",
    tipo: "Router",
    marca: "TP-Link",
    modelo: "Archer C6",
    numeroSerie: "TPC6-003",
    ubicacion: "Sala de servidores",
    departamento: "Sistemas",
    usuarioAsignado: "",
    estado: "Disponible",
    fechaRegistro: ahora,
    descripcion: "Router de respaldo para la red interna",
    createdAt: ahora,
    updatedAt: ahora,
  };
  const monitor = {
    _id: "eq-4",
    nombre: "Monitor Samsung 24 pulgadas",
    numeroInventario: "INV-004",
    tipo: "Monitor",
    marca: "Samsung",
    modelo: "S24R350",
    numeroSerie: "SS24-004",
    ubicacion: "Oficina Ventas",
    departamento: "Ventas",
    usuarioAsignado: "Laura Gomez",
    estado: "Fuera de servicio",
    fechaRegistro: ahora,
    descripcion: "Monitor con fallas en la pantalla",
    createdAt: ahora,
    updatedAt: ahora,
  };

  const incidents = [
    {
      _id: "inc-1",
      equipo: "eq-1",
      titulo: "No enciende",
      descripcion: "La laptop no enciende al presionar el boton de encendido",
      prioridad: "Alta",
      estado: "Cerrado",
      tecnicoAsignado: "user-tec1",
      creadoPor: "user-admin",
      fechaCreacion: "2026-08-12T00:00:00.000Z",
      fechaInicio: "2026-08-12T00:00:00.000Z",
      fechaResolucion: "2026-08-12T00:00:00.000Z",
      diagnostico: "Problema con el cargador",
      solucion: "Cambio de cargador",
      observaciones: "Se recomienda revisar el cargador cada 6 meses",
      createdAt: "2026-08-12T00:00:00.000Z",
      updatedAt: "2026-08-12T00:00:00.000Z",
    },
    {
      _id: "inc-2",
      equipo: "eq-1",
      titulo: "Equipo lento",
      descripcion: "La laptop tarda mucho en abrir programas",
      prioridad: "Media",
      estado: "Cerrado",
      tecnicoAsignado: "user-tec1",
      creadoPor: "user-admin",
      fechaCreacion: "2026-08-25T00:00:00.000Z",
      fechaInicio: "2026-08-25T00:00:00.000Z",
      fechaResolucion: "2026-08-25T00:00:00.000Z",
      diagnostico: "Poco espacio disponible en disco",
      solucion: "Limpieza de archivos temporales y actualizacion del sistema",
      observaciones: "",
      createdAt: "2026-08-25T00:00:00.000Z",
      updatedAt: "2026-08-25T00:00:00.000Z",
    },
    {
      _id: "inc-3",
      equipo: "eq-2",
      titulo: "No imprime a color",
      descripcion: "La impresora solo imprime en blanco y negro",
      prioridad: "Media",
      estado: "En progreso",
      tecnicoAsignado: "user-tec2",
      creadoPor: "user-admin",
      fechaCreacion: ahora,
      fechaInicio: ahora,
      fechaResolucion: null,
      diagnostico: "Posible falla en el cartucho de color",
      solucion: "",
      observaciones: "Se solicito cotizacion de cartucho nuevo",
      createdAt: ahora,
      updatedAt: ahora,
    },
    {
      _id: "inc-4",
      equipo: "eq-4",
      titulo: "Pantalla con lineas",
      descripcion: "El monitor muestra lineas verticales de color",
      prioridad: "Alta",
      estado: "Pendiente",
      tecnicoAsignado: null,
      creadoPor: "user-admin",
      fechaCreacion: ahora,
      fechaInicio: null,
      fechaResolucion: null,
      diagnostico: "",
      solucion: "",
      observaciones: "",
      createdAt: ahora,
      updatedAt: ahora,
    },
    {
      _id: "inc-5",
      equipo: "eq-3",
      titulo: "Revision preventiva",
      descripcion: "Mantenimiento preventivo programado",
      prioridad: "Baja",
      estado: "Pendiente",
      tecnicoAsignado: "user-tec2",
      asignadoPor: "user-admin",
      fechaAsignacion: ahora,
      creadoPor: "user-admin",
      fechaCreacion: ahora,
      fechaInicio: null,
      fechaResolucion: null,
      diagnostico: "",
      solucion: "",
      observaciones: "",
      createdAt: ahora,
      updatedAt: ahora,
    },
    {
      _id: "inc-6",
      equipo: "eq-1",
      titulo: "El mouse no responde",
      descripcion: "El mouse inalambrico conectado a mi laptop no responde, ya se cambiaron las pilas",
      prioridad: "Media",
      estado: "Pendiente",
      tecnicoAsignado: null,
      asignadoPor: null,
      fechaAsignacion: null,
      creadoPor: "user-emp1",
      fechaCreacion: ahora,
      fechaInicio: null,
      fechaResolucion: null,
      diagnostico: "",
      solucion: "",
      observaciones: "",
      createdAt: ahora,
      updatedAt: ahora,
    },
  ];

  return {
    users: [admin, tecnico1, tecnico2, empleado],
    equipment: [laptop, impresora, router1, monitor],
    incidents,
  };
};

// Si es la primera vez que se abre la app en ese navegador, carga los datos demo.
// Si el usuario ya modifico datos antes, respeta lo que tiene guardado.
export const inicializarDatos = () => {
  if (localStorage.getItem(KEYS.seedVersion) === "true") return;

  const seed = construirSeed();
  escribir(KEYS.users, seed.users);
  escribir(KEYS.equipment, seed.equipment);
  escribir(KEYS.incidents, seed.incidents);
  localStorage.setItem(KEYS.seedVersion, "true");
};

// Restaura los datos de demostracion originales, borrando cualquier cambio hecho
export const restaurarDatosDemo = () => {
  const seed = construirSeed();
  escribir(KEYS.users, seed.users);
  escribir(KEYS.equipment, seed.equipment);
  escribir(KEYS.incidents, seed.incidents);
};

export default { KEYS, generarId, leer, escribir, crearError, obtenerUsuarioActual, inicializarDatos, restaurarDatosDemo };
