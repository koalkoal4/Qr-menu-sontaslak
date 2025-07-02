// app/admin/products/[id]/edit/page.tsx

'use client'

import { useRouter, useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Product, Category } from '@/lib/types';
import ProductForm from '@/components/ProductForm';
import { ProductFormData } from '@/components/ProductForm'; // Tipi buradan alıyoruz

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
      if (!id) return;
      setIsLoading(true);
      try {
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
        
        if (productError) throw productError;
        setProduct(productData);

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

  // --- GÜNCELLEME: Fonksiyonun parametre tipi ve içeriği düzeltildi ---
  const handleSave = async (formData: Omit<ProductFormData, 'display_order'>) => {
    if (!product) return; // Mevcut ürün bilgisi yoksa işlemi durdur

    try {
      const dataToUpdate = {
        ...formData, // Formdan gelen güncel veriler
        display_order: product.display_order, // Mevcut display_order değerini koru
      };

      const { error } = await supabase
        .from('products')
        .update(dataToUpdate) // Birleştirilmiş veriyi gönder
        .eq('id', id);
      
      if (error) throw error;
      
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
            onSave={handleSave as any} // 'as any' ile geçici olarak tip kontrolünü esnetebiliriz, ama yukarıdaki çözüm daha doğru
          />
        </div>
      </div>
    </div>
  );
}