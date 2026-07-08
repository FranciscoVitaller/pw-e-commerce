import path from "node:path";
import { fileURLToPath } from "node:url";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fija la raíz del workspace en este directorio para evitar que Turbopack
  // infiera mal la raíz cuando existe un package-lock.json en un nivel superior.
  turbopack: {
    root: path.dirname(fileURLToPath(import.meta.url)),
  },
};

export default nextConfig;
