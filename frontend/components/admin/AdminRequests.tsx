"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiRequest } from "../../services/api";

interface Inquiry { id: string; name: string; email: string; model: string; message: string; lang: string; createdAt: string }
interface Subscriber { id: string; email: string; lang: string; createdAt: string }

export function AdminRequests({ lang }: { lang: string }) {
  const isFa = lang === "fa";
  const [tab, setTab] = useState<"concierge" | "newsletter">("concierge");
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestVersion = useRef(0);

  const load = useCallback(async () => {
    const version = ++requestVersion.current;
    setLoading(true);
    setError("");
    try {
      if (tab === "concierge") {
        const data = await apiRequest<Inquiry[]>("/api/admin/concierge", { authenticated: true });
        if (version === requestVersion.current) setInquiries(data);
      } else {
        const data = await apiRequest<Subscriber[]>("/api/admin/newsletter", { authenticated: true });
        if (version === requestVersion.current) setSubscribers(data);
      }
    } catch (cause) {
      if (version === requestVersion.current) setError(cause instanceof Error ? cause.message : (isFa ? "بارگذاری درخواست‌ها انجام نشد." : "Could not load requests."));
    } finally { if (version === requestVersion.current) setLoading(false); }
  }, [tab, isFa]);

  useEffect(() => {
    void load();
    return () => { requestVersion.current++; };
  }, [load]);
  const formatDate = (value: string) => new Date(value).toLocaleString(isFa ? "fa-IR" : "en-US", { timeZone: "Asia/Tehran" });

  return (
    <div>
      <div className="flex justify-between items-center gap-4 mb-8">
        <h1 className="font-serif text-2xl md:text-3xl">{isFa ? "درخواست‌های مشتریان" : "Customer requests"}</h1>
        <button type="button" onClick={() => void load()} disabled={loading} className="border border-gray-300 bg-white px-4 py-2 text-xs font-bold disabled:opacity-50">{isFa ? "تازه‌سازی" : "Refresh"}</button>
      </div>
      <div className="flex gap-4 border-b border-gray-200 mb-6" role="tablist" aria-label={isFa ? "نوع درخواست" : "Request type"} onKeyDown={(event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        const next = event.key === "Home" ? "concierge" : event.key === "End" ? "newsletter" : tab === "concierge" ? "newsletter" : "concierge";
        setTab(next);
        document.getElementById(`${next}-tab`)?.focus();
      }}>
        <button type="button" id="concierge-tab" role="tab" tabIndex={tab === "concierge" ? 0 : -1} aria-selected={tab === "concierge"} aria-controls="requests-panel" onClick={() => setTab("concierge")} className={`px-3 py-3 text-sm border-b-2 ${tab === "concierge" ? "border-ariwatch-red text-ariwatch-red" : "border-transparent text-gray-600"}`}>{isFa ? "درخواست اختصاصی" : "Concierge inquiries"}</button>
        <button type="button" id="newsletter-tab" role="tab" tabIndex={tab === "newsletter" ? 0 : -1} aria-selected={tab === "newsletter"} aria-controls="requests-panel" onClick={() => setTab("newsletter")} className={`px-3 py-3 text-sm border-b-2 ${tab === "newsletter" ? "border-ariwatch-red text-ariwatch-red" : "border-transparent text-gray-600"}`}>{isFa ? "مشترکان خبرنامه" : "Newsletter subscribers"}</button>
      </div>
      {error && <div role="alert" className="p-4 mb-4 bg-red-50 text-red-700 text-sm">{error}</div>}
      <div id="requests-panel" role="tabpanel" tabIndex={0} aria-labelledby={`${tab}-tab`}>
        {loading ? <p role="status" className="p-8 text-gray-500">{isFa ? "در حال بارگذاری…" : "Loading requests…"}</p> : tab === "concierge" ? (
          <div className="space-y-5">
            {!error && inquiries.length === 0 && <p className="p-8 bg-white border border-gray-200 text-gray-500">{isFa ? "درخواستی ثبت نشده است." : "No inquiries yet."}</p>}
            {inquiries.map((inquiry) => (
              <article key={inquiry.id} className="p-5 md:p-6 border border-gray-200 bg-white">
                <div className="flex justify-between flex-wrap gap-3">
                  <h2 className="text-sm font-bold">{inquiry.name}</h2>
                  <time dateTime={inquiry.createdAt} className="text-xs text-gray-500">{formatDate(inquiry.createdAt)}</time>
                </div>
                <a className="text-sm underline text-gray-600 inline-block mt-2" dir="ltr" href={`mailto:${inquiry.email}`}>{inquiry.email}</a>
                <h3 className="mt-4 font-bold text-sm">{inquiry.model}</h3>
                <p className="mt-2 text-sm leading-7 text-gray-600 whitespace-pre-wrap break-words">{inquiry.message}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 overflow-x-auto">
            <table className="w-full text-sm"><thead><tr className="border-b border-gray-200 bg-gray-50">
              <th scope="col" className="p-4 text-start">{isFa ? "ایمیل" : "Email"}</th><th scope="col" className="p-4 text-start">{isFa ? "زبان" : "Language"}</th><th scope="col" className="p-4 text-start">{isFa ? "تاریخ عضویت" : "Subscribed"}</th>
            </tr></thead><tbody>
              {subscribers.map((subscriber) => <tr key={subscriber.id} className="border-b border-gray-100"><td className="p-4"><a dir="ltr" href={`mailto:${subscriber.email}`} className="underline">{subscriber.email}</a></td><td className="p-4">{subscriber.lang === "fa" ? (isFa ? "فارسی" : "Persian") : (isFa ? "انگلیسی" : "English")}</td><td className="p-4 whitespace-nowrap">{formatDate(subscriber.createdAt)}</td></tr>)}
              {!error && subscribers.length === 0 && <tr><td colSpan={3} className="p-8 text-center text-gray-500">{isFa ? "مشترکی ثبت نشده است." : "No subscribers yet."}</td></tr>}
            </tbody></table>
          </div>
        )}
      </div>
    </div>
  );
}
