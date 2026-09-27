"use client";

export function ConciergeForm({ lang, dict, isFa }: { lang: string, dict: any, isFa: boolean }) {
  return (
    <form className="flex flex-col gap-8" onSubmit={(e) => e.preventDefault()}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold tracking-widest text-ariwatch-black uppercase">
            {dict.concierge.formName}
          </label>
          <input 
            type="text" 
            className="border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-ariwatch-red transition-colors text-sm"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold tracking-widest text-ariwatch-black uppercase">
            {dict.concierge.formEmail}
          </label>
          <input 
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
          type="text" 
          className="border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-ariwatch-red transition-colors text-sm"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold tracking-widest text-ariwatch-black uppercase">
          {dict.concierge.formMessage}
        </label>
        <textarea 
          rows={4} 
          className="border-b border-gray-300 py-3 bg-transparent focus:outline-none focus:border-ariwatch-red transition-colors resize-none text-sm"
        ></textarea>
      </div>
      <button className="mt-4 bg-ariwatch-black text-white px-10 py-4 text-[10px] md:text-xs font-bold tracking-widest uppercase hover:bg-black transition-colors w-full md:w-fit md:self-end">
        {dict.concierge.submit}
      </button>
    </form>
  );
}
