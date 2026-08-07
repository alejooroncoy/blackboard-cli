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
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'

const TOOLS = path.dirname(fileURLToPath(import.meta.url))
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

// ── Verificación ──────────────────────────────────────────────────────────────
// El sitio afirma cosas comprobables sobre el producto. La lista de herramientas
// ya se publicó una vez con 15 cuando el servidor registraba 19, porque el dato
// se copiaba a mano de un sitio a otro. Esto compara lo publicado contra la
// fuente real y rompe el build antes de que la mentira llegue a producción.
const problems = []

const TOOLS_SRC = path.resolve(ROOT, '..', 'src/providers/blackboard/mcp-tools.ts')
if (!fs.existsSync(TOOLS_SRC)) {
  console.warn(`AVISO — no encuentro ${TOOLS_SRC}; salto la comprobación de herramientas.`)
} else {
  const registered = [
    ...fs.readFileSync(TOOLS_SRC, 'utf8').matchAll(/registerTrackedTool\(\s*'(blackboard_[a-z_]+)'/g),
  ].map((m) => m[1])
  const unique = [...new Set(registered)].sort()

  // Cada página o índice que enumera herramientas debe enumerarlas TODAS.
  for (const rel of ['blackboard-mcp/index.html', 'blackboard-mcp/index.md', 'llms.txt', 'llms-full.txt']) {
    const text = fs.readFileSync(path.join(ROOT, rel), 'utf8')
    const missing = unique.filter((t) => !text.includes(t))
    if (missing.length) problems.push(`${rel}: faltan herramientas — ${missing.join(', ')}`)
  }

  // Y el conteo escrito en prosa debe coincidir con cuántas hay de verdad.
  const words = ['cero','una','dos','tres','cuatro','cinco','seis','siete','ocho','nueve','diez','once','doce','trece','catorce','quince','dieciséis','diecisiete','dieciocho','diecinueve','veinte','veintiuna','veintidós','veintitrés','veinticuatro','veinticinco']
  const expected = new Set([String(unique.length), words[unique.length]].filter(Boolean))
  for (const rel of ORDER.concat(['llms.txt'])) {
    const text = fs.readFileSync(path.join(ROOT, rel), 'utf8')
    for (const [, raw] of text.matchAll(/(\d+|[a-zá-úé]+)\s+herramientas/gi)) {
      const n = raw.toLowerCase()
      // Solo es una afirmación numérica si es un dígito o un numeral escrito.
      // "sus herramientas" o "las herramientas" no afirman nada que verificar.
      const isCount = /^\d+$/.test(n) || words.includes(n)
      if (isCount && !expected.has(n)) {
        problems.push(`${rel}: dice "${raw} herramientas" y el servidor registra ${unique.length}`)
      }
    }
  }
  console.log(`herramientas MCP: ${unique.length} registradas en el código`)
}

// El sitemap se edita a mano: si se añade un cliente, aquí se nota.
const sitemap = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8')
for (const rel of ORDER) {
  const url = 'https://campuscli.com/' + rel.replace(/index\.md$/, '')
  if (!sitemap.includes(`<loc>${url}</loc>`)) problems.push(`sitemap.xml: falta ${url}`)
}

if (problems.length) {
  console.error('\nEl contenido publicado no cuadra con la realidad:\n  ' + problems.join('\n  '))
  process.exit(1)
}
console.log('verificación OK — lo publicado coincide con el código y el sitemap está completo')
