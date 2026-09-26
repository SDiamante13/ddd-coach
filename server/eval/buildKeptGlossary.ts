import { writeFileSync } from "node:fs";
import { keptGlossaryFixture } from "./keptGlossaryFixture.ts";

const json = `${JSON.stringify(keptGlossaryFixture(), null, 2)}\n`;
for (const name of ["kept-drift", "kept-steady"]) {
  writeFileSync(new URL(`./fixtures/${name}.glossary.json`, import.meta.url), json);
  console.log(`wrote server/eval/fixtures/${name}.glossary.json`);
}
