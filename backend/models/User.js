import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Modelo de Usuario: administradores y tecnicos del sistema
const userSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, "El nombre es obligatorio"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El email es obligatorio"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "El email no tiene un formato valido"],
    },
    password: {
      type: String,
      required: [true, "La contrasena es obligatoria"],
      minlength: [6, "La contrasena debe tener al menos 6 caracteres"],
    },
    rol: {
      type: String,
      enum: ["ADMIN", "TECHNICIAN", "EMPLOYEE"],
      default: "TECHNICIAN",
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Antes de guardar el usuario, si la contrasena cambio, la encriptamos
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Metodo de instancia para comparar la contrasena ingresada con la guardada
userSchema.methods.compararPassword = async function (passwordIngresada) {
  return bcrypt.compare(passwordIngresada, this.password);
};

// Nunca devolver la contrasena en las respuestas JSON
userSchema.methods.toJSON = function () {
  const usuario = this.toObject();
  delete usuario.password;
  return usuario;
};

export default mongoose.model("User", userSchema);
