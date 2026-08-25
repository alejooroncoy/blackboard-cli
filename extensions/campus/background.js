chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

chrome.runtime.onMessage.addListener((message, sender, respond) => {
  if (message.type === 'pick-class-captions') {
    chrome.tabs.query({ active: true, currentWindow: true })
      .then(async ([tab]) => {
        if (!tab?.id || !tab.url?.startsWith('https://upc.class.com/')) {
          throw new Error('Abre la pestaña de tu clase de Class antes de vincular los subtítulos.');
        }
        try {
          await chrome.tabs.sendMessage(tab.id, { type: 'pick-class-captions' });
        } catch {
          // Las pestañas abiertas antes de instalar/recargar una extensión no
          // tienen content script. Lo inyectamos bajo el host permitido.
          await chrome.scripting.executeScript({
            target: { tabId: tab.id, allFrames: true },
            files: ['captions.js'],
          });
          await chrome.tabs.sendMessage(tab.id, { type: 'pick-class-captions' });
        }
      })
      .then(() => respond({ ok: true }))
      .catch((error) => respond({ ok: false, error: error.message }));
    return true;
  }

});
