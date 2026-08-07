# Distribución en directorios MCP

Los sitios que hoy ganan la búsqueda "Blackboard MCP" (Composio, MCP Market, PulseMCP,
Glama) no rankean por autoridad de producto: rankean porque son agregadores con crawl
diario. Prueba: `nitsuah/bb-mcp` tiene 2 estrellas, ningún topic y ninguna web, y aparece
en PulseMCP y MCP Market. La vía barata no es pelearles la SERP, es estar dentro de ellos.

Cada registro suma un backlink y, más importante, tráfico cualificado y presencia en las
fuentes que los propios LLM citan cuando alguien pregunta "¿hay un MCP de Blackboard?".

## Estado

- [x] Topics y `homepage` del repo de GitHub.
- [x] `server.json` en la raíz del repo (formato del registro oficial).
- [x] `mcpName` en `package.json` — **requiere republicar en npm** para que el registro
      oficial pueda validar la propiedad del paquete.
- [ ] Publicar en el registro oficial de MCP.
- [ ] Enviar a los directorios de la lista de abajo.

## Registro oficial (hacer primero)

El registro oficial alimenta a varios de los demás directorios, así que conviene empezar aquí.

```bash
npm publish                 # necesario: la 1.3.1 publicada aún no lleva mcpName
brew install mcp-publisher  # o el binario desde github.com/modelcontextprotocol/registry
mcp-publisher login github  # autentica el namespace io.github.alejooroncoy
mcp-publisher publish       # lee ./server.json
```

El namespace elegido es `io.github.alejooroncoy/campus-cli` porque se valida con la propia
cuenta de GitHub. Si más adelante se quiere `com.campuscli/...`, hay que probar el dominio
por DNS TXT.

## Directorios

| Directorio | Cómo se envía | Notas |
|---|---|---|
| PulseMCP | Formulario en pulsemcp.com/submit | Uno de los tres que hoy rankean arriba |
| MCP Market | Formulario en mcpmarket.com | Ídem |
| Glama | Detecta repos con topic `mcp-server`; se puede forzar desde glama.ai/mcp/servers | Ya tenemos el topic |
| Smithery | smithery.ai — conecta el repo de GitHub | Pide que el server arranque en su sandbox |
| LobeHub | lobehub.com/mcp — envío por formulario | Tráfico alto en Asia |
| mcp.so | Formulario | |
| awesome-mcp-servers (punkpeye) | Pull request al README | Revisar la categoría "Education" |
| mcpservers.org | Pull request | |
| Cline / Continue marketplaces | PR a su índice | Público desarrollador |

## Texto listo para pegar

**Nombre:** Campus (campus-cli)

**Una línea:** Unofficial Blackboard Learn MCP server for students — courses, assignments,
grades, feedback and course materials, using the student's own campus session.

**Descripción larga:**

> campus-cli exposes a student's Blackboard Learn account to any MCP client: courses,
> assignments with due dates, grades and instructor feedback, announcements, course
> contents and file downloads, plus draft-saving and confirmed submission of assignments.
> Unlike institutional Blackboard integrations, it needs no OAuth developer key from the
> university — it authenticates with the student's own SSO session, locally, and never
> stores the password. Currently implemented for UPC (Peru); Canvas and Moodle are on the
> roadmap. Ships as a CLI too, so the same data is available from the terminal.

**Categorías:** Education · Productivity · Developer tools

**Tags:** blackboard, blackboard-learn, lms, education, university, students, grades,
assignments, canvas, moodle

**Instalación:**

```json
{ "mcpServers": { "campus": { "command": "npx", "args": ["campus-cli", "mcp"] } } }
```

**Enlaces:** https://campuscli.com/blackboard-mcp/ · https://github.com/alejooroncoy/campus-cli ·
https://www.npmjs.com/package/campus-cli

## Después de los directorios

Lo que más mueve la aguja en descubrimiento por IA (ChatGPT, Claude, Perplexity) no es el
ranking clásico sino aparecer en las fuentes que esos modelos leen: GitHub, los directorios
de arriba, r/mcp y un post técnico propio. Ese es el siguiente bloque de trabajo.
