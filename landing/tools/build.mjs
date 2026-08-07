/**
 * Regenera todo lo derivado del sitio, en orden.
 *
 * El orden importa y es la razón de que esto exista: las páginas por cliente y
 * la comparativa copian su cabecera, estilos y footer de blackboard-mcp/index.html,
 * y llms-full.txt concatena los .md que esos generadores acaban de escribir.
 * Corriendo los pasos a mano es fácil dejar uno atrás y publicar dos versiones
 * distintas del mismo dato.
 *
 *   node landing/tools/build.mjs
 *
 * Después de editar blackboard-mcp/index.html (la página madre), corre esto.
 */
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const TOOLS = path.resolve(new URL('.', import.meta.url).pathname)
const ROOT = path.resolve(TOOLS, '..')

for (const script of ['build-mcp-client-pages.mjs', 'build-mcp-alternatives-page.mjs']) {
  execFileSync('node', [path.join(TOOLS, script)], { stdio: 'inherit' })
}

// llms-full.txt: el texto completo del sitio en un archivo, para que un modelo
// lo ingiera de una sola pasada. Se arma al final, cuando todos los .md existen.
const ORDER = [
  'blackboard-mcp/index.md',
  'blackboard-mcp/alternativas/index.md',
  'blackboard-mcp/claude-desktop/index.md',
  'blackboard-mcp/claude-code/index.md',
  'blackboard-mcp/cursor/index.md',
  'blackboard-mcp/github-copilot/index.md',
  'blackboard-mcp/codex/index.md',
  'blackboard-mcp/windsurf/index.md',
  'blackboard-cli/index.md',
  'blog/organizar-tu-semana-blackboard/index.md',
  'blog/chatgpt-blackboard-sin-copiar-archivos/index.md',
  'blog/como-mejore-mis-notas-trabajando-y-estudiando-con-campus/index.md',
]

const missing = ORDER.filter((p) => !fs.existsSync(path.join(ROOT, p)))
if (missing.length) {
  console.error('Faltan .md que llms-full.txt necesita:\n  ' + missing.join('\n  '))
  process.exit(1)
}

// Cualquier .md publicado que nadie metió en ORDER quedaría fuera del archivo
// completo sin que nadie se entere. Mejor avisar.
const published = fs
  .readdirSync(ROOT, { recursive: true })
  .filter((p) => typeof p === 'string' && p.endsWith('index.md'))
  .map((p) => p.split(path.sep).join('/'))
const orphans = published.filter((p) => !ORDER.includes(p))
if (orphans.length) console.warn('AVISO — .md fuera de llms-full.txt:\n  ' + orphans.join('\n  '))

const header = `# Campus — contenido completo

Campus es un proyecto independiente que conecta el campus universitario de un
estudiante (hoy Blackboard Learn en UPC, Perú) con asistentes de IA compatibles
con Model Context Protocol, y con la terminal.

Este archivo reúne el texto completo de todas las páginas del sitio, en el mismo
Markdown publicado en cada URL. Índice corto en https://campuscli.com/llms.txt

No afiliado a UPC, Blackboard, OpenAI ni Anthropic.

`

const body = ORDER.map(
  (p) => '\n' + '='.repeat(78) + '\n\n' + fs.readFileSync(path.join(ROOT, p), 'utf8').trimEnd() + '\n',
)
const out = [header, ...body].join('\n')
fs.writeFileSync(path.join(ROOT, 'llms-full.txt'), out)
console.log(`escrito llms-full.txt (${ORDER.length} documentos, ${out.split(/\s+/).length} palabras)`)
