import { Product, Category } from '@/lib/types';
import MenuItem from './MenuItem';
import { Skeleton } from '@/components/ui/skeleton';

interface CategorySectionProps {
  category: Category;
  products: Product[];
  isLoading?: boolean;
  isPreview: boolean;
}

export default function CategorySection({ 
  category, 
  products, 
  isLoading = false, 
  isPreview
}: CategorySectionProps) {
  if (isLoading) {
    return (
      <div className="mb-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="border rounded-lg overflow-hidden">
              <Skeleton className="aspect-square w-full" />
              <div className="p-4">
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-6 w-1/4" />
                </div>
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{category.name}</h2>
      {products.length === 0 ? (
        <p className="text-gray-500">No products available in this category</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <MenuItem key={product.id} product={product} isPreview={isPreview} />
          ))}
        </div>
      )}
    </div>
  );
}