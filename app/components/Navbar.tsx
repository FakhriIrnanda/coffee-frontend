'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../lib/axios';

export default function Navbar() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [cartCount, setCartCount] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
            api.get('/cart').then(res => setCartCount(res.data.length)).catch(() => {});
        }
    }, []);

    const handleLogout = async () => {
        await api.post('/logout');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login');
    };

    return (
        <nav className="bg-stone-900 text-amber-50 px-6 py-4 sticky top-0 z-50 shadow-lg">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                {/* Logo */}
<Link href="/" className="flex items-center gap-2">
    <img src="/logo.jpg" alt="Mercys" className="h-10 w-10 rounded-full object-cover" />
    <span className="text-xl font-bold tracking-wider text-amber-400">Mercys</span>
</Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                    <Link href="/" className="hover:text-amber-400 transition">Home</Link>
                    <Link href="/menu" className="hover:text-amber-400 transition">Menu</Link>
                    <Link href="/#about" className="hover:text-amber-400 transition">About</Link>
                    <Link href="/contact" className="hover:text-amber-400 transition">Contact</Link>
                    <Link href="/orders" className="hover:text-amber-400 transition">My Orders
</Link>
                </div>

                {/* Right Side */}
                <div className="hidden md:flex items-center gap-4">
                    {user ? (
                        <>
                            <Link href="/cart" className="relative hover:text-amber-400 transition">
                                🛒
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>
                            {user.role === 'admin' && (
                                <Link href="/admin" className="text-amber-400 hover:text-amber-300 transition text-sm">
                                    Admin
                                </Link>
                            )}
                            <button
                                onClick={handleLogout}
                                className="bg-amber-700 hover:bg-amber-600 text-white px-4 py-1.5 rounded-full text-sm transition"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className="hover:text-amber-400 transition text-sm">Login</Link>
                            <Link href="/register" className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-1.5 rounded-full text-sm transition">
                                Daftar
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile Hamburger */}
                <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
                    <span className="text-2xl">{menuOpen ? '✕' : '☰'}</span>
                </button>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden mt-4 flex flex-col gap-4 px-4 pb-4 text-sm">
                    <Link href="/" onClick={() => setMenuOpen(false)}>Home</Link>
                    <Link href="/menu" onClick={() => setMenuOpen(false)}>Menu</Link>
                    <Link href="/#about" onClick={() => setMenuOpen(false)}>About</Link>
                    <Link href="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
                    {user ? (
                        <>
                            <Link href="/cart" onClick={() => setMenuOpen(false)}>Cart 🛒</Link>
                            {user.role === 'admin' && <Link href="/admin">Admin Panel</Link>}
                            <button onClick={handleLogout} className="text-left text-red-400">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">Login</Link>
                            <Link href="/register">Daftar</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
}