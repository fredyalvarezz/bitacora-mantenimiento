import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import Loading from "./components/Loading/Loading";
import { useAuth } from "./context/AuthContext";
import { rutaInicioPorRol } from "./utils/constants";

import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Equipment from "./pages/Equipment/Equipment";
import EquipmentNew from "./pages/EquipmentNew/EquipmentNew";
import EquipmentDetail from "./pages/EquipmentDetail/EquipmentDetail";
import EquipmentEdit from "./pages/EquipmentEdit/EquipmentEdit";
import Incidents from "./pages/Incidents/Incidents";
import IncidentNew from "./pages/IncidentNew/IncidentNew";
import IncidentDetail from "./pages/IncidentDetail/IncidentDetail";
import IncidentEdit from "./pages/IncidentEdit/IncidentEdit";
import Profile from "./pages/Profile/Profile";
import Users from "./pages/Users/Users";
import UsersNew from "./pages/UsersNew/UsersNew";
import UsersEdit from "./pages/UsersEdit/UsersEdit";

import "./styles/shared.css";


const InicioRedirect = () => {
  const { usuario, cargando } = useAuth();
  if (cargando) return <Loading />;
  if (!usuario) return <Navigate to="/login" replace />;
  return <Navigate to={rutaInicioPorRol(usuario.rol)} replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<InicioRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute roles={["ADMIN", "TECHNICIAN"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/equipment"
        element={
          <ProtectedRoute>
            <Equipment />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipment/new"
        element={
          <ProtectedRoute soloAdmin>
            <EquipmentNew />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipment/:id"
        element={
          <ProtectedRoute>
            <EquipmentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/equipment/:id/edit"
        element={
          <ProtectedRoute soloAdmin>
            <EquipmentEdit />
          </ProtectedRoute>
        }
      />

      <Route
        path="/incidents"
        element={
          <ProtectedRoute>
            <Incidents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incidents/new"
        element={
          <ProtectedRoute roles={["ADMIN", "EMPLOYEE"]}>
            <IncidentNew />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incidents/:id"
        element={
          <ProtectedRoute>
            <IncidentDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/incidents/:id/edit"
        element={
          <ProtectedRoute roles={["ADMIN", "TECHNICIAN"]}>
            <IncidentEdit />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute soloAdmin>
            <Users />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/new"
        element={
          <ProtectedRoute soloAdmin>
            <UsersNew />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users/:id/edit"
        element={
          <ProtectedRoute soloAdmin>
            <UsersEdit />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<InicioRedirect />} />
    </Routes>
  );
}

export default App;
