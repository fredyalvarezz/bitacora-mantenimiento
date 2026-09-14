import "./Loading.css";
// Estado de carga reutilizable, se muestra mientras se espera una respuesta de la API
const Loading = ({ mensaje = "Cargando..." }) => {
  return (
    <div className="loading">
      <div className="loading__spinner" />
      <p className="loading__text">{mensaje}</p>
    </div>
  );
};

export default Loading;
