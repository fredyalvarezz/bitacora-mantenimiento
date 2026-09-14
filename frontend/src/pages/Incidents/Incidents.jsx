import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import IncidentCard from "../../components/IncidentCard/IncidentCard";
import Loading from "../../components/Loading/Loading";
import EmptyState from "../../components/EmptyState/EmptyState";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { incidentService } from "../../services/incidentService";
import { useAuth } from "../../context/AuthContext";
import {
  ESTADOS_INCIDENCIA,
  PRIORIDADES_INCIDENCIA,
  agruparIncidenciasPorFecha,
} from "../../utils/constants";
import "./Incidents.css";

const Incidents = () => {
  const [incidencias, setIncidencias] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroPrioridad, setFiltroPrioridad] = useState("");
  const [filtroAsignacion, setFiltroAsignacion] = useState("");
  const [filtroFechaDesde, setFiltroFechaDesde] = useState("");
  const [filtroFechaHasta, setFiltroFechaHasta] = useState("");
  const [gruposAbiertos, setGruposAbiertos] = useState({});
  const { esAdmin, esTecnico, esEmpleado } = useAuth();

  useEffect(() => {
    const cargarIncidencias = async () => {
      setCargando(true);
      setError("");
      try {
        const filtros = {};
        if (filtroEstado) filtros.estado = filtroEstado;
        if (filtroPrioridad) filtros.prioridad = filtroPrioridad;
        if (filtroAsignacion) filtros.asignacion = filtroAsignacion;
        if (filtroFechaDesde) filtros.fechaDesde = filtroFechaDesde;
        if (filtroFechaHasta) filtros.fechaHasta = filtroFechaHasta;
        const data = await incidentService.listar(filtros);
        setIncidencias(data);
      } catch (err) {
        setError(err.response?.data?.mensaje || "No se pudieron cargar las incidencias");
      } finally {
        setCargando(false);
      }
    };
    cargarIncidencias();
  }, [filtroEstado, filtroPrioridad, filtroAsignacion, filtroFechaDesde, filtroFechaHasta]);

  const grupos = useMemo(() => agruparIncidenciasPorFecha(incidencias), [incidencias]);


  useEffect(() => {
    if (grupos.length > 0) {
      setGruposAbiertos({ [grupos[0].fecha]: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [incidencias]);

  const toggleGrupo = (fecha) => {
    setGruposAbiertos((prev) => ({ ...prev, [fecha]: !prev[fecha] }));
  };

  return (
    <Layout>
      <div className="page">
        <div className="page__header">
          <h1 className="page__title">{esEmpleado ? "Mis tickets" : "Incidencias"}</h1>
          {!esTecnico && (
            <Link to="/incidents/new" className="btn btn--primary">
              + Nueva incidencia
            </Link>
          )}
        </div>

        <div className="filters-bar">
          <select
            className="filters-bar__select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {ESTADOS_INCIDENCIA.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
          <select
            className="filters-bar__select"
            value={filtroPrioridad}
            onChange={(e) => setFiltroPrioridad(e.target.value)}
          >
            <option value="">Todas las prioridades</option>
            {PRIORIDADES_INCIDENCIA.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {esAdmin && (
            <select
              className="filters-bar__select"
              value={filtroAsignacion}
              onChange={(e) => setFiltroAsignacion(e.target.value)}
            >
              <option value="">Asignadas y sin asignar</option>
              <option value="asignada">Solo asignadas</option>
              <option value="sinAsignar">Solo sin asignar</option>
            </select>
          )}
          <label className="filters-bar__date-label">
            Desde
            <input
              type="date"
              className="filters-bar__select"
              value={filtroFechaDesde}
              onChange={(e) => setFiltroFechaDesde(e.target.value)}
            />
          </label>
          <label className="filters-bar__date-label">
            Hasta
            <input
              type="date"
              className="filters-bar__select"
              value={filtroFechaHasta}
              onChange={(e) => setFiltroFechaHasta(e.target.value)}
            />
          </label>
        </div>

        {cargando && <Loading />}
        <ErrorMessage mensaje={error} />

        {!cargando && !error && incidencias.length === 0 && (
          <EmptyState
            titulo="No hay incidencias"
            mensaje="Crea una nueva incidencia para comenzar a llevar el control"
          />
        )}

        {/* Las incidencias se agrupan por el dia en que fueron creadas, mas reciente primero.
            Cada grupo se puede expandir/contraer para no tener que hacer scroll interminable. */}
        {!cargando &&
          grupos.map((grupo) => {
            const abierto = !!gruposAbiertos[grupo.fecha];
            return (
              <div key={grupo.fecha} className="incidents-group">
                <button
                  type="button"
                  className="incidents-group__header"
                  onClick={() => toggleGrupo(grupo.fecha)}
                >
                  <span className="incidents-group__title">{grupo.etiqueta}</span>
                  <span className="incidents-group__count">
                    {grupo.incidencias.length}{" "}
                    {grupo.incidencias.length === 1 ? "incidencia" : "incidencias"}
                  </span>
                  <span className="incidents-group__chevron">{abierto ? "▲" : "▼"}</span>
                </button>
                {abierto && (
                  <div className="cards-grid">
                    {grupo.incidencias.map((inc) => (
                      <IncidentCard key={inc._id} incidencia={inc} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </Layout>
  );
};

export default Incidents;
