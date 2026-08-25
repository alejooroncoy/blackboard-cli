import type { Meeting, Registration, Term } from './types.js';

const WEEK_DAYS = [
  { day: 1, label: 'Lunes' },
  { day: 2, label: 'Martes' },
  { day: 3, label: 'Miércoles' },
  { day: 4, label: 'Jueves' },
  { day: 5, label: 'Viernes' },
  { day: 6, label: 'Sábado' },
  { day: 0, label: 'Domingo' },
] as const;

function formatTime(value: string | null): string | null {
  if (!value || !/^\d{3,4}$/.test(value)) return null;
  const normalized = value.padStart(4, '0');
  return `${normalized.slice(0, 2)}:${normalized.slice(2)}`;
}

function formatLocation(meeting: Meeting): string | null {
  return [meeting.building, meeting.room].filter(Boolean).join(' · ') || null;
}

/** Turns Banner's registration rows into a predictable, Monday-first weekly
 * agenda. Keeping the raw course list alongside the days makes asynchronous
 * courses visible instead of silently disappearing from the student's plan. */
export function weeklySchedule(term: Term, registrations: Registration[]) {
  const classes = registrations.flatMap((registration) => registration.meetings.map((meeting) => ({
    day: meeting.day,
    startsAt: formatTime(meeting.begin),
    endsAt: formatTime(meeting.end),
    courseCode: registration.courseCode,
    courseTitle: registration.courseTitle,
    section: registration.crn,
    building: meeting.building,
    room: meeting.room,
    location: formatLocation(meeting),
  })));

  const week = WEEK_DAYS.map(({ day, label }) => ({
    day,
    label,
    classes: classes
      .filter((item) => item.day === day)
      .sort((a, b) => (a.startsAt ?? '99:99').localeCompare(b.startsAt ?? '99:99') || a.courseTitle.localeCompare(b.courseTitle, 'es'))
      .map(({ day: _day, ...item }) => item),
  }));

  return {
    term: { code: term.code, description: term.description },
    courses: registrations.map((registration) => ({
      courseCode: registration.courseCode,
      courseTitle: registration.courseTitle,
      section: registration.crn,
      credits: registration.credits,
      scheduleType: registration.scheduleType,
      hasScheduledMeetings: registration.meetings.length > 0,
    })),
    week,
  };
}
