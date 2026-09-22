/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
