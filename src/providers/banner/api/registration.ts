import type { AxiosInstance } from 'axios';
import type { Meeting, Registration, Term } from '../types.js';

const PREFIX = '/StudentRegistrationSsb/ssb';

/**
 * Banner returns titles with HTML entities left encoded — "COMPLEJIDAD
 * ALGOR&Iacute;TMICA", "Dise&ntilde;o de Experimentos". They must be decoded
 * on the way IN, not stored escaped: a value kept escaped becomes live markup
 * the first time something decodes it for display.
 */
function decodeEntities(value: string): string {
  const named: Record<string, string> = {
    Aacute: 'Á', Eacute: 'É', Iacute: 'Í', Oacute: 'Ó', Uacute: 'Ú', Ntilde: 'Ñ', Uuml: 'Ü',
    aacute: 'á', eacute: 'é', iacute: 'í', oacute: 'ó', uacute: 'ú', ntilde: 'ñ', uuml: 'ü',
    amp: '&', quot: '"', apos: "'", nbsp: ' ', lt: '<', gt: '>',
  };
  return value
    .replace(/&([A-Za-z]+);/g, (whole, name) => named[name] ?? whole)
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .trim();
}

/** `subject` + `courseNumber` is the canonical code: 1ASI + 0730 -> 1ASI0730. */
const courseCode = (row: any): string =>
  `${row.subject ?? ''}${row.courseNumber ?? ''}`.replace(/\s+/g, '').toUpperCase();

const DAYS: [string, number][] = [
  ['sunday', 0], ['monday', 1], ['tuesday', 2], ['wednesday', 3],
  ['thursday', 4], ['friday', 5], ['saturday', 6],
];

function meetingsFrom(row: any): Meeting[] {
  const faculty = row.meetingsFaculty ?? row.meetingTimes ?? [];
  const out: Meeting[] = [];
  for (const entry of faculty) {
    const time = entry.meetingTime ?? entry;
    if (!time) continue;
    for (const [name, day] of DAYS) {
      if (!time[name]) continue;
      out.push({
        day,
        begin: time.beginTime ?? null,
        end: time.endTime ?? null,
        building: time.buildingDescription ?? time.building ?? null,
        room: time.room ?? null,
      });
    }
  }
  return out;
}

/**
 * Terms the student actually has registrations in.
 *
 * Different from the public catalogue at /classSearch/getTerms, which lists
 * every term the institution has ever opened. This one is the student's, and
 * it is the list worth showing them.
 */
export async function listStudentTerms(client: AxiosInstance): Promise<Term[]> {
  const { data } = await client.get(
    `${PREFIX}/registrationHistory/registrationHistory`,
    { headers: { Accept: 'text/html,*/*' }, responseType: 'text' },
  );
  const html = String(data);
  const select = html.match(/<select[^>]*id="lookupFilter"[\s\S]*?<\/select>/i)?.[0] ?? '';
  const terms: Term[] = [];
  for (const m of select.matchAll(/<option[^>]*value="(\d+)"[^>]*>([^<]*)<\/option>/g)) {
    const description = decodeEntities(m[2]);
    terms.push({
      code: m[1],
      description: description.replace(/\s*\(View Only\)\s*/i, '').trim(),
      viewOnly: /view only/i.test(description),
    });
  }
  return terms;
}

/**
 * Courses the student took in one term.
 *
 * Every row is checked against the term that was asked for. Banner keeps the
 * selected term in the server session, so a request that arrives without a
 * live session answers about whatever term it last remembered — the same
 * shape of data, quietly from the wrong cycle. The filter makes that
 * impossible to miss instead of impossible to notice.
 */
export async function getRegistrations(
  client: AxiosInstance,
  term: string,
): Promise<Registration[]> {
  const { data } = await client.get(`${PREFIX}/registrationHistory/reset`, {
    params: { term },
  });

  const rows: any[] = data?.data?.registrations ?? [];
  const mismatched = rows.filter((r) => String(r.term) !== String(term));
  if (mismatched.length) {
    throw new Error(
      `Banner devolvió el término ${mismatched[0].term} cuando se pidió ${term}. ` +
        'Sesión perdida — vuelve a ejecutar campus login.',
    );
  }

  return rows.map((row) => ({
    term: String(row.term),
    courseCode: courseCode(row),
    courseTitle: decodeEntities(String(row.courseTitle ?? '')),
    crn: String(row.courseReferenceNumber ?? ''),
    credits: row.creditHour ?? row.billHourHold ?? null,
    subjectDescription: row.subjectDescription ? decodeEntities(row.subjectDescription) : null,
    studyPath: row.studyPath ?? row.studyPathDescription ?? null,
    status: row.statusDescription ?? row.status ?? null,
    scheduleType: row.scheduleTypeDescription ?? null,
    meetings: meetingsFrom(row),
  }));
}
