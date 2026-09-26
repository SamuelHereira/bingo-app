import { mkdir, readFile, writeFile } from 'node:fs/promises';
const folder = new URL('../artifacts/prueba-bebe/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('banco-fuentes.json', folder), 'utf8'));
await mkdir(new URL('banco/', folder), {recursive:true});
await Promise.all(manifest.filter(item => !process.argv[2] || process.argv[2].split(',').includes(item.name)).map(async item => {
  try {
    const response = await fetch(item.url, {signal:AbortSignal.timeout(30000)});
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    await writeFile(new URL('banco/'+item.file, folder), bytes);
    console.log(item.file, bytes.length, response.headers.get('content-type'));
  } catch(error) { console.log('ERROR', item.file, error.message); }
}));
