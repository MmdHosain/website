import { readSheet } from 'read-excel-file/node';
import { HttpError } from '../errors';
import { watchData } from '../catalog/watchValidation';
import { safeWorkbook } from './safeArchive';

export const catalogHeaders = ['sku','name','description','priceToman','category','stockQuantity','features','imageFilename','imageUrl','salePriceToman','saleStartsAt','saleEndsAt'];
export interface ImportError { row: number; field: string; message: string; }
export interface CatalogRow { row: number; sku: string; name: string; description: string; price: number; category: string; stockQuantity: number;
  features: string; imageFilename: string; imageUrl: string; salePrice: number | null; saleStartsAt: string | null; saleEndsAt: string | null; metaTitle: string; metaDescription: string; }
export async function readCatalogRows(buffer: Buffer, imageNames: string[]): Promise<{ rows: CatalogRow[]; errors: ImportError[] }> {
  let sheet;
  try { sheet = await readSheet(safeWorkbook(buffer), 'Products'); }
  catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, 'Upload the standard XLSX template with a Products sheet'); }
  if (!sheet[0] || sheet[0].length !== catalogHeaders.length || catalogHeaders.some((name,i) => sheet[0][i] !== name)) throw new HttpError(400, 'The Products sheet headers must match the downloaded template');
  if (sheet.length > 501) throw new HttpError(400, 'Import at most 500 products');
  const rows: CatalogRow[] = [], errors: ImportError[] = [], seen = new Set<string>();
  for (let index = 1; index < sheet.length; index++) {
    const cells = sheet[index]; if (cells.every(cell => cell === null || cell === '')) continue;
    const row = index + 1, input = Object.fromEntries(catalogHeaders.map((key,i) => [key,cells[i]]));
    const err = (field: string, message: string) => errors.push({ row,field,message });
    const str = (field: string, max: number, required = false) => {
      const value = input[field] === null || input[field] === undefined ? '' : input[field];
      if (typeof value !== 'string' || value.length > max || (required && !value.trim())) { err(field, `Use ${required ? '1' : '0'}-${max} text characters`); return ''; }
      return value.trim();
    };
    const amount = (field: string, required: boolean, stock = false): number | null => {
      const value = input[field]; if (!required && (value === null || value === undefined || value === '')) return null;
      if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < (stock ? 0 : 1) || value > (stock ? 1_000_000 : 1_000_000_000_000)) { err(field,'Use a whole numeric amount within the allowed range'); return stock ? 0 : 1; }
      return value;
    };
    const sku = str('sku',100,true).toUpperCase();
    if (sku && !/^[A-Z0-9][A-Z0-9._-]*$/.test(sku)) err('sku','Use ASCII letters, numbers, dots, hyphens or underscores');
    if (seen.has(sku)) err('sku','Duplicate SKU in this workbook'); seen.add(sku);
    const name = str('name',255,true), description = str('description',5000,true), features = str('features',5000);
    const imageFilename = str('imageFilename',104), imageUrl = str('imageUrl',2048);
    if (imageFilename && !imageNames.includes(imageFilename)) err('imageFilename','Image is missing from the ZIP');
    if (!imageFilename && !imageUrl) err('imageUrl','Provide imageFilename in ZIP or an existing HTTPS image URL');
    if (imageFilename && imageUrl) err('imageUrl','Choose imageFilename or imageUrl, not both');
    if (imageUrl && !/^https:\/\/[^\s\\]+$/i.test(imageUrl)) err('imageUrl','Use an HTTPS image URL');
    const category = str('category',50,true), price = amount('priceToman',true)!, stockQuantity = amount('stockQuantity',true,true)!;
    if (!['original','highcopy','custom'].includes(category)) err('category','Use original, highcopy or custom');
    const salePrice = amount('salePriceToman',false), saleStartsAt = str('saleStartsAt',40), saleEndsAt = str('saleEndsAt',40);
    const item = { row,sku,name,description,price,category,stockQuantity,features,imageFilename,imageUrl,salePrice,
      saleStartsAt: saleStartsAt || null,saleEndsAt: saleEndsAt || null,
      metaTitle: `${name} | Ariwatch`.slice(0,160),metaDescription: `${name}. ${features || description}`.replace(/\s+/g,' ').slice(0,320) };
    try { watchData({ ...item,imageUrl: imageUrl || '/media/import-placeholder.png' }); }
    catch (error) { err('product',error instanceof Error ? error.message : 'Invalid product'); }
    rows.push(item);
  }
  if (!rows.length) throw new HttpError(400, 'The workbook has no product rows');
  for (const name of imageNames) if (!rows.some(row => row.imageFilename === name)) errors.push({ row: 0,field:'images',message:`Unused ZIP image: ${name}` });
  return { rows,errors };
}
