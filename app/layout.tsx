import type { Metadata } from 'next';
import { Cormorant, DM_Sans } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant({
    subsets: ['latin'],
    variable: '--font-cormorant',
    weight: ['300', '400', '500', '600', '700'],
});

const dmSans = DM_Sans({
    subsets: ['latin'],
    variable: '--font-dm-sans',
    weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
    metadataBase: new URL("https://mercyscoffee.netlify.app"),
    title: "Mercys Coffee",
    description: "A warm place to enjoy your favorite coffee",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${cormorant.variable} ${dmSans.variable} font-sans antialiased`}>
                {children}
            </body>
        </html>
    );
}