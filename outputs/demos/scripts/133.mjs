// #133 who's who on a people-written paste, plus the #132 fixes. The recorded carrier-status reply is routed onto its fixture paste; later chats use the fixture.
// node bin/demo-record.mjs --fixtures --chat-delay 1000 --script outputs/demos/scripts/133.mjs --out outputs/demos/133
// Optional: DEMO_LOG=<path.json> keeps each step's measured values.
import { readFileSync, writeFileSync } from "node:fs";

const PASTE = readFileSync("server/eval/fixtures/carrier-status.txt", "utf8");
const RECORDED = JSON.parse(readFileSync("src/test/v10Replies.ts", "utf8").match(/"carrier-status": ("(?:[^"\\]|\\.)*")/)[1]);
const PASTE_2 = ["Rosa Delgado  9:20 AM", "the 990 is the carrier's EDI acceptance of the tender", "", "Priya Shah  9:25 AM", "for billing the 990 is when we can invoice the carrier leg"].join("\n");
const REPLY_2 = ["Words that don't match", '"990"', "- From thread: Carrier desk means the carrier's EDI acceptance of the tender.", "- From thread: Billing means the point the carrier leg can be invoiced.", "", "Question for the carrier desk lead and the billing lead: When does the 990 let Billing invoice the carrier leg?"].join("\n");
const LOG = process.env.DEMO_LOG;
const log = [];
const t0 = Date.now();
const note = (k, v) => { log.push({ t: ((Date.now() - t0) / 1000).toFixed(1), k, v }); console.log(((Date.now() - t0) / 1000).toFixed(1), k, JSON.stringify(v).slice(0, 600)); if (LOG) writeFileSync(LOG, JSON.stringify(log, null, 1)); };

const readout = (page, text) => page.evaluate((text) => {
  let el = document.getElementById("demo-readout");
  if (!el) { el = document.createElement("div"); el.id = "demo-readout"; el.style.cssText = "position:fixed;left:470px;top:240px;max-width:430px;z-index:99999;pointer-events:none;background:#111;color:#7CFC9A;font:600 11.5px/1.4 ui-monospace,monospace;padding:7px 10px;border-radius:6px;white-space:pre-wrap"; document.body.appendChild(el); }
  el.textContent = text ?? ""; el.style.display = text ? "block" : "none";
}, text);
const boxOf = async (page, selector) => { const b = await page.locator(selector).first().boundingBox(); return b && { left: b.x - 4, top: b.y - 4, width: b.width + 8, height: b.height + 8 }; };
const ring = async (page, overlay, selector, label) => overlay((await boxOf(page, selector)) ?? null, label);
const send = async (page, text) => { const box = page.getByRole("textbox", { name: "Message" }); await box.click(); await box.fill(text); await page.getByRole("button", { name: "Send" }).click(); };

export default async function ({ page, caption, overlay, shot, pause }) {
  const m = (f, a) => page.evaluate(f, a);
  let routed = 0;
  await page.route("**/api/chat", async (route) => {
    routed += 1;
    if (routed > 2) return route.fallback();
    await new Promise((done) => setTimeout(done, 900));
    await route.fulfill({ json: { reply: routed === 1 ? RECORDED : REPLY_2, signature: "demo-recorded" } });
  });
  await m(() => {
    window.__bodies = [];
    const real = window.fetch;
    window.fetch = (url, init) => { if (String(url).includes("/api/chat")) window.__bodies.push(String(init?.body ?? "")); return real(url, init); };
  });
  note("viewport", await m(() => `${innerWidth}x${innerHeight} ${navigator.userAgent.match(/Chrome\/[\d.]+/)[0]}`));
  await caption("#133 + #132 fixes · demo-record --fixtures at 91691c5 · the recorded carrier-status reply routed onto its paste · no paid calls · magenta = demo overlay");
  await pause(3500);

  await caption("#133 · The notice now says what stays in this browser: swaps with real names, and who's who.");
  const notice = await m(() => document.querySelector("aside.notice p")?.innerText);
  note("notice", notice);
  await ring(page, overlay, "aside.notice", "data notice");
  await readout(page, notice);
  await pause(6000);
  await overlay(null); await readout(page, null);

  await caption("#133 · Paste the carrier-status Slack export (people, not teams) and send; the recorded reply comes back.");
  await page.getByRole("textbox", { name: "Message" }).fill(PASTE);
  await pause(1200);
  await page.getByRole("button", { name: "Send" }).click();
  await page.locator(".whos-who").waitFor();
  await pause(800);
  const callout = await m(() => ({ text: document.querySelector(".whos-who p")?.textContent, buttons: [...document.querySelectorAll(".whos-who button")].map((b) => b.textContent), header: document.querySelector(".board-header")?.textContent }));
  note("callout", callout);
  await page.locator(".whos-who").scrollIntoViewIfNeeded();
  await ring(page, overlay, ".whos-who", "who's who callout");
  await caption("#133 · Most rows lack a source line, so the margin offers who's who.");
  await readout(page, `"${callout.text}"\nbuttons: ${callout.buttons.join(" · ")}\nboard header: "${callout.header}"`);
  await pause(7000);

  await caption("#133 · Open the strip: nothing pre-selected; a dashed \"Team?\" suggestion where a person names their desk; the Code chip with its hint.");
  await page.locator(".whos-who-open").click();
  await pause(800);
  const strip = await m(() => ({
    head: document.querySelector(".whos-who-head")?.textContent, hint: document.querySelector(".whos-who-hint")?.textContent, foot: document.querySelector(".whos-who-foot")?.textContent,
    pressed: document.querySelectorAll('.whos-who .team-chip[aria-pressed="true"]').length,
    rows: [...document.querySelectorAll(".whos-who-row")].map((r) => ({ name: r.getAttribute("aria-label"), lines: r.querySelector(".whos-who-name span")?.textContent, chips: [...r.querySelectorAll(".team-chip")].map((c) => c.textContent + (c.classList.contains("suggested") ? "[dashed " + getComputedStyle(c).borderTopStyle + "]" : "") + (c.classList.contains("code") ? "[code]" : "")), suggested: r.querySelector(".whos-who-suggested")?.textContent ?? null })),
  }));
  note("strip", strip);
  await page.locator(".whos-who").scrollIntoViewIfNeeded();
  await overlay(null);
  await readout(page, `${strip.head} · pre-selected chips: ${strip.pressed}\nhint: "${strip.hint}"\n${strip.rows.map((r) => `${r.name} (${r.lines}): ${r.chips.join(" ")}${r.suggested ? `\n   ${r.suggested}` : ""}`).join("\n")}`);
  await pause(9000);

  await caption("#133 · Set each person's team (Kev: Not sure) and Apply.");
  const pick = async (name, team) => { await page.locator(`.whos-who-row[aria-label="${name}"]`).getByRole("button", { name: new RegExp(`^${team}\\??$`) }).click(); await pause(450); };
  await pick("Rosa Delgado", "Carrier desk");
  await pick("Dana Whitfield", "Ops");
  await pick("Sam Kowalski", "Code");
  await pick("Luis Ortega", "Ops");
  await pick("Kev Morris", "Not sure");
  await pause(800);
  await page.locator(".whos-who-apply").click();
  await pause(1000);
  const applied = await m(() => ({ found: document.querySelector(".whos-who-found")?.textContent, summary: document.querySelector(".whos-who-summary")?.textContent, header: document.querySelector(".board-header")?.textContent, rings: [...document.querySelectorAll(".card-ring, [data-rung]")].filter((e) => getComputedStyle(e).visibility !== "hidden" && getComputedStyle(e).opacity !== "0").length, lines: [...document.querySelectorAll(".term-row")].map((r) => `${r.querySelector(".term-holder").textContent}: ${r.querySelector(".term-line").textContent.trim().slice(0, 60)}`) }));
  note("applied", applied);
  await ring(page, overlay, ".whos-who", "after Apply");
  await caption("#133 · Apply: one chip with the count, the header's source count, no per-row rings.");
  await readout(page, `"${applied.found}" · "${applied.summary}"\nheader: "${applied.header}"\nvisible rings: ${applied.rings}\n${applied.lines.join("\n")}`);
  await shot("applied");
  await pause(9000);
  await overlay(null);

  await caption("#133 · A second paste with one known and one new speaker asks only about the new one. A fetch spy keeps the request body.");
  await readout(page, null);
  await send(page, PASTE_2);
  await page.locator(".whos-who-head").last().waitFor();
  await pause(900);
  const ask = await m(() => ({ head: [...document.querySelectorAll(".whos-who-head")].at(-1)?.textContent, rows: [...[...document.querySelectorAll(".whos-who")].at(-1).querySelectorAll(".whos-who-row")].map((r) => r.getAttribute("aria-label")) }));
  note("ask", ask);
  await page.locator(".whos-who").last().scrollIntoViewIfNeeded();
  await ring(page, overlay, ".whos-who >> nth=-1", "second paste");
  await readout(page, `"${ask.head}" · rows: ${ask.rows.join(", ")}`);
  await pause(5000);
  await page.locator(".whos-who").last().locator('.whos-who-row[aria-label="Priya Shah"]').getByRole("button", { name: /^Billing\??$/ }).click();
  await pause(500);
  await page.locator(".whos-who-apply").last().click();
  await pause(800);
  await overlay(null);
  const bodies = await m(() => window.__bodies);
  const second = bodies.at(-1) ?? "";
  const parsed = JSON.parse(second || "{}");
  const spy = { requests: bodies.length, keys: Object.keys(parsed), hasWhosWhoKey: /whos|speaker|team/i.test(Object.keys(parsed).join(",")), mappingSent: /Rosa Delgado\s*(→|->|:)\s*Carrier desk|"speaker"|"team"/.test(second), bytes: second.length };
  note("fetchSpy", spy);
  await caption("#133 · Prove nothing is sent: the request body has no who's-who.");
  await readout(page, `fetch spy: ${spy.requests} chat requests · last body ${spy.bytes} bytes\ntop-level keys: ${spy.keys.join(", ")}\nwho's-who key: ${spy.hasWhosWhoKey} · "speaker"/"team"/"Rosa → Carrier desk" in body: ${spy.mappingSent}`);
  await pause(7000);

  await caption("#133 · \"Saved who's who\" sits next to \"Your swaps\"; open it, then clear it.");
  await readout(page, null);
  await page.locator("h1").click(); await pause(300);
  await page.getByRole("textbox", { name: "Message" }).click(); await pause(600);
  await page.locator(".whos-who-panel summary").scrollIntoViewIfNeeded();
  await page.locator(".whos-who-panel summary").click();
  await pause(600);
  const panel = await m(() => ({ summary: document.querySelector(".whos-who-panel summary")?.textContent, items: [...document.querySelectorAll(".whos-who-panel li")].map((l) => l.textContent), swapsNearby: !!document.querySelector(".whos-who-panel")?.parentElement?.textContent.includes("Your swaps") }));
  note("panel", panel);
  await ring(page, overlay, ".whos-who-panel", "Saved who's who");
  await readout(page, `${panel.summary} · next to Your swaps: ${panel.swapsNearby}\n${panel.items.join("\n")}`);
  await pause(5500);
  await page.locator(".whos-who-panel").getByRole("button", { name: "Clear who's who" }).click();
  await pause(800);
  const cleared = await m(() => ({ panel: !!document.querySelector(".whos-who-panel"), stored: localStorage.getItem("ddd-coach.whos-who.v1") }));
  note("cleared", cleared);
  await overlay(null);
  await readout(page, `after Clear: panel shown ${cleared.panel} · stored ${cleared.stored}`);
  await pause(4000);

  await caption("#132 fixes · New conversation, then the example thread (fixture).");
  await readout(page, null);
  await page.locator("h1").click(); await pause(300);
  await page.getByRole("textbox", { name: "Message" }).click(); await pause(500);
  await page.locator("button.new").click(); await pause(700);
  await page.getByRole("button", { name: "Clear" }).click(); await pause(600);
  await page.getByRole("textbox", { name: "Message" }).fill("");
  await page.getByRole("button", { name: "Try an example thread" }).click(); await pause(400);
  await page.getByRole("button", { name: "Send" }).click();
  await page.locator(".react-flow__node-term").first().waitFor();
  await pause(1500);
  const collapsed = await m(() => document.querySelector(".expert-lines-toggle, .expert-lines")?.textContent);
  note("expertCollapsed", collapsed);
  await ring(page, overlay, ".expert-lines", "expert lines");
  await caption("#132 · The expert's lines collapse to one line with \"from your table · only what's open\".");
  await readout(page, `"${collapsed}"`);
  await pause(5500);
  await overlay(null);

  await caption("#132 · Keyboard: Tab to a row's \"I checked ▾\", Enter opens the menu on its first answer, Esc closes it back to the button.");
  await page.locator("h1").click();
  const focusInfo = () => m(() => { const a = document.activeElement; return { label: (a?.getAttribute("aria-label") ?? a?.textContent ?? "").trim().slice(0, 30), menu: !!document.querySelector(".row-check-menu"), inMenu: !!a?.closest(".row-check-menu"), inControls: !!a?.closest(".board-controls") }; });
  for (let i = 0; i < 14; i++) { await page.keyboard.press("Tab"); if (await m(() => !!document.activeElement.closest("[data-board-item]"))) break; }
  for (let i = 0; i < 3; i++) { await page.keyboard.press("ArrowDown"); await pause(300); if (await m(() => document.activeElement.closest("[data-board-item]")?.dataset.lane === "words")) break; }
  await page.keyboard.press("Tab"); await pause(400);
  const k0 = await focusInfo();
  await page.keyboard.press("Enter"); await pause(600);
  const k1 = await focusInfo();
  await pause(1200);
  await page.keyboard.press("Escape"); await pause(600);
  const k2 = await focusInfo();
  await page.keyboard.press("Enter"); await pause(400);
  await page.keyboard.press("Tab"); await pause(400);
  const k3 = await focusInfo();
  await page.keyboard.press("Escape"); await pause(500);
  const k4 = await focusInfo();
  note("menuKeys", { onButton: k0, afterEnter: k1, afterEsc: k2, tabInMenu: k3, escFromInside: k4 });
  await readout(page, `Tab → "${k0.label}"\nEnter → menu ${k1.menu} · focus "${k1.label}" (in menu ${k1.inMenu})\nEsc → menu ${k2.menu} · focus "${k2.label}" · in controls ${k2.inControls}\nEnter, Tab → "${k3.label}" · Esc → menu ${k4.menu} · focus "${k4.label}" · in controls ${k4.inControls}`);
  await pause(7000);

  await caption("#132 · Settle-by stays on one line at 1280 (✎ to change it).");
  await readout(page, null);
  await page.locator(".settle-by-add").click(); await pause(400);
  await page.getByRole("textbox", { name: "Where it gets settled" }).pressSequentially("Customer D quarterly business review", { delay: 18 });
  await page.locator('input[type="date"][aria-label="By when"]').fill("2026-10-27");
  await page.getByRole("button", { name: "Keep settle-by" }).click(); await pause(800);
  const sb = await m(() => { const s = document.querySelector(".settle-by"), h = document.querySelector(".board-header"); const sr = s.getBoundingClientRect(), hr = h.getBoundingClientRect(); return { text: s.textContent, srText: document.querySelector(".settle-by .visually-hidden, .settle-by-full")?.textContent ?? null, sameLine: sr.top < hr.bottom && sr.bottom > hr.top, height: Math.round(sr.height), lineHeight: getComputedStyle(s).lineHeight, overflow: getComputedStyle(s).textOverflow, band: Math.round(document.querySelector(".board-band").getBoundingClientRect().height) }; });
  note("settleBy1280", sb);
  await ring(page, overlay, ".settle-by", "settle-by");
  await readout(page, `"${sb.text}"\none line with the counts: ${sb.sameLine} · height ${sb.height} px · text-overflow ${sb.overflow} · band ${sb.band} px\nscreen-reader copy: ${sb.srText}`);
  await shot("settle");
  await pause(6000);
  await overlay(null);

  await caption("#133 · /data: what stays in this browser.");
  await readout(page, null);
  await page.goto(new URL("/data", page.url()).href);
  await pause(800);
  const data = await m(() => { const h = [...document.querySelectorAll("h2")].find((x) => x.textContent === "What stays in your browser"); h?.scrollIntoView({ block: "start" }); return h?.parentElement.innerText; });
  note("dataPage", data);
  await ring(page, overlay, "section:has(h2)", "");
  await overlay(null);
  await readout(page, data?.slice(0, 700));
  await pause(7000);
  await readout(page, null);
}
