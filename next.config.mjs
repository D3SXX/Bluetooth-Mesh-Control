/** @type {import('next').NextConfig} */
const nextConfig = {
        logging: false,
        allowedDevOrigins: ['*', process.env.NEXT_PUBLIC_SERVER_IP],
};



export default nextConfig;
