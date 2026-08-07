import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerBlackboardTools } from '../providers/blackboard/mcp-tools.js';
import { track } from '../analytics.js';

// La versión que anunciamos en el handshake sale del package.json. Estaba
// escrita a mano y se quedó en 1.0.0, así que cada cliente y cada directorio
// que la leía veía una versión que no existe. Desde dist/mcp/, '../..' es la
// raíz del paquete, que sí incluye package.json en lo publicado.
const { version: VERSION } = require('../../package.json') as { version: string };

const INSTRUCTIONS = `
campus-cli conecta el campus universitario del estudiante con su agente de IA.

Hoy solo Blackboard Learn (Aula Virtual) está implementado — todas sus tools
llevan el prefijo blackboard_*. Antes de usar cualquiera, verifica sesión con
blackboard_whoami; si falla, pide al usuario que corra \`campus login\` en su
terminal (abre un navegador para el SSO de Microsoft).

Flujo típico: blackboard_list_courses → blackboard_list_assignments /
blackboard_get_grades → blackboard_list_contents para materiales.

Para entregas: blackboard_upload_attempt_file sube cada archivo/imagen y
devuelve un fileUploadId; blackboard_save_attempt_draft guarda texto y/o
esos fileUploadIds sin enviar (el intento queda abierto para seguir
editando, no requiere confirmación); blackboard_submit_attempt finaliza
y envía — siempre confirma con el usuario qué se va a enviar antes de
llamarla.

blackboard_raw_api cubre cualquier endpoint no expuesto por una tool
dedicada.

Futuro: canvas_* y moodle_* para otras universidades (Canvas, Moodle) —
no implementados todavía.
`.trim();

export async function startMcpServer() {
  track('mcp_started');
  const server = new McpServer(
    {
      name: 'campus-cli',
      version: VERSION,
    },
    {
      instructions: INSTRUCTIONS,
    }
  );

  registerBlackboardTools(server);

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
