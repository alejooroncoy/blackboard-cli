# Blackboard MCP en Claude Desktop: conecta tu Aula Virtual UPC

> Cómo conectar Blackboard UPC con Claude Desktop usando Model Context Protocol: login, archivo de configuración, verificación y solución de problemas.

Fuente: https://campuscli.com/blackboard-mcp/claude-desktop/
Actualizado: 2026-08-06

---

## En resumen

- **Cliente:** Claude Desktop.
- **Archivo de configuración:** `~/Library/Application Support/Claude/claude_desktop_config.json` (en Windows, `%APPDATA%\Claude\claude_desktop_config.json`).
- **Comando del servidor:** `npx campus-cli mcp` (transporte stdio).
- **Requisitos:** Node.js 18 o superior y una cuenta activa de UPC con acceso a Aula Virtual.
- **Tiempo:** unos cinco minutos, una sola vez.

## 1. Inicia sesión en tu campus

```bash
npx campus-cli account login
```

Se abre el navegador y encadena el login de Microsoft de UPC, con MFA si la cuenta lo pide. Si Microsoft muestra *«Stay signed in?»*, marca la casilla y acepta: así la sesión se mantiene. Todo el flujo corre en la máquina del estudiante, no pasa por ningún servidor de Campus.

## 2. Registra el servidor en Claude Desktop

Abre Claude, ve a **Settings → Developer → Edit Config** y pega el bloque. Si el archivo ya tiene otros servidores, agrega solo la entrada `campus` dentro de `mcpServers`.

Archivo: `~/Library/Application Support/Claude/claude_desktop_config.json`

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

## 3. Verifica la conexión

Cierra Claude por completo y vuelve a abrirlo. En la caja de mensaje verás el ícono de herramientas; al desplegarlo debe aparecer `campus` con las herramientas `blackboard_*`.

Luego prueba con una pregunta real:

- «¿Qué tareas tengo pendientes esta semana?»
- «¿Cuál es mi nota actual en cada curso?»
- «Descarga los PDFs de la última semana de clase y resúmelos.»

## Si algo no funciona

El fallo más común es un JSON inválido: una coma de más o unas comillas sin cerrar hacen que el cliente ignore el archivo entero sin avisar. Comprueba también que `npx campus-cli mcp` arranque sin error directamente en la terminal — si ahí falla, el problema no está en Claude Desktop.

Si el servidor conecta pero las respuestas dicen que no estás autenticado, la sesión expiró: vuelve a correr `npx campus-cli account login`. Y cierra el cliente por completo antes de reabrirlo; recargar la ventana no siempre relee la configuración.

## Preguntas frecuentes

**¿Dónde va el archivo de configuración MCP de Claude Desktop?**

En ~/Library/Application Support/Claude/claude_desktop_config.json.

**¿Necesito instalar algo además de Claude Desktop?**

Solo Node.js 18 o superior. El comando npx descarga campus-cli la primera vez que se ejecuta.

**¿Qué hago si las herramientas no aparecen?**

Cierra el cliente por completo y vuelve a abrirlo, verifica que el JSON no tenga comas de más y confirma que npx campus-cli mcp arranca sin error en la terminal.

## Enlaces

- Herramientas, seguridad y límites: https://campuscli.com/blackboard-mcp/
- Blackboard CLI (desde la terminal): https://campuscli.com/blackboard-cli/
- Claude Code: https://campuscli.com/blackboard-mcp/claude-code/
- Cursor: https://campuscli.com/blackboard-mcp/cursor/
- GitHub Copilot en VS Code: https://campuscli.com/blackboard-mcp/github-copilot/
- OpenAI Codex CLI: https://campuscli.com/blackboard-mcp/codex/
- Windsurf: https://campuscli.com/blackboard-mcp/windsurf/
- Código fuente: https://github.com/alejooroncoy/campus-cli
