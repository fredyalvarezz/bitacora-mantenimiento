import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

// Context API se usa aqui porque el usuario autenticado y su token
// se necesitan en muchas partes de la app (Navbar, Sidebar, rutas protegidas, formularios).
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al cargar la aplicacion, revisamos si ya habia un usuario guardado en localStorage
  useEffect(() => {
    const inicializar = async () => {
      const token = localStorage.getItem("token");
      const usuarioGuardado = localStorage.getItem("usuario");

      if (token && usuarioGuardado) {
        try {
          setUsuario(JSON.parse(usuarioGuardado));
        } catch {
          localStorage.removeItem("usuario");
        }
      }
      setCargando(false);
    };
    inicializar();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data.usuario;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    setUsuario(null);
  };

  // Se usa despues de editar el perfil propio, para reflejar los cambios
  // sin necesidad de cerrar sesion y volver a entrar
  const actualizarUsuario = (usuarioActualizado) => {
    localStorage.setItem("usuario", JSON.stringify(usuarioActualizado));
    setUsuario(usuarioActualizado);
  };

  const esAdmin = usuario?.rol === "ADMIN";
  const esTecnico = usuario?.rol === "TECHNICIAN";
  const esEmpleado = usuario?.rol === "EMPLOYEE";

  return (
    <AuthContext.Provider
      value={{ usuario, login, logout, actualizarUsuario, cargando, esAdmin, esTecnico, esEmpleado }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir el contexto facilmente: const { usuario, login } = useAuth();
export const useAuth = () => useContext(AuthContext);
