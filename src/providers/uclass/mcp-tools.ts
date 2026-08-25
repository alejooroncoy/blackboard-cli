import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { recordingsForCourse, searchTranscript, transcriptForCourse } from './service.js';

const courseId = z.string().regex(/^_\d+_\d+$/, 'courseId must look like a Blackboard ID, e.g. _554422_1');
const recordingId = z.string().uuid();

/**
 * These tools deliberately return source material, not an AI conclusion.
 * The MCP client can reason with the selected model while Campus guarantees
 * the recording belongs to the requested Blackboard course and timestamps are
 * normalized. Ask `uclass_search_transcript` first; use the full transcript
 * only when its context is insufficient or contradictory.
 */
export function registerUclassTools(server: McpServer) {
  server.registerTool('uclass_list_recordings', {
    description: 'List published UPC Class recordings for one Blackboard course. Uses the student\'s existing Campus SSO once, then reads Class over HTTP.',
    inputSchema: { courseId: courseId.describe('Blackboard course ID') },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async ({ courseId }) => ({ content: [{ type: 'text', text: JSON.stringify(await recordingsForCourse(courseId)) }] }));

  server.registerTool('uclass_search_transcript', {
    description: 'Search a published Class transcript and return evidence windows with neighboring interventions and [m:ss] timestamps. Use it to answer what was explained, agreed, assigned, or said in class. Do not treat a candidate, proposal, or partial result as a final decision without reading its surrounding evidence.',
    inputSchema: {
      courseId: courseId.describe('Blackboard course ID'),
      query: z.string().min(2).max(500).describe('Natural-language topic, name, task, date, or question'),
      recordingId: recordingId.optional().describe('Optional Class recording ID; defaults to the latest published recording'),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async ({ courseId, query, recordingId }) => ({ content: [{ type: 'text', text: JSON.stringify(await searchTranscript(courseId, query, recordingId)) }] }));

  server.registerTool('uclass_read_transcript', {
    description: 'Read the complete normalized native transcript of a published Class recording. Use only when the evidence windows do not settle the question; cite [m:ss] timestamps in the answer.',
    inputSchema: {
      courseId: courseId.describe('Blackboard course ID'),
      recordingId: recordingId.optional().describe('Optional Class recording ID; defaults to the latest published recording'),
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
  }, async ({ courseId, recordingId }) => ({ content: [{ type: 'text', text: JSON.stringify(await transcriptForCourse(courseId, recordingId)) }] }));
}
