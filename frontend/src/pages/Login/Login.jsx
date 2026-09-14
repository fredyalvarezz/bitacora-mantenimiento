import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import { rutaInicioPorRol } from "../../utils/constants";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCargando(true);

    try {
      const usuarioLogueado = await login(email, password);
      navigate(rutaInicioPorRol(usuarioLogueado.rol));
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo iniciar sesion");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login">
      <form className="login__form" onSubmit={handleSubmit}>
        <h1 className="login__title">Bitacora de Mantenimiento</h1>
        <p className="login__subtitle">Inicia sesion para continuar</p>

        <ErrorMessage mensaje={error} />

        <div className="form-group">
          <label className="form-group__label" htmlFor="email">
            Correo electronico
          </label>
          <input
            id="email"
            type="email"
            className="form-group__input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-group__label" htmlFor="password">
            Contrasena
          </label>
          <input
            id="password"
            type="password"
            className="form-group__input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="btn btn--primary btn--full" disabled={cargando}>
          {cargando ? "Ingresando..." : "Ingresar"}
        </button>

        <p className="login__hint">
          Usuarios demo: admin@demo.com / admin123 (Administrador)
          <br />
          juan@demo.com / tecnico123 (Tecnico)
          <br />
          carlos@demo.com / empleado123 (Empleado de oficina)
        </p>
      </form>
    </div>
  );
};

export default Login;
