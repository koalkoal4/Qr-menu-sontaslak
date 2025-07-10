'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Category, Product, Business } from '@/lib/types';
import MenuItem from '@/components/MenuItem';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';

// --- YARDIMCI BİLEŞENLER (Bu kısımlar değişmeden kalacak) ---

interface CategoryHeaderProps {
  category: Category;
  onVisible: (id: string) => void;
}

function CategoryHeader({ category, onVisible }: CategoryHeaderProps) {
    const { ref } = useInView({
        rootMargin: "-35% 0px -65% 0px",
        threshold: 0,
        onChange: (inView) => {
        if (inView) {
            onVisible(category.id);
        }
        },
    });

    return (
        <div ref={ref} id={`category-${category.id}`} className="scroll-mt-16">
        <h2 className="text-2xl font-bold py-4 bg-background">
            {category.name}
        </h2>
        <hr className="border-surface mb-2"/>
        </div>
    );
}

interface StickyNavProps {
  categories: Category[];
  activeCategoryId: string | null;
  onCategoryClick: (categoryId: string) => void;
}

function StickyNav({ categories, activeCategoryId, onCategoryClick }: StickyNavProps) {
    const activeRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (activeRef.current) {
        activeRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
        }
    }, [activeCategoryId]);

    return (
        <nav className="sticky top-0 z-10 bg-background py-2 shadow-sm">
        <div className="flex space-x-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {categories.map((cat) => (
            <button
                key={cat.id}
                ref={activeCategoryId === cat.id ? activeRef : null}
                onClick={() => onCategoryClick(cat.id)}
                className={`px-4 py-2 text-sm font-semibold rounded-full whitespace-nowrap transition-colors duration-300 ${
                activeCategoryId === cat.id
                    ? 'bg-accent text-white'
                    : 'bg-surface text-secondary'
                }`}
            >
                {cat.name}
            </button>
            ))}
        </div>
        </nav>
    );
}


// --- ANA MENÜ SAYFASI BİLEŞENİ ---

export default function MenuPage() {
  const supabase = createClientComponentClient();
  const [businessData, setBusinessData] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);

  const scrollTimeout = useRef<NodeJS.Timeout>();
  const isClicking = useRef(false);

  const handleVisibleCategory = useCallback((id: string) => {
    if (!isClicking.current) {
      setActiveCategoryId(id);
    }
  }, []);

  const handleCategoryClick = (id: string) => {
    isClicking.current = true;
    setActiveCategoryId(id);
    const element = document.getElementById(`category-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    clearTimeout(scrollTimeout.current);
    scrollTimeout.current = setTimeout(() => {
      isClicking.current = false;
    }, 1000);
  };

  useEffect(() => {
    return () => clearTimeout(scrollTimeout.current);
  }, []);

  // --- DEĞİŞİKLİK 1: VERİ ÇEKME MANTIĞI YENİDEN KULLANILABİLİR BİR FONKSİYONA TAŞINDI ---
  const fetchData = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setIsLoading(true);
    setError(null);
    const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID;

    if (!businessId) {
      setError("Hata: İşletme kimliği (business ID) bulunamadı. Lütfen ayarlarınızı kontrol edin.");
      setIsLoading(false);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('businesses')
      .select(`*, categories (*, products (*))`)
      .eq('id', businessId)
      .eq('categories.is_available', true)
      .eq('categories.products.is_available', true)
      .order('display_order', { foreignTable: 'categories', ascending: true })
      .order('display_order', { foreignTable: 'categories.products', ascending: true })
      .single();

    if (fetchError) {
      console.error("Data fetching error:", fetchError);
      setError("Menü verileri yüklenirken bir hata oluştu.");
    } else {
        setBusinessData(data);
    }
    if (isInitialLoad) setIsLoading(false);
  }, [supabase]);


  // --- DEĞİŞİKLİK 2: MESAJ DİNLEYİCİSİ EKLENDİ ---
  useEffect(() => {
    // İlk yüklemede veriyi çek
    fetchData(true);

    // Yönetim panelinden gelen "refresh" mesajını dinle
    const handleMessage = (event: MessageEvent) => {
        // Güvenlik için mesajın kimden geldiğini kontrol edebilirsiniz,
        // ama şimdilik '*' ile basit tutuyoruz.
        if (event.data === 'refresh-preview') {
            console.log('Admin panelinden yenileme komutu alındı, veriler güncelleniyor...');
            fetchData(false); // Veriyi yeniden çek (sayfayı yenilemeden)
        }
    };

    window.addEventListener('message', handleMessage);

    // Bileşen kaldırıldığında dinleyiciyi temizle
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [fetchData]); // fetchData'yı bağımlılıklara ekliyoruz

  if (isLoading) {
    return (
        <div className="p-4">
            <div className="sticky top-0 flex space-x-3 p-2 bg-background">
                {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-10 w-24 rounded-full" />)}
            </div>
            <Skeleton className="h-8 w-1/2 my-4" />
            {Array.from({length: 3}).map((_, i) => (
                <div key={i} className="flex gap-4 py-4">
                    <Skeleton className="w-28 h-28 rounded-md" />
                    <div className="w-full space-y-2">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-center text-red-500 p-4">{error}</div>
  }
  if (!businessData || !businessData.categories || businessData.categories.length === 0) {
      return <div className="min-h-screen flex items-center justify-center text-center p-4">Görüntülenecek aktif kategori veya ürün bulunmuyor.</div>
  }

  return (
    <div>
      <StickyNav 
        categories={businessData.categories} 
        activeCategoryId={activeCategoryId} 
        onCategoryClick={handleCategoryClick} 
      />
      <main className="px-4">
        {businessData.categories.map(category => (
          <section key={category.id}>
            <CategoryHeader 
              category={category} 
              onVisible={handleVisibleCategory} 
            />
            <div>
              {category.products.map((product: Product) => (
                <MenuItem key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}