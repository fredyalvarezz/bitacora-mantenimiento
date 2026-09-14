import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import IncidentForm from "../../components/IncidentForm/IncidentForm";
import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { incidentService } from "../../services/incidentService";


const IncidentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [incidencia, setIncidencia] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

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

  const handleGuardar = async (form) => {
    await incidentService.actualizar(id, form);
    navigate(`/incidents/${id}`);
  };

  return (
    <Layout>
      <div className="page">
        <h1 className="page__title">Editar incidencia</h1>
        {cargando && <Loading />}
        <ErrorMessage mensaje={error} />
        {incidencia && (
          <div className="panel">
            <IncidentForm
              valoresIniciales={incidencia}
              onGuardar={handleGuardar}
              textoBoton="Guardar cambios"
              modo="editar"
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default IncidentEdit;
