import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=path.resolve(process.argv[2] ?? '.');
const output=path.resolve(process.argv[3] ?? 'docs/evidence/asset-inventory.json');
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)])}
const files=['static','resources'].flatMap(d=>walk(path.join(root,d)));
const entries=files.map(file=>{const data=fs.readFileSync(file); const entry={path:path.relative(root,file).replaceAll('\\','/'),bytes:data.length,sha256:crypto.createHash('sha256').update(data).digest('hex')};if(file.endsWith('.glb')){const length=data.readUInt32LE(12);const gltf=JSON.parse(data.subarray(20,20+length).toString());Object.assign(entry,{nodes:gltf.nodes?.length??0,meshes:gltf.meshes?.length??0,materials:gltf.materials?.map(m=>m.name)??[],extensions:gltf.extensionsUsed??[]});if(/vehicle\/default\.glb|areas\/areas\.glb|terrain\/terrain\.glb/.test(entry.path))entry.nodeDetails=gltf.nodes?.map(n=>({name:n.name,translation:n.translation,scale:n.scale,extras:n.extras}));}return entry;});
fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,JSON.stringify({sourceCommit:'41046b57eeed8d156d9c3fd7fa259900baef7816',entries},null,2));console.log(JSON.stringify({files:entries.length,bytes:entries.reduce((s,e)=>s+e.bytes,0),glb:entries.filter(e=>e.path.endsWith('.glb')).length,output}));
