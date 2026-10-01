#!/usr/bin/env node
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { webkit } from "playwright-core";

const PORT = process.env.SAFARI_CHECK_PORT ?? "5197";
const URL = `http://localhost:${PORT}/`;
const VIEWPORTS = [
  { width: 1280, height: 800 },
  { width: 1280, height: 577 },
];

async function startFixtures() {
  const server = spawn(process.execPath, [resolve("node_modules/vite/bin/vite.js"), "--port", PORT, "--strictPort"], { env: { ...process.env, COACH_FIXTURES: "1" }, stdio: "ignore" });
  for (let tries = 0; tries < 60; tries++) {
    if (await fetch(URL).then((response) => response.ok, () => false)) return server;
    await new Promise((done) => setTimeout(done, 500));
  }
  server.kill();
  throw new Error(`The fixture server didn't start on ${URL}`);
}

async function firstVisit(browser, viewport) {
  const page = await (await browser.newContext({ viewport })).newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(URL);
  const tryButton = page.locator("button", { hasText: "Try an example thread" });
  await tryButton.waitFor({ state: "attached" });
  await page.locator("h1").click();
  await page.waitForTimeout(300);
  const shown = ((await tryButton.boundingBox())?.height ?? 0) > 0;
  if (shown) await tryButton.click({ timeout: 5000 });
  const filled = (await page.getByRole("textbox", { name: "Message" }).inputValue()).length > 0;
  return { viewport: `${viewport.width}×${viewport.height}`, shownWithBoxUnfocused: shown, clickFills: filled, pageErrors: errors };
}

const server = await startFixtures();
try {
  const browser = await webkit.launch();
  const results = [];
  for (const viewport of VIEWPORTS) results.push(await firstVisit(browser, viewport));
  await browser.close();
  console.log(`WebKit ${browser.version()}`);
  results.forEach((result) => console.log(JSON.stringify(result)));
  process.exitCode = results.every((r) => r.shownWithBoxUnfocused && r.clickFills) ? 0 : 1;
} finally {
  server.kill();
}
