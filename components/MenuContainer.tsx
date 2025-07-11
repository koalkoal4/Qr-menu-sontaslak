'use client';

import { useState, useEffect } from 'react';
import { Product, Category } from 'lib/types';
import { subscribeToRealtimeUpdates, unsubscribeFromRealtimeUpdates } from 'lib/realtime';
import CategorySection from './CategorySection';
import { Skeleton } from 'components/ui/skeleton';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useSearchParams } from 'next/navigation';

export default function MenuContainer() {
  const supabase = createClientComponentClient();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories')
        ]);
        if (!productsRes.ok) throw new Error('Failed to fetch products');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories');
        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (isLoading || error) {
      return;
    }

    const productsSubscription: RealtimeChannel = subscribeToRealtimeUpdates(supabase, 'products', (payload) => {
      const eventType = payload.eventType;
      const newProduct = payload.new;
      switch (eventType) {
        case 'INSERT':
        case 'UPDATE':
          setProducts(prev => {
            const existing = prev.find(p => p.id === newProduct.id);
            return existing ? prev.map(p => p.id === newProduct.id ? newProduct : p) : [...prev, newProduct];
          });
          break;
        case 'DELETE':
          setProducts(prev => prev.filter(p => p.id !== payload.old.id));
          break;
      }
    });

    const categoriesSubscription: RealtimeChannel = subscribeToRealtimeUpdates(supabase, 'categories', (payload) => {
      const eventType = payload.eventType;
      const newCategory = payload.new;
      switch (eventType) {
        case 'INSERT':
        case 'UPDATE':
          setCategories(prev => {
            const existing = prev.find(c => c.id === newCategory.id);
            return existing ? prev.map(c => c.id === newCategory.id ? newCategory : c) : [...prev, newCategory];
          });
          break;
        case 'DELETE':
          setCategories(prev => prev.filter(c => c.id !== payload.old.id));
          break;
      }
    });

    return () => {
      unsubscribeFromRealtimeUpdates(supabase, productsSubscription);
      unsubscribeFromRealtimeUpdates(supabase, categoriesSubscription);
    };
  }, [isLoading, error, supabase]);

  const productsByCategory = categories.map(category => ({
    category,
    products: products.filter(p => p.category_id === category.id)
  }));

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="bg-red-50 text-red-700 p-4 rounded-lg">
          <h2 className="font-bold">Error loading menu</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="space-y-12">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-8 w-48 mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, idx) => (
                  <Skeleton key={idx} className="h-64 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {productsByCategory.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Menu is empty</h2>
          <p className="text-gray-600">Check back later for our delicious offerings!</p>
        </div>
      ) : (
        <div className="space-y-12">
          {productsByCategory.map(({ category, products }) => (
            <CategorySection
              key={category.id}
              category={category}
              products={products}
              isPreview={isPreview}
            />
          ))}
        </div>
      )}
    </div>
  );
}