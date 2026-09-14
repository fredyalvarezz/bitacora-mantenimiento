import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import EquipmentForm from "../../components/EquipmentForm/EquipmentForm";
import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { equipmentService } from "../../services/equipmentService";

const EquipmentEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [equipo, setEquipo] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarEquipo = async () => {
      try {
        const data = await equipmentService.obtenerPorId(id);
        setEquipo(data);
      } catch (err) {
        setError(err.response?.data?.mensaje || "No se pudo cargar el equipo");
      } finally {
        setCargando(false);
      }
    };
    cargarEquipo();
  }, [id]);

  const handleGuardar = async (form) => {
    await equipmentService.actualizar(id, form);
    navigate(`/equipment/${id}`);
  };

  return (
    <Layout>
      <div className="page">
        <h1 className="page__title">Editar equipo</h1>
        {cargando && <Loading />}
        <ErrorMessage mensaje={error} />
        {equipo && (
          <div className="panel">
            <EquipmentForm
              valoresIniciales={equipo}
              onGuardar={handleGuardar}
              textoBoton="Guardar cambios"
            />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EquipmentEdit;
