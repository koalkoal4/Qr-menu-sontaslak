'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Category } from 'lib/types';
import ProductForm, { ProductFormData } from '@/components/ProductForm'; // Form verisi tipini import et

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Kategorileri çekerken de business_id'ye göre filtreleme yapmalıyız
  useEffect(() => {
    const fetchPrerequisites = async () => {
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

        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .eq('business_id', businessId) // Sadece bu işletmenin kategorilerini getir
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

    fetchPrerequisites();
  }, [supabase]);

  const handleSave = async (formData: ProductFormData, imageFile?: File | null) => {
    setIsSaving(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Kullanıcı doğrulanmamış.");

      const { data: memberData, error: memberError } = await supabase
        .from('business_members').select('business_id').eq('user_id', user.id).single();
      if (memberError || !memberData) throw new Error("İlişkili işletme bulunamadı.");
      const businessId = memberData.business_id;

      let imageUrl: string | null = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${businessId}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, imageFile);
        if (uploadError) throw uploadError;
        imageUrl = fileName;
      }

      const { count, error: countError } = await supabase
        .from('products').select('*', { count: 'exact', head: true }).eq('business_id', businessId);
      if (countError) console.warn('Sıralama için ürün sayısı alınamadı.');
      
      const dataToInsert = {
        ...formData,
        image_url: imageUrl,
        display_order: count ?? 0,
        business_id: businessId,
      };

      const { error: insertError } = await supabase.from('products').insert([dataToInsert]);
      if (insertError) throw insertError;
      
      router.push('/admin');
      router.refresh();
    } catch (err) {
      console.error('Ürün oluşturma hatası:', err);
      setError(err instanceof Error ? err.message : 'Ürün oluşturulamadı.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Yükleniyor...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Yeni Ürün</h1>
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">&larr; Geri</button>
        </div>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
        <div className="bg-white shadow rounded-lg p-6">
          <ProductForm 
            categories={categories} 
            onSave={handleSave} 
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}
