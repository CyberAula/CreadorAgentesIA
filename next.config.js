/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    webpack: (config) => {
        config.resolve.fallback = { fs: false,path:false };

        return config;
    },
    experimental: {
        instrumentationHook: true,
    },
}

module.exports = nextConfig
