import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { traducirRol } from "../../utils/constants";
import "./Navbar.css";

const Navbar = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar__brand">Bitacora de Mantenimiento</div>
      <div className="navbar__user">
        <span className="navbar__username">
          {usuario?.nombre} <span className="navbar__role">({traducirRol(usuario?.rol)})</span>        </span>
        <button className="btn btn--secondary btn--small" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </header>
  );
};

export default Navbar;
