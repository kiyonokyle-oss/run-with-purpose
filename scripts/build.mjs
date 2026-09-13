import { mkdir, cp, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const entry of ['index.html', 'src', 'public']) await cp(entry, `dist/${entry}`, { recursive: true });
console.log('Built The Narrow Path → dist/');
