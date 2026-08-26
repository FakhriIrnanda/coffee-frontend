'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../lib/axios';
import { fadeUp, stagger } from '../lib/animations';

interface CartItem {
    id: number;
    quantity: number;
    product: { id: number; name: string; price: number; image: string; image_url: string | null };
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function CheckoutPage() {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        api.get('/cart').then(res => setCart(res.data)).finally(() => setFetching(false));
    }, []);

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const total = subtotal;

    const handleCheckout = async () => {
        setLoading(true);
        try {
            const res = await api.post('/orders', { notes });
            router.push(`/orders/${res.data.order.id}`);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Checkout gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-amber-50">
            <Navbar />

            <section className="bg-stone-900 py-20 px-6 text-center">
                <motion.div initial="hidden" animate="visible" variants={stagger}>
                    <motion.p variants={fadeUp} className="text-amber-400 tracking-widest uppercase text-sm mb-3">Almost There</motion.p>
                    <motion.h1 variants={fadeUp} className="text-4xl font-bold text-amber-50" style={{fontFamily: 'Georgia, serif'}}>Checkout</motion.h1>
                </motion.div>
            </section>

            <section className="py-16 px-6 max-w-5xl mx-auto">
                {fetching ? (
                    <div className="text-center py-20 text-amber-700">Loading...</div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left - Order Details */}
                        <motion.div
                            className="lg:col-span-2 space-y-6"
                            initial="hidden"
                            animate="visible"
                            variants={stagger}
                        >
                            {/* Items */}
                            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="font-bold text-stone-800 text-lg mb-4">Order Items</h2>
                                <div className="space-y-3">
                                    {cart.map(item => (
                                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-amber-100 rounded-lg overflow-hidden">
                                                    {item.product.image ? (
                                                        <img src={item.product.image_url ?? ''} alt={item.product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">☕</div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-stone-800 text-sm">{item.product.name}</p>
                                                    <p className="text-stone-400 text-xs">x{item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-semibold text-stone-800 text-sm">
                                                {formatRupiah(item.product.price * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Notes */}
                            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm">
                                <h2 className="font-bold text-stone-800 text-lg mb-4">Catatan (Opsional)</h2>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Contoh: less sugar, extra hot, tanpa es..."
                                    className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                                    rows={3}
                                />
                            </motion.div>
                        </motion.div>

                        {/* Right - Summary */}
                        <motion.div
                            className="bg-white rounded-2xl p-6 shadow-sm h-fit"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h2 className="font-bold text-stone-800 text-lg mb-4">Summary</h2>
                            <div className="space-y-2 text-sm text-stone-600 mb-4">
                                <div className="flex justify-between">
                                    <span>Subtotal ({cart.length} items)</span>
                                    <span>{formatRupiah(subtotal)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Service Fee</span>
                                    <span>Rp 0</span>
                                </div>
                            </div>
                            <div className="border-t border-stone-100 pt-4 flex justify-between font-bold text-stone-800 text-lg">
                                <span>Total</span>
                                <span>{formatRupiah(total)}</span>
                            </div>
                            <div className="mt-6 space-y-2">
                                <p className="text-xs text-stone-400 text-center mb-2">Payment Method</p>
                                <div className="border border-amber-200 bg-amber-50 rounded-xl p-3 text-center text-sm text-amber-800 font-medium">
                                    💳 QRIS / Virtual Account / GoPay
                                </div>
                            </div>
                            <motion.button
                                onClick={handleCheckout}
                                disabled={loading || cart.length === 0}
                                className="w-full mt-6 bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? 'Processing...' : 'Place Order'}
                            </motion.button>
                        </motion.div>
                    </div>
                )}
            </section>
            <Footer />
        </main>
    );
}