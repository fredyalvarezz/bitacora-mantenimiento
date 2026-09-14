import api from "./api";
import { localAuthService } from "./local/localAuthService";


const USAR_API = import.meta.env.VITE_DATA_MODE === "api";

const authServiceApi = {
  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    return data;
  },

  register: async (usuario) => {
    const { data } = await api.post("/auth/register", usuario);
    return data;
  },

  obtenerPerfil: async () => {
    const { data } = await api.get("/auth/me");
    return data;
  },

  actualizarPerfil: async (datos) => {
    const { data } = await api.put("/auth/me", datos);
    return data;
  },
};

export const authService = USAR_API ? authServiceApi : localAuthService;
