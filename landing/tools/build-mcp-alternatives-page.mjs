import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Raíz del sitio, relativa a este archivo (landing/tools/ -> landing/)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const base = fs.readFileSync(path.join(ROOT, 'blackboard-mcp/index.html'), 'utf8')


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

const url = 'https://campuscli.com/blackboard-mcp/alternativas/'
const title = 'Servidores MCP para Blackboard: qué opciones existen (2026)'
const desc = 'Comparación de los servidores MCP que conectan Blackboard Learn con asistentes de IA: institucionales, de estudiante y el patrón blackboard (que no es el LMS). Qué requiere cada uno y para quién sirve.'

// Una sola fuente: de aquí salen el JSON-LD, el HTML visible y el Markdown.
// El schema no puede declarar preguntas que no estén en la página.
const stripTags = (t) => t.replace(/<[^>]+>/g, '')
const FAQS = [
  ['¿Cuántos tipos de servidor MCP de Blackboard existen?',
   'Tres, más un homónimo. Los institucionales envuelven la API oficial y requieren credenciales OAuth2 del administrador del LMS. Los de estudiante usan la sesión del propio alumno. Los proyectos por universidad son conectores personales, normalmente sin mantenimiento. Y aparte está el <em>patrón blackboard</em>, una técnica de memoria compartida entre agentes que no tiene relación con Blackboard Learn.'],
  ['¿Puede un estudiante usar un servidor MCP institucional de Blackboard?',
   'En la práctica no. Requieren una <em>developer key</em> emitida por el administrador del LMS, con rol de docente o de sistema.'],
  ['¿Qué es el patrón blackboard en MCP?',
   'Es una arquitectura de coordinación entre varios agentes de IA que comparten una pizarra común de hechos. No tiene ninguna relación con Blackboard Learn, el sistema de gestión de aprendizaje. Comparten el nombre y nada más.'],
  ['¿Cuál conviene para consultar mis notas y tareas?',
   'Uno de estudiante, que autentique con tu propia sesión. Campus es la opción implementada para Blackboard UPC.'],
  ['¿Qué pasa si mi universidad no está soportada?',
   'Hoy solo Blackboard UPC está implementado. Canvas y Moodle están en el roadmap, y el repositorio acepta issues para coordinar soporte de otras universidades.'],
  ['¿Esta comparativa es imparcial?',
   'Campus es nuestro proyecto, así que juzga en consecuencia. Los proyectos que mencionamos están enlazados en la tabla para que compruebes tú mismo lo que decimos de ellos.'],
]

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(([q, a]) => ({
    '@type': 'Question',
    name: q,
    acceptedAnswer: { '@type': 'Answer', text: stripTags(a) },
  })),
}
const faqHtml = FAQS.map(([q, a]) => `  <h3>${q}</h3><p>${a}</p>`).join('\n')
const faqMd = FAQS.map(([q, a]) => `**${q}**\n\n${stripTags(a)}`).join('\n\n')

const crumbLd = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Inicio', item: 'https://campuscli.com/' },
    { '@type': 'ListItem', position: 2, name: 'Blackboard MCP', item: 'https://campuscli.com/blackboard-mcp/' },
    { '@type': 'ListItem', position: 3, name: 'Alternativas', item: url },
  ],
}

const articleLd = {
  '@context': 'https://schema.org',
  '@type': 'TechArticle',
  headline: title,
  description: desc,
  inLanguage: 'es',
  datePublished: '2026-08-06',
  dateModified: '2026-08-06',
  author: { '@type': 'Person', name: 'Alejandro Oroncoy' },
  publisher: { '@type': 'Organization', name: 'Campus', url: 'https://campuscli.com/' },
  mainEntityOfPage: url,
}

