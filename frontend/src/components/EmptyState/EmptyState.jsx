import "./EmptyState.css";
// Estado vacio reutilizable, se muestra cuando una lista no tiene elementos
const EmptyState = ({ titulo = "No hay datos", mensaje = "", accion = null }) => {
  return (
    <div className="empty-state">
      <p className="empty-state__title">{titulo}</p>
      {mensaje && <p className="empty-state__message">{mensaje}</p>}
      {accion}
    </div>
  );
};

export default EmptyState;
