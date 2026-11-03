'use strict';
// Shared pure helpers also tested in Node.js; no permissions or I/O.
const CFC = Object.freeze({
  parts(path) {
    if (typeof path !== 'string' || !path || path.length > 300 ||
        path.startsWith('/') || path.includes('\\') || path.includes('\0') || path.includes(':')) {
      throw new Error('Use a relative file path inside the selected folder.');
    }
    const parts = path.split('/');
    if (parts.some(part => !part || part === '.' || part === '..' || part.toLowerCase() === '.git')) {
      throw new Error('Invalid or protected path.');
    }
    return parts;
  },
  parse(text) {
    if (typeof text !== 'string' || text.length > 750000) return null;
    const marker = /"bridge"\s*:\s*"chat-folder-click"/g;
    for (const match of text.matchAll(marker)) {
      const start = text.lastIndexOf('{', match.index);
      if (start < 0) continue;
      let depth = 0, quoted = false, escape = false;
      for (let i = start; i < text.length; i++) {
        const c = text[i];
        if (quoted) {
          if (escape) escape = false;
          else if (c === '\\') escape = true;
          else if (c === '"') quoted = false;
        } else if (c === '"') quoted = true;
        else if (c === '{') depth++;
        else if (c === '}' && --depth === 0) {
          try {
            const obj = JSON.parse(text.slice(start, i + 1));
            if (obj.bridge !== 'chat-folder-click' ||
                !['list', 'read', 'edit', 'write', 'create', 'attach'].includes(obj.action)) break;
            if (obj.action !== 'list') CFC.parts(obj.path);
            if (obj.action === 'edit' &&
                (typeof obj.find !== 'string' || !obj.find || typeof obj.replace !== 'string')) break;
            if (['write', 'create'].includes(obj.action) && typeof obj.content !== 'string') break;
            if ((obj.content || '').length > 500000 || (obj.replace || '').length > 500000) break;
            return obj;
          } catch { /* Ignore unrelated blocks. */ }
          break;
        }
      }
    }
    return null;
  },
  validate(request) {
    if (!request || request.bridge !== 'chat-folder-click' ||
        !['list', 'read', 'edit', 'write', 'create', 'attach'].includes(request.action)) {
      throw new Error('Unsupported request.');
    }
    if (request.action !== 'list') CFC.parts(request.path);
    if (request.action === 'edit' &&
        (typeof request.find !== 'string' || !request.find || typeof request.replace !== 'string')) {
      throw new Error('Edit requires a nonempty unique find string and replacement.');
    }
    if (['write','create'].includes(request.action) && typeof request.content !== 'string') {
      throw new Error('Missing file contents.');
    }
    if ((request.content || '').length > 500000 || (request.replace || '').length > 500000) {
      throw new Error('Request too large.');
    }
    const { bridge, action, path, find, replace, content } = request;
    return { bridge, action,
      ...(path === undefined ? {} : { path }),
      ...(find === undefined ? {} : { find }),
      ...(replace === undefined ? {} : { replace }),
      ...(content === undefined ? {} : { content }) };
  },
  replaceOnce(text, find, replace) {
    if (!find || typeof find !== 'string' || typeof replace !== 'string') {
      throw new Error('Find text and replacement are required.');
    }
    const first = text.indexOf(find);
    if (first < 0) throw new Error('Target text not found; file not modified.');
    if (text.indexOf(find, first + find.length) >= 0) {
      throw new Error('Target text is not unique; file not modified.');
    }
    return text.slice(0, first) + replace + text.slice(first + find.length);
  }
});
if (typeof module !== 'undefined' && module.exports) module.exports = CFC;
