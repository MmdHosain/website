export function FooterNewsletter({ dict, isFa }: { dict: any, isFa: boolean }) {
  return (
    <div className="text-xs tracking-widest">
      <h4 className="font-bold text-ariwatch-black mb-6">{dict.footer.subscribe}</h4>
      <div className="flex flex-col gap-4">
        <input 
          type="email" 
          placeholder={dict.footer.emailPlaceholder} 
          className="border-b border-gray-300 bg-transparent py-2 focus:outline-none focus:border-ariwatch-black transition" 
        />
        <button className={`text-left text-ariwatch-red font-bold hover:text-ariwatch-black transition ${isFa ? 'rtl:text-right' : ''}`}>
          SUBMIT
        </button>
      </div>
    </div>
  );
}
