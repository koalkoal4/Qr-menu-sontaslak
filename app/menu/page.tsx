// app/menu/page.tsx

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Category, Product } from '@/lib/types';
import MenuItem from '@/components/MenuItem';
import { Skeleton } from '@/components/ui/skeleton';
import { useInView } from 'react-intersection-observer';

// --- BİLEŞENLER VE TİPLERİ ---

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
      {/* "dark:" ön eki kaldırıldı. */}
      <h2 className="text-2xl font-bold py-4 bg-background">
        {category.name}
      </h2>
      {/* "dark:" ön eki kaldırıldı. */}
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
    // "dark:" ön eki kaldırıldı.
    <nav className="sticky top-0 z-10 bg-background py-2 shadow-sm">
      <div className="flex space-x-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            ref={activeCategoryId === cat.id ? activeRef : null}
            onClick={() => onCategoryClick(cat.id)}
            // "dark:" ön eki kaldırıldı.
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

// --- ANA SAYFA BİLEŞENİ ---

export default function MenuPage() {
  const supabase = createClientComponentClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const [catRes, prodRes] = await Promise.all([
        supabase.from('categories').select('*').eq('is_available', true).order('display_order', { ascending: true }),
        supabase.from('products').select('*').eq('is_available', true).order('display_order', { ascending: true })
      ]);

      if (catRes.error || prodRes.error) {
        console.error("Data fetching error:", catRes.error || prodRes.error);
        setIsLoading(false);
        return;
      }

      const fetchedCategories = catRes.data || [];
      setCategories(fetchedCategories);
      setProducts(prodRes.data || []);
      
      if (fetchedCategories.length > 0) {
        const hash = window.location.hash.replace('#category-', '');
        const initialCat = fetchedCategories.find(c => c.id === hash) || fetchedCategories[0];
        
        if (initialCat) {
          setActiveCategoryId(initialCat.id);
          setTimeout(() => {
            const element = document.getElementById(`category-${initialCat.id}`);
            if (element) {
              element.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
          }, 100);
        }
      }
      setIsLoading(false);
    };

    fetchData();
  }, [supabase]);

  const productsByCategory = (categoryId: string) => {
    return products.filter(p => p.category_id === categoryId);
  };

  if (isLoading) {
    return (
        <div className="p-4">
            {/* "dark:" ön eki kaldırıldı. */}
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
  
  if (categories.length === 0) {
      return <div className="min-h-screen flex items-center justify-center text-center">Görüntülenecek aktif kategori veya ürün bulunmuyor.</div>
  }

  return (
    <div>
      <StickyNav 
        categories={categories} 
        activeCategoryId={activeCategoryId} 
        onCategoryClick={handleCategoryClick} 
      />
      <main className="px-4">
        {categories.map(category => (
          <section key={category.id}>
            <CategoryHeader 
              category={category} 
              onVisible={handleVisibleCategory} 
            />
            <div>
              {productsByCategory(category.id).map((product: Product) => (
                <MenuItem key={product.id} product={product} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}