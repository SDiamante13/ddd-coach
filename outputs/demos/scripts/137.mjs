// #137 'Try an example thread' on an empty conversation whatever has focus, the resting composer after the first message, and #38's busy guard.
// node bin/demo-record.mjs --fixtures --chat-delay 3000 --script outputs/demos/scripts/137.mjs --out outputs/demos/137
import { writeFileSync } from "node:fs";

const LOG = process.env.DEMO_LOG;
const log = [];
const t0 = Date.now();
const note = (k, v) => { log.push({ t: ((Date.now() - t0) / 1000).toFixed(1), k, v }); console.log(((Date.now() - t0) / 1000).toFixed(1), k, JSON.stringify(v)); if (LOG) writeFileSync(LOG, JSON.stringify(log, null, 1)); };

const readout = (page, text) => page.evaluate((text) => {
  let el = document.getElementById("demo-readout");
  if (!el) { el = document.createElement("div"); el.id = "demo-readout"; el.style.cssText = "position:fixed;left:470px;top:300px;max-width:430px;z-index:99999;pointer-events:none;background:#111;color:#7CFC9A;font:600 12px/1.45 ui-monospace,monospace;padding:7px 10px;border-radius:6px;white-space:pre-wrap"; document.body.appendChild(el); }
  el.textContent = text ?? ""; el.style.display = text ? "block" : "none";
}, text);
const boxOf = async (page, selector) => { const b = await page.locator(selector).first().boundingBox(); return b && { left: b.x - 4, top: b.y - 4, width: b.width + 8, height: b.height + 8 }; };

export default async function ({ page, caption, overlay, shot, pause }) {
  const m = (f, a) => page.evaluate(f, a);
  await m(() => {
    window.__chats = 0;
    const real = window.fetch;
    window.fetch = (url, init) => { if (String(url).includes("/api/chat")) window.__chats += 1; return real(url, init); };
  });
  const tryState = () => m(() => { const b = [...document.querySelectorAll("button")].find((x) => x.textContent === "Try an example thread"); const r = b?.getBoundingClientRect(); return { height: r ? Math.round(r.height) : 0, visible: !!r && r.height > 0 && getComputedStyle(b).visibility !== "hidden", focus: document.activeElement?.tagName + (document.activeElement?.getAttribute("aria-label") ? `[${document.activeElement.getAttribute("aria-label")}]` : "") }; });
  const composer = () => m(() => ({ resting: document.querySelector("form")?.hasAttribute("data-resting") ?? false, textarea: Math.round(document.querySelector("textarea").getBoundingClientRect().height), focus: document.activeElement?.tagName, tryShown: [...document.querySelectorAll("button")].some((x) => x.textContent === "Try an example thread" && x.getBoundingClientRect().height > 0) }));
  note("viewport", await m(() => `${innerWidth}x${innerHeight} ${navigator.userAgent.match(/Chrome\/[\d.]+/)[0]}`));
  await caption("#137 + #38 · demo-record --fixtures at cd9e209 · chats delayed 3 s · no paid calls · magenta = demo overlay");
  await pause(3000);

  await caption("#137 · Fresh load, empty conversation: \"Try an example thread\" is visible without clicking anything.");
  const s0 = await tryState();
  note("137.onLoad", s0);
  await overlay(await boxOf(page, "button:has-text('Try an example thread')"), "Try an example thread");
  await readout(page, `on load: button ${s0.height} px tall, visible ${s0.visible} · focus on ${s0.focus}`);
  await pause(5000);
  await caption("#137 · Click the title so the message box loses focus: the button still shows.");
  await page.locator("h1").click();
  await pause(800);
  const s1 = await tryState();
  note("137.boxUnfocused", s1);
  await overlay(await boxOf(page, "button:has-text('Try an example thread')"), "still shown");
  await readout(page, `focus moved to ${s1.focus}: button ${s1.height} px, visible ${s1.visible}`);
  await shot("empty");
  await pause(5000);
  await overlay(null);

  await caption("#137 · Click it: the example fills the box. Send the first message; after it the composer rests as before.");
  await page.getByRole("button", { name: "Try an example thread" }).click();
  await pause(800);
  const filled = await m(() => document.querySelector("textarea").value.length);
  await page.getByRole("button", { name: "Send" }).click();
  await page.locator(".reply").first().waitFor();
  await pause(800);
  const c1 = await composer();
  note("137.afterFirst", { filled, ...c1, chats: await m(() => window.__chats) });
  await overlay(await boxOf(page, "form"), "composer");
  await readout(page, `example filled ${filled} chars · after the reply: data-resting ${c1.resting} · textarea ${c1.textarea} px · focus ${c1.focus}\n"Try an example thread" shown: ${c1.tryShown} (conversation no longer empty)`);
  await pause(6000);
  await overlay(null);

  await caption("#38 · Busy guard: send, then press Enter again and force a second Send while the reply is pending. A fetch spy counts chat requests.");
  const before = await m(() => window.__chats);
  const box = page.getByRole("textbox", { name: "Message" });
  await box.click();
  await box.fill("Wed 07:10 Carrier desk: Carrier 3 rejected the 7731 rebook");
  await pause(500);
  await box.press("Enter");
  await pause(80);
  await box.fill("Wed 07:11 Carrier desk: and again");
  await box.press("Enter");
  await box.press("Enter");
  await page.getByRole("button", { name: "Send" }).click({ force: true }).catch(() => {});
  await m(() => document.querySelector("form").requestSubmit());
  await pause(300);
  const during = await m(() => ({ chats: window.__chats, pending: document.body.innerText.includes("Coach is thinking"), sendDisabled: [...document.querySelectorAll("button")].find((b) => b.textContent === "Send")?.disabled ?? null, entries: document.querySelectorAll("[role=log] > li").length }));
  note("38.during", { before, ...during });
  await readout(page, `chat requests before: ${before}\nafter Enter, then Enter ×2 + forced Send + form.requestSubmit() while pending: ${during.chats} (+${during.chats - before})\nCoach is thinking: ${during.pending} · Send disabled: ${during.sendDisabled} · log entries ${during.entries}`);
  await pause(4000);
  await page.waitForFunction(() => document.querySelectorAll(".reply").length >= 2);
  await pause(800);
  const after = await m(() => ({ chats: window.__chats, replies: document.querySelectorAll(".reply").length, entries: document.querySelectorAll("[role=log] > li").length, draft: document.querySelector("textarea").value }));
  note("38.after", after);
  await caption("#38 · One request, one reply; the second wording stays in the box as a draft.");
  await readout(page, `after the reply: chat requests ${after.chats} (+${after.chats - before} for the burst) · replies ${after.replies} · log entries ${after.entries}\ndraft left in the box: "${after.draft}"`);
  await pause(6000);
  await caption("#15 · The deadline abort needs a slow provider, so it is covered by server tests, not this local take.");
  await readout(page, null);
  await pause(3500);
}
