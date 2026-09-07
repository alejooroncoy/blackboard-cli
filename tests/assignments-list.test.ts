import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { isPendingAssignment } from '../src/providers/blackboard/commands/assignments.js';
import { listPublishedAssignments } from '../src/providers/blackboard/api/assignments.js';

test('assignments list accepts an optional courseId', () => {
  const output = execFileSync(
    process.execPath,
    ['run.js', 'assignments', 'list', '--help'],
    { cwd: process.cwd(), encoding: 'utf8' }
  );

  assert.match(output, /Usage: campus assignments list \[options\] \[courseId\]/);
  assert.match(output, /List assignments and tasks in a course, or across all courses/);
});

test('messages command exposes inbox filtering and pagination options', () => {
  const output = execFileSync(
    process.execPath,
    ['run.js', 'messages', '--help'],
    { cwd: process.cwd(), encoding: 'utf8' }
  );

  assert.match(output, /List messages from your Blackboard inbox/);
  assert.match(output, /--course <courseId>/);
  assert.match(output, /--limit <n>/);
  assert.match(output, /--offset <n>/);
});

test('pending filter includes only assignments without a score or submitted attempt pending grading', () => {
  assert.equal(isPendingAssignment(null), true);
  assert.equal(isPendingAssignment({}), true);
  assert.equal(isPendingAssignment({ displayGrade: { score: 15 } }), false);
  assert.equal(isPendingAssignment({ score: 15 }), false);
  assert.equal(isPendingAssignment({ status: 'NeedsGrading' }), false);
});

test('published group assessment is listed when its gradebook column is restricted', async () => {
  const requested: string[] = [];
  const client = {
    get: async (url: string) => {
      requested.push(url);
      if (url.endsWith('/gradebook/columns')) return { data: { results: [] } };
      if (url.endsWith('/contents')) return { data: { results: [{ id: '_folder_1', title: 'Week 2', hasChildren: true }] } };
      if (url.endsWith('/contents/_folder_1/children')) {
        return { data: { results: [{
          id: '_content_1', title: 'Actividad grupal', hasGradebookColumns: true,
          hasAssociatedGroups: true, availability: { available: 'Yes' },
          contentHandler: { gradeColumnId: '_restricted_column_1' },
        }] } };
      }
      if (url.endsWith('/gradebook/columns/_restricted_column_1/groupAttempts')) {
        return { data: { results: [{ id: '_attempt_1', groupId: '_group_1', status: 'InProgress' }] } };
      }
      throw new Error(`Unexpected request: ${url}`);
    },
  } as any;

  const assignments = await listPublishedAssignments(client, '_course_1');

  assert.deepEqual(assignments, [{
    id: '_restricted_column_1', name: 'Actividad grupal', contentId: '_content_1',
    grading: { type: 'Attempts' }, gradebookAccess: 'restricted', hasAssociatedGroups: true,
    groupAttempts: [{ id: '_attempt_1', groupId: '_group_1', status: 'InProgress' }],
  }]);
  assert.equal(requested.filter((url) => url.includes('_restricted_column_1')).length, 1);
});
