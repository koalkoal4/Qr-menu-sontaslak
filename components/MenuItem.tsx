import Image from 'next/image';
import { Product } from '@/lib/types';

interface MenuItemProps {
  product: Product;
}

export default function MenuItem({ product }: MenuItemProps) {
  const imageUrl = product.image_url
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.image_url}`
    : null;

  return (
    <div className="flex items-start gap-4 py-4">
      {/* Sol Taraf: Görsel */}
      {/* Adım 1: Görsel arkaplan rengi güncellendi */}
      <div className="w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-surface dark:bg-dark-surface rounded-md flex items-center justify-center">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={product.name}
            width={112}
            height={112}
            className="object-cover w-full h-full rounded-md"
          />
        )}
      </div>

      {/* Sağ Taraf: Bilgiler */}
      <div className="flex flex-col items-start w-full">
        {/* Adım 2: Ürün adı (h3) rengi güncellendi */}
        <h3 className="font-bold text-lg text-primary dark:text-dark-primary">
          {product.name}
        </h3>
        
        {product.description && (
          // Adım 2: Ürün açıklaması (p) rengi güncellendi
          <p className="text-sm text-secondary mt-1">
            {product.description}
          </p>
        )}
        
        <div className="mt-2">
          {/* Adım 2: Fiyat (span) rengi güncellendi */}
          <span className="font-semibold text-md text-primary dark:text-dark-primary">
            ₺{product.price.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
