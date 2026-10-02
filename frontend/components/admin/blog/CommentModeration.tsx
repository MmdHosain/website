"use client";
import { useCallback, useEffect, useState } from 'react';
import { BlogComment, blogService } from '../../../services/blog.service';
export function CommentModeration({ lang }:{ lang:string }) {
  const fa=lang==='fa', t=(en:string,faText:string)=>fa ? faText : en;
  const [comments,setComments]=useState<BlogComment[]>([]), [loading,setLoading]=useState(true), [busy,setBusy]=useState(''), [error,setError]=useState('');
  const load=useCallback(async()=>{ setLoading(true);setError(''); try { setComments(await blogService.moderateList()); } catch { setError(t('Could not load comments.','بارگذاری دیدگاه‌ها انجام نشد.')); } finally { setLoading(false); } },[lang]);
  useEffect(()=>{ void load(); },[load]);
  async function moderate(id:string,status:BlogComment['status']) {
    setBusy(id);setError(''); try { const result=await blogService.moderate(id,status);setComments(current=>current.map(comment=>comment.id===id ? {...comment,status:result.status} : comment)); }
    catch { setError(t('Could not update the comment.','تغییر وضعیت دیدگاه انجام نشد.')); } finally { setBusy(''); }
  }
  return <section className="mt-12 border-t border-gray-200 pt-8"><div className="flex justify-between gap-4 mb-5"><h2 className="font-serif text-2xl">{t('Comment moderation','بررسی دیدگاه‌ها')}</h2><button onClick={()=>void load()} className="text-sm underline">{t('Refresh','تازه‌سازی')}</button></div>
    {error&&<p role="alert" className="text-red-700 mb-5">{error}</p>}
    {loading ? <p role="status">{t('Loading…','در حال بارگذاری…')}</p> : !comments.length ? <p className="text-gray-500">{t('No comments to review.','دیدگاهی برای بررسی وجود ندارد.')}</p> : <div className="space-y-4">{comments.map(comment=><article key={comment.id} className="bg-white border border-gray-200 p-5">
      <div className="flex flex-wrap justify-between gap-3"><strong>{comment.name}</strong><span className="text-xs text-gray-500">{comment.status==='pending' ? t('Pending review','در انتظار بررسی') : comment.status==='approved' ? t('Approved','تأییدشده') : t('Rejected','ردشده')}</span></div>
      <p className="text-sm text-gray-500 my-2">{comment.articleTitle}</p><p className="whitespace-pre-wrap break-words mb-4">{comment.body}</p>
      <div className="flex gap-4 text-sm"><button disabled={busy!==''||comment.status==='approved'} onClick={()=>void moderate(comment.id,'approved')} className="text-green-700 underline disabled:opacity-30">{t('Approve','تأیید')}</button>
        <button disabled={busy!==''||comment.status==='rejected'} onClick={()=>void moderate(comment.id,'rejected')} className="text-red-700 underline disabled:opacity-30">{t('Reject','رد')}</button></div>
    </article>)}</div>}
  </section>;
}
