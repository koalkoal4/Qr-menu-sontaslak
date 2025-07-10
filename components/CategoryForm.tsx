import { useState } from 'react';
import { Category } from '@/lib/types';
import Image from 'next/image';

export type CategoryFormData = {
  name: string;
  description: string | null;
  display_order: number;
  name_position: string;
  is_available: boolean;
};

type CategoryFormProps = {
  initialData?: Category;
  // DÜZELTME: onSave fonksiyonunun bir Promise döndürebileceğini belirtiyoruz.
  onSave: (formData: CategoryFormData, imageFile?: File | null) => void | Promise<void>;
  isSaving: boolean;
};

export default function CategoryForm({ initialData, onSave, isSaving }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order || 0);
  const [namePosition, setNamePosition] = useState(initialData?.name_position || 'bottom-left');
  const [isAvailable, setIsAvailable] = useState(initialData?.is_available ?? true);
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${initialData.image_url}` 
    : null
  );

  const inputStyle = "mt-1 block w-full rounded-md border-gray-400 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onSave(
      {
        name,
        description,
        display_order: displayOrder,
        name_position: namePosition,
        is_available: isAvailable,
      },
      imageFile
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Kategori Adı
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
        <label htmlFor="image" className="block text-sm font-medium text-gray-700">
          Kategori Görseli (İsteğe Bağlı)
        </label>
        <div className="mt-2 flex items-center gap-x-4">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Category preview"
              width={80}
              height={80}
              className="h-20 w-20 object-cover rounded-md"
              unoptimized={true}
            />
          ) : (
            <div className="h-20 w-20 bg-gray-100 rounded-md flex items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            </div>
          )}
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
        </div>
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Açıklama (İsteğe Bağlı)
        </label>
        <textarea
          id="description"
          value={description || ''}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className={inputStyle}
        />
      </div>
      
      <div>
        <label htmlFor="displayOrder" className="block text-sm font-medium text-gray-700">
          Görünüm Sırası
        </label>
        <input
          type="number"
          id="displayOrder"
          value={displayOrder}
          onChange={(e) => setDisplayOrder(Number(e.target.value))}
          min="0"
          className={inputStyle}
          required
        />
      </div>

      <div>
        <label htmlFor="namePosition" className="block text-sm font-medium text-gray-700">
          İsim Pozisyonu
        </label>
        <select
          id="namePosition"
          value={namePosition}
          onChange={(e) => setNamePosition(e.target.value)}
          className={inputStyle}
          required
        >
            <option value='bottom-left'>Sol Alt</option>
            <option value='bottom-center'>Orta Alt</option>
            <option value='bottom-right'>Sağ Alt</option>
            <option value='center'>Tam Orta</option>
            <option value='top-left'>Sol Üst</option>
            <option value='top-center'>Orta Üst</option>
            <option value='top-right'>Sağ Üst</option>
        </select>
      </div>

      <div className="flex items-center">
        <input
          id="isAvailable"
          type="checkbox"
          checked={isAvailable}
          onChange={(e) => setIsAvailable(e.target.checked)}
          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
        />
        <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-700">
          Menüde Aktif
        </label>
      </div>
      
      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSaving ? 'Kaydediliyor...' : 'Kategoriyi Kaydet'}
      </button>
    </form>
  );
}
