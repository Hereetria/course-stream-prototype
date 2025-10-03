import { Course } from "../types/types";

type ConflictMap = Record<number, string[]>;

function findConflictsWithDetails(courses: Course[]): ConflictMap {
  const conflictMap: ConflictMap = {};

  for (let i = 0; i < courses.length; i++) {
    const a = courses[i];
    for (let j = i + 1; j < courses.length; j++) {
      const b = courses[j];

      if (a.time.days === b.time.days) {
        const aStart = parseInt(a.time.start.replace(":", ""));
        const aEnd = parseInt(a.time.end.replace(":", ""));
        const bStart = parseInt(b.time.start.replace(":", ""));
        const bEnd = parseInt(b.time.end.replace(":", ""));

        const overlap = aStart < bEnd && bStart < aEnd;
        if (overlap) {
          conflictMap[i] = conflictMap[i] || [];
          conflictMap[i].push(b.title);

          conflictMap[j] = conflictMap[j] || [];
          conflictMap[j].push(a.title);
        }
      }
    }
  }

  return conflictMap;
}

export default findConflictsWithDetails;
