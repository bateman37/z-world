/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // El snapshot de `SimulationStateV2` de un pueblo generado (S2) ronda
    // ~1.2 MB en JSON, por encima del límite por defecto de 1 MB de las
    // Server Actions (S3 lo descubrió: el guardado fallaba en silencio
    // hacia "Error al guardar" sin este ajuste). 10 MB deja margen real
    // para semillas más grandes y para los subhitos futuros que añaden más
    // colecciones al estado (trabajos, objetos, etc.).
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  transpilePackages: [
    "@z-world/contracts",
    "@z-world/catalogs",
    "@z-world/simulation-core",
    "@z-world/application",
  ],
  webpack: (config) => {
    // Los paquetes del monorepo se consumen como fuente TypeScript, no
    // como dist/ compilado, e importan entre sí con extensión `.js`
    // (requisito de ESM/moduleResolution "Bundler"). webpack necesita esta
    // alternativa explícita para resolver esas rutas a los `.ts` reales.
    config.resolve.extensionAlias = {
      ...(config.resolve.extensionAlias ?? {}),
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
