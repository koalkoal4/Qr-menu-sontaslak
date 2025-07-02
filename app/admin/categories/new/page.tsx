'use client'

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Category } from '@/lib/types';
import CategoryForm from '@/components/CategoryForm';

export default function NewCategoryPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- handleSave FONKSİYONUNU GÜNCELLEYELİM ---
  const handleSave = async (categoryData: Omit<Category, 'id'>, imageFile?: File | null) => {
    setIsSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User is not authenticated.");

      // Önce kategoriyi resimsiz olarak ekleyip ID'sini alalım
      const dataToInsert = { ...categoryData, user_id: user.id, image_url: null };
      const { data: newCategory, error: insertError } = await supabase
        .from('categories')
        .insert(dataToInsert)
        .select()
        .single();
      
      if (insertError) throw insertError;

      // Eğer resim varsa, şimdi ID'yi kullanarak yükleyelim ve kategoriyi güncelleyelim
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${newCategory.id}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('category-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;

        // Kategoriyi yeni resim URL'si ile güncelle
        const { error: updateError } = await supabase
          .from('categories')
          .update({ image_url: fileName })
          .eq('id', newCategory.id);
        
        if (updateError) throw updateError;
      }
      
      router.push('/admin?tab=categories');
      router.refresh();
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err instanceof Error ? err.message : 'Failed to create category.');
    } finally {
      setIsSaving(false);
    }
  };
  // --- GÜNCELLEMENİN SONU ---

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">New Category</h1>
          <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
            &larr; Back
          </button>
        </div>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}

        <div className="bg-white shadow rounded-lg p-6">
          <CategoryForm onSave={handleSave} isSaving={isSaving} />
        </div>
      </div>
    </div>
  );
}