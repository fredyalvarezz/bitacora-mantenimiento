import mongoose from "mongoose";

// Funcion encargada de conectar la aplicacion a MongoDB Atlas
// Se usa async/await porque la conexion es una operacion asincrona
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB conectado: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error al conectar a MongoDB: ${error.message}`);
    // Si no hay conexion a la base de datos, no tiene sentido seguir corriendo el server
    process.exit(1);
  }
};

export default connectDB;
