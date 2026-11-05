import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { isRetiredAsset } from '../scripts/public-asset-policy.mjs';
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
test('Bruno vehicle, camera, world, physics, materials and license remain byte-identical',()=>{
 const manifest=JSON.parse(fs.readFileSync('docs/evidence/upstream-core.json'));
 for(const file of manifest.files)assert.equal(digest(file.path),file.sha256,file.path);
});
test('retained runtime assets match their upstream or explicitly sanitized hashes',()=>{
 const manifest=JSON.parse(fs.readFileSync('docs/evidence/asset-inventory.json'));
 const sanitized = {
  'static/areas/areas.glb': 'b138490d8f8a2c60a1530dabb33d23ac75c13491ee80e8dfc6be095c945c7659',
  'static/areas/areas-compressed.glb': '574913d92f9abc4e62ac355b125a405f745480033f90e90c308b00345618bc3c'
 };
 for(const file of manifest.entries.filter(e=>e.path.startsWith('static/')&&e.path!=='static/favicons/site.webmanifest')){
  if(isRetiredAsset(file.path.slice(7))) assert.ok(!fs.existsSync(file.path),file.path);
  else assert.equal(digest(file.path),sanitized[file.path]??file.sha256,file.path);
 }
});
test('HTML entrypoint assets exist and resolve beneath a repository subpath',()=>{
 const html=fs.readFileSync('sources/index.html','utf8');
 for(const [,href] of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
  if(/^(https?:|mailto:|data:)/.test(href))continue;
  assert.ok(!href.startsWith('/'),href);
  const url=new URL(href,'https://example.test/Soka-cloud-ops-scheduling-adventure/');
  assert.ok(url.pathname.startsWith('/Soka-cloud-ops-scheduling-adventure/'),href);
  const relative=href.replace(/^\.\//,'').split('?')[0];
  assert.ok(fs.existsSync('static/'+relative)||fs.existsSync('sources/'+relative),href);
 }
 assert.ok(!html.includes('googletagmanager.com'),'Bruno analytics must not run in the adaptation');
 const manifest=JSON.parse(fs.readFileSync('static/favicons/site.webmanifest'));
 for(const icon of manifest.icons)assert.ok(fs.existsSync(new URL(icon.src,new URL('../static/favicons/site.webmanifest',import.meta.url))),icon.src);
});
