import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { OpenRouter } from "@openrouter/sdk";
import { COACH_INSTRUCTIONS_VERSION } from "../coachInstructions.ts";
import { readConfig, type CoachConfig } from "../config.ts";
import { latencySpike } from "./latencySpike.ts";

const FIXTURES = new URL("./fixtures/", import.meta.url);
const RESULTS = new URL("../../outputs/evals/slice-03/", import.meta.url);

function fixture(name: string): string {
  return readFileSync(new URL(name, FIXTURES), "utf8");
}

function writeResult(name: string, result: unknown): void {
  mkdirSync(RESULTS, { recursive: true });
  writeFileSync(new URL(name, RESULTS), `${JSON.stringify(result, null, 2)}\n`);
  console.log(`wrote outputs/evals/slice-03/${name}`);
}

function describeRun({ model, reasoningEffort }: CoachConfig): object {
  return { model, reasoningEffort: reasoningEffort ?? "unset", instructionsVersion: COACH_INSTRUCTIONS_VERSION };
}

async function runLatency(config: CoachConfig): Promise<void> {
  const chat = new OpenRouter({ apiKey: config.apiKey }).chat;
  const spike = await latencySpike(config, chat, fixture("booking-split.txt"));
  console.log(JSON.stringify(spike.verdict));
  writeResult(`latency-${new Date().toISOString().slice(0, 10)}.json`, { ...describeRun(config), ...spike });
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
  if (process.argv.includes("--latency")) await runLatency(config.config);
}

await main().catch(reportFailure);
