import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { watchService } from '../services/watch.service';
import { Watch } from '../types';
import { watchDraft, watchPayload, VariantDraft } from '../components/admin/watchFormModel';
export function useWatchForm(lang: string, initialData?: Watch | null) {
  const router = useRouter(), isFa = lang === 'fa';
  const [loading, setLoading] = useState(false), [error, setError] = useState('');
  const [formData, setFormData] = useState(() => watchDraft(initialData));
  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(previous => ({ ...previous, [event.target.name]: event.target.value })); setError('');
  };
  const setVariants = (variants: VariantDraft[]) => setFormData(previous => ({ ...previous, variants }));
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    try {
      const payload = watchPayload(formData); setLoading(true);
      if (initialData?.id) await watchService.update(initialData.id, payload);
      else await watchService.create(payload);
      router.push(`/${lang}/admin`); router.refresh();
    } catch (cause) { setError(cause instanceof Error ? cause.message : (isFa ? 'ذخیره محصول انجام نشد.' : 'Could not save the product.')); }
    finally { setLoading(false); }
  };
  const handleDelete = async () => {
    if (!initialData?.id || !window.confirm(isFa ? 'این ساعت از فروشگاه حذف شود؟' : 'Delete this watch from the catalog?')) return;
    setLoading(true); setError('');
    try { await watchService.delete(initialData.id); router.push(`/${lang}/admin`); router.refresh(); }
    catch (cause) { setError(cause instanceof Error ? cause.message : (isFa ? 'حذف محصول انجام نشد.' : 'Could not delete the product.')); }
    finally { setLoading(false); }
  };
  return { formData, loading, error, handleChange, handleSubmit, handleDelete, setVariants };
}
