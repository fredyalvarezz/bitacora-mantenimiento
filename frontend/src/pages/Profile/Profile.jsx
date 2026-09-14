import { useState } from "react";
import Layout from "../../components/Layout/Layout";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { useAuth } from "../../context/AuthContext";
import { authService } from "../../services/authService";
import { formatearFecha, traducirRol } from "../../utils/constants";

const Profile = () => {
  const { usuario, actualizarUsuario, esAdmin } = useAuth();
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({
    nombre: usuario?.nombre || "",
    email: usuario?.email || "",
    password: "",
    confirmarPassword: "",
  });
  const [error, setError] = useState("");
  const [exito, setExito] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const iniciarEdicion = () => {
    setForm({ nombre: usuario.nombre, email: usuario.email, password: "", confirmarPassword: "" });
    setError("");
    setExito("");
    setEditando(true);
  };

  const cancelarEdicion = () => {
    setEditando(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setExito("");

    if (!form.nombre || !form.email) {
      setError("Nombre y email son obligatorios");
      return;
    }
    if (form.password && form.password.length < 6) {
      setError("La nueva contrasena debe tener al menos 6 caracteres");
      return;
    }
    if (form.password && form.password !== form.confirmarPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }

    setGuardando(true);
    try {
      const datosEnviar = { nombre: form.nombre, email: form.email };
      if (form.password) datosEnviar.password = form.password;

      const usuarioActualizado = await authService.actualizarPerfil(datosEnviar);
      actualizarUsuario(usuarioActualizado);
      setExito("Perfil actualizado correctamente");
      setEditando(false);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo actualizar el perfil");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Layout>
      <div className="page">
        <div className="page__header">
          <h1 className="page__title">Mi perfil</h1>
          {esAdmin && !editando && (
            <button className="btn btn--secondary" onClick={iniciarEdicion}>
              Editar perfil
            </button>
          )}
        </div>

        <div className="panel panel--narrow">
          <ErrorMessage mensaje={error} />
          {exito && !editando && <p className="success-message">{exito}</p>}

          {!editando ? (
            <>
              <div className="detail-grid">
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Nombre</span>
                  <span className="detail-grid__value">{usuario?.nombre}</span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Correo electronico</span>
                  <span className="detail-grid__value">{usuario?.email}</span>
                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Rol</span>
                  <span className="detail-grid__value">{traducirRol(usuario?.rol)}</span>                </div>
                <div className="detail-grid__item">
                  <span className="detail-grid__label">Cuenta creada</span>
                  <span className="detail-grid__value">{formatearFecha(usuario?.createdAt)}</span>
                </div>
              </div>
              {!esAdmin && (
                <p className="panel__empty" style={{ marginTop: 16 }}>
                  Solo un administrador puede editar tu nombre, correo o contraseña.
                </p>
              )}
            </>
          ) : (
            <form className="form" onSubmit={handleSubmit}>
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
              {form.password && (
                <div className="form-group">
                  <label className="form-group__label">Confirmar nueva contrasena</label>
                  <input
                    className="form-group__input"
                    type="password"
                    name="confirmarPassword"
                    value={form.confirmarPassword}
                    onChange={handleChange}
                  />
                </div>
              )}
              <div className="form__actions">
                <button type="button" className="btn btn--secondary" onClick={cancelarEdicion}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn--primary" disabled={guardando}>
                  {guardando ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
