import { getDictionary } from "../../dictionaries";
import { watchService } from "../../../services/watch.service";
import Link from "next/link";
import { Watch } from "../../../types";

export default async function AdminDashboard({ params: { lang } }: { params: { lang: 'en' | 'fa' } }) {
  const dict = await getDictionary(lang);
  const watches = await watchService.getAll();

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl md:text-3xl font-serif text-ariwatch-black uppercase">
          {dict.admin.products}
        </h1>
        <Link href={`/${lang}/admin/watches/new`}>
          <button className="bg-ariwatch-red text-white px-6 py-2 text-xs font-bold tracking-widest uppercase hover:bg-red-800 transition">
            {dict.admin.addNew}
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-[10px] tracking-widest uppercase text-ariwatch-gray">
              <th className="p-4 font-bold">ID</th>
              <th className="p-4 font-bold">{dict.admin.name}</th>
              <th className="p-4 font-bold">{dict.admin.category}</th>
              <th className="p-4 font-bold">{dict.admin.price}</th>
              <th className="p-4 font-bold text-right">{dict.admin.actions}</th>
            </tr>
          </thead>
          <tbody>
            {watches.map((watch: Watch) => (
              <tr key={watch.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="p-4 text-xs text-gray-400 font-mono">{watch.id.substring(0, 8)}...</td>
                <td className="p-4 text-sm font-bold text-ariwatch-black">{watch.name}</td>
                <td className="p-4">
                  <span className="text-[10px] font-bold tracking-widest uppercase bg-gray-200 px-2 py-1 rounded">
                    {watch.category || 'original'}
                  </span>
                </td>
                <td className="p-4 text-sm text-ariwatch-gray">${Number(watch.price).toLocaleString()}</td>
                <td className="p-4 text-right flex justify-end gap-3">
                   <Link href={`/${lang}/admin/watches/new?id=${watch.id}`} className="text-xs font-bold tracking-widest text-blue-600 hover:underline uppercase">
                     {dict.admin.edit}
                   </Link>
                </td>
              </tr>
            ))}
            {watches.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No watches found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
