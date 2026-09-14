import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import StatCard from "../../components/StatCard/StatCard";
import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { incidentService } from "../../services/incidentService";
import { claseEstadoEquipo, claseEstadoIncidencia, formatearFecha } from "../../utils/constants";
import "./Dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        const data = await incidentService.obtenerEstadisticas();
        setStats(data);
      } catch (err) {
        setError(err.response?.data?.mensaje || "No se pudieron cargar las estadisticas");
      } finally {
        setCargando(false);
      }
    };
    cargarEstadisticas();
  }, []);

  return (
    <Layout>
      <div className="page">
        <h1 className="page__title">Dashboard</h1>

        {cargando && <Loading />}
        <ErrorMessage mensaje={error} />

        {stats && (
          <>
            <div className="stats-grid">
              <StatCard titulo="Total de equipos" valor={stats.totalEquipos} tipo="primary" />
              <StatCard
                titulo="En mantenimiento"
                valor={stats.equiposEnMantenimiento}
                tipo="warning"
              />
              <StatCard
                titulo="Fuera de servicio"
                valor={stats.equiposFueraServicio}
                tipo="danger"
              />
              <StatCard
                titulo="Incidencias pendientes"
                valor={stats.incidenciasPendientes}
                tipo="warning"
              />
              <StatCard
                titulo="Incidencias en progreso"
                valor={stats.incidenciasEnProgreso}
                tipo="info"
              />
              <StatCard
                titulo="Incidencias resueltas"
                valor={stats.incidenciasResueltas}
                tipo="success"
              />
              <StatCard
                titulo="Prioridad alta activas"
                valor={stats.incidenciasAltaPrioridad}
                tipo="danger"
              />
            </div>

            <div className="dashboard-grid">
              <section className="panel">
                <h2 className="panel__title">Incidencias recientes</h2>
                {stats.incidenciasRecientes.length === 0 ? (
                  <p className="panel__empty">No hay incidencias registradas todavia</p>
                ) : (
                  <ul className="simple-list">
                    {stats.incidenciasRecientes.map((inc) => (
                      <li key={inc._id} className="simple-list__item">
                        <Link to={`/incidents/${inc._id}`} className="simple-list__link">
                          {inc.titulo}
                        </Link>
                        <span className={claseEstadoIncidencia(inc.estado)}>{inc.estado}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="panel">
                <h2 className="panel__title">Equipos registrados recientemente</h2>
                {stats.equiposRecientes.length === 0 ? (
                  <p className="panel__empty">No hay equipos registrados todavia</p>
                ) : (
                  <ul className="simple-list">
                    {stats.equiposRecientes.map((eq) => (
                      <li key={eq._id} className="simple-list__item">
                        <Link to={`/equipment/${eq._id}`} className="simple-list__link">
                          {eq.nombre}
                        </Link>
                        <span className={claseEstadoEquipo(eq.estado)}>{eq.estado}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Dashboard;
