import { mkdirSync, writeFileSync } from "node:fs";
import { OpenRouter } from "@openrouter/sdk";
import { COACH_INSTRUCTIONS_VERSION } from "../coachInstructions.ts";
import { readConfig, type CoachConfig } from "../config.ts";
import { evalSummary } from "./evalSummary.ts";
import { loadFixture } from "./fixtures.ts";
import { fullEval } from "./fullEval.ts";
import { latencySpike } from "./latencySpike.ts";

const RESULTS = new URL("../../outputs/evals/slice-03/", import.meta.url);
const REPEATS = 3;

function writeResult(name: string, content: string): void {
  mkdirSync(RESULTS, { recursive: true });
  writeFileSync(new URL(name, RESULTS), content);
  console.log(`wrote outputs/evals/slice-03/${name}`);
}

const asJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;
const today = (): string => new Date().toISOString().slice(0, 10);

function describeRun({ model, reasoningEffort }: CoachConfig) {
  return { model, reasoningEffort: reasoningEffort ?? "unset", instructionsVersion: COACH_INSTRUCTIONS_VERSION };
}

async function runLatency(config: CoachConfig, chat: OpenRouter["chat"]): Promise<void> {
  const spike = await latencySpike(config, chat, loadFixture("booking-split").thread);
  console.log(JSON.stringify(spike.verdict));
  writeResult(`latency-${today()}.json`, asJson({ ...describeRun(config), ...spike }));
}

async function runFullEval(config: CoachConfig, chat: OpenRouter["chat"]): Promise<void> {
  const { runs, bar } = await fullEval(config, chat, REPEATS);
  const run = describeRun(config);
  const name = `${today()}-${config.model.replace(/\W+/g, "-")}-v${COACH_INSTRUCTIONS_VERSION}`;
  const heading = `Slice 3 eval, ${today()}: ${run.model}, effort ${run.reasoningEffort}, instructions v${run.instructionsVersion}`;
  writeResult(`${name}.json`, asJson({ ...run, bar, runs }));
  writeResult(`${name}.md`, evalSummary(heading, runs, bar));
  console.log(JSON.stringify({ ships: bar.ships, hard: bar.hard, attribution: bar.attribution, perFixture: bar.perFixture }));
}

function reportFailure(error: unknown): void {
  const { name, statusCode } = error as { name?: string; statusCode?: number };
  console.error(`Eval failed: ${name ?? "Error"} ${statusCode ?? ""}`.trim());
  process.exitCode = 1;
}

async function main(): Promise<void> {
  const config = readConfig(process.env);
  if (!config.ok) return reportFailure({ name: config.error });
  console.log(JSON.stringify(describeRun(config.config)));
  const chat = new OpenRouter({ apiKey: config.config.apiKey }).chat;
  await (process.argv.includes("--latency") ? runLatency : runFullEval)(config.config, chat);
}

await main().catch(reportFailure);
