// Middleware para manejar rutas que no existen
export const notFound = (req, res, next) => {
  res.status(404).json({ mensaje: `Ruta no encontrada: ${req.originalUrl}` });
};

// Middleware global de manejo de errores
// Express lo detecta automaticamente porque recibe 4 parametros
export const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Error de validacion de Mongoose
  if (err.name === "ValidationError") {
    const mensajes = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ mensaje: mensajes.join(", ") });
  }

  // Error de campo duplicado (por ejemplo, email o numeroInventario repetido)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue)[0];
    return res.status(400).json({ mensaje: `El valor de "${campo}" ya existe` });
  }

  // Error de formato de ID invalido en Mongoose
  if (err.name === "CastError") {
    return res.status(400).json({ mensaje: "Identificador invalido" });
  }

  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    mensaje: err.message || "Error interno del servidor",
  });
};
