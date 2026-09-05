import { cp, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const out = path.join(root, 'build');
// The owner admin is intentionally localhost-only. Public Sites cannot securely
// protect a static /admin/ route, so keep it in the source repository but never
// include it in the published bundle.
const dirs = ['assets','properties','properties/view','private','sell','find','referrals','about','journal','contact','saved'];
const files = ['index.html','privacy.html','terms.html','404.html','manifest.webmanifest','robots.txt','sitemap.xml'];

await rm(out, { recursive:true, force:true });
await mkdir(out, { recursive:true });
for (const dir of dirs) if (existsSync(path.join(root, dir))) await cp(path.join(root, dir), path.join(out, dir), { recursive:true });
for (const file of files) if (existsSync(path.join(root, file))) await cp(path.join(root, file), path.join(out, file));
if (existsSync(path.join(root, '.openai', 'hosting.json'))) {
  await mkdir(path.join(out, '.openai'), { recursive: true });
  await cp(path.join(root, '.openai', 'hosting.json'), path.join(out, '.openai', 'hosting.json'));
}
console.log('FIDEON public bundle complete -> build/');
