'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import api from '../lib/axios';
import { fadeUp, stagger, slideLeft } from '../lib/animations';

interface CartItem {
    id: number;
    quantity: number;
    product: { id: number; name: string; price: number; image: string; image_url: string | null; stock: number };
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

export default function CartPage() {
    const router = useRouter();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) { router.push('/login'); return; }
        fetchCart();
    }, []);

    const fetchCart = async () => {
        try {
            const res = await api.get('/cart');
            setCart(res.data);
        } finally {
            setLoading(false);
        }
    };

    const updateQty = async (id: number, quantity: number) => {
        if (quantity < 1) return;
        await api.put(`/cart/${id}`, { quantity });
        fetchCart();
    };

    const removeItem = async (id: number) => {
        await api.delete(`/cart/${id}`);
        fetchCart();
    };

    const total = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

    return (
        <main className="min-h-screen bg-amber-50">
            <Navbar />

            <section className="bg-stone-900 py-20 px-6 text-center">
                <motion.div initial="hidden" animate="visible" variants={stagger}>
                    <motion.p variants={fadeUp} className="text-amber-400 tracking-widest uppercase text-sm mb-3">Your Order</motion.p>
                    <motion.h1 variants={fadeUp} className="text-4xl font-bold text-amber-50" style={{fontFamily: 'Georgia, serif'}}>Your Cart</motion.h1>
                </motion.div>
            </section>

            <section className="py-16 px-6 max-w-5xl mx-auto">
                {loading ? (
                    <div className="text-center py-20 text-amber-700">Loading...</div>
                ) : cart.length === 0 ? (
                    <motion.div initial="hidden" animate="visible" variants={fadeUp} className="text-center py-20">
                        <p className="text-6xl mb-4">🛒</p>
                        <p className="text-stone-500 text-lg mb-6">Your cart is empty</p>
                        <Link href="/menu" className="bg-amber-600 text-white px-8 py-3 rounded-full hover:bg-amber-500 transition">
                            Browse Menu
                        </Link>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <motion.div className="lg:col-span-2 space-y-4" initial="hidden" animate="visible" variants={stagger}>
                            {cart.map(item => (
                                <motion.div
                                    key={item.id}
                                    variants={slideLeft}
                                    className="bg-white rounded-2xl p-5 shadow-sm flex gap-4 items-center"
                                >
                                    <div className="w-20 h-20 bg-amber-100 rounded-xl overflow-hidden flex-shrink-0">
                                        {item.product.image ? (
                                            <img src={item.product.image_url ?? ''} alt={item.product.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-3xl">☕</div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-stone-800">{item.product.name}</h3>
                                        <p className="text-amber-700 font-semibold text-sm">{formatRupiah(item.product.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => updateQty(item.id, item.quantity - 1)} className="w-8 h-8 bg-amber-100 rounded-full text-stone-700 hover:bg-amber-200 transition">-</button>
                                        <span className="w-6 text-center font-semibold">{item.quantity}</span>
                                        <button onClick={() => updateQty(item.id, item.quantity + 1)} className="w-8 h-8 bg-amber-100 rounded-full text-stone-700 hover:bg-amber-200 transition">+</button>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-stone-800">{formatRupiah(item.product.price * item.quantity)}</p>
                                        <button onClick={() => removeItem(item.id)} className="text-red-400 text-xs hover:text-red-600 transition mt-1">Remove</button>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>

                        <motion.div
                            className="bg-white rounded-2xl p-6 shadow-sm h-fit"
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <h2 className="font-bold text-stone-800 text-lg mb-4">Order Summary</h2>
                            <div className="space-y-2 text-sm text-stone-600 mb-4">
                                {cart.map(item => (
                                    <div key={item.id} className="flex justify-between">
                                        <span>{item.product.name} x{item.quantity}</span>
                                        <span>{formatRupiah(item.product.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-stone-100 pt-4 flex justify-between font-bold text-stone-800">
                                <span>Total</span>
                                <span>{formatRupiah(total)}</span>
                            </div>
                            <Link href="/checkout" className="block mt-6 bg-amber-600 hover:bg-amber-500 text-white text-center font-semibold py-3 rounded-xl transition">
                                Checkout
                            </Link>
                            <Link href="/menu" className="block mt-3 text-center text-sm text-stone-500 hover:text-amber-600 transition">
                                Continue Shopping
                            </Link>
                        </motion.div>
                    </div>
                )}
            </section>
            <Footer />
        </main>
    );
}