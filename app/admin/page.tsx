'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/axios';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string;
    image_url: string | null;
    is_active: boolean;
    is_featured: boolean;
    category: { id: number; name: string };
}

interface Category {
    id: number;
    name: string;
    description: string;
}

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    payment_status: string;
    notes: string;
    created_at: string;
    user: { name: string; email: string };
    items: { id: number; quantity: number; price: number; product: { name: string } }[];
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const timeAgo = (dateString: string) => {
    const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return 'baru saja';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} menit lalu`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return `${Math.floor(hours / 24)} hari lalu`;
};

const beep = (ctx: AudioContext) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.start();
    osc.stop(ctx.currentTime + 0.4);
};

export default function AdminPage() {
    const router = useRouter();
    const [tab, setTab] = useState<'products' | 'categories' | 'orders' | 'export'>('products');

    // Products state
    const [products, setProducts] = useState<Product[]>([]);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editProduct, setEditProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState({
        name: '', description: '', price: '', stock: '',
        category_id: '', is_featured: false, is_active: true,
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState('');
    const [savingProduct, setSavingProduct] = useState(false);

    // Categories state
    const [categories, setCategories] = useState<Category[]>([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editCategory, setEditCategory] = useState<Category | null>(null);
    const [categoryForm, setCategoryForm] = useState({ name: '', description: '' });
    const [savingCategory, setSavingCategory] = useState(false);

    // Orders state
    const [orders, setOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    // Export state
    const [exportPeriod, setExportPeriod] = useState('monthly');
    const [exportStartDate, setExportStartDate] = useState('');
    const [exportEndDate, setExportEndDate] = useState('');
    const [exportSummary, setExportSummary] = useState<any>(null);
    const [loadingExport, setLoadingExport] = useState(false);

    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState('');
    const audioCtxRef = useRef<AudioContext | null>(null);

    // Buka/unlock AudioContext begitu admin klik pertama kali di halaman,
    // karena browser memblokir audio yang diputar tanpa interaksi user.
    useEffect(() => {
        const unlock = () => {
            if (!audioCtxRef.current) {
                const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
                audioCtxRef.current = new AudioCtx();
            }
            if (audioCtxRef.current.state === 'suspended') {
                audioCtxRef.current.resume();
            }
        };
        document.addEventListener('click', unlock, { once: true });
        return () => document.removeEventListener('click', unlock);
    }, []);

    const playNotifySound = () => {
        try {
            const ctx = audioCtxRef.current;
            if (!ctx) return; // belum ke-unlock (belum ada klik sama sekali)
            if (ctx.state === 'suspended') {
                ctx.resume().then(() => beep(ctx));
            } else {
                beep(ctx);
            }
        } catch {
            // Web Audio tidak tersedia, abaikan
        }
    };

    useEffect(() => {
        const user = localStorage.getItem('user');
        if (!user) { router.push('/login'); return; }
        const parsed = JSON.parse(user);
        if (parsed.role !== 'admin') { router.push('/'); return; }
        fetchAll();
    }, []);

    // Polling ringan khusus order, biar order baru kedeteksi tanpa refresh manual
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await api.get('/admin/orders');
                const freshOrders: Order[] = res.data;
                setOrders(prev => {
                    const prevIds = new Set(prev.map(o => o.id));
                    const isNewIncoming = freshOrders.some(o => !prevIds.has(o.id));
                    if (isNewIncoming && prev.length > 0) {
                        playNotifySound();
                        showToast('🔔 Ada pesanan baru masuk!');
                    }
                    return freshOrders;
                });
            } catch {
                // biarin, coba lagi di polling berikutnya
            }
        }, 15000);
        return () => clearInterval(interval);
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [p, c] = await Promise.all([
                api.get('/admin/products'),
                api.get('/categories'),
            ]);
            setProducts(p.data || []);
            setCategories(c.data);
            const o = await api.get('/admin/orders').catch(() => ({ data: [] }));
            setOrders(o.data);
        } finally {
            setLoading(false);
        }
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    // ==================== PRODUCT FUNCTIONS ====================
    const openAddProduct = () => {
        setEditProduct(null);
        setProductForm({ name: '', description: '', price: '', stock: '', category_id: '', is_featured: false, is_active: true });
        setImageFile(null);
        setImagePreview('');
        setShowProductModal(true);
    };

    const openEditProduct = (product: Product) => {
        setEditProduct(product);
        setProductForm({
            name: product.name,
            description: product.description || '',
            price: String(product.price),
            stock: String(product.stock),
            category_id: String(product.category?.id),
            is_featured: product.is_featured,
            is_active: product.is_active,
        });
        setImagePreview(product.image_url ?? '');
        setImageFile(null);
        setShowProductModal(true);
    };

    const handleSaveProduct = async () => {
        setSavingProduct(true);
        try {
            const formData = new FormData();
            formData.append('name', productForm.name);
            formData.append('description', productForm.description);
            formData.append('price', productForm.price);
            formData.append('stock', productForm.stock);
            formData.append('category_id', productForm.category_id);
            formData.append('is_featured', productForm.is_featured ? '1' : '0');
            formData.append('is_active', productForm.is_active ? '1' : '0');
            if (imageFile) formData.append('image', imageFile);

            if (editProduct) {
                formData.append('_method', 'PUT');
                await api.post(`/admin/products/${editProduct.id}`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                showToast('Produk berhasil diupdate! ✅');
            } else {
                await api.post('/admin/products', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                showToast('Produk berhasil ditambahkan! ✅');
            }
            setShowProductModal(false);
            fetchAll();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Gagal menyimpan produk');
        } finally {
            setSavingProduct(false);
        }
    };

    const deleteProduct = async (id: number) => {
        if (!confirm('Hapus produk ini?')) return;
        await api.delete(`/admin/products/${id}`);
        showToast('Produk dihapus! 🗑️');
        fetchAll();
    };

    // ==================== CATEGORY FUNCTIONS ====================
    const openAddCategory = () => {
        setEditCategory(null);
        setCategoryForm({ name: '', description: '' });
        setShowCategoryModal(true);
    };

    const openEditCategory = (category: Category) => {
        setEditCategory(category);
        setCategoryForm({ name: category.name, description: category.description || '' });
        setShowCategoryModal(true);
    };

    const handleSaveCategory = async () => {
        setSavingCategory(true);
        try {
            if (editCategory) {
                await api.put(`/admin/categories/${editCategory.id}`, categoryForm);
                showToast('Kategori berhasil diupdate! ✅');
            } else {
                await api.post('/admin/categories', categoryForm);
                showToast('Kategori berhasil ditambahkan! ✅');
            }
            setShowCategoryModal(false);
            fetchAll();
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Gagal menyimpan kategori');
        } finally {
            setSavingCategory(false);
        }
    };

    const deleteCategory = async (id: number) => {
        if (!confirm('Hapus kategori ini?')) return;
        await api.delete(`/admin/categories/${id}`);
        showToast('Kategori dihapus! 🗑️');
        fetchAll();
    };

    // ==================== ORDER FUNCTIONS ====================
    const updateOrderStatus = async (id: number, status: string) => {
        await api.put(`/admin/orders/${id}`, { status });
        showToast('Status order diupdate! ✅');
        fetchAll();
        setSelectedOrder(null);
    };

    // ==================== EXPORT FUNCTIONS ====================
    const fetchSummary = async () => {
        setLoadingExport(true);
        try {
            const params: any = { period: exportPeriod };
            if (exportPeriod === 'custom') {
                params.start_date = exportStartDate;
                params.end_date = exportEndDate;
            }
            const res = await api.get('/admin/export/summary', { params });
            setExportSummary(res.data);
        } finally {
            setLoadingExport(false);
        }
    };

    const handleExportCSV = async () => {
        const params = new URLSearchParams({ period: exportPeriod });
        if (exportPeriod === 'custom') {
            params.append('start_date', exportStartDate);
            params.append('end_date', exportEndDate);
        }
        const token = localStorage.getItem('token');
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://coffee-backend.test/api';
        const url = `${apiBaseUrl}/admin/export/orders?${params}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
        const blob = await res.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `orders_${exportPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const statusColor: any = {
        pending: 'bg-yellow-100 text-yellow-700',
        processing: 'bg-blue-100 text-blue-700',
        completed: 'bg-green-100 text-green-700',
        cancelled: 'bg-red-100 text-red-700',
    };

    return (
        <main className="min-h-screen bg-stone-100">
            {/* Toast */}
            {toast && (
                <div className="fixed top-6 right-6 bg-stone-900 text-amber-50 px-6 py-3 rounded-full shadow-lg z-50">
                    {toast}
                </div>
            )}

            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-stone-800 mb-6">
                            {editProduct ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-stone-700 mb-2">Product Image</label>
                            <div
                                className="border-2 border-dashed border-stone-200 rounded-2xl h-48 flex items-center justify-center cursor-pointer hover:border-amber-400 transition overflow-hidden"
                                onClick={() => document.getElementById('imageInput')?.click()}
                            >
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-center text-stone-400">
                                        <p className="text-4xl mb-2">📷</p>
                                        <p className="text-sm">Click to upload image</p>
                                    </div>
                                )}
                            </div>
                            <input id="imageInput" type="file" accept="image/*" className="hidden" onChange={e => {
                                const file = e.target.files?.[0];
                                if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
                            }} />
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: 'Product Name', key: 'name', type: 'text' },
                                { label: 'Description', key: 'description', type: 'text' },
                                { label: 'Price (Rp)', key: 'price', type: 'number' },
                                { label: 'Stock', key: 'stock', type: 'number' },
                            ].map(field => (
                                <div key={field.key}>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">{field.label}</label>
                                    <input
                                        type={field.type}
                                        value={(productForm as any)[field.key]}
                                        onChange={e => setProductForm({ ...productForm, [field.key]: e.target.value })}
                                        className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                                <select
                                    value={productForm.category_id}
                                    onChange={e => setProductForm({ ...productForm, category_id: e.target.value })}
                                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                >
                                    <option value="">Select category</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-6">
                                <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                                    <input type="checkbox" checked={productForm.is_featured} onChange={e => setProductForm({ ...productForm, is_featured: e.target.checked })} className="accent-amber-500" />
                                    Featured
                                </label>
                                <label className="flex items-center gap-2 text-sm text-stone-700 cursor-pointer">
                                    <input type="checkbox" checked={productForm.is_active} onChange={e => setProductForm({ ...productForm, is_active: e.target.checked })} className="accent-amber-500" />
                                    Active
                                </label>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowProductModal(false)} className="flex-1 border border-stone-200 text-stone-700 py-3 rounded-xl hover:bg-stone-50 transition text-sm">Cancel</button>
                            <button onClick={handleSaveProduct} disabled={savingProduct} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 text-sm">
                                {savingProduct ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md">
                        <h2 className="text-xl font-bold text-stone-800 mb-6">
                            {editCategory ? 'Edit Category' : 'Add New Category'}
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Category Name</label>
                                <input
                                    type="text"
                                    value={categoryForm.name}
                                    onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                    placeholder="e.g. Coffee, Food, Pastry"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-stone-700 mb-1">Description (Optional)</label>
                                <textarea
                                    value={categoryForm.description}
                                    onChange={e => setCategoryForm({ ...categoryForm, description: e.target.value })}
                                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                    rows={3}
                                    placeholder="Category description..."
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => setShowCategoryModal(false)} className="flex-1 border border-stone-200 text-stone-700 py-3 rounded-xl hover:bg-stone-50 transition text-sm">Cancel</button>
                            <button onClick={handleSaveCategory} disabled={savingCategory} className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 text-sm">
                                {savingCategory ? 'Saving...' : 'Save Category'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                        <h2 className="text-xl font-bold text-stone-800 mb-2">Order #{selectedOrder.order_number}</h2>
                        <p className="text-stone-500 text-sm mb-1">{selectedOrder.user?.name} — {selectedOrder.user?.email}</p>
                        <p className="text-stone-400 text-xs mb-6">{timeAgo(selectedOrder.created_at)} · {selectedOrder.payment_status === 'paid' ? 'Lunas' : 'Belum Dibayar'}</p>
                        {selectedOrder.notes && (
                            <p className="bg-amber-50 text-amber-700 text-sm rounded-lg px-3 py-2 mb-4">📝 {selectedOrder.notes}</p>
                        )}
                        <div className="space-y-2 mb-6">
                            {selectedOrder.items?.map(item => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <span className="text-stone-700">{item.product?.name} x{item.quantity}</span>
                                    <span className="font-medium">{formatRupiah(item.price * item.quantity)}</span>
                                </div>
                            ))}
                            <div className="border-t pt-2 flex justify-between font-bold">
                                <span>Total</span>
                                <span>{formatRupiah(selectedOrder.total_amount)}</span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-stone-700 mb-3">Update Status:</p>
                            <div className="grid grid-cols-2 gap-2">
                                {['pending', 'processing', 'completed', 'cancelled'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => updateOrderStatus(selectedOrder.id, status)}
                                        className={`py-2 rounded-xl text-sm font-medium capitalize transition ${
                                            selectedOrder.status === status
                                                ? 'bg-amber-600 text-white'
                                                : 'border border-stone-200 text-stone-700 hover:bg-stone-50'
                                        }`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button onClick={() => setSelectedOrder(null)} className="w-full mt-4 border border-stone-200 text-stone-700 py-3 rounded-xl hover:bg-stone-50 transition text-sm">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* Layout */}
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside className="w-64 bg-stone-900 text-amber-50 flex flex-col p-6 fixed h-full">
                    <div className="mb-10">
                        <p className="text-2xl mb-1">☕</p>
                        <h1 className="text-lg font-bold text-amber-400">Mercys Admin</h1>
                        <p className="text-stone-400 text-xs mt-1">Management Panel</p>
                    </div>
                    <nav className="space-y-2 flex-1">
                        {[
                            { key: 'products', label: 'Products', icon: '📦' },
                            { key: 'categories', label: 'Categories', icon: '📂' },
                            { key: 'orders', label: 'Orders', icon: '📋' },
                            { key: 'export', label: 'Export', icon: '📊' },
                        ].map(item => (
                            <button key={item.key} onClick={() => setTab(item.key as any)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition relative ${tab === item.key ? 'bg-amber-600 text-white' : 'text-stone-400 hover:bg-stone-800'}`}>
                                <span>{item.icon}</span>
                                <span>{item.label}</span>
                                {item.key === 'orders' && orders.filter(o => o.status === 'pending').length > 0 && (
                                    <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                        {orders.filter(o => o.status === 'pending').length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>
                    <button onClick={() => router.push('/')} className="text-stone-400 hover:text-amber-400 text-sm transition text-left">← Back to Site</button>
                </aside>

                {/* Content */}
                <div className="ml-64 flex-1 p-8">

                    {/* Products Tab */}
                    {tab === 'products' && (
                        <div>
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-stone-800">Products</h2>
                                    <p className="text-stone-500 text-sm">{products.length} total products</p>
                                </div>
                                <button onClick={openAddProduct} className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-full text-sm font-medium transition">+ Add Product</button>
                            </div>
                            {loading ? (
                                <div className="text-center py-20 text-amber-700">Loading...</div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map(product => (
                                        <div key={product.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                            <div className="h-40 bg-amber-100 overflow-hidden">
                                                {product.image ? (
                                                    <img src={product.image_url ?? ''} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-5xl">☕</div>
                                                )}
                                            </div>
                                            <div className="p-4">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-stone-800 text-sm">{product.name}</h3>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${product.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{product.is_active ? 'Active' : 'Inactive'}</span>
                                                </div>
                                                <p className="text-amber-700 font-semibold text-sm mb-1">{formatRupiah(product.price)}</p>
                                                <p className="text-stone-400 text-xs mb-3">Stock: {product.stock}</p>
                                                <div className="flex gap-2">
                                                    <button onClick={() => openEditProduct(product)} className="flex-1 border border-stone-200 text-stone-700 py-1.5 rounded-lg text-xs hover:bg-stone-50 transition">Edit</button>
                                                    <button onClick={() => deleteProduct(product.id)} className="flex-1 border border-red-200 text-red-500 py-1.5 rounded-lg text-xs hover:bg-red-50 transition">Delete</button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Categories Tab */}
                    {tab === 'categories' && (
                        <div>
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-stone-800">Categories</h2>
                                    <p className="text-stone-500 text-sm">{categories.length} total categories</p>
                                </div>
                                <button onClick={openAddCategory} className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-full text-sm font-medium transition">+ Add Category</button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {categories.map(cat => (
                                    <div key={cat.id} className="bg-white rounded-2xl p-5 shadow-sm">
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">📂</span>
                                                <h3 className="font-bold text-stone-800">{cat.name}</h3>
                                            </div>
                                        </div>
                                        {cat.description && <p className="text-stone-400 text-xs mb-3">{cat.description}</p>}
                                        <div className="flex gap-2 mt-3">
                                            <button onClick={() => openEditCategory(cat)} className="flex-1 border border-stone-200 text-stone-700 py-1.5 rounded-lg text-xs hover:bg-stone-50 transition">Edit</button>
                                            <button onClick={() => deleteCategory(cat.id)} className="flex-1 border border-red-200 text-red-500 py-1.5 rounded-lg text-xs hover:bg-red-50 transition">Delete</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Orders Tab */}
                    {tab === 'orders' && (
                        <div>
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h2 className="text-2xl font-bold text-stone-800">Orders</h2>
                                    <p className="text-stone-500 text-sm">{orders.length} total orders · update otomatis tiap 15 detik</p>
                                </div>
                            </div>
                            {orders.length === 0 ? (
                                <div className="bg-white rounded-2xl p-12 text-center text-stone-400">
                                    <p className="text-4xl mb-3">📋</p>
                                    <p>No orders yet</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {[
                                        { status: 'pending', label: 'Pending', next: 'processing', nextLabel: 'Mulai Proses →' },
                                        { status: 'processing', label: 'Processing', next: 'completed', nextLabel: 'Selesai ✓' },
                                        { status: 'completed', label: 'Completed', next: null, nextLabel: '' },
                                    ].map(col => {
                                        const columnOrders = orders
                                            .filter(o => o.status === col.status)
                                            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
                                        return (
                                            <div key={col.status} className="bg-stone-100 rounded-2xl p-4">
                                                <div className="flex items-center justify-between mb-4 px-1">
                                                    <h3 className="font-bold text-stone-700">{col.label}</h3>
                                                    <span className="bg-white text-stone-500 text-xs font-semibold px-2 py-1 rounded-full">{columnOrders.length}</span>
                                                </div>
                                                <div className="space-y-3 max-h-[70vh] overflow-y-auto">
                                                    {columnOrders.length === 0 ? (
                                                        <p className="text-stone-400 text-xs text-center py-6">Tidak ada order</p>
                                                    ) : columnOrders.map(order => (
                                                        <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <button onClick={() => setSelectedOrder(order)} className="font-semibold text-stone-800 text-sm hover:text-amber-600 text-left">
                                                                    #{order.order_number}
                                                                </button>
                                                                <span className="text-stone-400 text-xs whitespace-nowrap">{timeAgo(order.created_at)}</span>
                                                            </div>
                                                            <p className="text-stone-500 text-xs mb-2">{order.user?.name}</p>
                                                            <div className="space-y-0.5 mb-2">
                                                                {order.items?.map(item => (
                                                                    <p key={item.id} className="text-stone-700 text-xs">{item.quantity}x {item.product?.name}</p>
                                                                ))}
                                                            </div>
                                                            {order.notes && (
                                                                <p className="bg-amber-50 text-amber-700 text-xs rounded-lg px-2 py-1.5 mb-2">📝 {order.notes}</p>
                                                            )}
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="font-semibold text-amber-700 text-sm">{formatRupiah(order.total_amount)}</span>
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                    {order.payment_status === 'paid' ? 'Lunas' : 'Belum Bayar'}
                                                                </span>
                                                            </div>
                                                            {col.next && (
                                                                <button
                                                                    onClick={() => updateOrderStatus(order.id, col.next!)}
                                                                    className="w-full bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium py-2 rounded-lg transition"
                                                                >
                                                                    {col.nextLabel}
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Export Tab */}
                    {tab === 'export' && (
                        <div>
                            <div className="mb-8">
                                <h2 className="text-2xl font-bold text-stone-800">Export Orders</h2>
                                <p className="text-stone-500 text-sm">Export dan lihat ringkasan order</p>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                                <h3 className="font-bold text-stone-800 mb-4">Filter Periode</h3>
                                <div className="flex flex-wrap gap-3 mb-4">
                                    {[
                                        { key: 'daily', label: 'Hari Ini' },
                                        { key: 'weekly', label: 'Minggu Ini' },
                                        { key: 'monthly', label: 'Bulan Ini' },
                                        { key: 'custom', label: 'Custom' },
                                    ].map(period => (
                                        <button key={period.key} onClick={() => setExportPeriod(period.key)} className={`px-5 py-2 rounded-full text-sm font-medium transition ${exportPeriod === period.key ? 'bg-stone-900 text-amber-50' : 'bg-stone-100 text-stone-700 hover:bg-stone-200'}`}>
                                            {period.label}
                                        </button>
                                    ))}
                                </div>
                                {exportPeriod === 'custom' && (
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Dari Tanggal</label>
                                            <input type="date" value={exportStartDate} onChange={e => setExportStartDate(e.target.value)} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1">Sampai Tanggal</label>
                                            <input type="date" value={exportEndDate} onChange={e => setExportEndDate(e.target.value)} className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400" />
                                        </div>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button onClick={fetchSummary} disabled={loadingExport} className="bg-stone-900 hover:bg-stone-700 text-amber-50 px-6 py-2.5 rounded-full text-sm font-medium transition disabled:opacity-50">
                                        {loadingExport ? 'Loading...' : '📊 Lihat Summary'}
                                    </button>
                                    <button onClick={handleExportCSV} className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-2.5 rounded-full text-sm font-medium transition">
                                        📥 Export CSV
                                    </button>
                                </div>
                            </div>

                            {exportSummary && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Total Orders', value: exportSummary.total_orders, icon: '📋' },
                                            { label: 'Total Revenue', value: formatRupiah(exportSummary.total_revenue), icon: '💰' },
                                            { label: 'Completed', value: exportSummary.completed_orders, icon: '✅' },
                                            { label: 'Pending', value: exportSummary.pending_orders, icon: '⏳' },
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm text-center">
                                                <p className="text-3xl mb-2">{stat.icon}</p>
                                                <p className="font-bold text-stone-800 text-lg">{stat.value}</p>
                                                <p className="text-stone-400 text-xs">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                        <div className="p-5 border-b border-stone-100">
                                            <h3 className="font-bold text-stone-800">Detail Orders</h3>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full">
                                                <thead className="bg-stone-50">
                                                    <tr>
                                                        <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase">Order</th>
                                                        <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase">Customer</th>
                                                        <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase">Total</th>
                                                        <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase">Status</th>
                                                        <th className="text-left px-6 py-3 text-xs font-semibold text-stone-500 uppercase">Tanggal</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-stone-50">
                                                    {exportSummary.orders.map((order: any, i: number) => (
                                                        <tr key={i} className="hover:bg-stone-50">
                                                            <td className="px-6 py-3 text-sm font-medium text-stone-800">#{order.order_number}</td>
                                                            <td className="px-6 py-3 text-sm text-stone-600">{order.customer}</td>
                                                            <td className="px-6 py-3 text-sm font-semibold text-amber-700">{formatRupiah(order.total)}</td>
                                                            <td className="px-6 py-3">
                                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColor[order.status]}`}>{order.status}</span>
                                                            </td>
                                                            <td className="px-6 py-3 text-sm text-stone-500">{order.date}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}