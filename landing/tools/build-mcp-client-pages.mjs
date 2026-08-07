import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Raíz del sitio, relativa a este archivo (landing/tools/ -> landing/)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const base = fs.readFileSync(path.join(ROOT, 'blackboard-mcp/index.html'), 'utf8')

// Reutilizamos el shell de la página madre: head (hasta </head>), header y footer.

// La cabecera, los estilos y el footer se copian de la página madre buscando
// marcadores literales. Si alguien la reestructura, indexOf devuelve -1 y las
// páginas hijas saldrían truncadas sin que nada falle: por eso esto grita.
const at = (marker, from = 0) => {
  const i = base.indexOf(marker, from)
  if (i === -1) {
    throw new Error(
      `No encuentro ${marker} en blackboard-mcp/index.html.\n` +
        'La página madre cambió de estructura: ajusta los marcadores de este generador ' +
        'antes de volver a publicar, o las 7 páginas hijas saldrán rotas.',
    )
  }
  return i
}

const styleBlock = base.slice(at('<link rel="stylesheet"'), at('</style>') + '</style>'.length)
const headerBlock = base.slice(at('</head>') + '</head>'.length, at('<main>') + '<main>'.length)
const footerBlock = base.slice(at('</main>'))

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const CLIENTS = [
  {
    slug: 'claude-desktop',
    name: 'Claude Desktop',
    eyebrow: 'Blackboard MCP · Claude Desktop',
    h1: 'Blackboard UPC en Claude Desktop.',
    intent: 'la app de escritorio de Claude',
    file: '~/Library/Application Support/Claude/claude_desktop_config.json',
    fileWin: '%APPDATA%\\Claude\\claude_desktop_config.json',
    howto: 'Abre Claude, ve a <strong>Settings → Developer → Edit Config</strong> y pega el bloque. Si el archivo ya tiene otros servidores, agrega solo la entrada <code>campus</code> dentro de <code>mcpServers</code>.',
    lang: 'json',
    config: `{
  "mcpServers": {
    "campus": {
      "command": "npx",
      "args": ["campus-cli", "mcp"]
    }
  }
}`,
    verify: 'Cierra Claude por completo y vuelve a abrirlo. En la caja de mensaje verás el ícono de herramientas; al desplegarlo debe aparecer <code>campus</code> con las herramientas <code>blackboard_*</code>.',
  },
  {
    slug: 'claude-code',
    name: 'Claude Code',
    eyebrow: 'Blackboard MCP · Claude Code',
    h1: 'Blackboard UPC en Claude Code.',
    intent: 'Claude Code, el agente de terminal de Anthropic',
    file: '.mcp.json (en la raíz de tu proyecto)',
    howto: 'Crea o edita <code>.mcp.json</code> en la raíz del proyecto donde trabajas. También puedes registrarlo a nivel de usuario para tenerlo en todas tus carpetas.',
    lang: 'json',
    config: `{
  "mcpServers": {
    "campus": {
      "command": "npx",
      "args": ["campus-cli", "mcp"]
    }
  }
}`,
    extraTitle: 'Alternativa por comando',
    extra: 'Si prefieres no editar el archivo a mano:',
    extraCode: 'claude mcp add campus -- npx campus-cli mcp',
    verify: 'Ejecuta <code>/mcp</code> dentro de Claude Code. Debe listar <code>campus</code> como conectado.',
  },
  {
    slug: 'cursor',
    name: 'Cursor',
    eyebrow: 'Blackboard MCP · Cursor',
    h1: 'Blackboard UPC en Cursor.',
    intent: 'Cursor, el editor con IA',
    file: '~/.cursor/mcp.json',
    howto: 'Ve a <strong>Settings → MCP → Add new MCP server</strong>, o edita directamente <code>~/.cursor/mcp.json</code>.',
    lang: 'json',
    config: `{
  "mcpServers": {
    "campus": {
      "command": "npx",
      "args": ["campus-cli", "mcp"]
    }
  }
}`,
    verify: 'En <strong>Settings → MCP</strong>, la entrada <code>campus</code> debe aparecer con un indicador verde y la lista de herramientas <code>blackboard_*</code>.',
  },
  {
    slug: 'github-copilot',
    name: 'GitHub Copilot en VS Code',
    eyebrow: 'Blackboard MCP · GitHub Copilot',
    h1: 'Blackboard UPC en GitHub Copilot.',
    intent: 'GitHub Copilot dentro de VS Code',
    file: '.vscode/mcp.json',
    howto: 'Crea <code>.vscode/mcp.json</code> en tu workspace. Copilot usa la clave <code>servers</code>, no <code>mcpServers</code>, y necesita el campo <code>type</code>.',
    lang: 'json',
    config: `{
  "servers": {
    "campus": {
      "type": "stdio",
      "command": "npx",
      "args": ["campus-cli", "mcp"]
    }
  }
}`,
    verify: 'Abre Copilot Chat en modo agente y revisa el selector de herramientas: <code>campus</code> debe estar entre las disponibles.',
  },
  {
    slug: 'codex',
    name: 'OpenAI Codex CLI',
    eyebrow: 'Blackboard MCP · Codex CLI',
    h1: 'Blackboard UPC en Codex CLI.',
    intent: 'el CLI de Codex de OpenAI',
    file: '~/.codex/config.toml',
    howto: 'Agrega la sección al final de <code>~/.codex/config.toml</code>. Aquí la configuración es TOML, no JSON.',
    lang: 'toml',
    config: `[mcp_servers.campus]
command = "npx"
args = ["campus-cli", "mcp"]`,
    verify: 'Inicia <code>codex</code> y pide la lista de herramientas disponibles: deben figurar las <code>blackboard_*</code>.',
  },
  {
    slug: 'windsurf',
    name: 'Windsurf',
    eyebrow: 'Blackboard MCP · Windsurf',
    h1: 'Blackboard UPC en Windsurf.',
    intent: 'Windsurf, el editor con IA de Codeium',
    file: '~/.codeium/windsurf/mcp_config.json',
    howto: 'Edita <code>~/.codeium/windsurf/mcp_config.json</code>, o llega ahí desde <strong>Settings → Cascade → MCP Servers</strong>.',
    lang: 'json',
    config: `{
  "mcpServers": {
    "campus": {
      "command": "npx",
      "args": ["campus-cli", "mcp"]
    }
  }
}`,
    verify: 'Recarga los servidores desde el panel de Cascade. <code>campus</code> debe aparecer con sus herramientas.',
  },
]


