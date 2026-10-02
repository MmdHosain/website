"use client";
import Link from 'next/link';
import { useState } from 'react';
import { ApiError } from '../../../services/api';
import { bulkService, ImportPreview as Preview } from '../../../services/bulk.service';
import { ImportPreview } from './ImportPreview';
export function AdminImport({ lang }:{ lang:string }) {
  const fa=lang==='fa',t=(en:string,faText:string)=>fa ? faText : en;
  const [workbook,setWorkbook]=useState<File|null>(null),[images,setImages]=useState<File|null>(null),[preview,setPreview]=useState<Preview|null>(null);
  const [busy,setBusy]=useState(''),[error,setError]=useState(''),[done,setDone]=useState('');
  const failure=(cause:unknown)=>cause instanceof ApiError&&cause.status===403 ? t('Catalog permission is required.','دسترسی مدیریت محصولات لازم است.') :
    fa ? 'عملیات انجام نشد. قالب فایل، اندازه مجاز و نشست ورود خود را بررسی کنید و دوباره تلاش کنید.' : cause instanceof Error ? cause.message : 'Request failed. Please try again.';
  async function download(){setBusy('template');setError('');try{await bulkService.template();}catch(cause){setError(failure(cause));}finally{setBusy('');}}
  async function upload(event:React.FormEvent){event.preventDefault();if(!workbook)return;setBusy('preview');setError('');setDone('');setPreview(null);
    try{if(workbook.size>2*1024*1024||(images&&images.size>20*1024*1024))throw new Error(t('XLSX must be at most 2MB and ZIP at most 20MB.','فایل اکسل حداکثر ۲ مگابایت و ZIP حداکثر ۲۰ مگابایت باشد.'));setPreview(await bulkService.preview(workbook,images));}
    catch(cause){setError(failure(cause));}finally{setBusy('');}}
  async function confirm(){if(!preview)return;setBusy('confirm');setError('');try{const result=await bulkService.confirm(preview.id);setDone(t(`Imported ${result.imported} products: ${result.created} created, ${result.updated} updated.`,`${result.imported} محصول وارد شد: ${result.created} ایجاد، ${result.updated} به‌روزرسانی.`));setPreview(null);}catch(cause){setError(failure(cause));}finally{setBusy('');}}
  const change=()=>{setPreview(null);setDone('');setError('');};
  return <div><h1 className="font-serif text-3xl mb-5">{t('Bulk product import','ورود گروهی محصولات')}</h1><p className="text-gray-600 mb-6 leading-7">{t('Download the standard Excel template. Add products and optional image ZIP, review every row, then confirm. Stable SKUs update existing products.','قالب استاندارد اکسل را دانلود کنید. محصولات و فایل ZIP تصاویر را اضافه کنید، همه ردیف‌ها را بررسی و سپس تأیید کنید. SKU ثابت محصولات موجود را به‌روزرسانی می‌کند.')}</p>
    <button disabled={busy!==''} onClick={()=>void download()} className="text-ariwatch-red underline mb-7 disabled:opacity-40">{t('Download XLSX template','دانلود قالب XLSX')}</button>
    <form onSubmit={upload} className="bg-white border border-gray-200 p-5 md:p-8 space-y-5">
      <label className="block text-sm font-bold">{t('Products workbook (.xlsx, up to 2MB)','فایل محصولات (.xlsx، حداکثر ۲ مگابایت)')}<input required disabled={busy!==''} type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={event=>{setWorkbook(event.target.files?.[0]||null);change();}} className="block mt-3 w-full text-sm border border-gray-200 p-3"/></label>
      <label className="block text-sm font-bold">{t('Optional images (.zip, up to 20MB)','تصاویر اختیاری (.zip، حداکثر ۲۰ مگابایت)')}<input disabled={busy!==''} type="file" accept=".zip,application/zip" onChange={event=>{setImages(event.target.files?.[0]||null);change();}} className="block mt-3 w-full text-sm border border-gray-200 p-3"/></label>
      <p className="text-xs text-gray-500 leading-6">{t('At most 500 rows and 200 images. ZIP images must be flat PNG/JPEG/WebP files, at most 5MB each and 20MB expanded total. Keep filenames identical to imageFilename. No formulas, macros, folders or external workbook links.','حداکثر ۵۰۰ ردیف و ۲۰۰ تصویر. تصاویر ZIP باید PNG/JPEG/WebP بدون پوشه، هرکدام حداکثر ۵ مگابایت و مجموع بازشده حداکثر ۲۰ مگابایت باشند. نام فایل با imageFilename یکسان باشد. فرمول، ماکرو و پیوند خارجی اکسل مجاز نیست.')}</p>
      <button disabled={busy!==''||!workbook} className="px-6 py-3 bg-ariwatch-red text-white disabled:opacity-40">{busy==='preview' ? t('Validating…','در حال بررسی…') : t('Upload and preview','بارگذاری و پیش‌نمایش')}</button>
    </form>
    {error&&<p role="alert" className="bg-red-50 text-red-700 p-5 mt-5">{error}</p>}
    {done&&<div role="status" className="bg-green-50 text-green-800 p-5 mt-5">{done} <Link href={`/${lang}/admin`} className="underline">{t('View catalog','مشاهده محصولات')}</Link></div>}
    {preview&&<ImportPreview preview={preview} lang={lang} busy={busy!==''} onConfirm={()=>void confirm()}/>}
  </div>;
}
