'use client'

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product, Category, Business } from '@/lib/types';
import SimpleModal from '@/components/SimpleModal';
import Switch from '@/components/Switch';
import SettingsForm from '@/components/SettingsForm';
import {
  DndContext,
  closestCenter,
  rectIntersection,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  useDroppable,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type ProductsByCategory = {
  [categoryId: string]: Product[];
}

// --- YARDIMCI BİLEŞENLER ---
// Bu bileşenlerin projenizde doğru ve mevcut olduğunu varsayıyoruz.
function CategoryRow({ id, category, openDeleteModal, onStatusChange }: { id: string, category: Category, openDeleteModal: Function, onStatusChange: Function }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition, touchAction: 'none' };

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      <td data-label="Name">
        <div className="flex items-center">
          <div {...listeners} className="cursor-move mr-2 p-2">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" /></svg>
          </div>
          <div className="font-medium text-gray-900">{category.name}</div>
        </div>
      </td>
      <td data-label="Order">{category.display_order}</td>
      <td data-label="Status">
        <Switch
            checked={category.is_available}
            onChange={(newStatus) => onStatusChange('category', category.id, newStatus)}
        />
      </td>
      <td data-label="Actions" className="text-right">
        <button onClick={() => router.push(`/admin/categories/${category.id}/edit`)} className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium">Düzenle</button>
        <button onClick={() => openDeleteModal('category', category.id)} className="text-red-600 hover:text-red-900 font-medium">Sil</button>
      </td>
    </tr>
  );
}

