// app/admin/products/[id]/edit/page.tsx

'use client'

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Product, Category } from '@/lib/types';
import ProductForm, { ProductFormData } from '@/components/ProductForm'; // Tipi buradan alıyoruz

export default function ProductEditPage() {
  const router = useRouter();
  const { id } = useParams();
  const supabase = createClientComponentClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false); // Kaydetme durumu için state eklendi
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Kullanıcı doğrulanmamış.");

        const { data: memberData, error: memberError } = await supabase
            .from('business_members')
            .select('business_id')
            .eq('user_id', user.id)
            .single();
        
        if (memberError || !memberData) throw new Error("İlişkili işletme bulunamadı.");
        const businessId = memberData.business_id;

        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .eq('business_id', businessId) // Güvenlik için işletme kontrolü eklendi
          .single();
        
        if (productError) throw productError;
        setProduct(productData);

        // Kategorileri de sadece o işletmeye ait olanları getirelim
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('business_id', businessId)
          .order('display_order', { ascending: true });
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
      } catch (err) {
        console.error('Veri çekme hatası:', err);
        setError(err instanceof Error ? err.message : 'Sayfa yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, id]);

  // --- GÜNCELLEME: Fonksiyon resim yüklemeyi de içerecek şekilde güncellendi ---
  const handleSave = async (formData: ProductFormData, imageFile?: File | null) => {
    if (!product) return;
    setIsSaving(true);
    setError(null);

    try {
        let imageUrl = product.image_url; // Mevcut resmi koru

        // Eğer yeni bir resim dosyası seçildiyse, onu yükle
        if (imageFile) {
            const fileExt = imageFile.name.split('.').pop();
            // Dosya adını business_id ve product_id ile oluşturarak daha organize hale getiriyoruz
            const fileName = `${product.business_id}/${product.id}.${fileExt}`;
            
            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(fileName, imageFile, {
                    cacheControl: '3600',
                    upsert: true, // Var olan dosyanın üzerine yazarak güncelleme sağlar
                });
            
            if (uploadError) throw uploadError;
            imageUrl = fileName;
        }

        const dataToUpdate = {
            ...formData,
            image_url: imageUrl, // Form verisine güncel resim URL'sini ekle
        };

        const { error: updateError } = await supabase
            .from('products')
            .update(dataToUpdate)
            .eq('id', id);
        
        if (updateError) throw updateError;
        
        router.push('/admin');
        router.refresh();
    } catch (err) {
        console.error('Ürün güncelleme hatası:', err);
        setError(err instanceof Error ? err.message : 'Ürün güncellenemedi.');
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Ürün yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Ürün bulunamadı</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Ürünü Düzenle</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            &larr; Geri
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}

        <div className="bg-white shadow rounded-lg p-6">
          <ProductForm 
            initialData={product} 
            categories={categories} 
            onSave={handleSave}
            isSaving={isSaving} // isSaving prop'u eklendi
          />
        </div>
      </div>
    </div>
  );
}