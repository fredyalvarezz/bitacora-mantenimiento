import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import { PRIORIDADES_INCIDENCIA, ESTADOS_INCIDENCIA } from "../../utils/constants";
import { equipmentService } from "../../services/equipmentService";
import { userService } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import "./IncidentForm.css";

const IncidentForm = ({ valoresIniciales, onGuardar, textoBoton = "Guardar", modo = "crear" }) => {
  const [form, setForm] = useState(
    valoresIniciales || {
      equipo: "",
      titulo: "",
      descripcion: "",
      prioridad: "Media",
      estado: "Pendiente",
      tecnicoAsignado: "",
      diagnostico: "",
      solucion: "",
      observaciones: "",
    }
  );
  const [equipos, setEquipos] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);
  const { esAdmin, esTecnico } = useAuth();
  const navigate = useNavigate();

  // El tecnico solo puede editar estos 4 campos; todo lo demas se muestra como texto fijo
  const editandoComoTecnico = modo === "editar" && esTecnico;

  useEffect(() => {
    if (modo === "crear") {
      equipmentService.listar().then(setEquipos).catch(() => setEquipos([]));
    }
    if (esAdmin) {
      userService
        .listar()
        .then((usuarios) =>
          setTecnicos(usuarios.filter((u) => u.rol === "TECHNICIAN" && u.activo))
        )
        .catch(() => setTecnicos([]));
    }
  
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!editandoComoTecnico && (!form.titulo || !form.descripcion || (modo === "crear" && !form.equipo))) {
      setError("Por favor completa los campos obligatorios");
      return;
    }

    setGuardando(true);
    try {
      // El tecnico solo envia sus 4 campos permitidos; el resto ni se manda
      const datosEnviar = editandoComoTecnico
        ? {
            estado: form.estado,
            diagnostico: form.diagnostico,
            solucion: form.solucion,
            observaciones: form.observaciones,
          }
        : { ...form, tecnicoAsignado: form.tecnicoAsignado || null };

      await onGuardar(datosEnviar);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo guardar la incidencia");
      setGuardando(false);
    }
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <ErrorMessage mensaje={error} />

      {modo === "crear" && (
        <div className="form-group">
          <label className="form-group__label">Equipo *</label>
          <select
            className="form-group__input"
            name="equipo"
            value={form.equipo}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un equipo</option>
            {equipos.map((eq) => (
              <option key={eq._id} value={eq._id}>
                {eq.nombre} ({eq.numeroInventario})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Cuando un TECHNICIAN edita, titulo/descripcion/prioridad se muestran fijos, sin poder tocarlos */}
      {editandoComoTecnico ? (
        <div className="incident-form__readonly">
          <p>
            <strong>Titulo:</strong> {form.titulo}
          </p>
          <p>
            <strong>Descripcion:</strong> {form.descripcion}
          </p>
          <p>
            <strong>Prioridad:</strong> {form.prioridad}
          </p>
        </div>
      ) : (
        <>
          <div className="form-group">
            <label className="form-group__label">Titulo *</label>
            <input
              className="form-group__input"
              name="titulo"
              value={form.titulo}
              onChange={handleChange}
              placeholder="Ej: No enciende"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-group__label">Descripcion *</label>
            <textarea
              className="form-group__textarea"
              name="descripcion"
              value={form.descripcion}
              onChange={handleChange}
              rows={3}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-group__label">Prioridad</label>
            <select
              className="form-group__input"
              name="prioridad"
              value={form.prioridad}
              onChange={handleChange}
            >
              {PRIORIDADES_INCIDENCIA.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {modo === "editar" && (
        <div className="form-group">
          <label className="form-group__label">Estado</label>
          <select
            className="form-group__input"
            name="estado"
            value={form.estado}
            onChange={handleChange}
          >
            {/* Un tecnico no puede cerrar una incidencia el mismo: eso lo confirma el ADMIN */}
            {ESTADOS_INCIDENCIA.filter((e) => !editandoComoTecnico || e !== "Cerrado").map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          {editandoComoTecnico && (
            <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
              Cuando termines, marca "Resuelto". Un administrador confirmara y cerrara el ticket.
            </span>
          )}
        </div>
      )}

      {esAdmin && (
        <div className="form-group">
          <label className="form-group__label">Tecnico asignado</label>
          <select
            className="form-group__input"
            name="tecnicoAsignado"
            value={form.tecnicoAsignado?._id || form.tecnicoAsignado || ""}
            onChange={handleChange}
          >
            <option value="">Sin asignar</option>
            {tecnicos.map((tec) => (
              <option key={tec._id} value={tec._id}>
                {tec.nombre}
              </option>
            ))}
          </select>
        </div>
      )}

      {modo === "editar" && (
        <>
          <div className="form-group">
            <label className="form-group__label">Diagnostico</label>
            <textarea
              className="form-group__textarea"
              name="diagnostico"
              value={form.diagnostico}
              onChange={handleChange}
              rows={2}
            />
          </div>
          <div className="form-group">
            <label className="form-group__label">Solucion</label>
            <textarea
              className="form-group__textarea"
              name="solucion"
              value={form.solucion}
              onChange={handleChange}
              rows={2}
            />
          </div>
          <div className="form-group">
            <label className="form-group__label">Observaciones</label>
            <textarea
              className="form-group__textarea"
              name="observaciones"
              value={form.observaciones}
              onChange={handleChange}
              rows={2}
            />
          </div>
        </>
      )}

      <div className="form__actions">
        <button type="button" className="btn btn--secondary" onClick={() => navigate(-1)}>
          Cancelar
        </button>
        <button type="submit" className="btn btn--primary" disabled={guardando}>
          {guardando ? "Guardando..." : textoBoton}
        </button>
      </div>
    </form>
  );
};

export default IncidentForm;
