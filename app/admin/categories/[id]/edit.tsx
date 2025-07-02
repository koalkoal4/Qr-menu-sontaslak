'use client'

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Category } from '@/lib/types';
import CategoryForm from '@/components/CategoryForm';

export default function CategoryEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const supabase = createClientComponentClient();

  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- HATA GİDERİLDİ: useEffect'in içini doğru şekilde dolduruyoruz ---
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!id) return;
      
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('categories')
          .select('*')
          .eq('id', id)
          .single();
        
        if (fetchError) throw fetchError;
        
        setCategory(data);
      } catch (err) {
        console.error('Error fetching category:', err);
        setError('Failed to load category data.');
      } finally {
        setIsLoading(false); // Hata olsa da olmasa da loading durumunu bitir
      }
    };

    fetchCategoryData(); // Fonksiyonu burada çağırıyoruz
  }, [id, supabase]);
  // --- DÜZELTMENİN SONU ---

  const handleSave = async (categoryData: Omit<Category, 'id'>, imageFile?: File | null) => {
    setIsSaving(true);
    setError(null);

    try {
      let imageUrl = category?.image_url || null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${id}-${Date.now()}.${fileExt}`;
        
        // Supabase'de 'category-images' adında bir bucket oluşturduğunuzdan emin olun
        const { error: uploadError } = await supabase.storage
          .from('category-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: true,
          });

        if (uploadError) throw uploadError;
        imageUrl = fileName;
      }

      const { error: updateError } = await supabase
        .from('categories')
        .update({ ...categoryData, image_url: imageUrl })
        .eq('id', id);       

      if (updateError) throw updateError;
      
      router.push('/admin?tab=categories');
      router.refresh(); 
    } catch (err) {
      console.error('Error updating category:', err);
      setError(err instanceof Error ? err.message : 'Failed to update category.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading category editor...</div>;
  }

  if (!category) {
    return <div className="min-h-screen flex items-center justify-center">Category not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Category</h1>
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            &larr; Back
          </button>
        </div>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
        <div className="bg-white shadow rounded-lg p-6">
          {/* --- GÜNCELLEME: isSaving prop'u eklendi --- */}
          <CategoryForm 
            initialData={category} 
            onSave={handleSave} 
            isSaving={isSaving}
          />
        </div>
      </div>
    </div>
  );
}