// Una sola fuente para el FAQ de cada guía: de aquí salen el JSON-LD, el HTML
// visible y el Markdown. Declarar en el schema preguntas que no están en la
// página incumple la política de datos estructurados de Google y expone el
// sitio a una acción manual, así que no pueden vivir separados.
const stripTags = (t) => t.replace(/<[^>]+>/g, '')

const faqFor = (c) => {
  const faqs = [
    [`¿Dónde va el archivo de configuración MCP de ${c.name}?`, `En <code>${esc(c.file)}</code>.`],
    [`¿Necesito instalar algo además de ${c.name}?`, 'Solo Node.js 18 o superior. El comando <code>npx</code> descarga <code>campus-cli</code> la primera vez que se ejecuta.'],
    ['¿Qué hago si las herramientas no aparecen?', 'Cierra el cliente por completo y vuelve a abrirlo, verifica que el JSON no tenga comas de más y confirma que <code>npx campus-cli mcp</code> arranca sin error en la terminal.'],
  ]
  return {
    faqs,
    faqLd: {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(([q, a]) => ({
        '@type': 'Question',
        name: q,
        acceptedAnswer: { '@type': 'Answer', text: stripTags(a) },
      })),
    },
    faqHtml: faqs.map(([q, a]) => `  <h3>${q}</h3><p>${a}</p>`).join('\n'),
    faqMd: faqs.map(([q, a]) => `**${q}**\n\n${stripTags(a)}`).join('\n\n'),
  }
}

