import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { loadSession, isSessionValid } from '../auth/session.js';
import { createClient } from '../api/client.js';
import {
  getMe,
  getMyCourses,
  getCourse,
  getCourseContents,
  getCourseAnnouncements,
  getGrades,
  getGradeColumns,
  getSystemVersion,
} from '../api/courses.js';
import { listAssignments, listAttempts, submitAttempt, uploadFile } from '../api/assignments.js';

function getClient() {
  const session = loadSession();
  if (!isSessionValid(session)) {
    throw new Error('Not authenticated. Ask the user to run: blackboard login');
  }
  return { client: createClient(session!), session: session! };
}

export async function startMcpServer() {
  const server = new McpServer({
    name: 'blackboard-upc',
    version: '1.0.0',
  });

  // ── whoami ─────────────────────────────────────────────────────────────────
  server.tool('whoami', 'Get the currently authenticated UPC student info', {}, async () => {
    const { client } = getClient();
    const me = await getMe(client);
    return { content: [{ type: 'text', text: JSON.stringify(me, null, 2) }] };
  });

  // ── system_version ─────────────────────────────────────────────────────────
  server.tool('system_version', 'Get Blackboard Learn server version', {}, async () => {
    const { client } = getClient();
    const v = await getSystemVersion(client);
    return { content: [{ type: 'text', text: JSON.stringify(v, null, 2) }] };
  });

  // ── list_courses ────────────────────────────────────────────────────────────
  server.tool('list_courses', 'List all enrolled courses for the current student', {}, async () => {
    const { client, session } = getClient();
    let userId = session.userId;
    if (!userId) { const me = await getMe(client); userId = me.id; }
    const data = await getMyCourses(client, userId!, { limit: 50 });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  // ── get_course ──────────────────────────────────────────────────────────────
  server.tool(
    'get_course',
    'Get details of a specific course by its Blackboard ID (e.g. _529580_1)',
    { courseId: z.string().describe('Blackboard course ID like _529580_1') },
    async ({ courseId }) => {
      const { client } = getClient();
      const data = await getCourse(client, courseId);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── list_contents ───────────────────────────────────────────────────────────
  server.tool(
    'list_contents',
    'List content items inside a course or folder. Use parentId to navigate into subfolders.',
    {
      courseId: z.string().describe('Blackboard course ID'),
      parentId: z.string().optional().describe('Parent folder content ID (omit for root level)'),
    },
    async ({ courseId, parentId }) => {
      const { client } = getClient();
      const data = await getCourseContents(client, courseId, parentId);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── list_announcements ──────────────────────────────────────────────────────
  server.tool(
    'list_announcements',
    'List recent announcements for a course',
    { courseId: z.string().describe('Blackboard course ID') },
    async ({ courseId }) => {
      const { client } = getClient();
      const data = await getCourseAnnouncements(client, courseId);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── list_assignments ────────────────────────────────────────────────────────
  server.tool(
    'list_assignments',
    'List assignments and tasks in a course with due dates, scores and submission status',
    { courseId: z.string().describe('Blackboard course ID') },
    async ({ courseId }) => {
      const { client } = getClient();
      const data = await listAssignments(client, courseId);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── list_attempts ───────────────────────────────────────────────────────────
  server.tool(
    'list_attempts',
    'List submission attempts for a specific assignment (gradebook column)',
    {
      courseId: z.string().describe('Blackboard course ID'),
      columnId: z.string().describe('Gradebook column ID (assignment ID)'),
    },
    async ({ courseId, columnId }) => {
      const { client } = getClient();
      const data = await listAttempts(client, courseId, columnId);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── get_grades ──────────────────────────────────────────────────────────────
  server.tool(
    'get_grades',
    'Get all grades for the current student in a course',
    { courseId: z.string().describe('Blackboard course ID') },
    async ({ courseId }) => {
      const { client, session } = getClient();
      let userId = session.userId;
      if (!userId) { const me = await getMe(client); userId = me.id; }
      const [columns, grades] = await Promise.all([
        getGradeColumns(client, courseId),
        getGrades(client, courseId, userId!),
      ]);
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ columns: columns.results, grades: grades.results }, null, 2),
        }],
      };
    }
  );

  // ── download_attachment ─────────────────────────────────────────────────────
  server.tool(
    'download_attachment',
    'Download a file from a course content item. attachmentId can be a Blackboard attachment ID (for x-bb-file) or a full bbcswebdav URL (for x-bb-document embedded files). Returns base64-encoded content.',
    {
      courseId: z.string().describe('Blackboard course ID'),
      contentId: z.string().describe('Content item ID'),
      attachmentId: z.string().describe('Attachment ID from list_attachments, or a full bbcswebdav URL for embedded files'),
    },
    async ({ courseId, contentId, attachmentId }) => {
      const { client } = getClient();

      // If attachmentId is a full URL (embedded file), download directly
      const url = attachmentId.startsWith('http')
        ? attachmentId
        : `/learn/api/public/v1/courses/${courseId}/contents/${contentId}/attachments/${attachmentId}/download`;

      const r = await client.get(url, { responseType: 'arraybuffer', headers: { Accept: '*/*' } });
      const b64 = Buffer.from(r.data).toString('base64');
      const contentDisposition = r.headers['content-disposition'] as string | undefined;
      const filename = contentDisposition
        ? (contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/))?.[1]?.replace(/['"]/g, '').trim()
        : undefined;
      const mimeType = (r.headers['content-type'] as string | undefined) ?? 'application/octet-stream';
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ filename: filename ?? 'file', mimeType, size: r.data.byteLength, base64: b64 }, null, 2),
        }],
      };
    }
  );

  // ── list_attachments ────────────────────────────────────────────────────────
  server.tool(
    'list_attachments',
    'List file attachments for a course content item. Works for x-bb-file (REST API) and x-bb-document (embedded files in body HTML).',
    {
      courseId: z.string().describe('Blackboard course ID'),
      contentId: z.string().describe('Content item ID'),
    },
    async ({ courseId, contentId }) => {
      const { client } = getClient();

      // Try standard REST attachments endpoint first (works for x-bb-file)
      try {
        const r = await client.get(
          `/learn/api/public/v1/courses/${courseId}/contents/${contentId}/attachments`
        );
        return { content: [{ type: 'text', text: JSON.stringify(r.data, null, 2) }] };
      } catch (err: any) {
        if (err.response?.status !== 400 && err.response?.status !== 404) throw err;
      }

      // Fallback: fetch content and parse embedded files from body HTML (x-bb-document, x-bb-lesson)
      const r = await client.get(
        `/learn/api/public/v1/courses/${courseId}/contents/${contentId}`
      );
      const body: string = r.data?.body ?? '';
      const matches = [...body.matchAll(/data-bbfile="([^"]+)"/g)];
      const files = matches.map((m) => {
        try {
          const meta = JSON.parse(m[1].replace(/&quot;/g, '"'));
          return {
            type: 'embedded',
            displayName: meta.displayName ?? meta.linkName ?? 'unknown',
            mimeType: meta.mimeType ?? 'application/octet-stream',
            resourceUrl: meta.resourceUrl ?? null,
          };
        } catch {
          return null;
        }
      }).filter(Boolean);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(
            { type: 'embedded_files', note: 'Use download_file_url with resourceUrl to download', results: files },
            null, 2
          ),
        }],
      };
    }
  );

  // ── download_file_url ───────────────────────────────────────────────────────
  server.tool(
    'download_file_url',
    'Download a file directly from a Blackboard bbcswebdav URL (for x-bb-document embedded files). Returns base64-encoded content and filename.',
    {
      url: z.string().describe('Direct file URL from bbcswebdav (resourceUrl from content body)'),
      filename: z.string().optional().describe('Desired filename for saving the file'),
    },
    async ({ url, filename }) => {
      const { client } = getClient();
      const r = await client.get(url, {
        responseType: 'arraybuffer',
        headers: { Accept: '*/*' },
      });
      const b64 = Buffer.from(r.data).toString('base64');
      const contentDisposition = r.headers['content-disposition'] as string | undefined;
      const detectedName = contentDisposition
        ? (contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/))?.[1]?.replace(/['"]/g, '').trim()
        : undefined;
      const finalName = filename ?? detectedName ?? 'file';
      const mimeType = (r.headers['content-type'] as string | undefined) ?? 'application/octet-stream';
      return {
        content: [{
          type: 'text',
          text: JSON.stringify({ filename: finalName, mimeType, size: r.data.byteLength, base64: b64 }, null, 2),
        }],
      };
    }
  );

  // ── submit_attempt ──────────────────────────────────────────────────────────
  server.tool(
    'submit_attempt',
    'Submit an assignment attempt. ALWAYS confirm with the user before submitting.',
    {
      courseId: z.string().describe('Blackboard course ID'),
      columnId: z.string().describe('Assignment (gradebook column) ID'),
      studentComments: z.string().optional().describe('Comment to the instructor'),
      studentSubmission: z.string().optional().describe('Text body of the submission'),
    },
    async ({ courseId, columnId, studentComments, studentSubmission }) => {
      const { client } = getClient();
      const attempt = await submitAttempt(client, courseId, columnId, {
        studentComments,
        studentSubmission,
        status: 'NeedsGrading',
      });
      return { content: [{ type: 'text', text: JSON.stringify(attempt, null, 2) }] };
    }
  );

  // ── raw_api ─────────────────────────────────────────────────────────────────
  server.tool(
    'raw_api',
    'Make a raw REST API call to Blackboard Learn. Use for any endpoint not covered by other tools.',
    {
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).describe('HTTP method'),
      path: z.string().describe('API path, e.g. /learn/api/public/v1/users/me'),
      query: z.string().optional().describe('Query string, e.g. limit=10&offset=0'),
      body: z.string().optional().describe('JSON body string for POST/PUT/PATCH'),
    },
    async ({ method, path, query, body }) => {
      const { client } = getClient();
      const params = query ? Object.fromEntries(new URLSearchParams(query)) : undefined;
      const data = body ? JSON.parse(body) : undefined;
      const r = await client.request({ method: method.toLowerCase() as any, url: path, params, data });
      return { content: [{ type: 'text', text: JSON.stringify(r.data, null, 2) }] };
    }
  );

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
