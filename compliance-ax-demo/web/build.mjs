import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const here = fileURLToPath(new URL('.', import.meta.url));
const [template, css, js, data] = await Promise.all(['src/index.html', 'src/styles.css', 'src/app.js', 'data/demo.json'].map(p => readFile(here + p, 'utf8')));
JSON.parse(data);
const html = template.replace('/* INLINE_STYLES */', () => css).replace('/* INLINE_DATA */', () => data.replaceAll('<', '\\u003c')).replace('/* INLINE_APP */', () => js);
await mkdir(here + 'public', { recursive: true });
await writeFile(here + 'public/index.html', html);
console.log(`Built standalone web demo (${Buffer.byteLength(html)} bytes)`);
