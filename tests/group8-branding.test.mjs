import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
import social from '../sources/data/social.js';import projects from '../sources/data/projects.js';import lab from '../sources/data/lab.js';
import {PROJECT_REPOSITORY,PROJECT_TITLE,DESTINATIONS} from '../sources/CloudOps/campus/content.js';
test('public campus destinations never use upstream personal account URLs',()=>{
 for(const entry of [...social,...projects,...lab])if(entry.url)assert.equal(entry.url,PROJECT_REPOSITORY);
 assert.deepEqual(social.filter(x=>x.menu).map(x=>x.menu),['behindTheScene']);assert.ok(social.some(x=>x.action==='presentation'));
 assert.deepEqual(DESTINATIONS.map(x=>x.id),['cloud','aco','gwo']);
});
test('public HTML identity and legal attribution are kept separate',()=>{
 const html=fs.readFileSync('sources/index.html','utf8');assert.ok(html.includes('<title>'+PROJECT_TITLE+'</title>'));
 assert.doesNotMatch(html,/mailto:|linkedin\.com|discord\.com|twitch\.tv|bsky\.app|x\.com\/bruno|youtube\.com|bruno-simon\.com/);
 assert.ok(html.includes('https://github.com/brunosimon/folio-2025'));assert.ok(html.includes('Copyright (c) 2025 Bruno Simon'));assert.ok(html.includes('MULAI PRESENTASI'));
});
test('served MIT notice and third party acknowledgments retain exact source bytes',()=>{
 for(const [source,target]of [['license.md','static/credits/folio-2025-license.txt'],['THIRD_PARTY_NOTICES.md','static/credits/THIRD_PARTY_NOTICES.md']])assert.ok(fs.readFileSync(source).equals(fs.readFileSync(target)));
});
