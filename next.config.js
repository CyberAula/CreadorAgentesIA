/** @type {import('next').NextConfig} */
const nextConfig = {
    basePath: "/agentes",
    reactStrictMode: false,
    webpack: (config) => {
        config.resolve.fallback = { fs: false,path:false };

        return config;
    },
}

module.exports = nextConfig
