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
  server.registerTool('whoami', { description: 'Get the currently authenticated UPC student info' }, async () => {
    const { client } = getClient();
    const me = await getMe(client);
    return { content: [{ type: 'text', text: JSON.stringify(me, null, 2) }] };
  });

  // ── system_version ─────────────────────────────────────────────────────────
  server.registerTool('system_version', { description: 'Get Blackboard Learn server version' }, async () => {
    const { client } = getClient();
    const v = await getSystemVersion(client);
    return { content: [{ type: 'text', text: JSON.stringify(v, null, 2) }] };
  });

  // ── list_courses ────────────────────────────────────────────────────────────
  server.registerTool('list_courses', { description: 'List all enrolled courses for the current student' }, async () => {
    const { client, session } = getClient();
    let userId = session.userId;
    if (!userId) { const me = await getMe(client); userId = me.id; }
    const data = await getMyCourses(client, userId!, { limit: 50 });
    return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
  });

  // ── get_course ──────────────────────────────────────────────────────────────
  server.registerTool(
    'get_course',
    {
      description: 'Get details of a specific course by its Blackboard ID (e.g. _529580_1)',
      inputSchema: { courseId: z.string().describe('Blackboard course ID like _529580_1') },
    },
    async ({ courseId }) => {
      const { client } = getClient();
      const data = await getCourse(client, courseId);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── list_contents ───────────────────────────────────────────────────────────
  server.registerTool(
    'list_contents',
    {
      description: 'List content items inside a course or folder. Use parentId to navigate into subfolders.',
      inputSchema: {
        courseId: z.string().describe('Blackboard course ID'),
        parentId: z.string().optional().describe('Parent folder content ID (omit for root level)'),
      },
    },
    async ({ courseId, parentId }) => {
      const { client } = getClient();
      const data = await getCourseContents(client, courseId, parentId);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── list_announcements ──────────────────────────────────────────────────────
  server.registerTool(
    'list_announcements',
    {
      description: 'List recent announcements for a course',
      inputSchema: { courseId: z.string().describe('Blackboard course ID') },
    },
    async ({ courseId }) => {
      const { client } = getClient();
      const data = await getCourseAnnouncements(client, courseId);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── list_assignments ────────────────────────────────────────────────────────
  server.registerTool(
    'list_assignments',
    {
      description: 'List assignments and tasks in a course with due dates, scores and submission status',
      inputSchema: { courseId: z.string().describe('Blackboard course ID') },
    },
    async ({ courseId }) => {
      const { client } = getClient();
      const data = await listAssignments(client, courseId);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── list_attempts ───────────────────────────────────────────────────────────
  server.registerTool(
    'list_attempts',
    {
      description: 'List submission attempts for a specific assignment (gradebook column)',
      inputSchema: {
        courseId: z.string().describe('Blackboard course ID'),
        columnId: z.string().describe('Gradebook column ID (assignment ID)'),
      },
    },
    async ({ courseId, columnId }) => {
      const { client } = getClient();
      const data = await listAttempts(client, courseId, columnId);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    }
  );

  // ── get_grades ──────────────────────────────────────────────────────────────
  server.registerTool(
    'get_grades',
    {
      description: 'Get all grades for the current student in a course',
      inputSchema: { courseId: z.string().describe('Blackboard course ID') },
    },
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
  server.registerTool(
    'download_attachment',
    {
      description: 'Download a file from a course content item. attachmentId can be a Blackboard attachment ID (for x-bb-file) or a full bbcswebdav URL (for x-bb-document embedded files). Returns base64-encoded content.',
      inputSchema: {
        courseId: z.string().describe('Blackboard course ID'),
        contentId: z.string().describe('Content item ID'),
        attachmentId: z.string().describe('Attachment ID from list_attachments, or a full bbcswebdav URL for embedded files'),
      },
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
  server.registerTool(
    'list_attachments',
    {
      description: 'List file attachments for a course content item. Works for x-bb-file (REST API) and x-bb-document (embedded files in body HTML).',
      inputSchema: {
        courseId: z.string().describe('Blackboard course ID'),
        contentId: z.string().describe('Content item ID'),
      },
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

      // Extract <a> tags with data-bbfile — capture both the JSON metadata and the href (signed download URL)
      // Handle both attribute orderings: data-bbfile...href and href...data-bbfile
      const filePattern = /data-bbfile="([^"]+)"[^<]*?href="([^"]+)"|href="([^"]+)"[^<]*?data-bbfile="([^"]+)"/g;
      const anchorMatches = [...body.matchAll(filePattern)];
      const files = anchorMatches.map((m) => {
        const bbfileRaw = m[1] ?? m[4];
        const hrefRaw   = m[2] ?? m[3];
        try {
          const meta = JSON.parse(bbfileRaw.replace(/&quot;/g, '"'));
          const downloadUrl = hrefRaw ? hrefRaw.replace(/&amp;/g, '&') : (meta.resourceUrl ?? null);
          return {
            type: 'embedded',
            displayName: meta.displayName ?? meta.linkName ?? 'unknown',
            mimeType: meta.mimeType ?? 'application/octet-stream',
            downloadUrl,
          };
        } catch {
          return null;
        }
      }).filter(Boolean);

      return {
        content: [{
          type: 'text',
          text: JSON.stringify(
            { type: 'embedded_files', note: 'Pass downloadUrl as attachmentId to download_attachment', results: files },
            null, 2
          ),
        }],
      };
    }
  );

  // ── download_file_url ───────────────────────────────────────────────────────
  server.registerTool(
    'download_file_url',
    {
      description: 'Download a file directly from a Blackboard bbcswebdav URL (for x-bb-document embedded files). Returns base64-encoded content and filename.',
      inputSchema: {
        url: z.string().describe('Direct file URL from bbcswebdav (downloadUrl from list_attachments)'),
        filename: z.string().optional().describe('Desired filename for saving the file'),
      },
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
  server.registerTool(
    'submit_attempt',
    {
      description: 'Submit an assignment attempt. ALWAYS confirm with the user before submitting.',
      inputSchema: {
        courseId: z.string().describe('Blackboard course ID'),
        columnId: z.string().describe('Assignment (gradebook column) ID'),
        studentComments: z.string().optional().describe('Comment to the instructor'),
        studentSubmission: z.string().optional().describe('Text body of the submission'),
      },
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
  server.registerTool(
    'raw_api',
    {
      description: 'Make a raw REST API call to Blackboard Learn. Use for any endpoint not covered by other tools.',
      inputSchema: {
        method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).describe('HTTP method'),
        path: z.string().describe('API path, e.g. /learn/api/public/v1/users/me'),
        query: z.string().optional().describe('Query string, e.g. limit=10&offset=0'),
        body: z.string().optional().describe('JSON body string for POST/PUT/PATCH'),
      },
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
