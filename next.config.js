/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cnqdjidkqvuicrqbxqir.supabase.co', // Sizin projenizin adresi
        port: '',
        pathname: '/storage/v1/object/public/**', // Storage bucket'larınızdaki tüm dosyalara izin ver
      },
    ],
  },
};

module.exports = nextConfig;