import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// "base" debe coincidir con el nombre del repositorio de GitHub para que
// GitHub Pages sirva correctamente los archivos (ej: https://usuario.github.io/nombre-repo/)
export default defineConfig({
  plugins: [react()],
  base: "/bitacora-mantenimiento/",
});
