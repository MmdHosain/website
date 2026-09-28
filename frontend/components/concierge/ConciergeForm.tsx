"use client";

import { useState } from "react";

export function ConciergeForm({ lang, dict, isFa }: { lang: string, dict: any, isFa: boolean }) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-serif text-ariwatch-black mb-4 uppercase tracking-widest">
          {dict.concierge.successTitle}
        </h3>
        <p className="text-ariwatch-gray">
          {dict.concierge.successDesc}
        </p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-8" onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold tracking-widest text-ariwatch-black uppercase">
            {dict.concierge.formName}
          </label>
          <input 
            required
            type="text" 
            className="border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-ariwatch-red transition-colors text-sm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold tracking-widest text-ariwatch-black uppercase">
            {dict.concierge.formEmail}
          </label>
          <input 
            required
            type="email" 
            className="border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-ariwatch-red transition-colors text-sm"
          />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold tracking-widest text-ariwatch-black uppercase">
          {dict.concierge.formModel}
        </label>
        <input 
          required
          type="text" 
          className="border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-ariwatch-red transition-colors text-sm"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold tracking-widest text-ariwatch-black uppercase">
          {dict.concierge.formMessage}
        </label>
        <textarea 
          required
          rows={4} 
          className="border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-ariwatch-red transition-colors resize-none text-sm"
        ></textarea>
      </div>
      <button type="submit" className="mt-4 bg-ariwatch-black text-white px-10 py-4 text-[10px] md:text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors w-full md:w-fit md:self-end">
        {dict.concierge.submit}
      </button>
    </form>
  );
}
