import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import { getDictionary } from "../dictionaries";
import { Header } from "../../components/layout/Header";
import { Footer } from "../../components/layout/Footer";
import { ConciergeFAB } from "../../components/layout/ConciergeFAB";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  fallback: ['InterLocal', 'system-ui', 'Arial', 'sans-serif']
});

const vazir = localFont({ 
  src: '../../public/fonts/Vazirmatn-Regular.woff2',
  variable: '--font-vazir',
  fallback: ['VazirmatnLocal', 'Tahoma', 'system-ui', 'sans-serif']
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: '--font-playfair',
  fallback: ['Georgia', 'serif']
});

export const metadata: Metadata = {
  title: "ARIWATCH | Luxury Watches",
  description: "Original, High Copy and Custom Order Watches",
};

export default async function RootLayout({
  children,
  params: { lang },
}: Readonly<{
  children: React.ReactNode;
  params: { lang: 'en' | 'fa' };
}>) {
  const dict = await getDictionary(lang);
  const isFa = lang === 'fa';

  return (
    <html lang={lang} dir={isFa ? 'rtl' : 'ltr'}>
      <body className={`${isFa ? 'font-vazir' : 'font-inter'} ${inter.variable} ${vazir.variable} ${playfair.variable} bg-white text-ariwatch-black`}>
        <Header lang={lang} dict={dict} isFa={isFa} />
        <main className="min-h-screen bg-white">
          {children}
        </main>
        <Footer lang={lang} dict={dict} isFa={isFa} />
        <ConciergeFAB lang={lang} dict={dict} isFa={isFa} />
      </body>
    </html>
  );
}