const html = `<!doctype html>
<!-- Generado por landing/tools/build.mjs — no edites este archivo a mano.
     El contenido compartido sale de blackboard-mcp/index.html. -->
<html lang="es"><head>
  <meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title} | Campus</title>
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
  <meta property="og:image:alt" content="Comparación de servidores MCP para Blackboard" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${desc}" />
  <meta name="twitter:image" content="https://campuscli.com/assets/og-default.jpg" />
  ${styleBlock}
  <script type="application/ld+json">${JSON.stringify(articleLd)}</script>
  <script type="application/ld+json">${JSON.stringify(crumbLd)}</script>
  <script type="application/ld+json">${JSON.stringify(faqLd)}</script>
</head>${headerBlock}
  <nav class="crumbs" aria-label="Ruta de navegación"><ol><li><a href="/">Inicio</a></li><li><a href="/blackboard-mcp/">Blackboard MCP</a></li><li aria-current="page">Alternativas</li></ol></nav>
  <p class="eyebrow">Comparativa</p><h1>Servidores MCP para Blackboard: qué opciones existen.</h1>
  <p>«Blackboard MCP» devuelve resultados de cosas muy distintas, y varias no sirven para lo que la mayoría busca. Esta página ordena el panorama: qué tipos hay, qué exige cada uno y para quién sirve. Incluye a Campus, que es nuestro proyecto — lo decimos por delante.</p>

  <h2 id="resumen">En resumen</h2>
  <div class="card"><ul>
    <li>Hay <strong>tres tipos de servidor MCP de Blackboard</strong>, más un homónimo que no tiene relación con el LMS.</li>
    <li>Los <strong>institucionales</strong> (Composio, bb-mcp) requieren una <em>developer key</em> de Blackboard emitida por el administrador del LMS. Un estudiante no la va a conseguir.</li>
    <li>Los <strong>de estudiante</strong> autentican con la sesión del propio alumno. Es la única vía practicable sin permiso de la universidad.</li>
    <li>Los <strong>proyectos por universidad</strong> que aparecen en GitHub suelen ser de un fin de semana y quedan sin mantenimiento.</li>
    <li>El <strong>patrón blackboard</strong> es memoria compartida entre agentes de IA. Comparte nombre con el LMS y nada más.</li>
  </ul></div>

  <h2 id="tipos">Los cuatro grupos</h2>
  <div class="table-wrap"><table>
    <thead><tr><th scope="col">Tipo</th><th scope="col">Ejemplos</th><th scope="col">Qué exige</th><th scope="col">Para quién</th></tr></thead>
    <tbody>
      <tr><td><strong>Institucional</strong></td><td><a class="prose-link" href="https://composio.dev/toolkits/blackboard" rel="noreferrer nofollow">Composio</a>, <a class="prose-link" href="https://github.com/nitsuah/bb-mcp" rel="noreferrer nofollow"><code>nitsuah/bb-mcp</code></a></td><td>Credenciales OAuth2 y rol de docente o de sistema en el LMS</td><td>Equipos de TI, universidades, docentes con permisos</td></tr>
      <tr><td><strong>De estudiante</strong></td><td>Campus (este proyecto)</td><td>La sesión SSO del propio alumno</td><td>Estudiantes</td></tr>
      <tr><td><strong>Por universidad</strong></td><td><a class="prose-link" href="https://github.com/Pkuzc12/pku-blackboard-mcp" rel="noreferrer nofollow"><code>pku-blackboard-mcp</code></a>, <a class="prose-link" href="https://github.com/sal2049/uoh-blackboard-mcp" rel="noreferrer nofollow"><code>uoh-blackboard-mcp</code></a> y similares</td><td>Clonar el repo y adaptarlo a mano</td><td>El autor y poco más</td></tr>
      <tr><td><strong>Patrón blackboard</strong></td><td><a class="prose-link" href="https://github.com/Vaskrokodile/parallax" rel="noreferrer nofollow"><code>parallax</code></a>, <a class="prose-link" href="https://github.com/samcsta/agent-blackboard-mcp" rel="noreferrer nofollow"><code>agent-blackboard-mcp</code></a></td><td>Nada relacionado con un LMS</td><td>Quien coordina varios agentes de IA</td></tr>
    </tbody>
  </table></div>

  <h2 id="institucionales">Servidores institucionales</h2>
  <p>Son envoltorios de la API REST oficial de Blackboard Learn. Están bien construidos y cubren mucho: gestión de anuncios, copia de cursos, libro de calificaciones completo, control de acceso por rol. Composio, por ejemplo, expone cientos de operaciones y se integra con más de una docena de frameworks.</p>
  <p>El obstáculo no es técnico sino de permisos. Para funcionar necesitan una clave de desarrollador que el administrador del LMS debe emitir y asociar a un rol con privilegios. Si eres estudiante, esa puerta está cerrada: no es una limitación del software, es cómo funciona la seguridad de Blackboard. Si eres el área de TI de una universidad y quieres automatizar tareas internas, en cambio, es exactamente lo que buscas.</p>

  <h2 id="estudiante">Servidores de estudiante</h2>
  <p>Parten del lado opuesto: en vez de pedir credenciales de API, usan la sesión con la que el alumno entra a su campus todos los días. El login pasa por el flujo normal de SSO de la universidad, en el navegador del propio estudiante, con MFA incluido.</p>
  <p>Campus es el que mantenemos nosotros. Hoy implementa Blackboard UPC (Perú), está publicado en npm, expone diecinueve herramientas <code>blackboard_*</code> y trae guías de configuración para seis clientes. Canvas y Moodle están en el roadmap. Los detalles completos están en <a class="prose-link" href="/blackboard-mcp/">la página de Blackboard MCP</a>.</p>
  <p>Este enfoque tiene un límite honesto: depende de que la universidad concreta esté implementada. Un servidor institucional funciona contra cualquier instancia de Blackboard con las llaves correctas; uno de estudiante tiene que resolver el SSO de cada universidad por separado, y esa es la parte laboriosa.</p>

  <h2 id="por-universidad">Proyectos por universidad</h2>
  <p>Cada pocos meses aparece en GitHub un repositorio nuevo del estilo <code>&lt;universidad&gt;-blackboard-mcp</code>: alguien se cansa de su Aula Virtual y construye su propio conector. Revisamos los enlazados arriba en agosto de 2026 y el patrón era constante — historial de dos o tres días, ninguna publicación en un registro de paquetes, sin documentación de instalación y sin actividad posterior.</p>
  <p>Son útiles como referencia si vas a escribir el tuyo. No lo son como herramienta que puedas instalar y esperar que siga funcionando el ciclo que viene, porque cuando la universidad cambia algo del login, nadie lo arregla.</p>

  <h2 id="patron">El patrón blackboard no es Blackboard Learn</h2>
  <p>Esta es la confusión más común y conviene dejarla clara. En arquitectura de sistemas multiagente, el <em>blackboard pattern</em> es una técnica en la que varios agentes escriben y leen hechos sobre una «pizarra» compartida para coordinarse. Existen varios servidores MCP que la implementan, y son buenos en lo suyo.</p>
  <p>No tienen absolutamente ninguna relación con Blackboard Learn, el sistema de gestión de aprendizaje que usan las universidades. Si buscabas consultar tus notas y llegaste a uno de esos repositorios, no te has equivocado de búsqueda: la palabra está sobrecargada.</p>

  <h2 id="elegir">Cómo elegir</h2>
  <p>La pregunta útil no es cuál es mejor sino qué credenciales tienes. Si administras el LMS o eres docente con permisos, un servidor institucional te da más cobertura. Si eres estudiante, la única vía practicable es uno que autentique con tu sesión, y entonces la pregunta pasa a ser si tu universidad está implementada.</p>
  <p>Y si lo que quieres es coordinar agentes de IA entre sí, ninguno de los dos: busca el patrón blackboard.</p>

  <h2 id="faq">Preguntas frecuentes</h2>
${faqHtml}

  <aside class="related" aria-labelledby="related-title">
    <h2 id="related-title">Sigue explorando</h2>
    <p class="related__intro">Si ya tienes claro qué tipo necesitas, estos son los siguientes pasos.</p>
    <ul class="related__grid">
      <li class="related__card">
        <span class="related__tag">Recurso</span>
        <h3><a href="/blackboard-mcp/">Blackboard MCP: herramientas, seguridad y límites</a></h3>
        <p>Qué expone Campus, cómo trata tu sesión y qué no hace.</p>
        <span class="related__go">Ver Blackboard MCP <span aria-hidden="true">&#8594;</span></span>
      </li>
      <li class="related__card">
        <span class="related__tag">Guía</span>
        <h3><a href="/blackboard-mcp/claude-desktop/">Conectarlo con Claude Desktop</a></h3>
        <p>La configuración concreta, paso a paso, en cinco minutos.</p>
        <span class="related__go">Ver la guía <span aria-hidden="true">&#8594;</span></span>
      </li>
      <li class="related__card">
        <span class="related__tag">Recurso</span>
        <h3><a href="/blackboard-cli/">Blackboard CLI: desde la terminal</a></h3>
        <p>La misma información por comandos, sin pasar por un chat.</p>
        <span class="related__go">Ver Blackboard CLI <span aria-hidden="true">&#8594;</span></span>
      </li>
    </ul>
  </aside>
${footerBlock}`

