"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { AuthModal } from "../auth/AuthModal";
import { authService } from "../../services/auth.service";

interface HeaderProps {
  lang: 'en' | 'fa';
  dict: any;
  isFa: boolean;
}

export function Header({ lang, dict, isFa }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  return (
    <>
      <header className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100/30 transition-all duration-300">
        <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-[1600px] mx-auto" dir="ltr">
          
          {/* Left side (Account / Search) */}
          <div className="flex-1 flex justify-start items-center gap-4">
            <button 
              onClick={() => setIsAuthModalOpen(true)} 
              className="p-2 group flex items-center justify-center gap-2"
              aria-label="Account"
            >
              <svg className="w-5 h-5 text-[#121212] group-hover:text-ariwatch-red transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden md:block text-[10px] font-bold tracking-widest uppercase text-ariwatch-black group-hover:text-ariwatch-red transition-colors">
                {isAuthenticated ? dict.header.profile : dict.header.account}
              </span>
            </button>
          </div>

          {/* Center (Logo) */}
          <Link href={`/${lang}`} className="flex-1 flex flex-col items-center justify-center cursor-pointer group">
             <div className="w-8 h-8 rounded-full border border-ariwatch-red flex items-center justify-center text-ariwatch-red mb-1 group-hover:bg-ariwatch-red group-hover:text-white transition-colors duration-500">
               <span className="text-sm font-serif">A</span>
             </div>
             <h1 className="text-sm md:text-base font-serif text-ariwatch-red tracking-[0.3em]">ARIWATCH</h1>
          </Link>

          {/* Right side (Hamburger Menu) */}
          <div className="flex-1 flex justify-end">
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
            <Link href={`/${lang}/cart`} onClick={() => setIsMenuOpen(false)} className="hover:text-ariwatch-red transition-colors mt-8 text-sm text-ariwatch-gray border-b border-transparent hover:border-ariwatch-red">{dict.header.cart}</Link>
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
