'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import api from '../../lib/axios';
import { fadeUp, stagger } from '../../lib/animations';

interface Order {
    id: number;
    order_number: string;
    status: string;
    total_amount: number;
    payment_status: string;
    notes: string;
    created_at: string;
    items: {
        id: number;
        quantity: number;
        price: number;
        product: { name: string; image: string };
    }[];
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const statusColor: any = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

declare global {
    interface Window {
        snap: any;
    }
}

export default function OrderDetailPage() {
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [paying, setPaying] = useState(false);

    useEffect(() => {
        api.get(`/orders/${id}`)
            .then(res => setOrder(res.data))
            .finally(() => setLoading(false));
    }, [id]);

    // Polling status pembayaran — berlaku buat semua metode (kartu, QRIS, VA, e-wallet, dll),
    // karena metode async cuma dapet onPending dari Snap, konfirmasi final baru datang lewat webhook.
    useEffect(() => {
        if (!order) return;
        if (order.payment_status === 'paid' || order.status === 'cancelled') return;

        const interval = setInterval(async () => {
            try {
                const res = await api.get(`/orders/${order.id}`);
                setOrder(res.data);
            } catch {
                // biarin, coba lagi di polling berikutnya
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [order?.id, order?.payment_status, order?.status]);

    useEffect(() => {
        // Load Midtrans Snap script
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '');
        script.async = true;
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    const handlePayment = async () => {
        if (!order) return;
        setPaying(true);
        try {
            const res = await api.get(`/payment/token/${order.id}`);
            const { snap_token } = res.data;

            window.snap.pay(snap_token, {
                onSuccess: async () => {
                    // Best-effort update langsung; kalau gagal, polling di bawah tetap nangkep
                    // perubahan status begitu backend keupdate (termasuk lewat webhook Midtrans).
                    try {
                        await api.put(`/orders/${order.id}/payment-success`);
                        const res = await api.get(`/orders/${order.id}`);
                        setOrder(res.data);
                    } catch {
                        // biarin, polling bakal nangkep
                    }
                    setPaying(false);
                },
                onPending: () => {
                    setOrder(prev => prev ? { ...prev, payment_status: 'pending' } : prev);
                    setPaying(false);
                },
                onError: () => {
                    alert('Pembayaran gagal, silakan coba lagi.');
                    setPaying(false);
                },
                onClose: () => {
                    setPaying(false);
                },
            });
        } catch {
            alert('Gagal memuat payment gateway');
            setPaying(false);
        }
    };

    return (
        <main className="min-h-screen bg-amber-50">
            <Navbar />

            <section className="bg-stone-900 py-20 px-6 text-center">
                <motion.div initial="hidden" animate="visible" variants={stagger}>
                    <motion.p variants={fadeUp} className="text-amber-400 tracking-widest uppercase text-sm mb-3">Your Order</motion.p>
                    <motion.h1 variants={fadeUp} className="text-4xl font-bold text-amber-50" style={{fontFamily: 'Georgia, serif'}}>Order Detail</motion.h1>
                </motion.div>
            </section>

            <section className="py-16 px-6 max-w-3xl mx-auto">
                {loading ? (
                    <div className="text-center py-20 text-amber-700">Loading...</div>
                ) : !order ? (
                    <div className="text-center py-20 text-stone-500">Order not found</div>
                ) : (
                    <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>

                        {/* Status Card */}
                        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm text-center">
                            <p className="text-5xl mb-4">
                                {order.payment_status === 'paid' ? '✅' : '🎉'}
                            </p>
                            <h2 className="text-xl font-bold text-stone-800 mb-2">
                                {order.payment_status === 'paid' ? 'Pembayaran Berhasil!' : 'Order Diterima!'}
                            </h2>
                            <p className="text-stone-500 text-sm mb-4">Order #{order.order_number}</p>
                            <div className="flex justify-center gap-2">
                                <span className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize ${statusColor[order.status]}`}>
                                    {order.status}
                                </span>
                                <span className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                                    order.payment_status === 'paid'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                    {order.payment_status === 'paid' ? 'Lunas' : 'Belum Dibayar'}
                                </span>
                            </div>
                        </motion.div>

                        {/* Items */}
                        <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-stone-800 mb-4">Items Ordered</h3>
                            <div className="space-y-3">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex justify-between items-center py-2 border-b border-stone-50 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-amber-100 rounded-lg overflow-hidden">
                                                {item.product.image ? (
                                                    <img src={`http://coffee-backend.test/storage/${item.product.image}`} alt={item.product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-lg">☕</div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-stone-800 text-sm">{item.product.name}</p>
                                                <p className="text-stone-400 text-xs">x{item.quantity}</p>
                                            </div>
                                        </div>
                                        <p className="font-semibold text-stone-800 text-sm">
                                            {formatRupiah(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-stone-100 pt-4 mt-4 flex justify-between font-bold text-stone-800">
                                <span>Total</span>
                                <span>{formatRupiah(order.total_amount)}</span>
                            </div>
                        </motion.div>

                        {/* Payment */}
                        {order.payment_status !== 'paid' && (
                            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm">
                                <h3 className="font-bold text-stone-800 mb-4">Payment</h3>
                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
                                    <p className="text-amber-700 font-medium text-sm text-center">
                                        💳 Bayar via QRIS, Virtual Account, GoPay, OVO & more
                                    </p>
                                </div>
                                <motion.button
                                    onClick={handlePayment}
                                    disabled={paying}
                                    className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    {paying ? 'Memuat Payment...' : '💳 Bayar Sekarang'}
                                </motion.button>
                            </motion.div>
                        )}

                        {order.notes && (
                            <motion.div variants={fadeUp} className="bg-white rounded-2xl p-6 shadow-sm">
                                <h3 className="font-bold text-stone-800 mb-2">Notes</h3>
                                <p className="text-stone-500 text-sm">{order.notes}</p>
                            </motion.div>
                        )}

                        <motion.div variants={fadeUp} className="flex gap-4">
                            <Link href="/orders" className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-center font-semibold py-3 rounded-xl transition">
                                My Orders
                            </Link>
                            <Link href="/menu" className="flex-1 border border-stone-200 text-stone-700 text-center font-semibold py-3 rounded-xl hover:bg-stone-50 transition">
                                Order More
                            </Link>
                        </motion.div>
                    </motion.div>
                )}
            </section>
            <Footer />
        </main>
    );
}