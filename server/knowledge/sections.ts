const CONTENTS_START = "\nContents\n";
const CONTENTS_END = "* New term introduced since the 2004 book.";
const CONTENTS_LINE = /^(.+?)(?: \*)? ?\.{3,} ?[ivx\d]+$/;

export function referenceTitles(text: string): string[] {
  const start = text.indexOf(CONTENTS_START);
  const contents = text.slice(start + CONTENTS_START.length, text.indexOf(CONTENTS_END, start));
  return contents.split("\n").flatMap((line) => CONTENTS_LINE.exec(line.trim())?.[1] ?? []);
}
