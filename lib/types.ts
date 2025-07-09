export type Business = {
  id: string;
  name: string;
  created_at: string;
  cover_image_url: string | null;
  instagram_url: string | null;
  categories: Category[]; // Bir işletmenin kendi kategorileri olabilir.
};

export type Category = {
  id: string;
  created_at: string;
  name: string;
  description: string | null;
  display_order: number;
  image_url?: string | null;
  is_available: boolean; // <-- BU SATIRI EKLEYİN
  name_position: string;
  business_id: string;
  products: Product[]; // Bir kategorinin kendi ürünleri olabilir.
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
  business_id: string; 
};
