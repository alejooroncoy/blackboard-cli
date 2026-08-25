import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createBannerClient } from './api/client.js';
import { getRegistrations, listStudentTerms } from './api/registration.js';
import { loadOrRefreshBannerSession } from './auth/login.js';
import { weeklySchedule } from './schedule.js';

export function registerBannerTools(server: McpServer) {
  server.registerTool(
    'campus_get_weekly_schedule',
    {
      description:
        'Get the student\'s UPC weekly class schedule from their Banner registrations. ' +
        'Returns classes grouped Monday through Sunday, including time, room, building, section and courses without scheduled meetings. ' +
        'Uses the active term by default; pass term to consult a registered past term.',
      inputSchema: {
        term: z.string().regex(/^\d{6}$/, 'term must be a six-digit Banner term code, e.g. 202610').optional()
          .describe('Optional Banner term code. Omit to use the active enrollment term.'),
      },
      annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    },
    async ({ term }) => {
      const client = createBannerClient(await loadOrRefreshBannerSession());
      const terms = await listStudentTerms(client);
      const selected = term
        ? terms.find((candidate) => candidate.code === term)
        : terms.find((candidate) => !candidate.viewOnly) ?? terms[0];
      if (term && !selected) throw new Error(`No tienes matrícula registrada para el período ${term}`);
      if (!selected) throw new Error('No se encontraron períodos con matrícula en Banner');

      return {
        content: [{ type: 'text', text: JSON.stringify(weeklySchedule(selected, await getRegistrations(client, selected.code))) }],
      };
    },
  );
}
