"use client";

import { useWatchForm } from "../../hooks/useWatchForm";
import { Watch } from "../../types";

export function WatchForm({ lang, dict, initialData }: { lang: string, dict: any, initialData?: Watch | null }) {
  const {
    formData,
    loading,
    error,
    handleChange,
    handleSubmit,
    handleDelete,
  } = useWatchForm(lang, initialData);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {error && <div className="bg-red-50 text-red-600 p-4 rounded text-sm">{error}</div>}
      
      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold tracking-widest text-ariwatch-black uppercase">{dict.admin.name}</label>
        <input required type="text" name="name" value={formData.name} onChange={handleChange} className="border border-gray-300 p-3 text-sm focus:outline-none focus:border-ariwatch-black" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-widest text-ariwatch-black uppercase">{dict.admin.price}</label>
          <input required type="number" name="price" value={formData.price} onChange={handleChange} className="border border-gray-300 p-3 text-sm focus:outline-none focus:border-ariwatch-black" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold tracking-widest text-ariwatch-black uppercase">{dict.admin.category}</label>
          <select name="category" value={formData.category} onChange={handleChange} className="border border-gray-300 p-3 text-sm focus:outline-none focus:border-ariwatch-black bg-white">
            <option value="original">Original</option>
            <option value="highcopy">High Copy</option>
            <option value="custom">Custom Order</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold tracking-widest text-ariwatch-black uppercase">Description</label>
        <textarea required rows={4} name="description" value={formData.description} onChange={handleChange} className="border border-gray-300 p-3 text-sm focus:outline-none focus:border-ariwatch-black resize-none"></textarea>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-bold tracking-widest text-ariwatch-black uppercase">Image URL</label>
        <input required type="text" name="imageUrl" value={formData.imageUrl} onChange={handleChange} className="border border-gray-300 p-3 text-sm focus:outline-none focus:border-ariwatch-black" />
      </div>

      <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
        {initialData?.id ? (
           <button type="button" onClick={handleDelete} disabled={loading} className="text-xs font-bold tracking-widest text-red-600 uppercase hover:underline">
             {dict.admin.delete}
           </button>
        ) : <div></div>}
        
        <button type="submit" disabled={loading} className="bg-ariwatch-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-black transition">
          {loading ? "Saving..." : dict.admin.save}
        </button>
      </div>
    </form>
  );
}
