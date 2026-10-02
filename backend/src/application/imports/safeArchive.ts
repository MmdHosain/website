import { Unzip, UnzipInflate, zipSync } from 'fflate';
import { HttpError } from '../errors';

const mb = 1024 * 1024;
export function safeArchive(input: Buffer, kind: 'workbook' | 'images'): Record<string, Buffer> {
  const workbook = kind === 'workbook', limit = workbook ? 10 * mb : 20 * mb;
  if (input.length < 4 || input.length > (workbook ? 2 : 20) * mb || input.readUInt32LE(0) !== 0x04034b50) throw new HttpError(400, 'Upload a valid ZIP or XLSX within the size limit');
  const output: Record<string, Buffer> = Object.create(null), seen = new Set<string>();
  let count = 0, complete = 0, total = 0;
  const unzip = new Unzip(file => {
    const name = file.name;
    if (++count > (workbook ? 100 : 200) || seen.has(name.toLowerCase())) throw new HttpError(400, 'Archive contains too many or duplicate files');
    seen.add(name.toLowerCase());
    if (!name || name.length > 200 || /[\\\x00-\x1f:]/.test(name) || name.startsWith('/') || name.split('/').some(part => part === '..' || part === '.')) throw new HttpError(400, 'Unsafe archive path');
    if (!workbook && !/^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,99}\.(png|jpg|jpeg|webp)$/i.test(name)) throw new HttpError(400, 'Image ZIP must contain only flat PNG, JPEG or WebP filenames');
    if (workbook && (!/\.(xml|rels)$/.test(name) || /externalLinks|vbaProject|embeddings|activeX/i.test(name))) throw new HttpError(400, 'Only plain XLSX workbooks are supported');
    if (![0,8].includes(file.compression) || (file.originalSize || 0) > 5 * mb) throw new HttpError(400, 'Archive entry is too large or unsupported');
    const chunks: Buffer[] = []; let bytes = 0;
    file.ondata = (error, chunk, final) => {
      if (error) throw new HttpError(400, 'Damaged archive');
      bytes += chunk.length; total += chunk.length;
      if (bytes > 5 * mb || total > limit) { file.terminate(); throw new HttpError(400, 'Archive exceeds its expanded size limit'); }
      chunks.push(Buffer.from(chunk));
      if (final) { output[name] = Buffer.concat(chunks); complete++; }
    };
    file.start();
  });
  unzip.register(UnzipInflate);
  try {
    for (let offset = 0; offset < input.length; offset += 1024) unzip.push(input.subarray(offset,offset + 1024), offset + 1024 >= input.length);
  } catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, 'Damaged or unsupported archive'); }
  if (!count || complete !== count) throw new HttpError(400, 'Incomplete archive');
  return output;
}

export function safeWorkbook(input: Buffer): Buffer {
  const entries = safeArchive(input, 'workbook');
  if (!entries['[Content_Types].xml'] || !entries['xl/workbook.xml']) throw new HttpError(400, 'A real XLSX workbook is required');
  for (const [name, bytes] of Object.entries(entries)) {
    const xml = bytes.toString('utf8');
    if (/<!DOCTYPE|<!ENTITY|<f(?:\s|>\/?)|TargetMode\s*=\s*["']External/i.test(xml)) throw new HttpError(400, 'Workbook formulas, external links and XML entities are not allowed');
    if (name.startsWith('xl/worksheets/')) {
      const cells = xml.matchAll(/<c\s[^>]*\br=["']([A-Z]+)(\d+)["']/g);
      for (const match of cells) if (match[1].length > 1 || match[1] > 'L' || Number(match[2]) > 501) throw new HttpError(400, 'Workbook supports at most 500 products and 12 columns');
    }
  }
  // Canonical lengths prevent downstream ZIP parsers from trusting forged size headers.
  return Buffer.from(zipSync(entries, { level: 0 }));
}

export function imageExtension(name: string, bytes: Buffer): string {
  const ext = name.split('.').pop()!.toLowerCase();
  const png = bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  const jpeg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const webp = bytes.subarray(0,4).toString() === 'RIFF' && bytes.subarray(8,12).toString() === 'WEBP';
  if ((ext === 'png' && png) || (['jpg','jpeg'].includes(ext) && jpeg) || (ext === 'webp' && webp)) return ext === 'jpeg' ? 'jpg' : ext;
  throw new HttpError(400, `Image content does not match its extension: ${name}`);
}
