import { readFileSync } from "node:fs";
import { loadFixture } from "./fixtures.ts";
import { failedHardChecks, softScores } from "./replyChecks.ts";

const [fixtureName, replyFile] = process.argv.slice(2);
if (!fixtureName || !replyFile) throw new Error("Usage: node server/eval/checkReply.ts <fixture> <reply.txt>");

const fixture = loadFixture(fixtureName);
const reply = readFileSync(replyFile, "utf8").trim();
const hardFailures = failedHardChecks(reply, "stop", fixture);
console.log(JSON.stringify({ hardFailures, soft: softScores(reply, fixture) }, null, 2));
process.exitCode = hardFailures.length === 0 ? 0 : 1;
