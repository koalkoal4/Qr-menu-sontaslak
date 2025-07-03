'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const supabase = createClientComponentClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { session, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && session) {
      router.push('/admin');
    }
  }, [session, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Formun varsayılan davranışını engelle
    setError(null);

    // --- YENİ EKLENEN MANUEL DOĞRULAMA ---
    // Alanların boş olup olmadığını kendimiz kontrol ediyoruz.
    if (!email || email.trim() === '') {
      setError('Lütfen e-posta adresinizi girin.');
      return; // Fonksiyonu burada durdur
    }
    if (!password || password.trim() === '') {
      setError('Lütfen şifrenizi girin.');
      return; // Fonksiyonu burada durdur
    }
    // --- DOĞRULAMA SONU ---

    setLoading(true);
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (signInError) {
        throw signInError;
      }
      
      if (!data.session) {
        throw new Error('Oturum bilgisi alınamadı. Lütfen Supabase ayarlarınızı kontrol edin.');
      }
      
      // Vercel'de daha güvenilir çalışması için sayfayı tamamen yenileyerek yönlendirme yapıyoruz.
      window.location.href = '/admin';
      
    } catch (err: any) {
      console.error('Login error details:', err);
      setError(err.message || 'Geçersiz e-posta veya şifre.');
    } finally {
      // Hata olsa da olmasa da "Yükleniyor..." durumunu kapat
      setLoading(false);
    }
  };

  if (isLoading || session) {
    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-xl">Yönlendiriliyor...</div>
        </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                // required özelliği kaldırıldı
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                // required özelliği kaldırıldı
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center pt-2">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 mt-6"
            >
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}