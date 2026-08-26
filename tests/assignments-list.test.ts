import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { test } from 'node:test';
import { isPendingAssignment } from '../src/providers/blackboard/commands/assignments.js';

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
