import { mkdirSync, writeFileSync } from "node:fs";
import { OpenRouter } from "@openrouter/sdk";
import { COACH_INSTRUCTIONS_VERSION } from "../coachInstructions.ts";
import { readConfig, type CoachConfig } from "../config.ts";
import { abEval, type AbPlan } from "./abEval.ts";
import { abRecordOf, reportOf } from "./abRecord.ts";
import { abSummary } from "./abSummary.ts";
import { abArgsOf, type AbArgs } from "./evalArgs.ts";
import { evalSummary } from "./evalSummary.ts";
import { FIXTURE_NAMES, loadFixture } from "./fixtures.ts";
import { fullEval } from "./fullEval.ts";
import { latencySpike } from "./latencySpike.ts";
import { instructionsOf } from "./promptVersions.ts";
import { recordable } from "./recordable.ts";

const RESULTS = new URL("../../outputs/evals/slice-03/", import.meta.url);
const REPEATS = 3;

function writeResult(name: string, content: string): void {
  mkdirSync(RESULTS, { recursive: true });
  writeFileSync(new URL(name, RESULTS), content);
  console.log(`wrote outputs/evals/slice-03/${name}`);
}

const asJson = (value: unknown): string => `${JSON.stringify(value, null, 2)}\n`;
const today = (): string => new Date().toISOString().slice(0, 10);
const slugOf = ({ model, reasoningEffort }: CoachConfig): string => {
  const effort = reasoningEffort === undefined || reasoningEffort === "none" ? "" : `-effort-${reasoningEffort}`;
  return `${model.replace(/\W+/g, "-")}${effort}`;
};

function describeRun({ model, reasoningEffort }: CoachConfig) {
  return { model, reasoningEffort: reasoningEffort ?? "unset", instructionsVersion: COACH_INSTRUCTIONS_VERSION };
}

async function runLatency(config: CoachConfig, chat: OpenRouter["chat"]): Promise<void> {
  const spike = await latencySpike(config, chat, loadFixture("booking-split").thread);
  console.log(JSON.stringify({ ...spike.verdict, nonceMentions: spike.nonceMentions }));
  const record = { ...describeRun(config), ...spike, calls: spike.calls.map(recordable) };
  writeResult(`latency-${today()}-${slugOf(config)}.json`, asJson(record));
}

async function runFullEval(config: CoachConfig, chat: OpenRouter["chat"]): Promise<void> {
  const { runs, bar } = await fullEval(config, chat, REPEATS);
  const run = describeRun(config);
  const name = `${today()}-${slugOf(config)}-v${COACH_INSTRUCTIONS_VERSION}`;
  const heading = `Slice 3 eval, ${today()}: ${run.model}, effort ${run.reasoningEffort}, instructions v${run.instructionsVersion}`;
  writeResult(`${name}.json`, asJson({ ...run, bar, runs: runs.map(recordable) }));
  writeResult(`${name}.md`, evalSummary(heading, runs, bar));
  console.log(JSON.stringify({ ships: bar.ships, hard: bar.hard, attribution: bar.attribution, perFixture: bar.perFixture }));
}

type AbRunPlan = AbPlan & { target: string[] | null };

function abPlanOf(args: AbArgs): AbRunPlan {
  const live = { version: args.live, instructions: instructionsOf(args.live) };
  const candidate = { version: args.candidate, instructions: instructionsOf(args.candidate) };
  return { live, candidate, runs: args.runs, fixtures: FIXTURE_NAMES, target: args.target };
}

async function runAb(config: CoachConfig, chat: OpenRouter["chat"], plan: AbRunPlan): Promise<void> {
  const { live, candidate, runs, target } = plan;
  console.log(JSON.stringify({ ab: { live: live.version, candidate: candidate.version, runs, target } }));
  const record = abRecordOf(config, plan, await abEval(config, chat, plan));
  const name = `ab-${today()}-${slugOf(config)}-v${live.version}-v${candidate.version}`;
  writeResult(`${name}.json`, asJson(record));
  writeResult(`${name}.md`, abSummary(reportOf(record)));
  if (record.aborted !== null) return reportFailure({ name: record.aborted });
  console.log(JSON.stringify(record.verdict));
}

function abPlanOrUsage(): AbRunPlan | null | "invalid" {
  try {
    const args = abArgsOf(process.argv);
    return args === null ? null : abPlanOf(args);
  } catch (error) {
    console.error(`Eval failed: ${(error as Error).message}`);
    process.exitCode = 1;
    return "invalid";
  }
}

function reportFailure(error: unknown): void {
  const { name, statusCode } = error as { name?: string; statusCode?: number };
  console.error(`Eval failed: ${name ?? "Error"} ${statusCode ?? ""}`.trim());
  process.exitCode = 1;
}

async function main(): Promise<void> {
  const ab = abPlanOrUsage();
  if (ab === "invalid") return;
  const config = readConfig(process.env);
  if (!config.ok) return reportFailure({ name: config.error });
  console.log(JSON.stringify(describeRun(config.config)));
  const chat = new OpenRouter({ apiKey: config.config.apiKey }).chat;
  if (ab !== null) return runAb(config.config, chat, ab);
  await (process.argv.includes("--latency") ? runLatency : runFullEval)(config.config, chat);
}

await main().catch(reportFailure);
