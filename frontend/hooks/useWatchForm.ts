import { useState } from "react";
import { useRouter } from "next/navigation";
import { watchService } from "../services/watch.service";
import { Watch } from "../types";

export function useWatchForm(lang: string, initialData?: Watch | null) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || "",
    category: initialData?.category || "original",
    imageUrl: initialData?.imageUrl || "placeholder",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        ...formData,
        price: Number(formData.price)
      };

      if (initialData?.id) {
        await watchService.update(initialData.id, payload);
      } else {
        await watchService.create(payload as Omit<Watch, 'id'>);
      }
      router.push(`/${lang}/admin`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initialData?.id || !confirm("Are you sure you want to delete this watch?")) return;
    setLoading(true);
    try {
      await watchService.delete(initialData.id);
      router.push(`/${lang}/admin`);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Failed to delete");
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    error,
    handleChange,
    handleSubmit,
    handleDelete,
  };
}
