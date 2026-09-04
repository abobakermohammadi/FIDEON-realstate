import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');
const dirs = ['assets','properties','private','sell','find','referrals','about','journal','contact','saved','admin'];
const files = ['index.html','privacy.html','terms.html','404.html','manifest.webmanifest','robots.txt','sitemap.xml'];

await rm(out, { recursive:true, force:true });
await mkdir(out, { recursive:true });
for (const dir of dirs) if (existsSync(path.join(root, dir))) await cp(path.join(root, dir), path.join(out, dir), { recursive:true });
for (const file of files) if (existsSync(path.join(root, file))) await cp(path.join(root, file), path.join(out, file));
console.log('FIDEON localhost bundle complete -> dist/');
