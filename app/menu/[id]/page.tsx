'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../lib/axios';
import { fadeUp, stagger } from '../../lib/animations';

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string;
    stock: number;
    category: { name: string };
}

interface Review {
    id: number;
    rating: number;
    comment: string;
    created_at: string;
    user: { name: string };
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
            <span key={star} className={`text-2xl ${star <= rating ? 'text-amber-400' : 'text-stone-200'}`}>★</span>
        ))}
    </div>
);

export default function ProductDetailPage() {
    const { id } = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [avgRating, setAvgRating] = useState(0);
    const [loading, setLoading] = useState(true);
    const [addingToCart, setAddingToCart] = useState(false);
    const [toast, setToast] = useState('');

    const isLoggedIn = typeof window !== 'undefined' && !!localStorage.getItem('token');

    useEffect(() => {
        fetchProduct();
        fetchReviews();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const res = await api.get(`/products/${id}`);
            setProduct(res.data);
        } finally {
            setLoading(false);
        }
    };

    const fetchReviews = async () => {
        try {
            const res = await api.get(`/products/${id}/reviews`);
            setReviews(res.data.reviews);
            setAvgRating(res.data.avg_rating);
        } catch {}
    };

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const addToCart = async () => {
        if (!isLoggedIn) { window.location.href = '/login'; return; }
        setAddingToCart(true);
        try {
            await api.post('/cart', { product_id: id, quantity: 1 });
            showToast('Berhasil ditambahkan ke keranjang! 🛒');
        } catch {
            showToast('Gagal menambahkan ke keranjang');
        } finally {
            setAddingToCart(false);
        }
    };

    if (loading) return (
        <main className="min-h-screen bg-amber-50">
            <Navbar />
            <div className="text-center py-40 text-amber-700">Loading...</div>
            <Footer />
        </main>
    );

    if (!product) return (
        <main className="min-h-screen bg-amber-50">
            <Navbar />
            <div className="text-center py-40 text-stone-500">Product not found</div>
            <Footer />
        </main>
    );

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

            {/* Product Detail */}
            <section className="py-16 px-6 max-w-5xl mx-auto">
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 gap-12 bg-white rounded-3xl shadow-md overflow-hidden"
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                >
                    <motion.div variants={fadeUp} className="h-80 md:h-full bg-amber-100 overflow-hidden">
                        {product.image ? (
                            <img src={`http://coffee-backend.test/storage/${product.image}`} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-8xl">☕</div>
                        )}
                    </motion.div>

                    <motion.div variants={fadeUp} className="p-8 flex flex-col justify-center">
                        <span className="text-xs text-amber-600 font-semibold uppercase tracking-wider mb-2">{product.category?.name}</span>
                        <h1 className="text-3xl font-bold text-stone-800 mb-3 font-serif">{product.name}</h1>

                        <div className="flex items-center gap-2 mb-4">
                            <StarRating rating={Math.round(avgRating)} />
                            <span className="text-stone-500 text-sm">
                                {avgRating > 0 ? `${avgRating} (${reviews.length} ulasan)` : 'Belum ada ulasan'}
                            </span>
                        </div>

                        <p className="text-stone-500 leading-relaxed mb-6">{product.description}</p>

                        <div className="flex justify-between items-center mb-6">
                            <span className="text-3xl font-bold text-amber-700">{formatRupiah(product.price)}</span>
                            <span className={`text-sm px-3 py-1 rounded-full ${product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {product.stock > 0 ? `Stok: ${product.stock}` : 'Habis'}
                            </span>
                        </div>

                        <motion.button
                            onClick={addToCart}
                            disabled={addingToCart || product.stock === 0}
                            className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {product.stock === 0 ? 'Stok Habis' : addingToCart ? 'Menambahkan...' : '🛒 Tambah ke Keranjang'}
                        </motion.button>
                    </motion.div>
                </motion.div>
            </section>

            {/* Reviews Section */}
            <section className="py-16 px-6 max-w-5xl mx-auto">
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                    <motion.div variants={fadeUp} className="mb-8">
                        <h2 className="text-2xl font-bold text-stone-800 font-serif">Ulasan Pelanggan</h2>
                        <p className="text-stone-500 text-sm mt-1">{reviews.length} ulasan</p>
                    </motion.div>

                    {reviews.length === 0 ? (
                        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-12 text-center text-stone-400 shadow-sm">
                            <p className="text-4xl mb-3">⭐</p>
                            <p>Belum ada ulasan untuk produk ini</p>
                            <p className="text-sm mt-1">Beli produk ini dan beri ulasan dari halaman My Orders!</p>
                        </motion.div>
                    ) : (
                        <div className="space-y-4">
                            {reviews.map(review => (
                                <motion.div key={review.id} variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <p className="font-semibold text-stone-800">{review.user.name}</p>
                                            <p className="text-stone-400 text-xs mt-0.5">
                                                {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <StarRating rating={review.rating} />
                                    </div>
                                    {review.comment && (
                                        <p className="text-stone-600 text-sm leading-relaxed">{review.comment}</p>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </section>

            <Footer />
        </main>
    );
}