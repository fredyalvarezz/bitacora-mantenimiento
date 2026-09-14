import api from "./api";
import { localUserService } from "./local/localUserService";


const USAR_API = import.meta.env.VITE_DATA_MODE === "api";

const userServiceApi = {
  listar: async () => {
    const { data } = await api.get("/users");
    return data;
  },

  crear: async (usuario) => {
    const { data } = await api.post("/users", usuario);
    return data;
  },

  actualizar: async (id, datos) => {
    const { data } = await api.put(`/users/${id}`, datos);
    return data;
  },
};

export const userService = USAR_API ? userServiceApi : localUserService;
