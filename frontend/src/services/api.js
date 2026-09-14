import axios from "axios";


const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// en cada peticion, si hay un token guardado, lo mandamos en el header Authorization
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

//  si el token expiro o es invalido (401), cerramos sesion
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("usuario");
      // Solo redirigimos si no estamos ya en login, para evitar loops
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/bitacora-mantenimiento/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
