import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import EquipmentForm from "../../components/EquipmentForm/EquipmentForm";
import { equipmentService } from "../../services/equipmentService";


const EquipmentNew = () => {
  const navigate = useNavigate();

  const handleGuardar = async (form) => {
    const equipoCreado = await equipmentService.crear(form);
    navigate(`/equipment/${equipoCreado._id}`);
  };

  return (
    <Layout>
      <div className="page">
        <h1 className="page__title">Nuevo equipo</h1>
        <div className="panel">
          <EquipmentForm onGuardar={handleGuardar} textoBoton="Crear equipo" />
        </div>
      </div>
    </Layout>
  );
};

export default EquipmentNew;
