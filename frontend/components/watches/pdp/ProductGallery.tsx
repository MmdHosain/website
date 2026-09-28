export function ProductGallery({ watch, isFa }: { watch: any, isFa: boolean }) {
  return (
    <div className="w-full lg:w-[55%] flex flex-col gap-4">
      {/* Main Image */}
      <div className="w-full aspect-square md:aspect-[4/5] bg-[#fcfbf9] flex items-center justify-center border border-gray-100 overflow-hidden">
         {watch.imageUrl && watch.imageUrl !== 'placeholder' ? (
            <img src={watch.imageUrl} alt={watch.name} className="w-full h-full object-cover" />
         ) : (
            <div className="w-1/2 aspect-square bg-gray-200/50 rounded-full flex items-center justify-center shadow-inner">
                <span className="text-gray-400 font-serif text-sm">Main Image</span>
            </div>
         )}
      </div>
      {/* Thumbnails */}
      <div className="flex gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="w-1/3 aspect-square bg-[#fcfbf9] flex items-center justify-center cursor-pointer border border-gray-100 hover:border-gray-300 transition-colors overflow-hidden">
            {watch.imageUrl && watch.imageUrl !== 'placeholder' ? (
              <img src={watch.imageUrl} alt={`${watch.name} thumb ${i}`} className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" />
            ) : (
              <span className="text-xs text-gray-400">Thumb {i}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
