import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'dist');
// The owner console remains available for localhost work but is never part of
// the public bundle published to the Site.
const dirs = ['assets','properties','properties/view','private','sell','find','referrals','about','journal','contact','saved'];
const files = ['index.html','privacy.html','terms.html','404.html','manifest.webmanifest','robots.txt','sitemap.xml'];

await rm(out, { recursive:true, force:true });
await mkdir(out, { recursive:true });
for (const dir of dirs) if (existsSync(path.join(root, dir))) await cp(path.join(root, dir), path.join(out, dir), { recursive:true });
for (const file of files) if (existsSync(path.join(root, file))) await cp(path.join(root, file), path.join(out, file));
console.log('FIDEON localhost bundle complete -> dist/');
