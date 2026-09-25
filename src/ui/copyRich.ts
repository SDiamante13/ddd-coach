export async function copyRich(html: string, plain: string): Promise<void> {
  if (typeof ClipboardItem === "undefined" || typeof navigator.clipboard.write !== "function") {
    return navigator.clipboard.writeText(plain);
  }
  const blob = (text: string, type: string) => new Blob([text], { type });
  await navigator.clipboard.write([new ClipboardItem({ "text/html": blob(html, "text/html"), "text/plain": blob(plain, "text/plain") })]);
}
