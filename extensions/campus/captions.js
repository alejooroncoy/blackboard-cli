// El usuario elige el recuadro de subtítulos una vez. No intentamos adivinar
// selectores internos de Class, que cambian con frecuencia entre versiones.
let watchedNode;
let lastText = '';
let observer;
let pickerBanner;

chrome.runtime.onMessage.addListener((message, _sender, respond) => {
  if (message.type !== 'pick-class-captions') return;
  beginPicker();
  respond({ ok: true });
});

function beginPicker() {
  cancelPicker();
  document.documentElement.style.cursor = 'crosshair';
  pickerBanner = document.createElement('div');
  pickerBanner.textContent = 'Campus: haz clic sobre el recuadro de subtítulos de Class';
  Object.assign(pickerBanner.style, {
    position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', zIndex: '2147483647',
    padding: '10px 14px', borderRadius: '9px', background: '#10203e', color: 'white', font: '600 14px system-ui',
    boxShadow: '0 5px 22px #0008', pointerEvents: 'none',
  });
  document.documentElement.append(pickerBanner);
  document.addEventListener('click', chooseCaptionNode, true);
  document.addEventListener('keydown', cancelWithEscape, true);
}

function cancelWithEscape(event) { if (event.key === 'Escape') cancelPicker(); }
function cancelPicker() {
  document.documentElement.style.cursor = '';
  pickerBanner?.remove(); pickerBanner = undefined;
  document.removeEventListener('click', chooseCaptionNode, true);
  document.removeEventListener('keydown', cancelWithEscape, true);
}

function chooseCaptionNode(event) {
  event.preventDefault();
  event.stopPropagation();
  const element = event.composedPath().find((node) => node instanceof HTMLElement && node !== pickerBanner);
  if (!element) return;
  watchedNode = nearestUsefulTextContainer(element);
  cancelPicker();
  lastText = '';
  observer?.disconnect();
  observer = new MutationObserver(publishCaption);
  observer.observe(watchedNode, { childList: true, characterData: true, subtree: true });
  publishCaption();
  chrome.runtime.sendMessage({ type: 'captions-linked' });
}

function nearestUsefulTextContainer(element) {
  let current = element;
  // Conserva el bloque corto que se actualiza, no toda la página o todo el chat.
  while (current.parentElement && current.innerText.trim().length < 20) current = current.parentElement;
  return current;
}

function publishCaption() {
  if (!watchedNode?.isConnected) return;
  const text = watchedNode.innerText.replace(/\s+/g, ' ').trim();
  if (!text || text === lastText || text.length > 1_500) return;
  lastText = text;
  chrome.runtime.sendMessage({ type: 'class-caption', text });
}
