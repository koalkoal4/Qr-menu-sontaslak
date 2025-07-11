// app/menu/page.tsx dosyasının YENİ ve TAM HALİ

import { Suspense } from 'react';
import MenuPageClient from './MenuPageClient'; // Yeni oluşturduğumuz bileşeni import ediyoruz

export default function Page() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <MenuPageClient />
    </Suspense>
  );
}