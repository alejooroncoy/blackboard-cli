import type { Cookie } from '../blackboard/types.js';

export type { Cookie };

export interface BannerSession {
  cookies: Cookie[];
  expiresAt: number;
}

/** A term the student can be asked about. */
export interface Term {
  code: string;          // 202610
  description: string;   // "1er Semestre 2026 Pregrado"
  /** Registration is closed; the term can be read but not modified. */
  viewOnly: boolean;
}

/** One course a student was registered in, for a given term. */
export interface Registration {
  term: string;
  /** Canonical UPC course code, e.g. 1ASI0730. Joins with Blackboard and the malla. */
  courseCode: string;
  courseTitle: string;
  /** Section number. Students call it the NRC. */
  crn: string;
  credits: number | null;
  subjectDescription: string | null;
  /** Raw Banner study path; carries the student's career. */
  studyPath: string | null;
  status: string | null;
  scheduleType: string | null;
  meetings: Meeting[];
}

export interface Meeting {
  /** 0 = Sunday. Matches Date#getDay so callers do not have to translate. */
  day: number;
  begin: string | null;  // "0700"
  end: string | null;    // "1059"
  building: string | null;
  room: string | null;
}
