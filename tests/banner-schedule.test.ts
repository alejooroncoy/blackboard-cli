import assert from 'node:assert/strict';
import test from 'node:test';
import { weeklySchedule } from '../src/providers/banner/schedule.js';

test('weekly schedule is Monday-first, formats times, and retains asynchronous courses', () => {
  const result = weeklySchedule(
    { code: '202610', description: '1er Semestre 2026 Pregrado', viewOnly: false },
    [
      {
        term: '202610', courseCode: '1ASI0730', courseTitle: 'Algoritmos', crn: '12345', credits: 4,
        subjectDescription: null, studyPath: null, status: 'Web Registered', scheduleType: 'Teoría',
        meetings: [
          { day: 3, begin: '1400', end: '1559', building: 'Monterrico', room: 'A-101' },
          { day: 1, begin: '0700', end: '0859', building: 'Monterrico', room: 'A-101' },
        ],
      },
      {
        term: '202610', courseCode: '1ASI0999', courseTitle: 'Curso Virtual', crn: '23456', credits: 2,
        subjectDescription: null, studyPath: null, status: 'Web Registered', scheduleType: 'Virtual', meetings: [],
      },
    ],
  );

  assert.equal(result.term.code, '202610');
  assert.deepEqual(result.week.map((day) => day.label), ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']);
  assert.deepEqual(result.week[0].classes[0], {
    startsAt: '07:00', endsAt: '08:59', courseCode: '1ASI0730', courseTitle: 'Algoritmos', section: '12345',
    building: 'Monterrico', room: 'A-101', location: 'Monterrico · A-101',
  });
  assert.equal(result.courses.find((course) => course.courseCode === '1ASI0999')?.hasScheduledMeetings, false);
});

test('weekly schedule excludes dropped and withdrawn registrations', () => {
  const registration = (courseCode: string, status: string) => ({
    term: '202610', courseCode, courseTitle: courseCode, crn: `${courseCode}-NRC`, credits: 3,
    subjectDescription: null, studyPath: null, status, scheduleType: 'Teoría',
    meetings: [{ day: 1, begin: '0900', end: '1059', building: 'Monterrico', room: 'A-101' }],
  });
  const result = weeklySchedule(
    { code: '202610', description: '1er Semestre 2026 Pregrado', viewOnly: false },
    [
      registration('ACTIVA', 'Web Registered'),
      registration('RETIRADA', 'Withdrawn'),
      registration('BAJA', 'Dropped by Web'),
      registration('CANCELADA', 'Canceled'),
    ],
  );

  assert.deepEqual(result.courses.map((course) => course.courseCode), ['ACTIVA']);
  assert.deepEqual(result.week[0].classes.map((item) => item.courseCode), ['ACTIVA']);
});
