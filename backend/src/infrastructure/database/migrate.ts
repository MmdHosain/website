import { readFile, readdir } from 'fs/promises';
import { resolve } from 'path';

export async function applySchema(client: { query(sql: string): Promise<unknown> }): Promise<void> {
  await client.query(await readFile(resolve(__dirname, 'schema.sql'), 'utf8'));
  const directory = resolve(__dirname, 'features');
  const files = (await readdir(directory)).filter(file => file.endsWith('.sql')).sort();
  for (const file of files) await client.query(await readFile(resolve(directory, file), 'utf8'));
}
