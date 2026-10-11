import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root=new URL('../dist/',import.meta.url);
test('mobile install manifest resolves within GitHub Pages subpath',()=>{
  const m=JSON.parse(readFileSync(new URL('manifest.webmanifest',root),'utf8'));
  assert.equal(m.display,'standalone');assert.equal(m.start_url,'./');assert.equal(m.scope,'./');
  for(const icon of m.icons){assert.ok(existsSync(new URL(icon.src,root)));assert.equal(icon.type,'image/png')}
});
test('offline cache includes application entry and modules',()=>{
  const sw=readFileSync(new URL('sw.js',root),'utf8');
  for(const path of ['./index.html','./js/app.js','./js/engine.js','./styles.css'])assert.ok(sw.includes(path));
  const html=readFileSync(new URL('index.html',root),'utf8');
  assert.match(html,/rel="manifest"/);assert.match(html,/id="installApp"/);
});
