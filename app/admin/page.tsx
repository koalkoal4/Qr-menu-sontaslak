// app/admin/page.tsx

import { Suspense } from 'react';
import AdminDashboard from '@/components/AdminDashboard';

export default function AdminPage() {
  return (
    // Suspense, AdminDashboard'un içindeki client-side hook'ların
    // sayfanın geri kalanını bloklamadan yüklenmesini sağlar.
    <Suspense fallback={<div>Loading Page...</div>}>
      <AdminDashboard />
    </Suspense>
  );
}