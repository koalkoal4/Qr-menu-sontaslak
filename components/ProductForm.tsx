import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Product, Category } from '@/lib/types';

// Formun sorumlu olduğu alanları tanımlıyoruz.
export type ProductFormData = {
  name: string;
  description: string | null;
  price: number;
  category_id: string;
  is_available: boolean;
};

type ProductFormProps = {
  initialData?: Product;
  categories: Category[];
  // onSave prop'u artık sadece form verilerini ve resim dosyasını iletiyor.
  onSave: (formData: ProductFormData, imageFile?: File | null) => void;
  isSaving: boolean;
};

export default function ProductForm({ initialData, categories, onSave, isSaving }: ProductFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [price, setPrice] = useState(initialData?.price || 0);
  const [categoryId, setCategoryId] = useState(initialData?.category_id?.toString() || '');
  const [isAvailable, setIsAvailable] = useState(initialData?.is_available ?? true);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const inputStyle = "mt-1 block w-full rounded-md border-gray-400 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        name,
        description,
        price,
        category_id: categoryId,
        is_available: isAvailable,
      },
      imageFile
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Ürün Adı
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputStyle}
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Açıklama
        </label>
        <textarea
          id="description"
          value={description || ''}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className={inputStyle}
        />
      </div>
      
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700">
          Fiyat
        </label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value))}
          min="0"
          step="0.01"
          className={inputStyle}
          required
        />
      </div>
      
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Kategori
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className={inputStyle}
          required
        >
          <option value="">Bir kategori seçin</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Ürün Resmi
        </label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {initialData?.image_url && (
          <div className="mt-2">
            <p className="text-sm text-gray-500">Mevcut resim:</p>
            <img
              src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${initialData.image_url}`}
              alt="Mevcut ürün"
              className="h-20 w-20 object-cover rounded"
            />
          </div>
        )}
      </div>
      
      <div className="flex items-center">
        <input
          id="active"
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
          Menüde Göster
        </label>
      </div>
      
      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSaving ? 'Kaydediliyor...' : 'Ürünü Kaydet'}
      </button>
    </form>
  );
}
