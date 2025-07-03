import { useState } from 'react';
import { Category } from '@/lib/types';
import Image from 'next/image';

type CategoryFormProps = {
  initialData?: Category;
  onSave: (category: Omit<Category, 'id'>, imageFile?: File | null) => void;
  isSaving: boolean;
};

export default function CategoryForm({ initialData, onSave, isSaving }: CategoryFormProps) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order || 0);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.image_url 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${initialData.image_url}` 
    : null
  );

  // --- GÖRSEL İYİLEŞTİRME: Daha belirgin input stilleri ---
  const inputStyle = "mt-1 block w-full rounded-md border-gray-400 bg-gray-50 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm";
  // --- DEĞİŞİKLİĞİN SONU ---

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
        description: description || null,
        display_order: displayOrder,
      } as Omit<Category, 'id'>,
      imageFile
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Category Name
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
          Category Image (Optional)
        </label>
        <div className="mt-2 flex items-center gap-x-4">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Category preview"
              width={80}
              height={80}
              className="h-20 w-20 object-cover rounded-md"
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
          Description (Optional)
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
          Display Order
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
      
      <button
        type="submit"
        disabled={isSaving}
        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {isSaving ? 'Saving...' : 'Save Category'}
      </button>
    </form>
  );
}