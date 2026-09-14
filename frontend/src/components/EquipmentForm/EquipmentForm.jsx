import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import { TIPOS_EQUIPO, ESTADOS_EQUIPO } from "../../utils/constants";

// Formulario para crear y editar equipos.
const EquipmentForm = ({ valoresIniciales, onGuardar, textoBoton = "Guardar" }) => {
  const [form, setForm] = useState(
    valoresIniciales || {
      nombre: "",
      numeroInventario: "",
      tipo: "Computadora",
      marca: "",
      modelo: "",
      numeroSerie: "",
      ubicacion: "",
      departamento: "",
      usuarioAsignado: "",
      estado: "Disponible",
      descripcion: "",
    }
  );
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validacion basica en el cliente antes de enviar al backend
    if (!form.nombre || !form.numeroInventario || !form.marca || !form.modelo || !form.ubicacion) {
      setError("Por favor completa los campos obligatorios");
      return;
    }

    setGuardando(true);
    try {
      await onGuardar(form);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo guardar el equipo");
      setGuardando(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorMessage mensaje={error} />

      <div className="form__row">
        <div className="form-group">
          <label className="form-group__label">Nombre *</label>
          <input
            className="form-group__input"
            name="nombre"
            value={form.nombre}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-group__label">Numero de inventario *</label>
          <input
            className="form-group__input"
            name="numeroInventario"
            value={form.numeroInventario}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form__row">
        <div className="form-group">
          <label className="form-group__label">Tipo *</label>
          <select className="form-group__input" name="tipo" value={form.tipo} onChange={handleChange}>
            {TIPOS_EQUIPO.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label className="form-group__label">Estado</label>
          <select
            className="form-group__input"
            name="estado"
            value={form.estado}
            onChange={handleChange}
          >
            {ESTADOS_EQUIPO.map((estado) => (
              <option key={estado} value={estado}>
                {estado}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="form__row">
        <div className="form-group">
          <label className="form-group__label">Marca *</label>
          <input
            className="form-group__input"
            name="marca"
            value={form.marca}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label className="form-group__label">Modelo *</label>
          <input
            className="form-group__input"
            name="modelo"
            value={form.modelo}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form__row">
        <div className="form-group">
          <label className="form-group__label">Numero de serie</label>
          <input
            className="form-group__input"
            name="numeroSerie"
            value={form.numeroSerie}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label className="form-group__label">Ubicacion *</label>
          <input
            className="form-group__input"
            name="ubicacion"
            value={form.ubicacion}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="form__row">
        <div className="form-group">
          <label className="form-group__label">Departamento</label>
          <input
            className="form-group__input"
            name="departamento"
            value={form.departamento}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label className="form-group__label">Usuario asignado</label>
          <input
            className="form-group__input"
            name="usuarioAsignado"
            value={form.usuarioAsignado}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-group">
        <label className="form-group__label">Descripcion</label>
        <textarea
          className="form-group__textarea"
          name="descripcion"
          value={form.descripcion}
          onChange={handleChange}
          rows={3}
        />
      </div>

      <div className="form__actions">
        <button
          type="button"
          className="btn btn--secondary"
          onClick={() => navigate(-1)}
        >
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? "Guardando..." : textoBoton}
        </button>
      </div>
    </form>
  );
};

export default EquipmentForm;
