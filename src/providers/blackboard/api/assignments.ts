import type { AxiosInstance } from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { getCourseContents } from './courses.js';

export interface GradeColumn {
  id: string;
  name: string;
  contentId?: string;
  score?: { possible: number };
  availability?: { available: string };
  grading?: {
    type: 'Attempts' | 'Manual' | 'Calculated';
    due?: string;
    attemptsAllowed?: number;
    scoringModel?: string;
  };
  gradebookCategoryId?: string;
  scoreProviderHandle?: string;
  includeInCalculations?: boolean;
  /** Blackboard published the item, but its gradebook endpoint denies student access. */
  gradebookAccess?: 'available' | 'restricted';
  hasAssociatedGroups?: boolean;
  groupAttempts?: GroupAttempt[];
}

export interface GroupAttempt {
  id: string;
  groupId?: string;
  userId?: string;
  status: string;
  readyToPost?: boolean;
  created?: string;
}

interface CourseContentItem {
  id: string;
  title: string;
  hasChildren?: boolean;
  hasGradebookColumns?: boolean;
  hasAssociatedGroups?: boolean;
  availability?: { available?: string };
  contentHandler?: { gradeColumnId?: string };
}

export interface Attempt {
  id: string;
  userId?: string;
  status: string;
  displayGrade?: { score?: number; text?: string };
  score?: number;
  text?: string;
  studentComments?: string;
  studentSubmission?: string;
  created?: string;
  modified?: string;
  attemptDate?: string;
  files?: Array<{ id: string; fileName: string; mimeType: string }>;
  // Instructor feedback fields
  instructorFeedback?: string;
  feedback?: string;
}

export interface AttemptFile {
  id: string;
  name: string;
  mimeType?: string;
  size?: number;
  href?: string;
}

export interface SubmitAttemptBody {
  studentComments?: string;
  studentSubmission?: string;
  fileUploadIds?: string[];
  status?: string;
}

export async function listAssignments(
  client: AxiosInstance,
  courseId: string
): Promise<GradeColumn[]> {
  const path = `/learn/api/public/v2/courses/${courseId}/gradebook/columns`;
  let page = await client.get(path, {
    params: { limit: 100 },
  });
  const columns: GradeColumn[] = [];

  while (true) {
    columns.push(...(page.data.results as GradeColumn[]));
    const nextPage = page.data.paging?.nextPage as string | undefined;
    if (!nextPage) break;
    if (!nextPage.startsWith(path)) {
      throw new Error('Refusing an unexpected Blackboard gradebook page');
    }
    page = await client.get(nextPage);
  }

  // Only return Attempts and Manual columns (student-relevant)
  return columns.filter(
    (c) => c.grading?.type === 'Attempts' || c.grading?.type === 'Manual'
  );
}

/**
 * Includes published assessments that are missing from the student's gradebook
 * response. This happens with some group assessments in Blackboard Ultra.
 */
export async function listPublishedAssignments(
  client: AxiosInstance,
  courseId: string
): Promise<GradeColumn[]> {
  const columns = await listAssignments(client, courseId);
  const readableColumnIds = new Set(columns.map((column) => column.id));
  const restricted: GradeColumn[] = [];
  const visited = new Set<string>();
  const parents: Array<string | undefined> = [undefined];

  while (parents.length > 0) {
    const parentId = parents.shift();
    let page = await getCourseContents(client, courseId, parentId);

    while (true) {
      for (const item of page.results as CourseContentItem[]) {
        if (visited.has(item.id)) continue;
        visited.add(item.id);

        const isAvailable = item.availability?.available !== 'No';
        if (isAvailable && item.hasChildren) parents.push(item.id);

        const columnId = item.contentHandler?.gradeColumnId;
        if (!isAvailable || !item.hasGradebookColumns || !columnId || readableColumnIds.has(columnId)) continue;

        restricted.push({
          id: columnId,
          name: item.title,
          contentId: item.id,
          grading: { type: 'Attempts' },
          gradebookAccess: 'restricted',
          hasAssociatedGroups: item.hasAssociatedGroups,
        });
      }

      const nextPage = page.paging?.nextPage as string | undefined;
      if (!nextPage) break;
      const expectedPrefix = `/learn/api/public/v1/courses/${courseId}/contents`;
      if (!nextPage.startsWith(expectedPrefix)) {
        throw new Error('Refusing an unexpected Blackboard content page');
      }
      page = (await client.get(nextPage)).data;
    }
  }

  for (const assignment of restricted) {
    try {
      assignment.groupAttempts = await listGroupAttempts(client, courseId, assignment.id);
    } catch {
      // Some Blackboard tenants deny this endpoint even when the item itself is visible.
      // Keep the assessment listed rather than hiding it again.
    }
  }

  return [...columns.map((column) => ({ ...column, gradebookAccess: 'available' as const })), ...restricted];
}

