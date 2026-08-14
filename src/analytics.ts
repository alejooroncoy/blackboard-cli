import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadAccountSession } from './account/store.js';
import { secureServiceUrl } from './security/urls.js';

const POSTHOG_HOST = process.env.POSTHOG_DISABLED === '1'
  ? ''
  : secureServiceUrl(process.env.POSTHOG_HOST ?? 'https://us.i.posthog.com', 'POSTHOG_HOST');
const POSTHOG_KEY = process.env.POSTHOG_API_KEY ?? 'phc_mVYDii8qujKLxaCagZomJjR4B2Cd53FieYqDyBPe4zGw';
const INSTALL_FILE = path.join(os.homedir(), '.blackboard-cli', 'analytics-id');

// npm_package_version solo existe cuando algo corre vía npm scripts, así que
// en una instalación normal todos los eventos llegaban etiquetados con el
// fallback y no con la versión real. Desde dist/, '../' es la raíz del paquete.
const { version: VERSION } = require('../package.json') as { version: string };

// Todo lo que puede viajar a PostHog. Es una lista blanca a propósito: antes
// reenviábamos `...properties` tal cual, así que cualquier evento nuevo podía
// llevarse por delante el nombre de un curso o de una tarea sin que nadie lo
// notara al revisar. Añadir aquí una clave es una decisión consciente.
const ALLOWED_PROPERTIES = new Set([
  'app',
  'attempts_count',
  'command',
  'duration_ms',
  'error_type',
  'has_comments',
  'has_file',
  'has_text',
  'method',
  'mode',
  'parent_command',
  'status_code',
  'success',
  'tool',
  'version',
]);

function installId(): string {
  try {
    const directory = path.dirname(INSTALL_FILE);
    if (fs.existsSync(directory) && fs.lstatSync(directory).isSymbolicLink()) return crypto.randomUUID();
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
    fs.chmodSync(directory, 0o700);
    if (fs.existsSync(INSTALL_FILE)) {
      if (fs.lstatSync(INSTALL_FILE).isSymbolicLink()) return crypto.randomUUID();
      fs.chmodSync(INSTALL_FILE, 0o600);
      return fs.readFileSync(INSTALL_FILE, 'utf8').trim();
    }
    const id = crypto.randomUUID();
    fs.writeFileSync(INSTALL_FILE, id, { mode: 0o600, flag: 'wx' });
    return id;
  } catch { return crypto.randomUUID(); }
}

// Identificamos por la cuenta Campus, no por el usuario de Blackboard.
//
// El identificador de Blackboard es una credencial del sistema de la
// universidad y es reidentificable: con blackboard_whoami se convierte en el
// nombre y el correo del alumno. Mandarlo a un tercero no es algo que el
// estudiante nos haya autorizado al conectar su campus.
//
// La cuenta Campus sí es nuestra, el usuario se registró con ella y acepta la
// analítica en ese registro. Para validar sirve igual — usuarios únicos,
// retención, embudo, herramientas más usadas — y el vínculo con la persona
// vive en nuestro backend, no en PostHog.
//
// Sin cuenta (alguien que solo usa `campus login`) cae al id de instalación,
// que es un UUID local y no identifica a nadie.
function distinctId(): string {
  try {
    const accountId = loadAccountSession()?.account?.id;
    if (accountId) return `campus:${accountId}`;
  } catch { /* la analítica nunca puede romper un comando */ }
  return `install:${installId()}`;
}

/** Best-effort analytics: failures never affect the campus client. */
export function track(event: string, properties: Record<string, unknown> = {}) {
  if (process.env.POSTHOG_DISABLED === '1' || !POSTHOG_HOST || !POSTHOG_KEY) return;
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(properties)) {
    if (ALLOWED_PROPERTIES.has(key)) safe[key] = value;
  }
  void fetch(`${POSTHOG_HOST}/capture/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: POSTHOG_KEY,
      event,
      distinct_id: distinctId(),
      properties: { ...safe, app: 'campus-cli', version: VERSION },
    }),
  }).catch(() => {});
}
