'use strict';

const $ = id => document.getElementById(id);
const MAX_TEXT_BYTES = 2 * 1024 * 1024;
const MAX_FILE_BYTES = 16 * 1024 * 1024;
const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const MAX_CHAT_CHARS = 26000;
const IGNORED = new Set(['.git', 'node_modules', 'dist', 'build', '.next', '.venv', 'venv', '__pycache__']);
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' });
const ICONS = {
  tree: '<path d="M5 4v16M5 8h6v4h8M5 15h8v5h6" stroke="currentColor" stroke-width="1.9" fill="none" stroke-linecap="round"/><rect x="11" y="3" width="9" height="6" rx="1" fill="currentColor" opacity=".5"/>',
  folder: '<path d="M2 6a2 2 0 0 1 2-2h6l2 2h8a2 2 0 0 1 2 2v1H2z" fill="var(--foldertab)"/><path d="M2 9h20l-2.8 10H3.8A2 2 0 0 1 2 17z" fill="var(--folderbody)" stroke="var(--foldertab)" stroke-width=".65"/>',
  file: '<path d="M6 2h8l5 5v14H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill="currentColor" opacity=".28"/><path d="M14 2v6h5M8 12h8M8 15h8M8 18h5" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  code: '<path d="M6 2h8l5 5v14H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" fill="currentColor" opacity=".2"/><path d="M14 2v6h5M10 12l-3 3 3 3m4-6 3 3-3 3" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" stroke-width="1.7" fill="none"/><circle cx="9" cy="9" r="2" fill="currentColor"/><path d="m4 18 6-6 3 3 2-2 5 5" stroke="currentColor" stroke-width="1.5" fill="none"/>',
  chevron: '<path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  plus: '<path d="M12 4v16M4 12h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="2" fill="none"/><path d="m16 16 5 5" stroke="currentColor" stroke-width="2"/>',
  refresh: '<path d="M20 8a8 8 0 1 0 .1 7M20 3v5h-5" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/>',
  'file-plus': '<path d="M5 3h9l5 5v13H5zM14 3v5h5M9 15h6m-3-3v6" stroke="currentColor" stroke-width="1.8" fill="none"/>',
  'folder-plus': '<path d="M3 6h7l2 2h9v12H3zM9 14h6m-3-3v6" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linejoin="round"/>',
  upload: '<path d="M12 17V3m-5 5 5-5 5 5M4 17v4h16v-4" stroke="currentColor" stroke-width="1.8" fill="none"/>',
  download: '<path d="M12 3v14m-5-5 5 5 5-5M4 18v3h16v-3" stroke="currentColor" stroke-width="1.8" fill="none"/>',
  message: '<path d="M4 4h16v13H8l-4 4z" stroke="currentColor" stroke-width="1.8" fill="none"/>'
};
function icon(kind) {
  const node = document.createElement('span');
  node.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[kind] || ICONS.file}</svg>`;
  return node;
}
for (const element of document.querySelectorAll('[data-icon]')) element.replaceChildren(icon(element.dataset.icon));

let root = null;
let treeCache = new Map();
let expanded = new Set(['']);
let selected = null;
let current = null;
let pending = null;
let lastResult = '';
let undoStack = [];
let busy = false;
let searchResults = null;
let showHidden = false;

function toast(message, error = false) {
  $('toast').textContent = message;
  $('toast').classList.toggle('error', error);
}
function ignored(name) { return IGNORED.has(name) || (!showHidden && name.startsWith('.')); }
function sensitive(path) { return /(^|\/)(\.env(?:\..+)?|id_rsa|id_ed25519|.*\.pem|.*\.key|secrets?\.(json|ya?ml|txt))$/i.test(path); }
function fileType(name) { return /\.(png|jpe?g|gif|webp|svg)$/i.test(name) ? 'image' : /\.(c|cc|cpp|h|hpp|js|ts|py|json|html|css|java|rs|go|md|yml|yaml|xml|sh|ps1)$/i.test(name) ? 'code' : 'file'; }
function basename(path) { return path.split('/').at(-1); }
function parentPath(path) { return path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : ''; }
function joinPath(a, b) { return a ? `${a}/${b}` : b; }
function setTheme(theme) {
  if (!['white','black','terminal'].includes(theme)) return;
  document.body.dataset.theme = theme;
  for (const b of document.querySelectorAll('[data-theme-choice]')) b.classList.toggle('selected', b.dataset.themeChoice === theme);
  chrome.storage.local.set({ theme }).catch(console.error);
}
function tab(name) {
  for (const button of document.querySelectorAll('.tabs button')) button.classList.toggle('active', button.dataset.tab === name);
  for (const page of ['files','chat','activity']) $(`${page}Tab`).hidden = page !== name;
}
function empty(message) { const node = document.createElement('div'); node.className = 'empty'; node.textContent = message; return node; }

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('chat-folder-click', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('settings');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function saveRoot(handle) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite');
    tx.objectStore('settings').put(handle, 'folder');
    tx.oncomplete = () => { db.close(); resolve(); };
    tx.onerror = () => { db.close(); reject(tx.error); };
  });
}
async function restoreRoot() {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readonly');
    const request = tx.objectStore('settings').get('folder');
    request.onsuccess = () => { db.close(); resolve(request.result || null); };
    request.onerror = () => { db.close(); reject(request.error); };
  });
}
async function permission(ask = false) {
  if (!root) return false;
  try {
    if (await root.queryPermission({ mode: 'readwrite' }) === 'granted') return true;
    return ask && await root.requestPermission({ mode: 'readwrite' }) === 'granted';
  } catch { return false; }
}
async function requireAccess(ask = false) {
  if (!root || !await permission(ask)) throw new Error('Choose a folder or click Grant access first.');
}
async function chooseFolder() {
  if (current && changed() && !await ask({title:'Discard unsaved changes?', description:'Switching projects will close the current editor.'})) return;
  try {
    const selectedHandle = await showDirectoryPicker({id:'folder-click', mode:'readwrite'});
    root = selectedHandle;
    await saveRoot(root);
    current = null; selected = null; undoStack = [];
    resetEditor(); await prepareFolder();
    toast('Folder ready.');
  } catch (error) { if (error.name !== 'AbortError') toast(error.message, true); }
}
async function prepareFolder() {
  const allowed = await permission();
  $('projectTitle').textContent = root?.name || 'Choose a local folder';
  $('folderName').textContent = allowed ? 'Local workspace' : 'Access needed to reopen this folder';
  $('status').textContent = allowed ? 'Folder ready' : 'Access needed';
  $('reconnect').hidden = !root || allowed;
  if (allowed) await refreshTree();
  else $('tree').replaceChildren(empty('Grant folder access to browse local files.'));
}
async function directoryAt(path) {
  await requireAccess();
  if (!path) return root;
  let directory = root;
  for (const part of CFC.parts(path)) directory = await directory.getDirectoryHandle(part);
  return directory;
}
async function fileAt(path, create = false) {
  const parts = CFC.parts(path);
  let directory = root;
  await requireAccess();
  for (const part of parts.slice(0,-1)) directory = await directory.getDirectoryHandle(part, {create});
  return directory.getFileHandle(parts.at(-1), {create});
}
function notFound(error) { return error?.name === 'NotFoundError'; }
async function pathExists(path) {
  try { await fileAt(path); return true; } catch (error) { if (!notFound(error) && error?.name !== 'TypeMismatchError') throw error; }
  try { await directoryAt(path); return true; } catch (error) { if (!notFound(error) && error?.name !== 'TypeMismatchError') throw error; }
  return false;
}
async function readText(path) {
  const handle = await fileAt(path);
  const file = await handle.getFile();
  if (file.size > MAX_TEXT_BYTES) throw new Error('Text editor limit: 2 MB per file.');
  const content = new TextDecoder('utf-8', {fatal:true}).decode(await file.arrayBuffer());
  if (content.includes('\0')) throw new Error('Binary file: use Download instead of the text editor.');
  return {handle,file,content};
}
async function writeBytes(handle, bytes) {
  const writable = await handle.createWritable();
  try { await writable.write(bytes); await writable.close(); }
  catch (error) { await writable.abort().catch(()=>{}); throw error; }
}
async function writeText(handle, text) {
  if (new TextEncoder().encode(text).length > MAX_TEXT_BYTES) throw new Error('Text content exceeds 2 MB.');
  await writeBytes(handle, text);
}
async function loadChildren(path) {
  if (treeCache.has(path)) return treeCache.get(path);
  const folder = await directoryAt(path);
  const children = [];
  for await (const entry of folder.values()) {
    if (ignored(entry.name)) continue;
    children.push({path:joinPath(path,entry.name), kind:entry.kind, name:entry.name});
  }
  children.sort((a,b)=>(a.kind==='directory'?0:1)-(b.kind==='directory'?0:1)||collator.compare(a.name,b.name));
  treeCache.set(path, children);
  return children;
}
async function refreshTree() {
  try {
    await requireAccess();
    treeCache.clear(); searchResults=null; expanded=new Set(['']);
    await loadChildren('');
    $('filter').value='';
    renderTree();
  } catch(error) { toast(error.message,true); }
}
async function expandDirectory(path) {
  try {
    if (expanded.has(path)) expanded.delete(path);
    else { await loadChildren(path); expanded.add(path); }
    renderTree();
  } catch(error){toast(error.message,true);}
}
function treeRow(item, rootRow = false) {
  const button = document.createElement('button');
  button.type='button'; button.className='tree-row'; button.title=item.path || root.name;
  if (selected?.path === item.path && selected.kind === item.kind) button.classList.add('selected');
  if (expanded.has(item.path)) button.classList.add('expanded');
  const chevron = document.createElement('span'); chevron.className='chevron';
  if (item.kind === 'directory') chevron.append(icon('chevron')); else chevron.style.visibility='hidden';
  const nodeicon=icon(item.kind==='directory'?'folder':fileType(item.name));
  nodeicon.className=`nodeicon${item.kind==='directory'?' folder':''}`;
  const name=document.createElement('span'); name.className='name'; name.textContent=item.name;
  button.append(chevron,nodeicon,name);
  button.addEventListener('click',async()=>{
    selected={path:item.path,kind:item.kind};
    updateSelection();
    if(item.kind==='directory') await expandDirectory(item.path);
    else await openFile(item.path);
  });
  if (rootRow) button.setAttribute('aria-label',`Root directory ${item.name}`);
  return button;
}
function treeChild(item) {
  const li=document.createElement('li'); li.className='tree-node'; li.setAttribute('role','treeitem');
  li.append(treeRow(item));
  if(item.kind==='directory' && expanded.has(item.path)) {
    const sub=document.createElement('ul'); sub.setAttribute('role','group');
    const children=treeCache.get(item.path)||[];
    for(const child of children) sub.append(treeChild(child));
    li.append(sub);
  }
  return li;
}
function renderTree() {
  const area=$('tree'); area.replaceChildren();
  if(!root) {area.append(empty('Choose a folder to begin.')); return;}
  const query=$('filter').value.trim().toLowerCase();
  if(query) {
    const matches=(searchResults||[...treeCache.values()].flat()).filter(item=>item.path.toLowerCase().includes(query));
    for(const item of matches.slice(0,250)) {
      const b=treeRow(item); b.classList.add('search-hit'); area.append(b);
    }
    if(!matches.length) area.append(empty('No matches among indexed files. Select Search entire project.'));
    $('treeInfo').textContent=`${matches.length} matches${searchResults?' (indexed)':' (loaded)'}`;
    return;
  }
  const section=document.createElement('div'); section.className='tree-root';
  section.append(treeRow({path:'',kind:'directory',name:root.name},true));
  const ul=document.createElement('ul'); ul.setAttribute('role','group');
  if(expanded.has('')) for(const item of treeCache.get('')||[]) ul.append(treeChild(item));
  section.append(ul);area.append(section);
  $('treeInfo').textContent=`${[...treeCache.values()].reduce((n,items)=>n+items.length,0)} loaded`;
}
async function indexProject(limit=2200) {
  try {
    await requireAccess();
    const queue=[{path:'',depth:0}]; const items=[];
    while(queue.length && items.length<limit) {
      const folder=queue.shift();
      const children=await loadChildren(folder.path);
      for(const entry of children) {
        if(items.length>=limit) break;
        items.push(entry);
        if(entry.kind==='directory' && folder.depth<8) queue.push({path:entry.path,depth:folder.depth+1});
      }
    }
    searchResults=items;
    renderTree();
    toast(`Indexed ${items.length} entries${items.length===limit?' (limit reached)':''}. No file contents were read.`);
  } catch(error){toast(error.message,true);}
}
function updateSelection() {
  $('selectionText').textContent=selected?.path||'No selection';
  $('rename').disabled=!selected?.path||selected.kind!=='file';
  $('move').disabled=!selected?.path||selected.kind!=='file';
  $('delete').disabled=!selected?.path;
  editorState();
}
function selectedDirectory() { return selected?.kind==='directory' ? selected.path : selected?.path ? parentPath(selected.path) : current?parentPath(current.path):''; }
function changed() {return Boolean(current && $('content').value!==current.original);}
function editorState() {
  const has=Boolean(current);
  for(const id of ['content','save','revert','send']) $(id).disabled=!has;
  $('attach').disabled = !has && selected?.kind !== 'file';
  $('exportFile').disabled = !has && selected?.kind !== 'file';
  $('save').disabled=!has||!changed();
  $('revert').disabled=!has||!changed();
  $('dirtyText').textContent=changed()?'Unsaved changes':'Review changes before saving.';
}
function resetEditor() {
  current=null; $('currentPath').textContent='No file selected'; $('fileSize').textContent=''; $('content').value=''; editorState();
}
async function openFile(path) {
  if(changed()&&!await ask({title:'Discard unsaved changes?',description:`The current editor contains unsaved changes. Open ${path}?`,confirm:'Discard'}))return;
  try {
    const {handle,file,content}=await readText(path);
    current={path,handle,original:content,modified:file.lastModified};
    $('currentPath').textContent=path;
    $('fileSize').textContent=`${(file.size/1024).toFixed(1)} KB`;
    $('content').value=content; editorState(); renderTree();
  }catch(error){toast(error.message,true);}
}
function snapshotDiff(before,after) {
  const a=before.split('\n'),b=after.split('\n');
  let prefix=0,suffix=0;
  while(prefix<a.length && prefix<b.length && a[prefix]===b[prefix])prefix++;
  while(suffix<a.length-prefix && suffix<b.length-prefix && a[a.length-1-suffix]===b[b.length-1-suffix])suffix++;
  const preview=(arr)=>{
    const start=Math.max(0,prefix-3),end=Math.min(arr.length,arr.length-suffix+3);
    const lines=arr.slice(start,Math.min(end,start+70));
    return (start?'…\n':'')+lines.join('\n')+(end>start+70?'\n…':'');
  };
  return {old:preview(a),next:preview(b),oldCount:a.length,newCount:b.length};
}
function ask({title,description='',confirm='Confirm',input=null,diff=null,danger=false}) {
  return new Promise(resolve=>{
    const dialog=$('dialog'),field=$('dialogInput');
    $('dialogTitle').textContent=title;
    $('dialogDescription').textContent=description;
    $('dialogConfirm').textContent=confirm;
    $('dialogConfirm').classList.toggle('danger',danger);
    field.hidden=input===null; field.value=input===null?'':input;
    $('diffView').hidden=!diff;
    if(diff) { $('diffBefore').textContent=diff.old; $('diffAfter').textContent=diff.next; }
    let settled=false;
    function finish(value){if(settled)return;settled=true;clean();dialog.close();resolve(value);}
    function clean(){ $('dialogCancel').removeEventListener('click',cancel);$('dialogConfirm').removeEventListener('click',accept);dialog.removeEventListener('cancel',escape); }
    function cancel(){finish(null);}
    function escape(event){event.preventDefault();finish(null);}
    function accept(){if(input!==null && !field.value.trim()){field.focus();return;}finish(input===null?true:field.value.trim());}
    $('dialogCancel').addEventListener('click',cancel);$('dialogConfirm').addEventListener('click',accept);dialog.addEventListener('cancel',escape);
    dialog.showModal();
    if(input!==null){field.focus();field.select();}
  });
}
function pushUndo(entry) {undoStack.push(entry);if(undoStack.length>5)undoStack.shift();$('undo').disabled=false;}
async function reviewChange(action,path,before,after) {
  return ask({title:`${action}: ${path}`, description:'Review the before and after content. This writes to your local folder only after approval.',confirm:'Apply changes',diff:snapshotDiff(before,after)});
}
async function saveEditor() {
  if(!current || !changed())return;
  try {
    const {path,handle,modified,original}=current;
    const existing=await handle.getFile();
    if(existing.lastModified!==modified || (await readText(path)).content!==original)throw new Error('File changed outside this editor. Reopen before saving.');
    const text=$('content').value;
    if(!await reviewChange('Save',path,original,text))return;
    await writeText(handle,text);
    pushUndo({kind:'restore',path,content:original});
    current = null;
    await openFile(path);
    toast(`Saved ${path}`);
  }catch(error){toast(error.message,true);}
}
async function createEntry(kind) {
  try {
    await requireAccess(true);
    const base=selectedDirectory();
    const candidate=await ask({title:kind==='directory'?'Create folder':'Create file',description:'Enter a path relative to the selected project.',confirm:'Create',input:base?`${base}/`:''});
    if(!candidate)return;
    CFC.parts(candidate);
    if(await pathExists(candidate))throw new Error('That path already exists.');
    if(kind==='directory') {
      const parent=await directoryAt(parentPath(candidate));
      await parent.getDirectoryHandle(basename(candidate),{create:true});
      pushUndo({kind:'remove',path:candidate,isDirectory:true});
    } else {
      const handle=await fileAt(candidate,true);
      await writeText(handle,'');
      pushUndo({kind:'remove',path:candidate,isDirectory:false});
    }
    await refreshTree();
    if(kind==='file')await openFile(candidate);
    toast(`${kind==='directory'?'Folder':'File'} created.`);
  }catch(error){toast(error.message,true);}
}
async function moveFile() {
  if(!selected||selected.kind!=='file')return;
  try {
    await requireAccess(true);
    if(changed())throw new Error('Save or revert unsaved editor changes first.');
    const from=selected.path;
    const to=await ask({title:'Rename / move file',description:'Enter the new relative path. Only files can be renamed/moved in this version.',input:from,confirm:'Move file'});
    if(!to||to===from)return;
    CFC.parts(to);
    if(await pathExists(to))throw new Error('Destination already exists; nothing changed.');
    const oldHandle=await fileAt(from),file=await oldHandle.getFile();
    if(file.size>MAX_FILE_BYTES)throw new Error('Move limit: 16 MB per file.');
    if(!await ask({title:'Move file?',description:`${from}\n→ ${to}\n\nThe original will be removed after the copy succeeds.`,confirm:'Move'}))return;
    await moveBytes(from,to,await file.arrayBuffer());
    pushUndo({kind:'move',from:to,to:from});
    selected={path:to,kind:'file'};
    if(current?.path===from)resetEditor();
    await refreshTree();await openFile(to);updateSelection();toast('File moved.');
  }catch(error){toast(error.message,true);}
}
async function moveBytes(from,to,bytes) {
  const destination=await fileAt(to,true);
  try {
    await writeBytes(destination,bytes);
    const check=await destination.getFile();
    if(check.size!==bytes.byteLength)throw new Error('Copied file size mismatch.');
    const parent=await directoryAt(parentPath(from));
    await parent.removeEntry(basename(from));
  }catch(error){
    const parent=await directoryAt(parentPath(to));
    await parent.removeEntry(basename(to)).catch(()=>{});
    throw error;
  }
}
async function deleteEntry() {
  if(!selected?.path)return;
  try {
    await requireAccess(true);
    const item=selected;
    let content=null;
    if(item.kind==='file'){
      const file=await (await fileAt(item.path)).getFile();
      if(file.size<=MAX_FILE_BYTES)content=await file.arrayBuffer();
    }
    const approved=await ask({title:`Delete ${item.kind}?`,description:`${item.path}\n\nThe item will be removed from your disk. ${content?'Undo is available during this session.':'This operation might not be undoable.'} Nonempty folders cannot be deleted.`,confirm:'Delete',danger:true});
    if(!approved)return;
    const parent=await directoryAt(parentPath(item.path));
    await parent.removeEntry(basename(item.path));
    if(item.kind==='directory')pushUndo({kind:'mkdir',path:item.path});
    else if(content)pushUndo({kind:'restore',path:item.path,content});
    if(current?.path===item.path)resetEditor();
    selected=null;updateSelection();await refreshTree();toast('Entry deleted.');
  }catch(error){toast(error.message,true);}
}
async function undoLast() {
  const change=undoStack.at(-1);
  if(!change)return;
  try {
    await requireAccess(true);
    if(changed())throw new Error('Save or revert unsaved editor changes before undo.');
    if(!await ask({title:'Undo last local change?',description:`${change.kind}: ${change.path||change.from}`,confirm:'Undo'}))return;
    if(change.kind==='restore')await writeBytes(await fileAt(change.path,true),change.content);
    else if(change.kind==='remove')await (await directoryAt(parentPath(change.path))).removeEntry(basename(change.path));
    else if(change.kind==='mkdir')await (await directoryAt(parentPath(change.path))).getDirectoryHandle(basename(change.path),{create:true});
    else if(change.kind==='move') {
      if(await pathExists(change.to))throw new Error('Undo destination already exists.');
      const file=await (await fileAt(change.from)).getFile();
      await moveBytes(change.from,change.to,await file.arrayBuffer());
    }
    undoStack.pop();$('undo').disabled=undoStack.length===0;
    if(current?.path===change.path||current?.path===change.from)resetEditor();
    await refreshTree();toast('Last change undone.');
  }catch(error){toast(error.message,true);}
}
async function importFiles(files) {
  try {
    await requireAccess(true);
    const base=selectedDirectory();let count=0;
    for(const file of files){
      const path=joinPath(base,file.name);CFC.parts(path);
      if(file.size>MAX_FILE_BYTES){toast(`Skipped ${file.name}: 16 MB limit`,true);continue;}
      const existed=await pathExists(path);
      if(existed&&!await ask({title:'Replace existing file?',description:path,confirm:'Replace'}))continue;
      let backup=null;
      if(existed){const old=await(await fileAt(path)).getFile();if(old.size<=MAX_FILE_BYTES)backup=await old.arrayBuffer();}
      await writeBytes(await fileAt(path,true),await file.arrayBuffer());
      if(existed&&backup)pushUndo({kind:'restore',path,content:backup});
      else if(!existed)pushUndo({kind:'remove',path,isDirectory:false});
      count++;
    }
    await refreshTree();toast(`${count} file(s) imported.`);
  }catch(error){toast(error.message,true);}
}
async function exportFile() {
  const path=selected?.kind==='file' ? selected.path : current?.path;
  if(!path)return;
  try {
    const file=await (await fileAt(path)).getFile();
    const url=URL.createObjectURL(file),anchor=document.createElement('a');
    anchor.href=url;anchor.download=file.name;anchor.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
    toast('Browser download started.');
  }catch(error){toast(error.message,true);}
}
async function chatMessage(message, preferredTabId=null) {
  const tabs=await chrome.tabs.query({url:['https://chatgpt.com/*','https://chat.openai.com/*']});
  const target=tabs.find(t=>t.id===preferredTabId)||tabs.find(t=>t.active)||tabs[0];
  if(!target)return {ok:false,error:'Open chatgpt.com in Edge first.'};
  try {
    const result=await chrome.tabs.sendMessage(target.id,message);
    if(result?.ok){await chrome.tabs.update(target.id,{active:true});await chrome.windows.update(target.windowId,{focused:true});return result;}
    return result||{ok:false,error:'ChatGPT integration unavailable. Refresh its tab.'};
  }catch{return {ok:false,error:'Could not reach the ChatGPT page. Refresh the tab.'};}
}
async function compose(text,preferredTabId=null) {
  const reply=await chatMessage({kind:'cfc-compose',text,submit:false},preferredTabId);
  if(reply.ok){toast('Draft prepared in ChatGPT. Review and press Send.');return true;}
  await navigator.clipboard.writeText(text);
  toast('Copied to clipboard. Paste into ChatGPT manually.');return false;
}
async function sendSelectedText() {
  if(!current)return;
  try {
    if(sensitive(current.path)&&!await ask({title:'Sensitive file',description:'This file may contain secrets. Are you certain you want to share its text with ChatGPT?',confirm:'Share file'}))return;
    const content=$('content').value;
    if(content.length>MAX_CHAT_CHARS&&!await ask({title:'Truncate text?',description:'Only the first 26,000 characters will be prepared for ChatGPT.',confirm:'Continue'}))return;
    if(!await ask({title:'Share file text?',description:`Send contents of ${current.path} to ChatGPT?`,confirm:'Prepare draft'}))return;
    await compose(`Workspace file: ${current.path}\n\n\`\`\`text\n${content.slice(0,MAX_CHAT_CHARS)}\n\`\`\``);
  }catch(error){toast(error.message,true);}
}
function encode64(bytes) {let s='';for(let i=0;i<bytes.length;i+=16384)s+=String.fromCharCode(...bytes.subarray(i,i+16384));return btoa(s);}
async function attachFile(path) {
  if(sensitive(path)&&!await ask({title:'Sensitive file',description:'This filename could contain credentials. Attach only when necessary.',confirm:'Continue'}))return;
  const file=await(await fileAt(path)).getFile();
  if(file.size>MAX_ATTACHMENT_BYTES)throw new Error('Experimental attachment limit: 2 MB.');
  if(!await ask({title:'Attach to ChatGPT?',description:`${path}\n${file.size} bytes\n\nVerify the attachment appears in the ChatGPT composer before sending.`,confirm:'Try attachment'}))return;
  const result=await chatMessage({kind:'cfc-attach',name:file.name,mime:file.type,base64:encode64(new Uint8Array(await file.arrayBuffer()))});
  toast(result.ok?'Attachment requested. Verify it appears in the ChatGPT composer.':result.error||'Attachment unavailable. Attach manually.',!result.ok);
}
const instructions=`You are using Chat Folder Click, a browser-only, user-approved local folder extension. You do NOT have native filesystem or shell access here. Ask the extension for ONE operation per response using a single JSON code block, with no surrounding explanation:\nList: {"bridge":"chat-folder-click","action":"list"}\nRead: {"bridge":"chat-folder-click","action":"read","path":"src/main.c"}\nEdit one unique exact match: {"bridge":"chat-folder-click","action":"edit","path":"src/main.c","find":"original exact text","replace":"replacement text"}\nReplace an existing text file: {"bridge":"chat-folder-click","action":"write","path":"src/main.c","content":"complete text"}\nCreate text file: {"bridge":"chat-folder-click","action":"create","path":"src/new.c","content":"complete text"}\nAttach local file (experimental): {"bridge":"chat-folder-click","action":"attach","path":"src/main.c"}\nThe user must approve operations. Paths are relative to the chosen folder. Never request shell commands. Wait for a real tool result before claiming success. Use small targeted edits; do not assume attachment succeeded. If no Run button appears the user can paste JSON into Activity. Do not send secrets or large files without explicit consent.`;
async function shareTree() {
  await requireAccess(true);
  if(!searchResults)await indexProject(900);
  const list=(searchResults||[]).slice(0,600).map(x=>`${x.kind==='directory'?'DIR ':'FILE'} ${x.path}`);
  if(!await ask({title:'Share filenames?',description:`Share ${list.length} project paths with ChatGPT? No file contents are included.`,confirm:'Prepare draft'}))return;
  await compose(`Workspace ${root.name} paths:\n${list.join('\n')}`);
}
function renderPending() {
  $('pendingText').textContent=pending?`${pending.action.toUpperCase()} · ${pending.path||'root directory'}`:'No pending model action.';
  $('preview').hidden=!pending;
  $('preview').textContent=pending?JSON.stringify(pending,(k,v)=>k==='tabId'?undefined:v,2).slice(0,9000):'';
  $('apply').disabled=!pending;
  $('dismiss').disabled=!pending;
  $('pendingCount').hidden=!pending;
}
async function updatePending() {
  pending=(await chrome.storage.session.get('pending')).pending||null;
  renderPending();
}
async function clearPending() {
  pending=null;await chrome.storage.session.remove('pending');
  await chrome.action.setBadgeText({text:''});renderPending();
}
async function queueManual() {
  try {
    let request;
    try {request=JSON.parse($('manualRequest').value);} catch {request=CFC.parse($('manualRequest').value);}
    if(!request)throw new Error('Paste a valid JSON request.');
    request=CFC.validate(request);
    if(pending&&!await ask({title:'Replace queued request?',description:'An unexecuted action is already queued.',confirm:'Replace'}))return;
    pending={...request,at:Date.now()};
    await chrome.storage.session.set({pending});
    renderPending();tab('activity');toast('Request queued for approval.');
  }catch(error){toast(error.message,true);}
}
async function executeRequest() {
  if(!pending||busy)return;
  busy=true;$('apply').disabled=true;
  const request=pending;
  try {
    await requireAccess(true);
    let output='';
    if(request.action==='list'){
      await indexProject(600);
      output=(searchResults||[]).map(x=>`${x.kind} ${x.path}`).join('\n');
      if((searchResults||[]).length>=600)output+='\n[First 600 entries only]';
    }else if(request.action==='read'){
      if(sensitive(request.path))throw new Error('Sensitive files cannot be read automatically. Share manually if necessary.');
      const {content}=await readText(request.path);
      output=content.slice(0,MAX_CHAT_CHARS)+(content.length>MAX_CHAT_CHARS?'\n[Truncated]':'');
    }else if(request.action==='attach'){
      await attachFile(request.path);output='Attachment attempted; user must verify it appears in ChatGPT.';
    }else{
      const path=request.path;CFC.parts(path);
      let existing=null;
      try{existing=await readText(path);}catch(error){if(!notFound(error))throw error;}
      if(request.action==='create'&&existing)throw new Error('File already exists.');
      if(request.action!=='create'&&!existing)throw new Error('File not found.');
      if(current?.path===path&&changed())throw new Error('Unsaved editor changes; resolve them first.');
      const next=request.action==='edit'?CFC.replaceOnce(existing.content,request.find,request.replace):request.content;
      if(!await reviewChange(request.action.toUpperCase(),path,existing?.content||'',next)){
        toast('Change cancelled.');return;
      }
      if(existing){
        const latest=await existing.handle.getFile();
        if(latest.lastModified!==existing.file.lastModified||(await readText(path)).content!==existing.content)throw new Error('File changed before approval; nothing written.');
      }
      await writeText(existing?.handle||await fileAt(path,true),next);
      pushUndo(existing?{kind:'restore',path,content:existing.content}:{kind:'remove',path,isDirectory:false});
      if(current?.path===path)resetEditor();
      await refreshTree();
      output=`File ${path} ${request.action==='create'?'created':'updated'} successfully.`;
    }
    lastResult=`Chat Folder Click local result\nAction: ${request.action}\nPath: ${request.path||'(root)'}\n\n${output}`;
    $('result').textContent=lastResult;
    $('returnResult').disabled=$('copyResult').disabled=false;
    await clearPending();toast('Local action completed.');
    if((await chrome.storage.local.get({autoReturn:false})).autoReturn && request.action!=='attach')await compose(lastResult,request.tabId);
  }catch(error){
    lastResult=`Chat Folder Click ERROR for ${request.action}: ${error.message}`;
    $('result').textContent=lastResult;
    $('returnResult').disabled=$('copyResult').disabled=false;
    await clearPending();toast(error.message,true);
  }finally{busy=false;$('apply').disabled=!pending;}
}

