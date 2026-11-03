'use strict';

chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
});
chrome.runtime.onStartup.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);
});
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

chrome.runtime.onMessage.addListener((message, sender, reply) => {
  if (message?.kind !== 'cfc-queue' || !sender.tab?.id) return;
  const { request } = message;
  try {
    const validated = CFC_VALIDATE(request);
    chrome.storage.session.set({ pending: { ...validated, tabId: sender.tab.id, at: Date.now() } })
      .then(() => chrome.action.setBadgeText({ text: '1' }))
      .then(() => chrome.action.setBadgeBackgroundColor({ color: '#bd8a59' }))
      .then(() => reply({ ok: true })).catch(e => reply({ ok: false, error: String(e) }));
  } catch (e) {
    reply({ ok: false, error: String(e) });
  }
  return true;
});

function CFC_VALIDATE(request) {
  if (!request || request.bridge !== 'chat-folder-click' ||
      !['list', 'read', 'edit', 'write', 'create', 'attach'].includes(request.action)) {
    throw new Error('Unsupported request');
  }
  const { action, path, find, replace, content } = request;
  if (action !== 'list' && typeof path !== 'string') throw new Error('Missing path');
  if (action === 'edit' && (typeof find !== 'string' || typeof replace !== 'string' || !find)) {
    throw new Error('Edit needs a nonempty find and replace');
  }
  if (['write', 'create'].includes(action) && typeof content !== 'string') throw new Error('Missing content');
  if (content?.length > 500000 || replace?.length > 500000) throw new Error('Request too large');
  return { bridge: 'chat-folder-click', action, ...(path === undefined ? {} : { path }),
    ...(find === undefined ? {} : { find }), ...(replace === undefined ? {} : { replace }),
    ...(content === undefined ? {} : { content }) };
}
