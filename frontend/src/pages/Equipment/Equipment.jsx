import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import EquipmentCard from "../../components/EquipmentCard/EquipmentCard";
import Loading from "../../components/Loading/Loading";
import EmptyState from "../../components/EmptyState/EmptyState";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { equipmentService } from "../../services/equipmentService";
import { useAuth } from "../../context/AuthContext";
import { TIPOS_EQUIPO, ESTADOS_EQUIPO } from "../../utils/constants";


const Equipment = () => {
  const [equipos, setEquipos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [generandoPreventivos, setGenerandoPreventivos] = useState(false);
  const { esAdmin, esEmpleado } = useAuth();

  const cargarEquipos = async () => {
    setCargando(true);
    setError("");
    try {
      const filtros = {};
      if (busqueda) filtros.buscar = busqueda;
      if (filtroEstado) filtros.estado = filtroEstado;
      if (filtroTipo) filtros.tipo = filtroTipo;
      const data = await equipmentService.listar(filtros);
      setEquipos(data);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudieron cargar los equipos");
    } finally {
      setCargando(false);
    }
  };

  // Cada vez que cambian los filtros, volvemos a consultar la API
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      cargarEquipos();
    }, 300); // pequeno debounce para no disparar una peticion en cada tecla
    return () => clearTimeout(timeoutId);

  }, [busqueda, filtroEstado, filtroTipo]);

  const handleGenerarPreventivos = async () => {
    setGenerandoPreventivos(true);
    setError("");
    setExito("");
    try {
      const resultado = await equipmentService.generarMantenimientosPreventivos();
      setExito(resultado.mensaje);
    } catch (err) {
      setError(
        err.response?.data?.mensaje || "No se pudieron generar los mantenimientos preventivos"
      );
    } finally {
      setGenerandoPreventivos(false);
    }
  };

  return (
    <Layout>
      <div className="page">
        <div className="page__header">
          <h1 className="page__title">{esEmpleado ? "Mis equipos" : "Equipos"}</h1>
          {esAdmin && (
            <div className="page__actions">
              <button
                className="btn btn--secondary"
                onClick={handleGenerarPreventivos}
                disabled={generandoPreventivos}
                title="Crea un ticket de mantenimiento preventivo para cada equipo sin actividad en los ultimos 12 meses"
              >
                {generandoPreventivos ? "Generando..." : "Generar mantenimientos preventivos"}
              </button>
              <Link to="/equipment/new" className="btn btn--primary">
                + Nuevo equipo
              </Link>
            </div>
          )}
        </div>

        <ErrorMessage mensaje={error} />
        {exito && <p className="success-message">{exito}</p>}

        <div className="filters-bar">
          <input
            type="text"
            className="filters-bar__input"
            placeholder="Buscar por nombre, inventario o serie..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          <select
            className="filters-bar__select"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="">Todos los tipos</option>
            {TIPOS_EQUIPO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
          <select
            className="filters-bar__select"
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            <option value="">Todos los estados</option>
            {ESTADOS_EQUIPO.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>

        {cargando && <Loading />}
        <ErrorMessage mensaje={error} />

        {!cargando && !error && equipos.length === 0 && (
          <EmptyState
            titulo="No se encontraron equipos"
            mensaje="Intenta cambiar los filtros de busqueda"
          />
        )}

        {!cargando && equipos.length > 0 && (
          <div className="cards-grid">
            {equipos.map((equipo) => (
              <EquipmentCard key={equipo._id} equipo={equipo} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Equipment;
