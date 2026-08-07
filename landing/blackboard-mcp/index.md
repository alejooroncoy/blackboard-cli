# Blackboard MCP para UPC: conecta tu Aula Virtual con tu asistente de IA

> Servidor MCP que expone Blackboard Learn (UPC Aula Virtual) a asistentes compatibles con Model Context Protocol: cursos, tareas, notas, anuncios y materiales, sin copiar nada a mano.

Fuente: https://campuscli.com/blackboard-mcp/
Actualizado: 2026-08-06

---

## En resumen

- **Qué es:** un servidor MCP que expone Blackboard Learn como herramientas estándar, para que un asistente de IA consulte el campus por el estudiante. Se instala con `npx campus-cli mcp`.
- **Para quién:** estudiantes. A diferencia de las integraciones institucionales de Blackboard, **no necesita credenciales OAuth del administrador del LMS**: usa la propia sesión de Aula Virtual del estudiante.
- **Qué expone:** 19 herramientas `blackboard_*` — cursos, tareas con fechas, notas, feedback del profesor, anuncios, materiales, descargas, borradores y entrega con confirmación.
- **Dónde funciona:** Claude Desktop, Claude Code, Cursor, GitHub Copilot, OpenAI Codex CLI y Windsurf. Corre localmente por `stdio`.
- **Alcance actual:** Blackboard UPC (Perú). Canvas y Moodle están en el roadmap. Proyecto independiente, no afiliado a UPC ni a Blackboard.

## Qué es Blackboard MCP

Model Context Protocol (MCP) es un estándar abierto que define cómo un asistente de IA descubre y usa herramientas externas. Un **servidor MCP de Blackboard** traduce la API de Blackboard Learn a esas herramientas, de modo que el asistente pueda pedir «los cursos de este estudiante» o «las tareas pendientes de este curso» y recibir datos estructurados en vez de HTML.

Campus es un servidor MCP de Blackboard hecho para el estudiante, no para el administrador de la plataforma. No hace falta que la universidad entregue credenciales de API: se usa la sesión de Aula Virtual de siempre.

Nota de desambiguación: en el ecosistema MCP también existe el *patrón blackboard*, una técnica de memoria compartida entre agentes. No tiene relación con Blackboard Learn, el LMS. Esta página trata del LMS.

## Qué puedes preguntar

- «¿Qué tareas tengo pendientes esta semana y cuáles pesan más?»
- «¿Cuál es mi nota actual en Arquitectura de Software y qué me falta?»
- «Descarga los PDFs de la semana 8 de Finanzas y resúmelos.»
- «¿Qué anunció el profesor de Bases de Datos desde el lunes?»
- «Lee el enunciado del trabajo parcial y dime qué me falta cubrir.»

La diferencia con copiar y pegar en el chat es que el asistente abre el material él mismo.

## Cómo conectarlo en 3 pasos

Requisitos: Node.js 18 o superior, una cuenta activa de UPC con acceso a Aula Virtual y un cliente compatible con MCP. Toma unos cinco minutos, una sola vez.

1. **Inicia sesión.** En la terminal: `npx campus-cli account login`. Se abre el navegador con el SSO de Microsoft de UPC, incluido MFA si la cuenta lo pide.
2. **Registra el servidor** en el archivo de configuración del cliente de IA.
3. **Reinicia el cliente y pregunta** en lenguaje natural.

Configuración mínima, común a todos los clientes:

```json
{
  "mcpServers": {
    "campus": {
      "command": "npx",
      "args": ["campus-cli", "mcp"]
    }
  }
}
```

## Guías por cliente

| Cliente | Archivo de configuración | Guía |
|---|---|---|
| Claude Desktop | `~/Library/Application Support/Claude/claude_desktop_config.json` | https://campuscli.com/blackboard-mcp/claude-desktop/ |
| Claude Code | `.mcp.json` | https://campuscli.com/blackboard-mcp/claude-code/ |
| Cursor | `~/.cursor/mcp.json` | https://campuscli.com/blackboard-mcp/cursor/ |
| GitHub Copilot (VS Code) | `.vscode/mcp.json` | https://campuscli.com/blackboard-mcp/github-copilot/ |
| OpenAI Codex CLI | `~/.codex/config.toml` | https://campuscli.com/blackboard-mcp/codex/ |
| Windsurf | `~/.codeium/windsurf/mcp_config.json` | https://campuscli.com/blackboard-mcp/windsurf/ |

## Herramientas disponibles

Todas llevan el prefijo `blackboard_` para no chocar con futuros conectores de Canvas o Moodle.

