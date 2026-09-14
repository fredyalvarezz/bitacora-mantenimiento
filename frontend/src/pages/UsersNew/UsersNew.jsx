import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { userService } from "../../services/userService";


const UsersNew = () => {
  const [form, setForm] = useState({ nombre: "", email: "", password: "", rol: "TECHNICIAN" });
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

    if (!form.nombre || !form.email || !form.password) {
      setError("Todos los campos son obligatorios");
      return;
    }
    if (form.password.length < 6) {
      setError("La contrasena debe tener al menos 6 caracteres");
      return;
    }

    setGuardando(true);
    try {
      await userService.crear(form);
      navigate("/users");
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo crear el usuario");
      setGuardando(false);
    }
  };

  return (
    <Layout>
      <div className="page">
        <h1 className="page__title">Nuevo usuario</h1>
        <div className="panel panel--narrow">
          <form className="form" onSubmit={handleSubmit}>
            <ErrorMessage mensaje={error} />

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
              <label className="form-group__label">Contrasena *</label>
              <input
                className="form-group__input"
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
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

            <div className="form__actions">
              <button type="button" className="btn btn--secondary" onClick={() => navigate(-1)}>
                Cancelar
              </button>
              <button type="submit" className="btn btn--primary" disabled={guardando}>
                {guardando ? "Guardando..." : "Crear usuario"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default UsersNew;
