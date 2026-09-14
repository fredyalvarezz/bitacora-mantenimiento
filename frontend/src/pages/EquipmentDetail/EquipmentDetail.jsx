import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import EmptyState from "../../components/EmptyState/EmptyState";
import Modal from "../../components/Modal/Modal";
import { equipmentService } from "../../services/equipmentService";
import { useAuth } from "../../context/AuthContext";
import { claseEstadoEquipo, claseEstadoIncidencia, formatearFecha } from "../../utils/constants";
import "./EquipmentDetail.css";

const EquipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { esAdmin, esTecnico } = useAuth();
  const [equipo, setEquipo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [mostrarModal, setMostrarModal] = useState(false);

  const cargarDatos = async () => {
    setCargando(true);
    setError("");
    try {
      const data = await equipmentService.obtenerHistorial(id);
      setEquipo(data.equipo);
      setHistorial(data.historial);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo cargar el equipo");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
 
  }, [id]);

  const handleEliminar = async () => {
    try {
      await equipmentService.eliminar(id);
      navigate("/equipment");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo eliminar el equipo");
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

        {equipo && (
          <>
            <div className="page__header">
              <h1 className="page__title">{equipo.nombre}</h1>
              {esAdmin && (
                <div className="page__actions">
                  <Link to={`/equipment/${id}/edit`} className="btn btn--secondary">
                    Editar
                  </Link>
                  <button className="btn btn--danger" onClick={() => setMostrarModal(true)}>
                    Eliminar
                  </button>
                </div>
              )}
            </div>
            {esTecnico && (
              <span
                className={`badge ${equipo.asignadoAMi ? "badge--info" : "badge--neutral"}`}
                style={{ display: "inline-block", marginBottom: 16 }}
              >
                {equipo.asignadoAMi ? "Asignado a ti" : "No asignado a ti"}
              </span>
            )}

            <div className="panel">
              <div className="detail-grid">
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Numero de inventario</span>
                  <span className="detail-grid__value">{equipo.numeroInventario}</span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Tipo</span>
                  <span className="detail-grid__value">{equipo.tipo}</span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Estado</span>
                  <span className={claseEstadoEquipo(equipo.estado)}>{equipo.estado}</span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Marca</span>
                  <span className="detail-grid__value">{equipo.marca}</span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Modelo</span>
                  <span className="detail-grid__value">{equipo.modelo}</span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Numero de serie</span>
                  <span className="detail-grid__value">{equipo.numeroSerie || "-"}</span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Ubicacion</span>
                  <span className="detail-grid__value">{equipo.ubicacion}</span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Departamento</span>
                  <span className="detail-grid__value">{equipo.departamento || "-"}</span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Usuario asignado</span>
                  <span className="detail-grid__value">{equipo.usuarioAsignado || "-"}</span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Fecha de registro</span>
                  <span className="detail-grid__value">{formatearFecha(equipo.fechaRegistro)}</span>
                </div>
              </div>
              {equipo.descripcion && (
                <p className="detail-grid__description">{equipo.descripcion}</p>
              )}
            </div>

            <div className="page__header">
              <h2 className="page__subtitle">Historial de mantenimiento</h2>
              {!esTecnico && (
                <Link to="/incidents/new" className="btn btn--primary btn--small">
                  + Reportar incidencia
                </Link>
              )}
            </div>

            {historial.length === 0 ? (
              <EmptyState
                titulo="Sin historial"
                mensaje="Este equipo todavia no tiene incidencias registradas"
              />
            ) : (
              <div className="history-list">
                {historial.map((item) => (
                  <div key={item._id} className="history-item">
                    <div className="history-item__date">{formatearFecha(item.createdAt)}</div>
                    <div className="history-item__content">
                      <p>
                        <strong>Problema:</strong> {item.titulo}
                      </p>
                      {item.diagnostico && (
                        <p>
                          <strong>Diagnostico:</strong> {item.diagnostico}
                        </p>
                      )}
                      {item.solucion && (
                        <p>
                          <strong>Solucion:</strong> {item.solucion}
                        </p>
                      )}
                      <p>
                        <strong>Tecnico:</strong> {item.tecnicoAsignado?.nombre || "Sin asignar"}
                      </p>
                      <span className={claseEstadoIncidencia(item.estado)}>{item.estado}</span>
                    </div>
                    <Link to={`/incidents/${item._id}`} className="history-item__link">
                      Ver detalle →
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {mostrarModal && (
          <Modal
            titulo="Eliminar equipo"
            mensaje={`¿Seguro que deseas eliminar "${equipo.nombre}"? Tambien se eliminaran sus incidencias.`}
            onConfirmar={handleEliminar}
            onCancelar={() => setMostrarModal(false)}
            textoConfirmar="Eliminar"
          />
        )}
      </div>
    </Layout>
  );
};

export default EquipmentDetail;