const page = (c, others) => {
  const title = `Blackboard MCP en ${c.name} | Conecta tu Aula Virtual UPC`
  const desc = `Cómo conectar Blackboard UPC con ${c.name} usando MCP: instalación, archivo de configuración, verificación y qué preguntar. Guía paso a paso de Campus.`
  const url = `https://campuscli.com/blackboard-mcp/${c.slug}/`

  const howToLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `Cómo conectar Blackboard UPC con ${c.name} usando MCP`,
    totalTime: 'PT5M',
    tool: [
      { '@type': 'HowToTool', name: 'Node.js 18 o superior' },
      { '@type': 'HowToTool', name: 'Una cuenta activa de UPC con acceso a Aula Virtual' },
      { '@type': 'HowToTool', name: c.name },
    ],
    step: [
      { '@type': 'HowToStep', name: 'Inicia sesión en tu campus', text: 'Ejecuta npx campus-cli account login. Se abre el navegador con el SSO de Microsoft de UPC.', url: url + '#pasos' },
      { '@type': 'HowToStep', name: `Registra el servidor en ${c.name}`, text: `Agrega la configuración de campus en ${c.file}.`, url: url + '#configuracion' },
      { '@type': 'HowToStep', name: 'Verifica la conexión', text: 'Reinicia el cliente y confirma que las herramientas blackboard_ aparecen disponibles.', url: url + '#verificar' },
    ],
  }

  const crumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://campuscli.com/' },
      { '@type': 'ListItem', position: 2, name: 'Blackboard MCP', item: 'https://campuscli.com/blackboard-mcp/' },
      { '@type': 'ListItem', position: 3, name: c.name, item: url },
    ],
  }

  const { faqLd, faqHtml, faqMd } = faqFor(c)

  const otherLinks = others
    .map((o) => `<li><a href="/blackboard-mcp/${o.slug}/">${o.name}</a></li>`)
    .join('')

  const extraBlock = c.extra
    ? `\n  <h3>${c.extraTitle}</h3>\n  <p>${c.extra}</p>\n  <pre class="code"><code>${esc(c.extraCode)}</code></pre>`
    : ''

  const winLine = c.fileWin
    ? ` En Windows la ruta es <code>${esc(c.fileWin)}</code>.`
    : ''

  return `<!doctype html>
<!-- Generado por landing/tools/build.mjs — no edites este archivo a mano.
     El contenido compartido sale de blackboard-mcp/index.html. -->
<html lang="es"><head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
  <meta name="description" content="${desc}" />
  <meta name="robots" content="index,follow,max-image-preview:large" />
  <meta name="theme-color" content="#112633" />
  <meta name="campus-founder-api" content="https://mcp.campuscli.com/v1/founders" /><meta name="campus-turnstile-site-key" content="0x4AAAAAAEDTvI0vNf8mWxAL" />
  <link rel="canonical" href="${url}" />
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" href="/favicon.ico" sizes="32x32" />
  <link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />
  <meta property="og:type" content="article" />
  <meta property="og:locale" content="es_PE" />
  <meta property="og:site_name" content="Campus" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${desc}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="https://campuscli.com/assets/og-default.jpg" />
  <meta property="og:image:type" content="image/jpeg" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:image:alt" content="Blackboard MCP en ${c.name}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="https://campuscli.com/assets/og-default.jpg" />
  ${styleBlock}
  <script type="application/ld+json">${JSON.stringify(howToLd)}</script>
  <script type="application/ld+json">${JSON.stringify(crumbLd)}</script>
  <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
</head>${headerBlock}
  <nav class="crumbs" aria-label="Ruta de navegación"><ol><li><a href="/">Inicio</a></li><li><a href="/blackboard-mcp/">Blackboard MCP</a></li><li aria-current="page">${c.name}</li></ol></nav>
  <p class="eyebrow">${c.eyebrow}</p><h1>${c.h1}</h1>
  <p>Esta guía conecta tu Aula Virtual UPC con ${c.intent} mediante Model Context Protocol. Al terminar podrás preguntarle por tus cursos, tareas, notas y materiales sin abrir Blackboard.</p>
  <button class="button" type="button" data-open-founder>Solicitar acceso anticipado</button>

  <h2 id="requisitos">Antes de empezar</h2>
  <p>Necesitas tres cosas: Node.js 18 o superior instalado, una cuenta activa de UPC con acceso a Aula Virtual y ${c.name} ya funcionando en tu equipo. El proceso completo toma unos cinco minutos y se hace una sola vez.</p>

  <h2 id="pasos">1. Inicia sesión en tu campus</h2>
  <p>En una terminal, ejecuta:</p>
  <pre class="code"><code>npx campus-cli account login</code></pre>
  <p>Se abre el navegador y encadena el login de Microsoft de UPC, con MFA si tu cuenta lo pide. Si Microsoft muestra <em>«Stay signed in?»</em>, marca la casilla y acepta: así la sesión se mantiene y no tienes que repetir el login cada día. Todo el flujo corre en tu máquina, no pasa por ningún servidor de Campus.</p>

  <h2 id="configuracion">2. Registra el servidor en ${c.name}</h2>
  <p>${c.howto}${winLine}</p>
  ${c.howto.includes(c.file.split(' ')[0]) ? '' : `<p>Archivo: <code>${esc(c.file)}</code></p>`}
  <pre class="code"><code>${esc(c.config)}</code></pre>${extraBlock}

  <h2 id="verificar">3. Verifica la conexión</h2>
  <p>${c.verify}</p>
  <p>Luego prueba con una pregunta real:</p>
  <div class="card"><ul>
    <li>«¿Qué tareas tengo pendientes esta semana?»</li>
    <li>«¿Cuál es mi nota actual en cada curso?»</li>
    <li>«Descarga los PDFs de la última semana de clase y resúmelos.»</li>
  </ul></div>

  <h2 id="problemas">Si algo no funciona</h2>
  <p>El fallo más común es un JSON inválido: una coma de más o unas comillas sin cerrar hacen que el cliente ignore el archivo entero sin avisar. Comprueba también que <code>npx campus-cli mcp</code> arranque sin error directamente en la terminal — si ahí falla, el problema no está en ${c.name}.</p>
  <p>Si el servidor conecta pero las respuestas dicen que no estás autenticado, tu sesión expiró: vuelve a correr <code>npx campus-cli account login</code>. Y recuerda cerrar el cliente por completo antes de reabrirlo; recargar la ventana no siempre relee la configuración.</p>

  <h2 id="siguiente">Qué puedes hacer después</h2>
  <p>Las herramientas disponibles, el detalle de seguridad y las limitaciones actuales están en <a class="prose-link" href="/blackboard-mcp/">la página principal de Blackboard MCP</a>. Si prefieres consultar tu campus por comandos en vez de por chat, existe <a class="prose-link" href="/blackboard-cli/">Blackboard CLI</a>. Y para saber qué revisar cada semana antes de automatizarlo, lee <a class="prose-link" href="/blog/organizar-tu-semana-blackboard/">la guía para organizar tu semana en Blackboard sin perder fechas</a>.</p>

  <h2 id="faq">Preguntas frecuentes</h2>
${faqHtml}

  <h2 id="otros">Otros clientes</h2>
  <ul>${otherLinks}</ul>

  <aside class="related" aria-labelledby="related-title">
    <h2 id="related-title">Sigue explorando</h2>
    <p class="related__intro">Esta guía es una pieza del conector. Estas son las otras.</p>
    <ul class="related__grid">
      <li class="related__card">
        <span class="related__tag">Recurso</span>
        <h3><a href="/blackboard-mcp/">Blackboard MCP: herramientas, seguridad y límites</a></h3>
        <p>Qué puede hacer el conector, qué no, y cómo trata tu sesión de UPC.</p>
        <span class="related__go">Ver Blackboard MCP <span aria-hidden="true">&#8594;</span></span>
      </li>
      <li class="related__card">
        <span class="related__tag">Recurso</span>
        <h3><a href="/blackboard-cli/">Blackboard CLI: cursos, tareas y notas desde la terminal</a></h3>
        <p>La misma información, por comandos, sin salir de la consola.</p>
        <span class="related__go">Ver Blackboard CLI <span aria-hidden="true">&#8594;</span></span>
      </li>
      <li class="related__card">
        <span class="related__tag">Guía base</span>
        <h3><a href="/blog/chatgpt-blackboard-sin-copiar-archivos/">Cuánto tiempo pierdes copiando archivos a mano</a></h3>
        <p>El método manual frente a conectar Blackboard directo con tu asistente.</p>
        <span class="related__go">Leer la guía <span aria-hidden="true">&#8594;</span></span>
      </li>
    </ul>
  </aside>
${footerBlock}`
}

