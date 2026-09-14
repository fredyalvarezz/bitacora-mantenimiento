import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import IncidentForm from "../../components/IncidentForm/IncidentForm";
import { incidentService } from "../../services/incidentService";


const IncidentNew = () => {
  const navigate = useNavigate();

  const handleGuardar = async (form) => {
    const incidenciaCreada = await incidentService.crear(form);
    navigate(`/incidents/${incidenciaCreada._id}`);
  };

  return (
    <Layout>
      <div className="page">
        <h1 className="page__title">Nueva incidencia</h1>
        <div className="panel">
          <IncidentForm onGuardar={handleGuardar} textoBoton="Crear incidencia" modo="crear" />
        </div>
      </div>
    </Layout>
  );
};

export default IncidentNew;
