import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "../Loading/Loading";
import { rutaInicioPorRol } from "../../utils/constants";

// Componente que protege rutas: si no hay usuario autenticado, redirige a /login.

const ProtectedRoute = ({ children, soloAdmin = false, roles = null }) => {
  const { usuario, cargando, esAdmin } = useAuth();

  if (cargando) {
    return <Loading />;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  if (soloAdmin && !esAdmin) {
    return <Navigate to={rutaInicioPorRol(usuario.rol)} replace />;
  }

  if (roles && !roles.includes(usuario.rol)) {
    return <Navigate to={rutaInicioPorRol(usuario.rol)} replace />;
  }

  return children;
};

export default ProtectedRoute;
