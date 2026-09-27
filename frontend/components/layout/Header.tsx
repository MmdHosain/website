import Link from "next/link";

interface HeaderProps {
  lang: 'en' | 'fa';
  dict: any;
  isFa: boolean;
}

export function Header({ lang, dict, isFa }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100/30 transition-all duration-300">
      {/* Use LTR to enforce Left=Search, Right=Menu as requested for both Desktop/Mobile */}
      <div className="flex justify-between items-center px-6 md:px-12 py-4 max-w-[1600px] mx-auto" dir="ltr">
        
        {/* Left side (Search) */}
        <div className="flex-1 flex justify-start">
          <button className="p-2 group flex items-center justify-center" aria-label="Search">
            <svg className="w-5 h-5 text-[#121212] group-hover:text-ariwatch-red transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
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
          <button className="p-2 flex flex-col gap-[5px] items-end group" aria-label="Menu">
            <span className="w-6 h-[1.5px] bg-[#121212] group-hover:bg-ariwatch-red transition-colors duration-300"></span>
            <span className="w-4 h-[1.5px] bg-[#121212] group-hover:bg-ariwatch-red transition-all duration-300 group-hover:w-6"></span>
            <span className="w-6 h-[1.5px] bg-[#121212] group-hover:bg-ariwatch-red transition-colors duration-300"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
