import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}
const digest=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const assets=walk('static');
for(const source of assets){const target=path.join('dist',path.relative('static',source));assert.equal(digest(target),digest(source),target)}
const html=fs.readFileSync('dist/index.html','utf8');
for(const [,href] of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
 if(/^(https?:|mailto:|data:)/.test(href))continue;
 const url=new URL(href,'https://example.test/Soka-cloud-ops-scheduling-adventure/');
 assert.ok(url.pathname.startsWith('/Soka-cloud-ops-scheduling-adventure/'),href);
 assert.ok(fs.existsSync(path.join('dist',href.split('?')[0])),href);
}
assert.ok(walk('dist/assets').some(p=>p.endsWith('.wasm')),'Rapier WASM bundle');
console.log(`PASS: ${assets.length} copied assets match source SHA-256; HTML paths and Rapier WASM valid`);
