import { getDictionary } from "../../../../dictionaries";
import { watchService } from "../../../../../services/watch.service";
import { WatchForm } from "../../../../../components/admin/WatchForm";

export default async function NewWatchPage({ 
  params: { lang },
  searchParams
}: { 
  params: { lang: 'en' | 'fa' },
  searchParams: { id?: string }
}) {
  const dict = await getDictionary(lang);
  const isEdit = !!searchParams.id;
  let initialData = null;

  if (isEdit) {
    initialData = await watchService.getById(searchParams.id as string);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-serif text-ariwatch-black uppercase mb-8">
        {isEdit ? dict.admin.edit : dict.admin.addNew}
      </h1>
      
      <div className="bg-white p-8 rounded-md shadow-sm border border-gray-200">
        <WatchForm lang={lang} dict={dict} initialData={initialData} />
      </div>
    </div>
  );
}
