/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // YENİ, MODERN RENK PALETİ
        background: 'hsl(30, 20%, 98%)',      // Ana Arkaplan: Sıcak, kırık beyaz
        surface: 'hsl(30, 20%, 95%)',       // Kart Arkaplanı: Biraz daha koyu, sıcak gri
        primary: 'hsl(30, 10%, 20%)',       // Ana Metin: Koyu, kömür rengi
        secondary: 'hsl(30, 8%, 45%)',      // İkincil Metin: Daha yumuşak gri/kahve
        accent: 'hsl(25, 80%, 55%)',        // Vurgu Rengi: Canlı, sıcak tarçın/turuncu

        // Karanlık Mod için Renkler
        'dark-background': 'hsl(30, 10%, 12%)', // Koyu Arkaplan: Çok koyu, sıcak gri
        'dark-surface': 'hsl(30, 10%, 17%)',  // Koyu Kart: Biraz daha açık, sıcak gri
        'dark-primary': 'hsl(30, 20%, 95%)',   // Koyu Ana Metin: Kırık beyaz
        'dark-secondary': 'hsl(30, 8%, 65%)', // Koyu İkincil Metin: Yumuşak gri
        'dark-accent': 'hsl(25, 85%, 65%)',   // Koyu Vurgu: Daha parlak tarçın/turuncu
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-playfair)'],
      },
    },
  },
  plugins: [],
};