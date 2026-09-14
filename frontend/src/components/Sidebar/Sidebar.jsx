import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Sidebar.css";

// Menu lateral de navegacion. Algunas opciones solo se muestran segun el rol.
const Sidebar = () => {
  const { esAdmin, esEmpleado } = useAuth();

  const linkClase = ({ isActive }) =>
    isActive ? "sidebar__link sidebar__link--active" : "sidebar__link";

  return (
    <nav className="sidebar">
      {/* El EMPLOYEE no tiene Dashboard: su pantalla principal son sus propios tickets */}
      {!esEmpleado && (
        <NavLink to="/dashboard" className={linkClase}>
          Dashboard
        </NavLink>
      )}
      <NavLink to="/equipment" className={linkClase}>
        {esEmpleado ? "Mis equipos" : "Equipos"}
      </NavLink>
      <NavLink to="/incidents" className={linkClase}>
        {esEmpleado ? "Mis tickets" : "Incidencias"}
      </NavLink>
      {esAdmin && (
        <NavLink to="/users" className={linkClase}>
          Usuarios
        </NavLink>
      )}
      <NavLink to="/profile" className={linkClase}>
        Mi perfil
      </NavLink>
    </nav>
  );
};

export default Sidebar;
