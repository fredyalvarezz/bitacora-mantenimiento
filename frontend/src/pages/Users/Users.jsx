import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Layout from "../../components/Layout/Layout";
import Loading from "../../components/Loading/Loading";
import EmptyState from "../../components/EmptyState/EmptyState";
import ErrorMessage from "../../components/ErrorMessage/ErrorMessage";
import Modal from "../../components/Modal/Modal";
import { userService } from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import { formatearFecha, claseActivo } from "../../utils/constants";
import "./Users.css";

const Users = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [usuarioParaCambiar, setUsuarioParaCambiar] = useState(null);
  const { usuario: usuarioActual } = useAuth();

  const cargarUsuarios = async () => {
    try {
      const data = await userService.listar();
      setUsuarios(data);
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudieron cargar los usuarios");
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleConfirmarCambioEstado = async () => {
    if (!usuarioParaCambiar) return;
    setError("");
    try {
      await userService.actualizar(usuarioParaCambiar._id, {
        activo: !usuarioParaCambiar.activo,
      });
      setUsuarioParaCambiar(null);
      cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.mensaje || "No se pudo cambiar el estado del usuario");
      setUsuarioParaCambiar(null);
    }
  };

  return (
    <Layout>
      <div className="page">
        <div className="page__header">
          <h1 className="page__title">Usuarios</h1>
          <Link to="/users/new" className="btn btn--primary">
            + Nuevo usuario
          </Link>
        </div>

        {cargando && <Loading />}
        <ErrorMessage mensaje={error} />

        {!cargando && !error && usuarios.length === 0 && (
          <EmptyState titulo="No hay usuarios registrados" />
        )}

        {!cargando && usuarios.length > 0 && (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Estado</th>
                  <th>Registrado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u._id}>
                    <td>{u.nombre}</td>
                    <td>{u.email}</td>
                    <td>
                      <span
                        className={`badge ${u.rol === "ADMIN"
                            ? "badge--info"
                            : u.rol === "EMPLOYEE"
                              ? "badge--warning"
                              : "badge--neutral"
                          }`}
                      >
                        {traducirRol(u.rol)}
                      </span>
                    </td>
                    <td>
                      <span className={claseActivo(u.activo)}>
                        {u.activo ? "Habilitado" : "Deshabilitado"}
                      </span>
                    </td>
                    <td>{formatearFecha(u.createdAt)}</td>
                    <td>
                      <div className="table__actions">
                        <Link to={`/users/${u._id}/edit`} className="btn btn--secondary btn--small">
                          Editar
                        </Link>
                        <button
                          className={`btn btn--small ${u.activo ? "btn--danger" : "btn--primary"}`}
                          disabled={u._id === usuarioActual?._id}
                          title={
                            u._id === usuarioActual?._id
                              ? "No puedes deshabilitar tu propia cuenta"
                              : ""
                          }
                          onClick={() => setUsuarioParaCambiar(u)}
                        >
                          {u.activo ? "Deshabilitar" : "Habilitar"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {usuarioParaCambiar && (
          <Modal
            titulo={usuarioParaCambiar.activo ? "Deshabilitar usuario" : "Habilitar usuario"}
            mensaje={
              usuarioParaCambiar.activo
                ? `"${usuarioParaCambiar.nombre}" no podra iniciar sesion hasta que lo vuelvas a habilitar.`
                : `"${usuarioParaCambiar.nombre}" podra volver a iniciar sesion normalmente.`
            }
            onConfirmar={handleConfirmarCambioEstado}
            onCancelar={() => setUsuarioParaCambiar(null)}
            textoConfirmar={usuarioParaCambiar.activo ? "Deshabilitar" : "Habilitar"}
          />
        )}
      </div>
    </Layout>
  );
};

export default Users;
