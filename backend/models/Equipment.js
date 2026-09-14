import mongoose from "mongoose";

// Modelo de Equipo: representa cada dispositivo que la empresa controla
const equipmentSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre del equipo es obligatorio"],
      trim: true,
    },
    numeroInventario: {
      type: String,
      required: [true, "El numero de inventario es obligatorio"],
      unique: true,
      trim: true,
    },
    tipo: {
      type: String,
      enum: [
        "Computadora",
        "Laptop",
        "Impresora",
        "Monitor",
        "Router",
        "Switch",
        "Camara",
        "Servidor",
        "Otro",
      ],
      required: [true, "El tipo de equipo es obligatorio"],
    },
    marca: {
      type: String,
      required: [true, "La marca es obligatoria"],
      trim: true,
    },
    modelo: {
      type: String,
      required: [true, "El modelo es obligatorio"],
      trim: true,
    },
    numeroSerie: {
      type: String,
      trim: true,
      default: "",
    },
    ubicacion: {
      type: String,
      required: [true, "La ubicacion es obligatoria"],
      trim: true,
    },
    departamento: {
      type: String,
      trim: true,
      default: "",
    },
    usuarioAsignado: {
      type: String,
      trim: true,
      default: "",
    },
    estado: {
      type: String,
      enum: ["Disponible", "En uso", "En mantenimiento", "Fuera de servicio"],
      default: "Disponible",
    },
    fechaRegistro: {
      type: Date,
      default: Date.now,
    },
    descripcion: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Equipment", equipmentSchema);
