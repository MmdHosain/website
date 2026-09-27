export function ProductSpecs({ dict, isFa }: { dict: any, isFa: boolean }) {
  return (
    <div className="mt-16 md:mt-24 border-t border-gray-100 pt-16 md:pt-24">
      <h2 className="text-2xl md:text-3xl font-serif text-ariwatch-black uppercase tracking-widest mb-16 text-center">
        {dict.pdp.specifications}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 text-center max-w-4xl mx-auto">
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold tracking-widest text-ariwatch-gray uppercase">{dict.pdp.movement}</span>
          <p className="text-sm text-ariwatch-black">Automatic Caliber 324</p>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold tracking-widest text-ariwatch-gray uppercase">{dict.pdp.case}</span>
          <p className="text-sm text-ariwatch-black">40mm Stainless Steel</p>
        </div>
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-bold tracking-widest text-ariwatch-gray uppercase">{dict.pdp.strap}</span>
          <p className="text-sm text-ariwatch-black">Integrated Steel Bracelet</p>
        </div>
      </div>
    </div>
  );
}
