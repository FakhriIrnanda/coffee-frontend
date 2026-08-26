'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import api from '../lib/axios';
import { fadeUp, stagger } from '../lib/animations';

const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-3.24 2.31A10.44 10.44 0 0 1 12 20c-7 0-11-8-11-8a18.5 18.5 0 0 1 4.65-5.77" />
        <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
);

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const res = await api.post('/login', form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            router.push('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-stone-900 flex flex-col items-center justify-center px-4">
            <motion.div
                className="w-full max-w-md mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6 }}
            >
                <Link href="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-amber-400 text-sm transition">
                    ← Kembali ke Beranda
                </Link>
            </motion.div>
            <motion.div
                className="bg-white rounded-3xl shadow-lg w-full max-w-md p-10"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <motion.div className="text-center mb-8" initial="hidden" animate="visible" variants={stagger}>
                    <motion.div variants={fadeUp}>
                        <Image src="/logo.jpg" alt="Mercys" width={80} height={80} className="mx-auto rounded-full mb-4" />
                    </motion.div>
                    <motion.h1 variants={fadeUp} className="text-2xl font-bold text-stone-800" style={{fontFamily: 'Georgia, serif'}}>Welcome Back</motion.h1>
                    <motion.p variants={fadeUp} className="text-stone-500 text-sm mt-1">Login to your Mercys account</motion.p>
                </motion.div>

                {error && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 p-3 rounded-xl mb-4 text-sm">
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {[
                        { label: 'Email', key: 'email', type: 'email', placeholder: 'email@example.com' },
                        { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
                    ].map((field, i) => (
                        <motion.div
                            key={field.key}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                        >
                            <label className="block text-sm font-medium text-stone-700 mb-1">{field.label}</label>
                            <div className="relative">
                                <input
                                    type={field.type === 'password' && showPassword ? 'text' : field.type}
                                    placeholder={field.placeholder}
                                    value={(form as any)[field.key]}
                                    onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                                    className="w-full border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 pr-11"
                                    required
                                />
                                {field.type === 'password' && (
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition"
                                        aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                                    >
                                        {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                    <motion.button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        {loading ? 'Loading...' : 'Login'}
                    </motion.button>
                </form>
                <motion.p
                    className="text-center text-sm text-stone-500 mt-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    Belum punya akun?{' '}
                    <Link href="/register" className="text-amber-600 hover:underline font-medium">Daftar</Link>
                </motion.p>
            </motion.div>
        </main>
    );
}