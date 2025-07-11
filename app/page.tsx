// app/page.tsx dosyasının YENİ ve TAM HALİ

import { Suspense } from 'react';
import HomePageClient from './HomePageClient'; // Yeni oluşturduğumuz bileşeni import ediyoruz

export default function Page() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <HomePageClient />
    </Suspense>
  );
}