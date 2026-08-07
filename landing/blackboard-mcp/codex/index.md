# Blackboard MCP en OpenAI Codex CLI: conecta tu Aula Virtual UPC

> Cómo conectar Blackboard UPC con OpenAI Codex CLI usando Model Context Protocol: login, archivo de configuración, verificación y solución de problemas.

Fuente: https://campuscli.com/blackboard-mcp/codex/
Actualizado: 2026-08-06

---

## En resumen

- **Cliente:** OpenAI Codex CLI.
- **Archivo de configuración:** `~/.codex/config.toml`.
- **Comando del servidor:** `npx campus-cli mcp` (transporte stdio).
- **Requisitos:** Node.js 18 o superior y una cuenta activa de UPC con acceso a Aula Virtual.
- **Tiempo:** unos cinco minutos, una sola vez.

## 1. Inicia sesión en tu campus

```bash
npx campus-cli account login
```

Se abre el navegador y encadena el login de Microsoft de UPC, con MFA si la cuenta lo pide. Si Microsoft muestra *«Stay signed in?»*, marca la casilla y acepta: así la sesión se mantiene. Todo el flujo corre en la máquina del estudiante, no pasa por ningún servidor de Campus.

## 2. Registra el servidor en OpenAI Codex CLI

Agrega la sección al final de `~/.codex/config.toml`. Aquí la configuración es TOML, no JSON.

Archivo: `~/.codex/config.toml`

```toml
[mcp_servers.campus]
command = "npx"
args = ["campus-cli", "mcp"]
```

## 3. Verifica la conexión

Inicia `codex` y pide la lista de herramientas disponibles: deben figurar las `blackboard_*`.

Luego prueba con una pregunta real:

- «¿Qué tareas tengo pendientes esta semana?»
- «¿Cuál es mi nota actual en cada curso?»
- «Descarga los PDFs de la última semana de clase y resúmelos.»

## Si algo no funciona

El fallo más común es un JSON inválido: una coma de más o unas comillas sin cerrar hacen que el cliente ignore el archivo entero sin avisar. Comprueba también que `npx campus-cli mcp` arranque sin error directamente en la terminal — si ahí falla, el problema no está en OpenAI Codex CLI.

Si el servidor conecta pero las respuestas dicen que no estás autenticado, la sesión expiró: vuelve a correr `npx campus-cli account login`. Y cierra el cliente por completo antes de reabrirlo; recargar la ventana no siempre relee la configuración.

## Enlaces

- Herramientas, seguridad y límites: https://campuscli.com/blackboard-mcp/
- Blackboard CLI (desde la terminal): https://campuscli.com/blackboard-cli/
- Claude Desktop: https://campuscli.com/blackboard-mcp/claude-desktop/
- Claude Code: https://campuscli.com/blackboard-mcp/claude-code/
- Cursor: https://campuscli.com/blackboard-mcp/cursor/
- GitHub Copilot en VS Code: https://campuscli.com/blackboard-mcp/github-copilot/
- Windsurf: https://campuscli.com/blackboard-mcp/windsurf/
- Código fuente: https://github.com/alejooroncoy/campus-cli
