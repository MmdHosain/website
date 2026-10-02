"use client";
import { useEffect, useState } from 'react';
import { blogService, BlogComment } from '../../services/blog.service';
import { authService } from '../../services/auth.service';
import { AuthModal } from '../auth/AuthModal';
export function BlogComments({ id,slug,lang,dict }:{ id:string; slug:string; lang:string; dict:any }) {
  const fa = lang === 'fa', t = (en:string,faText:string) => fa ? faText : en;
  const [comments,setComments] = useState<BlogComment[]>([]), [name,setName] = useState(''), [body,setBody] = useState('');
  const [loading,setLoading] = useState(true), [busy,setBusy] = useState(false), [error,setError] = useState(''), [sent,setSent] = useState(false), [auth,setAuth] = useState(false);
  useEffect(() => { let active = true; setLoading(true);
    blogService.comments(slug,lang).then(rows => { if (active) setComments(rows); }).catch(() => { if (active) setError(t('Could not load comments.','بارگذاری دیدگاه‌ها انجام نشد.')); })
      .finally(() => { if (active) setLoading(false); }); return () => { active=false; };
  },[slug,lang]);
  async function submit(event:React.FormEvent) {
    event.preventDefault(); if (!authService.getToken()) { setAuth(true); return; }
    setBusy(true); setError(''); setSent(false);
    try { await blogService.comment(id,name,body); setBody(''); setSent(true); }
    catch { setError(t('Could not submit your comment. Sign in and try again.','دیدگاه ارسال نشد. وارد حساب شوید و دوباره تلاش کنید.')); }
    finally { setBusy(false); }
  }
  return <section className="mt-16 border-t border-gray-200 pt-10" aria-labelledby="comments-title">
    <h2 id="comments-title" className="text-2xl font-serif mb-6">{t('Reader comments','دیدگاه خوانندگان')}</h2>
    {loading ? <p role="status">{t('Loading comments…','در حال بارگذاری دیدگاه‌ها…')}</p> : !comments.length ? <p className="text-gray-500">{t('Be the first to leave a comment.','اولین دیدگاه را بنویسید.')}</p> :
      <div className="space-y-6">{comments.map(comment => <article key={comment.id} className="bg-gray-50 p-5">
        <div className="flex flex-wrap gap-3 justify-between text-sm mb-3"><strong>{comment.name}</strong><time className="text-gray-500" dateTime={comment.createdAt}>{new Date(comment.createdAt).toLocaleDateString(fa ? 'fa-IR' : 'en-US')}</time></div>
        <p className="whitespace-pre-wrap break-words">{comment.body}</p>
      </article>)}</div>}
    <form onSubmit={submit} className="mt-8 space-y-4">
      <p className="text-sm text-gray-600">{t('Sign in to comment. Comments appear after staff approval.','برای ثبت دیدگاه وارد شوید. دیدگاه پس از تأیید مدیریت نمایش داده می‌شود.')}</p>
      <label className="block text-sm">{t('Display name','نام نمایشی')}<input required minLength={2} maxLength={100} value={name} onChange={event => setName(event.target.value)} className="mt-2 w-full border border-gray-300 p-3" autoComplete="name" /></label>
      <label className="block text-sm">{t('Comment','دیدگاه')}<textarea required minLength={2} maxLength={2000} rows={4} value={body} onChange={event => setBody(event.target.value)} className="mt-2 w-full border border-gray-300 p-3" /></label>
      {error && <p role="alert" className="text-red-700">{error}</p>}
      {sent && <p role="status" className="text-green-700">{t('Your comment was submitted for review.','دیدگاه شما برای بررسی ارسال شد.')}</p>}
      <button disabled={busy} className="bg-ariwatch-red text-white px-6 py-3 disabled:opacity-50">{busy ? t('Submitting…','در حال ارسال…') : t('Submit comment','ارسال دیدگاه')}</button>
    </form>
    <AuthModal isOpen={auth} onClose={() => setAuth(false)} onSuccess={() => setAuth(false)} dict={dict} isFa={fa} />
  </section>;
}