for (const c of CLIENTS) {
  const others = CLIENTS.filter((o) => o.slug !== c.slug)
  const dir = path.join(ROOT, 'blackboard-mcp', c.slug)
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), page(c, others))
  console.log('escrito', path.relative(ROOT, path.join(dir, 'index.html')))
}

// ---- Paridad en Markdown (GEO): misma URL + index.md ----
const toMd = (s) =>
  s
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<code>(.*?)<\/code>/g, '`$1`')
    .replace(/<[^>]+>/g, '')

const mdPage = (c, others) => {
  const { faqMd } = faqFor(c)
  return `# Blackboard MCP en ${c.name}: conecta tu Aula Virtual UPC

> Cómo conectar Blackboard UPC con ${c.name} usando Model Context Protocol: login, archivo de configuración, verificación y solución de problemas.

Fuente: https://campuscli.com/blackboard-mcp/${c.slug}/
Actualizado: 2026-08-06

---

## En resumen

- **Cliente:** ${c.name}.
- **Archivo de configuración:** \`${c.file}\`${c.fileWin ? ` (en Windows, \`${c.fileWin}\`)` : ''}.
- **Comando del servidor:** \`npx campus-cli mcp\` (transporte stdio).
- **Requisitos:** Node.js 18 o superior y una cuenta activa de UPC con acceso a Aula Virtual.
- **Tiempo:** unos cinco minutos, una sola vez.

## 1. Inicia sesión en tu campus

\`\`\`bash
npx campus-cli account login
\`\`\`

Se abre el navegador y encadena el login de Microsoft de UPC, con MFA si la cuenta lo pide. Si Microsoft muestra *«Stay signed in?»*, marca la casilla y acepta: así la sesión se mantiene. Todo el flujo corre en la máquina del estudiante, no pasa por ningún servidor de Campus.

## 2. Registra el servidor en ${c.name}

${toMd(c.howto)}

Archivo: \`${c.file}\`

\`\`\`${c.lang}
${c.config}
\`\`\`
${c.extra ? `\n### ${c.extraTitle}\n\n${c.extra}\n\n\`\`\`bash\n${c.extraCode}\n\`\`\`\n` : ''}
## 3. Verifica la conexión

${toMd(c.verify)}

Luego prueba con una pregunta real:

- «¿Qué tareas tengo pendientes esta semana?»
- «¿Cuál es mi nota actual en cada curso?»
- «Descarga los PDFs de la última semana de clase y resúmelos.»

## Si algo no funciona

El fallo más común es un JSON inválido: una coma de más o unas comillas sin cerrar hacen que el cliente ignore el archivo entero sin avisar. Comprueba también que \`npx campus-cli mcp\` arranque sin error directamente en la terminal — si ahí falla, el problema no está en ${c.name}.

Si el servidor conecta pero las respuestas dicen que no estás autenticado, la sesión expiró: vuelve a correr \`npx campus-cli account login\`. Y cierra el cliente por completo antes de reabrirlo; recargar la ventana no siempre relee la configuración.

## Preguntas frecuentes

${faqMd}

## Enlaces

- Herramientas, seguridad y límites: https://campuscli.com/blackboard-mcp/
- Blackboard CLI (desde la terminal): https://campuscli.com/blackboard-cli/
${others.map((o) => `- ${o.name}: https://campuscli.com/blackboard-mcp/${o.slug}/`).join('\n')}
- Código fuente: https://github.com/alejooroncoy/campus-cli
`
}

for (const c of CLIENTS) {
  const others = CLIENTS.filter((o) => o.slug !== c.slug)
  const p = path.join(ROOT, 'blackboard-mcp', c.slug, 'index.md')
  fs.writeFileSync(p, mdPage(c, others))
  console.log('escrito', path.relative(ROOT, p))
}
