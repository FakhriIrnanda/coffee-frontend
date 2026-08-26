'use client';

import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fadeUp, stagger } from '../lib/animations';

export default function ContactPage() {
    return (
        <main className="min-h-screen bg-amber-50">
            <Navbar />

            {/* Header */}
            <section className="bg-stone-900 py-24 px-6 text-center">
                <motion.div initial="hidden" animate="visible" variants={stagger}>
                    <motion.p variants={fadeUp} className="text-amber-400 tracking-widest uppercase text-sm mb-3">Get In Touch</motion.p>
                    <motion.h1 variants={fadeUp} className="text-5xl font-bold text-amber-50 mb-4" style={{fontFamily: 'Georgia, serif'}}>Visit Us</motion.h1>
                    <motion.p variants={fadeUp} className="text-stone-400 max-w-md mx-auto">
                        We'd love to see you. Come visit us or reach out through any of the channels below.
                    </motion.p>
                </motion.div>
            </section>

            {/* Maps + Info */}
            <section className="py-16 px-6 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Google Maps */}
                    <motion.div
                        className="lg:col-span-2 bg-white rounded-3xl overflow-hidden shadow-md"
                        initial={{ opacity: 0, x: -40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <iframe
                            src="https://www.google.com/maps?q=Jl.+Laut+Sulawesi+No.01%2C+Duren+Sawit%2C+Jakarta+Timur&output=embed"
                            width="100%"
                            height="450"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            className="w-full h-full min-h-[450px]"
                        />
                    </motion.div>

                    {/* Contact Info */}
                    <motion.div
                        className="space-y-4"
                        initial="hidden"
                        animate="visible"
                        variants={stagger}
                    >
                        {[
                            { icon: '📍', title: 'Address', lines: ['Jl. Laut Sulawesi No.01', 'Duren Sawit, Jakarta Timur'], href: 'https://maps.app.goo.gl/DKph6qsGLaeisYC78' },
                            { icon: '🕐', title: 'Opening Hours', lines: ['Every day: 14.00 - 22.00'] },
                            { icon: '📞', title: 'Phone', lines: ['+62 822 2523 2724'] },
                            { icon: '📸', title: 'Instagram', lines: ['@mercysoffeeid'], href: 'https://instagram.com/mercysoffeeid' },
                        ].map((item, i) => {
                            const content = (
                                <>
                                    <span className="text-2xl">{item.icon}</span>
                                    <div>
                                        <h3 className="font-bold text-stone-800 mb-1">{item.title}</h3>
                                        {item.lines.map((line, j) => (
                                            <p key={j} className="text-stone-500 text-sm">{line}</p>
                                        ))}
                                    </div>
                                </>
                            );
                            const className = "bg-white rounded-2xl p-5 shadow-sm flex gap-4 items-start";
                            return item.href ? (
                                <motion.a
                                    key={i}
                                    href={item.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    variants={fadeUp}
                                    whileHover={{ x: 5 }}
                                    className={`${className} hover:bg-amber-50 transition`}
                                >
                                    {content}
                                </motion.a>
                            ) : (
                                <motion.div
                                    key={i}
                                    variants={fadeUp}
                                    whileHover={{ x: 5 }}
                                    className={`${className} cursor-default`}
                                >
                                    {content}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            <Footer />
        </main>
    );
}