const md = `# Servidores MCP para Blackboard: qué opciones existen (2026)

> Comparación de los servidores MCP que conectan Blackboard Learn con asistentes de IA: institucionales, de estudiante, proyectos por universidad y el patrón blackboard (que no es el LMS).

Fuente: ${url}
Actualizado: 2026-08-06
Aviso: Campus, uno de los proyectos comparados, es nuestro.

---

## En resumen

- Hay **tres tipos de servidor MCP de Blackboard**, más un homónimo que no tiene relación con el LMS.
- Los **institucionales** (Composio, bb-mcp) requieren una *developer key* de Blackboard emitida por el administrador del LMS. Un estudiante no la va a conseguir.
- Los **de estudiante** autentican con la sesión del propio alumno. Es la única vía practicable sin permiso de la universidad.
- Los **proyectos por universidad** que aparecen en GitHub suelen ser de un fin de semana y quedan sin mantenimiento.
- El **patrón blackboard** es memoria compartida entre agentes de IA. Comparte nombre con el LMS y nada más.

## Los cuatro grupos

| Tipo | Ejemplos | Qué exige | Para quién |
|---|---|---|---|
| Institucional | [Composio](https://composio.dev/toolkits/blackboard), [nitsuah/bb-mcp](https://github.com/nitsuah/bb-mcp) | Credenciales OAuth2 y rol de docente o de sistema en el LMS | Equipos de TI, universidades, docentes con permisos |
| De estudiante | Campus | La sesión SSO del propio alumno | Estudiantes |
| Por universidad | [pku-blackboard-mcp](https://github.com/Pkuzc12/pku-blackboard-mcp), [uoh-blackboard-mcp](https://github.com/sal2049/uoh-blackboard-mcp) y similares | Clonar el repo y adaptarlo a mano | El autor y poco más |
| Patrón blackboard | [parallax](https://github.com/Vaskrokodile/parallax), [agent-blackboard-mcp](https://github.com/samcsta/agent-blackboard-mcp) | Nada relacionado con un LMS | Quien coordina varios agentes de IA |

## Servidores institucionales

Son envoltorios de la API REST oficial de Blackboard Learn. Están bien construidos y cubren mucho: gestión de anuncios, copia de cursos, libro de calificaciones completo, control de acceso por rol.

El obstáculo no es técnico sino de permisos: necesitan una clave de desarrollador que el administrador del LMS debe emitir y asociar a un rol con privilegios. Para un estudiante esa puerta está cerrada. Para el área de TI de una universidad, es exactamente lo que busca.

## Servidores de estudiante

Usan la sesión con la que el alumno entra a su campus todos los días. El login pasa por el flujo normal de SSO de la universidad, en el navegador del propio estudiante, con MFA incluido.

Campus es el que mantenemos nosotros: hoy implementa Blackboard UPC (Perú), está publicado en npm, expone diecinueve herramientas \`blackboard_*\` y trae guías para seis clientes MCP. Canvas y Moodle están en el roadmap.

Límite honesto de este enfoque: depende de que la universidad concreta esté implementada. Un servidor institucional funciona contra cualquier instancia de Blackboard con las llaves correctas; uno de estudiante tiene que resolver el SSO de cada universidad por separado.

## Proyectos por universidad

Cada pocos meses aparece en GitHub un repositorio del estilo \`<universidad>-blackboard-mcp\`. Revisamos los enlazados arriba en agosto de 2026 y el patrón era constante: historial de dos o tres días, ninguna publicación en un registro de paquetes, sin documentación de instalación y sin actividad posterior.

Útiles como referencia si vas a escribir el tuyo; no como herramienta que siga funcionando el ciclo que viene.

## El patrón blackboard no es Blackboard Learn

En arquitectura de sistemas multiagente, el *blackboard pattern* es una técnica en la que varios agentes escriben y leen hechos sobre una pizarra compartida para coordinarse. Existen varios servidores MCP que la implementan.

No tienen ninguna relación con Blackboard Learn, el LMS que usan las universidades. Comparten el nombre y nada más.

## Cómo elegir

La pregunta útil no es cuál es mejor sino qué credenciales tienes. Si administras el LMS o eres docente con permisos, un servidor institucional da más cobertura. Si eres estudiante, la única vía practicable es uno que autentique con tu sesión, y entonces la pregunta pasa a ser si tu universidad está implementada. Si lo que quieres es coordinar agentes de IA entre sí, ninguno de los dos: busca el patrón blackboard.

## Preguntas frecuentes

${faqMd}

## Enlaces

- Blackboard MCP de Campus: https://campuscli.com/blackboard-mcp/
- Guías por cliente: https://campuscli.com/blackboard-mcp/claude-desktop/
- Blackboard CLI: https://campuscli.com/blackboard-cli/
- Código fuente: https://github.com/alejooroncoy/campus-cli
`

const dir = path.join(ROOT, 'blackboard-mcp/alternativas')
fs.mkdirSync(dir, { recursive: true })
fs.writeFileSync(path.join(dir, 'index.html'), html)
fs.writeFileSync(path.join(dir, 'index.md'), md)
console.log('escrito blackboard-mcp/alternativas/{index.html,index.md}')
