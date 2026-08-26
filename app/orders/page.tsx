'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../lib/axios';
import { fadeUp, stagger } from '../lib/animations';

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    payment_status: string;
    created_at: string;
    items: {
        id: number;
        quantity: number;
        product: { id: number; name: string; image: string };
    }[];
    reviews: { id: number; product_id: number }[];
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const statusColor: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const StarRating = ({ rating, onRate }: { rating: number; onRate: (r: number) => void }) => (
    <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
            <button
                key={star}
                onClick={() => onRate(star)}
                className={`text-2xl transition hover:scale-110 ${star <= rating ? 'text-amber-400' : 'text-stone-200'}`}
            >
                ★
            </button>
        ))}
    </div>
);

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [reviewModal, setReviewModal] = useState<{ orderId: number; product: { id: number; name: string } } | null>(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        api.get('/orders')
            .then(res => setOrders(res.data))
            .finally(() => setLoading(false));
    }, []);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(''), 3000);
    };

    const submitReview = async () => {
        if (!reviewModal) return;
        setSubmitting(true);
        try {
            const res = await api.post('/reviews', {
                product_id: reviewModal.product.id,
                order_id: reviewModal.orderId,
                rating: reviewForm.rating,
                comment: reviewForm.comment,
            });
            showToast('Ulasan berhasil dikirim! ⭐');
            setOrders(prev => prev.map(o =>
                o.id === reviewModal.orderId
                    ? { ...o, reviews: [...o.reviews, res.data.review] }
                    : o
            ));
            setReviewModal(null);
            setReviewForm({ rating: 5, comment: '' });
        } catch (err: any) {
            showToast(err.response?.data?.message || 'Gagal mengirim ulasan');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-amber-50">
            <Navbar />

            {/* Toast */}
            {toast && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-24 right-6 bg-stone-900 text-amber-50 px-6 py-3 rounded-full shadow-lg z-50"
                >
                    {toast}
                </motion.div>
            )}

            {/* Review Modal */}
            <AnimatePresence>
                {reviewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-white rounded-3xl p-8 w-full max-w-md"
                        >
                            <h2 className="text-xl font-bold text-stone-800 mb-1 font-serif">Tulis Ulasan</h2>
                            <p className="text-stone-500 text-sm mb-6">{reviewModal.product.name}</p>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-2">Rating</label>
                                    <StarRating rating={reviewForm.rating} onRate={r => setReviewForm({ ...reviewForm, rating: r })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-stone-700 mb-1">Komentar (Opsional)</label>
                                    <textarea
                                        value={reviewForm.comment}
                                        onChange={e => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                        placeholder="Bagaimana pengalaman kamu dengan produk ini?"
                                        className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                        rows={4}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => { setReviewModal(null); setReviewForm({ rating: 5, comment: '' }); }}
                                    className="flex-1 border border-stone-200 text-stone-700 py-3 rounded-xl hover:bg-stone-50 transition text-sm"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={submitReview}
                                    disabled={submitting}
                                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 text-sm"
                                >
                                    {submitting ? 'Mengirim...' : 'Kirim Ulasan ⭐'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <section className="bg-stone-900 py-20 px-6 text-center">
                <motion.div initial="hidden" animate="visible" variants={stagger}>
                    <motion.p variants={fadeUp} className="text-amber-400 tracking-widest uppercase text-sm mb-3">Your History</motion.p>
                    <motion.h1 variants={fadeUp} className="text-4xl font-bold text-amber-50 font-serif">My Orders</motion.h1>
                </motion.div>
            </section>

            <section className="py-16 px-6 max-w-4xl mx-auto">
                {loading ? (
                    <div className="text-center py-20 text-amber-700">Loading...</div>
                ) : orders.length === 0 ? (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-20">
                        <p className="text-6xl mb-4">📋</p>
                        <p className="text-stone-500 text-lg mb-6">Belum ada order</p>
                        <Link href="/menu" className="bg-amber-600 text-white px-8 py-3 rounded-full hover:bg-amber-500 transition">
                            Order Sekarang
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={stagger}>
                        {orders.map(order => (
                            <motion.div
                                key={order.id}
                                variants={fadeUp}
                                whileHover={{ y: -2 }}
                                className="bg-white rounded-2xl shadow-sm overflow-hidden"
                            >
                                <div className="p-6">
                                    {/* Order Header */}
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <p className="font-bold text-stone-800">#{order.order_number}</p>
                                            <p className="text-stone-400 text-xs mt-1">
                                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                                    day: 'numeric', month: 'long', year: 'numeric',
                                                })}
                                            </p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColor[order.status]}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    {/* Items */}
                                    <div className="space-y-2 mb-4">
                                        {order.items.map(item => (
                                            <div key={item.id} className="flex items-center justify-between gap-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-amber-100 rounded-lg overflow-hidden flex-shrink-0">
                                                        {item.product?.image ? (
                                                            <img
                                                                src={`http://coffee-backend.test/storage/${item.product.image}`}
                                                                alt={item.product.name}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-lg">☕</div>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-stone-700">{item.product?.name} <span className="text-stone-400">x{item.quantity}</span></p>
                                                </div>

                                                {/* Tombol Review muncul kalau completed & belum direview */}
                                                {order.status === 'completed' && (
                                                    order.reviews?.some(r => r.product_id === item.product.id) ? (
                                                        <span className="text-xs text-green-600 font-medium flex-shrink-0">✓ Sudah diulas</span>
                                                    ) : (
                                                        <button
                                                            onClick={() => setReviewModal({ orderId: order.id, product: { id: item.product.id, name: item.product.name } })}
                                                            className="text-xs text-amber-600 hover:text-amber-700 font-medium border border-amber-200 px-3 py-1 rounded-full hover:bg-amber-50 transition flex-shrink-0"
                                                        >
                                                            ⭐ Beri Ulasan
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Footer */}
                                    <div className="flex justify-between items-center border-t border-stone-100 pt-4">
                                        <p className="font-bold text-amber-700">{formatRupiah(order.total_amount)}</p>
                                        <Link
                                            href={`/orders/${order.id}`}
                                            className="bg-amber-600 hover:bg-amber-500 text-white text-sm px-5 py-2 rounded-full transition"
                                        >
                                            Detail →
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </section>

            <Footer />
        </main>
    );
}