$('choose').addEventListener('click',chooseFolder);
$('reconnect').addEventListener('click',async()=>{if(await permission(true))await prepareFolder();else toast('Access not granted.',true);});
$('refresh').addEventListener('click',refreshTree);
$('filter').addEventListener('input',renderTree);
$('scan').addEventListener('click',()=>indexProject());
$('newFile').addEventListener('click',()=>createEntry('file'));
$('newFolder').addEventListener('click',()=>createEntry('directory'));
$('rename').addEventListener('click',moveFile);
$('move').addEventListener('click',moveFile);
$('delete').addEventListener('click',deleteEntry);
$('content').addEventListener('input',editorState);
$('save').addEventListener('click',saveEditor);
$('revert').addEventListener('click',async()=>{if(current&&await ask({title:'Revert unsaved changes?',description:current.path,confirm:'Revert'})){$('content').value=current.original;editorState();}});
$('attach').addEventListener('click',()=>{const path=selected?.kind==='file'?selected.path:current?.path; if(path)attachFile(path).catch(e=>toast(e.message,true));});
$('send').addEventListener('click',sendSelectedText);
$('exportFile').addEventListener('click',exportFile);
$('importFiles').addEventListener('click',()=>$('filePicker').click());
$('filePicker').addEventListener('change',async()=>{await importFiles([...$('filePicker').files]);$('filePicker').value='';});
$('connect').addEventListener('click',()=>compose(instructions));
$('sendTree').addEventListener('click',()=>shareTree().catch(e=>toast(e.message,true)));
$('apply').addEventListener('click',executeRequest);
$('dismiss').addEventListener('click',clearPending);
$('queueManual').addEventListener('click',queueManual);
$('returnResult').addEventListener('click',()=>compose(lastResult,pending?.tabId));
$('copyResult').addEventListener('click',async()=>{await navigator.clipboard.writeText(lastResult);toast('Result copied.');});
$('undo').addEventListener('click',undoLast);
for(const b of document.querySelectorAll('.tabs button'))b.addEventListener('click',()=>tab(b.dataset.tab));
for(const b of document.querySelectorAll('[data-theme-choice]'))b.addEventListener('click',()=>setTheme(b.dataset.themeChoice));
for(const key of ['autoRead','autoReturn','showHidden']) {
  $(key).addEventListener('change',async()=>{
    if(key==='autoReturn'&&$(key).checked&&!await ask({title:'Prepare result drafts?',description:'Results containing local file contents may be inserted into the ChatGPT composer. You still click Send.',confirm:'Enable'}))$(key).checked=false;
    await chrome.storage.local.set({[key]:$(key).checked});
    if(key==='showHidden'){showHidden=$(key).checked;if(root)await refreshTree();}
  });
}
chrome.storage.onChanged.addListener((changes,area)=>{
  if(area==='session'&&changes.pending)updatePending().catch(e=>toast(e.message,true));
});
(async()=>{
  try{
    const settings=await chrome.storage.local.get({theme:'black',autoRead:false,autoReturn:false,showHidden:false});
    setTheme(settings.theme);
    showHidden=settings.showHidden;
    for(const key of ['autoRead','autoReturn','showHidden'])$(key).checked=settings[key];
    root=await restoreRoot();
    if(root)await prepareFolder();
    await updatePending();editorState();updateSelection();
  }catch(error){toast(`Could not load workspace: ${error.message}`,true);}
})();
