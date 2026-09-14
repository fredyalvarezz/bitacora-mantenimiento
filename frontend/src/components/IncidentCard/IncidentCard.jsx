import { Link } from "react-router-dom";
import { claseEstadoIncidencia, clasePrioridad, formatearFecha } from "../../utils/constants";
import "./IncidentCard.css";

// Tarjeta que representa una incidencia en la lista de incidencias
const IncidentCard = ({ incidencia }) => {
  return (
    <div className="incident-card">
      <div className="incident-card__header">
        <h3 className="incident-card__title">{incidencia.titulo}</h3>
        <span className={clasePrioridad(incidencia.prioridad)}>{incidencia.prioridad}</span>
      </div>
      <p className="incident-card__detail">
        <strong>Equipo:</strong> {incidencia.equipo?.nombre || "N/D"}
      </p>
      <p className="incident-card__detail">
        <strong>Tecnico:</strong> {incidencia.tecnicoAsignado?.nombre || "Sin asignar"}
      </p>
      <p className="incident-card__detail">
        <strong>Fecha:</strong> {formatearFecha(incidencia.createdAt)}
      </p>
      <div className="incident-card__footer">
        <span className={claseEstadoIncidencia(incidencia.estado)}>{incidencia.estado}</span>
        <Link to={`/incidents/${incidencia._id}`} className="btn btn--primary btn--small">
          Ver detalle
        </Link>
      </div>
    </div>
  );
};

export default IncidentCard;
