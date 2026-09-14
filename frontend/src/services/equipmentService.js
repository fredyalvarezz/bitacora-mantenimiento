import api from "./api";
import { localEquipmentService } from "./local/localEquipmentService";


const USAR_API = import.meta.env.VITE_DATA_MODE === "api";

const equipmentServiceApi = {
  listar: async (filtros = {}) => {
    const { data } = await api.get("/equipment", { params: filtros });
    return data;
  },

  obtenerPorId: async (id) => {
    const { data } = await api.get(`/equipment/${id}`);
    return data;
  },

  crear: async (equipo) => {
    const { data } = await api.post("/equipment", equipo);
    return data;
  },

  actualizar: async (id, equipo) => {
    const { data } = await api.put(`/equipment/${id}`, equipo);
    return data;
  },

  eliminar: async (id) => {
    const { data } = await api.delete(`/equipment/${id}`);
    return data;
  },

  obtenerHistorial: async (id) => {
    const { data } = await api.get(`/equipment/${id}/history`);
    return data;
  },

  generarMantenimientosPreventivos: async () => {
    const { data } = await api.post("/equipment/generar-mantenimientos-preventivos");
    return data;
  },
};

export const equipmentService = USAR_API ? equipmentServiceApi : localEquipmentService;