/** Returns the current student's group attempts when Blackboard exposes them. */
export async function listGroupAttempts(
  client: AxiosInstance,
  courseId: string,
  columnId: string
): Promise<GroupAttempt[]> {
  const r = await client.get(
    `/learn/api/public/v1/courses/${courseId}/gradebook/columns/${columnId}/groupAttempts`,
    { params: { limit: 20 } }
  );
  return r.data.results ?? [];
}

export async function getAssignment(
  client: AxiosInstance,
  courseId: string,
  columnId: string
): Promise<GradeColumn> {
  const r = await client.get(`/learn/api/public/v2/courses/${courseId}/gradebook/columns/${columnId}`);
  return r.data;
}

export async function listAttempts(
  client: AxiosInstance,
  courseId: string,
  columnId: string
): Promise<Attempt[]> {
  const r = await client.get(
    `/learn/api/public/v2/courses/${courseId}/gradebook/columns/${columnId}/attempts`,
    { params: { limit: 20 } }
  );
  return r.data.results;
}

export async function getAttempt(
  client: AxiosInstance,
  courseId: string,
  columnId: string,
  attemptId: string
): Promise<Attempt> {
  const r = await client.get(
    `/learn/api/public/v2/courses/${courseId}/gradebook/columns/${columnId}/attempts/${attemptId}`
  );
  return r.data;
}

export async function uploadFile(
  client: AxiosInstance,
  filePath: string,
  verifiedFd?: number,
): Promise<string> {
  const fileName = path.basename(filePath);
  const { size } = verifiedFd === undefined ? fs.statSync(filePath) : fs.fstatSync(verifiedFd);
  const stream = fs.createReadStream(filePath, verifiedFd === undefined
    ? undefined
    : { fd: verifiedFd, autoClose: true });

  const form = new FormData();
  form.append('file', stream, {
    filename: fileName,
    contentType: 'application/octet-stream',
    knownLength: size,
  });

  try {
    const r = await client.post('/learn/api/public/v1/uploads', form, {
      headers: {
        ...form.getHeaders(),
      },
    });
    return r.data.id as string;
  } finally {
    stream.destroy();
  }
}

export async function submitAttempt(
  client: AxiosInstance,
  courseId: string,
  columnId: string,
  body: SubmitAttemptBody
): Promise<Attempt> {
  const r = await client.post(
    `/learn/api/public/v2/courses/${courseId}/gradebook/columns/${columnId}/attempts`,
    { ...body, status: body.status ?? 'NeedsGrading' }
  );
  return r.data;
}

export async function getAttemptFiles(
  client: AxiosInstance,
  courseId: string,
  columnId: string,
  attemptId: string
): Promise<AttemptFile[]> {
  const r = await client.get(
    `/learn/api/public/v2/courses/${courseId}/gradebook/columns/${columnId}/attempts/${attemptId}/files`
  );
  return r.data.results ?? [];
}

export async function getMyGrade(
  client: AxiosInstance,
  courseId: string,
  columnId: string,
  userId: string
): Promise<any> {
  const r = await client.get(
    `/learn/api/public/v1/courses/${courseId}/gradebook/users/${userId}/columns/${columnId}`
  );
  return r.data;
}
