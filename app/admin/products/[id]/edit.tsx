'use client'

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
// ProductFormData tipini ProductForm'dan alacak şekilde düzenledik
import ProductForm from '@/components/ProductForm';
import type { Product, Category } from '@/lib/types';
// onSave fonksiyonunun beklediği tipi içe aktarıyoruz.
// ÖNEMLİ: Bunun çalışması için ProductForm.tsx dosyasında ProductFormData tipini export etmeniz gerekebilir.
// Eğer export edilmemişse, ProductForm.tsx'te "type ProductFormData" başlığını "export type ProductFormData" olarak değiştirin.
import { ProductFormData } from '@/components/ProductForm';


export default function ProductEditPage() {
  const router = useRouter();
  const { id } = useParams();
  const supabase = createClientComponentClient();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (productError) throw productError;
        setProduct(productData);

        // Fetch categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load product data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, id]);

  // --- GÜNCELLEME: handleSave fonksiyonunun parametre tipi düzeltildi ---
  const handleSave = async (productData: ProductFormData) => {
    try {
      const { error } = await supabase
        .from('products')
        // productData objesi artık ProductForm'dan gelen veriyi içeriyor
        .update({ ...productData })
        .eq('id', id);
      
      if (error) throw error;
      
      router.push('/admin');
    } catch (error) {
      console.error('Error updating product:', error);
      setError('Failed to update product');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading product...</div>
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
        <div className="text-xl">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            &larr; Back
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <ProductForm 
            initialData={product} 
            categories={categories} 
            onSave={handleSave} 
          />
        </div>
      </div>
    </div>
  );
}