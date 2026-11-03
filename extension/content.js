'use strict';
(() => {
  const SEEN = new WeakSet();
  const SELECTOR = '[data-message-author-role="assistant"]';
  let ready = false;

  function addRunButton(message, request) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `Review in folder · ${request.action}`;
    Object.assign(button.style, {
      display: 'inline-block', margin: '10px 4px', padding: '7px 12px',
      border: '1px solid #8d8d8d', borderRadius: '10px', color: '#f2f2f0',
      background: '#252525', font: '12px system-ui', cursor: 'pointer'
    });
    button.addEventListener('click', async () => {
      const answer = await chrome.runtime.sendMessage({ kind: 'cfc-queue', request });
      button.textContent = answer?.ok ? 'Queued · open Chat Folder Click' : 'Could not queue';
    });
    message.appendChild(button);
  }

  function scan() {
    for (const node of document.querySelectorAll(SELECTOR)) {
      if (SEEN.has(node)) continue;
      // Don't mark incomplete streaming messages as seen.
      const request = CFC.parse(node.innerText || node.textContent || '');
      if (!request) continue;
      SEEN.add(node);
      addRunButton(node, request);
      if (ready && request.action !== 'write' && request.action !== 'create' && request.action !== 'edit') {
        chrome.storage.local.get({ autoRead: false }).then(({ autoRead }) => {
          if (autoRead) chrome.runtime.sendMessage({ kind: 'cfc-queue', request }).catch(() => {});
        });
      }
    }
  }

  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => { scheduled = false; scan(); }, 250);
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  scan();
  setTimeout(() => { ready = true; }, 1500);

  const composer = () => document.querySelector('#prompt-textarea, [data-testid="composer-text-input"], [contenteditable="true"][role="textbox"]');
  function compose(text, submit = false) {
    const target = composer();
    if (!target) return { ok: false, error: 'Chat input not found.' };
    target.focus();
    if (target instanceof HTMLTextAreaElement) {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      setter.call(target, (target.value ? target.value + '\n' : '') + text);
      target.dispatchEvent(new Event('input', { bubbles: true }));
    } else {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(target); range.collapse(false);
      selection.removeAllRanges(); selection.addRange(range);
      if (!document.execCommand('insertText', false, text)) return { ok: false, error: 'Could not insert text.' };
      target.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: text }));
    }
    if (submit) {
      const send = document.querySelector('[data-testid="send-button"]');
      if (!send || send.disabled) return { ok: true, sent: false, error: 'Draft prepared; click Send manually.' };
      send.click();
      return { ok: true, sent: true };
    }
    return { ok: true, sent: false };
  }

  function attach(name, base64, mime) {
    const target = document.querySelector('input[type="file"]');
    if (!target) return { ok: false, error: 'File uploader not found. Use Send content instead.' };
    const bin = atob(base64);
    const bytes = Uint8Array.from(bin, c => c.charCodeAt(0));
    const file = new File([bytes], name, { type: mime || 'application/octet-stream' });
    const data = new DataTransfer();
    data.items.add(file);
    try {
      target.files = data.files;
      target.dispatchEvent(new Event('change', { bubbles: true }));
      return { ok: true, staged: true, note: 'File selection dispatched. Verify the attachment appears in ChatGPT before sending.' };
    } catch (error) { return { ok: false, error: String(error) }; }
  }

  chrome.runtime.onMessage.addListener((message, _sender, respond) => {
    if (message?.kind === 'cfc-compose') { respond(compose(message.text, Boolean(message.submit))); return; }
    if (message?.kind === 'cfc-attach') { respond(attach(message.name, message.base64, message.mime)); return; }
  });
})();
