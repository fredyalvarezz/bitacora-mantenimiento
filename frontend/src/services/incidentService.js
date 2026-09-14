import api from "./api";
import { localIncidentService } from "./local/localIncidentService";

const USAR_API = import.meta.env.VITE_DATA_MODE === "api";

const incidentServiceApi = {
  listar: async (filtros = {}) => {
    const { data } = await api.get("/incidents", { params: filtros });
    return data;
  },

  obtenerPorId: async (id) => {
    const { data } = await api.get(`/incidents/${id}`);
    return data;
  },

  crear: async (incidencia) => {
    const { data } = await api.post("/incidents", incidencia);
    return data;
  },

  actualizar: async (id, incidencia) => {
    const { data } = await api.put(`/incidents/${id}`, incidencia);
    return data;
  },

  eliminar: async (id) => {
    const { data } = await api.delete(`/incidents/${id}`);
    return data;
  },

  obtenerEstadisticas: async () => {
    const { data } = await api.get("/incidents/stats/dashboard");
    return data;
  },
};

export const incidentService = USAR_API ? incidentServiceApi : localIncidentService;
