export default function Loading() {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center bg-transparent">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer spinning ring */}
        <div className="absolute inset-0 rounded-full border-2 border-gray-100 border-t-ariwatch-red animate-spin"></div>
        {/* Inner static logo */}
        <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-ariwatch-red bg-white shadow-sm">
          <span className="text-lg font-serif">A</span>
        </div>
      </div>
    </div>
  );
}
