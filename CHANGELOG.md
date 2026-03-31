# Changelog

All notable changes to `blackboard-upc` will be documented here.

---

## [1.0.5] — 2026-03-31

### Fixed
- `run.js` ahora prepone el directorio del Node que lo ejecuta al PATH antes de lanzar `tsx`
- Soluciona el crash en MCP cuando el usuario tiene nvm con Node 16 como default (Playwright requiere >=18)

---

## [1.0.4] — 2026-03-30

### Changed
- `download_attachment` y `download_file_url` ya no devuelven base64 — guardan el archivo directamente a disco
- Directorio por defecto: `process.cwd()` (donde el usuario está trabajando), configurable con `outputDir`
- Pasar `filename` (el `displayName` de `list_attachments`) para guardar con el nombre correcto
- Respuesta devuelve `{ saved, size, mimeType }` — sin datos en el contexto

---

## [1.0.3] — 2026-03-30

### Changed
- Todos los tools MCP migrados de `server.tool()` a `server.registerTool()` (API nueva del SDK v1.28+)
- Elimina todos los warnings de TypeScript por uso de API deprecada

---

## [1.0.2] — 2026-03-30

### Fixed
- `list_attachments` — fallback automático a parseo del HTML del `body` para contenido tipo `x-bb-document` y `x-bb-lesson` (antes retornaba 400 en estos casos)
- `download_attachment` — ahora acepta URLs directas de `bbcswebdav` además de IDs estándar de Blackboard

### Added
- `download_file_url` (MCP) — nueva herramienta para descargar archivos embebidos directamente desde URLs de `bbcswebdav` con las cookies de sesión autenticadas
- Todos los tools de descarga ahora retornan `filename`, `mimeType` y `size` junto al contenido `base64`

---

## [1.0.1] — 2026-03-30

### Added
- `courses members <courseId>` — lista compañeros e instructor de un curso (con `--role` y `--json`)

### Improved
- `courses list` — usa `expand=course` en una sola llamada en vez de 1+N (antes: 1 llamada por curso)
- `assignments list` — usa bulk grades (`/gradebook/users/{id}`) en paralelo con columns, eliminando N llamadas individuales
- `courses members` — usa `expand=user` para traer nombres en una sola llamada

---

## [1.0.0] — 2026-03-30

### Added

#### Autenticación
- Login via **SAML SSO → Microsoft Azure AD** con Playwright (ventana del browser)
- Sesión persistida en `~/.blackboard-cli/session.json` (TTL 8h, permisos 600)
- Comandos `login`, `logout`, `whoami`, `status`

#### Cursos
- `courses list` — cursos inscritos con nombre, rol, estado y último acceso
- `courses get <id>` — detalle de un curso
- `courses contents <id>` — árbol de contenido navegable por carpetas
- `courses contents --type file|folder|assignment|document` — filtro por tipo
- `courses announcements <id>` — anuncios del curso
- `courses grades <id>` — notas del ciclo

#### Tareas
- `assignments list <id>` — tareas con fecha de entrega, nota actual y alertas de color
- `assignments list --pending` — solo las pendientes de entrega
- `assignments attempts <id> <columnId>` — historial de entregas
- `assignments submit` — entregar tarea con archivo (`-f`), texto (`-t`) o borrador (`--draft`)

#### Descargas
- `download <courseId> <contentId>` — descargar archivo adjunto individual
- `download-folder <courseId> <folderId>` — descarga recursiva de toda una carpeta
- `download-folder --filter <keyword>` — filtrar por nombre de archivo

#### API & Developer experience
- `api <METHOD> <path>` — passthrough a cualquier endpoint de la REST API
- `endpoints` — catálogo documentado de 22+ endpoints con parámetros
- Todos los comandos aceptan `--json` con spinners redirigidos a `stderr`

#### MCP Server
- Comando `mcp` — inicia un servidor MCP (stdio) para Claude Code y Claude Desktop
- 13 herramientas: `whoami`, `list_courses`, `get_course`, `list_contents`,
  `list_announcements`, `list_assignments`, `list_attempts`, `get_grades`,
  `list_attachments`, `download_attachment`, `submit_attempt`, `raw_api`, `system_version`
- `CLAUDE.md` — guía de comportamiento para agentes IA

#### UI
- Banner ASCII con color rojo UPC (`#E31837`)
- Prompt "¿Qué puedo hacer ahora?" tras login exitoso
- Paleta semántica: `ok` (verde), `fail` (rojo), `warn` (amarillo), `hint` (cyan)

---

## Roadmap

- [x] `npx` install sin clonar repo (publicación en npm)
- [ ] Refresh automático de sesión antes de expirar
- [ ] Notificaciones de entregas próximas (`assignments due`)
- [ ] Descarga de videos de grabaciones de clase
- [ ] Soporte para múltiples cuentas / ciclos simultáneos