| Herramienta | Qué hace |
|---|---|
| `blackboard_whoami` | Confirma qué cuenta está autenticada. |
| `blackboard_list_courses` | Lista los cursos del ciclo. |
| `blackboard_get_course` | Detalle de un curso concreto. |
| `blackboard_list_contents` | Recorre materiales y carpetas del curso. |
| `blackboard_list_announcements` | Anuncios publicados por el profesor. |
| `blackboard_list_assignments` | Tareas con fecha de entrega, peso y nota. |
| `blackboard_list_attempts` | Historial de entregas de una actividad. |
| `blackboard_get_grades` | Reporte completo de notas del curso. |
| `blackboard_get_assignment_feedback` | Puntajes, comentarios y archivos de feedback del profesor. |
| `blackboard_list_attachments` | Archivos adjuntos dentro de un contenido. |
| `blackboard_download_attachment` | Descarga un archivo al equipo. |
| `blackboard_upload_attempt_file` | Sube un archivo local para adjuntarlo a una entrega. |
| `blackboard_save_attempt_draft` | Guarda un borrador sin enviarlo; el intento queda abierto. |
| `blackboard_submit_attempt` | Envía la entrega final. Siempre pide confirmación antes. |
| `blackboard_system_version` | Versión del servidor Blackboard. |
| `blackboard_list_people` | Docentes y compañeros del curso; resuelve un id interno a un nombre real. |
| `blackboard_download_file_url` | Descarga un archivo directamente desde una URL bbcswebdav de Blackboard. |
| `blackboard_download_feedback_file` | Descarga un archivo de feedback que el profesor adjuntó a una nota. Experimental. |
| `blackboard_raw_api` | Cualquier otro endpoint de la API de Blackboard. |

## Seguridad y privacidad

El login corre en la máquina del estudiante: se abre el flujo estándar de Microsoft SSO en un navegador real, el estudiante escribe sus credenciales ahí y completa MFA como siempre. Campus no ve ni almacena la contraseña de UPC. Lo que queda en el equipo es una sesión, revocable.

El servidor MCP corre localmente por `stdio`: los datos del campus viajan entre el equipo y Blackboard, no a través de un servidor intermedio de Campus. El envío de una entrega nunca ocurre en silencio — `blackboard_submit_attempt` exige confirmación explícita, mientras que guardar un borrador no la necesita.

## Qué no hace

Campus no reemplaza al Aula Virtual: el campus institucional sigue siendo la fuente oficial y la única válida para plazos y calificaciones. No resuelve las tareas, no envía nada sin autorización y hoy no soporta los cuestionarios interactivos de Blackboard Ultra, solo las entregas de archivo, texto o enlace. Canvas y Moodle todavía no están implementados.

## Campus frente a una integración genérica de Blackboard

Existen otros servidores MCP para Blackboard Learn, pensados para instituciones: envuelven la API oficial y necesitan credenciales OAuth2 emitidas por el administrador del LMS, con roles de docente o de sistema. Son útiles para el equipo de TI de una universidad y sirven de poco a un estudiante, que nunca va a recibir esas llaves.

Campus parte del lado contrario: empieza por la sesión que el estudiante ya tiene y por el flujo real de la semana — qué debo entregar, cuánto llevo, qué material necesito leer.

## Preguntas frecuentes

**¿Qué es Blackboard MCP?**
Un servidor que expone Blackboard Learn como herramientas estándar de Model Context Protocol, para que un asistente de IA compatible las use en una conversación normal.

**¿Con qué asistentes funciona?**
Con cualquier cliente compatible con MCP: Claude Desktop, Claude Code, Cursor, GitHub Copilot en VS Code, OpenAI Codex CLI y Windsurf, entre otros.

**¿Guardan mi contraseña de UPC?**
No. El login usa el flujo normal de Microsoft SSO en el navegador, de forma local. Queda guardada una sesión, no la contraseña.

**¿Puede entregar tareas por mí?**
Puede subir archivos y guardar borradores. El envío final siempre pide confirmación explícita.

**¿Necesito saber programar?**
No para usarlo. Se pega un bloque de configuración una vez y después se pregunta en lenguaje natural.

**¿Funciona en otras universidades?**
Hoy solo Blackboard UPC está implementado. Canvas y Moodle están en el roadmap.

**¿Es gratis?**
El código es abierto, en GitHub (https://github.com/alejooroncoy/campus-cli) y npm (https://www.npmjs.com/package/campus-cli). El acceso anticipado acompañado, con soporte directo, cuesta S/20 por dos meses.

**¿Campus está afiliado a Blackboard o UPC?**
No. Campus es un proyecto independiente y no oficial, compatible hoy con Blackboard UPC.

## Enlaces

- Blackboard CLI (misma información desde la terminal): https://campuscli.com/blackboard-cli/
- Guía: organizar tu semana en Blackboard sin perder fechas — https://campuscli.com/blog/organizar-tu-semana-blackboard/
- Guía: cuánto tiempo pierdes copiando archivos a ChatGPT a mano — https://campuscli.com/blog/chatgpt-blackboard-sin-copiar-archivos/
- Código fuente: https://github.com/alejooroncoy/campus-cli
- Paquete npm: https://www.npmjs.com/package/campus-cli
