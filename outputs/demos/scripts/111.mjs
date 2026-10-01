// #111: the laptop-height question strip and the resting composer, from the 3 fixture replies.
// node bin/demo-record.mjs --fixtures --viewport 1280x577 --chat-delay 1200 --script outputs/demos/scripts/111.mjs --out outputs/demos/111
const boxOf = (page, selector) => page.locator(selector).first().boundingBox();

async function sendNext(page, text) {
  await page.getByRole("textbox", { name: "Message" }).fill(text);
  await page.getByRole("button", { name: "Send" }).click();
  await page.locator(".pinned-question").waitFor();
}

async function readingBand(page, overlay) {
  const strip = await boxOf(page, ".pinned-question");
  const composer = await boxOf(page, "form");
  const top = strip.y + strip.height;
  await overlay({ left: composer.x, top, width: composer.width, height: composer.y - top }, `reading band ${Math.round(composer.y - top)} px`);
}

export default async function ({ page, caption, overlay, shot, pause }) {
  await caption("#111 · local fixture, canned replies, no paid calls");
  await pause(2500);
  await page.getByRole("button", { name: "Try an example thread" }).click();
  await page.getByRole("button", { name: "Send" }).click();
  await caption("The first question opens the strip for 3 s");
  await page.locator(".question-strip").waitFor();
  await pause(4500);
  await caption("Step 1: click away, so the composer rests as one line");
  await page.locator("h1").click();
  await pause(800);
  await readingBand(page, overlay);
  await pause(4000);
  await overlay(null);
  await caption("Step 2: reply 2, and a new question opens the strip again");
  await sendNext(page, "And the next part.");
  await pause(5000);
  await shot("strip");
  await caption("Step 3: ▾ Whole question opens and closes");
  await page.getByRole("button", { name: "Whole question" }).click();
  await pause(2500);
  await page.getByRole("button", { name: "Whole question" }).click();
  await pause(2500);
  await caption("Step 4: reply 3 turns the guess FROM THREAD in place, marked UPDATED");
  await sendNext(page, "And the last part.");
  await pause(5000);
}
