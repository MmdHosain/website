"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AuthModal } from "../auth/AuthModal";
import { authService } from "../../services/auth.service";
import { useCart } from "../../context/CartContext";

interface HeaderProps {
  lang: 'en' | 'fa';
  dict: any;
  isFa: boolean;
}

export function Header({ lang, dict, isFa }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { cartItems } = useCart();

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/30 transition-all duration-300">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-[1600px] mx-auto" dir="ltr">
          
          {/* Left side (Search) */}
          <div className="flex-1 flex justify-start items-center">
            <Link href={`/${lang}/watches`} className="p-2 group flex items-center justify-center gap-3" aria-label="Search">
              <svg className="w-5 h-5 text-[#121212] group-hover:text-ariwatch-red transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="hidden md:block text-[10px] font-bold tracking-widest uppercase text-ariwatch-black group-hover:text-ariwatch-red transition-colors">
                {dict.header.search}
              </span>
            </Link>
          </div>

          {/* Center (Logo) */}
          <Link href={`/${lang}`} className="flex-1 flex flex-col items-center justify-center cursor-pointer group">
             <div className="w-8 h-8 rounded-full border border-ariwatch-red flex items-center justify-center text-ariwatch-red mb-1 group-hover:bg-ariwatch-red group-hover:text-white transition-colors duration-500">
               <span className="text-sm font-serif">A</span>
             </div>
             <h1 className="text-sm md:text-base font-serif text-ariwatch-red tracking-[0.3em]">ARIWATCH</h1>
          </Link>

          {/* Right side (Cart & Hamburger Menu) */}
          <div className="flex-1 flex justify-end items-center gap-4 md:gap-6">
            <Link href={`/${lang}/cart`} className="p-2 group flex items-center justify-center gap-2 relative" aria-label="Cart">
              <svg className="w-5 h-5 text-[#121212] group-hover:text-ariwatch-red transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-ariwatch-red text-white text-[9px] font-bold flex items-center justify-center rounded-full">
                  {cartCount}
                </span>
              )}
              <span className="hidden md:block text-[10px] font-bold tracking-widest uppercase text-ariwatch-black group-hover:text-ariwatch-red transition-colors">
                {dict.header.cart}
              </span>
            </Link>

            <div className="w-[1px] h-4 bg-gray-200 hidden md:block mx-1"></div>

            <button onClick={() => setIsMenuOpen(true)} className="p-2 flex flex-col gap-[5px] items-end group" aria-label="Menu">
              <span className="w-6 h-[1.5px] bg-[#121212] group-hover:bg-ariwatch-red transition-colors duration-300"></span>
              <span className="w-4 h-[1.5px] bg-[#121212] group-hover:bg-ariwatch-red transition-all duration-300 group-hover:w-6"></span>
              <span className="w-6 h-[1.5px] bg-[#121212] group-hover:bg-ariwatch-red transition-colors duration-300"></span>
            </button>
          </div>
        </div>
      </header>

      {/* Full Screen Mobile Menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-white z-[60] flex flex-col animate-fade-in-scale">
          <div className="flex justify-between items-center px-6 md:px-12 py-6 border-b border-gray-100" dir="ltr">
            <div className="flex-1"></div>
            <div className="flex-1 flex justify-center">
              <h2 className="text-xl font-serif text-ariwatch-black tracking-widest">ARIWATCH</h2>
            </div>
            <div className="flex-1 flex justify-end">
              <button onClick={() => setIsMenuOpen(false)} className="p-2 text-ariwatch-black hover:text-ariwatch-red transition-colors">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <nav className="flex flex-col items-center justify-center flex-1 gap-8 text-lg md:text-2xl font-serif uppercase tracking-widest">
            <Link href={`/${lang}`} onClick={() => setIsMenuOpen(false)} className="hover:text-ariwatch-red transition-colors">{dict.header.home}</Link>
            <Link href={`/${lang}/watches`} onClick={() => setIsMenuOpen(false)} className="hover:text-ariwatch-red transition-colors">{dict.header.watches}</Link>
            <Link href={`/${lang}/story`} onClick={() => setIsMenuOpen(false)} className="hover:text-ariwatch-red transition-colors">{dict.header.story}</Link>
            <Link href={`/${lang}/support`} onClick={() => setIsMenuOpen(false)} className="hover:text-ariwatch-red transition-colors">{dict.header.support}</Link>
            <Link href={`/${lang}/concierge`} onClick={() => setIsMenuOpen(false)} className="hover:text-ariwatch-red transition-colors">{dict.header.concierge}</Link>
            
            <div className="w-12 h-[1px] bg-gray-200 my-2"></div>

            {/* Authentication / Account Links */}
            {isAuthenticated ? (
              <button 
                onClick={() => {
                  if (confirm("Are you sure you want to logout?")) {
                    authService.logout();
                    setIsAuthenticated(false);
                    setIsMenuOpen(false);
                  }
                }} 
                className="text-sm font-inter font-bold tracking-widest text-ariwatch-gray hover:text-ariwatch-red transition-colors"
              >
                {dict.header.logout}
              </button>
            ) : (
              <button 
                onClick={() => { setIsMenuOpen(false); setIsAuthModalOpen(true); }} 
                className="text-sm font-inter font-bold tracking-widest text-ariwatch-gray hover:text-ariwatch-red transition-colors"
              >
                {dict.header.account}
              </button>
            )}
          </nav>
        </div>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        dict={dict} 
        isFa={isFa} 
        onSuccess={handleAuthSuccess}
      />
    </>
  );
}
