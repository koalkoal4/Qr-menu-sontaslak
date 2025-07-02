export type Category = {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  display_order: number;
  user_id: string;
  image_url?: string | null;
  is_available: boolean; // <-- BU SATIRI EKLEYİN
};

// Product tipi zaten bu alana sahip, o yüzden orada değişiklik gerekmiyor.
export type Product = {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category_id: string | null; 
  is_available: boolean;
  display_order: number; 
};

// Dosyanın sonuna ekle:
export type Profile = {
  id: string;
  instagram_url: string | null;
  cover_image_url: string | null;
};