import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Loading from "../../components/Loading/Loading";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { userService } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";


const UsersEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario: usuarioActual, actualizarUsuario } = useAuth();

  const [form, setForm] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    const cargarUsuario = async () => {
      try {
        const usuarios = await userService.listar();
        const encontrado = usuarios.find((u) => u._id === id);
        if (!encontrado) {
          setError("Usuario no encontrado");
          return;
        }
        setForm({
          nombre: encontrado.nombre,
          email: encontrado.email,
          rol: encontrado.rol,
          activo: encontrado.activo,
          password: "",
        });
      } catch (err) {
        setError(err.response?.data?.mensaje || "No se pudo cargar el usuario");
      } finally {
        setCargando(false);
      }
    };
    cargarUsuario();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.nombre || !form.email) {
      setError("Nombre y email son obligatorios");
      return;
    }
    if (form.password && form.password.length < 6) {
      setError("La nueva contrasena debe tener al menos 6 caracteres");
      return;
    }

    setGuardando(true);
    try {
      const datosEnviar = {
        nombre: form.nombre,
        email: form.email,
        rol: form.rol,
        activo: form.activo,
      };
      if (form.password) datosEnviar.password = form.password;

      const usuarioActualizado = await userService.actualizar(id, datosEnviar);

      // Si el admin edito su propia cuenta, refrescamos tambien la sesion actual
      if (usuarioActual?._id === id) {
        actualizarUsuario(usuarioActualizado);
      }

      navigate("/users");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo actualizar el usuario");
      setGuardando(false);
    }
  };

  const esUsuarioActual = usuarioActual?._id === id;

  return (
    <Layout>
      <div className="page">
        <h1 className="page__title">Editar usuario</h1>

        {cargando && <Loading />}
        <ErrorMessage mensaje={error} />

        {form && (
          <div className="panel panel--narrow">
            <form className="form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-group__label">Nombre completo *</label>
                <input
                  className="form-group__input"
                  name="nombre"
                  value={form.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-group__label">Correo electronico *</label>
                <input
                  className="form-group__input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-group__label">Nueva contrasena</label>
                <input
                  className="form-group__input"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Dejar en blanco para no cambiarla"
                />
              </div>

              <div className="form-group">
                <label className="form-group__label">Rol</label>
                <select className="form-group__input" name="rol" value={form.rol} onChange={handleChange}>
                  <option value="TECHNICIAN">Tecnico</option>
                  <option value="EMPLOYEE">Empleado de oficina</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-group__label" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input
                    type="checkbox"
                    name="activo"
                    checked={form.activo}
                    onChange={handleChange}
                    disabled={esUsuarioActual}
                  />
                  Cuenta habilitada
                </label>
                {esUsuarioActual && (
                  <span style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                    No puedes deshabilitar tu propia cuenta
                  </span>
                )}
              </div>

              <div className="form__actions">
                <button type="button" className="btn btn--secondary" onClick={() => navigate("/users")}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default UsersEdit;
