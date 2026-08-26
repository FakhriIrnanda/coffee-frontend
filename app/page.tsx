'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TestimonialsSection from './components/TestimonialsSection';
import api from './lib/axios';

interface Product {
    id: number;
    name: string;
    price: number;
    description: string;
    image: string;
    category: { name: string };
}

const formatRupiah = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
    visible: { transition: { staggerChildren: 0.15 } },
};

export default function Home() {
    const [featured, setFeatured] = useState<Product[]>([]);

    useEffect(() => {
        api.get('/products?featured=true')
            .then(res => setFeatured(res.data.data || []))
            .catch(() => setFeatured([]));
    }, []);

    return (
        <main className="min-h-screen bg-amber-50">
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-stone-900 min-h-screen flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920')] bg-cover bg-center opacity-30"></div>
                <motion.div
                    className="relative z-10 text-center text-amber-50 px-6 max-w-4xl mx-auto"
                    initial="hidden"
                    animate="visible"
                    variants={stagger}
                >
                    <motion.div variants={fadeUp} className="mb-6">
                        <Image src="/logo.jpg" alt="Mercys Logo" width={120} height={120} className="mx-auto rounded-full border-4 border-amber-400/30" />
                    </motion.div>
                    <motion.p variants={fadeUp} className="text-amber-400 tracking-[0.3em] uppercase text-sm mb-4">Welcome to</motion.p>
                    <motion.h1 variants={fadeUp} className="text-7xl md:text-9xl font-bold mb-6 text-amber-400" style={{fontFamily: 'Georgia, serif'}}>
                        Mercys
                    </motion.h1>
                    <motion.p variants={fadeUp} className="text-xl md:text-2xl text-stone-300 mb-10 max-w-xl mx-auto leading-relaxed">
                        A warm place to enjoy your favorite coffee, crafted with love and passion.
                    </motion.p>
                    <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link href="/menu" className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-10 py-4 rounded-full text-lg transition">
                            Explore Menu
                        </Link>
                        <Link href="/#about" className="border border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-stone-900 font-semibold px-10 py-4 rounded-full text-lg transition">
                            Our Story
                        </Link>
                    </motion.div>
                </motion.div>
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-amber-400 animate-bounce text-center">
                    <p className="text-xs tracking-widest uppercase mb-1">Scroll</p>
                    <p>↓</p>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-32 px-6">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        <motion.p variants={fadeUp} className="text-amber-600 tracking-widest uppercase text-sm mb-3">Our Story</motion.p>
                        <motion.h2 variants={fadeUp} className="text-4xl font-bold text-stone-800 mb-6" style={{fontFamily: 'Georgia, serif'}}>
                            Crafted with Passion, <br/>Served with Love
                        </motion.h2>
                        <motion.div variants={fadeUp} className="w-16 h-0.5 bg-amber-500 mb-8"></motion.div>
                        <motion.p variants={fadeUp} className="text-stone-600 leading-relaxed mb-6">
                            Mercys was born from a deep love of coffee and community. We believe that a great cup of coffee
                            is more than just a drink — it's a moment of connection, warmth, and joy.
                        </motion.p>
                        <motion.p variants={fadeUp} className="text-stone-600 leading-relaxed mb-8">
                            We source our beans from the finest local farms, roast them in small batches,
                            and brew each cup with care and precision. Every sip tells our story.
                        </motion.p>
                        <motion.div variants={fadeUp}>
                            <Link href="/menu" className="inline-block bg-stone-900 hover:bg-stone-700 text-amber-50 px-8 py-3 rounded-full transition">
                                View Our Menu
                            </Link>
                        </motion.div>
                    </motion.div>
                    <motion.div
                        className="grid grid-cols-2 gap-4"
                        initial={{ opacity: 0, x: 40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <div className="bg-amber-200 rounded-2xl h-64 overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1511920170033-f8396924c348?w=400" alt="Coffee" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                        </div>
                        <div className="bg-amber-200 rounded-2xl h-64 overflow-hidden mt-8">
                            <img src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400" alt="Coffee" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Why Us Section */}
            <section className="py-20 px-6 bg-stone-900 text-amber-50">
                <div className="max-w-6xl mx-auto text-center">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        <motion.p variants={fadeUp} className="text-amber-400 tracking-widest uppercase text-sm mb-3">Why Choose Us</motion.p>
                        <motion.h2 variants={fadeUp} className="text-4xl font-bold mb-16" style={{fontFamily: 'Georgia, serif'}}>The Mercys Experience</motion.h2>
                        <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            {[
                                { icon: '🌱', title: 'Local Beans', desc: 'We source our coffee beans from trusted local farmers, ensuring freshness and quality in every cup.' },
                                { icon: '☕', title: 'Expert Brewing', desc: 'Our baristas are trained to craft the perfect cup, every time. No compromises, ever.' },
                                { icon: '🏡', title: 'Cozy Atmosphere', desc: 'Sit back, relax, and enjoy our warm and welcoming space. Your home away from home.' },
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    variants={fadeUp}
                                    className="p-8 border border-stone-700 rounded-2xl hover:border-amber-500 transition"
                                >
                                    <p className="text-5xl mb-4">{item.icon}</p>
                                    <h3 className="text-xl font-semibold text-amber-400 mb-3">{item.title}</h3>
                                    <p className="text-stone-400 leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </motion.div>
                </div>
            </section>
            {/* Testimonials Section */}
            <section className="py-24 px-6 bg-amber-50">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        <motion.p variants={fadeUp} className="text-amber-600 tracking-widest uppercase text-sm mb-3">Testimonials</motion.p>
                        <motion.h2 variants={fadeUp} className="text-4xl font-bold text-stone-800 font-serif">What Our Customers Say</motion.h2>
                        <motion.div variants={fadeUp} className="w-16 h-0.5 bg-amber-500 mx-auto mt-6"></motion.div>
                    </motion.div>
                    <TestimonialsSection />
                </div>
                </section>
            {/* Featured Menu Section */}
            <section className="py-32 px-6 bg-amber-50">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        <motion.p variants={fadeUp} className="text-amber-600 tracking-widest uppercase text-sm mb-3">Our Specialties</motion.p>
                        <motion.h2 variants={fadeUp} className="text-4xl font-bold text-stone-800" style={{fontFamily: 'Georgia, serif'}}>Featured Menu</motion.h2>
                        <motion.div variants={fadeUp} className="w-16 h-0.5 bg-amber-500 mx-auto mt-6"></motion.div>
                    </motion.div>

                    {featured.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-6xl mb-4">☕</p>
                            <p className="text-stone-500 text-lg">Menu coming soon!</p>
                            <Link href="/menu" className="inline-block mt-6 bg-amber-600 text-white px-8 py-3 rounded-full hover:bg-amber-500 transition">
                                View All Menu
                            </Link>
                        </div>
                    ) : (
                        <>
                            <motion.div
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={stagger}
                            >
                                {featured.slice(0, 3).map(product => (
                                    <motion.div
                                        key={product.id}
                                        variants={fadeUp}
                                        className="bg-white rounded-3xl shadow-md overflow-hidden hover:shadow-xl transition group"
                                        whileHover={{ y: -5 }}
                                    >
                                        <div className="h-56 bg-amber-100 overflow-hidden">
                                            {product.image ? (
                                                <img
                                                    src={`http://coffee-backend.test/storage/${product.image}`}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-6xl">☕</div>
                                            )}
                                        </div>
                                        <div className="p-6">
                                            <span className="text-xs text-amber-600 font-semibold uppercase tracking-wider">
                                                {product.category?.name}
                                            </span>
                                            <h3 className="text-lg font-bold text-stone-800 mt-1 mb-2">{product.name}</h3>
                                            <p className="text-stone-500 text-sm line-clamp-2 mb-4">{product.description}</p>
                                            <div className="flex justify-between items-center">
                                                <span className="text-amber-700 font-bold text-lg">{formatRupiah(product.price)}</span>
                                                <Link href="/menu" className="bg-amber-600 hover:bg-amber-500 text-white text-sm px-5 py-2 rounded-full transition">
                                                    Order
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </motion.div>
                            <motion.div
                                className="text-center mt-12"
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                viewport={{ once: true }}
                            >
                                <Link href="/menu" className="inline-block border-2 border-stone-900 text-stone-900 hover:bg-stone-900 hover:text-amber-50 font-semibold px-10 py-3 rounded-full transition">
                                    View Full Menu
                                </Link>
                            </motion.div>
                        </>
                    )}
                </div>
            </section>

            {/* Logo Section */}
            <section className="py-20 bg-amber-100 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <Image src="/logo.jpg" alt="Mercys Logo" width={150} height={150} className="mx-auto rounded-full shadow-lg mb-6" />
                    <p className="text-stone-600 text-lg italic">"Every cup is a story waiting to be told."</p>
                </motion.div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-32 px-6 bg-amber-50">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        className="text-center mb-16"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        <motion.p variants={fadeUp} className="text-amber-600 tracking-widest uppercase text-sm mb-3">Find Us</motion.p>
                        <motion.h2 variants={fadeUp} className="text-4xl font-bold text-stone-800" style={{fontFamily: 'Georgia, serif'}}>Visit Mercys</motion.h2>
                        <motion.div variants={fadeUp} className="w-16 h-0.5 bg-amber-500 mx-auto mt-6"></motion.div>
                    </motion.div>
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        variants={stagger}
                    >
                        {[
                            { icon: '📍', title: 'Address', desc: 'Jl. Laut Sulawesi No.01\nDuren Sawit, Jakarta Timur' },
                            { icon: '🕐', title: 'Opening Hours', desc: 'Every day\n14.00 - 22.00 WIB' },
                            { icon: '📞', title: 'Contact', desc: '+62 822 2523 2724\n@mercysoffeeid' },
                        ].map((item, i) => (
                            <motion.div key={i} variants={fadeUp} className="bg-white p-8 rounded-2xl text-center shadow-sm hover:shadow-md transition">
                                <p className="text-4xl mb-4">{item.icon}</p>
                                <h3 className="font-bold text-stone-800 mb-2">{item.title}</h3>
                                <p className="text-stone-500 text-sm whitespace-pre-line">{item.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                    <motion.div
                        className="text-center mt-10"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        <Link href="/contact" className="inline-block bg-amber-600 hover:bg-amber-500 text-white font-semibold px-8 py-3 rounded-full transition">
                            Get Directions →
                        </Link>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}