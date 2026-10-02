import writeExcelFile, { Cell, SheetData } from 'write-excel-file/node';
import { catalogHeaders } from './catalogRows';

const cell = (value: unknown): Cell => ({ fontFamily:'Arial',fontSize:10,height:24,alignVertical:'center',
  ...(value instanceof Date ? { value,type:Date,format:'yyyy-mm-dd hh:mm',align:'left' } : typeof value === 'number' ? { value,type:Number,format:'#,##0',align:'right' } :
    { value:String(value ?? '').slice(0,32767),type:String,format:'@',align:'left' }) });
const heading = (titles: string[]):Cell[] => titles.map(value => ({ value,type:String,fontFamily:'Arial',fontSize:10,height:32,align:'center',alignVertical:'center',
  fontWeight:'bold',backgroundColor:'#202020',textColor:'#ffffff',rightBorderStyle:'thin',rightBorderColor:'#ffffff',wrap:true }));
export async function catalogTemplate(): Promise<Buffer> {
  const example = ['ARI-001','Sample automatic watch','Stainless steel automatic watch',2500000,'original',20,'Automatic movement; stainless steel','', 'https://example.com/watch.jpg','','',''];
  const instructions = [
    ['Catalog import / راهنمای ورود محصولات'],
    ['Replace the sample row. Use at most 500 products. Prices are whole Iranian toman; stock is 0–1,000,000.'],
    ['SKU is stable and case-insensitive: repeat imports update the existing product. Do not change it to edit a product.'],
    ['Keep SKU and imageFilename cells as text. No formulas, macros or external workbook links are allowed.'],
    ['Provide either imageUrl (HTTPS) or imageFilename matching a flat PNG/JPEG/WebP ZIP entry. No folders.'],
    ['XLSX ≤2MB; image ZIP ≤20MB; at most 200 images, each ≤5MB, expanded total ≤20MB.'],
    ['Category: original / highcopy / custom. Optional salePriceToman must be lower than priceToman.'],
    ['Sale dates: ISO 8601 text, for example 2026-10-01T00:00:00+03:30. Both dates required with sale price.'],
    ['Title and meta description are generated from name and features. Existing variants are preserved.'],
    ['Preview shows every row error. Confirm is allowed only after all errors are fixed; preview expires in 20 minutes.'],
    ['نمونه را جایگزین کنید. قیمت به تومان، موجودی عدد صحیح و SKU ثابت است. نام تصویر دقیقاً با فایل ZIP برابر باشد.'],
  ].map(row => row.map(cell));
  return writeExcelFile([{ sheet:'Products',data:[heading(catalogHeaders),example.map(cell)],stickyRowsCount:1,stickyColumnsCount:1,showGridLines:false,
    columns:catalogHeaders.map((_,i) => ({ width: [24,32,45,20,18,20,45,24,45,24,32,32][i] })) },
    { sheet:'Instructions',data:instructions,columns:[{ width:130 }],showGridLines:false }]).toBuffer();
}

export async function exportOrdersXlsx(rows: any[]): Promise<Buffer> {
  const headers = ['Order ID','Created at (UTC)','Paid at (UTC)','Status','Currency','Subtotal (toman)','Discount (toman)','Shipping (toman)',
    'Total (toman)','Refund due (toman)','Refund status','Payment receipt','Customer','Mobile','Email','City','Postal code','Address','Notes','Items'];
  const data: SheetData = [heading(headers),...rows.map(row => {
    const customer = row.customer || {}, items = row.items || [];
    const paid = row.paid_at ?? row.paidAt;
    return [row.id,new Date(row.created_at ?? row.createdAt),paid ? new Date(paid) : '',row.status,row.currency,
      Number(row.subtotal ?? row.total),Number(row.discount ?? 0),Number(row.shipping ?? 0),Number(row.total),Number(row.refund_due ?? row.refundDue ?? 0),
      row.refund_status ?? row.refundStatus ?? 'none',row.payment_ref_id ?? row.paymentRefId ?? '',customer.name,row.mobile ?? row.customerMobile,
      customer.email,customer.city,customer.postalCode,customer.address,customer.notes,
      items.map((item: any) => `${item.name}${item.variantLabel ? ` (${item.variantLabel})` : ''} ×${item.quantity} @${item.price}`).join('; ')].map(cell);
  })];
  return writeExcelFile(data,{ sheet:'Orders',stickyRowsCount:1,stickyColumnsCount:1,showGridLines:false,columns:headers.map((_,i) => ({ width:i === 0 ? 38 : i >= 17 ? 55 : 24 })) }).toBuffer();
}
