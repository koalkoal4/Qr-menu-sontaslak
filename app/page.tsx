'use client';

// Gerekli importlara useCallback ekleniyor
import { useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Business, Category } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// --- YARDIMCI BİLEŞENLER (Bu kısımlara dokunmuyoruz, aynı kalacaklar) ---

function MenuHeader({ business, isPreview }: { business: Business | null, isPreview: boolean }) {
    if (!business) {
        return <Skeleton className="w-full h-48 mb-6" />;
    }
    const coverImageUrl = business.cover_image_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cover-images/${business.cover_image_url}` : null;
    if (!coverImageUrl) return null;
    return (
        <div className="relative mb-6">
            <div className="w-full h-80 overflow-hidden">
                <Image src={coverImageUrl} alt={`${business.name} Kapak Fotoğrafı`} fill className="object-cover unoptimized={isPreview}"/>
            </div>
            {business.instagram_url && (
                <a href={business.instagram_url} target="_blank" rel="noopener noreferrer" className="absolute top-3 right-3 w-12 h-12 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/70 transition-colors">
                    {/* SVG ikonu burada */}
                </a>
            )}
        </div>
    );
}
const positionClasses: { [key: string]: string } = { 'bottom-left': 'items-end justify-start text-left', 'bottom-center': 'items-end justify-center text-center', 'bottom-right': 'items-end justify-end text-right', 'center': 'items-center justify-center text-center', 'top-left': 'items-start justify-start text-left', 'top-center': 'items-start justify-center text-center', 'top-right': 'items-start justify-end text-right', };
function CategoryCard({ category, isPreview }: { category: Category, isPreview: boolean }) {
  const imageUrl = category.image_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${category.image_url}` : null;
  const textPositionClass = positionClasses[category.name_position] || 'items-end justify-start text-left';
  return (
    <Link href={`/menu#category-${category.id}`} className="block group">
      <div className="relative overflow-hidden rounded-lg shadow-lg bg-surface">
        <div className="w-full aspect-square">
          {imageUrl && ( <Image alt={category.name} src={imageUrl} width={400} height={400} className="w-full h-full object-cover transform transition-transform duration-300 group-hover:scale-110" unoptimized={isPreview} /> )}
        </div>
        <div className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex p-4 ${textPositionClass}`}>
          <h2 className="text-xl font-bold text-white">{category.name}</h2>
        </div>
      </div>
    </Link>
  );
}


// --- ANA SAYFA BİLEŞENİ (Değişikliklerin yapıldığı yer) ---

export default function HomePage() {
  const supabase = createClientComponentClient();
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  // 1. ADIM: Veri çekme mantığını tekrar çağrılabilir bir fonksiyona taşıdık.
  const fetchBusinessData = useCallback(async () => {
    const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID;
    if (!businessId) {
      setError("İşletme kimliği bulunamadı.");
      setIsLoading(false);
      return;
    }
    // Veri çekilirken tekrar loading state'ini aktif etmiyoruz ki ekran yanıp sönmesin
    const { data: businessData, error: fetchError } = await supabase
      .from('businesses').select(`*, categories ( *, business_id )`)
      .eq('id', businessId).eq('categories.is_available', true)
      .order('display_order', { foreignTable: 'categories', ascending: true }).single();
    if (fetchError) {
      console.error("Error fetching business data:", fetchError);
      setError("İşletme verileri yüklenirken bir hata oluştu.");
      setBusiness(null);
    } else {
      setBusiness(businessData);
    }
    setIsLoading(false);
  }, [supabase]);

  // 2. ADIM: Sayfanın hem ilk veriyi çekmesini hem de mesajları dinlemesini sağladık.
  useEffect(() => {
    // Sayfa ilk yüklendiğinde veriyi çek
    fetchBusinessData();

    // Admin panelinden gelen "refresh" mesajını dinle
    const handleMessage = (event: MessageEvent) => {
        if (event.data === 'refresh-preview') {
            fetchBusinessData(); // Veriyi yeniden çekerek ekranı güncelle
        }
    };
    window.addEventListener('message', handleMessage);

    // Sayfadan çıkıldığında dinleyiciyi kaldır
    return () => {
        window.removeEventListener('message', handleMessage);
    };
  }, [fetchBusinessData]);


  // Bu kısımların hepsi aynı kalıyor
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-center text-red-500 p-4">{error}</div>
  }
  return (
    <div>
      <MenuHeader business={business} isPreview={isPreview} />
      <div className="p-4">
        <header className="text-center mb-8">
            <h1 className="text-4xl font-extrabold tracking-tight">{isLoading ? <Skeleton className="h-10 w-1/2 mx-auto" /> : business?.name || 'Menümüz'}</h1>
            <p className="text-secondary mt-2">Lezzetlerimizi keşfetmek için bir kategori seçin</p>
        </header>
        <div className="grid grid-cols-2 gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => ( <Skeleton key={i} className="w-full aspect-square rounded-lg" /> ))
            ) : (
              business?.categories?.map(category => ( <CategoryCard key={category.id} category={category} isPreview={isPreview} /> ))
            )}
        </div>
        {!isLoading && (!business || !business.categories || business.categories.length === 0) && (
            <div className="text-center py-10 col-span-2">
                <p className="text-secondary">Bu işletmeye ait gösterilecek aktif kategori bulunamadı.</p>
            </div>
        )}
      </div>
    </div>
  );
}