function ProductRow({ id, product, openDeleteModal, onStatusChange }: { id: string, product: Product, openDeleteModal: Function, onStatusChange: Function }) {
    const router = useRouter();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 0, touchAction: 'none' };

    return(
        <div ref={setNodeRef} style={style} {...attributes}>
          <div className="p-3 border rounded bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm gap-4">
              <div className="flex items-center flex-1 min-w-0 w-full">
                  <div {...listeners} className="cursor-grab p-2 flex-shrink-0">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" /></svg>
                  </div>
                  {product.image_url && <img className="h-10 w-10 rounded-full object-cover mr-3 flex-shrink-0" src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.image_url}`} alt={product.name} />}
                  <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{product.name}</div>
                      <div className="text-sm text-gray-500">₺{product.price.toFixed(2)}</div>
                  </div>
              </div>
              <div className="w-full sm:w-auto flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="w-full sm:w-auto flex items-center justify-between">
                      <label htmlFor={`available-${product.id}`} className="text-sm font-medium text-gray-700 sm:hidden">
                          Mevcut
                      </label>
                      <Switch
                          checked={product.is_available}
                          onChange={(newStatus) => onStatusChange('product', product.id, newStatus)}
                          id={`available-${product.id}`}
                      />
                  </div>
                  <div className="w-full sm:w-auto flex items-center gap-3">
                      <button 
                        onClick={() => router.push(`/admin/products/${product.id}/edit`)} 
                        className="flex-1 sm:flex-initial justify-center text-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-indigo-700 bg-indigo-100 hover:bg-indigo-200">
                          Düzenle
                      </button>
                      <button 
                        onClick={() => openDeleteModal('product', product.id)} 
                        className="flex-1 sm:flex-initial justify-center text-center px-4 py-2 text-sm font-medium rounded-md shadow-sm text-red-700 bg-red-100 hover:bg-red-200">
                          Sil
                      </button>
                  </div>
              </div>
          </div>
        </div>
    );
}

function CategoryDropZone({ id, category, products, openDeleteModal, onStatusChange }: { id: string, category: Category, products: Product[], openDeleteModal: Function, onStatusChange: Function }) {
  const { setNodeRef } = useDroppable({
    id: id,
    data: { type: 'category' }
  });

  return (
    <div key={id}>
      <h4 className="text-lg font-bold mb-2 p-2">{category.name}</h4>
      <SortableContext id={id} items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="space-y-2 min-h-[50px] bg-gray-50 p-2 rounded-md border">
          {products.map(product => <ProductRow key={product.id} id={product.id} product={product} openDeleteModal={openDeleteModal} onStatusChange={onStatusChange} />)}
          {products.length === 0 && (
            <div className="flex items-center justify-center h-12 text-sm text-gray-400">
              Bu kategoriye ürün sürükleyin
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// --- ANA DASHBOARD BİLEŞENİ ---
export default function AdminDashboard() {
  const { session, isLoading } = useAuth();
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'settings'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [productsByCategory, setProductsByCategory] = useState<ProductsByCategory>({});

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'product' | 'category', id: string} | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [previewKey, setPreviewKey] = useState(Date.now());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const refreshPreview = useCallback(() => { setPreviewKey(Date.now()); }, []);

  // --- DÜZELTİLMİŞ ve DOĞRU fetchData MANTIĞI ---
  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
        // Adım 1: Giriş yapmış kullanıcıyı al
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoadingData(false);
          return;
        }

        // Adım 2: Kullanıcının hangi işletmeye üye olduğunu bul
        const { data: memberData, error: memberError } = await supabase
            .from('business_members')
            .select('business_id')
            .eq('user_id', user.id)
            .single();

        if (memberError || !memberData) {
            console.error("HATA: Kullanıcıya ait işletme bulunamadı!", memberError);
            setIsLoadingData(false);
            return;
        }
        const businessId = memberData.business_id;
        
        // Adım 3: Bulunan businessId ile sadece o işletmeye ait verileri çek
        const [productsRes, categoriesRes, businessRes] = await Promise.all([
            supabase.from('products').select('*').eq('business_id', businessId),
            supabase.from('categories').select('*').eq('business_id', businessId).order('display_order'),
            supabase.from('businesses').select('*').eq('id', businessId).single()
        ]);

        if (productsRes.error) throw productsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;
        if (businessRes.error) throw businessRes.error;
        
        // Adım 4: State'leri güvenli bir şekilde güncelle
        setProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);
        setBusiness(businessRes.data || null);

    } catch (error) {
        console.error("fetchData içinde kritik bir hata meydana geldi:", error);
    } finally {
        setIsLoadingData(false);
    }
  }, [supabase]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'products' || tab === 'categories' || tab === 'settings') {
      setActiveTab(tab);
    }
    if (session) {
      fetchData();
    } else if (!isLoading) {
      setIsLoadingData(false);
    }
  }, [session, isLoading, searchParams, fetchData]);

  useEffect(() => {
    const newProductsByCategory = categories.reduce((acc, category) => {
      acc[category.id] = products
        .filter(p => p.category_id === category.id)
        .sort((a, b) => a.display_order - b.display_order);
      return acc;
    }, {} as ProductsByCategory);
    setProductsByCategory(newProductsByCategory);
  }, [products, categories]);

  const handleStatusChange = async (type: 'product' | 'category', id: string, newStatus: boolean) => {
    const table = type === 'product' ? 'products' : 'categories';
    const { error } = await supabase.from(table).update({ is_available: newStatus }).eq('id', id);
    if (error) {
      console.error(`Error updating ${type} status:`, error);
      fetchData(); 
    } else {
      // Optimistic UI update
      if(type === 'product') {
        setProducts(prev => prev.map(p => (p.id === id ? { ...p, is_available: newStatus } : p)));
      } else {
        setCategories(prev => prev.map(c => (c.id === id ? { ...c, is_available: newStatus } : c)));
      }
      refreshPreview(); 
    }
  };

  const handleCategoryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
        const oldIndex = categories.findIndex((c) => c.id === active.id);
        const newIndex = categories.findIndex((c) => c.id === over.id);
        const newOrderedCategories = arrayMove(categories, oldIndex, newIndex);
        setCategories(newOrderedCategories);

        const updatePromises = newOrderedCategories.map((category, index) =>
            supabase.from('categories').update({ display_order: index }).eq('id', category.id)
        );
        try {
            await Promise.all(updatePromises);
            refreshPreview();
        } catch (error) {
            console.error("Failed to update category order in DB:", error);
            fetchData(); 
        }
    }
  };

  const handleProductDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
  
    const activeId = String(active.id);
    const overId = String(over.id);
  
    const activeContainer = active.data.current?.sortable.containerId;
    const overContainer = over.data.current?.sortable?.containerId || over.id;
  
    if (!activeContainer || !overContainer || activeId === overId) {
      return;
    }
  
    const newProductsByCategoryState = { ...productsByCategory };
    const sourceItems = Array.from(newProductsByCategoryState[activeContainer] || []);
    const destinationItems = Array.from(newProductsByCategoryState[overContainer] || []);
    const activeIndex = sourceItems.findIndex(item => item.id === activeId);
    const overIndex = destinationItems.findIndex(item => item.id === overId);
    const draggedItem = sourceItems[activeIndex];
  
    if (activeContainer === overContainer) {
      newProductsByCategoryState[activeContainer] = arrayMove(sourceItems, activeIndex, overIndex);
    } else {
      newProductsByCategoryState[activeContainer] = sourceItems.filter(item => item.id !== activeId);
      destinationItems.splice(overIndex >= 0 ? overIndex : destinationItems.length, 0, draggedItem);
      newProductsByCategoryState[overContainer] = destinationItems;
    }
  
    setProductsByCategory(newProductsByCategoryState);
  
    try {
      const updates = [];
      if (activeContainer === overContainer) {
        newProductsByCategoryState[activeContainer].forEach((product, index) => {
          updates.push(supabase.from('products').update({ display_order: index }).eq('id', product.id));
        });
      } else {
        updates.push(supabase.from('products').update({ category_id: overContainer }).eq('id', activeId));
        newProductsByCategoryState[activeContainer].forEach((product, index) => {
          updates.push(supabase.from('products').update({ display_order: index }).eq('id', product.id));
        });
        newProductsByCategoryState[overContainer].forEach((product, index) => {
          updates.push(supabase.from('products').update({ display_order: index }).eq('id', product.id));
        });
      }
      await Promise.all(updates);
      refreshPreview();
    } catch (error) {
      console.error("Drag-and-drop update failed:", error);
      fetchData();
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const table = itemToDelete.type === 'product' ? 'products' : 'categories';
      await supabase.from(table).delete().eq('id', itemToDelete.id);
      fetchData();
      refreshPreview();
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const openDeleteModal = (type: 'product' | 'category', id: string) => {
    setItemToDelete({ type, id });
    setIsDeleteModalOpen(true);
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Yükleniyor...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-grow bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">Hoş geldiniz, {session?.user?.email}</h2>
            <p className="text-base mb-6">Yönetilen İşletme: <span className="font-bold">{business?.name || 'İşletmeniz'}</span></p>

            <div className="border-b border-gray-200 mb-4 overflow-x-auto">
              <div className="flex -mb-px">
                <button className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'products' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`} onClick={() => setActiveTab('products')}>Ürünler</button>
                <button className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'categories' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`} onClick={() => setActiveTab('categories')}>Kategoriler</button>
                <button className={`py-2 px-4 font-medium whitespace-nowrap ${activeTab === 'settings' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`} onClick={() => setActiveTab('settings')}>Ayarlar</button>
              </div>
            </div>
            
            {isLoadingData ? <div className="flex justify-center items-center h-40"><div className="text-lg">Veriler yükleniyor...</div></div>
              : activeTab === 'settings' ? (
                <div>
                    <h3 className="text-lg font-medium">Görünüm Ayarları</h3>
                    <p className="text-sm text-gray-500 mb-4">Menünüzün kapak fotoğrafını ve sosyal medya linklerini güncelleyin.</p>
                    {business ? <SettingsForm initialBusiness={business} onUpdate={() => { fetchData(); refreshPreview(); }} /> : <p>Ayarlar yükleniyor...</p>}
                </div>
              ) : (
                <>
                  <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <h3 className="text-lg font-medium">{activeTab === 'products' ? 'Ürün Yönetimi' : 'Kategori Yönetimi'}</h3>
                    <button onClick={() => router.push(`/admin/${activeTab}/new`)} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 w-full sm:w-auto">
                      {activeTab === 'products' ? 'Yeni Ürün Ekle' : 'Yeni Kategori Ekle'}
                    </button>
                  </div>
                  {activeTab === 'products' ? (
                    <DndContext sensors={sensors} collisionDetection={rectIntersection} onDragEnd={handleProductDragEnd}>
                      <div className="space-y-8">
                        {categories.map(category => (
                          <CategoryDropZone
                            key={category.id}
                            id={category.id}
                            category={category}
                            products={productsByCategory[category.id] || []}
                            openDeleteModal={openDeleteModal}
                            onStatusChange={handleStatusChange}
                          />
                        ))}
                      </div>
                    </DndContext>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                      <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        <table className="min-w-full responsive-table">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İsim</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sıralama</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y sm:divide-y-0 divide-gray-200">
                            {categories.map((category) => <CategoryRow key={category.id} id={category.id} category={category} openDeleteModal={openDeleteModal} onStatusChange={handleStatusChange} />)}
                          </tbody>
                        </table>
                      </SortableContext>
                    </DndContext>
                  )}
                </>
              )}
          </div>
          
          <div className="lg:sticky lg:top-6 flex-shrink-0 w-full lg:w-1/3">
            <div className="bg-white shadow rounded-lg p-4">
              <h2 className="text-xl font-semibold mb-4">Müşteri Menü Önizlemesi</h2>
              <iframe src={`/?key=${previewKey}`} className="w-full h-[500px] sm:h-[600px] border border-gray-200 rounded" title="Müşteri Menü Önizlemesi" />
            </div>
          </div>
        </div>
      </div>

      <SimpleModal isOpen={isDeleteModalOpen} title={`${itemToDelete?.type === 'product' ? 'Ürünü' : 'Kategoriyi'} Sil`} message={`Bu ${itemToDelete?.type === 'product' ? 'ürünü' : 'kategoriyi'} silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`} confirmText="Sil" cancelText="İptal" onConfirm={handleDelete} onCancel={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }} />
    </div>
  );
}
