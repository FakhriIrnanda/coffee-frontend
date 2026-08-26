'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../lib/axios';
import { fadeUp, stagger, scaleIn } from '../lib/animations';

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string;
    image_url: string | null;
    stock: number;
    category: { id: number; name: string };
}

interface Category {
    id: number;
    name: string;
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function MenuPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [addingId, setAddingId] = useState<number | null>(null);
    const [toast, setToast] = useState('');

    useEffect(() => {
        api.get('/categories').then(res => setCategories(res.data));
    }, []);

    useEffect(() => {
        setLoading(true);
        const params: any = {};
        if (selectedCategory) params.category_id = selectedCategory;
        if (search) params.search = search;
        api.get('/products', { params })
            .then(res => setProducts(res.data.data || []))
            .finally(() => setLoading(false));
    }, [selectedCategory, search]);

    const addToCart = async (e: React.MouseEvent, productId: number) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        if (!token) { window.location.href = '/login'; return; }
        setAddingId(productId);
        try {
            await api.post('/cart', { product_id: productId, quantity: 1 });
            setToast('Berhasil ditambahkan ke keranjang! 🛒');
            setTimeout(() => setToast(''), 3000);
        } catch {
            setToast('Gagal menambahkan ke keranjang');
            setTimeout(() => setToast(''), 3000);
        } finally {
            setAddingId(null);
        }
    };

    return (
        <main className="min-h-screen bg-amber-50">
            <Navbar />

            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-24 right-6 bg-stone-900 text-amber-50 px-6 py-3 rounded-full shadow-lg z-50"
                >
                    {toast}
                </motion.div>
            )}

            {/* Header */}
            <section className="bg-stone-900 py-24 px-6 text-center">
                <motion.div initial="hidden" animate="visible" variants={stagger}>
                    <motion.p variants={fadeUp} className="text-amber-400 tracking-widest uppercase text-sm mb-3">What We Offer</motion.p>
                    <motion.h1 variants={fadeUp} className="text-5xl font-bold text-amber-50 mb-4 font-serif">Our Menu</motion.h1>
                    <motion.p variants={fadeUp} className="text-stone-400 max-w-md mx-auto">
                        From our signature espresso to freshly baked pastries, explore everything Mercys has to offer.
                    </motion.p>
                </motion.div>
            </section>

            {/* Filter & Search */}
            <section className="py-10 px-6 bg-amber-100 sticky top-16 z-40 shadow-sm">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex gap-2 flex-wrap justify-center">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`px-5 py-2 rounded-full text-sm font-medium transition ${selectedCategory === null ? 'bg-stone-900 text-amber-50' : 'bg-white text-stone-700 hover:bg-stone-100'}`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition ${selectedCategory === cat.id ? 'bg-stone-900 text-amber-50' : 'bg-white text-stone-700 hover:bg-stone-100'}`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                    <input
                        type="text"
                        placeholder="Search menu..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border border-stone-300 rounded-full px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-full md:w-64 bg-white"
                    />
                </div>
            </section>

            {/* Products */}
            <section className="py-16 px-6">
                <div className="max-w-6xl mx-auto">
                    {loading ? (
                        <div className="text-center py-20 text-amber-700">Loading menu...</div>
                    ) : products.length === 0 ? (
                        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-20">
                            <p className="text-6xl mb-4">☕</p>
                            <p className="text-stone-500 text-lg">No products found.</p>
                        </motion.div>
                    ) : (
                        <motion.div
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                            initial="hidden"
                            animate="visible"
                            variants={stagger}
                        >
                            {products.map(product => (
                                <Link href={`/menu/${product.id}`} key={product.id}>
                                    <motion.div
                                        variants={scaleIn}
                                        whileHover={{ y: -5 }}
                                        className="bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition group cursor-pointer"
                                    >
                                        <div className="h-52 bg-amber-100 overflow-hidden">
                                            {product.image ? (
                                                <img
                                                    src={product.image_url ?? ''}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-6xl">☕</div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <span className="text-xs text-amber-600 font-semibold uppercase tracking-wider">{product.category?.name}</span>
                                            <h3 className="text-base font-bold text-stone-800 mt-1 mb-1">{product.name}</h3>
                                            <p className="text-stone-500 text-xs line-clamp-2 mb-4">{product.description}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-amber-700 font-bold">{formatRupiah(product.price)}</span>
                                                <button
                                                    onClick={(e) => addToCart(e, product.id)}
                                                    disabled={addingId === product.id || product.stock === 0}
                                                    className="bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs px-4 py-2 rounded-full transition"
                                                >
                                                    {product.stock === 0 ? 'Habis' : addingId === product.id ? '...' : '+ Cart'}
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </Link>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            <Footer />
        </main>
    );
}