// app/HomePageClient.tsx dosyasının YENİ ve TAM HALİ

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Business, Category } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

// --- YARDIMCI BİLEŞENLER (Bu kısım değişmeden kalacak) ---

function MenuHeader({ business, isPreview }: { business: Business | null, isPreview: boolean }) {
    if (!business) {
        return <Skeleton className="w-full h-48 mb-6" />;
    }
    const coverImageUrl = business.cover_image_url ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cover-images/${business.cover_image_url}` : null;
    if (!coverImageUrl) {
        return null;
    }
    return (
        <div className="relative mb-6">
            <div className="w-full h-80 overflow-hidden">
                <Image src={coverImageUrl} alt={`${business.name} Kapak Fotoğrafı`} fill className="object-cover" unoptimized={isPreview}/>
            </div>
            {business.instagram_url && (
                <a href={business.instagram_url} target="_blank" rel="noopener noreferrer" className="absolute top-3 right-3 w-12 h-12 flex items-center justify-center bg-black/50 rounded-full hover:bg-black/70 transition-colors">
                    <svg width="40" height="40" viewBox="-19.5036 -32.49725 169.0312 194.9835" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink">
                        <defs>
                            <radialGradient id="c" cx="158.429" cy="578.088" r="65" gradientUnits="userSpaceOnUse" gradientTransform="matrix(0 -1.98198 1.8439 0 -1031.399 454.004)" fy="578.088" fx="158.429" xlinkHref="#a" />
                            <radialGradient id="d" cx="147.694" cy="473.455" r="65" gradientUnits="userSpaceOnUse" gradientTransform="matrix(.17394 .86872 -3.5818 .71718 1648.351 -458.493)" fy="473.455" fx="147.694" xlinkHref="#b" />
                            <linearGradient id="b"><stop stopColor="#3771c8" offset="0" /><stop offset=".128" stopColor="#3771c8" /><stop stopOpacity="0" stopColor="#60f" offset="1" /></linearGradient>
                            <linearGradient id="a"><stop stopColor="#fd5" offset="0" /><stop stopColor="#fd5" offset=".1" /><stop stopColor="#ff543e" offset=".5" /><stop stopColor="#c837ab" offset="1" /></linearGradient>
                        </defs>
                        <path fill="url(#c)" d="M65.033 0C37.891 0 29.953.028 28.41.156c-5.57.463-9.036 1.34-12.812 3.22-2.91 1.445-5.205 3.12-7.47 5.468-4.125 4.282-6.625 9.55-7.53 15.812-.44 3.04-.568 3.66-.594 19.188-.01 5.176 0 11.988 0 21.125 0 27.12.03 35.05.16 36.59.45 5.42 1.3 8.83 3.1 12.56 3.44 7.14 10.01 12.5 17.75 14.5 2.68.69 5.64 1.07 9.44 1.25 1.61.07 18.02.12 34.44.12 16.42 0 32.84-.02 34.41-.1 4.4-.207 6.955-.55 9.78-1.28a27.22 27.22 0 0017.75-14.53c1.765-3.64 2.66-7.18 3.065-12.317.088-1.12.125-18.977.125-36.81 0-17.836-.04-35.66-.128-36.78-.41-5.22-1.305-8.73-3.127-12.44-1.495-3.037-3.155-5.305-5.565-7.624-4.3-4.108-9.56-6.608-15.829-7.512C102.338.157 101.733.027 86.193 0z" />
                        <path fill="url(#d)" d="M65.033 0C37.891 0 29.953.028 28.41.156c-5.57.463-9.036 1.34-12.812 3.22-2.91 1.445-5.205 3.12-7.47 5.468-4.125 4.282-6.625 9.55-7.53 15.812-.44 3.04-.568 3.66-.594 19.188-.01 5.176 0 11.988 0 21.125 0 27.12.03 35.05.16 36.59.45 5.42 1.3 8.83 3.1 12.56 3.44 7.14 10.01 12.5 17.75 14.5 2.68.69 5.64 1.07 9.44 1.25 1.61.07 18.02.12 34.44.12 16.42 0 32.84-.02 34.41-.1 4.4-.207 6.955-.55 9.78-1.28a27.22 27.22 0 0017.75-14.53c1.765-3.64 2.66-7.18 3.065-12.317.088-1.12.125-18.977.125-36.81 0-17.836-.04-35.66-.128-36.78-.41-5.22-1.305-8.73-3.127-12.44-1.495-3.037-3.155-5.305-5.565-7.624-4.3-4.108-9.56-6.608-15.829-7.512C102.338.157 101.733.027 86.193 0z" />
                        <path fill="#fff" d="M65.003 17c-13.036 0-14.672.057-19.792.29-5.11.234-8.598 1.043-11.65 2.23-3.157 1.226-5.835 2.866-8.503 5.535-2.67 2.668-4.31 5.346-5.54 8.502-1.19 3.053-2 6.542-2.23 11.65C17.06 50.327 17 51.964 17 65s.058 14.667.29 19.787c.235 5.11 1.044 8.598 2.23 11.65 1.227 3.157 2.867 5.835 5.536 8.503 2.667 2.67 5.345 4.314 8.5 5.54 3.054 1.187 6.543 1.996 11.652 2.23 5.12.233 6.755.29 19.79.29 13.037 0 14.668-.057 19.788-.29 5.11-.234 8.602-1.043 11.656-2.23 3.156-1.226 5.83-2.87 8.497-5.54 2.67-2.668 4.31-5.346 5.54-8.502 1.18-3.053 1.99-6.542 2.23-11.65.23-5.12.29-6.752.29-19.788 0-13.036-.06-14.672-.29-19.792-.24-5.11-1.05-8.598-2.23-11.65-1.23-3.157-2.87-5.835-5.54-8.503-2.67-2.67-5.34-4.31-8.5-5.535-3.06-1.187-6.55-1.996-11.66-2.23-5.12-.233-6.75-.29-19.79-.29zm-4.306 8.65c1.278-.002 2.704 0 4.306 0 12.816 0 14.335.046 19.396.276 4.68.214 7.22.996 8.912 1.653 2.24.87 3.837 1.91 5.516 3.59 1.68 1.68 2.72 3.28 3.592 5.52.657 1.69 1.44 4.23 1.653 8.91.23 5.06.28 6.58.28 19.39s-.05 14.33-.28 19.39c-.214 4.68-.996 7.22-1.653 8.91-.87 2.24-1.912 3.835-3.592 5.514-1.68 1.68-3.275 2.72-5.516 3.59-1.69.66-4.232 1.44-8.912 1.654-5.06.23-6.58.28-19.396.28-12.817 0-14.336-.05-19.396-.28-4.68-.216-7.22-.998-8.913-1.655-2.24-.87-3.84-1.91-5.52-3.59-1.68-1.68-2.72-3.276-3.592-5.517-.657-1.69-1.44-4.23-1.653-8.91-.23-5.06-.276-6.58-.276-19.398s.046-14.33.276-19.39c.214-4.68.996-7.22 1.653-8.912.87-2.24 1.912-3.84 3.592-5.52 1.68-1.68 3.28-2.72 5.52-3.592 1.692-.66 4.233-1.44 8.913-1.655 4.428-.2 6.144-.26 15.09-.27zm29.928 7.97a5.76 5.76 0 105.76 5.758c0-3.18-2.58-5.76-5.76-5.76zm-25.622 6.73c-13.613 0-24.65 11.037-24.65 24.65 0 13.613 11.037 24.645 24.65 24.645C78.616 89.645 89.65 78.613 89.65 65S78.615 40.35 65.002 40.35zm0 8.65c8.836 0 16 7.163 16 16 0 8.836-7.164 16-16 16-8.837 0-16-7.164-16-16 0-8.837 7.163-16 16-16z" />
                    </svg>
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


export default function HomePageClient() {
    const supabase = createClientComponentClient();
    const [business, setBusiness] = useState<Business | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const isPreview = searchParams.get('preview') === 'true';

    const fetchBusinessData = useCallback(async () => {
        const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID;
        if (!businessId) {
            setError("İşletme kimliği bulunamadı.");
            setIsLoading(false);
            return;
        }

        const { data: businessData, error: fetchError } = await supabase
            .from('businesses')
            .select(`*, categories (*, business_id)`)
            .eq('id', businessId)
            .eq('categories.is_available', true)
            .order('display_order', { foreignTable: 'categories', ascending: true })
            .single();

        if (fetchError) {
            console.error("Error fetching business data:", fetchError);
            setError("İşletme verileri yüklenirken bir hata oluştu.");
            setBusiness(null);
        } else {
            setBusiness(businessData);
        }
        setIsLoading(false);
    }, [supabase]);

    useEffect(() => {
        // İlk yüklemede loading'i true yapıp veri çekiyoruz
        setIsLoading(true);
        fetchBusinessData();

        const handleMessage = (event: MessageEvent) => {
            if (event.data === 'refresh-preview') {
                // Mesaj geldiğinde loading göstermeden veriyi çekiyoruz
                fetchBusinessData();
            }
        };
        window.addEventListener('message', handleMessage);
        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [fetchBusinessData]);

    if (isLoading) {
        return (
            <div>
                <Skeleton className="w-full h-48 mb-6" />
                <div className="p-4">
                    <header className="text-center mb-8">
                        <Skeleton className="h-10 w-1/2 mx-auto" />
                        <Skeleton className="h-4 w-1/3 mx-auto mt-2" />
                    </header>
                    <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (<Skeleton key={i} className="w-full aspect-square rounded-lg" />))}
                    </div>
                </div>
            </div>
        );
    }
    
    if (error) return <div className="min-h-screen flex items-center justify-center text-center text-red-500 p-4">{error}</div>;

    return (
        <div>
            <MenuHeader business={business} isPreview={isPreview} />
            <div className="p-4">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-extrabold tracking-tight">{business?.name || 'Menümüz'}</h1>
                    <p className="text-secondary mt-2">Lezzetlerimizi keşfetmek için bir kategori seçin</p>
                </header>
                <div className="grid grid-cols-2 gap-4">
                    {business?.categories?.map(category => ( <CategoryCard key={category.id} category={category} isPreview={isPreview} /> ))}
                </div>
                {!business || !business.categories || business.categories.length === 0 && (
                    <div className="text-center py-10 col-span-2">
                        <p className="text-secondary">Bu işletmeye ait gösterilecek aktif kategori bulunamadı.</p>
                    </div>
                )}
            </div>
        </div>
    );
}