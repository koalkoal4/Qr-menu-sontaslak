'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Business } from '@/lib/types'; // Profile yerine Business kullanıyoruz
import Image from 'next/image';

interface SettingsFormProps {
  initialBusiness: Business; // Prop adını ve tipini güncelledik
  onUpdate: () => void;
}

export default function SettingsForm({ initialBusiness, onUpdate }: SettingsFormProps) {
  const supabase = createClientComponentClient();
  const [instagramUrl, setInstagramUrl] = useState(initialBusiness.instagram_url || '');
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(initialBusiness.cover_image_url 
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cover-images/${initialBusiness.cover_image_url}` 
    : null
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
        let coverImageUrl = initialBusiness.cover_image_url;

        if (coverImageFile) {
            // Dosya adını işletme ID'si ile birlikte daha organize bir yapıda tutalım
            const fileName = `${initialBusiness.id}/${Date.now()}`;
            const { error: uploadError } = await supabase.storage
                .from('cover-images')
                .upload(fileName, coverImageFile, { upsert: true });

            if (uploadError) throw uploadError;
            
            coverImageUrl = fileName; 
        }

        // 'profiles' yerine 'businesses' tablosunu güncelliyoruz
        const { error: updateError } = await supabase
            .from('businesses')
            .update({
                instagram_url: instagramUrl,
                cover_image_url: coverImageUrl,
            })
            .eq('id', initialBusiness.id); // İşletme ID'sine göre eşleştirme yapıyoruz

        if (updateError) throw updateError;
        alert('Ayarlar başarıyla kaydedildi!');
        onUpdate();

    } catch (err: any) {
        setError(err.message);
        console.error(err);
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 pt-4">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
            <label htmlFor="instagram" className="block text-sm font-medium text-gray-700">Instagram URL</label>
            <input type="url" id="instagram" value={instagramUrl} onChange={e => setInstagramUrl(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="https://instagram.com/isletmeniz"/>
        </div>
        <div>
            <label htmlFor="cover" className="block text-sm font-medium text-gray-700">Kapak Fotoğrafı</label>
            {previewUrl && <Image src={previewUrl} alt="Cover preview" width={400} height={200} className="mt-2 rounded-md object-cover" unoptimized={true} />}
            <input type="file" id="cover" onChange={handleImageChange} accept="image/*" className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4"/>
        </div>
        <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50">
            {isSaving ? 'Kaydediliyor...' : 'Ayarları Kaydet'}
        </button>
    </div>
  );
}
