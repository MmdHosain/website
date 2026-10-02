"use client";
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { BlogArticle, blogService } from '../../../services/blog.service';
import { watchService } from '../../../services/watch.service';
import { Watch } from '../../../types';
import { ArticleEditor } from './ArticleEditor';
import { CommentModeration } from './CommentModeration';
export function AdminBlog({ lang }:{ lang:string }) {
  const fa=lang==='fa',t=(en:string,faText:string)=>fa ? faText : en;
  const [articles,setArticles]=useState<BlogArticle[]>([]),[watches,setWatches]=useState<Watch[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [editing,setEditing]=useState<BlogArticle|null>(null),[open,setOpen]=useState(false),[busy,setBusy]=useState('');
  const load=useCallback(async()=>{setLoading(true);setError('');
    const [blogs,products]=await Promise.allSettled([blogService.adminList(),watchService.getAll()]);
    if(blogs.status==='fulfilled')setArticles(blogs.value);else setError(t('Could not load articles. Check your blog permission.','بارگذاری مطالب انجام نشد. دسترسی مدیریت مجله را بررسی کنید.'));
    if(products.status==='fulfilled')setWatches(products.value);setLoading(false);
  },[lang]);
  useEffect(()=>{ void load(); },[load]);
  async function remove(article:BlogArticle) {
    if(!window.confirm(t(`Delete “${article.title}” and its comments?`,`مطلب «${article.title}» و دیدگاه‌های آن حذف شوند؟`)))return;
    setBusy(article.id);setError('');try{await blogService.remove(article.id);await load();}catch{setError(t('Could not delete article.','حذف مطلب انجام نشد.'));}finally{setBusy('');}
  }
  return <div><div className="flex flex-wrap justify-between gap-4 mb-8"><h1 className="text-3xl font-serif">{t('Journal management','مدیریت مجله')}</h1><button onClick={()=>{setEditing(null);setOpen(true);}} className="px-6 py-3 bg-ariwatch-red text-white text-sm">{t('New article','مطلب تازه')}</button></div>
    {open&&<ArticleEditor article={editing} lang={lang} watches={watches} onClose={()=>setOpen(false)} onSaved={()=>{setOpen(false);void load();}}/>}
    {error&&<p role="alert" className="mb-5 text-red-700">{error} <button onClick={()=>void load()} className="underline">{t('Retry','تلاش دوباره')}</button></p>}
    {loading ? <p role="status">{t('Loading…','در حال بارگذاری…')}</p> : !articles.length ? <p className="p-8 bg-white border border-gray-200">{t('Create your first article above.','اولین مطلب را با دکمه بالا ایجاد کنید.')}</p> : <div className="overflow-x-auto border border-gray-200 bg-white"><table className="w-full text-sm"><thead className="bg-gray-50"><tr>
      {[t('Title','عنوان'),t('Language','زبان'),t('Status','وضعیت'),t('Actions','عملیات')].map(title=><th key={title} className="text-start p-4">{title}</th>)}</tr></thead><tbody>{articles.map(article=><tr key={article.id} className="border-t border-gray-100">
        <td className="p-4 font-bold">{article.title}</td><td className="p-4">{article.lang==='fa' ? 'فارسی' : 'English'}</td><td className="p-4">{article.status==='draft' ? t('Draft','پیش‌نویس') : t('Published','منتشرشده')}</td><td className="p-4"><div className="flex gap-4">
          <button onClick={()=>{setEditing(article);setOpen(true);}} className="text-blue-700 underline">{t('Edit','ویرایش')}</button>
          {article.status==='published'&&<Link href={`/${article.lang}/blog/${encodeURIComponent(article.slug)}`} className="underline">{t('View','مشاهده')}</Link>}
          <button disabled={busy!==''} onClick={()=>void remove(article)} className="text-red-700 underline disabled:opacity-30">{t('Delete','حذف')}</button>
        </div></td></tr>)}</tbody></table></div>}
    <CommentModeration lang={lang}/>
  </div>;
}
