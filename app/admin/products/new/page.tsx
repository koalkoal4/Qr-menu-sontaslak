'use client'

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Category } from 'lib/types';
import ProductForm from 'components/ProductForm';
// ProductForm'un kullandığı veri tipini içe aktarıyoruz
import { ProductFormData } from 'components/ProductForm';

export default function NewProductPage() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: categoriesData, error } = await supabase
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });
        
        if (error) throw error;
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [supabase]);

  // --- GÜNCELLEME: handleSave fonksiyonu düzeltildi ---
  const handleSave = async (productData: ProductFormData) => {
    try {
      // Yeni ürün için display_order'ı belirlemek üzere mevcut ürün sayısını alalım
      const { count, error: countError } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        console.warn('Could not get product count to set display_order, defaulting to 0.');
      }
      
      // Veritabanına gönderilecek son veriyi oluşturalım
      const dataToInsert = {
        ...productData,
        display_order: count ?? 0, // Mevcut ürün sayısını sıralama olarak ayarla
      };

      const { data, error } = await supabase
        .from('products')
        .insert([dataToInsert]);
      
      if (error) throw error;
      
      router.push('/admin');
      router.refresh(); // Admin panelinin yeni ürünü göstermesi için sayfayı yenile
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };
  // --- DEĞİŞİKLİĞİN SONU ---

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">New Product</h1>
          <button
            onClick={() => router.back()}
            className="text-gray-600 hover:text-gray-900"
          >
            &larr; Back
          </button>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <ProductForm 
            categories={categories} 
            onSave={handleSave} 
          />
        </div>
      </div>
    </div>
  );
}