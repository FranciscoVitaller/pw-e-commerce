/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fija la raíz del workspace en este directorio: el repo tiene un
  // package-lock.json extra en el nivel superior que hace que Turbopack
  // infiera mal la raíz y no encuentre .env.local sin esto.
  turbopack: {
    root: import.meta.dirname,
  },
};

export default nextConfig;
