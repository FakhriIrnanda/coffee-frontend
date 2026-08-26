import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="bg-stone-900 text-amber-50">
            <div className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-4 gap-10">
                {/* Brand */}
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-2xl">☕</span>
                        <span className="text-xl font-bold text-amber-400">Mercys</span>
                    </div>
                    <p className="text-stone-400 text-sm leading-relaxed max-w-xs">
                        A warm place to enjoy your favorite coffee, crafted with love and passion. 
                        Every cup tells a story.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h4 className="text-amber-400 font-semibold mb-4 uppercase tracking-wider text-sm">Quick Links</h4>
                    <ul className="space-y-2 text-stone-400 text-sm">
                        <li><Link href="/" className="hover:text-amber-400 transition">Home</Link></li>
                        <li><Link href="/menu" className="hover:text-amber-400 transition">Our Menu</Link></li>
                        <li><Link href="/#about" className="hover:text-amber-400 transition">About Us</Link></li>
                        <li><Link href="/contact" className="hover:text-amber-400 transition">Contact</Link></li>
                    </ul>
                </div>

                {/* Contact */}
                <div>
                    <h4 className="text-amber-400 font-semibold mb-4 uppercase tracking-wider text-sm">Contact Us</h4>
                    <ul className="space-y-3 text-stone-400 text-sm">
                        <li className="flex items-start gap-2">
                            <span>📍</span>
                            <span>Jl. Laut Sulawesi No.01, Duren Sawit, Jakarta Timur</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span>📞</span>
                            <span>+62 822 2523 2724</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span>📸</span>
                            <span>@mercysoffeeid</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <span>🕐</span>
                            <span>Every day: 14.00 - 22.00</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-stone-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2 text-stone-500 text-xs">
                    <p>© 2026 Mercys Coffee. All rights reserved.</p>
                    <p>Made with ☕ & ❤️</p>
                </div>
            </div>
        </footer>
    );
}