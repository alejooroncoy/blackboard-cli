const state = { active: false, startedAt: 0, timerId: 0, transcript: [], course: [] };

const $ = (selector) => document.querySelector(selector);
const transcriptList = $('#transcript-list');

restoreSettings();

document.querySelectorAll('.tab').forEach((button) => button.addEventListener('click', () => {
  document.querySelectorAll('.tab, .panel').forEach((element) => element.classList.remove('active'));
  button.classList.add('active');
  $(`#${button.dataset.tab}`).classList.add('active');
}));

$('#captions-button').addEventListener('click', async () => {
  const result = await chrome.runtime.sendMessage({ type: 'pick-class-captions' });
  if (!result.ok) return setStatus(result.error, true);
  setStatus('Selecciona el recuadro de subtítulos en Class');
});

$('#assistant-endpoint').addEventListener('change', async (event) => {
  await chrome.storage.local.set({ assistantEndpoint: event.target.value.trim() });
});

$('#load-course').addEventListener('click', loadCourseContext);
$('#ask-button').addEventListener('click', prepareQuestion);

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.type === 'captions-linked') setStatus('Subtítulos vinculados');
  if (message.type === 'class-caption') addTranscript(message.text);
});

function addTranscript(text) {
  state.transcript.push({ at: elapsed(), text });
  const empty = transcriptList.querySelector('.empty');
  if (empty) empty.remove();
  const item = document.createElement('article');
  item.innerHTML = `<time>${elapsed()}</time><p></p>`;
  item.querySelector('p').textContent = text;
  transcriptList.append(item);
  item.scrollIntoView({ block: 'end', behavior: 'smooth' });
}

async function loadCourseContext() {
  const courseId = $('#course-id').value.trim();
  if (!/^_[A-Za-z0-9]+_\d+$/.test(courseId)) return setStatus('El ID de curso no tiene un formato válido.', true);
  setStatus('Consultando Blackboard…');
  try {
    const response = await fetch(`https://aulavirtual.upc.edu.pe/learn/api/public/v1/courses/${encodeURIComponent(courseId)}/contents?limit=25`, { credentials: 'include' });
    if (!response.ok) throw new Error(response.status === 401 ? 'Inicia sesión en Aula Virtual.' : `Blackboard devolvió ${response.status}`);
    const data = await response.json();
    state.course = (data.results || []).map((item) => item.title).filter(Boolean);
    const list = $('#course-context');
    list.replaceChildren(...state.course.map((title) => Object.assign(document.createElement('li'), { textContent: title })));
    if (!state.course.length) list.textContent = 'No hay contenidos visibles en el nivel principal.';
    setStatus('Contexto cargado');
  } catch (error) { setStatus(error.message, true); }
}

async function prepareQuestion() {
  const question = $('#question').value.trim();
  if (!question) return;
  const context = [
    `Pregunta: ${question}`,
    state.transcript.length ? `Transcripción:\n${state.transcript.map((x) => `[${x.at}] ${x.text}`).join('\n')}` : 'Aún no hay transcripción.',
    state.course.length ? `Materiales Blackboard:\n${state.course.map((x) => `- ${x}`).join('\n')}` : 'No se cargó contexto Blackboard.',
  ].join('\n\n');
  const answer = $('#answer');
  answer.hidden = false;
  answer.textContent = 'Consultando con el contexto de la clase y Blackboard…';
  try {
    const response = await fetch($('#assistant-endpoint').value.trim(), {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, context }),
    });
    if (!response.ok) throw new Error(`El asistente devolvió ${response.status}`);
    const { answer: responseAnswer } = await response.json();
    if (!responseAnswer) throw new Error('El asistente no devolvió una respuesta.');
    answer.textContent = responseAnswer;
  } catch (error) {
    answer.textContent = `No se pudo consultar el asistente (${error.message}). Contexto listo para pegar en ChatGPT, Claude o tu cliente MCP:\n\n${context}`;
  }
}

function renderTimer() { $('#timer').textContent = elapsed(); }
function elapsed() {
  const seconds = Math.floor((Date.now() - state.startedAt) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
function stopTimer() { window.clearInterval(state.timerId); }
function setStatus(text, error = false) {
  const status = $('#status'); status.textContent = text; status.classList.toggle('error', error);
}
async function restoreSettings() {
  const { assistantEndpoint } = await chrome.storage.local.get('assistantEndpoint');
  if (assistantEndpoint) $('#assistant-endpoint').value = assistantEndpoint;
}
