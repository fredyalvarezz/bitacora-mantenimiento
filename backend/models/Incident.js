import mongoose from "mongoose";

// Modelo de Incidencia: representa un reporte de falla o mantenimiento sobre un equipo
const incidentSchema = new mongoose.Schema(
  {
    equipo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Equipment",
      required: [true, "La incidencia debe pertenecer a un equipo"],
    },
    titulo: {
      type: String,
      required: [true, "El titulo es obligatorio"],
      trim: true,
    },
    descripcion: {
      type: String,
      required: [true, "La descripcion es obligatoria"],
      trim: true,
    },
    prioridad: {
      type: String,
      enum: ["Baja", "Media", "Alta"],
      default: "Media",
    },
    estado: {
      type: String,
      enum: ["Pendiente", "En progreso", "Resuelto", "Cerrado"],
      default: "Pendiente",
    },
    tecnicoAsignado: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    asignadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    fechaAsignacion: {
      type: Date,
      default: null,
    },
    creadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fechaCreacion: {
      type: Date,
      default: Date.now,
    },
    fechaInicio: {
      type: Date,
      default: null,
    },
    fechaResolucion: {
      type: Date,
      default: null,
    },
    diagnostico: {
      type: String,
      trim: true,
      default: "",
    },
    solucion: {
      type: String,
      trim: true,
      default: "",
    },
    observaciones: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Incident", incidentSchema);
