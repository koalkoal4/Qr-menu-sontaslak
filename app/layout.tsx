// app/layout.tsx

import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

// --- GÜNCELLEME BURADA ---
export const metadata: Metadata = {
  title: 'QR Menu App',
  description: 'Digital menu solution for restaurants',
  // Viewport ayarını güncelliyoruz. 'viewport-fit=cover' en önemli kısımdır.
  viewport: {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
  },
};
// --- GÜNCELLEMENİN SONU ---

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}