// Script para cargar datos de prueba en la base de datos.
// Ejecutar con: npm run seed
// este script borra los datos existentes de las colecciones antes de insertar los nuevos.

import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import User from "../models/User.js";
import Equipment from "../models/Equipment.js";
import Incident from "../models/Incident.js";

const seed = async () => {
  try {
    await connectDB();

    console.log("Borrando datos existentes...");
    await User.deleteMany();
    await Equipment.deleteMany();
    await Incident.deleteMany();

    console.log("Creando usuarios de prueba...");
    // Nota: las contrasenas se encriptan automaticamente gracias al hook pre("save") del modelo User
    const admin = await User.create({
      nombre: "Ana Administradora",
      email: "admin@demo.com",
      password: "admin123",
      rol: "ADMIN",
    });

    const tecnico1 = await User.create({
      nombre: "Juan Perez",
      email: "juan@demo.com",
      password: "tecnico123",
      rol: "TECHNICIAN",
    });

    const tecnico2 = await User.create({
      nombre: "Maria Lopez",
      email: "maria@demo.com",
      password: "tecnico123",
      rol: "TECHNICIAN",
    });

    const empleado = await User.create({
      nombre: "Carlos Ramirez",
      email: "carlos@demo.com",
      password: "empleado123",
      rol: "EMPLOYEE",
    });

    console.log("Creando equipos de prueba...");
    const laptop = await Equipment.create({
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
      descripcion: "Laptop asignada al departamento de contabilidad",
    });

    const impresora = await Equipment.create({
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
      descripcion: "Impresora compartida del area de recepcion",
    });

    const router1 = await Equipment.create({
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
      descripcion: "Router de respaldo para la red interna",
    });

    const monitor = await Equipment.create({
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
      descripcion: "Monitor con fallas en la pantalla",
    });

    console.log("Creando incidencias de prueba...");
    await Incident.create({
      equipo: laptop._id,
      titulo: "No enciende",
      descripcion: "La laptop no enciende al presionar el boton de encendido",
      prioridad: "Alta",
      estado: "Cerrado",
      tecnicoAsignado: tecnico1._id,
      creadoPor: admin._id,
      fechaInicio: new Date("2026-08-12"),
      fechaResolucion: new Date("2026-08-12"),
      diagnostico: "Problema con el cargador",
      solucion: "Cambio de cargador",
      observaciones: "Se recomienda revisar el cargador cada 6 meses",
    });

    await Incident.create({
      equipo: laptop._id,
      titulo: "Equipo lento",
      descripcion: "La laptop tarda mucho en abrir programas",
      prioridad: "Media",
      estado: "Cerrado",
      tecnicoAsignado: tecnico1._id,
      creadoPor: admin._id,
      fechaInicio: new Date("2026-08-25"),
      fechaResolucion: new Date("2026-08-25"),
      diagnostico: "Poco espacio disponible en disco",
      solucion: "Limpieza de archivos temporales y actualizacion del sistema",
      observaciones: "",
    });

    await Incident.create({
      equipo: impresora._id,
      titulo: "No imprime a color",
      descripcion: "La impresora solo imprime en blanco y negro",
      prioridad: "Media",
      estado: "En progreso",
      tecnicoAsignado: tecnico2._id,
      creadoPor: admin._id,
      fechaInicio: new Date(),
      diagnostico: "Posible falla en el cartucho de color",
      solucion: "",
      observaciones: "Se solicito cotizacion de cartucho nuevo",
    });

    await Incident.create({
      equipo: monitor._id,
      titulo: "Pantalla con lineas",
      descripcion: "El monitor muestra lineas verticales de color",
      prioridad: "Alta",
      estado: "Pendiente",
      tecnicoAsignado: null,
      creadoPor: admin._id,
      diagnostico: "",
      solucion: "",
      observaciones: "",
    });

    await Incident.create({
      equipo: router1._id,
      titulo: "Revision preventiva",
      descripcion: "Mantenimiento preventivo programado",
      prioridad: "Baja",
      estado: "Pendiente",
      tecnicoAsignado: tecnico2._id,
      creadoPor: admin._id,
      asignadoPor: admin._id,
      fechaAsignacion: new Date(),
      diagnostico: "",
      solucion: "",
      observaciones: "",
    });

    // Ticket creado por un empleado de oficina, sobre su propio equipo asignado, todavia sin asignar a ningun tecnico
    await Incident.create({
      equipo: laptop._id,
      titulo: "El mouse no responde",
      descripcion: "El mouse inalambrico conectado a mi laptop no responde, ya se cambiaron las pilas",
      prioridad: "Media",
      estado: "Pendiente",
      tecnicoAsignado: null,
      creadoPor: empleado._id,
      diagnostico: "",
      solucion: "",
      observaciones: "",
    });

    console.log("Datos de prueba creados con exito.");
    console.log("Usuarios demo:");
    console.log("  ADMIN     -> admin@demo.com / admin123");
    console.log("  TECHNICIAN-> juan@demo.com / tecnico123");
    console.log("  TECHNICIAN-> maria@demo.com / tecnico123");
    console.log("  EMPLOYEE  -> carlos@demo.com / empleado123");

    process.exit(0);
  } catch (error) {
    console.error("Error al cargar datos de prueba:", error);
    process.exit(1);
  }
};

seed();
