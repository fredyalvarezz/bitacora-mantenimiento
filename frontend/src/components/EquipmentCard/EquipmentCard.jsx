import { Link } from "react-router-dom";
import { claseEstadoEquipo } from "../../utils/constants";
import "./EquipmentCard.css";

// Tarjeta que representa un equipo en la lista de equipos.
const EquipmentCard = ({ equipo }) => {
  return (
    <div className="equipment-card">
      <div className="equipment-card__header">
        <h3 className="equipment-card__title">{equipo.nombre}</h3>
        <span className={claseEstadoEquipo(equipo.estado)}>{equipo.estado}</span>
      </div>
      {equipo.asignadoAMi && (
        <span className="badge badge--info equipment-card__mine">Asignado a ti</span>
      )}
      <p className="equipment-card__detail">
        <strong>Inventario:</strong> {equipo.numeroInventario}
      </p>
      <p className="equipment-card__detail">
        <strong>Tipo:</strong> {equipo.tipo}
      </p>
      <p className="equipment-card__detail">
        <strong>Ubicacion:</strong> {equipo.ubicacion}
      </p>
      <div className="equipment-card__actions">
        <Link to={`/equipment/${equipo._id}`} className="btn btn--primary btn--small">
          Ver detalle
        </Link>
      </div>
    </div>
  );
};

export default EquipmentCard;
