'use client'

import { ReactNode } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { useAuth } from '@/context/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

function AdminHeader() {
  const { session } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const supabase = createClientComponentClient();
      await supabase.auth.signOut();
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="bg-white shadow">
      {/* --- NİHAİ YERLEŞİM DÜZENİ --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        {/* Geniş ekran için 3'lü yapı */}
        <div className="hidden sm:flex items-center justify-between">
          {/* Sol Taraf: Oturum Bilgisi */}
          <div className="w-1/3">
            {session && (
              <span className="text-xs text-gray-500">
                Logged in as {session.user.email}
              </span>
            )}
          </div>

          {/* Orta: Başlık */}
          <div className="w-1/3 text-center">
            <Link href="/admin">
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Panel
              </h1>
            </Link>
          </div>

          {/* Sağ Taraf: Logout Butonu */}
          <div className="w-1/3 text-right">
            {session && (
              <button
                onClick={handleLogout}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Mobil için 2'li yapı */}
        <div className="sm:hidden flex flex-col items-center gap-3">
            {/* Üst Satır: Başlık */}
            <div className="text-center">
                <Link href="/admin">
                <h1 className="text-2xl font-bold text-gray-900">
                    Admin Panel
                </h1>
                </Link>
            </div>

            {/* Alt Satır: Oturum Bilgisi ve Logout */}
            <div className="w-full flex items-center justify-between">
                {session && (
                    <>
                        <span className="text-xs text-gray-500">
                            Logged in as {session.user.email}
                        </span>
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                            Logout
                        </button>
                    </>
                )}
            </div>
        </div>
      </div>
    </header>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        <AdminHeader />
        <main>
          {children}
        </main>
      </div>
    </AuthProvider>
  );
}