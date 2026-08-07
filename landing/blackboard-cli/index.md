# Blackboard CLI: cursos, tareas y notas de UPC desde la terminal

> Cliente de línea de comandos que consulta Blackboard UPC (Aula Virtual) sin abrir el navegador: cursos, tareas con fechas, notas y descarga de materiales.

Fuente: https://campuscli.com/blackboard-cli/
Actualizado: 2026-08-06

---

## En resumen

- **Qué es:** el mismo motor que [Blackboard MCP](https://campuscli.com/blackboard-mcp/), pero por comandos en vez de por chat. Un solo login sirve para los dos modos.
- **Instalación:** `npm install -g campus-cli`, o sin instalar con `npx campus-cli`.
- **Requisitos:** Node.js 18 o superior y una cuenta activa de UPC con acceso a Aula Virtual.
- **Para quién:** quien prefiere la consola, quiere automatizar consultas con `--json`, o va a encadenar Campus con otras herramientas.
- **Código abierto:** https://github.com/alejooroncoy/campus-cli

## Instalación y primer uso

```bash
npm install -g campus-cli
campus account login
campus courses list
```

El login abre el navegador y encadena el SSO de Microsoft de UPC, con MFA si la cuenta lo pide. Corre localmente: no pasa por ningún servidor de Campus.

## Comandos principales

| Comando | Qué hace |
|---|---|
| `campus account login` | Inicia sesión y encadena el login de Blackboard. |
| `campus whoami` | Usuario activo y tiempo restante de sesión. |
| `campus status` | Sesión y versión del servidor Blackboard. |
| `campus courses list` | Lista los cursos del ciclo. |
| `campus courses contents <courseId>` | Materiales y carpetas del curso. |
| `campus courses announcements <courseId>` | Anuncios del curso. |
| `campus courses grades <courseId>` | Reporte de calificaciones del curso. |
| `campus assignments list --pending` | Tareas pendientes de todos los cursos, con fechas y notas. |
| `campus assignments submit <courseId> <assignmentId> -f tarea.pdf` | Entrega una tarea (`--draft` para guardar sin enviar). |
| `campus download-folder <courseId> <folderId> -o ./materiales/` | Descarga una carpeta completa. |
| `campus api GET /learn/api/public/v1/users/me` | Llamada directa a cualquier endpoint de Blackboard. |
| `campus mcp` | Arranca el servidor MCP por stdio. |

Los IDs de curso tienen la forma `_100001_1`. **Todos** los comandos aceptan `--json`; los spinners van a `stderr`, así que `--json 2>/dev/null` da JSON limpio para scripts.

## CLI o MCP

| Modo | Cuándo conviene |
|---|---|
| CLI | Consultas rápidas, scripts, automatización, no salir de la terminal. |
| MCP | Darle a un asistente de IA acceso al campus: «¿qué tengo pendiente esta semana?» |

Se pueden usar los dos con la misma sesión: primero `campus account login`, después el CLI a mano o el servidor MCP conectado a un cliente de IA.

## Importante

Campus es un proyecto independiente y no oficial. No está afiliado a Blackboard ni a UPC. La compatibilidad actual está enfocada en Blackboard UPC; Canvas y Moodle están en el roadmap.

## Enlaces

- Blackboard MCP (desde un asistente de IA): https://campuscli.com/blackboard-mcp/
- Comparativa de servidores MCP para Blackboard: https://campuscli.com/blackboard-mcp/alternativas/
- Guía: organizar tu semana en Blackboard sin perder fechas — https://campuscli.com/blog/organizar-tu-semana-blackboard/
- Código fuente: https://github.com/alejooroncoy/campus-cli
- Paquete npm: https://www.npmjs.com/package/campus-cli
