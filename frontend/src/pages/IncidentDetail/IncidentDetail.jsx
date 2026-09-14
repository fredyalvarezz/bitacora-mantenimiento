import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import Modal from "../../components/Modal/Modal";
import { incidentService } from "../../services/incidentService";
import { useAuth } from "../../context/AuthContext";
import { claseEstadoIncidencia, clasePrioridad, formatearFecha } from "../../utils/constants";
import "./IncidentDetail.css";

const IncidentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { esAdmin, usuario } = useAuth();
  const [incidencia, setIncidencia] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  useEffect(() => {
    const cargarIncidencia = async () => {
      try {
        const data = await incidentService.obtenerPorId(id);
        setIncidencia(data);
      } catch (err) {
        setError(err.response?.data?.mensaje || "No se pudo cargar la incidencia");
      } finally {
        setCargando(false);
      }
    };
    cargarIncidencia();
  }, [id]);

  const handleEliminar = async () => {
    try {
      await incidentService.eliminar(id);
      navigate("/incidents");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo eliminar la incidencia");
      setMostrarModal(false);
    }
  };

  if (cargando) {
    return (
      <Layout>
        <div className="page">
          <Loading />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="page">
        <ErrorMessage mensaje={error} />

        {incidencia && (
          <>
            <div className="page__header">
              <h1 className="page__title">{incidencia.titulo}</h1>
              <div className="page__actions">
                {(esAdmin || incidencia.tecnicoAsignado?._id === usuario?._id) && (
                  <Link to={`/incidents/${id}/edit`} className="btn btn--secondary">
                    Editar
                  </Link>
                )}
                {esAdmin && (
                  <button className="btn btn--danger" onClick={() => setMostrarModal(true)}>
                    Eliminar
                  </button>
                )}
              </div>
            </div>

            <div className="panel">
              <div className="detail-grid">
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Equipo</span>
                  <span className="detail-grid__value">
                    {incidencia.equipo ? (
                      <Link to={`/equipment/${incidencia.equipo._id}`}>
                        {incidencia.equipo.nombre}
                      </Link>
                    ) : (
                      "N/D"
                    )}
                  </span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Prioridad</span>
                  <span className={clasePrioridad(incidencia.prioridad)}>
                    {incidencia.prioridad}
                  </span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Estado</span>
                  <span className={claseEstadoIncidencia(incidencia.estado)}>
                    {incidencia.estado}
                  </span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Tecnico asignado</span>
                  <span className="detail-grid__value">
                    {incidencia.tecnicoAsignado?.nombre || "Sin asignar"}
                  </span>
                </div>
                {incidencia.tecnicoAsignado && (
                  <div className="detail-grid__item">
                    <span className="detail-grid__label">Asignado por</span>
                    <span className="detail-grid__value">
                      {incidencia.asignadoPor?.nombre || "-"}
                      {incidencia.fechaAsignacion && ` (${formatearFecha(incidencia.fechaAsignacion)})`}
                    </span>
                  </div>
                )}
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Fecha de creacion</span>
                  <span className="detail-grid__value">
                    {formatearFecha(incidencia.fechaCreacion || incidencia.createdAt)}
                  </span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Fecha de inicio</span>
                  <span className="detail-grid__value">{formatearFecha(incidencia.fechaInicio)}</span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Fecha de resolucion</span>
                  <span className="detail-grid__value">
                    {formatearFecha(incidencia.fechaResolucion)}
                  </span>
                </div>
              </div>

              <div className="detail-section">
                <h3 className="detail-section__title">Descripcion</h3>
                <p>{incidencia.descripcion}</p>
              </div>

              {incidencia.diagnostico && (
                <div className="detail-section">
                  <h3 className="detail-section__title">Diagnostico</h3>
                  <p>{incidencia.diagnostico}</p>
                </div>
              )}

              {incidencia.solucion && (
                <div className="detail-section">
                  <h3 className="detail-section__title">Solucion</h3>
                  <p>{incidencia.solucion}</p>
                </div>
              )}

              {incidencia.observaciones && (
                <div className="detail-section">
                  <h3 className="detail-section__title">Observaciones</h3>
                  <p>{incidencia.observaciones}</p>
                </div>
              )}
            </div>
          </>
        )}

        {mostrarModal && (
          <Modal
            titulo="Eliminar incidencia"
            mensaje={`¿Seguro que deseas eliminar "${incidencia.titulo}"?`}
            onConfirmar={handleEliminar}
            onCancelar={() => setMostrarModal(false)}
            textoConfirmar="Eliminar"
          />
        )}
      </div>
    </Layout>
  );
};

export default IncidentDetail;
