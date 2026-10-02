"use client";
import { ImportPreview as Preview } from '../../../services/bulk.service';
import { formatPrice } from '../../../services/format';
export function ImportPreview({ preview,lang,busy,onConfirm }:{ preview:Preview; lang:string; busy:boolean; onConfirm:()=>void }) {
  const fa=lang==='fa',t=(en:string,faText:string)=>fa ? faText : en;
  const fields:Record<string,string>={ sku:'SKU',name:'نام',description:'توضیح',priceToman:'قیمت',stockQuantity:'موجودی',category:'دسته‌بندی',features:'ویژگی‌ها',imageFilename:'نام تصویر',imageUrl:'نشانی تصویر',salePriceToman:'قیمت ویژه',saleStartsAt:'شروع تخفیف',saleEndsAt:'پایان تخفیف',product:'محصول',images:'تصاویر' };
  const message=(value:string)=>!fa ? value : value.startsWith('Use ') && value.includes('text characters') ? 'متن در محدوده طول مجاز وارد کنید.' :
    value.includes('whole numeric') ? 'عدد صحیح در محدوده مجاز وارد کنید.' : value==='Duplicate SKU in this workbook' ? 'SKU در فایل تکراری است.' :
    value==='Image is missing from the ZIP' ? 'تصویر در فایل ZIP وجود ندارد.' : value.includes('Choose imageFilename') ? 'فقط نام تصویر یا نشانی تصویر را وارد کنید.' :
    value.includes('Provide imageFilename') ? 'نام تصویر ZIP یا نشانی HTTPS تصویر را وارد کنید.' : value.includes('HTTPS') ? 'نشانی HTTPS معتبر وارد کنید.' :
    value.includes('ASCII') ? 'SKU فقط شامل حروف انگلیسی، عدد، نقطه، خط تیره یا زیرخط باشد.' : value.includes('Use original') ? 'دسته باید original، highcopy یا custom باشد.' :
    value.includes('Sale price') ? 'قیمت ویژه باید کمتر از قیمت اصلی باشد.' : value.includes('Sale start') ? 'تاریخ شروع باید پیش از پایان باشد.' : value.startsWith('Unused ZIP image:') ? `تصویر استفاده‌نشده: ${value.split(': ').slice(1).join(': ')}` : value;
  return <section className="mt-8 space-y-5" aria-labelledby="import-preview-title"><h2 id="import-preview-title" className="font-serif text-2xl">{t('Import preview','پیش‌نمایش ورود')}</h2>
    <p>{t(`${preview.createCount} new products · ${preview.updateCount} updates`,`${preview.createCount} محصول تازه · ${preview.updateCount} به‌روزرسانی`)}</p>
    <p className="text-sm text-gray-500">{t('Preview expires at','مهلت تأیید پیش‌نمایش:')} {new Date(preview.expiresAt).toLocaleString(fa ? 'fa-IR' : 'en-US')}</p>
    {preview.errors.length>0&&<div role="alert" className="border border-red-200 bg-red-50 p-5"><h3 className="font-bold text-red-700 mb-4">{t('Fix all errors, then upload again. Nothing has been imported.','همه خطاها را اصلاح و فایل را دوباره بارگذاری کنید. محصولی وارد نشده است.')}</h3>
      <ul className="space-y-2 text-sm">{preview.errors.map((error,index)=><li key={index}>{error.row ? t(`Row ${error.row}`,`ردیف ${error.row}`) : t('Images','تصاویر')} · {fa ? fields[error.field] || error.field : error.field}: {message(error.message)}</li>)}</ul></div>}
    <div className="overflow-x-auto border border-gray-200 bg-white"><table className="w-full text-sm"><thead className="bg-gray-50"><tr>{[t('Row','ردیف'),'SKU',t('Product','محصول'),t('Price','قیمت'),t('Stock','موجودی'),t('Action','عملیات'),t('Generated SEO title','عنوان خودکار جست‌وجو')].map(title=><th key={title} className="text-start p-4 whitespace-nowrap">{title}</th>)}</tr></thead>
      <tbody>{preview.rows.map(row=><tr key={row.row} className="border-t border-gray-100"><td className="p-4">{row.row}</td><td className="p-4 font-mono" dir="ltr">{row.sku}</td><td className="p-4">{row.name}</td><td className="p-4 whitespace-nowrap">{formatPrice(row.price,lang)}</td><td className="p-4">{row.stockQuantity}</td><td className="p-4">{row.action==='create' ? t('Create','ایجاد') : t('Update','به‌روزرسانی')}</td><td className="p-4"><span>{row.metaTitle}</span><span className="block text-xs text-gray-500 mt-2">{row.metaDescription}</span></td></tr>)}</tbody></table></div>
    <button disabled={busy||!preview.canConfirm} onClick={onConfirm} className="px-6 py-3 bg-ariwatch-red text-white disabled:opacity-40">{busy ? t('Importing…','در حال ورود…') : t('Confirm and import all products','تأیید و ورود همه محصولات')}</button>
  </section>;
}
