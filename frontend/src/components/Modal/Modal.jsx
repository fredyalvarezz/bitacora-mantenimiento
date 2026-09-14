import "./Modal.css";
// Modal generico de confirmacion, usado por ejemplo antes de eliminar un equipo o incidencia
const Modal = ({ titulo, mensaje, onConfirmar, onCancelar, textoConfirmar = "Confirmar" }) => {
  return (
    <div className="modal__overlay">
      <div className="modal__content">
        <h3 className="modal__title">{titulo}</h3>
        <p className="modal__message">{mensaje}</p>
        <div className="modal__actions">
          <button className="btn btn--secondary" onClick={onCancelar}>
            Cancelar
          </button>
          <button className="btn btn--danger" onClick={onConfirmar}>
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
