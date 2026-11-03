'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const CFC = require('../extension/core.js');

assert.deepEqual(CFC.parts('src/lib/main.c'), ['src', 'lib', 'main.c']);
for (const p of ['', '/etc/passwd', '../secret', 'a/../../x', 'C:/Windows/win.ini', 'x\\file', '.git/config', 'a//b']) {
  assert.throws(() => CFC.parts(p), undefined, p);
}
assert.equal(CFC.replaceOnce('abc ABC def', 'ABC', 'X'), 'abc X def');
assert.throws(() => CFC.replaceOnce('aaa', 'a', 'b'), /not unique/);
assert.throws(() => CFC.replaceOnce('aaa', 'x', 'b'), /not found/);
const request = { bridge: 'chat-folder-click', action: 'edit', path: 'main.c', find: 'a', replace: 'b' };
assert.deepEqual(CFC.parse('Here is a tool action:\n```json\n'+JSON.stringify(request)+'\n```'), request);
assert.equal(CFC.parse('{"bridge":"chat-folder-click","action":"delete","path":"x"}'), null);
assert.equal(CFC.parse('No action'), null);
assert.deepEqual(CFC.validate(request), request);
assert.throws(() => CFC.validate({bridge:'chat-folder-click',action:'delete',path:'x'}),/Unsupported/);
assert.throws(() => CFC.validate({bridge:'chat-folder-click',action:'read',path:'../escape'}),/Invalid|relative/);
assert.throws(() => CFC.validate({bridge:'chat-folder-click',action:'write',path:'a.c',content:'x'.repeat(500001)}),/large/);
assert.throws(() => CFC.parts('.GIT/config'),/Invalid|protected/);
const dir = path.join(__dirname, '../extension');
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));
assert.equal(manifest.version, '2.1.0');
for (const f of [manifest.background.service_worker, manifest.side_panel.default_path,
  ...manifest.content_scripts.flatMap(x => x.js)]) assert.ok(fs.existsSync(path.join(dir, f)), f);
for (const name of Object.values(manifest.icons)) assert.ok(fs.existsSync(path.join(dir, name)), name);
const html = fs.readFileSync(path.join(dir, 'app.html'), 'utf8');
assert.match(html, /Created by <strong>Mahdi Ghahremani<\/strong>/);
assert.match(html, /https:\/\/github\.com\/TheLouisMahdi/);
assert.doesNotMatch(html, /Browser-only file access\. No PowerShell/);
console.log('All protocol and package tests passed.');
