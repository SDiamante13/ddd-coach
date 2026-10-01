#!/usr/bin/env node
import { execFileSync, spawn } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import { chromium } from "playwright-core";

const CHROME = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const MAGENTA = "#c2187a";
const USAGE = `Usage: bin/demo-record.mjs --script <steps.mjs> --out <path without extension>
  [--viewport 1280x800] [--fixtures] [--port 5195] [--url <app url>] [--chat-delay <ms>]`;

function optionsOf(argv) {
  const { values } = parseArgs({
    args: argv,
    options: {
      script: { type: "string" },
      out: { type: "string" },
      viewport: { type: "string", default: "1280x800" },
      fixtures: { type: "boolean", default: false },
      port: { type: "string", default: "5195" },
      url: { type: "string" },
      "chat-delay": { type: "string", default: "0" },
    },
  });
  if (!values.script || !values.out) throw new Error(USAGE);
  const [width, height] = values.viewport.split("x").map(Number);
  const url = values.url ?? `http://localhost:${values.port}/`;
  return { ...values, url, viewport: { width, height }, chatDelay: Number(values["chat-delay"]) };
}

async function startFixtures(port, url) {
  const server = spawn(process.execPath, [resolve("node_modules/vite/bin/vite.js"), "--port", port, "--strictPort"], { env: { ...process.env, COACH_FIXTURES: "1" }, stdio: "ignore" });
  for (let tries = 0; tries < 60; tries++) {
    if (await fetch(url).then((response) => response.ok, () => false)) return server;
    await new Promise((done) => setTimeout(done, 500));
  }
  server.kill();
  throw new Error(`The fixture server didn't start on ${url}`);
}

const captionOn = (page) => (text) =>
  page.evaluate(
    ({ text, colour }) => {
      const banner = document.getElementById("demo-caption") ?? document.body.appendChild(Object.assign(document.createElement("div"), { id: "demo-caption" }));
      Object.assign(banner.style, { position: "fixed", left: "12px", bottom: "12px", zIndex: 99999, maxWidth: "60vw", padding: "8px 12px", borderRadius: "6px", background: colour, color: "#fff", font: "600 15px/1.35 system-ui", pointerEvents: "none" });
      banner.textContent = text;
    },
    { text, colour: MAGENTA },
  );

const overlayOn = (page) => (box, label = "") =>
  page.evaluate(
    ({ box, label, colour }) => {
      document.getElementById("demo-overlay")?.remove();
      if (box === null) return;
      const mark = Object.assign(document.createElement("div"), { id: "demo-overlay", textContent: label });
      Object.assign(mark.style, { position: "fixed", left: `${box.left}px`, top: `${box.top}px`, width: `${box.width}px`, height: `${box.height}px`, zIndex: 99998, border: `2px dashed ${colour}`, color: colour, font: "600 12px system-ui", pointerEvents: "none" });
      document.body.appendChild(mark);
    },
    { box, label, colour: MAGENTA },
  );

async function delayChats(page, ms) {
  if (ms <= 0) return;
  await page.route("**/api/chat", async (route) => {
    await new Promise((done) => setTimeout(done, ms));
    await route.continue();
  });
}

function toMp4(webm, mp4) {
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", webm, "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:v", "libx264", "-pix_fmt", "yuv420p", mp4]);
}

async function record({ script, out, url, viewport, chatDelay }) {
  const profile = mkdtempSync(join(tmpdir(), "demo-profile-"));
  const videos = mkdtempSync(join(tmpdir(), "demo-video-"));
  const context = await chromium.launchPersistentContext(profile, { executablePath: CHROME, headless: true, viewport, recordVideo: { dir: videos, size: viewport } });
  const page = context.pages()[0] ?? (await context.newPage());
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await delayChats(page, chatDelay);
  await page.goto(url);
  const steps = (await import(pathToFileURL(resolve(script)).href)).default;
  const shot = (name) => page.screenshot({ path: `${out}-${name}.png` });
  await steps({ page, caption: captionOn(page), overlay: overlayOn(page), shot, pause: (ms) => page.waitForTimeout(ms) });
  await page.waitForTimeout(3000);
  const video = page.video();
  await context.close();
  toMp4(await video.path(), `${out}.mp4`);
  [profile, videos].forEach((dir) => rmSync(dir, { recursive: true, force: true }));
  return errors;
}

async function main() {
  const options = optionsOf(process.argv.slice(2));
  const server = options.fixtures ? await startFixtures(options.port, options.url) : null;
  try {
    const errors = await record(options);
    console.log(`Recorded ${options.out}.mp4 (${options.viewport.width}×${options.viewport.height}), ${errors.length} page errors`);
    errors.forEach((message) => console.log(`  page error: ${message}`));
    process.exitCode = errors.length === 0 ? 0 : 1;
  } finally {
    server?.kill();
  }
}

await main();
