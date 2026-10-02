"use client";
import { useEffect, useState } from 'react';
import { ArticleInput, BlogArticle, BlogBlock, blogService } from '../../../services/blog.service';
import { Watch } from '../../../types';
export function ArticleEditor({ article,lang,watches,onSaved,onClose }:{ article:BlogArticle|null; lang:string; watches:Watch[]; onSaved:()=>void; onClose:()=>void }) {
  const fa = lang === 'fa', t = (en:string,faText:string) => fa ? faText : en;
  const fresh = ():ArticleInput => ({ lang:fa ? 'fa' : 'en',title:'',slug:'',excerpt:'',status:'draft',blocks:[{ type:'text',text:'' }] });
  const [form,setForm] = useState<ArticleInput>(article || fresh()), [busy,setBusy] = useState(false), [error,setError] = useState('');
  useEffect(() => { setForm(article || fresh()); setError(''); },[article]);
  const field = (key:keyof ArticleInput,value:unknown) => setForm(current => ({ ...current,[key]:value }));
  const blockChange = (index:number,value:BlogBlock) => field('blocks',form.blocks.map((block,i) => i === index ? value : block));
  const move = (index:number,direction:number) => { const blocks = [...form.blocks]; [blocks[index],blocks[index+direction]]=[blocks[index+direction],blocks[index]]; field('blocks',blocks); };
  async function save(event:React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try { await blogService.save(form,article?.id); onSaved(); }
    catch (cause) { setError(fa ? 'ذخیره انجام نشد. یکتایی نامک، متن بلوک‌ها و دسترسی خود را بررسی کنید.' : cause instanceof Error ? cause.message : 'Could not save article.'); }
    finally { setBusy(false); }
  }
  const input = 'w-full mt-2 border border-gray-300 p-3 bg-white';
  return <form onSubmit={save} className="border border-gray-200 bg-white p-5 md:p-8 space-y-5 mb-8">
    <div className="flex justify-between gap-4"><h2 className="text-xl font-serif">{article ? t('Edit article','ویرایش مطلب') : t('New article','مطلب تازه')}</h2><button type="button" onClick={onClose} className="text-sm underline">{t('Close','بستن')}</button></div>
    <div className="grid sm:grid-cols-2 gap-4">
      <label className="text-sm">{t('Article language','زبان مطلب')}<select className={input} value={form.lang} onChange={event => field('lang',event.target.value)}><option value="fa">فارسی</option><option value="en">English</option></select></label>
      <label className="text-sm">{t('Visibility','وضعیت انتشار')}<select className={input} value={form.status} onChange={event => field('status',event.target.value)}><option value="draft">{t('Draft — private','پیش‌نویس — خصوصی')}</option><option value="published">{t('Published — public','منتشرشده — عمومی')}</option></select></label>
    </div>
    <label className="block text-sm">{t('Title','عنوان')}<input required maxLength={160} className={input} value={form.title} onChange={event => field('title',event.target.value)} /></label>
    <label className="block text-sm">{t('URL slug (letters, numbers and hyphens)','نامک نشانی (حروف، عدد و خط تیره)')}<input required maxLength={180} className={input} dir="auto" value={form.slug} onChange={event => field('slug',event.target.value)} /></label>
    <label className="block text-sm">{t('Excerpt / search description','چکیده / توضیح موتور جست‌وجو')}<textarea required maxLength={320} rows={3} className={input} value={form.excerpt} onChange={event => field('excerpt',event.target.value)} /></label>
    <div className="flex flex-wrap justify-between items-center gap-3"><h3 className="font-bold">{t('Article content','محتوای مطلب')}</h3><span className="text-xs text-gray-500">{t('Text is plain text. Products can sit between paragraphs.','متن ساده است. محصول را می‌توانید میان پاراگراف‌ها قرار دهید.')}</span></div>
    {form.blocks.map((block,index) => <div key={index} className="border border-gray-200 bg-gray-50 p-4">
      <div className="flex flex-wrap justify-between gap-3 mb-3"><strong className="text-sm">{index+1}. {block.type === 'text' ? t('Text','متن') : t('Product','محصول')}</strong>
        <div className="flex gap-3 text-xs"><button type="button" disabled={index===0} onClick={() => move(index,-1)} className="underline disabled:opacity-30">{t('Move up','بالا')}</button>
          <button type="button" disabled={index===form.blocks.length-1} onClick={() => move(index,1)} className="underline disabled:opacity-30">{t('Move down','پایین')}</button>
          <button type="button" disabled={form.blocks.length===1} onClick={() => field('blocks',form.blocks.filter((_,i) => i!==index))} className="text-red-700 underline disabled:opacity-30">{t('Remove','حذف')}</button></div>
      </div>
      {block.type === 'text' ? <label className="block text-sm">{t('Paragraph text','متن پاراگراف')}<textarea required maxLength={10000} rows={5} className={input} value={block.text} onChange={event => blockChange(index,{ type:'text',text:event.target.value })} /></label> :
        <label className="block text-sm">{t('Embedded product','محصول در متن')}<select required className={input} value={block.watchId} onChange={event => blockChange(index,{ type:'product',watchId:event.target.value })}>
          <option value="">{t('Choose a product','انتخاب محصول')}</option>{watches.map(watch => <option key={watch.id} value={watch.id}>{watch.name}</option>)}
        </select></label>}
    </div>)}
    <div className="flex flex-wrap gap-4 text-sm"><button type="button" disabled={form.blocks.length>=80} onClick={() => field('blocks',[...form.blocks,{ type:'text',text:'' }])} className="underline">{t('Add text block','افزودن بلوک متن')}</button>
      <button type="button" disabled={!watches.length || form.blocks.length>=80} onClick={() => field('blocks',[...form.blocks,{ type:'product',watchId:watches[0].id }])} className="underline disabled:opacity-40">{t('Insert product','درج محصول')}</button></div>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    <button disabled={busy} className="px-6 py-3 bg-ariwatch-red text-white disabled:opacity-50">{busy ? t('Saving…','در حال ذخیره…') : form.status === 'published' ? t('Save and publish','ذخیره و انتشار') : t('Save draft','ذخیره پیش‌نویس')}</button>
  </form>;
}
