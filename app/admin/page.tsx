'use client'

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product, Category, Profile } from '@/lib/types';
import SimpleModal from '@/components/SimpleModal';
import Switch from '@/components/Switch';
import SettingsForm from '@/components/SettingsForm';
import {
  DndContext,
  closestCenter,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
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

function CategoryRow({ id, category, openDeleteModal, onStatusChange }: { id: string, category: Category, openDeleteModal: Function, onStatusChange: Function }) {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <tr ref={setNodeRef} style={style} {...attributes}>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div {...listeners} className="cursor-move mr-2">
            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" /></svg>
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{category.name}</div>
            <div className="text-sm text-gray-500 line-clamp-1">{category.description}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{category.display_order}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <Switch
            checked={category.is_available}
            onChange={(newStatus) => onStatusChange('category', category.id, newStatus)}
        />
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button onClick={() => router.push(`/admin/categories/${category.id}/edit`)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
        <button onClick={() => openDeleteModal('category', category.id)} className="text-red-600 hover:text-red-900">Delete</button>
      </td>
    </tr>
  );
}

function ProductRow({ id, product, openDeleteModal, onStatusChange }: { id: string, product: Product, openDeleteModal: Function, onStatusChange: Function }) {
    const router = useRouter();
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
    const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, zIndex: isDragging ? 10 : 0 };
    
    return(
        <div ref={setNodeRef} style={style} {...attributes} className="p-2 border rounded bg-white flex items-center justify-between shadow-sm">
            <div className="flex items-center">
                <div {...listeners} className="cursor-grab p-2"><svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" /></svg></div>
                {product.image_url && <img className="h-10 w-10 rounded-full object-cover mr-4" src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${product.image_url}`} alt={product.name} />}
                <div>
                    <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    <div className="text-sm text-gray-500">${product.price.toFixed(2)}</div>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                <Switch
                    checked={product.is_available}
                    onChange={(newStatus) => onStatusChange('product', product.id, newStatus)}
                />
                <button onClick={() => router.push(`/admin/products/${product.id}/edit`)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                <button onClick={() => openDeleteModal('product', product.id)} className="text-red-600 hover:text-red-900">Delete</button>
            </div>
        </div>
    );
}

function CategoryDropZone({ id, category, products, openDeleteModal, onStatusChange }: { id: string, category: Category, products: Product[], openDeleteModal: Function, onStatusChange: Function }) {
  const { setNodeRef } = useDroppable({
    id,
  });

  return (
    <div key={id}>
      <h4 className="text-lg font-bold mb-2 p-2">{category.name}</h4>
      <SortableContext id={id} items={products.map(p => p.id)} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className="space-y-2 min-h-[50px] bg-gray-50 p-2 rounded-md border">
          {products.map(product => <ProductRow key={product.id} id={product.id} product={product} openDeleteModal={openDeleteModal} onStatusChange={onStatusChange} />)}
          {products.length === 0 && (
            <div className="flex items-center justify-center h-full text-sm text-gray-400">
              Bu kategoriye ürün sürükleyin
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}


export default function AdminDashboard() {
  const { session, isLoading } = useAuth();
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const businessName = process.env.NEXT_PUBLIC_BUSINESS_NAME || 'Our Business';
  
  const [activeTab, setActiveTab] = useState<'products' | 'categories' | 'settings'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{type: 'product' | 'category', id: string} | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [previewKey, setPreviewKey] = useState(Date.now());

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates, })
  );

  const refreshPreview = useCallback(() => { setPreviewKey(Date.now()); }, []);

  // --- GÜNCELLENMİŞ VE HATASI GİDERİLMİŞ VERİ ÇEKME FONKSİYONU ---
  const fetchData = useCallback(async () => {
    setIsLoadingData(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setIsLoadingData(false);
          return;
        }

        const [productsRes, categoriesRes, profileRes] = await Promise.all([
            supabase.from('products').select('*').order('display_order', { ascending: true }),
            supabase.from('categories').select('*').order('display_order', { ascending: true }),
            // .single() komutu, satır bulunamadığında hata verdiği için bu şekilde daha güvenli bir sorgu yapıyoruz.
            supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
        ]);

        if (productsRes.error) throw productsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;
        
        // .maybeSingle() kullandığımız için artık profil bulunamasa bile hata almayız.
        if (profileRes.error) throw profileRes.error;

        setProducts(productsRes.data || []);
        setCategories(categoriesRes.data || []);
        setProfile(profileRes.data || null);

    } catch (error) {
        console.error("Error fetching dashboard data:", error);
    } finally {
        // Bu blok, hata olsa da olmasa da çalışır ve sayfanın takılı kalmasını engeller.
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

  const handleStatusChange = async (type: 'product' | 'category', id: string, newStatus: boolean) => {
    const table = type === 'product' ? 'products' : 'categories';
  
    if (type === 'product') {
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_available: newStatus } : p));
    } else {
      setCategories(prev => prev.map(c => c.id === id ? { ...c, is_available: newStatus } : c));
    }
  
    const { error } = await supabase
      .from(table)
      .update({ is_available: newStatus })
      .eq('id', id);
  
    if (error) {
      console.error(`Error updating ${type} status:`, error);
      fetchData(); 
    } else {
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
        } catch (error) {
            console.error("Failed to update category order in DB:", error);
            fetchData(); 
            return;
        }
        refreshPreview();
    }
  };

  const handleProductDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeProduct = products.find(p => p.id === active.id);
    if (!activeProduct) return;

    const originalProducts = [...products];

    if (products.some(p => p.id === over.id)) {
        const oldIndex = products.findIndex((p) => p.id === active.id);
        const newIndex = products.findIndex((p) => p.id === over.id);

        if (oldIndex !== newIndex) {
            const newOrderedProducts = arrayMove(products, oldIndex, newIndex);
            setProducts(newOrderedProducts);

            const updatePromises = newOrderedProducts.map((product, index) =>
                supabase.from('products').update({ 
                  display_order: index,
                  category_id: product.category_id
                }).eq('id', product.id)
            );
            
            try {
                await Promise.all(updatePromises);
            } catch (error) {
                console.error("Failed to reorder products in DB:", error);
                setProducts(originalProducts);
                return;
            }
            refreshPreview();
        }
    } else if (categories.some(c => c.id === over.id)) {
        const newCategoryId = over.id.toString();
        if (activeProduct.category_id !== newCategoryId) {
            const movedProductList = products.map(p => 
                p.id === active.id ? { ...p, category_id: newCategoryId } : p
            );
            setProducts(movedProductList);

            const updatePromises = movedProductList.map((product, index) =>
                supabase.from('products').update({
                  display_order: index,
                  category_id: product.category_id
                }).eq('id', product.id)
            );

            try {
                await Promise.all(updatePromises);
            } catch (error) {
                console.error("Failed to move product to new category:", error);
                setProducts(originalProducts);
                return;
            }
            refreshPreview();
        }
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'product') {
        await supabase.from('products').delete().eq('id', itemToDelete.id);
      } else {
        await supabase.from('categories').delete().eq('id', itemToDelete.id);
      }
      await fetchData();
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

  const productsByCategory = useMemo(() => {
    return categories.reduce((acc, category) => {
      acc[category.id] = products.filter(p => p.category_id && p.category_id === category.id);
      return acc;
    }, {} as ProductsByCategory);
  }, [categories, products]);

  const uncategorizedProducts = useMemo(() => 
    products.filter(p => !p.category_id || !categories.some(c => c.id === p.category_id)),
    [products, categories]
  );
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-xl">Loading dashboard...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ---- BU BÖLÜM KALDIRILDI ----
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">Logout</button>
        </div>
        --------------------------- */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Welcome, {session?.user?.email}</h2>
            <p className="text-lg mb-6">You are managing <span className="font-bold">{businessName}</span></p>

            <div className="flex border-b border-gray-200 mb-4">
              <button className={`py-2 px-4 font-medium ${activeTab === 'products' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`} onClick={() => setActiveTab('products')}>Products</button>
              <button className={`py-2 px-4 font-medium ${activeTab === 'categories' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`} onClick={() => setActiveTab('categories')}>Categories</button>
              <button className={`py-2 px-4 font-medium ${activeTab === 'settings' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`} onClick={() => setActiveTab('settings')}>Settings</button>
            </div>
            
            {isLoadingData ? <div className="flex justify-center items-center h-40"><div className="text-lg">Loading data...</div></div>
              : activeTab === 'settings' ? (
                <div>
                    <h3 className="text-lg font-medium">Appearance Settings</h3>
                    <p className="text-sm text-gray-500 mb-4">Update your menu's cover image and social links.</p>
                    {profile ? <SettingsForm initialProfile={profile} onUpdate={() => { fetchData(); refreshPreview(); }} /> : <p>Loading settings...</p>}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">{activeTab === 'products' ? 'Product Management' : 'Category Management'}</h3>
                    <button onClick={() => router.push(`/admin/${activeTab}/new`)} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                      {activeTab === 'products' ? 'New Product' : 'New Category'}
                    </button>
                  </div>
                  {activeTab === 'products' ? (
                    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleProductDragEnd}>
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
                        {uncategorizedProducts.length > 0 && (
                            <div>
                              <h4 className="text-lg font-bold mb-2 p-2 text-gray-500">Uncategorized</h4>
                              <div className="space-y-2">
                                {uncategorizedProducts.map(product => <ProductRow key={product.id} id={product.id} product={product} openDeleteModal={openDeleteModal} onStatusChange={handleStatusChange} />)}
                              </div>
                            </div>
                        )}
                      </div>
                    </DndContext>
                  ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoryDragEnd}>
                      <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {categories.map((category) => <CategoryRow key={category.id} id={category.id} category={category} openDeleteModal={openDeleteModal} onStatusChange={handleStatusChange} />)}
                          </tbody>
                        </table>
                      </SortableContext>
                    </DndContext>
                  )}
                </>
              )}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Customer Menu Preview</h2>
              <iframe src={`/?key=${previewKey}`} className="w-full h-[600px] border border-gray-200 rounded" title="Customer Menu Preview" />
            </div>
          </div>
        </div>
      </div>

      <SimpleModal isOpen={isDeleteModalOpen} title={`Delete ${itemToDelete?.type}`} message={`Are you sure you want to delete this ${itemToDelete?.type}? This action cannot be undone.`} confirmText="Delete" cancelText="Cancel" onConfirm={handleDelete} onCancel={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }} />
    </div>
  );
}