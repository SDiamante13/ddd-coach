export type SpokenLine = { speaker: string; start: number; end: number };

type PasteLine = { text: string; start: number; end: number };

const WHEN = /^(?:(?:mon|tue|wed|thu|fri|sat|sun)\w*\.?\s+)?(?:\d{1,2}:\d{2}(?:\s?[ap]m)?\s+)?/i;
const NAMED = /^\s*(?:[-*•]\s+)?(.+?):\s+\S/;
const SLACK_HEADER = /^\s*([\p{L}][\p{L}'’.\- ]{0,40}?)\s{2,}\d{1,2}:\d{2}\s?(?:[AP]M)?\s*$/iu;
const PRESENT = /present:\s*([^)\n;]+)/i;
const CREDITED = /\(([^),]+)[^)]*\)\s*$/;
const SPEAKER = /^[\p{L}][\p{L}'’&/()\- .]{0,40}$/u;

function linesOf(paste: string): PasteLine[] {
  let start = 0;
  return paste.split("\n").map((text) => {
    const line = { text, start, end: start + text.length };
    start += text.length + 1;
    return line;
  });
}

function namedSpeaker(text: string): string | null {
  const named = NAMED.exec(text)?.[1]?.replace(WHEN, "").trim();
  return named !== undefined && SPEAKER.test(named) && named.split(/\s+/).length <= 5 ? named : null;
}

function presentIn(paste: string): Set<string> {
  const names = PRESENT.exec(paste)?.[1]?.split(",") ?? [];
  return new Set(names.map((name) => name.trim().toLowerCase()).filter(Boolean));
}

function creditedSpeaker(text: string, present: Set<string>): string | null {
  const credited = CREDITED.exec(text)?.[1]?.trim();
  return credited !== undefined && present.has(credited.toLowerCase()) ? credited : null;
}

const SUB_BULLET = /^\s+[-*•]\s/;

export function spokenLinesOf(paste: string): SpokenLine[] {
  const present = presentIn(paste);
  let poster: string | null = null;
  let parent: string | null = null;
  return linesOf(paste).flatMap(({ text, start, end }) => {
    const header = SLACK_HEADER.exec(text)?.[1]?.trim();
    if (header !== undefined) poster = header;
    if (header !== undefined || text.trim() === "") return [];
    const own = poster ?? namedSpeaker(text) ?? creditedSpeaker(text, present);
    const speaker = own ?? (SUB_BULLET.test(text) ? parent : null);
    if (!SUB_BULLET.test(text)) parent = own;
    return speaker === null ? [] : [{ speaker, start, end }];
  });
}
