'use client'

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Product, Category } from '@/lib/types';
import ProductForm from '@/components/ProductForm';

export default function ProductEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string; // ID'nin string olduğunu biliyoruz
  const supabase = createClientComponentClient();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        // Ürünü çek
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (productError) throw productError;
        setProduct(productData);

        // Kategorileri çek
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load initial data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [supabase, id]);

  // --- DEĞİŞTİRİLEN KISIM BURASI ---
  const handleSave = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // upsert için, güncellenecek satırı bilmesi amacıyla ID'yi veriye dahil ediyoruz.
      const dataToSave = {
        id: id, // <-- EN ÖNEMLİ DÜZELTME
        ...productData,
      };

      const { error: upsertError } = await supabase
        .from('products')
        .upsert(dataToSave); // update yerine upsert kullanmak daha güvenlidir.
      
      if (upsertError) {
        throw upsertError;
      }
      
      router.push('/admin');
      router.refresh();
    } catch (err) {
      console.error('Error updating product:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while updating the product.');
      }
    }
  };
  // --- DEĞİŞİKLİĞİN SONU ---

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